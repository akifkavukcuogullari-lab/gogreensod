import "server-only";

import type Stripe from "stripe";

import { isVarietyKey, type VarietyKey } from "@/lib/catalog";
import { getVarieties } from "@/lib/catalog.server";
import { formatDeliveryDate, isTestZone, normalizeZip } from "@/lib/delivery";
import { centsToDollars } from "@/lib/pricing";
import { getWriteClient } from "@/sanity/lib/writeClient";

/** A Checkout Session as it arrives in a webhook event. */
export type CheckoutSession = Omit<
  Awaited<ReturnType<Stripe["checkout"]["sessions"]["retrieve"]>>,
  "lastResponse"
>;

interface OrderMetadata {
  zip: string;
  zone: string;
  deliveryDate: string;
  lines: { key: VarietyKey; pallets: number; unitCents: number }[];
  sodCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  totalPallets: number;
}

/**
 * Reads back what /api/checkout wrote into the session metadata.
 *
 * Returns null rather than guessing if anything is malformed. Metadata is set by
 * our own server, so this should never fail — but the payment has already been
 * taken by the time it is read, and a half-parsed order is worse than one that
 * is plainly flagged for a human.
 */
function readMetadata(metadata: Record<string, string> | null): OrderMetadata | null {
  const m = metadata ?? {};

  let raw: unknown;
  try {
    raw = JSON.parse(m.items ?? "");
  } catch {
    return null;
  }
  if (!Array.isArray(raw)) return null;

  const lines = raw.flatMap((entry) =>
    Array.isArray(entry) &&
    isVarietyKey(entry[0]) &&
    Number.isInteger(entry[1]) &&
    Number.isInteger(entry[2])
      ? [{ key: entry[0], pallets: entry[1] as number, unitCents: entry[2] as number }]
      : [],
  );

  const ints = ["sodCents", "deliveryFeeCents", "totalCents", "totalPallets"].map(
    (k) => Number(m[k]),
  );
  if (!lines.length || !ints.every(Number.isInteger) || !m.zip || !m.deliveryDate) {
    return null;
  }

  const [sodCents, deliveryFeeCents, totalCents, totalPallets] = ints;
  return {
    zip: m.zip,
    zone: m.zone ?? "",
    deliveryDate: m.deliveryDate,
    lines,
    sodCents,
    deliveryFeeCents,
    totalCents,
    totalPallets,
  };
}

function formatAddress(address: Stripe.Address | null | undefined): string | undefined {
  if (!address) return undefined;
  const cityLine = [address.city, [address.state, address.postal_code].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  const text = [address.line1, address.line2, cityLine].filter(Boolean).join("\n");
  return text || undefined;
}

/** Drops undefined and null so the order document carries no empty fields. */
function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null),
  ) as Partial<T>;
}

/**
 * Records a paid Checkout Session as an `order` document.
 *
 * Idempotent by construction: the document id is derived from the session id and
 * written with createIfNotExists, so Stripe retrying the webhook cannot create a
 * duplicate — and cannot overwrite a status the client has already changed.
 *
 * Throws only on a real write failure, so the webhook answers 500 and Stripe
 * retries. With no write token configured it logs and returns, because the
 * payment itself is safe in Stripe and failing would retry forever.
 */
export async function recordPaidSession(
  session: CheckoutSession,
  paidAtUnix: number,
): Promise<{ recorded: boolean; needsReview: string[] }> {
  const meta = readMetadata(session.metadata);
  const shipping = session.collected_information?.shipping_details ?? null;
  const customer = session.customer_details ?? null;
  const needsReview: string[] = [];

  if (!meta) {
    needsReview.push(
      "The order details could not be read from the payment. Open this payment in the Stripe Dashboard to see what was bought.",
    );
  } else {
    const shippedZip = normalizeZip(shipping?.address?.postal_code ?? "");
    if (shippedZip && shippedZip !== meta.zip) {
      needsReview.push(
        `The delivery address is in ZIP ${shippedZip}, but the delivery fee was priced for ZIP ${meta.zip}. Confirm the fee before cutting.`,
      );
    }
    if (session.amount_total !== null && session.amount_total !== meta.totalCents) {
      needsReview.push(
        `Amount paid (${centsToDollars(session.amount_total)}) does not match the order total (${centsToDollars(meta.totalCents)}).`,
      );
    }
    if (meta.zone && isTestZone({ name: meta.zone })) {
      needsReview.push(
        `Priced with the placeholder delivery zone "${meta.zone}". Replace the TEST zones in Site settings before taking real orders.`,
      );
    }
  }

  const writer = getWriteClient();
  if (!writer) {
    console.info(
      `[order] paid session ${session.id} (${session.livemode ? "live" : "test"}), not recorded in Sanity: SANITY_API_WRITE_TOKEN is not set`,
    );
    return { recorded: false, needsReview };
  }

  const names = new Map((await getVarieties()).map((v) => [v.key, v.name]));
  const paymentIntent = session.payment_intent;

  const doc = compact({
    _id: `order-${session.id}`,
    _type: "order",
    status: "new",
    needsReview: needsReview.length ? needsReview : undefined,
    deliveryDate: meta?.deliveryDate,
    customerName: shipping?.name || customer?.name || undefined,
    email: customer?.email ?? undefined,
    phone: customer?.phone ?? undefined,
    deliveryAddress: formatAddress(shipping?.address ?? customer?.address),
    zip: meta?.zip,
    zoneName: meta?.zone || undefined,
    items: meta?.lines.map((line) => ({
      _key: line.key,
      _type: "orderLine",
      varietyKey: line.key,
      name: names.get(line.key) ?? line.key,
      pallets: line.pallets,
      unitPrice: line.unitCents / 100,
    })),
    totalPallets: meta?.totalPallets,
    sodSubtotal: meta ? meta.sodCents / 100 : undefined,
    deliveryFee: meta ? meta.deliveryFeeCents / 100 : undefined,
    total: session.amount_total !== null ? session.amount_total / 100 : undefined,
    stripeSessionId: session.id,
    stripePaymentIntentId:
      typeof paymentIntent === "string" ? paymentIntent : paymentIntent?.id,
    livemode: session.livemode,
    paidAt: new Date(paidAtUnix * 1000).toISOString(),
  });

  await writer.createIfNotExists(doc as { _id: string; _type: string });

  console.info(
    `[order] recorded order-${session.id}: ${meta?.totalPallets ?? "?"} pallets for ${
      meta ? formatDeliveryDate(meta.deliveryDate) : "unknown date"
    }${needsReview.length ? ` — ${needsReview.length} item(s) to review` : ""}`,
  );
  return { recorded: true, needsReview };
}
