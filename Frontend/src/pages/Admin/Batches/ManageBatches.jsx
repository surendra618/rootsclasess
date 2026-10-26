import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../../../services/endpoints";
import { toast } from "react-toastify";
import {
  Calendar, Plus, Trash2, Edit3, Image as ImageIcon, Flame,
  Users, CheckCircle2, Clock, BookOpen, AlertCircle, RefreshCw,
  Eye, Zap, X, Upload
} from "lucide-react";

const ManageBatches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const initialForm = {
    title: "",
    badge: "CLASS 10 SCIENCE",
    faculty: "Surendra Sir",
    facultyRole: "Senior Faculty & Founder",
    domain: "CBSE BOARD 2026–27 • FOUNDATION",
    desc: "",
    startDate: "Nov 15, 2026",
    timing: "5:30 PM – 7:30 PM",
    duration: "4 Months Crash + Test Series",
    mode: "Classroom (Patna) + Live Online",
    seats: 45,
    seatsLeft: 10,
    originalPrice: 7999,
    fee: 3499,
    tokenAmount: 499,
    scholarshipUpTo: "Up to 90%",
    hot: true,
    isApproved: false,
    bannerImg: "",
    features: "Live Masterclasses, Printed Formula Booklet, Daily Practice Problems (DPP), Full Mock Test Series",
    syllabusHighlights: "Electricity & Circuit Theory, Light & Ray Diagrams, Chemical Reactions, Formula Shortcuts"
  };

  const [formData, setFormData] = useState(initialForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [approvingId, setApprovingId] = useState(null);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${api.batch.getAll}?admin=true`);
      if (res.data?.success) {
        setBatches(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load batches:", err);
      toast.error("Failed to load batches from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleToggleApproval = async (id, currentApproval) => {
    try {
      setApprovingId(id);
      const res = await axios.put(api.batch.approve(id));
      if (res.data?.success) {
        const isNowApproved = res.data.data?.isApproved;
        toast.success(
          isNowApproved
            ? "✓ Batch approved! It is now live on the website."
            : "Batch unapproved / hidden from the website."
        );
        setBatches(prev =>
          prev.map(b => (b._id === id ? { ...b, isApproved: isNowApproved, isActive: isNowApproved ? true : b.isActive } : b))
        );
      }
    } catch (err) {
      console.error("Failed to update approval:", err);
      toast.error(err.response?.data?.message || "Failed to update approval");
    } finally {
      setApprovingId(null);
    }
  };

  const handleOpenAdd = () => {
    setEditingBatch(null);
    setFormData(initialForm);
    setSelectedFile(null);
    setPreviewUrl("");
    setShowModal(true);
  };

  const handleOpenEdit = (batch) => {
    setEditingBatch(batch);
    setFormData({
      title: batch.title || "",
      badge: batch.badge || "CLASS 10 SCIENCE",
      faculty: batch.faculty || "",
      facultyRole: batch.facultyRole || "",
      domain: batch.domain || "",
      desc: batch.desc || "",
      startDate: batch.startDate || "",
      timing: batch.timing || "",
      duration: batch.duration || "",
      mode: batch.mode || "",
      seats: batch.seats || 40,
      seatsLeft: batch.seatsLeft || 10,
      originalPrice: batch.originalPrice || 0,
      fee: batch.fee || 0,
      tokenAmount: batch.tokenAmount || 499,
      scholarshipUpTo: batch.scholarshipUpTo || "Up to 90%",
      hot: !!batch.hot,
      isApproved: batch.isApproved !== false,
      bannerImg: batch.bannerImg || "",
      features: Array.isArray(batch.features) ? batch.features.join(", ") : batch.features || "",
      syllabusHighlights: Array.isArray(batch.syllabusHighlights) ? batch.syllabusHighlights.join(", ") : batch.syllabusHighlights || ""
    });
    setSelectedFile(null);
    setPreviewUrl(batch.bannerImg || "");
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await axios.delete(api.batch.delete(id));
      if (res.data?.success) {
        toast.success("Batch deleted successfully");
        setBatches(prev => prev.filter(b => b._id !== id));
      }
    } catch (err) {
      toast.error("Failed to delete batch");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.faculty.trim() || !formData.desc.trim()) {
      toast.error("Please fill in Title, Faculty, and Description");
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    if (selectedFile) {
      data.append("bannerImg", selectedFile);
    }

    try {
      if (editingBatch) {
        const res = await axios.put(api.batch.update(editingBatch._id), data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        if (res.data?.success) {
          toast.success("Batch updated successfully!");
          setShowModal(false);
          fetchBatches();
        }
      } else {
        const res = await axios.post(api.batch.create, data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        if (res.data?.success) {
          toast.success("New batch uploaded successfully!");
          setShowModal(false);
          fetchBatches();
        }
      }
    } catch (err) {
      console.error("Batch save error:", err);
      toast.error(err.response?.data?.message || "Failed to save batch");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-red-50 text-[#FB0500] border border-red-200 text-[10px] font-black uppercase tracking-wider mb-1.5">
            <Calendar size={12} />
            BATCH & ADMISSION MANAGEMENT
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Manage Upcoming Batches
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload new batches, update syllabus/fees, and configure seat availability displayed on the website.
          </p>
        </div>

        {/* ── Upload New Batch Action Button ── */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBatches}
            title="Refresh"
            className="p-2.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-sm transition-colors"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#FB0500] hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-sm transition-colors shadow-xs"
          >
            <Plus size={16} />
            <span>Upload New Batch</span>
          </button>
        </div>
      </div>

      {/* ── Batches Grid / List ── */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-[#FB0500] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold">Loading batches from database...</p>
        </div>
      ) : batches.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-200 rounded-sm mt-6 p-8">
          <Calendar size={40} className="text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-black text-slate-800">No Batches Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click "+ Upload New Batch" to publish your first academic batch to the website.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 px-4 py-2 bg-[#FB0500] text-white text-xs font-black rounded-sm uppercase tracking-wider"
          >
            + Upload New Batch
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {batches.map((b) => (
            <div
              key={b._id}
              className="bg-white border border-slate-200 rounded-sm overflow-hidden flex flex-col justify-between transition-all hover:border-slate-300"
            >
              <div>
                {/* Banner Image Preview */}
                <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden border-b border-slate-200">
                  <img
                    src={b.bannerImg}
                    alt={b.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/batch_banner.jpg";
                    }}
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="text-[10px] font-black px-2 py-0.5 text-white uppercase rounded-sm bg-[#FB0500]">
                      {b.badge}
                    </span>
                    {b.isApproved ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-600 text-white rounded-sm flex items-center gap-1 shadow-xs">
                        <CheckCircle2 size={10} /> LIVE
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-500 text-white rounded-sm flex items-center gap-1 shadow-xs">
                        <Clock size={10} /> DRAFT
                      </span>
                    )}
                    {b.hot && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-500 text-white rounded-sm flex items-center gap-0.5">
                        <Flame size={10} fill="#fff" /> HOT
                      </span>
                    )}
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-sm">
                    Starts {b.startDate}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {b.domain}
                  </p>
                  <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-2 mt-0.5">
                    {b.title}
                  </h3>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Faculty</p>
                      <p className="font-bold text-slate-800 text-[11px] truncate">{b.faculty}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Timings</p>
                      <p className="font-semibold text-slate-700 text-[11px] truncate">{b.timing}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Program Fee</p>
                      <p className="font-black text-[#FB0500] text-xs">₹{b.fee?.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Seats Left</p>
                      <p className="font-black text-red-600 text-xs">{b.seatsLeft} / {b.seats}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <a
                    href={`/enroll?batch=${b._id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                    title="Preview on live site"
                  >
                    <Eye size={12} />
                    <span>Preview</span>
                  </a>

                  {/* APPROVE / PUBLISH BUTTON ("KARE TABHI JAYE") */}
                  <button
                    type="button"
                    onClick={() => handleToggleApproval(b._id, b.isApproved)}
                    disabled={approvingId === b._id}
                    title={b.isApproved ? "Click to Unpublish / Hide from students" : "Click to Approve and publish live"}
                    className={`text-[11px] font-bold flex items-center gap-1 px-2.5 py-1 rounded-sm border transition-all ${
                      b.isApproved
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                        : "bg-[#FB0500] text-white border-[#FB0500] hover:bg-red-700 shadow-xs"
                    }`}
                  >
                    <CheckCircle2 size={12} />
                    <span>
                      {approvingId === b._id
                        ? "Saving..."
                        : b.isApproved
                        ? "Approved ✓"
                        : "Approve"}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-sm transition-colors text-xs flex items-center gap-1 font-semibold px-2.5"
                    title="Edit Batch"
                  >
                    <Edit3 size={12} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(b._id, b.title)}
                    className="p-1.5 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-sm transition-colors text-xs flex items-center gap-1 font-semibold px-2"
                    title="Delete Batch"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── UPLOAD / EDIT BATCH MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-sm max-w-2xl w-full p-6 border border-slate-200 relative my-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 mb-5">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {editingBatch ? "Edit Academic Batch" : "Upload New Academic Batch"}
                </h2>
                <p className="text-xs text-slate-500">
                  Fill in the details to display this batch on Homepage and Enrollment portal.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-sm"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Title & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Batch Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Class 10 Science — Electricity & Board Booster Batch"
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs sm:text-sm outline-none focus:border-[#FB0500]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Badge Tag <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData(p => ({ ...p, badge: e.target.value }))}
                    placeholder="CLASS 10 SCIENCE"
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs sm:text-sm uppercase font-bold outline-none focus:border-[#FB0500]"
                    required
                  />
                </div>
              </div>

              {/* Faculty & Domain */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Faculty Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.faculty}
                    onChange={(e) => setFormData(p => ({ ...p, faculty: e.target.value }))}
                    placeholder="Surendra Sir"
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs sm:text-sm outline-none focus:border-[#FB0500]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Domain / Board
                  </label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData(p => ({ ...p, domain: e.target.value }))}
                    placeholder="CBSE BOARD 2026–27 • FOUNDATION"
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs sm:text-sm outline-none focus:border-[#FB0500]"
                  />
                </div>
              </div>

              {/* Start Date, Timing & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.startDate}
                    onChange={(e) => setFormData(p => ({ ...p, startDate: e.target.value }))}
                    placeholder="Nov 15, 2026"
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs outline-none focus:border-[#FB0500]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Class Timing
                  </label>
                  <input
                    type="text"
                    value={formData.timing}
                    onChange={(e) => setFormData(p => ({ ...p, timing: e.target.value }))}
                    placeholder="5:30 PM – 7:30 PM"
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs outline-none focus:border-[#FB0500]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Course Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData(p => ({ ...p, duration: e.target.value }))}
                    placeholder="4 Months Crash Course"
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs outline-none focus:border-[#FB0500]"
                  />
                </div>
              </div>

              {/* Fees & Seats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Actual Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData(p => ({ ...p, originalPrice: e.target.value }))}
                    placeholder="7999"
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs outline-none focus:border-[#FB0500]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Offer Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.fee}
                    onChange={(e) => setFormData(p => ({ ...p, fee: e.target.value }))}
                    placeholder="3499"
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs font-bold text-[#FB0500] outline-none focus:border-[#FB0500]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Token Booking (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.tokenAmount}
                    onChange={(e) => setFormData(p => ({ ...p, tokenAmount: e.target.value }))}
                    placeholder="499"
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs outline-none focus:border-[#FB0500]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Seats Left / Total
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      value={formData.seatsLeft}
                      onChange={(e) => setFormData(p => ({ ...p, seatsLeft: e.target.value }))}
                      placeholder="7"
                      className="w-1/2 px-2 py-2 border border-slate-300 rounded-sm text-xs text-red-600 font-bold outline-none"
                    />
                    <input
                      type="number"
                      value={formData.seats}
                      onChange={(e) => setFormData(p => ({ ...p, seats: e.target.value }))}
                      placeholder="45"
                      className="w-1/2 px-2 py-2 border border-slate-300 rounded-sm text-xs outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Banner Image Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Batch Banner Image (File Upload or Image URL)
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="flex-1 w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.bannerImg}
                      onChange={(e) => {
                        setFormData(p => ({ ...p, bannerImg: e.target.value }));
                        setPreviewUrl(e.target.value);
                      }}
                      placeholder="Or paste image URL (e.g. /batch_banner.jpg)"
                      className="w-full px-3 py-1.5 mt-1 border border-slate-300 rounded-sm text-xs outline-none"
                    />
                  </div>

                  {previewUrl && (
                    <div className="w-24 h-14 rounded-sm border border-slate-200 overflow-hidden bg-slate-100 flex-shrink-0">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Batch Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.desc}
                  onChange={(e) => setFormData(p => ({ ...p, desc: e.target.value }))}
                  placeholder="Comprehensive coverage of high weightage topics..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs outline-none focus:border-[#FB0500]"
                  required
                />
              </div>

              {/* Features & Syllabus (Comma-separated) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Key Features (Comma Separated)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.features}
                    onChange={(e) => setFormData(p => ({ ...p, features: e.target.value }))}
                    placeholder="Feature 1, Feature 2, Feature 3"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-sm text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Syllabus Highlights (Comma Separated)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.syllabusHighlights}
                    onChange={(e) => setFormData(p => ({ ...p, syllabusHighlights: e.target.value }))}
                    placeholder="Chapter 1, Chapter 2, Derivations"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-sm text-xs outline-none"
                  />
                </div>
              </div>

              {/* Hot and Approval Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-sm">
                  <input
                    type="checkbox"
                    id="hotBatch"
                    checked={formData.hot}
                    onChange={(e) => setFormData(p => ({ ...p, hot: e.target.checked }))}
                    className="accent-[#FB0500] cursor-pointer"
                  />
                  <label htmlFor="hotBatch" className="text-xs font-bold text-slate-800 cursor-pointer flex items-center gap-1">
                    <Flame size={12} className="text-amber-500" />
                    Mark as "HOT" Batch
                  </label>
                </div>

                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-sm">
                  <input
                    type="checkbox"
                    id="approveBatchNow"
                    checked={formData.isApproved}
                    onChange={(e) => setFormData(p => ({ ...p, isApproved: e.target.checked }))}
                    className="accent-emerald-600 cursor-pointer"
                  />
                  <label htmlFor="approveBatchNow" className="text-xs font-bold text-slate-800 cursor-pointer flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-600" />
                    Approve & Go Live Immediately
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-sm text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#FB0500] hover:bg-red-700 text-white rounded-sm text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingBatch ? "Save Changes" : "Upload Batch"}</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default ManageBatches;
