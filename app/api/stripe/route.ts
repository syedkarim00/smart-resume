import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const proPriceId = process.env.STRIPE_PRO_PRICE_ID ?? process.env.STRIPE_PRICE_ID;

type StripeRequest = {
  intent?: "checkout" | "portal";
  customerId?: string;
  successUrl?: string;
  cancelUrl?: string;
};

export async function POST(request: NextRequest) {
  if (!stripeSecretKey) {
    return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
  }
  if (!proPriceId) {
    return NextResponse.json({ error: "Missing STRIPE_PRO_PRICE_ID or STRIPE_PRICE_ID" }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" });

  let body: StripeRequest;
  try {
    body = (await request.json()) as StripeRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { intent, customerId, successUrl, cancelUrl } = body;

  if (intent === "portal") {
    if (!customerId) {
      return NextResponse.json({ error: "customerId is required to open the portal" }, { status: 400 });
    }
    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: successUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://smart-resume.pages.dev",
      });
      return NextResponse.json({ url: portalSession.url });
    } catch (error) {
      console.error("Stripe portal error", error);
      return NextResponse.json({ error: "Unable to create billing portal session" }, { status: 500 });
    }
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: proPriceId, quantity: 1 }],
      success_url:
        successUrl ?? `${process.env.NEXT_PUBLIC_APP_URL ?? "https://smart-resume.pages.dev"}/billing?status=success`,
      cancel_url: cancelUrl ?? `${process.env.NEXT_PUBLIC_APP_URL ?? "https://smart-resume.pages.dev"}/billing?status=cancelled`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error", error);
    return NextResponse.json({ error: "Unable to create checkout session" }, { status: 500 });
  }
}
