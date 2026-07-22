<<<<<<< HEAD
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check if we're in demo mode (no real Firebase config)
export const isDemoMode = !import.meta.env.VITE_FIREBASE_API_KEY || 
  import.meta.env.VITE_FIREBASE_API_KEY === 'demo-api-key' ||
  import.meta.env.VITE_FIREBASE_API_KEY === 'your-api-key-here';

let app: any;
let auth: any;
let db: any;
let storage: any;
let googleProvider: any;

if (!isDemoMode) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.warn('Firebase initialization failed, running in demo mode:', error);
  }
}

export { app, auth, db, storage, googleProvider };
export default app;
=======
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
>>>>>>> 824a5a8553eb8ffeb956f9875289ba899bba14c9
