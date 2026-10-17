import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FileText,
  Shield,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  Upload,
  RefreshCw,
  CheckCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Lock,
  ArrowRight
} from 'lucide-react';
import api from '../../services/adminendpoint';

const DEFAULT_TERMS = {
  type: 'terms',
  title: 'Terms and Conditions',
  subtitle: 'Clear, transparent, and fair policies governing student enrollment, fee structures, academic conduct, and intellectual property at Roots Classes.',
  badge: 'Official Institutional Agreement',
  effectiveDate: 'Academic Year 2026–2027',
  pdfUrl: '',
  supportEmail: 'support@rootsclasses.com',
  supportPhone: '+91 98765 43210',
  campusAddress: 'Roots Classes Academic Tower, Ludhiana, Punjab, India',
  highlights: [
    { title: '85% Attendance Policy', description: 'Mandatory for optimal JEE & NEET exam preparation.' },
    { title: 'Transparent Invoicing', description: 'All GST details & installment dates clearly scheduled.' },
    { title: 'Protected Study Kit', description: 'Proprietary materials for registered student use only.' }
  ],
  sections: [
    {
      number: '01',
      title: 'Enrollment & Student Code of Conduct',
      tagline: 'Admissions, Attendance & Campus Decorum',
      content: 'By enrolling in any academic program at Roots Classes (Offline, Hybrid, or Digital), students and their parents/guardians unconditionally agree to adhere to all institutional guidelines, classroom schedules, and behavioral standards. Regular attendance (minimum 85%) is required for JEE, NEET, and Foundation batches.'
    },
    {
      number: '02',
      title: 'Fee Structure, Installments & Invoicing',
      tagline: 'Transparent Schedules & Payment Verification',
      content: 'Course fees encompass tuition, curated study modules, continuous test assessments, and academic mentoring for the chosen program duration. Fees may be paid in lump sum or through pre-approved installment plans. Installment defaults beyond the grace period (7 calendar days) may cause temporary pause on attendance and test access.'
    },
    {
      number: '03',
      title: 'Refund, Cancellation & Batch Transfers',
      tagline: 'Fair Policy for Admissions and Adjustments',
      content: 'Because batch allocations, study material printing, and faculty appointments are committed prior to course start dates, fees are non-refundable post batch orientation. Prior to batch commencement, tuition fee refund is eligible after standard administrative charge deduction.'
    },
    {
      number: '04',
      title: 'Study Materials & Intellectual Property Rights',
      tagline: 'Proprietary Content, Copyright & Security',
      content: 'All educational books, problem sets, test papers, classroom video recordings, and LMS software provided by Roots Classes are protected intellectual property. Commercial redistribution, photocopying, or online upload is strictly prohibited.'
    },
    {
      number: '05',
      title: 'Academic Calendar & Faculty Assignments',
      tagline: 'Timetable Adaptations & Continuous Learning',
      content: 'Roots Classes reserves the right to reschedule lectures, organize extra doubt sessions, or conduct marathon test revisions to optimize student preparation. Expert teachers may be assigned or substituted based on academic specialization and operational necessities.'
    },
    {
      number: '06',
      title: 'Scholarship Schemes & Merit Concessions',
      tagline: 'Roots Talent Search Examination (RTSE)',
      content: 'Scholarship awards earned through RTSE apply exclusively to the academic tuition fee component and cannot be exchanged for cash. Students must maintain minimum satisfactory academic performance to retain scholarship benefits.'
    },
    {
      number: '07',
      title: 'Safety, Campus Rules & Limitation of Liability',
      tagline: 'Student Well-being & Institutional Safeguards',
      content: 'Roots Classes provides a safe, CCTV-monitored educational environment. Students are solely responsible for personal items on campus premises. In medical emergencies, first-aid is provided on-site and guardians are notified immediately.'
    },
    {
      number: '08',
      title: 'Governing Law & Legal Jurisdiction',
      tagline: 'Formal Arbitration & Resolution Framework',
      content: 'Any dispute, claim, or controversy arising out of admission, fee settlement, or academic services shall be governed by the laws of India and subject to the exclusive jurisdiction of courts situated in Ludhiana, Punjab.'
    }
  ]
};

