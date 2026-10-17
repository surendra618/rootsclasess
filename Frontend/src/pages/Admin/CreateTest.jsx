import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, ArrowLeft, Clock, Percent, AlertCircle, CheckCircle, 
  Sparkles, Shield, BookOpen, Layers, CheckCircle2, IndianRupee,
  Calendar, Award, HelpCircle
} from 'lucide-react';
import axios from 'axios';
import api from '../../services/adminendpoint';

const EXAM_CATEGORIES = [
  { value: 'NEET', label: '🧬 NEET UG (Physics, Chemistry, Botany, Zoology)' },
  { value: 'JEE Mains', label: '⚙️ JEE Mains (Mathematics, Physics, Chemistry)' },
  { value: 'SSC', label: '🏛️ SSC (Reasoning, Quant, English, GA)' },
  { value: 'Defense', label: '🎖️ Defense / NDA' },
  { value: 'CBSE Boards', label: '📚 CBSE Boards' },
  { value: 'Foundation', label: '🌱 Foundation (Classes 9th-10th)' },
  { value: 'General', label: '📋 General / Scholarship Test' },
  { value: 'Custom', label: '✏️ Other / Custom Category' },
];

const DURATION_PRESETS = [30, 45, 60, 90, 120, 180];
const PASSING_PRESETS = [40, 50, 60, 70, 75];

