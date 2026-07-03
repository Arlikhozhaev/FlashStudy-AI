import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { jsonError, jsonServerError } from "@/lib/api";
import { formatAmountForStripe, getStripeClient } from "@/lib/stripe";

const DEFAULT_PLAN = {
  name: "Premium",
  amount: 9.99,
};

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
    // Fall back to default plan when no body is provided.
  }

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
              name: body.planName ?? DEFAULT_PLAN.name,
            },
            unit_amount: formatAmountForStripe(DEFAULT_PLAN.amount),
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
      metadata: {
        userId,
        planName: body.planName ?? DEFAULT_PLAN.name,
      },
      success_url: `${origin}/result?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/result?session_id={CHECKOUT_SESSION_ID}`,
    });

    return NextResponse.json({ id: checkoutSession.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return jsonServerError("Unable to create checkout session");
  }
}
