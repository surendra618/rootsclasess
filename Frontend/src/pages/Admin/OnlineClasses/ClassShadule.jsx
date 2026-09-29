// // import React, { useState, useEffect } from 'react';
// // import { Calendar, Clock, Users, Plus, Trash2, Edit, X, BookOpen, Video, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
// // import axios from 'axios';
// // import api from '../../../services/adminendpoint';
// // import { toast } from 'react-toastify';
// // import { useNavigate } from 'react-router-dom';
// // import { useCourseStore } from '../../../Store/courseStore';

// // const ClassSchedule = () => {
// //     const navigate = useNavigate();
// //     const { setClassId, classId } = useCourseStore()
// //     const [courses, setCourses] = useState([]);
// //     const [isModalOpen, setIsModalOpen] = useState(false);
// //     const [editingCourse, setEditingCourse] = useState(null);
// //     const [loading, setLoading] = useState(true);
// //     const [searchTerm, setSearchTerm] = useState('');
// //     const [selectedDay, setSelectedDay] = useState('All');
// //     const [currentPage, setCurrentPage] = useState(1);
// //     const [itemsPerPage] = useState(10);
// //     const [studentCounts, setStudentCounts] = useState({});

// //     const [formData, setFormData] = useState({
// //         title: "",
// //         instructor: "",
// //         day: "Monday",
// //         time: "",
// //         duration: "",
// //         description: "",
// //         plateform: "Zoom",
// //         meetingLink: "",
// //         color: "blue",
// //         status: "Upcoming"
// //     });

// //     const days = ["All", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
// //     const colors = [
// //         { name: "blue", bg: "bg-blue-100", text: "text-blue-700", badge: "bg-blue-100 text-blue-800" },
// //         { name: "green", bg: "bg-green-100", text: "text-green-700", badge: "bg-green-100 text-green-800" },
// //         { name: "purple", bg: "bg-purple-100", text: "text-purple-700", badge: "bg-purple-100 text-purple-800" },
// //         { name: "orange", bg: "bg-orange-100", text: "text-orange-700", badge: "bg-orange-100 text-orange-800" },
// //         { name: "pink", bg: "bg-pink-100", text: "text-pink-700", badge: "bg-pink-100 text-pink-800" }
// //     ];

// //     const getColorStyles = (colorName) => {
// //         return colors.find(c => c.name === colorName) || colors[0];
// //     };

// //     const handleInputChange = (e) => {
// //         const { name, value } = e.target;
// //         setFormData({ ...formData, [name]: value });
// //     };

// //     const GetStdCount = async () => {
// //         try {
// //             const res = await axios.post(api.joinclass.getstdcount);
// //             console.log("Student count response:", res);
            
// //             if (res.data && res.data.success && res.data.data) {
// //                 const countData = res.data.data;
// //                 const countMap = {};
                
// //                 if (Array.isArray(countData)) {
// //                     countData.forEach(item => {
// //                         const classId = item._id || item.classId || item.id;
// //                         const count = item.studentCount || item.count || item.students || 0;
// //                         if (classId) {
// //                             countMap[classId] = count;
// //                         }
// //                     });
// //                 } else if (typeof countData === 'object') {
// //                     Object.keys(countData).forEach(key => {
// //                         countMap[key] = countData[key];
// //                     });
// //                 }
                
// //                 setStudentCounts(countMap);
                
// //                 setCourses(prevCourses => {
// //                     return prevCourses.map(course => ({
// //                         ...course,
// //                         students: countMap[course.id] || course.students || 0
// //                     }));
// //                 });
                
// //                 return countMap;
// //             }
// //         } catch (error) {
// //             console.error("Error fetching student count:", error);
// //             if (error.response?.status !== 404) {
// //                 toast.error("Failed to fetch student enrollment data");
// //             }
// //         }
// //     };

// //     const GetClass = async () => {
// //         try {
// //             setLoading(true);
// //             const res = await axios.post(api.onlineClass.getclass);
// //             console.log("Full API Response:", res);

// //             let allClasses = [];

// //             if (res.data && res.data.data && res.data.data.Allclass) {
// //                 allClasses = res.data.data.Allclass;
// //             }
// //             else if (res.data && res.data.Allclass) {
// //                 allClasses = res.data.Allclass;
// //             }
// //             else if (res.data && res.data.data && Array.isArray(res.data.data)) {
// //                 allClasses = res.data.data;
// //             }
// //             else if (res.data && Array.isArray(res.data)) {
// //                 allClasses = res.data;
// //             }

// //             if (Array.isArray(allClasses) && allClasses.length > 0) {
// //                 const formattedCourses = allClasses.map(item => ({
// //                     id: item._id || item.id,
// //                     title: item.title || "",
// //                     instructor: item.instructor || "",
// //                     day: item.day || "Monday",
// //                     time: item.time || "",
// //                     duration: item.duration || "",
// //                     students: item.studentCount || item.students || 0,
// //                     status: item.status || "active",
// //                     description: item.description || "",
// //                     plateform: item.plateform || item.platform || "Zoom",
// //                     meetingLink: item.meetingLink || "",
// //                     color: item.color || "blue",
// //                     createdAt: item.createdAt
// //                 }));

