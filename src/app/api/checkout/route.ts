import { type NextRequest, NextResponse } from "next/server";

import { BUSINESS } from "@/lib/business";
import { SQ_FT_PER_PALLET } from "@/lib/catalog";
import { priceOrder } from "@/lib/checkout/price.server";
import {
  checkoutRequestSchema,
  type CheckoutResponse,
} from "@/lib/checkout/request";
import { isLiveStripe, isStripeConfigured } from "@/lib/env";
import { getStripe } from "@/lib/stripe.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * How long a Checkout Session stays payable.
 *
 * Short on purpose. The price, delivery fee and delivery date were all validated
 * a moment ago; a session left open for the default 24 hours could be paid after
 * the client changed a price or the date slipped inside the lead time.
 */
const SESSION_LIFETIME_SECONDS = 60 * 60;

const respond = (body: CheckoutResponse, status: number) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

/**
 * Starts a Stripe Checkout Session.
 *
 * The request carries choices only. Every amount below comes from
 * `priceOrder`, which re-reads the catalog and Site settings on the server —
 * the browser's own totals are never consulted.
 */
export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return respond(
      {
        error: `Online checkout is not open yet. Call ${BUSINESS.phone} to order.`,
        field: "ordering",
      },
      503,
    );
  }

  const parsed = checkoutRequestSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) {
    return respond(
      {
        error: "That order could not be read. Refresh your cart and try again.",
        field: "request",
      },
      400,
    );
  }

  const priced = await priceOrder(parsed.data);
  if (!priced.ok) {
    return respond({ error: priced.error, field: priced.field }, priced.status);
  }
  const { order } = priced;

  // A placeholder zone must never price a real payment. Test keys are fine —
  // that is what the TEST zones are for.
  if (isLiveStripe() && order.usesTestZone) {
    console.error(
      `[checkout] refused: live Stripe key with placeholder zone "${order.zoneName}"`,
    );
    return respond(
      {
        error: `Online checkout is unavailable right now. Call ${BUSINESS.phone} to order.`,
        field: "ordering",
      },
      503,
    );
  }

  // The request's own origin, so localhost, previews and production each
  // return the customer to the site they started on.
  const origin = req.nextUrl.origin;

  const deliveryLine =
    order.deliveryFeeCents > 0
      ? [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: order.deliveryFeeCents,
              product_data: {
                name: `Delivery to ${order.zip}`,
                description: `${order.deliveryDateLabel}, from ${BUSINESS.deliveryWindow}`,
              },
            },
          },
        ]
      : [];

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        ...order.lines.map((line) => ({
          quantity: line.pallets,
          price_data: {
            currency: "usd",
            unit_amount: line.unitCents,
            product_data: {
              name: `${line.name} sod, per pallet`,
              description: `One pallet covers ${SQ_FT_PER_PALLET} sq ft. Cut the day it ships.`,
            },
          },
        })),
        ...deliveryLine,
      ],
      // The client wanted customers searchable in the Stripe Dashboard.
      customer_creation: "always",
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ["US"] },
      custom_text: {
        shipping_address: {
          message: `Delivery was priced for ZIP ${order.zip}. Use a delivery address in that ZIP, or call ${BUSINESS.phone} first.`,
        },
        submit: {
          message: `Delivered overnight ${order.deliveryDateLabel}, from ${BUSINESS.deliveryWindow}. Refund requests are accepted within ${BUSINESS.policy.refundWindowDays} days of purchase.`,
        },
      },
      // Everything the webhook needs to record the order without re-pricing it.
      // Values are strings and each stays well under Stripe's 500 character cap.
      metadata: {
        zip: order.zip,
        zone: order.zoneName ?? "",
        deliveryDate: order.deliveryDate,
        items: JSON.stringify(
          order.lines.map((l) => [l.key, l.pallets, l.unitCents]),
        ),
        sodCents: String(order.sodCents),
        deliveryFeeCents: String(order.deliveryFeeCents),
        totalCents: String(order.totalCents),
        totalPallets: String(order.totalPallets),
      },
      payment_intent_data: {
        description: `Go Green Sod: ${order.totalPallets} pallets, delivery ${order.deliveryDate} to ${order.zip}`,
        metadata: { zip: order.zip, deliveryDate: order.deliveryDate },
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart?cancelled=1`,
      expires_at: Math.floor(Date.now() / 1000) + SESSION_LIFETIME_SECONDS,
    });

    if (!session.url) throw new Error("Checkout Session has no URL");
    return respond({ url: session.url }, 200);
  } catch (error) {
    console.error("[checkout] could not create Checkout Session", error);
    return respond(
      {
        error: `We could not start checkout. Please try again, or call ${BUSINESS.phone}.`,
        field: "request",
      },
      502,
    );
  }
}
