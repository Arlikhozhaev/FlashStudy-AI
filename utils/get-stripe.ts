import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

export default function getStripe() {
  if (!stripePromise) {
    const publishableKey =
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;

    if (!publishableKey) {
      throw new Error("Missing Stripe publishable key");
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
}
