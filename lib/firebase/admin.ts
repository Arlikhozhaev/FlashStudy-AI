import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import {
  isValidPrivateKey,
  normalizePrivateKey,
} from "@/lib/firebase/normalize-key";

let adminApp: App | null = null;
let adminDb: Firestore | null = null;

function getAdminApp(): App {
  if (adminApp) {
    return adminApp;
  }

  if (getApps().length > 0) {
    adminApp = getApps()[0]!;
    return adminApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your environment variables.",
    );
  }

  if (!isValidPrivateKey(privateKey)) {
    throw new Error(
      "FIREBASE_PRIVATE_KEY is invalid. Paste the full key from your Firebase service account JSON, with \\n between lines.",
    );
  }

  try {
    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Firebase error";
    throw new Error(`Failed to initialize Firebase Admin: ${message}`);
  }

  return adminApp;
}

export function getAdminDb(): Firestore {
  if (!adminDb) {
    adminDb = getFirestore(getAdminApp(), "(default)");
  }

  return adminDb;
}
