import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Search, Eye, User, Ban, CheckCircle, ShieldAlert } from 'lucide-react';
import api from '../../../services/adminendpoint';
import Loader from '../../../components/AdminComponent/Loader';
import { toast } from 'react-toastify';

const AllStudent = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const GetAllStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.post(api.admin.getStudents);
      console.log(response, "All student details fetched successfully");
      
      if (response.data && response.data.data) {
        setStudents(response.data.data);
      } else if (response.data && response.data.data && response.data.data.data) {
        setStudents(response.data.data.data);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.log(error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetAllStudents();
  }, []);

  const handleToggleBan = async (student) => {
    const actionText = student.isBanned ? "Unban" : "Ban";
    if (!window.confirm(`Are you sure you want to ${actionText} ${student.fullName || student.email}?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await axios.post(api.admin.toggleBanStudent, {
        studentId: student._id,
        isBanned: !student.isBanned
      });

      toast.success(res.data.message || `Student ${actionText}ned successfully`);
      
      // Update local state
      setStudents(prev => prev.map(s => s._id === student._id ? { ...s, isBanned: !s.isBanned } : s));
      if (selectedStudent && selectedStudent._id === student._id) {
        setSelectedStudent(prev => ({ ...prev, isBanned: !prev.isBanned }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${actionText} student`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const getClassColor = (className) => {
    const colors = {
      "12th": "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
      "11th": "bg-blue-50 text-blue-700 border border-blue-200/60",
      "10th": "bg-amber-50 text-amber-700 border border-amber-200/60",
      "9th": "bg-purple-50 text-purple-700 border border-purple-200/60",
    };
    return colors[className] || "bg-gray-50 text-gray-700 border border-gray-200/60";
  };

  const getAvatar = (student) => {
    if (student.profileImage) {
      return student.profileImage;
    }
    const name = student.fullName || 'Student';
    const colors = ['0078FF', 'FB0500', '10B981', '8B5CF6', 'F59E0B', 'EC4899'];
    const randomColor = colors[name?.length % colors.length];
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${randomColor}&color=fff&size=128&bold=true&length=2`;
  };

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.fullName?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower) ||
      student.currentClass?.toLowerCase().includes(searchLower) ||
      student.phone?.toLowerCase().includes(searchLower)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <Loader message="Loading Students..." />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-12">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200/80 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                 <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#FB0500]" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Student Directory</p>
                 </div>
                 <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                    Roster Management
                 </h1>
                 <p className="text-xs text-gray-500 mt-0.5">Oversee, monitor, and manage student access across the platform.</p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                 <div className="relative flex-1 md:w-80">
                    <input
                      type="text"
                      placeholder="Filter by name, email or class..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-700 focus:outline-none focus:border-[#0078FF] focus:ring-1 focus:ring-[#0078FF] transition-all placeholder:text-gray-400"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Students Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-md border border-gray-200 p-12 text-center shadow-xs">
            <div className="w-14 h-14 bg-gray-50 rounded-md flex items-center justify-center mx-auto mb-4 border border-gray-200/60 text-gray-400">
               <User className="h-7 w-7" />
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1">No students found</h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">Try adjusting your filters or search terms to find student records.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Mobile Card View (Small Screens) */}
            <div className="block md:hidden space-y-3">
              {currentStudents.map((student, idx) => (
                <div key={student._id} className="bg-white rounded-md border border-gray-200 p-4 shadow-xs relative">
                  <span className="absolute top-4 right-4 text-xs font-mono text-gray-400">#{(indexOfFirstItem + idx + 1).toString().padStart(2, '0')}</span>
                  <div className="flex items-center gap-3 mb-3">
                     <div className="relative">
                        <img
                           className="h-11 w-11 rounded-full object-cover border border-gray-200"
                           src={getAvatar(student)}
                           alt={student.fullName}
                        />
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${student.isBanned ? 'bg-red-500' : 'bg-emerald-500'}`} />
                     </div>
                     <div className="pr-6">
                        <h3 className="text-sm font-bold text-gray-900 leading-tight">{student.fullName}</h3>
                        <p className="text-xs text-gray-500 truncate">{student.email}</p>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                     <div className="bg-gray-50 p-2.5 rounded-md border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Sector</p>
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${getClassColor(student.currentClass)}`}>
                           {student.currentClass || 'N/A'}
                        </span>
                      </div>
                     <div className="bg-gray-50 p-2.5 rounded-md border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Status</p>
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${student.isBanned ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                           {student.isBanned ? 'Banned' : 'Active'}
                        </span>
                     </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-3 gap-2">
                     <button
                       onClick={() => handleToggleBan(student)}
                       disabled={actionLoading}
                       className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${
                         student.isBanned
                           ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                           : 'bg-red-50 text-red-600 hover:bg-red-100'
                       }`}
                     >
                       <Ban size={13} /> {student.isBanned ? 'Unban Account' : 'Ban Account'}
                     </button>
                     <button 
                       onClick={() => handleViewDetails(student)}
                       className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0078FF] rounded-md text-xs font-semibold transition-colors"
                     >
                        View Profile
                     </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tablet / Desktop Data Table */}
            <div className="hidden md:block bg-white rounded-md border border-gray-200/80 overflow-hidden shadow-xs">
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-200/80 text-gray-500 font-semibold text-xs">
                           <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider">S.No</th>
                           <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider">Student Identity</th>
                           <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider">Sector / Class</th>
                           <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider">Status</th>
                           <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider">Interest</th>
                           <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100 text-sm">
                        {currentStudents.map((student, idx) => (
                           <tr key={student._id} className="hover:bg-gray-50/60 transition-colors">
                              <td className="px-6 py-4">
                                 <span className="text-xs font-mono text-gray-400">{(indexOfFirstItem + idx + 1).toString().padStart(2, '0')}</span>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                    <div className="relative">
                                       <img
                                          className="h-9 w-9 rounded-full object-cover border border-gray-200"
                                          src={getAvatar(student)}
                                          alt={student.fullName}
                                       />
                                       <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${student.isBanned ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                    </div>
                                    <div>
                                       <h3 className="text-sm font-semibold text-gray-900 leading-none mb-1">{student.fullName}</h3>
                                       <p className="text-xs text-gray-500">{student.email}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <span className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-semibold ${getClassColor(student.currentClass)}`}>
                                    {student.currentClass || 'N/A'}
                                 </span>
                              </td>
                              <td className="px-6 py-4">
                                 <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                   student.isBanned
                                     ? 'bg-red-100/80 text-red-700 border border-red-200'
                                     : 'bg-emerald-100/80 text-emerald-700 border border-emerald-200'
                                 }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${student.isBanned ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                    {student.isBanned ? 'Banned' : 'Active'}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-xs font-semibold text-[#0078FF]">
                                 {student.interestedCourse || 'General'}
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <div className="inline-flex items-center gap-2 justify-end">
                                    <button 
                                      onClick={() => handleToggleBan(student)}
                                      disabled={actionLoading}
                                      title={student.isBanned ? "Unban Account" : "Ban Account"}
                                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 border rounded-md text-xs font-semibold transition-colors ${
                                        student.isBanned
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                          : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                      }`}
                                    >
                                       <Ban size={13} /> {student.isBanned ? 'Unban' : 'Ban'}
                                    </button>
                                    <button 
                                      onClick={() => handleViewDetails(student)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-blue-50 text-[#0078FF] border border-gray-200/80 hover:border-blue-200 rounded-md text-xs font-semibold transition-colors"
                                    >
                                       <Eye size={13} /> View
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* Pagination */}
            {filteredStudents.length > itemsPerPage && (
               <div className="flex items-center justify-between px-2 pt-2">
                  <p className="text-xs text-gray-500 font-medium">
                     Showing {indexOfFirstItem + 1}—{Math.min(indexOfLastItem, filteredStudents.length)} of {filteredStudents.length} Students
                  </p>
                  <div className="flex gap-2">
                     <button 
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded-md bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-all shadow-xs"
                     >
                        Previous
                     </button>
                     <button 
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 rounded-md bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-all shadow-xs"
                     >
                        Next
                     </button>
                  </div>
               </div>
            )}
          </div>
        )}
      </div>

      {/* Modal for Student Details */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-lg max-w-xl w-full border border-gray-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="relative p-6 border-b border-gray-100 bg-gray-50/50">
               <div className="flex items-center gap-4">
                  <img 
                    src={getAvatar(selectedStudent)} 
                    alt={selectedStudent.fullName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                  <div>
                     <div className="flex items-center gap-2 mb-0.5">
                        <span className={`w-2 h-2 rounded-full ${selectedStudent.isBanned ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Student Profile • {selectedStudent.isBanned ? 'Banned' : 'Active'}
                        </span>
                     </div>
                     <h2 className="text-lg font-bold text-gray-900 leading-tight">{selectedStudent.fullName}</h2>
                     <p className="text-xs font-semibold text-[#0078FF]">{selectedStudent.currentClass || 'General'} Sector</p>
                  </div>
               </div>
               <button onClick={closeModal} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-md hover:bg-gray-100">
                  <Plus size={18} className="rotate-45" />
               </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 text-sm">
               {selectedStudent.isBanned && (
                 <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-xs text-red-700 font-semibold">
                   <ShieldAlert size={16} />
                   <span>This student account is currently <strong>BANNED</strong> and cannot log in to the portal.</span>
                 </div>
               )}

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contact Information</p>
                     <div className="space-y-3">
                        <div>
                           <p className="text-[11px] font-medium text-gray-400">Email Address</p>
                           <p className="font-semibold text-gray-800 break-all">{selectedStudent.email}</p>
                        </div>
                        <div>
                           <p className="text-[11px] font-medium text-gray-400">Phone Number</p>
                           <p className="font-semibold text-gray-800">{selectedStudent.phone || 'N/A'}</p>
                        </div>
                     </div>
                  </div>
                  <div>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Academic Details</p>
                     <div className="space-y-3">
                        <div>
                           <p className="text-[11px] font-medium text-gray-400">Interested Course</p>
                           <p className="font-semibold text-gray-800">{selectedStudent.interestedCourse || 'General Curriculum'}</p>
                        </div>
                        <div>
                           <p className="text-[11px] font-medium text-gray-400">Date of Birth</p>
                           <p className="font-semibold text-gray-800">{selectedStudent.dateofBirth ? new Date(selectedStudent.dateofBirth).toLocaleDateString() : 'N/A'}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => handleToggleBan(selectedStudent)}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-md font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  selectedStudent.isBanned
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                }`}
              >
                <Ban size={14} /> {selectedStudent.isBanned ? 'Unban Student' : 'Ban Student'}
              </button>

              <button
                onClick={closeModal}
                className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-md font-semibold text-xs uppercase tracking-wider transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllStudent;