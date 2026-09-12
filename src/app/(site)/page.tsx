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
import { FALLBACK_VARIETIES, sortVarieties } from "@/lib/catalog";
import { FAQ } from "@/lib/faq";
import { faqJsonLd, localBusinessJsonLd } from "@/lib/seo/jsonld";

export default function HomePage() {
  const varieties = sortVarieties(FALLBACK_VARIETIES);

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
