import Stripe from "stripe";
import { isPlanName, type PlanName } from "@/lib/plans";
import { upsertUserSubscription } from "@/lib/subscription";
import { getStripeClient } from "@/lib/stripe";

function mapStripeStatus(
  status: Stripe.Subscription.Status,
): "active" | "trialing" | "past_due" | "canceled" | "inactive" {
  switch (status) {
    case "active":
    case "trialing":
    case "past_due":
    case "canceled":
      return status;
    default:
      return "inactive";
  }
}

function resolvePlanName(
  metadataPlanName: string | null | undefined,
  priceId: string | null | undefined,
): PlanName | null {
  if (metadataPlanName && isPlanName(metadataPlanName)) {
    return metadataPlanName;
  }

  const priceMap: Record<string, PlanName> = {};

  if (process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID) {
    priceMap[process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID] = "Basic";
  }

  if (process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID) {
    priceMap[process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID] = "Standard";
  }

  if (process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID) {
    priceMap[process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID] = "Premium";
  }

  if (priceId && priceMap[priceId]) {
    return priceMap[priceId];
  }

  return null;
}

async function syncSubscription(
  userId: string,
  subscription: Stripe.Subscription,
  fallbackPlanName?: string | null,
) {
  const priceId = subscription.items.data[0]?.price.id ?? null;
  const plan =
    resolvePlanName(fallbackPlanName ?? subscription.metadata.planName, priceId) ??
    null;

  await upsertUserSubscription(userId, {
    plan,
    status: mapStripeStatus(subscription.status),
    stripeCustomerId:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id,
    stripeSubscriptionId: subscription.id,
    currentPeriodStart: new Date(
      subscription.current_period_start * 1000,
    ).toISOString(),
    currentPeriodEnd: new Date(
      subscription.current_period_end * 1000,
    ).toISOString(),
  });
}

export async function handleStripeEvent(event: Stripe.Event) {
  const stripe = getStripeClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId =
        session.client_reference_id ?? session.metadata?.userId ?? null;

      if (!userId || !session.subscription) {
        return;
      }

      const subscription = await stripe.subscriptions.retrieve(
        String(session.subscription),
      );

      await syncSubscription(
        userId,
        subscription,
        session.metadata?.planName ?? null,
      );
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata.userId ?? null;

      if (!userId) {
        return;
      }

      if (event.type === "customer.subscription.deleted") {
        await upsertUserSubscription(userId, {
          plan: null,
          status: "canceled",
          stripeCustomerId:
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer.id,
          stripeSubscriptionId: subscription.id,
          currentPeriodStart: new Date(
            subscription.current_period_start * 1000,
          ).toISOString(),
          currentPeriodEnd: new Date(
            subscription.current_period_end * 1000,
          ).toISOString(),
        });
        return;
      }

      await syncSubscription(userId, subscription, subscription.metadata.planName);
      break;
    }
    default:
      break;
  }
}
