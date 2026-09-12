import type { Metadata } from "next";

import { Estimator } from "@/components/site/Estimator";
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
  calculatorJsonLd,
  faqJsonLd,
} from "@/lib/seo/jsonld";
import { createSlugger } from "@/lib/utils/slugify";

const META = PAGE_META.calculator;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("calculator");

  return {
    title: page.seoTitle || META.metaTitle,
    description: page.seoDescription || META.metaDescription,
    alternates: { canonical: META.path },
  };
}

/**
 * The estimator on its own indexable URL.
 *
 * The same maths has always existed on the home page, but only at the fragment
 * `/#estimate` — which cannot rank, cannot be cited by an AI answer, and cannot
 * be shared on its own.
 *
 * The home page section stays exactly where it is, because it converts, and the
 * hero button still scrolls to it rather than leaving the page. Cross-page CTAs
 * now point here instead: sending someone from a variety page to the middle of
 * the home page was always worse, and the inbound links help this page rank.
 */
export default async function SodCalculatorPage() {
  const [varieties, page] = await Promise.all([
    getVarieties(),
    getPage("calculator"),
  ]);

  const slugFor = createSlugger();
  const minSqFt = MIN_PALLETS_TOTAL * SQ_FT_PER_PALLET;

  // Worked examples are computed, not typed, so they stay correct if the pallet
  // coverage or the order minimum ever change.
  const examples = [1000, 2400, 5000, 10000].map((sqFt) => ({
    sqFt,
    pallets: Math.max(Math.ceil(sqFt / SQ_FT_PER_PALLET), MIN_PALLETS_TOTAL),
  }));

  const faq = page.faq ?? [
    {
      id: "how-many-pallets",
      question: "How many pallets of sod do I need?",
      answer: `Divide the area you want covered, in square feet, by ${SQ_FT_PER_PALLET} and round up to the next whole pallet. A 2,400 square foot lawn needs 6 pallets. Every Go Green Sod order has a ${MIN_PALLETS_TOTAL} pallet minimum.`,
    },
    {
      id: "pallet-coverage",
      question: "How many square feet does a pallet of sod cover?",
      answer: `One pallet of Go Green Sod turf covers ${SQ_FT_PER_PALLET} square feet. That is the same for all four grasses we grow.`,
    },
    {
      id: "how-to-measure",
      question: "How do I measure my yard for sod?",
      answer:
        "Split the yard into rectangles, measure the length and width of each in feet, multiply them, then add the areas together. For an irregular shape, measure the widest length and width and treat it as a rectangle — ordering slightly over is safer than running short, because a second delivery means a second delivery fee.",
    },
    {
      id: "order-extra",
      question: "Should I order extra sod?",
      answer: `Round up rather than down. Sod is sold by the whole pallet, so the calculator already rounds up for you, and a small excess covers cuts and awkward edges. Call ${BUSINESS.phone} if you are unsure about an unusual shape.`,
    },
  ];

  return (
    <>
      <JsonLd
        data={calculatorJsonLd({
          name: META.metaTitle,
          description: META.metaDescription,
          path: META.path,
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
        <div className="rv mb-[clamp(40px,6vw,72px)]">
          <h1
            className="text-[clamp(2.1rem,5.2vw,4rem)]"
            style={{ maxWidth: "16ch" }}
          >
            {page.title}
          </h1>
          <p className="text-muted mt-4 max-w-[58ch] text-[clamp(1rem,1.5vw,1.125rem)]">
            {page.intro}
          </p>
        </div>

        <div className="rv">
          <Estimator varieties={varieties} />
        </div>
      </Section>

      <Section tinted>
        <h2 className="text-[clamp(1.6rem,3vw,2.2rem)]">
          Common yard sizes, in pallets
        </h2>
        <p className="text-muted mt-4 max-w-[54ch]">
          {`Every order has a ${MIN_PALLETS_TOTAL} pallet minimum, so anything under ${minSqFt.toLocaleString(
            "en-US",
          )} sq ft still ships as ${MIN_PALLETS_TOTAL} pallets.`}
        </p>

        <div className="rv mt-10 -mx-[var(--pad)] overflow-x-auto px-[var(--pad)]">
          <table className="w-full min-w-[420px] border-collapse text-left">
            <caption className="sr-only">
              Pallets of sod required for common Atlanta yard sizes, at 450
              square feet per pallet with a three pallet minimum
            </caption>
            <thead>
              <tr className="border-line border-b">
                {["Area to cover", "Pallets needed"].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="text-muted py-4 pr-6 text-[0.68rem] font-semibold tracking-[.16em] uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {examples.map((e) => (
                <tr key={e.sqFt} className="border-line-soft border-b">
                  <th scope="row" className="py-5 pr-6 font-normal">
                    {`${e.sqFt.toLocaleString("en-US")} sq ft`}
                  </th>
                  <td className="text-accent py-5 pr-6 font-semibold tabular-nums">
                    {`${e.pallets} pallets`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/sod-prices-atlanta">See prices</ButtonLink>
          <ButtonLink href="/varieties" variant="ghost">
            Compare the grasses
          </ButtonLink>
        </div>
      </Section>

      <LongFormSections
        sections={page.sections ?? []}
        slugFor={slugFor}
        tocTitle="On this page"
      />

      <LongFormFaq tinted faq={faq} heading="Questions about measuring" />
    </>
  );
}
