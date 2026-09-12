import type { Metadata } from "next";

import { LongFormFaq, LongFormSections } from "@/components/site/LongForm";
import { ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { Section } from "@/components/ui/Section";
import { VarietyTable } from "@/components/varieties/VarietyTable";
import { BUSINESS } from "@/lib/business";
import { getVarieties } from "@/lib/catalog.server";
import { MIN_PALLETS_TOTAL, SQ_FT_PER_PALLET } from "@/lib/catalog";
import { PAGE_META } from "@/lib/pages";
import { getPage } from "@/lib/pages.server";
import { centsToDollars } from "@/lib/pricing";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  priceListJsonLd,
} from "@/lib/seo/jsonld";
import { createSlugger } from "@/lib/utils/slugify";

const META = PAGE_META.prices;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("prices");

  return {
    title: page.seoTitle || META.metaTitle,
    description: page.seoDescription || META.metaDescription,
    alternates: { canonical: META.path },
  };
}

export default async function SodPricesPage() {
  const [varieties, page] = await Promise.all([
    getVarieties(),
    getPage("prices"),
  ]);

  const slugFor = createSlugger();

  // Derived, never written down: the cheapest and dearest pallet and the
  // minimum spend all come from the resolver, so editing a price in Studio
  // updates this prose along with the table.
  const sorted = [...varieties].sort(
    (a, b) => a.pricePerPalletCents - b.pricePerPalletCents,
  );
  const cheapest = sorted[0];
  const dearest = sorted[sorted.length - 1];
  const minSqFt = MIN_PALLETS_TOTAL * SQ_FT_PER_PALLET;

  const faq = page.faq ?? [
    {
      id: "cost-per-pallet",
      question: "How much is a pallet of sod in Atlanta?",
      answer: `Go Green Sod charges between ${centsToDollars(
        cheapest.pricePerPalletCents,
      )} and ${centsToDollars(
        dearest.pricePerPalletCents,
      )} per pallet depending on the grass. ${cheapest.name} is the least expensive and ${
        dearest.name
      } the most. One pallet covers ${SQ_FT_PER_PALLET} square feet, and delivery is quoted separately by address.`,
    },
    {
      id: "minimum-order",
      question: "What is the minimum sod order?",
      answer: `Three pallets, which covers ${minSqFt.toLocaleString(
        "en-US",
      )} square feet. Smaller jobs are quoted over the phone on ${BUSINESS.phone}.`,
    },
    {
      id: "delivery-cost",
      question: "Is delivery included in the sod price?",
      answer: `No. The price per pallet is for the sod itself, and delivery is quoted separately based on your address. Go Green Sod delivers across Metro Atlanta and does not offer pickup at the farm.`,
    },
    {
      id: "price-changes",
      question: "Are these sod prices current?",
      answer: `Yes. Every price on this page is read from Go Green Sod's own price list, so it is the same figure quoted at checkout and over the phone on ${BUSINESS.phone}.`,
    },
  ];

  return (
    <>
      <JsonLd data={priceListJsonLd(varieties)} />
      <JsonLd data={faqJsonLd(faq)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: META.breadcrumb, path: META.path },
        ])}
      />

      <Section>
        <div className="rv mb-[clamp(40px,6vw,72px)]">
          <h1
            className="text-[clamp(2.1rem,5.2vw,4rem)]"
            style={{ maxWidth: "18ch" }}
          >
            {page.title}
          </h1>
          <p className="text-muted mt-4 max-w-[62ch] text-[clamp(1rem,1.5vw,1.125rem)]">
            {page.intro}
          </p>
        </div>

        <VarietyTable
          className="rv"
          varieties={varieties}
          caption="Price per pallet for every turf grass Go Green Sod grows, with sun requirement, blade type and coverage"
        />

        <p className="text-muted mt-6 text-[0.85rem]">
          {`One pallet covers ${SQ_FT_PER_PALLET} sq ft. Every order has a ${MIN_PALLETS_TOTAL} pallet minimum, which is ${minSqFt.toLocaleString(
            "en-US",
          )} sq ft. Delivery is quoted separately by address.`}
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/sod-calculator">Work out my pallets</ButtonLink>
          <ButtonLink href={BUSINESS.phoneHref} variant="ghost">
            {`Call ${BUSINESS.phone}`}
          </ButtonLink>
        </div>
      </Section>

      <LongFormSections
        tinted
        sections={page.sections ?? []}
        slugFor={slugFor}
        tocTitle="On this page"
      />

      <LongFormFaq faq={faq} heading="Questions about sod pricing" />
    </>
  );
}
