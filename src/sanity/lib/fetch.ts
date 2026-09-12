import "server-only";

import { sanityConfigured } from "../env";
import { client } from "./client";

/**
 * Every read of Sanity goes through here.
 *
 * Two deliberate behaviours:
 *
 * 1. Tagged AND time-bounded. The Sanity webhook revalidates tags for
 *    publish-to-live in seconds; `revalidate` is a floor so that a webhook
 *    that is misconfigured or silently failing self-heals within a minute
 *    instead of freezing the content forever.
 *
 * 2. Never throws. A CMS outage should degrade the page — no posts, fall back
 *    to the compiled catalog — not return a 500 to a customer who came to buy
 *    sod. Callers get the fallback and the failure is logged.
 */
export async function sanityFetch<T>({
  query,
  params = {},
  tags,
  revalidate = 60,
  fallback,
}: {
  query: string;
  params?: Record<string, unknown>;
  tags: string[];
  revalidate?: number;
  fallback: T;
}): Promise<T> {
  if (!sanityConfigured) return fallback;

  try {
    return await client.fetch<T>(query, params, {
      next: { tags, revalidate },
    });
  } catch (error) {
    console.error(`[sanity] query failed (tags: ${tags.join(", ")})`, error);
    return fallback;
  }
}
