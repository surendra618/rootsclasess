import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  Send,
  MessageSquare,
  PhoneCall,
  Mail,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  ChevronDown,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube, FaWhatsapp } from 'react-icons/fa';
import axios from 'axios';
import api from '../../services/endpoints';
import useStudentStore from '../../Store/studentstore';

const SUBJECT_OPTIONS = ['Admission Query', 'Fee Structure', 'Course Info', 'Other'];

const FAQS = [
  {
    q: 'Can I take a free demo class before enrolling?',
    a: 'Yes, absolutely! We offer free demo sessions for all our offline batches in Ludhiana as well as online masterclasses so you can experience our teaching methodology firsthand.'
  },
  {
    q: 'Where is the Root Classes offline center located?',
    a: 'Our main flagship classroom is conveniently located on Gill Road, directly opposite ITI College, Shilapuri, Ludhiana (Punjab — 141003).'
  },
  {
    q: 'Are online study materials and recorded lectures included?',
    a: 'Yes, every enrolled offline and hybrid student gets full access to our digital portal with recorded video lectures, chapter notes, and mock test papers.'
  },
  {
    q: 'How fast will someone respond after I submit this form?',
    a: 'Our academic counselors review inquiries in real-time and typically respond within 15 to 30 minutes during working hours (Mon–Sat, 9 AM – 7 PM).'
  }
];

const inputCls = (err) =>
  `w-full px-4 py-2.5 bg-white border rounded-md text-xs font-medium outline-none transition-colors ${
    err
      ? 'border-red-400 focus:border-red-500'
      : 'border-slate-300 focus:border-[#0078FF]'
  }`;

const labelCls = 'block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5';

