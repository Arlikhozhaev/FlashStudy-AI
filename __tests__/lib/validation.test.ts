import { describe, expect, it } from "vitest";
import {
  flashcardsResponseSchema,
  generateFlashcardsSchema,
  saveCollectionSchema,
} from "@/lib/validation";

describe("generateFlashcardsSchema", () => {
  it("accepts valid input", () => {
    const result = generateFlashcardsSchema.safeParse({
      text: "Photosynthesis converts light energy into chemical energy.",
    });

    expect(result.success).toBe(true);
  });

  it("rejects text that is too short", () => {
    const result = generateFlashcardsSchema.safeParse({ text: "short" });
    expect(result.success).toBe(false);
  });
});

describe("saveCollectionSchema", () => {
  it("accepts valid collection names", () => {
    const result = saveCollectionSchema.safeParse({ name: "Biology 101" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid characters", () => {
    const result = saveCollectionSchema.safeParse({ name: "Bad/Name" });
    expect(result.success).toBe(false);
  });
});

describe("flashcardsResponseSchema", () => {
  it("accepts a valid flashcard payload", () => {
    const result = flashcardsResponseSchema.safeParse({
      flashcards: [{ front: "What is ATP?", back: "Energy" }],
    });

    expect(result.success).toBe(true);
  });
});
