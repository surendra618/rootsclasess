import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FileText,
  Shield,
  CheckCircle2,
  CreditCard,
  BookOpen,
  Calendar,
  AlertTriangle,
  Scale,
  Mail,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  HelpCircle,
  GraduationCap,
  Download
} from 'lucide-react';
import api from '../services/adminendpoint';

const DEFAULT_TERMS = {
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
      id: 'enrollment',
      number: '01',
      title: 'Enrollment & Student Code of Conduct',
      tagline: 'Admissions, Attendance & Campus Decorum',
      content: 'By enrolling in any academic program at Roots Classes (Offline, Hybrid, or Digital), students and their parents/guardians unconditionally agree to adhere to all institutional guidelines, classroom schedules, and behavioral standards. Regular attendance (minimum 85%) is required for JEE, NEET, and Foundation batches.'
    },
    {
      id: 'fees',
      number: '02',
      title: 'Fee Structure, Installments & Invoicing',
      tagline: 'Transparent Schedules & Payment Verification',
      content: 'Course fees encompass tuition, curated study modules, continuous test assessments, and academic mentoring for the chosen program duration. Fees may be paid in lump sum or through pre-approved installment plans. Installment defaults beyond the grace period (7 calendar days) may cause temporary pause on attendance and test access.'
    },
    {
      id: 'refunds',
      number: '03',
      title: 'Refund, Cancellation & Batch Transfers',
      tagline: 'Fair Policy for Admissions and Adjustments',
      content: 'Because batch allocations, study material printing, and faculty appointments are committed prior to course start dates, fees are non-refundable post batch orientation. Prior to batch commencement, tuition fee refund is eligible after standard administrative charge deduction.'
    },
    {
      id: 'intellectual-property',
      number: '04',
      title: 'Study Materials & Intellectual Property Rights',
      tagline: 'Proprietary Content, Copyright & Security',
      content: 'All educational books, problem sets, test papers, classroom video recordings, and LMS software provided by Roots Classes are protected intellectual property. Commercial redistribution, photocopying, or online upload is strictly prohibited.'
    },
    {
      id: 'schedules',
      number: '05',
      title: 'Academic Calendar & Faculty Assignments',
      tagline: 'Timetable Adaptations & Continuous Learning',
      content: 'Roots Classes reserves the right to reschedule lectures, organize extra doubt sessions, or conduct marathon test revisions to optimize student preparation. Expert teachers may be assigned or substituted based on academic specialization and operational necessities.'
    },
    {
      id: 'scholarships',
      number: '06',
      title: 'Scholarship Schemes & Merit Concessions',
      tagline: 'Roots Talent Search Examination (RTSE)',
      content: 'Scholarship awards earned through RTSE apply exclusively to the academic tuition fee component and cannot be exchanged for cash. Students must maintain minimum satisfactory academic performance to retain scholarship benefits.'
    },
    {
      id: 'liability',
      number: '07',
      title: 'Safety, Campus Rules & Limitation of Liability',
      tagline: 'Student Well-being & Institutional Safeguards',
      content: 'Roots Classes provides a safe, CCTV-monitored educational environment. Students are solely responsible for personal items on campus premises. In medical emergencies, first-aid is provided on-site and guardians are notified immediately.'
    },
    {
      id: 'jurisdiction',
      number: '08',
      title: 'Governing Law & Legal Jurisdiction',
      tagline: 'Formal Arbitration & Resolution Framework',
      content: 'Any dispute, claim, or controversy arising out of admission, fee settlement, or academic services shall be governed by the laws of India and subject to the exclusive jurisdiction of courts situated in Ludhiana, Punjab.'
    }
  ]
};

const SECTION_ICONS = [
  <GraduationCap className="w-5 h-5 text-blue-600" />,
  <CreditCard className="w-5 h-5 text-emerald-600" />,
  <Scale className="w-5 h-5 text-indigo-600" />,
  <BookOpen className="w-5 h-5 text-blue-600" />,
  <Calendar className="w-5 h-5 text-amber-600" />,
  <Sparkles className="w-5 h-5 text-purple-600" />,
  <AlertTriangle className="w-5 h-5 text-rose-600" />,
  <Shield className="w-5 h-5 text-slate-600" />
];

