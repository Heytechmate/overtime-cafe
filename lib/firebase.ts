// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCxa_1NIWZK4EefmgXSiWNqrEtFYFC9m-g",
  authDomain: "overtime-1d202.firebaseapp.com",
  projectId: "overtime-1d202",
  storageBucket: "overtime-1d202.firebasestorage.app",
  messagingSenderId: "499850588990",
  appId: "1:499850588990:web:2258eb0c8be9dcc419b26f",
  measurementId: "G-K7853M98BX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);