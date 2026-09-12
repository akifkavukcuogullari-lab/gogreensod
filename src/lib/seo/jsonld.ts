/**
 * Structured data builders.
 *
 * Everything derives from the same constants the UI renders, so the facts a
 * search engine or AI assistant reads can never drift from the facts on the
 * page. This is the highest-leverage SEO/GEO work in the build: the original
 * concept shipped zero structured data.
 */

import { BUSINESS, SITE_URL } from "@/lib/business";
import { FAQ, type FaqEntry } from "@/lib/faq";
import { centsToDollars } from "@/lib/pricing";
import type { Variety } from "@/lib/catalog";

const ORG_ID = `${SITE_URL}/#business`;

export function localBusinessJsonLd(varieties: readonly Variety[]) {
  const { address } = BUSINESS;

  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Store"],
    "@id": ORG_ID,
    name: BUSINESS.name,
    description: BUSINESS.tagline,
    url: SITE_URL,
    telephone: BUSINESS.phoneE164,
    email: BUSINESS.email,
    foundingDate: BUSINESS.foundingDate,
    priceRange: "$$",
    image: `${SITE_URL}/img/hero-lay.jpg`,
    address: {
      "@type": "PostalAddress",
      ...(address.streetAddress ? { streetAddress: address.streetAddress } : {}),
      addressLocality: address.addressLocality,
      addressRegion: address.addressRegion,
      ...(address.postalCode ? { postalCode: address.postalCode } : {}),
      addressCountry: address.addressCountry,
    },
    areaServed: BUSINESS.areaServed.map((name) => ({ "@type": "Place", name })),
    sameAs: [BUSINESS.facebook],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "08:00",
        closes: "18:00",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Turf grass varieties",
      itemListElement: varieties.map((v) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Product", name: v.name },
        price: (v.pricePerPalletCents / 100).toFixed(2),
        priceCurrency: "USD",
      })),
    },
  };
}

export function productJsonLd(variety: Variety) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: variety.name,
    description: variety.description,
    image: `${SITE_URL}${variety.image.src}`,
    category: "Turf grass sod",
    brand: { "@type": "Brand", name: BUSINESS.name },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Sun needed",
        value: variety.sunNeeded,
      },
      { "@type": "PropertyValue", name: "Blade", value: variety.blade },
      {
        "@type": "PropertyValue",
        name: "Coverage per pallet",
        value: `${variety.sqFtPerPallet} sq ft`,
      },
    ],
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/varieties/${variety.slug}`,
      price: (variety.pricePerPalletCents / 100).toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": ORG_ID },
      eligibleQuantity: {
        "@type": "QuantitativeValue",
        minValue: BUSINESS.policy.minPallets,
        unitText: "pallet",
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "US",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: BUSINESS.policy.refundWindowDays,
      },
    },
  };
}

export function faqJsonLd(entries: readonly FaqEntry[] = FAQ) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((e) => ({
      "@type": "Question",
      name: e.question,
      acceptedAnswer: { "@type": "Answer", text: e.answer },
    })),
  };
}

export function breadcrumbJsonLd(trail: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/** Human-readable price, shared by the UI and the /llms.txt brief. */
export const priceLabel = (v: Variety) =>
  `${centsToDollars(v.pricePerPalletCents)} per pallet`;
