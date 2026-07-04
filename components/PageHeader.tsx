import { Box, Container, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <Box
      sx={{
        mb: 4,
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box>
        {eyebrow && (
          <Typography
            variant="overline"
            sx={{ color: "primary.main", fontWeight: 700, letterSpacing: 1.2 }}
          >
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h3" component="h1" gutterBottom>
          {title}
        </Typography>
        {description && (
          <Typography color="text.secondary" maxWidth={640}>
            {description}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}

export function PageContainer({
  children,
  maxWidth = "lg",
}: {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg";
}) {
  return (
    <Container maxWidth={maxWidth} sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, sm: 3 } }}>
      {children}
    </Container>
  );
}
