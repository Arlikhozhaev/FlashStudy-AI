"use client";

import getStripe from "@/utils/get-stripe";
import { useUser } from "@clerk/nextjs";
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import { useState } from "react";

const PLANS = [
  {
    name: "Basic",
    price: "$4.99 / month",
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID,
    features: [
      "Create up to 100 flashcards per month",
      "Access on any device",
      "Basic customer support",
    ],
  },
  {
    name: "Standard",
    price: "$7.99 / month",
    priceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID,
    features: [
      "Unlimited flashcards and storage",
      "Advanced analytics and tracking",
      "Priority customer support",
    ],
  },
  {
    name: "Premium",
    price: "$9.99 / month",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
    features: [
      "Unlimited flashcards and storage",
      "Advanced customization options",
      "24/7 premium support",
    ],
  },
] as const;

export default function Home() {
  const { isSignedIn } = useUser();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const redirectLink = isSignedIn ? "/generate" : "/sign-in";

  const handleCheckout = async (planName: string, priceId?: string) => {
    setCheckoutError(null);
    setLoadingPlan(planName);

    try {
      const checkoutSession = await fetch("/api/checkout_sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId, planName }),
      });

      const checkoutSessionJson = await checkoutSession.json();

      if (!checkoutSession.ok) {
        throw new Error(
          checkoutSessionJson.error ?? "Unable to start checkout session",
        );
      }

      const stripe = await getStripe();
      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: checkoutSessionJson.id,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Checkout failed";
      setCheckoutError(message);
      console.error(message);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          textAlign: "center",
          my: { xs: 4, sm: 5, md: 6 },
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 3, sm: 4, md: 5 },
          backgroundColor: "#f4f6f8",
          borderRadius: 4,
          boxShadow: 4,
        }}
      >
        <Typography
          variant="h2"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#3b3b3b",
            mb: { xs: 1, sm: 2, md: 3 },
            fontSize: {
              xs: "1.5rem",
              sm: "2rem",
              md: "2.5rem",
              lg: "3rem",
            },
          }}
        >
          Welcome to FlashStudy AI
        </Typography>

        <Typography
          variant="h5"
          gutterBottom
          sx={{
            mb: { xs: 2, sm: 3, md: 4 },
            color: "#555",
            fontSize: {
              xs: "1rem",
              sm: "1.25rem",
              md: "1.5rem",
              lg: "1.75rem",
            },
          }}
        >
          Effortlessly transform your text into flashcards and elevate your
          learning experience.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          href={redirectLink}
          sx={{
            mt: { xs: 2, sm: 3, md: 4 },
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 1, sm: 2, md: 2 },
            fontSize: { xs: "14px", sm: "16px", md: "16px" },
            borderRadius: 4,
          }}
        >
          Get Started
        </Button>
      </Box>

      <Box sx={{ my: 8, backgroundColor: "#f9f9f9", py: 6, borderRadius: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{ mb: 4, fontWeight: "bold", color: "#1e88e5" }}
        >
          Features
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {[
            {
              title: "Text Input",
              description:
                "Simply input your text, and let our software handle the rest. Crafting flashcards has never been this effortless!",
            },
            {
              title: "Smart Flashcards",
              description:
                "Leverage our AI to transform your text into precise, actionable flashcards, making your study sessions more productive and effective.",
            },
            {
              title: "Accessible Anywhere",
              description:
                "Access your flashcards anytime, anywhere. Enjoy unmatched flexibility and convenience in your learning journey!",
            },
          ].map((feature) => (
            <Grid item xs={12} md={4} key={feature.title}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 3,
                  backgroundColor: "#fff",
                  borderRadius: 3,
                  boxShadow: 3,
                  height: "100%",
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                  {feature.title}
                </Typography>
                <Typography>{feature.description}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ my: 6, textAlign: "center" }}>
        <Typography
          variant="h4"
          align="center"
          sx={{ mb: 4, fontWeight: "bold", color: "#1e88e5" }}
        >
          Pricing
        </Typography>
        {checkoutError && (
          <Typography color="error" sx={{ mb: 2 }}>
            {checkoutError}
          </Typography>
        )}
        <Grid container spacing={4} justifyContent="center">
          {PLANS.map((plan) => (
            <Grid item xs={12} md={4} key={plan.name}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 3,
                  backgroundColor: "#fff",
                  border: "2px solid",
                  borderColor: "primary.light",
                  borderRadius: 3,
                  boxShadow: 3,
                  height: "100%",
                }}
              >
                <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
                  {plan.name}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {plan.price}
                </Typography>
                {plan.features.map((feature) => (
                  <Typography key={feature} sx={{ mb: 2 }}>
                    ✔ {feature}
                  </Typography>
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  disabled={loadingPlan === plan.name}
                  onClick={() => handleCheckout(plan.name, plan.priceId)}
                >
                  {loadingPlan === plan.name ? "Redirecting..." : "Choose Plan"}
                </Button>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
