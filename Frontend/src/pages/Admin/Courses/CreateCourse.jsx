import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/adminendpoint';

const AdminCourseManager = () => {
  const navigate = useNavigate()
  const [image, setImage] = useState(null);
  const [courseData, setCourseData] = useState({
    title: '',
    discreption: '',
    instructor: '',
    duration: '',
    level: 'Beginner',
    price: '',
    tags: '',
    featured: false,
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCourseData({
      ...courseData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size should be less than 10MB' });
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setMessage({ type: 'error', text: 'Only JPEG, JPG, PNG, and GIF files are allowed' });
        return;
      }

      setImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreviewUrl('');
  };

  const CreateCourse = async (e) => {
    e.preventDefault();

    setMessage({ type: '', text: '' });

    if (!courseData.title.trim()) {
      setMessage({ type: 'error', text: 'Course title is required' });
      return;
    }

    if (!courseData.discreption.trim()) {
      setMessage({ type: 'error', text: 'Course description is required' });
      return;
    }

    if (!courseData.instructor.trim()) {
      setMessage({ type: 'error', text: 'Instructor name is required' });
      return;
    }

    if (!courseData.duration.trim()) {
      setMessage({ type: 'error', text: 'Course duration is required' });
      return;
    }

    if (!courseData.price.trim()) {
      setMessage({ type: 'error', text: 'Course price is required' });
      return;
    }

    if (!image) {
      setMessage({ type: 'error', text: 'Course thumbnail is required' });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // Add text fields to FormData
      Object.keys(courseData).forEach((key) => {
        if (key === 'tags') {
          // Convert tags string to array if it contains commas
          const tagsArray = courseData.tags.split(',').map(tag => tag.trim());
          formData.append(key, JSON.stringify(tagsArray));
        } else if (key === 'featured') {
          formData.append(key, courseData[key].toString());
        } else {
          formData.append(key, courseData[key]);
        }
      });

      // Add image file
      formData.append("image", image);

      console.log("Sending course data...");

      const res = await axios.post(
        api.course.createcourse,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log(res.data, "Course Created Successfully");
      navigate('/admin/allcourses')
      toast.success("Course Created Successfully")
      setMessage({ type: 'success', text: 'Course created successfully!' });

      // Reset form
      setCourseData({
        title: '',
        discreption: '',
        instructor: '',
        duration: '',
        level: 'Beginner',
        price: '',
        tags: '',
        featured: false,
      });
      setImage(null);
      setPreviewUrl('');

      // Optional: Redirect after 2 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);

    } catch (error) {
      console.error("Error creating course:", error);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 md:p-8 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Sticky Header */}
        <div className="bg-white rounded-lg border border-gray-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#0078FF]"></span>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Course Management</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Create New Course</h1>
            <p className="text-xs text-gray-500 mt-0.5">Fill in the course parameters to publish a new course</p>
          </div>
          <button 
            onClick={() => navigate('/admin/allcourses')} 
            className="px-3.5 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-gray-100 transition-all shadow-xs"
          >
            ← Back to Courses
          </button>
        </div>

        {/* Alert Message */}
        {message.text && (
          <div className={`p-4 rounded-md border text-xs font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Create Course Form */}
        <div className="bg-white rounded-lg border border-gray-200/80 shadow-xs overflow-hidden">
          <form className="p-6 space-y-5 text-xs" onSubmit={CreateCourse}>
            {/* Course Title */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5">
                Course Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={courseData.title}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none text-xs font-medium transition-all"
                placeholder="e.g., Advanced React & Next.js Development"
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5">
                Course Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="discreption"
                value={courseData.discreption}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none text-xs font-medium transition-all"
                placeholder="Detailed explanation of course curriculum, modules, and target audience..."
                disabled={loading}
              />
            </div>

            {/* Instructor */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5">
                Lead Instructor <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="instructor"
                value={courseData.instructor}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none text-xs font-medium transition-all"
                placeholder="e.g., Dr. Rajesh Sharma"
                disabled={loading}
              />
            </div>

            {/* Duration and Price - Two Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">
                  Course Duration <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="duration"
                  value={courseData.duration}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none text-xs font-medium transition-all"
                  placeholder="e.g., 6 Months"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">
                  Course Price (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="price"
                  value={courseData.price}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none text-xs font-medium transition-all"
                  placeholder="e.g., 4999"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Level and Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">
                  Skill Level
                </label>
                <select
                  name="level"
                  value={courseData.level}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none text-xs font-medium transition-all"
                  disabled={loading}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={courseData.tags}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none text-xs font-medium transition-all"
                  placeholder="e.g., JEE, Class 12, Physics"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5">
                Course Cover Image <span className="text-rose-500">*</span>
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-gray-200 border-dashed rounded-md hover:border-[#0078FF] transition-all bg-gray-50/50">
                <div className="space-y-1 text-center">
                  {previewUrl ? (
                    <div className="mb-3">
                      <img src={previewUrl} alt="Preview" className="h-40 w-full object-cover rounded-md border border-gray-200" />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="mt-2 text-xs text-rose-600 hover:text-rose-800 font-semibold"
                        disabled={loading}
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-xs text-gray-600 justify-center">
                        <label className="relative cursor-pointer bg-white rounded-md font-bold text-[#0078FF] hover:text-blue-700">
                          <span>Upload Cover Image</span>
                          <input
                            type="file"
                            name="image"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={loading}
                          />
                        </label>
                      </div>
                      <p className="text-[11px] text-gray-400">PNG, JPG, GIF up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Featured Checkbox */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                name="featured"
                id="featured"
                checked={courseData.featured}
                onChange={handleInputChange}
                className="h-4 w-4 text-[#0078FF] focus:ring-[#0078FF] border-gray-300 rounded"
                disabled={loading}
              />
              <label htmlFor="featured" className="block text-xs font-semibold text-gray-700 select-none">
                Feature this course on the student homepage
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-[#0078FF] text-white py-2.5 px-4 rounded-md hover:bg-blue-600 transition-all font-bold text-xs uppercase tracking-wider shadow-xs ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Publishing Course...' : 'Create & Publish Course'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCourseManager;