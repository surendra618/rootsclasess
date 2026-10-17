import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { Pencil, Trash2, Plus, X, Eye, Video, SlidersHorizontal } from 'lucide-react';
import api from '../../services/adminendpoint';
import Loader from '../../components/AdminComponent/Loader';

const ManageSlider = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSlider, setSelectedSlider] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    buttonText: '',
    classText: '',
    isDefault: false,
    desktopImage: null,
    tabletImage: null,
    mobileImage: null
  });

  const [imagePreviews, setImagePreviews] = useState({
    desktopImage: '',
    tabletImage: '',
    mobileImage: ''
  });

  const imageFields = [
    {
      key: 'desktopImage',
      label: 'Desktop Banner',
      hint: 'Recommended size: 2250 x 500 px (ratio 4.5:1)'
    },
    {
      key: 'tabletImage',
      label: 'Tablet Banner',
      hint: 'Recommended size: 1750 x 500 px (ratio 3.5:1)'
    },
    {
      key: 'mobileImage',
      label: 'Mobile Banner',
      hint: 'Recommended size: 1200 x 600 px (ratio 2:1)'
    }
  ];

  const fetchSliders = async () => {
    setLoading(true);
    try {
      const response = await axios.post(api.slider.getSlider);
      if (response.data.success) {
        setSliders(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch sliders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e, imageKey) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, [imageKey]: file }));
      setImagePreviews(prev => ({ ...prev, [imageKey]: URL.createObjectURL(file) }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      buttonText: '',
      classText: '',
      isDefault: false,
      desktopImage: null,
      tabletImage: null,
      mobileImage: null
    });

    setImagePreviews({
      desktopImage: '',
      tabletImage: '',
      mobileImage: ''
    });
    setIsEditing(false);
    setSelectedSlider(null);
  };

  const handleCreateClick = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditClick = (slider) => {
    setIsEditing(true);
    setSelectedSlider(slider);
    setFormData({
      title: slider.title || '',
      subtitle: slider.subtitle || '',
      buttonText: slider.buttonText || '',
      classText: slider.classText || '',
      isDefault: slider.isDefault || false,
      desktopImage: null,
      tabletImage: null,
      mobileImage: null
    });

    setImagePreviews({
      desktopImage: slider.desktopImage || slider.image || '',
      tabletImage: slider.tabletImage || slider.desktopImage || slider.image || '',
      mobileImage: slider.mobileImage || slider.tabletImage || slider.desktopImage || slider.image || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      if (isEditing) {
        formDataToSend.append("sliderId", selectedSlider?._id);
      }

      formDataToSend.append('title', formData.title);
      formDataToSend.append('subtitle', formData.subtitle);
      formDataToSend.append('buttonText', formData.buttonText);
      formDataToSend.append('classText', formData.classText);
      formDataToSend.append('isDefault', formData.isDefault);

      if (formData.desktopImage) {
        formDataToSend.append('desktopImage', formData.desktopImage);
      }

      if (formData.tabletImage) {
        formDataToSend.append('tabletImage', formData.tabletImage);
      }

      if (formData.mobileImage) {
        formDataToSend.append('mobileImage', formData.mobileImage);
      }

      if (!isEditing && (!formData.desktopImage || !formData.tabletImage || !formData.mobileImage)) {
        toast.error('Desktop, tablet and mobile images are required');
        setLoading(false);
        return;
      }

      let response;
      if (isEditing) {
        response = await axios.post(api.slider.editSlider, formDataToSend);
        if (response.data.success) {
          toast.success('Slider updated successfully');
        }
      } else {
        response = await axios.post(api.slider.createSlider, formDataToSend);
        if (response.data.success) {
          toast.success('Slider created successfully');
        }
      }

      setShowModal(false);
      resetForm();
      fetchSliders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slider) => {
    if (window.confirm(`Are you sure you want to delete this slider?`)) {

      setLoading(true);
      try {
        const response = await axios.post(api.slider.deleteSlider, {
          sliderId: slider._id
        });
        console.log(response);
        if (response.data.success) {
          toast.success('Slider deleted successfully');
          fetchSliders();
        }
      } catch (error) {
        toast.error('Failed to delete slider');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  // --- Video Success Stories (Success Stories in Action) Logic ---
  const [videoStories, setVideoStories] = useState([]);
  const [vLoading, setVLoading] = useState(false);
  const [vShowModal, setVShowModal] = useState(false);
  const [vIsEditing, setVIsEditing] = useState(false);
  const [selectedV, setSelectedV] = useState(null);
  const [vFormData, setVFormData] = useState({
    title: '',
    youtubeUrl: '',
    duration: '00:00',
    order: 0,
    isActive: true
  });

  const fetchVideoStories = async () => {
    setVLoading(true);
    try {
      const res = await axios.get(api.successStory.get);
      if (res.data.success) {
        setVideoStories(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch video stories');
    } finally {
      setVLoading(false);
    }
  };

  useEffect(() => {
    fetchVideoStories();
  }, []);

  const handleVInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetVForm = () => {
    setVFormData({
      title: '',
      youtubeUrl: '',
      duration: '00:00',
      order: videoStories.length,
      isActive: true
    });
    setVIsEditing(false);
    setSelectedV(null);
  };

  const handleVSubmit = async (e) => {
    e.preventDefault();
    setVLoading(true);
    try {
      if (vIsEditing) {
        const res = await axios.post(api.successStory.update, {
          storyId: selectedV._id,
          ...vFormData
        });
        if (res.data.success) toast.success('Video story updated');
      } else {
        const res = await axios.post(api.successStory.create, vFormData);
        if (res.data.success) toast.success('Video story added');
      }
      setVShowModal(false);
      fetchVideoStories();
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setVLoading(false);
    }
  };

  const handleVDelete = async (id) => {
    if (window.confirm('Delete this video story?')) {
      try {
        const res = await axios.post(api.successStory.delete, { storyId: id });
        if (res.data.success) {
          toast.success('Video deleted');
          fetchVideoStories();
        }
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  if (loading || vLoading) {
    return <Loader message="Loading Slider Management..." />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-12">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200/80 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-md bg-blue-50 text-[#0078FF]">
                <SlidersHorizontal size={15} />
              </span>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Hero & Carousel Controls
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Manage Sliders</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Create, edit, and manage homepage hero sliders and promotional banners.</p>
          </div>
          <button
            onClick={handleCreateClick}
            className="flex items-center justify-center gap-1.5 bg-[#0078FF] hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all text-xs font-medium shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus size={15} />
            <span>Add Slider</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Mobile Card View - For screens below 768px */}
        <div className="block md:hidden space-y-3 sm:space-y-4">
          {sliders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-xs border border-gray-200/80 p-8 sm:p-12 text-center">
              <div className="text-gray-400">
                <Eye size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No sliders found</p>
                <button
                  onClick={handleCreateClick}
                  className="mt-2 text-[#0078FF] hover:underline text-xs font-semibold"
                >
                  Create your first slider
                </button>
              </div>
            </div>
          ) : (
            sliders.map((slider) => (
              <div key={slider._id} className="bg-white rounded-xl shadow-xs border border-gray-200/80 overflow-hidden p-3.5 sm:p-4">
                <div className="flex gap-3">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200/70">
                      {slider.desktopImage || slider.image ? (
                        <img
                          src={slider.desktopImage || slider.image}
                          alt={slider.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/80x60?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Eye size={18} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {slider.title || "Slider Image"}
                      </div>
                      {slider.isDefault && (
                        <span className="px-1.5 py-0.5 text-[9px] font-medium bg-emerald-50 text-emerald-700 rounded border border-emerald-200 uppercase">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 font-normal mt-1">
                      {slider.createdAt ? new Date(slider.createdAt).toLocaleDateString() : "Recent"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => handleEditClick(slider)}
                      className="p-1.5 rounded-md bg-blue-50 text-[#0078FF] hover:bg-blue-100 border border-blue-200/80 transition cursor-pointer"
                      title="Edit"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(slider)}
                      className="p-1.5 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/80 transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View - 100% Fit, Zero Horizontal Scrollbar */}
        <div className="hidden md:block bg-white rounded-xl shadow-xs border border-gray-200/80 overflow-hidden w-full">
          <table className="w-full table-fixed text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-gray-200 text-gray-500">
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider w-[15%]">
                  Image
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider w-[45%]">
                  Slider Preview
                </th>
                <th className="px-3 py-3.5 text-xs font-semibold uppercase tracking-wider text-center w-[20%]">
                  Created At
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-center w-[20%]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sliders.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-12 text-center">
                    <div className="text-gray-400">
                      <Eye size={40} className="mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No sliders found</p>
                      <button
                        onClick={handleCreateClick}
                        className="mt-2 text-[#0078FF] hover:underline text-xs font-semibold cursor-pointer"
                      >
                        Create your first slider
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sliders.map((slider) => (
                  <tr key={slider._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                      <div className="w-16 h-11 rounded-lg overflow-hidden bg-gray-100 border border-gray-200/70 shadow-xs">
                        {slider.desktopImage || slider.image ? (
                          <img
                            src={slider.desktopImage || slider.image}
                            alt={slider.title || 'Slider image'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/80x50?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Eye size={18} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold text-gray-900 tracking-tight truncate">
                            {slider.title || "Slider Image"}
                          </div>
                          {slider.isDefault && (
                            <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 uppercase tracking-wider">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        {slider.subtitle && (
                          <div className="text-xs text-gray-400 font-normal truncate mt-0.5">
                            {slider.subtitle}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-3 py-3.5 align-middle whitespace-nowrap text-xs sm:text-sm text-gray-500 font-normal text-center">
                      {slider.createdAt ? new Date(slider.createdAt).toLocaleDateString() : "Recent"}
                    </td>
                    <td className="px-4 py-3.5 align-middle text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                        <button
                          onClick={() => handleEditClick(slider)}
                          className="p-1.5 rounded-md bg-blue-50 text-[#0078FF] hover:bg-blue-100 border border-blue-200/80 transition cursor-pointer"
                          title="Edit Slider"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(slider)}
                          className="p-1.5 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/80 transition cursor-pointer"
                          title="Delete Slider"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Section Divider */}
        <div className="my-10 border-t border-gray-200/80" />

        {/* --- Video Success Stories (Success Stories in Action) Section --- */}
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-md bg-rose-50 text-[#FB0500]">
                <Video size={15} />
              </span>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Video Testimonials
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Success Stories in Action</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage video stories and YouTube-based student feedback.</p>
          </div>
          <button
            onClick={() => { resetVForm(); setVShowModal(true); }}
            className="flex items-center justify-center gap-1.5 bg-[#FB0500] hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all text-xs font-medium shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Video size={15} />
            <span>Add Video Story</span>
          </button>
        </div>

        {/* Mobile Card View for Video Stories - For screens below 768px */}
        <div className="block md:hidden space-y-3 sm:space-y-4 mb-16">
          {vLoading && videoStories.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FB0500]"></div>
            </div>
          ) : videoStories.length === 0 ? (
            <div className="bg-white rounded-xl shadow-xs border border-gray-200/80 p-8 text-center text-gray-400 text-xs">
              <Video size={36} className="mx-auto mb-2 text-gray-300" />
              <p>No video stories found.</p>
            </div>
          ) : (
            videoStories.map((v) => (
              <div key={v._id} className="bg-white rounded-xl shadow-xs border border-gray-200/80 overflow-hidden p-3.5 sm:p-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-24 aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200/70">
                    <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="text-sm font-semibold text-gray-900 line-clamp-1">{v.title}</div>
                    <div className="text-[10px] text-gray-400 mt-1 flex flex-wrap gap-2 items-center">
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">⏱ {v.duration || "N/A"}</span>
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">Order: {v.order}</span>
                    </div>
                    <div className="mt-1.5">
                      {v.isActive ? (
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">ACTIVE</span>
                      ) : (
                        <span className="text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 uppercase">INACTIVE</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 justify-start">
                    <button onClick={() => {
                      setVIsEditing(true);
                      setSelectedV(v);
                      setVFormData({ title: v.title, youtubeUrl: v.youtubeUrl, duration: v.duration, order: v.order, isActive: v.isActive });
                      setVShowModal(true);
                    }} className="p-1.5 rounded-md bg-blue-50 text-[#0078FF] hover:bg-blue-100 border border-blue-200/80 transition cursor-pointer">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleVDelete(v._id)} className="p-1.5 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/80 transition cursor-pointer">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View for Video Stories - 100% Fit, Zero Horizontal Scrollbar */}
        <div className="hidden md:block bg-white rounded-xl shadow-xs border border-gray-200/80 overflow-hidden mb-16 w-full">
          <table className="w-full table-fixed text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-gray-200 text-gray-500">
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider w-[15%]">Video Thumbnail</th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider w-[37%]">Title</th>
                <th className="px-3 py-3.5 text-xs font-semibold uppercase tracking-wider text-center w-[12%]">Duration</th>
                <th className="px-3 py-3.5 text-xs font-semibold uppercase tracking-wider text-center w-[10%]">Order</th>
                <th className="px-3 py-3.5 text-xs font-semibold uppercase tracking-wider text-center w-[12%]">Status</th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-center w-[14%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vLoading && videoStories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10">
                    <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#FB0500] mx-auto" />
                  </td>
                </tr>
              ) : videoStories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-400 text-xs">
                    No video stories found.
                  </td>
                </tr>
              ) : (
                videoStories.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                      <div className="w-20 aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200/70 shadow-xs">
                        <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 tracking-tight truncate" title={v.title}>
                          {v.title}
                        </div>
                        <div className="text-xs text-gray-400 font-normal truncate mt-0.5" title={v.youtubeUrl}>
                          {v.youtubeUrl}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 align-middle whitespace-nowrap text-xs sm:text-sm text-gray-500 font-normal text-center">
                      {v.duration || "—"}
                    </td>
                    <td className="px-3 py-3.5 align-middle whitespace-nowrap text-xs sm:text-sm font-medium text-gray-700 text-center">
                      {v.order}
                    </td>
                    <td className="px-3 py-3.5 align-middle whitespace-nowrap text-center">
                      {v.isActive ? (
                        <span className="inline-block px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md uppercase tracking-wider">
                          Active
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200 rounded-md uppercase tracking-wider">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 align-middle text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setVIsEditing(true);
                            setSelectedV(v);
                            setVFormData({ title: v.title, youtubeUrl: v.youtubeUrl, duration: v.duration, order: v.order, isActive: v.isActive });
                            setVShowModal(true);
                          }}
                          className="p-1.5 rounded-md bg-blue-50 text-[#0078FF] hover:bg-blue-100 border border-blue-200/80 transition cursor-pointer"
                          title="Edit Video Story"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleVDelete(v._id)}
                          className="p-1.5 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/80 transition cursor-pointer"
                          title="Delete Video Story"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Slider Modal --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                {isEditing ? 'Edit Slider' : 'Create New Slider'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
              {/* Text Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. JEE Preparation"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Best coaching for JEE"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    name="buttonText"
                    value={formData.buttonText}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Join Now"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class Text</label>
                  <input
                    type="text"
                    name="classText"
                    value={formData.classText}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Class 11 & 12"
                    required
                  />
                </div>
              </div>

              {/* Default Option */}
              <div className="flex items-center gap-2 mb-6">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
                  Set as Default (This will be shown first and as a fallback)
                </label>
              </div>

              {/* Image Uploads */}
              <div className="mb-6">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Responsive Banner Images {!isEditing && <span className="text-red-500">*</span>}
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Upload all three sizes so the homepage can show the best banner on desktop, tablet, and mobile without cropping.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {imageFields.map(({ key, label, hint }) => (
                    <div key={key} className="rounded-xl border border-gray-200 p-4">
                      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <label className="text-sm font-semibold text-gray-700">
                          {label} {!isEditing && <span className="text-red-500">*</span>}
                        </label>
                        <span className="text-xs font-medium text-blue-600">{hint}</span>
                      </div>

                      <div className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-4 pt-4 pb-5 transition-colors hover:border-blue-500">
                        <div className="space-y-1 text-center">
                          {imagePreviews[key] ? (
                            <div className="relative inline-block">
                              <img
                                src={imagePreviews[key]}
                                alt={`${label} preview`}
                                className="mx-auto h-28 w-auto rounded-lg object-contain sm:h-32"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setImagePreviews(prev => ({ ...prev, [key]: '' }));
                                  setFormData(prev => ({ ...prev, [key]: null }));
                                }}
                                className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <svg
                                className="mx-auto h-10 w-10 text-gray-400 sm:h-12 sm:w-12"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                              >
                                <path
                                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <div className="flex justify-center text-xs text-gray-600 sm:text-sm">
                                <label
                                  htmlFor={`${key}-upload`}
                                  className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                                >
                                  <span>Upload {label.toLowerCase()}</span>
                                  <input
                                    id={`${key}-upload`}
                                    name={key}
                                    type="file"
                                    className="sr-only"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e, key)}
                                  />
                                </label>
                              </div>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF or WebP up to 5MB</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {isEditing && (
                  <p className="mt-2 text-xs text-gray-500">
                    Leave any image unchanged if you want to keep the current uploaded version for that device size.
                  </p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 text-sm sm:text-base"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    isEditing ? 'Update Slider' : 'Create Slider'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Video Success Story Modal --- */}
      {vShowModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">{vIsEditing ? 'Edit Video Story' : 'Add Video Story'}</h2>
              <button onClick={() => setVShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleVSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Video Title</label>
                <input type="text" name="title" value={vFormData.title} onChange={handleVInputChange} className="w-full px-4 py-2 bg-gray-50 border rounded-xl" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">YouTube URL</label>
                <input type="url" name="youtubeUrl" value={vFormData.youtubeUrl} onChange={handleVInputChange} className="w-full px-4 py-2 bg-gray-50 border rounded-xl" placeholder="https://www.youtube.com/watch?v=..." required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duration</label>
                  <input type="text" name="duration" value={vFormData.duration} onChange={handleVInputChange} className="w-full px-4 py-2 bg-gray-50 border rounded-xl" placeholder="e.g. 12:45" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Order</label>
                  <input type="number" name="order" value={vFormData.order} onChange={handleVInputChange} className="w-full px-4 py-2 bg-gray-50 border rounded-xl" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="isActive" checked={vFormData.isActive} onChange={handleVInputChange} id="v-active" className="w-4 h-4 text-[#FB0500] border-gray-300 rounded focus:ring-[#FB0500]" />
                <label htmlFor="v-active" className="text-sm font-semibold text-gray-700">Active (Show in carousel)</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setVShowModal(false)} className="flex-1 px-4 py-2.5 border rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={vLoading} className="flex-1 px-4 py-2.5 bg-[#FB0500] text-white rounded-xl font-bold hover:shadow-lg transition">
                  {vLoading ? 'Saving...' : vIsEditing ? 'Update Story' : 'Add Story'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSlider;
