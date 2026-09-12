import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

import { CATALOG_TAG } from "@/lib/catalog.server";
import { PAGES_TAG } from "@/lib/pages.server";
import { POSTS_TAG, postTag } from "@/lib/blog.server";

/**
 * Sanity webhook → cache invalidation.
 *
 * Gives the client publish-to-live in seconds. The `revalidate: 60` floor in
 * sanityFetch is the backstop: if this endpoint is misconfigured or silently
 * failing, content still refreshes within a minute instead of freezing.
 *
 * Configure in sanity.io/manage → API → Webhooks:
 *   URL:     https://<site>/api/revalidate
 *   Trigger: create, update, delete
 *   Filter:  _type in ["post", "variety", "page", "siteSettings", "category"]
 *   Secret:  SANITY_REVALIDATE_SECRET
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Which cache tags each document type invalidates. */
function tagsFor(type: string, slug?: string): string[] {
  switch (type) {
    case "post":
      return slug ? [POSTS_TAG, postTag(slug)] : [POSTS_TAG];
    case "category":
      return [POSTS_TAG];
    case "variety":
      return [CATALOG_TAG];
    case "page":
      return [PAGES_TAG];
    case "siteSettings":
      return ["settings"];
    default:
      return [];
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;

  if (!secret) {
    console.error("[revalidate] SANITY_REVALIDATE_SECRET is not set");
    return NextResponse.json({ message: "Not configured" }, { status: 503 });
  }

  let body: { _type?: string; slug?: { current?: string } } | null;
  let isValidSignature: boolean | null;

  try {
    ({ body, isValidSignature } = await parseBody<{
      _type?: string;
      slug?: { current?: string };
    }>(req, secret));
  } catch (error) {
    console.error("[revalidate] could not parse webhook body", error);
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }

  if (!isValidSignature) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  if (!body?._type) {
    return NextResponse.json({ message: "Missing _type" }, { status: 400 });
  }

  const tags = tagsFor(body._type, body.slug?.current);

  if (tags.length === 0) {
    // Not an error: a document type we don't cache. Acknowledge so Sanity
    // doesn't retry.
    return NextResponse.json({ revalidated: false, type: body._type });
  }

  for (const tag of tags) revalidateTag(tag, { expire: 0 });

  return NextResponse.json({
    revalidated: true,
    type: body._type,
    tags,
    now: Date.now(),
  });
}
