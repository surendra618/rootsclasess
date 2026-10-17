import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../../services/adminendpoint';
import Loader from '../../../components/AdminComponent/Loader';
import { Plus, Search, Edit2, Trash2, FolderPlus, Layers, Calendar, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react';

const CourseCategory = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(api.category.getcategory);
      
      let categoriesData = [];
      if (response.data && response.data.data) {
        categoriesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response.data && response.data.categories) {
        categoriesData = response.data.categories;
      } else {
        categoriesData = [];
      }
      
      setCategories(categoriesData);
      setError('');
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setLoading(true);
      
      if (isEditMode && selectedCategory) {
        const categoryId = selectedCategory._id || selectedCategory.id;
        await axios.post(
          api.category.UpdateCategory,
          {
            categoryId: categoryId,  
            name: formData.name.trim(),
            description: formData.description.trim()
          },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setSuccessMessage('Category updated successfully!');
      } else {
        await axios.post(
          api.category.createcategory,
          {
            name: formData.name.trim(),
            description: formData.description.trim()
          },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setSuccessMessage('Category created successfully!');
      }
      
      setFormData({ name: '', description: '' });
      setIsModalOpen(false);
      setIsEditMode(false);
      setSelectedCategory(null);
      
      await fetchCategories();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} category`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setIsEditMode(true);
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setIsModalOpen(true);
    setError('');
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        setLoading(true);
        await axios.post(
          api.category.deletecategory,
          { categoryId },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setSuccessMessage('Category deleted successfully!');
        await fetchCategories();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete category');
      } finally {
        setLoading(false);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedCategory(null);
    setFormData({ name: '', description: '' });
    setError('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredCategories = categories.filter((cat) => {
    const name = cat?.name?.toLowerCase() || '';
    const desc = cat?.description?.toLowerCase() || '';
    const q = searchTerm.toLowerCase().trim();
    return name.includes(q) || desc.includes(q);
  });

  if (loading && categories.length === 0) {
    return <Loader message="Loading categories..." />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-12 w-full max-w-full overflow-x-hidden">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-[#0078FF]">
                <Layers size={18} />
              </span>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">Course Categories</h1>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Manage and organize all curriculum subject streams.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsEditMode(false);
                setSelectedCategory(null);
                setFormData({ name: '', description: '' });
                setIsModalOpen(true);
                setError('');
              }}
              className="bg-[#0078FF] hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={15} />
              <span>Add Category</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-5">
        {/* Alerts without drop shadow */}
        {successMessage && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between gap-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-800 text-base font-bold">×</button>
          </div>
        )}

        {/* Search & Counter Bar - Flat & Clean */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search category name or description..."
              className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0078FF] transition"
            />
          </div>
          <div className="text-sm font-semibold text-gray-500">
            Total Categories: <span className="text-gray-900 font-bold">{categories.length}</span>
          </div>
        </div>

        {/* Content Container - No Shadow, Clean Border */}
        {filteredCategories.length > 0 ? (
          <>
            {/* Mobile Card List */}
            <div className="block md:hidden space-y-3">
              {filteredCategories.map((category, index) => (
                <div key={category._id} className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0078FF] border border-blue-100 flex items-center justify-center font-bold text-sm shrink-0">
                        {category.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-gray-900 truncate">{category.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{category.description || 'No description provided'}</p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Calendar size={12} /> {formatDate(category.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(category)}
                      className="px-3.5 py-1.5 rounded-md bg-blue-50 text-[#0078FF] hover:bg-blue-100 border border-blue-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="px-3.5 py-1.5 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View - Flat, Zero Shadow, Readable Font Sizes */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-gray-200 text-gray-600">
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider w-16">
                        S.No
                      </th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">
                        Category Name
                      </th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider w-36">
                        Created At
                      </th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-right w-44">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCategories.map((category, index) => (
                      <tr key={category._id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-5 py-4 text-sm font-semibold text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#0078FF] border border-blue-100 flex items-center justify-center font-bold text-sm shrink-0">
                              {category.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-gray-900 text-sm tracking-tight">
                              {category.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 max-w-md">
                          <span className="line-clamp-1" title={category.description}>
                            {category.description || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                          {formatDate(category.createdAt)}
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(category)}
                              className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0078FF] border border-blue-200/80 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
                              title="Edit Category"
                            >
                              <Edit2 size={13} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(category._id)}
                              className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
                              title="Delete Category"
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="bg-[#F8FAFC] px-5 py-3.5 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600 font-medium">
                <div>
                  Showing <span className="font-bold text-gray-900">{filteredCategories.length}</span> of <span className="font-bold text-gray-900">{categories.length}</span> categories
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-14 h-14 rounded-xl bg-blue-50 text-[#0078FF] border border-blue-100 flex items-center justify-center mx-auto mb-3">
              <FolderPlus size={24} />
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">
              {searchTerm ? 'No matching categories found' : 'No categories created yet'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {searchTerm ? 'Try a different search query.' : 'Create categories to organize your courses and tests.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => {
                  setIsEditMode(false);
                  setSelectedCategory(null);
                  setFormData({ name: '', description: '' });
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0078FF] hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                <Plus size={14} /> Add First Category
              </button>
            )}
          </div>
        )}

        {/* Modal for Add/Edit Category - Flat & Minimal */}
        {isModalOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn"
            onClick={closeModal}
          >
            <div 
              className="bg-white rounded-xl border border-gray-200 w-full max-w-md overflow-hidden text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 bg-[#F8FAFC]">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-blue-50 text-[#0078FF]">
                    <Layers size={16} />
                  </span>
                  <h3 className="text-sm font-bold text-gray-900">
                    {isEditMode ? 'Edit Category' : 'Create New Category'}
                  </h3>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-200/50 transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit}>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Category Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs font-medium bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#0078FF] transition"
                      placeholder="e.g. Science, Mathematics, English"
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Description <span className="text-gray-400 font-normal lowercase">(optional)</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 text-xs font-medium bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#0078FF] transition"
                      placeholder="Brief details about the subject curriculum..."
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-[#F8FAFC] px-5 py-3 border-t border-gray-200 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-white text-xs font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.name.trim()}
                    className="px-4 py-2 bg-[#0078FF] hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Category')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCategory;