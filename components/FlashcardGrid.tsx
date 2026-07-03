"use client";

import {
  Box,
  CardActionArea,
  CardContent,
  Grid,
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

        return (
          <Grid item xs={12} sm={6} md={4} key={key}>
            <CardActionArea
              onClick={() => handleCardClick(key)}
              sx={{
                borderRadius: 4,
                overflow: "hidden",
                boxShadow: "var(--shadow-soft)",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "var(--shadow-card)",
                },
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Box
                  sx={{
                    perspective: "1200px",
                    minHeight: 220,
                    background:
                      "linear-gradient(135deg, rgba(79,70,229,0.08), rgba(6,182,212,0.08))",
                    "& > div": {
                      transform: flipped[key]
                        ? "rotateY(180deg)"
                        : "rotateY(0deg)",
                      transition: "transform 0.6s",
                      transformStyle: "preserve-3d",
                      position: "relative",
                      width: "100%",
                      minHeight: 220,
                    },
                  }}
                >
                  <div>
                    <div
                      style={{
                        backfaceVisibility: "hidden",
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "24px",
                      }}
                    >
                      <Typography variant="h6" align="center" fontWeight={700}>
                        {flashcard.front}
                      </Typography>
                    </div>
                    <div
                      style={{
                        transform: "rotateY(180deg)",
                        backfaceVisibility: "hidden",
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "24px",
                        background:
                          "linear-gradient(135deg, rgba(79,70,229,0.16), rgba(6,182,212,0.12))",
                      }}
                    >
                      <Typography variant="h6" align="center" color="primary" fontWeight={700}>
                        {flashcard.back}
                      </Typography>
                    </div>
                  </div>
                </Box>
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Tap to flip
                  </Typography>
                </Box>
              </CardContent>
            </CardActionArea>
          </Grid>
        );
      })}
    </Grid>
  );
}
