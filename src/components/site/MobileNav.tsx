"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BUSINESS } from "@/lib/business";
import { NAV_LINKS } from "@/lib/nav";
import { cn } from "@/lib/utils/cn";

/**
 * Mobile navigation.
 *
 * The approved concept hid `.nav-links` below 1024px with no hamburger and no
 * toggle, leaving phones with no navigation at all. This is that fix.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on route change — otherwise the panel survives the navigation.
  // Adjusted during render rather than in an effect, so the closed panel is
  // never painted open for a frame after navigating.
  const [renderedPath, setRenderedPath] = useState(pathname);
  if (pathname !== renderedPath) {
    setRenderedPath(pathname);
    setOpen(false);
  }

  // Lock scroll and close on Escape while open.
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prevOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="border-line flex h-10 w-10 items-center justify-center rounded-full border"
      >
        <span className="relative block h-3 w-4" aria-hidden="true">
          <span
            className={cn(
              "bg-bone absolute left-0 h-px w-4 transition-all duration-300 ease-out-expo",
              open ? "top-1.5 rotate-45" : "top-0",
            )}
          />
          <span
            className={cn(
              "bg-bone absolute left-0 h-px w-4 transition-all duration-300 ease-out-expo",
              open ? "top-1.5 -rotate-45" : "top-3",
            )}
          />
        </span>
      </button>

      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!open}
        className="bg-ink fixed inset-x-0 top-[72px] bottom-0 z-50 overflow-y-auto"
        style={{ paddingInline: "var(--pad)" }}
      >
        <nav className="flex flex-col pt-6 pb-10">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="border-line-soft border-b py-5 font-[family-name:var(--font-display)] text-2xl font-bold tracking-[-.03em]"
            >
              {link.label}
            </Link>
          ))}

          <a
            href={BUSINESS.phoneHref}
            className="bg-accent text-accent-ink mt-8 rounded-full px-6 py-4 text-center font-semibold"
          >
            Call {BUSINESS.phone}
          </a>
          <a
            href={BUSINESS.emailHref}
            className="text-muted mt-4 text-center text-sm"
          >
            {BUSINESS.email}
          </a>
        </nav>
      </div>
    </div>
  );
}
