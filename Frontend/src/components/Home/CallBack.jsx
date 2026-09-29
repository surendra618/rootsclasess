import React, { useState } from 'react';
import axios from 'axios';
import api from '../../services/endpoints';
import { toast } from 'react-toastify';
import { Target, FileCheck, BookOpen } from 'lucide-react';

const benefits = [
  { icon: Target, title: 'Free Career Counseling', desc: 'Expert guidance on your future path', iconBg: 'bg-red-50', iconBorder: 'border-red-100', iconColor: 'text-[#FB0500]' },
  { icon: FileCheck, title: 'Personalized Study Plan', desc: 'Tailored roadmap for your goals', iconBg: 'bg-blue-50', iconBorder: 'border-blue-100', iconColor: 'text-[#0078FF]' },
  { icon: BookOpen, title: 'Course Recommendations', desc: 'Best programs based on your profile', iconBg: 'bg-green-50', iconBorder: 'border-green-100', iconColor: 'text-[#08B100]' },
];

const ExpertConsultationForm = () => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', mobileNo: '', stream: '', class: '', emailId: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.mobileNo.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(api.callback.request, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobileNumber: formData.mobileNo,
        email: formData.emailId,
        stream: formData.stream,
        studentClass: formData.class,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setFormData({ firstName: '', lastName: '', mobileNo: '', stream: '', class: '', emailId: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-md text-sm focus:border-[#FB0500] focus:ring-2 focus:ring-red-100 transition outline-none bg-white text-gray-900';
  const labelCls = 'block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5';

  return (
    <div className="bg-line-grid py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* Left Info Panel */}
          <div className="lg:w-2/5 lg:sticky lg:top-24">
            <p className="text-xs font-bold text-[#0078FF] uppercase tracking-widest mb-3">Get in Touch</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
              Talk to our <span className="text-[#FB0500]">Expert</span>
            </h2>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Get personalized guidance from our education experts. Fill in your details and we'll reach out to you shortly.
            </p>

            {/* Benefits */}
            <div className="space-y-4">
              {benefits.map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.title} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-md ${b.iconBg} border ${b.iconBorder} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${b.iconColor}`} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{b.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{b.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="mt-8 flex gap-8">
              <div>
                <div className="text-2xl font-black text-[#FB0500]">10,000+</div>
                <div className="text-xs font-medium text-gray-500 mt-0.5">Students Counseled</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#0078FF]">98%</div>
                <div className="text-xs font-medium text-gray-500 mt-0.5">Satisfaction Rate</div>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="lg:w-3/5 w-full">
            <div className="bg-white rounded-md p-6 sm:p-8 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Request a Callback</h3>
              <p className="text-xs text-gray-500 mb-6">Our expert will contact you within 24 hours</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>First Name <span className="text-[#FB0500]">*</span></label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className={inputCls} placeholder="First name" />
                  </div>
                  <div>
                    <label className={labelCls}>Last Name</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className={inputCls} placeholder="Last name" />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Mobile Number <span className="text-[#FB0500]">*</span></label>
                  <input type="tel" name="mobileNo" value={formData.mobileNo} onChange={handleChange} maxLength="10" required className={inputCls} placeholder="10-digit mobile number" />
                </div>

                <div>
                  <label className={labelCls}>Email ID <span className="text-[#FB0500]">*</span></label>
                  <input type="email" name="emailId" value={formData.emailId} onChange={handleChange} required className={inputCls} placeholder="your@email.com" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Stream <span className="text-[#FB0500]">*</span></label>
                    <select name="stream" value={formData.stream} onChange={handleChange} required className={inputCls}>
                      <option value="">Select Stream</option>
                      <option value="science">Science (PCM/PCB)</option>
                      <option value="commerce">Commerce</option>
                      <option value="arts">Arts/Humanities</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Class <span className="text-[#FB0500]">*</span></label>
                    <select name="class" value={formData.class} onChange={handleChange} required className={inputCls}>
                      <option value="">Select Class</option>
                      <option value="8th">Class 8th</option>
                      <option value="9th">Class 9th</option>
                      <option value="10th">Class 10th</option>
                      <option value="11th">Class 11th</option>
                      <option value="12th">Class 12th</option>
                      <option value="dropper">Dropper</option>
                      <option value="graduate">Graduate</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <input type="checkbox" id="terms" required className="mt-0.5 w-4 h-4 accent-[#FB0500] border-gray-300 rounded-sm" />
                  <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed">
                    By submitting, I agree to receive WhatsApp communication and accept Roots Classes'{' '}
                    <a href="/termsandconditions" className="text-[#FB0500] hover:underline">T&C</a> &{' '}
                    <a href="/privacypolicy" className="text-[#FB0500] hover:underline">Privacy Policy</a>.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-[#FB0500] text-white font-bold rounded-md text-sm hover:opacity-90 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Request Callback →'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExpertConsultationForm;
