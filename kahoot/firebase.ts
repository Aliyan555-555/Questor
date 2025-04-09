
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: "AIzaSyBoDibJuzC93BeHIO90TZJhwuj5SIVomOg",
//   authDomain: "kahootclone-7711d.firebaseapp.com",
//   projectId: "kahootclone-7711d",
//   storageBucket: "kahootclone-7711d.firebasestorage.app",
//   messagingSenderId: "159155311275",
//   appId: "1:159155311275:web:1e4904ea12b25a22b49dee",
//   measurementId: "G-0ZYEZZK01M"
// };

const firebaseConfig = {
  apiKey: "AIzaSyAxQWdUXOCsQGkDOOd6QvQKDt9OCeJHTJg",
  authDomain: "questor-b3044.firebaseapp.com",
  projectId: "questor-b3044",
  storageBucket: "questor-b3044.firebasestorage.app",
  messagingSenderId: "988978603806",
  appId: "1:988978603806:web:7b4662f3b94538c1154b0f",
  measurementId: "G-B2YKD6DZ60"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

export { auth,googleProvider };