"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import Link from "next/link";

export default function Navbar() {
  return (
    <AppBar position="static" sx={{ p: { xs: 1, sm: 2 } }}>
      <Container maxWidth="lg" disableGutters>
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              flexGrow: 1,
              fontSize: { xs: "1rem", sm: "1.25rem" },
              color: "inherit",
              textDecoration: "none",
            }}
          >
            FlashStudy AI
          </Typography>
          <SignedOut>
            <Button
              color="inherit"
              component={Link}
              href="/sign-in"
              sx={{ fontSize: { xs: "0.75rem", sm: "1rem" } }}
            >
              Login
            </Button>
            <Button
              color="inherit"
              component={Link}
              href="/sign-up"
              sx={{ fontSize: { xs: "0.75rem", sm: "1rem" } }}
            >
              Sign Up
            </Button>
          </SignedOut>
          <SignedIn>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Button color="inherit" component={Link} href="/generate">
                Generate
              </Button>
              <Button color="inherit" component={Link} href="/flashcards">
                My Decks
              </Button>
              <UserButton afterSignOutUrl="/" />
            </Box>
          </SignedIn>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
