"use client";

import { useState, useEffect } from "react";
import { Star, Trash2, Edit2, Plus, X, Upload, Image as ImageIcon } from "lucide-react";
import axios from "axios";
import api from "../../services/adminendpoint";
import Loader from "../../components/AdminComponent/Loader";

export default function AdminTestimonials() {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [selectedId, setSelectedId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        achievement: "",
        Course: "",
        review: "",
        rating: 5,
        image: ''
    });
    const [notification, setNotification] = useState({ show: false, message: "", type: "" });

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        setLoading(true);
        try {
            const response = await axios.post(api.testimonial.getTestimonial);
            console.log("API Response:", response);
            
            if (response.data && response.data.success && response.data.data) {
                if (Array.isArray(response.data.data)) {
                    setTestimonials(response.data.data);
                } else if (response.data.data.data && Array.isArray(response.data.data.data)) {
                    setTestimonials(response.data.data.data);
                } else {
                    setTestimonials([]);
                }
            } else {
                setTestimonials([]);
            }
        } catch (error) {
            console.error("Error fetching testimonials:", error);
            showNotification("Failed to fetch testimonials", "error");
            setTestimonials([]);
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showNotification("Image size should be less than 2MB", "error");
                return;
            }

            if (!file.type.startsWith('image/')) {
                showNotification("Please upload an image file", "error");
                return;
            }

            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRatingChange = (rating) => {
        setFormData((prev) => ({ ...prev, rating }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setIsSubmitting(true);
        
        try {
            const formDataToSend = new FormData();
            if (editingTestimonial) {
                formDataToSend.append("testimonialId", editingTestimonial._id);
            }
            formDataToSend.append("name", formData.name);
            formDataToSend.append("achievement", formData.achievement);
            formDataToSend.append("Course", formData.Course);
            formDataToSend.append("review", formData.review);
            formDataToSend.append("rating", formData.rating);
            
            if (imageFile) {
                formDataToSend.append("image", imageFile);
            } else if (editingTestimonial && formData.image) {
                formDataToSend.append("existingImage", formData.image);
            }

            let response;
            if (editingTestimonial) {
                response = await axios.post(api.testimonial.editTestimonial, formDataToSend, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                if (response.data.success) {
                    showNotification("Testimonial updated successfully!", "success");
                    await fetchTestimonials();
                }
            } else {
                response = await axios.post(api.testimonial.addTestimonial, formDataToSend, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                if (response.data.success) {
                    showNotification("Testimonial added successfully!", "success");
                    await fetchTestimonials(); 
                }
            }
            
            closeModal();
        } catch (error) {
            console.error("Error saving testimonial:", error);
            showNotification(error.response?.data?.message || "Failed to save testimonial", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this testimonial?")) return;
        
        try {
            const response = await axios.post(api.testimonial.deleteTestimonial, {
                testimonialId: id  
            });
            
            if (response.data.success) {
                showNotification("Testimonial deleted successfully!", "success");
                await fetchTestimonials(); 
            }
        } catch (error) {
            console.error("Error deleting testimonial:", error);
            showNotification("Failed to delete testimonial", "error");
        }
    };

    const handleEdit = (testimonial) => {
        if (!testimonial) return;
        setSelectedId(testimonial._id);
        setEditingTestimonial(testimonial);
        setFormData({
            name: testimonial.name || "",
            image: testimonial.image || "",
            achievement: testimonial.achievement || "",
            Course: testimonial.Course || "",
            review: testimonial.review || "",
            rating: testimonial.rating || 5,
        });
        setImagePreview(testimonial.image || null);
        setImageFile(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTestimonial(null);
        setImagePreview(null);
        setImageFile(null);
        setFormData({
            name: "",
            achievement: "",
            Course: "",
            review: "",
            rating: 5,
            image: "",
        });
    };

    const StarRating = ({ rating, onRatingChange, readonly = false }) => {
        const safeRating = typeof rating === 'number' ? rating : parseInt(rating) || 0;
        
        return (
            <div className="flex gap-0.5 sm:gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => !readonly && onRatingChange(star)}
                        className={`${readonly ? "cursor-default" : "cursor-pointer"} focus:outline-none`}
                    >
                        <Star
                            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 ${star <= safeRating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                } ${!readonly && "hover:scale-110 transition-transform"}`}
                        />
                    </button>
                ))}
            </div>
        );
    };

    if (loading) {
        return <Loader message="Loading Testimonials..." />;
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200/80 sticky top-0 z-20 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Testimonials Management</h1>
                        <p className="text-xs text-gray-500 mt-1">Manage student testimonials, reviews, and success stories.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-[#0078FF] text-white px-4 py-2 rounded-md transition-all text-xs font-semibold shadow-xs"
                    >
                        <Plus size={16} />
                        <span>Add Testimonial</span>
                    </button>
                </div>
            </div>

            {/* Notification */}
            {notification.show && (
                <div
                    className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-md shadow-md text-xs font-semibold ${
                        notification.type === "success"
                            ? "bg-emerald-600 text-white"
                            : "bg-rose-600 text-white"
                    }`}
                >
                    {notification.message}
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">

                {/* Stats Cards - Responsive Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-5 sm:mb-6 md:mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                        <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{testimonials?.length || 0}</div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Total Testimonials</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                        <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                            {testimonials && testimonials.length > 0
                                ? (testimonials.reduce((sum, t) => sum + (parseInt(t?.rating) || 0), 0) / testimonials.length).toFixed(1)
                                : 0}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Average Rating</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                        <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                            {testimonials?.filter(t => parseInt(t?.rating || 0) === 5).length || 0}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">5-Star Reviews</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                        <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                            {testimonials?.filter(t => t?.Course).length || 0}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Courses Covered</div>
                    </div>
                </div>

                {/* Mobile Card View - For screens below 768px */}
                <div className="block md:hidden space-y-3 sm:space-y-4">
                    {testimonials && testimonials.length > 0 ? (
                        testimonials.map((testimonial) => (
                            <div key={testimonial?._id || Math.random()} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                                <div className="flex items-start gap-3">
                                    {/* Avatar */}
                                    <div className="flex-shrink-0">
                                        {testimonial?.image ? (
                                            <img
                                                src={testimonial.image}
                                                alt={testimonial.name}
                                                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                                                {testimonial?.name?.[0]?.toUpperCase() || "S"}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                                                    {testimonial?.name || "Anonymous"}
                                                </h3>
                                                <p className="text-xs text-gray-500">Student</p>
                                            </div>
                                            <div className="flex gap-1.5">
                                                <button
                                                    onClick={() => handleEdit(testimonial)}
                                                    className="text-blue-600 hover:text-blue-900 p-1"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(testimonial?._id)}
                                                    className="text-red-600 hover:text-red-900 p-1"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {testimonial?.Course && (
                                            <p className="text-xs text-gray-600 mt-1 font-medium">
                                                📚 {testimonial.Course}
                                            </p>
                                        )}
                                        
                                        {testimonial?.achievement && (
                                            <p className="text-xs text-blue-600 mt-0.5">
                                                🏆 {testimonial.achievement}
                                            </p>
                                        )}
                                        
                                        <div className="mt-2">
                                            <StarRating rating={testimonial?.rating || 0} readonly />
                                        </div>
                                        
                                        <p className="text-xs sm:text-sm text-gray-700 mt-2 line-clamp-3">
                                            {testimonial?.review}
                                        </p>
                                        
                                        <p className="text-xs text-gray-400 mt-2">
                                            {testimonial?.createdAt
                                                ? new Date(testimonial.createdAt).toLocaleDateString()
                                                : "Recent"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
                            <div className="text-sm sm:text-base text-gray-400">No testimonials found</div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="mt-3 sm:mt-4 text-blue-600 hover:text-blue-800 text-sm sm:text-base"
                            >
                                Add your first testimonial
                            </button>
                        </div>
                    )}
                </div>

                {/* Desktop Table View - For screens 768px and above */}
                <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student Info
                                    </th>
                                    <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Course & Achievement
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Review
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rating
                                    </th>
                                    <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {testimonials && testimonials.length > 0 ? (
                                    testimonials.map((testimonial) => (
                                        <tr key={testimonial?._id || Math.random()} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10">
                                                        {testimonial?.image ? (
                                                            <img
                                                                src={testimonial.image}
                                                                alt={testimonial.name}
                                                                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                                                {testimonial?.name?.[0]?.toUpperCase() || "S"}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {testimonial?.name || "Anonymous"}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Student
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="hidden lg:table-cell px-4 py-3">
                                                <div className="text-sm text-gray-900 font-medium">
                                                    {testimonial?.Course || "Not specified"}
                                                </div>
                                                {testimonial?.achievement && (
                                                    <div className="text-xs text-blue-600 mt-1">
                                                        🏆 {testimonial.achievement}
                                                    </div>
                                                )}
                                             </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm text-gray-900 max-w-xs lg:max-w-md truncate" title={testimonial?.review}>
                                                    {testimonial?.review?.length > 80
                                                        ? `${testimonial.review.substring(0, 80)}...`
                                                        : testimonial?.review}
                                                </div>
                                             </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <StarRating rating={testimonial?.rating || 0} readonly />
                                             </td>
                                            <td className="hidden lg:table-cell px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {testimonial?.createdAt
                                                    ? new Date(testimonial.createdAt).toLocaleDateString()
                                                    : "Recent"}
                                             </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(testimonial)}
                                                        className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(testimonial?._id)}
                                                        className="text-red-600 hover:text-red-900 transition-colors p-1"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                             </td>
                                         </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8 sm:py-12">
                                            <div className="text-sm text-gray-400">No testimonials found</div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="mt-3 text-blue-600 hover:text-blue-800"
                                            >
                                                Add your first testimonial
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add/Edit Modal - Responsive */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white flex justify-between items-center p-4 sm:p-6 border-b z-10">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                                    {editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 md:space-y-6">
                                {/* Image Upload - Responsive */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Student Image
                                    </label>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                                        <div className="flex-shrink-0 self-center sm:self-auto">
                                            {imagePreview ? (
                                                <div className="relative inline-block">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-full object-cover border-2 border-gray-300"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setImagePreview(null);
                                                            setImageFile(null);
                                                            setFormData(prev => ({ ...prev, image: "" }));
                                                        }}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-300">
                                                    <ImageIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 text-center sm:text-left">
                                            <label className="cursor-pointer inline-block">
                                                <div className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm md:text-base">
                                                    <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    <span>Choose Image</span>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Upload JPG, PNG or GIF (Max 2MB)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                        Student Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter student name"
                                    />
                                </div>

                                {/* Achievement */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                        Achievement
                                    </label>
                                    <input
                                        type="text"
                                        name="achievement"
                                        value={formData.achievement}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., Top Performer, Gold Medalist"
                                    />
                                </div>

                                {/* Course */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                        Course
                                    </label>
                                    <input
                                        type="text"
                                        name="Course"
                                        value={formData.Course}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., Full Stack Web Development"
                                    />
                                </div>

                                {/* Review */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                        Review <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="review"
                                        value={formData.review}
                                        onChange={handleInputChange}
                                        required
                                        rows={4}
                                        className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Write the student's review..."
                                    />
                                </div>

                                {/* Rating */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                        Rating
                                    </label>
                                    <StarRating
                                        rating={formData.rating}
                                        onRatingChange={handleRatingChange}
                                    />
                                </div>

                                {/* Buttons - Responsive */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base order-2 sm:order-1"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-1 sm:order-2"
                                    >
                                        {isSubmitting ? "Saving..." : editingTestimonial ? "Update" : "Add Testimonial"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}