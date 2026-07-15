import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyC-3d-yDpASpoEoYG9PB1vzTN42wW_F21k',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'livraria-da-anna.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'livraria-da-anna',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'livraria-da-anna.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '665862115352',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:665862115352:web:c4cf1612914d5e5b15336d',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? 'G-KJH6SGB4L3',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
