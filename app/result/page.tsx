"use client";

import LoadingScreen from "@/components/LoadingScreen";
import { Box, Container, Typography } from "@mui/material";
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

  if (error) {
    return (
      <Container maxWidth="md" sx={{ textAlign: "center", py: 6 }}>
        <Typography variant="h5" gutterBottom>
          Payment verification failed
        </Typography>
        <Typography color="text.secondary">{error}</Typography>
      </Container>
    );
  }

  const paid = session?.payment_status === "paid";

  return (
    <Container maxWidth="md" sx={{ textAlign: "center", py: 6 }}>
      <Typography variant="h4" gutterBottom>
        {paid ? "Thank you for subscribing" : "Payment incomplete"}
      </Typography>
      <Box sx={{ mt: 3 }}>
        {sessionId && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Session ID: {sessionId}
          </Typography>
        )}
        <Typography variant="body1">
          {paid
            ? "Your payment was received successfully. Subscription access will be activated shortly."
            : "Your payment was not completed. You can return to pricing and try again."}
        </Typography>
      </Box>
    </Container>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading payment result..." />}>
      <ResultContent />
    </Suspense>
  );
}
