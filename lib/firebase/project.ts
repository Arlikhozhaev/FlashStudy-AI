export function getServiceAccountProjectId(
  clientEmail: string | undefined,
): string | null {
  if (!clientEmail) {
    return null;
  }

  const match = clientEmail.match(/@(.+)\.iam\.gserviceaccount\.com$/);
  return match?.[1] ?? null;
}

export function validateFirebaseProjectConfig(
  projectId: string,
  clientEmail: string,
): void {
  const serviceAccountProjectId = getServiceAccountProjectId(clientEmail);

  if (
    serviceAccountProjectId &&
    serviceAccountProjectId !== projectId
  ) {
    throw new Error(
      `Firebase project mismatch: FIREBASE_PROJECT_ID is "${projectId}" but the service account belongs to "${serviceAccountProjectId}". Generate a new service account key from the ${projectId} Firebase project and update Vercel.`,
    );
  }
}
