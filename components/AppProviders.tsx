"use client";

import { ClerkProvider } from "@clerk/nextjs";
import ErrorBoundary from "@/components/ErrorBoundary";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ThemeRegistry from "@/components/ThemeRegistry";
import type { ReactNode } from "react";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const skipClerk =
  process.env.NEXT_PUBLIC_SKIP_CLERK === "true" ||
  publishableKey.includes("placeholder");

export default function AppProviders({ children }: { children: ReactNode }) {
  const content = (
    <ThemeRegistry>
      <ErrorBoundary>
        <Navbar skipClerk={skipClerk} />
        <main>{children}</main>
        <Footer />
      </ErrorBoundary>
    </ThemeRegistry>
  );

  if (skipClerk) {
    return content;
  }

  return <ClerkProvider>{content}</ClerkProvider>;
}
