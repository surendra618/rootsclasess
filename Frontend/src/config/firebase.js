import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBIiEQ2o8GgqxzXDvDjfMIWjOO1D6kKd1o",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "roots-app-17793.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "roots-app-17793",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "roots-app-17793.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "504541272307",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:504541272307:web:4efd034f20bf83e994bf86",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-7VGEE2TR13"
};

// Helper: check if Firebase is configured with real credentials
export const isFirebaseConfigured = () => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
};

// Initialize Firebase app safely
let app = null;
let auth = null;
let googleProvider = null;
let analytics = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });

  // Initialize Analytics only in supported browser environments
  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    }).catch(() => {});
  }
} catch (error) {
  console.warn('Firebase initialization notice:', error);
}

export { app, auth, googleProvider, signInWithPopup, signInWithRedirect, getRedirectResult, analytics };

