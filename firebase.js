// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDsffPzqka8IjSR9geNncz-KaCwHUck-vI",
  authDomain: "flashcardsaas-a440e.firebaseapp.com",
  projectId: "flashcardsaas-a440e",
  storageBucket: "flashcardsaas-a440e.appspot.com",
  messagingSenderId: "647790150298",
  appId: "1:647790150298:web:1c532f282411ee0c93d523",
  measurementId: "G-RTR2RJH88C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)

export {db}