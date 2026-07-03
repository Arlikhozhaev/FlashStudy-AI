import { Container, Typography } from "@mui/material";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Sign In
      </Typography>
      <SignIn />
    </Container>
  );
}
