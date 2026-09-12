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
export const CANONICAL_URL = "https://gogreensod.com";

/** Hosts that count as the real site. Everything else is a staging surface. */
export const CANONICAL_HOSTS = ["gogreensod.com", "www.gogreensod.com"];

/**
 * Resolves the site's base URL.
 *
 * The canonical domain wins unless explicitly overridden. Vercel's injected
 * deployment hostnames are deliberately NOT used: canonical tags, the sitemap
 * and /llms.txt must always name gogreensod.com, so a preview deployment can
 * never get itself indexed as the real site or tell a model the wrong address.
 *
 * Next.js inlines `process.env.NEXT_PUBLIC_*` at build time and substitutes an
 * EMPTY STRING when a variable is unset — not `undefined` — so `??` is not
 * enough. Blank and malformed values are both treated as missing.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (explicit) {
    const withScheme = /^https?:\/\//.test(explicit)
      ? explicit
      : `https://${explicit}`;
    try {
      return new URL(withScheme).origin;
    } catch {
      // Malformed — fall through to the canonical domain.
    }
  }

  return CANONICAL_URL;
}

export const SITE_URL = resolveSiteUrl();
