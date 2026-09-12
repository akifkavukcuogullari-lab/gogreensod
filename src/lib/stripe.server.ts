import "server-only";

import Stripe from "stripe";

import { serverEnv } from "@/lib/env";

let client: Stripe | null = null;

/**
 * One Stripe client per server instance.
 *
 * No explicit `apiVersion`: the SDK pins its own (2026-08-26.dahlia for
 * stripe@22.6.2), so the request shapes and the TypeScript types can never
 * disagree. The version moves only when the package is upgraded, and it moves
 * together with its types.
 *
 * Call only after `isStripeConfigured()` — `serverEnv()` throws on a missing
 * key, which is right for a misconfigured deploy but wrong for a route that can
 * answer "checkout is not open yet" instead.
 */
export function getStripe(): Stripe {
  if (!client) {
    client = new Stripe(serverEnv().STRIPE_SECRET_KEY, {
      appInfo: { name: "gogreensod", url: "https://gogreensod.com" },
      maxNetworkRetries: 2,
      timeout: 20_000,
    });
  }
  return client;
}
