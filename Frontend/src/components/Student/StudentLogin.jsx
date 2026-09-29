import axios from 'axios';
import React, { useState } from 'react';
import api from '../../services/endpoints';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import useStudentStore from '../../Store/studentstore';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ChevronLeft, Globe, Apple, Key, ArrowLeft } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setStudent } = useStudentStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: email, 2: otp, 3: reset password
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleOtpDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    const fullOtp = newDigits.join("");
    setOtp(fullOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`forgot-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`forgot-otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        const newDigits = [...otpDigits];
        newDigits[index - 1] = "";
        setOtpDigits(newDigits);
        setOtp(newDigits.join(""));
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
      setOtp(newDigits.join(""));
      const focusIndex = Math.min(pasteData.length, 5);
      const targetInput = document.getElementById(`forgot-otp-${focusIndex}`);
      if (targetInput) targetInput.focus();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(api.student.login, {
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });
      const user = res.data.user || res.data.student || res.data?.data?.student;
      const token = res.data.token || res.data?.data?.token;
      if (!user) throw new Error("Invalid response");

      setStudent({ user, token });
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      toast.success("Welcome back!");
      navigate(user.role === "admin" || user.role === "instructor" ? "/instructor/dashboard" : "/");
    } catch (error) {
      if (error.response?.data?.isBanned || error.response?.status === 403) {
        toast.error(error.response?.data?.message || "Your account has been suspended by administration. Please contact support.", {
          autoClose: 7000
        });
      } else {
        toast.error(error.response?.data?.message || "Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setOtpLoading(true);
    try {
      await axios.post(api.student.sendOtp, { email: forgotEmail });
      toast.success("OTP sent to your email!");
      setForgotStep(2);
      
      // Start countdown for resend
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
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setOtpLoading(true);
    try {
      await axios.post(api.student.verifyOTP, { 
        email: forgotEmail, 
        otp 
      });
      toast.success("OTP verified successfully!");
      setForgotStep(3);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  // Reset Password - FIXED: Send confirmPassword instead of otp
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setResetLoading(true);
    try {
      // FIX: Send confirmPassword instead of otp to match backend
      await axios.post(api.student.resetPassword, {
        email: forgotEmail,
        newPassword: newPassword,
        confirmPassword: confirmPassword  
      });
      
      toast.success("Password reset successfully! Please login with your new password.");
      
      setShowForgotPassword(false);
      setForgotStep(1);
      setForgotEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setResetLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) {
      toast.info(`Please wait ${countdown} seconds before resending`);
      return;
    }
    
    setOtpLoading(true);
    try {
      await axios.post(api.student.sendOtp, { email: forgotEmail });
      toast.success("OTP resent successfully!");
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
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const renderForgotPassword = () => {
    return (
      <div className="w-full max-w-md mx-auto">
        <button
          onClick={() => {
            if (forgotStep === 1) {
              setShowForgotPassword(false);
            } else {
              setForgotStep(forgotStep - 1);
              if (forgotStep === 2) setOtp('');
              if (forgotStep === 3) {
                setNewPassword('');
                setConfirmPassword('');
              }
            }
          }}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {forgotStep === 1 && "Forgot Password?"}
            {forgotStep === 2 && "Verify OTP"}
            {forgotStep === 3 && "Reset Password"}
          </h2>
          <p className="text-sm text-gray-500">
            {forgotStep === 1 && "Enter your email to receive a verification code"}
            {forgotStep === 2 && `We've sent a 6-digit code to ${forgotEmail}`}
            {forgotStep === 3 && "Enter your new password below"}
          </p>
        </div>

        {forgotStep === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5 animate-slideIn">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-3">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] transition-all text-xs font-bold outline-none text-gray-900"
                  placeholder="yourname@gmail.com"
                  autoFocus
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={otpLoading}
              className="w-full bg-[#0a1628] hover:bg-[#0078FF] active:scale-[0.99] text-white py-3.5 rounded-xl font-bold transition-all duration-200 shadow-md shadow-slate-900/15 text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {otpLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending Code...
                </>
              ) : (
                <>
                  Send OTP Code <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        )}

        {forgotStep === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6 animate-slideIn">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block text-center">
                Enter 6-Digit Verification Code
              </label>

              {/* 6 Segmented Digit Boxes */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <input
                    key={idx}
                    id={`forgot-otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otpDigits[idx]}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    autoFocus={idx === 0}
                    className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono rounded-xl bg-gray-50 border transition-all outline-none shadow-xs ${
                      otpDigits[idx]
                        ? 'border-[#0078FF] text-[#0078FF] bg-blue-50/40 ring-2 ring-[#0078FF]/20'
                        : 'border-gray-200 text-gray-900 focus:border-[#0078FF] focus:bg-white focus:ring-2 focus:ring-[#0078FF]/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={otpLoading || otp.length !== 6}
              className="w-full bg-[#0a1628] hover:bg-[#0078FF] disabled:bg-gray-200 disabled:text-gray-400 text-white py-3.5 rounded-xl font-bold transition-all duration-300 shadow-sm text-xs cursor-pointer disabled:cursor-not-allowed"
            >
              {otpLoading ? 'Verifying Code...' : 'Verify & Continue'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0 || otpLoading}
                className={`text-xs font-bold ${
                  countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#0078FF] hover:text-blue-700'
                } transition-colors`}
              >
                {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        {forgotStep === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5 animate-slideIn">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-3">
                New Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-12 focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] transition-all text-xs font-bold outline-none text-gray-900"
                  placeholder="••••••••"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-3">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-12 focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] transition-all text-xs font-bold outline-none text-gray-900"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={resetLoading}
              className="w-full bg-[#FB0500] hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3.5 rounded-xl font-bold transition-all duration-300 shadow-sm text-xs cursor-pointer"
            >
              {resetLoading ? 'Resetting Password...' : 'Reset & Save Password'}
            </button>
          </form>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#f8faff] bg-line-grid flex items-center justify-center p-4 md:p-8 font-poppins">
      <div className="w-full max-w-[1050px] bg-white rounded-2xl border border-gray-100 flex overflow-hidden shadow-2xl shadow-blue-900/5">
        
        {/* Left Section */}
        <div className="w-full md:w-[48%] p-8 md:p-12 flex flex-col justify-between relative z-10 border-r border-gray-50">
          {!showForgotPassword ? (
            <>
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link to="/" title="Go to Home">
                      <img src="/logo.svg" alt="Roots Classes" className="h-9 w-auto hover:opacity-90 transition-all cursor-pointer" />
                    </Link>
                    <div className="h-5 w-[1px] bg-gray-200" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Portal</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h1 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">Login to account</h1>
                  <p className="text-xs text-gray-400">Please enter your verified credentials.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Email Address</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email" required
                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-[#0078FF] transition-all text-xs font-bold"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"} required
                        value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-11 pr-11 focus:outline-none focus:border-[#0078FF] transition-all text-xs font-bold"
                        placeholder="••••••••"
                      />
                      <button
                        type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="text-right pt-1">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs text-gray-500 hover:text-[#0078FF] transition-colors font-bold"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit" disabled={loading}
                    className="w-full bg-[#0a1628] hover:bg-[#0078FF] text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-md shadow-blue-900/10 disabled:opacity-50 mt-2"
                  >
                    {loading ? 'Authenticating...' : 'Sign In Now'}
                  </button>
                </form>

                {/* Social Login Buttons */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button type="button" className="flex items-center justify-center gap-2 py-2.5 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
                    <Apple size={15} /> Apple
                  </button>
                  <button type="button" className="flex items-center justify-center gap-2 py-2.5 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
                    <Globe size={15} /> Google
                  </button>
                </div>
              </div>

              <div className="flex justify-center items-center text-[10px] font-black text-gray-400 uppercase tracking-widest mt-6 pt-4 border-t border-gray-100">
                <Link to="/register" className="hover:text-[#0078FF] transition-colors">No account? <span className="text-[#0078FF] border-b border-[#0078FF]">Register</span></Link>
              </div>
            </>
          ) : (
            renderForgotPassword()
          )}
        </div>

        {/* Right Side: Visual Section */}
        <div className="hidden md:flex flex-1 m-4 rounded-xl relative overflow-hidden group">
          <img
            src="/assets/student_study.png"
            alt="Students"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[#0a1628]/15" />

          <div className="absolute top-8 left-8 bg-[#ffcf5c] p-3.5 rounded-xl border border-yellow-400/50 max-w-[190px] shadow-lg">
            <p className="text-[9px] font-black uppercase tracking-widest text-yellow-950 mb-0.5">Live Mentorship</p>
            <p className="text-xs font-bold text-gray-900">Starts in 15 mins</p>
          </div>

          <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-xl text-white shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-90">Admission Progress</p>
              <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">Step 2/3</span>
            </div>
            <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-[#ffcf5c] w-3/4 rounded-full" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;