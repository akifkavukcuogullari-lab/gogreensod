import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";

import { BUSINESS, SITE_URL } from "@/lib/business";

import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-display-src",
  display: "swap",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body-src",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Go Green Sod · Farm Direct Turf, Metro Atlanta",
    template: "%s · Go Green Sod",
  },
  description:
    "Zeon, Emerald and Meyers Zoysia plus Tifway 419 Bermuda, harvested the evening of delivery and on your Metro Atlanta job site by morning.",
  applicationName: BUSINESS.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: BUSINESS.name,
    locale: "en_US",
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0A0D08",
  colorScheme: "dark",
};

/**
 * Arms the scroll-reveal transitions before first paint.
 *
 * Without this the page would either flash its animations on a background tab
 * or, worse, sit invisible for anyone with JS disabled. `.rv` is visible by
 * default in CSS; this only opts in when animating is actually appropriate.
 */
const ARM_REVEAL = `
(function(){try{
  var m = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add(m || document.hidden ? 'no-anim' : 'js');
}catch(e){}})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ARM_REVEAL }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
