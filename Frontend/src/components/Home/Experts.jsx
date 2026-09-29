import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../services/adminendpoint';
import { Loader2 } from 'lucide-react';

const FacultyShowcase = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const response = await axios.get(api.faculty.get);
        if (response.data.success) setFaculty(response.data.data);
      } catch (error) {
        console.error('Error fetching faculty:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, []);

  if (loading) return (
    <div className="py-20 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#FB0500]" />
    </div>
  );

  if (faculty.length === 0) return null;

  return (
    <div className="bg-line-grid py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-xs font-bold text-[#0078FF] uppercase tracking-widest mb-3">Meet the Team</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our Expert Faculty</h2>
          </div>
          <p className="text-sm text-gray-500 max-w-xs md:text-right leading-relaxed">
            India's top educators with years of proven teaching methodology.
          </p>
        </div>

        {/* Grid — Clean aligned photo cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {faculty.map((member, index) => (
            <div
              key={member._id}
              className="group bg-white rounded-md overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 flex flex-col h-full"
            >
              {/* Photo area */}
              <div className="relative h-64 bg-gradient-to-b from-gray-50 to-gray-100/80 border-b border-gray-100 overflow-hidden flex items-end justify-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Info area */}
              <div className="p-5 flex flex-col flex-1 justify-between bg-white">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#FB0500] transition-colors">{member.name}</h3>
                      <span className="inline-block mt-0.5 text-xs font-bold uppercase tracking-wider" style={{ color: index % 2 === 0 ? '#FB0500' : '#0078FF' }}>
                        {member.subject}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-yellow-50 border border-yellow-200 text-yellow-700 flex-shrink-0">
                      <svg className="w-3.5 h-3.5 fill-current text-yellow-500" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs font-bold">{member.rating}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed">{member.description}</p>
                </div>

                <div className="flex items-center justify-between mt-5 pt-3 border-t border-gray-100 text-xs font-semibold text-gray-500">
                  <span>Experience</span>
                  <span className="text-gray-900 font-bold">{member.experience}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default FacultyShowcase;
