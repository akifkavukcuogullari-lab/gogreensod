import { defineField, defineType } from "sanity";

/**
 * One question and answer.
 *
 * Answers are plain text, not rich text, on purpose: this same string is
 * rendered in the accordion AND emitted as `acceptedAnswer.text` in FAQPage
 * JSON-LD. Rich text would have to be flattened for the structured data, and the
 * two would drift.
 *
 * The minimum length is the point of the field. An answer written to stand alone
 * survives being lifted out of context by an AI assistant; "Yes, we do" does not.
 */
export const faqItem = defineType({
  name: "faqItem",
  title: "Question",
  type: "object",
  fields: [
    defineField({
      name: "question",
      type: "string",
      description: "Write it the way a customer would ask it.",
      validation: (rule) => rule.required().min(10).max(120),
    }),
    defineField({
      name: "answer",
      type: "text",
      rows: 3,
      description:
        "Answer in full sentences that make sense on their own, without the question. Include the specifics — numbers, place names, prices.",
      validation: (rule) => rule.required().min(40).max(500),
    }),
  ],
  preview: {
    select: { title: "question", subtitle: "answer" },
  },
});
