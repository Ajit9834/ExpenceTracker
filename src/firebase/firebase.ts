import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB0uqyF_TqK-99NsNgOROFefuc2ru5Q86w",
  authDomain: "expence-tracker-93270.firebaseapp.com",
  projectId: "expence-tracker-93270",
  storageBucket: "expence-tracker-93270.firebasestorage.app",
  messagingSenderId: "617327218648",
  appId: "1:617327218648:web:67472a83bb9638ecba2cad",
  measurementId: "G-84CF5TDT5C"
};

// Check if we're in demo mode (for development without Firebase)
export const isDemoMode = false;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

console.log('Firebase initialized successfully');

export { app, auth, db, storage, googleProvider };
export default app;
