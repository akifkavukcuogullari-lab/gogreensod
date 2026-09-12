import { defineField, defineType } from "sanity";

import { richTextMembers } from "./richText";

/**
 * A headed block of long-form copy.
 *
 * Repeatable rather than a fixed set of named fields (water, maintenance, sun
 * and so on) so the client can add a topic nobody anticipated without a schema
 * change and a deploy — which is the whole reason the content lives in a CMS.
 *
 * Each section renders as an anchored `h2`, so adding one adds an entry to the
 * page's table of contents and a citable target for an AI assistant.
 */
export const contentSection = defineType({
  name: "contentSection",
  title: "Section",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      type: "string",
      description:
        "Phrase it as the question a customer would ask, where that reads naturally — those are the words people search with.",
      validation: (rule) => rule.required().min(4).max(80),
    }),
    defineField({
      name: "body",
      type: "array",
      of: richTextMembers,
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "heading" },
    prepare: ({ title }) => ({ title: title ?? "Untitled section" }),
  },
});
