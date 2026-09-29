import React, { useState, useEffect } from 'react';
import api from '../../services/endpoints.js';
import axios from 'axios';
import useStudentStore from '../../Store/studentstore.js';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

const tiers = [
  {
    pct: '25%', label: 'Merit', color: '#0078FF', bg: 'bg-blue-50', border: 'border-blue-100',
    desc: 'Score between 60–74% in the scholarship test',
    perks: ['Fee waiver on tuition', 'Study material included', 'Access to test series'],
    dark: false,
  },
  {
    pct: '50%', label: 'Performance', color: '#FB0500', bg: 'bg-red-50', border: 'border-red-100',
    desc: 'Score between 75–89% in the scholarship test',
    perks: ['50% tuition fee waiver', 'Free study material', 'Priority doubt sessions', 'Monthly mentoring'],
    dark: true,
  },
  {
    pct: '100%', label: 'Excellence', color: '#08B100', bg: 'bg-green-50', border: 'border-green-100',
    desc: 'Score 90% and above in the scholarship test',
    perks: ['Full fee waiver', 'Premium study kit', 'Personal mentor', 'Topper batch access', 'Certificate of excellence'],
    dark: false,
  },
];

const steps = [
  { num: '01', title: 'Register Online', desc: 'Fill in the application form below with your details and select your program.', accent: '#FB0500' },
  { num: '02', title: 'Appear for Test', desc: 'Attend the Roots Scholarship Test (RST) — conducted online or at our Ludhiana center.', accent: '#0078FF' },
  { num: '03', title: 'Get Your Result', desc: 'Results announced within 3 working days. Check your email for the scorecard.', accent: '#FB0500' },
  { num: '04', title: 'Confirm Admission', desc: 'Finalise enrollment with the applicable scholarship discount and join the batch.', accent: '#0078FF' },
];

const eligibility = [
  { icon: '🎓', text: 'Students from Class 8 to Class 12 (current or just passed)' },
  { icon: '📋', text: 'Dropper students appearing for NEET / IIT-JEE' },
  { icon: '📊', text: 'Minimum 55% marks in last qualifying exam' },
  { icon: '📍', text: 'Open to students from any school/board across India' },
  { icon: '👨‍👩‍👧', text: 'Special consideration for economically weaker sections (EWS)' },
  { icon: '🏅', text: 'State/national olympiad medal holders get direct 50% scholarship' },
];

const inputCls = 'w-full px-4 py-3 bg-white border border-gray-200 rounded-md text-sm outline-none focus:border-[#0078FF] focus:ring-2 focus:ring-blue-100 transition disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed';
const selectCls = inputCls + ' bg-white appearance-none cursor-pointer';
const labelCls = 'block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2';

// Helper to convert raw class value (e.g. "8", "class-8") to the correct schema format
const normalizeClassValue = (value) => {
  if (!value) return '';
  // Already correct format
  if (['class-8', 'class-9', 'class-10', 'class-11', 'class-12', 'dropper'].includes(value)) {
    return value;
  }
  // Convert numeric or shorthand to class-*
  const normalized = value.toString().toLowerCase();
  if (normalized === '8') return 'class-8';
  if (normalized === '9') return 'class-9';
  if (normalized === '10') return 'class-10';
  if (normalized === '11') return 'class-11';
  if (normalized === '12') return 'class-12';
  if (normalized === 'dropper') return 'dropper';
  return '';
};

