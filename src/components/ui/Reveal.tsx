"use client";

import { useEffect } from "react";

/** Reveal anything still hidden this long after it appears, visible or not. */
const FAILSAFE_MS = 2600;

/**
 * Reveals `.rv` elements as they scroll into view.
 *
 * Mounted once, in the site layout — and the layout persists across client-side
 * navigation. The first version scanned the document a single time on mount, so
 * every `.rv` element on the NEXT page a visitor clicked through to was never
 * observed and stayed at opacity 0 until a full refresh. It now watches the
 * document for `.rv` elements added at any time: a new route, streamed content,
 * or anything a client component renders later.
 *
 * Elements are visible by default in CSS and only hidden when `html.js` is set,
 * so a failure here can never blank the page on its own. The per-batch failsafe
 * exists for the same reason: nothing stays hidden longer than FAILSAFE_MS.
 */
export function RevealObserver() {
  useEffect(() => {
    const hiddenNodes = () =>
      Array.from(document.querySelectorAll<HTMLElement>(".rv:not(.on)"));
    const reveal = (node: Element) => node.classList.add("on");

    // Nothing is hidden when animation is off, but mark elements revealed anyway
    // so state stays consistent if the class ever changes mid-visit.
    if (
      !("IntersectionObserver" in window) ||
      document.documentElement.classList.contains("no-anim")
    ) {
      hiddenNodes().forEach(reveal);
      const mo = new MutationObserver(() => hiddenNodes().forEach(reveal));
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.1 },
    );

    const tracked = new WeakSet<Element>();
    const timers = new Set<number>();

    const trackNew = () => {
      const fresh = hiddenNodes().filter((node) => !tracked.has(node));
      if (!fresh.length) return;

      for (const node of fresh) {
        tracked.add(node);
        io.observe(node);
      }

      const timer = window.setTimeout(() => {
        fresh.forEach(reveal);
        timers.delete(timer);
      }, FAILSAFE_MS);
      timers.add(timer);
    };

    trackNew();

    // Coalesce bursts of DOM changes (a route swap mutates many nodes at once)
    // into a single scan per frame.
    let frame = 0;
    const mo = new MutationObserver(() => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        trackNew();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return null;
}
