import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AppProviders from "@/components/AppProviders";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "FlashStudy AI",
    template: "%s | FlashStudy AI",
  },
  description:
    "AI-powered flashcard SaaS with subscription tiers, secure backend architecture, and polished study workflows.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
