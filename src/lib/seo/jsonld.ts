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

/**
 * The price list as an ItemList of offers.
 *
 * A prices page is answering "what does a pallet of sod cost in Atlanta", and
 * this is the machine-readable form of that answer. Prices come from the
 * resolver, so they cannot disagree with the table rendered beside them.
 */
export function priceListJsonLd(
  varieties: readonly Variety[],
  /** Describes the list; comparison pages pass their own. */
  name = `Sod prices — ${BUSINESS.name}, Metro Atlanta`,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: varieties.length,
    itemListElement: varieties.map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: v.name,
        url: `${SITE_URL}/varieties/${v.slug}`,
        category: "Turf grass sod",
        brand: { "@type": "Brand", name: BUSINESS.name },
        offers: {
          "@type": "Offer",
          price: (v.pricePerPalletCents / 100).toFixed(2),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          seller: { "@id": ORG_ID },
          eligibleQuantity: {
            "@type": "QuantitativeValue",
            minValue: BUSINESS.policy.minPallets,
            unitText: "pallet",
          },
        },
      },
    })),
  };
}

/**
 * Sod supply as a Service, for the contractor page.
 *
 * `Service` rather than `Product` because what a landscaper buys here is ongoing
 * supply and scheduled delivery, not a single item. `provider` points at the
 * same business node the home page declares, so the two are one entity rather
 * than two businesses that happen to share a name.
 */
export function serviceJsonLd({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${SITE_URL}${path}`,
    serviceType: "Sod supply and delivery",
    provider: { "@id": ORG_ID },
    areaServed: BUSINESS.areaServed.map((place) => ({
      "@type": "Place",
      name: place,
    })),
    // Delivery only, no pickup — say so in the markup, not just the copy.
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${SITE_URL}${path}`,
      servicePhone: BUSINESS.phoneE164,
    },
  };
}

/**
 * A how-many-pallets calculator, described for machines.
 *
 * Deliberately NOT `HowTo`: Google deprecated HowTo rich results, and this is a
 * tool rather than a set of steps. `WebApplication` states what the page is
 * without claiming a rich result that no longer exists.
 */
export function calculatorJsonLd({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url: `${SITE_URL}${path}`,
    applicationCategory: "BusinessApplication",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    provider: { "@id": ORG_ID },
  };
}

/**
 * The buying guide as an Article.
 *
 * Author and publisher both point at the business node declared on the home
 * page, so the guide is attributed to Go Green Sod as one entity. There is no
 * datePublished or dateModified: nothing reliable supplies them yet, and an
 * invented date is worse than an absent one on a page built to be cited.
 */
export function guideArticleJsonLd({
  headline,
  description,
  path,
}: {
  headline: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url: `${SITE_URL}${path}`,
    mainEntityOfPage: `${SITE_URL}${path}`,
    inLanguage: "en-US",
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    about: { "@type": "Thing", name: "Buying sod in Metro Atlanta" },
  };
}
