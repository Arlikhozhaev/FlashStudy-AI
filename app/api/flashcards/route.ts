import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { jsonError, jsonServerError } from "@/lib/api";
import { getAdminDbAsync } from "@/lib/firebase/admin";
import { saveCollectionSchema, flashcardSchema } from "@/lib/validation";
import type { FlashcardCollection } from "@/types/flashcard";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const db = await getAdminDbAsync();
    const userDoc = await db.collection("users").doc(userId).get();
    const collections = (userDoc.data()?.flashcards ?? []) as FlashcardCollection[];

    return NextResponse.json({ collections });
  } catch (error) {
    console.error("Failed to fetch collections:", error);
    return jsonServerError("Unable to fetch flashcard collections");
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return jsonError("Unauthorized", 401);
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsedBody = saveCollectionSchema
    .extend({
      flashcards: flashcardSchema.array().min(1).max(20),
    })
    .safeParse(body);

  if (!parsedBody.success) {
    return jsonError(parsedBody.error.issues[0]?.message ?? "Invalid payload");
  }

  const { name, flashcards } = parsedBody.data;

  try {
    const db = await getAdminDbAsync();
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    const collections = (userDoc.data()?.flashcards ?? []) as FlashcardCollection[];

    if (collections.some((collection) => collection.name === name)) {
      return jsonError("Flashcard collection name already exists", 409);
    }

    const batch = db.batch();
    batch.set(
      userRef,
      { flashcards: [...collections, { name }] },
      { merge: true },
    );

    const collectionRef = userRef.collection(name);
    flashcards.forEach((flashcard) => {
      batch.set(collectionRef.doc(), flashcard);
    });

    await batch.commit();

    return NextResponse.json({ success: true, name });
  } catch (error) {
    console.error("Failed to save collection:", error);
    return jsonServerError("Unable to save flashcard collection");
  }
}
