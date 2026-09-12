import {
  PortableText,
  type PortableTextComponents,
  type PortableTextBlock,
} from "@portabletext/react";

import { urlForImage } from "@/sanity/lib/image";
import { createSlugger } from "@/lib/utils/slugify";
import type { SanityImage as SanityImageType } from "@/sanity/lib/types";
import Image from "next/image";
import Link from "next/link";

/** Plain text of a block, for deriving a heading's anchor id. */
function blockText(value: unknown): string {
  const children = (value as { children?: { text?: string }[] })?.children;
  return (children ?? []).map((c) => c?.text ?? "").join("");
}

/**
 * Headings in document order, with the ids `PortableTextBody` will render.
 *
 * Both this and the renderer walk the h2/h3 blocks in the same order through an
 * identical slugger, so a table of contents built from this always links to
 * anchors that exist.
 */
export function extractHeadings(
  value: PortableTextBlock[],
): { id: string; text: string; level: 2 | 3 }[] {
  const slug = createSlugger();

  return (value ?? []).flatMap((block) => {
    const style = (block as { style?: string }).style;
    if (style !== "h2" && style !== "h3") return [];
    const text = blockText(block);
    if (!text.trim()) return [];
    return [{ id: slug(text), text, level: style === "h2" ? 2 : 3 } as const];
  });
}

/**
 * Built per document rather than shared at module scope, because the heading
 * slugger has to be able to disambiguate repeated headings within one body.
 */
function buildComponents(slug: (text: string) => string): PortableTextComponents {
  return {
  block: {
    normal: ({ children }) => (
      <p className="text-bone/85 mb-6 max-w-[68ch] leading-[1.75]">{children}</p>
    ),
    h2: ({ children, value }) => (
      <h2
        id={slug(blockText(value))}
        className="mt-14 mb-5 max-w-[34ch] scroll-mt-28 text-[clamp(1.5rem,3vw,2.1rem)]"
      >
        {children}
      </h2>
    ),
    h3: ({ children, value }) => (
      <h3
        id={slug(blockText(value))}
        className="mt-10 mb-4 max-w-[40ch] scroll-mt-28 text-[clamp(1.2rem,2.2vw,1.5rem)]"
      >
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-accent text-bone my-8 max-w-[60ch] border-l-2 pl-6 text-[1.1rem] italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="text-bone/85 mb-6 max-w-[64ch] list-disc space-y-2 pl-6">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="text-bone/85 mb-6 max-w-[64ch] list-decimal space-y-2 pl-6">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="text-bone font-semibold">{children}</strong>
    ),
    link: ({ children, value }) => {
      const href = String(value?.href ?? "");
      const internal = href.startsWith("/");
      const cls = "text-accent underline decoration-1 underline-offset-2";

      if (internal) {
        return (
          <Link href={href} className={cls}>
            {children}
          </Link>
        );
      }
      return (
        <a
          href={href}
          className={cls}
          {...(/^https?:/.test(href)
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }: { value: SanityImageType }) => {
      if (!value?.asset) return null;
      return (
        <figure className="my-10">
          <div className="border-line overflow-hidden rounded-[var(--radius-md)] border">
            <Image
              src={urlForImage(value).width(1400).url()}
              alt={value.alt ?? ""}
              width={1400}
              height={933}
              sizes="(min-width: 768px) 70vw, 100vw"
              className="h-auto w-full"
            />
          </div>
          {value.caption ? (
            <figcaption className="text-muted mt-3 text-[0.85rem]">
              {value.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
  },
  };
}

export function PortableTextBody({
  value,
  slug,
}: {
  value: PortableTextBlock[];
  /**
   * A slugger shared with the rest of the page.
   *
   * Pass one when the page renders several bodies, or renders its own headings
   * alongside them — otherwise each body slugs independently and two headings
   * can end up claiming the same `id`. Omit it for a single self-contained
   * body, such as a blog post.
   */
  slug?: (text: string) => string;
}) {
  return (
    <PortableText
      value={value}
      components={buildComponents(slug ?? createSlugger())}
    />
  );
}
