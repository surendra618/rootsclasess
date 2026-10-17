import axios from 'axios';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/endpoints';
import useStudentStore from '../../Store/studentstore';
import { toast } from 'react-toastify';
import { useTestStore } from '../../Store/testStore';
import { 
  Clock, X, ChevronLeft, ChevronRight, CheckCircle2, ClipboardList, Star, Trophy, 
  Landmark, Dna, Atom, Calendar, Layers, Bookmark, Flag, Filter, Info, Eye, Home, Lock 
} from 'lucide-react';

const StudentTestPanel = ({ isEmbedded = false, initialFilter = null, onSwitchTab = null, isScholarshipOnly = false, assignedTestId = null, autoStart = false }) => {
  const { student } = useStudentStore();
  const location = useLocation();
  const navigate = useNavigate();
  const setIsTestActive = useTestStore((state) => state.setIsTestActive);

  // Main state
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState(null);
  const [studentClass, setStudentClass] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeFilter, setActiveFilter] = useState(
    location.state?.filter || initialFilter || (isEmbedded ? 'completed' : 'all')
  ); // 'all', 'completed', 'pending'
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all'); // 'all', 'SSC', 'NEET', 'JEE Mains'
  const [activeYearFilter, setActiveYearFilter] = useState('all'); // 'all', '2020'..'2026'
  const [activePricingFilter, setActivePricingFilter] = useState('all'); // 'all', 'free', 'paid'
  const [purchasedTestIds, setPurchasedTestIds] = useState(new Set());
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [testToPurchase, setTestToPurchase] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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

  // Sync test active mode with store (hides navbar & footer in Layout)
  useEffect(() => {
    const active = Boolean(testStarted && !testCompleted);
    setIsTestActive(active);
    return () => {
      setIsTestActive(false);
    };
  }, [testStarted, testCompleted, setIsTestActive]);

  // Student email & test mode detection
  const [studentEmail, setStudentEmail] = useState('');
  const isTestAccount = studentEmail?.toLowerCase() === 'student@rootclasses.com' || studentEmail?.toLowerCase()?.includes('test');

  // Government CBT Examination states
  const [activeSectionName, setActiveSectionName] = useState('');
  const [paletteMode, setPaletteMode] = useState('section'); // 'section' (1-45 per section) or 'all' (1-135)
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [visitedQuestions, setVisitedQuestions] = useState(new Set([0]));
  const [showQuestionPaperModal, setShowQuestionPaperModal] = useState(false);

  // Result modal
  const [showResultModal, setShowResultModal] = useState(false);
  const [viewingResult, setViewingResult] = useState(null);

  // Sync interval reference
  const syncIntervalRef = useRef(null);
  // Timer reference for exit blocking after 10 minutes
  const exitBlockTimerRef = useRef(null);

  // Helper: metadata for subject icons and Government CBT colors
  const getSubjectMeta = (subjectName) => {
    const s = (subjectName || '').toLowerCase();
    if (s.includes('math') || s.includes('quant')) {
      return { 
        icon: '📐', 
        bg: 'bg-amber-50', 
        text: 'text-amber-800', 
        border: 'border-amber-300', 
        active: 'bg-amber-600 text-white border-amber-600', 
        badge: 'bg-amber-100 text-amber-800 border-amber-200' 
      };
    }
    if (s.includes('physic')) {
      return { 
        icon: '⚡', 
        bg: 'bg-blue-50', 
        text: 'text-blue-800', 
        border: 'border-blue-300', 
        active: 'bg-blue-600 text-white border-blue-600', 
        badge: 'bg-blue-100 text-blue-800 border-blue-200' 
      };
    }
    if (s.includes('chem')) {
      return { 
        icon: '🧪', 
        bg: 'bg-emerald-50', 
        text: 'text-emerald-800', 
        border: 'border-emerald-300', 
        active: 'bg-emerald-600 text-white border-emerald-600', 
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' 
      };
    }
    if (s.includes('botan') || s.includes('bio')) {
      return { 
        icon: '🌿', 
        bg: 'bg-green-50', 
        text: 'text-green-800', 
        border: 'border-green-300', 
        active: 'bg-green-600 text-white border-green-600', 
        badge: 'bg-green-100 text-green-800 border-green-200' 
      };
    }
    if (s.includes('zool')) {
      return { 
        icon: '🐾', 
        bg: 'bg-purple-50', 
        text: 'text-purple-800', 
        border: 'border-purple-300', 
        active: 'bg-purple-600 text-white border-purple-600', 
        badge: 'bg-purple-100 text-purple-800 border-purple-200' 
      };
    }
    if (s.includes('reason')) {
      return { 
        icon: '🧠', 
        bg: 'bg-indigo-50', 
        text: 'text-indigo-800', 
        border: 'border-indigo-300', 
        active: 'bg-indigo-600 text-white border-indigo-600', 
        badge: 'bg-indigo-100 text-indigo-800 border-indigo-200' 
      };
    }
    if (s.includes('english')) {
      return { 
        icon: '📖', 
        bg: 'bg-rose-50', 
        text: 'text-rose-800', 
        border: 'border-rose-300', 
        active: 'bg-rose-600 text-white border-rose-600', 
        badge: 'bg-rose-100 text-rose-800 border-rose-200' 
      };
    }
    if (s.includes('general') || s.includes('aware')) {
      return { 
        icon: '🌍', 
        bg: 'bg-sky-50', 
        text: 'text-sky-800', 
        border: 'border-sky-300', 
        active: 'bg-sky-600 text-white border-sky-600', 
        badge: 'bg-sky-100 text-sky-800 border-sky-200' 
      };
    }
    return { 
      icon: '📝', 
      bg: 'bg-slate-50', 
      text: 'text-slate-800', 
      border: 'border-slate-300', 
      active: 'bg-slate-800 text-white border-slate-800', 
      badge: 'bg-slate-100 text-slate-800 border-slate-200' 
    };
  };

  // Helper: subject breakdown for cards
  const getTestSubjectBreakdown = (test) => {
    if (test.originalData?.questions && Array.isArray(test.originalData.questions) && test.originalData.questions.length > 0) {
      const counts = {};
      test.originalData.questions.forEach(q => {
        const s = (q.subject || '').trim();
        if (s) {
          counts[s] = (counts[s] || 0) + 1;
        }
      });
      const entries = Object.entries(counts);
      if (entries.length > 0) {
        return entries.map(([name, count]) => ({ name, count }));
      }
    }
    const cat = (test.category || '').toLowerCase();
    const title = (test.title || '').toLowerCase();
    if (cat.includes('jee') || title.includes('jee')) {
      const per = Math.floor(test.totalQuestions / 3) || 45;
      return [
        { name: 'Mathematics', count: per },
        { name: 'Physics', count: per },
        { name: 'Chemistry', count: per }
      ];
    }
    if (cat.includes('neet') || title.includes('neet')) {
      const per = Math.floor(test.totalQuestions / 4) || 45;
      return [
        { name: 'Physics', count: per },
        { name: 'Chemistry', count: per },
        { name: 'Botany', count: per },
        { name: 'Zoology', count: per }
      ];
    }
    if (cat.includes('ssc') || title.includes('ssc')) {
      const per = Math.floor(test.totalQuestions / 4) || 25;
      return [
        { name: 'Reasoning', count: per },
        { name: 'Quantitative Aptitude', count: per },
        { name: 'English', count: per },
        { name: 'General Awareness', count: per }
      ];
    }
    return [];
  };

  // Helper: enhanced descriptive text for test cards
  const getEnhancedDescription = (test) => {
    if (test.description && test.description.length > 55 && !test.description.toLowerCase().includes('test your knowledge with this')) {
      return test.description;
    }
    const title = (test.title || '').toLowerCase();
    const cat = (test.category || '').toLowerCase();
    if (cat.includes('jee') || title.includes('jee')) {
      return "Full-length mock test strictly based on latest NTA JEE Main pattern with high-yield questions across Physics, Chemistry, and Mathematics to assess speed and accuracy.";
    }
    if (cat.includes('neet') || title.includes('neet')) {
      return "Official NTA NEET UG pattern mock exam featuring high-yield questions across Physics, Chemistry, Botany, and Zoology with negative marking scheme.";
    }
    if (cat.includes('ssc') || title.includes('ssc')) {
      return "Official TCS iON / SSC CGL & CHSL Tier-1 pattern mock test covering General Intelligence & Reasoning, Quantitative Aptitude, English, and General Awareness.";
    }
    if (cat.includes('defense') || cat.includes('nda') || title.includes('nda')) {
      return "Comprehensive defense examination mock test covering essential mathematical concepts, problem-solving techniques, and speed accuracy for NDA entrance.";
    }
    if (cat.includes('cbse') || cat.includes('board') || title.includes('board') || title.includes('10th')) {
      return "Structured CBSE Board exam pattern test designed to assess conceptual clarity, problem analysis, and theoretical mastery according to NCERT curriculum.";
    }
    if (title.includes('scholarship')) {
      return "Roots Classes 100% Scholarship Assessment Test to evaluate merit, conceptual depth, and analytical thinking with complete detailed performance analysis.";
    }
    return test.description || "Comprehensive mock test designed by Roots Classes expert faculty to enhance your speed, accuracy, and overall exam temperament.";
  };

  // Group questions by section / subject
  const sections = React.useMemo(() => {
    if (!questions || questions.length === 0) return [];

    const sectionMap = new Map();
    questions.forEach((q, idx) => {
      const subj = (q.subject || 'General').trim();
      if (!sectionMap.has(subj)) {
        sectionMap.set(subj, {
          name: subj,
          indices: [],
          totalQuestions: 0,
          startIndex: idx,
        });
      }
      const sec = sectionMap.get(subj);
      sec.indices.push(idx);
      sec.totalQuestions++;
    });
    return Array.from(sectionMap.values());
  }, [questions]);

  // Sync active section and visited questions when currentQuestion changes
  useEffect(() => {
    if (questions && questions[currentQuestion]) {
      setVisitedQuestions(prev => new Set(prev).add(currentQuestion));
      const curSubj = questions[currentQuestion].subject?.trim();
      if (curSubj) {
        setActiveSectionName(curSubj);
      } else if (sections.length > 0) {
        const found = sections.find(s => s.indices.includes(currentQuestion));
        if (found) setActiveSectionName(found.name);
      }
    }
  }, [currentQuestion, questions, sections]);

  // Filtered items for question palette
  const displayedIndices = React.useMemo(() => {
    if (!questions || questions.length === 0) return [];
    if (paletteMode === 'all') {
      return questions.map((_, i) => ({
        globalIndex: i,
        displayNum: i + 1,
        sectionName: questions[i]?.subject || 'General'
      }));
    }
    const curSubj = questions[currentQuestion]?.subject?.trim();
    const currentSec = sections.find(s => s.name === (curSubj || activeSectionName)) || sections[0];
    if (currentSec && currentSec.indices && currentSec.indices.length > 0) {
      return currentSec.indices.map((idx, relIdx) => ({
        globalIndex: idx,
        displayNum: relIdx + 1,
        sectionName: currentSec.name
      }));
    }
    return questions.map((_, i) => ({
      globalIndex: i,
      displayNum: i + 1,
      sectionName: 'General'
    }));
  }, [questions, paletteMode, sections, currentQuestion, activeSectionName]);

  // Helper: extract numeric class from string like "12th" -> 12
  const extractClassNumber = (className) => {
    if (!className) return null;
    const match = String(className).match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  };

  // Helper: flexible category matching for exams (e.g. JEE/JEE Mains, SSC, NEET, Defense, CBSE)
  const matchCategory = (testCat, filterKey) => {
    if (!filterKey || filterKey === 'all') return true;
    if (!testCat) return false;
    const tc = String(testCat).trim().toLowerCase();
    const fk = String(filterKey).trim().toLowerCase();
    if (tc === fk) return true;
    if (fk.includes('jee') && tc.includes('jee')) return true;
    if (fk.includes('ssc') && tc.includes('ssc')) return true;
    if ((fk.includes('defense') || fk.includes('nda')) && (tc.includes('defense') || tc.includes('nda'))) return true;
    if ((fk.includes('cbse') || fk.includes('board')) && (tc.includes('cbse') || tc.includes('board'))) return true;
    if (fk.includes('foundation') && tc.includes('foundation')) return true;
    return false;
  };

  const getCategorySubjects = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('neet')) {
      return [
        { name: 'Physics', color: 'bg-blue-50 text-blue-700 border-blue-200' },
        { name: 'Chemistry', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        { name: 'Biology (Botany + Zoology)', color: 'bg-purple-50 text-purple-700 border-purple-200' },
      ];
    }
    if (cat.includes('jee')) {
      return [
        { name: 'Mathematics', color: 'bg-amber-50 text-amber-700 border-amber-200' },
        { name: 'Physics', color: 'bg-blue-50 text-blue-700 border-blue-200' },
        { name: 'Chemistry', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      ];
    }
    if (cat.includes('ssc')) {
      return [
        { name: 'Reasoning', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        { name: 'Quant Math', color: 'bg-amber-50 text-amber-700 border-amber-200' },
        { name: 'English', color: 'bg-rose-50 text-rose-700 border-rose-200' },
        { name: 'General Awareness', color: 'bg-sky-50 text-sky-700 border-sky-200' },
      ];
    }
    return [];
  };

  // ----- 1. Get student ID and class from store / localStorage -----
  useEffect(() => {
    let id = null;
    let cls = null;
    let email = '';
    if (student) {
      id = student._id || student.id;
      cls = student.currentClass || student.className || student.class;
      email = student.email || '';
    } else {
      try {
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (token && userStr) {
          const user = JSON.parse(userStr);
          id = user._id || user.id || user.userId || user.studentId;
          cls = user.currentClass || user.className || user.class;
          email = user.email || '';
        }
      } catch (error) {
        // ignore
      }
    }
    setStudentId(id);
    setStudentClass(cls);
    setStudentEmail(email);
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

  // Helper to identify scholarship assessment tests
  const isScholarshipTest = (t) => {
    const title = (t.title || '').toLowerCase();
    const cat = (t.category || '').toLowerCase();
    return title.includes('scholarship') || cat.includes('scholarship');
  };

  // ----- Public Tests for Guests / Non-logged in users -----
  const fetchPublicTests = async () => {
    setLoading(true);
    try {
      const res = await axios.post(api.test.publishTest);
      if (res.data?.success) {
        let rawTests = res.data.data || res.data.tests || [];
        if (isScholarshipOnly) {
          rawTests = rawTests.filter(t => isScholarshipTest(t));
        } else {
          rawTests = rawTests.filter(t => !isScholarshipTest(t));
        }
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
            year: test.year || (test.createdAt ? new Date(test.createdAt).getFullYear().toString() : '2026'),
            className: test.className,
            isPaid: Boolean(test.isPaid && (Number(test.price) > 0)),
            price: Number(test.price) || 0,
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

        // Filter: Separate general Test Series from official Scholarship Tests
        if (isScholarshipOnly) {
          rawTests = rawTests.filter(t => isScholarshipTest(t) || (assignedTestId && String(t._id || t.id) === String(assignedTestId)));
        } else {
          rawTests = rawTests.filter(t => !isScholarshipTest(t));
        }

        // For test account (student@rootclasses.com), DO NOT filter by class so that ALL tests remain open and testable!
        if (!isTestAccount && studentClass && rawTests.length > 0) {
          const studentNum = extractClassNumber(studentClass);
          const filtered = rawTests.filter(test => {
            if (assignedTestId && String(test._id || test.id) === String(assignedTestId)) return true;
            if (!test.className || String(test.className).toLowerCase() === 'all') return true;
            // National competitive mock tests (JEE, NEET, SSC, Defense) are open for all
            const cat = String(test.category || '').toLowerCase();
            if (cat.includes('jee') || cat.includes('neet') || cat.includes('ssc') || cat.includes('defense') || cat.includes('nda')) return true;
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
              year: test.year || (test.createdAt ? new Date(test.createdAt).getFullYear().toString() : '2026'),
              className: test.className,
              isPaid: Boolean(test.isPaid && (Number(test.price) > 0)),
              price: Number(test.price) || 0,
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

  // Auto-start test if requested (e.g. from Scholarship Dashboard)
  const hasAutoStartedRef = useRef(false);
  useEffect(() => {
    if (autoStart && !hasAutoStartedRef.current && tests.length > 0 && !testStarted && !testCompleted && !loading) {
      const target = assignedTestId 
        ? (tests.find(t => String(t.id) === String(assignedTestId)) || tests[0])
        : tests[0];
      if (target) {
        hasAutoStartedRef.current = true;
        handleStartTest(target);
      }
    }
  }, [autoStart, tests, testStarted, testCompleted, loading, assignedTestId]);

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
          subject: q.subject || '',
          correctAnswer: q.correctAnswer !== undefined ? parseInt(q.correctAnswer) : 0,
        }));
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
    return [];
  };

  // ----- 7. Start test API call (creates or retrieves an attempt) -----
  const callStartTestAPI = async (testId, isRetake = false) => {
    try {
      const response = await axios.post(api.result.startTest, {
        studentId,
        testId,
        isRetake,
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

  // ----- Payment & Purchased Tests Logic -----
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const fetchPurchasedTests = useCallback(async () => {
    if (!studentId) return;
    try {
      const set = new Set();
      if (student?.purchasedTests && Array.isArray(student.purchasedTests)) {
        student.purchasedTests.forEach((t) => {
          const id = typeof t === 'string' ? t : (t?._id || t?.id);
          if (id) set.add(String(id));
        });
      }

      try {
        const res = await axios.post(api.student.getStudent, { studentId });
        const u = res.data?.user || res.data?.data;
        if (u?.purchasedTests && Array.isArray(u.purchasedTests)) {
          u.purchasedTests.forEach((t) => {
            const id = typeof t === 'string' ? t : (t?._id || t?.id);
            if (id) set.add(String(id));
          });
        }
      } catch (err) {
        // non-critical
      }

      try {
        const pRes = await axios.post(api.payment.getPurchasedTests, { studentId });
        if (pRes.data?.success) {
          if (Array.isArray(pRes.data.testIds)) {
            pRes.data.testIds.forEach(id => set.add(String(id)));
          } else if (Array.isArray(pRes.data.data)) {
            pRes.data.data.forEach(item => {
              const id = item.test?._id || item.test?.id || item.test;
              if (id) set.add(String(id));
            });
          }
        }
      } catch (err) {
        // non-critical
      }

      setPurchasedTestIds(set);
    } catch (error) {
      console.error('Error fetching purchased tests:', error);
    }
  }, [studentId, student]);

  useEffect(() => {
    if (studentId) {
      fetchPurchasedTests();
    }
  }, [studentId, fetchPurchasedTests]);

  const isTestPurchased = useCallback((test) => {
    if (!test || !test.isPaid || !test.price || Number(test.price) <= 0) return true;
    if (isTestAccount) return true;
    const testId = String(test.id || test._id || '');
    return purchasedTestIds.has(testId);
  }, [purchasedTestIds, isTestAccount]);

  const handleOpenPayment = (test) => {
    if (!isLoggedIn || !studentId) {
      toast.warning('Please log in to purchase this mock test series');
      navigate('/stdlogin');
      return;
    }
    setTestToPurchase(test);
    setShowPaymentModal(true);
  };

  const handleExecutePayment = async () => {
    if (!testToPurchase || !studentId) return;

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error('Payment gateway failed to load. Please check your internet connection.');
      return;
    }

    setIsProcessingPayment(true);
    try {
      const { data } = await axios.post(api.payment.createPayment, {
        testId: testToPurchase.id,
        studentId
      });

      if (!data.success) {
        if (data.alreadyPurchased) {
          toast.info('You have already purchased this mock test series!');
          setPurchasedTestIds(prev => new Set(prev).add(testToPurchase.id));
          setShowPaymentModal(false);
          return;
        }
        throw new Error(data.message || 'Failed to initialize payment');
      }

      const options = {
        key: data.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TbpL4le4mBM46T',
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'Roots Classes',
        description: `Enrollment: ${testToPurchase.title}`,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            toast.info('Verifying test series payment...');
            const verifyRes = await axios.post(api.payment.verifyPayment, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              enrollmentId: data.enrollmentId,
              isTest: true
            });

            if (verifyRes.data?.success) {
              setPurchasedTestIds(prev => new Set(prev).add(testToPurchase.id));
              setShowPaymentModal(false);
              toast.success('Payment successful! 🎉 Test series unlocked.');
            } else {
              toast.error(verifyRes.data?.message || 'Payment verification failed');
            }
          } catch (verErr) {
            console.error('Test payment verification error:', verErr);
            toast.error(verErr.response?.data?.message || 'Payment verification failed. Please contact support.');
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: student?.fullName || student?.name || '',
          email: student?.email || studentEmail || '',
          contact: student?.phone || ''
        },
        theme: {
          color: '#0078FF'
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
            toast.info('Payment window closed');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response) => {
        console.error('Razorpay test payment failed:', response);
        toast.error(response.error?.description || 'Payment failed. Please try again.');
        setIsProcessingPayment(false);
      });
      razorpay.open();

    } catch (error) {
      console.error('Error creating payment order:', error);
      toast.error(error.response?.data?.message || error.message || 'Payment initiation failed');
      setIsProcessingPayment(false);
    }
  };

  // ----- 9. Start test handler (with resume support & capture server start time) -----
  const handleStartTest = async (test, isRetake = false) => {
    // If not logged in, show toast message
    if (!isLoggedIn || !studentId) {
      toast.warning("Please log in to attempt this test series");
      return;
    }

    if (!studentClass && !isTestAccount) {
      toast.info("Please update your class in your profile before starting this test");
      return;
    }

    // Check if test is paid and not purchased yet
    if (!isTestPurchased(test)) {
      handleOpenPayment(test);
      return;
    }

    if (test.isCompleted && !isRetake) {
      isRetake = true;
    }

    setSelectedTest(test);
    setLoading(true);

    try {
      if (isRetake) {
        localStorage.removeItem(`test_answers_${studentId}_${test.id}`);
        setAnswers({});
      }

      const attempt = await callStartTestAPI(test.id, isRetake);
      setExistingAttemptId(attempt._id);
      // Store the exact test start time from backend (server time)
      const serverStartTime = new Date(attempt.testStartTime);
      setTestStartTime(serverStartTime);
      setIsExitBlocked(isTestAccount ? false : (attempt.isExitBlocked || false));

      const testQuestions = await fetchTestQuestions(test.id);
      setQuestions(testQuestions);

      if (!isRetake && attempt.answers && Array.isArray(attempt.answers) && attempt.answers.length > 0) {
        const savedAnswers = {};
        attempt.answers.forEach((ans) => {
          if (ans.selectedAnswer !== null && ans.selectedAnswer !== undefined) {
            savedAnswers[ans.questionId] = ans.selectedAnswer;
          }
        });
        setAnswers(savedAnswers);
      } else if (!isRetake) {
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
      } else {
        setAnswers({});
      }

      if (test.duration) {
        setTimeRemaining(test.duration * 60);
        setTimerActive(true);
      }

      setTestStarted(true);
      setCurrentQuestion(0);
      setTestCompleted(false);
      setScoreDetails(null);
      setMarkedForReview(new Set());
      setVisitedQuestions(new Set([0]));
      setPaletteMode('section');
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
      if (isExitBlocked && !testCompleted && !isTestAccount) {
        e.preventDefault();
        e.returnValue = 'You cannot leave the test after 10 minutes. Please submit it.';
      }
    };

    const handlePopState = (e) => {
      if (isExitBlocked && !testCompleted && !isTestAccount) {
        window.history.pushState(null, '', window.location.href);
        alert("You cannot exit the test after 10 minutes of starting the test.");
      }
    };

    if (testStarted && !testCompleted && isExitBlocked && !isTestAccount) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [testStarted, isExitBlocked, testCompleted, isTestAccount]);

  // Reset scroll to top when test starts, keep body scroll active so Navbar & Footer are visible
  useEffect(() => {
    if (testStarted && !testCompleted) {
      window.scrollTo(0, 0);
    }
  }, [testStarted, testCompleted]);

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

    // Section-wise breakdown in confirmation dialog
    let sectionBreakdownText = '';
    if (sections.length > 0) {
      sectionBreakdownText = '\n\nSection-wise Attempt Breakdown:\n' + sections.map(s => {
        const secAns = s.indices.filter(i => answers[questions[i]?.id] !== undefined).length;
        return `• ${s.name}: ${secAns} / ${s.totalQuestions} answered`;
      }).join('\n');
    }

    const confirmMsg = `📊 TEST SUBMISSION SUMMARY (CBT Examination):
Total Questions: ${totalQuestions}
Attempted: ${answeredCount}
Skipped / Unattempted: ${skippedCount}
Marked for Review: ${markedForReview.size}${sectionBreakdownText}

Are you sure you want to submit your test now?`;

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

  // Cleanup & reset test state
  const cleanupAndResetTest = () => {
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
    setMarkedForReview(new Set());
    setVisitedQuestions(new Set([0]));
    setActiveSectionName('');
    setPaletteMode('section');
    setIsTestActive(false);
  };

  // ----- 14. Exit handler with block check -----
  const handleBackToTests = () => {
    if (testStarted && !testCompleted) {
      if (isExitBlocked && !isTestAccount) {
        alert("You cannot exit the test after 10 minutes of starting the test.");
        return;
      }
      if (!window.confirm('Are you sure you want to exit? Your progress will be saved and you can resume later.')) {
        return;
      }
    }
    cleanupAndResetTest();
  };

  // ----- 14b. Back to Home handler (Immediate navigation on click) -----
  const handleBackToHome = () => {
    cleanupAndResetTest();
    navigate('/');
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
                {initialFilter === 'completed' || activeFilter === 'completed' ? (
                  <>Completed <span className="text-emerald-600">Test Series</span></>
                ) : (
                  <>Available <span className="text-blue-600">Test Series</span></>
                )}
              </h2>
              {studentClass && (
                <p className="text-slate-500 text-xs font-bold mt-1">Showing assessments registered for Class {studentClass}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {initialFilter === 'completed' || activeFilter === 'completed' ? (
                <div className="bg-white px-4 py-2 rounded-md border border-slate-200 shadow-none flex items-center gap-2">
                  <strong className="text-xl font-black text-emerald-600">{completedCount}</strong>
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Completed</span>
                </div>
              ) : (
                <div className="bg-white px-4 py-2 rounded-md border border-slate-200 shadow-none flex items-center gap-2">
                  <strong className="text-xl font-black text-blue-600">{tests.length}</strong>
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Tests</span>
                </div>
              )}
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
                    <div className="flex items-center gap-3 mb-3">
                      <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="text-xs font-bold text-slate-600 hover:text-blue-600 hover:underline transition-colors cursor-pointer"
                        title="Back to Home"
                      >
                        ← Back to Home
                      </button>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0078FF]"></span>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Assessment Hub</p>
                      </div>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">
                      Available <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FB0500] via-[#0078FF] to-[#28A745]">Tests</span>
                    </h1>
                    {isTestAccount ? (
                      <p className="text-sm text-emerald-600 font-bold mt-2 flex items-center gap-1.5">
                        <span>🧪</span>
                        <span>Logged in as <strong>{studentEmail}</strong> — All mock tests unlocked for unlimited testing!</span>
                      </p>
                    ) : studentClass && (
                      <p className="text-sm text-gray-500 mt-2">
                        Showing tests for <strong>{studentClass}</strong> class
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {isTestAccount ? (
                      <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <p className="text-emerald-700 text-xs font-black uppercase tracking-wider">
                          Test Mode Active • Unlimited Retakes
                        </p>
                      </div>
                    ) : !isLoggedIn ? (
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

            {/* Scholarship Separation Notice Banner */}
            {!isEmbedded && !isScholarshipOnly && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
                <div className="bg-gradient-to-r from-red-50 via-white to-blue-50 border border-red-200/90 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-[#FB0500] text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs">
                      🎓
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 tracking-tight">Looking for Roots 100% Scholarship Assessment Test?</h3>
                      <p className="text-xs text-slate-600 mt-0.5">Test Series is separate for exam preparation. The official Scholarship Test is accessible from your Student Dashboard once you submit your scholarship registration.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/scholarship')}
                    className="px-4 py-2.5 bg-[#FB0500] hover:bg-red-700 text-white text-xs font-bold rounded-md shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Apply for Scholarship</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Test Grid */}
        <div className={isEmbedded ? "py-2 px-0" : "bg-line-grid py-12 px-4"}>
          <div className="w-full">

            {/* Student Dashboard Tab Header (Only when inside Student Profile Dashboard) */}
            {isEmbedded && (
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="inline-flex items-center">
                  {initialFilter === 'completed' || activeFilter === 'completed' ? (
                    <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white shadow">
                      <CheckCircle2 size={16} />
                      <span>Completed Test Series</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/25 text-white min-w-[22px] text-center">
                        {completedCount}
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-600 text-white shadow">
                      <ClipboardList size={16} />
                      <span>Test Series</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/25 text-white min-w-[22px] text-center">
                        {tests.length}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-500 font-bold hidden sm:block">
                  {initialFilter === 'completed' || activeFilter === 'completed' ? (
                    <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
                      Showing Your {completedCount} Completed Assessment{completedCount !== 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="text-blue-700 bg-blue-50 px-3 py-1 rounded-md border border-blue-200">
                      Showing All {tests.length} Available Mock Test{tests.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Category Filter Buttons + Pricing Filter + Year Dropdown */}
            {!isEmbedded && (
              <div className="space-y-3 mb-8 max-w-6xl mx-auto">
                {/* Row 1: Free vs Paid Toggle + Year Filter */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Test Series Type:</span>
                    <div className="inline-flex rounded-md border border-slate-300 bg-white p-0.5 shadow-2xs">
                      {[
                        { key: 'all', label: `All Tests (${tests.length})` },
                        { key: 'free', label: `⚡ Free Mocks (${tests.filter(t => !t.isPaid || !t.price || t.price === 0).length})` },
                        { key: 'paid', label: `👑 Paid / Premium (${tests.filter(t => t.isPaid && t.price > 0).length})` },
                      ].map(item => (
                        <button
                          key={item.key}
                          onClick={() => setActivePricingFilter(item.key)}
                          className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                            activePricingFilter === item.key
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Year Dropdown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Year:
                    </span>
                    <select
                      value={activeYearFilter}
                      onChange={(e) => setActiveYearFilter(e.target.value)}
                      style={{
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#475569',
                        background: '#ffffff',
                        cursor: 'pointer',
                        outline: 'none',
                        boxShadow: 'none',
                      }}
                    >
                      <option value="all">All Years</option>
                      {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map(yr => (
                        <option key={yr} value={String(yr)}>{yr}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Category chips */}
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { key: 'all', label: 'All Exams', Icon: ClipboardList },
                    { key: 'SSC', label: 'SSC', Icon: Landmark },
                    { key: 'NEET', label: 'NEET', Icon: Dna },
                    { key: 'JEE Mains', label: 'JEE Mains', Icon: Atom },
                  ].map(({ key, label, Icon }) => {
                    const isActive = activeCategoryFilter === key;
                    const testCount = key === 'all'
                      ? tests.length
                      : tests.filter(t => matchCategory(t.category, key)).length;

                    return (
                      <button
                        key={key}
                        onClick={() => setActiveCategoryFilter(key)}
                        style={{
                          background: isActive ? '#1e293b' : '#ffffff',
                          color: isActive ? '#ffffff' : '#475569',
                          border: '1.5px solid ' + (isActive ? '#1e293b' : '#cbd5e1'),
                          boxShadow: 'none',
                          transition: 'all 0.15s ease',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          letterSpacing: '0.03em',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                        <span style={{
                          background: isActive ? 'rgba(255,255,255,0.15)' : '#f1f5f9',
                          color: isActive ? '#ffffff' : '#64748b',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          borderRadius: '3px',
                          padding: '1px 6px',
                          marginLeft: '2px',
                        }}>
                          {testCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {(() => {
              let displayedTests = tests;

              if (activeFilter === 'completed') {
                displayedTests = displayedTests.filter(test => test.isCompleted);
              } else if (activeFilter === 'pending') {
                displayedTests = displayedTests.filter(test => !test.isCompleted);
              }

              // Apply pricing filter (Free vs Paid)
              if (!isEmbedded && activePricingFilter === 'free') {
                displayedTests = displayedTests.filter(test => !test.isPaid || !test.price || test.price === 0);
              } else if (!isEmbedded && activePricingFilter === 'paid') {
                displayedTests = displayedTests.filter(test => test.isPaid && test.price > 0);
              }

              // Apply category filter
              if (!isEmbedded && activeCategoryFilter !== 'all') {
                displayedTests = displayedTests.filter(
                  test => matchCategory(test.category, activeCategoryFilter)
                );
              }

              // Apply year filter
              if (!isEmbedded && activeYearFilter !== 'all') {
                displayedTests = displayedTests.filter(test => {
                  const yr = test.year || (test.createdAt ? new Date(test.createdAt).getFullYear().toString() : (test.originalData?.createdAt ? new Date(test.originalData.createdAt).getFullYear().toString() : null));
                  return yr && String(yr) === String(activeYearFilter);
                });
              }

              if (displayedTests.length === 0) {
                return (
                  <div className="text-center py-12 bg-white rounded-lg border border-slate-200 max-w-md mx-auto p-8 shadow-none">
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-7 h-7 text-slate-400" />
                    </div>
                    <h3 className="text-base font-black text-slate-800 mb-1">
                      {activeFilter === 'completed'
                        ? 'No Completed Test Series Yet'
                        : activeCategoryFilter !== 'all'
                          ? `No ${activeCategoryFilter} Tests Available`
                          : 'No Test Series Available'}
                    </h3>
                    <p className="text-slate-500 text-xs font-medium mb-4">
                      {activeFilter === 'completed'
                        ? "You haven't attempted or completed any test series yet. Take an online mock test now to evaluate your performance!"
                        : activeCategoryFilter !== 'all'
                          ? `No tests found in the "${activeCategoryFilter}" category. Try selecting "All Tests".`
                          : 'No tests are currently available for this category.'}
                    </p>
                    {activeFilter === 'completed' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onSwitchTab) {
                            onSwitchTab();
                          } else {
                            setActiveFilter('all');
                          }
                        }}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-sm uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                      >
                        Explore Available Test Series
                      </button>
                    )}
                  </div>
                );
              }

              return (
                <div className={isEmbedded ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto"}>
                  {displayedTests.map((test, i) => {
                    const accentRed = i % 2 === 0;
                    const isPurchased = isTestPurchased(test);
                    return (
                      <div
                        key={test.id}
                        className={`rounded-lg border transition-colors flex flex-col justify-between bg-white border-slate-200 hover:border-slate-300 p-5 ${
                          test.isCompleted ? 'border-emerald-200' : ''
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2.5 flex-wrap gap-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {test.isPaid && test.price > 0 ? (
                                isPurchased ? (
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                    <span>👑</span>
                                    <span>₹{test.price} Paid ✓ (Unlocked)</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                                    <span>👑</span>
                                    <span>₹{test.price} Paid</span>
                                  </span>
                                )
                              ) : (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1">
                                  <span>⚡</span>
                                  <span>FREE</span>
                                </span>
                              )}
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${getDifficultyColor(test.difficulty)}`}>
                                {test.difficulty}
                              </span>
                              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                                {test.category}
                              </span>
                            </div>
                            {test.isCompleted && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                ✓ Completed
                              </span>
                            )}
                          </div>

                          <h3 className="text-lg sm:text-xl font-bold mb-2 leading-snug text-slate-900 line-clamp-2">
                            {test.title}
                          </h3>

                          <p className="text-xs sm:text-sm font-normal mb-4 line-clamp-3 leading-relaxed text-slate-600">
                            {getEnhancedDescription(test)}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-4 mb-4 pt-3 border-t border-slate-100 text-xs text-slate-600 font-medium">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{test.duration} min</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
                              <span>{test.totalQuestions} Qs</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-slate-400" />
                              <span>{test.totalMarks} Marks</span>
                            </div>
                            {test.isCompleted && test.completedResult && (
                              <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs ml-auto">
                                <Trophy className="w-3.5 h-3.5" />
                                <span>{test.completedResult.percentage || 0}%</span>
                              </div>
                            )}
                          </div>

                          {test.isCompleted ? (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleViewResult(test)}
                                className="py-2 px-3 rounded-md font-bold text-xs uppercase tracking-wider border border-slate-300 text-slate-700 hover:bg-slate-50 bg-white transition flex items-center justify-center gap-1.5 cursor-pointer"
                                title="View previous test score & details"
                              >
                                <span>Result</span>
                              </button>
                              <button
                                onClick={() => handleStartTest(test, true)}
                                className="py-2 px-3 rounded-md font-bold text-xs uppercase tracking-wider bg-[#0078FF] hover:bg-blue-700 text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
                                title="Retake test with fresh timer"
                              >
                                <span>Retake</span>
                              </button>
                            </div>
                          ) : test.isPaid && test.price > 0 && !isPurchased ? (
                            <button
                              onClick={() => handleOpenPayment(test)}
                              className="w-full py-2.5 rounded-md font-bold text-xs uppercase tracking-wider text-white transition flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-xs"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Unlock Paid Test (₹{test.price})</span>
                              <span>→</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartTest(test)}
                              className="w-full py-2.5 rounded-md font-bold text-xs uppercase tracking-wider text-white transition flex items-center justify-center gap-1.5 cursor-pointer bg-[#0078FF] hover:bg-blue-700 shadow-xs"
                            >
                              <span>{test.isPaid && test.price > 0 ? 'Start Paid Test' : 'Start Free Test'}</span>
                              <span>→</span>
                            </button>
                          )}
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

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowResultModal(false);
                      const originalTest = tests.find(t => t.id === viewingResult.testId) || { id: viewingResult.testId, title: viewingResult.testTitle, duration: 30 };
                      handleStartTest(originalTest, true);
                    }}
                    className="flex-1 py-3 bg-[#00B074] hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest rounded-md transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Retake Test</span>
                    <span>🔄</span>
                  </button>
                  <button
                    onClick={() => setShowResultModal(false)}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-md transition-all shadow-sm cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment / Checkout Modal */}
        {showPaymentModal && testToPurchase && (
          <div
            className="fixed inset-0 bg-black/25 backdrop-blur-[1px] z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
            onClick={() => {
              if (!isProcessingPayment) setShowPaymentModal(false);
            }}
          >
            <div
              className="bg-white rounded-xl border border-slate-200 max-w-md sm:max-w-lg w-full overflow-hidden shadow-2xl animate-slideUp my-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 px-5 py-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 border border-amber-400/30 flex items-center justify-center text-sm font-black">
                    👑
                  </span>
                  <div>
                    <h2 className="text-base font-black text-white leading-tight">Unlock Mock Test Series</h2>
                    <p className="text-slate-300 text-xs mt-0.5">Official NTA / TCS Exam Pattern</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!isProcessingPayment) setShowPaymentModal(false);
                  }}
                  disabled={isProcessingPayment}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 space-y-3.5">
                {/* Test Card Preview */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1 mb-1.5">{testToPurchase.title}</h3>
                  <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600 mb-2">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-100 text-[11px]">
                      {testToPurchase.category}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[11px]">
                      {testToPurchase.difficulty}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500 text-xs">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {testToPurchase.duration} mins
                    </span>
                    <span className="flex items-center gap-1 text-slate-500 text-xs">
                      <ClipboardList className="w-3.5 h-3.5 text-slate-400" /> {testToPurchase.totalQuestions} Questions
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {getEnhancedDescription(testToPurchase)}
                  </p>
                </div>

                {/* Perks list */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 bg-emerald-50/70 border border-emerald-100 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Live CBT Exam Interface</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Performance & Rank Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Unlimited Retakes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Official PDF Receipt</span>
                  </div>
                </div>

                {/* Pricing Box */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Total Enrollment Fee</div>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl font-black text-slate-900">₹{testToPurchase.price}</span>
                      <span className="text-xs text-slate-400 line-through">₹499</span>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        70% OFF
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <div>One-time Fee</div>
                    <div className="font-semibold text-emerald-600">Lifetime Access</div>
                  </div>
                </div>

                {/* Payment CTA */}
                <button
                  onClick={handleExecutePayment}
                  disabled={isProcessingPayment}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Securing Checkout...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay ₹{testToPurchase.price} & Unlock Test</span>
                      <span>→</span>
                    </>
                  )}
                </button>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-2 pt-1 text-xs text-slate-500 font-medium">
                  <span>🔒 Secured by Razorpay</span>
                  <span>•</span>
                  <span>UPI / Cards / NetBanking</span>
                </div>
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

    // Find current section and relative question number
    const currentSection = sections.find(s => s.name === (currentQ.subject || activeSectionName)) || sections[0];
    const relativeQuestionNum = currentSection ? currentSection.indices.indexOf(currentQuestion) + 1 : currentQuestion + 1;
    const currentSectionMeta = getSubjectMeta(currentSection?.name);

    // Section status counts for NTA Legend
    const secIndices = currentSection ? currentSection.indices : questions.map((_, i) => i);
    const secAnsweredCount = secIndices.filter(i => answers[questions[i]?.id] !== undefined && !markedForReview.has(questions[i]?.id)).length;
    const secNotAnsweredCount = secIndices.filter(i => visitedQuestions.has(i) && answers[questions[i]?.id] === undefined && !markedForReview.has(questions[i]?.id)).length;
    const secNotVisitedCount = secIndices.filter(i => !visitedQuestions.has(i)).length;
    const secMarkedCount = secIndices.filter(i => markedForReview.has(questions[i]?.id) && answers[questions[i]?.id] === undefined).length;
    const secAnsAndMarkedCount = secIndices.filter(i => markedForReview.has(questions[i]?.id) && answers[questions[i]?.id] !== undefined).length;

    return (
      <div className="fixed inset-0 z-[100] w-full h-screen min-h-screen bg-slate-100 flex flex-col font-poppins select-none overflow-hidden">
        
        {/* TOP EXAMINATION HEADER (White Theme) */}
        <header className="h-14 bg-white text-slate-800 border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-2xs">
          {/* Left: Back to Home (Text Only) + Branding & Test Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={handleBackToHome}
              className="text-xs font-bold text-slate-600 hover:text-blue-600 hover:underline transition-colors cursor-pointer shrink-0 py-1"
              title="Back to Home"
            >
              ← Back to Home
            </button>
            <span className="h-4 w-px bg-slate-200 hidden sm:block shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-300 px-2.5 py-1 rounded-md shrink-0">
              CBT ONLINE EXAM
            </span>
            <h1 className="font-black text-slate-900 text-sm sm:text-base truncate max-w-xs sm:max-w-md lg:max-w-xl">
              {selectedTest.title}
            </h1>
          </div>

          {/* Center: High-Visibility Digital Countdown Clock */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {timeRemaining !== null && (
              <div
                className={`px-3 py-1.5 rounded-lg font-mono font-black text-xs sm:text-sm tabular-nums flex items-center gap-2 border shadow-xs ${
                  timeRemaining < 300
                    ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                    : 'bg-amber-50 text-amber-900 border-amber-300'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-600 animate-spin-slow" />
                <span>TIME LEFT: {formatTime(timeRemaining)}</span>
              </div>
            )}

            {/* Candidate Name Indicator */}
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs font-semibold text-slate-600">
              <span>{student?.name || (isTestAccount ? 'Surender' : 'Candidate')}</span>
            </div>

            {/* Exit Test Button */}
            <button
              onClick={handleBackToTests}
              disabled={isExitBlocked && !isTestAccount}
              className={`text-xs font-bold px-3 py-1.5 rounded-md border transition-all flex items-center gap-1.5 cursor-pointer ${
                isExitBlocked && !isTestAccount
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                  : 'border-slate-300 text-slate-700 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 bg-white shadow-2xs'
              }`}
              title={isExitBlocked && !isTestAccount ? "You cannot exit after 10 minutes" : "Exit to Tests List"}
            >
              <X className="w-3.5 h-3.5 text-rose-500" />
              <span>Exit</span>
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 3-BOX / 3-PANEL MAIN BODY */}
        <div className="flex flex-col lg:flex-row overflow-hidden bg-[#F0F4F8] h-[calc(100vh-56px)] border-b border-slate-300">

          {/* ------------------------------------------------------------- */}
          {/* BOX 1 (LEFT COLUMN): SUBJECT CARDS                            */}
          {/* "pahale me jo jo subject hai us ke card ho"                   */}
          {/* ------------------------------------------------------------- */}
          <div className="w-full lg:w-64 xl:w-72 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col shrink-0 overflow-hidden shadow-xs">
            {/* Box 1 Header */}
            <div className="h-11 bg-slate-100 border-b border-slate-200 px-4 flex items-center justify-between shrink-0">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#0078FF]" />
                SUBJECTS ({sections.length})
              </span>
              <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                {questions.length} Qs Total
              </span>
            </div>

            {/* Subject Cards List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {sections.map((sec) => {
                const isActive = (currentSection?.name || sections[0]?.name) === sec.name;
                const meta = getSubjectMeta(sec.name);
                const answeredInSec = sec.indices.filter(idx => answers[questions[idx]?.id] !== undefined).length;
                const markedInSec = sec.indices.filter(idx => markedForReview.has(questions[idx]?.id)).length;
                const progressPct = sec.totalQuestions > 0 ? Math.round((answeredInSec / sec.totalQuestions) * 100) : 0;

                return (
                  <div
                    key={sec.name}
                    onClick={() => {
                      setActiveSectionName(sec.name);
                      if (sec.indices.length > 0) {
                        setCurrentQuestion(sec.indices[0]);
                      }
                    }}
                    className={`p-3 rounded-md border transition-colors cursor-pointer select-none ${
                      isActive
                        ? 'bg-blue-50 border-[#0078FF]'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base">{meta.icon}</span>
                        <span className={`text-sm font-bold truncate ${isActive ? 'text-[#0078FF]' : 'text-slate-800'}`}>
                          {sec.name}
                        </span>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded shrink-0 ${
                        isActive ? 'bg-[#0078FF] text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {sec.totalQuestions} Qs
                      </span>
                    </div>

                    {/* Attempted and Review counts */}
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Attempted:</span>
                        <strong className="text-slate-900">{answeredInSec}/{sec.totalQuestions}</strong>
                      </span>
                      {markedInSec > 0 && (
                        <span className="text-purple-700 font-bold text-[11px]">
                          🟣 {markedInSec} Review
                        </span>
                      )}
                    </div>

                    {/* Simple Progress Bar */}
                    <div className="w-full bg-slate-200 rounded h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Box 1 Footer (Overall Progress) */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0 text-xs text-slate-700 space-y-1">
              <div className="flex justify-between font-bold">
                <span>Overall Attempted:</span>
                <strong className="text-blue-700">{Object.keys(answers).length} / {questions.length}</strong>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#0078FF] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(Object.keys(answers).length / (questions.length || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* BOX 2 (MIDDLE COLUMN): QUESTION & OPTIONS DISPLAY             */}
          {/* "2 me us card par clicl par question dekhe"                   */}
          {/* ------------------------------------------------------------- */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200">
            {/* Box 2 Question Info Header */}
            <div className="min-h-[48px] py-2 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                <span className="text-sm font-black text-[#0078FF] bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md tracking-wider shrink-0">
                  Question No. {relativeQuestionNum}
                </span>
                {currentQ.subject && (
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md border flex items-center gap-1.5 shrink-0 ${currentSectionMeta.bg} ${currentSectionMeta.text} ${currentSectionMeta.border}`}>
                    <span>{currentSectionMeta.icon}</span>
                    <span>{currentQ.subject}</span>
                  </span>
                )}
                <span className="text-xs text-slate-500 font-medium hidden md:inline truncate">
                  (Q. {relativeQuestionNum} of {currentSection?.totalQuestions || questions.length} • Overall {currentQuestion + 1}/{questions.length})
                </span>
                {markedForReview.has(currentQ.id) && (
                  <span className="text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <span>🟣</span>
                    <span>Review</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-md shrink-0">
                  +{currentQ.marks || 4}.00 Marks
                </span>
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-300 px-2.5 py-1 rounded-md shrink-0">
                  -1.00 Negative
                </span>
              </div>
            </div>

            {/* Scrollable Question Body */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 bg-slate-50/50">
              {/* Question Statement Box */}
              <div className="bg-white rounded-md border border-slate-200 p-4 mb-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Question Statement
                </span>
                <h2 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                  {currentQ.text}
                </h2>
              </div>

              {/* Options List */}
              <div className="space-y-2 max-w-3xl">
                {currentQ.options.map((option, idx) => {
                  const isSelected = answers[currentQ.id] === idx;
                  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
                  return (
                    <label
                      key={idx}
                      onClick={() => handleAnswerSelect(currentQ.id, idx)}
                      className={`flex items-center py-2.5 px-3.5 rounded-md cursor-pointer border transition-colors select-none ${
                        isSelected
                          ? 'border-[#0078FF] bg-blue-50/80 font-semibold'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div
                          className={`w-6 h-6 rounded font-bold text-xs flex items-center justify-center shrink-0 border transition-colors ${
                            isSelected
                              ? 'bg-[#0078FF] text-white border-[#0078FF]'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {optionLetters[idx] || idx + 1}
                        </div>
                        <span className={`text-sm flex-1 ${isSelected ? 'text-slate-950 font-semibold' : 'text-slate-700 font-normal'}`}>
                          {option}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? 'border-[#0078FF] bg-[#0078FF]' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Bottom Fixed Action Bar */}
            <div className="h-14 bg-white border-t border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const isMarked = markedForReview.has(currentQ.id);
                    const nextSet = new Set(markedForReview);
                    if (isMarked) nextSet.delete(currentQ.id);
                    else nextSet.add(currentQ.id);
                    setMarkedForReview(nextSet);
                    if (!isLastQuestion) handleNextQuestion();
                  }}
                  className={`px-3.5 py-2 rounded-lg font-bold text-xs border transition flex items-center gap-1.5 cursor-pointer ${
                    markedForReview.has(currentQ.id)
                      ? 'bg-purple-100 border-purple-500 text-purple-900 font-black'
                      : 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100'
                  }`}
                  title="Mark for review and move to next"
                >
                  <span>🟣</span>
                  <span>{markedForReview.has(currentQ.id) ? 'Unmark Review' : 'Save & Mark for Review'}</span>
                </button>

                {hasAnswered && (
                  <button
                    type="button"
                    onClick={() => {
                      const newAnswers = { ...answers };
                      delete newAnswers[currentQ.id];
                      setAnswers(newAnswers);
                      if (selectedTest && studentId) {
                        localStorage.setItem(`test_answers_${studentId}_${selectedTest.id}`, JSON.stringify(newAnswers));
                      }
                    }}
                    className="text-xs font-bold text-slate-600 hover:text-rose-600 px-3 py-2 rounded-lg hover:bg-rose-50 border border-slate-300 hover:border-rose-300 transition cursor-pointer"
                  >
                    Clear Response
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestion === 0}
                  className={`px-4 py-2 rounded-lg font-bold text-xs border transition flex items-center gap-1 cursor-pointer ${
                    currentQuestion === 0
                      ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleNextQuestion}
                  disabled={submitting}
                  className={`px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    submitting
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : isLastQuestion
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-[#0078FF] hover:bg-blue-700 text-white'
                  }`}
                >
                  {submitting ? (
                    'Submitting...'
                  ) : isLastQuestion ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save & Submit</span>
                    </>
                  ) : (
                    <>
                      <span>Save & Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* ------------------------------------------------------------- */}
          {/* BOX 3 (RIGHT COLUMN): QUESTION PALETTE & LEGEND & SUBMIT      */}
          {/* "3 me sabhi jo number ka tab aa raha vah aaye"                */}
          {/* ------------------------------------------------------------- */}
          <div className="w-full lg:w-72 xl:w-80 bg-white flex flex-col shrink-0 overflow-hidden">
            
            {/* 1. Section Palette Header & Mode Switcher */}
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                  {paletteMode === 'section' ? `${currentSection?.name || 'Section'} (${currentSection?.totalQuestions || 45} Qs)` : `All (${questions.length} Qs)`}
                </span>
              </div>

              {/* Toggle: Section (1-45) or All (1-135) */}
              <div className="inline-flex rounded border border-slate-300 p-0.5 bg-white text-[10px] font-bold">
                <button
                  onClick={() => setPaletteMode('section')}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    paletteMode === 'section' ? 'bg-[#0078FF] text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Show 1 to 45 for active section"
                >
                  Section (1-{currentSection?.totalQuestions || 45})
                </button>
                <button
                  onClick={() => setPaletteMode('all')}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    paletteMode === 'all' ? 'bg-[#0078FF] text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Show all questions"
                >
                  All ({questions.length})
                </button>
              </div>
            </div>

            {/* 2. Question Palette Number Grid (Table) */}
            <div className="flex-1 overflow-y-auto p-2.5 bg-slate-50/50">
              <div className="grid grid-cols-5 gap-1.5">
                {displayedIndices.map((item) => {
                  const idx = item.globalIndex;
                  const q = questions[idx];
                  const isCurrent = currentQuestion === idx;
                  const isAnswered = answers[q?.id] !== undefined;
                  const isMarked = markedForReview.has(q?.id);
                  const isVisited = visitedQuestions.has(idx);

                  let btnStyle = '';
                  if (isCurrent) {
                    btnStyle = 'bg-[#0078FF] text-white font-bold ring-2 ring-blue-500 ring-offset-1';
                  } else if (isMarked && isAnswered) {
                    btnStyle = 'bg-purple-600 text-white border-2 border-emerald-400 font-bold';
                  } else if (isMarked) {
                    btnStyle = 'bg-purple-600 text-white font-bold';
                  } else if (isAnswered) {
                    btnStyle = 'bg-[#08B100] text-white font-bold';
                  } else if (isVisited) {
                    btnStyle = 'bg-[#E11D48] text-white font-bold';
                  } else {
                    btnStyle = 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 font-semibold';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestion(idx)}
                      className={`h-8 rounded-md font-semibold text-xs transition-colors flex items-center justify-center relative cursor-pointer select-none ${btnStyle}`}
                      title={`Question ${item.displayNum} (${item.sectionName}) • Overall Q. ${idx + 1}`}
                    >
                      {item.displayNum}
                      {isMarked && isAnswered && (
                        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Official NTA Status Legend Grid (NOW BELOW THE NUMBER TABLE) */}
            <div className="p-2.5 bg-white border-t border-slate-200 shrink-0">
              <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-700 font-semibold">
                <div className="flex items-center gap-1.5 p-1 rounded-md bg-slate-50 border border-slate-200">
                  <span className="w-5 h-5 rounded-md bg-[#08B100] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    {secAnsweredCount}
                  </span>
                  <span className="truncate">Answered</span>
                </div>
                <div className="flex items-center gap-1.5 p-1 rounded-md bg-slate-50 border border-slate-200">
                  <span className="w-5 h-5 rounded-md bg-[#E11D48] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    {secNotAnsweredCount}
                  </span>
                  <span className="truncate">Not Answered</span>
                </div>
                <div className="flex items-center gap-1.5 p-1 rounded-md bg-slate-50 border border-slate-200">
                  <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {secNotVisitedCount}
                  </span>
                  <span className="truncate">Not Visited</span>
                </div>
                <div className="flex items-center gap-1.5 p-1 rounded-md bg-slate-50 border border-slate-200">
                  <span className="w-5 h-5 rounded-md bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    {secMarkedCount}
                  </span>
                  <span className="truncate">Marked Review</span>
                </div>
                <div className="col-span-2 flex items-center gap-1.5 p-1 rounded-md bg-slate-50 border border-slate-200">
                  <span className="w-5 h-5 rounded-md bg-purple-600 border-2 border-emerald-400 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    {secAnsAndMarkedCount}
                  </span>
                  <span className="truncate">Ans & Marked for Review</span>
                </div>
              </div>
            </div>

            {/* 4. Final Submit & Question Paper Buttons */}
            <div className="p-2.5 bg-white border-t border-slate-200 shrink-0 space-y-2">
              <button
                onClick={() => setShowQuestionPaperModal(true)}
                className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-md font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>View Full Question Paper</span>
              </button>

              <button
                onClick={handleSubmitManually}
                disabled={submitting}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-md font-bold text-xs uppercase tracking-widest transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Full Test</span>
              </button>
            </div>

          </div>

        </div>

        {/* 4. FULL QUESTION PAPER MODAL (Sharp / Non-rounded) */}
        {showQuestionPaperModal && (
          <div className="fixed inset-0 z-[1000000] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-300">
              <div className="h-12 bg-[#0B1E36] text-white px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-sm uppercase tracking-wider">Full Question Paper Review</span>
                </div>
                <button
                  onClick={() => setShowQuestionPaperModal(false)}
                  className="w-7 h-7 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {sections.map((sec) => (
                  <div key={sec.name} className="border border-slate-200 p-4 bg-slate-50">
                    <h3 className="text-sm font-bold text-[#0078FF] uppercase tracking-wider mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
                      <span>{getSubjectMeta(sec.name).icon}</span>
                      <span>Section: {sec.name} ({sec.totalQuestions} Questions)</span>
                    </h3>
                    <div className="space-y-3">
                      {sec.indices.map((idx, relIdx) => {
                        const q = questions[idx];
                        const isAns = answers[q?.id] !== undefined;
                        return (
                          <div key={idx} className="bg-white p-3.5 border border-slate-200 text-xs">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-slate-900">
                                Q.{relIdx + 1} (Overall Q.{idx + 1})
                              </span>
                              <span className={`px-2 py-0.5 text-[10px] font-bold border ${
                                isAns ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}>
                                {isAns ? `Selected: Option ${['A','B','C','D'][answers[q?.id]] || ''}` : 'Not Answered'}
                              </span>
                            </div>
                            <p className="text-slate-800 font-medium mb-2">{q.text}</p>
                            <div className="grid grid-cols-2 gap-2 text-slate-600">
                              {q.options?.map((opt, oIdx) => (
                                <div key={oIdx} className="truncate">
                                  <strong>{['A','B','C','D'][oIdx]}.</strong> {opt}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setShowQuestionPaperModal(false)}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                >
                  Close Paper
                </button>
              </div>
            </div>
          </div>
        )}

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
                className={`mb-6 px-4 py-3 rounded-md text-sm font-medium ${eligibilityStatus
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

            {/* Subject-wise Score Analysis */}
            {sections.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-left">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  Subject-wise Attempt Analysis:
                </div>
                <div className="space-y-2">
                  {sections.map(s => {
                    const meta = getSubjectMeta(s.name);
                    const secAttempted = s.indices.filter(i => answers[questions[i]?.id] !== undefined).length;
                    return (
                      <div key={s.name} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-200 last:border-b-0">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                          <span>{meta.icon}</span>
                          <span>{s.name}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-medium">{secAttempted}/{s.totalQuestions} Attempted</span>
                          <span className="font-black text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                            {s.totalQuestions * (questions[s.startIndex]?.marks || 4)} Marks
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleStartTest(selectedTest, true)}
                className="flex-1 py-3 bg-[#00B074] hover:bg-emerald-600 text-white rounded-md font-bold text-sm transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Retake This Test</span>
                <span>🔄</span>
              </button>
              <button
                onClick={handleBackToTests}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-sm transition shadow-xs cursor-pointer"
              >
                All Mock Tests
              </button>
              <button
                type="button"
                onClick={handleBackToHome}
                className="text-xs font-bold text-slate-600 hover:text-blue-600 hover:underline transition-colors cursor-pointer py-2 flex items-center justify-center shrink-0"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default StudentTestPanel;   