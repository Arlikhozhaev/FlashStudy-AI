import { describe, expect, it } from "vitest";
import { FLASHCARD_SYSTEM_PROMPT } from "@/lib/openai";

describe("FLASHCARD_SYSTEM_PROMPT", () => {
  it("requires complete answers instead of one-word replies", () => {
    expect(FLASHCARD_SYSTEM_PROMPT.toLowerCase()).not.toContain("one word");
    expect(FLASHCARD_SYSTEM_PROMPT).toContain("Artificial Intelligence");
    expect(FLASHCARD_SYSTEM_PROMPT).toContain("complete, accurate answer");
  });
});
