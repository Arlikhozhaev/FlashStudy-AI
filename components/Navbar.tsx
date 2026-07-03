"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { SubscriptionSummary } from "@/lib/plans";

interface NavbarProps {
  skipClerk?: boolean;
}

function NavbarLinks({ skipClerk = false }: NavbarProps) {
  const [planLabel, setPlanLabel] = useState<string | null>(null);

  useEffect(() => {
    if (skipClerk) {
      return;
    }

    async function loadPlan() {
      try {
        const response = await fetch("/api/subscription");
        if (!response.ok) {
          return;
        }

        const summary = (await response.json()) as SubscriptionSummary;
        if (
          summary.subscription.plan &&
          (summary.subscription.status === "active" ||
            summary.subscription.status === "trialing")
        ) {
          setPlanLabel(summary.subscription.plan);
        }
      } catch {
        // Ignore navbar badge failures silently.
      }
    }

    loadPlan();
  }, [skipClerk]);

  if (skipClerk) {
    return (
      <>
        <Button color="inherit" component={Link} href="/sign-in">
          Login
        </Button>
        <Button variant="contained" component={Link} href="/sign-up" sx={{ ml: 1 }}>
          Get Started
        </Button>
      </>
    );
  }

  return (
    <>
      <SignedOut>
        <Button color="inherit" component={Link} href="/sign-in">
          Login
        </Button>
        <Button variant="contained" component={Link} href="/sign-up" sx={{ ml: 1 }}>
          Get Started
        </Button>
      </SignedOut>
      <SignedIn>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {planLabel && (
            <Chip label={planLabel} color="primary" size="small" variant="outlined" />
          )}
          <Button color="inherit" component={Link} href="/generate">
            Generate
          </Button>
          <Button color="inherit" component={Link} href="/flashcards">
            My Decks
          </Button>
          <UserButton afterSignOutUrl="/" />
        </Box>
      </SignedIn>
    </>
  );
}

export default function Navbar({ skipClerk = false }: NavbarProps) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.primary",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 1 }}>
          <Box
            component={Link}
            href="/"
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                background: "var(--gradient-accent)",
                color: "white",
              }}
            >
              <AutoAwesomeRoundedIcon fontSize="small" />
            </Box>
            <Typography variant="h6" fontWeight={800}>
              FlashStudy AI
            </Typography>
          </Box>

          <NavbarLinks skipClerk={skipClerk} />
        </Toolbar>
      </Container>
    </AppBar>
  );
}
