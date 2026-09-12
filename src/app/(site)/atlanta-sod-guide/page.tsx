import type { Metadata } from "next";
import Link from "next/link";

import { LongFormFaq, LongFormSections } from "@/components/site/LongForm";
import { ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { Section } from "@/components/ui/Section";
import { BUSINESS } from "@/lib/business";
import { MIN_PALLETS_TOTAL, SQ_FT_PER_PALLET } from "@/lib/catalog";
import { getVarieties } from "@/lib/catalog.server";
import { PAGE_META } from "@/lib/pages";
import { getPage } from "@/lib/pages.server";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  guideArticleJsonLd,
} from "@/lib/seo/jsonld";
import { createSlugger } from "@/lib/utils/slugify";

const META = PAGE_META.guide;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("guide");

  return {
    title: page.seoTitle || META.metaTitle,
    description: page.seoDescription || META.metaDescription,
    alternates: { canonical: META.path },
  };
}

/**
 * Every page the guide points to. Paths come from PAGE_META, so a route change
 * in src/lib/pages.ts cannot leave the hub linking to a dead URL.
 */
const HUB = [
  {
    href: "/varieties",
    label: "Compare all four grasses",
    note: "Sun, blade, coverage and price side by side",
  },
  {
    href: PAGE_META["zoysia-vs-bermuda"].path,
    label: PAGE_META["zoysia-vs-bermuda"].title,
    note: "The decision most Atlanta yards come down to",
  },
  {
    href: PAGE_META["zeon-vs-emerald"].path,
    label: PAGE_META["zeon-vs-emerald"].title,
    note: "The two most shade tolerant grasses we grow",
  },
  {
    href: PAGE_META.calculator.path,
    label: PAGE_META.calculator.title,
    note: `One pallet covers ${SQ_FT_PER_PALLET} sq ft`,
  },
  {
    href: PAGE_META.prices.path,
    label: PAGE_META.prices.title,
    note: "Price per pallet for every grass",
  },
  {
    href: PAGE_META.contractors.path,
    label: PAGE_META.contractors.title,
    note: "Supply for crews, from a grower that never installs",
  },
  {
    href: "/faq",
    label: "Ordering and delivery questions",
    note: "Payment, changes, refunds and delivery times",
  },
] as const;

/**
 * The Atlanta sod buying guide — the hub every other content page links into.
 *
 * Long-form sections come from the `page` document in Studio. The hub grid, the
 * FAQ fallback and the structured data are built here from the catalog and the
 * route registry, so the guide stays accurate even before the client edits a
 * word of it.
 */
export default async function AtlantaSodGuidePage() {
  const [varieties, page] = await Promise.all([
    getVarieties(),
    getPage("guide"),
  ]);

  // Catalog order is shade tolerance, most tolerant first.
  const shadiest = varieties[0];
  const sunniest = varieties[varieties.length - 1];
  const minSqFt = (MIN_PALLETS_TOTAL * SQ_FT_PER_PALLET).toLocaleString("en-US");

  const faq = page.faq ?? [
    {
      id: "best-for-shade",
      question: "What is the best sod for a shady Atlanta yard?",
      answer: `Of the four grasses Go Green Sod grows, ${shadiest.name} takes the most shade, holding up on ${shadiest.sunNeeded} of direct sun a day. ${sunniest.name} needs the most sun, at ${sunniest.sunNeeded}.`,
    },
    {
      id: "pallet-coverage",
      question: "How many square feet does a pallet of sod cover?",
      answer: `One pallet of Go Green Sod turf covers ${SQ_FT_PER_PALLET} square feet, whichever of the four grasses you choose. Divide your area by ${SQ_FT_PER_PALLET} and round up to the next whole pallet.`,
    },
    {
      id: "minimum",
      question: "What is the minimum sod order in Atlanta?",
      answer: `Go Green Sod has a ${MIN_PALLETS_TOTAL} pallet minimum on every order, which covers ${minSqFt} square feet. Smaller jobs are quoted over the phone on ${BUSINESS.phone}.`,
    },
    {
      id: "delivery",
      question: "Does Go Green Sod deliver sod in Atlanta?",
      answer: `Yes, across Metro Atlanta, and delivery only with no pickup at the farm. Sod is cut the day it ships and delivered overnight between ${BUSINESS.deliveryWindow}, and delivery is quoted separately by address.`,
    },
  ];

  const slugFor = createSlugger();

  return (
    <>
      <JsonLd
        data={guideArticleJsonLd({
          headline: page.title,
          description: META.metaDescription,
          path: META.path,
          datePublished: page.createdAt,
          dateModified: page.updatedAt,
        })}
      />
      <JsonLd data={faqJsonLd(faq)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: META.breadcrumb, path: META.path },
        ])}
      />

      <Section>
        <div className="rv">
          <span className="text-muted inline-flex items-center gap-2.5 text-[0.72rem] tracking-[.18em] uppercase">
            <span
              aria-hidden="true"
              className="bg-accent h-px w-[26px] opacity-90"
            />
            {`Buying guide · Since ${BUSINESS.foundingDate}`}
          </span>
          <h1
            className="mt-6 text-[clamp(2.1rem,5.2vw,4rem)]"
            style={{ maxWidth: "20ch" }}
          >
            {page.title}
          </h1>
          <p className="text-muted mt-4 max-w-[64ch] text-[clamp(1rem,1.5vw,1.125rem)]">
            {page.intro}
          </p>
        </div>

        <nav aria-label="Guide pages" className="rv mt-[clamp(40px,6vw,72px)]">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HUB.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="border-line bg-surface-2 hover:border-bone/40 block h-full rounded-[var(--radius-md)] border p-6 transition-colors"
                >
                  <span className="block font-[family-name:var(--font-display)] text-[1.1rem] font-bold">
                    {item.label}
                  </span>
                  <span className="text-muted mt-2 block text-[0.9rem]">
                    {item.note}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Section>

      <LongFormSections
        tinted
        sections={page.sections ?? []}
        slugFor={slugFor}
        tocTitle="In this guide"
      />

      <LongFormFaq faq={faq} heading="Quick answers" />

      <Section tinted>
        <h2 className="text-[clamp(1.6rem,3vw,2.2rem)]">Ready to order?</h2>
        <p className="text-muted mt-4 max-w-[54ch]">
          {`Work out your pallets, then call ${BUSINESS.phone} to book a delivery date.`}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href={PAGE_META.calculator.path}>
            Work out my pallets
          </ButtonLink>
          <ButtonLink href={BUSINESS.phoneHref} variant="ghost">
            {`Call ${BUSINESS.phone}`}
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
