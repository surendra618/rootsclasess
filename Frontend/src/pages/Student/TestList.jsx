import axios from 'axios';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/endpoints';
import useStudentStore from '../../Store/studentstore';
import { toast } from 'react-toastify';
import { Clock, X, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

const StudentTestPanel = ({ isEmbedded = false, initialFilter = null }) => {
  const { student } = useStudentStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Main state
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState(null);
  const [studentClass, setStudentClass] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeFilter, setActiveFilter] = useState(
    location.state?.filter || initialFilter || (isEmbedded ? 'completed' : 'all')
  ); // 'all', 'completed', 'pending'

  useEffect(() => {
    if (location.state?.filter) {
      setActiveFilter(location.state.filter);
    } else if (initialFilter) {
      setActiveFilter(initialFilter);
    }
  }, [location, initialFilter]);

  // Test taking state
  const [selectedTest, setSelectedTest] = useState(null);
  const [testStarted, setTestStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [testCompleted, setTestCompleted] = useState(false);
  const [scoreDetails, setScoreDetails] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingAttemptId, setExistingAttemptId] = useState(null);

  // Exit blocking after 10 minutes (server time based)
  const [testStartTime, setTestStartTime] = useState(null);
  const [isExitBlocked, setIsExitBlocked] = useState(false);

  // Result modal
  const [showResultModal, setShowResultModal] = useState(false);
  const [viewingResult, setViewingResult] = useState(null);
  
  // Sync interval reference
  const syncIntervalRef = useRef(null);
  // Timer reference for exit blocking after 10 minutes
  const exitBlockTimerRef = useRef(null);

  // Helper: extract numeric class from string like "12th" -> 12
  const extractClassNumber = (className) => {
    if (!className) return null;
    const match = String(className).match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  };

  // ----- 1. Get student ID and class from store / localStorage -----
  useEffect(() => {
    let id = null;
    let cls = null;
    if (student) {
      id = student._id || student.id;
      cls = student.currentClass || student.className || student.class;
    } else {
      try {
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (token && userStr) {
          const user = JSON.parse(userStr);
          id = user._id || user.id || user.userId || user.studentId;
          cls = user.currentClass || user.className || user.class;
        }
      } catch (error) {
        // ignore
      }
    }
    setStudentId(id);
    setStudentClass(cls);
    setIsLoggedIn(!!id);
  }, [student]);

  const fetchFullProfile = async () => {
    if (isLoggedIn && studentId && !studentClass) {
      try {
        const res = await axios.post(api.student.getStudent, {
          studentId: studentId,
        });
        if (res.data?.success) {
          const profile = res.data.user || res.data.data;
          if (profile) {
            const cls = profile.currentClass || profile.className || profile.class;
            if (cls) {
              setStudentClass(cls);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching full profile:', error);
      }
    }
  };
  useEffect(() => {
    fetchFullProfile();
  }, [isLoggedIn, studentId, studentClass]);

  const fetchCompletedTests = async () => {
    if (!studentId) return [];
    try {
      const res = await axios.post(api.result.getStudentResults, { studentId });
      if (res.data?.success && res.data.data) {
        return res.data.data.filter(result => result.isCompleted).map(result => ({
          testId: result.testId?._id || result.testId,
          testTitle: result.testId?.title || 'Unknown Test',
          score: result.obtainedMarks,
          totalMarks: result.totalMarks,
          percentage: result.percentage,
          completedAt: result.createdAt,
          isEligible: result.isEligible,
          obtainedMarks: result.obtainedMarks,
        }));
      }
    } catch (error) {
      console.error('Error fetching completed tests:', error);
    }
    return [];
  };

  const checkAttemptStatus = async (testId) => {
    if (!studentId) return false;
    try {
      const res = await axios.post(api.result.attemptTest, { studentId, testId });
      if (res.data?.success) {
        return res.data.data?.attempted === true || res.data.data?.alreadyAttempted === true;
      }
      return false;
    } catch (error) {
      if (error.response?.data?.message?.includes('already')) return true;
      return false;
    }
  };

  // ----- Public Tests for Guests / Non-logged in users -----
  const fetchPublicTests = async () => {
    setLoading(true);
    try {
      const res = await axios.post(api.test.publishTest);
      if (res.data?.success) {
        const rawTests = res.data.data || res.data.tests || [];
        const formattedTests = rawTests.map((test) => {
          const questionCount = test.questions?.length || test.totalQuestions || 0;
          const totalMarks = test.totalMarks ?? (questionCount * 1);

          return {
            id: test._id || test.id,
            title: test.title || 'Untitled Test',
            duration: test.duration || 30,
            totalQuestions: questionCount,
            totalMarks: totalMarks,
            description: test.description || `Test your knowledge with this comprehensive mock test.`,
            difficulty: test.difficulty || 'Medium',
            category: test.category || 'General',
            className: test.className,
            isCompleted: false,
            completedResult: null,
            originalData: test,
          };
        });

        setTests(formattedTests);
      } else {
        setTests([]);
      }
    } catch (error) {
      console.error('Error fetching public tests:', error);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  // ----- 5. Main function: fetch tests for this student (only his class) -----
  const getTestsForStudent = async () => {
    if (!isLoggedIn || !studentId) {
      fetchPublicTests();
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        api.student.getTestforStudent,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        let rawTests = res.data.tests || res.data.data || [];

        if (studentClass && rawTests.length > 0) {
          const studentNum = extractClassNumber(studentClass);
          const filtered = rawTests.filter(test => {
            const testNum = extractClassNumber(test.className);
            return studentNum && testNum && studentNum === testNum;
          });
          if (filtered.length > 0) {
            rawTests = filtered;
          }
        }

        const completedTests = await fetchCompletedTests();
        const completedIds = new Set(completedTests.map(t => t.testId));

        const formattedTests = await Promise.all(
          rawTests.map(async (test) => {
            const questionCount = test.questions?.length || test.questionCount || test.totalQuestions || 0;
            const totalMarks = test.totalMarks ?? (questionCount * 1);

            let isCompleted = completedIds.has(test._id);
            let completedResult = completedTests.find(t => t.testId === test._id);

            return {
              id: test._id,
              title: test.title || 'Untitled Test',
              duration: test.duration || 30,
              totalQuestions: questionCount,
              totalMarks: totalMarks,
              description: test.description || `Test your knowledge`,
              difficulty: test.difficulty || 'Medium',
              category: test.category || 'General',
              className: test.className,
              isCompleted,
              completedResult,
              originalData: test,
            };
          })
        );

        setTests(formattedTests);
      } else {
        setTests([]);
      }
    } catch (error) {
      console.error('Error fetching student tests:', error);
      // Fallback to public tests if error
      fetchPublicTests();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && studentId) {
      getTestsForStudent();
    } else {
      fetchPublicTests();
    }
  }, [studentId, studentClass, isLoggedIn]);

  // ----- 6. Fetch questions for a test -----
  const fetchTestQuestions = async (testId) => {
    try {
      const res = await axios.post(api.test.getQuestion, { testId });
      if (res.data?.success && res.data.data) {
        let questionsData = [];
        if (Array.isArray(res.data.data)) {
          questionsData = res.data.data;
        } else if (res.data.data.questions && Array.isArray(res.data.data.questions)) {
          questionsData = res.data.data.questions;
        } else if (res.data.data.question) {
          questionsData = [res.data.data];
        }
        return questionsData.map((q) => ({
          _id: q._id,
          id: q._id,
          text: q.question || q.questionText || q.text || 'Question not available',
          options: q.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          marks: q.marks || 1,
          correctAnswer: q.correctAnswer !== undefined ? parseInt(q.correctAnswer) : 0,
        }));
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
    return [];
  };

  // ----- 7. Start test API call (creates or retrieves an attempt) -----
  const callStartTestAPI = async (testId) => {
    try {
      const response = await axios.post(api.result.startTest, {
        studentId,
        testId,
      });
      if (response.data?.success) {
        return { 
          ...response.data.data, 
          isExitBlocked: response.data.isExitBlocked 
        };
      }
      throw new Error(response.data?.message || 'Failed to start test');
    } catch (error) {
      console.error('Start test API error:', error);
      throw error;
    }
  };

  // ----- Function to sync exit blocked status from server (called periodically) -----
  const syncExitBlockedStatus = useCallback(async () => {
    if (!selectedTest || !studentId || !testStarted || testCompleted) return;
    try {
      const response = await axios.post(api.result.startTest, {
        studentId,
        testId: selectedTest.id,
      });
      if (response.data?.success) {
        setIsExitBlocked(response.data.isExitBlocked);
        // Also update testStartTime if needed (in case of server mismatch)
        if (response.data.data?.testStartTime) {
          const serverStartTime = new Date(response.data.data.testStartTime);
          if (testStartTime && serverStartTime.getTime() !== testStartTime.getTime()) {
            setTestStartTime(serverStartTime);
          }
        }
      }
    } catch (error) {
      console.error('Error syncing exit blocked status:', error);
    }
  }, [selectedTest, studentId, testStarted, testCompleted, testStartTime]);

  // ----- 8. Submit test API call -----
  const submitTestAPI = async (testId, answersObj) => {
    if (!studentId) return { success: false, error: 'Student not found' };
    try {
      setSubmitting(true);
      const requestData = { studentId, testId, answers: answersObj };
      const res = await axios.post(api.result.submitTest, requestData);
      if (res.data?.success) {
        return { success: true, data: res.data.data };
      }
      return { success: false, error: res.data?.message || 'Submission failed' };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    } finally {
      setSubmitting(false);
    }
  };

  // ----- 9. Start test handler (with resume support & capture server start time) -----
  const handleStartTest = async (test) => {
    // If not logged in, show toast message
    if (!isLoggedIn || !studentId) {
      toast.warning("Please log in to attempt this test series");
      return;
    }

    if (!studentClass) {
      toast.info("Please update your class in your profile before starting this test");
      return;
    }

    if (test.isCompleted) {
      toast.warning("You have already taken this test!");
      return;
    }

    setSelectedTest(test);
    setLoading(true);

    try {
      const attempt = await callStartTestAPI(test.id);
      setExistingAttemptId(attempt._id);
      // Store the exact test start time from backend (server time)
      const serverStartTime = new Date(attempt.testStartTime);
      setTestStartTime(serverStartTime);
      setIsExitBlocked(attempt.isExitBlocked || false);

      const testQuestions = await fetchTestQuestions(test.id);
      setQuestions(testQuestions);

      if (attempt.answers && Array.isArray(attempt.answers) && attempt.answers.length > 0) {
        const savedAnswers = {};
        attempt.answers.forEach((ans) => {
          if (ans.selectedAnswer !== null && ans.selectedAnswer !== undefined) {
            savedAnswers[ans.questionId] = ans.selectedAnswer;
          }
        });
        setAnswers(savedAnswers);
      } else {
        const localSaved = localStorage.getItem(`test_answers_${studentId}_${test.id}`);
        if (localSaved) {
          try {
            setAnswers(JSON.parse(localSaved));
          } catch (e) {
            setAnswers({});
          }
        } else {
          setAnswers({});
        }
      }

      if (test.duration) {
        setTimeRemaining(test.duration * 60);
        setTimerActive(true);
      }

      setTestStarted(true);
      setCurrentQuestion(0);
      setTestCompleted(false);
      setScoreDetails(null);
    } catch (error) {
      console.error('Error starting test:', error);
      alert(error.message || 'Failed to start test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ----- 10. Local timer to block exit exactly after 10 minutes (without waiting for sync) -----
  useEffect(() => {
    if (testStarted && !testCompleted && testStartTime) {
      // Clear any existing timer
      if (exitBlockTimerRef.current) {
        clearTimeout(exitBlockTimerRef.current);
      }

      const now = new Date();
      const start = new Date(testStartTime);
      const elapsedMs = now - start;
      const tenMinutesMs = 10 * 60 * 1000;

      if (elapsedMs >= tenMinutesMs) {
        // Already past 10 minutes -> block immediately
        setIsExitBlocked(true);
      } else {
        // Schedule blocking at the exact 10-minute mark
        const remainingMs = tenMinutesMs - elapsedMs;
        exitBlockTimerRef.current = setTimeout(() => {
          setIsExitBlocked(true);
        }, remainingMs);
      }

      // Cleanup when test ends or component unmounts
      return () => {
        if (exitBlockTimerRef.current) {
          clearTimeout(exitBlockTimerRef.current);
          exitBlockTimerRef.current = null;
        }
      };
    }
  }, [testStarted, testCompleted, testStartTime]);

  // ----- 11. Periodic sync with server to update exit blocked status (every 30 seconds) -----
  useEffect(() => {
    if (testStarted && !testCompleted && selectedTest) {
      syncExitBlockedStatus(); // initial sync
      syncIntervalRef.current = setInterval(syncExitBlockedStatus, 30000); // every 30 sec
    } else {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    }
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [testStarted, testCompleted, selectedTest, syncExitBlockedStatus]);

  // ----- 12. Browser Exit Restrictions (based on server isExitBlocked flag) -----
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isExitBlocked && !testCompleted) {
        e.preventDefault();
        e.returnValue = 'You cannot leave the test after 10 minutes. Please submit it.';
      }
    };

    const handlePopState = (e) => {
      if (isExitBlocked && !testCompleted) {
        window.history.pushState(null, '', window.location.href);
        alert("You cannot exit the test after 10 minutes of starting the test.");
      }
    };

    if (testStarted && !testCompleted && isExitBlocked) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [testStarted, isExitBlocked, testCompleted]);

  // ----- 13. Timer countdown (does NOT auto‑submit) -----
  useEffect(() => {
    let interval;
    if (timerActive && timeRemaining > 0 && !testCompleted && !submitting) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setTimerActive(false);
            alert("⏰ Time is up! Please click 'Submit Test' now to save your results.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining, testCompleted, submitting]);

  const handleSubmitManually = async () => {
    if (submitting || testCompleted) return;

    const formattedAnswers = {};
    questions.forEach((q) => {
      const ans = answers[q.id];
      if (ans !== undefined && ans !== null) {
        formattedAnswers[q.id] = Number(ans);
      }
    });

    const totalQuestions = questions.length;
    const answeredCount = Object.keys(formattedAnswers).length;
    const skippedCount = totalQuestions - answeredCount;

    let confirmMsg = '';
    if (answeredCount === 0) {
      confirmMsg = `⚠️ You haven't answered any questions. Are you sure you want to submit this test?`;
    } else if (skippedCount > 0) {
      confirmMsg = `You have answered ${answeredCount} of ${totalQuestions} questions (${skippedCount} skipped).\n\nAre you sure you want to submit your test now?`;
    } else {
      confirmMsg = `You have answered all ${totalQuestions} questions!\n\nAre you sure you want to submit your test now?`;
    }

    if (!window.confirm(confirmMsg)) {
      return;
    }

    const result = await submitTestAPI(selectedTest.id, formattedAnswers);
    if (result.success) {
      setTestCompleted(true);
      setTimerActive(false);
      setScoreDetails(result.data);
      localStorage.removeItem(`test_answers_${studentId}_${selectedTest.id}`);
      await getTestsForStudent();
    } else {
      alert(result.error || 'Failed to submit test');
    }
  };

  // ----- 14. Exit handler with block check -----
  const handleBackToTests = () => {
    if (testStarted && !testCompleted) {
      if (isExitBlocked) {
        alert("You cannot exit the test after 10 minutes of starting the test.");
        return;
      }
      if (!window.confirm('Are you sure you want to exit? Your progress will be saved and you can resume later.')) {
        return;
      }
    }
    // Cleanup
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
    if (exitBlockTimerRef.current) {
      clearTimeout(exitBlockTimerRef.current);
      exitBlockTimerRef.current = null;
    }
    setTestStarted(false);
    setSelectedTest(null);
    setTestCompleted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setScoreDetails(null);
    setQuestions([]);
    setTimerActive(false);
    setTimeRemaining(null);
    setExistingAttemptId(null);
    setTestStartTime(null);
    setIsExitBlocked(false);
  };

  // Handle answer selection – NO AUTO-SUBMIT
  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev, [questionId]: answerIndex };
      if (selectedTest && studentId) {
        localStorage.setItem(`test_answers_${studentId}_${selectedTest.id}`, JSON.stringify(newAnswers));
      }
      return newAnswers;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmitManually();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  // ----- 15. View result modal -----
  const handleViewResult = (test) => {
    setViewingResult(test.completedResult);
    setShowResultModal(true);
  };

  // ----- 16. Helper functions for UI -----
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return 'bg-gray-100 text-gray-600';
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'hard':
        return 'bg-red-50 text-[#FB0500] border border-red-200';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getProgressPercentage = () => {
    const answeredCount = Object.keys(answers).length;
    return questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
  };

  // ----- 17. RENDER -----
  if (loading && !testStarted) {
    return (
      <div className="min-h-screen bg-dot-grid flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gray-200 border-t-[#0078FF] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading your tests...</p>
        </div>
      </div>
    );
  }

  // ----- TEST LIST VIEW (default) -----
  if (!testStarted && !testCompleted) {
    const totalDuration = tests.reduce((sum, t) => sum + (t.duration || 0), 0);
    const totalQuestions = tests.reduce((sum, t) => sum + (t.totalQuestions || 0), 0);
    const completedCount = tests.filter((t) => t.isCompleted).length;

    return (
      <div className={isEmbedded ? "bg-transparent p-0 font-poppins" : "bg-white min-h-screen font-poppins"}>
        {isEmbedded ? (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-200">
            <div>
              <span className="text-blue-700 text-[10px] font-black tracking-widest uppercase bg-blue-50 border border-blue-100 px-3 py-1 rounded-md inline-flex items-center gap-1.5">
                ASSESSMENT HUB
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-2 tracking-tight">
                Online <span className="text-blue-600">Mock Tests</span>
              </h2>
              {studentClass && (
                <p className="text-slate-500 text-xs font-bold mt-1">Showing assessments registered for Class {studentClass}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white px-4 py-2 rounded-md border border-slate-200 shadow-none flex items-center gap-2">
                <strong className="text-xl font-black text-emerald-600">{completedCount}</strong>
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Completed</span>
              </div>
              <div className="bg-white px-4 py-2 rounded-md border border-slate-200 shadow-none flex items-center gap-2">
                <strong className="text-xl font-black text-blue-600">{tests.length}</strong>
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Tests</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Hero section */}
            <div className="relative bg-white border-b border-gray-100 overflow-hidden">
              <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#0078FF]/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#FB0500]/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0078FF]"></span>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Assessment Hub</p>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">
                      Available <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FB0500] via-[#0078FF] to-[#28A745]">Tests</span>
                    </h1>
                    {studentClass && (
                      <p className="text-sm text-gray-500 mt-2">
                        Showing tests for <strong>{studentClass}</strong> class
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {!isLoggedIn ? (
                      <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-2">
                        <p className="text-yellow-700 text-xs font-semibold uppercase tracking-wider">Login to attempt</p>
                      </div>
                    ) : !studentClass ? (
                      <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-2">
                        <p className="text-orange-700 text-xs font-semibold uppercase tracking-wider">Complete your profile (Class missing)</p>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-2">
                        <span className="text-green-600 text-sm font-bold">✓</span>
                        <p className="text-green-700 text-xs font-semibold uppercase tracking-wider">Ready to Test</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats bar */}
            <div className="bg-white border-b border-gray-100 shadow-sm relative z-20">
              <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 divide-x-0 md:divide-x divide-gray-100">
                {[
                  { label: 'Total Tests', value: tests.length, color: '#FB0500' },
                  { label: 'Total Questions', value: totalQuestions, color: '#0078FF' },
                  { label: 'Total Duration', value: `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`, color: '#28A745' },
                  { label: 'Completed', value: completedCount, color: '#F1C40F' },
                ].map((s, i) => (
                  <div key={i} className="text-center py-2 px-4 transition-transform hover:scale-105">
                    <div className="text-2xl md:text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Test Grid */}
        <div className={isEmbedded ? "py-2 px-0" : "bg-line-grid py-12 px-4"}>
          <div className="w-full">
            {/* Filter Tabs Removed - All tests shown directly */}

            {(() => {
              // Dashboard (embedded) me sirf completed tests, website pe sab tests
              const displayedTests = isEmbedded
                ? tests.filter(test => test.isCompleted)
                : tests;

              if (displayedTests.length === 0) {
                return (
                  <div className="text-center py-12 bg-white rounded-lg border border-slate-200 max-w-md mx-auto p-8 shadow-none">
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-7 h-7 text-slate-400" />
                    </div>
                    <h3 className="text-base font-black text-slate-800 mb-1">
                      {activeFilter === 'completed' ? 'No Completed Tests Yet' : activeFilter === 'pending' ? 'All Tests Completed!' : 'No Tests Available'}
                    </h3>
                    <p className="text-slate-500 text-xs font-medium">
                      {activeFilter === 'completed' 
                        ? 'You haven\'t submitted any tests yet.' 
                        : 'Great job! You have completed all active tests available for your class.'}
                    </p>
                  </div>
                );
              }

              return (
                <div className={isEmbedded ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" : "grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto"}>
                  {displayedTests.map((test, i) => {
                    const accentRed = i % 2 === 0;
                    return (
                      <div
                        key={test.id}
                        className={`rounded-lg overflow-hidden border transition-all duration-200 flex flex-col justify-between bg-white border-slate-200 hover:border-slate-300 ${
                          isEmbedded ? 'shadow-none min-h-0' : 'min-h-[360px] shadow-xs hover:shadow-md'
                        } ${test.isCompleted ? 'border-emerald-200' : ''}`}
                      >
                      <div className="h-1.5 w-full bg-[#FB0500]"></div>
                      <div className={isEmbedded ? "p-4 sm:p-5 flex flex-col flex-1 justify-between" : "p-6 md:p-7 flex flex-col flex-1 justify-between"}>
                        <div>
                          <div className="flex items-start justify-between mb-3 flex-wrap gap-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${getDifficultyColor(test.difficulty)}`}>
                                {test.difficulty}
                              </span>
                              <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">
                                {test.category}
                              </span>
                            </div>
                            {test.isCompleted && (
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                                ✓ Completed
                              </span>
                            )}
                          </div>
                          <h3 className={isEmbedded ? "text-base font-black mb-1 leading-snug text-slate-900 line-clamp-2" : "text-xl md:text-2xl font-black mb-2 leading-tight text-slate-900"}>{test.title}</h3>
                          <p className={isEmbedded ? "text-xs font-medium mb-3 line-clamp-2 leading-relaxed text-slate-500" : "text-sm font-medium mb-6 line-clamp-3 leading-relaxed text-slate-600"}>{test.description}</p>
                        </div>

                        <div>
                          <div className={isEmbedded ? "grid grid-cols-2 gap-2 mb-3 pt-3 border-t border-slate-100 text-xs text-slate-600 font-bold" : "grid grid-cols-2 gap-3 mb-6 pt-4 border-t border-slate-100 text-sm text-slate-700 font-bold"}>
                            <div className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {test.duration} min
                            </div>
                            <div className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                              </svg>
                              {test.totalQuestions} Qs
                            </div>
                            <div className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                              {test.totalMarks} Marks
                            </div>
                            {test.isCompleted && test.completedResult && (
                              <div className="flex items-center gap-1 text-emerald-600 font-black col-span-2 mt-0.5 text-xs">
                                Score: {test.completedResult.percentage || 0}%
                              </div>
                            )}
                          </div>
                          {test.isCompleted ? (
                            <button
                              onClick={() => handleViewResult(test)}
                              className="w-full py-3 rounded-lg font-bold text-sm uppercase tracking-wider border-2 border-[#00B074] text-[#00B074] hover:bg-emerald-50 bg-white transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                            >
                              <span>VIEW RESULT</span>
                              <span>→</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartTest(test)}
                              className="w-full py-3 rounded-lg font-bold text-sm uppercase tracking-wider border-2 border-[#00B074] text-[#00B074] hover:bg-emerald-50 bg-white transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                            >
                              <span>START TEST</span>
                              <span>→</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

        {/* Result Modal */}
        {showResultModal && viewingResult && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-start justify-center pt-24 md:pt-28 pb-8 px-4 overflow-y-auto animate-fadeIn" onClick={() => setShowResultModal(false)}>
            <div className="bg-white rounded-md border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl animate-slideUp my-auto" onClick={(e) => e.stopPropagation()}>
              <div className="bg-slate-50 p-6 border-b border-slate-200">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md">
                      TEST RESULT
                    </span>
                    <h2 className="text-xl font-black text-slate-900 mt-2 tracking-tight">Test Completed</h2>
                    <p className="text-slate-500 text-xs font-medium mt-1 line-clamp-1">{viewingResult.testTitle}</p>
                  </div>
                  <button onClick={() => setShowResultModal(false)} className="p-1 text-slate-400 hover:text-slate-700 transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6 text-center">
                {/* Score badge circle */}
                {(() => {
                  const pct = viewingResult.percentage || viewingResult.score || 0;
                  const isHigh = pct >= 70;
                  const isMid = pct >= 40 && pct < 70;
                  const badgeColor = isHigh
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                    : isMid
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-rose-500 text-rose-600 bg-rose-50';

                  return (
                    <div className={`w-28 h-28 rounded-full border-4 ${badgeColor} flex flex-col items-center justify-center mx-auto mb-4 shadow-sm`}>
                      <span className="text-3xl font-black leading-none">{pct}%</span>
                      <span className="text-[9px] font-black uppercase tracking-widest mt-1">Overall</span>
                    </div>
                  );
                })()}

                <p className="text-xs font-bold text-slate-500 mb-6">
                  {(viewingResult.percentage || 0) >= 70 ? '🎉 Excellent performance! You passed.' : 'Keep practicing to improve your score.'}
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3 mb-6 text-xs text-left">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Obtained Marks</span>
                    <span className="font-black text-slate-900 text-sm">{viewingResult.obtainedMarks || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Total Marks</span>
                    <span className="font-black text-slate-900 text-sm">{viewingResult.totalMarks || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Completed On</span>
                    <span className="font-black text-slate-900 text-xs">
                      {viewingResult.completedAt ? new Date(viewingResult.completedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                    </span>
                  </div>
                  {viewingResult.isEligible && (
                    <div className="pt-2 border-t border-slate-200 flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                      <span>✓</span>
                      <span>Eligible for certificate</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowResultModal(false)}
                  className="w-full py-3 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-widest rounded-md transition-all shadow-sm"
                >
                  Close Result
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----- TEST TAKING VIEW -----
  if (testStarted && !testCompleted) {
    if (loading) {
      return (
        <div className="min-h-screen bg-dot-grid flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-3 border-gray-200 border-t-[#0078FF] animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-gray-500">Loading test questions...</p>
          </div>
        </div>
      );
    }

    const currentQ = questions[currentQuestion];
    const isLastQuestion = currentQuestion === questions.length - 1;
    const hasAnswered = answers[currentQ?.id] !== undefined;
    const progress = getProgressPercentage();

    if (!currentQ || questions.length === 0) {
      return (
        <div className="min-h-screen bg-dot-grid flex items-center justify-center p-4">
          <div className="text-center max-w-sm bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[#FB0500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-700 font-semibold mb-1">No Questions Found</p>
            <p className="text-sm text-gray-400 mb-5">This test has no questions available.</p>
            <button onClick={handleBackToTests} className="px-5 py-2 bg-[#0078FF] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition">
              Back to Tests
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50/70 pb-12">
        {/* Sticky Top Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-xs">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5">
            <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-3 mb-3">
              <div className="min-w-0">
                <h1 className="font-bold text-gray-900 text-base sm:text-lg truncate">{selectedTest.title}</h1>
                <p className="text-xs text-gray-500 font-medium">
                  Question <span className="text-gray-900 font-bold">{currentQuestion + 1}</span> of {questions.length}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {timeRemaining !== null && (
                  <div
                    className={`px-3.5 py-1.5 rounded-md font-mono font-bold text-sm tabular-nums flex items-center gap-2 border ${
                      timeRemaining < 300
                        ? 'bg-red-50 text-[#FB0500] border-red-200 animate-pulse'
                        : 'bg-blue-50/80 text-[#0078FF] border-blue-200'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(timeRemaining)}</span>
                  </div>
                )}
                <button
                  onClick={handleBackToTests}
                  disabled={isExitBlocked}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md border transition-all flex items-center gap-1.5 ${
                    isExitBlocked
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-70'
                      : 'border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-100 bg-white'
                  }`}
                  title={isExitBlocked ? "You cannot exit the test after 10 minutes" : "Exit Test"}
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Exit</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1 border-t border-gray-100">
              <div>
                <div className="flex justify-between text-xs font-medium text-gray-500 mb-1.5">
                  <span>Navigation Progress</span>
                  <span className="font-bold text-gray-700">
                    {currentQuestion + 1} / {questions.length}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0078FF] rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium text-gray-500 mb-1.5">
                  <span>Answered</span>
                  <span className="font-bold text-gray-700">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#08B100] rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left Question Card */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-md border border-gray-200 p-6 sm:p-8 shadow-xs">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                  <span className="text-xs font-bold text-[#0078FF] bg-blue-50 border border-blue-200 px-3 py-1 rounded-md tracking-wider">
                    QUESTION {currentQuestion + 1}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1 rounded-md">
                    {currentQ.marks} mark{currentQ.marks > 1 ? 's' : ''}
                  </span>
                </div>
                
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 leading-relaxed">
                  {currentQ.text}
                </h2>

                {/* Options List */}
                <div className="space-y-3">
                  {currentQ.options.map((option, idx) => {
                    const isSelected = answers[currentQ.id] === idx;
                    const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
                    return (
                      <label
                        key={idx}
                        onClick={() => handleAnswerSelect(currentQ.id, idx)}
                        className={`flex items-center p-4 rounded-md cursor-pointer border transition-all duration-200 select-none ${
                          isSelected
                            ? 'border-[#0078FF] bg-blue-50/50 shadow-xs ring-1 ring-blue-500/20'
                            : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/80'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 w-full">
                          <div
                            className={`w-7 h-7 rounded-md font-bold text-xs flex items-center justify-center shrink-0 border transition-all ${
                              isSelected
                                ? 'bg-[#0078FF] text-white border-[#0078FF]'
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}
                          >
                            {optionLetters[idx] || idx + 1}
                          </div>
                          <span className={`text-sm sm:text-base font-medium flex-1 ${isSelected ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                            {option}
                          </span>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            isSelected ? 'border-[#0078FF] bg-[#0078FF]' : 'border-gray-300 bg-white'
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Question Actions Bottom */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-5 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestion === 0}
                      className={`px-4 py-2 rounded-md font-semibold text-sm border transition flex items-center gap-1.5 ${
                        currentQuestion === 0
                          ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    {hasAnswered && (
                      <button
                        onClick={() => {
                          const newAnswers = { ...answers };
                          delete newAnswers[currentQ.id];
                          setAnswers(newAnswers);
                        }}
                        className="text-xs font-semibold text-gray-500 hover:text-red-600 px-3 py-2 rounded-md hover:bg-red-50 transition"
                      >
                        Clear Choice
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!hasAnswered && !isLastQuestion && (
                      <button
                        onClick={handleNextQuestion}
                        className="px-4 py-2 rounded-md font-semibold text-sm border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 transition flex items-center gap-1.5"
                        title="Skip this question for now"
                      >
                        Skip Question
                        <ChevronRight className="w-4 h-4 text-amber-600" />
                      </button>
                    )}

                    <button
                      onClick={handleNextQuestion}
                      disabled={submitting}
                      className={`px-6 py-2.5 rounded-md font-bold text-sm border-2 transition-all flex items-center gap-2 ${
                        submitting
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : isLastQuestion
                          ? 'border-green-600 bg-green-600 text-white hover:bg-green-700 shadow-xs'
                          : 'border-[#FB0500] bg-[#FB0500] text-white hover:bg-red-700 shadow-xs'
                      }`}
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Submitting...
                        </span>
                      ) : isLastQuestion ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Submit Test
                        </>
                      ) : (
                        <>
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Question Palette Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-md border border-gray-200 p-5 shadow-xs sticky top-24">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Question Palette
                  </span>
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-sm">
                    {Object.keys(answers).length}/{questions.length}
                  </span>
                </div>

                {/* Question Grid */}
                <div className="grid grid-cols-5 gap-2 mb-6">
                  {questions.map((q, idx) => {
                    const isCurrent = currentQuestion === idx;
                    const isAnswered = answers[q.id] !== undefined;

                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentQuestion(idx)}
                        className={`h-10 rounded-md font-bold text-xs transition-all flex items-center justify-center ${
                          isCurrent
                            ? 'bg-[#0078FF] text-white shadow-xs ring-2 ring-blue-300 border-transparent'
                            : isAnswered
                            ? 'bg-[#08B100] text-white hover:opacity-90 border-transparent'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="space-y-2 text-xs text-gray-600 bg-gray-50/80 p-3 rounded-md border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded bg-[#08B100]"></div>
                      <span>Answered</span>
                    </div>
                    <span className="font-bold text-gray-800">{Object.keys(answers).length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded bg-[#0078FF]"></div>
                      <span>Current</span>
                    </div>
                    <span className="font-bold text-gray-800">1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded bg-gray-200 border border-gray-300"></div>
                      <span>Not Answered</span>
                    </div>
                    <span className="font-bold text-gray-800">{questions.length - Object.keys(answers).length}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ----- RESULTS VIEW (after completion) -----
  if (testCompleted) {
    const percentage = Math.round(scoreDetails?.percentage || 0);
    const obtainedMarks = scoreDetails?.obtainedMarks || 0;
    const totalPossibleMarks = scoreDetails?.totalMarks || questions.reduce((sum, q) => sum + q.marks, 0);
    const eligibilityStatus = scoreDetails?.isEligible;
    let resultLabel = '',
      resultAccent = '';
    if (percentage >= 80) {
      resultLabel = 'Excellent!';
      resultAccent = 'text-[#08B100]';
    } else if (percentage >= 60) {
      resultLabel = 'Good Job!';
      resultAccent = 'text-[#0078FF]';
    } else if (percentage >= 40) {
      resultLabel = 'Keep Practicing!';
      resultAccent = 'text-yellow-500';
    } else {
      resultLabel = 'Need Improvement';
      resultAccent = 'text-[#FB0500]';
    }

    return (
      <div className="min-h-screen bg-dot-grid flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-white px-8 py-7 text-center border-b border-gray-100">
            <div className="w-12 h-12 rounded-md bg-blue-50/80 border border-blue-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[#0078FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs font-bold text-[#0078FF] uppercase tracking-widest mb-1">Test Complete</p>
            <h2 className="text-xl font-bold text-gray-900">{selectedTest.title}</h2>
          </div>
          <div className="p-8 text-center">
            <div className={`text-6xl font-bold mb-1 ${resultAccent}`}>{percentage}%</div>
            <p className={`text-base font-semibold mb-6 ${resultAccent}`}>{resultLabel}</p>
            {eligibilityStatus !== undefined && (
              <div
                className={`mb-6 px-4 py-3 rounded-md text-sm font-medium ${
                  eligibilityStatus
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                }`}
              >
                {eligibilityStatus
                  ? '✓ You are eligible for certification.'
                  : 'Score 70%+ to become eligible for certification.'}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 mb-7">
              {[
                { label: 'Total Questions', value: questions.length, color: 'text-[#0078FF]' },
                { label: 'Attempted', value: Object.keys(answers).length, color: 'text-[#FB0500]' },
                { label: 'Score Obtained', value: obtainedMarks, color: 'text-[#08B100]' },
                { label: 'Total Marks', value: totalPossibleMarks, color: 'text-gray-700' },
              ].map((s, i) => (
                <div key={i} className="bg-gray-50/80 rounded-md p-4 border border-gray-200">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
            <button
              onClick={handleBackToTests}
              className="w-full py-3 bg-[#0078FF] text-white rounded-md font-bold text-sm hover:opacity-90 transition shadow-xs"
            >
              Take Another Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default StudentTestPanel;   