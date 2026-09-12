import "server-only";

import {
  FALLBACK_VARIETIES,
  fallbackVariety,
  sortVarieties,
  type Variety,
  type VarietyKey,
} from "./catalog";

/**
 * Resolves the live catalog.
 *
 * Prices are editable by the client in Sanity, so this is the one place that
 * decides what a variety costs. Every consumer — pages, the estimator, and
 * crucially the checkout session builder — reads from here rather than
 * trusting anything sent by a browser.
 *
 * Sanity is wired in Phase 2; until then this serves the compiled catalog.
 * When Sanity is unreachable or returns an incomplete set, we fall back
 * rather than render a missing price or block an order.
 */
export async function getVarieties(): Promise<Variety[]> {
  return sortVarieties(FALLBACK_VARIETIES);
}

export async function getVariety(key: VarietyKey): Promise<Variety> {
  const all = await getVarieties();
  return all.find((v) => v.key === key) ?? fallbackVariety(key);
}

export async function getVarietyBySlug(
  slug: string,
): Promise<Variety | undefined> {
  const all = await getVarieties();
  return all.find((v) => v.slug === slug);
}
