import type { Metadata } from "next";

import { Accordion } from "@/components/ui/Accordion";
import { ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { Section, SectionHead } from "@/components/ui/Section";
import { BUSINESS } from "@/lib/business";
import { FAQ } from "@/lib/faq";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Questions before you order",
  description:
    "Delivery windows, the three pallet minimum, how billing works, changing an order, and how much area a pallet of sod covers.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(FAQ)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "FAQ", path: "/faq" },
        ])}
      />

      <Section>
        <SectionHead
          as="h1"
          title="Before you order"
          lede="The things people ask most. If yours is not here, call or text and we will answer it straight."
          narrow="14ch"
        />
        <div className="rv max-w-[820px]">
          <Accordion entries={FAQ} defaultOpenId={FAQ[0].id} />
        </div>
        <div className="mt-14 flex flex-wrap gap-3">
          <ButtonLink href={BUSINESS.phoneHref}>
            {`Call or text ${BUSINESS.phone}`}
          </ButtonLink>
          <ButtonLink href={BUSINESS.emailHref} variant="ghost">
            {BUSINESS.email}
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
