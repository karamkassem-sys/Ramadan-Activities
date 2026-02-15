import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, query, where, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDl4Tt_CJNWh1sf5en8LejTkuBrPP7naZw",
  authDomain: "n8n-karam-eval.firebaseapp.com",
  projectId: "n8n-karam-eval",
  storageBucket: "n8n-karam-eval.firebasestorage.app",
  messagingSenderId: "101600786045",
  appId: "1:101600786045:web:0633d2a6e55e0f8a94e314"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export { collection, addDoc, getDocs, query, where, doc, setDoc, updateDoc, getDoc }

