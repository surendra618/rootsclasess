import axios from 'axios';
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/endpoints';
import useStudentStore from '../../Store/studentstore';
import { useCourseStore } from '../../Store/courseStore';
import { toast } from 'react-toastify';
import { 
    BookOpen, Library, GraduationCap, Award, PlayCircle, CheckCircle, ChevronRight, ArrowLeft,
    LayoutDashboard, Sparkles, FileText, LogOut, Menu, X, Camera 
} from 'lucide-react';

// ========== LOCALSTORAGE HELPERS ==========
const STORAGE_KEY = 'video_completed_topics';
const PROGRESS_STORAGE_KEY = 'course_progress_data';

// Load topic completion from localStorage
const loadCompletedTopicsFromStorage = (studentId, courseId) => {
    if (!studentId || !courseId) return {};
    try {
        const stored = localStorage.getItem(`${STORAGE_KEY}_${studentId}_${courseId}`);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return {};
    }
};

// Save topic completion to localStorage
const saveCompletedTopicsToStorage = (studentId, courseId, completedTopics) => {
    if (!studentId || !courseId) return;
    try {
        localStorage.setItem(`${STORAGE_KEY}_${studentId}_${courseId}`, JSON.stringify(completedTopics));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
};

// Load course progress from localStorage
const loadCourseProgressFromStorage = (studentId, courseId) => {
    if (!studentId || !courseId) return null;
    try {
        const stored = localStorage.getItem(`${PROGRESS_STORAGE_KEY}_${studentId}_${courseId}`);
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.error('Error loading progress from localStorage:', error);
        return null;
    }
};

// Save course progress to localStorage
const saveCourseProgressToStorage = (studentId, courseId, progressData) => {
    if (!studentId || !courseId) return;
    try {
        localStorage.setItem(`${PROGRESS_STORAGE_KEY}_${studentId}_${courseId}`, JSON.stringify(progressData));
    } catch (error) {
        console.error('Error saving progress to localStorage:', error);
    }
};

// ========== YOUTUBE URL HELPER ==========
const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
        /youtube\.com\/watch\?.*[?&]v=([^&]+)/
    ];
    let videoId = null;
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) { videoId = match[1]; break; }
    }
    if (videoId) {
        videoId = videoId.split('?')[0].split('&')[0];
        return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&showinfo=0`;
    }
    return url;
};

// Dummy images for courses
const getDummyImage = (courseTitle) => {
    const images = {
        'Social': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=240&fit=crop',
        'Chemistry': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=240&fit=crop',
        'Physics': 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=240&fit=crop',
        'Mathematics': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=240&fit=crop',
        'English': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=240&fit=crop',
        'Science': 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=400&h=240&fit=crop',
    };

    if (courseTitle?.toLowerCase().includes('social')) return images.Social;
    if (courseTitle?.toLowerCase().includes('chemistry')) return images.Chemistry;
    if (courseTitle?.toLowerCase().includes('physics')) return images.Physics;
    if (courseTitle?.toLowerCase().includes('math')) return images.Mathematics;
    if (courseTitle?.toLowerCase().includes('english')) return images.English;
    if (courseTitle?.toLowerCase().includes('science')) return images.Science;
    return 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=240&fit=crop';
};

const PurchasedCourse = ({ isEmbedded = false }) => {
    const { student, setStudent } = useStudentStore();
    const navigate = useNavigate();
    const studentId = student?.id || student?._id;

    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [expandedModuleId, setExpandedModuleId] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [videoCompleted, setVideoCompleted] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [embedUrl, setEmbedUrl] = useState(null);
    const [markingProgress, setMarkingProgress] = useState(false);
    const [courseProgress, setCourseProgress] = useState({});
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('student');
        localStorage.removeItem('token');
        if (setStudent) setStudent(null);
        toast.info("Logged out successfully");
        navigate('/stdlogin');
    };

    const renderStudentSidebar = () => {
        const studentName = student?.fullName || student?.name || student?.user?.fullName || 'Student';
        const studentEmail = student?.email || student?.user?.email || '';
        const studentClass = student?.currentClass || student?.className || student?.user?.currentClass;
        const profileImageUrl = student?.profileImage || student?.profilePicture || student?.user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=0078FF&color=fff&size=200&bold=true`;

        const navItems = [
            { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard, isLink: '/stdprofile' },
            { id: 'courses', label: 'My Enrolled Courses', icon: BookOpen, active: true },
            { id: 'academic', label: 'Academic Details', icon: GraduationCap, isLink: '/stdprofile' },
            { id: 'tests', label: 'Online Mock Tests', icon: FileText, isLink: '/test' },
        ];

        return (
            <>
                {/* Mobile Header Bar */}
                <div className="md:hidden bg-white text-slate-900 p-4 flex items-center justify-between sticky top-0 z-50 border-b border-slate-200 shadow-xs">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                        >
                            {mobileSidebarOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                        <div className="flex items-center gap-2">
                            <img src="/logo.svg" alt="Roots Classes" className="h-7 w-auto" />
                            <div>
                                <span className="text-sm font-black text-[#FB0500] tracking-tight">Roots</span>
                                <span className="text-sm font-black text-slate-900 tracking-tight"> Classes</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <img src={profileImageUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-blue-500 object-cover" />
                        <span className="text-xs font-bold text-slate-800 truncate max-w-[100px]">{studentName.split(' ')[0]}</span>
                    </div>
                </div>

                {/* Mobile Overlay */}
                {mobileSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
                        onClick={() => setMobileSidebarOpen(false)}
                    />
                )}

                {/* LEFT SIDEBAR NAVIGATION */}
                <aside className={`
                    fixed md:sticky top-0 left-0 h-screen w-60 bg-white text-slate-700 z-50 flex flex-col justify-between
                    transition-transform duration-300 ease-in-out border-r border-slate-200 shadow-xs flex-shrink-0
                    ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>
                    <div>
                        {/* Header: Back Button only */}
                        <div className="p-3 px-4 border-b border-slate-100 flex items-center justify-between">
                            <button 
                                onClick={() => navigate('/')} 
                                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                <ArrowLeft size={16} />
                                <span>Back to Home</span>
                            </button>
                        </div>

                        {/* Student Mini Profile Card in Sidebar */}
                        <div className="p-3 mx-2.5 my-2.5 bg-slate-50 border border-slate-200/80 rounded-md">
                            <div className="flex items-center gap-2.5">
                                <img
                                    src={profileImageUrl}
                                    alt={studentName}
                                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs flex-shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-xs font-black text-slate-900 truncate leading-tight">{studentName}</h3>
                                    {studentEmail && <p className="text-[10px] font-medium text-slate-500 truncate">{studentEmail}</p>}
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">
                                            {studentClass ? `Class ${studentClass}` : 'Active Student'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <nav className="p-2.5 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)] custom-scrollbar">
                            <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Main Menu</p>
                            
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = item.active;

                                if (item.isHighlight) {
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                if (item.isLink) navigate(item.isLink);
                                                setMobileSidebarOpen(false);
                                            }}
                                            className="w-full flex items-center justify-center gap-2 py-2 px-3 my-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md transition-all shadow-xs"
                                        >
                                            <Icon size={15} />
                                            <span>{item.label}</span>
                                        </button>
                                    );
                                }

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            if (item.isLink) {
                                                navigate(item.isLink);
                                            } else if (item.id === 'courses') {
                                                setSelectedCourse(null);
                                                setSelectedTopic(null);
                                            }
                                            setMobileSidebarOpen(false);
                                        }}
                                        className={`
                                            w-full flex items-center justify-between px-3.5 py-2 rounded-sm text-xs md:text-sm font-bold transition-all
                                            ${isActive 
                                                ? 'bg-blue-600 text-white shadow-xs' 
                                                : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100/80'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Icon size={18} className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
                                            <span className="truncate">{item.label}</span>
                                        </div>
                                        {item.count !== undefined && (
                                            <span className={`px-2 py-0.5 text-[9px] font-black rounded-sm flex-shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                                {item.count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Sidebar Bottom Action Area */}
                    <div className="p-2.5 border-t border-slate-100">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-md transition-colors border border-red-200/60 shadow-xs"
                        >
                            <LogOut size={14} />
                            <span>Logout Account</span>
                        </button>
                    </div>
                </aside>
            </>
        );
    };

    // Calculate total topics for current course
    const totalTopics = useMemo(() => {
        if (!selectedCourse?.course?.modules) return 0;
        let count = 0;
        selectedCourse.course.modules.forEach(m => m?.chapters?.forEach(c => { count += c?.topics?.length || 0; }));
        return count;
    }, [selectedCourse]);

    // Calculate completed topics count from videoCompleted state
    const completedTopicsCount = useMemo(() =>
        Object.keys(videoCompleted).filter(id => videoCompleted[id]).length,
        [videoCompleted]);

    // Calculate progress percentage
    const progressPercentage = totalTopics > 0 ? (completedTopicsCount / totalTopics) * 100 : 0;

    // Save course progress to localStorage whenever it changes
    useEffect(() => {
        const courseId = selectedCourse?.course?._id || selectedCourse?._id;
        if (studentId && courseId && totalTopics > 0) {
            const progressData = {
                percentage: progressPercentage,
                completedCount: completedTopicsCount,
                totalTopics: totalTopics,
                lastUpdated: new Date().toISOString()
            };
            saveCourseProgressToStorage(studentId, courseId, progressData);
            
            // Also update courseProgress state for consistency
            setCourseProgress(prev => ({
                ...prev,
                [courseId]: progressData
            }));
        }
    }, [completedTopicsCount, totalTopics, selectedCourse, studentId]);

    // Load video completion and course progress from localStorage when course changes
    useEffect(() => {
        const courseId = selectedCourse?.course?._id || selectedCourse?._id;
        if (studentId && courseId) {
            // Load topic completion
            const savedTopics = loadCompletedTopicsFromStorage(studentId, courseId);
            setVideoCompleted(savedTopics);
            
            // Load course progress
            const savedProgress = loadCourseProgressFromStorage(studentId, courseId);
            if (savedProgress) {
                setCourseProgress(prev => ({
                    ...prev,
                    [courseId]: savedProgress
                }));
            }
        }
    }, [selectedCourse, studentId]);

    useEffect(() => {
        if (selectedTopic?.videoUrl && selectedTopic?.videoType === 'youtube') {
            setEmbedUrl(getYouTubeEmbedUrl(selectedTopic.videoUrl));
        } else {
            setEmbedUrl(selectedTopic?.videoUrl || null);
        }
    }, [selectedTopic]);

    const handlePurchasedCourses = async () => {
        if (!studentId) { 
            setError("Student information not loaded"); 
            return; 
        }
        try {
            setLoading(true);
            const res = await axios.post(api.payment.getPurchesCourse, { studentId });
            console.log("Purchased courses response:", res);
            
            if (res.data?.success) {
                let coursesData = [];
                
                if (res.data?.data && Array.isArray(res.data.data)) {
                    coursesData = res.data.data;
                } else if (res.data?.courses && Array.isArray(res.data.courses)) {
                    coursesData = res.data.courses;
                } else if (res.data?.purchasedCourses && Array.isArray(res.data.purchasedCourses)) {
                    coursesData = res.data.purchasedCourses;
                } else if (res.data?.enrolledCourses && Array.isArray(res.data.enrolledCourses)) {
                    coursesData = res.data.enrolledCourses;
                }
                
                if (coursesData.length > 0) {
                    const coursesWithModules = coursesData.map(courseItem => ({
                        ...courseItem,
                        course: { 
                            ...(courseItem.course || courseItem), 
                            modules: courseItem.course?.modules || courseItem.modules || [] 
                        }
                    }));
                    setCourses(coursesWithModules);
                    await fetchAllCoursesProgress(coursesWithModules);
                } else {
                    setCourses([]);
                }
            } else {
                setCourses([]);
            }
        } catch (err) {
            console.error("Error fetching purchased courses:", err);
            setError(err.response?.data?.message || err.message || "Failed to fetch courses");
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllCoursesProgress = async (coursesList) => {
        if (!studentId || !coursesList?.length) return;
        
        try {
            const progressPromises = coursesList.map(async (courseItem) => {
                const courseId = courseItem.course?._id || courseItem._id;
                if (!courseId) return null;
                
                // First check localStorage for cached progress
                const cachedProgress = loadCourseProgressFromStorage(studentId, courseId);
                if (cachedProgress) {
                    return {
                        courseId: courseId,
                        progress: cachedProgress
                    };
                }
                
                // If not in cache, fetch from API
                try {
                    const res = await axios.post(api.progress.getProgress, {
                        studentId: studentId,
                        courseId: courseId
                    });
                    
                    if (res.data?.success && res.data?.data) {
                        const progressData = res.data.data;
                        // Cache the API response
                        saveCourseProgressToStorage(studentId, courseId, {
                            percentage: progressData.percentage || 0,
                            completedCount: progressData.completedCount || 0,
                            totalTopics: progressData.totalTopics || 0
                        });
                        return {
                            courseId: courseId,
                            progress: {
                                percentage: progressData.percentage || 0,
                                completedCount: progressData.completedCount || 0,
                                totalTopics: progressData.totalTopics || 0
                            }
                        };
                    }
                } catch (err) {
                    console.error(`Error fetching progress for course ${courseId}:`, err);
                }
                return null;
            });
            
            const results = await Promise.all(progressPromises);
            const progressMap = {};
            results.forEach(result => {
                if (result) {
                    progressMap[result.courseId] = result.progress;
                }
            });
            setCourseProgress(progressMap);
        } catch (error) {
            console.error("Error fetching all courses progress:", error);
        }
    };

    const FetchProgress = async () => {
        const courseId = selectedCourse?._id || selectedCourse?.course?._id;
        
        if (!studentId) {
            console.error("Student ID not found");
            toast.error("Student information not found");
            return false;
        }

        if (!courseId) {
            console.error("Course ID not found");
            toast.error("Course information not found");
            return false;
        }
        
        try {
            const res = await axios.post(api.progress.getProgress, {
                studentId: studentId,
                courseId: courseId
            });
            
            console.log("Progress response:", res);
            
            if (res.data?.success && res.data?.data) {
                const progressData = res.data.data;
                
                setCourseProgress(prev => ({
                    ...prev,
                    [courseId]: {
                        percentage: progressData.percentage || 0,
                        completedCount: progressData.completedCount || 0,
                        totalTopics: progressData.totalTopics || 0
                    }
                }));
                
                // Cache to localStorage
                saveCourseProgressToStorage(studentId, courseId, {
                    percentage: progressData.percentage || 0,
                    completedCount: progressData.completedCount || 0,
                    totalTopics: progressData.totalTopics || 0
                });
                
                return true;
            } else {
                console.log("No progress data found");
                setCourseProgress(prev => ({
                    ...prev,
                    [courseId]: {
                        percentage: 0,
                        completedCount: 0,
                        totalTopics: 0
                    }
                }));
                return false;
            }
        } catch (error) {
            console.error("Error fetching progress:", error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            }
            return false;
        }
    };

    const handleTopicProgress = async (topicId) => {
        const courseId = selectedCourse?._id || selectedCourse?.course?._id;
        if (!studentId) {
            console.error("Student ID not found");
            toast.error("Student information not found");
            return false;
        }

        if (!courseId) {
            console.error("Course ID not found");
            toast.error("Course information not found");
            return false;
        }

        if (videoCompleted[topicId]) {
            toast.info("Topic already marked as complete");
            return true;
        }

        try {
            setMarkingProgress(true);
            const res = await axios.post(api.progress.topicProgress, {
                studentId: studentId,
                courseId: courseId,
                topicId: topicId
            });
            console.log("Topic progress response:", res);
            
            if (res.data?.success) {
                // Update local state
                const newCompleted = { ...videoCompleted, [topicId]: true };
                setVideoCompleted(newCompleted);
                
                // Save topic completion to localStorage
                const courseIdForStorage = selectedCourse?.course?._id || selectedCourse?._id;
                saveCompletedTopicsToStorage(studentId, courseIdForStorage, newCompleted);
                
                // Progress will automatically be saved via the useEffect that watches completedTopicsCount
                
                toast.success("Topic marked as complete!");
                await FetchProgress();
                return true;
            } else {
                console.error("Failed to mark topic:", res.data?.message);
                const msg = typeof res.data?.message === 'string' ? res.data.message : "Failed to mark topic as complete";
                toast.error(msg);
                return false;
            }
        } catch (error) {
            console.error("Error marking topic progress:", error);
            let errorMessage = "Failed to mark topic";
            if (error.response?.data?.message) {
                errorMessage = typeof error.response.data.message === 'string' ? error.response.data.message : "Server error occurred";
            } else if (error.message) {
                errorMessage = typeof error.message === 'string' ? error.message : "Error occurred";
            }
            toast.error(errorMessage);
            return false;
        } finally {
            setMarkingProgress(false);
        }
    };

    useEffect(() => {
        if (selectedCourse && studentId) {
            FetchProgress();
        }
    }, [selectedCourse, studentId]);

    useEffect(() => {
        if (studentId) {
            handlePurchasedCourses();
        } else {
            const timer = setTimeout(() => {
                if (student?.id || student?._id) {
                    handlePurchasedCourses();
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [studentId, student]);

    const getAllTopics = () => {
        if (!selectedCourse?.course?.modules) return [];
        const topics = [];
        selectedCourse.course.modules.forEach(m => {
            m?.chapters?.forEach(c => {
                c?.topics?.forEach(t => topics.push({
                    ...t,
                    moduleId: m._id || m.id,
                    moduleTitle: m.title,
                    chapterTitle: c.title,
                    courseId: selectedCourse._id
                }));
            });
        });
        return topics;
    };

    const allTopics = getAllTopics();
    const currentTopicIndex = selectedTopic ? allTopics.findIndex(t => t._id === selectedTopic._id) : -1;
    const nextTopic = currentTopicIndex >= 0 && currentTopicIndex < allTopics.length - 1 ? allTopics[currentTopicIndex + 1] : null;
    const prevTopic = currentTopicIndex > 0 ? allTopics[currentTopicIndex - 1] : null;

    const handleCourseSelect = (courseItem) => {
        const c = {
            ...courseItem,
            _id: courseItem.course._id,
            course: {
                ...courseItem.course,
                modules: courseItem.course?.modules || []
            }
        };
        setSelectedCourse(c);
        setSelectedTopic(null);
        if (c.course.modules?.length > 0) setExpandedModuleId(c.course.modules[0]._id || c.course.modules[0].id || null);
    };

    const handleTopicClick = (topic) => {
        setSelectedTopic(topic);
    };

    const handleModuleClick = (id) => {
        setExpandedModuleId(expandedModuleId === id ? null : id);
    };

    const handleNextTopic = () => {
        if (nextTopic) {
            handleTopicClick(nextTopic);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevTopic = () => {
        if (prevTopic) {
            handleTopicClick(prevTopic);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleDownloadNotes = async (e, url, title) => {
        e.preventDefault();
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${title ? title.replace(/[^a-zA-Z0-9]/g, '_') : 'Notes'}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Error downloading the file:', error);
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

// Helper to format instructor name cleanly
const getInstructorName = (instructor) => {
    if (!instructor) return 'Roots Faculty';
    if (typeof instructor === 'string') {
        if (/^[0-9a-fA-F]{24}$/.test(instructor)) return 'Roots Faculty';
        return instructor;
    }
    return instructor.fullName || instructor.name || 'Roots Faculty';
};

    // Loading State
    if (loading) return (
        <div className={`${isEmbedded ? 'py-12' : 'min-h-screen bg-[#F8FAFC]'} flex items-center justify-center font-poppins`}>
            <div className="text-center">
                <div className="w-12 h-12 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500 font-bold animate-pulse">Loading your courses...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className={`${isEmbedded ? 'py-12' : 'min-h-screen bg-[#F8FAFC]'} flex items-center justify-center p-6 font-poppins`}>
            <div className="bg-white border border-slate-200 rounded-sm p-8 text-center max-w-md shadow-sm">
                <p className="text-red-500 font-bold mb-4">{error}</p>
                <button onClick={handlePurchasedCourses} className="px-6 py-3 bg-slate-900 hover:bg-blue-600 rounded-sm text-white font-black text-xs uppercase tracking-widest transition-all">Try Again</button>
            </div>
        </div>
    );

    if (courses.length === 0) return (
        <div className={`${isEmbedded ? 'py-12' : 'min-h-screen bg-[#F8FAFC]'} flex items-center justify-center p-6 font-poppins`}>
            <div className="text-center max-w-md bg-white p-8 border border-slate-200 rounded-sm shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 rounded-sm bg-blue-50 flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">No Enrolled Courses</h2>
                <p className="text-slate-500 font-medium text-sm mb-6">You haven't enrolled in any courses yet. Explore our courses to start learning.</p>
            </div>
        </div>
    );

    if (!selectedCourse) {
        return (
            <div className={isEmbedded ? "w-full font-poppins" : "min-h-screen bg-[#F8FAFC] font-poppins flex flex-col md:flex-row"}>
                {!isEmbedded && renderStudentSidebar()}

                <div className="flex-1 min-w-0 flex flex-col pb-16">
                    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-slate-200">
                            <div>
                                <span className="text-blue-700 text-[10px] font-black tracking-widest uppercase bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-sm inline-flex items-center gap-1.5">
                                    <Library size={14} className="text-blue-600" />
                                    MY LIBRARY
                                </span>
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mt-3 tracking-tight">
                                    Learning <span className="text-blue-600">Journey</span>
                                </h1>
                                <p className="text-slate-500 text-xs font-bold mt-1">Master subjects with interactive modules and video lectures.</p>
                            </div>
                            <div className="bg-white px-6 py-3 rounded-sm border border-slate-200 shadow-sm flex items-center gap-3">
                                <strong className="text-2xl font-black text-slate-900">{courses.length}</strong>
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Course{courses.length !== 1 ? 's' : ''} Enrolled</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {courses.map((courseItem) => {
                                const totalCourseTopics = (courseItem.course.modules || []).reduce((acc, m) =>
                                    acc + ((m.chapters || []).reduce((a, c) => a + (c.topics?.length || 0), 0)), 0);
                                const dummyImage = getDummyImage(courseItem.course.title);
                                const courseId = courseItem.course._id;
                                const progress = courseProgress[courseId];
                                const progressPercent = progress?.percentage || 0;
                                const completedCount = progress?.completedCount || 0;

                                return (
                                    <div
                                        key={courseItem.course._id}
                                        onClick={() => handleCourseSelect(courseItem)}
                                        className="group relative bg-white border border-slate-200 rounded-sm overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="relative h-48 overflow-hidden bg-slate-100">
                                                <img
                                                    src={dummyImage}
                                                    alt={courseItem.course.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>

                                                <div className="absolute top-3 left-3">
                                                    <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-sm bg-slate-900/90 text-white shadow-sm backdrop-blur-sm">
                                                        {courseItem.course.level || 'Beginner'}
                                                    </span>
                                                </div>

                                                {courseItem.price && (
                                                    <div className="absolute top-3 right-3 px-2.5 py-1 text-xs font-black rounded-sm bg-white/95 backdrop-blur-sm text-slate-900 border border-slate-200 shadow-sm">
                                                        ₹{courseItem.price}
                                                    </div>
                                                )}

                                                {courseItem.course.category?.name && (
                                                    <div className="absolute bottom-3 left-3">
                                                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-sm bg-white/90 text-slate-700 backdrop-blur-sm border border-slate-200">
                                                            {courseItem.course.category.name}
                                                        </span>
                                                    </div>
                                                )}

                                                {progressPercent > 0 && (
                                                    <div className="absolute bottom-3 right-3">
                                                        <div className="px-2.5 py-1 rounded-sm bg-blue-600 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider">
                                                            {Math.round(progressPercent)}% Complete
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-6">
                                                <h3 className="text-lg font-black text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                                    {courseItem.course.title}
                                                </h3>
                                                <p className="text-slate-500 text-xs font-medium mt-2 line-clamp-2 leading-relaxed">
                                                    {courseItem.course.description || 'No description available'}
                                                </p>

                                                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
                                                    <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold">
                                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                        </svg>
                                                        <span><strong className="text-slate-900">{courseItem.course?.modules?.length || 0}</strong> Modules</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold">
                                                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                        <span><strong className="text-slate-900">{totalCourseTopics}</strong> Topics</span>
                                                    </div>
                                                </div>

                                                {progressPercent > 0 && (
                                                    <div className="mt-4">
                                                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                                            <span>Progress</span>
                                                            <span>{completedCount}/{totalCourseTopics} topics</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-blue-600 rounded-full transition-all duration-300" 
                                                                style={{ width: `${progressPercent}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 mt-4 text-slate-500 text-xs font-bold">
                                                    <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                                                        <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                    <span>By {getInstructorName(courseItem.course.instructor)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-6 pb-6 pt-0">
                                            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-sm bg-slate-900 text-white font-bold text-xs uppercase tracking-widest group-hover:bg-blue-600 transition-all group/btn">
                                                {progressPercent === 100 ? 'Review Course' : progressPercent > 0 ? 'Continue Learning' : 'Start Learning'}
                                                <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // DETAIL VIEW
    const hasModules = selectedCourse?.course?.modules?.length > 0;
    const currentCourseProgress = courseProgress[selectedCourse?.course?._id] || {};
    const courseProgressPercent = currentCourseProgress.percentage || progressPercentage;
    const courseCompletedCount = currentCourseProgress.completedCount || completedTopicsCount;

    return (
        <div className={isEmbedded ? "w-full bg-white font-poppins border border-slate-200 rounded-sm overflow-hidden" : "min-h-screen bg-white font-poppins flex flex-col md:flex-row"}>
            {!isEmbedded && renderStudentSidebar()}

            <div className="flex-1 min-w-0 flex flex-col min-h-screen">
                {/* Topbar */}
                <div className="sticky top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 shadow-xs">                <div className="flex items-center justify-between px-4 md:px-6 h-14">
                    <button onClick={() => { setSelectedCourse(null); setSelectedTopic(null); }} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="hidden sm:inline">All Courses</span>
                    </button>
                    <div className="font-semibold text-gray-800 truncate max-w-[150px] sm:max-w-[200px] md:max-w-md">{selectedCourse.course.title}</div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 hidden sm:inline">{courseCompletedCount}/{totalTopics}</span>
                        <div className="w-24 md:w-32 h-1.5 bg-gray-100 rounded-sm overflow-hidden">
                            <div className="h-full bg-gray-600 rounded-sm transition-all duration-300" style={{ width: `${courseProgressPercent}%` }}></div>
                        </div>
                        <span className="text-xs font-mono text-gray-500">{Math.round(courseProgressPercent)}%</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row">
                {/* SIDEBAR */}
                <aside className="order-2 lg:order-1 w-full lg:w-80 xl:w-96 bg-gray-50 border-r border-gray-200 h-auto lg:h-[calc(100vh-7.5rem)] lg:sticky top-[120px] overflow-y-auto">
                    <div className="p-5 border-b border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-sm bg-gray-200 flex items-center justify-center shadow-sm overflow-hidden">
                                {selectedCourse.course.image ? (
                                    <img src={selectedCourse.course.image} className="w-full h-full object-cover rounded-sm" alt="" />
                                ) : (
                                    <img
                                        src={getDummyImage(selectedCourse.course.title)}
                                        className="w-full h-full object-cover rounded-sm"
                                        alt=""
                                    />
                                )}
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-800 text-lg line-clamp-1">{selectedCourse.course.title}</h2>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-gray-200 text-gray-600">{selectedCourse.course.level || 'Beginner'}</span>
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-gray-100 text-gray-500">{selectedCourse.course.modules?.length || 0}M · {totalTopics}T</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Course Progress</span>
                            <span>{Math.round(courseProgressPercent)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-sm overflow-hidden">
                            <div className="h-full bg-gray-600 rounded-sm transition-all" style={{ width: `${courseProgressPercent}%` }}></div>
                        </div>
                    </div>

                    <div className="px-5 pt-5 pb-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">CURRICULUM</span>
                        </div>
                    </div>

                    <div className="px-3 pb-6">
                        {!hasModules ? (
                            <div className="text-center py-8 text-gray-400 text-sm">No modules available yet.</div>
                        ) : (
                            selectedCourse.course.modules.map((module, mIdx) => {
                                const moduleTopicsCount = (module?.chapters || []).reduce((a, c) => a + (c?.topics?.length || 0), 0);
                                const moduleCompleted = (module?.chapters || []).reduce((a, c) =>
                                    a + (c?.topics?.filter(t => videoCompleted[t._id]).length || 0), 0);
                                const mProgress = moduleTopicsCount > 0 ? (moduleCompleted / moduleTopicsCount) * 100 : 0;
                                const modId = module._id || module.id;
                                const isExpanded = expandedModuleId === modId;

                                return (
                                    <div key={modId} className="mb-3">
                                        <button
                                            onClick={() => handleModuleClick(modId)}
                                            className="w-full flex items-center justify-between p-3 rounded-sm bg-white border border-gray-200 hover:bg-gray-50 transition-all group"
                                        >
                                            <div className="flex flex-col items-start gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-sm">MT - {moduleTopicsCount} UNITS</span>
                                                    <span className="text-xs text-gray-400">{Math.round(mProgress)}%</span>
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 text-left">{module.title}</span>
                                                <div className="w-32 h-1 bg-gray-100 rounded-sm mt-1">
                                                    <div className="h-full bg-gray-500 rounded-sm" style={{ width: `${mProgress}%` }}></div>
                                                </div>
                                            </div>
                                            <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {isExpanded && (
                                            <div className="mt-2 ml-4 space-y-2 border-l-2 border-gray-300 pl-3">
                                                {(module.chapters || []).map((chapter, cIdx) => (
                                                    <div key={chapter._id || chapter.id} className="mb-3">
                                                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">CH {cIdx + 1} — {chapter.title}</div>
                                                        <div className="space-y-1">
                                                            {(chapter.topics || []).map((topic, tIdx) => (
                                                                <button
                                                                    key={topic._id}
                                                                    onClick={() => handleTopicClick(topic)}
                                                                    className={`w-full flex items-center justify-between p-2 rounded-sm text-left transition-all ${selectedTopic?._id === topic._id
                                                                        ? 'bg-gray-100 border border-gray-300 shadow-sm'
                                                                        : 'hover:bg-gray-50'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-gray-400 font-mono w-6">{String(tIdx + 1).padStart(2, '0')}</span>
                                                                        <span className="text-sm text-gray-600">{topic.title}</span>
                                                                    </div>
                                                                    {videoCompleted[topic._id] && (
                                                                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!module.chapters || module.chapters.length === 0) && (
                                                    <div className="text-gray-400 text-xs p-2">No chapters available</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="order-1 lg:order-2 flex-1 overflow-y-auto h-auto lg:h-[calc(100vh-3.5rem)] bg-white">
                    <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                        {selectedTopic ? (
                            <div>
                                <div className="max-w-5xl mx-auto">
                                    <div className="bg-black rounded-sm overflow-hidden shadow-lg">
                                        <div className="aspect-video bg-black">
                                            {selectedTopic.videoType === 'youtube' && embedUrl ? (
                                                <iframe
                                                    src={embedUrl}
                                                    title={selectedTopic.title}
                                                    className="w-full h-full"
                                                    frameBorder="0"
                                                    allowFullScreen
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                ></iframe>
                                            ) : selectedTopic.videoUrl && selectedTopic.videoType === 'upload' ? (
                                                <video
                                                    src={selectedTopic.videoUrl}
                                                    controls
                                                    className="w-full h-full"
                                                    onEnded={() => handleTopicProgress(selectedTopic._id)}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
                                                    <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-gray-500 mt-2">No video available</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Mark Complete Row */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mt-4 bg-gray-50 rounded-sm p-3 border border-gray-200">
                                        {!videoCompleted[selectedTopic._id] ? (
                                            <>
                                                <span className="text-sm text-gray-500">📺 Watch and mark as complete</span>
                                                <button
                                                    onClick={() => handleTopicProgress(selectedTopic._id)}
                                                    disabled={markingProgress || videoCompleted[selectedTopic._id]}
                                                    className="px-4 py-1.5 bg-black hover:bg-gray-800 rounded-sm text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {videoCompleted[selectedTopic._id]
                                                        ? "Completed"
                                                        : markingProgress
                                                            ? "Marking..."
                                                            : "Mark Complete"}
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-2 text-green-600">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="font-medium">Topic Completed</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Topic Content */}
                                    <div className="mt-6 space-y-5">
                                        <div>
                                            <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wide">
                                                <span>Topic</span> <span className="text-gray-300">•</span>
                                                <span className="text-gray-600">{selectedTopic.title}</span>
                                            </div>
                                            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mt-2">{selectedTopic.title}</h1>
                                            {selectedTopic.description && (
                                                <div
                                                    className="mt-3 text-gray-600 prose prose-gray max-w-none text-sm"
                                                    dangerouslySetInnerHTML={{ __html: selectedTopic.description }}
                                                />
                                            )}
                                        </div>

                                        {selectedTopic.notesUrl && (
                                            <div className="bg-gray-50 rounded-sm p-4 border border-gray-200">
                                                <div className="flex items-center gap-2 text-gray-600 mb-2">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <h3 className="font-semibold text-gray-700">Study Notes</h3>
                                                </div>
                                                <p className="text-gray-500 text-sm">{selectedTopic.notes || 'No notes available for this topic.'}</p>
                                                <button
                                                    onClick={(e) => handleDownloadNotes(e, selectedTopic.notesUrl, selectedTopic.title)}
                                                    className="inline-flex items-center gap-2 mt-3 text-sm text-gray-600 hover:text-gray-800 transition cursor-pointer"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                    Download PDF
                                                </button>
                                            </div>
                                        )}

                                        {/* Navigation Buttons */}
                                        <div className="flex items-center justify-between pt-5 border-t border-gray-200">
                                            <button
                                                onClick={handlePrevTopic}
                                                disabled={!prevTopic}
                                                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-sm transition ${prevTopic
                                                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                    : 'opacity-30 cursor-not-allowed text-gray-300'
                                                    }`}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                                <span className="hidden sm:inline">Previous</span>
                                                <span className="sm:hidden">Prev</span>
                                            </button>
                                            <span className="text-sm text-gray-400">{currentTopicIndex + 1} / {allTopics.length}</span>
                                            <button
                                                onClick={handleNextTopic}
                                                disabled={!nextTopic}
                                                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-sm transition ${nextTopic
                                                    ? 'bg-black hover:bg-gray-800 text-white'
                                                    : 'opacity-30 cursor-not-allowed bg-gray-100 text-gray-400'
                                                    }`}
                                            >
                                                <span>Next</span>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-24 h-24 rounded-sm bg-gray-100 flex items-center justify-center mb-6">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-700">Select a Topic</h2>
                                <p className="text-gray-400 mt-2 max-w-sm">Choose a topic from the curriculum sidebar to begin learning.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    </div>
);
};

export default PurchasedCourse;