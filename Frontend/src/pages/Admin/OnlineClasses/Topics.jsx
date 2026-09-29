// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import api from '../../../services/adminendpoint';
// import { useCourseStore } from '../../../Store/courseStore';
// import { useTopicStore } from '../../../Store/topicStore';
// import { toast } from 'react-toastify';

// const AdminTopicsPanel = () => {
//     const { topicId, setTopicId } = useTopicStore();
//     const { classId, setClassId } = useCourseStore();
//     const [topics, setTopics] = useState([]);
//     const [availableClasses, setAvailableClasses] = useState([]);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//     const [editingTopic, setEditingTopic] = useState(null);
//     const [deletingTopicId, setDeletingTopicId] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [loadingClasses, setLoadingClasses] = useState(false);
//     const [uploadProgress, setUploadProgress] = useState(0);
    
//     // Form state
//     const [formData, setFormData] = useState({
//         title: '',
//         description: '',
//         videoFiles: [],
//         noteFiles: []  
//     });

//     // Temporary inputs for display
//     const [newVideoUrl, setNewVideoUrl] = useState('');
//     const [newVideoFile, setNewVideoFile] = useState(null);
//     const [newNoteTitle, setNewNoteTitle] = useState('');
//     const [newNoteFile, setNewNoteFile] = useState(null);

//     const [searchTerm, setSearchTerm] = useState('');
//     const [videoPreviews, setVideoPreviews] = useState([]);
//     const [notePreviews, setNotePreviews] = useState([]);

//     useEffect(() => {
//         fetchClasses();
//     }, []);

//     useEffect(() => {
//         if (classId) {
//             console.log("Fetching topics for classId:", classId);
//             fetchTopics();
//         } else {
//             console.log("No classId available, waiting for selection");
//             setTopics([]);
//         }
//     }, [classId]);

//     const fetchClasses = async () => {
//         try {
//             setLoadingClasses(true);
//             console.log("Fetching classes...");
            
//             const response = await axios.get(api.class.getAllClasses);
//             const classesData = response.data;
//             console.log("Classes from API:", classesData);
            
//             if (Array.isArray(classesData) && classesData.length > 0) {
//                 setAvailableClasses(classesData);
//             } else {
//                 console.error("No classes available");
//                 setAvailableClasses([]);
//             }
//         } catch (error) {
//             console.error("Error fetching classes:", error);
//             setAvailableClasses([]);
//         } finally {
//             setLoadingClasses(false);
//         }
//     };

//     const fetchTopics = async () => {
//         if (!classId) {
//             setTopics([]);
//             return;
//         }
        
//         try {
//             setLoading(true);
            
//             const res = await axios.post(api.topic.gettopicbyclass, {
//                 classId: classId
//             });
            
//             console.log(res, "topic data fetched successfully");
            
//             // Simplified data extraction
//             let topicsData = [];
//             if (res.data?.data?.data && Array.isArray(res.data.data.data)) {
//                 topicsData = res.data.data.data;
//             } else if (res.data?.data && Array.isArray(res.data.data)) {
//                 topicsData = res.data.data;
//             } else if (Array.isArray(res.data)) {
//                 topicsData = res.data;
//             }
            
//             console.log("Extracted topics:", topicsData);
//             setTopics(topicsData);
            
//         } catch (error) {
//             console.error("Error fetching topics:", error);
//             setTopics([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const getClassTitle = (topic) => {
//         if (topic.classId && topic.classId.title) {
//             return topic.classId.title;
//         }
//         if (topic.classId && typeof topic.classId === 'string') {
//             const foundClass = availableClasses.find(c => c._id === topic.classId);
//             return foundClass ? foundClass.name || foundClass.title : 'Unknown Class';
//         }
//         return selectedClassName;
//     };

//     const openModal = (topic = null) => {
//         if (topic) {
//             setEditingTopic(topic);
//             setTopicId(topic._id || topic.id);
//             console.log("Setting topicId for editing:", topic._id || topic.id);
            
//             setFormData({
//                 title: topic.title || '',
//                 description: topic.description || '',
//                 videoFiles: [],
//                 noteFiles: []
//             });
//             setVideoPreviews(topic.videoUrls || []);
//             setNotePreviews(topic.notes || []);
//         } else {
//             setEditingTopic(null);
//             setFormData({
//                 title: '',
//                 description: '',
//                 videoFiles: [],
//                 noteFiles: []
//             });
//             setVideoPreviews([]);
//             setNotePreviews([]);
//         }
//         setIsModalOpen(true);
//         setNewVideoUrl('');
//         setNewVideoFile(null);
//         setNewNoteTitle('');
//         setNewNoteFile(null);
//         setUploadProgress(0);
//     };

//     const closeModal = () => {
//         setIsModalOpen(false);
//         setEditingTopic(null);
//         setFormData({
//             title: '',
//             description: '',
//             videoFiles: [],
//             noteFiles: []
//         });
//         setVideoPreviews([]);
//         setNotePreviews([]);
//         setNewVideoFile(null);
//         setNewNoteFile(null);
//         setUploadProgress(0);
        
//         // Cleanup blob URLs to prevent memory leaks
//         videoPreviews.forEach(preview => {
//             if (typeof preview === 'string' && preview.startsWith('blob:')) {
//                 URL.revokeObjectURL(preview);
//             }
//         });
//         notePreviews.forEach(note => {
//             if (note.fileUrl && note.fileUrl.startsWith('blob:')) {
//                 URL.revokeObjectURL(note.fileUrl);
//             }
//         });
//     };

//     const handleVideoFileUpload = (e) => {
//         const files = Array.from(e.target.files);
//         if (files.length === 0) return;
        
//         const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
//         const maxSize = 100 * 1024 * 1024;
        
//         for (const file of files) {
//             if (!validVideoTypes.includes(file.type)) {
//                 alert(`Please upload a valid video file (MP4, WebM, OGG, MOV). ${file.name} is not valid.`);
//                 return;
//             }
            
//             if (file.size > maxSize) {
//                 alert(`Video file ${file.name} size should be less than 100MB`);
//                 return;
//             }
//         }
        
//         setFormData(prev => ({
//             ...prev,
//             videoFiles: [...prev.videoFiles, ...files]
//         }));
        
//         const newPreviews = files.map(file => URL.createObjectURL(file));
//         setVideoPreviews(prev => [...prev, ...newPreviews]);
        
//         e.target.value = '';
//     };

//     const removeVideoFile = (index) => {
//         setFormData(prev => ({
//             ...prev,
//             videoFiles: prev.videoFiles.filter((_, i) => i !== index)
//         }));
        
//         if (videoPreviews[index] && typeof videoPreviews[index] === 'string' && videoPreviews[index].startsWith('blob:')) {
//             URL.revokeObjectURL(videoPreviews[index]);
//         }
//         setVideoPreviews(prev => prev.filter((_, i) => i !== index));
//     };

//     const handleNoteFileUpload = (e) => {
//         const files = Array.from(e.target.files);
//         if (files.length === 0) return;
        
//         const validNoteTypes = ['.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx'];
//         const maxSize = 10 * 1024 * 1024;
        
//         for (const file of files) {
//             const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
//             if (!validNoteTypes.includes(fileExtension)) {
//                 alert(`Please upload a valid note file (PDF, DOC, DOCX, TXT, PPT, PPTX). ${file.name} is not valid.`);
//                 return;
//             }
            
//             if (file.size > maxSize) {
//                 alert(`Note file ${file.name} size should be less than 10MB`);
//                 return;
//             }
//         }
        
//         const newNotes = files.map(file => ({
//             title: file.name,
//             file: file,
//             fileUrl: URL.createObjectURL(file)
//         }));
        
//         setFormData(prev => ({
//             ...prev,
//             noteFiles: [...prev.noteFiles, ...newNotes]
//         }));
        
//         setNotePreviews(prev => [...prev, ...newNotes]);
        
//         e.target.value = '';
//     };

