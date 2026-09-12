import Link from "next/link";

import { BUSINESS } from "@/lib/business";
import { NAV_LINKS } from "@/lib/nav";

import { Brand } from "./Brand";

export function Footer() {
  return (
    <footer className="border-line-soft bg-surface border-t">
      <div
        className="mx-auto w-full py-[clamp(56px,8vh,96px)]"
        style={{ maxWidth: "var(--shell)", paddingInline: "var(--pad)" }}
      >
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Brand />
            <p className="text-muted mt-5 max-w-[38ch] text-[0.95rem]">
              One of Atlanta&rsquo;s largest sod distributors. Farm direct turf
              grass, delivered across Metro Atlanta.
            </p>
          </div>

          <div>
            <h2 className="text-muted text-[0.7rem] font-semibold tracking-[.18em] uppercase">
              Explore
            </h2>
            <ul className="mt-5 space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted hover:text-bone text-[0.95rem] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-muted text-[0.7rem] font-semibold tracking-[.18em] uppercase">
              Get in touch
            </h2>
            <ul className="mt-5 space-y-3 text-[0.95rem]">
              <li>
                <a
                  href={BUSINESS.phoneHref}
                  className="text-muted hover:text-bone transition-colors"
                >
                  {BUSINESS.phone}
                </a>
              </li>
              <li>
                <a
                  href={BUSINESS.emailHref}
                  className="text-muted hover:text-bone transition-colors"
                >
                  {BUSINESS.email}
                </a>
              </li>
              <li>
                <a
                  href={BUSINESS.facebook}
                  target="_blank"
                  rel="noopener"
                  className="text-muted hover:text-bone transition-colors"
                >
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-line-soft text-muted mt-14 flex flex-col gap-3 border-t pt-8 text-[0.8rem] md:flex-row md:justify-between">
          <span>
            &copy; {new Date().getFullYear()} {BUSINESS.name} &middot; Atlanta,
            Georgia
          </span>
          <span>
            Deliveries run {BUSINESS.deliveryWindow} &middot;{" "}
            {BUSINESS.policy.minPallets} pallet minimum
          </span>
          <span>Design concept by NEXTLYN</span>
        </div>
      </div>
    </footer>
  );
}
