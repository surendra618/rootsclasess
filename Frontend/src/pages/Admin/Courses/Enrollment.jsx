// pages/Enrollment.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useStudentStore from '../../../Store/studentstore';
import api from '../../../services/adminendpoint';
import Loader from '../../../components/AdminComponent/Loader';

const Enrollment = () => {
    const { student } = useStudentStore();  
    const studentId = student?._id;  
  
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
            console.log("API Response:", res.data);
            
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
                studentAvatar: studentInfo.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentInfo.fullName || 'Student')}&background=6366f1&color=fff`,
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
                return 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-md';
            case 'pending':
                return 'bg-amber-50 text-amber-700 border border-amber-200/60 rounded-md';
            case 'cancelled':
                return 'bg-rose-50 text-rose-700 border border-rose-200/60 rounded-md';
            default:
                return 'bg-gray-50 text-gray-700 border border-gray-200/60 rounded-md';
        }
    };

    const getPaymentBadge = (status) => {
        const paymentConfig = {
            'Paid': 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-md',
            'Pending': 'bg-amber-50 text-amber-700 border border-amber-200/60 rounded-md',
            'Failed': 'bg-rose-50 text-rose-700 border border-rose-200/60 rounded-md',
            'Refunded': 'bg-purple-50 text-purple-700 border border-purple-200/60 rounded-md'
        };
        return paymentConfig[status] || 'bg-gray-50 text-gray-700 border border-gray-200/60 rounded-md';
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
        if (!dateString) return 'N/A';
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
        <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 md:p-8 space-y-6">
            {/* Header Section */}
            <div className="bg-white rounded-lg border border-gray-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between sticky top-0 z-20">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-[#0078FF]"></span>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Registrations</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Enrollment Management</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Track and manage all course enrollments and payment statuses</p>
                </div>
                <button onClick={GetAllPurchesCourse} className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-gray-100 transition-all shadow-xs">
                    🔄 Refresh
                </button>
            </div>

            <div className="space-y-6">
                {/* Filters Section */}
                {enrollments.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200/80 shadow-xs p-4 sm:p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Search Bar */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Search Enrollments
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by student, course, or enrollment ID..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 text-xs font-medium border border-gray-200 rounded-md focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none transition-all"
                                    />
                                    <svg
                                        className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Enrollment Status
                                </label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full px-3 py-2 text-xs font-medium border border-gray-200 rounded-md focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none transition-all"
                                >
                                    {statuses.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort By */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Sort By
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-3 py-2 text-xs font-medium border border-gray-200 rounded-md focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none transition-all"
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

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 text-sm">
                        <strong>Error:</strong> {error}
                        <button
                            onClick={GetAllPurchesCourse}
                            className="ml-3 sm:ml-4 text-red-700 font-semibold hover:text-red-800 underline"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Mobile Card View - For screens below 768px */}
                {!loading && !error && filteredEnrollments.length > 0 && (
                    <div className="block md:hidden space-y-3 sm:space-y-4">
                        {currentEnrollments.map((enrollment) => (
                            <div key={enrollment._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-shrink-0">
                                            <img
                                                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover"
                                                src={enrollment.studentAvatar}
                                                alt={enrollment.studentName}
                                                onError={(e) => {
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(enrollment.studentName)}&background=6366f1&color=fff`;
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                                                {enrollment.studentName}
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                ID: {enrollment.enrollmentId?.slice(-8)}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(enrollment.status)}`}>
                                        {enrollment.status}
                                    </span>
                                </div>

                                {/* Course Info */}
                                <div className="mb-3">
                                    <p className="text-sm font-medium text-slate-900">{enrollment.courseTitle}</p>
                                    <p className="text-xs text-slate-500">Level: {enrollment.level}</p>
                                </div>

                                {/* Details Row */}
                                <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-slate-600">
                                    <span className="font-mono">{formatDate(enrollment.enrollmentDate)}</span>
                                    <span className="font-semibold text-indigo-600">₹{parseFloat(enrollment.amount).toLocaleString()}</span>
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getPaymentBadge(enrollment.paymentStatus)}`}>
                                        {enrollment.paymentStatus}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                                    <button
                                        onClick={() => handleViewDetails(enrollment)}
                                        className="text-indigo-600 hover:text-indigo-900 transition-colors inline-flex items-center gap-1 text-xs sm:text-sm px-3 py-1.5 rounded-lg hover:bg-indigo-50"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Desktop Table View - For screens 768px and above */}
                {!error && enrollments.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 bg-white rounded-xl shadow-sm">
                        <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No enrollments found</h3>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500">No students have enrolled in any courses yet.</p>
                        <button
                            onClick={GetAllPurchesCourse}
                            className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                        >
                            Refresh
                        </button>
                    </div>
                ) : filteredEnrollments.length === 0 && enrollments.length > 0 ? (
                    <div className="text-center py-8 sm:py-12 bg-white rounded-xl shadow-sm">
                        <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No matching enrollments</h3>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                    </div>
                ) : filteredEnrollments.length > 0 ? (
                    <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Enrollment ID
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Student Details
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Course
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Enrollment Date
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Payment
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {currentEnrollments.map((enrollment) => (
                                        <tr key={enrollment._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                                                <div className="text-xs sm:text-sm font-mono text-slate-600">
                                                    {enrollment.enrollmentId?.slice(-8) || 'N/A'}
                                                </div>
                                            </td>

                                            <td className="px-3 sm:px-4 py-3">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                                                        <img
                                                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
                                                            src={enrollment.studentAvatar}
                                                            alt={enrollment.studentName}
                                                            onError={(e) => {
                                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(enrollment.studentName)}&background=6366f1&color=fff`;
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="ml-2 sm:ml-3">
                                                        <div className="text-xs sm:text-sm font-medium text-slate-900">
                                                            {enrollment.studentName}
                                                        </div>
                                                        <div className="text-xs text-slate-500 truncate max-w-[120px] sm:max-w-none">
                                                            {enrollment.email}
                                                        </div>
                                                    </div>
                                                </div>
                                             </td>

                                            <td className="px-3 sm:px-4 py-3">
                                                <div className="text-xs sm:text-sm text-slate-900 font-medium">
                                                    {enrollment.courseTitle}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    Level: {enrollment.level}
                                                </div>
                                             </td>

                                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                                                <div className="text-xs sm:text-sm text-slate-600">
                                                    {formatDate(enrollment.enrollmentDate)}
                                                </div>
                                             </td>

                                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                                                <div className="text-xs sm:text-sm font-semibold text-indigo-600">
                                                    ₹{parseFloat(enrollment.amount).toLocaleString()}
                                                </div>
                                             </td>

                                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                                                <span className={`inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${getStatusBadge(enrollment.status)}`}>
                                                    {enrollment.status}
                                                </span>
                                             </td>

                                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                                                <span className={`inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${getPaymentBadge(enrollment.paymentStatus)}`}>
                                                    {enrollment.paymentStatus}
                                                </span>
                                             </td>

                                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-right text-xs sm:text-sm">
                                                <button
                                                    onClick={() => handleViewDetails(enrollment)}
                                                    className="text-indigo-600 hover:text-indigo-900 transition-colors inline-flex items-center gap-1"
                                                >
                                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    View
                                                </button>
                                             </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination - Responsive */}
                        {totalPages > 1 && (
                            <div className="bg-white px-3 sm:px-4 py-3 border-t border-slate-200">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs sm:text-sm text-slate-500">
                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 items-center">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            Total: {filteredEnrollments.length} enrollments
                                        </span>
                                        <span>
                                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredEnrollments.length)} of {filteredEnrollments.length}
                                        </span>
                                    </div>
                                    <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
                                        <button 
                                            onClick={() => paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`px-2 sm:px-3 py-1 rounded-lg transition-colors ${
                                                currentPage === 1 
                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                                    : 'hover:bg-slate-100'
                                            }`}
                                        >
                                            ← Prev
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
                                                    className={`px-2 sm:px-3 py-1 rounded-lg transition-colors ${
                                                        currentPage === pageNum
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'hover:bg-slate-100'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        <button 
                                            onClick={() => paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`px-2 sm:px-3 py-1 rounded-lg transition-colors ${
                                                currentPage === totalPages 
                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                                    : 'hover:bg-slate-100'
                                            }`}
                                        >
                                            Next →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}

                {/* Mobile Pagination */}
                {!loading && filteredEnrollments.length > 0 && totalPages > 1 && (
                    <div className="block md:hidden mt-4">
                        <div className="flex justify-between items-center gap-2">
                            <button 
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                                    currentPage === 1 
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                ← Previous
                            </button>
                            <span className="text-sm text-slate-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button 
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                                    currentPage === totalPages 
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Enrollment Details Modal - Responsive */}
            {showModal && selectedEnrollment && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Modal Header */}
                        <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl px-4 sm:px-6 py-5 sm:py-6">
                            <button 
                                onClick={closeModal}
                                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/70 hover:text-white transition-colors"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center">
                                        <img
                                            src={selectedEnrollment.studentAvatar}
                                            alt={selectedEnrollment.studentName}
                                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                                            onError={(e) => {
                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedEnrollment.studentName)}&background=6366f1&color=fff`;
                                            }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-white">Enrollment Details</h2>
                                    <p className="text-indigo-100 text-xs sm:text-sm">ID: {selectedEnrollment.enrollmentId?.slice(-8)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="px-4 sm:px-6 py-4 sm:py-6">
                            {/* Student Information */}
                            <div className="mb-5 sm:mb-6">
                                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2 sm:mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Student Information
                                </h3>
                                <div className="bg-slate-50 rounded-xl p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <span className="text-xs text-slate-500 block">Full Name</span>
                                        <span className="text-sm font-medium text-slate-700 break-words">{selectedEnrollment.studentName}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 block">Email Address</span>
                                        <span className="text-sm font-medium text-slate-700 break-words">{selectedEnrollment.email}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 block">Phone Number</span>
                                        <span className="text-sm font-medium text-slate-700">{selectedEnrollment.phone}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 block">Gender</span>
                                        <span className="text-sm font-medium text-slate-700 capitalize">{selectedEnrollment.studentGender}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 block">Class</span>
                                        <span className="text-sm font-medium text-slate-700">{selectedEnrollment.studentClass}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 block">Address</span>
                                        <span className="text-sm font-medium text-slate-700 break-words">{selectedEnrollment.studentAddress}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Course Information */}
                            <div className="mb-5 sm:mb-6">
                                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2 sm:mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    </svg>
                                    Course Information
                                </h3>
                                <div className="bg-slate-50 rounded-xl p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <span className="text-xs text-slate-500 block">Course Title</span>
                                        <span className="text-sm font-medium text-slate-700 break-words">{selectedEnrollment.courseTitle}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 block">Instructor</span>
                                        <span className="text-sm font-medium text-slate-700">{selectedEnrollment.instructor}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 block">Course Duration</span>
                                        <span className="text-sm font-medium text-slate-700">{selectedEnrollment.duration}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 block">Course Level</span>
                                        <span className="text-sm font-medium text-slate-700">{selectedEnrollment.level}</span>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <span className="text-xs text-slate-500 block">Description</span>
                                        <span className="text-sm font-medium text-slate-700 break-words">{selectedEnrollment.courseDescription}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Enrollment Details */}
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2 sm:mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Enrollment Details
                                </h3>
                                <div className="bg-slate-50 rounded-xl p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <span className="text-xs text-slate-500 block">Enrollment Date</span>
                                        <span className="text-sm font-medium text-slate-700">{formatDate(selectedEnrollment.enrollmentDate)}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 block">Amount Paid</span>
                                        <span className="text-sm font-semibold text-indigo-600">₹{parseFloat(selectedEnrollment.amount).toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 block">Order ID</span>
                                        <span className="text-xs sm:text-sm font-mono text-slate-600 break-words">{selectedEnrollment.orderId || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 block">Payment ID</span>
                                        <span className="text-xs sm:text-sm font-mono text-slate-600 break-words">{selectedEnrollment.paymentId || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 block">Enrollment Status</span>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedEnrollment.status)}`}>
                                            {selectedEnrollment.status}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 block">Payment Status</span>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentBadge(selectedEnrollment.paymentStatus)}`}>
                                            {selectedEnrollment.paymentStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-end gap-2 sm:gap-3">
                            <button
                                onClick={closeModal}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm sm:text-base"
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