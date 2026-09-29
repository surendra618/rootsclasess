import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Edit, ChevronDown, ChevronUp, Loader as LoaderIcon, X, CheckCircle, BookOpen, Clock, Percent, AlertCircle } from 'lucide-react';
import axios from 'axios';
import api from '../../services/adminendpoint';
import Loader from '../../components/AdminComponent/Loader';

const AdminTestCreator = () => {
  const [allTests, setAllTests] = useState([]);
  const [expandedTest, setExpandedTest] = useState(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [publishingTestId, setPublishingTestId] = useState(null);
  const [deletingTestId, setDeletingTestId] = useState(null);
  const [isEditTestModalOpen, setIsEditTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [editTestForm, setEditTestForm] = useState({
    title: '',
    duration: 60,
    passingPercentage: 70,
    className: '',
    isPublished: false
  });

  const [newTest, setNewTest] = useState({
    title: '',
    passingPercentage: 70,
    duration: 60,
    className: '',
    isPublished: 'draft'
  });

  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 1
  });

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
      console.log("Full API Response:", response.data);
      
      let testsArray = [];
      if (response.data.success && Array.isArray(response.data.data)) {
        testsArray = response.data.data;
      } else if (response.data.success && Array.isArray(response.data.tests)) {
        testsArray = response.data.tests;
      } else if (Array.isArray(response.data)) {
        testsArray = response.data;
      } else if (response.data.data && Array.isArray(response.data.data.tests)) {
        testsArray = response.data.data.tests;
      } else {
        console.warn("Unexpected response structure:", response.data);
        testsArray = [];
      }

      const tests = testsArray.map(item => ({
        _id: item._id || item.id,
        title: item.title || 'Untitled Test',
        questions: getQuestionsFromTest(item),
        isPublished: item.isPublished || item.is_published || false,
        passingPercentage: item.passingPercentage || item.passing_percentage || 70,
        duration: item.duration || 60,
        className: item.className || item.class_name || ''
      }));
      
      console.log("Processed tests with questions:", tests.map(t => ({ id: t._id, title: t.title, questionCount: t.questions.length })));
      setAllTests(tests);
    } catch (error) {
      console.error('Error fetching tests:', error);
      alert('Failed to load tests: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const createTest = async () => {
    if (!newTest.title.trim()) {
      alert('Please enter test title');
      return;
    }

    setIsSaving(true);
    try {
      const response = await axios.post(api.test.createTest, {
        title: newTest.title,
        duration: newTest.duration,
        passingPercentage: newTest.passingPercentage,
        className: newTest.className,
        isPublished: newTest.isPublished === 'published'
      });
      
      if (response.data.success) {
        setNewTest({ title: '', passingPercentage: 70, duration: 60, className: '', isPublished: 'draft' });
        await fetchAllTests();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        alert('Test created successfully!');
      } else {
        alert(response.data.message || 'Failed to create test');
      }
    } catch (error) {
      console.error('Error creating test:', error);
      alert('Failed to create test: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  const openEditTestModal = (test) => {
    setEditingTest(test);
    setEditTestForm({
      title: test.title,
      duration: test.duration,
      passingPercentage: test.passingPercentage,
      className: test.className || '',
      isPublished: test.isPublished
    });
    setIsEditTestModalOpen(true);
  };

  const updateTest = async () => {
    if (!editTestForm.title.trim()) {
      alert('Please enter test title');
      return;
    }

    setIsSaving(true);
    try {
      const response = await axios.post(api.test.editTest, {
        testId: editingTest._id,
        title: editTestForm.title,
        duration: editTestForm.duration,
        passingPercentage: editTestForm.passingPercentage,
        className: editTestForm.className,
        isPublished: editTestForm.isPublished
      });
      
      if (response.data.success) {
        await fetchAllTests();
        setIsEditTestModalOpen(false);
        setEditingTest(null);
        alert('Test updated successfully!');
      } else {
        alert(response.data.message || 'Failed to update test');
      }
    } catch (error) {
      console.error('Error updating test:', error);
      alert('Failed to update test: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTest = async (testId, testTitle) => {
    if (window.confirm(`Are you sure you want to delete the test "${testTitle}"? This action cannot be undone and will delete all questions in this test.`)) {
      setDeletingTestId(testId);
      try {
        const response = await axios.post(api.test.deleteTest, {
          testId: testId
        });
        
        if (response.data.success) {
          await fetchAllTests();
          alert('Test deleted successfully!');
          if (expandedTest === testId) {
            setExpandedTest(null);
          }
        } else {
          alert(response.data.message || 'Failed to delete test');
        }
      } catch (error) {
        console.error('Error deleting test:', error);
        alert('Failed to delete test: ' + (error.response?.data?.message || error.message));
      } finally {
        setDeletingTestId(null);
      }
    }
  };

  const addQuestion = async (testId, questionData) => {
    try {
      const response = await axios.post(api.test.addQuestion, {
        testId: testId,
        question: questionData.question,
        options: questionData.options,
        correctAnswer: questionData.correctAnswer,
        marks: questionData.marks
      });
      
      if (response.data.success) {
        await fetchAllTests();
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to add question');
      }
    } catch (error) {
      console.error('Error adding question:', error);
      throw error;
    }
  };

  const updateQuestion = async (testId, questionId, questionData) => {
    try {
      const response = await axios.post(api.test.editQuestion, {
        testId: testId,
        questionId: questionId,
        question: questionData.question,
        options: questionData.options,
        correctAnswer: questionData.correctAnswer,
        marks: questionData.marks
      });
      
      if (response.data.success) {
        await fetchAllTests(); 
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to update question');
      }
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  };

  const deleteQuestion = async (testId, questionId) => {
    try {
      const response = await axios.post(api.test.deleteQuestion, {
        testId: testId, 
        questionId: questionId 
      });
      
      if (response.data.success) {
        await fetchAllTests(); 
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to delete question');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  };

  const updatePublishStatus = async (testId, isPublished) => {
    setPublishingTestId(testId);
    try {
      const response = await axios.post(api.test.isPublished, {
        testId: testId,
        isPublished: isPublished
      });
      
      if (response.data.success) {
        await fetchAllTests();
        alert(`Test ${isPublished ? 'published' : 'unpublished'} successfully!`);
      } else {
        alert(response.data.message || 'Failed to update test status');
      }
    } catch (error) {
      console.error('Error updating publish status:', error);
      alert('Failed to update test status: ' + (error.response?.data?.message || error.message));
    } finally {
      setPublishingTestId(null);
    }
  };

  const openQuestionModal = (test = null, question = null) => {
    if (question && test) {
      setQuestionForm({
        question: question.question,
        options: [...(question.options || [])],
        correctAnswer: question.correctAnswer,
        marks: question.marks || 1
      });
      setEditingQuestion({ testId: test._id, questionId: question._id });
    } else if (test) {
      setQuestionForm({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        marks: 1
      });
      setEditingQuestion({ testId: test._id, questionId: null });
    }
    setIsQuestionModalOpen(true);
  };

  const saveQuestion = async () => {
    if (!questionForm.question.trim()) {
      alert('Please enter a question');
      return;
    }
    if (questionForm.options.some(opt => !opt.trim())) {
      alert('Please fill all options');
      return;
    }
    if (!questionForm.correctAnswer) {
      alert('Please select the correct answer');
      return;
    }

    const questionData = {
      question: questionForm.question,
      options: questionForm.options,
      correctAnswer: questionForm.correctAnswer,
      marks: questionForm.marks
    };

    setIsSaving(true);
    try {
      if (editingQuestion?.questionId) {
        await updateQuestion(editingQuestion.testId, editingQuestion.questionId, questionData);
        alert('Question updated successfully!');
      } else if (editingQuestion?.testId) {
        await addQuestion(editingQuestion.testId, questionData);
        alert('Question added successfully!');
      }
      
      setIsQuestionModalOpen(false);
      setEditingQuestion(null);
      setQuestionForm({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        marks: 1
      });
    } catch (error) {
      alert(error.message || 'Failed to save question');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuestion = async (testId, questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestion(testId, questionId);
        alert('Question deleted successfully!');
      } catch (error) {
        alert(error.message || 'Failed to delete question');
      }
    }
  };

  const toggleTest = (testId) => {
    setExpandedTest(expandedTest === testId ? null : testId);
  };

  if (isLoading && allTests.length === 0) {
    return <Loader message="Loading tests..." />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200/80 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Test Creator & Management</h1>
            <p className="text-xs text-gray-500 mt-1">Create, manage, and publish online scholarship tests.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-4 p-3 sm:p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2 animate-fade-in text-sm sm:text-base">
            <CheckCircle size={18} className="sm:w-5 sm:h-5" />
            <span className="font-medium">Test created successfully!</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Create New Test Section */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Create New Test</h2>
              </div>
              
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Test Title *</label>
                  <input
                    type="text"
                    value={newTest.title}
                    onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                    placeholder="e.g., JavaScript Fundamentals Quiz"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class Name</label>
                  <input
                    type="text"
                    value={newTest.className}
                    onChange={(e) => setNewTest({ ...newTest, className: e.target.value })}
                    placeholder="e.g., Mathematics 101, Grade 10 Science"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-1">
                        <Percent size={14} />
                        Passing Percentage
                      </div>
                    </label>
                    <input
                      type="number"
                      value={newTest.passingPercentage}
                      onChange={(e) => setNewTest({ ...newTest, passingPercentage: Number(e.target.value) })}
                      min="0"
                      max="100"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        Duration (minutes)
                      </div>
                    </label>
                    <input
                      type="number"
                      value={newTest.duration}
                      onChange={(e) => setNewTest({ ...newTest, duration: Number(e.target.value) })}
                      min="1"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Radio Buttons for Publish Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Publish Status</label>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="publishStatus"
                        value="draft"
                        checked={newTest.isPublished === 'draft'}
                        onChange={(e) => setNewTest({ ...newTest, isPublished: e.target.value })}
                        className="w-4 h-4 text-gray-600 focus:ring-gray-500"
                      />
                      <span className="text-sm text-gray-700">Save as Draft</span>
                      <span className="text-xs text-gray-400 ml-1 hidden sm:inline">(Not visible to users)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="publishStatus"
                        value="published"
                        checked={newTest.isPublished === 'published'}
                        onChange={(e) => setNewTest({ ...newTest, isPublished: e.target.value })}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">Publish Immediately</span>
                      <span className="text-xs text-green-600 ml-1 hidden sm:inline">(Visible to users)</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={createTest}
                  disabled={isSaving || !newTest.title.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm sm:text-base"
                >
                  {isSaving ? <LoaderIcon className="animate-spin" size={18} /> : <Save size={18} />}
                  Create Test
                </button>
              </div>
            </div>
          </div>

          {/* All Tests Section */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">All Tests</h2>
                </div>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                  {allTests.length} {allTests.length === 1 ? 'Test' : 'Tests'}
                </span>
              </div>
              
              {allTests.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full mb-4">
                    <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm sm:text-base">No tests created yet</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">Create your first test using the form</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                  {allTests.map((test) => (
                    <div key={test._id} className="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-200 transition-all">
                      {/* Test Header */}
                      <div className="bg-white">
                        <div 
                          className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition gap-2 sm:gap-0"
                          onClick={() => toggleTest(test._id)}
                        >
                          <div className="flex-1 w-full sm:w-auto">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{test.title}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                test.isPublished 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {test.isPublished ? 'Published' : 'Draft'}
                              </span>
                              {test.className && (
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                  {test.className}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {test.duration || 60} min
                              </span>
                              <span className="flex items-center gap-1">
                                <Percent size={12} />
                                {test.passingPercentage || 70}% to pass
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 sm:px-2.5 py-1 rounded-full font-medium">
                              {test.questions?.length || 0} Qs
                            </span>
                            
                            {/* Edit Test Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditTestModal(test);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit Test"
                            >
                              <Edit size={16} className="sm:w-[18px] sm:h-[18px]" />
                            </button>
                            
                            {/* Publish Toggle Buttons */}
                            <div className="flex items-center gap-1 border-l border-gray-200 pl-1 sm:pl-2 ml-0 sm:ml-1">
                              {publishingTestId === test._id ? (
                                <LoaderIcon className="animate-spin h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                              ) : (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!test.isPublished) {
                                        updatePublishStatus(test._id, true);
                                      }
                                    }}
                                    className={`px-1.5 sm:px-2 py-1 text-xs rounded-lg transition ${
                                      test.isPublished
                                        ? 'bg-green-100 text-green-700 cursor-default'
                                        : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700'
                                    }`}
                                    disabled={test.isPublished}
                                  >
                                    Publish
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (test.isPublished) {
                                        updatePublishStatus(test._id, false);
                                      }
                                    }}
                                    className={`px-1.5 sm:px-2 py-1 text-xs rounded-lg transition ${
                                      !test.isPublished
                                        ? 'bg-yellow-100 text-yellow-700 cursor-default'
                                        : 'bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-700'
                                    }`}
                                    disabled={!test.isPublished}
                                  >
                                    Draft
                                  </button>
                                </>
                              )}
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openQuestionModal(test, null);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Add Question"
                            >
                              <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTest(test._id, test.title);
                              }}
                              disabled={deletingTestId === test._id}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete Test"
                            >
                              {deletingTestId === test._id ? (
                                <LoaderIcon className="animate-spin" size={16} />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                            
                            {expandedTest === test._id ? (
                              <ChevronUp size={16} className="text-gray-500" />
                            ) : (
                              <ChevronDown size={16} className="text-gray-500" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Questions Section */}
                      {expandedTest === test._id && (
                        <div className="border-t border-gray-100 bg-gray-50 p-3 sm:p-4">
                          {!test.questions || test.questions.length === 0 ? (
                            <div className="text-center py-6 sm:py-8">
                              <p className="text-sm text-gray-400">No questions added yet</p>
                              <button
                                onClick={() => openQuestionModal(test, null)}
                                className="mt-2 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
                              >
                                + Add your first question
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {test.questions.map((q, idx) => (
                                <div key={q._id || idx} className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white hover:shadow-md transition">
                                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0">
                                    <div className="flex-1 w-full sm:w-auto">
                                      <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                          Q{idx + 1}
                                        </span>
                                        <span className="text-xs text-gray-500">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                                      </div>
                                      <p className="text-sm text-gray-800 font-medium mb-3 break-words">{q.question}</p>
                                      <div className="flex flex-wrap gap-1 sm:gap-2">
                                        {q.options?.map((opt, optIdx) => (
                                          <span
                                            key={optIdx}
                                            className={`text-xs px-2 sm:px-3 py-1 rounded-full transition ${
                                              opt === q.correctAnswer
                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                : 'bg-gray-100 text-gray-600'
                                            }`}
                                          >
                                            {opt.length > 30 ? opt.substring(0, 30) + '...' : opt}
                                            {opt === q.correctAnswer && ' ✓'}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="flex gap-1 ml-0 sm:ml-3 mt-2 sm:mt-0">
                                      <button
                                        onClick={() => openQuestionModal(test, q)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        title="Edit"
                                      >
                                        <Edit size={14} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteQuestion(test._id, q._id)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="Delete"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Test Modal */}
        {isEditTestModalOpen && editingTest && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-[95%] sm:w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 sm:p-6 border-b">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Edit Test</h2>
                <button 
                  onClick={() => setIsEditTestModalOpen(false)} 
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Test Title *</label>
                  <input
                    type="text"
                    value={editTestForm.title}
                    onChange={(e) => setEditTestForm({ ...editTestForm, title: e.target.value })}
                    placeholder="Enter test title"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class Name</label>
                  <input
                    type="text"
                    value={editTestForm.className}
                    onChange={(e) => setEditTestForm({ ...editTestForm, className: e.target.value })}
                    placeholder="e.g., Mathematics 101, Grade 10 Science"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-1">
                        <Percent size={14} />
                        Passing Percentage
                      </div>
                    </label>
                    <input
                      type="number"
                      value={editTestForm.passingPercentage}
                      onChange={(e) => setEditTestForm({ ...editTestForm, passingPercentage: Number(e.target.value) })}
                      min="0"
                      max="100"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        Duration (minutes)
                      </div>
                    </label>
                    <input
                      type="number"
                      value={editTestForm.duration}
                      onChange={(e) => setEditTestForm({ ...editTestForm, duration: Number(e.target.value) })}
                      min="1"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Publish Status</label>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="editPublishStatus"
                        checked={!editTestForm.isPublished}
                        onChange={() => setEditTestForm({ ...editTestForm, isPublished: false })}
                        className="w-4 h-4 text-gray-600 focus:ring-gray-500"
                      />
                      <span className="text-sm text-gray-700">Draft</span>
                      <span className="text-xs text-gray-400 ml-1 hidden sm:inline">(Not visible to users)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="editPublishStatus"
                        checked={editTestForm.isPublished}
                        onChange={() => setEditTestForm({ ...editTestForm, isPublished: true })}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">Published</span>
                      <span className="text-xs text-green-600 ml-1 hidden sm:inline">(Visible to users)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t rounded-b-2xl">
                <button
                  onClick={() => setIsEditTestModalOpen(false)}
                  className="px-4 sm:px-5 py-2 text-sm sm:text-base text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={updateTest}
                  disabled={isSaving}
                  className="px-4 sm:px-5 py-2 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 shadow-md order-1 sm:order-2"
                >
                  {isSaving && <Loader className="animate-spin inline-block mr-2" size={16} />}
                  Update Test
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Question Modal - Responsive */}
        {isQuestionModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-[95%] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 sm:p-6 border-b">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {editingQuestion?.questionId ? 'Edit Question' : 'Add New Question'}
                </h2>
                <button 
                  onClick={() => setIsQuestionModalOpen(false)} 
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                {/* Question */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question *</label>
                  <textarea
                    value={questionForm.question}
                    onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                    rows="3"
                    placeholder="Enter your question..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options *</label>
                  <div className="space-y-2">
                    {questionForm.options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-6 sm:w-8 text-xs sm:text-sm font-medium text-gray-500">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOptions = [...questionForm.options];
                            newOptions[idx] = e.target.value;
                            setQuestionForm({ ...questionForm, options: newOptions });
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                          className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        {questionForm.options.length > 2 && (
                          <button
                            onClick={() => {
                              const newOptions = questionForm.options.filter((_, i) => i !== idx);
                              setQuestionForm({ ...questionForm, options: newOptions });
                            }}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {questionForm.options.length < 6 && (
                    <button
                      onClick={() => setQuestionForm({
                        ...questionForm,
                        options: [...questionForm.options, '']
                      })}
                      className="mt-2 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Add Option
                    </button>
                  )}
                </div>

                {/* Correct Answer & Marks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer *</label>
                    <select
                      value={questionForm.correctAnswer}
                      onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select correct answer</option>
                      {questionForm.options.map((opt, idx) => (
                        opt && <option key={idx} value={opt}>Option {String.fromCharCode(65 + idx)} - {opt.length > 50 ? opt.substring(0, 50) + '...' : opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marks *</label>
                    <input
                      type="number"
                      value={questionForm.marks}
                      onChange={(e) => setQuestionForm({ ...questionForm, marks: Number(e.target.value) })}
                      min="1"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t rounded-b-2xl">
                <button
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 sm:px-5 py-2 text-sm sm:text-base text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={saveQuestion}
                  disabled={isSaving}
                  className="px-4 sm:px-5 py-2 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 shadow-md order-1 sm:order-2"
                >
                  {isSaving && <Loader className="animate-spin inline-block mr-2" size={16} />}
                  Save Question
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        
        @media (min-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        /* Mobile optimizations */
        @media (max-width: 640px) {
          input, select, textarea, button {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminTestCreator;