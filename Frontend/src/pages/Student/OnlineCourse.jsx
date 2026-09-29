// import axios from 'axios';
// import React, { useState } from 'react';
// import { useEffect } from 'react';
// import api from '../../services/endpoints';
// import useStudentStore from '../../Store/studentstore';

// const OnlineCourses = () => {
//   const { student } = useStudentStore();
//   const studentId = student?._id
//   const [classes, setClasses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [selectedCourse, setSelectedCourse] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [joiningClass, setJoiningClass] = useState(null);
//   const [joinStatus, setJoinStatus] = useState({});
//   const [joinSuccessMessage, setJoinSuccessMessage] = useState(null);
//   const [joinErrorMessage, setJoinErrorMessage] = useState(null);
  
//   // State for topics
//   const [topicsByClass, setTopicsByClass] = useState({});
//   const [loadingTopics, setLoadingTopics] = useState({});
  
//   // State for notes modal
//   const [showNotesModal, setShowNotesModal] = useState(false);
//   const [selectedNotes, setSelectedNotes] = useState(null);
//   const [selectedTopicTitle, setSelectedTopicTitle] = useState("");

//   const GetAllClass = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const res = await axios.post(api.onlineClass.getallclass);
      
//       let classesData = null;
      
//       if (res.data?.data?.UpdatedClasses) {
//         classesData = res.data.data.UpdatedClasses;
//       } 
//       else if (res.data?.UpdatedClasses) {
//         classesData = res.data.UpdatedClasses;
//       }
//       else if (res.data?.data?.classes) {
//         classesData = res.data.data.classes;
//       }
//       else if (res.data?.classes) {
//         classesData = res.data.classes;
//       }
//       else if (res.data?.data && Array.isArray(res.data.data)) {
//         classesData = res.data.data;
//       }
//       else if (Array.isArray(res.data)) {
//         classesData = res.data;
//       }
//       else {
//         throw new Error("Unable to find classes data in response");
//       }
      
//       if (classesData && Array.isArray(classesData)) {
//         const formattedClasses = classesData.map((cls, index) => ({
//           _id: cls._id || cls.id || `temp_${index}`,
//           title: cls.title || cls.name || "Untitled Class",
//           instructor: cls.instructor || cls.teacher || "TBA",
//           day: cls.day || cls.schedule?.day || "To be announced",
//           time: cls.time || cls.schedule?.time || "TBA",
//           duration: cls.duration || "1 hour",
//           description: cls.description || cls.desc || "No description available",
//           platform: cls.plateform || cls.platform || cls.meetingPlatform || "Online",
//           meetingLink: cls.meetingLink || cls.meeting_url || cls.joinUrl || null,
//           meetingId: cls.meetingId || cls.meeting_id || null,
//           meetingPassword: cls.meetingPassword || cls.password || null,
//           status: cls.status || (cls.isLive ? "Live" : "Upcoming"),
//         }));
        
//         setClasses(formattedClasses);
        
//         // Har class ke liye topics fetch karo
//         for (const cls of formattedClasses) {
//           await getTopicByClass(cls._id);
//         }
//       } else {
//         setClasses([]);
//       }
      
//     } catch (error) {
//       console.error("Error fetching classes:", error);
//       setError("Failed to fetch classes. Please try again.");
//       setClasses([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     GetAllClass();
//   }, []);

//   // Categories and filtered classes
//   const categories = ["All", ...new Set(classes.map(cls => cls.day).filter(Boolean))];

//   const filteredClasses = classes?.filter(cls => {
//     const matchesCategory = selectedCategory === "All" || cls.day === selectedCategory;
//     const matchesSearch = cls.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          cls.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          cls.description?.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   // Function to fetch topics for a specific class
//   const getTopicByClass = async (classId) => {
//     if (!classId || classId.startsWith('temp_')) {
//       console.log("Skipping temporary class ID:", classId);
//       setTopicsByClass(prev => ({ ...prev, [classId]: [] }));
//       return;
//     }
    
//     // Agar already fetch ho chuka hai to skip karo
//     if (topicsByClass[classId] !== undefined) return;
    
//     try {
//       setLoadingTopics(prev => ({ ...prev, [classId]: true }));
      
