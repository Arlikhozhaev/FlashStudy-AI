import type { Appearance } from "@clerk/types";

export const clerkAppearance: Appearance = {
  layout: {
    socialButtonsPlacement: "bottom",
    shimmer: false,
  },
  elements: {
    rootBox: {
      width: "100%",
      display: "flex",
      justifyContent: "center",
    },
    cardBox: {
      width: "100%",
      maxWidth: "440px",
      margin: "0 auto",
    },
    card: {
      width: "100%",
      boxShadow: "var(--shadow-soft)",
      border: "1px solid rgba(15, 23, 42, 0.08)",
    },
    headerTitle: {
      fontSize: "1.5rem",
      fontWeight: 700,
    },
    formButtonPrimary: {
      fontSize: "0.95rem",
      fontWeight: 600,
    },
  },
};
