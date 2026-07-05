import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { formatFirebaseError } from "@/lib/firebase/errors";
import {
  isValidPrivateKey,
  normalizePrivateKey,
} from "@/lib/firebase/normalize-key";
import { validateFirebaseProjectConfig } from "@/lib/firebase/project";

let adminApp: App | null = null;
let adminDb: Firestore | null = null;
let resolvedDatabaseId: string | null = null;

const DATABASE_CANDIDATES = ["(default)", "default"];

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

  validateFirebaseProjectConfig(projectId, clientEmail);

  try {
    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Firebase error";
    throw new Error(`Failed to initialize Firebase Admin: ${message}`);
  }

  return adminApp;
}

async function resolveDatabaseId(): Promise<string> {
  if (resolvedDatabaseId) {
    return resolvedDatabaseId;
  }

  const configuredDatabaseId = process.env.FIRESTORE_DATABASE_ID;
  const candidates = [
    ...(configuredDatabaseId ? [configuredDatabaseId] : []),
    ...DATABASE_CANDIDATES,
  ].filter((value, index, array) => array.indexOf(value) === index);

  const app = getAdminApp();
  let lastError: unknown = null;

  for (const databaseId of candidates) {
    try {
      const db = getFirestore(app, databaseId);
      await db.collection("_healthcheck").doc("ping").set(
        {
          checkedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      resolvedDatabaseId = databaseId;
      adminDb = db;
      return databaseId;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(formatFirebaseError(lastError));
}

export async function getAdminDbAsync(): Promise<Firestore> {
  if (adminDb) {
    return adminDb;
  }

  await resolveDatabaseId();
  return adminDb!;
}

export function getAdminDb(): Firestore {
  if (adminDb) {
    return adminDb;
  }

  throw new Error(
    "Firestore is not initialized yet. Use getAdminDbAsync() in server routes so the correct database can be resolved.",
  );
}

export async function testFirestoreConnection() {
  const projectId = process.env.FIREBASE_PROJECT_ID ?? null;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL ?? null;
  const serviceAccountProjectId = clientEmail
    ? clientEmail.match(/@(.+)\.iam\.gserviceaccount\.com$/)?.[1] ?? null
    : null;

  try {
    const databaseId = await resolveDatabaseId();

    return {
      connected: true,
      projectId,
      serviceAccountProjectId,
      projectIdsMatch: projectId === serviceAccountProjectId,
      databaseId,
      error: null,
    };
  } catch (error) {
    return {
      connected: false,
      projectId,
      serviceAccountProjectId,
      projectIdsMatch: projectId === serviceAccountProjectId,
      databaseId: resolvedDatabaseId,
      error: formatFirebaseError(error),
    };
  }
}
