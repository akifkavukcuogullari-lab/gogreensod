"use client";

import Link from "next/link";

import { useCart } from "@/lib/cart/store";
import { totalPallets } from "@/lib/pricing";

import { useCartHydrated } from "./CartHydrator";

/** Cart link for the header. The count waits for the saved cart to load. */
export function CartBadge() {
  const hydrated = useCartHydrated();
  const count = useCart((s) => totalPallets(s.items));
  const show = hydrated && count > 0;

  return (
    <Link
      href="/cart"
      aria-label={show ? `Cart, ${count} ${count === 1 ? "pallet" : "pallets"}` : "Cart"}
      className="border-line hover:border-bone/40 flex h-10 items-center gap-2 rounded-full border px-4 text-[0.9rem] font-medium transition-colors"
    >
      <span>Cart</span>
      {show ? (
        <span
          aria-hidden="true"
          className="bg-accent text-accent-ink min-w-6 rounded-full px-1.5 text-center text-[0.75rem] font-bold tabular-nums"
        >
          {count}
        </span>
      ) : null}
    </Link>
  );
}
