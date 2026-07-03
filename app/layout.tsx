import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import ErrorBoundary from "@/components/ErrorBoundary";
import Navbar from "@/components/Navbar";
import ThemeRegistry from "@/components/ThemeRegistry";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "FlashStudy AI",
    template: "%s | FlashStudy AI",
  },
  description:
    "AI-powered flashcard SaaS for turning study notes into effective review decks.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ThemeRegistry>
            <ErrorBoundary>
              <Navbar />
              {children}
            </ErrorBoundary>
          </ThemeRegistry>
        </body>
      </html>
    </ClerkProvider>
  );
}
