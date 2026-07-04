"use client";

import FlashcardGrid from "@/components/FlashcardGrid";
import LoadingScreen from "@/components/LoadingScreen";
import PageHeader, { PageContainer } from "@/components/PageHeader";
import UsageMeter from "@/components/UsageMeter";
import { saveCollectionSchema } from "@/lib/validation";
import type { SubscriptionSummary } from "@/lib/plans";
import type { Flashcard } from "@/types/flashcard";
import { useUser } from "@clerk/nextjs";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  TextField,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { parseApiResponse } from "@/utils/parse-api-response";

export default function GeneratePage() {
  const { isLoaded, isSignedIn } = useUser();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionSummary | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadSubscription() {
      try {
        const response = await fetch("/api/subscription");
        if (response.ok) {
          setSubscription(await parseApiResponse<SubscriptionSummary>(response));
        }
      } catch (loadError) {
        console.error("Failed to load subscription:", loadError);
      } finally {
        setSubscriptionLoading(false);
      }
    }

    if (isSignedIn) {
      loadSubscription();
    }
  }, [isSignedIn]);

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

      const data = await parseApiResponse<{
        flashcards?: Flashcard[];
        subscription?: SubscriptionSummary;
        error?: string;
      }>(response);

      if (!response.ok) {
        if (data.subscription) {
          setSubscription(data.subscription);
        }

        throw new Error(data.error ?? "Failed to generate flashcards");
      }

      setFlashcards(data.flashcards ?? []);
      if (data.subscription) {
        setSubscription(data.subscription);
      }
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

      const data = await parseApiResponse<{ error?: string }>(response);

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
    <PageContainer maxWidth="md">
      <PageHeader
        eyebrow="AI Generator"
        title="Generate flashcards"
        description="Paste your study material and create a polished deck with enforced plan limits and validated output."
      />

      <UsageMeter summary={subscription} loading={subscriptionLoading} />

      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          boxShadow: "var(--shadow-soft)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <TextField
          value={text}
          onChange={(event) => setText(event.target.value)}
          label="Study text"
          fullWidth
          multiline
          rows={8}
          variant="outlined"
          sx={{ mb: 2 }}
          helperText="Paste notes or study material (10-10,000 characters)."
        />

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              error.includes("subscription") || error.includes("limit") ? (
                <Button color="inherit" size="small" component={Link} href="/#pricing">
                  Upgrade
                </Button>
              ) : undefined
            }
          >
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          fullWidth
          size="large"
          disabled={
            isGenerating ||
            text.trim().length < 10 ||
            subscription?.canGenerate === false
          }
          startIcon={
            isGenerating ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <AutoAwesomeRoundedIcon />
            )
          }
        >
          {isGenerating ? "Generating..." : "Generate Flashcards"}
        </Button>
      </Paper>

      {flashcards.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <PageHeader
            eyebrow="Preview"
            title="Your generated deck"
            description="Review the cards below, then save them to your library."
          />
          <FlashcardGrid flashcards={flashcards} />
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Button variant="contained" color="secondary" size="large" onClick={() => setOpen(true)}>
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
    </PageContainer>
  );
}
