import React, { useState } from 'react';
import axios from 'axios';
import instructorApi from '../../services/instructorendpoint';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin, Award, CheckCircle, ArrowRight } from 'lucide-react';

const InstructorRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    address: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim() || !formData.phone.trim()) {
      return toast.error("Please fill in all required fields");
    }

    setLoading(true);
    try {
      const res = await axios.post(instructorApi.instructor.register, formData);
      if (res.data.success) {
        toast.success("Teacher Account Created Successfully! Please Sign In.");
        navigate("/stdlogin");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8faff] bg-line-grid flex items-center justify-center p-4 md:p-8 font-poppins">

      <div className="w-full max-w-[1050px] bg-white rounded-xl border border-gray-100 shadow-2xl shadow-blue-900/5 flex overflow-hidden">

        {/* Left Visual Sidebar */}
        <div className="hidden md:flex md:w-[42%] relative overflow-hidden text-white flex-col justify-between p-10 group">
          <img
            src="/assets/student_study.png"
            alt="Faculty"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/80 via-black/20 to-transparent" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <Link to="/" title="Go to Home">
                <img src="/logo.svg" alt="Roots Classes" className="h-12 w-auto bg-white p-1.5 rounded-lg shadow-sm hover:opacity-90 transition-all cursor-pointer" />
              </Link>
              <span className="text-[10px] font-black text-white bg-black/40 backdrop-blur-md px-2.5 py-1 uppercase tracking-[0.2em] shadow-sm">Faculty Portal</span>
            </div>



            <h1 className="text-3xl font-black tracking-tight leading-tight mb-4 drop-shadow-md">
              Inspire & Educate the Next Generation.
            </h1>
            <p className="text-xs text-gray-50 font-medium leading-relaxed drop-shadow-sm">
              Create your teacher account to publish courses, manage course content, upload test modules, and mentor top rankers.
            </p>
          </div>

          <div className="relative z-10 space-y-4 pt-6 border-t border-white/15 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <CheckCircle size={18} className="text-[#0078FF]" />
              <span className="text-xs font-bold text-gray-200">Course Content & Module Manager</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle size={18} className="text-[#0078FF]" />
              <span className="text-xs font-bold text-gray-200">Real-time Student Enrolment Stats</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle size={18} className="text-[#0078FF]" />
              <span className="text-xs font-bold text-gray-200">Publish Tests & Monitor Results</span>
            </div>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-between bg-white">
          <div>

            {/* Header & Toggle Link */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-[#0078FF]" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Faculty Registration</span>
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create Teacher Account</h2>
              </div>
              <Link to="/register" className="text-[11px] font-bold text-[#0078FF] hover:underline bg-blue-50 px-3.5 py-1.5 rounded-lg transition-all">
                Student Register →
              </Link>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-gray-50/80 border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-xs font-bold focus:outline-none focus:border-[#0078FF] focus:bg-white transition-all"
                    placeholder="Prof. Satyam Verma"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-gray-50/80 border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-xs font-bold focus:outline-none focus:border-[#0078FF] focus:bg-white transition-all"
                    placeholder="satya2025m@gmail.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Number</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-gray-50/80 border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-xs font-bold focus:outline-none focus:border-[#0078FF] focus:bg-white transition-all"
                      placeholder="10-digit phone"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-gray-50/80 border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-xs font-bold focus:outline-none focus:border-[#0078FF] focus:bg-white transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {/* Address / Specialization */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Address / Department</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <textarea
                    name="address"
                    rows="2"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full bg-gray-50/80 border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-xs font-bold focus:outline-none focus:border-[#0078FF] focus:bg-white transition-all resize-none"
                    placeholder="Enter department or campus address"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0a1628] hover:bg-[#0078FF] text-white py-3.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-900/10 mt-6 disabled:opacity-50"
              >
                {loading ? 'Registering Teacher...' : 'Register Teacher Account'} <ArrowRight size={16} />
              </button>

            </form>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs font-bold text-gray-400">
            Already have an account? <Link to="/stdlogin" className="text-[#0078FF] hover:underline ml-1">Sign In</Link>
          </div>

        </div>

      </div>

    </div>
  );
};

export default InstructorRegister;
