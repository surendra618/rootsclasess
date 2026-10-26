import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Zap, Calendar, Clock, BookOpen, Users, Award, ShieldCheck,
  CheckCircle2, Flame, ArrowRight, Phone, Mail,
  GraduationCap, Sparkles, Building, User, HelpCircle,
  FileText, Check, AlertCircle, Share2, Download, MessageSquare, X
} from 'lucide-react';
import { upcomingBatches } from '../../data/batchesData';
import useStudentStore from '../../Store/studentstore';
import axios from 'axios';
import api from '../../services/endpoints';
import { toast } from 'react-toastify';

const BatchEnrollment = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { student } = useStudentStore();

  const [batchesList, setBatchesList] = useState(upcomingBatches);
  const [activeTab, setActiveTab] = useState(searchParams.get('batch') || '1');

  // Fetch live batches from backend API
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await axios.get(api.batch.getAll);
        if (res.data?.success && res.data.data?.length > 0) {
          setBatchesList(res.data.data);
        }
      } catch (err) {
        console.warn("Using offline fallback batches:", err.message);
      }
    };
    fetchBatches();
  }, []);

  const batchParam = searchParams.get('batch') || '1';
  const selectedBatch =
    batchesList.find(b => String(b._id) === String(batchParam) || String(b.id) === String(batchParam)) ||
    batchesList[0] ||
    upcomingBatches[0];

  // Form State
  const [formData, setFormData] = useState({
    studentName: '',
    phone: '',
    email: '',
    parentName: '',
    parentPhone: '',
    schoolName: '',
    city: '',
    learningMode: 'offline', // 'offline' or 'online'
    couponCode: '',
    paymentOption: 'token', // 'token', 'full', 'counseling'
    notes: ''
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(null);
  const [errors, setErrors] = useState({});

  // Auto-fill student info if logged in
  useEffect(() => {
    const s = student || (() => {
      try { return JSON.parse(localStorage.getItem('student') || '{}'); } catch { return {}; }
    })();

    if (s && (s.fullName || s.name || s.email)) {
      setFormData(prev => ({
        ...prev,
        studentName: prev.studentName || s.fullName || s.name || '',
        email: prev.email || s.email || '',
        phone: prev.phone || s.mobileNumber || s.phone || ''
      }));
    }
  }, [student]);

  // Synchronize when query param or tab changes
  useEffect(() => {
    const currentId = selectedBatch._id || selectedBatch.id;
    if (currentId) {
      setActiveTab(String(currentId));
    }
  }, [selectedBatch]);

  const handleTabChange = (batchId) => {
    setActiveTab(String(batchId));
    setSearchParams({ batch: String(batchId) });
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Coupon application logic
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    const code = (formData.couponCode || '').trim().toUpperCase();

    if (!code) {
      setCouponError('Please enter a coupon or RSAT scholarship code');
      return;
    }

    if (code === 'RSAT90') {
      const discount = Math.round(selectedBatch.fee * 0.90);
      setAppliedCoupon({ code, discount, label: '90% RSAT Scholarship Applied' });
      toast.success('🎉 90% RSAT Scholarship applied successfully!');
    } else if (code === 'ROOTS500' || code === 'EARLYBIRD') {
      const discount = 500;
      setAppliedCoupon({ code, discount, label: '₹500 Early Bird Welcome Bonus' });
      toast.success('🎉 ₹500 Discount applied successfully!');
    } else if (code === 'SURENDRASIR') {
      const discount = 1000;
      setAppliedCoupon({ code, discount, label: '₹1,000 Surendra Sir Special Privilege' });
      toast.success('🎉 ₹1,000 Special discount applied!');
    } else {
      setCouponError('Invalid coupon code. Try RSAT90 or ROOTS500');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setFormData(prev => ({ ...prev, couponCode: '' }));
  };

  // Pricing calculations
  const originalFee = selectedBatch.originalPrice || 7999;
  const standardFee = selectedBatch.fee || 3499;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTuitionFee = Math.max(0, standardFee - discountAmount);
  const payableNow = formData.paymentOption === 'token'
    ? (selectedBatch.tokenAmount || 499)
    : formData.paymentOption === 'counseling'
    ? 0
    : finalTuitionFee;

  const validate = () => {
    const err = {};
    if (!formData.studentName.trim()) err.studentName = 'Student name is required';
    if (!formData.phone.trim() || formData.phone.length < 10) err.phone = 'Valid 10-digit mobile number is required';
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) err.email = 'Valid email address is required';
    if (!formData.city.trim()) err.city = 'City is required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmitEnrollment = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fill in the required fields highlighted in red.');
      return;
    }

    setIsSubmitting(true);

    // ── 1. FREE / BINA PAISA VALA FLOW (Option: Hold Seat — ₹0 Now) ──
    if (payableNow === 0 || formData.paymentOption === 'counseling') {
      try {
        const payload = {
          studentName: formData.studentName,
          phone: formData.phone,
          email: formData.email,
          city: formData.city,
          parentName: formData.parentName,
          parentPhone: formData.parentPhone,
          schoolName: formData.schoolName,
          learningMode: formData.learningMode,
          couponCode: appliedCoupon ? appliedCoupon.code : 'None',
          discountAmount,
          paymentOption: 'counseling',
          payableNow: 0,
          finalTuitionFee,
          batchId: String(selectedBatch._id || selectedBatch.id),
          batchTitle: selectedBatch.title,
          batchBadge: selectedBatch.badge,
          batchStartDate: selectedBatch.startDate,
          notes: formData.notes,
          paymentStatus: 'Free (Pay at Center)'
        };

        const res = await axios.post(api.batch.apply, payload);
        const enrollmentId = res.data?.data?.enrollmentId || `ROOTS-ENR-${Date.now().toString().slice(-6)}`;

        const successData = {
          enrollmentId,
          studentName: formData.studentName,
          phone: formData.phone,
          email: formData.email,
          batch: selectedBatch,
          learningMode: formData.learningMode,
          paymentOption: 'counseling',
          payableNow: 0,
          finalTuitionFee,
          paymentStatus: 'Free (Pay at Center)',
          appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
          date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        };

        setEnrollmentSuccess(successData);
        toast.success('🎉 Free seat reservation confirmed! Counselor will contact you shortly.');
      } catch (error) {
        console.error('Free enrollment submission error:', error);
        toast.error(error.response?.data?.message || 'Failed to submit reservation');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // ── 2. PAISA VALA FLOW (Option: Token Fee ₹499/₹999 or Full Tuition Fee) ──
    // "JO PAISA VALA HAI US ME LAGA PAYE KARANE KO"
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Payment gateway failed to load. Please check internet connection.');
        setIsSubmitting(false);
        return;
      }

      // Create Razorpay Order
      const orderRes = await axios.post(api.batch.createOrder, {
        amount: payableNow,
        studentName: formData.studentName,
        batchTitle: selectedBatch.title
      });

      if (!orderRes.data?.success || !orderRes.data?.order) {
        throw new Error(orderRes.data?.message || 'Could not initiate payment order');
      }

      const { order, keyId } = orderRes.data;

      // Launch Razorpay Checkout Modal
      const options = {
        key: keyId || 'rzp_live_TbpL4le4mBM46T',
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'Roots Classes',
        description: `Batch Seat: ${selectedBatch.badge || selectedBatch.title}`,
        order_id: order.id,
        prefill: {
          name: formData.studentName,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#FB0500'
        },
        handler: async (response) => {
          // Online Payment Successful!
          try {
            const paymentPayload = {
              studentName: formData.studentName,
              phone: formData.phone,
              email: formData.email,
              city: formData.city,
              parentName: formData.parentName,
              parentPhone: formData.parentPhone,
              schoolName: formData.schoolName,
              learningMode: formData.learningMode,
              couponCode: appliedCoupon ? appliedCoupon.code : 'None',
              discountAmount,
              paymentOption: formData.paymentOption,
              payableNow,
              finalTuitionFee,
              batchId: String(selectedBatch._id || selectedBatch.id),
              batchTitle: selectedBatch.title,
              batchBadge: selectedBatch.badge,
              batchStartDate: selectedBatch.startDate,
              notes: formData.notes,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              paymentStatus: 'Paid Online'
            };

            const saveRes = await axios.post(api.batch.apply, paymentPayload);
            const enrollmentId = saveRes.data?.data?.enrollmentId || `ROOTS-ENR-${Date.now().toString().slice(-6)}`;

            const successData = {
              enrollmentId,
              studentName: formData.studentName,
              phone: formData.phone,
              email: formData.email,
              batch: selectedBatch,
              learningMode: formData.learningMode,
              paymentOption: formData.paymentOption,
              payableNow,
              finalTuitionFee,
              paymentId: response.razorpay_payment_id,
              paymentStatus: 'Paid Online',
              appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
              date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            };

            setEnrollmentSuccess(successData);
            toast.success(`🎉 Payment of ₹${payableNow.toLocaleString('en-IN')} successful! Seat confirmed.`);
          } catch (saveErr) {
            console.error('Failed to save paid enrollment:', saveErr);
            toast.error('Payment succeeded. Our team will verify and contact you.');
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            toast.info('Payment was cancelled. You can retry or choose "Hold Seat (₹0)" to pay later at center.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        console.error('Razorpay payment failed:', resp.error);
        toast.error(`Payment failed: ${resp.error?.description || 'Transaction declined'}`);
        setIsSubmitting(false);
      });
      rzp.open();
    } catch (err) {
      console.error('Payment initiation error:', err);
      toast.error(err.response?.data?.message || err.message || 'Payment initiation failed.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-16">
      
      {/* ── Top Header Bar (Clean & Flat) ── */}
      <div className="bg-slate-900 text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-black uppercase tracking-wider mb-2">
                <Sparkles size={11} />
                OFFICIAL BATCH REGISTRATION — 2026-27
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                Batch Enrollment & Admission Form
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Select your batch and fill in student details to reserve your classroom or online seat.
              </p>
            </div>

            {/* Quick Counselor Support Contact */}
            <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700 px-3.5 py-2.5 rounded-sm flex-shrink-0">
              <div className="w-8 h-8 rounded-sm bg-[#FB0500] flex items-center justify-center text-white font-bold flex-shrink-0">
                <Phone size={15} />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Admission Hotline</p>
                <a href="tel:+919123456789" className="text-xs font-black text-white hover:text-red-400 transition-colors">
                  +91 91234 56789
                </a>
                <p className="text-[9px] text-emerald-400 font-semibold">● Counselors Available</p>
              </div>
            </div>
          </div>

          {/* ── Quick Batch Switcher Tabs (Flat Clean Tabs) ── */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 whitespace-nowrap mr-2">Select Batch:</span>
            {batchesList.map(b => {
              const currentId = String(b._id || b.id);
              return (
                <button
                  key={currentId}
                  onClick={() => handleTabChange(currentId)}
                  className={`px-3 py-1.5 rounded-sm text-xs font-black uppercase tracking-wider transition-colors whitespace-nowrap flex items-center gap-2 border ${
                    activeTab === currentId
                      ? 'bg-[#FB0500] text-white border-[#FB0500]'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-700'
                  }`}
                >
                  <span>{b.badge}</span>
                  {b.hot && (
                    <span className="bg-amber-400 text-slate-900 text-[9px] px-1 py-0.2 rounded-xs font-black">
                      HOT
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ── LEFT COLUMN: Selected Batch Summary (5 cols) ── */}
          <div className="lg:col-span-5 space-y-4">

            {/* Batch Card: Flat, Clean Borders, No Muddy Shadow */}
            <div className="bg-white border border-slate-200 rounded-sm overflow-hidden sticky top-4">
              
              {/* Clean Banner Image (No Heavy Dark Overlay Clashing With Artwork) */}
              <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden border-b border-slate-200">
                <img
                  src={selectedBatch.bannerImg}
                  alt={selectedBatch.title}
                  className="w-full h-full object-cover"
                />

                {/* Minimal Top Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span
                    className="text-[10px] font-black px-2 py-0.5 text-white uppercase tracking-wider rounded-sm"
                    style={{ background: selectedBatch.accentColor }}
                  >
                    {selectedBatch.badge}
                  </span>
                  <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-sm flex items-center gap-1">
                    <Flame size={11} fill="#fff" />
                    Only {selectedBatch.seatsLeft} Seats Left
                  </span>
                </div>
              </div>

              {/* Dedicated Title & Batch Info Block (Directly Below Image) */}
              <div className="p-4 bg-white border-b border-slate-100">
                <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm border mb-2 ${selectedBatch.domainBg} ${selectedBatch.domainText} ${selectedBatch.domainBorder}`}>
                  {selectedBatch.domain}
                </span>

                <h3 className="text-base font-black text-slate-900 leading-snug">
                  {selectedBatch.title}
                </h3>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {selectedBatch.desc}
                </p>

                <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-slate-100 text-slate-700">
                  <span className="flex items-center gap-1.5 font-bold">
                    <GraduationCap size={14} className="text-[#FB0500]" />
                    {selectedBatch.faculty}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm">
                    Starts {selectedBatch.startDate}
                  </span>
                </div>
              </div>

              {/* Key Logistics Grid */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/70">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-start gap-2">
                    <Calendar size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Batch Start</p>
                      <p className="font-bold text-slate-800">{selectedBatch.startDate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Class Timing</p>
                      <p className="font-bold text-slate-800">{selectedBatch.timing}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <BookOpen size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Duration</p>
                      <p className="font-bold text-slate-800">{selectedBatch.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Mode</p>
                      <p className="font-bold text-slate-800">{selectedBatch.mode}</p>
                    </div>
                  </div>
                </div>

                {/* Progress bar of filled seats */}
                <div className="mt-3.5 pt-3 border-t border-slate-200">
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-slate-500 uppercase">Seats Availability:</span>
                    <span className="text-red-600 font-black">
                      {selectedBatch.seats - selectedBatch.seatsLeft} of {selectedBatch.seats} Booked
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-sm overflow-hidden">
                    <div
                      className="bg-red-600 h-full rounded-sm transition-all duration-700"
                      style={{ width: `${Math.round(((selectedBatch.seats - selectedBatch.seatsLeft) / selectedBatch.seats) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-red-600 mt-1 flex items-center gap-1">
                    <Flame size={11} /> Only {selectedBatch.seatsLeft} seats left for offline classroom allotment.
                  </p>
                </div>
              </div>

              {/* Fee Breakdown Card */}
              <div className="p-4 bg-white border-b border-slate-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">Fee Breakdown</span>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-sm border border-emerald-200">
                    Save {Math.round(((originalFee - standardFee) / originalFee) * 100)}% Early Bird
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Standard Batch Fee:</span>
                    <span className="line-through">₹{originalFee.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-800 font-medium">
                    <span>Early-Bird Program Fee:</span>
                    <span className="font-bold">₹{standardFee.toLocaleString('en-IN')}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50 p-2 rounded-sm border border-emerald-200">
                      <span>{appliedCoupon.label}</span>
                      <span>-₹{appliedCoupon.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="text-xs font-black text-slate-900 uppercase">Total Program Fee:</span>
                    <span className="text-base font-black text-[#FB0500]">
                      ₹{finalTuitionFee.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Seat Reservation Token Option */}
                  <div className="mt-2.5 bg-red-50/70 border border-red-200 p-2.5 rounded-sm">
                    <div className="flex items-start gap-2">
                      <Zap size={14} className="text-[#FB0500] mt-0.5 flex-shrink-0" />
                      <div className="text-[11px] leading-tight">
                        <strong className="text-slate-900 block font-bold">
                          Token Booking: Pay only ₹{selectedBatch.tokenAmount} Now
                        </strong>
                        <span className="text-slate-600">
                          Reserve seat instantly with ₹{selectedBatch.tokenAmount} token fee and pay the balance during orientation.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* What You Get Highlights */}
              <div className="p-4 bg-slate-50/50">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  What’s Included:
                </p>
                <div className="space-y-1.5">
                  {selectedBatch.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                      <Check size={13} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Roots Trust Footer */}
              <div className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2.5">
                <ShieldCheck size={20} className="text-emerald-600 flex-shrink-0" />
                <div className="text-[10px] text-slate-600 leading-tight">
                  <strong className="text-slate-900 block font-bold">Roots Academic Guarantee</strong>
                  100% syllabus mastery, physical question booklets, and parent reports.
                </div>
              </div>

            </div>

          </div>

          {/* ── RIGHT COLUMN: Registration Form (7 cols) ── */}
          <div className="lg:col-span-7">

            {/* Clean Flat Form Card (No Heavy Shadows / No Bulbous Rounded Corners) */}
            <div className="bg-white border border-slate-200 rounded-sm p-5 sm:p-7">

              <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 mb-5">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    Student Enrollment & Seat Reservation
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Batch: <strong className="text-slate-800">{selectedBatch.title}</strong>
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-sm bg-red-50 text-[#FB0500] border border-red-200">
                  Step 1 of 1
                </span>
              </div>

              <form onSubmit={handleSubmitEnrollment} className="space-y-5">

                {/* Section 1: Student Information */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5 text-xs font-black uppercase tracking-wider text-slate-700">
                    <User size={14} className="text-[#FB0500]" />
                    <span>Student Information</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Student Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="studentName"
                        value={formData.studentName}
                        onChange={handleInputChange}
                        placeholder="e.g. Rahul Sharma"
                        className={`w-full px-3 py-2 rounded-sm border text-xs sm:text-sm outline-none transition-colors ${
                          errors.studentName
                            ? 'border-red-500 bg-red-50/20'
                            : 'border-slate-300 focus:border-[#FB0500]'
                        }`}
                      />
                      {errors.studentName && (
                        <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.studentName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Student WhatsApp Mobile <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        className={`w-full px-3 py-2 rounded-sm border text-xs sm:text-sm outline-none transition-colors ${
                          errors.phone
                            ? 'border-red-500 bg-red-50/20'
                            : 'border-slate-300 focus:border-[#FB0500]'
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="e.g. rahul@example.com"
                        className={`w-full px-3 py-2 rounded-sm border text-xs sm:text-sm outline-none transition-colors ${
                          errors.email
                            ? 'border-red-500 bg-red-50/20'
                            : 'border-slate-300 focus:border-[#FB0500]'
                        }`}
                      />
                      {errors.email && (
                        <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        City / Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g. Patna, Bihar"
                        className={`w-full px-3 py-2 rounded-sm border text-xs sm:text-sm outline-none transition-colors ${
                          errors.city
                            ? 'border-red-500 bg-red-50/20'
                            : 'border-slate-300 focus:border-[#FB0500]'
                        }`}
                      />
                      {errors.city && (
                        <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.city}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 2: Parent & Academic Details */}
                <div className="pt-1">
                  <div className="flex items-center gap-1.5 mb-2.5 text-xs font-black uppercase tracking-wider text-slate-700">
                    <GraduationCap size={14} className="text-[#FB0500]" />
                    <span>Parent & School Details (Optional)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Father's / Guardian's Name
                      </label>
                      <input
                        type="text"
                        name="parentName"
                        value={formData.parentName}
                        onChange={handleInputChange}
                        placeholder="e.g. Rajesh Sharma"
                        className="w-full px-3 py-2 rounded-sm border border-slate-300 focus:border-[#FB0500] text-xs sm:text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Parent's Contact Number
                      </label>
                      <input
                        type="tel"
                        name="parentPhone"
                        value={formData.parentPhone}
                        onChange={handleInputChange}
                        placeholder="Guardian mobile number"
                        maxLength={10}
                        className="w-full px-3 py-2 rounded-sm border border-slate-300 focus:border-[#FB0500] text-xs sm:text-sm outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Current School / College Name
                      </label>
                      <input
                        type="text"
                        name="schoolName"
                        value={formData.schoolName}
                        onChange={handleInputChange}
                        placeholder="e.g. Loyola High School, Patna"
                        className="w-full px-3 py-2 rounded-sm border border-slate-300 focus:border-[#FB0500] text-xs sm:text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Learning Mode Selection */}
                <div className="pt-1">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    Select Your Preferred Mode of Learning:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setFormData(p => ({ ...p, learningMode: 'offline' }))}
                      className={`p-3 rounded-sm border cursor-pointer transition-colors ${
                        formData.learningMode === 'offline'
                          ? 'border-[#FB0500] bg-red-50/40'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Building size={14} className="text-[#FB0500]" />
                          Classroom Offline Center
                        </span>
                        <input
                          type="radio"
                          name="learningMode"
                          checked={formData.learningMode === 'offline'}
                          onChange={() => {}}
                          className="accent-[#FB0500]"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Attend offline sessions at Roots Classes Patna Center with physical teacher doubts.
                      </p>
                    </div>

                    <div
                      onClick={() => setFormData(p => ({ ...p, learningMode: 'online' }))}
                      className={`p-3 rounded-sm border cursor-pointer transition-colors ${
                        formData.learningMode === 'online'
                          ? 'border-[#FB0500] bg-red-50/40'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Zap size={14} className="text-[#FB0500]" />
                          Live Interactive Online
                        </span>
                        <input
                          type="radio"
                          name="learningMode"
                          checked={formData.learningMode === 'online'}
                          onChange={() => {}}
                          className="accent-[#FB0500]"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Join via high-definition live stream with digital DPPs and full lecture recordings.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 4: RSAT Scholarship or Coupon Code */}
                <div className="pt-1">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Have RSAT Scholarship / Promo Code?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="couponCode"
                      value={formData.couponCode}
                      onChange={handleInputChange}
                      placeholder="e.g. RSAT90 or ROOTS500"
                      className="flex-1 px-3 py-1.5 rounded-sm border border-slate-300 text-xs sm:text-sm uppercase font-semibold outline-none focus:border-[#FB0500]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-3.5 py-1.5 bg-[#FB0500] hover:bg-red-700 text-white text-xs font-bold rounded-sm transition-colors"
                    >
                      Apply Code
                    </button>
                  </div>

                  {couponError && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {couponError}
                    </p>
                  )}

                  {appliedCoupon && (
                    <div className="mt-2 flex items-center justify-between bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-sm text-xs font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        {appliedCoupon.label} (Code: {appliedCoupon.code})
                      </span>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-red-500 hover:text-red-700 text-[11px] underline ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-500 mt-1">
                    Codes: <strong className="text-slate-700">RSAT90</strong> (90% RSAT Scholarship) • <strong className="text-slate-700">ROOTS500</strong> (₹500 Early Bird)
                  </p>
                </div>

                {/* Section 5: Reservation Option */}
                <div className="pt-1">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    Seat Confirmation Preference:
                  </label>
                  <div className="space-y-2">
                    
                    {/* Token Reservation */}
                    <label
                      className={`flex items-start gap-3 p-3 rounded-sm border cursor-pointer transition-colors ${
                        formData.paymentOption === 'token'
                          ? 'border-[#FB0500] bg-red-50/30'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentOption"
                        value="token"
                        checked={formData.paymentOption === 'token'}
                        onChange={handleInputChange}
                        className="mt-0.5 accent-[#FB0500]"
                      />
                      <div className="flex-1 text-xs">
                        <div className="flex justify-between items-center font-bold text-slate-900">
                          <span>Reserve Seat Now with Token Fee</span>
                          <span className="text-[#FB0500] font-black text-xs sm:text-sm">₹{selectedBatch.tokenAmount}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Guarantees your seat immediately. Balance fee payable during orientation.
                        </p>
                      </div>
                    </label>

                    {/* Pay Full Fee */}
                    <label
                      className={`flex items-start gap-3 p-3 rounded-sm border cursor-pointer transition-colors ${
                        formData.paymentOption === 'full'
                          ? 'border-[#FB0500] bg-red-50/30'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentOption"
                        value="full"
                        checked={formData.paymentOption === 'full'}
                        onChange={handleInputChange}
                        className="mt-0.5 accent-[#FB0500]"
                      />
                      <div className="flex-1 text-xs">
                        <div className="flex justify-between items-center font-bold text-slate-900">
                          <span>Full One-Time Fee Payment</span>
                          <span className="text-[#FB0500] font-black text-xs sm:text-sm">₹{finalTuitionFee.toLocaleString('en-IN')}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Complete admission in one go. Free study material kit delivered immediately upon enrollment.
                        </p>
                      </div>
                    </label>

                    {/* Request Callback & Hold */}
                    <label
                      className={`flex items-start gap-3 p-3 rounded-sm border cursor-pointer transition-colors ${
                        formData.paymentOption === 'counseling'
                          ? 'border-[#FB0500] bg-red-50/30'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentOption"
                        value="counseling"
                        checked={formData.paymentOption === 'counseling'}
                        onChange={handleInputChange}
                        className="mt-0.5 accent-[#FB0500]"
                      />
                      <div className="flex-1 text-xs">
                        <div className="flex justify-between items-center font-bold text-slate-900">
                          <span>Hold Seat (Pay at Offline Center / Counselor Call)</span>
                          <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-sm">₹0 Now</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Hold seat for 48 hours. Our academic counselor will call to answer queries before payment.
                        </p>
                      </div>
                    </label>

                  </div>
                </div>

                {/* Additional queries */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Any specific question for Surendra Sir / Academic Team? (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="e.g. Need assistance in numericals, want center visit slot..."
                    className="w-full px-3 py-2 rounded-sm border border-slate-300 text-xs outline-none focus:border-[#FB0500]"
                  />
                </div>

                {/* Action CTA Button */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-5 rounded-sm text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm ${
                      isSubmitting
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-[#FB0500] hover:bg-red-700'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>
                          {payableNow === 0
                            ? 'Submitting Free Seat Hold...'
                            : 'Opening Razorpay Payment Gateway...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Zap size={16} className="fill-white" />
                        <span>
                          {payableNow === 0
                            ? 'CONFIRM & HOLD SEAT (FREE — ₹0)'
                            : `PAY ₹${payableNow.toLocaleString('en-IN')} VIA RAZORPAY & CONFIRM SEAT`}
                        </span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-slate-500 mt-2 font-medium">
                    {payableNow === 0 ? (
                      <span className="text-emerald-700 font-bold">
                        ✓ 100% Free Option • No online payment required • Pay remaining fee at offline center.
                      </span>
                    ) : (
                      <span>
                        🔒 Secured by Razorpay • Instant Seat Confirmation • Supports UPI (GPay/PhonePe), Cards & NetBanking
                      </span>
                    )}
                  </p>

                  <div className="mt-2 flex items-center justify-center gap-3 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-600" />
                      100% Verified
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-blue-600" />
                      Instant Confirmation
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Award size={12} className="text-amber-600" />
                      Surendra Sir & Team
                    </span>
                  </div>
                </div>

              </form>

            </div>

          </div>

        </div>
      </div>

      {/* ── ENROLLMENT SUCCESS MODAL ── */}
      {enrollmentSuccess && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xs flex items-start justify-center p-3 sm:p-4 pt-24 sm:pt-28 pb-10 overflow-y-auto">
          <div className="bg-white rounded-sm max-w-md w-full p-4 sm:p-5 border border-slate-200 relative shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setEnrollmentSuccess(null)}
              className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-sm transition-colors"
              title="Close"
            >
              <X size={16} />
            </button>

            {/* Header Badge */}
            <div className="text-center pb-2.5 border-b border-slate-100">
              <div className="w-8 h-8 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-1.5">
                <CheckCircle2 size={18} />
              </div>
              <span className="inline-block px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider mb-1 border border-emerald-200">
                Seat Reserved Successfully!
              </span>
              <h2 className="text-base font-black text-slate-900 leading-tight">
                Welcome to Roots Classes!
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Your admission request for <strong className="text-slate-800">{enrollmentSuccess.batch.badge}</strong> has been received.
              </p>
            </div>

            {/* Compact Receipt Summary Card */}
            <div className="my-2.5 p-2.5 rounded-sm bg-slate-50 border border-slate-200 text-[11px] space-y-1.5">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Enrollment ID:</span>
                <span className="font-mono font-black text-[#FB0500] text-xs">{enrollmentSuccess.enrollmentId}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Student Name</span>
                  <span className="font-bold text-slate-900 truncate block">{enrollmentSuccess.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Contact Number</span>
                  <span className="font-semibold text-slate-900">{enrollmentSuccess.phone}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Selected Batch</span>
                  <span className="font-bold text-slate-900 truncate block">{enrollmentSuccess.batch.title}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Mode</span>
                  <span className="font-bold uppercase text-slate-900">{enrollmentSuccess.learningMode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Batch Start</span>
                  <span className="font-bold text-emerald-700">{enrollmentSuccess.batch.startDate}</span>
                </div>
              </div>

              {/* Online Payment ID Badge if paid */}
              {enrollmentSuccess.paymentId && (
                <div className="flex justify-between items-center bg-emerald-50 text-emerald-800 px-2 py-1 rounded-sm border border-emerald-200 text-[10px]">
                  <span className="font-bold uppercase">Razorpay Txn ID:</span>
                  <span className="font-mono font-bold truncate max-w-[170px]">{enrollmentSuccess.paymentId}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-1.5 border-t border-slate-200 font-bold">
                <span className="text-slate-700 text-[10px] uppercase">Payment Status:</span>
                <span className={enrollmentSuccess.paymentId ? "text-emerald-700 font-black text-xs" : "text-[#FB0500] font-black text-xs"}>
                  {enrollmentSuccess.paymentId
                    ? `✓ Paid Online ₹${enrollmentSuccess.payableNow.toLocaleString('en-IN')}`
                    : enrollmentSuccess.payableNow === 0
                    ? 'Free (Pay Balance at Center)'
                    : `₹${enrollmentSuccess.payableNow.toLocaleString('en-IN')} (Booking Request)`}
                </span>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-sm p-2 text-[10px] text-amber-900 space-y-0.5 mb-3">
              <strong className="block font-bold flex items-center gap-1 text-[10px]">
                <Clock size={11} /> Next Steps:
              </strong>
              <p className="text-amber-800 leading-tight">
                Our Senior Counselor will call at <strong>{enrollmentSuccess.phone}</strong> within 2 hours to confirm batch allotment and timetable.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href={`https://wa.me/919123456789?text=Hello%20Roots%20Classes,%20I%20have%20enrolled%20in%20${encodeURIComponent(enrollmentSuccess.batch.title)}%20with%20ID:%20${enrollmentSuccess.enrollmentId}.%20Please%20confirm%20my%20seat.`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare size={13} />
                <span>Message on WhatsApp</span>
              </a>

              <button
                onClick={() => {
                  setEnrollmentSuccess(null);
                  navigate('/');
                }}
                className="py-2 px-4 bg-[#FB0500] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-sm transition-colors"
              >
                Go to Home
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default BatchEnrollment;
