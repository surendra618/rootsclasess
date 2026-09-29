import axios from 'axios';
import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import api from '../../../services/adminendpoint';
import Loader from '../../../components/AdminComponent/Loader';
import { Eye, CheckCircle, XCircle, BookOpen, Layers, FileText, HelpCircle } from 'lucide-react';

const RenderHTML = ({ htmlContent, className = "" }) => {
  if (!htmlContent) return null;
  const sanitizedHtml = DOMPurify.sanitize(htmlContent);
  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
};

// Helper function to get instructor name from course object
const getInstructorName = (course) => {
  if (!course) return 'N/A';
  if (course.instructorName) return course.instructorName;
  if (course.instructor && course.instructor.fullName) return course.instructor.fullName;
  return 'N/A';
};

const AllCourses = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({});
  const [processingId, setProcessingId] = useState(null);

  const GetFullDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(api.fullcourse.getfullcourse);
      let coursesData = [];
      if (res.data?.success && res.data?.data) {
        coursesData = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
      } else if (Array.isArray(res.data)) {
        coursesData = res.data;
      }
      setCourses(coursesData);
    } catch (error) {
      console.log(error);
      setError(error.response?.data?.message || 'Failed to fetch course details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetFullDetails();
  }, []);

  const updateCourseStatus = async (courseId, status) => {
    if (!courseId) return;
    setProcessingId(courseId);
    try {
      const res = await axios.post(api.fullcourse.approvedCourse, {
        courseId: courseId,
        status: status,
      });
      if (res.data?.success) {
        alert(`Course ${status === 'approved' ? 'approved' : 'rejected'} successfully!`);
        await GetFullDetails();
      } else {
        alert(res.data?.message || 'Failed to update status');
      }
    } catch (error) {
      console.error("Status update error:", error);
      alert(error.response?.data?.message || 'Error updating course status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
    setExpandedModules({});
    setExpandedChapters({});
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const getStatusBadge = (status) => {
    if (status === 'approved') {
      return (
        <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Approved
        </span>
      );
    } else if (status === 'rejected') {
      return (
        <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Rejected
        </span>
      );
    } else {
      return (
        <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending
        </span>
      );
    }
  };

  if (loading) return <Loader message="Loading Courses..." />;

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-6 flex items-center justify-center font-sans">
        <div className="bg-white border border-gray-200 rounded-md p-8 text-center max-w-md shadow-xs">
          <p className="text-red-600 font-bold mb-4">{error}</p>
          <button onClick={GetFullDetails} className="px-5 py-2 bg-gray-900 text-white font-semibold text-xs uppercase tracking-wider rounded-md hover:bg-blue-600 transition-all">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200/80 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Course Management</h1>
          <p className="text-xs text-gray-500 mt-1">Review, approve, and manage all courses uploaded by instructors.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-md border border-gray-200/80 p-4 shadow-xs">
            <div className="text-2xl font-black text-blue-600">{courses.length}</div>
            <div className="text-xs font-medium text-gray-500 mt-1">Total Courses</div>
          </div>
          <div className="bg-white rounded-md border border-gray-200/80 p-4 shadow-xs">
            <div className="text-2xl font-black text-emerald-600">
              {courses.reduce((sum, course) => sum + (course.modules?.length || 0), 0)}
            </div>
            <div className="text-xs font-medium text-gray-500 mt-1">Total Modules</div>
          </div>
          <div className="bg-white rounded-md border border-gray-200/80 p-4 shadow-xs">
            <div className="text-2xl font-black text-purple-600">
              {courses.reduce((sum, course) =>
                sum + (course.modules?.reduce((s, m) => s + (m.chapters?.length || 0), 0) || 0), 0)}
            </div>
            <div className="text-xs font-medium text-gray-500 mt-1">Total Chapters</div>
          </div>
          <div className="bg-white rounded-md border border-gray-200/80 p-4 shadow-xs">
            <div className="text-2xl font-black text-amber-600">
              {courses.reduce((sum, course) =>
                sum + (course.modules?.reduce((s, m) =>
                  s + (m.chapters?.reduce((t, c) => t + (c.topics?.length || 0), 0) || 0), 0) || 0), 0)}
            </div>
            <div className="text-xs font-medium text-gray-500 mt-1">Total Topics</div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden space-y-4">
          {courses.map((course) => (
            <div key={course._id} className="bg-white rounded-md border border-gray-200 p-4 shadow-xs">
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="text-sm font-bold text-gray-900 flex-1">{course.title}</h3>
                {getStatusBadge(course.status || 'pending')}
              </div>
              <RenderHTML htmlContent={course.description} className="text-xs text-gray-500 mb-3 line-clamp-2" />

              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-md text-[11px] font-medium">
                  {course.category?.name || 'General'}
                </span>
                <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[11px] font-medium capitalize">
                  {course.level}
                </span>
                <span className="px-2.5 py-0.5 bg-gray-50 text-gray-600 border border-gray-200/60 rounded-md text-[11px] font-medium">
                  {course.modules?.length || 0} modules
                </span>
              </div>

              <div className="text-xs text-gray-500 mb-3">
                Instructor: <span className="font-semibold text-gray-800">{getInstructorName(course)}</span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleViewDetails(course)}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-md hover:bg-blue-100 text-xs font-semibold transition-colors"
                >
                  View Details
                </button>
                <div className="flex gap-2">
                  {course.status !== 'approved' && (
                    <button
                      onClick={() => updateCourseStatus(course._id, 'approved')}
                      disabled={processingId === course._id}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-md hover:bg-emerald-100 text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      Approve
                    </button>
                  )}
                  {course.status !== 'rejected' && (
                    <button
                      onClick={() => updateCourseStatus(course._id, 'rejected')}
                      disabled={processingId === course._id}
                      className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200/60 rounded-md hover:bg-rose-100 text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-md border border-gray-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200/80 text-gray-500 font-semibold text-xs">
                  <th className="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider">Course Name</th>
                  <th className="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider">Level</th>
                  <th className="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider">Instructor</th>
                  <th className="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider">Modules</th>
                  <th className="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {courses.map((course) => (
                  <tr key={course._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-semibold text-gray-900 truncate">{course.title}</div>
                      <RenderHTML htmlContent={course.description} className="text-xs text-gray-500 line-clamp-1 mt-0.5" />
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-md text-xs font-medium">
                        {course.category?.name || 'General'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs capitalize text-gray-600 font-medium">
                      {course.level || 'Beginner'}
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-gray-800">
                      {getInstructorName(course)}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-600">
                      {course.modules?.length || 0} modules
                    </td>
                    <td className="px-5 py-4">
                      {getStatusBadge(course.status || 'pending')}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(course)}
                          className="px-2.5 py-1.5 bg-gray-50 hover:bg-blue-50 text-[#0078FF] border border-gray-200/80 rounded-md text-xs font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          <Eye size={13} /> View
                        </button>
                        {course.status !== 'approved' && (
                          <button
                            onClick={() => updateCourseStatus(course._id, 'approved')}
                            disabled={processingId === course._id}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 rounded-md text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}
                        {course.status !== 'rejected' && (
                          <button
                            onClick={() => updateCourseStatus(course._id, 'rejected')}
                            disabled={processingId === course._id}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 rounded-md text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for Course Details */}
      {showModal && selectedCourse && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-lg max-w-3xl w-full border border-gray-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedCourse.title}</h2>
                <p className="text-xs text-gray-500">Instructor: {getInstructorName(selectedCourse)}</p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-md">✕</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
              <div>
                <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-1">Description</h3>
                <RenderHTML htmlContent={selectedCourse.description} className="text-gray-600 text-xs leading-relaxed" />
              </div>

              <div>
                <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2">Curriculum Breakdown</h3>
                {(selectedCourse.modules || []).map((m, mIdx) => (
                  <div key={m._id || mIdx} className="mb-2 border border-gray-200/80 rounded-md overflow-hidden">
                    <button onClick={() => toggleModule(m._id || mIdx)} className="w-full p-3 bg-gray-50 flex justify-between items-center text-left text-xs font-bold text-gray-800">
                      <span>Module {mIdx + 1}: {m.title}</span>
                      <span className="text-gray-400">{expandedModules[m._id || mIdx] ? '▲' : '▼'}</span>
                    </button>
                    {expandedModules[m._id || mIdx] && (
                      <div className="p-3 border-t border-gray-200/60 bg-white space-y-2">
                        {(m.chapters || []).map((c, cIdx) => (
                          <div key={c._id || cIdx} className="text-xs">
                            <div className="font-semibold text-gray-700">Chapter {cIdx + 1}: {c.title}</div>
                            <div className="ml-3 mt-1 space-y-1 text-gray-500">
                              {(c.topics || []).map((t, tIdx) => (
                                <div key={t._id || tIdx} className="flex items-center gap-2">
                                  <span>•</span>
                                  <span>{t.title}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button onClick={closeModal} className="px-5 py-2 bg-gray-900 text-white rounded-md font-semibold text-xs">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCourses;