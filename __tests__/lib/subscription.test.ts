import { describe, expect, it } from "vitest";
import { buildSubscriptionSummary } from "@/lib/subscription";
import type { UserSubscription, UserUsage } from "@/lib/plans";

const activeBasicSubscription: UserSubscription = {
  plan: "Basic",
  status: "active",
  stripeCustomerId: "cus_123",
  stripeSubscriptionId: "sub_123",
  currentPeriodStart: "2026-07-01T00:00:00.000Z",
  currentPeriodEnd: "2026-08-01T00:00:00.000Z",
};

describe("buildSubscriptionSummary", () => {
  it("blocks generation without an active subscription", () => {
    const summary = buildSubscriptionSummary(
      {
        plan: null,
        status: "inactive",
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
      },
      { periodStart: null, flashcardsGenerated: 0 },
    );

    expect(summary.canGenerate).toBe(false);
    expect(summary.limit).toBeNull();
  });

  it("enforces the Basic plan monthly limit", () => {
    const usage: UserUsage = {
      periodStart: "2026-07-01T00:00:00.000Z",
      flashcardsGenerated: 95,
    };

    const summary = buildSubscriptionSummary(activeBasicSubscription, usage);

    expect(summary.limit).toBe(100);
    expect(summary.remaining).toBe(5);
    expect(summary.canGenerate).toBe(true);
  });

  it("marks Basic plan as exhausted at the limit", () => {
    const usage: UserUsage = {
      periodStart: "2026-07-01T00:00:00.000Z",
      flashcardsGenerated: 100,
    };

    const summary = buildSubscriptionSummary(activeBasicSubscription, usage);

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
    );

    expect(summary.limit).toBeNull();
    expect(summary.remaining).toBeNull();
    expect(summary.canGenerate).toBe(true);
  });
});
