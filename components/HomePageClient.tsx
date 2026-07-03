"use client";

import HomePageContent from "@/components/HomePageContent";
import getStripe from "@/utils/get-stripe";
import type { PlanName } from "@/lib/plans";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomePageClient() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<PlanName | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckout = async (planName: PlanName) => {
    if (!isSignedIn) {
      router.push("/sign-up");
      return;
    }

    setCheckoutError(null);
    setLoadingPlan(planName);

    try {
      const checkoutSession = await fetch("/api/checkout_sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planName }),
      });

      const checkoutSessionJson = await checkoutSession.json();

      if (!checkoutSession.ok) {
        throw new Error(
          checkoutSessionJson.error ?? "Unable to start checkout session",
        );
      }

      const stripe = await getStripe();
      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: checkoutSessionJson.id,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Checkout failed";
      setCheckoutError(message);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <HomePageContent
      isSignedIn={isSignedIn}
      loadingPlan={loadingPlan}
      checkoutError={checkoutError}
      onCheckout={handleCheckout}
    />
  );
}
