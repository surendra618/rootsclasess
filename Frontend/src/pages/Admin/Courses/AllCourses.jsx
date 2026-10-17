import axios from 'axios';
import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import api from '../../../services/adminendpoint';
import Loader from '../../../components/AdminComponent/Loader';
import { Eye, CheckCircle, XCircle, BookOpen, Layers, FileText, HelpCircle, GraduationCap } from 'lucide-react';

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
        <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70 inline-flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Approved
        </span>
      );
    } else if (status === 'rejected') {
      return (
        <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/70 inline-flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Rejected
        </span>
      );
    } else {
      return (
        <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/70 inline-flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending
        </span>
      );
    }
  };

  if (loading) return <Loader message="Loading Courses..." />;

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-6 flex items-center justify-center font-sans">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center max-w-md shadow-xs">
          <p className="text-rose-600 font-medium mb-4">{error}</p>
          <button onClick={GetFullDetails} className="px-5 py-2 bg-gray-900 text-white font-medium text-xs uppercase tracking-wider rounded-lg hover:bg-blue-600 transition-all cursor-pointer">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-12 w-full max-w-full overflow-x-hidden">
      {/* Header with normal subtle shadow */}
      <div className="bg-white border-b border-gray-200/80 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-blue-50 text-[#0078FF]">
              <BookOpen size={15} />
            </span>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Course Catalog
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Course Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Review, approve, and manage all courses uploaded by instructors.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-5">
        {/* Stat Cards - Normal subtle shadow */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs">
            <div className="text-2xl font-bold text-[#0078FF]">{courses.length}</div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Total Courses</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs">
            <div className="text-2xl font-bold text-emerald-600">
              {courses.reduce((sum, course) => sum + (course.modules?.length || 0), 0)}
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Total Modules</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs">
            <div className="text-2xl font-bold text-purple-600">
              {courses.reduce((sum, course) =>
                sum + (course.modules?.reduce((s, m) => s + (m.chapters?.length || 0), 0) || 0), 0)}
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Total Chapters</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs">
            <div className="text-2xl font-bold text-amber-600">
              {courses.reduce((sum, course) =>
                sum + (course.modules?.reduce((s, m) =>
                  s + (m.chapters?.reduce((t, c) => t + (c.topics?.length || 0), 0) || 0), 0) || 0), 0)}
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Total Topics</div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden space-y-4">
          {courses.map((course) => (
            <div key={course._id} className="bg-white rounded-xl border border-gray-200/80 p-4 space-y-3 shadow-xs">
              <div className="flex justify-between items-start gap-2">
                <h3 className="text-sm font-semibold text-gray-900 flex-1">{course.title}</h3>
                {getStatusBadge(course.status || 'pending')}
              </div>
              <RenderHTML htmlContent={course.description} className="text-xs text-gray-500 line-clamp-2" />

              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/70 rounded-md text-xs font-medium">
                  {course.category?.name || 'General'}
                </span>
                <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium capitalize">
                  {course.level}
                </span>
                <span className="px-2.5 py-0.5 bg-gray-50 text-gray-600 border border-gray-200/70 rounded-md text-xs font-medium">
                  {course.modules?.length || 0} modules
                </span>
              </div>

              <div className="text-xs text-gray-500">
                Instructor: <span className="font-medium text-gray-800">{getInstructorName(course)}</span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleViewDetails(course)}
                  className="px-3 py-1.5 bg-blue-50 text-[#0078FF] border border-blue-200 rounded-md hover:bg-blue-100 text-xs font-medium transition-colors cursor-pointer"
                >
                  View Details
                </button>
                <div className="flex gap-2">
                  {course.status !== 'approved' && (
                    <button
                      onClick={() => updateCourseStatus(course._id, 'approved')}
                      disabled={processingId === course._id}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md hover:bg-emerald-100 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Approve
                    </button>
                  )}
                  {course.status !== 'rejected' && (
                    <button
                      onClick={() => updateCourseStatus(course._id, 'rejected')}
                      disabled={processingId === course._id}
                      className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md hover:bg-rose-100 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View - 100% Fit, Normal Font Weights (Not Bold), Normal Shadow, Zero Scrollbar */}
        <div className="hidden md:block bg-white rounded-xl border border-gray-200/80 overflow-hidden w-full shadow-xs">
          <table className="w-full table-fixed text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-gray-200 text-gray-500">
                <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wider w-[26%]">Course Name</th>
                <th className="px-3 py-3.5 font-semibold text-xs uppercase tracking-wider w-[12%]">Category</th>
                <th className="px-3 py-3.5 font-semibold text-xs uppercase tracking-wider w-[10%]">Level</th>
                <th className="px-3 py-3.5 font-semibold text-xs uppercase tracking-wider w-[13%]">Instructor</th>
                <th className="px-3 py-3.5 font-semibold text-xs uppercase tracking-wider w-[9%]">Modules</th>
                <th className="px-3 py-3.5 font-semibold text-xs uppercase tracking-wider w-[11%]">Status</th>
                <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wider text-right w-[19%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map((course) => (
                <tr key={course._id} className="hover:bg-gray-50/70 transition-colors">
                  {/* Course Name - Medium font weight, not bold */}
                  <td className="px-4 py-3.5 align-middle">
                    <div className="font-semibold text-sm text-gray-900 tracking-tight truncate" title={course.title}>
                      {course.title}
                    </div>
                    <RenderHTML htmlContent={course.description} className="text-xs text-gray-400 line-clamp-1 mt-0.5" />
                  </td>

                  {/* Category */}
                  <td className="px-3 py-3.5 align-middle whitespace-nowrap">
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/70 rounded text-xs font-medium inline-block">
                      {course.category?.name || 'General'}
                    </span>
                  </td>

                  {/* Level */}
                  <td className="px-3 py-3.5 align-middle text-sm capitalize text-gray-600 font-normal whitespace-nowrap">
                    {course.level || 'Beginner'}
                  </td>

                  {/* Instructor */}
                  <td className="px-3 py-3.5 align-middle text-sm font-medium text-gray-700 whitespace-nowrap truncate" title={getInstructorName(course)}>
                    {getInstructorName(course)}
                  </td>

                  {/* Modules */}
                  <td className="px-3 py-3.5 align-middle text-sm font-normal text-gray-500 whitespace-nowrap">
                    {course.modules?.length || 0} modules
                  </td>

                  {/* Status */}
                  <td className="px-3 py-3.5 align-middle whitespace-nowrap">
                    {getStatusBadge(course.status || 'pending')}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 align-middle text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetails(course)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#0078FF] border border-blue-200/80 rounded-md text-xs font-medium transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="View Course Details"
                      >
                        <Eye size={12} />
                        <span>View</span>
                      </button>
                      {course.status !== 'approved' && (
                        <button
                          onClick={() => updateCourseStatus(course._id, 'approved')}
                          disabled={processingId === course._id}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-md text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      {course.status !== 'rejected' && (
                        <button
                          onClick={() => updateCourseStatus(course._id, 'rejected')}
                          disabled={processingId === course._id}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-md text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
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

      {/* Modal for Course Details */}
      {showModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedCourse.title}</h2>
                <p className="text-xs text-gray-500">Instructor: {getInstructorName(selectedCourse)}</p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-md text-base font-bold cursor-pointer">✕</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
              <div>
                <h3 className="font-semibold text-gray-800 text-xs uppercase tracking-wider mb-1">Description</h3>
                <RenderHTML htmlContent={selectedCourse.description} className="text-gray-600 text-xs sm:text-sm bg-gray-50 p-3 rounded-lg border border-gray-100" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3.5 rounded-lg border border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 font-medium uppercase tracking-wider block text-[10px]">Category</span>
                  <span className="font-semibold text-gray-800">{selectedCourse.category?.name || 'General'}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium uppercase tracking-wider block text-[10px]">Level</span>
                  <span className="font-semibold text-gray-800 capitalize">{selectedCourse.level}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium uppercase tracking-wider block text-[10px]">Price</span>
                  <span className="font-semibold text-[#0078FF]">₹{selectedCourse.price || 0}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium uppercase tracking-wider block text-[10px]">Status</span>
                  <span className="capitalize font-semibold text-gray-800">{selectedCourse.status || 'Pending'}</span>
                </div>
              </div>

              {/* Syllabus / Modules Tree */}
              <div>
                <h3 className="font-semibold text-gray-800 text-xs uppercase tracking-wider mb-2">Course Curriculum</h3>
                {selectedCourse.modules && selectedCourse.modules.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCourse.modules.map((module, mIdx) => (
                      <div key={module._id || mIdx} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleModule(module._id || mIdx)}
                          className="w-full px-4 py-2.5 bg-gray-50 text-left font-semibold text-xs text-gray-800 flex justify-between items-center hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <Layers size={14} className="text-[#0078FF]" />
                            Module {mIdx + 1}: {module.name}
                          </span>
                          <span className="text-gray-400 text-xs">{expandedModules[module._id || mIdx] ? '▲' : '▼'}</span>
                        </button>

                        {expandedModules[module._id || mIdx] && (
                          <div className="p-3 bg-white space-y-2 border-t border-gray-100">
                            {module.chapters && module.chapters.length > 0 ? (
                              module.chapters.map((chapter, cIdx) => (
                                <div key={chapter._id || cIdx} className="border border-gray-100 rounded-md overflow-hidden pl-2">
                                  <button
                                    onClick={() => toggleChapter(chapter._id || cIdx)}
                                    className="w-full px-3 py-2 text-left font-medium text-xs text-gray-700 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                                  >
                                    <span className="flex items-center gap-1.5">
                                      <BookOpen size={13} className="text-gray-500" />
                                      Chapter {cIdx + 1}: {chapter.name}
                                    </span>
                                    <span className="text-gray-400 text-[10px]">{expandedChapters[chapter._id || cIdx] ? '▲' : '▼'}</span>
                                  </button>

                                  {expandedChapters[chapter._id || cIdx] && (
                                    <div className="p-2.5 bg-gray-50/50 space-y-1.5 border-t border-gray-100">
                                      {chapter.topics && chapter.topics.length > 0 ? (
                                        chapter.topics.map((topic, tIdx) => (
                                          <div key={topic._id || tIdx} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-white border border-gray-100">
                                            <span className="flex items-center gap-1.5 text-gray-700 font-normal">
                                              <FileText size={12} className="text-gray-400" />
                                              {topic.name}
                                            </span>
                                            <span className="text-[11px] text-gray-400">{topic.duration || 10}m</span>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-xs text-gray-400 italic">No topics in this chapter.</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-gray-400 italic">No chapters in this module.</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No curriculum uploaded for this course.</p>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-2">
              <button onClick={closeModal} className="px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg text-xs hover:bg-gray-100 transition cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCourses;