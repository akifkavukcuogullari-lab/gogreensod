import { DocumentsIcon } from "@sanity/icons/Documents";
import { defineArrayMember, defineField, defineType } from "sanity";

import { PAGE_LIST } from "@/lib/pages";

/**
 * An editorial page.
 *
 * One document type for every page of this shape rather than one type per page,
 * so adding the buying guide or a comparison page needs a new key and a route,
 * not a new schema.
 *
 * `key` binds the document to a route defined in `src/lib/pages.ts`. It is a
 * fixed list and read-only once created, for the same reason the variety key is:
 * code matches on it, and a changed key would silently orphan the document and
 * drop the page back to its compiled fallback with no error anywhere.
 *
 * There is deliberately no slug field. URLs are code-owned.
 */
export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  icon: DocumentsIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "Search" },
  ],
  fields: [
    defineField({
      group: "content",
      name: "key",
      title: "Which page",
      type: "string",
      options: {
        list: PAGE_LIST.map((p) => ({ title: p.breadcrumb, value: p.key })),
        layout: "radio",
      },
      readOnly: ({ document }) => Boolean(document?._createdAt),
      validation: (rule) => rule.required(),
    }),
    defineField({
      group: "content",
      name: "title",
      title: "Page heading",
      type: "string",
      description:
        "Optional. Leave empty to use the built-in heading. Phrase it as the question a customer would ask.",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      group: "content",
      name: "intro",
      title: "Opening paragraph",
      type: "text",
      rows: 3,
      description:
        "Optional. Answer the heading directly in the first sentence — that is the part a search engine or AI assistant quotes.",
      validation: (rule) => rule.max(600),
    }),
    defineField({
      group: "content",
      name: "sections",
      title: "Page sections",
      type: "array",
      of: [defineArrayMember({ type: "contentSection" })],
      description:
        "Each section becomes a heading with its own link and appears in the page contents. Add, reorder or remove them freely.",
    }),
    defineField({
      group: "content",
      name: "faq",
      title: "Questions",
      type: "array",
      of: [defineArrayMember({ type: "faqItem" })],
      description:
        "Shown on the page and published as structured data, so an AI assistant can quote an answer and attribute it to Go Green Sod.",
    }),
    defineField({
      group: "seo",
      name: "seoTitle",
      title: "Search title",
      type: "string",
      description: "Optional. Overrides the browser tab and search result title.",
      validation: (rule) => rule.max(60),
    }),
    defineField({
      group: "seo",
      name: "seoDescription",
      title: "Search description",
      type: "text",
      rows: 2,
      description: "Optional. The snippet under the search result.",
      validation: (rule) => rule.max(160),
    }),
  ],
  preview: {
    select: { key: "key", title: "title" },
    prepare({ key, title }) {
      const meta = PAGE_LIST.find((p) => p.key === key);
      return {
        title: title || meta?.title || "Untitled page",
        subtitle: meta?.path ?? "No route — pick which page this is",
      };
    },
  },
});
