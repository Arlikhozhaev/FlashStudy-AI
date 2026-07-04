export function formatFirebaseError(error: unknown): string {
  const message =
    error instanceof Error ? error.message : "Unknown Firebase error";

  if (
    message.includes("SERVICE_DISABLED") ||
    message.includes("has not been used in project") ||
    message.includes("PERMISSION_DENIED")
  ) {
    return "Firestore is not enabled for your Firebase project. Open Firebase Console → Build → Firestore Database → Create database, then wait 2–5 minutes and try again.";
  }

  if (message.includes("FIREBASE_PRIVATE_KEY")) {
    return message;
  }

  if (message.includes("Failed to initialize Firebase Admin")) {
    return message;
  }

  return message;
}
