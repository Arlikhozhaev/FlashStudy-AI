import AuthShell from "@/components/AuthShell";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Start your 7-day free trial with 2 AI generations per day. No credit card required to begin."
    >
      <SignUp appearance={clerkAppearance} />
    </AuthShell>
  );
}
