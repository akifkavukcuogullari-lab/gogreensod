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
/**
 * Blank means absent.
 *
 * Next.js substitutes an empty string for an unset NEXT_PUBLIC_* var, and
 * zod's `.default()` only applies to `undefined` — so without this, a missing
 * variable silently becomes `""` and slips past every default.
 */
const blankToUndefined = (v: string | undefined) =>
  v?.trim() ? v.trim() : undefined;

export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SITE_URL: blankToUndefined(process.env.NEXT_PUBLIC_SITE_URL),
  NEXT_PUBLIC_SANITY_PROJECT_ID: blankToUndefined(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  ),
  NEXT_PUBLIC_SANITY_DATASET: blankToUndefined(
    process.env.NEXT_PUBLIC_SANITY_DATASET,
  ),
  NEXT_PUBLIC_SANITY_API_VERSION: blankToUndefined(
    process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  ),
});

/* ------------------------------------------------------------------ *
 * Server — secrets. Never import the result into a client component.
 * ------------------------------------------------------------------ */

const serverSchema = z.object({
  // Secret (sk_) or restricted (rk_) key. Production should use a restricted
  // key; rejecting rk_ here would silently keep checkout switched off.
  STRIPE_SECRET_KEY: z
    .string()
    .regex(/^(sk|rk)_(test|live)_/, "Use a Stripe secret (sk_) or restricted (rk_) key"),
  // Optional here so checkout works before a webhook endpoint exists; the
  // webhook route refuses every request until it is set.
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),
  SANITY_API_READ_TOKEN: z.string().min(1).optional(),
  // Editor token used only by the Stripe webhook to write order documents.
  SANITY_API_WRITE_TOKEN: z.string().min(1).optional(),
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
  return /^(sk|rk)_(test|live)_/.test(process.env.STRIPE_SECRET_KEY ?? "");
}

export function isSanityConfigured(): boolean {
  return Boolean(publicEnv.NEXT_PUBLIC_SANITY_PROJECT_ID);
}

export const isLiveStripe = (): boolean =>
  /^(sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY ?? "");
