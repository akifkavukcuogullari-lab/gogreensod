/**
 * Business facts. One source for the UI, the JSON-LD, the emails and /llms.txt,
 * so the name/address/phone a search engine reads can never drift from the
 * ones a customer sees.
 */

export const BUSINESS = {
  name: "Go Green Sod",
  legalName: "Go Green Sod",
  tagline: "Farm direct turf grass, delivered across Metro Atlanta.",
  foundingDate: "2011",

  phone: "678.237.3111",
  phoneHref: "tel:+16782373111",
  phoneE164: "+1-678-237-3111",

  email: "gogreensod123@gmail.com",
  emailHref: "mailto:gogreensod123@gmail.com",

  facebook: "https://www.facebook.com/gogreensod/",

  // TODO(client): street address required for LocalBusiness JSON-LD, and it
  // must match the Google Business Profile byte-for-byte.
  address: {
    streetAddress: "",
    addressLocality: "Atlanta",
    addressRegion: "GA",
    postalCode: "",
    addressCountry: "US",
  },

  /**
   * Named towns and counties, not "the Atlanta area" — a model matching
   * "near Alpharetta" needs the literal place name to match against.
   * TODO(client): confirm and extend this list.
   */
  areaServed: [
    "Atlanta",
    "Alpharetta",
    "Marietta",
    "Roswell",
    "Sandy Springs",
    "Duluth",
    "Johns Creek",
    "Kennesaw",
    "Woodstock",
    "Buford",
    "Lawrenceville",
    "Suwanee",
    "Fulton County",
    "Gwinnett County",
    "Cobb County",
    "Cherokee County",
    "Forsyth County",
    "DeKalb County",
  ],

  /** Deliveries run overnight so pallets are on site before the crew arrives. */
  deliveryWindow: "6pm to 8am",

  /** Business rules the checkout and the emails must both honor. */
  policy: {
    minPallets: 3,
    changeCutoffHours: 48,
    refundWindowDays: 2,
    deliveryOnly: true,
  },
} as const;

/** The domain this site is canonically served from. */
const CANONICAL_URL = "https://gogreensod.com";

/**
 * Resolves the site's base URL.
 *
 * Next.js inlines `process.env.NEXT_PUBLIC_*` at build time and substitutes an
 * EMPTY STRING when the variable is unset — not `undefined`. So `??` never
 * fires and `new URL("")` throws ERR_INVALID_URL, which is exactly how the
 * first Vercel build failed. Treat blank and malformed values as missing.
 */
function resolveSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    // Vercel exposes these to Next.js builds; useful on preview deployments
    // where no explicit site URL is configured.
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
    process.env.NEXT_PUBLIC_VERCEL_URL,
  ];

  for (const raw of candidates) {
    const value = raw?.trim();
    if (!value) continue;

    // The Vercel vars are bare hostnames, with no scheme.
    const withScheme = /^https?:\/\//.test(value) ? value : `https://${value}`;

    try {
      return new URL(withScheme).origin;
    } catch {
      // Malformed — fall through to the next candidate.
    }
  }

  return CANONICAL_URL;
}

export const SITE_URL = resolveSiteUrl();
