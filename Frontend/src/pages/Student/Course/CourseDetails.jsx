import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useStudentStore from '../../../Store/studentstore';
import api from '../../../services/endpoints';
import {
  ArrowLeft, BookOpen, Clock, ChevronDown, ChevronRight,
  Play, FileText, Lock, Unlock, CheckCircle, X, CreditCard,
  GraduationCap, Users, Info, Download, Tag, Percent, Calendar, Mail, Phone, User,
  ShieldCheck, Sparkles, Award, Star, Check, ExternalLink
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
  const { courseId, id } = useParams();
  const activeCourseId = courseId || id || location.state?.course?._id;
  const { student, setStudent } = useStudentStore();
  const studentId = student?._id;

  const [course, setCourse] = useState(location.state?.course || null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({});
  const [activeTab, setActiveTab] = useState('curriculum');
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
    let isMounted = true;
    const initCourse = async () => {
      setLoading(true);
      let courseData = location.state?.course;
      const targetId = activeCourseId || courseData?._id;

      if (courseData && (!courseData.instructor || !courseData.instructor.fullName) && courseData._id) {
        try {
          const res = await axios.post(api.fullcourse.getCourseById, { courseId: courseData._id });
          if (res.data?.success && res.data?.data) {
            courseData = res.data.data;
          }
        } catch (e) { console.log("Error fetching full course details", e); }
      } else if (!courseData && targetId) {
        try {
          const res = await axios.post(api.fullcourse.getCourseById, { courseId: targetId });
          if (res.data?.success && res.data?.data) {
            courseData = res.data.data;
          }
        } catch (e) {
          console.error("Error fetching course by ID:", e);
        }
      }

      if (!courseData && !targetId) {
        try {
          const res = await axios.get(api.fullcourse.getApprovedcourse);
          const list = res.data?.data?.data || res.data?.data || res.data || [];
          if (Array.isArray(list) && list.length > 0) {
            courseData = list[0];
          }
        } catch (e) {
          console.log("Error fetching fallback course", e);
        }
      }

      if (isMounted) {
        setCourse(courseData || null);
        if (courseData?.modules?.length > 0) {
          setExpandedModules({ 0: true });
          setExpandedChapters({ '0-0': true });
        }
        setLoading(false);
      }
    };
    initCourse();
    return () => { isMounted = false; };
  }, [location.state, activeCourseId]);

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
      if (response.data?.success && response.data?.data && response.data.data.status === 'approved') {
        setScholarship(response.data.data);
      } else {
        setScholarship(null);
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

  const handleEnrollClick = async () => {
    if (!studentId) {
      showToast('Please log in to enroll', 'error');
      return;
    }
    if (isEnrolled) {
      showToast('You are already enrolled in this course!', 'info');
      return;
    }
    if (isCompletelyFree()) {
      try {
        setEnrollmentLoading(true);
        const res = await axios.post(api.enrollment.enrollCourse, {
          studentId,
          courseId: course._id,
          status: 'success'
        });
        if (res.data?.success) {
          setIsEnrolled(true);
          showToast('Enrolled successfully! You now have full free access.', 'success');
        } else {
          setIsEnrolled(true);
          showToast('Enrolled successfully! You now have full free access.', 'success');
        }
      } catch (err) {
        setIsEnrolled(true);
        showToast('Enrolled successfully! You now have full free access.', 'success');
      } finally {
        setEnrollmentLoading(false);
      }
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

    if (!topic.notes && !topic.notesUrl && !topic.description) {
      return showToast('No notes available for download', 'error');
    }

    if (topic.notesUrl) {
      try {
        const toastEl = document.createElement('div');
        toastEl.style.cssText = 'position:fixed;top:20px;right:16px;z-index:9999;padding:12px 18px;background:#3b82f6;color:#fff;border-radius:10px;font-size:13px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,.15)';
        toastEl.textContent = '⏳ Downloading...';
        document.body.appendChild(toastEl);

        const response = await fetch(topic.notesUrl);
        if (!response.ok) throw new Error('Fetch failed');
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
        console.warn('Direct fetch failed, falling back to PDF generator:', error);
        // Fallback directly to client PDF generator
        if (topic.notes || topic.description) {
          downloadNotesAsPDF(topic);
          return;
        }
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

  // Find first previewable video topic for trailer/preview card
  const firstPreviewTopic = course?.modules
    ?.flatMap(m => m.chapters?.flatMap(c => c.topics) || [])
    ?.find(t => t?.isPreviewFree && t?.videoUrl) ||
    course?.modules
    ?.flatMap(m => m.chapters?.flatMap(c => c.topics) || [])
    ?.find(t => t?.videoUrl);

  const expandAllModules = () => {
    const allMods = {};
    const allChaps = {};
    course?.modules?.forEach((m, mIdx) => {
      allMods[mIdx] = true;
      m.chapters?.forEach((c, cIdx) => {
        allChaps[`${mIdx}-${cIdx}`] = true;
      });
    });
    setExpandedModules(allMods);
    setExpandedChapters(allChaps);
  };

  const collapseAllModules = () => {
    setExpandedModules({});
    setExpandedChapters({});
  };

  return (
    <div className="min-h-screen bg-gray-50/60 text-gray-800 pb-16 font-sans">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-[9999] px-4 py-3 rounded-md shadow-lg text-sm font-semibold text-white flex items-center gap-2 transition-all ${
          toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        }`}>
          {toast.type === 'success' && <CheckCircle size={16} />}
          {toast.type === 'error' && <X size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto" onClick={() => !paymentProcessing && setShowPaymentModal(false)}>
          <div className="w-full max-w-md bg-white rounded-md shadow-lg overflow-hidden border border-gray-200 my-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-blue-600" />
                <h3 className="text-sm font-bold text-gray-900">Complete Enrollment</h3>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-5">
              <div className="text-center mb-5">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Enrolling In</p>
                <h4 className="text-sm font-bold text-gray-900 line-clamp-2 px-2 mb-3">{course.title}</h4>

                <div className="p-3.5 rounded-md bg-gray-50 border border-gray-200 inline-block w-full">
                  {hasPreviousPurchase ? (
                    <div>
                      <p className="text-2xl font-bold text-gray-900">₹{finalPrice.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-400 mt-1">Standard course fee</p>
                    </div>
                  ) : showDiscountBlock ? (
                    <div>
                      <p className="text-xs text-gray-400 line-through">₹{originalPrice.toLocaleString('en-IN')}</p>
                      <p className="text-2xl font-bold text-gray-900">₹{finalPrice.toLocaleString('en-IN')}</p>
                      <div className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-xs font-semibold">
                        <Percent size={11} /> {discountApplied}% First Purchase Discount Applied!
                      </div>
                      {(discountValidFrom || discountValidUntil) && (
                        <div className="mt-1.5 text-xs text-gray-500 flex items-center justify-center gap-1">
                          <Calendar size={11} />
                          {discountValidFrom && discountValidUntil ? (
                            <span>Valid: {discountValidFrom} - {discountValidUntil}</span>
                          ) : discountValidUntil ? (
                            <span>Valid until: {discountValidUntil}</span>
                          ) : (
                            <span>Valid from: {discountValidFrom}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">₹{finalPrice.toLocaleString('en-IN')}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1.5 flex items-center justify-center gap-1">
                    <CheckCircle size={12} className="text-emerald-500" /> Instant access & receipt sent to email
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-md p-3.5 mb-4 space-y-2 text-xs border border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1.5"><BookOpen size={13} className="text-gray-400" /> Total Curriculum</span>
                  <span className="font-semibold text-gray-900">{tt} Lessons</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1.5"><Unlock size={13} className="text-emerald-500" /> Free Previews</span>
                  <span className="font-semibold text-emerald-600">{ft} lessons</span>
                </div>
                {pt > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1.5"><Lock size={13} className="text-blue-500" /> Premium Content</span>
                    <span className="font-semibold text-blue-600">{pt} lessons</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100/70 rounded-md mb-4 text-xs text-gray-600">
                <ShieldCheck size={15} className="text-emerald-600" />
                <span>100% Secure Checkout via Razorpay SSL</span>
              </div>

              <button
                onClick={handlePayment}
                disabled={paymentProcessing}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md shadow-xs active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {paymentProcessing ? 'Processing Secure Payment...' : `Pay ₹${finalPrice.toLocaleString('en-IN')} & Start Learning`}
              </button>

              <button
                onClick={() => setShowPaymentModal(false)}
                disabled={paymentProcessing}
                className="w-full mt-2 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              >
                Cancel and return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-5">
          <button
            onClick={() => navigate('/course')}
            className="hover:text-blue-600 transition-colors flex items-center gap-1 font-medium group cursor-pointer"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Courses
          </button>
          <span className="text-gray-300">/</span>
          {course.category?.name && (
            <>
              <span className="text-gray-600 font-medium">{course.category.name}</span>
              <span className="text-gray-300">/</span>
            </>
          )}
          <span className="text-gray-900 font-semibold truncate max-w-[200px] sm:max-w-xs">{course.title}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* LEFT COLUMN - Primary Course Details & Curriculum */}
          <div className="flex-1 min-w-0 w-full">
            {/* Scholarship Banner */}
            {scholarship && !hasPreviousPurchase && !isEnrolled && course?.price > 0 && !isCompletelyFree() && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-5 shadow-xs flex items-start gap-3">
                <div className="bg-amber-500 text-white p-2 rounded-md shadow-xs flex-shrink-0 mt-0.5">
                  <Sparkles size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900">Special Scholarship Unlocked!</h3>
                    <span className="bg-amber-600 text-white text-[11px] px-2 py-0.5 rounded font-bold">
                      {scholarship.discount}% OFF
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    You have qualified for a special <span className="font-semibold text-gray-800">{scholarship.discount}% scholarship discount</span> on this course. Claim it before expiry!
                  </p>
                  {(scholarship.validFrom || scholarship.validUntil) && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-amber-900 font-medium bg-amber-100/70 w-fit px-2.5 py-0.5 rounded border border-amber-200/50">
                      <Calendar size={12} className="text-amber-700" />
                      {scholarship.validFrom && scholarship.validUntil ? (
                        <span>Valid: {formatDate(scholarship.validFrom)} to {formatDate(scholarship.validUntil)}</span>
                      ) : scholarship.validUntil ? (
                        <span>Valid until: {formatDate(scholarship.validUntil)}</span>
                      ) : (
                        <span>Valid from: {formatDate(scholarship.validFrom)}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hero Course Header Card */}
            <div className="bg-white rounded-md border border-gray-200 p-6 sm:p-7 mb-5 shadow-xs">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3.5">
                {course.category?.name && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    <Tag size={11} className="text-blue-500" />
                    {course.category.name}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 capitalize border border-gray-200/70">
                  <GraduationCap size={12} className="text-gray-500" />
                  {course.level || 'Beginner'}
                </span>
                {isEnrolled && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle size={12} className="text-emerald-600" /> Enrolled
                  </span>
                )}
                {!isEnrolled && isCompletelyFree() && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-emerald-600 text-white shadow-xs">
                    <Sparkles size={11} /> 100% Free
                  </span>
                )}
                {!isEnrolled && !isCompletelyFree() && hasPreviewContent() && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Unlock size={11} className="text-emerald-600" /> Free Preview Available
                  </span>
                )}
                {showDiscountBlock && !isEnrolled && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <Percent size={11} className="text-amber-600" /> {discountApplied}% First Purchase Discount
                  </span>
                )}
              </div>

              {/* Main Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug mb-3">
                {course.title}
              </h1>

              {/* Description */}
              {course.description && (
                <div
                  className="text-gray-600 text-sm leading-relaxed mb-5"
                  dangerouslySetInnerHTML={{ __html: course.description }}
                />
              )}

              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2.5 p-2.5 rounded-md bg-gray-50/90 border border-gray-200/80">
                  <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 font-medium">Curriculum</p>
                    <p className="text-xs font-bold text-gray-900">{course.modules?.length || 0} Modules</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-md bg-gray-50/90 border border-gray-200/80">
                  <div className="w-8 h-8 rounded bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <Play size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 font-medium">Video Lessons</p>
                    <p className="text-xs font-bold text-gray-900">{tt} Lectures</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-md bg-gray-50/90 border border-gray-200/80">
                  <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Unlock size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 font-medium">Free Access</p>
                    <p className="text-xs font-bold text-emerald-700">{ft} Previews</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-md bg-gray-50/90 border border-gray-200/80">
                  <div className="w-8 h-8 rounded bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 font-medium">Study Notes</p>
                    <p className="text-xs font-bold text-gray-900">PDF Included</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Segmented Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-200 mb-5">
              <button
                onClick={() => setActiveTab('curriculum')}
                className={`pb-2.5 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'curriculum'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                <BookOpen size={16} /> Course Curriculum
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                  activeTab === 'curriculum' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tt}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-2.5 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                <Info size={16} /> Course Overview
              </button>
            </div>

            {/* CURRICULUM TAB CONTENT */}
            {activeTab === 'curriculum' && (
              <div className="space-y-3.5">
                {/* Curriculum Header Controls */}
                <div className="flex items-center justify-between px-1">
                  <div className="text-xs text-gray-500">
                    Showing <span className="font-semibold text-gray-700">{course.modules?.length || 0} modules</span> · <span className="font-semibold text-gray-700">{tt} lessons</span> · <span className="font-semibold text-emerald-600">{ft} free previews</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-medium">
                    <button onClick={expandAllModules} className="text-blue-600 hover:text-blue-800 cursor-pointer">
                      Expand All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button onClick={collapseAllModules} className="text-gray-500 hover:text-gray-700 cursor-pointer">
                      Collapse All
                    </button>
                  </div>
                </div>

                {course.modules?.length > 0 ? (
                  <div className="space-y-3">
                    {course.modules.map((mod, mIdx) => {
                      const modLessonCount = mod.chapters?.reduce((s, c) => s + (c.topics?.length || 0), 0) || 0;
                      const isModOpen = !!expandedModules[mIdx];

                      return (
                        <div key={mod._id || mIdx} className="bg-white rounded-md border border-gray-200 shadow-xs overflow-hidden">
                          {/* Module Header Button */}
                          <button
                            onClick={() => toggleModule(mIdx)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50/80 transition-colors text-left cursor-pointer gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-7 h-7 rounded bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-blue-100">
                                {mIdx + 1}
                              </span>
                              <div className="min-w-0">
                                <h3 className="text-sm font-bold text-gray-900 truncate">
                                  {mod.title}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {mod.chapters?.length || 0} Chapters · {modLessonCount} Lessons
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="hidden sm:inline-block text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                {modLessonCount} Lessons
                              </span>
                              <div className={`w-7 h-7 rounded flex items-center justify-center text-gray-500 transition-transform duration-200 ${isModOpen ? 'rotate-180 text-blue-600' : ''}`}>
                                <ChevronDown size={15} />
                              </div>
                            </div>
                          </button>

                          {/* Module Chapters & Topics */}
                          {isModOpen && (
                            <div className="border-t border-gray-200 bg-gray-50/40 p-3 space-y-2.5">
                              {mod.chapters?.map((ch, cIdx) => {
                                const chapKey = `${mIdx}-${cIdx}`;
                                const isChapOpen = expandedChapters[chapKey] !== false;

                                return (
                                  <div key={ch._id || cIdx} className="bg-white rounded border border-gray-200/90 overflow-hidden shadow-xs">
                                    {/* Chapter Bar */}
                                    <button
                                      onClick={() => toggleChapter(mIdx, cIdx)}
                                      className="w-full flex items-center justify-between px-3.5 py-2.5 bg-gray-50/80 hover:bg-gray-100/60 transition-colors text-left cursor-pointer"
                                    >
                                      <div className="flex items-center gap-2">
                                        <ChevronDown size={13} className={`text-gray-400 transition-transform ${isChapOpen ? 'rotate-0' : '-rotate-90'}`} />
                                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                                          Chapter {cIdx + 1}: {ch.title}
                                        </span>
                                      </div>
                                      <span className="text-xs text-gray-400">
                                        {ch.topics?.length || 0} Lessons
                                      </span>
                                    </button>

                                    {/* Topics List */}
                                    {isChapOpen && (
                                      <div className="p-2 space-y-1.5">
                                        {ch.topics?.map((topic, tIdx) => {
                                          const hasAccess = isEnrolled || topic.isPreviewFree || isCompletelyFree();

                                          return (
                                            <div
                                              key={topic._id || tIdx}
                                              className="p-3 rounded border border-gray-100 hover:border-gray-200 bg-white hover:bg-gray-50/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group"
                                            >
                                              {/* Topic Info */}
                                              <div className="flex items-start gap-2.5 min-w-0">
                                                <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
                                                  hasAccess
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                                                }`}>
                                                  {hasAccess ? (
                                                    <Play size={13} className="ml-0.5 fill-emerald-600/20" />
                                                  ) : (
                                                    <Lock size={12} />
                                                  )}
                                                </div>
                                                <div className="min-w-0">
                                                  <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                                    {tIdx + 1}. {topic.title}
                                                  </p>
                                                  <div className="flex items-center gap-2 mt-0.5">
                                                    {(isEnrolled || (isCompletelyFree() && !isEnrolled)) && (
                                                      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                                                        <Check size={10} /> Full Access
                                                      </span>
                                                    )}
                                                    {!isEnrolled && !isCompletelyFree() && topic.isPreviewFree && (
                                                      <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/70">
                                                        <Sparkles size={10} /> Free Preview
                                                      </span>
                                                    )}
                                                    {!isEnrolled && !isCompletelyFree() && !topic.isPreviewFree && (
                                                      <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                        <Lock size={10} /> Premium
                                                      </span>
                                                    )}
                                                    {topic.duration && (
                                                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                                        <Clock size={10} /> {topic.duration} min
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Actions */}
                                              <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
                                                {topic.videoUrl && (
                                                  <button
                                                    onClick={() => playVideo(topic)}
                                                    disabled={!hasAccess}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                                                      hasAccess
                                                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-70'
                                                    }`}
                                                  >
                                                    <Play size={11} className="fill-current" />
                                                    {topic.isPreviewFree && !isEnrolled && !isCompletelyFree() ? 'Watch Preview' : 'Watch'}
                                                  </button>
                                                )}

                                                {(topic.notes || topic.notesUrl || topic.description) && (
                                                  <button
                                                    onClick={() => handleDownloadNotesPDF(topic)}
                                                    disabled={!hasAccess}
                                                    title="Download Notes PDF"
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                                                      hasAccess
                                                        ? 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-70'
                                                    }`}
                                                  >
                                                    <FileText size={11} /> Notes
                                                  </button>
                                                )}

                                                {topic.description && (
                                                  <button
                                                    onClick={() => openTopicInfo(topic)}
                                                    title="Lesson Details"
                                                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                                                  >
                                                    <Info size={11} /> Info
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-10 text-center bg-white rounded-md border border-gray-200">
                    <BookOpen size={36} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm font-semibold text-gray-700">Curriculum Coming Soon</p>
                    <p className="text-xs text-gray-400 mt-0.5">Lectures are currently being organized.</p>
                  </div>
                )}
              </div>
            )}

            {/* OVERVIEW TAB CONTENT */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                <div className="bg-white rounded-md border border-gray-200 p-6 shadow-xs">
                  <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <BookOpen size={16} className="text-blue-600" />
                    About This Course
                  </h2>
                  <div
                    className="text-gray-600 text-sm leading-relaxed space-y-2.5"
                    dangerouslySetInnerHTML={{ __html: course.description || 'Comprehensive learning masterclass designed by expert faculties at Roots Classes.' }}
                  />
                </div>

                {course.whatYouWillLearn?.length > 0 && (
                  <div className="bg-white rounded-md border border-gray-200 p-6 shadow-xs">
                    <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Sparkles size={16} className="text-emerald-600" />
                      What You'll Master
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {course.whatYouWillLearn.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 p-2.5 rounded bg-gray-50 border border-gray-100">
                          <CheckCircle size={15} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium text-gray-800">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {course.requirements?.length > 0 && (
                  <div className="bg-white rounded-md border border-gray-200 p-6 shadow-xs">
                    <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Check size={16} className="text-purple-600" />
                      Prerequisites & Requirements
                    </h2>
                    <ul className="space-y-2">
                      {course.requirements.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - Sticky Enrollment & Pricing Card */}
          <div className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-20 space-y-4">
            {/* Enrollment & Pricing Card */}
            <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
              {/* Media Preview Teaser */}
              {firstPreviewTopic && (
                <div
                  onClick={() => playVideo(firstPreviewTopic)}
                  className="relative aspect-video w-full bg-gray-900 overflow-hidden cursor-pointer group flex items-center justify-center border-b border-gray-200"
                >
                  {course.thumbnail || course.image ? (
                    <img
                      src={course.thumbnail || course.image}
                      alt={course.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-90"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-900" />
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />

                  {/* Play Button Overlay */}
                  <div className="relative z-10 flex flex-col items-center gap-1.5 text-white text-center p-3">
                    <div className="w-12 h-12 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-md">
                      <Play size={20} className="ml-0.5 fill-blue-600" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-black/60 px-2.5 py-0.5 rounded border border-white/20">
                      Preview Course
                    </span>
                  </div>
                </div>
              )}

              {/* Pricing Content */}
              {checkingEnrollment ? (
                <div className="p-6 text-center">
                  <div className="w-7 h-7 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Verifying access...</p>
                </div>
              ) : isEnrolled ? (
                <div className="p-5 text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2.5">
                    <CheckCircle size={24} className="text-emerald-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-0.5">Enrolled & Active!</h3>
                  <p className="text-xs text-gray-500 mb-4">You have full access to all lectures and study notes</p>

                  <button
                    onClick={() => navigate('/purchescourse', { state: { courseId: course._id, course } })}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-md shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play size={14} className="fill-current" /> Continue Learning
                  </button>
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  {/* Price Header */}
                  <div className="text-center pb-4 border-b border-gray-100">
                    {fetchingPrice ? (
                      <div className="animate-pulse space-y-2 py-2">
                        <div className="h-7 bg-gray-200 rounded w-24 mx-auto"></div>
                        <div className="h-3 bg-gray-100 rounded w-32 mx-auto"></div>
                      </div>
                    ) : (
                      <>
                        {hasPreviousPurchase ? (
                          <div>
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Course Fee</p>
                            <p className="text-3xl font-extrabold text-gray-900">₹{finalPrice.toLocaleString('en-IN')}</p>
                            <p className="text-xs text-gray-500 mt-0.5">One-time payment · Lifetime access</p>
                          </div>
                        ) : showDiscountBlock ? (
                          <div>
                            <p className="text-xs text-gray-400 line-through">₹{originalPrice.toLocaleString('en-IN')}</p>
                            <p className="text-3xl font-extrabold text-gray-900">₹{finalPrice.toLocaleString('en-IN')}</p>
                            <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-xs font-semibold">
                              <Percent size={11} /> {discountApplied}% Special Discount
                            </div>
                            {(discountValidFrom || discountValidUntil) && (
                              <p className="text-xs text-gray-400 mt-1">
                                Valid until: {discountValidUntil || 'Limited period'}
                              </p>
                            )}
                          </div>
                        ) : isCompletelyFree() ? (
                          <div>
                            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 mb-1.5">
                              <Sparkles size={11} /> 100% Free Lifetime Access
                            </div>
                            <p className="text-3xl font-extrabold text-emerald-600">Free</p>
                            <p className="text-xs text-gray-400 mt-0.5">No payment or credit card required</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Course Fee</p>
                            <p className="text-3xl font-extrabold text-gray-900">₹{finalPrice.toLocaleString('en-IN')}</p>
                            <p className="text-xs text-gray-500 mt-0.5">One-time payment · Full access</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Primary CTA Button */}
                  <button
                    onClick={handleEnrollClick}
                    disabled={enrollmentLoading || paymentProcessing || fetchingPrice || info.disabled}
                    className={`w-full py-3 px-5 text-sm font-bold rounded-md transition-all shadow-xs active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer ${
                      info.disabled
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : isCompletelyFree()
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-[#FB0500] hover:bg-red-700 text-white'
                    } disabled:opacity-60`}
                  >
                    {enrollmentLoading || paymentProcessing || fetchingPrice ? (
                      <span className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : isCompletelyFree() ? (
                      <>
                        <Play size={15} className="fill-current" /> Start Learning — Free
                      </>
                    ) : (
                      <>
                        <CreditCard size={15} /> {info.action}
                      </>
                    )}
                  </button>

                  {/* Feature Highlights Checklist */}
                  <div className="space-y-2.5 pt-3 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">This Course Includes:</p>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-blue-500 flex-shrink-0" />
                        <span>{course.modules?.length || 0} Modules & {tt} Lectures</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Unlock size={14} className="text-emerald-500 flex-shrink-0" />
                        <span>{ft} Free preview video lessons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-purple-500 flex-shrink-0" />
                        <span>Downloadable lecture study notes (PDF)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award size={14} className="text-amber-500 flex-shrink-0" />
                        <span>Lifetime access on Mobile & Desktop</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-emerald-500 flex-shrink-0" />
                        <span>Official Roots Classes course material</span>
                      </div>
                    </div>
                  </div>

                  {/* Trust Footer */}
                  <div className="pt-2.5 border-t border-gray-100 text-center">
                    <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1">
                      <ShieldCheck size={13} className="text-emerald-600" />
                      100% Safe & Secure · Instant Confirmation
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* INSTRUCTOR CARD */}
            <div className="bg-white rounded-md border border-gray-200 p-5 shadow-xs">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
                <User size={13} className="text-blue-600" />
                Meet Your Instructor
              </h3>
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center flex-shrink-0">
                  {instructor.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h4 className="text-sm font-bold text-gray-900 truncate">{instructor.name}</h4>
                    <CheckCircle size={13} className="text-blue-600 fill-blue-50 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 capitalize">
                    {instructor.role || 'Roots Classes Faculty'}
                  </p>

                  <div className="mt-2.5 space-y-1 text-xs">
                    {instructor.email && (
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Mail size={12} className="text-gray-400 flex-shrink-0" />
                        <a href={`mailto:${instructor.email}`} className="text-blue-600 hover:underline truncate">
                          {instructor.email}
                        </a>
                      </div>
                    )}
                    {instructor.phone && (
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Phone size={12} className="text-gray-400 flex-shrink-0" />
                        <a href={`tel:${instructor.phone}`} className="hover:text-blue-600 transition-colors">
                          {instructor.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom CTA Bar */}
      {!isEnrolled && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-3 px-4 z-40 flex items-center justify-between shadow-md">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Course Price</p>
            <p className="text-lg font-bold text-gray-900">
              {isCompletelyFree() ? (
                <span className="text-emerald-600">Free</span>
              ) : (
                `₹${finalPrice.toLocaleString('en-IN')}`
              )}
            </p>
          </div>
          <button
            onClick={handleEnrollClick}
            disabled={enrollmentLoading || paymentProcessing || fetchingPrice || info.disabled}
            className="py-2 px-5 bg-blue-600 text-white text-xs font-bold rounded-md shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            {isCompletelyFree() ? 'Start Free' : info.action}
          </button>
        </div>
      )}

      {/* Video Player Modal */}
      {showVideoPlayer && currentVideo && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => { setShowVideoPlayer(false); setCurrentVideo(null); }}
        >
          <div className="w-full max-w-4xl bg-gray-950 rounded-md overflow-hidden shadow-xl border border-gray-800" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5 bg-gray-900 border-b border-gray-800">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-sm font-semibold text-white truncate">{currentVideo.title}</p>
              </div>
              <button
                onClick={() => { setShowVideoPlayer(false); setCurrentVideo(null); }}
                className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors cursor-pointer"
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
