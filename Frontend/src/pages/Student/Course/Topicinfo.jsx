// src/pages/TopicInfo.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, Play, FileText, Lock, Unlock, CheckCircle, Calendar, Download, GraduationCap, ExternalLink } from 'lucide-react';
import jsPDF from 'jspdf';
import axios from 'axios';
import useStudentStore from '../../../Store/studentstore';
import api from '../../../services/endpoints';

const showToast = (message, background) => {
  const toast = document.createElement('div');
  toast.style.cssText = `position:fixed;top:20px;right:16px;z-index:9999;padding:12px 18px;background:${background};color:#fff;border-radius:10px;font-size:13px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,.15)`;
  toast.textContent = message;
  document.body.appendChild(toast);
  return toast;
};

const stripHtml = (value) =>
  String(value || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<li>/gi, '- ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const downloadLessonContentAsPDF = (topic) => {
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
        if (y > 275) {
          pdf.addPage();
          y = 20;
        }

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

    const descriptionText = stripHtml(topic.description);
    const notesText = stripHtml(topic.notes);

    if (descriptionText) {
      addText('Lesson Content', 11, true, [37, 99, 235]);
      y += 2;
      addText(descriptionText, 10, false, [55, 65, 81]);
      y += 5;
    }

    if (notesText) {
      addText('Additional Notes', 10, true, [107, 114, 128]);
      y += 1;
      addText(notesText, 10, false, [75, 85, 99]);
    }

    if (!descriptionText && !notesText) {
      addText('No lesson content available for this topic.', 10, false, [55, 65, 81]);
    }

    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i += 1) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(156, 163, 175);
      pdf.text(`Page ${i} of ${pageCount}`, pageW - margin, 290, { align: 'right' });
    }

    pdf.save(`${(topic.title || 'notes').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.pdf`);
    const successToast = showToast('PDF downloaded successfully!', '#22c55e');
    setTimeout(() => successToast.remove(), 3000);
  } catch (err) {
    console.error('PDF error:', err);
    const errorToast = showToast('Failed to generate PDF', '#ef4444');
    setTimeout(() => errorToast.remove(), 3000);
  }
};

