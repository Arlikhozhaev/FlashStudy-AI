export type PlanName = "Basic" | "Standard" | "Premium";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "inactive";

export interface PlanDefinition {
  name: PlanName;
  price: number;
  monthlyFlashcardLimit: number | null;
  description: string;
  features: string[];
  highlighted?: boolean;
}

export interface UserSubscription {
  plan: PlanName | null;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
}

export interface UserUsage {
  periodStart: string | null;
  flashcardsGenerated: number;
}

export interface SubscriptionSummary {
  subscription: UserSubscription;
  usage: UserUsage;
  limit: number | null;
  remaining: number | null;
  canGenerate: boolean;
}

export const PLANS: Record<PlanName, PlanDefinition> = {
  Basic: {
    name: "Basic",
    price: 4.99,
    monthlyFlashcardLimit: 100,
    description: "Perfect for focused exam prep",
    features: [
      "Up to 100 flashcards per month",
      "AI-powered generation",
      "Access on any device",
      "Email support",
    ],
  },
  Standard: {
    name: "Standard",
    price: 7.99,
    monthlyFlashcardLimit: null,
    description: "Best for daily learners",
    highlighted: true,
    features: [
      "Unlimited flashcards",
      "Priority AI generation",
      "Deck organization",
      "Priority support",
    ],
  },
  Premium: {
    name: "Premium",
    price: 9.99,
    monthlyFlashcardLimit: null,
    description: "For power users and teams",
    features: [
      "Unlimited flashcards",
      "Fastest generation queue",
      "Advanced deck management",
      "Premium support",
    ],
  },
};

export const PLAN_NAMES = Object.keys(PLANS) as PlanName[];

export function isPlanName(value: string): value is PlanName {
  return PLAN_NAMES.includes(value as PlanName);
}

export function getPlanLimit(plan: PlanName | null): number | null {
  if (!plan) {
    return null;
  }

  return PLANS[plan].monthlyFlashcardLimit;
}

export function isActiveSubscription(status: SubscriptionStatus): boolean {
  return status === "active" || status === "trialing";
}
