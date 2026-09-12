import type { PortableTextBlock } from "@portabletext/react";
import type { SanityImageSource } from "@sanity/image-url";

export interface SanityImage {
  asset?: { _ref: string };
  alt?: string;
  caption?: string;
  hotspot?: unknown;
  crop?: unknown;
}

export interface PostCard {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  _updatedAt: string;
  coverImage: SanityImage | null;
  category: { title: string; slug: string } | null;
}

export interface Post extends PostCard {
  body: PortableTextBlock[];
}

/** Raw shape of a `variety` document, before mapping to the app's Variety. */
export interface VarietyDoc {
  key: string;
  name: string;
  pricePerPallet: number;
  sqFtPerPallet: number;
  sunNeeded: string;
  blade: string;
  highlightLabel: string;
  highlightValue: string;
  description: string;
  image: SanityImage | null;
  order: number;
  sections: VarietySectionDoc[] | null;
  faq: FaqItemDoc[] | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

/** A headed block of long-form copy on a variety page. */
export interface VarietySectionDoc {
  heading: string | null;
  body: PortableTextBlock[] | null;
}

/** One question and answer. `answer` is plain text because the same string is
 *  rendered on the page and emitted as FAQPage JSON-LD. */
export interface FaqItemDoc {
  question: string | null;
  answer: string | null;
}

/** Raw shape of a `page` document. Every field is optional except the key:
 *  the compiled entry in src/lib/pages.ts supplies anything missing. */
export interface PageDoc {
  key: string;
  title: string | null;
  intro: string | null;
  sections: VarietySectionDoc[] | null;
  faq: FaqItemDoc[] | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

export type { SanityImageSource };
