// CourseContentManager.jsx
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../services/instructorendpoint';
import { useEffect, useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  Lock,
  Unlock,
  Upload,
  X,
  Save,
  FolderTree,
  BookOpen,
  Sparkles,
  Eye,
  Download,
  ArrowLeft,
  Layers,
  Clock,
  Grid3x3,
  CheckCircle2,
  AlertCircle,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Image as ImageIcon,
  Code,
  Quote,
  Heading1,
  Heading2,
  Menu,
  Zap as ZapIcon,
  ExternalLink,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Image from '@tiptap/extension-image';
import UnderlineExtension from '@tiptap/extension-underline';

const YoutubeIcon = ({ size = 16 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ display: 'inline-block' }}
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.376.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.376-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

// Menu Button Component for TipTap
const MenuButton = ({ onClick, isActive, children, title }) => (
  <button
    onClick={onClick}
    className={`p-1.5 sm:p-2 rounded-lg transition-all ${isActive
        ? 'bg-indigo-100 text-indigo-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    title={title}
    type="button"
  >
    {children}
  </button>
);

const CourseContentManager = () => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({});
  const [isExplorerCollapsed, setIsExplorerCollapsed] = useState(false);
  const [studioMode, setStudioMode] = useState('edit');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal states
  const [modalType, setModalType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [moduleTitle, setModuleTitle] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [topicData, setTopicData] = useState({
    title: '',
    description: '',
    isPreviewFree: false,
    order: 0,
    videoType: 'upload',
    youtubeUrl: '',
    removeNotes: false
  });

  // File states
  const [videoFile, setVideoFile] = useState(null);
  const [notesFile, setNotesFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [notesPreview, setNotesPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = id;

  // TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-600 underline hover:text-indigo-700',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
      Typography,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full',
        },
      }),
      UnderlineExtension,
    ],
    content: topicData.description,
    onUpdate: ({ editor }) => {
      setTopicData({ ...topicData, description: editor.getHTML() });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base focus:outline-none min-h-[150px] sm:min-h-[200px] p-3 sm:p-4',
      },
    },
  });

  // Update editor content when topicData.description changes
  useEffect(() => {
    if (editor && topicData.description !== editor.getHTML()) {
      editor.commands.setContent(topicData.description);
    }
  }, [topicData.description, editor]);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await axios.post(api.course.getCourseById, { courseId: courseId });
      if (response.data?.success && response.data?.data) {
        setCourse(response.data.data);
        if (response.data.data.modules?.length > 0) {
          setExpandedModules({ [response.data.data.modules[0]._id]: true });
        }
      } else {
        toast.error('Invalid course data received');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error(error.response?.data?.message || 'Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const handleAddModule = async () => {
    if (!moduleTitle.trim()) {
      toast.error('Module title is required');
      return;
    }

    try {
      if (editingItem?.type === 'module') {
        await axios.post(api.course.editModule, {
          courseId: courseId,
          moduleId: editingItem.id,
          title: moduleTitle
        });
        toast.success('Module updated successfully');
      } else {
        await axios.post(api.course.addModule, {
          courseId: courseId,
          title: moduleTitle
        });
        toast.success('Module added successfully');
      }
      await fetchCourseData();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving module');
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (window.confirm('Delete this module? All chapters and topics will be deleted!')) {
      try {
        await axios.post(api.course.deleteModule, {
          courseId: courseId,
          moduleId: moduleId
        });
        toast.success('Module deleted successfully');
        await fetchCourseData();
      } catch (error) {
        console.error(error);
        toast.error('Error deleting module');
      }
    }
  };

  const handleAddChapter = async () => {
    if (!chapterTitle.trim()) {
      toast.error('Chapter title is required');
      return;
    }

    try {
      if (editingItem?.type === 'chapter') {
        await axios.post(api.course.editChapter, {
          courseId: courseId,
          moduleId: selectedModule._id,
          chapterId: editingItem.id,
          title: chapterTitle
        });
        toast.success('Chapter updated successfully');
      } else {
        await axios.post(api.course.addchapter, {
          courseId: courseId,
          moduleId: selectedModule._id,
          title: chapterTitle
        });
        toast.success('Chapter added successfully');
      }
      await fetchCourseData();
      closeModal();
    } catch (error) {
      toast.error('Error saving chapter');
    }
  };

  const handleDeleteChapter = async (moduleId, chapterId) => {
    if (window.confirm('Delete this chapter? All topics will be deleted!')) {
      try {
        await axios.post(api.course.deleteChapter, {
          courseId: courseId,
          moduleId: moduleId,
          chapterId: chapterId
        });
        toast.success('Chapter deleted successfully');
        await fetchCourseData();
      } catch (error) {
        console.error(error);
        toast.error('Error deleting chapter');
      }
    }
  };

  const handleAddTopic = async () => {
    if (!topicData.title.trim()) {
      toast.error('Topic title is required');
      return;
    }

    if (topicData.videoType === 'youtube' && !topicData.youtubeUrl?.trim()) {
      toast.error('YouTube URL is required');
      return;
    }

    if (topicData.videoType === 'upload' && !videoFile && !editingItem) {
      toast.error('Please upload a video file or select YouTube option');
      return;
    }

    setUploading(true);

    const formData = new FormData();

    if (editingItem?.type === 'topic' && selectedTopic?._id) {
      formData.append('topicId', selectedTopic._id);
    }

    formData.append('courseId', courseId);
    formData.append('moduleId', selectedModule._id);
    formData.append('chapterId', selectedChapter._id);
    formData.append('title', topicData.title.trim());
    formData.append('description', topicData.description || '');
    formData.append('isPreviewFree', String(topicData.isPreviewFree));
    formData.append('order', topicData.order || 0);
    formData.append('videoType', topicData.videoType);

    if (topicData.videoType === 'youtube') {
      formData.append('youtubeUrl', topicData.youtubeUrl.trim());
    }

    if (topicData.videoType === 'upload' && videoFile) {
      formData.append('video', videoFile);
    }

    if (notesFile) {
      formData.append('notes', notesFile);
    }

    if (editingItem?.type === 'topic' && topicData.removeNotes) {
      formData.append('removeNotes', 'true');
    }

    try {
      const url = editingItem?.type === 'topic'
        ? api.course.updateTopic
        : api.course.addTopic;

      await axios.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(
        editingItem?.type === 'topic'
          ? 'Topic updated successfully'
          : 'Topic added successfully'
      );

      await fetchCourseData();
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error saving topic');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteTopic = async (moduleId, chapterId, topicId) => {
    if (window.confirm('Delete this topic?')) {
      try {
        await axios.post(api.course.deleteTopic, {
          courseId: courseId,
          moduleId: moduleId,
          chapterId: chapterId,
          topicId: topicId
        });
        toast.success('Topic deleted successfully');
        await fetchCourseData();
      } catch (error) {
        console.error('Error deleting topic:', error);
        toast.error(error.response?.data?.message || 'Error deleting topic');
      }
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error('Video file size should be less than 100MB');
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleNotesChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        toast.error('Notes must be a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Notes file size should be less than 10MB');
        return;
      }
      setNotesFile(file);
      setNotesPreview(file.name);
      if (topicData.removeNotes) {
        setTopicData({ ...topicData, removeNotes: false });
      }
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
      setVideoPreview(null);
    }
  };

  const removeNotes = () => {
    setNotesFile(null);
    setNotesPreview(null);
  };

  const openModuleModal = (module = null) => {
    setModalType('module');
    if (module) {
      setEditingItem({ type: 'module', id: module._id });
      setModuleTitle(module.title);
    } else {
      setEditingItem(null);
      setModuleTitle('');
    }
    setIsModalOpen(true);
  };

  const openChapterModal = (module, chapter = null) => {
    setModalType('chapter');
    setSelectedModule(module);
    if (chapter) {
      setEditingItem({ type: 'chapter', id: chapter._id });
      setChapterTitle(chapter.title);
    } else {
      setEditingItem(null);
      setChapterTitle('');
    }
    setIsModalOpen(true);
  };

  const openTopicModal = (module, chapter, topic = null) => {
    setModalType('topic');
    setSelectedModule(module);
    setSelectedChapter(chapter);

    if (topic) {
      setEditingItem({ type: 'topic', id: topic._id });
      setSelectedTopic(topic);
      setTopicData({
        title: topic.title,
        description: topic.description || '',
        isPreviewFree: topic.isPreviewFree || false,
        order: topic.order || 0,
        videoType: topic.videoType || 'upload',
        youtubeUrl: topic.youtubeUrl || '',
        removeNotes: false
      });
      setVideoFile(null);
      setNotesFile(null);
      setVideoPreview(null);
      setNotesPreview(null);
    } else {
      setEditingItem(null);
      setSelectedTopic(null);
      setTopicData({
        title: '',
        description: '',
        isPreviewFree: false,
        order: chapter.topics?.length || 0,
        videoType: 'upload',
        youtubeUrl: '',
        removeNotes: false
      });
      setVideoFile(null);
      setNotesFile(null);
      setVideoPreview(null);
      setNotesPreview(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setEditingItem(null);
    setSelectedModule(null);
    setSelectedChapter(null);
    setSelectedTopic(null);
    setModuleTitle('');
    setChapterTitle('');
    setTopicData({
      title: '',
      description: '',
      isPreviewFree: false,
      order: 0,
      videoType: 'upload',
      youtubeUrl: '',
      removeNotes: false
    });
    setVideoFile(null);
    setNotesFile(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
      setVideoPreview(null);
    }
    setNotesPreview(null);
    setUploading(false);
    if (editor) {
      editor.commands.setContent('');
    }
  };

  const totalModules = course?.modules?.length || 0;
  const totalChapters = course?.modules?.reduce((sum, module) => sum + (module.chapters?.length || 0), 0) || 0;
  const totalTopics = course?.modules?.reduce((sum, module) =>
    sum + (module.chapters?.reduce((chapSum, chapter) => chapSum + (chapter.topics?.length || 0), 0) || 0), 0) || 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium text-sm sm:text-base">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <div className="text-center bg-white p-6 sm:p-10 rounded-2xl shadow-xl max-w-md w-full">
          <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 text-base sm:text-lg font-semibold mb-4">Course not found</p>
          <button
            onClick={() => navigate('/admin/allcourses')}
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <ArrowLeft size={18} />
            Go Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const stripHtmlTags = (html) => {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  return (
    <div className="min-h-screen bg-[#f8faff] font-poppins">
      {/* Header - Full width, no side margins */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 w-full">
        <div className="w-full px-4 sm:px-6 py-3 sm:py-4">
          <button
            onClick={() => navigate(-1)}
            className="text-[9px] font-black text-gray-300 hover:text-[#0078FF] mb-2 inline-flex items-center gap-2 uppercase tracking-widest transition-all"
          >
            <ArrowLeft size={12} /> Dashboard
          </button>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FB0500]" />
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Curriculum Manager</p>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight leading-none mb-2">
                {course.title}
              </h1>
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 border border-blue-100 text-[9px] font-black text-[#0078FF] rounded-md uppercase">
                  {course.category?.name || 'Curriculum'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 border border-gray-100 text-[9px] font-black text-gray-500 rounded-md uppercase">
                  {course.level}
                </span>
              </div>
            </div>

            {/* Stats - Compact and inline */}
            <div className="flex gap-2 sm:gap-3 w-full lg:w-auto">
              <div className="bg-white px-3 sm:px-4 py-2 rounded-xl border border-gray-100 flex items-center gap-2 sm:gap-3 shadow-sm flex-1 lg:flex-initial justify-center lg:justify-start">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0078FF]">
                  <FolderTree className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Modules</p>
                  <p className="text-sm sm:text-base font-black text-gray-900 leading-none mt-0.5">{totalModules}</p>
                </div>
              </div>
              <div className="bg-white px-3 sm:px-4 py-2 rounded-xl border border-gray-100 flex items-center gap-2 sm:gap-3 shadow-sm flex-1 lg:flex-initial justify-center lg:justify-start">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                  <Grid3x3 className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Units</p>
                  <p className="text-sm sm:text-base font-black text-gray-900 leading-none mt-0.5">{totalChapters}</p>
                </div>
              </div>
              <div className="bg-white px-3 sm:px-4 py-2 rounded-xl border border-gray-100 flex items-center gap-2 sm:gap-3 shadow-sm flex-1 lg:flex-initial justify-center lg:justify-start">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Lessons</p>
                  <p className="text-sm sm:text-base font-black text-gray-900 leading-none mt-0.5">{totalTopics}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace - Full width layout */}
      <div className="w-full px-4 py-4">
        <div className="flex flex-col md:flex-row gap-0 items-start relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm" style={{ height: 'calc(100vh - 160px)' }}>

          {/* LEFT: The Curriculum Explorer */}
          {!isExplorerCollapsed && (
            <div className={`${isModalOpen ? 'hidden md:flex' : 'flex'} w-full md:w-[350px] flex-col border-r border-gray-200 h-full bg-gray-50/20 flex-shrink-0 overflow-hidden`}>
              <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
                <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Explorer</h3>
                <button
                  onClick={() => openModuleModal()}
                  className="bg-gray-900 text-white px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-sm"
                >
                  <Plus size={12} /> Add Module
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {(!course.modules || course.modules.length === 0) ? (
                  <div className="p-10 text-center">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Empty Workspace</p>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {course.modules.map((module, mIdx) => (
                      <div key={module._id} className="rounded-lg overflow-hidden">
                        <div className={`flex items-center justify-between px-3 py-2 transition-all cursor-pointer group rounded-lg ${isModalOpen && selectedModule?._id === module._id && modalType === 'module' ? 'bg-white border border-gray-200 shadow-sm' : 'hover:bg-white'}`} onClick={() => toggleModule(module._id)}>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${expandedModules[module._id] ? 'text-gray-900' : 'text-gray-400'}`}>
                              {expandedModules[module._id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </div>
                            <div className="min-w-0">
                              <h2 className="text-[11px] font-black text-gray-900 leading-tight uppercase truncate">{module.title}</h2>
                              <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mt-0.5">M{mIdx + 1} • {module.chapters?.length || 0} Units</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); openChapterModal(module); }} className="p-1 text-gray-400 hover:text-blue-600 transition-all"><Plus size={14} /></button>
                            <button onClick={(e) => { e.stopPropagation(); openModuleModal(module); }} className="p-1 text-gray-400 hover:text-green-600 transition-all"><Edit size={14} /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteModule(module._id); }} className="p-1 text-gray-400 hover:text-red-600 transition-all"><Trash2 size={14} /></button>
                          </div>
                        </div>

                        {expandedModules[module._id] && (
                          <div className="ml-4 border-l border-gray-100 pb-1 mt-0.5">
                            {module.chapters?.map((chapter, cIdx) => (
                              <div key={chapter._id}>
                                <div className={`flex items-center justify-between pl-6 pr-3 py-1.5 transition-all cursor-pointer group relative ${isModalOpen && selectedChapter?._id === chapter._id && modalType === 'chapter' ? 'bg-white border-y border-gray-100 shadow-sm' : 'hover:bg-white/30'}`} onClick={() => toggleChapter(chapter._id)}>
                                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-px bg-gray-100" />
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${expandedChapters[chapter._id] ? 'text-indigo-600' : 'text-gray-300'}`}>
                                      {expandedChapters[chapter._id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                    </div>
                                    <h3 className="text-[10px] font-black text-gray-700 uppercase truncate">U{cIdx + 1} • {chapter.title}</h3>
                                  </div>
                                  <div className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); openTopicModal(module, chapter); }} className="p-1 text-gray-400 hover:text-blue-600 transition-all"><Plus size={12} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteChapter(module._id, chapter._id); }} className="p-1 text-gray-400 hover:text-red-600 transition-all"><Trash2 size={12} /></button>
                                  </div>
                                </div>

                                {expandedChapters[chapter._id] && (
                                  <div className="ml-4 border-l border-gray-100">
                                    {chapter.topics?.map((topic, tIdx) => (
                                      <div key={topic._id} className={`flex items-center justify-between pl-6 pr-3 py-1 group/lesson transition-all relative ${isModalOpen && editingItem?._id === topic._id && modalType === 'topic' ? 'bg-blue-50 border-l-2 border-l-blue-600 shadow-sm' : 'hover:bg-gray-100'}`} onClick={() => openTopicModal(module, chapter, topic)}>
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-px bg-gray-100" />
                                        <div className="flex items-center gap-2 min-w-0">
                                          <div className="w-1 h-1 rounded-full bg-gray-300" />
                                          <h4 className={`text-[10px] font-bold uppercase truncate ${isModalOpen && editingItem?._id === topic._id && modalType === 'topic' ? 'text-blue-600' : 'text-gray-500'}`}>{topic.title}</h4>
                                        </div>
                                        <div className="flex items-center gap-0 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                                          <button onClick={(e) => { e.stopPropagation(); handleDeleteTopic(module._id, chapter._id, topic._id); }} className="p-1 text-gray-400 hover:text-red-600 transition-all"><Trash2 size={10} /></button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RIGHT: The Editorial Studio */}
          <div className={`flex-1 flex-col h-full w-full bg-white relative overflow-hidden ${!isModalOpen ? 'flex' : 'flex'}`}>
            {isModalOpen ? (
              <div className="flex flex-col h-full animate-fadeIn">
                {/* Studio Header - Integrated Controls */}
                <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setIsExplorerCollapsed(!isExplorerCollapsed)}
                      className={`p-1.5 rounded-md transition-all ${isExplorerCollapsed ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
                    >
                      {isExplorerCollapsed ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                    </button>
                    <div className="h-4 w-px bg-gray-200" />
                    <div>
                      <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Editorial Canvas</p>
                      <h2 className="text-[10px] font-black text-gray-900 uppercase tracking-tight">
                        {editingItem ? 'Execute Update' : 'New Component'} • {modalType}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex bg-gray-50 p-0.5 rounded-lg border border-gray-200">
                      <button onClick={() => setStudioMode('edit')} className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all ${studioMode === 'edit' ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>Edit</button>
                      <button onClick={() => setStudioMode('preview')} className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all ${studioMode === 'preview' ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>Preview</button>
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); closeModal(); }} 
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                  <div className="max-w-4xl mx-auto p-4 sm:p-10">
                    {studioMode === 'preview' ? (
                      <div className="animate-fadeIn space-y-8">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Active Student View</span>
                        </div>

                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                          {modalType === 'module' ? moduleTitle : modalType === 'chapter' ? chapterTitle : topicData.title}
                        </h1>

                        {modalType === 'topic' && (
                          <div className="space-y-10">
                            {topicData.videoType === 'youtube' && topicData.youtubeUrl ? (
                              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-gray-200 shadow-2xl">
                                <iframe
                                  src={`https://www.youtube.com/embed/${topicData.youtubeUrl.split('v=')[1]?.split('&')[0] || topicData.youtubeUrl.split('/').pop()}`}
                                  className="w-full h-full"
                                  allowFullScreen
                                  title="Video Player"
                                />
                              </div>
                            ) : (videoPreview || selectedTopic?.videoUrl) ? (
                              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-gray-200 shadow-2xl">
                                <video src={videoPreview || selectedTopic?.videoUrl} className="w-full h-full" controls />
                              </div>
                            ) : null}

                            <div className="prose prose-blue max-w-none">
                              <div className="text-gray-700 leading-relaxed text-lg font-medium" dangerouslySetInnerHTML={{ __html: editor?.getHTML() }} />
                            </div>

                            {/* Notes Preview Section */}
                            {(notesFile || selectedTopic?.notesUrl) && (
                              <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2">
                                    <FileText size={20} className="text-green-600" />
                                    <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Course Material</h3>
                                  </div>
                                  <button
                                    onClick={() => window.open(notesFile ? URL.createObjectURL(notesFile) : selectedTopic?.notesUrl, '_blank')}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[9px] font-black text-gray-700 hover:border-green-500 transition-all"
                                  >
                                    <Download size={12} />
                                    Download Notes
                                  </button>
                                </div>
                                <p className="text-[11px] text-gray-600">
                                  {notesPreview || selectedTopic?.notesUrl?.split('/').pop() || 'Notes.pdf'}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {(modalType === 'module' || modalType === 'chapter') && (
                          <div className="p-10 sm:p-20 text-center bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                            <BookOpen size={40} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Metadata Context</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="animate-fadeIn space-y-10">
                        {modalType === 'module' && (
                          <div className="space-y-4">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Module Title</label>
                            <input type="text" className="w-full border-b border-gray-200 py-4 text-3xl font-black focus:outline-none focus:border-gray-900 bg-transparent placeholder-gray-100 tracking-tighter uppercase" placeholder="MODULE NAME..." value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} autoFocus />
                          </div>
                        )}

                        {modalType === 'chapter' && (
                          <div className="space-y-6">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Unit Title</label>
                            <input type="text" className="w-full border-b border-gray-200 py-4 text-3xl font-black focus:outline-none focus:border-indigo-600 bg-transparent placeholder-gray-100 tracking-tighter uppercase" placeholder="UNIT NAME..." value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} autoFocus />
                          </div>
                        )}

                        {modalType === 'topic' && (
                          <div className="space-y-12">
                            <div className="space-y-4">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Lesson Title</label>
                              <input type="text" className="w-full border-b border-gray-200 py-4 text-3xl font-black focus:outline-none focus:border-blue-600 bg-transparent placeholder-gray-100 tracking-tighter uppercase" placeholder="LESSON NAME..." value={topicData.title} onChange={(e) => setTopicData({ ...topicData, title: e.target.value })} />
                            </div>

                            <div className="space-y-4">
                              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Content Production</label>
                                <div className="flex gap-1">
                                  <MenuButton onClick={() => editor?.chain().focus().toggleBold().run()} isActive={editor?.isActive('bold')}><Bold size={14} /></MenuButton>
                                  <MenuButton onClick={() => editor?.chain().focus().toggleBulletList().run()} isActive={editor?.isActive('bulletList')}><List size={14} /></MenuButton>
                                  <MenuButton onClick={() => editor?.chain().focus().toggleCodeBlock().run()} isActive={editor?.isActive('codeBlock')}><Code size={14} /></MenuButton>
                                </div>
                              </div>
                              <EditorContent editor={editor} className="min-h-[350px] text-gray-800 font-medium text-lg focus:outline-none" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 pt-8 border-t border-gray-50">
                              <div className="space-y-4">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Media Type</label>
                                <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200 shadow-sm">
                                  <button type="button" onClick={() => setTopicData({ ...topicData, videoType: 'upload' })} className={`flex-1 py-2.5 rounded-md text-[9px] font-black uppercase transition-all ${topicData.videoType === 'upload' ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>Internal</button>
                                  <button type="button" onClick={() => setTopicData({ ...topicData, videoType: 'youtube' })} className={`flex-1 py-2.5 rounded-md text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 ${topicData.videoType === 'youtube' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
                                    <YoutubeIcon size={12} /> YouTube
                                  </button>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Publicity</label>
                                <button onClick={() => setTopicData({ ...topicData, isPreviewFree: !topicData.isPreviewFree })} className={`w-full py-3 rounded-lg border text-[9px] font-black uppercase transition-all flex items-center justify-center gap-3 shadow-sm ${topicData.isPreviewFree ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                                  {topicData.isPreviewFree ? <Unlock size={14} /> : <Lock size={14} />}
                                  {topicData.isPreviewFree ? 'Free Preview' : 'Enrollment Required'}
                                </button>
                              </div>
                            </div>

                            <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 sm:p-8">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-4">Resource Payload</label>

                              {/* Video Section */}
                              <div className="mb-8">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Video Asset</span>
                                  {editingItem && selectedTopic?.videoUrl && topicData.videoType === 'upload' && !videoPreview && (
                                    <button
                                      onClick={() => window.open(selectedTopic.videoUrl, '_blank')}
                                      className="text-[8px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1"
                                    >
                                      <ExternalLink size={10} /> View Existing
                                    </button>
                                  )}
                                </div>

                                {topicData.videoType === 'youtube' ? (
                                  <input
                                    type="url"
                                    placeholder="YOUTUBE LINK..."
                                    className="w-full bg-white border border-gray-200 rounded-lg py-4 px-6 text-xs font-black focus:outline-none focus:border-red-600 transition-all tracking-wider"
                                    value={topicData.youtubeUrl}
                                    onChange={(e) => setTopicData({ ...topicData, youtubeUrl: e.target.value })}
                                  />
                                ) : (
                                  <div className="text-center">
                                    {!videoPreview && !selectedTopic?.videoUrl ? (
                                      <label className="cursor-pointer block group p-10 bg-white border border-dashed border-gray-200 rounded-xl hover:border-blue-500 transition-all">
                                        <Upload size={32} className="mx-auto mb-3 text-gray-200 group-hover:text-blue-500 transition-colors" />
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Upload Video Asset</p>
                                        <p className="text-[7px] text-gray-300 mt-1">MP4, MOV, AVI (Max 100MB)</p>
                                        <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                                      </label>
                                    ) : (
                                      <div className="relative inline-block group">
                                        <video src={videoPreview || selectedTopic?.videoUrl} className="h-32 rounded-lg border border-gray-200 shadow-xl" controls />
                                        <button onClick={removeVideo} className="absolute -top-3 -right-3 bg-red-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                          <X size={12} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Notes Section */}
                              <div className="border-t border-gray-200 pt-6">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Notes / Resource Material</span>
                                  {editingItem && selectedTopic?.notesUrl && !notesFile && !topicData.removeNotes && (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => window.open(selectedTopic.notesUrl, '_blank')}
                                        className="text-[8px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1"
                                      >
                                        <ExternalLink size={10} /> View Existing
                                      </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (window.confirm('Remove existing notes? This action will be saved when you update the topic.')) {
                                              setNotesFile(null);
                                              setTopicData({ ...topicData, removeNotes: true });
                                            }
                                          }}
                                          className="text-[8px] font-black text-red-600 uppercase tracking-widest flex items-center gap-1"
                                        >
                                          <Trash2 size={10} /> Remove
                                        </button>
                                    </div>
                                  )}
                                </div>

                                {!notesPreview && (!selectedTopic?.notesUrl || topicData.removeNotes) ? (
                                  <label className="cursor-pointer block group p-8 bg-white border border-dashed border-gray-200 rounded-xl hover:border-green-500 transition-all">
                                    <div className="flex items-center justify-center gap-3">
                                      <FileText size={24} className="text-gray-300 group-hover:text-green-500 transition-colors" />
                                      <div className="text-left">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest group-hover:text-green-600 transition-colors">
                                          Upload Notes (PDF)
                                        </p>
                                        <p className="text-[7px] text-gray-300 mt-0.5">PDF only, Max 10MB</p>
                                      </div>
                                    </div>
                                    <input type="file" accept=".pdf,application/pdf" onChange={handleNotesChange} className="hidden" />
                                  </label>
                                ) : (
                                  <div className="bg-white border border-green-200 rounded-xl p-4 flex items-center justify-between group hover:shadow-md transition-all">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                        <FileText size={20} className="text-green-600" />
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-black text-gray-800 uppercase tracking-wide">
                                          {notesPreview || selectedTopic?.notesUrl?.split('/').pop() || 'Notes.pdf'}
                                        </p>
                                        <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                                          {notesFile ? `${(notesFile.size / 1024 / 1024).toFixed(2)} MB • Pending Upload` : 'Existing Resource'}
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={notesFile ? removeNotes : () => {
                                        if (window.confirm('Remove existing notes? This action will be saved when you update the topic.')) {
                                          removeNotes();
                                          setTopicData({ ...topicData, removeNotes: true });
                                        }
                                      }}
                                      className="p-2 text-gray-400 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                )}

                                {editingItem && selectedTopic?.notesUrl && !notesFile && !topicData.removeNotes && (
                                  <p className="text-[7px] text-amber-600 mt-2 flex items-center gap-1">
                                    <AlertCircle size={10} />
                                    Upload a new PDF to replace the existing notes
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Studio Integrated Footer */}
                <div className="px-4 sm:px-10 py-4 sm:py-6 border-t border-gray-100 bg-white flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                  <button onClick={closeModal} className="text-[9px] font-black uppercase text-gray-400 hover:text-red-600 transition-all tracking-[0.3em] py-2 w-full sm:w-auto text-center">Discard Changes</button>
                  <button
                    onClick={() => {
                      if (modalType === 'module') handleAddModule();
                      else if (modalType === 'chapter') handleAddChapter();
                      else if (modalType === 'topic') handleAddTopic();
                    }}
                    disabled={uploading}
                    className="w-full sm:w-auto justify-center bg-gray-900 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-lg font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl shadow-black/10 disabled:opacity-50 flex items-center gap-4"
                  >
                    {uploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={18} />}
                    {editingItem ? 'Sync Updates' : 'Initialize Component'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-20 text-center bg-gray-50/10">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 text-gray-200 border border-gray-100 shadow-sm"><ZapIcon size={32} /></div>
                <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.4em] mb-3 leading-none">Editorial Studio Ready</h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase max-w-[250px] leading-relaxed tracking-wider">Select a curriculum component from the explorer to begin industrial-grade production.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        /* TipTap Editor Styles */
        .ProseMirror {
          min-height: 150px;
          padding: 0.75rem;
          outline: none;
          font-size: 14px;
        }
        @media (min-width: 640px) {
          .ProseMirror {
            min-height: 200px;
            padding: 1rem;
            font-size: 16px;
          }
        }
        .ProseMirror p {
          margin-bottom: 0.75rem;
        }
        .ProseMirror h1 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        @media (min-width: 640px) {
          .ProseMirror h1 {
            font-size: 1.875rem;
          }
        }
        .ProseMirror h2 {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 0.75rem;
        }
        @media (min-width: 640px) {
          .ProseMirror h2 {
            font-size: 1.5rem;
          }
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .ProseMirror li {
          margin-bottom: 0.25rem;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #6366f1;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #475569;
          font-style: italic;
        }
        .ProseMirror code {
          background-color: #f1f5f9;
          padding: 0.2rem 0.4rem;
          border-radius: 0.375rem;
          font-family: monospace;
          font-size: 0.875rem;
        }
        .ProseMirror pre {
          background-color: #1e293b;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        .ProseMirror pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
        }
        .ProseMirror a {
          color: #6366f1;
          text-decoration: underline;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        
        /* Custom scrollbar for toolbar */
        .scrollbar-thin::-webkit-scrollbar {
          height: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        
        /* Hide scrollbar on mobile but keep functionality */
        @media (max-width: 640px) {
          .scrollbar-thin {
            scrollbar-width: thin;
          }
        }
        
        /* Custom scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default CourseContentManager;