import { getAdminDbAsync } from "@/lib/firebase/admin";
import { getServiceAccountProjectId } from "@/lib/firebase/project";
import { testFirestoreConnection } from "@/lib/firebase/admin";
import { isValidPrivateKey, normalizePrivateKey } from "@/lib/firebase/normalize-key";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const firebasePrivateKey = normalizePrivateKey(
    process.env.FIREBASE_PRIVATE_KEY,
  );
  const projectId = process.env.FIREBASE_PROJECT_ID ?? null;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL ?? null;
  const serviceAccountProjectId = getServiceAccountProjectId(clientEmail ?? undefined);

  const checks = {
    clerkPublishable: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
    clerkSecret: Boolean(process.env.CLERK_SECRET_KEY),
    openai: Boolean(process.env.OPENAI_API_KEY ?? process.env.OPEN_API_KEY),
    stripeSecret: Boolean(process.env.STRIPE_SECRET_KEY),
    stripePublishable: Boolean(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
        process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
    ),
    firebaseProjectId: Boolean(projectId),
    firebaseClientEmail: Boolean(clientEmail),
    firebasePrivateKey: Boolean(process.env.FIREBASE_PRIVATE_KEY),
    firebasePrivateKeyValid: isValidPrivateKey(firebasePrivateKey),
    firebaseProjectIdsMatch:
      !projectId ||
      !serviceAccountProjectId ||
      projectId === serviceAccountProjectId,
    firebaseServiceAccountProjectId: serviceAccountProjectId,
  };

  const firestore = await testFirestoreConnection();
  const ready =
    Object.values(checks).every(Boolean) && firestore.connected;

  return NextResponse.json({
    status: ready ? "ok" : "misconfigured",
    service: "flashstudy-ai",
    timestamp: new Date().toISOString(),
    checks,
    firestore,
    hint:
      !firestore.connected && !checks.firebaseProjectIdsMatch
        ? `Regenerate your Firebase service account from project "${projectId}" and update FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY in Vercel.`
        : !firestore.connected
          ? "Create Firestore in the same Firebase project as your service account, or set FIRESTORE_DATABASE_ID=(default) in Vercel."
          : null,
  });
}