// //                 setCourses(formattedCourses);
// //                 await GetStdCount();
// //             } else {
// //                 setCourses([]);
// //                 toast.info("No classes found");
// //             }
// //         } catch (error) {
// //             console.error("Error fetching classes:", error);
// //             toast.error(error.response?.data?.message || error.message || "Failed to fetch classes");
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     const CreateClass = async (e) => {
// //         e.preventDefault();
// //         try {
// //             const res = await axios.post(api.onlineClass.createclass, formData);
// //             console.log("Create response:", res);

// //             if (res.data && (res.data.success || res.data.status === 200)) {
// //                 const newClassId = res.data.data?._id;
// //                 if (newClassId && setClassId) {
// //                     setClassId(newClassId);
// //                 }
// //                 console.log("Saved classId:", newClassId);
// //                 toast.success("Class created successfully");
// //                 resetForm();
// //                 await GetClass();
// //             } else {
// //                 toast.error(res.data?.message || "Failed to create class");
// //             }
// //         } catch (error) {
// //             console.error("Create error:", error);
// //             toast.error(error.response?.data?.message || error.message || "Failed to create class");
// //         }
// //     };

// //     const UpdateClass = async (e) => {
// //         e.preventDefault();
// //         try {
// //             const classToUpdate = editingCourse?.id || classId;
            
// //             if (!classToUpdate) {
// //                 toast.error("No class ID found for update");
// //                 return;
// //             }

// //             console.log("Updating class with ID:", classToUpdate);
            
// //             const res = await axios.post(api.onlineClass.editclass, {
// //                 ...formData,
// //                 classId: classToUpdate
// //             });
            
// //             console.log("Update response:", res);
            
// //             if (res.data && (res.data.success || res.data.status === 200)) {
// //                 toast.success("Class updated successfully");
// //                 resetForm();
// //                 await GetClass();
// //             } else {
// //                 toast.error(res.data?.message || "Failed to update class");
// //             }
// //         } catch (error) {
// //             console.error("Update error:", error);
// //             toast.error(error.response?.data?.message || error.message || "Failed to update class");
// //         }
// //     };

// //     const handleDelete = async (id) => {
// //         if (window.confirm("Are you sure you want to delete this course?")) {
// //             try {
// //                 setLoading(true);                
// //                 const response = await axios.post(api.onlineClass.deleteclass, { classId: id });
// //                 console.log("Delete response:", response);
                
// //                 if (response.data && (response.data.success || response.data.status === 200)) {
// //                     toast.success("Class deleted successfully");
// //                     await GetClass();
// //                 } else {
// //                     toast.error(response.data?.message || "Failed to delete class");
// //                 }
// //             } catch (error) {
// //                 console.error("Delete error:", error);
// //                 toast.error(error.response?.data?.message || error.message || "Failed to delete class");
// //             } finally {
// //                 setLoading(false);
// //             }
// //         }
// //     };

// //     const handleEdit = (course) => {
// //         if (setClassId) {
// //             setClassId(course.id);
// //         }
// //         setEditingCourse(course);
// //         setFormData({
// //             title: course.title,
// //             instructor: course.instructor,
// //             day: course.day,
// //             time: course.time,
// //             duration: course.duration,
// //             description: course.description || "",
// //             plateform: course.plateform || "Zoom",
// //             meetingLink: course.meetingLink || "",
// //             color: course.color || "blue",
// //             status: course.status || "Upcoming"
// //         });
// //         setIsModalOpen(true);
// //     };

// //     // Navigate to Topics page with classId
// //     const handleManageTopics = (courseId, courseTitle) => {
// //         if (setClassId) {
// //             setClassId(courseId);
// //         }
// //         console.log("Navigating to topics with classId:", courseId);
// //         toast.success(`Managing topics for: ${courseTitle}`);
// //         navigate('/admin/topics'); 
// //     };

// //     const resetForm = () => {
// //         setFormData({
// //             title: "",
// //             instructor: "",
// //             day: "Monday",
// //             time: "",
// //             duration: "",
// //             description: "",
// //             plateform: "Zoom",
// //             meetingLink: "",
// //             color: "blue",
// //             status: "Upcoming"
// //         });
// //         setEditingCourse(null);
// //         if (setClassId) {
// //             setClassId(null);
// //         }
// //         setIsModalOpen(false);
// //     };

// //     const refreshStudentCounts = async () => {
// //         await GetStdCount();
// //         toast.success("Student counts refreshed");
// //     };

// //     const filteredCourses = courses.filter(course => {
// //         const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //             course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
// //         const matchesDay = selectedDay === 'All' || course.day === selectedDay;
// //         return matchesSearch && matchesDay;
// //     });

// //     const indexOfLastItem = currentPage * itemsPerPage;
// //     const indexOfFirstItem = indexOfLastItem - itemsPerPage;
// //     const currentItems = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);
// //     const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

// //     const getDayColor = (day) => {
// //         const dayColors = {
// //             Monday: "bg-blue-100 text-blue-800",
// //             Tuesday: "bg-green-100 text-green-800",
// //             Wednesday: "bg-purple-100 text-purple-800",
// //             Thursday: "bg-orange-100 text-orange-800",
// //             Friday: "bg-pink-100 text-pink-800"
// //         };
// //         return dayColors[day] || "bg-gray-100 text-gray-800";
// //     };

// //     useEffect(() => {
// //         GetClass();
// //     }, []);

// //     if (loading) {
// //         return (
// //             <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
// //                 <div className="text-center">
// //                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
// //                     <p className="mt-4 text-gray-600">Loading classes...</p>
// //                 </div>
// //             </div>
// //         );
// //     }

// //     return (
// //         <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
// //             {/* Header */}
// //             <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
// //                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
// //                     <div className="flex justify-between items-center">
// //                         <div className="flex items-center space-x-3">
// //                             <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
// //                                 <Calendar className="w-6 h-6 text-white" />
// //                             </div>
// //                             <div>
// //                                 <h1 className="text-2xl font-bold text-gray-900">Class Schedule</h1>
// //                                 <p className="text-sm text-gray-500 mt-1">Manage your online courses and schedule</p>
// //                             </div>
// //                         </div>
// //                         <div className="flex space-x-3">
// //                             <button
// //                                 onClick={refreshStudentCounts}
// //                                 className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
// //                             >
// //                                 <Users className="w-5 h-5" />
// //                                 <span>Refresh Counts</span>
// //                             </button>
// //                             <button
// //                                 onClick={() => {
// //                                     resetForm();
// //                                     setIsModalOpen(true);
// //                                 }}
// //                                 className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
// //                             >
// //                                 <Plus className="w-5 h-5" />
// //                                 <span>Create class</span>
// //                             </button>
// //                         </div>
// //                     </div>
// //                 </div>
// //             </div>

// //             {/* Stats Overview */}
// //             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
// //                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
// //                     <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
// //                         <div className="flex items-center justify-between">
// //                             <div>
// //                                 <p className="text-sm text-gray-500">Total Courses</p>
// //                                 <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
// //                             </div>
// //                             <BookOpen className="w-8 h-8 text-blue-500" />
// //                         </div>
// //                     </div>
// //                     <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
// //                         <div className="flex items-center justify-between">
// //                             <div>
// //                                 <p className="text-sm text-gray-500">Active Courses</p>
// //                                 <p className="text-2xl font-bold text-gray-900">{courses.filter(c => c.status === 'active').length}</p>
// //                             </div>
// //                             <Video className="w-8 h-8 text-green-500" />
// //                         </div>
// //                     </div>
// //                     <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
// //                         <div className="flex items-center justify-between">
// //                             <div>
// //                                 <p className="text-sm text-gray-500">Total Students Enrolled</p>
// //                                 <p className="text-2xl font-bold text-gray-900">{courses.reduce((sum, c) => sum + (c.students || 0), 0)}</p>
// //                             </div>
// //                             <Users className="w-8 h-8 text-purple-500" />
// //                         </div>
// //                     </div>
// //                     <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
// //                         <div className="flex items-center justify-between">
// //                             <div>
// //                                 <p className="text-sm text-gray-500">Teaching Hours</p>
// //                                 <p className="text-2xl font-bold text-gray-900">
// //                                     {courses.reduce((sum, c) => {
// //                                         const hours = parseInt(c.duration) || 0;
// //                                         return sum + hours;
// //                                     }, 0)}
// //                                 </p>
// //                             </div>
// //                             <Clock className="w-8 h-8 text-orange-500" />
// //                         </div>
// //                     </div>
// //                 </div>

// //                 {/* Search and Filter Bar */}
// //                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
// //                     <div className="flex flex-col md:flex-row gap-4">
// //                         <div className="flex-1 relative">
// //                             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
// //                             <input
// //                                 type="text"
// //                                 placeholder="Search by course title or instructor..."
// //                                 value={searchTerm}
// //                                 onChange={(e) => setSearchTerm(e.target.value)}
// //                                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
// //                             />
// //                         </div>
// //                         <div className="flex items-center space-x-2">
// //                             <Filter className="w-5 h-5 text-gray-400" />
// //                             <select
// //                                 value={selectedDay}
// //                                 onChange={(e) => setSelectedDay(e.target.value)}
// //                                 className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
// //                             >
// //                                 {days.map(day => (
// //                                     <option key={day} value={day}>{day}</option>
// //                                 ))}
// //                             </select>
// //                         </div>
// //                     </div>
// //                 </div>

// //                 {/* Table View */}
// //                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
// //                     <div className="overflow-x-auto">
// //                         <table className="min-w-full divide-y divide-gray-200">
// //                             <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
// //                                 <tr>
// //                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
// //                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Title</th>
// //                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
// //                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
// //                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
// //                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
// //                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students Enrolled</th>
// //                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
// //                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
// //                                 </tr>
// //                             </thead>
// //                             <tbody className="bg-white divide-y divide-gray-200">
// //                                 {currentItems.length === 0 ? (
// //                                     <tr>
// //                                         <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
// //                                             <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-2" />
// //                                             <p>No courses found</p>
// //                                         </td>
// //                                     </tr>
// //                                 ) : (
// //                                     currentItems.map((course, index) => {
// //                                         const colorStyle = getColorStyles(course.color);
// //                                         return (
// //                                             <tr key={course.id} className="hover:bg-gray-50 transition-colors">
// //                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
// //                                                     {indexOfFirstItem + index + 1}
// //                                                 </td>
// //                                                 <td className="px-6 py-4 whitespace-nowrap">
// //                                                     <div className="flex items-center">
// //                                                         <div className={`w-2 h-2 rounded-full ${colorStyle.bg} mr-2`}></div>
// //                                                         <span className="text-sm font-medium text-gray-900">{course.title}</span>
// //                                                     </div>
// //                                                 </td>
// //                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
// //                                                     {course.instructor}
// //                                                 </td>
// //                                                 <td className="px-6 py-4 whitespace-nowrap">
// //                                                     <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getDayColor(course.day)}`}>
// //                                                         {course.day}
// //                                                     </span>
// //                                                 </td>
// //                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
// //                                                     {course.time}
// //                                                 </td>
// //                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
// //                                                     {course.duration}
// //                                                 </td>
// //                                                 <td className="px-6 py-4 whitespace-nowrap">
// //                                                     <div className="flex items-center space-x-2">
// //                                                         <Users className="w-4 h-4 text-gray-400" />
// //                                                         <span className="text-sm font-semibold text-gray-900">{course.students || 0}</span>
// //                                                         {course.students > 0 && (
// //                                                             <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
// //                                                                 enrolled
// //                                                             </span>
// //                                                         )}
// //                                                     </div>
// //                                                 </td>
// //                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
// //                                                     <div className="flex items-center space-x-1">
// //                                                         <Video className="w-3 h-3 text-gray-400" />
// //                                                         <span>{course.plateform}</span>
// //                                                     </div>
// //                                                 </td>
// //                                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
// //                                                     <div className="flex space-x-2">
// //                                                         <button
// //                                                             onClick={() => handleManageTopics(course.id, course.title)}
// //                                                             className="text-purple-600 hover:text-purple-900 transition-colors"
// //                                                             title="Manage Topics"
// //                                                         >
// //                                                             <BookOpen className="w-5 h-5" />
// //                                                         </button>
// //                                                         <button
// //                                                             onClick={() => handleEdit(course)}
// //                                                             className="text-blue-600 hover:text-blue-900 transition-colors"
// //                                                             title="Edit class"
// //                                                         >
// //                                                             <Edit className="w-5 h-5" />
// //                                                         </button>
// //                                                         <button
// //                                                             onClick={() => handleDelete(course.id)}
// //                                                             className="text-red-600 hover:text-red-900 transition-colors"
// //                                                             title="Delete class"
// //                                                         >
// //                                                             <Trash2 className="w-5 h-5" />
// //                                                         </button>
// //                                                     </div>
// //                                                 </td>
// //                                             </tr>
// //                                         );
// //                                     })
// //                                 )}
// //                             </tbody>
// //                         </table>
// //                     </div>

// //                     {/* Pagination */}
// //                     {filteredCourses.length > 0 && (
// //                         <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
// //                             <div className="flex items-center justify-between">
// //                                 <div className="text-sm text-gray-700">
// //                                     Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
// //                                     <span className="font-medium">
// //                                         {Math.min(indexOfLastItem, filteredCourses.length)}
// //                                     </span>{' '}
// //                                     of <span className="font-medium">{filteredCourses.length}</span> results
// //                                 </div>
// //                                 <div className="flex space-x-2">
// //                                     <button
// //                                         onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
// //                                         disabled={currentPage === 1}
// //                                         className={`px-3 py-1 rounded-md ${currentPage === 1
// //                                                 ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
// //                                                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
// //                                             }`}
// //                                     >
// //                                         <ChevronLeft className="w-5 h-5" />
// //                                     </button>
// //                                     <span className="px-3 py-1 text-sm text-gray-700">
// //                                         Page {currentPage} of {totalPages}
// //                                     </span>
// //                                     <button
// //                                         onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
// //                                         disabled={currentPage === totalPages}
// //                                         className={`px-3 py-1 rounded-md ${currentPage === totalPages
// //                                                 ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
// //                                                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
// //                                             }`}
// //                                     >
// //                                         <ChevronRight className="w-5 h-5" />
// //                                     </button>
// //                                 </div>
// //                             </div>
// //                         </div>
// //                     )}
// //                 </div>
// //             </div>

// //             {/* Create/Edit Modal */}
// //             {isModalOpen && (
// //                 <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
// //                     <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
// //                         <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
// //                             <h2 className="text-xl font-bold text-gray-900">
// //                                 {editingCourse ? "Edit Course" : "Create New Class"}
// //                             </h2>
// //                             <button
// //                                 onClick={resetForm}
// //                                 className="p-1 hover:bg-gray-100 rounded-full transition-colors"
// //                             >
// //                                 <X className="w-5 h-5 text-gray-500" />
// //                             </button>
// //                         </div>

// //                         <form className="p-6 space-y-5" onSubmit={editingCourse ? UpdateClass : CreateClass}>
// //                             <div>
// //                                 <label className="block text-sm font-medium text-gray-700 mb-1">
// //                                     Course Title *
// //                                 </label>
// //                                 <input
// //                                     type="text"
// //                                     name="title"
// //                                     value={formData.title}
// //                                     onChange={handleInputChange}
// //                                     required
// //                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
// //                                     placeholder="e.g., Advanced React Development"
// //                                 />
// //                             </div>

// //                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                                 <div>
// //                                     <label className="block text-sm font-medium text-gray-700 mb-1">
// //                                         Instructor *
// //                                     </label>
// //                                     <input
// //                                         type="text"
// //                                         name="instructor"
// //                                         value={formData.instructor}
// //                                         onChange={handleInputChange}
// //                                         required
// //                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
// //                                         placeholder="Full name"
// //                                     />
// //                                 </div>
// //                                 <div>
// //                                     <label className="block text-sm font-medium text-gray-700 mb-1">
// //                                         Day *
// //                                     </label>
// //                                     <select
// //                                         name="day"
// //                                         value={formData.day}
// //                                         onChange={handleInputChange}
// //                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
// //                                     >
// //                                         {days.filter(d => d !== 'All').map(day => (
// //                                             <option key={day} value={day}>{day}</option>
// //                                         ))}
// //                                     </select>
// //                                 </div>
// //                             </div>

// //                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                                 <div>
// //                                     <label className="block text-sm font-medium text-gray-700 mb-1">
// //                                         Time *
// //                                     </label>
// //                                     <input
// //                                         type="text"
// //                                         name="time"
// //                                         value={formData.time}
// //                                         onChange={handleInputChange}
// //                                         required
// //                                         placeholder="e.g., 10:00 AM - 12:00 PM"
// //                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
// //                                     />
// //                                 </div>
// //                                 <div>
// //                                     <label className="block text-sm font-medium text-gray-700 mb-1">
// //                                         Duration *
// //                                     </label>
// //                                     <input
// //                                         type="text"
// //                                         name="duration"
// //                                         value={formData.duration}
// //                                         onChange={handleInputChange}
// //                                         required
// //                                         placeholder="e.g., 2 hours"
// //                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
// //                                     />
// //                                 </div>
// //                             </div>

// //                             <div>
// //                                 <label className="block text-sm font-medium text-gray-700 mb-1">
// //                                     Description
// //                                 </label>
// //                                 <textarea
// //                                     name="description"
// //                                     value={formData.description}
// //                                     onChange={handleInputChange}
// //                                     rows="3"
// //                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
// //                                     placeholder="Course description and learning objectives"
// //                                 />
// //                             </div>

// //                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                                 <div>
// //                                     <label className="block text-sm font-medium text-gray-700 mb-1">
// //                                         Platform
// //                                     </label>
// //                                     <select
// //                                         name="plateform"
// //                                         value={formData.plateform}
// //                                         onChange={handleInputChange}
// //                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
// //                                     >
// //                                         <option value="Zoom">Zoom</option>
// //                                         <option value="Google Meet">Google Meet</option>
// //                                         <option value="Microsoft Teams">Microsoft Teams</option>
// //                                         <option value="Other">Other</option>
// //                                     </select>
// //                                 </div>
// //                                 <div>
// //                                     <label className="block text-sm font-medium text-gray-700 mb-1">
// //                                         Meeting Link
// //                                     </label>
// //                                     <input
// //                                         type="url"
// //                                         name="meetingLink"
// //                                         value={formData.meetingLink}
// //                                         onChange={handleInputChange}
// //                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
// //                                         placeholder="https://..."
// //                                     />
// //                                 </div>
// //                             </div>

// //                             <div>
// //                                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                                     Course Color
// //                                 </label>
// //                                 <div className="flex space-x-3">
// //                                     {colors.map(color => (
// //                                         <button
// //                                             key={color.name}
// //                                             type="button"
// //                                             onClick={() => setFormData({ ...formData, color: color.name })}
// //                                             className={`w-8 h-8 rounded-full ${color.bg} border-2 ${formData.color === color.name ? 'border-gray-700 ring-2 ring-offset-2' : 'border-transparent'
// //                                                 } transition-all`}
// //                                             title={color.name}
// //                                         />
// //                                     ))}
// //                                 </div>
// //                             </div>

// //                             <div className="flex space-x-3 pt-4">
// //                                 <button
// //                                     type="submit"
// //                                     className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
// //                                 >
// //                                     {editingCourse ? "Update Course" : "Create Class"}
// //                                 </button>
// //                                 <button
// //                                     type="button"
// //                                     onClick={resetForm}
// //                                     className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
// //                                 >
// //                                     Cancel
// //                                 </button>
// //                             </div>
// //                         </form>
// //                     </div>
// //                 </div>
// //             )}
// //         </div>
// //     );
// // };

// // export default ClassSchedule;

// import React, { useState, useEffect } from 'react';
// import { Calendar, Clock, Users, Plus, Trash2, Edit, X, BookOpen, Video, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
// import axios from 'axios';
// import api from '../../../services/adminendpoint';
// import { toast } from 'react-toastify';
// import { useNavigate } from 'react-router-dom';
// import { useCourseStore } from '../../../Store/courseStore';

// const ClassSchedule = () => {
//     const navigate = useNavigate();
//     const { setClassId, classId } = useCourseStore()
//     const [courses, setCourses] = useState([]);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [editingCourse, setEditingCourse] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [selectedDay, setSelectedDay] = useState('All');
//     const [currentPage, setCurrentPage] = useState(1);
//     const [itemsPerPage, setItemsPerPage] = useState(10);
//     const [studentCounts, setStudentCounts] = useState({});

//     const [formData, setFormData] = useState({
//         title: "",
//         instructor: "",
//         day: "Monday",
//         time: "",
//         duration: "",
//         description: "",
//         plateform: "Zoom",
//         meetingLink: "",
//         color: "blue",
//         status: "Upcoming"
//     });

//     const days = ["All", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
//     const colors = [
//         { name: "blue", bg: "bg-blue-100", text: "text-blue-700", badge: "bg-blue-100 text-blue-800" },
//         { name: "green", bg: "bg-green-100", text: "text-green-700", badge: "bg-green-100 text-green-800" },
//         { name: "purple", bg: "bg-purple-100", text: "text-purple-700", badge: "bg-purple-100 text-purple-800" },
//         { name: "orange", bg: "bg-orange-100", text: "text-orange-700", badge: "bg-orange-100 text-orange-800" },
//         { name: "pink", bg: "bg-pink-100", text: "text-pink-700", badge: "bg-pink-100 text-pink-800" }
//     ];

//     // Update items per page based on screen size
//     useEffect(() => {
//         const handleResize = () => {
//             if (window.innerWidth < 640) {
//                 setItemsPerPage(5);
//             } else if (window.innerWidth < 768) {
//                 setItemsPerPage(7);
//             } else {
//                 setItemsPerPage(10);
//             }
//         };
        
//         handleResize();
//         window.addEventListener('resize', handleResize);
//         return () => window.removeEventListener('resize', handleResize);
//     }, []);

//     const getColorStyles = (colorName) => {
//         return colors.find(c => c.name === colorName) || colors[0];
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData({ ...formData, [name]: value });
//     };

//     const GetStdCount = async () => {
//         try {
//             const res = await axios.post(api.joinclass.getstdcount);
//             console.log("Student count response:", res);
            
//             if (res.data && res.data.success && res.data.data) {
//                 const countData = res.data.data;
//                 const countMap = {};
                
//                 if (Array.isArray(countData)) {
//                     countData.forEach(item => {
//                         const classId = item._id || item.classId || item.id;
//                         const count = item.studentCount || item.count || item.students || 0;
//                         if (classId) {
//                             countMap[classId] = count;
//                         }
//                     });
//                 } else if (typeof countData === 'object') {
//                     Object.keys(countData).forEach(key => {
//                         countMap[key] = countData[key];
//                     });
//                 }
                
//                 setStudentCounts(countMap);
                
//                 setCourses(prevCourses => {
//                     return prevCourses.map(course => ({
//                         ...course,
//                         students: countMap[course.id] || course.students || 0
//                     }));
//                 });
                
//                 return countMap;
//             }
//         } catch (error) {
//             console.error("Error fetching student count:", error);
//             if (error.response?.status !== 404) {
//                 toast.error("Failed to fetch student enrollment data");
//             }
//         }
//     };

//     const GetClass = async () => {
//         try {
//             setLoading(true);
//             const res = await axios.post(api.onlineClass.getclass);
//             console.log("Full API Response:", res);

//             let allClasses = [];

//             if (res.data && res.data.data && res.data.data.Allclass) {
//                 allClasses = res.data.data.Allclass;
//             }
//             else if (res.data && res.data.Allclass) {
//                 allClasses = res.data.Allclass;
//             }
//             else if (res.data && res.data.data && Array.isArray(res.data.data)) {
//                 allClasses = res.data.data;
//             }
//             else if (res.data && Array.isArray(res.data)) {
//                 allClasses = res.data;
//             }

//             if (Array.isArray(allClasses) && allClasses.length > 0) {
//                 const formattedCourses = allClasses.map(item => ({
//                     id: item._id || item.id,
//                     title: item.title || "",
//                     instructor: item.instructor || "",
//                     day: item.day || "Monday",
//                     time: item.time || "",
//                     duration: item.duration || "",
//                     students: item.studentCount || item.students || 0,
//                     status: item.status || "active",
//                     description: item.description || "",
//                     plateform: item.plateform || item.platform || "Zoom",
//                     meetingLink: item.meetingLink || "",
//                     color: item.color || "blue",
//                     createdAt: item.createdAt
//                 }));

//                 setCourses(formattedCourses);
//                 await GetStdCount();
//             } else {
//                 setCourses([]);
//                 toast.info("No classes found");
//             }
//         } catch (error) {
//             console.error("Error fetching classes:", error);
//             toast.error(error.response?.data?.message || error.message || "Failed to fetch classes");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const CreateClass = async (e) => {
//         e.preventDefault();
//         try {
//             const res = await axios.post(api.onlineClass.createclass, formData);
//             console.log("Create response:", res);

//             if (res.data && (res.data.success || res.data.status === 200)) {
//                 const newClassId = res.data.data?._id;
//                 if (newClassId && setClassId) {
//                     setClassId(newClassId);
//                 }
//                 console.log("Saved classId:", newClassId);
//                 toast.success("Class created successfully");
//                 resetForm();
//                 await GetClass();
//             } else {
//                 toast.error(res.data?.message || "Failed to create class");
//             }
//         } catch (error) {
//             console.error("Create error:", error);
//             toast.error(error.response?.data?.message || error.message || "Failed to create class");
//         }
//     };

//     const UpdateClass = async (e) => {
//         e.preventDefault();
//         try {
//             const classToUpdate = editingCourse?.id || classId;
            
//             if (!classToUpdate) {
//                 toast.error("No class ID found for update");
//                 return;
//             }

//             console.log("Updating class with ID:", classToUpdate);
            
//             const res = await axios.post(api.onlineClass.editclass, {
//                 ...formData,
//                 classId: classToUpdate
//             });
            
//             console.log("Update response:", res);
            
//             if (res.data && (res.data.success || res.data.status === 200)) {
//                 toast.success("Class updated successfully");
//                 resetForm();
//                 await GetClass();
//             } else {
//                 toast.error(res.data?.message || "Failed to update class");
//             }
//         } catch (error) {
//             console.error("Update error:", error);
//             toast.error(error.response?.data?.message || error.message || "Failed to update class");
//         }
//     };

//     const handleDelete = async (id) => {
//         if (window.confirm("Are you sure you want to delete this course?")) {
//             try {
//                 setLoading(true);                
//                 const response = await axios.post(api.onlineClass.deleteclass, { classId: id });
//                 console.log("Delete response:", response);
                
//                 if (response.data && (response.data.success || response.data.status === 200)) {
//                     toast.success("Class deleted successfully");
//                     await GetClass();
//                 } else {
//                     toast.error(response.data?.message || "Failed to delete class");
//                 }
//             } catch (error) {
//                 console.error("Delete error:", error);
//                 toast.error(error.response?.data?.message || error.message || "Failed to delete class");
//             } finally {
//                 setLoading(false);
//             }
//         }
//     };

//     const handleEdit = (course) => {
//         if (setClassId) {
//             setClassId(course.id);
//         }
//         setEditingCourse(course);
//         setFormData({
//             title: course.title,
//             instructor: course.instructor,
//             day: course.day,
//             time: course.time,
//             duration: course.duration,
//             description: course.description || "",
//             plateform: course.plateform || "Zoom",
//             meetingLink: course.meetingLink || "",
//             color: course.color || "blue",
//             status: course.status || "Upcoming"
//         });
//         setIsModalOpen(true);
//     };

//     // Navigate to Topics page with classId
//     const handleManageTopics = (courseId, courseTitle) => {
//         if (setClassId) {
//             setClassId(courseId);
//         }
//         console.log("Navigating to topics with classId:", courseId);
//         toast.success(`Managing topics for: ${courseTitle}`);
//         navigate('/admin/topics'); 
//     };

//     const resetForm = () => {
//         setFormData({
//             title: "",
//             instructor: "",
//             day: "Monday",
//             time: "",
//             duration: "",
//             description: "",
//             plateform: "Zoom",
//             meetingLink: "",
//             color: "blue",
//             status: "Upcoming"
//         });
//         setEditingCourse(null);
//         if (setClassId) {
//             setClassId(null);
//         }
//         setIsModalOpen(false);
//     };

//     const refreshStudentCounts = async () => {
//         await GetStdCount();
//         toast.success("Student counts refreshed");
//     };

//     const filteredCourses = courses.filter(course => {
//         const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
//         const matchesDay = selectedDay === 'All' || course.day === selectedDay;
//         return matchesSearch && matchesDay;
//     });

//     const indexOfLastItem = currentPage * itemsPerPage;
//     const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//     const currentItems = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);
//     const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

//     const getDayColor = (day) => {
//         const dayColors = {
//             Monday: "bg-blue-100 text-blue-800",
//             Tuesday: "bg-green-100 text-green-800",
//             Wednesday: "bg-purple-100 text-purple-800",
//             Thursday: "bg-orange-100 text-orange-800",
//             Friday: "bg-pink-100 text-pink-800"
//         };
//         return dayColors[day] || "bg-gray-100 text-gray-800";
//     };

//     useEffect(() => {
//         GetClass();
//     }, []);

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//                     <p className="mt-4 text-gray-600">Loading classes...</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//             {/* Header */}
//             <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
//                     <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
//                         <div className="flex items-center space-x-3">
//                             <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
//                                 <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
//                             </div>
//                             <div>
//                                 <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Class Schedule</h1>
//                                 <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Manage your online courses and schedule</p>
//                             </div>
//                         </div>
//                         <div className="flex flex-row gap-2">
//                             <button
//                                 onClick={refreshStudentCounts}
//                                 className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base flex-1 sm:flex-none"
//                             >
//                                 <Users className="w-4 h-4 sm:w-5 sm:h-5" />
//                                 <span className="hidden sm:inline">Refresh Counts</span>
//                                 <span className="sm:hidden">Refresh</span>
//                             </button>
//                             <button
//                                 onClick={() => {
//                                     resetForm();
//                                     setIsModalOpen(true);
//                                 }}
//                                 className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base flex-1 sm:flex-none"
//                             >
//                                 <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
//                                 <span className="hidden sm:inline">Create class</span>
//                                 <span className="sm:hidden">Create</span>
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Stats Overview */}
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
//                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
//                     <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-xs sm:text-sm text-gray-500">Total Courses</p>
//                                 <p className="text-lg sm:text-2xl font-bold text-gray-900">{courses.length}</p>
//                             </div>
//                             <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
//                         </div>
//                     </div>
//                     <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-xs sm:text-sm text-gray-500">Active Courses</p>
//                                 <p className="text-lg sm:text-2xl font-bold text-gray-900">{courses.filter(c => c.status === 'active').length}</p>
//                             </div>
//                             <Video className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
//                         </div>
//                     </div>
//                     <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-xs sm:text-sm text-gray-500">Total Students</p>
//                                 <p className="text-lg sm:text-2xl font-bold text-gray-900">{courses.reduce((sum, c) => sum + (c.students || 0), 0)}</p>
//                             </div>
//                             <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
//                         </div>
//                     </div>
//                     <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-xs sm:text-sm text-gray-500">Teaching Hours</p>
//                                 <p className="text-lg sm:text-2xl font-bold text-gray-900">
//                                     {courses.reduce((sum, c) => {
//                                         const hours = parseInt(c.duration) || 0;
//                                         return sum + hours;
//                                     }, 0)}
//                                 </p>
//                             </div>
//                             <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
//                         </div>
//                     </div>
//                 </div>

