import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { jsonError, jsonServerError } from "@/lib/api";
import { getUserSubscriptionSummary } from "@/lib/subscription";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const summary = await getUserSubscriptionSummary(userId);
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Failed to fetch subscription:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unable to fetch subscription details";
    return jsonServerError(message);
  }
}
