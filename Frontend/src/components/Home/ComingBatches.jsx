import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, Zap, GraduationCap, FlaskConical,
  BrainCircuit, CheckCircle2, Flame, Video, FileText,
  ClipboardList, Award, Calendar, Clock, Users, ArrowRight, Star, Phone, BookOpen, ShieldCheck
} from 'lucide-react';

const batches = [
  {
    id: 1,
    hot: true,
    badge: 'CLASS 10 SCIENCE',
    bannerImg: '/batch_banner.jpg',
    faculty: 'Surendra Sir',
    domain: 'CBSE BOARD 2026–27 • FOUNDATION',
    domainBg: 'bg-red-50',
    domainText: 'text-[#FB0500]',
    domainBorder: 'border-red-200',
    title: 'Class 10 Science — Electricity & Board Booster Batch',
    desc: 'Specialized 10th Board preparation covering high-weightage topics like Electricity, Light, Chemical Reactions with most repeated PYQs, numericals, and exam strategies by Surendra Sir.',
    startDate: 'Nov 10, 2026',
    timing: '5:30 PM – 7:30 PM',
    duration: '4 Months Crash + Test Series',
    mode: 'Classroom + Live Online',
    seats: 45,
    seatsLeft: 7,
    features: ['Surendra Sir Live Classes', 'Most Repeated PYQ Booklet', 'Daily Practice Problems (DPP)', '10+ Full Board Mock Tests'],
    accentColor: '#FB0500',
    btnClass: 'bg-[#FB0500] hover:bg-red-700',
    icon: Zap,
    whatYouGet: [
      {
        icon: Video,
        title: 'Surendra Sir Masterclasses',
        desc: 'In-depth conceptual lectures covering all derivations, circuit diagrams, and numerical solving tricks.'
      },
      {
        icon: ClipboardList,
        title: 'Full Board Mock Test Series',
        desc: 'CBSE pattern sample papers with step-by-step marking scheme and personalized evaluation.'
      },
      {
        icon: FileText,
        title: 'Formula Booklet & DPPs',
        desc: 'Comprehensive formula handbook, electricity quick revision chart, and daily practice problem sheets.'
      },
      {
        icon: Award,
        title: 'Up to 90% Scholarship',
        desc: 'Avail fee concession through Roots Scholarship Admission Test (RSAT) for Class 10 students.'
      },
    ],
  },
  {
    id: 2,
    hot: true,
    badge: 'IIT-JEE BATCH',
    bannerImg: '/batch3.png',
    faculty: 'IIT / NIT Alumni Faculty',
    domain: 'ENGINEERING DOMAIN • CLASS 11-12 & DROPPER',
    domainBg: 'bg-blue-50',
    domainText: 'text-[#0078FF]',
    domainBorder: 'border-blue-200',
    title: 'JEE Main + Advanced 1-Year Classroom Batch 2026–27',
    desc: 'Intensive 1-Year classroom program for IIT JEE aspirants covering Physics, Chemistry, and Mathematics with advanced problem solving, national test series, and mentorship.',
    startDate: 'Nov 15, 2026',
    timing: '7:00 AM – 1:00 PM',
    duration: '12 Months Comprehensive',
    mode: 'Offline Classroom + Online Access',
    seats: 40,
    seatsLeft: 9,
    features: ['Daily 5-Hour Sessions', '40+ All India Mock Tests', 'Level 1-3 Graded Sheets', '1-on-1 Faculty Mentorship'],
    accentColor: '#0078FF',
    btnClass: 'bg-[#FB0500] hover:bg-red-700',
    icon: BrainCircuit,
    whatYouGet: [
      {
        icon: Video,
        title: 'IIT/NIT Alumni Faculty',
        desc: 'Daily concept classes with real-time doubt solving and speed-accuracy improvement techniques.'
      },
      {
        icon: ClipboardList,
        title: 'JEE Advanced Pattern Tests',
        desc: 'Weekly chapter tests, monthly cumulative tests, and full-length CBT tests on actual exam interface.'
      },
      {
        icon: FileText,
        title: 'Exhaustive Study Modules',
        desc: 'Hardcopy theory modules, previous 15-year chapter-wise questions, and subjective problem sheets.'
      },
      {
        icon: Award,
        title: 'Merit-Based Scholarship',
        desc: 'Up to 100% tuition waiver for meritorious students scoring high in RSAT screening test.'
      },
    ],
  },
  {
    id: 3,
    hot: false,
    badge: 'NEET (UG) BATCH',
    bannerImg: '/batch2.png',
    faculty: 'Senior Medical Faculty',
    domain: 'MEDICAL DOMAIN • CLASS 11-12 & REPEATER',
    domainBg: 'bg-emerald-50',
    domainText: 'text-emerald-700',
    domainBorder: 'border-emerald-200',
    title: 'NEET (UG) 2-Year Integrated Classroom Batch 2026–28',
    desc: 'Line-by-line NCERT mastery for Biology, Chemistry, and Physics with high-yield question drills, OMR test practice, and personalized doubt sessions.',
    startDate: 'Dec 01, 2026',
    timing: '8:30 AM – 2:00 PM',
    duration: '24 Months Complete Syllabus',
    mode: 'Classroom + Hybrid Portal',
    seats: 35,
    seatsLeft: 14,
    features: ['100% NCERT Focused Biology', 'Weekly OMR-Based Tests', 'Bi-weekly Parent Reports', 'Dedicated Doubt Faculty'],
    accentColor: '#059669',
    btnClass: 'bg-[#FB0500] hover:bg-red-700',
    icon: FlaskConical,
    whatYouGet: [
      {
        icon: Video,
        title: 'Doctor & Senior Faculty Panel',
        desc: 'Concept clarity with practical diagrams, mnemonics, and NCERT-centric high-yield coverage.'
      },
      {
        icon: ClipboardList,
        title: 'OMR Pattern NEET Test Series',
        desc: 'Strictly timed 720-mark mock exams with negative marking analysis and rank benchmarking.'
      },
      {
        icon: FileText,
        title: 'Biology NCERT Extract & DPPs',
        desc: 'Line-by-line fill in blanks, assertion-reason booklets, and 5000+ chapter-wise questions.'
      },
      {
        icon: Award,
        title: 'Roots Medical Scholarship',
        desc: 'Scholarship up to 85% on tuition fees for students securing top ranks in RSAT entrance test.'
      },
    ],
  },
];

