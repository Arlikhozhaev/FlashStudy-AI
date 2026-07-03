"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Box, Button, Typography } from "@mui/material";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unhandled UI error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "40vh",
            gap: 2,
            px: 2,
          }}
        >
          <Typography variant="h5">Something went wrong</Typography>
          <Typography color="text.secondary" align="center">
            An unexpected error occurred. Please refresh the page and try again.
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