//       console.log(`Fetching topics for class ID:`, classId);
      
//       // API call with classId
//       const res = await axios.post(api.topic.gettopicbyclass, {
//         classId: classId
//       });
      
//       console.log(`Response for class ${classId}:`, res.data);
      
//       let topicsData = [];
      
//       // Aapke data structure ke hisaab se topics extract karo
//       if (res.data?.data?.data && Array.isArray(res.data.data.data)) {
//         topicsData = res.data.data.data;
//       } 
//       else if (res.data?.data && Array.isArray(res.data.data)) {
//         topicsData = res.data.data;
//       }
//       else if (res.data?.topics && Array.isArray(res.data.topics)) {
//         topicsData = res.data.topics;
//       }
//       else if (Array.isArray(res.data)) {
//         topicsData = res.data;
//       }
//       else if (res.data?.data?.data && typeof res.data.data.data === 'object') {
//         topicsData = Object.values(res.data.data.data);
//       }
      
//       // Filter topics jo is class se related hain
//       if (topicsData.length > 0 && topicsData[0]?.classId) {
//         topicsData = topicsData.filter(topic => topic.classId === classId || topic.classId?._id === classId);
//       }
      
//       console.log(`Extracted topics for class ${classId}:`, topicsData);
      
//       // Store topics for this specific class
//       setTopicsByClass(prev => ({
//         ...prev,
//         [classId]: topicsData
//       }));
      
//     } catch (error) {
//       console.error(`Error fetching topics for class ${classId}:`, error);
//       console.error("Error details:", error.response?.data);
//       setTopicsByClass(prev => ({
//         ...prev,
//         [classId]: []
//       }));
//     } finally {
//       setLoadingTopics(prev => ({ ...prev, [classId]: false }));
//     }
//   };

//   // Function to handle note click
//   const handleNoteClick = (notes, topicTitle) => {
//     setSelectedNotes(notes);
//     setSelectedTopicTitle(topicTitle);
//     setShowNotesModal(true);
//   };

//   // Function to download note
//   const downloadNote = (note, index) => {
//     // Agar note URL hai to download karo
//     if (typeof note === 'string' && (note.startsWith('http') || note.startsWith('/'))) {
//       window.open(note, '_blank');
//     } 
//     // Agar note object hai to usko JSON ya text ke roop mein download karo
//     else if (typeof note === 'object') {
//       const dataStr = JSON.stringify(note, null, 2);
//       const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
//       const exportFileDefaultName = `${selectedTopicTitle}_note_${index + 1}.json`;
//       const linkElement = document.createElement('a');
//       linkElement.setAttribute('href', dataUri);
//       linkElement.setAttribute('download', exportFileDefaultName);
//       linkElement.click();
//     }
//     else {
//       // Agar text note hai
//       const dataUri = 'data:text/plain;charset=utf-8,'+ encodeURIComponent(note);
//       const exportFileDefaultName = `${selectedTopicTitle}_note_${index + 1}.txt`;
//       const linkElement = document.createElement('a');
//       linkElement.setAttribute('href', dataUri);
//       linkElement.setAttribute('download', exportFileDefaultName);
//       linkElement.click();
//     }
//   };

//   const JoinClass = async (cls) => {
//     if (!studentId) {
//       setJoinErrorMessage("Please login to join the class");
//       setTimeout(() => setJoinErrorMessage(null), 3000);
//       return;
//     }

//     try {
//       setJoiningClass(cls._id);
//       setJoinSuccessMessage(null);
//       setJoinErrorMessage(null);
      
//       const res = await axios.post(api.joinClass.joinClasses, {
//         studentId: studentId,
//         classId: cls._id,
//       });
      
//       if (res.data?.success || res.status === 200 || res.data?.message) {
//         const successMsg = res.data?.message || "Successfully joined the class!";
//         setJoinSuccessMessage(successMsg);
        
//         setJoinStatus(prev => ({
//           ...prev,
//           [cls._id]: { success: successMsg, error: null }
//         }));
        
//         setTimeout(() => {
//           setJoinSuccessMessage(null);
//           setJoinStatus(prev => ({
//             ...prev,
//             [cls._id]: { ...prev[cls._id], success: null }
//           }));
//         }, 3000);
        
