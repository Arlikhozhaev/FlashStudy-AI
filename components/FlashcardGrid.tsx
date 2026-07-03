"use client";

import { Box, CardActionArea, CardContent, Grid, Typography } from "@mui/material";
import { useState } from "react";
import type { Flashcard } from "@/types/flashcard";

interface FlashcardGridProps {
  flashcards: Array<Flashcard & { id?: string }>;
  getKey?: (flashcard: Flashcard & { id?: string }, index: number) => string | number;
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
            <CardActionArea onClick={() => handleCardClick(key)}>
              <CardContent>
                <Box
                  sx={{
                    perspective: "1000px",
                    "& > div": {
                      transform: flipped[key]
                        ? "rotateY(180deg)"
                        : "rotateY(0deg)",
                      transition: "transform 0.6s",
                      transformStyle: "preserve-3d",
                      position: "relative",
                      width: "100%",
                      height: "200px",
                      boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  <div>
                    <div
                      style={{
                        backfaceVisibility: "hidden",
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "16px",
                      }}
                    >
                      <Typography variant="h6" align="center">
                        {flashcard.front}
                      </Typography>
                    </div>
                    <div
                      style={{
                        transform: "rotateY(180deg)",
                        backfaceVisibility: "hidden",
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "16px",
                      }}
                    >
                      <Typography variant="h6" align="center">
                        {flashcard.back}
                      </Typography>
                    </div>
                  </div>
                </Box>
              </CardContent>
            </CardActionArea>
          </Grid>
        );
      })}
    </Grid>
  );
}
