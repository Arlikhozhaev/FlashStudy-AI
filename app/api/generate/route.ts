import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { jsonError, jsonServerError } from "@/lib/api";
import { getOpenAIClient, FLASHCARD_SYSTEM_PROMPT } from "@/lib/openai";
import {
  assertCanGenerate,
  getUserSubscriptionSummary,
  recordFlashcardUsage,
  SubscriptionError,
} from "@/lib/subscription";
import {
  flashcardsResponseSchema,
  generateFlashcardsSchema,
} from "@/lib/validation";

const ESTIMATED_FLASHCARDS_PER_GENERATION = 9;

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

  const parsedInput = generateFlashcardsSchema.safeParse(body);

  if (!parsedInput.success) {
    return jsonError(parsedInput.error.issues[0]?.message ?? "Invalid input");
  }

  try {
    await assertCanGenerate(userId, ESTIMATED_FLASHCARDS_PER_GENERATION);
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

    throw error;
  }

  try {
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

    const parsedResponse = flashcardsResponseSchema.safeParse(
      JSON.parse(responseContent),
    );

    if (!parsedResponse.success) {
      return jsonServerError("Model returned an invalid flashcard payload");
    }

    const generatedCount = parsedResponse.data.flashcards.length;
    const summary = await getUserSubscriptionSummary(userId);

    if (
      summary.limit !== null &&
      summary.usage.flashcardsGenerated + generatedCount > summary.limit
    ) {
      return NextResponse.json(
        {
          error: `This generation would exceed your ${summary.subscription.plan} plan limit of ${summary.limit} flashcards.`,
          subscription: summary,
        },
        { status: 429 },
      );
    }

    await recordFlashcardUsage(
      userId,
      generatedCount,
      summary.subscription.currentPeriodStart,
    );

    const updatedSummary = await getUserSubscriptionSummary(userId);

    return NextResponse.json({
      ...parsedResponse.data,
      subscription: updatedSummary,
    });
  } catch (error) {
    console.error("Generate API error:", error);
    return jsonServerError("Failed to generate flashcards");
  }
}
