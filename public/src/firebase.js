import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { firebaseConfig } from './config.js';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
export const db = getFirestore(app);
export const storage = getStorage(app);

window.FirebaseAuth = { auth, onAuthStateChanged, signOut };

export {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  ref,
  uploadBytesResumable,
  getDownloadURL
};