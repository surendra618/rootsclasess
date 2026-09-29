import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../services/adminendpoint';
import Loader from '../../components/AdminComponent/Loader';

// Simple Toast Component (can be replaced with a library like react-toastify)
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  return (
    <div className={`fixed top-5 right-5 z-50 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300`}>
      {message}
    </div>
  );
};

const ScholarshipResult = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  // Scholarship modal state
  const [showScholarshipModal, setShowScholarshipModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [scholarshipForm, setScholarshipForm] = useState({
    discount: 50,
    validFrom: '',
    validUntil: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Helper: format test score
  const getTestScoreDisplay = (obtainedMarks, totalMarks) => {
    const obtained = obtainedMarks ?? 0;
    const total = totalMarks ?? 0;
    if (total === 0 && obtained === 0) return 'Test not attempted';
    return `${obtained} / ${total}`;
  };

  // Show toast message
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login again.');
        setLoading(false);
        return;
      }

      const scholarshipResponse = await axios.get(api.schollership.schollershipResult);
      const pendingApplications = scholarshipResponse.data?.data || [];

      const approvedRejectedResponse = await axios.get(api.schollership.getApprovedReject, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const approvedRejectedApplications = approvedRejectedResponse.data?.data || [];

      // Merge logic (same as yours)
      const scholarshipMap = new Map();
      approvedRejectedApplications.forEach(item => {
        if (item._id) scholarshipMap.set(item._id, item);
      });

      const mergedResults = pendingApplications.map(app => {
        const existing = scholarshipMap.get(app.scholarshipId || app._id);
        if (existing) {
          return { ...app, ...existing, isProcessed: true, scholarshipId: app.scholarshipId || app._id };
        }
        return { ...app, status: 'pending', isProcessed: false, scholarshipId: app.scholarshipId || app._id };
      });

      approvedRejectedApplications.forEach(item => {
        if (!mergedResults.some(r => r.scholarshipId === item._id)) {
          mergedResults.push({
            _id: item._id,
            scholarshipId: item._id,
            status: item.status,
            studentId: item.studentId,
            testId: { title: 'N/A' },
            obtainedMarks: 0,
            totalMarks: 0,
            percentage: 0,
            isEligible: item.status === 'approved',
            isProcessed: true,
            discount: item.discount,
            validFrom: item.validFrom,
            validUntil: item.validUntil
          });
        }
      });

      setResults(mergedResults);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to load scholarship results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const openScholarshipModal = (student) => {
    const today = new Date();
    const oneYearLater = new Date();
    oneYearLater.setFullYear(today.getFullYear() + 1);

    const formatDate = (date) => date.toISOString().split('T')[0];

    setSelectedStudent(student);
    setScholarshipForm({
      discount: 50,
      validFrom: formatDate(today),
      validUntil: formatDate(oneYearLater)
    });
    setFormErrors({});
    setShowScholarshipModal(true);
  };

  const validateForm = () => {
    const errors = {};
    const fromDate = new Date(scholarshipForm.validFrom);
    const untilDate = new Date(scholarshipForm.validUntil);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!scholarshipForm.validFrom) errors.validFrom = 'Start date required';
    if (!scholarshipForm.validUntil) errors.validUntil = 'End date required';
    if (fromDate < today) errors.validFrom = 'Start date cannot be in the past';
    if (untilDate <= fromDate) errors.validUntil = 'End date must be after start date';
    if (scholarshipForm.discount < 0 || scholarshipForm.discount > 100)
      errors.discount = 'Discount must be between 0 and 100';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const grantScholarship = async () => {
    if (!validateForm()) return;

    try {
      setActionLoading(selectedStudent?._id);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required.');

      const scholarshipId = selectedStudent.scholarshipId || selectedStudent._id;
      const requestData = {
        scholarshipId,
        discount: scholarshipForm.discount,
        validFrom: scholarshipForm.validFrom,
        validUntil: scholarshipForm.validUntil
      };

      const response = await axios.post(api.schollership.grantScholarship, requestData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success !== false) {
        // Update local state
        setResults(prev =>
          prev.map(r =>
            r.scholarshipId === scholarshipId
              ? { ...r, status: 'approved', isProcessed: true, discount: scholarshipForm.discount, validFrom: scholarshipForm.validFrom, validUntil: scholarshipForm.validUntil }
              : r
          )
        );
        showToast(`✅ Scholarship granted & email sent to ${selectedStudent.studentId?.fullName}!`, 'success');
        setShowScholarshipModal(false);
        await fetchAllData(); // refresh to sync
      } else {
        throw new Error(response.data?.message || 'Grant failed');
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message || 'Failed to grant scholarship';
      showToast(`❌ Error: ${msg}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const rejectScholarship = async (student) => {
    if (!window.confirm(`❌ Reject scholarship for ${student.studentId?.fullName}? Email will be sent to student.`)) return;

    try {
      setActionLoading(student._id);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required.');

      const scholarshipId = student.scholarshipId || student._id;
      const requestData = { scholarshipId, remark: 'Does not meet eligibility criteria' };

      const response = await axios.post(api.schollership.rejectScholarship, requestData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success !== false) {
        setResults(prev =>
          prev.map(r =>
            r.scholarshipId === scholarshipId ? { ...r, status: 'rejected', isProcessed: true } : r
          )
        );
        showToast(`❌ Scholarship rejected & email sent to ${student.studentId?.fullName}`, 'success');
        await fetchAllData();
      } else {
        throw new Error(response.data?.message || 'Rejection failed');
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to reject scholarship';
      showToast(`❌ Error: ${msg}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Status badge
  const getStatusBadge = (result) => {
    if (result.status === 'approved') {
      return (
        <div className="space-y-0.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Approved
          </span>
          {result.validUntil && <p className="text-[11px] text-gray-500 font-medium">Valid: {new Date(result.validUntil).toLocaleDateString()}</p>}
          <p className="text-[11px] text-blue-600 font-medium">📧 Email sent</p>
        </div>
      );
    }
    if (result.status === 'rejected') {
      return (
        <div className="space-y-0.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-rose-50 text-rose-700 border border-rose-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Rejected
          </span>
          <p className="text-[11px] text-blue-600 font-medium">📧 Email sent</p>
        </div>
      );
    }
    if (result.status === 'pending' && result.isEligible) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-50 text-amber-700 border border-amber-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Pending Approval
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-600 border border-gray-200/60">
        Not Eligible
      </span>
    );
  };

  // Filter and stats
  const filteredResults = results.filter(result => {
    const matchesSearch = (result.studentId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.studentId?.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' ? true : result.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: results.length,
    approved: results.filter(r => r.status === 'approved').length,
    rejected: results.filter(r => r.status === 'rejected').length,
    pending: results.filter(r => r.status === 'pending' && r.isEligible).length
  };

  if (loading) return <Loader message="Loading Scholarship Data..." />;
  if (error) return (
    <div className="flex justify-center items-center min-h-[60vh] p-6">
      <div className="bg-rose-50 border border-rose-200/80 p-6 rounded-lg text-rose-700 max-w-md text-center shadow-xs">
        <p className="font-medium mb-3">{error}</p>
        <button onClick={fetchAllData} className="px-4 py-2 bg-rose-600 text-white rounded-md text-xs font-bold uppercase tracking-wider hover:bg-rose-700 transition-all shadow-xs">Retry Loading</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 md:p-8 space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Sticky Top Header */}
        <div className="bg-white rounded-lg border border-gray-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#0078FF]"></span>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Scholarship Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Scholarship Results & Approvals</h1>
            <p className="text-xs text-gray-500 mt-0.5">Review, grant or reject student scholarship applications. Notifications sent automatically.</p>
          </div>
          <button onClick={fetchAllData} className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-gray-100 transition-all shadow-xs">
            🔄 Refresh Data
          </button>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200/80 p-5 shadow-xs hover:border-gray-300 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">📄</div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200/80 p-5 shadow-xs hover:border-gray-300 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Approved</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.approved}</p>
              </div>
              <div className="w-10 h-10 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200/80 p-5 shadow-xs hover:border-gray-300 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rejected</p>
                <p className="text-2xl font-bold text-rose-600 mt-1">{stats.rejected}</p>
              </div>
              <div className="w-10 h-10 rounded-md bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold">❌</div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200/80 p-5 shadow-xs hover:border-gray-300 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 rounded-md bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold">⏳</div>
            </div>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-white rounded-lg border border-gray-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input 
              type="text" 
              placeholder="Search by student name or email..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md text-xs font-medium focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none transition-all" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
            <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['all', 'pending', 'approved', 'rejected'].map(status => (
              <button 
                key={status} 
                onClick={() => setFilterStatus(status)} 
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  filterStatus === status 
                    ? 'bg-[#0078FF] text-white shadow-xs' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/60'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Results Data Table */}
        <div className="bg-white rounded-lg border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3.5">#</th>
                  <th className="px-5 py-3.5">Student Details</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Test Score</th>
                  <th className="px-5 py-3.5">Percentage</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-gray-400 font-medium">
                      No scholarship applications found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((result, idx) => (
                    <tr key={result._id || result.scholarshipId} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-4 font-mono text-gray-400">{idx + 1}</td>
                      <td className="px-5 py-4 font-semibold text-gray-900">{result.studentId?.fullName || 'N/A'}</td>
                      <td className="px-5 py-4 text-gray-600">{result.studentId?.email || 'N/A'}</td>
                      <td className="px-5 py-4 font-medium">{getTestScoreDisplay(result.obtainedMarks, result.totalMarks)}</td>
                      <td className="px-5 py-4 font-semibold text-gray-900">{result.percentage || 0}%</td>
                      <td className="px-5 py-4">{getStatusBadge(result)}</td>
                      <td className="px-5 py-4 text-right">
                        {result.status === 'pending' && result.isEligible && !result.isProcessed ? (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => openScholarshipModal(result)} 
                              disabled={actionLoading === result._id} 
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-xs"
                            >
                              Grant
                            </button>
                            <button 
                              onClick={() => rejectScholarship(result)} 
                              disabled={actionLoading === result._id} 
                              className="px-3 py-1.5 bg-rose-600 text-white rounded-md text-xs font-semibold hover:bg-rose-700 disabled:opacity-50 transition-all shadow-xs"
                            >
                              Reject
                            </button>
                          </div>
                        ) : result.status === 'approved' ? (
                          <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                            {result.discount || 50}% Off
                          </span>
                        ) : result.status === 'rejected' ? (
                          <span className="text-rose-600 font-semibold text-xs">Rejected</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scholarship Grant Modal */}
        {showScholarshipModal && selectedStudent && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg border border-gray-200/80 shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Grant Scholarship</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedStudent.studentId?.fullName}</p>
                </div>
                <button 
                  onClick={() => setShowScholarshipModal(false)} 
                  className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 text-lg transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Scholarship Discount (%)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={scholarshipForm.discount} 
                    onChange={e => setScholarshipForm({...scholarshipForm, discount: +e.target.value})} 
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none" 
                  />
                  {formErrors.discount && <p className="text-rose-500 text-[11px] mt-1">{formErrors.discount}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Valid From</label>
                  <input 
                    type="date" 
                    value={scholarshipForm.validFrom} 
                    onChange={e => setScholarshipForm({...scholarshipForm, validFrom: e.target.value})} 
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none" 
                  />
                  {formErrors.validFrom && <p className="text-rose-500 text-[11px] mt-1">{formErrors.validFrom}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Valid Until</label>
                  <input 
                    type="date" 
                    value={scholarshipForm.validUntil} 
                    onChange={e => setScholarshipForm({...scholarshipForm, validUntil: e.target.value})} 
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none" 
                  />
                  {formErrors.validUntil && <p className="text-rose-500 text-[11px] mt-1">{formErrors.validUntil}</p>}
                </div>

                <div className="bg-blue-50/80 border border-blue-100 p-3 rounded-md text-blue-700 text-xs flex items-start gap-2">
                  <span>ℹ️</span>
                  <span>The student will automatically receive an official confirmation email with their grant details.</span>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50/30">
                <button 
                  onClick={() => setShowScholarshipModal(false)} 
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-md hover:bg-gray-200 text-xs transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={grantScholarship} 
                  disabled={actionLoading === selectedStudent._id} 
                  className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 text-xs disabled:opacity-50 transition-all shadow-xs"
                >
                  Grant & Send Email
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