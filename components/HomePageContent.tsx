"use client";

import PricingCard from "@/components/PricingCard";
import { PLANS, type PlanName } from "@/lib/plans";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import CloudDoneRoundedIcon from "@mui/icons-material/CloudDoneRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";

const FEATURES = [
  {
    title: "Instant Generation",
    description:
      "Paste your notes and get structured flashcards in seconds with validated AI output.",
    icon: <BoltRoundedIcon fontSize="large" color="primary" />,
  },
  {
    title: "Smart Study Cards",
    description:
      "Each card focuses on one concept with crisp prompts and concise answers.",
    icon: <PsychologyRoundedIcon fontSize="large" color="primary" />,
  },
  {
    title: "Cloud Sync",
    description:
      "Save collections securely and review them anywhere with authenticated access.",
    icon: <CloudDoneRoundedIcon fontSize="large" color="primary" />,
  },
];

interface HomePageContentProps {
  isSignedIn?: boolean;
  loadingPlan?: PlanName | null;
  checkoutError?: string | null;
  onCheckout?: (planName: PlanName) => void;
}

export default function HomePageContent({
  isSignedIn = false,
  loadingPlan = null,
  checkoutError = null,
  onCheckout,
}: HomePageContentProps) {
  return (
    <>
      <Box
        sx={{
          background: "var(--gradient-hero)",
          color: "white",
          py: { xs: 8, md: 12 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7} className="animate-fade-up">
              <Stack spacing={3}>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.12)",
                    width: "fit-content",
                  }}
                >
                  <AutoAwesomeRoundedIcon fontSize="small" />
                  <Typography variant="body2" fontWeight={600}>
                    AI flashcards built for serious learners
                  </Typography>
                </Box>

                <Typography variant="h2" component="h1">
                  Turn notes into beautiful flashcards in seconds.
                </Typography>

                <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.78)", maxWidth: 620 }}>
                  FlashStudy AI combines production-grade SaaS architecture with
                  a polished study experience — auth, subscriptions, secure
                  storage, and AI generation out of the box.
                </Typography>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    component={Link}
                    href={isSignedIn ? "/generate" : "/sign-up"}
                    variant="contained"
                    size="large"
                    sx={{
                      bgcolor: "white",
                      color: "primary.main",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.92)" },
                    }}
                  >
                    Start Studying
                  </Button>
                  <Button
                    component={Link}
                    href="#pricing"
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: "rgba(255,255,255,0.4)",
                      color: "white",
                    }}
                  >
                    View Pricing
                  </Button>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} md={5}>
              <Paper
                className="animate-float"
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: "rgba(255,255,255,0.1)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.18)",
                  backdropFilter: "blur(18px)",
                }}
              >
                <Typography variant="overline" sx={{ opacity: 0.8 }}>
                  Live Preview
                </Typography>
                <Typography variant="h5" fontWeight={800} gutterBottom>
                  What is photosynthesis?
                </Typography>
                <Typography sx={{ opacity: 0.82, mb: 3 }}>
                  Tap to reveal the answer on a generated flashcard deck.
                </Typography>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.12)",
                    textAlign: "center",
                    fontWeight: 700,
                  }}
                >
                  Glucose
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Typography variant="h3" align="center" gutterBottom>
          Built for modern learners
        </Typography>
        <Typography align="center" color="text.secondary" sx={{ mb: 6, mx: "auto", maxWidth: 680 }}>
          A resume-ready SaaS stack with clean UX, enforced subscription tiers,
          and production patterns you would expect in a big-tech codebase.
        </Typography>

        <Grid container spacing={3}>
          {FEATURES.map((feature) => (
            <Grid item xs={12} md={4} key={feature.title}>
              <Paper
                sx={{
                  p: 3,
                  height: "100%",
                  boxShadow: "var(--shadow-soft)",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">{feature.description}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box id="pricing" sx={{ py: { xs: 8, md: 10 }, background: "rgba(255,255,255,0.65)" }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom>
            Simple, enforced pricing
          </Typography>
          <Typography align="center" color="text.secondary" sx={{ mb: 2, mx: "auto", maxWidth: 680 }}>
            Basic includes 100 flashcards per billing period. Standard and Premium
            include unlimited generation.
          </Typography>

          {checkoutError && (
            <Typography color="error" align="center" sx={{ mb: 2 }}>
              {checkoutError}
            </Typography>
          )}

          <Grid container spacing={3} sx={{ mt: 2 }}>
            {(Object.keys(PLANS) as PlanName[]).map((planName) => {
              const plan = PLANS[planName];
              return (
                <Grid item xs={12} md={4} key={planName}>
                  <PricingCard
                    name={plan.name}
                    price={`$${plan.price.toFixed(2)} / month`}
                    description={plan.description}
                    features={plan.features}
                    highlighted={plan.highlighted}
                    loading={loadingPlan === planName}
                    onSelect={() => onCheckout?.(planName)}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>
    </>
  );
}
