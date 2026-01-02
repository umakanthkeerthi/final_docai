// Firebase Configuration for Frontend
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCa4sFWCip770vA25bcNJgmFgYNdM-OJCY",
    authDomain: "dacai-production.firebaseapp.com",
    projectId: "dacai-production",
    storageBucket: "dacai-production.firebasestorage.app",
    messagingSenderId: "34198507228",
    appId: "1:34198507228:web:c3607cc7e2be9511a4bb71",
    measurementId: "G-X2S40LHXGG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
