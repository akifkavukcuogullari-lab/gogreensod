import type { Metadata, Viewport } from "next";

import { sanityConfigured } from "@/sanity/env";

import { StudioClient } from "./StudioClient";

/**
 * Sanity Studio, embedded at /studio.
 *
 * Lives outside the (site) route group on purpose: the Studio ships its own
 * styling and reacts badly to the marketing layout's global resets, nav and
 * footer leaking in.
 */
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

// The Studio manages its own viewport behaviour.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export default function StudioPage() {
  if (!sanityConfigured) {
    return (
      <div style={{ padding: 40, fontFamily: "system-ui", lineHeight: 1.6 }}>
        <h1 style={{ fontSize: 20, margin: 0 }}>Studio not configured</h1>
        <p style={{ color: "#555" }}>
          Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> and redeploy.
        </p>
      </div>
    );
  }

  return <StudioClient />;
}
