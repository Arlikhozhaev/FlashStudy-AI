"use client";

import LoadingScreen from "@/components/LoadingScreen";
import { PageContainer } from "@/components/PageHeader";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import { Box, Button, Paper, Typography } from "@mui/material";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface CheckoutSession {
  payment_status?: string;
}

function ResultContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCheckoutSession = async () => {
      if (!sessionId) {
        setError("Missing checkout session ID");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/checkout_sessions?session_id=${encodeURIComponent(sessionId)}`,
        );
        const sessionData = await response.json();

        if (response.ok) {
          setSession(sessionData);
        } else {
          setError(sessionData.error ?? "Unable to retrieve checkout session");
        }
      } catch {
        setError("An unexpected error occurred while verifying payment");
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutSession();
  }, [sessionId]);

  if (loading) {
    return <LoadingScreen message="Verifying payment..." />;
  }

  const paid = session?.payment_status === "paid";

  return (
    <PageContainer maxWidth="sm">
      <Paper
        sx={{
          p: { xs: 4, md: 5 },
          textAlign: "center",
          boxShadow: "var(--shadow-soft)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {error ? (
          <>
            <ErrorOutlineRoundedIcon color="error" sx={{ fontSize: 56, mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Payment verification failed
            </Typography>
            <Typography color="text.secondary">{error}</Typography>
          </>
        ) : (
          <>
            {paid ? (
              <CheckCircleRoundedIcon color="success" sx={{ fontSize: 56, mb: 2 }} />
            ) : (
              <ErrorOutlineRoundedIcon color="warning" sx={{ fontSize: 56, mb: 2 }} />
            )}
            <Typography variant="h4" gutterBottom>
              {paid ? "Subscription activated" : "Payment incomplete"}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {paid
                ? "Your plan is now active. Usage limits will apply based on the tier you selected."
                : "Your payment was not completed. You can return to pricing and try again."}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button component={Link} href="/generate" variant="contained">
                Start Generating
              </Button>
              <Button component={Link} href="/#pricing" variant="outlined">
                Back to Pricing
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </PageContainer>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading payment result..." />}>
      <ResultContent />
    </Suspense>
  );
}
