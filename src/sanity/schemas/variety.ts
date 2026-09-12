import { SparklesIcon } from "@sanity/icons/Sparkles";
import { defineArrayMember, defineField, defineType } from "sanity";

import { VARIETY_KEYS } from "@/lib/catalog";

/**
 * A turf variety — the product catalog.
 *
 * The client edits prices here, so the validation is deliberately strict.
 * A price is money: a mistyped 30 instead of 300 would be a live pricing bug
 * with real orders attached, so the range rule rejects it in the Studio
 * rather than letting it publish.
 *
 * `key` is a fixed list, not free text. Code keys off it, and checkout looks
 * up prices by it, so it must never drift.
 */
export const variety = defineType({
  name: "variety",
  title: "Grass variety",
  type: "document",
  icon: SparklesIcon,
  groups: [
    { name: "specs", title: "Specs and price", default: true },
    { name: "content", title: "Page content" },
    { name: "seo", title: "Search" },
  ],
  fields: [
    defineField({
      group: "specs",
      name: "key",
      title: "Variety",
      type: "string",
      description: "Fixed. Do not change — the website matches prices on this.",
      options: {
        list: VARIETY_KEYS.map((k) => ({ title: k, value: k })),
        layout: "radio",
      },
      readOnly: ({ document }) => Boolean(document?._createdAt),
      validation: (rule) => rule.required(),
    }),
    defineField({
      group: "specs",
      name: "name",
      title: "Display name",
      type: "string",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      group: "specs",
      name: "pricePerPallet",
      title: "Price per pallet (US dollars)",
      type: "number",
      description:
        "Whole dollars, no $ sign. This is what customers are charged, so double-check it.",
      validation: (rule) =>
        rule
          .required()
          .integer()
          .min(50)
          .max(2000)
          .error("A pallet price must be a whole number between $50 and $2000."),
    }),
    defineField({
      group: "specs",
      name: "sqFtPerPallet",
      title: "Coverage per pallet (square feet)",
      type: "number",
      initialValue: 450,
      validation: (rule) => rule.required().integer().min(100).max(1000),
    }),
    defineField({
      group: "specs",
      name: "sunNeeded",
      title: "Sun needed",
      type: "string",
      description: 'How much direct sun it wants, e.g. "3 to 4 hrs".',
      validation: (rule) => rule.required().max(24),
    }),
    defineField({
      group: "specs",
      name: "blade",
      title: "Blade",
      type: "string",
      options: {
        list: ["Thin", "Thick", "Fine"].map((b) => ({ title: b, value: b })),
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      group: "specs",
      name: "highlightLabel",
      title: "Extra spec — label",
      type: "string",
      description: 'e.g. "Best in", "Tolerates", "Holds up to"',
      validation: (rule) => rule.required().max(20),
    }),
    defineField({
      group: "specs",
      name: "highlightValue",
      title: "Extra spec — value",
      type: "string",
      description: 'e.g. "Full sun", "Moderate shade", "Drought"',
      validation: (rule) => rule.required().max(24),
    }),
    defineField({
      group: "specs",
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "Two or three sentences, the way you would describe it on the phone.",
      validation: (rule) => rule.required().min(40).max(400),
    }),
    defineField({
      group: "specs",
      name: "image",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Describe this image",
          type: "string",
          validation: (rule) => rule.required().min(10),
        }),
      ],
    }),
    defineField({
      group: "specs",
      name: "order",
      title: "Sort order",
      type: "number",
      description: "Lower numbers appear first.",
      validation: (rule) => rule.required().integer().min(1).max(99),
    }),
    defineField({
      group: "content",
      name: "sections",
      title: "Page sections",
      type: "array",
      of: [defineArrayMember({ type: "contentSection" })],
      description:
        "The long-form copy on this variety's page. Each section becomes a heading with its own link, and appears in the page contents. Add, reorder or remove them freely.",
    }),
    defineField({
      group: "content",
      name: "faq",
      title: "Questions about this grass",
      type: "array",
      of: [defineArrayMember({ type: "faqItem" })],
      description:
        "Shown on this variety's page and published as structured data, so an AI assistant can quote an answer and attribute it to Go Green Sod.",
    }),
    defineField({
      group: "seo",
      name: "seoTitle",
      title: "Search title",
      type: "string",
      description:
        "Optional. Overrides the browser tab and search result title. Leave empty to use the display name.",
      validation: (rule) => rule.max(60),
    }),
    defineField({
      group: "seo",
      name: "seoDescription",
      title: "Search description",
      type: "text",
      rows: 2,
      description:
        "Optional. The snippet under the search result. Leave empty and one is built from the price, coverage and sun needs.",
      validation: (rule) => rule.max(160),
    }),
  ],
  preview: {
    select: { title: "name", price: "pricePerPallet", media: "image" },
    prepare({ title, price, media }) {
      return { title, media, subtitle: price ? `$${price} per pallet` : "No price" };
    },
  },
  orderings: [
    { title: "Sort order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
});