//                 {/* Search and Filter Bar */}
//                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
//                     <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
//                         <div className="flex-1 relative">
//                             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
//                             <input
//                                 type="text"
//                                 placeholder="Search by course or instructor..."
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                 className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                             />
//                         </div>
//                         <div className="flex items-center space-x-2">
//                             <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
//                             <select
//                                 value={selectedDay}
//                                 onChange={(e) => setSelectedDay(e.target.value)}
//                                 className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                             >
//                                 {days.map(day => (
//                                     <option key={day} value={day}>{day}</option>
//                                 ))}
//                             </select>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Table View - Responsive with horizontal scroll on mobile */}
//                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//                     <div className="overflow-x-auto">
//                         <table className="min-w-full divide-y divide-gray-200">
//                             <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
//                                 <tr>
//                                     <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
//                                     <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Title</th>
//                                     <th className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
//                                     <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
//                                     <th className="hidden lg:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
//                                     <th className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
//                                     <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
//                                     <th className="hidden lg:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
//                                     <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="bg-white divide-y divide-gray-200">
//                                 {currentItems.length === 0 ? (
//                                     <tr>
//                                         <td colSpan="9" className="px-3 sm:px-6 py-8 sm:py-12 text-center text-gray-500">
//                                             <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-300 mb-2" />
//                                             <p className="text-sm sm:text-base">No courses found</p>
//                                         </td>
//                                     </tr>
//                                 ) : (
//                                     currentItems.map((course, index) => {
//                                         const colorStyle = getColorStyles(course.color);
//                                         return (
//                                             <tr key={course.id} className="hover:bg-gray-50 transition-colors">
//                                                 <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
//                                                     {indexOfFirstItem + index + 1}
//                                                 </td>
//                                                 <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
//                                                     <div className="flex items-center">
//                                                         <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${colorStyle.bg} mr-1.5 sm:mr-2`}></div>
//                                                         <span className="text-xs sm:text-sm font-medium text-gray-900">{course.title}</span>
//                                                     </div>
//                                                 </td>
//                                                 <td className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
//                                                     {course.instructor}
//                                                 </td>
//                                                 <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
//                                                     <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getDayColor(course.day)}`}>
//                                                         <span className="sm:hidden">{course.day.substring(0, 3)}</span>
//                                                         <span className="hidden sm:inline">{course.day}</span>
//                                                     </span>
//                                                 </td>
//                                                 <td className="hidden lg:table-cell px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
//                                                     {course.time}
//                                                 </td>
//                                                 <td className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
//                                                     {course.duration}
//                                                 </td>
//                                                 <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
//                                                     <div className="flex items-center space-x-1 sm:space-x-2">
//                                                         <Users className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
//                                                         <span className="text-xs sm:text-sm font-semibold text-gray-900">{course.students || 0}</span>
//                                                         {course.students > 0 && (
//                                                             <span className="hidden sm:inline-block text-xs text-green-600 bg-green-100 px-1.5 sm:px-2 py-0.5 rounded-full">
//                                                                 enrolled
//                                                             </span>
//                                                         )}
//                                                     </div>
//                                                 </td>
//                                                 <td className="hidden lg:table-cell px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
//                                                     <div className="flex items-center space-x-1">
//                                                         <Video className="w-3 h-3 text-gray-400" />
//                                                         <span>{course.plateform}</span>
//                                                     </div>
//                                                 </td>
//                                                 <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm font-medium">
//                                                     <div className="flex space-x-1.5 sm:space-x-2">
//                                                         <button
//                                                             onClick={() => handleManageTopics(course.id, course.title)}
//                                                             className="text-purple-600 hover:text-purple-900 transition-colors p-1"
//                                                             title="Manage Topics"
//                                                         >
//                                                             <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
//                                                         </button>
//                                                         <button
//                                                             onClick={() => handleEdit(course)}
//                                                             className="text-blue-600 hover:text-blue-900 transition-colors p-1"
//                                                             title="Edit class"
//                                                         >
//                                                             <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
//                                                         </button>
//                                                         <button
//                                                             onClick={() => handleDelete(course.id)}
//                                                             className="text-red-600 hover:text-red-900 transition-colors p-1"
//                                                             title="Delete class"
//                                                         >
//                                                             <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
//                                                         </button>
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         );
//                                     })
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>

