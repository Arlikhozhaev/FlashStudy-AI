import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  createTrialWindow,
  getPlanLimit,
  getTrialDaysRemaining,
  getUtcDateKey,
  isActiveSubscription,
  isTrialActive,
  TRIAL_DAILY_GENERATION_LIMIT,
  type DailyUsage,
  type PlanName,
  type SubscriptionStatus,
  type SubscriptionSummary,
  type UserSubscription,
  type UserTrial,
  type UserUsage,
} from "@/lib/plans";

const DEFAULT_SUBSCRIPTION: UserSubscription = {
  plan: null,
  status: "inactive",
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  currentPeriodStart: null,
  currentPeriodEnd: null,
};

const DEFAULT_USAGE: UserUsage = {
  periodStart: null,
  flashcardsGenerated: 0,
};

const DEFAULT_DAILY_USAGE: DailyUsage = {
  date: getUtcDateKey(),
  generationsUsed: 0,
};

function timestampToIso(value: unknown): string | null {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return null;
}

function normalizeSubscription(
  data: FirebaseFirestore.DocumentData | undefined,
): UserSubscription {
  const subscription = data?.subscription ?? {};

  return {
    plan: subscription.plan ?? null,
    status: subscription.status ?? "inactive",
    stripeCustomerId: subscription.stripeCustomerId ?? null,
    stripeSubscriptionId: subscription.stripeSubscriptionId ?? null,
    currentPeriodStart: timestampToIso(subscription.currentPeriodStart),
    currentPeriodEnd: timestampToIso(subscription.currentPeriodEnd),
  };
}

function normalizeTrial(
  data: FirebaseFirestore.DocumentData | undefined,
): UserTrial | null {
  const trial = data?.trial;

  if (!trial?.startedAt || !trial?.endsAt) {
    return null;
  }

  return {
    startedAt: timestampToIso(trial.startedAt) ?? String(trial.startedAt),
    endsAt: timestampToIso(trial.endsAt) ?? String(trial.endsAt),
  };
}

function normalizeUsage(
  data: FirebaseFirestore.DocumentData | undefined,
  subscription: UserSubscription,
): UserUsage {
  const usage = data?.usage ?? DEFAULT_USAGE;
  const periodStart = usage.periodStart ?? null;

  if (
    subscription.currentPeriodStart &&
    periodStart !== subscription.currentPeriodStart
  ) {
    return {
      periodStart: subscription.currentPeriodStart,
      flashcardsGenerated: 0,
    };
  }

  return {
    periodStart,
    flashcardsGenerated: usage.flashcardsGenerated ?? 0,
  };
}

function normalizeDailyUsage(
  data: FirebaseFirestore.DocumentData | undefined,
  now = new Date(),
): DailyUsage {
  const dailyUsage = data?.dailyUsage ?? DEFAULT_DAILY_USAGE;
  const today = getUtcDateKey(now);

  if (dailyUsage.date !== today) {
    return {
      date: today,
      generationsUsed: 0,
    };
  }

  return {
    date: today,
    generationsUsed: dailyUsage.generationsUsed ?? 0,
  };
}

export function buildSubscriptionSummary(
  subscription: UserSubscription,
  usage: UserUsage,
  trial: UserTrial | null,
  dailyUsage: DailyUsage,
  now = new Date(),
): SubscriptionSummary {
  const hasPaidPlan =
    isActiveSubscription(subscription.status) && subscription.plan !== null;

  if (hasPaidPlan) {
    const limit = getPlanLimit(subscription.plan);
    const remaining =
      limit === null ? null : Math.max(limit - usage.flashcardsGenerated, 0);

    return {
      accessMode: "subscription",
      subscription,
      trial,
      usage,
      dailyUsage,
      limit,
      remaining,
      canGenerate: limit === null || usage.flashcardsGenerated < limit,
      trialDaysRemaining: null,
    };
  }

  if (isTrialActive(trial, now)) {
    const today = getUtcDateKey(now);
    const generationsToday =
      dailyUsage.date === today ? dailyUsage.generationsUsed : 0;
    const remaining = Math.max(
      TRIAL_DAILY_GENERATION_LIMIT - generationsToday,
      0,
    );

    return {
      accessMode: "free_trial",
      subscription,
      trial,
      usage,
      dailyUsage: {
        date: today,
        generationsUsed: generationsToday,
      },
      limit: TRIAL_DAILY_GENERATION_LIMIT,
      remaining,
      canGenerate: remaining > 0,
      trialDaysRemaining: getTrialDaysRemaining(trial, now),
    };
  }

  return {
    accessMode: "expired",
    subscription,
    trial,
    usage,
    dailyUsage,
    limit: null,
    remaining: null,
    canGenerate: false,
    trialDaysRemaining: 0,
  };
}

