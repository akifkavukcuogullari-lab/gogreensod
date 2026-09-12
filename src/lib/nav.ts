/** Primary navigation. One list drives the desktop nav, the mobile menu and
 *  the footer, so a new page can never appear in only one of them. */
export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  { href: "/varieties", label: "Varieties" },
  { href: "/#estimate", label: "Estimate" },
  { href: "/#process", label: "How it works" },
  { href: "/blog", label: "Journal" },
  { href: "/faq", label: "FAQ" },
] as const;