//         if (cls.meetingLink) {
//           setTimeout(() => {
//             window.open(cls.meetingLink, '_blank');
//           }, 1500);
//         } else if (cls.status === 'Live' && !cls.meetingLink) {
//           setJoinErrorMessage("Meeting link not available. Please contact support.");
//           setTimeout(() => setJoinErrorMessage(null), 3000);
//         }
        
//         if (res.data?.meetingLink || res.data?.meeting_url || res.data?.joinUrl) {
//           const responseMeetingLink = res.data?.meetingLink || res.data?.meeting_url || res.data?.joinUrl;
//           setTimeout(() => {
//             window.open(responseMeetingLink, '_blank');
//           }, 1500);
//         }
        
//       } else {
//         throw new Error(res.data?.error || "Failed to join class");
//       }
      
//     } catch (error) {
//       console.error("Error joining class:", error);
      
//       const errorMsg = error.response?.data?.message || 
//                       error.response?.data?.error || 
//                       error.message || 
//                       "Failed to join class. Please try again.";
      
//       setJoinErrorMessage(errorMsg);
      
//       setJoinStatus(prev => ({
//         ...prev,
//         [cls._id]: { success: null, error: errorMsg }
//       }));
      
//       setTimeout(() => {
//         setJoinErrorMessage(null);
//         setJoinStatus(prev => ({
//           ...prev,
//           [cls._id]: { ...prev[cls._id], error: null }
//         }));
//       }, 3000);
//     } finally {
//       setJoiningClass(null);
//     }
//   };

//   const handleViewDetails = async (cls) => {
//     setSelectedCourse(cls);
//     setShowModal(true);
//     if (!topicsByClass[cls._id]) {
//       await getTopicByClass(cls._id);
//     }
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setSelectedCourse(null);
//     setJoinSuccessMessage(null);
//     setJoinErrorMessage(null);
//   };

//   const closeNotesModal = () => {
//     setShowNotesModal(false);
//     setSelectedNotes(null);
//     setSelectedTopicTitle("");
//   };

//   const getStatusStyles = (status) => {
//     switch(status?.toLowerCase()) {
//       case 'live':
//         return {
//           bgColor: 'bg-red-500',
//           textColor: 'text-white',
//           animation: 'animate-pulse',
//           buttonClass: 'bg-red-600 hover:bg-red-700',
//           buttonText: 'Join Live Now'
//         };
//       case 'completed':
//         return {
//           bgColor: 'bg-gray-400',
//           textColor: 'text-white',
//           animation: '',
//           buttonClass: 'bg-gray-400 cursor-not-allowed',
//           buttonText: 'Class Completed'
//         };
//       default:
//         return {
//           bgColor: 'bg-blue-500',
//           textColor: 'text-white',
//           animation: '',
//           buttonClass: 'bg-blue-600 hover:bg-blue-700',
//           buttonText: 'Register & Join'
//         };
//     }
//   };

//   const getPlatformIcon = (platform) => {
//     switch(platform?.toLowerCase()) {
//       case 'zoom':
//         return '🎥';
//       case 'google meet':
//         return '📹';
//       case 'microsoft teams':
//         return '💼';
//       case 'youtube':
//         return '▶️';
//       default:
//         return '🔗';
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
//           <p className="text-gray-600">Loading classes...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//         <div className="text-center max-w-md mx-auto">
//           <div className="text-5xl mb-4">⚠️</div>
//           <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Classes</h3>
//           <p className="text-gray-600 mb-4">{error}</p>
//           <button
//             onClick={GetAllClass}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Global Toast Messages */}
//       {(joinSuccessMessage || joinErrorMessage) && (
//         <div className="fixed top-20 right-4 z-50 animate-slide-in">
//           {joinSuccessMessage && (
//             <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//               </svg>
//               {joinSuccessMessage}
//             </div>
//           )}
//           {joinErrorMessage && (
//             <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//               {joinErrorMessage}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Header Section */}
//       <div className="text-blue-500">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//           <div className="text-center">
//             <h1 className="text-4xl font-bold mb-3">
//               Live Online Classes
//             </h1>
//             <p className="text-blue-500 text-lg max-w-2xl mx-auto">
//               Join live sessions with expert instructors. Learn in real-time from anywhere!
//             </p>
//             {classes.length > 0 && (
//               <p className="text-blue-500 text-sm mt-2">
//                 Total {classes.length} class{classes.length !== 1 ? 'es' : ''} available
//               </p>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Search and Filter Section */}
//       <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
//             <div className="relative flex-1 max-w-md w-full">
//               <input
//                 type="text"
//                 placeholder="Search courses or instructors..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//               <svg
//                 className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//               </svg>
//             </div>

//             <div className="flex flex-wrap gap-2 justify-center">
//               {categories?.map(day => (
//                 <button
//                   key={day}
//                   onClick={() => setSelectedCategory(day)}
//                   className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm ${
//                     selectedCategory === day
//                       ? "bg-blue-600 text-white shadow-md"
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   }`}
//                 >
//                   {day}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Course Cards Grid */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {!classes.length ? (
//           <div className="text-center py-12">
//             <div className="text-4xl mb-3">📚</div>
//             <h3 className="text-lg font-medium text-gray-900 mb-1">No Classes Available</h3>
//             <p className="text-gray-500">Check back later for new classes</p>
//           </div>
//         ) : filteredClasses?.length === 0 ? (
//           <div className="text-center py-12">
//             <div className="text-4xl mb-3">🔍</div>
//             <h3 className="text-lg font-medium text-gray-900 mb-1">No matching classes found</h3>
//             <p className="text-gray-500">Try adjusting your search or filter criteria</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredClasses?.map((cls) => {
//               const statusStyles = getStatusStyles(cls.status);
//               const isJoining = joiningClass === cls._id;
//               const joinStatusMsg = joinStatus[cls._id];
              
//               return (
//                 <div
//                   key={cls._id}
//                   className="bg-white rounded-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
//                 >
//                   <div className="p-5">
//                     <div className="flex justify-between items-center mb-3">
//                       <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${statusStyles.bgColor} ${statusStyles.textColor} ${statusStyles.animation}`}>
//                         {cls.status === 'Live' && (
//                           <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse"></span>
//                         )}
//                         {cls.status}
//                       </span>
//                       <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
//                         {getPlatformIcon(cls.platform)} {cls.platform}
//                       </span>
//                     </div>

//                     <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
//                       {cls.title}
//                     </h3>

//                     <p className="text-gray-600 text-sm mb-3 line-clamp-2">
//                       {cls.description}
//                     </p>

//                     <div className="flex items-center mb-3">
//                       <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
//                         {cls.instructor?.charAt(0) || 'T'}
//                       </div>
//                       <div className="ml-2">
//                         <p className="text-gray-800 text-sm font-medium">{cls.instructor}</p>
//                         <p className="text-gray-500 text-xs">Instructor</p>
//                       </div>
//                     </div>

//                     <div className="space-y-1.5 mb-4">
//                       <div className="flex items-center text-sm text-gray-600">
//                         <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                         </svg>
//                         <span>{cls.day} at {cls.time}</span>
//                       </div>
//                       <div className="flex items-center text-sm text-gray-600">
//                         <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                         <span>{cls.duration}</span>
//                       </div>
//                     </div>

//                     {joinStatusMsg?.error && (
//                       <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
//                         <p className="text-red-600 text-xs">{joinStatusMsg.error}</p>
//                       </div>
//                     )}
//                     {joinStatusMsg?.success && (
//                       <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
//                         <p className="text-green-600 text-xs">{joinStatusMsg.success}</p>
//                       </div>
//                     )}

//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => JoinClass(cls)}
//                         disabled={cls.status === 'Completed' || isJoining}
//                         className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
//                           cls.status === 'Completed'
//                             ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                             : statusStyles.buttonClass + ' text-white shadow-md'
//                         }`}
//                       >
//                         {isJoining ? (
//                           <span className="flex items-center justify-center">
//                             <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                             </svg>
//                             Joining...
//                           </span>
//                         ) : (
//                           statusStyles.buttonText
//                         )}
//                       </button>
//                       <button
//                         onClick={() => handleViewDetails(cls)}
//                         className="px-3 py-2 border border-gray-300 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-50 transition-all duration-300"
//                       >
//                         Details
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* Class Details Modal */}
//       {showModal && selectedCourse && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
//           <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
//             <div className="border-b border-gray-200 p-5 bg-gradient-to-r from-blue-50 to-white">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <div className="flex items-center gap-2 mb-1">
//                     <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusStyles(selectedCourse.status).bgColor} text-white`}>
//                       {selectedCourse.status}
//                     </span>
//                     <span className="inline-flex items-center px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">
//                       {getPlatformIcon(selectedCourse.platform)} {selectedCourse.platform}
//                     </span>
//                   </div>
//                   <h3 className="text-xl font-semibold text-gray-900">{selectedCourse.title}</h3>
//                 </div>
//                 <button
//                   onClick={closeModal}
//                   className="text-gray-400 hover:text-gray-600 transition-colors"
//                 >
//                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>
//             </div>

//             <div className="p-5 overflow-y-auto max-h-[calc(90vh-180px)]">
//               <div className="mb-5">
//                 <h4 className="font-medium text-gray-900 mb-3">Schedule Details</h4>
//                 <div className="space-y-2 text-sm">
//                   <div className="flex justify-between py-2 border-b border-gray-100">
//                     <span className="text-gray-500">Day:</span>
//                     <span className="font-medium text-gray-900">{selectedCourse.day}</span>
//                   </div>
//                   <div className="flex justify-between py-2 border-b border-gray-100">
//                     <span className="text-gray-500">Time:</span>
//                     <span className="font-medium text-gray-900">{selectedCourse.time}</span>
//                   </div>
//                   <div className="flex justify-between py-2 border-b border-gray-100">
//                     <span className="text-gray-500">Duration:</span>
//                     <span className="font-medium text-gray-900">{selectedCourse.duration}</span>
//                   </div>
//                   <div className="flex justify-between py-2">
//                     <span className="text-gray-500">Platform:</span>
//                     <span className="font-medium text-gray-900">{selectedCourse.platform}</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="mb-5">
//                 <h4 className="font-medium text-gray-900 mb-2">Description</h4>
//                 <p className="text-gray-600 text-sm leading-relaxed">{selectedCourse.description}</p>
//               </div>

//               <div className="mb-5">
//                 <h4 className="font-medium text-gray-900 mb-2">Instructor</h4>
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
//                     {selectedCourse.instructor?.charAt(0) || 'T'}
//                   </div>
//                   <div>
//                     <p className="font-medium text-gray-900">{selectedCourse.instructor}</p>
//                     <p className="text-gray-500 text-sm">Lead Instructor</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Topics Section */}
//               <div className="mb-5">
//                 <div className="flex items-center justify-between mb-3">
//                   <h4 className="font-medium text-gray-900">Class Topics</h4>
//                   {loadingTopics[selectedCourse._id] && (
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
//                   )}
//                 </div>
                
//                 {!loadingTopics[selectedCourse._id] && (!topicsByClass[selectedCourse._id] || topicsByClass[selectedCourse._id].length === 0) && (
//                   <div className="text-center py-6 bg-gray-50 rounded-lg">
//                     <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                     </svg>
//                     <p className="text-gray-500 text-sm">No topics available for this course</p>
//                   </div>
//                 )}
                
//                 {topicsByClass[selectedCourse._id] && topicsByClass[selectedCourse._id].length > 0 && (
//                   <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
//                     {topicsByClass[selectedCourse._id].map((topic, index) => (
//                       <div key={topic._id || index} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
//                         <div className="flex items-start justify-between">
//                           <div className="flex-1">
//                             <div className="flex items-center gap-2 mb-1">
//                               <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
//                                 {index + 1}
//                               </span>
//                               <h5 className="font-medium text-gray-900">{topic.title}</h5>
//                             </div>
//                             {topic.description && (
//                               <p className="text-gray-500 text-xs ml-7 mb-2">{topic.description}</p>
//                             )}
                            
//                             {/* Video URLs */}
//                             {topic.videoUrls && topic.videoUrls.length > 0 && (
//                               <div className="ml-7 mt-2">
//                                 <p className="text-xs text-gray-400 mb-1">📹 Videos ({topic.videoUrls.length})</p>
//                                 <div className="flex flex-wrap gap-2">
//                                   {topic.videoUrls.map((url, idx) => (
//                                     <a
//                                       key={idx}
//                                       href={url}
//                                       target="_blank"
//                                       rel="noopener noreferrer"
//                                       className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
//                                       onClick={(e) => e.stopPropagation()}
//                                     >
//                                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                       </svg>
//                                       Video {idx + 1}
//                                     </a>
//                                   ))}
//                                 </div>
//                               </div>
//                             )}
                            