const DEFAULT_PRIVACY = {
  type: 'privacy',
  title: 'Business Policies & Privacy',
  subtitle: 'Commitment to transparent policies, secure data handling, non-refundable tuition guidelines, and prompt fulfillment at Roots Classes.',
  badge: 'Institutional Privacy Standards',
  effectiveDate: 'Updated for Session 2026–2027',
  pdfUrl: '',
  supportEmail: 'support@rootsclasses.com',
  supportPhone: '+91 98765 43210',
  campusAddress: 'Roots Classes Academic Tower, Ludhiana, Punjab, India',
  highlights: [
    { title: 'Zero Data Sharing', description: 'Student data is never sold or traded to 3rd party marketers.' },
    { title: '7–10 Days Processing', description: 'Eligible verified refunds processed directly to original source.' },
    { title: 'Encrypted Payments', description: 'All transactions processed via PCI-DSS compliant gateways.' }
  ],
  sections: [
    {
      number: '01',
      title: 'Privacy Policy & Student Data Protection',
      tagline: 'Personal Data Integrity, Storage & Usage',
      content: 'At Roots Classes, we collect only essential information required to facilitate admissions, provide tailored academic mentoring, and maintain seamless institutional communication. We do not sell, rent, or trade personal data to any third-party marketing agencies.'
    },
    {
      number: '02',
      title: 'Fee Refund & Cancellation Policy',
      tagline: 'Standard Guidelines for Course Admissions',
      content: 'Fees once deposited are generally non-refundable and non-transferable after batch orientation. Rare exceptions are evaluated exclusively for verified medical emergencies or family relocation prior to batch start. Approved refunds are settled within 7 to 10 working days via original payment mode.'
    },
    {
      number: '03',
      title: 'Delivery, Shipping & Fulfillment Policy',
      tagline: 'Digital Access & Campus Material Handover',
      content: 'Roots Classes provides educational coaching services. No third-party physical goods parcel shipping is applicable. LMS access is provisioned within 24 hours of verified enrollment, and printed study modules are handed directly to students at our Ludhiana campus.'
    },
    {
      number: '04',
      title: 'Return & Exchange Policy',
      tagline: 'Policy on Educational Services & Digital Content',
      content: 'Because educational coaching and digital courses constitute non-tangible intellectual services, standard goods return policies do not apply. Any printed book with binding defects is exchanged immediately at the campus library.'
    },
    {
      number: '05',
      title: 'Data Security & Payment Processing',
      tagline: '256-Bit SSL Encryption & RBI-Compliant Payment Gateways',
      content: 'All digital fee transactions are processed through RBI-authorized, PCI-DSS compliant payment gateways. Roots Classes never stores sensitive card credentials or CVV numbers on our servers.'
    },
    {
      number: '06',
      title: 'Parental Consent & Academic Transparency',
      tagline: 'Regular Academic Performance & Attendance Updates',
      content: 'Parents and guardians are actively updated regarding student attendance, test results, and class performance via SMS, WhatsApp notifications, and parent-teacher meetings.'
    }
  ]
};

