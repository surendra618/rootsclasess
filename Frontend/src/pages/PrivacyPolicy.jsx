import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ShieldCheck,
  Lock,
  RefreshCcw,
  Truck,
  Database,
  UserCheck,
  EyeOff,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download
} from 'lucide-react';
import api from '../services/adminendpoint';

const DEFAULT_PRIVACY = {
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

const POLICY_ICONS = [
  <Lock className="w-5 h-5 text-blue-600" />,
  <RefreshCcw className="w-5 h-5 text-emerald-600" />,
  <Truck className="w-5 h-5 text-indigo-600" />,
  <AlertCircle className="w-5 h-5 text-amber-600" />,
  <Database className="w-5 h-5 text-purple-600" />,
  <UserCheck className="w-5 h-5 text-slate-600" />
];

const PrivacyPolicy = () => {
  const [data, setData] = useState(DEFAULT_PRIVACY);

  useEffect(() => {
    const loadPolicy = async () => {
      try {
        const res = await axios.get(api.policy.getPolicy('privacy'));
        if (res.data?.success && res.data?.data) {
          setData(res.data.data);
        }
      } catch (err) {
        // Fallback silently to DEFAULT_PRIVACY
      }
    };
    loadPolicy();
  }, []);

  const highlights = data.highlights && data.highlights.length > 0 ? data.highlights : DEFAULT_PRIVACY.highlights;
  const sections = data.sections && data.sections.length > 0 ? data.sections : DEFAULT_PRIVACY.sections;

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
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  {data.badge || 'Institutional Privacy Standards'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-normal bg-white/10 text-blue-200 border border-white/15">
                  <Clock className="w-3 h-3 text-blue-300" />
                  Effective: {data.effectiveDate || 'Session 2026–2027'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                {data.title || 'Business Policies & Privacy'}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal">
                {data.subtitle || DEFAULT_PRIVACY.subtitle}
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
                {idx === 0 ? <EyeOff className="w-4 h-4" /> : idx === 1 ? <RefreshCcw className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
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
                    {POLICY_ICONS[idx % POLICY_ICONS.length]}
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
                Privacy Inquiries & Support
              </div>
              <h3 className="text-base font-semibold text-gray-900">Roots Classes Compliance & Support Desk</h3>
              <p className="text-xs text-gray-500 max-w-xl font-normal leading-relaxed">
                If you have questions regarding personal data privacy, refund status, or course fulfillment, our team is ready to assist you Monday through Saturday (9:00 AM – 7:00 PM).
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

export default PrivacyPolicy;
