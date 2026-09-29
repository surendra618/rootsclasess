// StudentProfile.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import api from '../../services/endpoints';
import useStudentStore from '../../Store/studentstore';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import StudentTestPanel from '../../pages/Student/TestList';
import PurchasedCourse from './PurchesCourses';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    GraduationCap,
    Heart,
    Camera,
    Edit3,
    ChevronRight,
    ArrowLeft,
    ShieldCheck,
    BookOpen,
    Award,
    LayoutDashboard,
    LogOut,
    Menu,
    X,
    Sparkles,
    Settings,
    FileText,
    CheckCircle2
} from 'lucide-react';

const StudentProfile = () => {
    const { student, setStudent } = useStudentStore();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [studentData, setStudentData] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [saving, setSaving] = useState(false);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [testResults, setTestResults] = useState([]);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'courses', 'academic', 'settings'
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        dateofBirth: '',
        gender: '',
        currentClass: '',
        interestedCourse: '',
        address: '',
    });

    const getStudentId = () => {
        if (student?._id) return student._id;
        if (student?.user?._id) return student.user._id;
        if (studentData?._id) return studentData._id;

        const storedStudent = localStorage.getItem('student');
        if (storedStudent) {
            try {
                const parsed = JSON.parse(storedStudent);
                return parsed._id || parsed.user?._id;
            } catch (err) {
                console.error("Error parsing localStorage:", err);
            }
        }
        return null;
    };

    const fetchTestResults = async () => {
        const studentId = getStudentId();
        if (!studentId) return;
        try {
            const res = await axios.post(api.result.getStudentResults, { studentId });
            if (res.data?.success && res.data.data) {
                const completed = res.data.data.filter(r => r.isCompleted);
                setTestResults(completed);
            }
        } catch (error) {
            console.error("Error fetching test results:", error);
        }
    };

    const GetStudentData = async () => {
        const studentId = getStudentId();

        if (!studentId) {
            toast.error("Student ID not found. Please log in again.");
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post(api.student.getStudent, {
                studentId: studentId,
            });

            if (res.data.success && res.data.user) {
                setStudentData(res.data.user);
                setFormData({
                    fullName: res.data.user.fullName || '',
                    email: res.data.user.email || '',
                    phone: res.data.user.phone || '',
                    dateofBirth: res.data.user.dateofBirth ? res.data.user.dateofBirth.split('T')[0] : '',
                    gender: res.data.user.gender || '',
                    currentClass: res.data.user.currentClass || '',
                    interestedCourse: res.data.user.interestedCourse || '',
                    address: res.data.user.address || '',
                });

                if (res.data.user.enrolledCourses && Array.isArray(res.data.user.enrolledCourses)) {
                    setEnrolledCourses(res.data.user.enrolledCourses);
                }
                fetchTestResults();
            } else {
                toast.error(res.data.message || "Failed to fetch student data");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch student data");
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            uploadProfile(file);
        }
    };

    const uploadProfile = async (file) => {
        const studentId = getStudentId();
        if (!studentId) {
            toast.error('Student ID not found');
            return;
        }

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append("image", file);
            formData.append("studentId", studentId);

            const response = await axios.post(api.student.editProfile, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            if (response.data.success) {
                setStudentData(prev => ({
                    ...prev,
                    profileImage: response.data.updateduser?.profileImage
                }));
                toast.success('Profile image updated successfully!');
                GetStudentData();
            } else {
                toast.error(response.data.message || 'Failed to upload image');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error uploading image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const editDetails = async (e) => {
        e.preventDefault();
        const studentId = getStudentId();

        if (!studentId) {
            toast.error('Student ID not found');
            return;
        }

        setSaving(true);
        try {
            const res = await axios.post(api.student.editprofiledetails, {
                studentId: studentId,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                dateofBirth: formData.dateofBirth,
                gender: formData.gender,
                currentClass: formData.currentClass,
                interestedCourse: formData.interestedCourse,
                address: formData.address,
            });

            if (res.data.success) {
                toast.success('Profile updated successfully!');
                setStudentData(res.data.user);
                setIsEditing(false);
                if (setStudent) {
                    setStudent({ user: res.data.user, token: localStorage.getItem('token') });
                }
            } else {
                toast.error(res.data.message || 'Failed to update profile');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating profile');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('student');
        localStorage.removeItem('token');
        if (setStudent) setStudent(null);
        toast.info("Logged out successfully");
        navigate('/stdlogin');
    };

    useEffect(() => {
        if (student || getStudentId()) {
            GetStudentData();
        } else {
            toast.error("Please log in to view profile");
            setLoading(false);
        }
    }, [student]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 animate-spin mx-auto rounded-full"></div>
                    <p className="mt-4 text-slate-500 font-bold animate-pulse">Loading Student Dashboard...</p>
                </div>
            </div>
        );
    }

    if (!studentData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="max-w-md w-full bg-white p-8 border border-slate-200 text-center rounded-lg shadow-sm">
                    <div className="w-20 h-20 bg-red-50 flex items-center justify-center mx-auto mb-6 rounded-full">
                        <ShieldCheck className="text-red-500" size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Session Expired</h2>
                    <p className="text-slate-500 font-medium mb-8">We couldn't retrieve your profile data. Please sign in again to access your dashboard.</p>
                    <button
                        onClick={() => navigate('/stdlogin')}
                        className="w-full py-3.5 bg-blue-600 text-white font-bold uppercase tracking-widest hover:bg-blue-700 transition-all rounded-md shadow-xs"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    const profileImageUrl = studentData.profileImage || studentData.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentData.fullName || 'Student')}&background=0078FF&color=fff&size=200&bold=true`;

    const navItems = [
        { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
        { id: 'courses', label: 'My Enrolled Courses', icon: BookOpen, count: enrolledCourses.length },
        { id: 'academic', label: 'Academic Details', icon: GraduationCap },
        { id: 'tests', label: 'Online Mock Tests', icon: FileText, count: testResults.length },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-poppins flex flex-col md:flex-row">

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
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[100px]">{studentData.fullName?.split(' ')[0]}</span>
                </div>
            </div>

            {/* Mobile Overlay */}
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            {/* LEFT SIDEBAR NAVIGATION (Compact Clean White Theme) */}
            <aside className={`
                fixed md:sticky top-0 left-0 h-screen w-60 bg-white text-slate-700 z-50 flex flex-col justify-between
                transition-transform duration-300 ease-in-out border-r border-slate-200 shadow-xs flex-shrink-0
                ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div>
                    {/* Compact Header: Back Button only */}
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
                            <div className="relative group flex-shrink-0">
                                <img
                                    src={profileImageUrl}
                                    alt={studentData.fullName}
                                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs"
                                />
                                <label
                                    htmlFor="sidebarImageUpload"
                                    className="absolute inset-0 bg-slate-900/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <Camera size={12} className="text-white" />
                                </label>
                                <input
                                    type="file"
                                    id="sidebarImageUpload"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                    disabled={uploadingImage}
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-xs font-black text-slate-900 truncate leading-tight">{studentData.fullName}</h3>
                                <p className="text-[10px] font-medium text-slate-500 truncate">{studentData.email}</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">
                                        {studentData.currentClass ? `Class ${studentData.currentClass}` : 'Active Student'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Links (Compact) */}
                    <nav className="p-2.5 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)] custom-scrollbar">
                        <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Main Menu</p>

                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;

                            if (item.isHighlight) {
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            navigate(item.isLink);
                                            setMobileSidebarOpen(false);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 py-2 px-3 my-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md transition-all shadow-xs"
                                    >
                                        <Icon size={15} />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            }

                            if (item.isLink) {
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            navigate(item.isLink, { state: item.linkState });
                                            setMobileSidebarOpen(false);
                                        }}
                                        className="w-full flex items-center justify-between px-3.5 py-2 rounded-sm text-xs md:text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100/80 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                                            <span className="truncate">{item.label}</span>
                                        </div>
                                        {item.count !== undefined && item.count > 0 ? (
                                            <span className="px-2 py-0.5 text-[9px] font-black rounded-sm flex-shrink-0 bg-emerald-100 text-emerald-700">
                                                {item.count} Done
                                            </span>
                                        ) : (
                                            <ChevronRight size={14} className="text-slate-400 group-hover:text-blue-600 flex-shrink-0" />
                                        )}
                                    </button>
                                );
                            }

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
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

                {/* Sidebar Bottom Action Area (Logout Only) */}
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

            {/* MAIN DASHBOARD CONTENT AREA */}
            <div className="flex-1 min-w-0 flex flex-col min-h-screen">

                {/* Desktop Top Header Bar */}
                <header className="hidden md:flex bg-white border-b border-slate-200 sticky top-0 z-30 px-8 py-4 items-center justify-between shadow-2xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">Student Portal</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider capitalize">{activeTab}</span>
                        </div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                            Welcome back, {studentData.fullName?.split(' ')[0]} 👋
                        </h2>
                    </div>

                    <button
                        onClick={() => navigate('/course')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-sm transition-all shadow-xs"
                    >
                        <Sparkles size={15} />
                        <span>Explore Courses</span>
                    </button>
                </header>

                <main className="p-4 sm:p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto space-y-8">

                    {/* Hero Profile Banner */}
                    <section className="bg-white border border-slate-200 overflow-hidden rounded-sm shadow-xs">
                        <div className="h-24 md:h-28 w-full relative overflow-hidden bg-slate-900">
                            <img
                                src="https://chicinfotech.com/assets/img/banner-3.jpeg"
                                alt="Tech Profile Banner"
                                className="w-full h-full object-cover opacity-85"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent"></div>

                            <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                                <div className="px-2.5 py-0.5 bg-black/60 backdrop-blur-md text-white border border-white/10 text-[10px] font-bold tracking-wider rounded-md">
                                    ID: {studentData._id?.slice(-8).toUpperCase()}
                                </div>
                            </div>
                        </div>

                        {/* Profile Info Row */}
                        <div className="p-5 md:p-6 pt-0">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
                                <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                                    <div className="relative group flex-shrink-0 -mt-10 md:-mt-12">
                                        <div className="w-20 h-20 md:w-22 md:h-22 border-3 border-white bg-white overflow-hidden relative rounded-full shadow-md">
                                            <img
                                                src={profileImageUrl}
                                                alt={studentData.fullName}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <label
                                                htmlFor="mainImageUpload"
                                                className={`absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer ${uploadingImage ? 'opacity-100' : ''}`}
                                            >
                                                {uploadingImage ? (
                                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white animate-spin rounded-full"></div>
                                                ) : (
                                                    <div className="flex flex-col items-center text-white">
                                                        <Camera size={18} className="mb-0.5" />
                                                        <span className="text-[8px] font-black uppercase tracking-widest">Update</span>
                                                    </div>
                                                )}
                                            </label>
                                            <input
                                                type="file"
                                                id="mainImageUpload"
                                                accept="image/*"
                                                onChange={handleImageSelect}
                                                className="hidden"
                                                disabled={uploadingImage}
                                            />
                                        </div>
                                        <div className="absolute bottom-1 right-1 bg-emerald-500 border-2 border-white w-4 h-4 rounded-full" title="Active Account"></div>
                                    </div>

                                    <div className="pt-2 md:pt-3">
                                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                                            {studentData.fullName}
                                        </h1>
                                        <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2">
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-tight border border-blue-100 rounded-md">
                                                <GraduationCap size={14} />
                                                {studentData.currentClass ? `Class ${studentData.currentClass}` : 'Student'}
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-tight border border-emerald-100 rounded-md">
                                                <ShieldCheck size={14} />
                                                Verified Student
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-600 transition-all rounded-sm flex-shrink-0 mt-2 md:mt-4"
                                >
                                    <Edit3 size={14} />
                                    <span>Edit Profile</span>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatBox onClick={() => setActiveTab('courses')} icon={<BookOpen className="text-blue-600" />} label="Active Courses" value={enrolledCourses.length} />
                        <StatBox icon={<Award className="text-purple-600" />} label="Current Class" value={studentData.currentClass || 'N/A'} />
                        <StatBox icon={<Calendar className="text-emerald-600" />} label="Member Since" value={studentData.createdAt ? new Date(studentData.createdAt).getFullYear() : '2026'} />
                        <StatBox icon={<Heart className="text-rose-600" />} label="Gender" value={studentData.gender || 'Not set'} />
                    </div>

                    {/* TABBED CONTENT PANELS */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Personal & Academic Details */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className="bg-white p-6 md:p-8 border border-slate-200 rounded-sm shadow-xs">
                                    <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900">Personal Information</h3>
                                            <p className="text-xs text-slate-400 font-medium">Your primary profile details and contact information</p>
                                        </div>
                                        <div className="w-10 h-10 bg-blue-50 flex items-center justify-center rounded-sm">
                                            <User className="text-blue-600" size={20} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                                        <InfoItem icon={<Mail />} label="Email Address" value={studentData.email} />
                                        <InfoItem icon={<Phone />} label="Phone Number" value={studentData.phone ? String(studentData.phone) : 'Not registered'} />
                                        <InfoItem icon={<Calendar />} label="Date of Birth" value={studentData.dateofBirth ? new Date(studentData.dateofBirth).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not set'} />
                                        <InfoItem icon={<Heart />} label="Gender Identity" value={studentData.gender || 'Not specified'} />
                                        <InfoItem icon={<MapPin />} label="Current Address" value={studentData.address || 'No address on file'} className="md:col-span-2" />
                                    </div>
                                </div>

                                <div className="bg-white p-6 md:p-8 border border-slate-200 rounded-sm shadow-xs">
                                    <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900">Academic Level</h3>
                                            <p className="text-xs text-slate-400 font-medium">Your enrolled standard and target subjects</p>
                                        </div>
                                        <div className="w-10 h-10 bg-purple-50 flex items-center justify-center rounded-sm">
                                            <GraduationCap className="text-purple-600" size={20} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-sm">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Academic Class</p>
                                            <p className="text-lg font-black text-slate-900">{studentData.currentClass ? `Class ${studentData.currentClass}` : 'Not Specified'}</p>
                                        </div>
                                        <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-sm">
                                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Interested Subject / Course</p>
                                            <p className="text-lg font-black text-blue-900">{studentData.interestedCourse || 'General Curriculum'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Column: Enrolled Courses Widget */}
                            <div className="space-y-8">
                                <div className="bg-white p-6 md:p-8 border border-slate-200 rounded-sm shadow-xs">
                                    <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                                        <h3 className="text-lg font-black text-slate-900">My Enrolled Courses</h3>
                                        <span className="px-3 py-1 bg-blue-50 border border-blue-100 text-[10px] font-black text-blue-600 uppercase tracking-widest rounded-md">
                                            {enrolledCourses.length} Active
                                        </span>
                                    </div>

                                    {enrolledCourses.length > 0 ? (
                                        <div className="space-y-3">
                                            {enrolledCourses.map((course, idx) => (
                                                <div key={idx} className="group p-4 bg-slate-50 hover:bg-slate-900 border border-slate-200/80 transition-all cursor-pointer rounded-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-white flex items-center justify-center border border-slate-200 group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors rounded-sm flex-shrink-0">
                                                            <BookOpen className="text-blue-600 group-hover:text-white" size={18} />
                                                        </div>

                                                        <div onClick={() => setActiveTab('courses')} className="flex-1 min-w-0 cursor-pointer">
                                                            <div>
                                                                <p className="text-xs font-black text-slate-900 group-hover:text-white truncate">
                                                                    {course.title || 'Course ' + (idx + 1)}
                                                                </p>
                                                                <p className="text-[10px] font-bold text-slate-400 group-hover:text-slate-300">Enrolled & Active</p>
                                                            </div>
                                                        </div>
                                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-white flex-shrink-0" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10">
                                            <div className="w-12 h-12 bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-200 rounded-sm">
                                                <BookOpen className="text-slate-400" size={20} />
                                            </div>
                                            <p className="text-xs font-bold text-slate-500">No active courses enrolled yet</p>
                                            <button
                                                onClick={() => navigate('/course')}
                                                className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-sm uppercase tracking-wider hover:bg-blue-700 transition-colors shadow-xs"
                                            >
                                                Explore Courses
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* My Attempted Tests Widget */}
                                <div className="bg-white p-6 md:p-8 border border-slate-200 rounded-sm shadow-xs">
                                    <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900">My Attempted Tests</h3>
                                            <p className="text-[10px] font-bold text-slate-400">Completed test scores & history</p>
                                        </div>
                                        <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-[10px] font-black text-emerald-700 uppercase tracking-widest rounded-md">
                                            {testResults.length} Completed
                                        </span>
                                    </div>

                                    {testResults.length > 0 ? (
                                        <div className="space-y-3">
                                            {testResults.slice(0, 3).map((resItem, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => setActiveTab('tests')}
                                                    className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer rounded-sm flex items-center justify-between"
                                                >
                                                    <div className="min-w-0 flex-1 pr-2">
                                                        <p className="text-xs font-black text-slate-900 truncate">
                                                            {resItem.testId?.title || 'Mock Assessment #' + (idx + 1)}
                                                        </p>
                                                        <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                                                            Score: <strong className="text-slate-900">{resItem.obtainedMarks || 0}/{resItem.totalMarks || 0}</strong> ({Math.round(resItem.percentage || 0)}%)
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end flex-shrink-0">
                                                        <span className="px-2 py-0.5 text-[9px] font-black rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                            {resItem.percentage >= 70 ? 'Passed' : 'Completed'}
                                                        </span>
                                                        <span className="text-[9px] text-slate-400 font-medium mt-1">
                                                            {resItem.createdAt ? new Date(resItem.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => setActiveTab('tests')}
                                                className="w-full py-2 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-sm transition-colors flex items-center justify-center gap-1.5 mt-2"
                                            >
                                                <span>View All Test Results</span>
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            <FileText className="mx-auto text-slate-300 mb-2" size={28} />
                                            <p className="text-xs font-bold text-slate-500">No tests attempted yet</p>
                                            <button
                                                onClick={() => setActiveTab('tests')}
                                                className="mt-3 px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-sm uppercase tracking-wider hover:bg-blue-700 transition-colors shadow-xs"
                                            >
                                                Take Mock Test
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'courses' && (
                        <div className="w-full">
                            <PurchasedCourse isEmbedded={true} />
                        </div>
                    )}

                    {activeTab === 'academic' && (
                        <div className="bg-white p-6 md:p-8 border border-slate-200 rounded-sm shadow-xs">
                            <div className="border-b border-slate-100 pb-4 mb-6">
                                <h3 className="text-xl font-black text-slate-900">Academic Qualifications & Preferences</h3>
                                <p className="text-xs text-slate-400">Class level and test track registered in your profile</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-slate-50 border border-slate-200 rounded-sm">
                                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-sm flex items-center justify-center mb-3">
                                        <GraduationCap size={20} />
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Enrolled Class</p>
                                    <p className="text-2xl font-black text-slate-900 mt-1">{studentData.currentClass ? `Class ${studentData.currentClass}` : 'Not Set'}</p>
                                </div>

                                <div className="p-6 bg-blue-50 border border-blue-100 rounded-sm">
                                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-sm flex items-center justify-center mb-3">
                                        <GraduationCap size={20} />
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Enrolled Class</p>
                                    <p className="text-2xl font-black text-slate-900 mt-1">{studentData.currentClass ? `Class ${studentData.currentClass}` : 'Not Set'}</p>
                                </div>

                                <div className="p-6 bg-blue-50 border border-blue-100 rounded-sm">
                                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-sm flex items-center justify-center mb-3">
                                        <BookOpen size={20} />
                                    </div>
                                    <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Target Course / Exam</p>
                                    <p className="text-2xl font-black text-blue-950 mt-1">{studentData.interestedCourse || 'Standard Batch'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tests' && (
                        <div className="w-full">
                            <StudentTestPanel isEmbedded={true} initialFilter="completed" />
                        </div>
                    )}
                </main>
            </div>

            {/* EDIT PROFILE MODAL */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-16 md:pt-28 overflow-y-auto animate-fadeIn">
                    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs" onClick={() => setIsEditing(false)}></div>
                    <div className="bg-white w-full max-w-4xl border border-slate-200 relative z-10 overflow-hidden animate-slideUp rounded-none shadow-lg mb-12">
                        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Edit3 size={18} className="text-blue-400" />
                                <h3 className="text-base font-black tracking-tight">Edit Profile Information</h3>
                            </div>
                            <button onClick={() => setIsEditing(false)} className="p-1.5 text-slate-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={editDetails} className="p-6 md:p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <FormInput label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} icon={<User size={16} />} />
                                <FormInput label="Email Address" name="email" value={formData.email} onChange={handleInputChange} icon={<Mail size={16} />} type="email" />
                                <FormInput label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} icon={<Phone size={16} />} type="tel" maxLength="10" />
                                <FormInput label="Current Class" name="currentClass" value={formData.currentClass} onChange={handleInputChange} icon={<GraduationCap size={16} />} />
                                <FormInput label="Interested Course" name="interestedCourse" value={formData.interestedCourse} onChange={handleInputChange} icon={<BookOpen size={16} />} />
                                <FormInput label="Date of Birth" name="dateofBirth" value={formData.dateofBirth} onChange={handleInputChange} icon={<Calendar size={16} />} type="date" />

                                <div className="space-y-1.5 md:col-span-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Gender Identity</label>
                                    <div className="relative">
                                        <Heart size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 text-sm font-bold text-slate-700 focus:border-blue-600 outline-none rounded-none cursor-pointer"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5 md:col-span-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Full Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows="2"
                                        className="w-full px-4 py-3 bg-white border border-slate-200 text-sm font-bold text-slate-700 focus:border-blue-600 outline-none rounded-none resize-none"
                                        placeholder="Enter your current residential address..."
                                    />
                                </div>
                            </div>
                        </form>

                        <div className="p-4 bg-slate-50 flex items-center justify-end gap-3 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-5 py-2.5 bg-white text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-all border border-slate-200 rounded-none shadow-xs"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                onClick={editDetails}
                                disabled={saving}
                                className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all disabled:opacity-50 rounded-none shadow-sm"
                            >
                                {saving ? 'Updating...' : 'Save Profile'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
                .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

const StatBox = ({ icon, label, value, onClick }) => (
    <div onClick={onClick} className={`bg-white p-4 border border-slate-200 flex flex-col items-center justify-center text-center rounded-sm shadow-xs hover:border-slate-300 transition-all ${onClick ? 'cursor-pointer hover:bg-slate-50' : ''}`}>
        <div className="w-10 h-10 bg-slate-50 flex items-center justify-center mb-2 rounded-sm border border-slate-100">
            {icon}
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-black text-slate-900 mt-0.5">{value}</p>
    </div>
);

const InfoItem = ({ icon, label, value, className = "" }) => (
    <div className={`flex items-start gap-3.5 ${className}`}>
        <div className="w-9 h-9 bg-slate-50 flex items-center justify-center flex-shrink-0 text-slate-400 rounded-sm border border-slate-100">
            {React.cloneElement(icon, { size: 16 })}
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-xs font-bold text-slate-800 break-words">{value || 'Not provided'}</p>
        </div>
    </div>
);

const FormInput = ({ label, name, value, onChange, icon, type = "text", maxLength, placeholder }) => (
    <div className="space-y-1.5">
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">{label}</label>
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                {icon}
            </div>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                maxLength={maxLength}
                placeholder={placeholder}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 text-sm font-bold text-slate-700 focus:border-blue-600 outline-none rounded-none placeholder:text-slate-300 shadow-xs"
            />
        </div>
    </div>
);

export default StudentProfile;

