import { Container, Typography } from "@mui/material";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Sign Up
      </Typography>
      <SignUp />
    </Container>
  );
}
