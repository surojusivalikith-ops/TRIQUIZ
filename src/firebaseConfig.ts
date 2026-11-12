/**
 * Central Firebase Web SDK Configuration
 *
 * You can change the Firebase connection in either of two ways:
 * 1. Set VITE_FIREBASE_* environment variables (in .env or AI Studio Secrets), OR
 * 2. Paste your new Firebase Web App config values directly as the fallback strings below.
 *
 * To get these values from Firebase Console:
 * Go to Project Settings (gear icon) -> General -> Your apps -> Web app (</>) -> SDK setup and configuration.
 */
const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};

export const FIREBASE_CONFIG = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyCQ960RNWj5oLSF4k1PdJECajAvQex4CvU',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'quiz-site-cb9db.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'quiz-site-cb9db',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'quiz-site-cb9db.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '143204396129',
  appId: env.VITE_FIREBASE_APP_ID || '1:143204396129:web:e5d6839f9d356dcfebce20',
};
