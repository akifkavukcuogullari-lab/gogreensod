import type { Metadata } from "next";

import { CartView } from "@/components/cart/CartView";
import { Section } from "@/components/ui/Section";
import { MIN_PALLETS_TOTAL } from "@/lib/catalog";
import { getVarieties } from "@/lib/catalog.server";
import { earliestDeliveryDate, latestDeliveryDate } from "@/lib/delivery";
import { isStripeConfigured } from "@/lib/env";
import { getDeliverySettings } from "@/lib/settings.server";

export const metadata: Metadata = {
  title: "Your cart",
  robots: { index: false, follow: false },
};

/**
 * Rendered per request: the earliest bookable date depends on today, and a
 * statically built cart would offer yesterday's dates until the next deploy.
 */
export const dynamic = "force-dynamic";

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string }>;
}) {
  const [{ cancelled }, varieties, settings] = await Promise.all([
    searchParams,
    getVarieties(),
    getDeliverySettings(),
  ]);

  return (
    <Section>
      <div className="mb-[clamp(32px,5vw,56px)]">
        <h1 className="text-[clamp(2.1rem,5.2vw,4rem)]">Your cart</h1>
        <p className="text-muted mt-4 max-w-[58ch] text-[clamp(1rem,1.5vw,1.125rem)]">
          {`Choose your pallets, a delivery ZIP and a date. Every order has a ${MIN_PALLETS_TOTAL} pallet minimum, and sod is cut the day it ships.`}
        </p>
      </div>

      <CartView
        // Display fields only; section bodies and FAQs stay on the server.
        varieties={varieties.map(({ key, slug, name, pricePerPalletCents }) => ({
          key,
          slug,
          name,
          pricePerPalletCents,
        }))}
        settings={settings}
        earliestDate={earliestDeliveryDate(settings)}
        latestDate={latestDeliveryDate()}
        orderingAvailable={settings.orderingEnabled && isStripeConfigured()}
        cancelled={cancelled === "1"}
      />
    </Section>
  );
}
