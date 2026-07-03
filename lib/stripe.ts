import Stripe from "stripe";
import { getServerEnv } from "@/lib/env";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    const { STRIPE_SECRET_KEY } = getServerEnv();
    stripeClient = new Stripe(STRIPE_SECRET_KEY);
  }

  return stripeClient;
}

export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100);
}
