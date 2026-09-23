import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

/**
 * Server-only Firebase Admin SDK.
 *
 * Configure one of:
 *  - FIREBASE_SERVICE_ACCOUNT_JSON - full service-account JSON as a single-line string
 *  - FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
 */
function buildCredential() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    return cert(JSON.parse(json));
  }
  return cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  });
}

export const adminApp = getApps().length
  ? getApp()
  : initializeApp({ credential: buildCredential() });

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
