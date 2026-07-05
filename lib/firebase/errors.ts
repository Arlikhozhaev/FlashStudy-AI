import { getServiceAccountProjectId } from "@/lib/firebase/project";

function getProjectMismatchHint(): string | null {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const serviceAccountProjectId = getServiceAccountProjectId(
    process.env.FIREBASE_CLIENT_EMAIL,
  );

  if (
    projectId &&
    serviceAccountProjectId &&
    projectId !== serviceAccountProjectId
  ) {
    return `Your service account belongs to "${serviceAccountProjectId}" but FIREBASE_PROJECT_ID is "${projectId}". In Firebase Console open Project settings → Service accounts → Generate new private key for ${projectId}, then update Vercel.`;
  }

  return null;
}

export function formatFirebaseError(error: unknown): string {
  const message =
    error instanceof Error ? error.message : "Unknown Firebase error";

  const projectMismatchHint = getProjectMismatchHint();

  if (
    message.includes("NOT_FOUND") ||
    message.includes("5 NOT_FOUND")
  ) {
    const base =
      "Firestore database not found for this Firebase project. In Firebase Console open Build → Firestore Database and confirm a database exists in the same project as your service account.";

    if (projectMismatchHint) {
      return `${base} ${projectMismatchHint}`;
    }

    return `${base} Set FIREBASE_PROJECT_ID=flashstudy-ai and use a service account ending with @flashstudy-ai.iam.gserviceaccount.com. Optionally set FIRESTORE_DATABASE_ID=(default) in Vercel.`;
  }

  if (
    message.includes("SERVICE_DISABLED") ||
    message.includes("has not been used in project") ||
    message.includes("PERMISSION_DENIED")
  ) {
    return "Firestore is not enabled for your Firebase project. Open Firebase Console → Build → Firestore Database → Create database, then wait 2–5 minutes and try again.";
  }

  if (message.includes("Firebase project mismatch")) {
    return message;
  }

  if (message.includes("FIREBASE_PRIVATE_KEY")) {
    return message;
  }

  if (message.includes("Failed to initialize Firebase Admin")) {
    return message;
  }

  return message;
}
