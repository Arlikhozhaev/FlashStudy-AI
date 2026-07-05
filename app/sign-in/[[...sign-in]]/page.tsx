import AuthShell from "@/components/AuthShell";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to generate flashcards and manage your decks."
    >
      <SignIn appearance={clerkAppearance} />
    </AuthShell>
  );
}
