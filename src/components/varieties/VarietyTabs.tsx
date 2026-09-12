"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { cn } from "@/lib/utils/cn";
import { AddToCart } from "@/components/cart/AddToCart";
import { centsToDollars } from "@/lib/pricing";
import type { Variety, VarietyKey } from "@/lib/catalog";

/**
 * Master/detail variety picker from the approved concept.
 *
 * Every panel stays mounted — inactive ones carry the `hidden` attribute
 * rather than being unmounted — so all four varieties are present in the
 * server HTML for crawlers that never run JavaScript or click a tab.
 */
export function VarietyTabs({ varieties }: { varieties: readonly Variety[] }) {
  const [active, setActive] = useState<VarietyKey>(varieties[0].key);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const dir = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const i = varieties.findIndex((v) => v.key === active);
    const next = varieties[(i + dir + varieties.length) % varieties.length];
    setActive(next.key);
    document.getElementById(`tab-${next.key}`)?.focus();
  };

  return (
    <div className="grid gap-[clamp(28px,4vw,64px)] lg:grid-cols-[.85fr_1.15fr]">
      <div role="tablist" aria-label="Turf varieties" onKeyDown={onKeyDown}>
        {varieties.map((v) => {
          const selected = v.key === active;
          return (
            <button
              key={v.key}
              id={`tab-${v.key}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`panel-${v.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(v.key)}
              className={cn(
                "border-line flex w-full items-baseline justify-between gap-4 border-t py-5 text-left transition-colors last:border-b",
                selected ? "text-bone" : "text-muted hover:text-bone",
              )}
            >
              <span className="font-[family-name:var(--font-display)] text-[clamp(1.1rem,2vw,1.4rem)] font-bold tracking-[-.02em]">
                {v.name}
              </span>
              <span
                className={cn(
                  "text-[0.9rem] font-semibold tabular-nums",
                  selected && "text-accent",
                )}
              >
                {centsToDollars(v.pricePerPalletCents)}
              </span>
            </button>
          );
        })}
      </div>

      <div>
        {varieties.map((v) => (
          <div
            key={v.key}
            id={`panel-${v.key}`}
            role="tabpanel"
            aria-labelledby={`tab-${v.key}`}
            hidden={v.key !== active}
          >
            <div className="border-line overflow-hidden rounded-[var(--radius-lg)] border">
              <Image
                src={v.image.src}
                alt={v.image.alt}
                width={v.image.width}
                height={v.image.height}
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>

            <h3 className="mt-7 text-[clamp(1.5rem,2.6vw,2rem)]">{v.name}</h3>
            <p className="text-muted mt-4 max-w-[48ch]">{v.description}</p>

            <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
              <Spec label="Sun needed" value={v.sunNeeded} />
              <Spec label="Blade" value={v.blade} />
              <Spec
                label="Per pallet"
                value={centsToDollars(v.pricePerPalletCents)}
              />
              <Spec label={v.highlight.label} value={v.highlight.value} />
            </dl>

            <AddToCart className="mt-8" varietyKey={v.key} name={v.name} />

            <Link
              href={`/varieties/${v.slug}`}
              className="text-accent mt-4 inline-block text-[0.95rem] font-semibold hover:underline"
            >
              More on {v.name} &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted text-[0.68rem] font-semibold tracking-[.16em] uppercase">
        {label}
      </dt>
      <dd className="mt-2 font-[family-name:var(--font-display)] text-[1.05rem] font-bold">
        {value}
      </dd>
    </div>
  );
}
