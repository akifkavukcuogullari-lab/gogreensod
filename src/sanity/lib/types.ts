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
}

export type { SanityImageSource };
