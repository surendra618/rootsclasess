import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../services/instructorendpoint';
import useStudentStore from '../../Store/studentstore';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, Plus, GraduationCap, TrendingUp, Clock } from 'lucide-react';

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { student } = useStudentStore();
  const navigate = useNavigate();

  const name = student?.fullName || student?.name || 'Instructor';

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.post(api.course.getCourse);
        const data = res.data.data || res.data || [];
        setCourses(data);
      } catch {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const totalModules = courses.reduce((sum, c) => sum + (c.modules?.length || 0), 0);
  const freeCount = courses.filter(c => !c.price || c.price === 0).length;
  const paidCount = courses.length - freeCount;

  const stats = [
    { label: 'Total Courses', value: courses.length, icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Modules', value: totalModules, icon: GraduationCap, color: 'bg-purple-50 text-purple-600' },
    { label: 'Paid Courses', value: paidCount, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { label: 'Free Courses', value: freeCount, icon: Clock, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 md:p-8 space-y-6">
      {/* Sticky Header */}
      <div className="bg-white rounded-lg border border-gray-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between sticky top-0 z-20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#0078FF]"></span>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Instructor Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Welcome back, {name.split(' ')[0]} 👋</h1>
          <p className="text-xs text-gray-500 mt-0.5">Here is a quick overview of your active teaching metrics & courses.</p>
        </div>
        <button
          onClick={() => navigate('/instructor/courses')}
          className="inline-flex items-center justify-center px-4 py-2 bg-[#0078FF] text-white rounded-md text-xs font-bold uppercase tracking-wider hover:bg-blue-600 transition-all shadow-xs gap-1.5"
        >
          <Plus size={15} />
          <span>New Course</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-gray-200/80 p-5 shadow-xs hover:border-gray-300 transition-all">
            <div className={`w-9 h-9 rounded-md ${stat.color} flex items-center justify-center mb-3 border border-current/10`}>
              <stat.icon size={18} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{loading ? '—' : stat.value}</p>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Courses Section */}
      <div className="bg-white rounded-lg border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Recent Courses</h2>
            <p className="text-[11px] text-gray-500">Your latest uploaded curriculum & active courses</p>
          </div>
          <button
            onClick={() => navigate('/instructor/courses')}
            className="text-xs text-[#0078FF] font-bold uppercase tracking-wider hover:text-blue-700 flex items-center gap-1 transition-all"
          >
            View all <ChevronRight size={13} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-4 border-blue-100 border-t-[#0078FF] rounded-full animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen size={36} className="mx-auto text-gray-300 mb-2" />
            <p className="text-xs font-medium text-gray-500 mb-3">No courses created yet</p>
            <button
              onClick={() => navigate('/instructor/courses')}
              className="inline-flex items-center gap-2 bg-[#0078FF] text-white text-xs px-4 py-2 rounded-md font-bold uppercase tracking-wider hover:bg-blue-600 transition-all shadow-xs"
            >
              <Plus size={14} /> Create your first course
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {courses.slice(0, 5).map((course) => (
              <div key={course._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 text-[#0078FF]">
                    <BookOpen size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{course.title}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {course.modules?.length || 0} module{course.modules?.length !== 1 ? 's' : ''} ·{' '}
                      <span className="font-semibold text-gray-700">{course.price ? `₹${course.price}` : 'Free'}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/instructor/courses/${course._id}`)}
                  className="ml-4 flex-shrink-0 text-xs text-[#0078FF] font-semibold flex items-center gap-1 hover:text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-all"
                >
                  Edit Course <ChevronRight size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/instructor/courses')}
          className="flex items-center gap-4 bg-white border border-gray-200/80 rounded-lg p-5 shadow-xs hover:border-gray-300 transition-all text-left group"
        >
          <div className="w-10 h-10 bg-blue-50 text-[#0078FF] border border-blue-100 rounded-md flex items-center justify-center flex-shrink-0">
            <BookOpen size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Manage Course Curriculum</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Create, edit, and add video chapters or PDFs</p>
          </div>
          <ChevronRight size={16} className="ml-auto text-gray-300 group-hover:text-gray-600 transition-colors" />
        </button>

        <button
          onClick={() => navigate('/instructor/students')}
          className="flex items-center gap-4 bg-white border border-gray-200/80 rounded-lg p-5 shadow-xs hover:border-gray-300 transition-all text-left group"
        >
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md flex items-center justify-center flex-shrink-0">
            <GraduationCap size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Enrolled Students</p>
            <p className="text-[11px] text-gray-500 mt-0.5">View student progress and course enrollments</p>
          </div>
          <ChevronRight size={16} className="ml-auto text-gray-300 group-hover:text-gray-600 transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default InstructorDashboard;
