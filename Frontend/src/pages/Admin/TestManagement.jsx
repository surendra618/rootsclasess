import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Trash2, Edit, ChevronDown, ChevronUp, Loader as LoaderIcon, 
  X, CheckCircle, BookOpen, Clock, Percent, AlertCircle, Upload, FileText, 
  Sparkles, Shield, GraduationCap, Copy, Landmark, Dna, Atom,
  UploadCloud, FileJson, CheckCircle2, Download, FileCheck, RefreshCw, Search, Users
} from 'lucide-react';
import axios from 'axios';
import api from '../../services/adminendpoint';
import Loader from '../../components/AdminComponent/Loader';

const EXAM_CATEGORIES = [
  { value: 'all', label: 'All Exams' },
  { value: 'NEET', label: '🧬 NEET UG' },
  { value: 'JEE Mains', label: '⚙️ JEE Mains' },
  { value: 'SSC', label: '🏛️ SSC Exams' },
  { value: 'Defense', label: '🎖️ Defense / NDA' },
  { value: 'CBSE Boards', label: '📚 CBSE Boards' },
  { value: 'Foundation', label: '🌱 Foundation' },
  { value: 'General', label: '📋 Scholarship & General' },
];

const TestManagement = () => {
  const navigate = useNavigate();
  const [allTests, setAllTests] = useState([]);
  const [expandedTest, setExpandedTest] = useState(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [publishingTestId, setPublishingTestId] = useState(null);
  const [deletingTestId, setDeletingTestId] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPricing, setSelectedPricing] = useState('all'); // 'all', 'free', 'paid'
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all', 'published', 'draft'

  // Edit Test Modal
  const [isEditTestModalOpen, setIsEditTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [editTestForm, setEditTestForm] = useState({
    title: '',
    duration: 60,
    passingPercentage: 70,
    className: '11th',
    category: 'SSC',
    customCategory: '',
    difficulty: 'Medium',
    year: '2026',
    description: '',
    isPublished: false,
    isPaid: false,
    price: 0
  });

  // Single Question Form State
  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 1,
    subject: ''
  });

  // Bulk Upload Modal State
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [bulkUploadTest, setBulkUploadTest] = useState(null);
  const [bulkJsonText, setBulkJsonText] = useState('');
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkError, setBulkError] = useState('');
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null);
  const [validQuestions, setValidQuestions] = useState([]);
  const [activeBulkTab, setActiveBulkTab] = useState('file');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchAllTests();
  }, []);

  const getQuestionsFromTest = (test) => {
    if (test.questions && Array.isArray(test.questions)) return test.questions;
    if (test.Questions && Array.isArray(test.Questions)) return test.Questions;
    if (test.questionList && Array.isArray(test.questionList)) return test.questionList;
    if (test.data && Array.isArray(test.data)) return test.data;
    return [];
  };

  const fetchAllTests = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(api.test.getQuestion);
      
      let testsArray = [];
      if (response.data.success && Array.isArray(response.data.data)) {
        testsArray = response.data.data;
      } else if (response.data.success && Array.isArray(response.data.tests)) {
        testsArray = response.data.tests;
      } else if (Array.isArray(response.data)) {
        testsArray = response.data;
      } else if (response.data.data && Array.isArray(response.data.data.tests)) {
        testsArray = response.data.data.tests;
      }

      const tests = testsArray.map(item => ({
        _id: item._id || item.id,
        title: item.title || 'Untitled Test',
        questions: getQuestionsFromTest(item),
        isPublished: item.isPublished || item.is_published || false,
        passingPercentage: item.passingPercentage || item.passing_percentage || 70,
        duration: item.duration || 60,
        className: item.className || item.class_name || '11th',
        category: item.category || 'General',
        difficulty: item.difficulty || 'Medium',
        year: item.year || '2026',
        description: item.description || '',
        isPaid: Boolean(item.isPaid),
        price: Number(item.price) || 0
      }));
      
      setAllTests(tests);
    } catch (error) {
      console.error('Error fetching tests:', error);
      alert('Failed to load tests: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTest = (testId) => {
    setExpandedTest(expandedTest === testId ? null : testId);
  };

  const togglePublish = async (testId, currentStatus, e) => {
    if (e) e.stopPropagation();
    setPublishingTestId(testId);
    try {
      const response = await axios.post(api.test.isPublished, {
        testId: testId,
        isPublished: !currentStatus
      });
      if (response.data.success) {
        setAllTests(prev => prev.map(t => 
          t._id === testId ? { ...t, isPublished: !currentStatus } : t
        ));
      } else {
        alert(response.data.message || 'Failed to update publish status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setPublishingTestId(null);
    }
  };

  const deleteTest = async (testId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this test? All questions inside will also be removed.')) return;
    setDeletingTestId(testId);
    try {
      const response = await axios.post(api.test.deleteTest, { testId });
      if (response.data.success) {
        setAllTests(prev => prev.filter(t => t._id !== testId));
      } else {
        alert(response.data.message || 'Failed to delete test');
      }
    } catch (error) {
      console.error('Error deleting test:', error);
      alert('Failed to delete test');
    } finally {
      setDeletingTestId(null);
    }
  };

  // Open Edit Test Modal
  const openEditTestModal = (test, e) => {
    if (e) e.stopPropagation();
    setEditingTest(test);
    setEditTestForm({
      title: test.title || '',
      duration: test.duration || 60,
      passingPercentage: test.passingPercentage || 70,
      className: test.className || '11th',
      category: test.category || 'SSC',
      customCategory: '',
      difficulty: test.difficulty || 'Medium',
      year: test.year || '2026',
      description: test.description || '',
      isPublished: Boolean(test.isPublished),
      isPaid: Boolean(test.isPaid),
      price: Number(test.price) || 0
    });
    setIsEditTestModalOpen(true);
  };

  const handleUpdateTest = async (e) => {
    e.preventDefault();
    if (!editTestForm.title.trim()) {
      alert('Please enter test title');
      return;
    }
    try {
      const payload = {
        testId: editingTest._id,
        title: editTestForm.title.trim(),
        duration: Number(editTestForm.duration) || 60,
        passingPercentage: Number(editTestForm.passingPercentage) || 70,
        className: editTestForm.className || '11th',
        category: editTestForm.category === 'Custom' ? (editTestForm.customCategory || 'General') : editTestForm.category,
        difficulty: editTestForm.difficulty || 'Medium',
        year: String(editTestForm.year || '2026'),
        description: editTestForm.description || '',
        isPublished: editTestForm.isPublished,
        isPaid: Boolean(editTestForm.isPaid),
        price: Number(editTestForm.price) || 0
      };
      const response = await axios.post(api.test.editTest, payload);
      if (response.data.success) {
        setAllTests(prev => prev.map(t => t._id === editingTest._id ? { ...t, ...payload } : t));
        setIsEditTestModalOpen(false);
        setEditingTest(null);
      } else {
        alert(response.data.message || 'Failed to update test');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update test');
    }
  };

  // Question handlers
  const openQuestionModal = (test, question = null, e) => {
    if (e) e.stopPropagation();
    setExpandedTest(test._id);
    if (question) {
      setEditingQuestion(question);
      setQuestionForm({
        question: question.question || '',
        options: question.options || ['', '', '', ''],
        correctAnswer: question.correctAnswer || '',
        marks: question.marks || 1,
        subject: question.subject || ''
      });
    } else {
      setEditingQuestion(null);
      setQuestionForm({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        marks: 1,
        subject: ''
      });
    }
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async () => {
    if (!questionForm.question.trim()) {
      alert('Please enter a question');
      return;
    }
    if (questionForm.options.some(opt => !String(opt).trim())) {
      alert('Please fill all 4 options');
      return;
    }
    if (!questionForm.correctAnswer.trim()) {
      alert('Please select or specify correct answer');
      return;
    }

    try {
      if (editingQuestion) {
        const response = await axios.post(api.test.editQuestion, {
          testId: expandedTest,
          questionId: editingQuestion._id || editingQuestion.id,
          question: questionForm.question,
          options: questionForm.options,
          correctAnswer: questionForm.correctAnswer,
          marks: Number(questionForm.marks) || 1,
          subject: questionForm.subject || ''
        });
        if (response.data.success) {
          await fetchAllTests();
          setIsQuestionModalOpen(false);
        }
      } else {
        const response = await axios.post(api.test.addQuestion, {
          testId: expandedTest,
          question: questionForm.question,
          options: questionForm.options,
          correctAnswer: questionForm.correctAnswer,
          marks: Number(questionForm.marks) || 1,
          subject: questionForm.subject || ''
        });
        if (response.data.success) {
          await fetchAllTests();
          setIsQuestionModalOpen(false);
        }
      }
    } catch (err) {
      console.error('Error saving question:', err);
      alert('Failed to save question');
    }
  };

  const deleteQuestion = async (testId, questionId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Delete this question?')) return;
    try {
      const response = await axios.post(api.test.deleteQuestion, { testId, questionId });
      if (response.data.success) {
        await fetchAllTests();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete question');
    }
  };

  // Bulk Upload handlers
  const openBulkUploadModal = (test, e) => {
    if (e) e.stopPropagation();
    setBulkUploadTest(test);
    setBulkJsonText('');
    setBulkError('');
    setUploadedFileInfo(null);
    setValidQuestions([]);
    setActiveBulkTab('file');
    setIsBulkUploadModalOpen(true);
  };

  const parseAndValidateQuestions = (text, fileName = '', fileSize = 0) => {
    try {
      if (!text) throw new Error('No content found in question JSON.');
      const parsed = typeof text === 'string' ? JSON.parse(text) : text;
      const questionsList = Array.isArray(parsed)
        ? parsed
        : (Array.isArray(parsed?.questions) ? parsed.questions : null);

      if (!questionsList || !Array.isArray(questionsList)) {
        throw new Error('Root JSON must be an array of questions: [ { ... }, { ... } ] or an object with "questions" array.');
      }
      if (questionsList.length === 0) {
        throw new Error('JSON questions array is empty. Please add at least 1 question.');
      }

      let totalMarks = 0;
      const subjectsCount = {};
      const normalizedQuestions = [];

      questionsList.forEach((q, idx) => {
        const qText = q.question || q.questionText || q.text;
        if (!qText) throw new Error(`Question #${idx + 1} is missing question text (field "question" or "text").`);

        const qOpts = Array.isArray(q.options)
          ? q.options
          : (Array.isArray(q.choices) ? q.choices : null);
        if (!qOpts || qOpts.length < 2) throw new Error(`Question #${idx + 1} options must be an array with at least 2 options.`);

        let ans = q.correctAnswer !== undefined ? q.correctAnswer : (q.answer !== undefined ? q.answer : q.correctOption);
        if (ans === undefined || ans === null || ans === '') {
          throw new Error(`Question #${idx + 1} is missing "correctAnswer".`);
        }

        const m = Number(q.marks) || 1;
        totalMarks += m;
        const subj = (q.subject || 'General').trim();
        subjectsCount[subj] = (subjectsCount[subj] || 0) + 1;

        normalizedQuestions.push({
          question: qText,
          options: qOpts,
          correctAnswer: ans,
          marks: m,
          subject: subj
        });
      });

      const formattedSize = fileSize > 1024 * 1024
        ? `${(fileSize / (1024 * 1024)).toFixed(2)} MB`
        : `${(fileSize / 1024).toFixed(1)} KB`;

      setUploadedFileInfo({
        name: fileName || 'uploaded_questions.json',
        sizeStr: formattedSize,
        count: normalizedQuestions.length,
        subjects: subjectsCount,
        totalMarks: totalMarks,
      });
      setBulkError('');
      setValidQuestions(normalizedQuestions);
      return normalizedQuestions;
    } catch (err) {
      setBulkError(err.message || 'Invalid JSON file format.');
      setUploadedFileInfo(null);
      setValidQuestions([]);
      return null;
    }
  };

  const handleJsonFileUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        setBulkJsonText(content || '');
        parseAndValidateQuestions(content, file.name, file.size);
      } catch (err) {
        setBulkError('Error reading file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleBulkUploadSubmit = async () => {
    let questionsToUpload = validQuestions;
    if (!questionsToUpload || questionsToUpload.length === 0) {
      if (bulkJsonText.trim()) {
        questionsToUpload = parseAndValidateQuestions(bulkJsonText, 'pasted_json.json', bulkJsonText.length);
      }
    }

    if (!questionsToUpload || questionsToUpload.length === 0) {
      alert('Please select a valid question JSON file or paste questions first.');
      return;
    }

    const testId = bulkUploadTest?._id || bulkUploadTest?.id;
    if (!testId) {
      alert('Test ID is missing. Please close this modal and try clicking Bulk JSON again.');
      return;
    }

    try {
      setIsBulkUploading(true);
      const response = await axios.post(api.test.addQuestion, {
        testId: testId,
        questions: questionsToUpload
      });
      if (response.data?.success) {
        alert(`Successfully uploaded ${questionsToUpload.length} questions to "${bulkUploadTest.title}"!`);
        setIsBulkUploadModalOpen(false);
        setBulkUploadTest(null);
        setValidQuestions([]);
        setBulkJsonText('');
        setUploadedFileInfo(null);
        await fetchAllTests();
      } else {
        alert(response.data?.message || 'Failed to upload questions');
      }
    } catch (err) {
      console.error('Bulk upload error:', err);
      alert('Bulk upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsBulkUploading(false);
    }
  };

  // Helper styles
  const getDifficultyBadge = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'hard': return 'bg-rose-50 text-rose-700 border border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const getCategoryBadge = (category) => {
    const c = (category || '').toLowerCase();
    if (c.includes('jee')) return 'bg-blue-50 text-blue-700 border border-blue-200';
    if (c.includes('neet')) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (c.includes('ssc')) return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
    if (c.includes('defense') || c.includes('nda')) return 'bg-amber-50 text-amber-700 border border-amber-200';
    if (c.includes('board') || c.includes('cbse')) return 'bg-purple-50 text-purple-700 border border-purple-200';
    if (c.includes('foundation')) return 'bg-teal-50 text-teal-700 border border-teal-200';
    return 'bg-slate-100 text-slate-700 border border-slate-200';
  };

  // Filtered Tests
  const filteredTests = allTests.filter(t => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (t.title || '').toLowerCase().includes(q);
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      const matchCat = (t.category || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }
    // Category filter
    if (selectedCategory !== 'all') {
      const cat = (t.category || '').toLowerCase();
      const sel = selectedCategory.toLowerCase();
      if (!cat.includes(sel)) return false;
    }
    // Pricing filter
    if (selectedPricing === 'free' && (t.isPaid && t.price > 0)) return false;
    if (selectedPricing === 'paid' && (!t.isPaid || !t.price || t.price === 0)) return false;
    // Status filter
    if (selectedStatus === 'published' && !t.isPublished) return false;
    if (selectedStatus === 'draft' && t.isPublished) return false;

    return true;
  });

  const totalQuestionsSum = allTests.reduce((sum, t) => sum + (t.questions?.length || 0), 0);
  const publishedCount = allTests.filter(t => t.isPublished).length;
  const paidCount = allTests.filter(t => t.isPaid && t.price > 0).length;

  if (isLoading && allTests.length === 0) {
    return <Loader message="Loading tests..." />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-16">
      
      {/* 1. Header with "+ Create New Test" Button */}
      <div className="bg-white border-b border-gray-200/80 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Exam Portal Admin
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-500">Mock Tests & CBT Questions</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Test Management</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage mock test series, upload questions, configure timers, and publish assessments.</p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={fetchAllTests}
              className="p-2.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
              title="Refresh Test List"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => navigate('/admin/test-purchases')}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Users size={15} />
              <span>Test Purchases (₹)</span>
            </button>
            <button
              onClick={() => navigate('/admin/create-test')}
              className="px-4 py-2.5 bg-[#FB0500] hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              <span>Create New Test</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">

        {/* 2. Stat Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tests</span>
              <BookOpen className="text-blue-500" size={18} />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{allTests.length}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Across all exam categories</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Published</span>
              <CheckCircle className="text-emerald-500" size={18} />
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-2">{publishedCount}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Live on Student Portal</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Questions</span>
              <FileText className="text-purple-500" size={18} />
            </div>
            <div className="text-2xl font-black text-purple-600 mt-2">{totalQuestionsSum}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Across all papers</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Paid / Premium</span>
              <Sparkles className="text-amber-500" size={18} />
            </div>
            <div className="text-2xl font-black text-amber-600 mt-2">{paidCount}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Premium test series</div>
          </div>
        </div>

        {/* 3. Search & Filter Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search tests by title or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Pricing Filter Tabs */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Type:</span>
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                {[
                  { key: 'all', label: `All (${allTests.length})` },
                  { key: 'free', label: `Free Mocks (${allTests.length - paidCount})` },
                  { key: 'paid', label: `Paid (${paidCount})` },
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => setSelectedPricing(item.key)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                      selectedPricing === item.key
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
            {EXAM_CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Full-Width All Tests List (13) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-800">
              All Tests ({filteredTests.length})
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredTests.length} of {allTests.length} tests
            </span>
          </div>

          {filteredTests.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <AlertCircle className="mx-auto text-slate-400 mb-2" size={32} />
              <h3 className="text-sm font-bold text-slate-700">No mock tests found</h3>
              <p className="text-xs text-slate-400 mt-1">Try clearing your filters or create a new test card.</p>
              <button
                onClick={() => navigate('/admin/create-test')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-xs"
              >
                + Create Test
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTests.map((test) => {
                const questionCount = test.questions?.length || 0;
                const isExpanded = expandedTest === test._id;

                return (
                  <div 
                    key={test._id} 
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl overflow-hidden transition-all shadow-2xs flex flex-col justify-between"
                  >
                    {/* Top Accent Strip */}
                    <div className={`h-1.5 ${test.isPaid ? 'bg-amber-500' : 'bg-[#FB0500]'}`} />

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      {/* Badges row */}
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                          {test.isPaid && test.price > 0 ? (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300">
                              👑 ₹{test.price} Paid
                            </span>
                          ) : (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300">
                              ⚡ Free Mock
                            </span>
                          )}

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getDifficultyBadge(test.difficulty)}`}>
                            {test.difficulty || 'Medium'}
                          </span>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getCategoryBadge(test.category)}`}>
                            {test.category || 'General'}
                          </span>

                          {test.className && (
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                              Class {test.className}
                            </span>
                          )}

                          <button
                            onClick={(e) => togglePublish(test._id, test.isPublished, e)}
                            disabled={publishingTestId === test._id}
                            className={`ml-auto text-[10px] font-black px-2.5 py-0.5 rounded transition cursor-pointer ${
                              test.isPublished 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100' 
                                : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
                            }`}
                            title="Click to toggle publish status"
                          >
                            {publishingTestId === test._id ? 'Updating...' : test.isPublished ? '✓ Published' : 'Draft'}
                          </button>
                        </div>

                        {/* Title */}
                        <h3 className="font-black text-slate-900 text-base leading-snug line-clamp-2">
                          {test.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {test.description || 'Comprehensive examination mock test for candidate evaluation.'}
                        </p>
                      </div>

                      {/* Stats meta */}
                      <div className="pt-4 mt-4 border-t border-slate-100">
                        <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-600 pb-3">
                          <div className="bg-slate-50 rounded-md p-1.5 border border-slate-100">
                            <span className="text-slate-400 text-[10px] block uppercase font-bold">Duration</span>
                            <strong className="text-slate-800 font-bold">{test.duration || 60}m</strong>
                          </div>
                          <div className="bg-slate-50 rounded-md p-1.5 border border-slate-100">
                            <span className="text-slate-400 text-[10px] block uppercase font-bold">Questions</span>
                            <strong className="text-blue-600 font-bold">{questionCount} Qs</strong>
                          </div>
                          <div className="bg-slate-50 rounded-md p-1.5 border border-slate-100">
                            <span className="text-slate-400 text-[10px] block uppercase font-bold">Pass %</span>
                            <strong className="text-slate-800 font-bold">{test.passingPercentage || 70}%</strong>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={(e) => openBulkUploadModal(test, e)}
                            className="py-2 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-md border border-blue-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Upload size={13} />
                            <span>Bulk JSON</span>
                          </button>

                          <button
                            onClick={(e) => openQuestionModal(test, null, e)}
                            className="py-2 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-md border border-emerald-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Plus size={13} />
                            <span>+ Question</span>
                          </button>
                        </div>

                        {/* Secondary Actions Row */}
                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
                          <button
                            onClick={(e) => openEditTestModal(test, e)}
                            className="text-slate-600 hover:text-blue-600 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Edit size={12} />
                            <span>Edit Test</span>
                          </button>

                          <button
                            onClick={() => toggleTest(test._id)}
                            className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <span>{questionCount} Questions</span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>

                          <button
                            onClick={(e) => deleteTest(test._id, e)}
                            disabled={deletingTestId === test._id}
                            className="text-slate-400 hover:text-red-600 p-1 transition cursor-pointer"
                            title="Delete this test"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Expanded Question Accordion */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-slate-200 max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {questionCount === 0 ? (
                              <p className="text-xs text-slate-400 italic text-center py-2">No questions uploaded yet. Use "Bulk JSON" or "+ Question".</p>
                            ) : (
                              test.questions.map((q, qIdx) => (
                                <div key={q._id || qIdx} className="bg-slate-50 border border-slate-200 rounded p-2.5 text-xs space-y-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="font-bold text-slate-800 line-clamp-2">
                                      Q{qIdx + 1}. {q.question}
                                    </span>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        onClick={(e) => openQuestionModal(test, q, e)}
                                        className="text-slate-400 hover:text-blue-600 p-0.5"
                                        title="Edit question"
                                      >
                                        <Edit size={12} />
                                      </button>
                                      <button
                                        onClick={(e) => deleteQuestion(test._id, q._id || q.id, e)}
                                        className="text-slate-400 hover:text-red-600 p-0.5"
                                        title="Delete question"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-medium">
                                    Ans: <strong className="text-emerald-700">{q.correctAnswer}</strong> • {q.marks || 1} Marks {q.subject ? `• ${q.subject}` : ''}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ---------------------------------------------------------------- */}
      {/* BULK UPLOAD MODAL                                                */}
      {/* ---------------------------------------------------------------- */}
      {isBulkUploadModalOpen && bulkUploadTest && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsBulkUploadModalOpen(false)}>
          <div className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full overflow-hidden shadow-2xl my-auto animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Bulk Upload Questions</span>
                <h3 className="text-base font-black text-slate-900 mt-1">{bulkUploadTest.title}</h3>
              </div>
              <button onClick={() => setIsBulkUploadModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Tab Selector */}
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setActiveBulkTab('file')}
                  className={`pb-2.5 px-4 text-xs font-bold transition border-b-2 ${
                    activeBulkTab === 'file' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Upload JSON File
                </button>
                <button
                  onClick={() => setActiveBulkTab('paste')}
                  className={`pb-2.5 px-4 text-xs font-bold transition border-b-2 ${
                    activeBulkTab === 'paste' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Paste JSON Array
                </button>
              </div>

              {activeBulkTab === 'file' ? (
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                    isDragOver ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-slate-400'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (e.dataTransfer.files?.[0]) handleJsonFileUpload(e.dataTransfer.files[0]);
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={(e) => handleJsonFileUpload(e.target.files?.[0])}
                  />
                  <UploadCloud className="mx-auto text-blue-600 mb-2" size={36} />
                  <p className="text-sm font-bold text-slate-800">Choose a .JSON Question File or Drag & Drop</p>
                  <p className="text-xs text-slate-400 mt-1">Accepts standard Roots Classes Question Bank array format</p>
                </div>
              ) : (
                <div>
                  <textarea
                    rows="8"
                    value={bulkJsonText}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBulkJsonText(val);
                      if (val.trim()) {
                        parseAndValidateQuestions(val, 'pasted_json.json', val.length);
                      } else {
                        setUploadedFileInfo(null);
                        setValidQuestions([]);
                        setBulkError('');
                      }
                    }}
                    placeholder={`[\n  {\n    "question": "What is the capital of India?",\n    "options": ["Mumbai", "New Delhi", "Kolkata", "Chennai"],\n    "correctAnswer": "New Delhi",\n    "marks": 1,\n    "subject": "General Awareness"\n  }\n]`}
                    className="w-full p-3 font-mono text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Validation Summary */}
              {uploadedFileInfo && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-center justify-between">
                  <div>
                    <strong>✓ Valid JSON Format:</strong> {uploadedFileInfo.count} questions detected ({uploadedFileInfo.totalMarks} total marks).
                  </div>
                </div>
              )}

              {bulkError && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800">
                  <strong>Error:</strong> {bulkError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsBulkUploadModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkUploadSubmit}
                  disabled={isBulkUploading || (!uploadedFileInfo && validQuestions.length === 0 && !bulkJsonText.trim())}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isBulkUploading ? <LoaderIcon className="animate-spin" size={14} /> : null}
                  <span>Upload Questions to Test</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* SINGLE QUESTION MODAL                                            */}
      {/* ---------------------------------------------------------------- */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsQuestionModalOpen(false)}>
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl my-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">{editingQuestion ? 'Edit Question' : 'Add Question'}</h3>
              <button onClick={() => setIsQuestionModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Question Statement *</label>
                <textarea
                  rows="3"
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  placeholder="Enter the complete question problem statement..."
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject (Optional)</label>
                  <input
                    type="text"
                    value={questionForm.subject}
                    onChange={(e) => setQuestionForm({ ...questionForm, subject: e.target.value })}
                    placeholder="e.g. Physics, Math, English"
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Marks</label>
                  <input
                    type="number"
                    min="1"
                    value={questionForm.marks}
                    onChange={(e) => setQuestionForm({ ...questionForm, marks: Number(e.target.value) })}
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Options & Correct Answer *</label>
                <div className="space-y-2">
                  {questionForm.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswerOption"
                        checked={questionForm.correctAnswer === opt && opt.trim() !== ''}
                        onChange={() => setQuestionForm({ ...questionForm, correctAnswer: opt })}
                        className="w-4 h-4 text-emerald-600"
                        title="Mark as correct answer"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...questionForm.options];
                          updated[oIdx] = e.target.value;
                          setQuestionForm({ ...questionForm, options: updated });
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                        className="flex-1 p-2 text-xs border border-slate-200 rounded-lg"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">Select the radio button next to the option that is the correct answer.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveQuestion}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md"
                >
                  Save Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* EDIT TEST MODAL                                                  */}
      {/* ---------------------------------------------------------------- */}
      {isEditTestModalOpen && editingTest && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsEditTestModalOpen(false)}>
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl my-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Edit Test Details</h3>
              <button onClick={() => setIsEditTestModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateTest} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Test Title *</label>
                <input
                  type="text"
                  value={editTestForm.title}
                  onChange={(e) => setEditTestForm({ ...editTestForm, title: e.target.value })}
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    min="1"
                    value={editTestForm.duration}
                    onChange={(e) => setEditTestForm({ ...editTestForm, duration: Number(e.target.value) })}
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Passing %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editTestForm.passingPercentage}
                    onChange={(e) => setEditTestForm({ ...editTestForm, passingPercentage: Number(e.target.value) })}
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Pricing Type */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-2">Test Pricing</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="editTestPricing"
                      checked={!editTestForm.isPaid}
                      onChange={() => setEditTestForm({ ...editTestForm, isPaid: false, price: 0 })}
                    />
                    <span>⚡ Free Mock</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="editTestPricing"
                      checked={Boolean(editTestForm.isPaid)}
                      onChange={() => setEditTestForm({ ...editTestForm, isPaid: true, price: editTestForm.price > 0 ? editTestForm.price : 99 })}
                    />
                    <span>👑 Paid / Premium</span>
                  </label>
                </div>
                {Boolean(editTestForm.isPaid) && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      min="1"
                      value={editTestForm.price || ''}
                      onChange={(e) => setEditTestForm({ ...editTestForm, price: Number(e.target.value) })}
                      className="w-full p-1.5 text-xs border border-amber-300 rounded bg-white"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditTestModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md"
                >
                  Update Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TestManagement;
