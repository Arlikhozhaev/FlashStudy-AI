import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { jsonError, jsonServerError } from "@/lib/api";
import { getAdminDbAsync } from "@/lib/firebase/admin";

interface RouteContext {
  params: {
    collection: string;
  };
}

export async function GET(_req: Request, { params }: RouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return jsonError("Unauthorized", 401);
  }

  const collectionName = decodeURIComponent(params.collection);

  if (!collectionName) {
    return jsonError("Missing collection name");
  }

  try {
    const db = await getAdminDbAsync();
    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection(collectionName)
      .get();

    const flashcards = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));

    return NextResponse.json({ flashcards });
  } catch (error) {
    console.error("Failed to fetch flashcards:", error);
    return jsonServerError("Unable to fetch flashcards");
  }
}
