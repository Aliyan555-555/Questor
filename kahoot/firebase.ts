import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  getAnalytics,
  isSupported as isAnalyticsSupported,
} from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAxQWdUXOCsQGkDOOd6QvQKDt9OCeJHTJg",
  authDomain: "questor-b3044.firebaseapp.com",
  projectId: "questor-b3044",
  storageBucket: "questor-b3044.firebasestorage.app",
  messagingSenderId: "988978603806",
  appId: "1:988978603806:web:7b4662f3b94538c1154b0f",
  measurementId: "G-B2YKD6DZ60",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

let analytics = null;
isAnalyticsSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  } else {
    console.warn("Firebase Analytics is not supported in this environment.");
  }
});

export { auth, googleProvider, analytics };