const CreateTest = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    passingPercentage: 70,
    duration: 60,
    className: '11th',
    category: 'JEE Mains',
    customCategory: '',
    difficulty: 'Medium',
    year: '2026',
    description: 'Test your knowledge with this comprehensive mock test designed by Roots Classes expert faculty.',
    isPublished: 'published',
    isPaid: false,
    price: 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    if (!formData.title.trim()) {
      setErrorMessage('Please enter a valid test title.');
      return;
    }

    const resolvedCategory = formData.category === 'Custom'
      ? (formData.customCategory?.trim() || 'General')
      : formData.category;

    if (formData.isPaid && (!formData.price || Number(formData.price) <= 0)) {
      setErrorMessage('Please enter a valid price for the paid test series.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        title: formData.title.trim(),
        duration: Number(formData.duration) || 60,
        passingPercentage: Number(formData.passingPercentage) || 70,
        className: formData.className || '11th',
        category: resolvedCategory,
        difficulty: formData.difficulty || 'Medium',
        year: String(formData.year || '2026'),
        description: formData.description.trim() || 'Mock test prepared by Roots Classes.',
        isPublished: formData.isPublished === 'published',
        isPaid: Boolean(formData.isPaid),
        price: Boolean(formData.isPaid) ? Number(formData.price) : 0
      };

      const response = await axios.post(api.test.createTest, payload);

      if (response.data.success || response.data.status === 200 || response.data.data) {
        setSuccessMessage('Test created successfully! Redirecting to Test Management...');
        setTimeout(() => {
          navigate('/admin/test-management');
        }, 1200);
      } else {
        setErrorMessage(response.data.message || 'Failed to create test.');
      }
    } catch (error) {
      console.error('Error creating test:', error);
      setErrorMessage(error.response?.data?.message || error.message || 'Server error while creating test.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 font-sans">
      {/* Top Navigation Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/test-management')}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Return to Test Management"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back to All Tests</span>
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900">Create New Test</h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">Step 1: Set up the test details & grading rules</p>
            </div>
          </div>

          <Link
            to="/admin/test-management"
            className="px-3.5 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Cancel
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 shadow-xs animate-in fade-in duration-200">
            <CheckCircle className="text-emerald-600 shrink-0" size={20} />
            <div>
              <p className="text-xs font-bold">{successMessage}</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">You will be able to add or upload questions on the Test Management portal.</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 shadow-xs">
            <AlertCircle className="text-rose-600 shrink-0" size={20} />
            <p className="text-xs font-bold">{errorMessage}</p>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Plus className="text-emerald-400" size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight">Create New Test Card</h2>
                <p className="text-xs text-slate-300 mt-0.5">Fill out exam details. Questions can be added right after creation.</p>
              </div>
            </div>
            <span className="hidden sm:inline text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-white/10 text-white border border-white/10">
              Exam Builder
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* 1. Test Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Test Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g. JEE Mains 2026 Full Length Mock Test - Physics & Chemistry"
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-900 transition"
              />
              <p className="text-[11px] text-slate-400 mt-1">Make the title specific and informative for students.</p>
            </div>

            {/* 2. Exam Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Target Exam Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-900 transition"
              >
                {EXAM_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>

              {formData.category === 'Custom' && (
                <div className="mt-2.5">
                  <input
                    type="text"
                    required
                    value={formData.customCategory}
                    onChange={(e) => handleChange('customCategory', e.target.value)}
                    placeholder="Enter custom category name (e.g. NTSE, Olympiad, CUET)"
                    className="w-full px-4 py-2 text-xs border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-blue-50/30"
                  />
                </div>
              )}
            </div>

            {/* 3. Class & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Target Class
                </label>
                <select
                  value={formData.className}
                  onChange={(e) => handleChange('className', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 transition"
                >
                  <option value="11th">Class 11th</option>
                  <option value="12th">Class 12th</option>
                  <option value="10th">Class 10th</option>
                  <option value="9th">Class 9th</option>
                  <option value="Dropper">Dropper / Target Batch</option>
                  <option value="All">All Classes / Open Test</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Difficulty Level
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleChange('difficulty', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 transition"
                >
                  <option value="Easy">🟢 Easy (Beginner friendly)</option>
                  <option value="Medium">🟡 Medium (Exam Level)</option>
                  <option value="Hard">🔴 Hard (Advanced Level)</option>
                </select>
              </div>
            </div>

            {/* 4. Duration & Exam Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-slate-500" />
                    Duration (Minutes)
                  </span>
                </label>
                <input
                  type="number"
                  min="5"
                  max="360"
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', Number(e.target.value))}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-slate-900 transition"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {DURATION_PRESETS.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleChange('duration', d)}
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                        formData.duration === d 
                          ? 'bg-slate-900 text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {d} min
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-slate-500" />
                    Target Year
                  </span>
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => handleChange('year', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 transition"
                >
                  {[2026, 2025, 2024, 2023, 2022, 2021].map(yr => (
                    <option key={yr} value={String(yr)}>{yr}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 5. Passing Percentage */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Award size={13} className="text-slate-500" />
                  Passing Percentage (%)
                </label>
                <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {formData.passingPercentage}% Required
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="90"
                step="5"
                value={formData.passingPercentage}
                onChange={(e) => handleChange('passingPercentage', Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between items-center mt-2">
                <div className="flex gap-1.5">
                  {PASSING_PRESETS.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleChange('passingPercentage', p)}
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                        formData.passingPercentage === p 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-slate-400">Min passing score to qualify</span>
              </div>
            </div>

            {/* 6. Pricing: Free vs Paid */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Test Series Pricing Model
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <label 
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                    !formData.isPaid 
                      ? 'bg-emerald-50/80 border-emerald-300 shadow-2xs' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="pricingModel"
                    checked={!formData.isPaid}
                    onChange={() => {
                      handleChange('isPaid', false);
                      handleChange('price', 0);
                    }}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">⚡ Free Mock Test</span>
                    <span className="text-[11px] text-slate-500">Accessible to all enrolled students for ₹0</span>
                  </div>
                </label>

                <label 
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                    formData.isPaid 
                      ? 'bg-amber-50/80 border-amber-300 shadow-2xs' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="pricingModel"
                    checked={formData.isPaid}
                    onChange={() => {
                      handleChange('isPaid', true);
                      if (!formData.price) handleChange('price', 99);
                    }}
                    className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">👑 Paid / Premium Test</span>
                    <span className="text-[11px] text-slate-500">Requires purchase / enrollment fee</span>
                  </div>
                </label>
              </div>

              {formData.isPaid && (
                <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center gap-3">
                  <label className="text-xs font-bold text-slate-700 shrink-0">
                    Test Price (₹ INR):
                  </label>
                  <div className="relative w-full sm:w-48">
                    <IndianRupee className="absolute left-3 top-2.5 text-slate-400" size={14} />
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="e.g. 199"
                      value={formData.price || ''}
                      onChange={(e) => handleChange('price', Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-bold text-slate-900"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 7. Publish Status */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Initial Publish Status
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  formData.isPublished === 'published'
                    ? 'bg-blue-50/80 border-blue-300'
                    : 'bg-white border-slate-200'
                }`}>
                  <input
                    type="radio"
                    name="publishStatus"
                    value="published"
                    checked={formData.isPublished === 'published'}
                    onChange={(e) => handleChange('isPublished', e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Publish Immediately</span>
                    <span className="text-[11px] text-slate-500">Visible on student portal once questions are added</span>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  formData.isPublished === 'draft'
                    ? 'bg-slate-100 border-slate-300'
                    : 'bg-white border-slate-200'
                }`}>
                  <input
                    type="radio"
                    name="publishStatus"
                    value="draft"
                    checked={formData.isPublished === 'draft'}
                    onChange={(e) => handleChange('isPublished', e.target.value)}
                    className="w-4 h-4 text-slate-600 focus:ring-slate-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Save as Draft (Private)</span>
                    <span className="text-[11px] text-slate-500">Keep hidden until questions and review are complete</span>
                  </div>
                </label>
              </div>
            </div>

            {/* 8. Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Test Description & Instructions
              </label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Write exam instructions, marking scheme (+4, -1), syllabus covered, etc."
                className="w-full px-4 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 transition"
              />
            </div>
          </div>

          {/* Card Footer / Submit */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/test-management')}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 rounded-xl transition cursor-pointer text-center"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim()}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#FB0500] hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Plus size={16} />
              <span>{isSubmitting ? 'Creating Test Card...' : 'Create Test Card & Proceed'}</span>
            </button>
          </div>
        </form>

        {/* Informative Step-by-Step Banner */}
        <div className="mt-8 bg-blue-50/70 border border-blue-200 rounded-2xl p-5 sm:p-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-blue-900 mb-3 flex items-center gap-2">
            <HelpCircle size={15} />
            Test Creation Workflow
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-2xs">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center mb-2">1</div>
              <h4 className="text-xs font-bold text-slate-800">Create Test Card</h4>
              <p className="text-[11px] text-slate-500 mt-1">Set test name, duration, passing percentage, and pricing. (Current step)</p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-2xs">
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-black flex items-center justify-center mb-2">2</div>
              <h4 className="text-xs font-bold text-slate-800">Add or Upload Questions</h4>
              <p className="text-[11px] text-slate-500 mt-1">Use the 1-Click JSON Bulk Upload or add single questions with options & marks.</p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-2xs">
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-black flex items-center justify-center mb-2">3</div>
              <h4 className="text-xs font-bold text-slate-800">Publish for Students</h4>
              <p className="text-[11px] text-slate-500 mt-1">Toggle publish to live. Students can attempt and check results instantly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTest;