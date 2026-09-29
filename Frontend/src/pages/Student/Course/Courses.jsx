import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useStudentStore from '../../../Store/studentstore';
import api from '../../../services/endpoints';
import { BookOpen, FileText, Search, LayoutGrid, List, ChevronRight, CheckCircle2 } from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const getImg = (courseId, courseTitle, category) => {
  const sets = {
    programming: ['https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=300&fit=crop', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=300&fit=crop', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=300&fit=crop'],
    business: ['https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=600&h=300&fit=crop', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=300&fit=crop'],
    design: ['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=300&fit=crop', 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600&h=300&fit=crop'],
    data: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=300&fit=crop', 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&h=300&fit=crop'],
    default: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=300&fit=crop', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=300&fit=crop', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=300&fit=crop'],
  };
  const cat = (category || '').toLowerCase();
  const ttl = (courseTitle || '').toLowerCase();
  let key = 'default';
  if (cat.includes('program') || ttl.includes('code') || ttl.includes('program')) key = 'programming';
  else if (cat.includes('business') || ttl.includes('business')) key = 'business';
  else if (cat.includes('design') || ttl.includes('design')) key = 'design';
  else if (cat.includes('data') || ttl.includes('data')) key = 'data';
  const arr = sets[key];
  const hash = parseInt(courseId?.toString().slice(-4) || '0', 16) || 0;
  return arr[hash % arr.length];
};

const hasPaid = (c) => c?.modules?.some(m => m.chapters?.some(ch => ch.topics?.some(t => t.isPreviewFree === false)));
const isFree = (c) => (!c.price || c.price === 0) && !hasPaid(c);
const isPaid = (c) => (c.price && c.price > 0) || hasPaid(c);
const priceLabel = (c) => !c ? 'Free' : c.price > 0 ? `₹${c.price.toLocaleString('en-IN')}` : hasPaid(c) ? 'Premium' : 'Free';
const topicCount = (c) => c.modules?.reduce((t, m) => t + (m.chapters?.reduce((a, ch) => a + (ch.topics?.length || 0), 0) || 0), 0) || 0;

/* ─── component ───────────────────────────────────────────────────────────── */
const ClassroomCourses = () => {
  const navigate = useNavigate();
  const { student } = useStudentStore();
  const studentId = student?._id;

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid'); // 'grid' | 'list'

  const GetFullCourse = async () => {
    try {
      setLoading(true);
      const res = await axios.get(api.fullcourse.getApprovedcourse);
      let data = res.data?.data?.data || res.data?.data || (Array.isArray(res.data) ? res.data : res.data?.courses) || [];
      setCourses(data);
      setCategories(['All', ...new Set(data.map(c => c.category?.name || 'Uncategorized'))]);
    } catch {
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolled = async () => {
    if (!studentId) return;
    try {
      const res = await axios.get(`${api.student.getStudentProfile}/${studentId}`);
      if (res.data?.success) setEnrolledCourses(res.data.data?.enrolledCourses || []);
    } catch {}
  };

  useEffect(() => { GetFullCourse(); }, []);
  useEffect(() => { if (studentId) fetchEnrolled(); }, [studentId]);

  const isEnrolled = (id) => enrolledCourses.includes(id);

  const filtered = courses.filter(c => {
    const matchCat = selectedCategory === 'All' || (c.category?.name || 'Uncategorized') === selectedCategory;
    const matchSrc = !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSrc;
  });

  const handleView = (course) => navigate('/coursedetails', { state: { course } });

  /* ── loading ── */
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-slate-200 border-t-[#0078FF] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading courses...</p>
      </div>
    </div>
  );

  /* ── error ── */
  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center bg-white rounded-md p-8 border border-slate-200 shadow-sm max-w-sm">
        <p className="text-slate-700 font-medium mb-4 text-sm">{error}</p>
        <button onClick={GetFullCourse} className="px-5 py-2.5 bg-[#FB0500] text-white text-xs font-bold rounded-md hover:bg-red-700 transition">
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero Banner ── */}
      <div className="relative bg-slate-50 border-b border-slate-200 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.4]" style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
        
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#0078FF]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#FB0500]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-white border border-slate-200 mb-3 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0078FF]"></span>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Explore Programs</p>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
                Discover & Master<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FB0500] via-[#0078FF] to-[#28A745]">
                  New Skills
                </span>
              </h1>
            </div>

            {/* Compact Stats */}
            <div className="flex gap-8 md:gap-10 md:px-8 md:border-x border-slate-200">
              <div>
                <span className="text-xl md:text-2xl font-black text-[#FB0500]">{courses.length}+</span>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Courses</p>
              </div>
              <div>
                <span className="text-xl md:text-2xl font-black text-[#0078FF]">50+</span>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Faculty</p>
              </div>
              <div>
                <span className="text-xl md:text-2xl font-black text-[#28A745]">10K+</span>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Students</p>
              </div>
            </div>

            {/* Search Input */}
            <div className="md:w-72">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-full text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] transition-all shadow-2xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Filters + Grid/List Toggle ── */}
      <div className="bg-white border-b border-slate-200 sticky top-[80px] z-10 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 flex-1 flex-wrap">
            {categories.map((cat) => {
              const count = cat === 'All' ? courses.length : courses.filter(c => (c.category?.name || 'Uncategorized') === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#FB0500] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {cat}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-bold ${
                    selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-200'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View toggle buttons */}
          <div className="flex gap-1 flex-shrink-0 bg-slate-100 p-1 rounded-md border border-slate-200">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-sm transition-colors ${view === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-sm transition-colors ${view === 'list' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-400 hover:text-slate-600'}`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Courses Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-md border border-dashed border-slate-300 p-8">
            <BookOpen size={44} className="text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">No courses found</h3>
            <p className="text-xs text-slate-500 mb-4">Try selecting a different category or search term.</p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearch(''); }}
              className="px-4 py-2 bg-[#FB0500] text-white text-xs font-bold rounded-md hover:bg-red-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : view === 'list' ? (

          /* ── LIST VIEW ── */
          <div className="space-y-4">
            {filtered.map((course) => {
              const enrolled = isEnrolled(course._id);
              const free = isFree(course);
              const img = getImg(course._id, course.title, course.category?.name);
              const price = priceLabel(course);
              const topics = topicCount(course);
              const modules = course.modules?.length || 0;

              return (
                <div
                  key={course._id}
                  className="group bg-white rounded-md border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all overflow-hidden flex gap-0"
                >
                  <div className="w-52 h-40 flex-shrink-0 overflow-hidden hidden sm:block bg-slate-100">
                    <img
                      src={img}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop'; }}
                    />
                  </div>
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-sm bg-slate-100 text-slate-700 border border-slate-200">
                          {course.category?.name || 'General'}
                        </span>
                        {enrolled && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-sm bg-green-50 text-green-700 border border-green-200">
                            Enrolled
                          </span>
                        )}
                        {!enrolled && free && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-sm bg-blue-50 text-[#0078FF] border border-blue-200">
                            Free
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 group-hover:text-[#FB0500] transition-colors line-clamp-1 text-base">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {course.description || 'No description available'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                        <span className="flex items-center gap-1.5"><BookOpen size={13} /> {modules} modules</span>
                        <span className="flex items-center gap-1.5"><FileText size={13} /> {topics} topics</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-slate-900 text-base">{price}</span>
                        <button
                          onClick={() => handleView(course)}
                          className={`px-4 py-2 rounded-md text-xs font-bold transition-all shadow-xs ${
                            enrolled
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-[#0078FF] hover:bg-blue-700 text-white'
                          }`}
                        >
                          {enrolled ? 'Continue →' : 'View Details →'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        ) : (

          /* ── GRID VIEW (Exactly 3 Cards Per Row: grid-cols-1 md:grid-cols-2 lg:grid-cols-3) ── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course) => {
              const enrolled = isEnrolled(course._id);
              const free = isFree(course);
              const img = getImg(course._id, course.title, course.category?.name);
              const price = priceLabel(course);
              const topics = topicCount(course);
              const modules = course.modules?.length || 0;

              return (
                <div
                  key={course._id}
                  className="group bg-white rounded-md border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-300 flex flex-col"
                >
                  {/* Image Container */}
                  <div className="relative h-48 overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={img}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=300&fit=crop'; }}
                    />
                    
                    {/* Top Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm bg-white/95 backdrop-blur-xs text-slate-800 border border-slate-200 shadow-2xs">
                        {course.category?.name || 'General'}
                      </span>
                    </div>

                    {/* Price / Enrolled Badge */}
                    <div className="absolute top-3 right-3">
                      {enrolled ? (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-sm bg-green-600 text-white shadow-2xs">
                          Enrolled
                        </span>
                      ) : free ? (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-sm bg-[#0078FF] text-white shadow-2xs">
                          Free
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-sm bg-[#FB0500] text-white shadow-2xs">
                          {price}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-[#FB0500] transition-colors line-clamp-2 leading-snug mb-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4 flex-1">
                      {course.description || 'No description available for this course.'}
                    </p>

                    {/* Modules & Topics Meta */}
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 pb-3 mb-3 border-b border-slate-100">
                      <span className="flex items-center gap-1.5">
                        <BookOpen size={13} className="text-slate-400" />
                        {modules} modules
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FileText size={13} className="text-slate-400" />
                        {topics} topics
                      </span>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="flex items-center justify-between mt-auto pt-1">
                      <span className="text-lg font-extrabold text-slate-900">
                        {enrolled ? (
                          <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                            <CheckCircle2 size={14} /> Enrolled
                          </span>
                        ) : price}
                      </span>
                      
                      <button
                        onClick={() => handleView(course)}
                        className={`px-4 py-2 rounded-md text-xs font-bold transition-all shadow-xs ${
                          enrolled
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-[#0078FF] hover:bg-blue-700 text-white'
                        }`}
                      >
                        {enrolled ? 'Continue →' : 'View Details →'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Bottom CTA ── */}
      <div className="bg-slate-50 py-14 px-4 sm:px-6 lg:px-8 border-t border-slate-200 relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-md p-8 sm:p-10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <span className="text-[10px] font-bold text-[#0078FF] uppercase tracking-[0.2em] bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-sm inline-block mb-2">
                Need Help Choosing?
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
                Talk to our counselors — <span className="text-[#FB0500]">it's free</span>
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm max-w-md font-medium leading-relaxed">
                Get a personalized course recommendation based on your goals and current grade.
              </p>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="flex-shrink-0 px-6 py-3 bg-[#FB0500] text-white font-bold rounded-md text-xs sm:text-sm hover:bg-red-700 transition-all shadow-xs flex items-center gap-2"
            >
              Request Free Callback
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomCourses;
