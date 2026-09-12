import { defineArrayMember, defineField } from "sanity";

/**
 * The one rich-text configuration for the whole project.
 *
 * Extracted verbatim from what `post.body` already used, so a blog post and a
 * variety's long-form section offer the client the identical editor. Kept
 * deliberately narrow: no h1 (the page owns that), no code or underline
 * decorators, and no embedded object types beyond an image. Every style here
 * has a matching renderer in `src/components/blog/PortableTextBody.tsx` — adding
 * a style without adding a renderer makes it silently fall back to a paragraph.
 */
export const richTextMembers = [
  defineArrayMember({
    type: "block",
    styles: [
      { title: "Normal", value: "normal" },
      { title: "Heading", value: "h2" },
      { title: "Subheading", value: "h3" },
      { title: "Quote", value: "blockquote" },
    ],
    lists: [
      { title: "Bulleted", value: "bullet" },
      { title: "Numbered", value: "number" },
    ],
    marks: {
      decorators: [
        { title: "Bold", value: "strong" },
        { title: "Italic", value: "em" },
      ],
      annotations: [
        {
          name: "link",
          type: "object",
          title: "Link",
          fields: [
            defineField({
              name: "href",
              type: "url",
              title: "Address",
              description:
                "A page on this site starts with a slash, like /sod-calculator. Anything else needs the full address, like https://…",
              // allowRelative: without it, Sanity rejects "/sod-calculator" as an
              // invalid URL, so the client could not link to his own pages at all.
              // PortableTextBody already renders slash-prefixed hrefs as internal
              // next/link navigation.
              validation: (rule) =>
                rule.uri({
                  scheme: ["http", "https", "mailto", "tel"],
                  allowRelative: true,
                }),
            }),
          ],
        },
      ],
    },
  }),
  defineArrayMember({
    type: "image",
    options: { hotspot: true },
    fields: [
      defineField({
        name: "alt",
        title: "Describe this image",
        type: "string",
        validation: (rule) => rule.required().min(10),
      }),
      defineField({ name: "caption", title: "Caption", type: "string" }),
    ],
  }),
];
