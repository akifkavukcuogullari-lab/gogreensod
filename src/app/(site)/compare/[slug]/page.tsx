import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LongFormFaq, LongFormSections } from "@/components/site/LongForm";
import { ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { Section } from "@/components/ui/Section";
import { VarietyTable } from "@/components/varieties/VarietyTable";
import {
  MIN_PALLETS_TOTAL,
  SQ_FT_PER_PALLET,
  type Variety,
} from "@/lib/catalog";
import { getVarieties } from "@/lib/catalog.server";
import { COMPARISONS, COMPARISON_SLUGS, PAGE_META } from "@/lib/pages";
import { getPage } from "@/lib/pages.server";
import { centsToDollars } from "@/lib/pricing";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  priceListJsonLd,
} from "@/lib/seo/jsonld";
import { createSlugger } from "@/lib/utils/slugify";

type Params = { params: Promise<{ slug: string }> };

/** Only the comparisons defined in src/lib/pages.ts exist; anything else 404s. */
export const dynamicParams = false;

export function generateStaticParams() {
  return COMPARISON_SLUGS.map((slug) => ({ slug }));
}

function comparisonFor(slug: string) {
  return Object.hasOwn(COMPARISONS, slug) ? COMPARISONS[slug] : undefined;
}

/**
 * The lowest whole number of hours in a sun spec such as "3 to 4 hrs".
 *
 * Specs are CMS-editable text, so anything unparseable sorts last rather than
 * throwing; ties fall back to the catalog's own order.
 */
function minSunHours(v: Variety): number {
  const hours = Number.parseInt(v.sunNeeded, 10);
  return Number.isFinite(hours) ? hours : Number.POSITIVE_INFINITY;
}

/** "A and B", "A, B and C". */
function listNames(names: readonly string[], conjunction: "and" | "or") {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} ${conjunction} ${names[names.length - 1]}`;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const comparison = comparisonFor(slug);
  if (!comparison) return {};

  const meta = PAGE_META[comparison.pageKey];
  const page = await getPage(comparison.pageKey);

  return {
    title: page.seoTitle || meta.metaTitle,
    description: page.seoDescription || meta.metaDescription,
    alternates: { canonical: meta.path },
  };
}

/**
 * A comparison between grasses.
 *
 * Every conclusion on this page — which grass takes the most shade, which is
 * cheapest, the price gap — is computed from the live catalog rather than
 * written down, so a price edited in Studio or a corrected sun spec updates the
 * verdict along with the table. The CMS supplies only the long-form sections
 * and, optionally, the FAQ.
 */
export default async function ComparisonPage({ params }: Params) {
  const { slug } = await params;
  const comparison = comparisonFor(slug);
  if (!comparison) notFound();

  const meta = PAGE_META[comparison.pageKey];
  const [all, page] = await Promise.all([
    getVarieties(),
    getPage(comparison.pageKey),
  ]);

  const varieties = comparison.varieties
    .map((key) => all.find((v) => v.key === key))
    .filter((v): v is Variety => Boolean(v));

  if (varieties.length < 2) notFound();

  const bySun = [...varieties].sort(
    (a, b) => minSunHours(a) - minSunHours(b) || a.order - b.order,
  );
  const shadiest = bySun[0];
  const sunniest = bySun[bySun.length - 1];

  const byPrice = [...varieties].sort(
    (a, b) => a.pricePerPalletCents - b.pricePerPalletCents,
  );
  const cheapest = byPrice[0];
  const dearest = byPrice[byPrice.length - 1];

  const namesAnd = listNames(
    varieties.map((v) => v.name),
    "and",
  );
  const namesOr = listNames(
    varieties.map((v) => v.name),
    "or",
  );

  const priceSentence =
    cheapest.pricePerPalletCents === dearest.pricePerPalletCents
      ? `${namesAnd} are the same price, ${centsToDollars(
          cheapest.pricePerPalletCents,
        )} per pallet.`
      : `${cheapest.name} is the least expensive at ${centsToDollars(
          cheapest.pricePerPalletCents,
        )} per pallet, and ${dearest.name} the most at ${centsToDollars(
          dearest.pricePerPalletCents,
        )}.`;

  const verdict = [
    {
      label: "Takes the most shade",
      text: `${shadiest.name} holds up on ${shadiest.sunNeeded} of direct sun a day, less than any other grass on this page.`,
    },
    {
      label: "Needs the most sun",
      text: `${sunniest.name} wants ${sunniest.sunNeeded} of direct sun a day.`,
    },
    { label: "Price per pallet", text: priceSentence },
  ];

  const faq = page.faq ?? [
    {
      id: "less-sun",
      question: `Which needs less sun: ${namesOr}?`,
      answer: `${shadiest.name} needs the least, holding up on ${shadiest.sunNeeded} of direct sun a day. ${sunniest.name} needs the most, at ${sunniest.sunNeeded}. Go Green Sod grows all of them and delivers across Metro Atlanta.`,
    },
    {
      id: "cost",
      question: `Which costs less per pallet: ${namesOr}?`,
      answer: `${priceSentence} One pallet covers ${SQ_FT_PER_PALLET} square feet, and delivery is quoted separately by address.`,
    },
    {
      id: "coverage",
      question: `How much do ${namesAnd} cover per pallet?`,
      answer: `Each pallet covers ${SQ_FT_PER_PALLET} square feet whichever grass you choose, and every Go Green Sod order has a ${MIN_PALLETS_TOTAL} pallet minimum.`,
    },
  ];

  const slugFor = createSlugger();

  return (
    <>
      <JsonLd data={priceListJsonLd(varieties, `${meta.metaTitle} — Go Green Sod`)} />
      <JsonLd data={faqJsonLd(faq)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: meta.breadcrumb, path: meta.path },
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
          caption={`${namesAnd} compared by sun requirement, blade type, coverage and price per pallet`}
        />

        <dl className="rv border-line mt-12 grid gap-x-8 gap-y-8 border-t pt-10 md:grid-cols-3">
          {verdict.map((item) => (
            <div key={item.label}>
              <dt className="text-muted text-[0.68rem] font-semibold tracking-[.16em] uppercase">
                {item.label}
              </dt>
              <dd className="text-bone/85 mt-2 leading-[1.6]">{item.text}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 flex flex-wrap gap-3">
          <ButtonLink href={PAGE_META.calculator.path}>
            Work out my pallets
          </ButtonLink>
          <ButtonLink href={PAGE_META.prices.path} variant="ghost">
            See all prices
          </ButtonLink>
        </div>

        <ul className="text-muted mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[0.9rem]">
          {varieties.map((v) => (
            <li key={v.key}>
              <Link
                href={`/varieties/${v.slug}`}
                className="text-accent underline decoration-1 underline-offset-2"
              >
                {`More on ${v.name}`}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={PAGE_META.guide.path}
              className="text-accent underline decoration-1 underline-offset-2"
            >
              Read the Atlanta sod guide
            </Link>
          </li>
        </ul>
      </Section>

      <LongFormSections
        tinted
        sections={page.sections ?? []}
        slugFor={slugFor}
        tocTitle="On this page"
      />

      <LongFormFaq faq={faq} heading="Questions about choosing" />
    </>
  );
}
