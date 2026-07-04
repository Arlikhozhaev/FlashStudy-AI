import { Container, Typography } from "@mui/material";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Typography variant="h3" align="center" gutterBottom>
        Welcome back
      </Typography>
      <Typography align="center" color="text.secondary" sx={{ mb: 4 }}>
        Sign in to generate flashcards and manage your decks.
      </Typography>
      <SignIn />
    </Container>
  );
}
