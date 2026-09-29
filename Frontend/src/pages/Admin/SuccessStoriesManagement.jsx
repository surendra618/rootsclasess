import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, ExternalLink, Video, Save, X } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/endpoints';
import Loader from '../../components/AdminComponent/Loader';

const SuccessStoriesManagement = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    youtubeUrl: '',
    duration: '00:00',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(api.successStory.adminGet);
      if (res.data.success) {
        setStories(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch success stories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStory) {
        const res = await axios.post(api.successStory.update, {
          storyId: editingStory._id,
          ...formData
        });
        if (res.data.success) {
          toast.success('Story updated successfully');
          setIsModalOpen(false);
          fetchStories();
        }
      } else {
        const res = await axios.post(api.successStory.add, formData);
        if (res.data.success) {
          toast.success('Story added successfully');
          setIsModalOpen(false);
          fetchStories();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      try {
        const res = await axios.post(api.successStory.delete, { storyId: id });
        if (res.data.success) {
          toast.success('Story deleted successfully');
          fetchStories();
        }
      } catch (error) {
        toast.error('Failed to delete story');
      }
    }
  };

  const openAddModal = () => {
    setEditingStory(null);
    setFormData({
      title: '',
      youtubeUrl: '',
      duration: '00:00',
      order: stories.length,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (story) => {
    setEditingStory(story);
    setFormData({
      title: story.title,
      youtubeUrl: story.youtubeUrl,
      duration: story.duration,
      order: story.order,
      isActive: story.isActive
    });
    setIsModalOpen(true);
  };

  if (loading) {
    return <Loader message="Loading Success Stories..." />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 md:p-8 space-y-6">
      {/* Sticky Header */}
      <div className="bg-white rounded-lg border border-gray-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#0078FF]"></span>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Video Gallery</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Success Stories Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage YouTube student success story videos showcased on the main website</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center space-x-2 bg-[#0078FF] text-white px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-blue-600 transition-all shadow-xs"
        >
          <Plus size={16} />
          <span>Add New Video</span>
        </button>
      </div>

      {stories.length === 0 ? (
        <div className="bg-white rounded-lg border border-dashed border-gray-200 py-16 text-center">
          <Video className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-sm font-bold text-gray-900">No success stories found</h3>
          <p className="text-xs text-gray-500 mt-1">Start by adding your first student success story video.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <div key={story._id} className="bg-white rounded-lg border border-gray-200/80 shadow-xs overflow-hidden group hover:border-gray-300 transition-all">
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={story.thumbnailUrl}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center space-x-3">
                  <button
                    onClick={() => openEditModal(story)}
                    className="p-2 bg-white rounded-md text-blue-600 hover:bg-[#0078FF] hover:text-white transition-all shadow-xs"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(story._id)}
                    className="p-2 bg-white rounded-md text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-xs"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/75 text-white text-[10px] font-mono rounded-md">
                  {story.duration}
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2 flex-1">{story.title}</h3>
                  {!story.isActive && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-md uppercase font-bold border border-gray-200">Draft</span>
                  )}
                </div>
                <div className="flex items-center text-xs text-gray-500 space-x-4 pt-2 border-t border-gray-100">
                  <div className="flex items-center font-medium">
                    <Video size={14} className="mr-1 text-[#0078FF]" />
                    <span>YouTube</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-1.5"></span>
                    <span>Order: {story.order}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-lg border border-gray-200/80 w-full max-w-md shadow-2xl overflow-hidden scale-in">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-base font-bold text-gray-900">
                {editingStory ? 'Edit Video' : 'Add New Video'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600 transition-all">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Video Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Success Story: From Average to Topper"
                  className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">YouTube URL</label>
                <input
                  type="url"
                  name="youtubeUrl"
                  value={formData.youtubeUrl}
                  onChange={handleInputChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none transition-all"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="15:24"
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded text-[#0078FF] focus:ring-[#0078FF]"
                />
                <label htmlFor="isActive" className="font-semibold text-gray-700 select-none">
                  Active (Show on main website)
                </label>
              </div>
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#0078FF] text-white rounded-md hover:bg-blue-600 transition-all font-semibold flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <Save size={16} />
                  <span>{editingStory ? 'Update Video' : 'Add Video'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuccessStoriesManagement;
