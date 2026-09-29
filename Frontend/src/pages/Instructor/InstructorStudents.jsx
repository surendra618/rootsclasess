import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../services/adminendpoint';
import { Users, Search, Mail, Phone, BookOpen } from 'lucide-react';

const InstructorStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.post(api.admin.getStudents);
        setStudents(res.data.data || []);
      } catch {
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    return (
      (s.fullName || s.name || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q)
    );
  });

  const initials = (s) => {
    const n = s.fullName || s.name || '?';
    return n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 md:p-8 space-y-6">
      {/* Sticky Header */}
      <div className="bg-white rounded-lg border border-gray-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#0078FF]"></span>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Enrolled Students</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Student Directory</h1>
          <p className="text-xs text-gray-500 mt-0.5">{students.length} registered student{students.length !== 1 ? 's' : ''} on the platform</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-medium border border-gray-200 rounded-md bg-white focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none transition-all"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-100 border-t-[#0078FF] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200/80 shadow-xs">
          <Users size={36} className="mx-auto text-gray-300 mb-2" />
          <p className="text-xs font-medium text-gray-500">No students found matching your search query</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block md:hidden space-y-3">
            {filtered.map((student, idx) => (
              <div key={student._id} className="bg-white rounded-lg border border-gray-200/80 p-4 shadow-xs relative flex flex-col gap-3">
                <span className="absolute top-4 right-4 text-xs font-mono text-gray-400">#{idx + 1}</span>
                
                <div className="flex items-center gap-3 pr-8">
                  {student.profileImage ? (
                    <img src={student.profileImage} alt="" className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-blue-50 border border-blue-100 text-[#0078FF] flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {initials(student)}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-gray-900">{student.fullName || student.name}</p>
                    {student.class && <p className="text-[11px] text-gray-500 mt-0.5">Class {student.class}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  {student.email && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-100 col-span-2 sm:col-span-1">
                      <Mail size={12} className="text-gray-400 flex-shrink-0" />
                      <span className="truncate">{student.email}</span>
                    </div>
                  )}
                  {student.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-100 col-span-2 sm:col-span-1">
                      <Phone size={12} className="text-gray-400 flex-shrink-0" />
                      <span>{student.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200/60 px-2.5 py-1 rounded-md">
                    <BookOpen size={12} className="text-gray-400" />
                    {student.enrolledCourses?.length || 0} Courses
                  </span>
                  
                  <button
                    onClick={() => setSelected(student)}
                    className="text-xs font-bold text-[#0078FF] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-all"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-5 py-3.5">#</th>
                    <th className="px-5 py-3.5">Student Details</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">Phone</th>
                    <th className="px-5 py-3.5">Enrolled Courses</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {filtered.map((student, idx) => (
                    <tr key={student._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-4 font-mono text-gray-400">{idx + 1}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {student.profileImage ? (
                            <img src={student.profileImage} alt="" className="w-8 h-8 rounded-md object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-100 text-[#0078FF] flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {initials(student)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-900 text-xs">{student.fullName || student.name}</p>
                            {student.class && <p className="text-[11px] text-gray-400">Class {student.class}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{student.email || '—'}</td>
                      <td className="px-5 py-4 text-gray-600">{student.phone || '—'}</td>
                      <td className="px-5 py-4 font-medium">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 text-gray-700 border border-gray-200/60 text-xs font-semibold">
                          <BookOpen size={13} className="text-[#0078FF]" />
                          {student.enrolledCourses?.length || 0} Courses
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelected(student)}
                          className="px-3 py-1.5 bg-blue-50 text-[#0078FF] hover:bg-blue-100 font-semibold rounded-md text-xs transition-all"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-lg border border-gray-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[95vh] text-xs">
            <div className="bg-blue-50/60 border-b border-blue-100 p-6 text-center flex-shrink-0">
              {selected.profileImage ? (
                <img src={selected.profileImage} alt="" className="w-16 h-16 rounded-md object-cover mx-auto mb-3 shadow-xs" />
              ) : (
                <div className="w-16 h-16 rounded-md bg-white border border-blue-200 text-[#0078FF] flex items-center justify-center text-xl font-bold mx-auto mb-3 shadow-xs">
                  {initials(selected)}
                </div>
              )}
              <h3 className="text-sm font-bold text-gray-900">{selected.fullName || selected.name}</h3>
              {selected.class && <p className="text-xs text-gray-500 mt-0.5">Class {selected.class}</p>}
            </div>

            <div className="p-5 space-y-3 overflow-y-auto">
              {selected.email && (
                <div className="flex items-center gap-2.5 text-xs text-gray-700 bg-gray-50 p-2.5 rounded-md border border-gray-100">
                  <Mail size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate">{selected.email}</span>
                </div>
              )}
              {selected.phone && (
                <div className="flex items-center gap-2.5 text-xs text-gray-700 bg-gray-50 p-2.5 rounded-md border border-gray-100">
                  <Phone size={14} className="text-gray-400 flex-shrink-0" />
                  <span>{selected.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-xs text-gray-700 bg-gray-50 p-2.5 rounded-md border border-gray-100">
                <BookOpen size={14} className="text-gray-400 flex-shrink-0" />
                <span>{selected.enrolledCourses?.length || 0} enrolled course{selected.enrolledCourses?.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => setSelected(null)}
                className="w-full py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-100 transition-all shadow-xs"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorStudents;
