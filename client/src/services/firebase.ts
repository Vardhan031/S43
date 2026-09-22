import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const apiKey = import.meta.env?.VITE_FIREBASE_API_KEY || "";

export const isFirebaseConfigured = Boolean(apiKey && !apiKey.includes("Demo"));

const firebaseConfig = {
  apiKey: apiKey || "AIzaSyDemoApiKeyForS43Platform",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "s43-esports.firebaseapp.com",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "s43-esports",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "s43-esports.firebasestorage.app",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

export const app = isFirebaseConfigured
  ? (!getApps().length ? initializeApp(firebaseConfig) : getApp())
  : null;

export const db = app ? getFirestore(app) : (null as any);
export const auth = app ? getAuth(app) : (null as any);