//                             {/* Notes - Clickable now */}
//                             {topic.notes && topic.notes.length > 0 && (
//                               <div className="ml-7 mt-2">
//                                 <p className="text-xs text-gray-400 mb-1">📝 Notes ({topic.notes.length})</p>
//                                 <div className="flex flex-wrap gap-2">
//                                   {topic.notes.map((note, idx) => (
//                                     <button
//                                       key={idx}
//                                       onClick={() => handleNoteClick(note, topic.title)}
//                                       className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-600 hover:bg-green-100 px-2 py-1 rounded transition-colors"
//                                     >
//                                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                                       </svg>
//                                       Note {idx + 1}
//                                     </button>
//                                   ))}
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                           {topic.isCompleted && (
//                             <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                             </svg>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {selectedCourse.status !== 'Completed' && (
//                 <div className="mt-6">
//                   <button
//                     onClick={() => {
//                       JoinClass(selectedCourse);
//                       closeModal();
//                     }}
//                     className={`w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
//                       selectedCourse.status === 'Live'
//                         ? 'bg-red-600 text-white hover:bg-red-700'
//                         : 'bg-blue-600 text-white hover:bg-blue-700'
//                     }`}
//                   >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     {selectedCourse.status === 'Live' ? 'Join Class Now' : 'Register & Join Class'}
//                   </button>
//                 </div>
//               )}

//               {selectedCourse.status === 'Completed' && (
//                 <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
//                   <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                   <p className="text-gray-500">This class has been completed.</p>
//                   <p className="text-gray-400 text-sm mt-1">Check out other upcoming classes!</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Notes Modal */}
//       {showNotesModal && selectedNotes && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeNotesModal}>
//           <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
//             <div className="border-b border-gray-200 p-5 bg-gradient-to-r from-green-50 to-white">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <div className="flex items-center gap-2 mb-1">
//                     <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
//                       📝 Notes
//                     </span>
//                   </div>
//                   <h3 className="text-xl font-semibold text-gray-900">{selectedTopicTitle}</h3>
//                 </div>
//                 <button
//                   onClick={closeNotesModal}
//                   className="text-gray-400 hover:text-gray-600 transition-colors"
//                 >
//                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>
//             </div>

//             <div className="p-5 overflow-y-auto max-h-[calc(80vh-120px)]">
//               {/* Note Content Display */}
//               <div className="prose max-w-none">
//                 {typeof selectedNotes === 'string' && (selectedNotes.startsWith('http') || selectedNotes.startsWith('/')) ? (
//                   // If note is a URL, show embedded viewer or link
//                   <div className="text-center">
//                     <p className="text-gray-600 mb-4">This note is available as a file:</p>
//                     <a
//                       href={selectedNotes}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                     >
//                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                       </svg>
//                       Download Note
//                     </a>
//                   </div>
//                 ) : typeof selectedNotes === 'object' ? (
//                   // If note is an object, display as formatted JSON
//                   <div>
//                     <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
//                       {JSON.stringify(selectedNotes, null, 2)}
//                     </pre>
//                     <button
//                       onClick={() => downloadNote(selectedNotes, 0)}
//                       className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                     >
//                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
//                       </svg>
//                       Download as JSON
//                     </button>
//                   </div>
//                 ) : (
//                   // If note is plain text
//                   <div>
//                     <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
//                       {selectedNotes}
//                     </div>
//                     <button
//                       onClick={() => downloadNote(selectedNotes, 0)}
//                       className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                     >
//                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
//                       </svg>
//                       Download Note
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Add custom CSS for animations */}
//       <style jsx>{`
//         @keyframes slideIn {
//           from {
//             transform: translateX(100%);
//             opacity: 0;
//           }
//           to {
//             transform: translateX(0);
//             opacity: 1;
//           }
//         }
        
//         .animate-slide-in {
//           animation: slideIn 0.3s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default OnlineCourses;