const ManagePolicies = () => {
  const [activeTab, setActiveTab] = useState('terms'); // 'terms' | 'privacy'
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // Form State
  const [formData, setFormData] = useState(DEFAULT_TERMS);

  // Fetch from backend when active tab changes
  useEffect(() => {
    fetchPolicy(activeTab);
  }, [activeTab]);

  const fetchPolicy = async (type) => {
    try {
      setLoading(true);
      const res = await axios.get(api.policy.getPolicy(type));
      if (res.data?.success && res.data?.data) {
        setFormData(res.data.data);
      } else {
        // Fallback to default template if not yet created in DB
        setFormData(type === 'terms' ? DEFAULT_TERMS : DEFAULT_PRIVACY);
      }
    } catch (error) {
      console.warn(`Could not load custom ${type} policy, using default template:`, error);
      setFormData(type === 'terms' ? DEFAULT_TERMS : DEFAULT_PRIVACY);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Section handling
  const handleSectionChange = (index, field, value) => {
    const updated = [...(formData.sections || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, sections: updated }));
  };

  const addSection = () => {
    const nextNum = String((formData.sections?.length || 0) + 1).padStart(2, '0');
    const newSection = {
      number: nextNum,
      title: 'New Policy Section',
      tagline: 'Section Guidelines & Information',
      content: 'Write the policy clause, terms, or conditions for this section here.'
    };
    setFormData((prev) => ({ ...prev, sections: [...(prev.sections || []), newSection] }));
  };

  const removeSection = (index) => {
    const updated = (formData.sections || []).filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, sections: updated }));
  };

  // Highlights handling
  const handleHighlightChange = (index, field, value) => {
    const updated = [...(formData.highlights || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, highlights: updated }));
  };

  const addHighlight = () => {
    const newHighlight = { title: 'New Highlight', description: 'Brief explanation of this policy benefit.' };
    setFormData((prev) => ({ ...prev, highlights: [...(prev.highlights || []), newHighlight] }));
  };

  const removeHighlight = (index) => {
    const updated = (formData.highlights || []).filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, highlights: updated }));
  };

  // PDF Document Upload
  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('document', file);

    try {
      setUploadingPdf(true);
      const res = await axios.post(api.policy.uploadPdf, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.success && res.data?.url) {
        setFormData((prev) => ({ ...prev, pdfUrl: res.data.url }));
        toast.success('Document uploaded successfully!');
      } else {
        toast.error('Failed to upload document.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error uploading document file.');
    } finally {
      setUploadingPdf(false);
    }
  };

  // Save to Backend
  const handleSavePolicy = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await axios.post(api.policy.updatePolicy, {
        ...formData,
        type: activeTab
      });

      if (res.data?.success) {
        toast.success(res.data.message || 'Policy saved to live website!');
      } else {
        toast.error(res.data?.message || 'Could not save policy.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update policy. Check server connection.');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    if (window.confirm(`Are you sure you want to reset ${activeTab === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'} to default template?`)) {
      setFormData(activeTab === 'terms' ? DEFAULT_TERMS : DEFAULT_PRIVACY);
      toast.info('Template reset to default. Click Save to publish.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 md:p-8 space-y-6 font-sans pb-16">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header Bar */}
        <div className="bg-white rounded-md border border-gray-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Website Content Management</p>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">Terms & Privacy Policy Management</h1>
            <p className="text-xs text-gray-500 mt-0.5">Upload, edit, and publish official Terms & Conditions and Privacy Policies on the public site.</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={activeTab === 'terms' ? '/termsandconditions' : '/privacypolicy'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200/80 text-gray-700 text-xs font-medium transition-colors border border-gray-200/60 shadow-xs"
            >
              <ExternalLink size={14} />
              <span>Preview Live Page</span>
            </a>
            <button
              onClick={handleSavePolicy}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Save size={14} />
              <span>{saving ? 'Publishing...' : 'Publish to Live Website'}</span>
            </button>
          </div>
        </div>

        {/* Policy Tab Switcher */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`p-4 rounded-md border text-left transition-all cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500 shadow-xs'
                : 'bg-white border-gray-200/80 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-md ${activeTab === 'terms' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Terms & Conditions</h3>
                  <p className="text-xs text-gray-500">Student enrollment, code of conduct, and fee rules.</p>
                </div>
              </div>
              <span className="text-[11px] font-medium text-blue-600">Route: /terms</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`p-4 rounded-md border text-left transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500 shadow-xs'
                : 'bg-white border-gray-200/80 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-md ${activeTab === 'privacy' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <Shield size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Privacy & Business Policies</h3>
                  <p className="text-xs text-gray-500">Refunds, delivery fulfillment, data security & returns.</p>
                </div>
              </div>
              <span className="text-[11px] font-medium text-blue-600">Route: /privacy</span>
            </div>
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-md border border-gray-200/80 p-12 text-center shadow-xs">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Loading policy details...</p>
          </div>
        ) : (
          <form onSubmit={handleSavePolicy} className="space-y-6">

            {/* 1. Header Banner Information */}
            <div className="bg-white rounded-md border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">1. Hero Header & Version Tagging</h2>
                    <p className="text-[11px] text-gray-500">Configure what appears in the top blue hero banner of the page.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetToDefault}
                  className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <RefreshCw size={12} />
                  <span>Reset to Default Template</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Page Main Title</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs font-medium text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="e.g. Terms and Conditions"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Official Badge Label</label>
                  <input
                    type="text"
                    value={formData.badge || ''}
                    onChange={(e) => handleInputChange('badge', e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs font-medium text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="e.g. Official Institutional Agreement"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Academic Session / Effective Date</label>
                  <input
                    type="text"
                    value={formData.effectiveDate || ''}
                    onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs font-medium text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="e.g. Academic Year 2026–2027"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Upload Official Signed PDF Document (Optional)</label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-dashed border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-blue-50/30 text-xs text-gray-600 font-medium cursor-pointer transition-colors">
                      <Upload size={14} className="text-gray-400" />
                      <span>{uploadingPdf ? 'Uploading...' : 'Choose PDF / Document'}</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handlePdfUpload}
                        className="hidden"
                      />
                    </label>
                    {formData.pdfUrl && (
                      <a
                        href={formData.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs rounded-md font-medium shrink-0 flex items-center gap-1"
                      >
                        <CheckCircle size={13} />
                        <span>View PDF</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Subtitle / Overview Description</label>
                <textarea
                  rows={2}
                  value={formData.subtitle || ''}
                  onChange={(e) => handleInputChange('subtitle', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs font-medium text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Summary text placed under the main heading..."
                />
              </div>
            </div>

            {/* 2. Highlights At A Glance Cards */}
            <div className="bg-white rounded-md border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">2. Highlights At A Glance (3 Quick Cards)</h2>
                  <p className="text-[11px] text-gray-500">Key take-aways displayed prominently above the policy sections.</p>
                </div>
                <button
                  type="button"
                  onClick={addHighlight}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded bg-blue-50 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add Highlight Card</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(formData.highlights || []).map((hl, index) => (
                  <div key={index} className="p-3.5 rounded-md border border-gray-200 bg-gray-50/50 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Highlight #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeHighlight(index)}
                        className="text-gray-400 hover:text-red-500 p-0.5 cursor-pointer"
                        title="Delete highlight"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={hl.title || ''}
                      onChange={(e) => handleHighlightChange(index, 'title', e.target.value)}
                      placeholder="Highlight Title (e.g. 85% Attendance)"
                      className="w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs font-semibold text-gray-900 outline-none"
                    />
                    <textarea
                      rows={2}
                      value={hl.description || ''}
                      onChange={(e) => handleHighlightChange(index, 'description', e.target.value)}
                      placeholder="Brief description..."
                      className="w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 text-[11px] text-gray-600 outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Structured Policy Sections */}
            <div className="bg-white rounded-md border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">3. Policy Clauses & Sections ({formData.sections?.length || 0})</h2>
                  <p className="text-[11px] text-gray-500">Each section will be rendered as a structured card with its number, title, and detailed guidelines.</p>
                </div>
                <button
                  type="button"
                  onClick={addSection}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200/60 cursor-pointer shadow-xs"
                >
                  <Plus size={14} />
                  <span>Add New Section</span>
                </button>
              </div>

              <div className="space-y-4">
                {(formData.sections || []).map((sec, idx) => (
                  <div key={idx} className="p-4 rounded-md border border-gray-200 bg-gray-50/40 space-y-3">
                    <div className="flex items-center justify-between gap-3 border-b border-gray-200/70 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                          {sec.number || String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="text-xs font-semibold text-gray-700">Section {idx + 1}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSection(idx)}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Delete Clause</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-gray-600">Clause Number</label>
                        <input
                          type="text"
                          value={sec.number || ''}
                          onChange={(e) => handleSectionChange(idx, 'number', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs text-gray-900 outline-none"
                          placeholder="e.g. 01"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[11px] font-semibold text-gray-600">Clause Title</label>
                        <input
                          type="text"
                          value={sec.title || ''}
                          onChange={(e) => handleSectionChange(idx, 'title', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs font-medium text-gray-900 outline-none"
                          placeholder="e.g. Enrollment & Student Code of Conduct"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-600">Tagline / Category Note</label>
                      <input
                        type="text"
                        value={sec.tagline || ''}
                        onChange={(e) => handleSectionChange(idx, 'tagline', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs text-gray-700 outline-none"
                        placeholder="e.g. Admissions, Attendance & Campus Decorum"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-600">Clause Content & Guidelines</label>
                      <textarea
                        rows={4}
                        value={sec.content || ''}
                        onChange={(e) => handleSectionChange(idx, 'content', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-xs text-gray-800 leading-relaxed outline-none"
                        placeholder="Detailed rules, conditions, terms, or policy explanations..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Support Desk Contact Information */}
            <div className="bg-white rounded-md border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-sm font-semibold text-gray-900">4. Support Desk & Contact Details</h2>
                <p className="text-[11px] text-gray-500">Contact details shown in the bottom assistance card of the policy page.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Official Support Email</label>
                  <input
                    type="email"
                    value={formData.supportEmail || ''}
                    onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-xs text-gray-900 outline-none"
                    placeholder="support@rootsclasses.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Support Phone / Helpdesk</label>
                  <input
                    type="text"
                    value={formData.supportPhone || ''}
                    onChange={(e) => handleInputChange('supportPhone', e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-xs text-gray-900 outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Campus Address</label>
                  <input
                    type="text"
                    value={formData.campusAddress || ''}
                    onChange={(e) => handleInputChange('campusAddress', e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-xs text-gray-900 outline-none"
                    placeholder="Roots Classes Academic Tower, Ludhiana, Punjab"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Save Action Bar */}
            <div className="bg-white rounded-md border border-gray-200/80 p-4 shadow-xs flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Changes saved here will immediately update the live <strong>{activeTab === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}</strong> page.
              </p>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Save size={15} />
                <span>{saving ? 'Publishing Changes...' : 'Publish to Live Website'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

export default ManagePolicies;
