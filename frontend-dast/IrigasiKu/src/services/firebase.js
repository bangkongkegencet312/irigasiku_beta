// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; 
import { getAuth } from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyChPwwsngyOjaGbXNI-rgLH8jRpal2wa4w",
  authDomain: "irigasiku-beta.firebaseapp.com",
  databaseURL: "https://irigasiku-beta-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "irigasiku-beta",
  storageBucket: "irigasiku-beta.firebasestorage.app",
  messagingSenderId: "88266588317",
  appId: "1:88266588317:web:90201d36dc789bd9df9474",
  measurementId: "G-TSYMKWP99W"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
export { db, auth };