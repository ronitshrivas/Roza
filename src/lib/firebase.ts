import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFunctions, type Functions } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


const isBrowser = typeof window !== "undefined";

const firebaseEnabled =
  isBrowser &&
  process.env.NEXT_PUBLIC_DISABLE_FIREBASE !== "true" &&
  !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "your-api-key";

export const firebaseApp: FirebaseApp = firebaseEnabled
  ? getApps().length
    ? getApps()[0]
    : initializeApp(firebaseConfig)
  : (null as unknown as FirebaseApp);

export const auth: Auth = firebaseEnabled
  ? getAuth(firebaseApp)
  : (null as unknown as Auth);

export const db: Firestore = firebaseEnabled
  ? getFirestore(firebaseApp)
  : (null as unknown as Firestore);

export const functions: Functions = firebaseEnabled
  ? getFunctions(firebaseApp)
  : (null as unknown as Functions);

// Google sign-in provider — safe to instantiate even without Firebase config,
// since GoogleAuthProvider is just a config object, not a live connection.
export const googleProvider = new GoogleAuthProvider();
