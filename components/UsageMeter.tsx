"use client";

import type { SubscriptionSummary } from "@/lib/plans";
import { TRIAL_DAILY_GENERATION_LIMIT } from "@/lib/plans";
import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";

interface UsageMeterProps {
  summary: SubscriptionSummary | null;
  loading?: boolean;
}

export default function UsageMeter({ summary, loading = false }: UsageMeterProps) {
  if (loading) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Loading usage...
        </Typography>
        <LinearProgress />
      </Paper>
    );
  }

  if (!summary) {
    return null;
  }

  const {
    accessMode,
    subscription,
    usage,
    dailyUsage,
    limit,
    remaining,
    canGenerate,
    trialDaysRemaining,
  } = summary;

  if (accessMode === "expired") {
    return (
      <Alert
        severity="warning"
        sx={{ mb: 3, borderRadius: 3 }}
        action={
          <Button color="inherit" size="small" component={Link} href="/#pricing">
            View Plans
          </Button>
        }
      >
        Your 7-day free trial has ended. Subscribe to keep generating flashcards.
      </Alert>
    );
  }

  if (accessMode === "free_trial") {
    const progress =
      limit === null || limit === 0
        ? 0
        : Math.min((dailyUsage.generationsUsed / limit) * 100, 100);

    return (
      <Paper
        sx={{
          p: 3,
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "var(--shadow-soft)",
          background:
            "linear-gradient(180deg, rgba(79,70,229,0.06), rgba(255,255,255,1))",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="overline" color="primary.main" fontWeight={700}>
              Free Trial
            </Typography>
            <Typography variant="h6">
              {trialDaysRemaining} day{trialDaysRemaining === 1 ? "" : "s"} left
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Generations today
            </Typography>
            <Typography variant="h6">
              {dailyUsage.generationsUsed} / {TRIAL_DAILY_GENERATION_LIMIT}
            </Typography>
          </Box>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 10,
            borderRadius: 999,
            mb: 1,
            backgroundColor: "rgba(79, 70, 229, 0.12)",
          }}
        />

        <Typography variant="body2" color="text.secondary">
          {canGenerate
            ? `${remaining} generation${remaining === 1 ? "" : "s"} left today. Subscribe anytime for higher limits.`
            : `You've used today's ${TRIAL_DAILY_GENERATION_LIMIT} trial generations. Come back tomorrow or subscribe now.`}
        </Typography>

        {!canGenerate && (
          <Button
            component={Link}
            href="/#pricing"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Subscribe Now
          </Button>
        )}
      </Paper>
    );
  }

  const progress =
    limit === null || limit === 0
      ? 0
      : Math.min((usage.flashcardsGenerated / limit) * 100, 100);

  return (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="overline" color="primary.main" fontWeight={700}>
            Current Plan
          </Typography>
          <Typography variant="h6">{subscription.plan}</Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Billing period usage
          </Typography>
          <Typography variant="h6">
            {limit === null
              ? `${usage.flashcardsGenerated} flashcards generated`
              : `${usage.flashcardsGenerated} / ${limit} flashcards`}
          </Typography>
        </Box>
      </Stack>

      {limit !== null && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 10,
            borderRadius: 999,
            mb: 1,
            backgroundColor: "rgba(79, 70, 229, 0.12)",
          }}
        />
      )}

      <Typography variant="body2" color="text.secondary">
        {limit === null
          ? "Your plan includes unlimited flashcard generation."
          : canGenerate
            ? `${remaining} flashcards remaining this billing period.`
            : "You have reached your monthly limit. Upgrade to continue generating."}
      </Typography>

      {!canGenerate && (
        <Button
          component={Link}
          href="/#pricing"
          variant="contained"
          sx={{ mt: 2 }}
        >
          Upgrade Plan
        </Button>
      )}
    </Paper>
  );
}
