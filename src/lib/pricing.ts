/**
 * Pallet math and order-minimum rules.
 *
 * Ported verbatim from the estimator in the approved concept
 * (reference/index.html, lines 830–884) so the numbers a customer saw on the
 * sample are the numbers they get in the cart.
 */

import {
  MAX_PALLETS_PER_LINE,
  MAX_QUOTABLE_SQ_FT,
  MIN_PALLETS_TOTAL,
  SQ_FT_PER_PALLET,
  type VarietyKey,
} from "./catalog";

export type CartItems = Partial<Record<VarietyKey, number>>;

export type AreaParseResult =
  | { ok: true; sqFt: number }
  | { ok: false; message: string };

/**
 * Validates a raw area string using the concept's exact rules and copy.
 * Commas and spaces are stripped first, so "2,400" is accepted.
 */
export function parseArea(raw: string): AreaParseResult {
  const cleaned = raw.trim().replace(/[, ]/g, "");

  if (!cleaned) {
    return { ok: false, message: "Enter the area you need to cover." };
  }
  if (!/^\d+(\.\d+)?$/.test(cleaned)) {
    return { ok: false, message: "Use numbers only, for example 2400." };
  }

  const sqFt = Number.parseFloat(cleaned);

  if (sqFt <= 0) {
    return { ok: false, message: "Enter an area greater than zero." };
  }
  if (sqFt > MAX_QUOTABLE_SQ_FT) {
    return {
      ok: false,
      message: "That is past what we quote online. Please call us.",
    };
  }

  return { ok: true, sqFt };
}

/** Raw pallet count for an area, before the order minimum is applied. */
export function palletsForSqFt(sqFt: number): number {
  return Math.ceil(sqFt / SQ_FT_PER_PALLET);
}

/** Pallet count a customer would actually be charged for. */
export function billablePalletsForSqFt(sqFt: number): number {
  return Math.max(palletsForSqFt(sqFt), MIN_PALLETS_TOTAL);
}

/** True when the raw area falls under the minimum and was rounded up to it. */
export function isBelowMinimum(sqFt: number): boolean {
  return palletsForSqFt(sqFt) < MIN_PALLETS_TOTAL;
}

export function totalPallets(items: CartItems): number {
  return Object.values(items).reduce<number>((sum, n) => sum + (n ?? 0), 0);
}

/**
 * The order minimum, as a single predicate.
 *
 * The business publishes a "three pallet minimum". In a multi-variety cart
 * that is ambiguous: three pallets in total, or three of each variety? We
 * apply it to the cart TOTAL — a customer taking one pallet each of three
 * grasses is still a three pallet load.
 *
 * Pending a client answer. Flipping to per-line is a change to this function
 * and nothing else.
 */
export function meetsMinimum(items: CartItems): boolean {
  return totalPallets(items) >= MIN_PALLETS_TOTAL;
}

/** Rejects fractional, negative, absurd, or hostile quantities. */
export function isValidPalletCount(n: unknown): n is number {
  return (
    typeof n === "number" &&
    Number.isInteger(n) &&
    n >= 1 &&
    n <= MAX_PALLETS_PER_LINE
  );
}

export function centsToDollars(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export function formatSqFt(sqFt: number): string {
  return `${sqFt.toLocaleString("en-US")} sq ft`;
}
