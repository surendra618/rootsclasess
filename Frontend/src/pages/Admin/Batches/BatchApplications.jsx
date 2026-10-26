import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../../../services/endpoints";
import { toast } from "react-toastify";
import {
  Users, Search, Download, Trash2, Phone, Mail, Calendar,
  CheckCircle2, Clock, Eye, AlertCircle, RefreshCw, MessageSquare,
  Building, Zap, Filter, Award, ChevronDown
} from "lucide-react";

const BatchApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(api.batch.getApplications, {
        params: {
          status: statusFilter !== "All" ? statusFilter : undefined,
          search: searchTerm || undefined
        }
      });
      if (res.data?.success) {
        setApplications(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
      toast.error("Failed to fetch applications from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApplications();
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await axios.put(api.batch.updateStatus(id), { status: newStatus });
      if (res.data?.success) {
        toast.success(`Status updated to "${newStatus}"`);
        setApplications(prev =>
          prev.map(app => (app._id === id ? { ...app, status: newStatus } : app))
        );
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id, studentName) => {
    if (!window.confirm(`Delete application lead for "${studentName}"?`)) return;
    try {
      const res = await axios.delete(api.batch.deleteApplication(id));
      if (res.data?.success) {
        toast.success("Application deleted");
        setApplications(prev => prev.filter(app => app._id !== id));
      }
    } catch (err) {
      toast.error("Failed to delete application");
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (applications.length === 0) {
      toast.info("No applications to export");
      return;
    }

    const headers = [
      "Enrollment ID",
      "Student Name",
      "Phone",
      "Email",
      "City",
      "Parent Name",
      "Parent Phone",
      "School Name",
      "Batch Name",
      "Learning Mode",
      "Payment Option",
      "Payable Now (₹)",
      "Coupon Code",
      "Status",
      "Date"
    ];

    const rows = applications.map(a => [
      a.enrollmentId,
      `"${a.studentName}"`,
      a.phone,
      a.email,
      `"${a.city}"`,
      `"${a.parentName || 'N/A'}"`,
      a.parentPhone || "N/A",
      `"${a.schoolName || 'N/A'}"`,
      `"${a.batchTitle}"`,
      a.learningMode,
      a.paymentOption,
      a.payableNow,
      a.couponCode || "None",
      a.status,
      new Date(a.createdAt).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Roots_Batch_Applications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file downloaded successfully!");
  };

  // Metrics
  const totalLeads = applications.length;
  const tokenLeads = applications.filter(a => a.paymentOption === "token").length;
  const fullFeeLeads = applications.filter(a => a.paymentOption === "full").length;
  const holdLeads = applications.filter(a => a.paymentOption === "counseling").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-red-50 text-[#FB0500] border border-red-200 text-[10px] font-black uppercase tracking-wider mb-1.5">
            <Users size={12} />
            APPLICANT ADMISSIONS DATA
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Batch Enrollment Applications & Leads
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time inquiries and seat bookings submitted by students from the Enrollment portal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchApplications}
            title="Refresh"
            className="p-2.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-sm transition-colors"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-sm transition-colors"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── Summary Counters ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 border border-slate-200 rounded-sm">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Applicants</p>
          <p className="text-2xl font-black text-slate-900 mt-0.5">{totalLeads}</p>
          <p className="text-[10px] text-slate-500 mt-1">All batches registered</p>
        </div>

        <div className="bg-white p-4 border border-slate-200 rounded-sm">
          <p className="text-[10px] uppercase font-bold text-slate-400">Token Paid (₹499)</p>
          <p className="text-2xl font-black text-[#FB0500] mt-0.5">{tokenLeads}</p>
          <p className="text-[10px] text-slate-500 mt-1">Seat lock requests</p>
        </div>

        <div className="bg-white p-4 border border-slate-200 rounded-sm">
          <p className="text-[10px] uppercase font-bold text-slate-400">Full Program Fee</p>
          <p className="text-2xl font-black text-emerald-600 mt-0.5">{fullFeeLeads}</p>
          <p className="text-[10px] text-slate-500 mt-1">Full admission leads</p>
        </div>

        <div className="bg-white p-4 border border-slate-200 rounded-sm">
          <p className="text-[10px] uppercase font-bold text-slate-400">Seat Hold (Offline)</p>
          <p className="text-2xl font-black text-amber-600 mt-0.5">{holdLeads}</p>
          <p className="text-[10px] text-slate-500 mt-1">Pay at Center / Counselor</p>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 border border-slate-200 rounded-sm">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, WhatsApp number, email, or Enrollment ID..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-sm text-xs outline-none focus:border-[#FB0500]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#FB0500] hover:bg-red-700 text-white text-xs font-bold rounded-sm uppercase tracking-wide transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-sm text-xs font-bold bg-white outline-none focus:border-[#FB0500]"
          >
            <option value="All">All Status</option>
            <option value="New">New Lead</option>
            <option value="Contacted">Contacted</option>
            <option value="Seat Confirmed">Seat Confirmed</option>
            <option value="Fee Received">Fee Received</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* ── Applications Data Table ── */}
      <div className="mt-4 bg-white border border-slate-200 rounded-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-[#FB0500] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold">Loading student applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="py-16 text-center p-6">
            <Users size={36} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No Applications Found</p>
            <p className="text-xs text-slate-400 mt-1">
              Applications submitted by students on the /enroll portal will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Ref ID / Date</th>
                  <th className="p-3.5">Student Details</th>
                  <th className="p-3.5">Batch Enrolled</th>
                  <th className="p-3.5">Mode / City</th>
                  <th className="p-3.5">Fee & Payment</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Ref ID & Date */}
                    <td className="p-3.5 align-top">
                      <span className="font-mono font-black text-[#FB0500] text-xs block">
                        {app.enrollmentId}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(app.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </span>
                    </td>

                    {/* Student Info */}
                    <td className="p-3.5 align-top">
                      <strong className="text-slate-900 font-black text-xs block">
                        {app.studentName}
                      </strong>
                      <div className="flex items-center gap-2 mt-1">
                        <a
                          href={`https://wa.me/91${app.phone}?text=Hello%20${encodeURIComponent(app.studentName)},%20this%20is%20Roots%20Classes%20regarding%20your%20enrollment%20in%20${encodeURIComponent(app.batchTitle)}.`}
                          target="_blank"
                          rel="noreferrer"
                          title="Message on WhatsApp"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm"
                        >
                          <MessageSquare size={11} />
                          {app.phone}
                        </a>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5 truncate max-w-[160px]">
                        {app.email}
                      </span>
                      {app.parentName && app.parentName !== "N/A" && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Parent: {app.parentName} ({app.parentPhone || "N/A"})
                        </span>
                      )}
                    </td>

                    {/* Batch Name */}
                    <td className="p-3.5 align-top max-w-[200px]">
                      <span className="inline-block text-[9px] font-black uppercase px-1.5 py-0.2 rounded-sm bg-red-100 text-[#FB0500] border border-red-200 mb-1">
                        {app.batchBadge || "BATCH"}
                      </span>
                      <strong className="text-slate-800 font-bold text-xs block leading-snug line-clamp-2">
                        {app.batchTitle}
                      </strong>
                    </td>

                    {/* Mode & City */}
                    <td className="p-3.5 align-top">
                      <span className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-black uppercase mb-1 ${
                        app.learningMode === "offline"
                          ? "bg-slate-100 text-slate-800"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}>
                        {app.learningMode === "offline" ? "Classroom (Patna)" : "Live Online"}
                      </span>
                      <span className="text-[11px] text-slate-600 font-medium block">
                        City: <strong>{app.city}</strong>
                      </span>
                      {app.schoolName && app.schoolName !== "N/A" && (
                        <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                          {app.schoolName}
                        </span>
                      )}
                    </td>

                    {/* Payment Info */}
                    <td className="p-3.5 align-top">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-black text-[#FB0500]">
                          {app.payableNow === 0
                            ? "₹0 (Free / Offline)"
                            : `₹${app.payableNow?.toLocaleString("en-IN")}`}
                        </span>
                        {app.paymentId ? (
                          <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded-sm flex items-center gap-0.5">
                            ✓ PAID ONLINE
                          </span>
                        ) : app.payableNow === 0 ? (
                          <span className="text-[9px] font-bold bg-slate-100 text-slate-700 px-1 py-0.2 rounded-sm">
                            FREE HOLD
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1 py-0.2 rounded-sm">
                            UNPAID
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 block uppercase">
                        {app.paymentOption === "token"
                          ? "Token Fee Booking"
                          : app.paymentOption === "full"
                          ? "Full Program Fee"
                          : "Counselor Call / Free Hold"}
                      </span>
                      {app.paymentId && (
                        <span className="text-[9px] font-mono text-slate-400 block truncate max-w-[130px]" title={app.paymentId}>
                          Txn: {app.paymentId}
                        </span>
                      )}
                      {app.couponCode && app.couponCode !== "None" && (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded-sm mt-0.5 inline-block">
                          Code: {app.couponCode}
                        </span>
                      )}
                    </td>

                    {/* Status Dropdown */}
                    <td className="p-3.5 align-top">
                      <select
                        value={app.status || "New"}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        className={`text-[10px] font-black uppercase px-2 py-1 rounded-sm border outline-none cursor-pointer ${
                          app.status === "Seat Confirmed"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : app.status === "Contacted"
                            ? "bg-blue-50 text-blue-800 border-blue-300"
                            : app.status === "Fee Received"
                            ? "bg-purple-50 text-purple-800 border-purple-300"
                            : app.status === "Cancelled"
                            ? "bg-red-50 text-red-800 border-red-300"
                            : "bg-amber-50 text-amber-800 border-amber-300"
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Seat Confirmed">Seat Confirmed</option>
                        <option value="Fee Received">Fee Received</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 align-top text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedApp(app)}
                        title="View Full Details"
                        className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-sm transition-colors"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(app._id, app.studentName)}
                        title="Delete Lead"
                        className="p-1.5 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-sm transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── DETAIL MODAL ── */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-sm max-w-lg w-full p-6 border border-slate-200 relative my-6">
            
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#FB0500] uppercase block">
                  {selectedApp.enrollmentId}
                </span>
                <h3 className="text-base font-black text-slate-900">
                  {selectedApp.studentName} — Application Lead
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Student Phone:</span>
                <strong className="text-slate-900">{selectedApp.phone}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Student Email:</span>
                <strong className="text-slate-900">{selectedApp.email}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">City / Location:</span>
                <strong className="text-slate-900">{selectedApp.city}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Batch Selected:</span>
                <strong className="text-slate-900 text-right max-w-[220px]">{selectedApp.batchTitle}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Learning Mode:</span>
                <strong className="text-slate-900 uppercase">{selectedApp.learningMode}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Parent / Guardian:</span>
                <strong className="text-slate-900">{selectedApp.parentName || "N/A"} ({selectedApp.parentPhone || "N/A"})</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">School / College:</span>
                <strong className="text-slate-900">{selectedApp.schoolName || "N/A"}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment Option:</span>
                <strong className="text-slate-900 uppercase">{selectedApp.paymentOption} (₹{selectedApp.payableNow})</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Application Date:</span>
                <strong className="text-slate-900">{new Date(selectedApp.createdAt).toLocaleString()}</strong>
              </div>
              {selectedApp.notes && (
                <div className="pt-2">
                  <span className="text-slate-500 block mb-1">Student Notes / Question:</span>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-sm text-slate-700 italic">
                    "{selectedApp.notes}"
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200 flex justify-between gap-2">
              <a
                href={`https://wa.me/91${selectedApp.phone}?text=Hello%20${encodeURIComponent(selectedApp.studentName)},%20Roots%20Classes%20counselor%20here%20regarding%20your%20admission%20in%20${encodeURIComponent(selectedApp.batchTitle)}.`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase rounded-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare size={14} />
                <span>Message on WhatsApp</span>
              </a>
              <button
                onClick={() => setSelectedApp(null)}
                className="py-2 px-4 bg-slate-900 text-white font-bold text-xs uppercase rounded-sm"
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

export default BatchApplications;