const CountdownTimer = ({ targetDate }) => {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) return setT({ d: 0, h: 0, m: 0, s: 0 });
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000)
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-1">
      {[
        { v: t.d, l: 'Days' },
        { v: t.h, l: 'Hours' },
        { v: t.m, l: 'Mins' },
        { v: t.s, l: 'Secs' }
      ].map(({ v, l }, i) => (
        <React.Fragment key={l}>
          {i > 0 && <span className="text-gray-400 font-bold text-xs">:</span>}
          <div className="flex flex-col items-center bg-gray-50 border border-gray-200 rounded px-1.5 py-1 min-w-[36px]">
            <span className={`text-xs font-black leading-none ${l === 'Secs' ? 'text-[#FB0500]' : 'text-gray-900'}`}>
              {String(v).padStart(2, '0')}
            </span>
            <span className="text-[8px] text-gray-500 font-semibold mt-0.5">{l}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

import axios from 'axios';
import api from '../../services/endpoints';

const ComingBatches = () => {
  const [batchesData, setBatchesData] = useState(batches);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const fetchLiveBatches = async () => {
      try {
        const res = await axios.get(api.batch.getAll);
        if (res.data?.success && res.data.data?.length > 0) {
          setBatchesData(res.data.data);
        }
      } catch (err) {
        console.warn("Using default batches on homepage:", err.message);
      }
    };
    fetchLiveBatches();
  }, []);

  const b = batchesData[active] || batchesData[0] || batches[0];
  const urgent = (b.seatsLeft ?? 7) <= 10;
  const totalSeats = b.seats || 40;
  const remainingSeats = b.seatsLeft ?? 7;
  const filledPct = Math.round(((totalSeats - remainingSeats) / totalSeats) * 100);

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/70">
      <div className="max-w-6xl mx-auto">

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FB0500] inline-block animate-pulse" />
            <span className="text-xs font-bold text-[#FB0500] uppercase tracking-wider">UPCOMING BATCHES — 2026</span>
            <div className="h-px bg-red-200 w-16 hidden sm:block" />
          </div>

          {/* Quick tab switcher */}
          <div className="flex items-center gap-1.5 bg-white p-1 border border-gray-200 rounded-md overflow-x-auto">
            {batchesData.map((item, idx) => (
              <button
                key={item._id || item.id || idx}
                onClick={() => setActive(idx)}
                className={`px-3 py-1 text-xs font-bold rounded transition-colors whitespace-nowrap ${active === idx
                  ? 'bg-[#FB0500] text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                {item.badge}
              </button>
            ))}
          </div>
        </div>

        {/* ── MAIN CARD (Clean flat borders, rounded-sm, no heavy shadow) ── */}
        <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">

            {/* ── LEFT: BIG BANNER + SCHEDULE & CTA (5 cols on lg) ── */}
            <div className="lg:col-span-5 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-200 bg-white">

              {/* BIG BANNER CONTAINER (16:9 Aspect ratio, fully visible, crisp, clean) */}
              <div className="relative w-full aspect-[16/9] bg-gray-900 overflow-hidden border-b border-gray-200 group">
                <img
                  src={b.bannerImg}
                  alt={b.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />

                {/* Top Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span
                    className="text-[10px] font-black px-2 py-0.5 text-white uppercase tracking-wider rounded-sm"
                    style={{ background: b.accentColor }}
                  >
                    {b.badge}
                  </span>
                  {b.hot && (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-amber-500 text-white rounded-sm">
                      <Flame size={11} fill="#fff" /> HOT
                    </span>
                  )}
                </div>

                {/* Top-right: Seats urgency badge */}
                {b.seatsLeft <= 10 && (
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-sm">
                    <Flame size={11} fill="#fff" />
                    Only {b.seatsLeft} Seats Left!
                  </div>
                )}

                {/* Quick Enroll Tag on Banner */}
                <div className="absolute bottom-2.5 right-2.5">
                  <Link
                    to={`/enroll?batch=${b._id || b.id}`}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-sm bg-[#FB0500] hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-wide transition-colors"
                  >
                    <Zap size={11} className="fill-white" />
                    <span>Enroll Now</span>
                  </Link>
                </div>
              </div>

              {/* Schedule, Countdown & CTAs */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">

                {/* 4 Details Grid */}
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-100">
                  <div className="flex items-start gap-2">
                    <Calendar size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Start Date</p>
                      <p className="text-xs font-bold text-gray-800">{b.startDate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Timing</p>
                      <p className="text-xs font-bold text-gray-800">{b.timing}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <BookOpen size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Duration</p>
                      <p className="text-xs font-bold text-gray-800">{b.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Mode</p>
                      <p className="text-xs font-bold text-gray-800">{b.mode}</p>
                    </div>
                  </div>
                </div>

                {/* Seats progress & Countdown */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Seats Available</span>
                      <span className={`text-xs font-black ${urgent ? 'text-red-600' : 'text-gray-700'}`}>
                        {remainingSeats} seats left / {totalSeats}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${filledPct}%`,
                          background: urgent ? '#dc2626' : (b.accentColor || '#FB0500')
                        }}
                      />
                    </div>
                    {urgent && (
                      <p className="text-[10px] font-bold text-red-600 mt-1 flex items-center gap-1">
                        <Flame size={11} /> Only {remainingSeats} seats remaining! Batch filling fast.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Batch Starts In:</span>
                    <CountdownTimer targetDate={b.startDate} />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <Link to={`/enroll?batch=${b._id || b.id}`} className="w-full">
                    <button
                      className="w-full py-3 px-4 text-xs sm:text-sm font-black text-white rounded-md shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] bg-[#FB0500] hover:bg-red-700"
                    >
                      <Zap size={16} className="fill-white" />
                      <span>ENROLL NOW — RESERVE SEAT</span>
                      <ArrowRight size={16} />
                    </button>
                  </Link>

                  <Link to="/scholarship" className="w-full">
                    <button
                      className="w-full py-2 px-4 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded flex items-center justify-center gap-2 transition-colors"
                    >
                      <Award size={13} className="text-[#FB0500]" />
                      <span>Take Scholarship Test (RSAT)</span>
                    </button>
                  </Link>
                </div>

              </div>
            </div>

            {/* ── RIGHT: DETAILS & WHAT YOU GET (7 cols on lg) ── */}
            <div className="lg:col-span-7 flex flex-col justify-between bg-white p-6 sm:p-7">
              <div>
                {/* Domain & Heading */}
                <div className="mb-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded border ${b.domainBg || 'bg-red-50'} ${b.domainText || 'text-[#FB0500]'} ${b.domainBorder || 'border-red-200'}`}>
                      {b.domain}
                    </span>
                    <span className="text-xs font-semibold text-gray-400">
                      Starting On: <strong className="text-gray-800">{b.startDate}</strong>
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-gray-900 leading-snug">
                    {b.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                    {b.desc}
                  </p>
                </div>

                {/* Feature Bullet Points */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-3 border-y border-gray-100">
                  {(b.features || []).map((feat) => (
                    <div key={feat} className="flex items-center gap-2">
                      <CheckCircle2 size={14} style={{ color: b.accentColor || '#FB0500' }} className="flex-shrink-0" />
                      <span className="text-xs font-semibold text-gray-700">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* What You Get in This Batch */}
                <div className="mt-5">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Star size={14} className="text-amber-500" fill="#f59e0b" />
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">What You Get In This Batch</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(b.whatYouGet || []).map((item, idx) => {
                      const WIcon = item.icon || Video;
                      return (
                        <div
                          key={item.title || idx}
                          className="p-3 rounded border border-gray-100 bg-gray-50/70 hover:bg-gray-100/60 transition-colors flex gap-2.5"
                        >
                          <div
                            className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center flex-shrink-0"
                          >
                            <WIcon size={15} style={{ color: b.accentColor || '#FB0500' }} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">{item.title}</p>
                            <p className="text-[11px] text-gray-500 font-medium mt-0.5 leading-snug">{item.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Counselor Assistance Bar */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-gray-800 leading-tight">Need Help Choosing a Batch?</p>
                    <p className="text-[10px] text-gray-500">Free 1-on-1 counseling with Roots Academic Advisors</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link to="/contact">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded border border-gray-200 transition-colors">
                      <Phone size={12} />
                      <span>Contact Counselor</span>
                    </button>
                  </Link>

                  {/* Navigation Arrows */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActive(i => (i - 1 + batches.length) % batches.length)}
                      title="Previous Batch"
                      className="p-1.5 text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => setActive(i => (i + 1) % batches.length)}
                      title="Next Batch"
                      className="p-1.5 text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default ComingBatches;
