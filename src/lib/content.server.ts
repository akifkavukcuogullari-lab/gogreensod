import "server-only";

import type { FaqItemDoc, VarietySectionDoc } from "@/sanity/lib/types";
import type { VarietySection } from "@/lib/catalog";
import type { FaqEntry } from "@/lib/faq";
import { createSlugger } from "@/lib/utils/slugify";

/**
 * Shared mappers for the long-form fields that appear on more than one document
 * type. Both `variety` and `page` carry `sections` and `faq` with identical
 * shapes, and the README is explicit that duplicated content logic in this
 * project has drifted before.
 */

/**
 * Long-form sections, skipping any that are incomplete.
 *
 * A section with a heading but no body renders an empty anchored h2 and puts a
 * hollow entry in the table of contents; one with a body but no heading has
 * nothing to anchor. Both are dropped rather than rendered badly.
 */
export function toSections(
  docs: VarietySectionDoc[] | null | undefined,
): readonly VarietySection[] | undefined {
  const sections = (docs ?? []).flatMap((d) => {
    const heading = d?.heading?.trim();
    const body = d?.body;
    if (!heading || !body?.length) return [];
    return [{ heading, body }];
  });

  return sections.length ? sections : undefined;
}

/**
 * FAQ entries, with ids derived from the question.
 *
 * The Accordion keys off a stable id, and a Sanity array member's `_key` is not
 * something the app should depend on, so it is slugified from the question text.
 * The same entries feed FAQPage JSON-LD, so an incomplete pair is dropped rather
 * than published as an empty answer.
 */
export function toFaq(
  docs: FaqItemDoc[] | null | undefined,
): readonly FaqEntry[] | undefined {
  const slug = createSlugger();

  const faq = (docs ?? []).flatMap((d) => {
    const question = d?.question?.trim();
    const answer = d?.answer?.trim();
    if (!question || !answer) return [];
    return [{ id: slug(question), question, answer }];
  });

  return faq.length ? faq : undefined;
}
