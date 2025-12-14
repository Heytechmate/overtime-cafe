import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCxa_1NIWZK4EefmgXSiWNqrEtFYFC9m-g",
  authDomain: "overtime-1d202.firebaseapp.com",
  projectId: "overtime-1d202",
  storageBucket: "overtime-1d202.firebasestorage.app",
  messagingSenderId: "499850588990",
  appId: "1:499850588990:web:2258eb0c8be9dcc419b26f",
  measurementId: "G-K7853M98BX"
};

// Initialize Firebase (Singleton pattern)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// EXPORT services so other files can use them
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics
export const analytics = typeof window !== "undefined" ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null;