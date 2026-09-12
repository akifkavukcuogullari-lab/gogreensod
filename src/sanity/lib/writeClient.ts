import "server-only";

import type { SanityClient } from "next-sanity";

import { isSanityConfigured, serverEnv } from "@/lib/env";

import { client } from "./client";

/**
 * A Sanity client that can write, or null.
 *
 * Used only by the Stripe webhook to record paid orders. Null when no write
 * token is configured, and callers must treat that as "orders live in Stripe
 * only" — never as a reason to fail the webhook, which would make Stripe retry a
 * payment that has already succeeded.
 */
export function getWriteClient(): SanityClient | null {
  const token = serverEnv().SANITY_API_WRITE_TOKEN;
  if (!token || !isSanityConfigured()) return null;

  return client.withConfig({ token, useCdn: false, perspective: "raw" });
}
