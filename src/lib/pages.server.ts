import "server-only";

import { sanityFetch } from "@/sanity/lib/fetch";
import { pagesQuery } from "@/sanity/lib/queries";
import type { PageDoc } from "@/sanity/lib/types";

import { toFaq, toSections } from "./content.server";
import {
  PAGE_KEYS,
  PAGE_META,
  isPageKey,
  type EditorialPage,
  type PageKey,
} from "./pages";

/** Cache tag the Sanity webhook invalidates when a page is edited. */
export const PAGES_TAG = "page";

/**
 * Merges a CMS document onto its compiled entry.
 *
 * Returns null for a document whose key is not a route this build knows about —
 * an orphan from a renamed key, which must not be rendered anywhere.
 */
function toPage(doc: PageDoc): EditorialPage | null {
  if (!isPageKey(doc.key)) return null;

  const base = PAGE_META[doc.key];

  return {
    ...base,
    // The route is never taken from the CMS.
    path: base.path,
    title: doc.title?.trim() || base.title,
    intro: doc.intro?.trim() || base.intro,
    sections: toSections(doc.sections),
    faq: toFaq(doc.faq),
    seoTitle: doc.seoTitle?.trim() || undefined,
    seoDescription: doc.seoDescription?.trim() || undefined,
  };
}

/**
 * Resolves every editorial page.
 *
 * Iterates the code-owned key list, not the CMS response, so a page the client
 * has not written yet falls back to its compiled copy instead of vanishing.
 * This is the same discipline as `getVarieties()` — a missing document must
 * never mean a missing page.
 */
export async function getPages(): Promise<EditorialPage[]> {
  const docs = await sanityFetch<PageDoc[]>({
    query: pagesQuery,
    tags: [PAGES_TAG],
    fallback: [],
  });

  const fromCms = new Map<PageKey, EditorialPage>();
  for (const doc of docs) {
    const page = toPage(doc);
    // Last valid document wins if the client somehow created two for one key.
    if (page) fromCms.set(page.key, page);
  }

  return PAGE_KEYS.map((key) => fromCms.get(key) ?? PAGE_META[key]);
}

export async function getPage(key: PageKey): Promise<EditorialPage> {
  const pages = await getPages();
  return pages.find((p) => p.key === key) ?? PAGE_META[key];
}