//                     {/* Pagination */}
//                     {filteredCourses.length > 0 && (
//                         <div className="bg-white px-3 sm:px-4 py-3 border-t border-gray-200 sm:px-6">
//                             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//                                 <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
//                                     Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
//                                     <span className="font-medium">
//                                         {Math.min(indexOfLastItem, filteredCourses.length)}
//                                     </span>{' '}
//                                     of <span className="font-medium">{filteredCourses.length}</span> results
//                                 </div>
//                                 <div className="flex justify-center sm:justify-end space-x-2">
//                                     <button
//                                         onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                                         disabled={currentPage === 1}
//                                         className={`px-2 sm:px-3 py-1 rounded-md text-sm ${
//                                             currentPage === 1
//                                                 ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                                                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                                         }`}
//                                     >
//                                         <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
//                                     </button>
//                                     <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-700">
//                                         Page {currentPage} of {totalPages}
//                                     </span>
//                                     <button
//                                         onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                                         disabled={currentPage === totalPages}
//                                         className={`px-2 sm:px-3 py-1 rounded-md text-sm ${
//                                             currentPage === totalPages
//                                                 ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                                                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                                         }`}
//                                     >
//                                         <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Create/Edit Modal */}
//             {isModalOpen && (
//                 <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
//                     <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//                         <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
//                             <h2 className="text-lg sm:text-xl font-bold text-gray-900">
//                                 {editingCourse ? "Edit Course" : "Create New Class"}
//                             </h2>
//                             <button
//                                 onClick={resetForm}
//                                 className="p-1 hover:bg-gray-100 rounded-full transition-colors"
//                             >
//                                 <X className="w-5 h-5 text-gray-500" />
//                             </button>
//                         </div>

//                         <form className="p-4 sm:p-6 space-y-4 sm:space-y-5" onSubmit={editingCourse ? UpdateClass : CreateClass}>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Course Title *
//                                 </label>
//                                 <input
//                                     type="text"
//                                     name="title"
//                                     value={formData.title}
//                                     onChange={handleInputChange}
//                                     required
//                                     className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
//                                     placeholder="e.g., Advanced React Development"
//                                 />
//                             </div>

//                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Instructor *
//                                     </label>
//                                     <input
//                                         type="text"
//                                         name="instructor"
//                                         value={formData.instructor}
//                                         onChange={handleInputChange}
//                                         required
//                                         className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                                         placeholder="Full name"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Day *
//                                     </label>
//                                     <select
//                                         name="day"
//                                         value={formData.day}
//                                         onChange={handleInputChange}
//                                         className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                                     >
//                                         {days.filter(d => d !== 'All').map(day => (
//                                             <option key={day} value={day}>{day}</option>
//                                         ))}
//                                     </select>
//                                 </div>
//                             </div>

//                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Time *
//                                     </label>
//                                     <input
//                                         type="text"
//                                         name="time"
//                                         value={formData.time}
//                                         onChange={handleInputChange}
//                                         required
//                                         placeholder="e.g., 10:00 AM - 12:00 PM"
//                                         className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Duration *
//                                     </label>
//                                     <input
//                                         type="text"
//                                         name="duration"
//                                         value={formData.duration}
//                                         onChange={handleInputChange}
//                                         required
//                                         placeholder="e.g., 2 hours"
//                                         className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                                     />
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Description
//                                 </label>
//                                 <textarea
//                                     name="description"
//                                     value={formData.description}
//                                     onChange={handleInputChange}
//                                     rows="3"
//                                     className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                                     placeholder="Course description and learning objectives"
//                                 />
//                             </div>

