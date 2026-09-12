import "server-only";

import { BUSINESS } from "@/lib/business";
import { MIN_PALLETS_TOTAL, VARIETY_KEYS, type VarietyKey } from "@/lib/catalog";
import { getVarieties } from "@/lib/catalog.server";
import {
  checkDeliveryDate,
  formatDeliveryDate,
  isTestZone,
  quoteDelivery,
} from "@/lib/delivery";
import { meetsMinimum, totalPallets } from "@/lib/pricing";
import { getDeliverySettings } from "@/lib/settings.server";

import type { CheckoutErrorField, CheckoutRequest } from "./request";

export interface PricedLine {
  key: VarietyKey;
  name: string;
  pallets: number;
  /** Integer cents. */
  unitCents: number;
  lineCents: number;
}

export interface PricedOrder {
  lines: PricedLine[];
  totalPallets: number;
  sodCents: number;
  deliveryFeeCents: number;
  zoneName: string | null;
  zip: string;
  /** True when the fee came from a placeholder "TEST" zone. */
  usesTestZone: boolean;
  deliveryDate: string;
  deliveryDateLabel: string;
  totalCents: number;
}

export type PriceResult =
  | { ok: true; order: PricedOrder }
  | { ok: false; status: number; error: string; field: CheckoutErrorField };

const fail = (
  status: number,
  field: CheckoutErrorField,
  error: string,
): PriceResult => ({ ok: false, status, field, error });

/**
 * Prices an order from scratch, on the server.
 *
 * The only place a checkout amount is calculated. Prices come from the catalog
 * resolver and fees from Site settings, both fetched now — never from anything
 * the browser sent. Every rule the cart shows as a hint is enforced again here,
 * because the cart can be bypassed with a single curl.
 */
export async function priceOrder(
  input: CheckoutRequest,
  now: Date = new Date(),
): Promise<PriceResult> {
  const [varieties, settings] = await Promise.all([
    getVarieties(),
    getDeliverySettings(),
  ]);

  if (!settings.orderingEnabled) {
    return fail(
      409,
      "ordering",
      `Online ordering is paused right now. Call ${BUSINESS.phone} and we will take your order.`,
    );
  }

  // Walk the fixed key list, not the request, so line order is stable and a key
  // the catalog does not know cannot slip through.
  const lines: PricedLine[] = VARIETY_KEYS.flatMap((key) => {
    const pallets = input.items[key];
    if (!pallets) return [];
    const variety = varieties.find((v) => v.key === key);
    if (!variety) return [];
    return [
      {
        key,
        name: variety.name,
        pallets,
        unitCents: variety.pricePerPalletCents,
        lineCents: pallets * variety.pricePerPalletCents,
      },
    ];
  });

  if (!lines.length) return fail(400, "items", "Your cart is empty.");

  if (!meetsMinimum(input.items)) {
    return fail(
      400,
      "items",
      `Every order needs at least ${MIN_PALLETS_TOTAL} pallets. Add ${
        MIN_PALLETS_TOTAL - totalPallets(input.items)
      } more to check out.`,
    );
  }

  const quote = quoteDelivery(settings, input.zip);
  if (quote.kind === "invalid") {
    return fail(400, "zip", "Enter a five digit delivery ZIP code.");
  }
  if (quote.kind === "quote") {
    return fail(
      422,
      "zip",
      `We price delivery to ${quote.zip} by phone. Call ${BUSINESS.phone} and we will quote it.`,
    );
  }

  const date = checkDeliveryDate(settings, input.deliveryDate, now);
  if (!date.ok) return fail(400, "deliveryDate", date.message);

  const sodCents = lines.reduce((sum, line) => sum + line.lineCents, 0);

  return {
    ok: true,
    order: {
      lines,
      totalPallets: totalPallets(input.items),
      sodCents,
      deliveryFeeCents: quote.feeCents,
      zoneName: quote.zoneName,
      zip: quote.zip,
      usesTestZone: quote.zoneName !== null && isTestZone({ name: quote.zoneName }),
      deliveryDate: input.deliveryDate,
      deliveryDateLabel: formatDeliveryDate(input.deliveryDate),
      totalCents: sodCents + quote.feeCents,
    },
  };
}
