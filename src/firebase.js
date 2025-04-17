import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA0_-FRS7Dx6YRY5J_QTOoQZhuQVB1pY7s",
  authDomain: "dhikr-garden-42713.firebaseapp.com",
  projectId: "dhikr-garden-42713",
  storageBucket: "dhikr-garden-42713.firebasestorage.app",
  messagingSenderId: "465200184249",
  appId: "1:465200184249:web:55a6ce84954890374f1468",
  measurementId: "G-THB3DKET76"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;