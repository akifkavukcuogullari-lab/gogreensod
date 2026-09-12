import { type NextRequest, NextResponse } from "next/server";

import { CANONICAL_HOSTS } from "@/lib/business";

/**
 * Keeps every host except the real domain out of search indexes.
 *
 * The site is served from gogreensod.com. Vercel also serves it from the
 * project hostname and from a unique URL per deployment, and any of those
 * could otherwise be indexed and then compete with the real domain — or be
 * handed to a model as the business's address.
 *
 * Canonical tags already point at gogreensod.com, but a canonical is a hint.
 * `X-Robots-Tag: noindex` is a directive, and applying it by request host
 * means this needs no environment flag and keeps working after launch with
 * nothing to remember.
 */
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const host = req.headers.get("host")?.split(":")[0].toLowerCase() ?? "";

  if (!CANONICAL_HOSTS.includes(host)) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return res;
}

export const config = {
  // Skip static assets and image optimisation — the header is only meaningful
  // on documents, and matching everything would add work on every asset.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|img/).*)"],
};
