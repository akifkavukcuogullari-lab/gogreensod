import { type NextRequest, NextResponse } from "next/server";

import { recordPaidSession } from "@/lib/checkout/record.server";
import { isStripeConfigured, serverEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook.
 *
 * Configure in the Stripe Dashboard → Developers → Webhooks:
 *   URL:     https://<site>/api/stripe/webhook
 *   Events:  checkout.session.completed
 *            checkout.session.async_payment_succeeded
 *   Secret:  STRIPE_WEBHOOK_SECRET (a different one per endpoint)
 *
 * The signature is verified against the raw request body before anything is
 * trusted. Responses follow Stripe's retry semantics: 400 for a request that
 * will never be valid, 500 for a failure worth retrying, 200 once handled.
 */
export async function POST(req: NextRequest) {
  const secret = isStripeConfigured() ? serverEnv().STRIPE_WEBHOOK_SECRET : undefined;
  if (!secret) {
    console.error("[stripe-webhook] Stripe or STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Byte for byte. Parsing to JSON first and re-serialising would change the
  // body and every legitimate signature would fail.
  const payload = await req.text();

  let event: ReturnType<ReturnType<typeof getStripe>["webhooks"]["constructEvent"]>;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.warn(
      "[stripe-webhook] signature verification failed:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      // A card payment arrives as `completed` with payment_status "paid". A
      // delayed method (bank debit) arrives as `completed` + "unpaid", then as
      // `async_payment_succeeded` once the money lands — so both are handled,
      // and only a paid session is ever recorded.
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        if (session.payment_status !== "paid") {
          return NextResponse.json({ received: true, recorded: false, reason: "not paid yet" });
        }
        const result = await recordPaidSession(session, event.created);
        return NextResponse.json({ received: true, ...result });
      }
      default:
        // Acknowledge anything else so Stripe does not retry it.
        return NextResponse.json({ received: true, ignored: event.type });
    }
  } catch (error) {
    console.error(`[stripe-webhook] failed handling ${event.type} ${event.id}`, error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
