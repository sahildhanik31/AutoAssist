import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA_mN6wxlyV2NqIrMF2XLO4byFthKHXBFw",
  authDomain: "autoassist-39789.firebaseapp.com",
  projectId: "autoassist-39789",
  storageBucket: "autoassist-39789.firebasestorage.app",
  messagingSenderId: "529760863916",
  appId: "1:529760863916:web:2a7d35f7c4b528e22c0109",
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

export const auth = getAuth(app);

export default app;