import Link from "next/link";

import { CtaBand } from "@/components/site/CtaBand";
import { DeliveryBand } from "@/components/site/DeliveryBand";
import { Estimator } from "@/components/site/Estimator";
import { Hero } from "@/components/site/Hero";
import { Process } from "@/components/site/Process";
import { Ticker } from "@/components/site/Ticker";
import { Accordion } from "@/components/ui/Accordion";
import { JsonLd } from "@/components/ui/JsonLd";
import { Section, SectionHead } from "@/components/ui/Section";
import { VarietyTabs } from "@/components/varieties/VarietyTabs";
import { getVarieties } from "@/lib/catalog.server";
import { FAQ } from "@/lib/faq";
import { PAGE_META } from "@/lib/pages";
import { faqJsonLd, localBusinessJsonLd } from "@/lib/seo/jsonld";

/**
 * Prices come from the resolver, never from the compiled fallback.
 *
 * This page previously read `FALLBACK_VARIETIES` directly. That made the
 * homepage the one place a price edited in Studio never reached — the variety
 * tabs, the estimator AND `localBusinessJsonLd` all kept serving the compiled
 * price, so the structured data advertised a price the client had already
 * changed. `getVarieties()` falls back to the same compiled data when Sanity is
 * unreachable, so there is nothing to lose by going through it.
 */
export default async function HomePage() {
  const varieties = await getVarieties();

  return (
    <>
      <JsonLd data={localBusinessJsonLd(varieties)} />
      <JsonLd data={faqJsonLd(FAQ)} />

      <Hero />
      <Ticker />

      <Section id="varieties">
        <SectionHead
          title="Four grasses. Pick for your light."
          lede="How much sun the spot gets is the decision. Everything else follows from it."
        />
        <div className="rv">
          <VarietyTabs varieties={varieties} />
        </div>
      </Section>

      <Section id="estimate" tinted>
        <SectionHead
          title="What does your job need?"
          lede="Measure the area, pick a grass, and we will size the order. Three pallet minimum on every delivery."
        />
        <div className="rv">
          <Estimator varieties={varieties} />
        </div>
      </Section>

      <Process />
      <DeliveryBand />

      <Section id="faq">
        <div className="grid gap-[clamp(28px,4vw,64px)] lg:grid-cols-[.8fr_1.2fr]">
          <div className="rv">
            <h2 className="text-[clamp(2.1rem,5.2vw,4rem)]" style={{ maxWidth: "12ch" }}>
              Before you order
            </h2>
            {/* The home page is the most-linked page on any site; pointing it at
                the guide gives the hub a real in-content inbound link rather
                than only a footer mention. */}
            <p className="mt-6 text-[0.95rem]">
              <Link
                href={PAGE_META.guide.path}
                className="text-accent underline decoration-1 underline-offset-2"
              >
                Read the complete Atlanta sod guide
              </Link>
            </p>
          </div>
          <div className="rv rv-d1">
            <Accordion entries={FAQ} defaultOpenId={FAQ[0].id} />
          </div>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
