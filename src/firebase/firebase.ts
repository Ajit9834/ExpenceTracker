// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB0uqyF_TqK-99NsNgOROFefuc2ru5Q86w",
  authDomain: "expence-tracker-93270.firebaseapp.com",
  projectId: "expence-tracker-93270",
  storageBucket: "expence-tracker-93270.firebasestorage.app",
  messagingSenderId: "617327218648",
  appId: "1:617327218648:web:67472a83bb9638ecba2cad",
  measurementId: "G-84CF5TDT5C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);