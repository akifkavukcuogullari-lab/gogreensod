"use client";

import { useEffect } from "react";

/**
 * Reveals `.rv` elements as they scroll into view.
 *
 * Mounted once per page. Elements are visible by default in CSS and only
 * hidden when `html.js` is set, so a failure here can never leave the page
 * blank. The timeout is a failsafe for the same reason.
 */
export function RevealObserver() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".rv"));
    const revealAll = () => nodes.forEach((n) => n.classList.add("on"));

    if (
      !("IntersectionObserver" in window) ||
      document.documentElement.classList.contains("no-anim")
    ) {
      revealAll();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("on");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.1 },
    );

    nodes.forEach((n) => io.observe(n));
    const failsafe = window.setTimeout(revealAll, 2600);

    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  return null;
}
