import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../services/adminendpoint';
import Loader from '../../components/AdminComponent/Loader';
import { 
  Award, CheckCircle2, XCircle, Clock, Trash2, Search, Filter, 
  Calendar, Phone, Mail, User, BookOpen, Sparkles, RefreshCw, AlertCircle,
  Key, Unlock, ShieldCheck, Check, ArrowRight, ExternalLink
} from 'lucide-react';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-rose-600' : 'bg-blue-600';
  return (
    <div className={`fixed top-5 right-5 z-50 ${bgColor} text-white px-5 py-3 rounded-md shadow-lg transition-all duration-300 flex items-center gap-2 text-xs font-semibold`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">✕</button>
    </div>
  );
};

const ScholarshipResult = () => {
  const [applications, setApplications] = useState([]);
  const [availableTests, setAvailableTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterAccess, setFilterAccess] = useState('all'); // 'all', 'granted', 'pending'
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  // Assign Test Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningApp, setAssigningApp] = useState(null);
  const [selectedTestId, setSelectedTestId] = useState('');

  // Grant Fee Waiver Modal state
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [grantForm, setGrantForm] = useState({
    discount: 50,
    validFrom: '',
    validUntil: ''
  });

  // Reject Modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectRemark, setRejectRemark] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login again.');
        setLoading(false);
        return;
      }

      // 1. Primary: Fetch all registered scholarship applications
      const res = await axios.get(api.schollership.allApplications, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success && Array.isArray(res.data.data)) {
        setApplications(res.data.data);
        setError(null);
      } else {
        const fallbackRes = await axios.get(api.schollership.getApprovedReject, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(fallbackRes.data?.data || []);
      }
    } catch (err) {
      console.error("Error fetching scholarships:", err);
      setError(err?.response?.data?.message || 'Failed to load scholarship applications.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(api.schollership.getAvailableTests, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success && Array.isArray(res.data.tests)) {
        setAvailableTests(res.data.tests);
      }
    } catch (err) {
      console.error("Error fetching available tests:", err);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchAvailableTests();
  }, []);

  // Helper: find best matching test for a student application
  const findMatchingTestForApp = (app) => {
    if (!app || availableTests.length === 0) return null;
    const rawClass = String(app.studentClass || '').toLowerCase();
    const matchNum = rawClass.match(/\d+/);
    const classNum = matchNum ? matchNum[0] : null;

    if (classNum) {
      const classTest = availableTests.find(t => {
        const tClass = String(t.className || '').toLowerCase();
        const tTitle = (t.title || '').toLowerCase();
        return (tClass === `${classNum}th` || tClass === classNum || tTitle.includes(`class ${classNum}`));
      });
      if (classTest) return classTest;
    }

    // Fallback: general scholarship test
    const genTest = availableTests.find(t => {
      const tTitle = (t.title || '').toLowerCase();
      return tTitle.includes('scholarship');
    });

    return genTest || availableTests[0] || null;
  };

  // Open Assign Test Modal
  const openAssignModal = (app) => {
    setAssigningApp(app);
    if (app.assignedTest?._id) {
      setSelectedTestId(String(app.assignedTest._id));
    } else if (app.assignedTest) {
      setSelectedTestId(String(app.assignedTest));
    } else {
      const matching = findMatchingTestForApp(app);
      setSelectedTestId(matching ? String(matching._id) : '');
    }
    setShowAssignModal(true);
  };

  // Submit Grant Test Access
  const handleGrantTestAccess = async (appToGrant = null, specificTestId = null) => {
    const app = appToGrant || assigningApp;
    if (!app) return;

    const tId = specificTestId !== null ? specificTestId : selectedTestId;

    try {
      setActionLoading(app._id);
      const token = localStorage.getItem('token');
      const res = await axios.post(api.schollership.grantTestAccess, {
        scholarshipId: app._id,
        testId: tId || undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success) {
        const studentName = app.studentId?.fullName || app.studentId?.name || app.email;
        showToast(`✅ Test access granted for ${studentName}! Student can now take the test in their dashboard.`, 'success');
        setShowAssignModal(false);
        setAssigningApp(null);
        await fetchApplications();
      } else {
        throw new Error(res.data?.message || 'Failed to grant test access');
      }
    } catch (err) {
      console.error("Error granting test access:", err);
      showToast(`❌ ${err?.response?.data?.message || err.message || 'Failed to grant test access'}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Revoke Test Access
  const handleRevokeTestAccess = async (app) => {
    const studentName = app.studentId?.fullName || app.studentId?.name || app.email;
    if (!window.confirm(`Are you sure you want to revoke scholarship test access for ${studentName}?`)) {
      return;
    }

    try {
      setActionLoading(app._id);
      const token = localStorage.getItem('token');
      const res = await axios.post(api.schollership.revokeTestAccess, {
        scholarshipId: app._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success) {
        showToast(`🔒 Test access revoked for ${studentName}`, 'success');
        await fetchApplications();
      } else {
        throw new Error(res.data?.message || 'Failed to revoke test access');
      }
    } catch (err) {
      console.error("Error revoking test access:", err);
      showToast(`❌ ${err?.response?.data?.message || err.message || 'Failed to revoke test access'}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Open Grant Fee Waiver Modal with default dates
  const openGrantModal = (app) => {
    const today = new Date();
    const ninetyDaysLater = new Date();
    ninetyDaysLater.setDate(today.getDate() + 90);

    const formatDate = (date) => date.toISOString().split('T')[0];

    setSelectedApp(app);
    setGrantForm({
      discount: app.discount && app.discount > 0 ? app.discount : 50,
      validFrom: app.validFrom ? formatDate(new Date(app.validFrom)) : formatDate(today),
      validUntil: app.validUntil ? formatDate(new Date(app.validUntil)) : formatDate(ninetyDaysLater)
    });
    setShowGrantModal(true);
  };

  // Submit Grant Fee Waiver
  const handleGrant = async () => {
    if (!selectedApp) return;
    if (grantForm.discount < 0 || grantForm.discount > 100) {
      showToast('Discount must be between 0 and 100%', 'error');
      return;
    }

    try {
      setActionLoading(selectedApp._id);
      const token = localStorage.getItem('token');
      const response = await axios.post(api.schollership.grantScholarship, {
        scholarshipId: selectedApp._id,
        discount: Number(grantForm.discount),
        validFrom: grantForm.validFrom,
        validUntil: grantForm.validUntil
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        showToast(`✅ Scholarship (${grantForm.discount}%) granted successfully!`, 'success');
        setShowGrantModal(false);
        await fetchApplications();
      } else {
        throw new Error(response.data?.message || 'Grant failed');
      }
    } catch (err) {
      console.error(err);
      showToast(`❌ ${err?.response?.data?.message || err.message || 'Failed to grant'}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Open Reject Modal
  const openRejectModal = (app) => {
    setSelectedApp(app);
    setRejectRemark('Does not meet qualifying criteria');
    setShowRejectModal(true);
  };

  // Submit Reject
  const handleReject = async () => {
    if (!selectedApp) return;

    try {
      setActionLoading(selectedApp._id);
      const token = localStorage.getItem('token');
      const response = await axios.post(api.schollership.rejectScholarship, {
        scholarshipId: selectedApp._id,
        remark: rejectRemark || 'Application Rejected'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        showToast('❌ Scholarship application rejected', 'success');
        setShowRejectModal(false);
        await fetchApplications();
      } else {
        throw new Error(response.data?.message || 'Rejection failed');
      }
    } catch (err) {
      console.error(err);
      showToast(`❌ ${err?.response?.data?.message || err.message || 'Failed to reject'}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete Application
  const handleDelete = async (app) => {
    const studentName = app.studentId?.fullName || app.studentId?.name || app.email;
    if (!window.confirm(`Are you sure you want to delete scholarship record for ${studentName}?`)) {
      return;
    }

    try {
      setActionLoading(app._id);
      const token = localStorage.getItem('token');
      const response = await axios.post(api.schollership.deleteScholarship, {
        scholarshipId: app._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        showToast('🗑️ Application record deleted successfully', 'success');
        await fetchApplications();
      } else {
        throw new Error(response.data?.message || 'Delete failed');
      }
    } catch (err) {
      console.error(err);
      showToast(`❌ ${err?.response?.data?.message || err.message || 'Failed to delete'}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Filters
  const filteredApps = applications.filter((app) => {
    const studentName = (app.studentId?.fullName || app.studentId?.name || '').toLowerCase();
    const email = (app.email || app.studentId?.email || '').toLowerCase();
    const phone = (app.phone || app.studentId?.phone || '').toLowerCase();
    const program = (app.program || '').toLowerCase();
    const sTerm = searchTerm.toLowerCase();

    const matchesSearch = studentName.includes(sTerm) || email.includes(sTerm) || phone.includes(sTerm) || program.includes(sTerm);
    const matchesStatus = filterStatus === 'all' ? true : app.status === filterStatus;
    const matchesProgram = filterProgram === 'all' ? true : (app.program || '').toLowerCase() === filterProgram.toLowerCase();
    const matchesAccess = filterAccess === 'all' 
      ? true 
      : filterAccess === 'granted' 
      ? Boolean(app.testAccessGranted) 
      : !app.testAccessGranted;

    return matchesSearch && matchesStatus && matchesProgram && matchesAccess;
  });

  const stats = {
    total: applications.length,
    accessGranted: applications.filter(a => a.testAccessGranted).length,
    accessPending: applications.filter(a => !a.testAccessGranted).length,
    approved: applications.filter(a => a.status === 'approved').length,
  };

  const formatClassBadge = (rawClass) => {
    if (!rawClass) return 'Class N/A';
    const c = String(rawClass).toLowerCase();
    if (c === 'dropper') return 'Dropper';
    if (c.includes('class-')) return `Class ${c.replace('class-', '')}`;
    return `Class ${rawClass}`;
  };

  if (loading) return <Loader message="Loading Scholarship Applications..." />;

  const currentSelectedTest = availableTests.find(t => String(t._id) === String(selectedTestId));

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 md:p-8 space-y-6 font-poppins">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header */}
        <div className="bg-white rounded-md border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scholarship Administration</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Roots Scholarship Portal</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review student applications, grant scholarship test access, monitor mock performance, and allot fee discounts.
            </p>
          </div>
          <button 
            onClick={() => { fetchApplications(); fetchAvailableTests(); }} 
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-md border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Applications</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
                <BookOpen size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Test Access Granted</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{stats.accessGranted}</p>
              </div>
              <div className="w-10 h-10 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold">
                <Unlock size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Test Access Pending</p>
                <p className="text-2xl font-black text-amber-600 mt-1">{stats.accessPending}</p>
              </div>
              <div className="w-10 h-10 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold">
                <Clock size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Scholarship Approved</p>
                <p className="text-2xl font-black text-purple-600 mt-1">{stats.approved}</p>
              </div>
              <div className="w-10 h-10 rounded-md bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 font-bold">
                <Award size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-md border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-72">
            <input 
              type="text" 
              placeholder="Search by student name, email, phone..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-md text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Test Access Filter */}
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-md border border-slate-200/80 text-xs font-bold">
              {[
                { key: 'all', label: 'All Test Access' },
                { key: 'granted', label: '✓ Access Given' },
                { key: 'pending', label: '🔒 Pending Access' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilterAccess(key)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    filterAccess === key
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Status Tabs */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-md text-xs font-bold text-slate-700 bg-white outline-none cursor-pointer"
            >
              <option value="all">All Waivers</option>
              <option value="pending">Pending Waiver</option>
              <option value="approved">Approved Waiver</option>
              <option value="rejected">Rejected Waiver</option>
            </select>

            {/* Program Filter */}
            <select
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-md text-xs font-bold text-slate-700 bg-white outline-none cursor-pointer"
            >
              <option value="all">All Programs</option>
              <option value="foundation">Foundation</option>
              <option value="medical">Medical (NEET)</option>
              <option value="engineering">Engineering (JEE)</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-md border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3.5">#</th>
                  <th className="px-5 py-3.5">Student Details</th>
                  <th className="px-5 py-3.5">Program & Class</th>
                  <th className="px-5 py-3.5">Test Access & Exam</th>
                  <th className="px-5 py-3.5">Mock Test Score</th>
                  <th className="px-5 py-3.5">Scholarship Waiver</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400 font-medium">
                      No scholarship applications found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app, idx) => {
                    const studentName = app.studentId?.fullName || app.studentId?.name || 'Student Candidate';
                    const studentEmail = app.email || app.studentId?.email || 'N/A';
                    const studentPhone = app.phone || app.studentId?.phone || 'N/A';
                    const score = app.highestTestScore;
                    const hasAccess = Boolean(app.testAccessGranted);
                    const matchingTest = findMatchingTestForApp(app);

                    return (
                      <tr key={app._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 font-mono text-slate-400 text-xs">{idx + 1}</td>

                        {/* Student Details */}
                        <td className="px-5 py-4">
                          <div className="space-y-0.5">
                            <p className="font-black text-slate-900 text-sm leading-snug">{studentName}</p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                              <Mail size={12} className="text-slate-400" />
                              <span>{studentEmail}</span>
                            </p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                              <Phone size={12} className="text-slate-400" />
                              <span>{studentPhone}</span>
                            </p>
                          </div>
                        </td>

                        {/* Program & Class */}
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                              {app.program || 'General'}
                            </span>
                            <p className="text-xs font-bold text-slate-700">
                              {formatClassBadge(app.studentClass || app.studentId?.currentClass)}
                            </p>
                          </div>
                        </td>

                        {/* Test Access & Exam (PRIMARY FEATURE REQUEST) */}
                        <td className="px-5 py-4">
                          {hasAccess ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
                                  <CheckCircle2 size={12} className="text-emerald-600" />
                                  <span>Test Access Granted</span>
                                </span>
                              </div>
                              <p className="text-[11px] font-bold text-slate-800 max-w-[200px] truncate" title={app.assignedTest?.title || 'Scholarship Assessment Test'}>
                                📝 {app.assignedTest?.title || 'Assigned Scholarship Test'}
                              </p>
                              <div className="flex items-center gap-2 pt-0.5">
                                <button
                                  onClick={() => openAssignModal(app)}
                                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                  title="Change or reassign test"
                                >
                                  Change Test
                                </button>
                                <span className="text-slate-300 text-[10px]">•</span>
                                <button
                                  onClick={() => handleRevokeTestAccess(app)}
                                  disabled={actionLoading === app._id}
                                  className="text-[11px] font-bold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer"
                                  title="Revoke test access"
                                >
                                  Revoke
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-800 border border-amber-200">
                                <Clock size={11} className="text-amber-500" />
                                <span>Access Not Given</span>
                              </span>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                  onClick={() => openAssignModal(app)}
                                  disabled={actionLoading === app._id}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-black text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                  title="Grant Access to Scholarship Test"
                                >
                                  <Key size={13} />
                                  <span>Grant Test Access</span>
                                </button>
                                {matchingTest && (
                                  <button
                                    onClick={() => handleGrantTestAccess(app, matchingTest._id)}
                                    disabled={actionLoading === app._id}
                                    className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-[11px] transition-all cursor-pointer border border-slate-200 disabled:opacity-50"
                                    title={`1-Click Assign: ${matchingTest.title}`}
                                  >
                                    Quick Assign
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Test Performance */}
                        <td className="px-5 py-4">
                          {score !== null && score !== undefined ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-sm font-black ${
                                  score >= 70 ? 'text-emerald-600' : score >= 40 ? 'text-blue-600' : 'text-slate-600'
                                }`}>
                                  {score}%
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                  score >= 90 ? 'bg-green-100 text-green-800' : score >= 60 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {score >= 90 ? '100% Eligible' : score >= 75 ? '50% Eligible' : score >= 60 ? '25% Eligible' : 'Score'}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400">Mock test score</p>
                            </div>
                          ) : (
                            <div className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                              <AlertCircle size={13} className="text-slate-300" />
                              <span>{hasAccess ? 'Access given, awaiting attempt' : 'Not Attempted'}</span>
                            </div>
                          )}
                        </td>

                        {/* Scholarship Status / Waiver */}
                        <td className="px-5 py-4">
                          {app.status === 'approved' ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black rounded bg-emerald-50 text-emerald-700 border border-emerald-300">
                                <CheckCircle2 size={13} className="text-emerald-600" />
                                <span>{app.discount || 50}% Approved</span>
                              </span>
                              {app.validUntil && (
                                <p className="text-[10px] text-slate-400 font-mono">
                                  Valid: {new Date(app.validUntil).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ) : app.status === 'rejected' ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black rounded bg-rose-50 text-rose-700 border border-rose-300">
                                <XCircle size={13} className="text-rose-600" />
                                <span>Rejected</span>
                              </span>
                              {app.adminRemark && (
                                <p className="text-[10px] text-slate-400 max-w-[120px] truncate" title={app.adminRemark}>
                                  {app.adminRemark}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black rounded bg-amber-50 text-amber-700 border border-amber-300">
                              <Clock size={13} className="text-amber-500 animate-pulse" />
                              <span>Pending Review</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {app.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => openGrantModal(app)}
                                  disabled={actionLoading === app._id}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                                  title="Approve Scholarship Waiver Discount"
                                >
                                  <CheckCircle2 size={13} />
                                  <span>Allot %</span>
                                </button>
                                <button
                                  onClick={() => openRejectModal(app)}
                                  disabled={actionLoading === app._id}
                                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
                                  title="Reject Application"
                                >
                                  <XCircle size={13} />
                                  <span>Reject</span>
                                </button>
                              </>
                            ) : app.status === 'approved' ? (
                              <button
                                onClick={() => openGrantModal(app)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-[11px] transition-all cursor-pointer"
                                title="Edit Discount or Dates"
                              >
                                Edit %
                              </button>
                            ) : null}

                            {/* Delete Application Button */}
                            <button
                              onClick={() => handleDelete(app)}
                              disabled={actionLoading === app._id}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Grant / Assign Test Access Modal ──────────────────────────────────── */}
        {showAssignModal && assigningApp && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-md border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-slideUp">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Key size={16} />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900">Grant Scholarship Test Access</h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Student will immediately see and be able to take this test in their dashboard.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAssignModal(false)} 
                  className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                {/* Student summary banner */}
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-black text-slate-900 text-sm">
                        {assigningApp.studentId?.fullName || assigningApp.studentId?.name || assigningApp.email}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {assigningApp.email} • {assigningApp.phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-600 text-white uppercase">
                        {assigningApp.program || 'General'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-700 border border-blue-200">
                        {formatClassBadge(assigningApp.studentClass)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Test Selection */}
                <div>
                  <label className="block font-black text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                    Select Test to Assign for this Student:
                  </label>
                  <select
                    value={selectedTestId}
                    onChange={(e) => setSelectedTestId(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  >
                    <option value="">-- Auto-Assign Best Matching Scholarship Test --</option>
                    {availableTests.map((t) => {
                      const rawClass = String(assigningApp.studentClass || '').toLowerCase();
                      const matchNum = rawClass.match(/\d+/);
                      const classNum = matchNum ? matchNum[0] : null;
                      const isMatch = classNum && (String(t.className || '').toLowerCase().includes(classNum) || (t.title || '').toLowerCase().includes(`class ${classNum}`));
                      
                      return (
                        <option key={t._id} value={t._id}>
                          {isMatch ? '⭐ [RECOMMENDED] ' : ''}{t.title} ({t.className ? `Class ${t.className}` : 'All Classes'} • {t.duration}m • {t.totalQuestions} Questions)
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Selected Test Details Card */}
                {currentSelectedTest && (
                  <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        Selected Examination Paper
                      </span>
                      <span className="text-[11px] font-bold text-slate-600">
                        Class: {currentSelectedTest.className || 'All'}
                      </span>
                    </div>
                    <p className="font-black text-slate-900 text-sm">{currentSelectedTest.title}</p>
                    <div className="flex items-center gap-4 text-slate-600 text-xs font-bold pt-1">
                      <span>⏱️ {currentSelectedTest.duration} Minutes</span>
                      <span>📄 {currentSelectedTest.totalQuestions} Questions</span>
                      <span>⭐ {currentSelectedTest.totalMarks || (currentSelectedTest.totalQuestions * 1)} Total Marks</span>
                    </div>
                  </div>
                )}

                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-md text-emerald-800 text-[11px] leading-relaxed flex items-start gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Once granted, the student will see this test <strong>unlocked in their student dashboard</strong> under the <em>Scholarship Test</em> tab, with an active <strong>"Start Scholarship Test"</strong> button!
                  </span>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
                <button 
                  onClick={() => setShowAssignModal(false)} 
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded text-xs hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleGrantTestAccess()} 
                  disabled={actionLoading === assigningApp._id} 
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Unlock size={14} />
                  <span>{actionLoading === assigningApp._id ? 'Activating Access...' : 'Grant Test Access Now'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Grant Fee Waiver Modal ─────────────────────────────────────────── */}
        {showGrantModal && selectedApp && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-md border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    SCHOLARSHIP ALLOTMENT
                  </span>
                  <h2 className="text-base font-black text-slate-900 mt-1">Allot Tuition Fee Waiver</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedApp.studentId?.fullName || selectedApp.studentId?.name || selectedApp.email}
                  </p>
                </div>
                <button 
                  onClick={() => setShowGrantModal(false)} 
                  className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-5 text-xs">

                {/* Preset Chips */}
                <div>
                  <label className="block font-black text-slate-700 uppercase tracking-wider text-[11px] mb-2">
                    Select Discount Percentage
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[25, 50, 75, 100].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setGrantForm(prev => ({ ...prev, discount: pct }))}
                        className={`py-2 rounded text-xs font-black transition-all cursor-pointer ${
                          grantForm.discount === pct
                            ? 'bg-emerald-600 text-white shadow'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {pct}% OFF
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold">Custom %:</span>
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={grantForm.discount} 
                      onChange={e => setGrantForm(prev => ({ ...prev, discount: +e.target.value }))} 
                      className="w-24 border border-slate-300 rounded px-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none" 
                    />
                  </div>
                </div>

                {/* Validity Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                      Valid From
                    </label>
                    <input 
                      type="date" 
                      value={grantForm.validFrom} 
                      onChange={e => setGrantForm(prev => ({ ...prev, validFrom: e.target.value }))} 
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                      Valid Until
                    </label>
                    <input 
                      type="date" 
                      value={grantForm.validUntil} 
                      onChange={e => setGrantForm(prev => ({ ...prev, validUntil: e.target.value }))} 
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none" 
                    />
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded text-emerald-800 text-[11px] leading-relaxed flex items-start gap-2">
                  <Sparkles size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    When approved, the student will immediately see a <strong>{grantForm.discount}% fee waiver</strong> on all course checkouts, and an official confirmation email will be dispatched.
                  </span>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
                <button 
                  onClick={() => setShowGrantModal(false)} 
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded text-xs hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleGrant} 
                  disabled={actionLoading === selectedApp._id} 
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs transition-all shadow cursor-pointer disabled:opacity-50"
                >
                  {actionLoading === selectedApp._id ? 'Approving...' : `Approve ${grantForm.discount}% Scholarship`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Reject Modal ─────────────────────────────────────────────────── */}
        {showRejectModal && selectedApp && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-md border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h2 className="text-base font-black text-rose-700">Reject Application</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedApp.studentId?.fullName || selectedApp.studentId?.name || selectedApp.email}
                  </p>
                </div>
                <button 
                  onClick={() => setShowRejectModal(false)} 
                  className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-black text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                    Rejection Reason / Remark
                  </label>
                  <textarea
                    rows={3}
                    value={rejectRemark}
                    onChange={(e) => setRejectRemark(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="w-full border border-slate-300 rounded p-3 text-xs font-medium focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
                <p className="text-slate-400 text-[11px]">
                  This application will be marked as rejected in the records.
                </p>
              </div>

              <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
                <button 
                  onClick={() => setShowRejectModal(false)} 
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded text-xs hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleReject} 
                  disabled={actionLoading === selectedApp._id} 
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-xs transition-all shadow cursor-pointer disabled:opacity-50"
                >
                  {actionLoading === selectedApp._id ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ScholarshipResult;