import "server-only";

import { urlForImage } from "@/sanity/lib/image";
import { sanityFetch } from "@/sanity/lib/fetch";
import { varietiesQuery } from "@/sanity/lib/queries";
import type { VarietyDoc } from "@/sanity/lib/types";
import { toFaq, toSections } from "@/lib/content.server";

import {
  FALLBACK_VARIETIES,
  fallbackVariety,
  isVarietyKey,
  sortVarieties,
  type Blade,
  type Variety,
  type VarietyKey,
} from "./catalog";

/** Cache tag the Sanity webhook invalidates when a variety is edited. */
export const CATALOG_TAG = "catalog";

const BLADES: readonly Blade[] = ["Thin", "Thick", "Fine"];

const asBlade = (value: string): Blade =>
  BLADES.find((b) => b === value) ?? "Thin";


/**
 * Maps a Sanity document onto the app's Variety.
 *
 * Returns null for anything malformed rather than a half-populated variety —
 * a missing price must never reach a page or a checkout session. The compiled
 * entry is used in its place.
 */
function toVariety(doc: VarietyDoc): Variety | null {
  if (!isVarietyKey(doc.key)) return null;

  const price = Number(doc.pricePerPallet);
  if (!Number.isFinite(price) || price <= 0) return null;

  const base = fallbackVariety(doc.key);

  const image = doc.image?.asset
    ? {
        src: urlForImage(doc.image).width(1200).url(),
        alt: doc.image.alt ?? base.image.alt,
        width: 1200,
        height: 900,
      }
    : base.image;

  return {
    key: doc.key,
    // Slug stays code-owned: it is a URL, and letting it be edited would
    // silently break every existing link and the sitemap.
    slug: base.slug,
    name: doc.name?.trim() || base.name,
    pricePerPalletCents: Math.round(price * 100),
    sqFtPerPallet: Number(doc.sqFtPerPallet) || base.sqFtPerPallet,
    sunNeeded: doc.sunNeeded?.trim() || base.sunNeeded,
    blade: asBlade(doc.blade),
    highlight: {
      label: doc.highlightLabel?.trim() || base.highlight.label,
      value: doc.highlightValue?.trim() || base.highlight.value,
    },
    description: doc.description?.trim() || base.description,
    image,
    order: Number(doc.order) || base.order,
    sections: toSections(doc.sections),
    faq: toFaq(doc.faq),
    seoTitle: doc.seoTitle?.trim() || undefined,
    seoDescription: doc.seoDescription?.trim() || undefined,
  };
}

/**
 * Resolves the live catalog.
 *
 * The single source of truth for what a variety costs. Prices come from
 * Sanity so the client can change them without a deploy; every entry Sanity
 * does not supply — or supplies badly — falls back to the compiled catalog,
 * so the site can always quote a price even during a CMS outage.
 *
 * Checkout calls this and rebuilds every amount server-side. No price is ever
 * read from a request body.
 */
export async function getVarieties(): Promise<Variety[]> {
  const docs = await sanityFetch<VarietyDoc[]>({
    query: varietiesQuery,
    tags: [CATALOG_TAG],
    fallback: [],
  });

  const fromCms = new Map<VarietyKey, Variety>();
  for (const doc of docs) {
    const mapped = toVariety(doc);
    if (mapped) fromCms.set(mapped.key, mapped);
  }

  // Iterate the compiled catalog, not the CMS response: the four varieties
  // are a fixed set, so a document missing from Sanity means "use the
  // built-in", never "drop that variety from the site".
  return sortVarieties(
    FALLBACK_VARIETIES.map((base) => fromCms.get(base.key) ?? base),
  );
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
