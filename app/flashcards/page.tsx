"use client";

import LoadingScreen from "@/components/LoadingScreen";
import type { FlashcardCollection } from "@/types/flashcard";
import { useUser } from "@clerk/nextjs";
import {
  Alert,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function FlashcardsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [flashcards, setFlashcards] = useState<FlashcardCollection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function getFlashcards() {
      if (!isSignedIn) {
        return;
      }

      try {
        const response = await fetch("/api/flashcards");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load flashcard collections");
        }

        setFlashcards(data.collections ?? []);
      } catch (fetchError) {
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load flashcard collections";
        setError(message);
      }
    }

    getFlashcards();
  }, [isSignedIn]);

  if (!isLoaded) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Flashcard Decks
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {flashcards.length === 0 ? (
        <Typography color="text.secondary">
          You do not have any saved collections yet. Generate a deck to get started.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {flashcards.map((flashcard) => (
            <Grid item xs={12} sm={6} md={4} key={flashcard.name}>
              <Card>
                <CardActionArea
                  onClick={() =>
                    router.push(
                      `/flashcard?id=${encodeURIComponent(flashcard.name)}`,
                    )
                  }
                >
                  <CardContent>
                    <Typography variant="h6">{flashcard.name}</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
