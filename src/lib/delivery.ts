/**
 * Delivery rules: which ZIP costs what, and which dates can be booked.
 *
 * Pure and shared. The cart runs these to show a fee and constrain the date
 * picker as the customer types; /api/checkout runs the same functions again on
 * the server against freshly fetched settings, and only the server's answer
 * reaches Stripe. Nothing here trusts the browser.
 *
 * Dates are calendar dates ("2026-09-15"), not instants. A delivery is booked
 * for a day at the farm, so "today" and every comparison are taken in the
 * business's own time zone — a customer ordering at 11pm Pacific must not get a
 * different earliest date from one ordering in Atlanta.
 */

export const BUSINESS_TIME_ZONE = "America/New_York";

/** How far ahead a delivery can be booked online. Anything later, call. */
export const MAX_BOOKING_DAYS = 120;

export interface DeliveryZone {
  name: string;
  /** Integer cents. */
  feeCents: number;
  zips: readonly string[];
}

export interface DeliverySettings {
  orderingEnabled: boolean;
  minLeadTimeDays: number;
  /** Calendar dates, "YYYY-MM-DD". */
  blackoutDates: readonly string[];
  zones: readonly DeliveryZone[];
  unknownZipBehavior: "quote" | "charge";
  /** Integer cents, or null when unknown ZIPs are quoted instead of charged. */
  fallbackFeeCents: number | null;
}

/**
 * What applies when there is no Site settings document, or Sanity is down.
 *
 * Ordering is OFF. The Studio field defaults to on for a new document, but the
 * absence of a document means nobody has configured delivery — and taking money
 * with no fee table is exactly the failure LAUNCH.md exists to prevent.
 */
export const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  orderingEnabled: false,
  minLeadTimeDays: 2,
  blackoutDates: [],
  zones: [],
  unknownZipBehavior: "quote",
  fallbackFeeCents: null,
};

/** "30060" and "30060-1234" become "30060"; anything else is not a ZIP. */
export function normalizeZip(raw: string): string | null {
  const match = raw.trim().match(/^(\d{5})(?:-\d{4})?$/);
  return match ? match[1] : null;
}

export type DeliveryQuote =
  | { kind: "fee"; feeCents: number; zoneName: string | null; zip: string }
  | { kind: "quote"; zip: string }
  | { kind: "invalid" };

/**
 * The delivery fee for a ZIP.
 *
 * A ZIP in no zone is never guessed at: it either gets the client's explicit
 * fallback fee, or it is sent to the phone for a quote. If two zones list the
 * same ZIP, the first zone in Studio wins.
 */
export function quoteDelivery(
  settings: DeliverySettings,
  rawZip: string,
): DeliveryQuote {
  const zip = normalizeZip(rawZip);
  if (!zip) return { kind: "invalid" };

  const zone = settings.zones.find((z) => z.zips.includes(zip));
  if (zone) {
    return { kind: "fee", feeCents: zone.feeCents, zoneName: zone.name, zip };
  }

  if (
    settings.unknownZipBehavior === "charge" &&
    settings.fallbackFeeCents !== null
  ) {
    return { kind: "fee", feeCents: settings.fallbackFeeCents, zoneName: null, zip };
  }

  return { kind: "quote", zip };
}

/**
 * Placeholder zones are named "TEST …". They exist so checkout can be built
 * before the client supplies real fees, and must never price a live payment.
 */
export function isTestZone(zone: Pick<DeliveryZone, "name">): boolean {
  return /^test\b/i.test(zone.name.trim());
}

/* ------------------------------------------------------------------ *
 * Dates
 * ------------------------------------------------------------------ */

const YMD = /^\d{4}-\d{2}-\d{2}$/;

/** Today's calendar date at the farm. */
export function todayAtFarm(now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Calendar arithmetic on "YYYY-MM-DD", done in UTC so DST cannot shift a day. */
export function addDays(ymd: string, days: number): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** True for a well-formed date that actually exists — rejects "2026-02-30". */
export function isRealDate(ymd: string): boolean {
  return YMD.test(ymd) && addDays(ymd, 0) === ymd;
}

/** The first date that respects the lead time and skips blackout dates. */
export function earliestDeliveryDate(
  settings: DeliverySettings,
  now: Date = new Date(),
): string {
  const blocked = new Set(settings.blackoutDates);
  let date = addDays(todayAtFarm(now), settings.minLeadTimeDays);
  for (let i = 0; i < 366 && blocked.has(date); i++) date = addDays(date, 1);
  return date;
}

export function latestDeliveryDate(now: Date = new Date()): string {
  return addDays(todayAtFarm(now), MAX_BOOKING_DAYS);
}

/** "Tuesday, September 15" — for messages and the order summary. */
export function formatDeliveryDate(ymd: string): string {
  if (!isRealDate(ymd)) return ymd;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(`${ymd}T00:00:00Z`));
}

export type DateCheck = { ok: true } | { ok: false; message: string };

export function checkDeliveryDate(
  settings: DeliverySettings,
  ymd: string,
  now: Date = new Date(),
): DateCheck {
  if (!ymd || !isRealDate(ymd)) {
    return { ok: false, message: "Choose a delivery date." };
  }

  const earliest = addDays(todayAtFarm(now), settings.minLeadTimeDays);
  if (ymd < earliest) {
    return {
      ok: false,
      message: `The earliest delivery we can book online is ${formatDeliveryDate(
        earliestDeliveryDate(settings, now),
      )}.`,
    };
  }

  if (settings.blackoutDates.includes(ymd)) {
    return {
      ok: false,
      message: "We are not delivering on that date. Please pick another.",
    };
  }

  if (ymd > latestDeliveryDate(now)) {
    return {
      ok: false,
      message: `We book online up to ${MAX_BOOKING_DAYS} days ahead. Call us for anything later.`,
    };
  }

  return { ok: true };
}
