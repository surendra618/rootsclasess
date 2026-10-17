import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, RefreshCw, Download, FileText, CheckCircle2, Clock, 
  AlertCircle, Copy, ExternalLink, Eye, BookOpen, User, Phone, 
  Mail, Award, Layers, Check, X, Shield, ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/adminendpoint';
import Loader from '../../components/AdminComponent/Loader';

const Base_Url = import.meta.env.VITE_BASE_URL || "http://localhost:5050";

const EXAM_CATEGORIES = [
  'All',
  'JEE Mains',
  'NEET',
  'SSC',
  'Defense',
  'CBSE Boards',
  'Foundation',
  'General'
];

const TestPurchases = ({ isEmbedded = false }) => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal & Copy State
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [copiedId, setCopiedId] = useState('');

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = api.enroll.getpurchesTest || `${Base_Url}/enroll/get-purches-test`;
      const res = await axios.get(url);
      
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setPurchases(res.data.data);
      } else {
        setPurchases([]);
      }
    } catch (err) {
      console.error("Error fetching test purchases:", err);
      setError(err.response?.data?.message || "Failed to load test purchases");
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleCopy = (text, label) => {
    if (!text || text === 'N/A') return;
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'success' || s === 'paid') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={13} className="text-emerald-600" />
          Paid / Unlocked
        </span>
      );
    }
    if (s === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200">
          <Clock size={13} className="text-amber-600" />
          Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-200">
        <AlertCircle size={13} className="text-rose-600" />
        Failed
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const c = (category || '').toLowerCase();
    if (c.includes('jee')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (c.includes('neet')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (c.includes('ssc')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (c.includes('defense') || c.includes('nda')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (c.includes('board') || c.includes('cbse')) return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  // Filtered & Sorted Purchases
  const filteredPurchases = purchases.filter(item => {
    const student = item.student || {};
    const test = item.test || {};
    
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (student.fullName || student.name || '').toLowerCase().includes(q);
      const matchEmail = (student.email || '').toLowerCase().includes(q);
      const matchPhone = (student.phone || '').includes(q);
      const matchTest = (test.title || '').toLowerCase().includes(q);
      const matchOrder = (item.orderId || '').toLowerCase().includes(q);
      const matchPayment = (item.paymentId || '').toLowerCase().includes(q);

      if (!matchName && !matchEmail && !matchPhone && !matchTest && !matchOrder && !matchPayment) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== 'All') {
      const itemStatus = item.paymentStatus || item.status || 'pending';
      if (statusFilter === 'Paid' && itemStatus !== 'success') return false;
      if (statusFilter === 'Pending' && itemStatus !== 'pending') return false;
      if (statusFilter === 'Failed' && itemStatus !== 'failed') return false;
    }

    // Category filter
    if (categoryFilter !== 'All') {
      const cat = (test.category || '').toLowerCase();
      if (!cat.includes(categoryFilter.toLowerCase())) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt || b.enrolledAt || 0) - new Date(a.createdAt || a.enrolledAt || 0);
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt || a.enrolledAt || 0) - new Date(b.createdAt || b.enrolledAt || 0);
    }
    if (sortBy === 'amount-high') {
      return (b.amount || 0) - (a.amount || 0);
    }
    if (sortBy === 'amount-low') {
      return (a.amount || 0) - (b.amount || 0);
    }
    if (sortBy === 'student') {
      const nameA = a.student?.fullName || a.student?.name || '';
      const nameB = b.student?.fullName || b.student?.name || '';
      return nameA.localeCompare(nameB);
    }
    if (sortBy === 'test') {
      const titleA = a.test?.title || '';
      const titleB = b.test?.title || '';
      return titleA.localeCompare(titleB);
    }
    return 0;
  });

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPurchases = filteredPurchases.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);

  // Metrics summary
  const totalRevenue = purchases
    .filter(p => (p.paymentStatus === 'success' || p.status === 'success'))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const successfulCount = purchases.filter(p => (p.paymentStatus === 'success' || p.status === 'success')).length;
  const pendingCount = purchases.filter(p => (p.paymentStatus === 'pending' || p.status === 'pending')).length;

  const exportToCSV = () => {
    if (!filteredPurchases.length) {
      toast.info("No records to export");
      return;
    }

    const headers = [
      "Order ID", "Payment ID", "Student Name", "Email", "Phone", 
      "Class", "Test Title", "Category", "Amount (INR)", "Status", "Date"
    ];

    const rows = filteredPurchases.map(p => [
      `"${p.orderId || ''}"`,
      `"${p.paymentId || ''}"`,
      `"${(p.student?.fullName || p.student?.name || 'Unknown').replace(/"/g, '""')}"`,
      `"${p.student?.email || ''}"`,
      `"${p.student?.phone || ''}"`,
      `"${p.student?.currentClass || p.student?.className || ''}"`,
      `"${(p.test?.title || 'Unknown Test').replace(/"/g, '""')}"`,
      `"${p.test?.category || ''}"`,
      p.amount || 0,
      `"${p.paymentStatus || p.status || ''}"`,
      `"${formatDate(p.enrolledAt || p.createdAt)}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mock_test_purchases_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Test purchases exported successfully!");
  };

  const getFullReceiptUrl = (receiptUrl) => {
    if (!receiptUrl) return null;
    if (receiptUrl.startsWith('http')) return receiptUrl;
    return `${Base_Url}${receiptUrl}`;
  };

  if (loading && purchases.length === 0) {
    return <Loader message="Loading Mock Test Purchases..." />;
  }

  return (
    <div className={`space-y-6 ${!isEmbedded ? 'min-h-screen bg-[#F8FAFC] p-4 sm:p-6 md:p-8' : ''}`}>
      
      {/* 1. Header Section */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">
              Mock Test Series & CBT Orders
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Mock Test Series Purchases
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Complete records of students who purchased paid test series, payment IDs, amounts & invoices.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={exportToCSV}
            className="px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Download CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchPurchases}
            className="px-3.5 py-2 bg-[#0078FF] hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Stat Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Revenue</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 font-black text-sm">₹</span>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">From successful test purchases</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Paid / Unlocked</span>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">
            {successfulCount}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Students unlocked access</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pending Orders</span>
            <Clock size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">
            {pendingCount}
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-0.5">Checkouts awaiting payment</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Transactions</span>
            <Layers size={18} className="text-blue-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">
            {purchases.length}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">All mock test purchase orders</div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Search Buyers / Tests
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by student name, email, phone, test title, order ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 text-xs font-medium border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none transition-all"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Payment Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none transition-all bg-white"
            >
              <option value="All">All Statuses ({purchases.length})</option>
              <option value="Paid">Paid / Success ({successfulCount})</option>
              <option value="Pending">Pending ({pendingCount})</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Exam Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none transition-all bg-white"
            >
              {EXAM_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'All Exam Categories' : cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary row: Sort and active filter pills */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-gray-500">
            <span>Showing <strong className="text-gray-900">{filteredPurchases.length}</strong> purchase records</span>
            {(searchQuery || statusFilter !== 'All' || categoryFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                  setCategoryFilter('All');
                }}
                className="text-xs font-bold text-[#FB0500] hover:underline cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1 text-xs font-medium border border-gray-200 rounded-md focus:ring-1 focus:ring-[#0078FF] outline-none bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-high">Amount: High to Low</option>
              <option value="amount-low">Amount: Low to High</option>
              <option value="student">Student Name A-Z</option>
              <option value="test">Test Title A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchPurchases} className="underline font-bold">Try Again</button>
        </div>
      )}

      {/* 4. Desktop Table View */}
      {filteredPurchases.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200/80 p-12 text-center shadow-xs">
          <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-base font-bold text-gray-900">No Mock Test Purchases Found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'All' || categoryFilter !== 'All'
              ? 'No records match your active search or filters. Try adjusting your search criteria.'
              : 'No students have purchased any mock tests yet.'}
          </p>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200/80 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    <th className="py-3.5 px-4">Student Details</th>
                    <th className="py-3.5 px-4">Mock Test Series</th>
                    <th className="py-3.5 px-4 text-center">Amount</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {currentPurchases.map((item) => {
                    const student = item.student || {};
                    const test = item.test || {};
                    const studentName = student.fullName || student.name || 'Unknown Student';
                    const avatarUrl = student.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=0078FF&color=fff`;
                    const receiptFullUrl = getFullReceiptUrl(item.receiptUrl);

                    return (
                      <tr key={item._id} className="hover:bg-blue-50/30 transition-colors">
                        {/* Student */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={avatarUrl}
                              alt={studentName}
                              className="w-9 h-9 rounded-full object-cover border border-gray-200 flex-shrink-0"
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=0078FF&color=fff`;
                              }}
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 truncate">{studentName}</p>
                              <p className="text-[11px] text-gray-400 truncate">{student.email || 'No email'}</p>
                              {student.phone && (
                                <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                                  <Phone size={10} /> {student.phone}
                                  {(student.currentClass || student.className) && (
                                    <span className="text-gray-400">• Class {student.currentClass || student.className}</span>
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Test Series */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="space-y-1">
                            <p className="font-bold text-gray-900 leading-snug line-clamp-2">
                              {test.title || 'Unknown Mock Test'}
                            </p>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {test.category && (
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${getCategoryBadge(test.category)}`}>
                                  {test.category}
                                </span>
                              )}
                              {test.difficulty && (
                                <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                  {test.difficulty}
                                </span>
                              )}
                              {test.totalMarks > 0 && (
                                <span className="text-[10px] text-gray-400">
                                  {test.totalMarks} Marks
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="text-sm font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md inline-block">
                            ₹{item.amount ?? test.price ?? 0}
                          </span>
                        </td>

                        {/* Date & Time */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-gray-600 text-[11px]">
                          {formatDate(item.enrolledAt || item.createdAt)}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getStatusBadge(item.paymentStatus || item.status)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {receiptFullUrl && (
                              <a
                                href={receiptFullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-md font-bold text-[11px] inline-flex items-center gap-1 transition-all"
                                title="Open PDF Receipt"
                              >
                                <FileText size={12} className="text-[#0078FF]" />
                                <span>Receipt</span>
                              </a>
                            )}

                            <button
                              onClick={() => setSelectedPurchase(item)}
                              className="px-2.5 py-1.5 bg-blue-50 border border-blue-200 text-[#0078FF] hover:bg-blue-100 rounded-md font-bold text-[11px] inline-flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Eye size={12} />
                              <span>Details</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
                <span>
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPurchases.length)} of {filteredPurchases.length}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Prev
                  </button>
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                        currentPage === idx + 1
                          ? 'bg-[#0078FF] text-white'
                          : 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 5. Mobile Cards View (Visible on screens < 768px) */}
          <div className="block md:hidden space-y-3">
            {currentPurchases.map((item) => {
              const student = item.student || {};
              const test = item.test || {};
              const studentName = student.fullName || student.name || 'Unknown Student';
              const avatarUrl = student.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=0078FF&color=fff`;
              const receiptFullUrl = getFullReceiptUrl(item.receiptUrl);

              return (
                <div key={item._id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={avatarUrl}
                        alt={studentName}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=0078FF&color=fff`;
                        }}
                      />
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{studentName}</h4>
                        <p className="text-[11px] text-gray-400">{student.email || 'No email'}</p>
                      </div>
                    </div>
                    {getStatusBadge(item.paymentStatus || item.status)}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                    <p className="text-xs font-bold text-gray-900">{test.title || 'Unknown Test'}</p>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      {test.category && <span className="font-semibold text-blue-600">{test.category}</span>}
                      {test.difficulty && <span>• {test.difficulty}</span>}
                      {test.duration && <span>• {test.duration} mins</span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Amount Paid</span>
                      <span className="font-black text-emerald-600 text-sm">₹{item.amount ?? test.price ?? 0}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block">Date</span>
                      <span className="text-gray-600 font-medium">{formatDate(item.enrolledAt || item.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    {receiptFullUrl && (
                      <a
                        href={receiptFullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold"
                      >
                        📄 Receipt
                      </a>
                    )}
                    <button
                      onClick={() => setSelectedPurchase(item)}
                      className="flex-1 py-2 bg-blue-50 border border-blue-200 text-[#0078FF] rounded-lg text-xs font-bold"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 6. Purchase Details Modal */}
      {selectedPurchase && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-100 animate-fadeIn my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 relative">
              <button
                onClick={() => setSelectedPurchase(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider">
                  Mock Test Order
                </span>
                <span className="text-blue-200 text-xs font-mono">
                  ID: {selectedPurchase.orderId || selectedPurchase._id}
                </span>
              </div>
              <h2 className="text-xl font-black">Purchase & Student Record</h2>
              <p className="text-xs text-blue-100 mt-1">
                Completed transaction details for {selectedPurchase.test?.title || 'Mock Test Series'}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Student Information Box */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <User size={14} className="text-[#0078FF]" />
                  Student Information
                </h3>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Full Name</span>
                    <span className="font-bold text-gray-900 text-sm">
                      {selectedPurchase.student?.fullName || selectedPurchase.student?.name || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Email Address</span>
                    <span className="font-medium text-gray-700">{selectedPurchase.student?.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Phone Number</span>
                    <span className="font-medium text-gray-700">{selectedPurchase.student?.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Class / Grade</span>
                    <span className="font-medium text-gray-700">
                      {selectedPurchase.student?.currentClass || selectedPurchase.student?.className || 'N/A'}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Address</span>
                    <span className="font-medium text-gray-700">{selectedPurchase.student?.address || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Test Information Box */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BookOpen size={14} className="text-[#0078FF]" />
                  Mock Test Series Information
                </h3>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Test Title</span>
                    <span className="font-bold text-gray-900 text-sm">
                      {selectedPurchase.test?.title || 'Unknown Test'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Exam Category</span>
                    <span className="font-semibold text-blue-600">{selectedPurchase.test?.category || 'General'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Difficulty</span>
                    <span className="font-semibold text-gray-700">{selectedPurchase.test?.difficulty || 'Medium'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Total Marks</span>
                    <span className="font-semibold text-gray-700">{selectedPurchase.test?.totalMarks || 0} Marks</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Duration</span>
                    <span className="font-semibold text-gray-700">{selectedPurchase.test?.duration || 0} mins</span>
                  </div>
                </div>
              </div>

              {/* Transaction & Payment Box */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Shield size={14} className="text-emerald-600" />
                  Razorpay Transaction & Payment
                </h3>
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Amount Paid</span>
                    <span className="font-black text-emerald-600 text-base">
                      ₹{selectedPurchase.amount ?? selectedPurchase.test?.price ?? 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Payment Status</span>
                    <div className="mt-0.5">
                      {getStatusBadge(selectedPurchase.paymentStatus || selectedPurchase.status)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Order ID</span>
                    <div className="flex items-center gap-2 mt-0.5 font-mono text-[11px] text-gray-800">
                      <span>{selectedPurchase.orderId || 'N/A'}</span>
                      {selectedPurchase.orderId && (
                        <button
                          onClick={() => handleCopy(selectedPurchase.orderId, 'Order ID')}
                          className="text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <Copy size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Payment ID</span>
                    <div className="flex items-center gap-2 mt-0.5 font-mono text-[11px] text-emerald-700 font-semibold">
                      <span>{selectedPurchase.paymentId || 'N/A'}</span>
                      {selectedPurchase.paymentId && (
                        <button
                          onClick={() => handleCopy(selectedPurchase.paymentId, 'Payment ID')}
                          className="text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <Copy size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Enrolled Date & Time</span>
                    <span className="font-medium text-gray-700">
                      {formatDate(selectedPurchase.enrolledAt || selectedPurchase.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
              {getFullReceiptUrl(selectedPurchase.receiptUrl) ? (
                <a
                  href={getFullReceiptUrl(selectedPurchase.receiptUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <FileText size={14} />
                  <span>Download / View PDF Receipt</span>
                </a>
              ) : (
                <span className="text-[11px] text-gray-400 italic">No receipt generated</span>
              )}

              <button
                onClick={() => setSelectedPurchase(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs rounded-lg transition-all cursor-pointer"
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

export default TestPurchases;
