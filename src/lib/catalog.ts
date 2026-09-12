/**
 * The four turf varieties — the entire product catalog.
 *
 * This module is the SINGLE SOURCE OF TRUTH for variety data. The original
 * concept duplicated it in four places (tab price spans, spec <dd>s, <option>
 * labels, and the PRICES/LABELS script objects); they drifted by design.
 *
 * At runtime the live catalog is read from Sanity so the client can edit
 * prices himself. FALLBACK_VARIETIES below is the compiled safety net used
 * when Sanity is unreachable or returns an incomplete catalog — the site must
 * never show a missing price. See lib/catalog.server.ts for the resolver.
 */

export const VARIETY_KEYS = ["zeon", "emerald", "meyers", "bermuda"] as const;

export type VarietyKey = (typeof VARIETY_KEYS)[number];

export type Blade = "Thin" | "Thick" | "Fine";

export interface Variety {
  key: VarietyKey;
  slug: string;
  name: string;
  /** Integer cents. Never floating-point dollars. */
  pricePerPalletCents: number;
  sqFtPerPallet: number;
  sunNeeded: string;
  blade: Blade;
  /** The fourth spec row genuinely differs per variety — model it, don't special-case it. */
  highlight: { label: string; value: string };
  description: string;
  image: { src: string; alt: string; width: number; height: number };
  order: number;
}

/** Coverage published for every variety we carry. */
export const SQ_FT_PER_PALLET = 450;

/** Go Green Sod's standing minimum order, counted across the whole cart. */
export const MIN_PALLETS_TOTAL = 3;

/** Upper bound per line — guards against absurd or hostile quantities. */
export const MAX_PALLETS_PER_LINE = 100;

/** Largest area the online estimator will quote. Beyond this we ask for a call. */
export const MAX_QUOTABLE_SQ_FT = 500_000;

export const FALLBACK_VARIETIES: readonly Variety[] = [
  {
    key: "zeon",
    slug: "zeon-zoysia",
    name: "Zeon Zoysia",
    pricePerPalletCents: 33_000,
    sqFtPerPallet: SQ_FT_PER_PALLET,
    sunNeeded: "3 to 4 hrs",
    blade: "Thin",
    highlight: { label: "Coverage", value: "450 sq ft" },
    description:
      "Zeon Zoysia is the most shade tolerant sod we grow, needing only three to four hours of sun a day. Thin bladed and carpet like once mature, though it is just as happy in full sun. Cut to order and delivered by the pallet across Metro Atlanta.",
    image: {
      src: "/img/v-zeon.jpg",
      alt: "Close view of fine bladed Zeon zoysia turf",
      width: 900,
      height: 676,
    },
    order: 1,
  },
  {
    key: "emerald",
    slug: "emerald-zoysia",
    name: "Emerald Zoysia",
    pricePerPalletCents: 30_000,
    sqFtPerPallet: SQ_FT_PER_PALLET,
    sunNeeded: "4 to 5 hrs",
    blade: "Thin",
    highlight: { label: "Holds up to", value: "Drought" },
    description:
      "Emerald Zoysia is the second most shade tolerant sod we grow, happy on four to five hours of sun. Thin blade, very drought tolerant, and low maintenance once established. Sold by the 450 square foot pallet, delivered anywhere in Metro Atlanta.",
    image: {
      src: "/img/v-emerald.jpg",
      alt: "Close view of dense deep green Emerald zoysia turf",
      width: 900,
      height: 1200,
    },
    order: 2,
  },
  {
    key: "meyers",
    slug: "meyers-zoysia",
    name: "Meyers Zoysia",
    pricePerPalletCents: 30_000,
    sqFtPerPallet: SQ_FT_PER_PALLET,
    sunNeeded: "5 to 6 hrs",
    blade: "Thick",
    // Concept said "Best in: Full sun" while the prose says it takes moderate
    // shade — a contradiction. Corrected to match the description.
    highlight: { label: "Tolerates", value: "Moderate shade" },
    description:
      "Meyers Zoysia is one of the oldest zoysia sods grown, and it asks for five to six hours of sun. The blade is thicker than Emerald or Zeon, and it takes moderate shade far better than any bermuda. Delivered fresh cut across Metro Atlanta.",
    image: {
      src: "/img/v-meyers.jpg",
      alt: "Close view of established Meyers zoysia turf",
      width: 900,
      height: 900,
    },
    order: 3,
  },
  {
    key: "bermuda",
    slug: "tifway-419-bermuda",
    name: "Tifway 419 Bermuda",
    pricePerPalletCents: 20_000,
    sqFtPerPallet: SQ_FT_PER_PALLET,
    sunNeeded: "8 hrs",
    blade: "Fine",
    highlight: { label: "Best in", value: "Full sun" },
    description:
      "Tifway 419 Bermuda is the most widely used turf in Georgia and the sod Atlanta contractors ask for by name. Fine blade, deep green hue, and it wants eight hours of sun a day. Delivered by the pallet, cut the same day it ships.",
    image: {
      src: "/img/v-bermuda.jpg",
      alt: "Close view of Tifway 419 bermuda turf in full sun",
      width: 900,
      height: 900,
    },
    order: 4,
  },
] as const;

const FALLBACK_BY_KEY = Object.fromEntries(
  FALLBACK_VARIETIES.map((v) => [v.key, v]),
) as Record<VarietyKey, Variety>;

/** Narrows untrusted input (request bodies, URL params) to a real variety key. */
export function isVarietyKey(value: unknown): value is VarietyKey {
  return (
    typeof value === "string" && (VARIETY_KEYS as readonly string[]).includes(value)
  );
}

export function fallbackVariety(key: VarietyKey): Variety {
  return FALLBACK_BY_KEY[key];
}

export function sortVarieties(varieties: readonly Variety[]): Variety[] {
  return [...varieties].sort((a, b) => a.order - b.order);
}