const ScholarshipForm = () => {
  const { student } = useStudentStore();
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    program: '',
    studentClass: '',
    lookingForCategory: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!student?._id) {
        toast.info("Please login to auto-fill your details");
        return;
      }

      setLoadingData(true);
      try {
        const res = await axios.post(api.student.getStudent, { studentId: student._id });
        if (res.data.success && res.data.user) {
          const userData = res.data.user;
          // Normalize the class value from the backend (it might be "8" or "class-8")
          const normalizedClass = normalizeClassValue(userData.currentClass);
          setFormData(prev => ({
            ...prev,
            email: userData.email || '',
            phone: userData.phone || '',
            studentClass: normalizedClass || ''
          }));
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
        toast.error("Failed to fetch registration data. Please fill details manually if needed.");
      } finally {
        setLoadingData(false);
      }
    };

    fetchStudentData();
  }, [student?._id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // If it's the studentClass field, ensure we store the correct enum value
    if (name === 'studentClass') {
      setFormData(p => ({ ...p, studentClass: value }));
    } else {
      setFormData(p => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student?._id) {
      toast.error("Please login to apply for scholarship");
      return;
    }

    // Final validation: ensure studentClass is one of the allowed enum values
    const allowedClasses = ['class-8', 'class-9', 'class-10', 'class-11', 'class-12', 'dropper'];
    if (!allowedClasses.includes(formData.studentClass)) {
      toast.error("Please select a valid class from the list.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        studentId: student._id,
        // Ensure program is exactly as in schema (already correct)
        // lookingForCategory is correct
      };
      const res = await axios.post(api.scholarship.apply, payload);
      toast.success(res?.data?.message || 'Scholarship Applied Successfully');
    } catch (error) {
      const message = error?.response?.data?.message || '';
      if (message.toLowerCase().includes('already applied')) toast.error('⚠️ You have already applied for scholarship');
      else if (message.toLowerCase().includes('not eligible')) toast.error('❌ You are not eligible for scholarship');
      else toast.error(message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-white border-b border-gray-100 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.4]" style={{
          backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#0078FF]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#FB0500]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-gray-50 border border-gray-100 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FB0500] animate-pulse"></span>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Scholarship 2025</p>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">
                Unlock Up To<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FB0500] via-[#F1C40F] to-[#28A745]">
                  100% Scholarship
                </span>
              </h1>
            </div>

            <div className="flex gap-10 md:gap-14 md:px-10 md:border-x border-gray-100">
              <div>
                <span className="text-xl md:text-2xl font-black text-[#FB0500]">2,000+</span>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Awarded</p>
              </div>
              <div>
                <span className="text-xl md:text-2xl font-black text-[#0078FF]">100%</span>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Max Off</p>
              </div>
              <div>
                <span className="text-xl md:text-2xl font-black text-[#28A745]">FREE</span>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Test Reg</p>
              </div>
            </div>

            <div className="md:w-64">
              <a href="#apply-form" className="group flex items-center justify-between w-full px-5 py-3 bg-gray-900 text-white rounded-md text-sm font-bold hover:bg-[#FB0500] transition-all shadow-sm">
                Apply Now
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scholarship Tiers */}
      <div className="bg-dot-grid py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#0078FF] uppercase tracking-widest mb-3">Scholarship Tiers</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              What can you <span className="text-[#FB0500]">win?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {tiers.map((t, i) => (
              <div key={t.pct}
                className={`relative rounded-md overflow-hidden border flex flex-col bg-white ${t.border} transition-all hover:shadow-md ${
                  i === 1 ? 'ring-2 ring-[#FB0500]/30 shadow-md' : 'shadow-sm'
                }`}
              >
                {i === 1 && (
                  <div className="bg-[#FB0500] text-white text-center py-2 text-[11px] font-black uppercase tracking-[0.2em]">
                    Most Popular
                  </div>
                )}
                <div className="h-1.5" style={{ backgroundColor: t.color }} />
                <div className="p-6 md:p-7 flex flex-col flex-1">
                  <div className="flex items-end gap-1 mb-3">
                    <span className="text-5xl font-black leading-none" style={{ color: t.color }}>{t.pct}</span>
                    <span className="text-sm font-bold mb-1 text-gray-400">off</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm inline-block" style={{ backgroundColor: t.color + '15', color: t.color }}>
                      {t.label}
                    </span>
                  </div>
                  <p className="text-sm mt-2 mb-6 leading-relaxed text-gray-500">{t.desc}</p>

                  <ul className="space-y-3 flex-1 mb-8">
                    {t.perks.map(perk => (
                      <li key={perk} className="flex items-center gap-2.5">
                        <span className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: t.color + '20' }}>
                          <svg className="w-2.5 h-2.5" fill="none" stroke={t.color} viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span className="text-sm text-gray-700 font-medium">{perk}</span>
                      </li>
                    ))}
                  </ul>

                  <a href="#apply-form" className="mt-auto block w-full">
                    <button className="w-full py-3 rounded-md text-sm font-bold text-white transition hover:opacity-90 shadow-sm"
                      style={{ backgroundColor: t.color }}
                      onClick={() => { }}>
                      Apply for {t.pct} →
                    </button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-line-grid py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-4">
              <p className="text-xs font-bold text-[#FB0500] uppercase tracking-widest mb-3">Process</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                How to apply in
                <span className="block text-[#FB0500] mt-1">4 simple steps</span>
              </h2>
              <p className="text-sm text-gray-400 mt-5 leading-relaxed">
                The entire process takes less than 10 minutes. No paperwork — everything is online.
              </p>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {steps.map((s) => (
                <div key={s.num} className="bg-white rounded-md p-6 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 rounded-md flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                      style={{ backgroundColor: s.accent }}>
                      {s.num}
                    </span>
                    <h3 className="font-bold text-gray-900 text-base">{s.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Eligibility */}
      <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#0078FF] uppercase tracking-widest mb-3">Eligibility</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Who can <span className="text-[#FB0500]">apply?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {eligibility.map((e, i) => (
              <div key={i}
                className="rounded-md p-5 flex items-start gap-4 border border-gray-200 bg-gray-50 transition-all hover:bg-white hover:shadow-sm group"
              >
                <span className="text-2xl flex-shrink-0 mt-0.5 grayscale group-hover:grayscale-0 transition-all">{e.icon}</span>
                <p className="text-sm leading-relaxed text-gray-600 font-medium">{e.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-md p-5 flex items-start gap-4">
            <span className="text-xl flex-shrink-0">ℹ️</span>
            <p className="text-sm text-blue-700 leading-relaxed">
              <strong>Note:</strong> The Roots Scholarship Test (RST) is conducted online and at our Ludhiana centre. Registration is completely free. Scholarship is applied directly on the admission fee — no reimbursement process.
            </p>
          </div>
        </div>
      </div>

      {/* Application Form */}
      <div id="apply-form" className="bg-dot-grid py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left info */}
            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <p className="text-xs font-bold text-[#FB0500] uppercase tracking-widest mb-3">Apply Now</p>
              <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                Start your<br />
                <span className="text-[#FB0500]">scholarship</span><br />journey
              </h2>
              <p className="text-sm text-gray-400 mt-5 leading-relaxed">
                Fill the form — our team will contact you within 24 hours with test details and your admit card.
              </p>

              <div className="mt-8 space-y-0">
                {[
                  { label: 'Application', date: 'Open Now', col: '#FB0500' },
                  { label: 'RST Exam', date: 'Every Saturday', col: '#0078FF' },
                  { label: 'Results', date: 'Within 3 days', col: '#08B100' },
                  { label: 'Enrollment', date: 'Anytime after', col: '#FB0500' },
                ].map((t, i, arr) => (
                  <div key={t.label} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: t.col }} />
                      {i < arr.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1 h-8" />}
                    </div>
                    <div className="pb-6">
                      <p className="text-sm font-semibold text-gray-900">{t.label}</p>
                      <p className="text-xs text-gray-400">{t.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
                <div className="bg-gray-50 border-b border-gray-200 px-8 py-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[#FB0500]/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative">
                    <p className="text-xs font-bold text-[#FB0500] uppercase tracking-widest mb-1">RST Application</p>
                    <h3 className="text-xl font-bold text-gray-900">Roots Scholarship Test</h3>
                    <p className="text-gray-500 text-xs mt-1">Free registration · Takes 3 minutes</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  {loadingData && (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <Loader2 className="w-8 h-8 text-[#FB0500] animate-spin" />
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Fetching your data...</p>
                    </div>
                  )}

                  {!loadingData && (
                    <>
                      {/* Program selection */}
                      <div>
                        <label className={labelCls}>Select Program <span className="text-[#FB0500]">*</span></label>
                        <div className="grid grid-cols-3 gap-3">
                          {['Foundation', 'Medical', 'Engineering'].map(p => (
                            <button key={p} type="button"
                              onClick={() => setFormData(prev => ({ ...prev, program: p }))}
                              className={`py-3 rounded-md text-sm font-bold border-2 transition-all ${formData.program === p
                                ? 'bg-[#FB0500] text-white border-[#FB0500] shadow-sm'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-[#FB0500]/40'
                                }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Class + Looking For */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className={labelCls}>Your Class <span className="text-[#FB0500]">*</span></label>
                          <select
                            name="studentClass"
                            value={formData.studentClass}
                            onChange={handleChange}
                            required
                            className={selectCls}
                          >
                            <option value="">Select class</option>
                            <option value="class-8">8th Class</option>
                            <option value="class-9">9th Class</option>
                            <option value="class-10">10th Class</option>
                            <option value="class-11">11th Class</option>
                            <option value="class-12">12th Class</option>
                            <option value="dropper">Dropper</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Looking For <span className="text-[#FB0500]">*</span></label>
                          <select name="lookingForCategory" value={formData.lookingForCategory} onChange={handleChange} required className={selectCls}>
                            <option value="">Select option</option>
                            <option value="scholarship">Scholarship Programs</option>
                            <option value="admission">Admission Guidance</option>
                            <option value="counseling">Career Counseling</option>
                            <option value="exam-prep">Exam Preparation</option>
                          </select>
                        </div>
                      </div>

                      {/* Email + Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className={labelCls}>Email ID <span className="text-[#FB0500]">*</span></label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            readOnly={!!student?._id}
                            placeholder="your@email.com"
                            required
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Phone Number <span className="text-[#FB0500]">*</span></label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            readOnly={!!student?._id}
                            placeholder="10-digit mobile"
                            maxLength={10}
                            required
                            className={inputCls}
                          />
                        </div>
                      </div>

                      {/* Terms */}
                      <div className="flex items-start gap-3 py-2">
                        <input type="checkbox" id="sch-terms" required className="mt-0.5 w-4 h-4 accent-[#FB0500]" />
                        <label htmlFor="sch-terms" className="text-xs text-gray-500 leading-relaxed">
                          I agree to receive test information and scholarship updates via WhatsApp/Email. I accept Roots Classes{' '}
                          <a href="/termsandconditions" className="text-[#FB0500] hover:underline">Terms & Conditions</a>.
                        </label>
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3.5 bg-[#FB0500] text-white font-black rounded-md text-base hover:opacity-90 transition flex items-center justify-center gap-2 disabled:bg-gray-400 shadow-sm"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Apply for Scholarship — It's Free
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </>
                        )}
                      </button>

                      <p className="text-center text-xs text-gray-400">🔒 Your information is safe and will never be shared.</p>
                    </>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.4]" style={{
          backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0078FF]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold text-[#0078FF] uppercase tracking-[0.2em] mb-3">Still Have Questions?</p>
          <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 leading-tight">
            Talk to our scholarship counselor — <span className="text-[#FB0500]">it's free</span>
          </h3>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">Call, WhatsApp, or visit us at Ludhiana. We're here to help you navigate your scholarship options and batch details.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+919877515330"
              className="px-8 py-3.5 bg-[#FB0500] text-white font-black rounded-md text-sm hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-2">
              <span>📞</span> Call Now: +91 98775-15330
            </a>
            <a href="https://wa.me/919877515330" target="_blank" rel="noopener noreferrer"
              className="px-8 py-3.5 bg-[#08B100] text-white font-black rounded-md text-sm hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-2">
              <span>💬</span> WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipForm;