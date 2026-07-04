import { z } from "zod";

export const generateFlashcardsSchema = z.object({
  text: z
    .string()
    .trim()
    .min(10, "Text must be at least 10 characters")
    .max(10000, "Text must be at most 10,000 characters"),
});

export const saveCollectionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Collection name is required")
    .max(100, "Collection name must be at most 100 characters")
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      "Collection name may only contain letters, numbers, spaces, hyphens, and underscores",
    ),
});

export const flashcardSchema = z.object({
  front: z.string().trim().min(1).max(500),
  back: z.string().trim().min(1).max(500),
});

export const flashcardsResponseSchema = z.object({
  flashcards: z.array(flashcardSchema).min(1).max(20),
});
