/** Primary navigation. One list drives the desktop nav, the mobile menu and
 *  the footer, so a new page can never appear in only one of them. */
export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  { href: "/varieties", label: "Varieties" },
  { href: "/sod-prices-atlanta", label: "Prices" },
  { href: "/sod-calculator", label: "Calculator" },
  { href: "/blog", label: "Journal" },
  { href: "/faq", label: "FAQ" },
] as const;

/**
 * Links that belong in the footer but not the primary nav.
 *
 * The desktop nav runs out of room past about five items. "How it works" and the
 * home-page estimator are still reachable from the page itself; the contractor
 * page is aimed at a reader who arrives by search, not by browsing.
 */
export const FOOTER_LINKS: readonly NavLink[] = [
  { href: "/atlanta-sod-guide", label: "Atlanta sod guide" },
  { href: "/contractor-sod-delivery-atlanta", label: "For contractors" },
  { href: "/#process", label: "How it works" },
] as const;
