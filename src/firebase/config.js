import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3GLXvzUs3KL2nZChmdLxkLzNNPuOX0i8",
  authDomain: "monk-mode-ff14f.firebaseapp.com",
  projectId: "monk-mode-ff14f",
  storageBucket: "monk-mode-ff14f.firebasestorage.app",
  messagingSenderId: "73199912321",
  appId: "1:73199912321:web:f659a6b2f8a516e1111480",
  measurementId: "G-1XY0QQZNDD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set persistence to LOCAL to keep the user logged in
setPersistence(auth, browserLocalPersistence);

const db = getFirestore(app);

export { auth, db };