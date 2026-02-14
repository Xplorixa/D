import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCjKgOmY9cRR4V5i6685I0LWUrxUdi2LGc",
  authDomain: "xplorixa.firebaseapp.com",
  projectId: "xplorixa",
  storageBucket: "xplorixa.firebasestorage.app",
  messagingSenderId: "737676815779",
  appId: "1:737676815779:web:0a2d44ce60f58c7ec7be16",
  measurementId: "G-MV5V7D0DCX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app); // Firestore
export const storage = getStorage(app); // Storage
export const rtdb = getDatabase(app); // Realtime Database

export default app;