import HomePageClient from "@/components/HomePageClient";
import HomePageContent from "@/components/HomePageContent";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const skipClerk =
  process.env.NEXT_PUBLIC_SKIP_CLERK === "true" ||
  publishableKey.includes("placeholder");

export default function Home() {
  if (skipClerk) {
    return <HomePageContent />;
  }

  return <HomePageClient />;
}
