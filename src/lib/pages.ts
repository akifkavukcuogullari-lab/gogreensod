/**
 * Editorial pages whose URL, title and fallback copy live in code.
 *
 * Same split as the catalog: the CMS owns the words, code owns the route. A
 * `page` document in Sanity supplies long-form sections and FAQs; it can never
 * supply a slug, because a slug is a URL and letting one be edited would break
 * every inbound link, the sitemap and the breadcrumbs at once.
 *
 * Every entry here is also the compiled fallback. If Sanity is unreachable, or
 * the client has not written a document yet, the page still renders with a real
 * heading, a real intro and a working order path — it is simply shorter.
 */

import type { FaqEntry } from "@/lib/faq";
import type { VarietySection } from "@/lib/catalog";

export const PAGE_KEYS = ["prices", "calculator", "contractors"] as const;

export type PageKey = (typeof PAGE_KEYS)[number];

export interface PageMeta {
  key: PageKey;
  /** Code-owned URL. Never read from the CMS. */
  path: string;
  /** Label used in breadcrumbs and the JSON-LD trail. */
  breadcrumb: string;
  /** The page's `h1`. The CMS may override it. */
  title: string;
  /** The paragraph under the `h1`. The CMS may override it. */
  intro: string;
  metaTitle: string;
  metaDescription: string;
}

/**
 * Copy here is written to answer the question in the URL directly, in the first
 * sentence, because that is the shape a generative engine can quote. No prices
 * appear in any string: prices are CMS-editable, so a figure written into prose
 * goes stale the moment the client changes it. Anything price-related is derived
 * from the catalog at render time instead.
 */
export const PAGE_META: Record<PageKey, PageMeta> = {
  prices: {
    key: "prices",
    path: "/sod-prices-atlanta",
    breadcrumb: "Sod prices",
    title: "How much does sod cost in Atlanta?",
    intro:
      "Go Green Sod publishes a price for every grass it grows. One pallet covers 450 square feet, every order has a three pallet minimum, and delivery is quoted separately by address. The full price list is below.",
    metaTitle: "Sod Prices in Atlanta",
    metaDescription:
      "Current price per pallet for Zeon, Emerald and Meyers Zoysia and Tifway 419 Bermuda. One pallet covers 450 sq ft, three pallet minimum, delivered across Metro Atlanta.",
  },
  calculator: {
    key: "calculator",
    path: "/sod-calculator",
    breadcrumb: "Sod calculator",
    title: "How much sod do I need?",
    intro:
      "Measure the area you want covered, enter the square footage, and this will tell you how many pallets to order. One pallet of Go Green Sod turf covers 450 square feet, and every order has a three pallet minimum.",
    metaTitle: "Sod Calculator",
    metaDescription:
      "Work out how many pallets of sod your yard needs. One pallet covers 450 sq ft, with a three pallet minimum, delivered across Metro Atlanta.",
  },
  contractors: {
    key: "contractors",
    path: "/contractor-sod-delivery-atlanta",
    breadcrumb: "For contractors",
    title: "Sod for Atlanta landscapers and contractors",
    intro:
      "Go Green Sod supplies turf to landscaping crews across Metro Atlanta. We grow and deliver; we do not install, so we are never bidding against you on the job. Pallets are cut the day they ship and delivered overnight, so they are on site before your crew arrives.",
    metaTitle: "Sod for Landscapers and Contractors",
    metaDescription:
      "Farm-direct sod supply for Metro Atlanta landscaping contractors. Cut to order, delivered overnight, and we do not install — so we never compete with you on the job.",
  },
};

export const PAGE_LIST: readonly PageMeta[] = PAGE_KEYS.map(
  (key) => PAGE_META[key],
);

/** Narrows untrusted input to a real page key. */
export function isPageKey(value: unknown): value is PageKey {
  return (
    typeof value === "string" && (PAGE_KEYS as readonly string[]).includes(value)
  );
}

/** A resolved page: code-owned route plus whatever the CMS supplied. */
export interface EditorialPage extends PageMeta {
  sections?: readonly VarietySection[];
  faq?: readonly FaqEntry[];
  /** Optional CMS overrides for the metadata. */
  seoTitle?: string;
  seoDescription?: string;
}
