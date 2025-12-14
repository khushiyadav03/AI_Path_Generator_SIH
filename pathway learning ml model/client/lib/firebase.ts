import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDikC9MvUTTSBYreGVSoHUyYyhmlmOtKsA",
  authDomain: "personalizeed-learning.firebaseapp.com",
  projectId: "personalizeed-learning",
  storageBucket: "personalizeed-learning.firebasestorage.app",
  messagingSenderId: "23140411189",
  appId: "1:23140411189:web:5b62015fd71f6cb4368e7c",
  measurementId: "G-YV84LJBPNC"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

