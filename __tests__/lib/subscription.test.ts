import { describe, expect, it } from "vitest";
import { buildSubscriptionSummary } from "@/lib/subscription";
import {
  TRIAL_DAILY_GENERATION_LIMIT,
  type DailyUsage,
  type UserSubscription,
  type UserTrial,
  type UserUsage,
} from "@/lib/plans";

const activeBasicSubscription: UserSubscription = {
  plan: "Basic",
  status: "active",
  stripeCustomerId: "cus_123",
  stripeSubscriptionId: "sub_123",
  currentPeriodStart: "2026-07-01T00:00:00.000Z",
  currentPeriodEnd: "2026-08-01T00:00:00.000Z",
};

const activeTrial: UserTrial = {
  startedAt: "2026-07-01T00:00:00.000Z",
  endsAt: "2026-07-08T00:00:00.000Z",
};

const expiredTrial: UserTrial = {
  startedAt: "2026-06-01T00:00:00.000Z",
  endsAt: "2026-06-08T00:00:00.000Z",
};

const emptyUsage: UserUsage = {
  periodStart: null,
  flashcardsGenerated: 0,
};

const emptyDailyUsage: DailyUsage = {
  date: "2026-07-03",
  generationsUsed: 0,
};

const now = new Date("2026-07-03T12:00:00.000Z");

describe("buildSubscriptionSummary", () => {
  it("allows active free trial users with remaining daily generations", () => {
    const summary = buildSubscriptionSummary(
      {
        plan: null,
        status: "inactive",
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
      },
      emptyUsage,
      activeTrial,
      emptyDailyUsage,
      now,
    );

    expect(summary.accessMode).toBe("free_trial");
    expect(summary.canGenerate).toBe(true);
    expect(summary.limit).toBe(TRIAL_DAILY_GENERATION_LIMIT);
    expect(summary.remaining).toBe(2);
    expect(summary.trialDaysRemaining).toBe(5);
  });

  it("blocks free trial users after daily generation limit", () => {
    const summary = buildSubscriptionSummary(
      {
        plan: null,
        status: "inactive",
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
      },
      emptyUsage,
      activeTrial,
      { date: "2026-07-03", generationsUsed: 2 },
      now,
    );

    expect(summary.accessMode).toBe("free_trial");
    expect(summary.canGenerate).toBe(false);
    expect(summary.remaining).toBe(0);
  });

  it("requires subscription after trial expires", () => {
    const summary = buildSubscriptionSummary(
      {
        plan: null,
        status: "inactive",
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
      },
      emptyUsage,
      expiredTrial,
      emptyDailyUsage,
      now,
    );

    expect(summary.accessMode).toBe("expired");
    expect(summary.canGenerate).toBe(false);
    expect(summary.trialDaysRemaining).toBe(0);
  });

  it("enforces the Basic plan monthly limit", () => {
    const usage: UserUsage = {
      periodStart: "2026-07-01T00:00:00.000Z",
      flashcardsGenerated: 95,
    };

    const summary = buildSubscriptionSummary(
      activeBasicSubscription,
      usage,
      activeTrial,
      emptyDailyUsage,
      now,
    );

    expect(summary.accessMode).toBe("subscription");
    expect(summary.limit).toBe(100);
    expect(summary.remaining).toBe(5);
    expect(summary.canGenerate).toBe(true);
  });

  it("marks Basic plan as exhausted at the limit", () => {
    const usage: UserUsage = {
      periodStart: "2026-07-01T00:00:00.000Z",
      flashcardsGenerated: 100,
    };

    const summary = buildSubscriptionSummary(
      activeBasicSubscription,
      usage,
      activeTrial,
      emptyDailyUsage,
      now,
    );

    expect(summary.remaining).toBe(0);
    expect(summary.canGenerate).toBe(false);
  });

  it("allows unlimited generation for Standard plans", () => {
    const summary = buildSubscriptionSummary(
      {
        ...activeBasicSubscription,
        plan: "Standard",
      },
      {
        periodStart: "2026-07-01T00:00:00.000Z",
        flashcardsGenerated: 500,
      },
      activeTrial,
      emptyDailyUsage,
      now,
    );

    expect(summary.accessMode).toBe("subscription");
    expect(summary.limit).toBeNull();
    expect(summary.remaining).toBeNull();
    expect(summary.canGenerate).toBe(true);
  });
});
