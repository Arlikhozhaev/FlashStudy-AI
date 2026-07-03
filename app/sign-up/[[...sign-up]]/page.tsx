import { Container, Typography } from "@mui/material";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Typography variant="h3" align="center" gutterBottom>
        Create your account
      </Typography>
      <Typography align="center" color="text.secondary" sx={{ mb: 4 }}>
        Start with a subscription plan and unlock AI flashcard generation.
      </Typography>
      <SignUp />
    </Container>
  );
}
