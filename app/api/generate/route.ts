import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { jsonError, jsonServerError } from "@/lib/api";
import { getOpenAIClient, FLASHCARD_SYSTEM_PROMPT } from "@/lib/openai";
import {
  assertCanGenerate,
  getUserSubscriptionSummary,
  recordGenerationUsage,
  SubscriptionError,
} from "@/lib/subscription";
import {
  flashcardsResponseSchema,
  generateFlashcardsSchema,
} from "@/lib/validation";

const ESTIMATED_FLASHCARDS_PER_GENERATION = 9;

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export async function POST(req: Request) {
  try {
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

    const parsedInput = generateFlashcardsSchema.safeParse(body);

    if (!parsedInput.success) {
      return jsonError(parsedInput.error.issues[0]?.message ?? "Invalid input");
    }

    let summary;

    try {
      summary = await assertCanGenerate(
        userId,
        ESTIMATED_FLASHCARDS_PER_GENERATION,
      );
    } catch (error) {
      if (error instanceof SubscriptionError) {
        return NextResponse.json(
          {
            error: error.message,
            subscription: error.summary,
          },
          { status: error.status },
        );
      }

      console.error("Subscription check failed:", error);
      return jsonServerError(
        getErrorMessage(
          error,
          "Unable to verify subscription. Check Firebase credentials in `.env.local`.",
        ),
      );
    }

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: FLASHCARD_SYSTEM_PROMPT },
        { role: "user", content: parsedInput.data.text },
      ],
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      return jsonServerError("Model returned an empty response");
    }

    let parsedJson: unknown;

    try {
      parsedJson = JSON.parse(responseContent);
    } catch {
      return jsonServerError("Model returned malformed JSON");
    }

    const parsedResponse = flashcardsResponseSchema.safeParse(parsedJson);

    if (!parsedResponse.success) {
      return jsonServerError("Model returned an invalid flashcard payload");
    }

    const generatedCount = parsedResponse.data.flashcards.length;

    if (summary.accessMode === "subscription") {
      const refreshedSummary = await getUserSubscriptionSummary(userId);

      if (
        refreshedSummary.limit !== null &&
        refreshedSummary.usage.flashcardsGenerated + generatedCount >
          refreshedSummary.limit
      ) {
        return NextResponse.json(
          {
            error: `This generation would exceed your ${refreshedSummary.subscription.plan} plan limit of ${refreshedSummary.limit} flashcards.`,
            subscription: refreshedSummary,
          },
          { status: 429 },
        );
      }

      summary = refreshedSummary;
    }

    await recordGenerationUsage(userId, generatedCount, summary);

    const updatedSummary = await getUserSubscriptionSummary(userId);

    return NextResponse.json({
      ...parsedResponse.data,
      subscription: updatedSummary,
    });
  } catch (error) {
    console.error("Generate API error:", error);

    const message = getErrorMessage(error, "Failed to generate flashcards");

    if (
      message.includes("OPENAI_API_KEY") ||
      message.includes("environment configuration")
    ) {
      return jsonServerError(
        "OpenAI is not configured. Add `OPENAI_API_KEY` to `.env.local`.",
      );
    }

    if (message.includes("Firebase")) {
      return jsonServerError(
        "Firebase is not configured correctly. Check `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` in `.env.local`.",
      );
    }

    return jsonServerError(message);
  }
}
