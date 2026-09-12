import "server-only";

import { sanityFetch } from "@/sanity/lib/fetch";
import {
  postBySlugQuery,
  postSlugsQuery,
  postsQuery,
} from "@/sanity/lib/queries";
import type { Post, PostCard } from "@/sanity/lib/types";

/** Cache tag the Sanity webhook invalidates when a post is published. */
export const POSTS_TAG = "post";

export const postTag = (slug: string) => `post:${slug}`;

export async function getPosts(): Promise<PostCard[]> {
  return sanityFetch<PostCard[]>({
    query: postsQuery,
    tags: [POSTS_TAG],
    fallback: [],
  });
}

export async function getPostSlugs(): Promise<string[]> {
  return sanityFetch<string[]>({
    query: postSlugsQuery,
    tags: [POSTS_TAG],
    fallback: [],
  });
}

export async function getPost(slug: string): Promise<Post | null> {
  return sanityFetch<Post | null>({
    query: postBySlugQuery,
    params: { slug },
    tags: [POSTS_TAG, postTag(slug)],
    fallback: null,
  });
}
