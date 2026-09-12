/**
 * Environment configuration, validated at module load.
 *
 * Everything is parsed here so a missing or malformed variable fails the BUILD
 * rather than a customer's checkout at 7pm on a Friday.
 *
 * Secrets are read lazily through `serverEnv()` so that importing this module
 * from a client component cannot pull a secret into the browser bundle.
 */

import { z } from "zod";

/* ------------------------------------------------------------------ *
 * Public — inlined into the client bundle. Nothing secret may go here.
 * ------------------------------------------------------------------ */

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_SANITY_DATASET: z.string().min(1).default("production"),
  // Pinned date, never "latest" — a floating version makes query behavior
  // drift underneath us between deploys.
  NEXT_PUBLIC_SANITY_API_VERSION: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pin the Sanity API version to a date")
    .default("2026-06-01"),
});

// Next.js inlines process.env.NEXT_PUBLIC_* only for literal member accesses,
// so these must be written out longhand rather than spread from process.env.
export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
  NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
});

/* ------------------------------------------------------------------ *
 * Server — secrets. Never import the result into a client component.
 * ------------------------------------------------------------------ */

const serverSchema = z.object({
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
  SANITY_API_READ_TOKEN: z.string().min(1).optional(),
  SANITY_REVALIDATE_SECRET: z.string().min(16).optional(),
  RESEND_API_KEY: z.string().startsWith("re_").optional(),
  ORDER_NOTIFICATION_EMAIL: z.string().email().optional(),
  ORDER_FROM_EMAIL: z.string().email().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cached: ServerEnv | null = null;

export function serverEnv(): ServerEnv {
  if (cached) return cached;

  const parsed = serverSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid server environment:\n${issues}`);
  }

  cached = parsed.data;
  return cached;
}

/** True once Stripe is configured — lets routes 503 cleanly instead of crashing. */
export function isStripeConfigured(): boolean {
  return (
    typeof process.env.STRIPE_SECRET_KEY === "string" &&
    process.env.STRIPE_SECRET_KEY.startsWith("sk_")
  );
}

export function isSanityConfigured(): boolean {
  return Boolean(publicEnv.NEXT_PUBLIC_SANITY_PROJECT_ID);
}

export const isLiveStripe = (): boolean =>
  process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ?? false;
