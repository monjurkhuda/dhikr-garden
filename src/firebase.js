// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCpD-vdRoZggTuAxOO2ra_f8Igjt14eS-g",
  authDomain: "istighfar-garden.firebaseapp.com",
  projectId: "istighfar-garden",
  storageBucket: "istighfar-garden.firebasestorage.app",
  messagingSenderId: "306479374958",
  appId: "1:306479374958:web:cf8f2911ddc221222cbc7f",
  measurementId: "G-ECQCQ7MSFN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app)

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;