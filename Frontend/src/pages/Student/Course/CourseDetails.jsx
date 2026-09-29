import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useStudentStore from '../../../Store/studentstore';
import api from '../../../services/endpoints';
import {
  ArrowLeft, BookOpen, Clock, ChevronDown, ChevronRight,
  Play, FileText, Lock, Unlock, CheckCircle, X, CreditCard,
  GraduationCap, Users, Info, Download, Tag, Percent, Calendar, Mail, Phone, User
} from 'lucide-react';
import jsPDF from 'jspdf';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*[?&]v=([^&]+)/,
  ];
  let videoId = null;
  for (const p of patterns) {
    const m = url.match(p);
    if (m?.[1]) { videoId = m[1].split('?')[0].split('&')[0]; break; }
  }
  return videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0`
    : url;
};

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

// ─── PDF Download Function ────────────────────────────────────────────────────
const downloadNotesAsPDF = (topic) => {
  try {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210;
    const margin = 15;
    const contentW = pageW - margin * 2;
    let y = 20;

    const addText = (text, fontSize, bold = false, color = [30, 30, 30]) => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', bold ? 'bold' : 'normal');
      pdf.setTextColor(...color);
      const lines = pdf.splitTextToSize(String(text || ''), contentW);
      lines.forEach((line) => {
        if (y > 275) { pdf.addPage(); y = 20; }
        pdf.text(line, margin, y);
        y += fontSize * 0.45;
      });
    };

    pdf.setFillColor(37, 99, 235);
    pdf.rect(0, 0, 210, 28, 'F');
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('Course Notes', margin, 12);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, 20);
    y = 38;

    addText(topic.title, 15, true, [17, 24, 39]);
    y += 2;

    pdf.setDrawColor(229, 231, 235);
    pdf.line(margin, y, pageW - margin, y);
    y += 6;

    if (topic.description) {
      addText('Description', 10, true, [107, 114, 128]);
      y += 1;
      const descText = topic.description.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
      addText(descText, 10, false, [75, 85, 99]);
      y += 5;
    }

    addText('Notes', 11, true, [37, 99, 235]);
    y += 2;
    const notesText = topic.notes
      ? topic.notes.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim()
      : 'No notes available for this topic.';
    addText(notesText, 10, false, [55, 65, 81]);

    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(156, 163, 175);
      pdf.text(`Page ${i} of ${pageCount}`, pageW - margin, 290, { align: 'right' });
    }

    pdf.save(`${topic.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.pdf`);

    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;top:20px;right:16px;z-index:9999;padding:12px 18px;background:#22c55e;color:#fff;border-radius:10px;font-size:13px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,.15)';
    t.textContent = '✓ PDF Downloaded!';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);

  } catch (err) {
    console.error('PDF error:', err);
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;top:20px;right:16px;z-index:9999;padding:12px 18px;background:#ef4444;color:#fff;border-radius:10px;font-size:13px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,.15)';
    t.textContent = '✗ Failed to generate PDF';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }
};

// ─── Helper to get instructor object ─────────────────────────────────────────
const getInstructorDetails = (course) => {
  if (!course) return { name: 'Instructor Name Not Available', email: null, phone: null, role: null };
  if (course.instructor && course.instructor.fullName) {
    return {
      name: course.instructor.fullName,
      email: course.instructor.email,
      phone: course.instructor.phone,
      role: course.instructor.role || 'Instructor'
    };
  }
  if (course.instructorName && course.instructorName !== 'Instructor Name Not Available') {
    return { name: course.instructorName, email: null, phone: null, role: null };
  }
  return { name: 'Instructor Name Not Available', email: null, phone: null, role: null };
};

// ─── Component ────────────────────────────────────────────────────────────────
const CourseDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { student, setStudent } = useStudentStore();
  const studentId = student?._id;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [priceDetails, setPriceDetails] = useState(null);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [hasPreviousPurchase, setHasPreviousPurchase] = useState(false);
  const [scholarship, setScholarship] = useState(null);

  useEffect(() => {
    const initCourse = async () => {
      if (location.state?.course) {
        let courseData = location.state.course;
        if ((!courseData.instructor || !courseData.instructor.fullName) && courseData._id) {
          try {
            const res = await axios.post(api.fullcourse.getCourseById, { courseId: courseData._id });
            if (res.data?.success) {
              courseData = res.data.data;
            }
          } catch (e) { console.log("Error fetching full course details", e); }
        }
        setCourse(courseData);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    initCourse();
  }, [location.state]);

  useEffect(() => {
    if (studentId && course?._id) {
      checkEnrollment();
      fetchPriceDetails();
    } else if (!studentId) {
      setCheckingEnrollment(false);
    }
  }, [studentId, course]);

  // Clear scholarship card if student has already made a purchase (first purchase discount used)
  useEffect(() => {
    if (hasPreviousPurchase) {
      setScholarship(null);
    }
  }, [hasPreviousPurchase]);

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const checkEnrollment = async () => {
    setCheckingEnrollment(true);
    try {
      const res = await axios.get(`${api.student.getStudentProfile}/${studentId}`);
      if (res.data?.success) {
        const enrolled = res.data.data?.enrolledCourses?.includes(course._id);
        setIsEnrolled(!!enrolled);
      }
    } catch (error) {
      console.error("Error checking enrollment:", error);
    } finally {
      setCheckingEnrollment(false);
    }
  };

  const fetchPriceDetails = async () => {
    if (!course?._id || !studentId) return;
    setFetchingPrice(true);
    try {
      const response = await axios.post(api.payment.getPriceDetails, {
        courseId: course._id,
        studentId: studentId
      });

      if (response.data?.success) {
        const resData = response.data?.data || response.data;
        const discountApplied = resData.discountApplied || resData.discount || 0;
        const validFrom = resData.validFrom || resData.discountValidFrom || null;
        const validUntil = resData.validUntil || resData.discountValidUntil || null;

        setPriceDetails({
          originalPrice: resData.originalPrice || course.price || 0,
          finalPrice: resData.finalPrice || course.price || 0,
          discountApplied: discountApplied,
          hasScholarship: resData.hasScholarship || false,
          isFirstPurchase: resData.isFirstPurchase !== undefined ? resData.isFirstPurchase : true,
          message: resData.message || "No discount available",
          discountValidFrom: validFrom,
          discountValidUntil: validUntil
        });
        setHasPreviousPurchase(!resData.isFirstPurchase);
      } else {
        setPriceDetails({
          originalPrice: course.price || 0,
          finalPrice: course.price || 0,
          discountApplied: 0,
          hasScholarship: false,
          isFirstPurchase: true,
          message: "No discount available",
          discountValidFrom: null,
          discountValidUntil: null
        });
        setHasPreviousPurchase(false);
      }
    } catch (error) {
      console.error("Error fetching price details:", error);
      setPriceDetails({
        originalPrice: course.price || 0,
        finalPrice: course.price || 0,
        discountApplied: 0,
        hasScholarship: false,
        isFirstPurchase: true,
        message: "Failed to fetch price details",
        discountValidFrom: null,
        discountValidUntil: null
      });
      setHasPreviousPurchase(false);
    } finally {
      setFetchingPrice(false);
    }
  };

  const hasPaidContent = () =>
    course?.modules?.some(m => m.chapters?.some(c => c.topics?.some(t => t.isPreviewFree === false)));

  const hasPreviewContent = () =>
    course?.modules?.some(m => m.chapters?.some(c => c.topics?.some(t => t.isPreviewFree === true)));

  const isCompletelyFree = () => {
    const coursePrice = course?.price || 0;
    const finalPrice = priceDetails?.finalPrice ?? coursePrice;
    return (coursePrice === 0 || finalPrice === 0) && !hasPaidContent();
  };

  const isPaidCourse = () => {
    const finalPrice = priceDetails?.finalPrice ?? (course?.price || 0);
    return finalPrice > 0 || hasPaidContent();
  };

  const totalTopics = () =>
    course?.modules?.reduce((s, m) => s + (m.chapters?.reduce((cs, c) => cs + (c.topics?.length || 0), 0) || 0), 0) || 0;

  const freeTopics = () =>
    course?.modules?.reduce((s, m) => s + (m.chapters?.reduce((cs, c) => cs + c.topics?.filter(t => t.isPreviewFree).length, 0) || 0), 0) || 0;

  const paidTopics = () =>
    course?.modules?.reduce((s, m) => s + (m.chapters?.reduce((cs, c) => cs + c.topics?.filter(t => !t.isPreviewFree).length, 0) || 0), 0) || 0;

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const isDiscountActive = () => {
    if (!priceDetails?.discountApplied || priceDetails.discountApplied === 0) return false;
    const validFromStr = priceDetails.discountValidFrom;
    const validUntilStr = priceDetails.discountValidUntil;
    if (!validFromStr && !validUntilStr) return true;
    const todayUTC = new Date().toISOString().split('T')[0];
    if (validFromStr && validFromStr.split('T')[0] > todayUTC) return false;
    if (validUntilStr && validUntilStr.split('T')[0] < todayUTC) return false;
    return true;
  };

  const enrollmentInfo = () => {
    if (isEnrolled) return { action: 'Already Enrolled ✓', type: 'enrolled', disabled: true };
    if (isCompletelyFree()) return { action: 'Start Learning — Free', type: 'free', disabled: false };
    const finalPrice = priceDetails?.finalPrice ?? (course?.price || 0);
    if (isDiscountActive() && priceDetails?.discountApplied > 0 && !hasPreviousPurchase) {
      return {
        action: `Enroll Now — ₹${finalPrice.toLocaleString('en-IN')} (${priceDetails.discountApplied}% off)`,
        type: 'paid',
        disabled: false
      };
    }
    return { action: `Enroll Now — ₹${finalPrice.toLocaleString('en-IN')}`, type: 'paid', disabled: false };
  };

  const getDiscountMessage = () => {
    if (hasPreviousPurchase) {
      return {
        show: true,
        message: "ℹ️ You've already used your first-purchase scholarship. Regular price applies to all future courses.",
        type: "info"
      };
    }
    if (isDiscountActive() && priceDetails?.discountApplied > 0) {
      let message = `🎉 Welcome! You get ${priceDetails.discountApplied}% off on your first purchase! This is a one-time offer.`;
      if (priceDetails.discountValidFrom && priceDetails.discountValidUntil) {
        const fromDate = formatDate(priceDetails.discountValidFrom);
        const untilDate = formatDate(priceDetails.discountValidUntil);
        message += ` Valid from ${fromDate} to ${untilDate}.`;
      } else if (priceDetails.discountValidUntil) {
        const untilDate = formatDate(priceDetails.discountValidUntil);
        message += ` Valid until ${untilDate}.`;
      }
      return {
        show: true,
        message: message,
        type: "success"
      };
    }
    if (!priceDetails?.hasScholarship && !hasPreviousPurchase) {
      return {
        show: true,
        type: "info"
      };
    }
    return { show: false };
  };

  const processPayment = async () => {
    if (isEnrolled) {
      showToast('You are already enrolled in this course!', 'info');
      setShowPaymentModal(false);
      return;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      showToast('Payment gateway failed to load', 'error');
      return;
    }

    setPaymentProcessing(true);

    try {
      const { data } = await axios.post(api.payment.createPayment, {
        courseId: course._id,
        studentId
      });

      if (!data.success) throw new Error(data.message);

      const enrollmentId = data.enrollmentId;

      const options = {
        key: data.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TbpL4le4mBM46T',
        amount: data.order.amount,
        currency: data.order.currency,
        name: course.title,
        description: `Enrollment for ${course.title}`,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            showToast('Verifying payment...', 'info');

            const verifyPromise = axios.post(api.payment.verifyPayment, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              enrollmentId: enrollmentId,
            }, {
              timeout: 30000
            });

            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Verification timeout')), 30000)
            );

            const verifyResponse = await Promise.race([verifyPromise, timeoutPromise]);

            if (verifyResponse.data.success) {
              setIsEnrolled(true);
              // After successful purchase, mark that student has made a purchase (so discount card disappears)
              setHasPreviousPurchase(true);
              setScholarship(null); // explicitly remove any scholarship banner
              // Refresh price details to reflect updated first-purchase status
              await fetchPriceDetails();
              showToast('Payment successful! 🎉', 'success');
              setShowPaymentModal(false);
              setPaymentProcessing(false);
              setTimeout(() => {
                navigate("/purchescourse");
              }, 1500);
            } else {
              throw new Error(verifyResponse.data.message || 'Payment verification failed');
            }
          } catch (err) {
            console.error("Verification error:", err);
            showToast(err.message || 'Payment verification failed. Contact support.', 'error');
            setPaymentProcessing(false);
            setShowPaymentModal(false);
          }
        },
        prefill: {
          name: student?.fullName || student?.name || '',
          email: student?.email || '',
          contact: student?.phone || ''
        },
        theme: { color: '#2563EB' },
        modal: {
          ondismiss: () => {
            setPaymentProcessing(false);
            setShowPaymentModal(false);
            showToast('Payment cancelled', 'info');
          }
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response) => {
        console.error("Payment failed:", response);
        showToast(response.error?.description || 'Payment failed. Please try again.', 'error');
        setPaymentProcessing(false);
        setShowPaymentModal(false);
      });
      razorpay.open();

    } catch (err) {
      console.error("Payment error:", err);
      showToast(err.response?.data?.message || 'Payment failed. Try again.', 'error');
      setPaymentProcessing(false);
    }
  };

  const handleSchollerShip = async () => {
    if (!studentId) return;
    // Only fetch scholarship if student has not made any previous purchase
    if (hasPreviousPurchase) {
      setScholarship(null);
      return;
    }
    try {
      const response = await axios.post(api.scholarship.getSchollership, {
        studentId: studentId
      });
      if (response.data?.success && response.data?.data) {
        setScholarship(response.data.data);
      }
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleSchollerShip();
  }, [studentId, hasPreviousPurchase]);

  const handlePayment = async () => {
    if (isEnrolled) {
      showToast('You are already enrolled in this course!', 'info');
      setShowPaymentModal(false);
      return;
    }
    setShowPaymentModal(false);
    await processPayment();
  };

  const handleEnrollClick = () => {
    if (!studentId) {
      showToast('Please log in to enroll', 'error');
      return;
    }
    if (isEnrolled) {
      showToast('You are already enrolled in this course!', 'info');
      return;
    }
    if (isCompletelyFree()) {
      // navigate(`/course-content/${course._id}`, { state: { course } }); // Uncomment when course-content page is ready
    } else if (isPaidCourse()) {
      setShowPaymentModal(true);
    }
  };

  const playVideo = (topic) => {
    const hasAccess = isEnrolled || topic.isPreviewFree || isCompletelyFree();
    if (!hasAccess) return showToast('Enroll to access this lesson', 'error');
    if (!topic.videoUrl) return showToast('No video available for this lesson', 'error');
    const isYT = topic.videoUrl.includes('youtube.com') || topic.videoUrl.includes('youtu.be');
    setCurrentVideo({
      url: isYT ? getYouTubeEmbedUrl(topic.videoUrl) : topic.videoUrl,
      title: topic.title,
      type: isYT ? 'youtube' : 'upload',
    });
    setShowVideoPlayer(true);
  };

  const openNotes = (topic) => {
    const hasAccess = isEnrolled || topic.isPreviewFree || isCompletelyFree();
    if (!hasAccess) return showToast('Enroll to access notes', 'error');
    const a = document.createElement('a');
    a.href = topic.notesUrl;
    a.download = `${(topic.title || 'notes').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes`;
    a.target = '_self';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadNotesPDF = async (topic) => {
    const hasAccess = isEnrolled || topic.isPreviewFree || isCompletelyFree();
    if (!hasAccess) return showToast('Enroll to access notes', 'error');

    if (!topic.notes && !topic.notesUrl) {
      return showToast('No notes available for download', 'error');
    }

    if (topic.notesUrl) {
      try {
        const toastEl = document.createElement('div');
        toastEl.style.cssText = 'position:fixed;top:20px;right:16px;z-index:9999;padding:12px 18px;background:#3b82f6;color:#fff;border-radius:10px;font-size:13px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,.15)';
        toastEl.textContent = '⏳ Downloading...';
        document.body.appendChild(toastEl);

        const response = await fetch(topic.notesUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const contentType = response.headers.get('content-type') || '';
        let ext = 'pdf';
        if (contentType.includes('word') || topic.notesUrl.includes('.doc')) ext = 'docx';
        else if (contentType.includes('png')) ext = 'png';
        else if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = 'jpg';
        else if (topic.notesUrl.match(/\.(\w+)(\?|$)/)) {
          ext = topic.notesUrl.match(/\.(\w+)(\?|$)/)[1];
        }

        const a = document.createElement('a');
        a.href = url;
        a.download = `${(topic.title || 'notes').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toastEl.remove();

        const success = document.createElement('div');
        success.style.cssText = 'position:fixed;top:20px;right:16px;z-index:9999;padding:12px 18px;background:#22c55e;color:#fff;border-radius:10px;font-size:13px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,.15)';
        success.textContent = '✓ Notes Downloaded!';
        document.body.appendChild(success);
        setTimeout(() => success.remove(), 3000);

        return;
      } catch (error) {
        console.error('Error fetching notes:', error);
        return showToast('Failed to download notes', 'error');
      }
    }

    downloadNotesAsPDF(topic);
  };

  const openTopicInfo = (topic) => {
    const hasAccess = isEnrolled || topic.isPreviewFree || isCompletelyFree();
    if (!hasAccess) return showToast('Enroll to access topic information', 'error');
    navigate(`/topicinfo/${topic._id}`, {
      state: {
        topic,
        courseId: course._id,
        courseTitle: course.title,
        isEnrolled
      }
    });
  };

  const toggleModule = (idx) => setExpandedModules(p => ({ ...p, [idx]: !p[idx] }));
  const toggleChapter = (mIdx, cIdx) => {
    const k = `${mIdx}-${cIdx}`;
    setExpandedChapters(p => ({ ...p, [k]: !p[k] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-10 rounded-sm border border-gray-100 shadow max-w-sm">
          <BookOpen size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="font-semibold text-gray-800 mb-4">Course not found</p>
          <button onClick={() => navigate('/course')} className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
            <ArrowLeft size={14} /> Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const info = enrollmentInfo();
  const tt = totalTopics();
  const ft = freeTopics();
  const pt = paidTopics();
  const originalPrice = priceDetails?.originalPrice ?? course.price ?? 0;
  const finalPrice = priceDetails?.finalPrice ?? course.price ?? 0;
  const discountApplied = priceDetails?.discountApplied ?? 0;
  const discountActive = isDiscountActive();
  const discountValidFrom = priceDetails?.discountValidFrom ? formatDate(priceDetails.discountValidFrom) : null;
  const discountValidUntil = priceDetails?.discountValidUntil ? formatDate(priceDetails.discountValidUntil) : null;
  const discountMessage = getDiscountMessage();
  const showDiscountBlock = !hasPreviousPurchase && discountActive && discountApplied > 0;

  // Get instructor details
  const instructor = getInstructorDetails(course);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-5 right-4 z-[9999] px-5 py-3 rounded-sm shadow-lg text-sm font-medium text-white flex items-center gap-2 transition-all ${toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
          }`}>
          {toast.type === 'success' && <CheckCircle size={15} />}
          {toast.type === 'error' && <X size={15} />}
          {toast.message}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 md:pt-25 pb-8 px-4 bg-black/40 overflow-y-auto" onClick={() => !paymentProcessing && setShowPaymentModal(false)}>
          <div className="w-full max-w-sm bg-white rounded-sm shadow-xl overflow-hidden mt-1" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Complete Enrollment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-1 hover:bg-gray-100 rounded-sm">
                <X size={16} className="text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center mb-5">
                <p className="text-sm text-gray-500 mb-1">{course.title}</p>

                {hasPreviousPurchase ? (
                  <div>
                    <p className="text-3xl font-bold text-gray-900">₹{finalPrice.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-400 mt-1">Regular price</p>
                  </div>
                ) : showDiscountBlock ? (
                  <div className="mb-2">
                    <p className="text-sm text-gray-400 line-through">₹{originalPrice.toLocaleString('en-IN')}</p>
                    <p className="text-3xl font-bold text-gray-900">₹{finalPrice.toLocaleString('en-IN')}</p>
                    <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-green-100 rounded-sm">
                      <Percent size={12} className="text-green-600" />
                      <span className="text-xs font-semibold text-green-700">{discountApplied}% First Purchase Discount!</span>
                    </div>
                    {(discountValidFrom || discountValidUntil) && (
                      <div className="mt-2 flex items-center justify-center gap-1 text-xs text-gray-500">
                        <Calendar size={12} />
                        {discountValidFrom && discountValidUntil ? (
                          <span>Valid: {discountValidFrom} - {discountValidUntil}</span>
                        ) : discountValidUntil ? (
                          <span>Valid until: {discountValidUntil}</span>
                        ) : discountValidFrom ? (
                          <span>Valid from: {discountValidFrom}</span>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">₹{finalPrice.toLocaleString('en-IN')}</p>
                )}

                <p className="text-xs text-gray-500 mt-2">✓ Receipt will be sent to your email</p>
              </div>

              <div className="bg-gray-50 rounded-sm p-4 mb-5 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Total lessons</span>
                  <span className="font-medium text-gray-900">{tt}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Free preview</span>
                  <span className="font-medium text-green-600">{ft} lessons</span>
                </div>
                {pt > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Premium lessons</span>
                    <span className="font-medium text-blue-600">{pt}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-sm mb-5">
                <CreditCard size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Razorpay — Secure Payment</span>
              </div>

              <button
                onClick={handlePayment}
                disabled={paymentProcessing}
                className="w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-sm hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {paymentProcessing ? 'Processing...' : `Pay ₹${finalPrice.toLocaleString('en-IN')} & Enroll`}
              </button>

              <button
                onClick={() => setShowPaymentModal(false)}
                disabled={paymentProcessing}
                className="w-full mt-2 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                After payment, you'll receive a receipt via email
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Back button */}
        <button onClick={() => navigate('/course')} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-5 transition-colors">
          <ArrowLeft size={14} /> Back to Courses
        </button>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* LEFT COLUMN */}
          <div className="flex-1 min-w-0">
            {/* Scholarship Banner - only shown if no previous purchase, not enrolled, course has price, and scholarship exists */}
            {scholarship && !hasPreviousPurchase && !isEnrolled && course?.price > 0 && !isCompletelyFree() && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-sm p-5 mb-5 flex items-start gap-4">
                <div className="bg-blue-100 p-2.5 rounded-sm flex-shrink-0 mt-0.5">
                  <Tag size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    Special Scholarship Available!
                    <span className="bg-blue-600 text-white text-xs px-2.5 py-0.5 rounded-sm font-semibold shadow-sm">
                      {scholarship.discount}% OFF
                    </span>
                  </h3>
                  <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                    You have a special scholarship discount of <span className="font-semibold text-gray-800">{scholarship.discount}%</span> on this course.
                    Enroll now to claim your discount!
                  </p>
                  {(scholarship.validFrom || scholarship.validUntil) && (
                    <div className="flex items-center gap-1.5 mt-2.5 text-xs text-gray-500 font-medium bg-white/60 w-fit px-3 py-1.5 rounded-sm border border-blue-50">
                      <Calendar size={13} className="text-blue-500" />
                      {scholarship.validFrom && scholarship.validUntil ? (
                        <span>Valid from {formatDate(scholarship.validFrom)} to {formatDate(scholarship.validUntil)}</span>
                      ) : scholarship.validUntil ? (
                        <span>Valid until {formatDate(scholarship.validUntil)}</span>
                      ) : (
                        <span>Valid from {formatDate(scholarship.validFrom)}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Course header */}
            <div className="bg-white rounded-sm border border-gray-100 p-6 mb-5">
              <div className="flex flex-wrap gap-2 mb-3">
                {course.category?.name && (
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-sm">{course.category.name}</span>
                )}
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-sm capitalize">{course.level || 'Beginner'}</span>
                {isEnrolled && <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-sm flex items-center gap-1"><CheckCircle size={11} /> Enrolled</span>}
                {!isEnrolled && isCompletelyFree() && <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-sm">Free</span>}
                {!isEnrolled && !isCompletelyFree() && hasPreviewContent() && <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-sm">Free Preview Available</span>}
                {showDiscountBlock && !isEnrolled && (
                  <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-sm flex items-center gap-1">
                    <Percent size={11} /> {discountApplied}% First Purchase Discount
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">{course.title}</h1>
              {course.description && (
                <div className="text-gray-600 text-sm leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: course.description }} />
              )}
              <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <BookOpen size={15} className="text-blue-500" />
                  {course.modules?.length || 0} Modules
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Play size={15} className="text-purple-500" />
                  {tt} Lessons
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-sm mb-5 w-fit">
              {['overview', 'curriculum'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 text-sm font-medium rounded-sm transition-colors capitalize ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="bg-white rounded-sm border border-gray-100 p-5">
                  <h2 className="text-base font-bold text-gray-900 mb-3">About this course</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{course.description || 'No description available.'}</p>
                </div>

                {course.whatYouWillLearn?.length > 0 && (
                  <div className="bg-white rounded-sm border border-gray-100 p-5">
                    <h2 className="text-base font-bold text-gray-900 mb-3">What you'll learn</h2>
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {course.whatYouWillLearn.map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle size={15} className="text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {course.requirements?.length > 0 && (
                  <div className="bg-white rounded-sm border border-gray-100 p-5">
                    <h2 className="text-base font-bold text-gray-900 mb-3">Requirements</h2>
                    <ul className="space-y-2">
                      {course.requirements.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-sm bg-gray-400 flex-shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Curriculum Tab */}
            {activeTab === 'curriculum' && (
              <div className="bg-white rounded-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="text-base font-bold text-gray-900">Course Curriculum</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {course.modules?.length || 0} modules · {tt} lessons · {ft} free previews
                  </p>
                </div>

                {course.modules?.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {course.modules.map((mod, mIdx) => (
                      <div key={mod._id || mIdx}>
                        <button
                          onClick={() => toggleModule(mIdx)}
                          className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            {expandedModules[mIdx] ? <ChevronDown size={15} className="text-gray-400" /> : <ChevronRight size={15} className="text-gray-400" />}
                            <div>
                              <p className="text-sm font-semibold text-gray-900">Module {mIdx + 1}: {mod.title}</p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-4">
                            {mod.chapters?.reduce((s, c) => s + (c.topics?.length || 0), 0)} lessons
                          </span>
                        </button>

                        {expandedModules[mIdx] && (
                          <div className="bg-gray-50 border-t border-gray-100">
                            {mod.chapters?.map((ch, cIdx) => (
                              <div key={ch._id || cIdx} className="border-b border-gray-100 last:border-0">
                                <button
                                  onClick={() => toggleChapter(mIdx, cIdx)}
                                  className="w-full flex items-center justify-between pl-10 pr-5 py-3 hover:bg-gray-100 transition-colors text-left"
                                >
                                  <div className="flex items-center gap-2">
                                    {expandedChapters[`${mIdx}-${cIdx}`] ? <ChevronDown size={13} className="text-gray-400" /> : <ChevronRight size={13} className="text-gray-400" />}
                                    <span className="text-sm text-gray-700 font-medium">{ch.title}</span>
                                  </div>
                                  <span className="text-xs text-gray-400 ml-4">{ch.topics?.length || 0} lessons</span>
                                </button>

                                {expandedChapters[`${mIdx}-${cIdx}`] && (
                                  <div className="pb-2 space-y-1">
                                    {ch.topics?.map((topic, tIdx) => {
                                      const hasAccess = isEnrolled || topic.isPreviewFree || isCompletelyFree();
                                      return (
                                        <div key={topic._id || tIdx} className="mx-4 rounded-sm bg-white border border-gray-100 overflow-hidden">
                                          <div className="flex items-center justify-between px-4 py-3 gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                              <div className={`w-7 h-7 rounded-sm flex items-center justify-center flex-shrink-0 ${hasAccess ? 'bg-green-50' : 'bg-gray-100'}`}>
                                                {hasAccess ? <Play size={13} className="text-green-600 ml-0.5" /> : <Lock size={12} className="text-gray-400" />}
                                              </div>
                                              <div className="min-w-0">
                                                <p className="text-sm text-gray-800 truncate">{tIdx + 1}. {topic.title}</p>
                                                <div className="flex gap-1.5 mt-0.5">
                                                  {(isEnrolled || (isCompletelyFree() && !isEnrolled)) && (
                                                    <span className="text-xs text-blue-600">Full access</span>
                                                  )}
                                                  {!isEnrolled && !isCompletelyFree() && topic.isPreviewFree && (
                                                    <span className="text-xs text-green-600">Free preview</span>
                                                  )}
                                                  {!isEnrolled && !isCompletelyFree() && !topic.isPreviewFree && (
                                                    <span className="text-xs text-gray-400">Premium</span>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                              {topic.videoUrl && (
                                                <button
                                                  onClick={() => playVideo(topic)}
                                                  disabled={!hasAccess}
                                                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-sm text-xs font-medium transition-colors ${hasAccess
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                >
                                                  <Play size={11} /> Watch
                                                </button>
                                              )}

                                              {topic.description && (
                                                <button
                                                  onClick={() => openTopicInfo(topic)}
                                                  className="px-2.5 py-1.5 rounded-sm text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-1"
                                                >
                                                  <Info size={11} /> Info
                                                </button>
                                              )}

                                              {(topic.notes || topic.notesUrl) && (
                                                <button
                                                  onClick={() => handleDownloadNotesPDF(topic)}
                                                  disabled={!hasAccess}
                                                  className={`px-2.5 py-1.5 rounded-sm text-xs font-medium transition-colors flex items-center gap-1 ${hasAccess
                                                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                >
                                                  <Download size={11} /> Notes
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 text-center">
                    <BookOpen size={36} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-sm text-gray-400">No content added yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - Enrollment card + Instructor Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0 space-y-5">
            {/* Enrollment Card */}
            <div className="bg-white rounded-sm border border-gray-100 overflow-hidden shadow-sm">
              {checkingEnrollment ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-sm animate-spin mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Checking enrollment...</p>
                </div>
              ) : isEnrolled ? (
                <div className="p-6 text-center">
                  <div className="w-14 h-14 bg-green-100 rounded-sm flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={26} className="text-green-600" />
                  </div>
                  <p className="font-bold text-gray-900 mb-1">Already Enrolled!</p>
                  <p className="text-xs text-gray-500 mb-4">You have full access to this course</p>
                  <div className="mb-4 py-2 border-y border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Course Price</p>
                    <p className="text-lg font-bold text-gray-700">₹{(course?.price || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/course-content/${course._id}`, { state: { course } })}
                    className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-sm hover:bg-blue-700 transition-colors"
                  >
                    Continue Learning
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-5 text-center border-b border-gray-100">
                    {fetchingPrice ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded-sm w-24 mx-auto mb-2"></div>
                        <div className="h-3 bg-gray-100 rounded-sm w-32 mx-auto"></div>
                      </div>
                    ) : (
                      <>
                        {hasPreviousPurchase ? (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Regular Price</p>
                            <p className="text-3xl font-bold text-gray-900">₹{finalPrice.toLocaleString('en-IN')}</p>
                            <p className="text-xs text-gray-400 mt-2">Standard pricing applies</p>
                          </div>
                        ) : showDiscountBlock ? (
                          <div>
                            <p className="text-sm text-gray-400 line-through">₹{originalPrice.toLocaleString('en-IN')}</p>
                            <p className="text-3xl font-bold text-gray-900">₹{finalPrice.toLocaleString('en-IN')}</p>
                            <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-green-100 rounded-sm">
                              <Percent size={12} className="text-green-600" />
                              <span className="text-xs font-semibold text-green-700">{discountApplied}% First Purchase Discount!</span>
                            </div>
                            {(discountValidFrom || discountValidUntil) && (
                              <div className="mt-3 pt-2 border-t border-gray-100">
                                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                                  <Calendar size={12} />
                                  {discountValidFrom && discountValidUntil ? (
                                    <span>Valid: {discountValidFrom} - {discountValidUntil}</span>
                                  ) : discountValidUntil ? (
                                    <span>Valid until: {discountValidUntil}</span>
                                  ) : discountValidFrom ? (
                                    <span>Valid from: {discountValidFrom}</span>
                                  ) : null}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : isCompletelyFree() ? (
                          <p className="text-3xl font-bold text-green-600">Free</p>
                        ) : (
                          <>
                            <p className="text-3xl font-bold text-gray-900">₹{finalPrice.toLocaleString('en-IN')}</p>
                            {!isCompletelyFree() && <p className="text-xs text-gray-400 mt-1">One-time payment · Full access</p>}
                          </>
                        )}
                      </>
                    )}
                  </div>
                  <div className="p-5 space-y-4">
                    <button
                      onClick={handleEnrollClick}
                      disabled={enrollmentLoading || paymentProcessing || fetchingPrice || info.disabled}
                      className={`w-full py-3 text-sm font-semibold rounded-sm transition-colors ${info.disabled
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                        } disabled:opacity-60`}
                    >
                      {enrollmentLoading || paymentProcessing || fetchingPrice ? 'Processing...' : info.action}
                    </button>
                    <div className="space-y-2.5 text-sm text-gray-600">
                      <div className="flex items-center gap-2"><BookOpen size={14} className="text-blue-500" /> {course.modules?.length || 0} modules</div>
                      <div className="flex items-center gap-2"><Play size={14} className="text-blue-500" /> {tt} lessons total</div>
                      {ft > 0 && <div className="flex items-center gap-2"><Unlock size={14} className="text-green-500" /> {ft} free previews</div>}
                      {pt > 0 && !isCompletelyFree() && <div className="flex items-center gap-2"><Lock size={14} className="text-gray-400" /> {pt} premium lessons</div>}
                    </div>
                    <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-100">
                      <p>✓ Receipt will be sent to your email</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* INSTRUCTOR CARD - Now in sidebar */}
            <div className="bg-white rounded-sm border border-gray-100 p-5 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User size={18} className="text-blue-500" />
                Meet your instructor
              </h3>
              <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                    {instructor.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="font-semibold text-gray-800">{instructor.name}</div>
                  {instructor.role && (
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-gray-500">
                      <GraduationCap size={12} />
                      <span className="capitalize">{instructor.role}</span>
                    </div>
                  )}
                  {instructor.email && (
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs">
                      <Mail size={12} className="text-gray-400" />
                      <a href={`mailto:${instructor.email}`} className="text-blue-600 hover:underline break-all">{instructor.email}</a>
                    </div>
                  )}
                  {instructor.phone && (
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-gray-600">
                      <Phone size={12} className="text-gray-400" />
                      <a href={`tel:${instructor.phone}`}>{instructor.phone}</a>
                    </div>
                  )}
                  {!instructor.email && !instructor.phone && !instructor.role && (
                    <p className="text-xs text-gray-400">Contact details not available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {showVideoPlayer && currentVideo && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => { setShowVideoPlayer(false); setCurrentVideo(null); }}
        >
          <div className="w-full max-w-4xl bg-black rounded-sm overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 bg-gray-900">
              <p className="text-sm font-medium text-white truncate">{currentVideo.title}</p>
              <button
                onClick={() => { setShowVideoPlayer(false); setCurrentVideo(null); }}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-sm transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            {currentVideo.type === 'youtube' ? (
              <iframe
                className="w-full aspect-video"
                src={currentVideo.url}
                title={currentVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video key={currentVideo.url} controls autoPlay className="w-full max-h-[75vh]">
                <source src={currentVideo.url} type="video/mp4" />
              </video>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
