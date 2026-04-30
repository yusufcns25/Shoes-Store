// ============================================================
// FIRESTORE SERVİS KATMANI
// ============================================================
// Firebase yapılandırılmışsa Firestore kullanır,
// yapılandırılmamışsa demo verilerle çalışır.
// ============================================================

import { db, auth, storage, isFirebaseConfigured } from './firebase-config.js';
import { demoUrunler } from './veriler.js';

let firestoreMethods = {};
let authMethods = {};
let storageMethods = {};

// Firebase yapılandırılmışsa modülleri yükle
if (isFirebaseConfigured) {
  const firestore = await import('firebase/firestore');
  const authModule = await import('firebase/auth');
  const storageModule = await import('firebase/storage');

  firestoreMethods = firestore;
  authMethods = authModule;
  storageMethods = storageModule;
}

// ============================================================
// ÜRÜN İŞLEMLERİ
// ============================================================

/** Tüm ürünleri getir */
export async function getUrunler() {
  if (!isFirebaseConfigured) {
    return [...demoUrunler];
  }

  try {
    const { collection, getDocs } = firestoreMethods;
    const snapshot = await getDocs(collection(db, 'urunler'));
    const urunler = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sırala (client-side, index gerektirmez)
    urunler.sort((a, b) => (a.sira || 0) - (b.sira || 0));
    return urunler;
  } catch (err) {
    console.warn('Firestore hatası, demo veriler kullanılıyor:', err.message);
    return [...demoUrunler];
  }
}

/** Kategoriye göre ürünleri getir */
export async function getUrunlerByKategori(kategori) {
  if (kategori === 'Tümü') return getUrunler();

  if (!isFirebaseConfigured) {
    return demoUrunler.filter(u => u.kategori === kategori);
  }

  try {
    const { collection, getDocs, query, where } = firestoreMethods;
    const q = query(collection(db, 'urunler'), where('kategori', '==', kategori));
    const snapshot = await getDocs(q);
    const urunler = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    urunler.sort((a, b) => (a.sira || 0) - (b.sira || 0));
    return urunler;
  } catch (err) {
    console.warn('Firestore hatası, demo veriler kullanılıyor:', err.message);
    return demoUrunler.filter(u => u.kategori === kategori);
  }
}

/** Tek ürün getir */
export async function getUrunById(id) {
  if (!isFirebaseConfigured) {
    return demoUrunler.find(u => u.id === id) || null;
  }

  try {
    const { doc, getDoc } = firestoreMethods;
    const docRef = doc(db, 'urunler', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    // Firestore'da bulunamadıysa demo veride ara
    return demoUrunler.find(u => u.id === id) || null;
  } catch (err) {
    console.warn('Firestore hatası:', err.message);
    return demoUrunler.find(u => u.id === id) || null;
  }
}

/** Yeni ürün ekle */
export async function urunEkle(urunVerisi) {
  if (!isFirebaseConfigured) {
    console.warn('Firebase yapılandırılmamış. Demo modunda ürün eklenemez.');
    return null;
  }

  const { collection, addDoc, serverTimestamp } = firestoreMethods;
  const docRef = await addDoc(collection(db, 'urunler'), {
    ...urunVerisi,
    olusturmaTarihi: serverTimestamp()
  });
  return docRef.id;
}

/** Ürün güncelle */
export async function urunGuncelle(id, veri) {
  if (!isFirebaseConfigured) {
    console.warn('Firebase yapılandırılmamış. Demo modunda ürün güncellenemez.');
    return;
  }

  const { doc, updateDoc, serverTimestamp } = firestoreMethods;
  const docRef = doc(db, 'urunler', id);
  await updateDoc(docRef, {
    ...veri,
    guncellemeTarihi: serverTimestamp()
  });
}

/** Ürün sil */
export async function urunSil(id) {
  if (!isFirebaseConfigured) {
    console.warn('Firebase yapılandırılmamış. Demo modunda ürün silinemez.');
    return;
  }

  const { doc, deleteDoc } = firestoreMethods;
  await deleteDoc(doc(db, 'urunler', id));
}

// ============================================================
// GÖRSEL YÜKLEME (Firebase Storage)
// ============================================================

/** Firebase Storage'a resim yükle */
export async function resimYukle(dosya, yol) {
  if (!isFirebaseConfigured) {
    console.warn('Firebase yapılandırılmamış. Demo modunda resim yüklenemez.');
    return null;
  }

  const { ref, uploadBytes, getDownloadURL } = storageMethods;
  const storageRef = ref(storage, `urun-resimleri/${yol}`);
  const snapshot = await uploadBytes(storageRef, dosya);
  const url = await getDownloadURL(snapshot.ref);
  return url;
}

// ============================================================
// KİMLİK DOĞRULAMA (Admin)
// ============================================================

/** Admin girişi */
export async function adminGiris(email, sifre) {
  if (!isFirebaseConfigured) {
    console.warn('Firebase yapılandırılmamış. Demo modunda giriş yapılamaz.');
    return null;
  }

  const { signInWithEmailAndPassword } = authMethods;
  const userCredential = await signInWithEmailAndPassword(auth, email, sifre);
  return userCredential.user;
}

/** Admin çıkışı */
export async function adminCikis() {
  if (!isFirebaseConfigured) return;

  const { signOut } = authMethods;
  await signOut(auth);
}

/** Auth durumunu dinle */
export function authDurumunuDinle(callback) {
  if (!isFirebaseConfigured) {
    callback(null);
    return () => {};
  }

  const { onAuthStateChanged } = authMethods;
  return onAuthStateChanged(auth, callback);
}

/** Firebase yapılandırma durumu */
export { isFirebaseConfigured };
