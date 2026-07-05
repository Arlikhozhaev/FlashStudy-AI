"use client";

import FlipRoundedIcon from "@mui/icons-material/FlipRounded";
import {
  Box,
  Chip,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { useState } from "react";
import type { Flashcard } from "@/types/flashcard";

interface FlashcardGridProps {
  flashcards: Array<Flashcard & { id?: string }>;
  getKey?: (
    flashcard: Flashcard & { id?: string },
    index: number,
  ) => string | number;
}

const CARD_MIN_HEIGHT = 240;

export default function FlashcardGrid({
  flashcards,
  getKey = (_flashcard, index) => index,
}: FlashcardGridProps) {
  const [flipped, setFlipped] = useState<Record<string | number, boolean>>({});

  const handleCardClick = (key: string | number) => {
    setFlipped((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Grid container spacing={3}>
      {flashcards.map((flashcard, index) => {
        const key = getKey(flashcard, index);
        const isFlipped = Boolean(flipped[key]);

        return (
          <Grid item xs={12} sm={6} md={4} key={key}>
            <Paper
              elevation={0}
              onClick={() => handleCardClick(key)}
              sx={{
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "var(--shadow-soft)",
                cursor: "pointer",
                overflow: "hidden",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "var(--shadow-card)",
                },
                "&:focus-visible": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: 2,
                },
              }}
              role="button"
              tabIndex={0}
              aria-label={`Flashcard ${index + 1}. ${isFlipped ? "Answer" : "Question"}: ${isFlipped ? flashcard.back : flashcard.front}. Press to flip.`}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleCardClick(key);
                }
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.25,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.default",
                }}
              >
                <Chip
                  size="small"
                  label={isFlipped ? "Answer" : "Question"}
                  color={isFlipped ? "secondary" : "primary"}
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {index + 1} / {flashcards.length}
                </Typography>
              </Box>

              <Box
                sx={{
                  perspective: "1200px",
                  minHeight: CARD_MIN_HEIGHT,
                  bgcolor: isFlipped
                    ? "rgba(6, 182, 212, 0.06)"
                    : "rgba(79, 70, 229, 0.05)",
                }}
              >
                <Box
                  sx={{
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    transition: "transform 0.55s ease",
                    transformStyle: "preserve-3d",
                    position: "relative",
                    width: "100%",
                    minHeight: CARD_MIN_HEIGHT,
                  }}
                >
                  <Box
                    sx={{
                      backfaceVisibility: "hidden",
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      px: 2.5,
                      py: 3,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      align="center"
                      fontWeight={600}
                      sx={{
                        lineHeight: 1.5,
                        wordBreak: "break-word",
                      }}
                    >
                      {flashcard.front}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      transform: "rotateY(180deg)",
                      backfaceVisibility: "hidden",
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      px: 2.5,
                      py: 3,
                      overflowY: "auto",
                    }}
                  >
                    <Typography
                      variant="body1"
                      align="center"
                      color="primary.dark"
                      sx={{
                        lineHeight: 1.6,
                        fontWeight: 500,
                        wordBreak: "break-word",
                      }}
                    >
                      {flashcard.back}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  px: 2.5,
                  py: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.75,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.default",
                }}
              >
                <FlipRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ letterSpacing: 0.2, fontWeight: 500 }}
                >
                  Tap to flip
                </Typography>
              </Box>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
}
