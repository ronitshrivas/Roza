import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
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

// const isBrowser = typeof window !== "undefined";

// function createApp(): FirebaseApp {
//   return getApps().length ? getApp() : initializeApp(firebaseConfig);
// }

/**
 * Client SDK singletons. They are only created in the browser - during SSR /
 * prerendering the exports are inert placeholders that are never dereferenced
 * (all usage happens inside effects, event handlers and callable wrappers).
 */
// export const firebaseApp: FirebaseApp = isBrowser
//   ? createApp()
//   : (null as unknown as FirebaseApp);

// export const auth: Auth = isBrowser ? getAuth(firebaseApp) : (null as unknown as Auth);
// export const db: Firestore = isBrowser ? getFirestore(firebaseApp) : (null as unknown as Firestore);
// export const functions: Functions = isBrowser
//   ? getFunctions(firebaseApp)
//   : (null as unknown as Functions);
// export const googleProvider = new GoogleAuthProvider();

const isBrowser = typeof window !== "undefined";

const firebaseEnabled =
  isBrowser &&
  process.env.NEXT_PUBLIC_DISABLE_FIREBASE !== "true" &&
  !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "your-api-key";

export const firebaseApp: FirebaseApp = firebaseEnabled
  ? initializeApp(firebaseConfig)
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