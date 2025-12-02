// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBjbzxSrLjp3qgl8qaYDfQQgVX5E7DqxUs",
  authDomain: "zapateria-3d5da.firebaseapp.com",
  databaseURL: "https://zapateria-3d5da-default-rtdb.firebaseio.com",
  projectId: "zapateria-3d5da",
  storageBucket: "zapateria-3d5da.firebasestorage.app",
  messagingSenderId: "885381797478",
  appId: "1:885381797478:web:860afaaf0584275bd43fa7",
  measurementId: "G-4MP0B60M4W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