//     const removeNoteFile = (index) => {
//         if (notePreviews[index] && notePreviews[index].fileUrl) {
//             URL.revokeObjectURL(notePreviews[index].fileUrl);
//         }
//         setFormData(prev => ({
//             ...prev,
//             noteFiles: prev.noteFiles.filter((_, i) => i !== index)
//         }));
//         setNotePreviews(prev => prev.filter((_, i) => i !== index));
//     };

//     const addVideoUrl = () => {
//         if (newVideoUrl.trim()) {
//             // Validate URL
//             try {
//                 new URL(newVideoUrl.trim());
//                 setVideoPreviews(prev => [...prev, newVideoUrl.trim()]);
//                 setFormData(prev => ({
//                     ...prev,
//                     videoFiles: [...prev.videoFiles, { url: newVideoUrl.trim(), type: 'url' }]
//                 }));
//                 setNewVideoUrl('');
//             } catch (e) {
//                 alert('Please enter a valid URL');
//             }
//         }
//     };

//     const createTopic = async (e) => {
//         e.preventDefault();
        
//         if (!formData.title) {
//             alert('Please enter a title');
//             return;
//         }

//         if (!classId) {
//             alert('Please select a class first');
//             return;
//         }

//         setLoading(true);
//         setUploadProgress(0);
        
//         try {
//             const formDataToSend = new FormData();
//             formDataToSend.append('classId', classId);
//             formDataToSend.append('title', formData.title);
//             formDataToSend.append('description', formData.description || '');
            
//             const videoFiles = formData.videoFiles.filter(item => item instanceof File);
//             videoFiles.forEach(file => {
//                 formDataToSend.append('videos', file);
//             });
            
//             const urlVideos = formData.videoFiles.filter(item => item.type === 'url');
//             if (urlVideos.length > 0) {
//                 formDataToSend.append('videoUrls', JSON.stringify(urlVideos.map(v => v.url)));
//             }
            
//             const noteFiles = formData.noteFiles.filter(item => item.file instanceof File);
//             noteFiles.forEach(note => {
//                 formDataToSend.append('notes', note.file);
//                 formDataToSend.append('noteTitles', note.title);
//             });
            
//             console.log("Creating topic with FormData");
//             const startTime = Date.now();
            
//             const res = await axios.post(api.topic.createTopic, formDataToSend, {
//                 headers: {
//                     'Content-Type': 'multipart/form-data'
//                 },
//                 onUploadProgress: (progressEvent) => {
//                     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//                     setUploadProgress(percentCompleted);
//                 },
//                 timeout: 120000 // 2 minutes timeout for large files
//             });
            
//             console.log(`Topic created in ${Date.now() - startTime}ms`);
//             console.log("Topic created:", res.data);
            
//             if (res.data?.data?._id) {
//                 setTopicId(res.data.data._id);
//                 console.log("New topic ID set in store:", res.data.data._id);
//             }
            
//             await fetchTopics();
            
//             toast.success('Topic created successfully!');
//             closeModal();
//         } catch (error) {
//             console.error("Error creating topic:", error);
//             const errorMessage = error.response?.data?.message || 
//                                error.message || 
//                                'Failed to create topic';
//             alert(errorMessage);
//         } finally {
//             setLoading(false);
//             setUploadProgress(0);
//         }
//     };
        
//     const handleEdit = (topic) => {
//         setTopicId(topic._id);
//         openModal(topic);
//     };

//     const updateTopic = async (e) => {
//         e.preventDefault();

//         if (!formData.title) {
//             alert('Please enter a title');
//             return;
//         }

//         if (!editingTopic && !topicId) {
//             alert('No topic selected for update');
//             return;
//         }

//         const currentTopicId = editingTopic?._id || topicId;
        
//         if (!currentTopicId) {
//             alert('Topic ID is missing');
//             return;
//         }
        
//         setLoading(true);
//         setUploadProgress(0);
        
//         try {
//             const formDataToSend = new FormData();
            
