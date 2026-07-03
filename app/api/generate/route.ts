import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { jsonError, jsonServerError } from "@/lib/api";
import { getOpenAIClient, FLASHCARD_SYSTEM_PROMPT } from "@/lib/openai";
import {
  flashcardsResponseSchema,
  generateFlashcardsSchema,
} from "@/lib/validation";

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

    return NextResponse.json(parsedResponse.data);
  } catch (error) {
    console.error("Generate API error:", error);
    return jsonServerError("Failed to generate flashcards");
  }
}
