"use client";

import Link from "next/link";
import { useId, useState } from "react";

import { Button } from "@/components/ui/Button";
import {
  MAX_PALLETS_PER_LINE,
  MIN_PALLETS_TOTAL,
  type VarietyKey,
} from "@/lib/catalog";
import { useCart } from "@/lib/cart/store";
import { cn } from "@/lib/utils/cn";

import { useCartHydrated } from "./CartHydrator";

/**
 * Adds pallets of one variety to the cart.
 *
 * Disabled until the saved cart has loaded: the store rehydrates by merging the
 * saved cart over the current one, so an add clicked in that first instant would
 * be overwritten and silently lost.
 */
export function AddToCart({
  varietyKey,
  name,
  initialQuantity = MIN_PALLETS_TOTAL,
  className,
}: {
  varietyKey: VarietyKey;
  name: string;
  initialQuantity?: number;
  className?: string;
}) {
  const inputId = useId();
  const hydrated = useCartHydrated();
  const add = useCart((s) => s.add);
  const inCart = useCart((s) => s.items[varietyKey] ?? 0);

  const [quantity, setQuantity] = useState(String(initialQuantity));
  const [added, setAdded] = useState<number | null>(null);

  const parsed = Number.parseInt(quantity, 10);
  const valid =
    Number.isInteger(parsed) && parsed >= 1 && parsed <= MAX_PALLETS_PER_LINE;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label
            htmlFor={inputId}
            className="text-muted block text-[0.68rem] font-semibold tracking-[.16em] uppercase"
          >
            Pallets
          </label>
          <input
            id={inputId}
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_PALLETS_PER_LINE}
            step={1}
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setAdded(null);
            }}
            className="bg-surface-2 border-line focus:border-accent mt-2 w-24 rounded-[var(--radius-sm)] border px-4 py-3 text-[1rem] tabular-nums outline-none transition-colors"
          />
        </div>
        <Button
          type="button"
          disabled={!hydrated || !valid}
          className="disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => {
            add(varietyKey, parsed);
            setAdded(parsed);
          }}
        >
          Add to cart
        </Button>
      </div>

      <p aria-live="polite" className="text-muted min-h-[1.4em] text-[0.85rem]">
        {added !== null ? (
          <>
            {`Added ${added} ${added === 1 ? "pallet" : "pallets"} of ${name}. `}
            <Link
              href="/cart"
              className="text-accent underline decoration-1 underline-offset-2"
            >
              View cart
            </Link>
          </>
        ) : hydrated && inCart > 0 ? (
          <>
            {`${inCart} ${inCart === 1 ? "pallet" : "pallets"} already in your cart. `}
            <Link
              href="/cart"
              className="text-accent underline decoration-1 underline-offset-2"
            >
              View cart
            </Link>
          </>
        ) : null}
      </p>
    </div>
  );
}