//             formDataToSend.append('topicId', currentTopicId);
//             formDataToSend.append('title', formData.title);
//             formDataToSend.append('description', formData.description || '');
            
//             const videoFiles = formData.videoFiles.filter(item => item instanceof File);
//             videoFiles.forEach(file => {
//                 formDataToSend.append('videos', file);
//             });
            
//             const urlVideos = formData.videoFiles.filter(item => item.type === 'url');
//             if (urlVideos.length > 0) {
//                 formDataToSend.append('videoUrls', JSON.stringify(urlVideos.map(v => v.url)));
//             }
            
//             const noteFiles = formData.noteFiles.filter(item => item.file instanceof File);
//             noteFiles.forEach(note => {
//                 formDataToSend.append('notes', note.file);
//                 formDataToSend.append('noteTitles', note.title);
//             });
            
//             console.log("Updating topic with ID:", currentTopicId);
            
//             const res = await axios.post(api.topic.updateTopic, formDataToSend, {
//                 headers: {
//                     'Content-Type': 'multipart/form-data'
//                 },
//                 onUploadProgress: (progressEvent) => {
//                     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//                     setUploadProgress(percentCompleted);
//                 },
//                 timeout: 120000
//             });
            
//             console.log("Topic updated successfully:", res.data);
            
//             await fetchTopics();
            
//             toast.success('Topic updated successfully!');
//             closeModal();
//         } catch (error) {
//             console.error("Error updating topic:", error);
//             console.error("Error response:", error.response?.data);
//             const errorMessage = error.response?.data?.message || 
//                                error.message || 
//                                'Failed to update topic';
//             alert(errorMessage);
//         } finally {
//             setLoading(false);
//             setUploadProgress(0);
//         }
//     };

//  const handleDelete = async () => {
//     if (!deletingTopicId) {
//         alert('Topic ID is missing');
//         return;
//     }
    
//     setLoading(true);
//     try {
//         console.log("Deleting topic with ID:", deletingTopicId);
//         const res = await axios.post(api.topic.deletetopic, {
//             topicId: deletingTopicId
//         });
//         console.log(res, "topic deleted successfully");
        
//         await fetchTopics();
        
//         toast.success('Topic deleted successfully!');
//         setIsDeleteModalOpen(false);
//         setDeletingTopicId(null);
//     } catch (error) {
//         console.error("Error deleting topic:", error);
//         const errorMessage = error.response?.data?.message || 
//                            error.message || 
//                            'Failed to delete topic';
//         alert(errorMessage);
//     } finally {
//         setLoading(false);
//     }
// };
//     const handleSubmit = (e) => {
//         if (editingTopic) {
//             updateTopic(e);
//         } else {
//             createTopic(e);
//         }
//     };

//     const filteredTopics = Array.isArray(topics) ? topics.filter(topic => {
//         const matchesSearch = topic.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                               topic.description?.toLowerCase().includes(searchTerm.toLowerCase());
//         return matchesSearch;
//     }) : [];

//     const totalTopics = Array.isArray(topics) ? topics.length : 0;

//     const selectedClassName = availableClasses.find(c => c._id === classId)?.name || 
//                              availableClasses.find(c => c._id === classId)?.title || 
//                              'Select a class';

//     const getVideoCount = (topic) => {
//         if (topic.videoUrls && Array.isArray(topic.videoUrls)) {
//             return topic.videoUrls.length;
//         }
//         return 0;
//     };

//     const getNotesCount = (topic) => {
//         if (topic.notes && Array.isArray(topic.notes)) {
//             return topic.notes.length;
//         }
//         return 0;
//     };

//     return (
//         <div className="min-h-screen bg-gray-100 p-6">
//             <div className="max-w-7xl mx-auto">
//                 {/* Header */}
//                 <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
//                     <div>
//                         <h1 className="text-4xl font-bold text-gray-800">Admin Panel - Topics</h1>
//                         <p className="text-gray-600 mt-1">Manage Topics for Selected Class</p>
//                     </div>
//                     <button
//                         onClick={() => openModal()}
//                         disabled={!classId}
//                         className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
//                             classId 
//                                 ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' 
//                                 : 'bg-gray-400 cursor-not-allowed text-white'
//                         }`}
//                     >
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
//                         </svg>
//                         Add New Topic
//                     </button>
//                 </div>

