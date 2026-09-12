import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/business";
import { getPosts } from "@/lib/blog.server";
import { getVarieties } from "@/lib/catalog.server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [varieties, posts] = await Promise.all([getVarieties(), getPosts()]);
  const now = new Date();

  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/varieties`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...varieties.map((v) => ({
      url: `${SITE_URL}/varieties/${v.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: `${SITE_URL}/blog`,
      lastModified: posts[0] ? new Date(posts[0]._updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: new Date(p._updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    {
      url: `${SITE_URL}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
