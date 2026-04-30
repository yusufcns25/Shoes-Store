// ============================================================
// FIREBASE YAPILANDIRMASI
// ============================================================
// Firebase Console'dan aldığınız bilgileri aşağıya yapıştırın.
// https://console.firebase.google.com/ → Projeniz → Proje Ayarları → Web Uygulaması
// ============================================================

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDcaGsSg-_vP64Uc-2qL0PObFCbtlsSKGA",
  authDomain: "shoes-store-12b90.firebaseapp.com",
  projectId: "shoes-store-12b90",
  storageBucket: "shoes-store-12b90.firebasestorage.app",
  messagingSenderId: "134998914331",
  appId: "1:134998914331:web:2f097ebe97e3c938eacfbe",
  measurementId: "G-NGZLG85K4Z"
};

// Firebase yapılandırılmış mı kontrol et
export const isFirebaseConfigured = firebaseConfig.apiKey !== "BURAYA_API_KEY";

let app = null;
let db = null;
let auth = null;
let storage = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
}

export { app, db, auth, storage };
