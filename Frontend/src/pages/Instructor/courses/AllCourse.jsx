import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../../services/instructorendpoint';
import { toast } from 'react-toastify';
import useStudentStore from '../../../Store/studentstore';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Plus, Edit2, Trash2, ChevronRight, Search, X, 
  Layers, Users, Star, IndianRupee, Filter, LayoutGrid, List,
  CheckCircle
} from 'lucide-react';

const LEVELS = ['beginner', 'intermediate', 'advanced'];

const AllCourse = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const navigate = useNavigate();
  const { student, token } = useStudentStore();

  const [formData, setFormData] = useState({ title: '', description: '', category: '', level: 'beginner', price: '' });

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.post(api.course.getCourse);
      const data = res.data.data || res.data || [];
      setCourses(data.map(c => ({ ...c, price: c.price ?? 0 })));
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.post(api.course.getCategory);
      setCategories(res.data.data || res.data || []);
    } catch {
      setCategories([]);
    }
  };

  const openCreate = () => {
    setEditingCourse(null);
    setFormData({ title: '', description: '', category: '', level: 'beginner', price: '' });
    setIsModalOpen(true);
  };

  const openEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category?._id || course.category,
      level: course.level || 'beginner',
      price: course.price,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = { ...formData, price: Number(formData.price) };
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (editingCourse) {
        await axios.post(api.course.editCourse, { courseId: editingCourse._id, ...payload }, config);
        toast.success('Course updated successfully');
      } else {
        await axios.post(api.course.createCourse, payload, config);
        toast.success('Course created successfully');
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      await axios.post(api.course.deleteCourse, { courseId: id }, config);
      toast.success('Course deleted');
      fetchCourses();
    } catch {
      toast.error('Failed to delete course');
    }
  };

  const filtered = courses.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  const getLevelStyles = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/60', dot: 'bg-emerald-500' };
      case 'intermediate':
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/60', dot: 'bg-amber-500' };
      case 'advanced':
        return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200/60', dot: 'bg-rose-500' };
      default:
        return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200/60', dot: 'bg-slate-500' };
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-gray-200/80 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">My Courses</h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage and organize your teaching curriculum</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#0078FF] hover:bg-blue-600 text-white px-4 py-2.5 rounded-md text-xs font-semibold shadow-xs transition-all"
          >
            <Plus size={16} />
            <span>Create New Course</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-md border border-gray-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center text-[#0078FF]">
              <BookOpen size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Total Courses</p>
              <h3 className="text-lg font-bold text-gray-900">{courses.length}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-md border border-gray-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Published</p>
              <h3 className="text-lg font-bold text-gray-900">{courses.length}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-md border border-gray-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-purple-50 flex items-center justify-center text-purple-600">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Total Students</p>
              <h3 className="text-lg font-bold text-gray-900">1,248</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-md border border-gray-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-amber-50 flex items-center justify-center text-amber-600">
              <Star size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Avg Rating</p>
              <h3 className="text-lg font-bold text-gray-900">4.9</h3>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-md border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex bg-gray-100 p-0.5 rounded-md border border-gray-200/60">
              <button 
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-sm transition-all ${viewMode === 'table' ? 'bg-white shadow-xs text-[#0078FF]' : 'text-gray-500 hover:text-gray-700'}`}
                title="Table View"
              >
                <List size={16} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-xs text-[#0078FF]' : 'text-gray-500 hover:text-gray-700'}`}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-md border border-gray-200/80 shadow-xs">
            <div className="w-8 h-8 border-3 border-blue-100 border-t-[#0078FF] rounded-full animate-spin"></div>
            <p className="text-xs text-gray-500 mt-3 font-medium">Loading courses...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-md border border-gray-200/80 shadow-xs p-6">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#0078FF] mx-auto mb-3">
              <BookOpen size={24} />
            </div>
            <h3 className="text-sm font-bold text-gray-900">No courses found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {search ? `No matches found for "${search}".` : 'Get started by creating your first course.'}
            </p>
            {!search && (
              <button
                onClick={openCreate}
                className="mt-4 inline-flex items-center gap-1.5 bg-[#0078FF] text-white text-xs font-semibold px-3.5 py-2 rounded-md hover:bg-blue-600 transition-all shadow-xs"
              >
                <Plus size={14} />
                <span>Create Course</span>
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((course) => {
              const style = getLevelStyles(course.level);
              return (
                <div key={course._id} className="bg-white rounded-md border border-gray-200/80 shadow-xs hover:border-gray-300 transition-all p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${style.bg} ${style.text} border ${style.border}`}>
                        {course.level || 'Beginner'}
                      </span>
                      <span className="text-xs font-bold text-gray-900">
                        {course.price ? `₹${course.price}` : <span className="text-emerald-600">Free</span>}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 mt-3 line-clamp-1">{course.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{course.description}</p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-gray-500">
                      {categories.find(c => c._id === (course.category?._id || course.category))?.name || 'General'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(course)} className="p-1.5 text-gray-400 hover:text-[#0078FF] transition-colors" title="Edit">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(course._id)} className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors" title="Delete">
                        <Trash2 size={15} />
                      </button>
                      <button
                        onClick={() => navigate(`/instructor/courses/${course._id}`)}
                        className="px-3 py-1.5 text-xs font-semibold text-[#0078FF] bg-blue-50 hover:bg-blue-100 rounded-md transition-all flex items-center gap-1"
                      >
                        Manage <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Desktop Table View */
          <div className="bg-white rounded-md border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-200/80">
                    <th className="px-5 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">Course</th>
                    <th className="px-5 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">Category & Level</th>
                    <th className="px-5 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">Pricing</th>
                    <th className="px-5 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((course) => {
                    const style = getLevelStyles(course.level);
                    return (
                      <tr key={course._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-md bg-blue-50 flex items-center justify-center text-[#0078FF] font-bold shrink-0">
                              <BookOpen size={18} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900 line-clamp-1">{course.title}</p>
                              <p className="text-[11px] text-gray-500 line-clamp-1">{course.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-700">
                              {categories.find(c => c._id === (course.category?._id || course.category))?.name || '—'}
                            </p>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${style.bg} ${style.text} border ${style.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                              {course.level || 'Beginner'}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-xs font-bold text-gray-900">
                            {course.price ? `₹${course.price}` : <span className="text-emerald-600">Free</span>}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/instructor/courses/${course._id}`)}
                              className="px-3 py-1.5 text-xs font-semibold text-[#0078FF] bg-blue-50 hover:bg-blue-100 rounded-md transition-all"
                            >
                              Manage
                            </button>
                            <button
                              onClick={() => openEdit(course)}
                              className="p-1.5 text-gray-400 hover:text-[#0078FF] hover:bg-gray-100 rounded-md transition-colors"
                              title="Edit Course"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(course._id)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-gray-100 rounded-md transition-colors"
                              title="Delete Course"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-gray-200/80 shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Class 10 Physics & Mathematics"
                  className="w-full bg-white border border-gray-200 rounded-md py-2.5 px-3.5 text-xs font-medium focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Brief Description</label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Overview of course curriculum and learning goals..."
                  className="w-full bg-white border border-gray-200 rounded-md py-2.5 px-3.5 text-xs font-medium focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    required
                    value={formData.category}
                    onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-white border border-gray-200 rounded-md py-2.5 px-3.5 text-xs font-medium focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none transition-all"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Target Level</label>
                  <select
                    required
                    value={formData.level}
                    onChange={e => setFormData(p => ({ ...p, level: e.target.value }))}
                    className="w-full bg-white border border-gray-200 rounded-md py-2.5 px-3.5 text-xs font-medium focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none transition-all"
                  >
                    {LEVELS.map(l => (
                      <option key={l} value={l} className="capitalize">{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Course Price (₹)</label>
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData(p => ({ ...p, price: e.target.value }))}
                    placeholder="0 for Free Courses"
                    min="0"
                    className="w-full bg-white border border-gray-200 rounded-md py-2.5 pl-9 pr-3.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2 text-xs font-bold text-white bg-[#0078FF] rounded-md hover:bg-blue-600 disabled:opacity-60 transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  {formLoading ? 'Saving...' : (editingCourse ? 'Update Course' : 'Create Course')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCourse;
