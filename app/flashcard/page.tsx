"use client";

import FlashcardGrid from "@/components/FlashcardGrid";
import LoadingScreen from "@/components/LoadingScreen";
import type { FlashcardDocument } from "@/types/flashcard";
import { useUser } from "@clerk/nextjs";
import { Alert, Container, Typography } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function FlashcardContent() {
  const { isLoaded, isSignedIn } = useUser();
  const [flashcards, setFlashcards] = useState<FlashcardDocument[]>([]);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const collectionId = searchParams.get("id");

  useEffect(() => {
    async function getFlashcard() {
      if (!collectionId || !isSignedIn) {
        return;
      }

      try {
        const response = await fetch(
          `/api/flashcards/${encodeURIComponent(collectionId)}`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load flashcards");
        }

        setFlashcards(data.flashcards ?? []);
      } catch (fetchError) {
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load flashcards";
        setError(message);
      }
    }

    getFlashcard();
  }, [isSignedIn, collectionId]);

  if (!isLoaded) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!isSignedIn) {
    return null;
  }

  if (!collectionId) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">No flashcard collection was selected.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {collectionId}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {flashcards.length === 0 && !error ? (
        <Typography color="text.secondary">
          This collection is empty.
        </Typography>
      ) : (
        <FlashcardGrid
          flashcards={flashcards}
          getKey={(flashcard, index) => flashcard.id ?? index}
        />
      )}
    </Container>
  );
}

export default function FlashcardPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading flashcards..." />}>
      <FlashcardContent />
    </Suspense>
  );
}
