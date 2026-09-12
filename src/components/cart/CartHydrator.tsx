"use client";

import { useEffect, useSyncExternalStore } from "react";

import { useCart } from "@/lib/cart/store";

/**
 * Loads the saved cart after the first client render.
 *
 * Mounted once in the site layout. The store is created with `skipHydration`
 * so the server HTML and the first client paint both show an empty cart and
 * agree; this effect then pulls the real cart from localStorage.
 */
export function CartHydrator() {
  useEffect(() => {
    void useCart.persist.rehydrate();
  }, []);
  return null;
}

/**
 * False until the saved cart has loaded.
 *
 * Anything that shows a count or a total must wait on this, or it renders
 * "0 pallets" for a frame before the real cart arrives.
 */
export function useCartHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useCart.persist.onFinishHydration(onChange),
    () => useCart.persist.hasHydrated(),
    () => false,
  );
}
