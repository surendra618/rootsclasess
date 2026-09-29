import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Monitor, 
  Save, 
  ShieldCheck, 
  Smartphone,
  Eye,
  EyeOff,
  Zap as ZapIcon
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import useStudentStore from '../../Store/studentstore';
import api from '../../services/adminendpoint';

const Settings = () => {
  const { student, setStudent } = useStudentStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (student) {
      setFormData(prev => ({
        ...prev,
        fullName: student.fullName || student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        address: student.address || ''
      }));
    }
  }, [student]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL || "http://localhost:5050";
      const response = await axios.post(`${BASE_URL}/student/edit-profile-details`, {
        studentId: student._id,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      });

      if (response.data.success) {
        setStudent({ user: response.data.user, token: localStorage.getItem('token') });
        toast.success('Profile Intelligence Updated');
      }
    } catch (error) {
      toast.error('Update Failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!formData.newPassword) {
      return toast.error('Please enter a new password');
    }
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      const response = await axios.post(api.admin.changePassword, {
        email: student?.email || formData.email,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Password changed successfully!');
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password update failed. Check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 md:p-8 space-y-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Sticky Header */}
        <div className="bg-white rounded-lg border border-gray-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <div className="w-2 h-2 rounded-full bg-[#FB0500]" />
               <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Portal Controls</p>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">System Settings</h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200/60 rounded-md">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-xs font-semibold text-emerald-700">System Online</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Navigation Sidebar */}
          <div className="space-y-1">
             {[
               { id: 'profile', label: 'Identity Profile', icon: User },
               { id: 'security', label: 'Security & Auth', icon: Lock },
               { id: 'notifications', label: 'System Alerts', icon: Bell },
               { id: 'appearance', label: 'Interface Theme', icon: Monitor },
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-xs font-bold transition-all ${
                   activeTab === tab.id 
                     ? 'bg-[#0078FF] text-white shadow-xs' 
                     : 'bg-white text-gray-600 border border-gray-200/60 hover:bg-gray-50'
                 }`}
               >
                 <tab.icon size={16} />
                 {tab.label}
               </button>
             ))}
          </div>

          {/* Settings Content Area */}
          <div className="lg:col-span-3">
             <div className="bg-white rounded-lg border border-gray-200/80 shadow-xs overflow-hidden">
                
                {activeTab === 'profile' && (
                  <form onSubmit={handleProfileUpdate} className="animate-fadeIn">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                       <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">Identity Management</h2>
                       <p className="text-xs text-gray-500">Update your administrator profile credentials and contact information.</p>
                    </div>
                    <div className="p-6 space-y-5">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-1.5">
                             <label className="text-xs font-semibold text-gray-700">Full Name</label>
                             <div className="relative">
                                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input name="fullName" type="text" value={formData.fullName} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-md py-2.5 pl-10 pr-4 text-xs font-medium focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none transition-all" />
                             </div>
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-xs font-semibold text-gray-700">Email Address</label>
                             <div className="relative">
                                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-md py-2.5 pl-10 pr-4 text-xs font-medium focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none transition-all" />
                             </div>
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-xs font-semibold text-gray-700">Phone Number</label>
                             <div className="relative">
                                <Smartphone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input name="phone" type="text" value={formData.phone} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-md py-2.5 pl-10 pr-4 text-xs font-medium focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none transition-all" />
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="p-4 bg-gray-50/60 border-t border-gray-100 flex justify-end">
                       <button disabled={loading} type="submit" className="flex items-center gap-2 bg-[#0078FF] text-white px-5 py-2 rounded-md font-bold text-xs hover:bg-blue-600 transition-all disabled:opacity-50 shadow-xs">
                          <Save size={15} /> {loading ? 'Saving...' : 'Save Profile Changes'}
                       </button>
                    </div>
                  </form>
                )}

                {activeTab === 'security' && (
                  <form onSubmit={handlePasswordUpdate} className="animate-fadeIn">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                       <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">Security Credentials</h2>
                       <p className="text-xs text-gray-500">Update your access password and security settings.</p>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="max-w-md space-y-4">
                          <div className="space-y-1.5">
                             <label className="text-xs font-semibold text-gray-700">Current Password (optional for first time)</label>
                             <div className="relative">
                                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input name="currentPassword" type={showCurrentPassword ? "text" : "password"} value={formData.currentPassword} onChange={handleInputChange} placeholder="••••••••" className="w-full bg-white border border-gray-200 rounded-md py-2.5 pl-10 pr-10 text-xs font-medium focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] outline-none transition-all" />
                                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                   {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                             </div>
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-xs font-semibold text-gray-700">New Password</label>
                             <div className="relative">
                                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input name="newPassword" type={showPassword ? "text" : "password"} value={formData.newPassword} onChange={handleInputChange} placeholder="Enter new password" className="w-full bg-white border border-gray-200 rounded-md py-2.5 pl-10 pr-10 text-xs font-medium focus:ring-2 focus:ring-[#FB0500]/20 focus:border-[#FB0500] outline-none transition-all" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                   {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                             </div>
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-xs font-semibold text-gray-700">Confirm New Password</label>
                             <div className="relative">
                                <ShieldCheck size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input name="confirmPassword" type={showPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleInputChange} placeholder="Repeat new password" className="w-full bg-white border border-gray-200 rounded-md py-2.5 pl-10 pr-4 text-xs font-medium focus:ring-2 focus:ring-[#FB0500]/20 focus:border-[#FB0500] outline-none transition-all" />
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="p-4 bg-gray-50/60 border-t border-gray-100 flex justify-end">
                       <button disabled={loading} type="submit" className="flex items-center gap-2 bg-[#FB0500] text-white px-5 py-2 rounded-md font-bold text-xs hover:bg-red-600 transition-all shadow-xs">
                          <ZapIcon size={15} /> Reset Password
                       </button>
                    </div>
                  </form>
                )}

                {activeTab === 'appearance' && (
                  <div className="animate-fadeIn p-6">
                    <div className="border-b border-gray-100 pb-4 mb-6">
                       <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">Interface Controls</h2>
                       <p className="text-xs text-gray-500">Customize your portal layout density and aesthetics.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <button className="flex flex-col gap-3 p-5 rounded-md border-2 border-[#0078FF] bg-blue-50/40 text-left transition-all">
                          <div className="w-9 h-9 rounded-md bg-white border border-blue-100 flex items-center justify-center text-[#0078FF]">
                             <Monitor size={18} />
                          </div>
                          <div>
                             <p className="text-xs font-bold text-gray-900">Modern Compact Layout</p>
                             <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Clean flat elements with subtle borders. Optimized for maximum readability.</p>
                          </div>
                          <div className="mt-auto pt-2">
                             <span className="px-2.5 py-1 bg-[#0078FF] text-white text-[11px] font-semibold rounded-md">Active Theme</span>
                          </div>
                       </button>
                       <button className="flex flex-col gap-3 p-5 rounded-md border border-gray-200 bg-white hover:border-gray-300 text-left transition-all group">
                          <div className="w-9 h-9 rounded-md bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-gray-600">
                             <Monitor size={18} />
                          </div>
                          <div>
                             <p className="text-xs font-bold text-gray-700">Standard Layout</p>
                             <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Relaxed spacing and larger typography for presentation view.</p>
                          </div>
                       </button>
                    </div>
                  </div>
                )}

             </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Settings;
