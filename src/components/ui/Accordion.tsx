"use client";

import { useState } from "react";

import { cn } from "@/lib/utils/cn";
import type { FaqEntry } from "@/lib/faq";

/**
 * FAQ accordion. Every answer stays in the DOM whether open or closed — the
 * grid-rows 0fr→1fr transition collapses it visually without removing it, so
 * crawlers that don't run JavaScript still read every answer.
 */
export function Accordion({
  entries,
  defaultOpenId,
}: {
  entries: readonly FaqEntry[];
  defaultOpenId?: string;
}) {
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(defaultOpenId ? [defaultOpenId] : []),
  );

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div>
      {entries.map((entry) => {
        const isOpen = open.has(entry.id);
        return (
          <div key={entry.id} className="border-line border-t last:border-b">
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-${entry.id}`}
                onClick={() => toggle(entry.id)}
                className="flex w-full items-center justify-between gap-6 py-6 text-left font-[family-name:var(--font-display)] text-[1.05rem] font-bold tracking-[-.02em]"
              >
                {entry.question}
                <span
                  aria-hidden="true"
                  className={cn(
                    "border-line relative h-8 w-8 shrink-0 rounded-full border transition-transform duration-300 ease-out-expo",
                    isOpen && "bg-accent border-accent rotate-45",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1/2 left-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2",
                      isOpen ? "bg-accent-ink" : "bg-bone",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute top-1/2 left-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2",
                      isOpen ? "bg-accent-ink" : "bg-bone",
                    )}
                  />
                </span>
              </button>
            </h3>
            <div
              id={`faq-${entry.id}`}
              className="grid transition-[grid-template-rows] duration-[400ms] ease-out-expo"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="text-muted max-w-[56ch] pb-6">{entry.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
