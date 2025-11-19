"use client";

import { loadStripe } from "@stripe/stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import { useState } from "react";

type CheckoutIntent = "checkout" | "portal";

async function callStripe(intent: CheckoutIntent, customerId?: string) {
  const response = await fetch("/api/stripe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intent, customerId }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error ?? "Unable to reach Stripe API route");
  }
  return response.json();
}

let stripePromise: Promise<Stripe | null> | null = null;
function getStripe() {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
    stripePromise = publishableKey ? loadStripe(publishableKey) : Promise.resolve(null);
  }
  return stripePromise;
}

export function SubscriptionPanel() {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const startCheckout = async () => {
    try {
      setLoading(true);
      const { url } = await callStripe("checkout");
      if (url) {
        window.location.href = url;
        return;
      }
      const stripe = await getStripe();
      if (!stripe) throw new Error("Stripe failed to load. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.");
      setStatus("Stripe session created. Redirecting...");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to start checkout");
    } finally {
      setLoading(false);
    }
  };

  const openPortal = async () => {
    try {
      setLoading(true);
      const { url } = await callStripe("portal", process.env.NEXT_PUBLIC_STRIPE_TEST_CUSTOMER_ID);
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to open billing portal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-orange-500">Billing</p>
      <h2 className="text-2xl font-bold text-zinc-900">Free vs. Pro</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Get unlimited rewrites, recruiter emails, headline ideas, and premium models with the $29/mo Pro plan. Free tier includes
        5 rewrites per week and basic GPT access.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
          <p className="text-xs font-semibold text-zinc-500">Free</p>
          <p className="mt-1 text-3xl font-bold text-zinc-900">$0</p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-600">
            <li>• 5 resume rewrites / week</li>
            <li>• Basic recruiter email suggestions</li>
            <li>• Export to Markdown</li>
          </ul>
          <button className="mt-4 w-full rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700">Included</button>
        </div>
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <p className="text-xs font-semibold text-orange-600">Pro</p>
          <p className="mt-1 text-3xl font-bold text-orange-600">$29<span className="text-base font-medium text-orange-500">/mo</span></p>
          <ul className="mt-3 space-y-2 text-sm text-orange-900">
            <li>• Unlimited rewrites</li>
            <li>• LinkedIn + recruiter templates</li>
            <li>• Custom GPT + data privacy controls</li>
          </ul>
          <div className="mt-4 space-y-2">
            <button
              onClick={startCheckout}
              disabled={loading}
              className="w-full rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-500 disabled:opacity-60"
            >
              {loading ? "Connecting..." : "Upgrade to Pro"}
            </button>
            <button
              onClick={openPortal}
              disabled={loading}
              className="w-full rounded-xl border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-600"
            >
              Manage subscription
            </button>
          </div>
        </div>
      </div>
      {status && <p className="mt-4 text-xs text-orange-700">{status}</p>}
    </section>
  );
}