//                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Platform
//                                     </label>
//                                     <select
//                                         name="plateform"
//                                         value={formData.plateform}
//                                         onChange={handleInputChange}
//                                         className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                                     >
//                                         <option value="Zoom">Zoom</option>
//                                         <option value="Google Meet">Google Meet</option>
//                                         <option value="Microsoft Teams">Microsoft Teams</option>
//                                         <option value="Other">Other</option>
//                                     </select>
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Meeting Link
//                                     </label>
//                                     <input
//                                         type="url"
//                                         name="meetingLink"
//                                         value={formData.meetingLink}
//                                         onChange={handleInputChange}
//                                         className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                                         placeholder="https://..."
//                                     />
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Course Color
//                                 </label>
//                                 <div className="flex flex-wrap gap-2 sm:space-x-3">
//                                     {colors.map(color => (
//                                         <button
//                                             key={color.name}
//                                             type="button"
//                                             onClick={() => setFormData({ ...formData, color: color.name })}
//                                             className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${color.bg} border-2 ${
//                                                 formData.color === color.name ? 'border-gray-700 ring-2 ring-offset-2' : 'border-transparent'
//                                             } transition-all`}
//                                             title={color.name}
//                                         />
//                                     ))}
//                                 </div>
//                             </div>

//                             <div className="flex flex-col sm:flex-row gap-3 pt-4">
//                                 <button
//                                     type="submit"
//                                     className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium text-sm sm:text-base"
//                                 >
//                                     {editingCourse ? "Update Course" : "Create Class"}
//                                 </button>
//                                 <button
//                                     type="button"
//                                     onClick={resetForm}
//                                     className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-sm sm:text-base"
//                                 >
//                                     Cancel
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ClassSchedule;