const TermsAndConditions = () => {
  const [data, setData] = useState(DEFAULT_TERMS);

  useEffect(() => {
    const loadPolicy = async () => {
      try {
        const res = await axios.get(api.policy.getPolicy('terms'));
        if (res.data?.success && res.data?.data) {
          setData(res.data.data);
        }
      } catch (err) {
        // Fallback silently to DEFAULT_TERMS
      }
    };
    loadPolicy();
  }, []);

  const highlights = data.highlights && data.highlights.length > 0 ? data.highlights : DEFAULT_TERMS.highlights;
  const sections = data.sections && data.sections.length > 0 ? data.sections : DEFAULT_TERMS.sections;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Hero Header Banner */}
        <div className="relative overflow-hidden rounded-md bg-gradient-to-r from-[#0b2545] via-[#134074] to-[#1d4ed8] border border-blue-400/20 shadow-xs p-6 sm:p-8 text-white">
          {/* Subtle Decorative Glows */}
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-indigo-400/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-white/15 text-blue-100 border border-white/20 backdrop-blur-xs">
                  <FileText className="w-3.5 h-3.5 text-blue-200" />
                  {data.badge || 'Official Institutional Agreement'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-normal bg-white/10 text-blue-200 border border-white/15">
                  <Clock className="w-3 h-3 text-blue-300" />
                  Effective: {data.effectiveDate || 'Academic Year 2026–2027'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                {data.title || 'Terms and Conditions'}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal">
                {data.subtitle || DEFAULT_TERMS.subtitle}
              </p>
            </div>

            {data.pdfUrl && (
              <div className="shrink-0">
                <a
                  href={data.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-white/15 hover:bg-white/25 text-white border border-white/25 text-xs font-medium transition-all shadow-xs"
                >
                  <Download className="w-4 h-4 text-blue-200" />
                  <span>Download Official PDF</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Highlights At A Glance */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {highlights.slice(0, 3).map((hl, idx) => (
            <div key={idx} className="bg-white p-4 rounded-md border border-gray-200/80 shadow-xs flex items-start gap-3">
              <div className={`p-2 rounded-md shrink-0 ${idx === 0 ? 'bg-blue-50 text-blue-600' : idx === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'}`}>
                {idx === 0 ? <CheckCircle2 className="w-4 h-4" /> : idx === 1 ? <CreditCard className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-900">{hl.title}</h3>
                <p className="text-[11px] text-gray-500 mt-0.5 font-normal">{hl.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Sections */}
        <div className="space-y-4">
          {sections.map((sec, idx) => (
            <article
              key={idx}
              className="bg-white rounded-md border border-gray-200/80 shadow-xs p-5 sm:p-6 transition-all hover:border-gray-300"
            >
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-gray-50 border border-gray-200/60 shrink-0">
                    {SECTION_ICONS[idx % SECTION_ICONS.length]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-blue-600 tracking-wide">
                        Section {sec.number || String(idx + 1).padStart(2, '0')}
                      </span>
                      {sec.tagline && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-400 font-normal">{sec.tagline}</span>
                        </>
                      )}
                    </div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 mt-0.5 tracking-tight">
                      {sec.title}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Section Body */}
              <div className="pt-1">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line font-normal">
                  {sec.content}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Student Helpdesk & Support Card */}
        <div className="bg-white rounded-md border border-gray-200/80 shadow-xs p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5" />
                Have Questions Regarding Policies?
              </div>
              <h3 className="text-base font-semibold text-gray-900">Roots Classes Admissions & Support Office</h3>
              <p className="text-xs text-gray-500 max-w-xl font-normal leading-relaxed">
                Our student support desk is available Monday through Saturday (9:00 AM – 7:00 PM) to help address any inquiries regarding enrollments, fee installments, or academic schedules.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
              <a
                href={`mailto:${data.supportEmail || 'support@rootsclasses.com'}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60 text-xs font-medium transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{data.supportEmail || 'support@rootsclasses.com'}</span>
              </a>
              <a
                href={`tel:${data.supportPhone?.replace(/\s+/g, '') || '+919876543210'}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 text-xs font-medium transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{data.supportPhone || '+91 98765 43210'}</span>
              </a>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-400 font-normal">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>Campus: {data.campusAddress || 'Roots Classes Academic Tower, Ludhiana, Punjab, India'}</span>
            </div>
            <div>
              Last Revised: {data.updatedAt ? new Date(data.updatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'October 2026 • Version 2.4'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TermsAndConditions;
