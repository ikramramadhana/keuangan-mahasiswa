// firebase.js
// Import SDK Firebase versi modular
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Config Firebase project kamu
const firebaseConfig = {
  apiKey: "AIzaSyB3zZOSfYUqCshG5F64K_mlL0GQbf5vJFI",
  authDomain: "pengelola-keuangan-mahasiswa.firebaseapp.com",
  projectId: "pengelola-keuangan-mahasiswa",
  storageBucket: "pengelola-keuangan-mahasiswa.firebasestorage.app",
  messagingSenderId: "909533943940",
  appId: "1:909533943940:web:bf925d24df83bedba78ad1",
  measurementId: "G-840E9NEPSK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth & db supaya bisa dipakai file lain
export const auth = getAuth(app);
export const db = getFirestore(app);

// Log untuk memastikan Firebase sudah terkoneksi
console.log("Firebase initialized successfully!");
console.log("Project ID:", firebaseConfig.projectId);
