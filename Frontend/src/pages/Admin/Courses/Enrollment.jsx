// pages/Enrollment.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, RefreshCw, Eye, BookOpen, User, Phone, 
  Mail, Calendar, DollarSign, GraduationCap, X, 
  ChevronLeft, ChevronRight, Layers, FileText, CheckCircle2, AlertCircle 
} from 'lucide-react';
import useStudentStore from '../../../Store/studentstore';
import api from '../../../services/adminendpoint';
import Loader from '../../../components/AdminComponent/Loader';
import TestPurchases from '../TestPurchases';

const Enrollment = ({ defaultTab }) => {
    const { student } = useStudentStore();  
    const studentId = student?._id;  
    
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = defaultTab || (searchParams.get('tab') === 'tests' ? 'tests' : 'courses');
    const [activeTab, setActiveTab] = useState(initialTab);
  
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const itemsPerPage = 10;

    const GetAllPurchesCourse = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(api.enroll.getpurchesCourse);
            
            if (res.data && res.data.success && res.data.data) {
                const transformedData = transformEnrollmentData(res.data.data);
                setEnrollments(transformedData);
            } else {
                setEnrollments([]);
            }
        } catch (error) {
            console.error("Error fetching enrollments:", error);
            setError(error.response?.data?.message || "Failed to fetch enrollments");
            setEnrollments([]);
        } finally {
            setLoading(false);
        }
    };

    const transformEnrollmentData = (data) => {
        if (!Array.isArray(data)) return [];
        
        return data.map(enrollment => {
            const course = enrollment.course || {};
            const studentInfo = enrollment.student || {};
            
            return {
                _id: enrollment._id,
                enrollmentId: enrollment.orderId || enrollment._id,
                studentId: studentInfo._id || enrollment.student,
                studentName: studentInfo.fullName || 'Unknown Student',
                email: studentInfo.email || 'No email',
                phone: studentInfo.phone || 'N/A',
                studentGender: studentInfo.gender || 'Not specified',
                studentClass: studentInfo.class || 'N/A',
                studentAddress: studentInfo.address || 'N/A',
                studentAvatar: studentInfo.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentInfo.fullName || 'Student')}&background=0078FF&color=fff`,
                courseTitle: course.title || 'Unknown Course',
                courseDescription: course.description || 'No description available',
                instructor: course.instructor || 'Unknown Instructor',
                level: course.level || 'Beginner',
                duration: calculateCourseDuration(course),
                amount: enrollment.amount || course.price || 0,
                status: enrollment.status === 'success' ? 'Active' : 
                        enrollment.status === 'pending' ? 'Pending' : 
                        enrollment.status === 'cancelled' ? 'Cancelled' : 'Active',
                paymentStatus: enrollment.paymentStatus === 'success' ? 'Paid' :
                              enrollment.paymentStatus === 'pending' ? 'Pending' :
                              enrollment.paymentStatus === 'failed' ? 'Failed' : 'Paid',
                enrollmentDate: enrollment.enrolledAt || enrollment.createdAt || new Date().toISOString(),
                orderId: enrollment.orderId,
                paymentId: enrollment.paymentId
            };
        });
    };

    const calculateCourseDuration = (course) => {
        if (!course || !course.modules) return 'N/A';
        let totalMinutes = 0;
        if (course.modules && Array.isArray(course.modules)) {
            course.modules.forEach(module => {
                if (module.chapters && Array.isArray(module.chapters)) {
                    module.chapters.forEach(chapter => {
                        if (chapter.topics && Array.isArray(chapter.topics)) {
                            chapter.topics.forEach(topic => {
                                totalMinutes += topic.duration || 10;
                            });
                        }
                    });
                }
            });
        }
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    };

    useEffect(() => {
        GetAllPurchesCourse();
    }, []);

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md';
            case 'pending':
                return 'bg-amber-50 text-amber-700 border border-amber-200 rounded-md';
            case 'cancelled':
                return 'bg-rose-50 text-rose-700 border border-rose-200 rounded-md';
            default:
                return 'bg-gray-50 text-gray-700 border border-gray-200 rounded-md';
        }
    };

    const getPaymentBadge = (status) => {
        const paymentConfig = {
            'Paid': 'bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md',
            'Pending': 'bg-amber-50 text-amber-700 border border-amber-200 rounded-md',
            'Failed': 'bg-rose-50 text-rose-700 border border-rose-200 rounded-md',
            'Refunded': 'bg-purple-50 text-purple-700 border border-purple-200 rounded-md'
        };
        return paymentConfig[status] || 'bg-gray-50 text-gray-700 border border-gray-200 rounded-md';
    };

    const getFilteredAndSortedEnrollments = () => {
        if (!Array.isArray(enrollments) || enrollments.length === 0) return [];

        let filtered = enrollments.filter(enrollment => {
            if (!enrollment) return false;

            const matchesSearch =
                (enrollment.studentName && enrollment.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (enrollment.courseTitle && enrollment.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (enrollment.email && enrollment.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (enrollment.enrollmentId && enrollment.enrollmentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (enrollment.studentId && enrollment.studentId.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = selectedStatus === 'All' || enrollment.status === selectedStatus;

            return matchesSearch && matchesStatus;
        });

        filtered.sort((a, b) => {
            if (sortBy === 'newest') {
                return new Date(b.enrollmentDate) - new Date(a.enrollmentDate);
            } else if (sortBy === 'oldest') {
                return new Date(a.enrollmentDate) - new Date(b.enrollmentDate);
            } else if (sortBy === 'amount-high') {
                return parseFloat(b.amount || 0) - parseFloat(a.amount || 0);
            } else if (sortBy === 'amount-low') {
                return parseFloat(a.amount || 0) - parseFloat(b.amount || 0);
            } else if (sortBy === 'student') {
                return (a.studentName || '').localeCompare(b.studentName || '');
            }
            return 0;
        });

        return filtered;
    };

    const filteredEnrollments = getFilteredAndSortedEnrollments();
    
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEnrollments = filteredEnrollments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredEnrollments.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const getUniqueStatuses = () => {
        if (!Array.isArray(enrollments) || enrollments.length === 0) return ['All'];
        const statuses = ['All', ...new Set(enrollments.map(e => e.status).filter(s => s))];
        return statuses;
    };

    const statuses = getUniqueStatuses();

    const handleViewDetails = (enrollment) => {
        setSelectedEnrollment(enrollment);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedEnrollment(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    if (loading) {
        return <Loader message="Loading Enrollments..." />;
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans pb-12 w-full max-w-full overflow-x-hidden">
            {/* Header Section - Clean & Flat, Zero Drop Shadows */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="p-1 rounded-md bg-blue-50 text-[#0078FF]">
                                    <GraduationCap size={15} />
                                </span>
                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    Registrations & Purchases
                                </span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                                Enrollment Management
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                Track and manage course enrollments and mock test series purchases
                            </p>
                        </div>
                        {activeTab === 'courses' && (
                            <button 
                                onClick={GetAllPurchesCourse} 
                                className="self-start sm:self-auto px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                                title="Refresh enrollments list"
                            >
                                <RefreshCw size={13} className={loading ? "animate-spin text-[#0078FF]" : "text-gray-500"} />
                                <span>Refresh</span>
                            </button>
                        )}
                    </div>

                    {/* Tab Switchers - Real Vector Icons */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 border-t border-gray-100 pt-3">
                        <button
                            onClick={() => {
                                setActiveTab('courses');
                                setSearchParams({ tab: 'courses' });
                            }}
                            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                                activeTab === 'courses'
                                    ? 'bg-blue-50 text-[#0078FF] border border-blue-200'
                                    : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                            }`}
                        >
                            <BookOpen size={16} className={activeTab === 'courses' ? 'text-[#0078FF]' : 'text-gray-500'} />
                            <span>Course Enrollments</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                activeTab === 'courses' ? 'bg-[#0078FF] text-white' : 'bg-gray-200 text-gray-700'
                            }`}>
                                {enrollments.length}
                            </span>
                        </button>

                        <button
                            onClick={() => {
                                setActiveTab('tests');
                                setSearchParams({ tab: 'tests' });
                            }}
                            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                                activeTab === 'tests'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                            }`}
                        >
                            <FileText size={16} className={activeTab === 'tests' ? 'text-emerald-600' : 'text-gray-500'} />
                            <span>Mock Test Purchases (₹)</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                activeTab === 'tests' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                                Paid Tests
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-5">
                {activeTab === 'tests' ? (
                    <TestPurchases isEmbedded={true} />
                ) : (
                    <div className="space-y-4">
                        {/* Error Alert */}
                        {error && (
                            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <AlertCircle size={18} className="text-rose-600 shrink-0" />
                                    <span><strong>Error:</strong> {error}</span>
                                </div>
                                <button
                                    onClick={GetAllPurchesCourse}
                                    className="text-rose-700 font-bold hover:text-rose-900 underline text-xs cursor-pointer"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* Search & Filters Section */}
                        {enrollments.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200/80 p-4 sm:p-5 shadow-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">
                                    {/* Search Input */}
                                    <div className="sm:col-span-2 lg:col-span-6">
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                            Search Enrollments
                                        </label>
                                        <div className="relative">
                                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search by student, course, or enrollment ID..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm font-normal text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0078FF] transition"
                                            />
                                        </div>
                                    </div>

                                    {/* Enrollment Status Filter */}
                                    <div className="sm:col-span-1 lg:col-span-3">
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                            Enrollment Status
                                        </label>
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal text-gray-800 focus:outline-none focus:border-[#0078FF] transition cursor-pointer"
                                        >
                                            {statuses.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Sort Dropdown */}
                                    <div className="sm:col-span-1 lg:col-span-3">
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                            Sort By
                                        </label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal text-gray-800 focus:outline-none focus:border-[#0078FF] transition cursor-pointer"
                                        >
                                            <option value="newest">Newest First</option>
                                            <option value="oldest">Oldest First</option>
                                            <option value="amount-high">Amount: High to Low</option>
                                            <option value="amount-low">Amount: Low to High</option>
                                            <option value="student">Student Name A-Z</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Mobile Card View - For screens below 768px */}
                        {!loading && !error && filteredEnrollments.length > 0 && (
                            <div className="block md:hidden space-y-3">
                                {currentEnrollments.map((enrollment) => (
                                    <div key={enrollment._id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                                        {/* Card Top */}
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0078FF] font-bold text-sm flex items-center justify-center shrink-0 border border-blue-200/60 overflow-hidden">
                                                    <img
                                                        className="w-full h-full object-cover"
                                                        src={enrollment.studentAvatar}
                                                        alt={enrollment.studentName}
                                                        onError={(e) => {
                                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(enrollment.studentName)}&background=0078FF&color=fff`;
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-gray-900">
                                                        {enrollment.studentName}
                                                    </h3>
                                                    <p className="text-xs font-medium text-gray-500">
                                                        ID: <span className="font-mono text-gray-700">{enrollment.enrollmentId?.slice(-8)}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${getStatusBadge(enrollment.status)}`}>
                                                {enrollment.status}
                                            </span>
                                        </div>

                                        {/* Course Details */}
                                        <div className="bg-gray-50/70 rounded-lg p-2.5 border border-gray-100">
                                            <p className="text-sm font-bold text-gray-900">{enrollment.courseTitle}</p>
                                            <p className="text-xs font-medium text-gray-500 mt-0.5">Level: {enrollment.level}</p>
                                        </div>

                                        {/* Meta Row */}
                                        <div className="flex flex-wrap justify-between items-center gap-2 pt-1 border-t border-gray-100 text-xs">
                                            <span className="font-medium text-gray-500 flex items-center gap-1">
                                                <Calendar size={13} className="text-gray-400" />
                                                {formatDate(enrollment.enrollmentDate)}
                                            </span>
                                            <span className="font-bold text-sm text-[#0078FF]">
                                                ₹{parseFloat(enrollment.amount).toLocaleString()}
                                            </span>
                                            <span className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${getPaymentBadge(enrollment.paymentStatus)}`}>
                                                {enrollment.paymentStatus}
                                            </span>
                                        </div>

                                        {/* Action Button */}
                                        <div className="pt-2 border-t border-gray-100 flex justify-end">
                                            <button
                                                onClick={() => handleViewDetails(enrollment)}
                                                className="w-full py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0078FF] border border-blue-200/80 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                                            >
                                                <Eye size={14} />
                                                <span>View Details</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Desktop Table View - 100% Fit, Zero Overflow, Zero Scrollbar */}
                        {!error && enrollments.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-gray-200 p-6">
                                <GraduationCap size={40} className="mx-auto text-gray-300 mb-3" />
                                <h3 className="text-base font-bold text-gray-900">No enrollments found</h3>
                                <p className="mt-1 text-sm text-gray-500">No students have enrolled in any courses yet.</p>
                                <button
                                    onClick={GetAllPurchesCourse}
                                    className="mt-4 px-4 py-2 bg-[#0078FF] hover:bg-blue-600 text-white rounded-lg transition-colors text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                    <RefreshCw size={13} />
                                    <span>Refresh</span>
                                </button>
                            </div>
                        ) : filteredEnrollments.length === 0 && enrollments.length > 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-gray-200 p-6">
                                <Search size={40} className="mx-auto text-gray-300 mb-3" />
                                <h3 className="text-base font-bold text-gray-900">No matching enrollments</h3>
                                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                            </div>
                        ) : filteredEnrollments.length > 0 ? (
                            <div className="hidden md:block bg-white rounded-xl border border-gray-200/80 overflow-hidden w-full shadow-xs">
                                <table className="w-full table-fixed text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#F8FAFC] border-b border-gray-200 text-gray-500">
                                            <th className="px-3 py-3.5 text-xs font-semibold uppercase tracking-wider w-[12%]">
                                                Enrollment ID
                                            </th>
                                            <th className="px-3 py-3.5 text-xs font-semibold uppercase tracking-wider w-[22%]">
                                                Student Details
                                            </th>
                                            <th className="px-3 py-3.5 text-xs font-semibold uppercase tracking-wider w-[20%]">
                                                Course
                                            </th>
                                            <th className="px-3 py-3.5 text-xs font-semibold uppercase tracking-wider w-[12%]">
                                                Enrollment Date
                                            </th>
                                            <th className="px-3 py-3.5 text-xs font-semibold uppercase tracking-wider w-[8%]">
                                                Amount
                                            </th>
                                            <th className="px-3 py-3.5 text-xs font-semibold uppercase tracking-wider w-[9%] text-center">
                                                Status
                                            </th>
                                            <th className="px-3 py-3.5 text-xs font-semibold uppercase tracking-wider w-[9%] text-center">
                                                Payment
                                            </th>
                                            <th className="px-3 py-3.5 text-xs font-semibold uppercase tracking-wider w-[8%] text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {currentEnrollments.map((enrollment) => (
                                            <tr key={enrollment._id} className="hover:bg-gray-50/70 transition-colors">
                                                {/* Enrollment ID */}
                                                <td className="px-3 py-3.5 align-middle">
                                                    <span className="text-xs font-mono font-medium text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 inline-block truncate max-w-full">
                                                        {enrollment.enrollmentId?.slice(-8) || 'N/A'}
                                                    </span>
                                                </td>

                                                {/* Student Details - Less bold, natural medium weight */}
                                                <td className="px-3 py-3.5 align-middle">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0078FF] font-semibold text-xs flex items-center justify-center shrink-0 border border-blue-200/60 overflow-hidden">
                                                            <img
                                                                className="w-full h-full object-cover"
                                                                src={enrollment.studentAvatar}
                                                                alt={enrollment.studentName}
                                                                onError={(e) => {
                                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(enrollment.studentName)}&background=0078FF&color=fff`;
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-sm font-semibold text-gray-900 tracking-tight truncate" title={enrollment.studentName}>
                                                                {enrollment.studentName}
                                                            </div>
                                                            <div className="text-xs font-normal text-gray-400 truncate" title={enrollment.email}>
                                                                {enrollment.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Course - Medium weight */}
                                                <td className="px-3 py-3.5 align-middle">
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-medium text-gray-900 tracking-tight truncate" title={enrollment.courseTitle}>
                                                            {enrollment.courseTitle}
                                                        </div>
                                                        <div className="text-xs font-normal text-gray-400 truncate">
                                                            Level: <span className="capitalize">{enrollment.level}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Date */}
                                                <td className="px-3 py-3.5 align-middle">
                                                    <div className="text-xs sm:text-sm font-normal text-gray-600 whitespace-nowrap">
                                                        {formatDate(enrollment.enrollmentDate)}
                                                    </div>
                                                </td>

                                                {/* Amount - Semibold instead of thick bold */}
                                                <td className="px-3 py-3.5 align-middle">
                                                    <div className="text-sm font-semibold text-[#0078FF] whitespace-nowrap">
                                                        ₹{parseFloat(enrollment.amount).toLocaleString()}
                                                    </div>
                                                </td>

                                                {/* Status - Medium weight badge */}
                                                <td className="px-3 py-3.5 align-middle text-center">
                                                    <span className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded uppercase tracking-wider whitespace-nowrap ${getStatusBadge(enrollment.status)}`}>
                                                        {enrollment.status}
                                                    </span>
                                                </td>

                                                {/* Payment - Medium weight badge */}
                                                <td className="px-3 py-3.5 align-middle text-center">
                                                    <span className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded uppercase tracking-wider whitespace-nowrap ${getPaymentBadge(enrollment.paymentStatus)}`}>
                                                        {enrollment.paymentStatus}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-3 py-3.5 align-middle text-right">
                                                    <button
                                                        onClick={() => handleViewDetails(enrollment)}
                                                        className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-[#0078FF] border border-blue-200/80 text-xs font-medium inline-flex items-center gap-1 transition cursor-pointer whitespace-nowrap"
                                                        title="View details"
                                                    >
                                                        <Eye size={12} />
                                                        <span>View</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="bg-white px-4 sm:px-5 py-3 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                                        <div className="text-xs sm:text-sm font-medium text-gray-500">
                                            Showing <strong className="text-gray-900 font-bold">{indexOfFirstItem + 1}</strong> to <strong className="text-gray-900 font-bold">{Math.min(indexOfLastItem, filteredEnrollments.length)}</strong> of <strong className="text-gray-900 font-bold">{filteredEnrollments.length}</strong> enrollments
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button 
                                                onClick={() => paginate(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className={`px-2.5 py-1 rounded-lg border text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1 ${
                                                    currentPage === 1 
                                                        ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed' 
                                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer'
                                                }`}
                                            >
                                                <ChevronLeft size={14} />
                                                <span>Prev</span>
                                            </button>

                                            {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = index + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = index + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + index;
                                                } else {
                                                    pageNum = currentPage - 2 + index;
                                                }
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => paginate(pageNum)}
                                                        className={`min-w-7 px-2 py-1 rounded-lg border text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                                                            currentPage === pageNum
                                                                ? 'bg-[#0078FF] border-[#0078FF] text-white'
                                                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}

                                            <button 
                                                onClick={() => paginate(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className={`px-2.5 py-1 rounded-lg border text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1 ${
                                                    currentPage === totalPages 
                                                        ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed' 
                                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer'
                                                }`}
                                            >
                                                <span>Next</span>
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}

                        {/* Mobile Pagination */}
                        {!loading && filteredEnrollments.length > 0 && totalPages > 1 && (
                            <div className="block md:hidden mt-3">
                                <div className="flex justify-between items-center gap-2">
                                    <button 
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                                            currentPage === 1 
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        ← Prev
                                    </button>
                                    <span className="text-xs font-bold text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button 
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                                            currentPage === totalPages 
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Enrollment Details Modal */}
            {showModal && selectedEnrollment && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-gray-200">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 sm:px-6 py-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 text-[#0078FF] font-bold text-sm flex items-center justify-center shrink-0 overflow-hidden">
                                    <img
                                        src={selectedEnrollment.studentAvatar}
                                        alt={selectedEnrollment.studentName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedEnrollment.studentName)}&background=0078FF&color=fff`;
                                        }}
                                    />
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                                        Enrollment Details
                                    </h2>
                                    <p className="text-xs font-mono font-semibold text-gray-500">
                                        ID: {selectedEnrollment.enrollmentId}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={closeModal}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                                title="Close modal"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-5 sm:p-6 space-y-4">
                            {/* Student Information */}
                            <div className="bg-gray-50/70 rounded-xl p-4 border border-gray-200/80 space-y-3">
                                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                    <User size={14} className="text-[#0078FF]" />
                                    <span>Student Information</span>
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                                    <div>
                                        <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Full Name</span>
                                        <span className="font-bold text-gray-900 break-words">{selectedEnrollment.studentName}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Email Address</span>
                                        <span className="font-medium text-gray-800 break-words">{selectedEnrollment.email}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Phone Number</span>
                                        <span className="font-medium text-gray-800">{selectedEnrollment.phone}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Gender</span>
                                        <span className="font-medium text-gray-800 capitalize">{selectedEnrollment.studentGender}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Class</span>
                                        <span className="font-medium text-gray-800">{selectedEnrollment.studentClass}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Address</span>
                                        <span className="font-medium text-gray-800 break-words">{selectedEnrollment.studentAddress}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Course Information */}
                            <div className="bg-gray-50/70 rounded-xl p-4 border border-gray-200/80 space-y-3">
                                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                    <BookOpen size={14} className="text-[#0078FF]" />
                                    <span>Course Information</span>
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                                    <div className="sm:col-span-2">
                                        <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Course Title</span>
                                        <span className="font-bold text-gray-900 break-words">{selectedEnrollment.courseTitle}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Instructor</span>
                                        <span className="font-medium text-gray-800">{selectedEnrollment.instructor}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Duration</span>
                                        <span className="font-medium text-gray-800">{selectedEnrollment.duration}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Course Level</span>
                                        <span className="font-medium text-gray-800 capitalize">{selectedEnrollment.level}</span>
                                    </div>
                                    {selectedEnrollment.courseDescription && (
                                        <div className="sm:col-span-2">
                                            <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Description</span>
                                            <span className="font-normal text-gray-700 text-xs sm:text-sm break-words">{selectedEnrollment.courseDescription}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment & Order Details */}
                            <div className="bg-gray-50/70 rounded-xl p-4 border border-gray-200/80 space-y-3">
                                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                    <DollarSign size={14} className="text-[#0078FF]" />
                                    <span>Enrollment & Payment Details</span>
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                                    <div>
                                        <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Enrollment Date</span>
                                        <span className="font-semibold text-gray-800">{formatDate(selectedEnrollment.enrollmentDate)}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Amount Paid</span>
                                        <span className="font-bold text-sm text-[#0078FF]">₹{parseFloat(selectedEnrollment.amount).toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Order ID</span>
                                        <span className="font-mono text-xs text-gray-700 break-words">{selectedEnrollment.orderId || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Payment ID</span>
                                        <span className="font-mono text-xs text-gray-700 break-words">{selectedEnrollment.paymentId || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider mb-1">Enrollment Status</span>
                                        <span className={`inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${getStatusBadge(selectedEnrollment.status)}`}>
                                            {selectedEnrollment.status}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider mb-1">Payment Status</span>
                                        <span className={`inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${getPaymentBadge(selectedEnrollment.paymentStatus)}`}>
                                            {selectedEnrollment.paymentStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-gray-200 px-5 sm:px-6 py-3.5 bg-gray-50 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold transition cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Enrollment;