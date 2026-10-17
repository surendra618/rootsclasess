import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../../services/endpoints';
import useStudentStore from '../../Store/studentstore';
import { auth, googleProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from '../../config/firebase';

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

  // Handle redirect result when user returns from official Google login page
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
          toast.error(err.message || 'Google authentication error');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleButtonClick = async () => {
    if (!auth || !googleProvider) {
      toast.error('Google service is initializing. Please try again.');
      return;
    }

    setLoading(true);

    try {
      // 1. Direct official Google sign in popup
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
    } catch (firebaseErr) {
      console.warn('Firebase login notice:', firebaseErr?.code, firebaseErr?.message);
      
      // If user closed or cancelled the popup, gracefully stop loading
      if (
        firebaseErr.code === 'auth/popup-closed-by-user' ||
        firebaseErr.code === 'auth/cancelled-popup-request'
      ) {
        setLoading(false);
        return;
      }

      // If popup was blocked by browser, seamlessly redirect to official Google page
      if (firebaseErr.code === 'auth/popup-blocked' && signInWithRedirect) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (rErr) {
          console.warn("Redirect attempt failed:", rErr);
        }
      }

      if (firebaseErr.code === 'auth/unauthorized-domain') {
        toast.error('Domain authorization pending in Firebase Console.');
      } else {
        // Fallback to seamless official redirect directly
        if (signInWithRedirect) {
          try {
            await signInWithRedirect(auth, googleProvider);
            return;
          } catch (rErr) {
            toast.error(firebaseErr.message || 'Google sign in failed');
          }
        } else {
          toast.error(firebaseErr.message || 'Google sign in failed');
        }
      }
      setLoading(false);
    }
  };

  const defaultText = mode === 'signup' ? 'Sign up with Google' : 'Continue with Google';

  return (
    <button
      type="button"
      onClick={handleButtonClick}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-white hover:bg-slate-50 active:scale-[0.99] border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      <GoogleIcon />
      <span>{loading ? 'Connecting Google Account...' : buttonText || defaultText}</span>
    </button>
  );
};

export default GoogleAuthButton;