const Contact = () => {
  const { student } = useStudentStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const fill = (s) => {
      if (s) {
        setFormData(p => ({
          ...p,
          name: s.fullName || s.name || '',
          email: s.email || ''
        }));
      }
    };
    if (student) {
      fill(student);
      return;
    }
    try {
      fill(JSON.parse(localStorage.getItem('student') || '{}'));
    } catch {}
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      e.name = 'Please enter your full name';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = 'Please enter a valid email address';
    }
    if (!formData.subject.trim()) {
      e.subject = 'Subject is required';
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      e.message = 'Message must be at least 10 characters';
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim()
      };

      const res = await axios.post(api.callback.contact, payload);

      if (res.data?.success) {
        setSubmitStatus('success');
        setFormData(p => ({ ...p, subject: '', message: '' }));
      } else {
        setSubmitStatus('error');
      }
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (err) {
      console.error('Contact form submission error:', err);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-[#FB0500] selection:text-white">

      {/* ── 1. Hero Section with Rich Technical Background ────────────────────────── */}
      <section className="relative bg-gradient-to-b from-slate-50 via-white to-slate-100/70 pt-12 pb-16 md:pt-16 md:pb-20 border-b border-slate-200 overflow-hidden">
        
        {/* Crisp Dot Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.45] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#94a3b8 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Ambient Gradient Color Blooms (Red on left, Blue on right) */}
        <div className="absolute -top-24 -left-20 w-96 h-96 bg-[#FB0500]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -right-20 w-96 h-96 bg-[#0078FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-48 bg-gradient-to-r from-red-500/5 via-blue-500/5 to-purple-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Decorative Technical Crosshairs & Physics Line Accents */}
        <div className="hidden md:block absolute top-8 left-12 text-slate-300 font-mono text-xs select-none pointer-events-none">
          + ——— [ ROOT : 30.9° N, 75.8° E ]
        </div>
        <div className="hidden md:block absolute top-8 right-12 text-slate-300 font-mono text-xs select-none pointer-events-none">
          [ 24×7 HELP_DESK ] ——— +
        </div>

        {/* Faint Floating Geometry Icons */}
        <div className="absolute left-8 bottom-6 opacity-15 pointer-events-none hidden lg:block text-[#FB0500]">
          <svg className="w-16 h-16 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z" />
            <path d="M3 12h18" />
          </svg>
        </div>
        <div className="absolute right-8 bottom-6 opacity-15 pointer-events-none hidden lg:block text-[#0078FF]">
          <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-slate-200 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#FB0500] animate-ping" />
              <span className="text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                Root Classes Academic Helpdesk
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Online & Active
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
              Got Questions?{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FB0500] via-[#0078FF] to-blue-700">
                Let’s Connect & Guide You.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium">
              Need details on upcoming batches, offline classroom batches in Ludhiana, or fee structures? Speak directly with our academic mentors today.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. Top Quick Connect Cards ─────────────────────────────── */}
      <section className="relative -mt-5 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Card 1: Phone */}
          <a
            href="tel:+919877515330"
            className="group bg-white rounded-md p-5 border border-slate-200 hover:border-red-400 transition-colors flex items-start gap-4"
          >
            <div className="w-11 h-11 rounded-md bg-red-50 text-[#FB0500] border border-red-100 flex items-center justify-center shrink-0 group-hover:bg-[#FB0500] group-hover:text-white transition-colors">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Direct Admission Helpline</span>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">Live</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-[#FB0500] transition-colors">
                +91 98775-15330
              </h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Mon–Sat, 9:00 AM – 7:00 PM
              </p>
              <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-[#FB0500]">
                <span>Call Center Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </a>

          {/* Card 2: WhatsApp */}
          <a
            href="https://wa.me/919877515330?text=Hi%20Root%20Classes,%20I%20want%20to%20enquire%20about%20admissions%20and%20batches."
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-md p-5 border border-slate-200 hover:border-emerald-400 transition-colors flex items-start gap-4"
          >
            <div className="w-11 h-11 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <FaWhatsapp className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Instant Chat</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">Fastest</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Chat on WhatsApp
              </h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Instant counselor replies
              </p>
              <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <span>Open WhatsApp Chat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </a>

          {/* Card 3: Email */}
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=rootsclasses1313@gmail.com&su=Admission%20Enquiry%20-%20Root%20Classes&body=Hello%20Team%20Root%20Classes,%0A%0AI%20am%20interested%20in%20learning%20more%20about%20your%20courses."
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-md p-5 border border-slate-200 hover:border-blue-400 transition-colors flex items-start gap-4"
          >
            <div className="w-11 h-11 rounded-md bg-blue-50 text-[#0078FF] border border-blue-100 flex items-center justify-center shrink-0 group-hover:bg-[#0078FF] group-hover:text-white transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Official Email</span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">Within 24h</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-[#0078FF] transition-colors" title="rootsclasses1313@gmail.com">
                rootsclasses1313@gmail.com
              </h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Direct mentor inbox
              </p>
              <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-[#0078FF]">
                <span>Compose in Gmail</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </a>

        </div>
      </section>

      {/* ── 3. Main Form & Campus Details ───────────────────────────── */}
      <section className="py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left Column: Campus Info & Timings (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">

              {/* Campus Location Card */}
              <div className="bg-white rounded-md p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-md bg-red-50 text-[#FB0500] border border-red-100 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#FB0500]">Flagship Offline Campus</span>
                    <h3 className="text-base font-bold text-slate-900">Ludhiana Learning Center</h3>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-md p-4 border border-slate-200 mb-4 text-xs text-slate-700 leading-relaxed">
                  <p className="font-bold text-slate-900 mb-0.5">Root Classes</p>
                  <p>Gill Rd, Opp. ITI College,</p>
                  <p>Shilapuri, Ludhiana, Punjab — 141003</p>
                  <p className="text-slate-400 mt-1.5">Landmark: Exactly opposite ITI College main gate</p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <a
                    href="https://maps.google.com/?q=Roots+Classes+Ludhiana"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#0078FF] text-white text-xs font-bold hover:bg-blue-600 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Google Maps</span>
                  </a>
                  <a
                    href="tel:+919877515330"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-[#FB0500]" />
                    <span>Call Reception</span>
                  </a>
                </div>
              </div>

              {/* Center Timings Card */}
              <div className="bg-white rounded-md p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-blue-50 text-[#0078FF] border border-blue-100 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#0078FF]">Campus Timings</span>
                      <h4 className="text-base font-bold text-slate-900">Visiting & Counseling Hours</h4>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Open Today
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-slate-600 flex items-center gap-2 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Monday – Friday
                    </span>
                    <span className="font-bold text-slate-900">9:00 AM – 6:30 PM</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-slate-600 flex items-center gap-2 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Saturday
                    </span>
                    <span className="font-bold text-slate-900">9:00 AM – 4:30 PM</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-slate-600 flex items-center gap-2 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Sunday
                    </span>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">Counseling by Appointment</span>
                  </div>
                </div>
              </div>

              {/* Social Channels */}
              <div className="bg-white rounded-md p-6 border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Connect on Social</span>
                <h4 className="text-base font-bold text-slate-900 mb-3">Official Community Channels</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href="https://www.youtube.com/@nikolaphysics"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 rounded-md bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-300 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-red-600 shrink-0">
                      <FaYoutube size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800">YouTube</p>
                      <p className="text-[10px] text-slate-400 truncate">@nikolaphysics</p>
                    </div>
                  </a>

                  <a
                    href="https://www.instagram.com/roots_classes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 rounded-md bg-slate-50 hover:bg-pink-50 border border-slate-200 hover:border-pink-300 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-pink-600 shrink-0">
                      <FaInstagram size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800">Instagram</p>
                      <p className="text-[10px] text-slate-400 truncate">@roots_classes</p>
                    </div>
                  </a>

                  <a
                    href="https://www.facebook.com/rootsclasses1313/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 rounded-md bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-blue-600 shrink-0">
                      <FaFacebook size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800">Facebook</p>
                      <p className="text-[10px] text-slate-400 truncate">Root Classes</p>
                    </div>
                  </a>

                  <a
                    href="https://www.linkedin.com/company/roots-classes/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 rounded-md bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-blue-700 shrink-0">
                      <FaLinkedin size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800">LinkedIn</p>
                      <p className="text-[10px] text-slate-400 truncate">Roots Classes</p>
                    </div>
                  </a>
                </div>
              </div>

            </div>

            {/* Right Column: Clean Form Matching Exact User Fields (7 Cols) */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-md border border-slate-200 overflow-hidden">

                {/* Form Top Header */}
                <div className="bg-slate-50/70 px-6 sm:px-8 py-5 border-b border-slate-200">
                  <p className="text-xs font-bold text-[#0078FF] uppercase tracking-widest mb-1">
                    DROP A MESSAGE
                  </p>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Send us a message
                  </h2>
                  <p className="text-slate-500 text-xs mt-1 font-medium">
                    We typically respond within one business day.
                  </p>
                </div>

                {/* Form Content */}
                <div className="p-6 sm:p-8">

                  {/* Success Alert */}
                  {submitStatus === 'success' && (
                    <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-md flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-emerald-900">Message Delivered Successfully!</h4>
                        <p className="text-xs text-emerald-700 mt-0.5">
                          Thank you for reaching out. We will get back to you shortly.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error Alert */}
                  {submitStatus === 'error' && (
                    <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-red-900">Something went wrong</h4>
                        <p className="text-xs text-red-700 mt-0.5">
                          Please try again or contact us directly on WhatsApp or phone.
                        </p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">

                    {/* FULL NAME + EMAIL ADDRESS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>
                          FULL NAME <span className="text-[#FB0500]">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          readOnly={!!student}
                          placeholder="Your full name"
                          className={inputCls(errors.name) + (student ? ' bg-slate-50 text-slate-500 cursor-not-allowed' : '')}
                        />
                        {errors.name && <p className="mt-1 text-[11px] text-red-500 font-semibold">{errors.name}</p>}
                      </div>

                      <div>
                        <label className={labelCls}>
                          EMAIL ADDRESS <span className="text-[#FB0500]">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          readOnly={!!student}
                          placeholder="your@email.com"
                          className={inputCls(errors.email) + (student ? ' bg-slate-50 text-slate-500 cursor-not-allowed' : '')}
                        />
                        {errors.email && <p className="mt-1 text-[11px] text-red-500 font-semibold">{errors.email}</p>}
                      </div>
                    </div>

                    {/* SUBJECT (4 Buttons + text input) */}
                    <div>
                      <label className={labelCls}>
                        SUBJECT <span className="text-[#FB0500]">*</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2.5">
                        {SUBJECT_OPTIONS.map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              setFormData(p => ({ ...p, subject: s }));
                              if (errors.subject) setErrors(p => ({ ...p, subject: '' }));
                            }}
                            className={`py-2 px-3 rounded-md text-xs font-bold border transition-colors ${
                              formData.subject === s
                                ? 'bg-[#0078FF] text-white border-[#0078FF]'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-[#0078FF] hover:text-[#0078FF]'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Or type your own subject..."
                        className={inputCls(errors.subject)}
                      />
                      {errors.subject && <p className="mt-1 text-[11px] text-red-500 font-semibold">{errors.subject}</p>}
                    </div>

                    {/* YOUR MESSAGE */}
                    <div>
                      <label className={labelCls}>
                        YOUR MESSAGE <span className="text-[#FB0500]">*</span>
                      </label>
                      <textarea
                        name="message"
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us more about your inquiry — the more detail, the better we can help..."
                        className={inputCls(errors.message) + ' resize-none'}
                      />
                      <div className="flex items-center justify-between mt-1">
                        {errors.message ? (
                          <p className="text-[11px] text-red-500 font-semibold">{errors.message}</p>
                        ) : (
                          <span />
                        )}
                        <span className="text-[11px] text-slate-400 font-medium">
                          {formData.message.length} chars
                        </span>
                      </div>
                    </div>

                    {/* Action buttons: Send Message (Red) + WhatsApp (Green) */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-3 px-5 bg-[#FB0500] hover:bg-red-700 text-white font-bold rounded-md text-xs sm:text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Sending…</span>
                          </>
                        ) : (
                          <>
                            <span>Send Message</span>
                            <Send className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <a
                        href="https://wa.me/919877515330?text=Hi%20Root%20Classes,%20I%20have%20an%20inquiry%20regarding%20courses."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3 px-5 bg-[#00A859] hover:bg-emerald-700 text-white font-bold rounded-md text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shrink-0"
                      >
                        <FaWhatsapp className="w-4 h-4" />
                        <span>WhatsApp</span>
                      </a>
                    </div>

                  </form>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. Interactive Map Section ──────────────────────────────── */}
      <section className="py-10 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#0078FF] block mb-1">
                Directions & Navigation
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Locate Root Classes on Google Maps
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Easily accessible via public transport, bus routes, and auto stands opposite ITI College, Ludhiana.
              </p>
            </div>
            <a
              href="https://maps.google.com/?q=Gill+Road+ITI+College+Shilapuri+Ludhiana"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 hover:bg-black text-white text-xs font-bold transition shrink-0 self-start md:self-auto"
            >
              <MapPin className="w-3.5 h-3.5 text-[#FB0500]" />
              <span>Get Live Navigation</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>

          <div className="rounded-md overflow-hidden border border-slate-200 h-[320px] sm:h-[380px] bg-slate-100">
            <iframe
              title="Root Classes Campus Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3418.0!2d75.85!3d30.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sRoots+Classes+Ludhiana!5e0!3m2!1sen!2sin!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* ── 5. Quick Frequently Asked Questions ─────────────────────── */}
      <section className="py-12 md:py-14 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#FB0500] block mb-1">
              Have Quick Questions?
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Everything you need to know about joining Root Classes offline & online programs.
            </p>
          </div>

          <div className="space-y-2.5">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-md border border-slate-200 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 font-bold text-slate-900 text-xs sm:text-sm hover:text-[#0078FF] transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-[#0078FF] shrink-0" />
                      <span>{faq.q}</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#0078FF]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 font-medium">
                      <p className="pt-2.5">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Need more help banner */}
          <div className="mt-8 p-5 rounded-md bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Still have unanswered questions?</h4>
              <p className="text-xs text-slate-500 mt-0.5">Talk directly to Director Surendra Sir & Senior Faculty.</p>
            </div>
            <a
              href="tel:+919877515330"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#FB0500] hover:bg-red-700 text-white font-bold text-xs transition shrink-0"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Us: +91 98775-15330</span>
            </a>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Contact;
