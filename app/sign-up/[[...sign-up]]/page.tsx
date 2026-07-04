import { Container, Typography } from "@mui/material";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Typography variant="h3" align="center" gutterBottom>
        Create your account
      </Typography>
      <Typography align="center" color="text.secondary" sx={{ mb: 4 }}>
        Start your 7-day free trial with 2 AI generations per day. No credit
        card required to begin.
      </Typography>
      <SignUp />
    </Container>
  );
}
