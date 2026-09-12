import type { Metadata } from "next";

import { LongFormFaq, LongFormSections } from "@/components/site/LongForm";
import { ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { Section } from "@/components/ui/Section";
import { VarietyTable } from "@/components/varieties/VarietyTable";
import { BUSINESS } from "@/lib/business";
import { MIN_PALLETS_TOTAL, SQ_FT_PER_PALLET } from "@/lib/catalog";
import { getVarieties } from "@/lib/catalog.server";
import { PAGE_META } from "@/lib/pages";
import { getPage } from "@/lib/pages.server";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  serviceJsonLd,
} from "@/lib/seo/jsonld";
import { createSlugger } from "@/lib/utils/slugify";

const META = PAGE_META.contractors;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("contractors");

  return {
    title: page.seoTitle || META.metaTitle,
    description: page.seoDescription || META.metaDescription,
    alternates: { canonical: META.path },
  };
}

/**
 * The contractor page.
 *
 * Worth its own page because the strongest thing Go Green Sod can say to a
 * landscaper is that it does not install — it is a supplier, never a competitor
 * bidding on the same job. The Bermuda copy already notes contractors ask for
 * Tifway 419 by name, and until now there was no page for that reader.
 *
 * NOTE: commercial terms — contractor pricing, payment terms, standing weekly
 * deliveries — are unanswered by the client (see CLIENT-ACTIONS.md §4). Nothing
 * here claims any of them. Every sentence is a fact already true of the
 * business, and the page points contractors at the phone for terms. Fill the
 * gaps in Studio once he answers; no deploy needed.
 */
export default async function ContractorPage() {
  const [varieties, page] = await Promise.all([
    getVarieties(),
    getPage("contractors"),
  ]);

  const slugFor = createSlugger();

  const faq = page.faq ?? [
    {
      id: "does-go-green-install",
      question: "Does Go Green Sod install the sod?",
      answer:
        "No. Go Green Sod grows and delivers turf only, and does not install. That means we are never bidding against a landscaper on the same job — we supply the crew doing the work.",
    },
    {
      id: "contractor-pricing",
      question: "Is there contractor pricing on bulk sod orders?",
      answer: `Call ${BUSINESS.phone} to discuss volume. Published prices are per pallet with a ${MIN_PALLETS_TOTAL} pallet minimum, and larger or repeating orders are worth a conversation.`,
    },
    {
      id: "standing-deliveries",
      question: "Can a landscaper set up repeat sod deliveries?",
      answer: `Yes, by phone on ${BUSINESS.phone}. Deliveries run overnight from ${BUSINESS.deliveryWindow}, so pallets are on the job site before a crew arrives in the morning.`,
    },
    {
      id: "which-grass-contractors",
      question: "Which sod do Atlanta contractors order most?",
      answer:
        "Tifway 419 Bermuda is the most widely used turf in Georgia and the one contractors ask for by name. It needs eight hours of sun a day. For shaded jobs, Zeon Zoysia holds up on as little as three to four hours.",
    },
    {
      id: "delivery-window-change",
      question: "How late can a contractor change a sod order?",
      answer: `Pallets can be added or dropped, and the delivery date moved, up to ${BUSINESS.policy.changeCutoffHours} hours before delivery. After that the grass has been scheduled for cutting.`,
    },
  ];

  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: "Wholesale sod supply for landscaping contractors",
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
          <span className="text-muted inline-flex items-center gap-2.5 text-[0.72rem] tracking-[.18em] uppercase">
            <span
              aria-hidden="true"
              className="bg-accent h-px w-[26px] opacity-90"
            />
            For the trade
          </span>
          <h1
            className="mt-6 text-[clamp(2.1rem,5.2vw,4rem)]"
            style={{ maxWidth: "20ch" }}
          >
            {page.title}
          </h1>
          <p className="text-muted mt-4 max-w-[60ch] text-[clamp(1rem,1.5vw,1.125rem)]">
            {page.intro}
          </p>
        </div>

        <dl className="rv border-line grid gap-x-8 gap-y-8 border-t pt-10 sm:grid-cols-2 lg:grid-cols-4">
          <Fact
            label="We supply, not install"
            value="Never bidding against your crew"
          />
          <Fact
            label="On site by"
            value={`${BUSINESS.deliveryWindow.split(" to ")[1]}, cut that day`}
          />
          <Fact
            label="Minimum order"
            value={`${MIN_PALLETS_TOTAL} pallets · ${(
              MIN_PALLETS_TOTAL * SQ_FT_PER_PALLET
            ).toLocaleString("en-US")} sq ft`}
          />
          <Fact
            label="Changes until"
            value={`${BUSINESS.policy.changeCutoffHours} hours before`}
          />
        </dl>

        <div className="mt-12 flex flex-wrap gap-3">
          <ButtonLink href={BUSINESS.phoneHref}>
            {`Call ${BUSINESS.phone}`}
          </ButtonLink>
          <ButtonLink href={BUSINESS.emailHref} variant="ghost">
            Email for volume terms
          </ButtonLink>
        </div>
      </Section>

      <Section tinted>
        <h2 className="text-[clamp(1.6rem,3vw,2.2rem)]">
          What we grow, and what it costs
        </h2>
        <p className="text-muted mt-4 max-w-[54ch]">
          Four varieties, all cut to order. Prices are per pallet; delivery is
          quoted by address.
        </p>
        <VarietyTable
          className="rv mt-10"
          varieties={varieties}
          caption="Turf grass varieties available to contractors, with sun requirement, blade type, coverage and price per pallet"
        />
      </Section>

      <LongFormSections
        sections={page.sections ?? []}
        slugFor={slugFor}
        tocTitle="On this page"
      />

      <LongFormFaq tinted faq={faq} heading="Contractor questions" />
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted text-[0.68rem] font-semibold tracking-[.16em] uppercase">
        {label}
      </dt>
      <dd className="mt-2 font-[family-name:var(--font-display)] text-[1.05rem] font-bold">
        {value}
      </dd>
    </div>
  );
}
