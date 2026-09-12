"use client";

import { useEffect } from "react";

import { useCart } from "@/lib/cart/store";

import { useCartHydrated } from "./CartHydrator";

/**
 * Empties the cart once an order is confirmed paid.
 *
 * Waits for hydration: the saved cart loads by merging over the in-memory one,
 * so clearing before that would be undone a moment later and the customer would
 * find their paid-for pallets still sitting in the cart.
 */
export function ClearCartOnSuccess() {
  const hydrated = useCartHydrated();

  useEffect(() => {
    if (hydrated) useCart.getState().clear();
  }, [hydrated]);

  return null;
}
