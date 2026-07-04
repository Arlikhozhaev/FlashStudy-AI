import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { jsonError, jsonServerError } from "@/lib/api";
import { isPlanName, PLANS, type PlanName } from "@/lib/plans";
import { formatAmountForStripe, getStripeClient } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return jsonError("Missing session_id");
  }

  try {
    const stripe = getStripeClient();
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    return NextResponse.json(checkoutSession);
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    return jsonServerError("Unable to retrieve checkout session");
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return jsonError("Unauthorized", 401);
  }

  let body: { priceId?: string; planName?: string } = {};

  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  if (!body.planName || !isPlanName(body.planName)) {
    return jsonError("A valid planName is required");
  }

  const planName = body.planName as PlanName;
  const plan = PLANS[planName];
  const origin = req.headers.get("origin");

  if (!origin) {
    return jsonError("Missing origin header");
  }

  try {
    const stripe = getStripeClient();

    const lineItem = body.priceId
      ? { price: body.priceId, quantity: 1 }
      : {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${plan.name} Subscription`,
              description: plan.description,
            },
            unit_amount: formatAmountForStripe(plan.price),
            recurring: {
              interval: "month" as const,
              interval_count: 1,
            },
          },
          quantity: 1,
        };

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [lineItem],
      client_reference_id: userId,
      subscription_data: {
        metadata: {
          userId,
          planName,
        },
      },
      metadata: {
        userId,
        planName,
      },
      success_url: `${origin}/result?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=canceled`,
    });

    return NextResponse.json({ id: checkoutSession.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return jsonServerError("Unable to create checkout session");
  }
}
