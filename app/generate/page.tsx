"use client";

import FlashcardGrid from "@/components/FlashcardGrid";
import LoadingScreen from "@/components/LoadingScreen";
import { saveCollectionSchema } from "@/lib/validation";
import type { Flashcard } from "@/types/flashcard";
import { useUser } from "@clerk/nextjs";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GeneratePage() {
  const { isLoaded, isSignedIn } = useUser();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!isLoaded) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!isSignedIn) {
    return null;
  }

  const handleSubmit = async () => {
    setError(null);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ text }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to generate flashcards");
      }

      setFlashcards(data.flashcards ?? []);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Failed to generate flashcards";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveFlashcards = async () => {
    const parsedName = saveCollectionSchema.safeParse({ name });

    if (!parsedName.success) {
      setError(parsedName.error.issues[0]?.message ?? "Invalid collection name");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: parsedName.data.name,
          flashcards,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to save flashcards");
      }

      setOpen(false);
      router.push("/flashcards");
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Failed to save flashcards";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ pb: 6 }}>
      <Box
        sx={{
          mt: 4,
          mb: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Generate Flashcards
        </Typography>
        <Paper sx={{ p: 4, width: "100%" }}>
          <TextField
            value={text}
            onChange={(event) => setText(event.target.value)}
            label="Enter study text"
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            sx={{ mb: 2 }}
            helperText="Paste notes or study material (10-10,000 characters)."
          />
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            fullWidth
            disabled={isGenerating || text.trim().length < 10}
            startIcon={
              isGenerating ? <CircularProgress size={18} color="inherit" /> : undefined
            }
          >
            {isGenerating ? "Generating..." : "Generate Flashcards"}
          </Button>
        </Paper>
      </Box>

      {flashcards.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Flashcards Preview
          </Typography>
          <FlashcardGrid flashcards={flashcards} />
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setOpen(true)}
            >
              Save Collection
            </Button>
          </Box>
        </Box>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Save Flashcards</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Choose a name for your flashcard collection.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Collection Name"
            type="text"
            fullWidth
            value={name}
            onChange={(event) => setName(event.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={saveFlashcards} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
