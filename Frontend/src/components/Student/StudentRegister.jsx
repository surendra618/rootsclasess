import axios from 'axios';
import React, { useState } from 'react';
import api from '../../services/endpoints';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { User, BookOpen, Check, ChevronRight, ChevronLeft, Globe, Apple, Mail, ShieldCheck, RefreshCw, CheckCircle2 } from 'lucide-react';

const DISPOSABLE_DOMAINS = [
  "mailinator.com", "tempmail.com", "temp-mail.org", "10minutemail.com",
  "10minutemail.net", "guerrillamail.com", "sharklasers.com", "yopmail.com",
  "yopmail.fr", "dispostable.com", "trashmail.com", "getairmail.com",
  "mohmal.com", "crazymailing.com", "maildrop.cc", "fake.com", "test.com",
  "example.com", "demo.com", "dummy.com", "throwawaymail.com"
];

const StudentRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // OTP Verification States
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', password: '',
    dateofBirth: '', gender: '', currentClass: '',
    interestedCourse: '', address: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setIsEmailVerified(false);
      setIsOtpSent(false);
      setOtpCode('');
      setOtpDigits(["", "", "", "", "", ""]);
      setFormData({ ...formData, [name]: value });
    } else if (name === 'phone') {
      // Allow only numbers and max 10 digits
      const onlyNumbers = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, phone: onlyNumbers });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleOtpDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    const fullCode = newDigits.join("");
    setOtpCode(fullCode);

    // Auto focus next box
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        const newDigits = [...otpDigits];
        newDigits[index - 1] = "";
        setOtpDigits(newDigits);
        setOtpCode(newDigits.join(""));
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasteData) {
      const newDigits = ["", "", "", "", "", ""];
      for (let i = 0; i < pasteData.length; i++) {
        newDigits[i] = pasteData[i];
      }
      setOtpDigits(newDigits);
      setOtpCode(newDigits.join(""));
      const focusIndex = Math.min(pasteData.length, 5);
      const targetInput = document.getElementById(`otp-input-${focusIndex}`);
      if (targetInput) targetInput.focus();
    }
  };

  const isDummyEmail = (email) => {
    if (!email || !email.includes('@')) return false;
    const domain = email.trim().toLowerCase().split('@')[1];
    return DISPOSABLE_DOMAINS.includes(domain);
  };

  const handleSendOtp = async () => {
    const cleanEmail = formData.email.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error("Please enter your email first");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      toast.error("Please enter a valid email format");
      return;
    }

    if (isDummyEmail(cleanEmail)) {
      toast.error("Temporary/disposable email addresses are not allowed. Please enter your real email.");
      return;
    }

    setOtpLoading(true);
    try {
      await axios.post(api.student.sendOtp, { email: cleanEmail });
      toast.success("Verification code sent to your email!");
      setIsOtpSent(true);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP. Please check your email.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      toast.error("Please enter the 6-digit OTP received in your email");
      return;
    }

    setOtpLoading(true);
    try {
      await axios.post(api.student.verifyOTP, {
        email: formData.email.trim().toLowerCase(),
        otp: otpCode.trim()
      });
      toast.success("Email verified successfully! ✓");
      setIsEmailVerified(true);
      setIsOtpSent(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim()) {
        toast.error("Please fill in Name, Email, and Password");
        return false;
      }
      if (isDummyEmail(formData.email)) {
        toast.error("Disposable or dummy emails are blocked. Please use a real email provider.");
        return false;
      }
      if (!isEmailVerified) {
        toast.warning("Please verify your email address via OTP first to ensure real account security.");
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.dateofBirth || !formData.gender || !formData.currentClass) {
        toast.error("Please select Date of Birth, Gender, and Class");
        return false;
      }
    } else if (currentStep === 3) {
      const cleanPhone = formData.phone ? formData.phone.trim() : '';
      if (!cleanPhone) {
        toast.error("Please enter your 10-digit mobile number");
        return false;
      }
      if (cleanPhone.length !== 10) {
        toast.error("Mobile number must be exactly 10 digits");
        return false;
      }
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        toast.error("Please enter a valid Indian mobile number starting with 6, 7, 8, or 9");
        return false;
      }
      if (!formData.interestedCourse || !formData.address.trim()) {
        toast.error("Please fill in Course and Address");
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (step < 3) {
      handleNextStep();
      return;
    }
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }
    setLoading(true);
    try {
      await axios.post(api.student.register, {
        ...formData,
        email: formData.email.trim().toLowerCase()
      });
      toast.success("Account created successfully! Welcome to Roots Classes.");
      navigate("/stdlogin");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8faff] bg-line-grid flex items-center justify-center p-4 md:p-8 font-poppins">

      {/* Main Container - Sharp & Pro */}
      <div className="w-full max-w-[1050px] bg-white rounded-2xl border border-gray-100 flex overflow-hidden shadow-2xl shadow-blue-900/5">

        {/* Left Side: Multi-Step Form */}
        <div className="w-full md:w-[48%] p-8 md:p-12 flex flex-col justify-between relative z-10 border-r border-gray-50">
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Link to="/" title="Go to Home">
                  <img src="/logo.svg" alt="Roots Classes" className="h-8 w-auto hover:opacity-90 transition-all cursor-pointer" />
                </Link>
                <div className="h-4 w-[1px] bg-gray-200" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Step {step}/3</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3].map(s => <div key={s} className={`h-1 rounded-full transition-all duration-300 ${step === s ? 'w-6 bg-[#0078FF]' : 'w-1 bg-gray-100'}`} />)}
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">Create student account</h1>
              <p className="text-sm text-gray-400">Join the Roots Classes learning community.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              {/* Step 1: Identity */}
              {step === 1 && (
                <div className="animate-slideIn space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-3">Full Name</label>
                    <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-5 focus:outline-none focus:border-[#0078FF] transition-all text-xs font-bold" placeholder="John Doe" />
                  </div>

                  {/* Email with OTP Verification Box */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between ml-3 mr-1">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                      {isEmailVerified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <CheckCircle2 size={13} className="stroke-[2.5]" /> Verified
                        </span>
                      )}
                    </div>
                    
                    <div className="relative">
                      <input 
                        type="email" 
                        name="email" 
                        required 
                        disabled={isEmailVerified}
                        value={formData.email} 
                        onChange={handleChange} 
                        className={`w-full bg-gray-50 border rounded-xl py-3 pl-5 pr-24 focus:outline-none transition-all text-xs font-bold ${
                          isEmailVerified ? 'border-emerald-300 bg-emerald-50/40 text-emerald-900' : 'border-gray-100 focus:border-[#0078FF]'
                        }`} 
                        placeholder="yourname@gmail.com" 
                      />
                      
                      {!isEmailVerified && (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={otpLoading || countdown > 0 || !formData.email}
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#0078FF] hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg text-[10px] font-bold transition-all shadow-xs"
                        >
                          {otpLoading ? 'Sending...' : countdown > 0 ? `${countdown}s` : isOtpSent ? 'Resend' : 'Send OTP'}
                        </button>
                      )}
                    </div>

                    {/* Segmented Compact OTP Verification Box */}
                    {isOtpSent && !isEmailVerified && (
                      <div className="p-3 bg-gradient-to-br from-blue-50/90 via-sky-50/30 to-white border border-blue-200/80 rounded-xl space-y-2.5 mt-2 animate-slideIn shadow-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[#0078FF] shrink-0">
                              <ShieldCheck size={12} className="stroke-[2.5]" />
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-slate-900 leading-tight">Enter 6-Digit OTP</p>
                              <p className="text-[9.5px] font-medium text-slate-500 truncate max-w-[180px] sm:max-w-[220px]">Sent to {formData.email}</p>
                            </div>
                          </div>

                          {countdown > 0 ? (
                            <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded-md">
                              {countdown}s
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              disabled={otpLoading}
                              className="text-[10.5px] font-bold text-[#0078FF] hover:underline"
                            >
                              Resend OTP
                            </button>
                          )}
                        </div>

                        {/* 6 Compact Segmented Digit Boxes */}
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                          {[0, 1, 2, 3, 4, 5].map((idx) => (
                            <input
                              key={idx}
                              id={`otp-input-${idx}`}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={otpDigits[idx]}
                              onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              onPaste={handleOtpPaste}
                              className={`w-7.5 h-9 sm:w-9 sm:h-9.5 text-center text-sm font-bold font-mono rounded-lg bg-white border transition-all outline-none shadow-2xs ${
                                otpDigits[idx]
                                  ? 'border-[#0078FF] text-[#0078FF] bg-blue-50/40'
                                  : 'border-slate-200 text-slate-800 focus:border-[#0078FF] focus:ring-1.5 focus:ring-[#0078FF]/20'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Verify Action Button */}
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={otpLoading || otpCode.length !== 6}
                          className="w-full py-1.5 sm:py-2 bg-[#0078FF] hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                        >
                          {otpLoading ? (
                            <>
                              <RefreshCw size={12} className="animate-spin" /> Verifying...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={13} /> Verify & Confirm Email
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-3">Password</label>
                    <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-5 focus:outline-none focus:border-[#0078FF] transition-all text-xs font-bold" placeholder="••••••••" />
                  </div>
                </div>
              )}

              {/* Step 2: Academic */}
              {step === 2 && (
                <div className="animate-slideIn space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-3">DOB</label>
                      <input type="date" name="dateofBirth" required value={formData.dateofBirth} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-5 focus:outline-none focus:border-[#0078FF] text-xs font-bold" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-3">Gender</label>
                      <select name="gender" required value={formData.gender} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-5 focus:outline-none focus:border-[#0078FF] text-xs font-bold appearance-none">
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-3">Current Class</label>
                    <select name="currentClass" required value={formData.currentClass} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-5 focus:outline-none focus:border-[#0078FF] text-xs font-bold appearance-none">
                      <option value="">Select Class</option>
                      {['8th', '9th', '10th', '11th', '12th', 'Dropper'].map(c => <option key={c} value={c}>{c} Class</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 3: Finalize */}
              {step === 3 && (
                <div className="animate-slideIn space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between ml-3 mr-1">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                        {formData.phone.length === 10 && /^[6-9]\d{9}$/.test(formData.phone) && (
                          <span className="text-[10px] font-bold text-emerald-600">✓ Valid</span>
                        )}
                      </div>
                      <input 
                        type="tel" 
                        name="phone" 
                        required 
                        maxLength={10}
                        inputMode="numeric"
                        value={formData.phone} 
                        onChange={handleChange} 
                        className={`w-full bg-gray-50 border rounded-xl py-3 px-5 focus:outline-none transition-all text-xs font-bold ${
                          formData.phone.length === 10
                            ? /^[6-9]\d{9}$/.test(formData.phone)
                              ? 'border-emerald-300 focus:border-emerald-500'
                              : 'border-red-300 focus:border-red-500'
                            : 'border-gray-100 focus:border-[#0078FF]'
                        }`} 
                        placeholder="10-digit mobile (e.g. 9876543210)" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-3">Course</label>
                      <select name="interestedCourse" required value={formData.interestedCourse} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-5 focus:outline-none focus:border-[#0078FF] text-xs font-bold appearance-none">
                        <option value="">Select Course</option>
                        <option value="foundation">Foundation</option>
                        <option value="medical">NEET</option>
                        <option value="engineering">IIT-JEE</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-3">Address</label>
                    <textarea name="address" required value={formData.address} onChange={handleChange} rows="1" className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-5 focus:outline-none focus:border-[#0078FF] text-xs font-bold resize-none" placeholder="Enter full address" />
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                {step > 1 && (
                  <button type="button" onClick={() => setStep(step - 1)} className="flex-1 border border-gray-100 text-gray-400 py-3 rounded-xl font-bold hover:text-gray-900 transition-all flex items-center justify-center gap-2 text-xs">
                    <ChevronLeft size={16} /> Back
                  </button>
                )}
                {step < 3 ? (
                  <button type="button" onClick={handleNextStep} className="flex-[2] bg-[#0a1628] text-white py-3 rounded-xl font-bold hover:bg-[#0078FF] transition-all flex items-center justify-center gap-2 text-xs">
                    Continue <ChevronRight size={16} />
                  </button>
                ) : (
                  <button type="submit" disabled={loading} className="flex-[2] bg-[#FB0500] text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 text-xs">
                    {loading ? 'Processing...' : 'Register Account'} <Check size={16} />
                  </button>
                )}
              </div>
            </form>

            <div className="mt-6 flex items-center justify-center gap-4">
              <button className="w-10 h-10 flex items-center justify-center border border-gray-100 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all"><Apple size={18} /></button>
              <button className="w-10 h-10 flex items-center justify-center border border-gray-100 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all"><Globe size={18} /></button>
            </div>
          </div>

          <div className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest mt-6">
            Already registered? <Link to="/stdlogin" className="text-[#0078FF] border-b border-[#0078FF]">Sign In</Link>
          </div>
        </div>

        {/* Right Side: Visual Section - Sharp & Pro */}
        <div className="hidden md:flex flex-1 m-4 rounded-[32px] relative overflow-hidden group">
          <img
            src="/assets/student_study.png"
            alt="Students"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[#0a1628]/10" />

          <div className="absolute top-10 right-10 bg-[#ffcf5c] p-4 rounded-2xl border border-yellow-400/50">
            <p className="text-[10px] font-black uppercase tracking-widest text-yellow-900 mb-1">Scholarship Open</p>
            <p className="text-sm font-bold text-gray-900">Get up to 100% off</p>
          </div>

          <div className="absolute bottom-10 left-10 right-10 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-[24px] text-white">
            <p className="text-xs font-bold mb-4 opacity-80 uppercase tracking-widest">Global Ranking</p>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold">#1 Institute</p>
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-white/20 border border-white/10" />)}
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .animate-slideIn { animation: slideIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default StudentRegistration;