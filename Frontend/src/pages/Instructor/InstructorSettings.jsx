import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useStudentStore from '../../Store/studentstore';
import { toast } from 'react-toastify';
import { User, Mail, Phone, Lock, Eye, EyeOff, Save } from 'lucide-react';

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'password', label: 'Change Password' },
];

const InstructorSettings = () => {
  const { student, setStudent } = useStudentStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [profile, setProfile] = useState({ fullName: '', email: '', phone: '' });
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (student) {
      setProfile({
        fullName: student.fullName || student.name || '',
        email: student.email || '',
        phone: student.phone || '',
      });
    }
  }, [student]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5050";
      const res = await axios.post(`${BASE_URL}/student/edit-profile-details`, {
        studentId: student._id,
        ...profile,
      });
      if (res.data.success) {
        setStudent({ user: res.data.user, token: localStorage.getItem('token') });
        toast.success('Profile updated');
      }
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (passwords.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5050";
      const res = await axios.post(`${BASE_URL}/student/reset-password`, {
        email: student.email,
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword,
      });
      if (res.data.success) {
        toast.success('Password changed successfully');
        setPasswords({ newPassword: '', confirmPassword: '' });
      }
    } catch {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 md:p-8 space-y-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Sticky Header */}
        <div className="bg-white rounded-lg border border-gray-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#0078FF]"></span>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Account & Security</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Instructor Settings</h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage your instructor profile details and password security</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-md w-fit">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#0078FF] text-white rounded-md shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg border border-gray-200/80 shadow-xs overflow-hidden">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave}>
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Personal Information</h2>
                <p className="text-xs text-gray-500 mt-0.5">Update your display name, email, and phone contact</p>
              </div>
              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))}
                      className="w-full border border-gray-200 rounded-md py-2.5 pl-10 pr-4 text-xs font-medium focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none transition-all"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={profile.email}
                      onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                      className="w-full border border-gray-200 rounded-md py-2.5 pl-10 pr-4 text-xs font-medium focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                      className="w-full border border-gray-200 rounded-md py-2.5 pl-10 pr-4 text-xs font-medium focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none transition-all"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50/60 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-[#0078FF] text-white text-xs font-bold uppercase tracking-wider px-5 py-2 rounded-md hover:bg-blue-600 disabled:opacity-60 transition-all shadow-xs"
                >
                  <Save size={14} /> {loading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSave}>
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Change Password</h2>
                <p className="text-xs text-gray-500 mt-0.5">Choose a strong password (at least 6 characters)</p>
              </div>
              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={passwords.newPassword}
                      onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                      required
                      className="w-full border border-gray-200 rounded-md py-2.5 pl-10 pr-10 text-xs font-medium focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none transition-all"
                      placeholder="New password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={passwords.confirmPassword}
                      onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                      required
                      className="w-full border border-gray-200 rounded-md py-2.5 pl-10 pr-4 text-xs font-medium focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none transition-all"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50/60 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-[#0078FF] text-white text-xs font-bold uppercase tracking-wider px-5 py-2 rounded-md hover:bg-blue-600 disabled:opacity-60 transition-all shadow-xs"
                >
                  <Save size={14} /> {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorSettings;
