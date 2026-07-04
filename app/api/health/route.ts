import { NextResponse } from "next/server";
import { isValidPrivateKey, normalizePrivateKey } from "@/lib/firebase/normalize-key";

export async function GET() {
  const firebasePrivateKey = normalizePrivateKey(
    process.env.FIREBASE_PRIVATE_KEY,
  );

  const checks = {
    clerkPublishable: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
    clerkSecret: Boolean(process.env.CLERK_SECRET_KEY),
    openai: Boolean(process.env.OPENAI_API_KEY ?? process.env.OPEN_API_KEY),
    stripeSecret: Boolean(process.env.STRIPE_SECRET_KEY),
    stripePublishable: Boolean(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
        process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
    ),
    firebaseProjectId: Boolean(process.env.FIREBASE_PROJECT_ID),
    firebaseClientEmail: Boolean(process.env.FIREBASE_CLIENT_EMAIL),
    firebasePrivateKey: Boolean(process.env.FIREBASE_PRIVATE_KEY),
    firebasePrivateKeyValid: isValidPrivateKey(firebasePrivateKey),
  };

  const ready = Object.values(checks).every(Boolean);

  return NextResponse.json({
    status: ready ? "ok" : "misconfigured",
    service: "flashstudy-ai",
    timestamp: new Date().toISOString(),
    checks,
  });
}