//                 {/* Show message if no class selected */}
//                 {!classId ? (
//                     <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
//                         <p className="text-yellow-700">Please select a class to manage topics</p>
//                         <p className="text-sm text-yellow-600 mt-1">Go to Class Schedule page and click on the Book icon to manage topics for a specific class.</p>
//                     </div>
//                 ) : (
//                     <>
//                         {/* Class Title Banner */}
//                         <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-4 mb-6 text-white">
//                             <div className="flex justify-between items-center">
//                                 <div>
//                                     <h2 className="text-2xl font-bold">{selectedClassName}</h2>
//                                 </div>
//                                 <div className="text-right">
//                                     <p className="text-3xl font-bold">{totalTopics}</p>
//                                     <p className="text-blue-100 text-sm">Total Topics</p>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Stats Cards */}
//                         <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
//                             <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-gray-500 text-sm font-medium">Total Topics</p>
//                                         <p className="text-3xl font-bold text-gray-800">{totalTopics}</p>
//                                     </div>
//                                     <div className="bg-blue-100 rounded-full p-3">
//                                         <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
//                                         </svg>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Search */}
//                         <div className="bg-white rounded-lg shadow-md p-4 mb-6">
//                             <div className="flex flex-col md:flex-row gap-4">
//                                 <div className="flex-1">
//                                     <div className="relative">
//                                         <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
//                                         </svg>
//                                         <input
//                                             type="text"
//                                             placeholder="Search topics..."
//                                             value={searchTerm}
//                                             onChange={(e) => setSearchTerm(e.target.value)}
//                                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                         />
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Topics Table */}
//                         <div className="bg-white rounded-lg shadow-md overflow-hidden">
//                             <div className="overflow-x-auto">
//                                 <table className="min-w-full divide-y divide-gray-200">
//                                     <thead className="bg-gray-50">
//                                         <tr>
//                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
//                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
//                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic Title</th>
//                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
//                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Videos</th>
//                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
//                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody className="bg-white divide-y divide-gray-200">
//                                         {loading ? (
//                                             <tr>
//                                                 <td colSpan="7" className="px-6 py-8 text-center">
//                                                     <div className="flex justify-center items-center gap-2">
//                                                         <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
//                                                         Loading topics...
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         ) : filteredTopics.length > 0 ? (
//                                             filteredTopics.map((topic, index) => (
//                                                 <tr key={topic._id || topic.id} className="hover:bg-gray-50">
//                                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                                                         {index + 1}
//                                                     </td>
//                                                     <td className="px-6 py-4 whitespace-nowrap">
//                                                         <div className="flex items-center">
//                                                             <div className="ml-0">
//                                                                 <div className="text-sm font-medium text-gray-900">
//                                                                     {getClassTitle(topic)}
//                                                                 </div>
//                                                                 {topic.classId && topic.classId.day && (
//                                                                     <div className="text-xs text-gray-500">
//                                                                         {topic.classId.day} • {topic.classId.time}
//                                                                     </div>
//                                                                 )}
//                                                             </div>
//                                                         </div>
//                                                     </td>
//                                                     <td className="px-6 py-4">
//                                                         <div className="text-sm font-medium text-gray-900">
//                                                             {topic.title}
//                                                         </div>
//                                                     </td>
//                                                     <td className="px-6 py-4">
//                                                         <div className="text-sm text-gray-500 max-w-xs truncate">
//                                                             {topic.description || 'No description'}
//                                                         </div>
//                                                     </td>
//                                                     <td className="px-6 py-4 whitespace-nowrap">
//                                                         <div className="text-sm text-gray-900">
//                                                             {getVideoCount(topic)}
//                                                         </div>
//                                                         {getVideoCount(topic) > 0 && (
//                                                             <div className="text-xs text-blue-600">
//                                                                 <a href={topic.videoUrls?.[0]} target="_blank" rel="noopener noreferrer">
//                                                                     View
//                                                                 </a>
//                                                             </div>
//                                                         )}
//                                                     </td>
//                                                     <td className="px-6 py-4 whitespace-nowrap">
//                                                         <div className="text-sm text-gray-900">
//                                                             {getNotesCount(topic)}
//                                                         </div>
//                                                         {getNotesCount(topic) > 0 && (
//                                                             <div className="text-xs text-green-600">
//                                                                 Available
//                                                             </div>
//                                                         )}
//                                                     </td>
//                                                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                                                         <div className="flex gap-3">
//                                                             <button
//                                                                 onClick={() => handleEdit(topic)}
//                                                                 className="text-blue-600 hover:text-blue-900"
//                                                             >
//                                                                 Edit
//                                                             </button>
//                                                             <button
//                                                                 onClick={() => {
//                                                                     setDeletingTopicId(topic._id || topic.id);
//                                                                     setIsDeleteModalOpen(true);
//                                                                 }}
//                                                                 className="text-red-600 hover:text-red-900"
//                                                             >
//                                                                 Delete
//                                                             </button>
//                                                         </div>
//                                                     </td>
//                                                 </tr>
//                                             ))
//                                         ) : (
//                                             <tr>
//                                                 <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
//                                                     <div className="flex flex-col items-center gap-2">
//                                                         <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
//                                                         </svg>
//                                                         <p>No topics found for this class</p>
//                                                         <p className="text-sm">Click "Add New Topic" to create one</p>
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         )}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>
//                     </>
//                 )}
//             </div>

