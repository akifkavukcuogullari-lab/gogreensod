"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  isVarietyKey,
  MAX_PALLETS_PER_LINE,
  type VarietyKey,
} from "@/lib/catalog";
import { isValidPalletCount, type CartItems } from "@/lib/pricing";

/**
 * The cart.
 *
 * Holds only what the customer chose — variety keys and pallet counts, plus the
 * ZIP and date they entered. Never a price: every amount is re-derived from the
 * live catalog on the server at checkout, so a cart saved last week at an old
 * price simply checks out at today's.
 *
 * Persisted to localStorage so a cart survives a reload. `skipHydration` is on:
 * the server always renders an empty cart, and rehydrating during store creation
 * would make the first client render disagree with the server HTML.
 * CartHydrator loads the saved cart after mount, and useCartHydrated gates
 * anything that displays counts.
 */

interface CartState {
  items: CartItems;
  zip: string;
  deliveryDate: string;
  setQuantity: (key: VarietyKey, quantity: number) => void;
  add: (key: VarietyKey, quantity: number) => void;
  remove: (key: VarietyKey) => void;
  setZip: (zip: string) => void;
  setDeliveryDate: (date: string) => void;
  /** Empties the pallets and date after a paid order. Keeps the ZIP. */
  clear: () => void;
}

type PersistedCart = Pick<CartState, "items" | "zip" | "deliveryDate">;

const clamp = (n: number) =>
  Number.isFinite(n)
    ? Math.min(MAX_PALLETS_PER_LINE, Math.max(0, Math.floor(n)))
    : 0;

/** Drops anything a stale or hand-edited localStorage entry could contain. */
export function sanitizeItems(raw: unknown): CartItems {
  const items: CartItems = {};
  if (!raw || typeof raw !== "object") return items;

  for (const [key, quantity] of Object.entries(raw)) {
    if (isVarietyKey(key) && isValidPalletCount(quantity)) items[key] = quantity;
  }
  return items;
}

function withQuantity(
  items: CartItems,
  key: VarietyKey,
  quantity: number,
): CartItems {
  const next = { ...items };
  const q = clamp(quantity);
  if (q === 0) delete next[key];
  else next[key] = q;
  return next;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: {},
      zip: "",
      deliveryDate: "",
      setQuantity: (key, quantity) =>
        set((s) => ({ items: withQuantity(s.items, key, quantity) })),
      add: (key, quantity) =>
        set((s) => ({
          items: withQuantity(s.items, key, (s.items[key] ?? 0) + quantity),
        })),
      remove: (key) => set((s) => ({ items: withQuantity(s.items, key, 0) })),
      setZip: (zip) => set({ zip: zip.slice(0, 10) }),
      setDeliveryDate: (deliveryDate) => set({ deliveryDate }),
      clear: () => set({ items: {}, deliveryDate: "" }),
    }),
    {
      name: "ggs-cart",
      version: 1,
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      partialize: (s): PersistedCart => ({
        items: s.items,
        zip: s.zip,
        deliveryDate: s.deliveryDate,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<PersistedCart>;
        return {
          ...current,
          items: sanitizeItems(saved.items),
          zip: typeof saved.zip === "string" ? saved.zip.slice(0, 10) : "",
          deliveryDate:
            typeof saved.deliveryDate === "string" ? saved.deliveryDate : "",
        };
      },
    },
  ),
);
