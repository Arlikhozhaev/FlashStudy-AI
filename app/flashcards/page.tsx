"use client";

import LoadingScreen from "@/components/LoadingScreen";
import PageHeader, { PageContainer } from "@/components/PageHeader";
import type { FlashcardCollection } from "@/types/flashcard";
import { useUser } from "@clerk/nextjs";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import Link from "next/link";
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
    <PageContainer>
      <PageHeader
        eyebrow="Library"
        title="My flashcard decks"
        description="Browse your saved collections and jump back into review mode."
        action={
          <Button component={Link} href="/generate" variant="contained">
            Generate New Deck
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {flashcards.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            px: 3,
            borderRadius: 4,
            border: "1px dashed",
            borderColor: "divider",
            background: "rgba(255,255,255,0.7)",
          }}
        >
          <FolderOpenRoundedIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No decks yet
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Generate your first collection to start building a personal study library.
          </Typography>
          <Button component={Link} href="/generate" variant="contained">
            Create your first deck
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {flashcards.map((flashcard) => (
            <Grid item xs={12} sm={6} md={4} key={flashcard.name}>
              <Card
                sx={{
                  boxShadow: "var(--shadow-soft)",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <CardActionArea
                  onClick={() =>
                    router.push(
                      `/flashcard?id=${encodeURIComponent(flashcard.name)}`,
                    )
                  }
                >
                  <CardContent sx={{ p: 3 }}>
                    <FolderOpenRoundedIcon color="primary" sx={{ mb: 1 }} />
                    <Typography variant="h6">{flashcard.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tap to review this deck
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </PageContainer>
  );
}