//             {/* Create/Edit Modal */}
//             {isModalOpen && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
//                     <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//                         <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
//                             <h2 className="text-2xl font-bold text-gray-800">
//                                 {editingTopic ? 'Edit Topic' : 'Create New Topic'}
//                             </h2>
//                             <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
//                                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
//                                 </svg>
//                             </button>
//                         </div>
                        
//                         <form onSubmit={handleSubmit}>
//                             <div className="p-6 space-y-4">
//                                 {/* Show selected class info */}
//                                 <div className="bg-blue-50 p-3 rounded-lg">
//                                     <p className="text-sm text-blue-800">
//                                         <strong>Selected Class:</strong> {selectedClassName}
//                                     </p>
//                                     {topicId && (
//                                         <p className="text-xs text-blue-600 mt-1">
//                                             Topic ID: {topicId}
//                                         </p>
//                                     )}
//                                 </div>

//                                 {/* Title */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
//                                     <input
//                                         type="text"
//                                         value={formData.title}
//                                         onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                         placeholder="Enter topic title"
//                                         required
//                                     />
//                                 </div>

//                                 {/* Description */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//                                     <textarea
//                                         value={formData.description}
//                                         onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                                         rows="3"
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                         placeholder="Enter topic description"
//                                     />
//                                 </div>

//                                 {/* Video Files */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">Video Files</label>
//                                     <div className="space-y-3">
//                                         {videoPreviews.length > 0 && videoPreviews.map((preview, idx) => (
//                                             <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
//                                                 <div className="flex-1">
//                                                     {typeof preview === 'string' ? (
//                                                         preview.startsWith('blob:') ? (
//                                                             <video className="w-20 h-16 object-cover rounded" controls>
//                                                                 <source src={preview} />
//                                                             </video>
//                                                         ) : (
//                                                             <a href={preview} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm break-all">
//                                                                 {preview.length > 50 ? preview.substring(0, 50) + '...' : preview}
//                                                             </a>
//                                                         )
//                                                     ) : (
//                                                         <div>
//                                                             <p className="text-sm font-medium">{preview.title || preview.file?.name}</p>
//                                                             <a href={preview.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xs">
//                                                                 View File
//                                                             </a>
//                                                         </div>
//                                                     )}
//                                                 </div>
//                                                 <button type="button" onClick={() => removeVideoFile(idx)} className="text-red-600 hover:text-red-800">
//                                                     Remove
//                                                 </button>
//                                             </div>
//                                         ))}
                                        
