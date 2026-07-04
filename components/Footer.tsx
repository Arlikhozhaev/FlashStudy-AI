import { Box, Container, Divider, Link, Typography } from "@mui/material";
import NextLink from "next/link";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 10,
        py: 5,
        borderTop: "1px solid",
        borderColor: "divider",
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(12px)",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            gap: 3,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={800} gutterBottom>
              FlashStudy AI
            </Typography>
            <Typography color="text.secondary" maxWidth={360}>
              AI-powered flashcards for students who want a polished, reliable
              study workflow.
            </Typography>
          </Box>

          <Box>
            <Typography fontWeight={700} gutterBottom>
              Product
            </Typography>
            <Box sx={{ display: "grid", gap: 1 }}>
              <Link component={NextLink} href="/generate" underline="hover">
                Generate
              </Link>
              <Link component={NextLink} href="/flashcards" underline="hover">
                My Decks
              </Link>
              <Link component={NextLink} href="/#pricing" underline="hover">
                Pricing
              </Link>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" color="text.secondary">
          Built for portfolio-grade SaaS engineering demos.
        </Typography>
      </Container>
    </Box>
  );
}
