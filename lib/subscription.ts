import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  getPlanLimit,
  isActiveSubscription,
  type PlanName,
  type SubscriptionStatus,
  type SubscriptionSummary,
  type UserSubscription,
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

function timestampToIso(value: unknown): string | null {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return null;
}

function normalizeSubscription(data: FirebaseFirestore.DocumentData | undefined): UserSubscription {
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

export function buildSubscriptionSummary(
  subscription: UserSubscription,
  usage: UserUsage,
): SubscriptionSummary {
  const active = isActiveSubscription(subscription.status);
  const limit = active ? getPlanLimit(subscription.plan) : null;
  const remaining =
    limit === null ? null : Math.max(limit - usage.flashcardsGenerated, 0);

  return {
    subscription,
    usage,
    limit,
    remaining,
    canGenerate: active && (limit === null || usage.flashcardsGenerated < limit),
  };
}

export async function getUserSubscriptionSummary(
  userId: string,
): Promise<SubscriptionSummary> {
  const db = getAdminDb();
  const userDoc = await db.collection("users").doc(userId).get();
  const subscription = normalizeSubscription(userDoc.data());
  const usage = normalizeUsage(userDoc.data(), subscription);

  return buildSubscriptionSummary(subscription, usage);
}

export async function assertCanGenerate(
  userId: string,
  flashcardsRequested: number,
): Promise<SubscriptionSummary> {
  const summary = await getUserSubscriptionSummary(userId);
  const { subscription, usage, limit } = summary;

  if (!isActiveSubscription(subscription.status) || !subscription.plan) {
    throw new SubscriptionError(
      "An active subscription is required to generate flashcards.",
      402,
      summary,
    );
  }

  if (limit !== null && usage.flashcardsGenerated + flashcardsRequested > limit) {
    throw new SubscriptionError(
      `Monthly limit reached. Your ${subscription.plan} plan includes ${limit} flashcards per billing period.`,
      429,
      summary,
    );
  }

  return summary;
}

export async function recordFlashcardUsage(
  userId: string,
  flashcardsGenerated: number,
  periodStart: string | null,
): Promise<void> {
  const db = getAdminDb();
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();
  const subscription = normalizeSubscription(userDoc.data());
  const currentUsage = normalizeUsage(userDoc.data(), subscription);

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
