import OpenAI from "openai";
import { getServerEnv } from "@/lib/env";

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const { OPENAI_API_KEY } = getServerEnv();
    openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
  }

  return openaiClient;
}

export const FLASHCARD_SYSTEM_PROMPT = `You are an expert educator creating high-quality study flashcards.

Rules:
1. Generate exactly 9 flashcards from the user's study material.
2. Each card has a "front" (question or prompt) and "back" (answer).
3. Front: Ask one clear, specific question. Use direct wording suitable for self-quizzing.
4. Back: Provide a complete, accurate answer the learner can verify without guessing.
   - Never reduce an answer to a single word when the correct response needs more (e.g. "Artificial Intelligence", not "Intelligence", for "What does AI stand for?").
   - Use a concise phrase or 1-2 short sentences, typically 5-30 words.
   - Include every essential term required for the answer to be fully correct.
5. Verify factual accuracy. Do not guess, abbreviate incorrectly, or omit critical words.
6. Cover the most important concepts from the material with balanced variety.
7. Use plain language suitable for exam review.
8. Do not use markdown, bullet points, or numbering inside front/back text.

Return ONLY valid JSON in this format:
{
  "flashcards": [
    { "front": "string", "back": "string" }
  ]
}`;
