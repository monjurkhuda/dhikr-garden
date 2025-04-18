import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAgaYWxO8QDdPxCIuCqdmynOdCiMCner1o",
  authDomain: "astaghfirullah-d9658.firebaseapp.com",
  projectId: "astaghfirullah-d9658",
  storageBucket: "astaghfirullah-d9658.firebasestorage.app",
  messagingSenderId: "642523507779",
  appId: "1:642523507779:web:4a31796b0d30121b7f38f6",
  measurementId: "G-SXNJK8H7VX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;