async function ensureUserTrial(userId: string): Promise<void> {
  const db = getAdminDb();
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();
  const subscription = normalizeSubscription(userDoc.data());

  if (isActiveSubscription(subscription.status) && subscription.plan) {
    return;
  }

  const existingTrial = normalizeTrial(userDoc.data());
  if (existingTrial) {
    return;
  }

  await userRef.set(
    {
      trial: createTrialWindow(),
      dailyUsage: DEFAULT_DAILY_USAGE,
    },
    { merge: true },
  );
}

export async function getUserSubscriptionSummary(
  userId: string,
): Promise<SubscriptionSummary> {
  await ensureUserTrial(userId);

  const db = getAdminDb();
  const userDoc = await db.collection("users").doc(userId).get();
  const subscription = normalizeSubscription(userDoc.data());
  const trial = normalizeTrial(userDoc.data());
  const usage = normalizeUsage(userDoc.data(), subscription);
  const dailyUsage = normalizeDailyUsage(userDoc.data());

  return buildSubscriptionSummary(subscription, usage, trial, dailyUsage);
}

export async function assertCanGenerate(
  userId: string,
  flashcardsRequested: number,
): Promise<SubscriptionSummary> {
  const summary = await getUserSubscriptionSummary(userId);

  if (summary.accessMode === "subscription") {
    const { subscription, usage, limit } = summary;

    if (limit !== null && usage.flashcardsGenerated + flashcardsRequested > limit) {
      throw new SubscriptionError(
        `Monthly limit reached. Your ${subscription.plan} plan includes ${limit} flashcards per billing period.`,
        429,
        summary,
      );
    }

    return summary;
  }

  if (summary.accessMode === "free_trial") {
    if ((summary.remaining ?? 0) <= 0) {
      throw new SubscriptionError(
        `Daily trial limit reached. You can generate up to ${TRIAL_DAILY_GENERATION_LIMIT} decks per day during your free trial.`,
        429,
        summary,
      );
    }

    return summary;
  }

  throw new SubscriptionError(
    "Your 7-day free trial has ended. Subscribe to continue generating flashcards.",
    402,
    summary,
  );
}

export async function recordGenerationUsage(
  userId: string,
  flashcardsGenerated: number,
  summary: SubscriptionSummary,
): Promise<void> {
  const db = getAdminDb();
  const userRef = db.collection("users").doc(userId);

  if (summary.accessMode === "free_trial") {
    const today = getUtcDateKey();
    const currentCount =
      summary.dailyUsage.date === today
        ? summary.dailyUsage.generationsUsed
        : 0;

    await userRef.set(
      {
        dailyUsage: {
          date: today,
          generationsUsed: currentCount + 1,
        },
      },
      { merge: true },
    );
    return;
  }

  if (summary.accessMode === "subscription") {
    const userDoc = await userRef.get();
    const subscription = normalizeSubscription(userDoc.data());
    const currentUsage = normalizeUsage(userDoc.data(), subscription);
    const periodStart = summary.subscription.currentPeriodStart;

    if (periodStart && currentUsage.periodStart !== periodStart) {
      await userRef.set(
        {
          usage: {
            periodStart,
            flashcardsGenerated,
          },
        },
        { merge: true },
      );
      return;
    }

    await userRef.set(
      {
        usage: {
          periodStart,
          flashcardsGenerated: FieldValue.increment(flashcardsGenerated),
        },
      },
      { merge: true },
    );
  }
}

export async function upsertUserSubscription(
  userId: string,
  subscription: Partial<UserSubscription> & {
    plan: PlanName | null;
    status: SubscriptionStatus;
  },
): Promise<void> {
  const db = getAdminDb();
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();
  const existingSubscription = normalizeSubscription(userDoc.data());
  const nextPeriodStart = subscription.currentPeriodStart ?? null;

  const shouldResetUsage =
    nextPeriodStart !== null &&
    nextPeriodStart !== existingSubscription.currentPeriodStart;

  await userRef.set(
    {
      subscription: {
        ...existingSubscription,
        ...subscription,
        currentPeriodStart: nextPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd ?? null,
      },
      ...(shouldResetUsage
        ? {
            usage: {
              periodStart: nextPeriodStart,
              flashcardsGenerated: 0,
            },
          }
        : {}),
    },
    { merge: true },
  );
}

export class SubscriptionError extends Error {
  status: number;
  summary: SubscriptionSummary;

  constructor(message: string, status: number, summary: SubscriptionSummary) {
    super(message);
    this.name = "SubscriptionError";
    this.status = status;
    this.summary = summary;
  }
}

// Backward-compatible alias used by older imports.
export const recordFlashcardUsage = recordGenerationUsage;
