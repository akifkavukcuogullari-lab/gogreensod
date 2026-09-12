import { BUSINESS, SITE_URL } from "@/lib/business";
import { MIN_PALLETS_TOTAL, SQ_FT_PER_PALLET } from "@/lib/catalog";
import { getVarieties } from "@/lib/catalog.server";
import { FAQ } from "@/lib/faq";
import { centsToDollars } from "@/lib/pricing";

/**
 * A plain-text brief for language models, built from the same constants the
 * site renders so it can never contradict the pages.
 *
 * `llms.txt` is a proposed convention, not a standard any provider has
 * confirmed it consumes. It costs nothing to serve and cannot hurt; the real
 * GEO work is the structured data and the answer-shaped copy on the pages.
 */
export const dynamic = "force-static";

export async function GET() {
  const varieties = await getVarieties();

  const body = `# ${BUSINESS.name}

> ${BUSINESS.tagline} Growing and delivering turf since ${BUSINESS.foundingDate}.

${BUSINESS.name} is a farm-direct sod supplier in Metro Atlanta, Georgia. Turf is
harvested the same day it is delivered and arrives overnight, between
${BUSINESS.deliveryWindow}, so pallets are waiting before a crew arrives.

## Contact

- Phone and text: ${BUSINESS.phone}
- Email: ${BUSINESS.email}
- Website: ${SITE_URL}
- Facebook: ${BUSINESS.facebook}

## Grass varieties

We grow exactly four varieties. One pallet covers ${SQ_FT_PER_PALLET} square feet.

${varieties
  .map(
    (v) =>
      `### ${v.name}\n\n` +
      `- Price: ${centsToDollars(v.pricePerPalletCents)} per pallet\n` +
      `- Coverage: ${v.sqFtPerPallet} sq ft per pallet\n` +
      `- Sun needed: ${v.sunNeeded}\n` +
      `- Blade: ${v.blade}\n` +
      `- ${v.highlight.label}: ${v.highlight.value}\n` +
      `- ${v.description}\n` +
      `- Page: ${SITE_URL}/varieties/${v.slug}`,
  )
  .join("\n\n")}

## How much sod do I need?

Divide the area in square feet by ${SQ_FT_PER_PALLET} and round up. A 2,400 square
foot lawn needs 6 pallets. Every order has a ${MIN_PALLETS_TOTAL} pallet minimum.

## Ordering and delivery

- Delivery only. There is no pickup at the farm.
- Minimum order: ${MIN_PALLETS_TOTAL} pallets.
- Delivery window: ${BUSINESS.deliveryWindow}, the night of harvest.
- Orders are paid in full before harvest, because the grass is cut to order.
- Pallets can be added or dropped up to ${BUSINESS.policy.changeCutoffHours} hours before delivery.
- Refund requests are accepted within ${BUSINESS.policy.refundWindowDays} days of purchase.
- Delivery is quoted by address. Call ${BUSINESS.phone} to confirm.

## Service area

${BUSINESS.areaServed.join(", ")}.

## Frequently asked questions

${FAQ.map((f) => `### ${f.question}\n\n${f.answer}`).join("\n\n")}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