//                                         <div className="border rounded-lg p-3">
//                                             <p className="text-xs font-medium text-gray-600 mb-2">Upload Video Files</p>
//                                             <input
//                                                 type="file"
//                                                 onChange={handleVideoFileUpload}
//                                                 accept="video/mp4,video/webm,video/ogg,video/quicktime"
//                                                 multiple
//                                                 className="text-sm"
//                                             />
//                                             <p className="text-xs text-gray-500 mt-1">Supported formats: MP4, WebM, OGG, MOV (Max 100MB each)</p>
//                                         </div>

//                                         <div className="border rounded-lg p-3">
//                                             <p className="text-xs font-medium text-gray-600 mb-2">Add Video via URL</p>
//                                             <div className="flex gap-2">
//                                                 <input
//                                                     type="text"
//                                                     value={newVideoUrl}
//                                                     onChange={(e) => setNewVideoUrl(e.target.value)}
//                                                     className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                                     placeholder="Enter YouTube or video URL"
//                                                 />
//                                                 <button type="button" onClick={addVideoUrl} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
//                                                     Add URL
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Notes */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">Study Notes</label>
//                                     <div className="space-y-2">
//                                         {notePreviews.length > 0 && notePreviews.map((note, idx) => (
//                                             <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
//                                                 <div className="flex-1">
//                                                     <div className="font-medium text-sm">{note.title || note.file?.name}</div>
//                                                     {note.fileUrl && (
//                                                         <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xs">
//                                                             View File
//                                                         </a>
//                                                     )}
//                                                 </div>
//                                                 <button type="button" onClick={() => removeNoteFile(idx)} className="text-red-600 hover:text-red-800">
//                                                     Remove
//                                                 </button>
//                                             </div>
//                                         ))}
                                        
//                                         <div className="border rounded-lg p-3">
//                                             <p className="text-xs font-medium text-gray-600 mb-2">Upload Note Files</p>
//                                             <input
//                                                 type="file"
//                                                 onChange={handleNoteFileUpload}
//                                                 multiple
//                                                 accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
//                                                 className="text-sm"
//                                             />
//                                             <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, DOC, DOCX, TXT, PPT, PPTX (Max 10MB each)</p>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Upload Progress */}
//                                 {uploadProgress > 0 && uploadProgress < 100 && (
//                                     <div className="mt-4">
//                                         <div className="flex justify-between text-sm text-gray-600 mb-1">
//                                             <span>Uploading...</span>
//                                             <span>{uploadProgress}%</span>
//                                         </div>
//                                         <div className="w-full bg-gray-200 rounded-full h-2.5">
//                                             <div 
//                                                 className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
//                                                 style={{ width: `${uploadProgress}%` }}
//                                             ></div>
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>

//                             <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
//                                 <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
//                                     Cancel
//                                 </button>
//                                 <button 
//                                     type="submit" 
//                                     disabled={loading} 
//                                     className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//                                 >
//                                     {loading ? (
//                                         <>
//                                             <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                             </svg>
//                                             {editingTopic ? 'Updating...' : 'Creating...'}
//                                         </>
//                                     ) : (editingTopic ? 'Update Topic' : 'Create Topic')}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* Delete Modal */}
//             {isDeleteModalOpen && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-lg max-w-md w-full p-6">
//                         <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Delete</h3>
//                         <p className="text-gray-600 mb-6">Are you sure you want to delete this topic? This action cannot be undone.</p>
//                         <div className="flex justify-end gap-3">
//                             <button 
//                                 onClick={() => setIsDeleteModalOpen(false)} 
//                                 className="px-4 py-2 border rounded-lg hover:bg-gray-50"
//                                 disabled={loading}
//                             >
//                                 Cancel
//                             </button>
//                             <button 
//                                 onClick={handleDelete} 
//                                 className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
//                                 disabled={loading}
//                             >
//                                 {loading ? 'Deleting...' : 'Delete'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default AdminTopicsPanel;