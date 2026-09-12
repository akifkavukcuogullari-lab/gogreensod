import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/business";
import { getVarieties } from "@/lib/catalog.server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const varieties = await getVarieties();
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
      url: `${SITE_URL}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
