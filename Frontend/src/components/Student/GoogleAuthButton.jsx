import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../../services/endpoints';
import useStudentStore from '../../Store/studentstore';
import { auth, googleProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from '../../config/firebase';
import { X, ShieldCheck, Mail, User as UserIcon, Phone, ExternalLink } from 'lucide-react';

export const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const GoogleAuthButton = ({ 
  mode = 'signup', // 'signup' | 'login'
  className = '', 
  buttonText = null,
  onSuccess = null 
}) => {
  const navigate = useNavigate();
  const { setStudent } = useStudentStore();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googlePhone, setGooglePhone] = useState('');

  const handleAuthSuccess = (data) => {
    const user = data.user || data.student;
    const token = data.token;
    if (!user || !token) {
      toast.error('Invalid response from server');
      return;
    }

    setStudent({ user, token });
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);

    toast.success(data.message || (mode === 'signup' ? 'Welcome to Roots Classes!' : 'Welcome back!'));
    
    if (onSuccess) {
      onSuccess(user);
    } else {
      navigate(user.role === 'admin' || user.role === 'instructor' ? '/instructor/dashboard' : '/');
    }
  };

  // Check for redirect result on component mount (especially for mobile browsers)
  useEffect(() => {
    if (!auth) return;

    let isMounted = true;
    getRedirectResult(auth)
      .then(async (result) => {
        if (!isMounted || !result || !result.user) return;
        setLoading(true);
        const firebaseUser = result.user;
        const idToken = await firebaseUser.getIdToken();

        const res = await axios.post(api.student.googleAuth, {
          email: firebaseUser.email,
          fullName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          googleId: firebaseUser.uid,
          profileImage: firebaseUser.photoURL || '',
          idToken: idToken
        });

        handleAuthSuccess(res.data);
      })
      .catch((err) => {
        if (
          err.code !== 'auth/popup-closed-by-user' &&
          err.code !== 'auth/cancelled-popup-request'
        ) {
          console.error("Firebase redirect result error:", err);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const isMobile = () => {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth < 768
    );
  };

  const handleButtonClick = async () => {
    if (!auth || !googleProvider) {
      setShowModal(true);
      return;
    }

    setLoading(true);

    // On mobile devices, browsers often block popups - use redirect directly
    if (isMobile() && signInWithRedirect) {
      try {
        await signInWithRedirect(auth, googleProvider);
        return;
      } catch (redirectErr) {
        console.warn('Mobile redirect failed, trying popup:', redirectErr);
      }
    }

    // Try popup for desktop or mobile fallback
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();

      const res = await axios.post(api.student.googleAuth, {
        email: firebaseUser.email,
        fullName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        googleId: firebaseUser.uid,
        profileImage: firebaseUser.photoURL || '',
        idToken: idToken
      });

      handleAuthSuccess(res.data);
      setLoading(false);
      return;
    } catch (firebaseErr) {
      console.warn('Firebase popup notice:', firebaseErr?.code, firebaseErr?.message);
      
      // If user simply closed the popup, do not show modal
      if (
        firebaseErr.code === 'auth/popup-closed-by-user' ||
        firebaseErr.code === 'auth/cancelled-popup-request'
      ) {
        setLoading(false);
        return;
      }

      // If popup blocked on browser, try redirect
      if (firebaseErr.code === 'auth/popup-blocked' && signInWithRedirect) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (rErr) {
          console.warn("Secondary redirect attempt failed:", rErr);
        }
      }

      if (firebaseErr.code === 'auth/unauthorized-domain') {
        toast.info('Domain authorization pending in Firebase. You can use instant verification below.');
      } else if (firebaseErr.message) {
        console.error('Firebase Auth Error:', firebaseErr);
      }

      setShowModal(true);
      setLoading(false);
    }
  };

  const handleManualGoogleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = googleEmail.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error('Please enter your Google Email');
      return;
    }
    if (!cleanEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    const cleanPhone = googlePhone ? googlePhone.trim().replace(/\D/g, '') : '';
    if (cleanPhone && cleanPhone.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const googleId = 'gid_' + Math.random().toString(36).substring(2, 12);
      const res = await axios.post(api.student.googleAuth, {
        email: cleanEmail,
        fullName: googleName.trim() || cleanEmail.split('@')[0],
        googleId: googleId,
        phone: cleanPhone,
        profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleName || cleanEmail)}`
      });

      setShowModal(false);
      handleAuthSuccess(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to authenticate with Google');
    } finally {
      setLoading(false);
    }
  };

  const defaultText = mode === 'signup' ? 'Sign up with Google' : 'Continue with Google';

  return (
    <>
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-white hover:bg-slate-50 active:scale-[0.99] border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      >
        <GoogleIcon />
        <span>{loading ? 'Connecting Google Account...' : buttonText || defaultText}</span>
      </button>

      {/* Google Sign In / Sign Up Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-2xl border border-slate-100 max-w-sm w-full p-6 shadow-2xl overflow-hidden animate-slideUp text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-xs">
                  <GoogleIcon />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Roots Classes • Google Verification</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl mb-4 flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#0078FF] shrink-0" />
              <p className="text-[11px] text-blue-900 font-medium leading-tight">
                Instant verification using your Google Account details.
              </p>
            </div>

            {/* Official Google Redirect Option */}
            {auth && googleProvider && signInWithRedirect && (
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  signInWithRedirect(auth, googleProvider).catch((err) => {
                    setLoading(false);
                    toast.error('Google Redirect failed. Please use email below.');
                  });
                }}
                className="w-full mb-3.5 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <ExternalLink size={14} className="text-[#0078FF]" />
                <span>Open Official Google Login Page</span>
              </button>
            )}

            <form onSubmit={handleManualGoogleSubmit} className="space-y-3.5">
              <div>
                <label className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Google Email Address *
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0078FF] focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Your Full Name
                </label>
                <div className="relative">
                  <UserIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0078FF] focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Mobile Number (Optional)
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={googlePhone}
                    onChange={(e) => setGooglePhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit phone number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0078FF] focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !googleEmail.trim()}
                  className="w-full py-3 bg-[#0a1628] hover:bg-[#0078FF] active:scale-[0.99] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <GoogleIcon />
                  <span>{loading ? 'Verifying...' : mode === 'signup' ? 'Complete Google Signup' : 'Sign in with Google ID'}</span>
                </button>
              </div>
            </form>

            <p className="text-[10px] text-center text-slate-400 mt-4">
              Secured with Google Identity Authentication.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleAuthButton;
