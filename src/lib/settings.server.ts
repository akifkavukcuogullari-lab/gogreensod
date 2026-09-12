import "server-only";

import { sanityFetch } from "@/sanity/lib/fetch";
import { siteSettingsQuery } from "@/sanity/lib/queries";
import type { SiteSettingsDoc } from "@/sanity/lib/types";

import {
  DEFAULT_DELIVERY_SETTINGS,
  normalizeZip,
  type DeliverySettings,
  type DeliveryZone,
} from "./delivery";

/** Cache tag the Sanity webhook invalidates when Site settings are published. */
export const SETTINGS_TAG = "settings";

const isYmd = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

/**
 * A zone, or null if it cannot safely price anything.
 *
 * Studio validation already enforces these rules, but a draft published through
 * the API or an older document can skip them — and a zone with a missing fee
 * must never reach a checkout as a free delivery.
 */
function toZone(doc: NonNullable<SiteSettingsDoc["deliveryZones"]>[number]): DeliveryZone | null {
  const name = doc?.name?.trim();
  const fee = Number(doc?.fee);
  if (!name || !Number.isInteger(fee) || fee < 0 || fee > 2000) return null;

  const zips = [
    ...new Set(
      (doc?.zips ?? [])
        .map((raw) => normalizeZip(String(raw)))
        .filter((zip): zip is string => zip !== null),
    ),
  ];
  if (!zips.length) return null;

  return { name, feeCents: fee * 100, zips };
}

/**
 * Resolves delivery and ordering settings.
 *
 * Every field falls back independently, but the one that matters falls back
 * closed: `orderingEnabled` is true only when the document explicitly says so.
 */
export async function getDeliverySettings(): Promise<DeliverySettings> {
  const doc = await sanityFetch<SiteSettingsDoc | null>({
    query: siteSettingsQuery,
    tags: [SETTINGS_TAG],
    fallback: null,
  });

  if (!doc) return DEFAULT_DELIVERY_SETTINGS;

  const lead = Number(doc.minLeadTimeDays);
  const fallbackFee = Number(doc.fallbackFee);
  const charge = doc.unknownZipBehavior === "charge";

  return {
    orderingEnabled: doc.orderingEnabled === true,
    minLeadTimeDays:
      Number.isInteger(lead) && lead >= 0 && lead <= 30
        ? lead
        : DEFAULT_DELIVERY_SETTINGS.minLeadTimeDays,
    blackoutDates: (doc.deliveryBlackoutDates ?? []).filter(isYmd),
    zones: (doc.deliveryZones ?? [])
      .map(toZone)
      .filter((zone): zone is DeliveryZone => zone !== null),
    unknownZipBehavior: charge ? "charge" : "quote",
    // "Charge the fallback" with no valid fallback set degrades to quoting,
    // never to a free delivery.
    fallbackFeeCents:
      charge &&
      Number.isInteger(fallbackFee) &&
      fallbackFee >= 0 &&
      fallbackFee <= 2000
        ? fallbackFee * 100
        : null,
  };
}