const TopicInfo = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { student } = useStudentStore();

  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    if (location.state?.topic) {
      setTopic(location.state.topic);
      setIsEnrolled(location.state?.isEnrolled || false);
      setCourse({ _id: location.state?.courseId, title: location.state?.courseTitle });
      setLoading(false);
    } else if (topicId) {
      fetchTopicDetails();
    } else {
      setError('No topic information available');
      setLoading(false);
    }
  }, [topicId, location.state]);

  useEffect(() => {
    if (student?._id && course?._id) {
      checkEnrollmentStatus();
    }
  }, [student, course]);

  const fetchTopicDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${api.topics.getTopic}/${topicId}`);
      if (response.data?.success) {
        setTopic(response.data.data);
        if (response.data.data.courseId) {
          const courseRes = await axios.get(`${api.courses.getCourse}/${response.data.data.courseId}`);
          if (courseRes.data?.success) {
            setCourse(courseRes.data.data);
          }
        }
      } else {
        setError('Topic not found');
      }
    } catch (err) {
      console.error('Error fetching topic:', err);
      setError('Failed to load topic information');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    if (!student?._id || !course?._id) return;
    try {
      const res = await axios.get(`${api.student.getStudentProfile}/${student._id}`);
      if (res.data?.success) {
        const enrolled = res.data.data?.enrolledCourses?.includes(course._id);
        setIsEnrolled(!!enrolled);
      }
    } catch (err) {
      console.error('Error checking enrollment:', err);
    }
  };

  const hasAccess = () => isEnrolled || topic?.isPreviewFree === true;

  const playVideo = () => {
    if (!hasAccess()) return;
    if (!topic.videoUrl) return;
    const isYT = topic.videoUrl.includes('youtube.com') || topic.videoUrl.includes('youtu.be');
    const embedUrl = isYT ? getYouTubeEmbedUrl(topic.videoUrl) : topic.videoUrl;
    window.open(embedUrl, '_blank');
  };

  const openNotes = async () => {
    if (!hasAccess()) return;
    if (!topic.notes && !topic.description && !topic.notesUrl) {
      const errorToast = showToast('No notes uploaded in this lesson or chapter.', '#ef4444');
      setTimeout(() => errorToast.remove(), 3000);
      return;
    }

    if (stripHtml(topic.description) || stripHtml(topic.notes)) {
      downloadLessonContentAsPDF(topic);
      return;
    }

    const errorToast = showToast('No notes uploaded in this lesson or chapter.', '#ef4444');
    setTimeout(() => errorToast.remove(), 3000);
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*[?&]v=([^&]+)/,
    ];
    let videoId = null;
    for (const p of patterns) {
      const m = url.match(p);
      if (m?.[1]) {
        videoId = m[1].split('?')[0].split('&')[0];
        break;
      }
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0` : url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading topic information...</p>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-10 rounded-2xl border border-gray-100 shadow max-w-sm">
          <BookOpen size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="font-semibold text-gray-800 mb-2">{error || 'Topic not found'}</p>
          <p className="text-sm text-gray-500 mb-4">The topic you're looking for doesn't exist or has been moved.</p>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
          >
            <ArrowLeft size={14} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const accessible = hasAccess();
  const hasNotes = Boolean(topic.notesUrl || stripHtml(topic.notes) || stripHtml(topic.description));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Course
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {!accessible && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-sm p-4">
            <div className="flex items-start gap-3">
              <Lock size={18} className="text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Premium Content</p>
                <p className="text-sm text-amber-700 mt-1">
                  This topic is part of a premium course. Enroll in the course to access all materials.
                </p>
                {course?._id && (
                  <button
                    onClick={() => navigate(`/course/${course._id}`)}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-sm hover:bg-amber-700 transition-colors"
                  >
                    View Course
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-5">
          <div className="bg-white rounded-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-4 sm:px-6 py-6 sm:py-8">
              <div className="flex items-center gap-2 mb-3">
                {topic.isPreviewFree && (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-sm flex items-center gap-1">
                    <Unlock size={12} /> Free Preview
                  </span>
                )}
                {!topic.isPreviewFree && !accessible && (
                  <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-sm flex items-center gap-1">
                    <Lock size={12} /> Premium Content
                  </span>
                )}
                {accessible && !topic.isPreviewFree && (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-sm flex items-center gap-1">
                    <CheckCircle size={12} /> Access Granted
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">{topic.title}</h1>
              {course && (
                <p className="text-blue-100 text-sm flex items-center gap-2">
                  <GraduationCap size={14} />
                  Part of: {course.title}
                </p>
              )}
            </div>

            <div className="p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen size={18} className="text-blue-600" />
                About this lesson
              </h2>
              {topic.description ? (
                <div
                  className="text-gray-600 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: topic.description }}
                />
              ) : (
                <p className="text-gray-400 italic">No description available for this lesson.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-blue-600" />
              Lesson Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {topic.duration && (
                <div className="bg-gray-50 rounded-sm p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Clock size={14} />
                    <span>Duration</span>
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">{topic.duration} minutes</p>
                </div>
              )}

              {topic.order && (
                <div className="bg-gray-50 rounded-sm p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <GraduationCap size={14} />
                    <span>Lesson Order</span>
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">Lesson #{topic.order}</p>
                </div>
              )}

              {topic.createdAt && (
                <div className="bg-gray-50 rounded-sm p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Calendar size={14} />
                    <span>Added On</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(topic.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              Learning Materials
            </h2>

            <div className="space-y-3">
              {topic.videoUrl && (
                <button
                  onClick={playVideo}
                  disabled={!accessible}
                  className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-sm transition-all ${accessible
                    ? 'bg-blue-50 hover:bg-blue-100 cursor-pointer'
                    : 'bg-gray-50 cursor-not-allowed opacity-60'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-sm flex items-center justify-center ${accessible ? 'bg-blue-600' : 'bg-gray-400'}`}>
                      <Play size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">Watch Video Lesson</p>
                      <p className="text-xs text-gray-500">Click to play the video</p>
                    </div>
                  </div>
                  <ExternalLink size={16} className={accessible ? 'text-blue-600' : 'text-gray-400'} />
                </button>
              )}

              {hasNotes && (
                <button
                  onClick={openNotes}
                  disabled={!accessible}
                  className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-sm transition-all ${accessible
                    ? 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
                    : 'bg-gray-50 cursor-not-allowed opacity-60'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-600 rounded-sm flex items-center justify-center">
                      <FileText size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">Download Notes</p>
                      <p className="text-xs text-gray-500">
                        {stripHtml(topic.description) || stripHtml(topic.notes)
                          ? 'Export lesson content as PDF'
                          : 'Download uploaded notes'}
                      </p>
                    </div>
                  </div>
                  <Download size={16} className="text-gray-500" />
                </button>
              )}

              {!topic.videoUrl && !hasNotes && (
                <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-sm">
                  <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-400 text-sm">No learning materials available for this lesson yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sticky bottom-4">
            <button
              onClick={() => navigate(-1)}
              className="py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-sm hover:bg-gray-200 transition-colors"
            >
              Back to Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicInfo;