import { PortableTextBody } from "@/components/blog/PortableTextBody";
import { Accordion } from "@/components/ui/Accordion";
import { Section } from "@/components/ui/Section";
import { TableOfContents } from "@/components/ui/TableOfContents";
import type { VarietySection } from "@/lib/catalog";
import type { FaqEntry } from "@/lib/faq";

/**
 * The long-form body shared by every content page: anchored sections beside a
 * sticky contents list.
 *
 * One component because the variety pages, the prices and contractor pages, the
 * comparisons and the buying guide all render the identical shape. Six copies of
 * this markup would drift, which is the mistake the original concept made with
 * the variety data.
 *
 * Callers pass the slugger so section headings and any headings inside a section
 * body draw ids from the same pool and cannot collide.
 */
export function LongFormSections({
  sections,
  slugFor,
  tocTitle,
  tinted = false,
}: {
  sections: readonly VarietySection[];
  slugFor: (text: string) => string;
  tocTitle: string;
  tinted?: boolean;
}) {
  if (!sections.length) return null;

  const ids = sections.map((section) => slugFor(section.heading));

  return (
    <Section tinted={tinted}>
      <div className="grid gap-[clamp(32px,5vw,72px)] lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
        <div className="min-w-0">
          {sections.map((section, i) => (
            <section key={ids[i]} className="rv">
              <h2
                id={ids[i]}
                className="mt-14 mb-5 max-w-[34ch] scroll-mt-28 text-[clamp(1.5rem,3vw,2.1rem)] first:mt-0"
              >
                {section.heading}
              </h2>
              <PortableTextBody value={section.body} slug={slugFor} />
            </section>
          ))}
        </div>

        <TableOfContents
          className="rv lg:sticky lg:top-28"
          title={tocTitle}
          entries={sections.map((section, i) => ({
            id: ids[i],
            text: section.heading,
            level: 2 as const,
          }))}
        />
      </div>
    </Section>
  );
}

/**
 * A page's FAQ accordion.
 *
 * The caller is responsible for also emitting `faqJsonLd(faq)` — the rendered
 * answers and the structured data must come from the same array, never two.
 */
export function LongFormFaq({
  faq,
  heading,
  tinted = false,
}: {
  faq: readonly FaqEntry[];
  heading: string;
  tinted?: boolean;
}) {
  if (!faq.length) return null;

  return (
    <Section tinted={tinted}>
      <div className="grid gap-[clamp(32px,5vw,72px)] lg:grid-cols-[.8fr_1.2fr]">
        <h2
          className="text-[clamp(2.1rem,5.2vw,3rem)]"
          style={{ maxWidth: "14ch" }}
        >
          {heading}
        </h2>
        <div className="rv">
          <Accordion entries={faq} defaultOpenId={faq[0].id} />
        </div>
      </div>
    </Section>
  );
}
