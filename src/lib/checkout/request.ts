import { z } from "zod";

import { MAX_PALLETS_PER_LINE, VARIETY_KEYS } from "@/lib/catalog";

/**
 * The checkout request contract, shared by the cart and /api/checkout.
 *
 * It carries choices only — which grasses, how many pallets, a ZIP and a date.
 * There is deliberately no price, fee or total anywhere in it: the server
 * derives every amount from the live catalog and Site settings, so a tampered
 * request can change what is ordered but never what it costs.
 *
 * `.strict()` rejects unknown keys, so a client sending `price` fails loudly
 * instead of being silently ignored and giving a false sense that it mattered.
 */
export const checkoutRequestSchema = z
  .object({
    items: z.partialRecord(
      z.enum(VARIETY_KEYS),
      z.number().int().min(1).max(MAX_PALLETS_PER_LINE),
    ),
    zip: z.string().trim().min(1).max(10),
    deliveryDate: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .strict();

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

/** Which cart field an error belongs to, so the cart can show it in place. */
export type CheckoutErrorField =
  | "items"
  | "zip"
  | "deliveryDate"
  | "ordering"
  | "request";

export type CheckoutResponse =
  | { url: string }
  | { error: string; field?: CheckoutErrorField };
