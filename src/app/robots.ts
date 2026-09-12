import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/business";

/**
 * Crawler policy.
 *
 * AI crawlers are allowed EXPLICITLY rather than by omission. Being cited by
 * ChatGPT, Perplexity and Google's AI Overviews is a stated goal for this
 * site, and the usual reason a business is invisible to them is a blanket
 * block it never knew it had.
 *
 * `OAI-SearchBot` feeds ChatGPT's search results and `Google-Extended`
 * governs AI Overviews independently of Googlebot — blocking that one removes
 * the site from AI answers while ordinary search looks perfectly healthy.
 *
 * NOTE: a host-level firewall (Vercel's bot protection included) can reject
 * these before robots.txt is ever read. Verify after deploy by requesting the
 * site with each user-agent, not by reading this file.
 */
const AI_CRAWLERS = [
  "OAI-SearchBot",
  "GPTBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
  "Claude-User",
  "anthropic-ai",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "CCBot",
];

/** No value in an index, and checkout URLs in search results are noise. */
const PRIVATE_PATHS = ["/api/", "/studio", "/cart", "/checkout/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: PRIVATE_PATHS,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
