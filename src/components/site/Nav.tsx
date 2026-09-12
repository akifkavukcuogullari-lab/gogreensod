import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { BUSINESS } from "@/lib/business";
import { NAV_LINKS } from "@/lib/nav";

import { Brand } from "./Brand";
import { MobileNav } from "./MobileNav";

export function Nav() {
  return (
    <header className="border-line-soft bg-ink/70 sticky top-0 z-40 h-[72px] border-b backdrop-blur-xl">
      <div
        className="mx-auto flex h-full w-full items-center justify-between gap-8"
        style={{ maxWidth: "var(--shell)", paddingInline: "var(--pad)" }}
      >
        <Brand />

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted hover:text-bone text-[0.92rem] font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Visibility lives on a wrapper: ButtonLink's base classes already
              set `inline-flex`, and Tailwind resolves conflicting display
              utilities by stylesheet order rather than class order. */}
          <div className="hidden sm:block">
            <ButtonLink href={BUSINESS.phoneHref} size="sm">
              {BUSINESS.phone}
            </ButtonLink>
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
