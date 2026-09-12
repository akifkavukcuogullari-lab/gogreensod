"use client";

import Link from "next/link";
import { useId, useState } from "react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { BUSINESS } from "@/lib/business";
import {
  MAX_PALLETS_PER_LINE,
  MIN_PALLETS_TOTAL,
  SQ_FT_PER_PALLET,
  type Variety,
} from "@/lib/catalog";
import { useCart } from "@/lib/cart/store";
import type { CheckoutResponse } from "@/lib/checkout/request";
import {
  checkDeliveryDate,
  formatDeliveryDate,
  quoteDelivery,
  type DeliverySettings,
} from "@/lib/delivery";
import { centsToDollars, meetsMinimum, totalPallets } from "@/lib/pricing";

import { useCartHydrated } from "./CartHydrator";

/** Only what the cart displays. Never used to charge anything. */
export type CartVariety = Pick<
  Variety,
  "key" | "slug" | "name" | "pricePerPalletCents"
>;

const labelClass =
  "text-muted block text-[0.68rem] font-semibold tracking-[.16em] uppercase";
const inputClass =
  "bg-ink border-line focus:border-accent mt-2 w-full rounded-[var(--radius-sm)] border px-4 py-3 text-[1rem] outline-none transition-colors";
const linkClass = "text-accent underline decoration-1 underline-offset-2";

/**
 * The cart.
 *
 * Totals, the delivery fee and the date check shown here are previews computed
 * with the same rules the server uses. They exist to guide the customer; the
 * amount actually charged is recomputed by /api/checkout from scratch.
 */
export function CartView({
  varieties,
  settings,
  earliestDate,
  latestDate,
  orderingAvailable,
  cancelled,
}: {
  varieties: readonly CartVariety[];
  settings: DeliverySettings;
  earliestDate: string;
  latestDate: string;
  /** Ordering is switched on in Studio AND Stripe is configured. */
  orderingAvailable: boolean;
  cancelled: boolean;
}) {
  const hydrated = useCartHydrated();
  const { items, zip, deliveryDate, setQuantity, remove, setZip, setDeliveryDate } =
    useCart();

  const zipId = useId();
  const dateId = useId();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!hydrated) {
    return (
      <p className="text-muted py-16" aria-busy="true">
        Loading your cart…
      </p>
    );
  }

  const lines = varieties.flatMap((variety) => {
    const pallets = items[variety.key];
    return pallets
      ? [{ variety, pallets, lineCents: pallets * variety.pricePerPalletCents }]
      : [];
  });

  if (!lines.length) {
    return (
      <div className="border-line bg-surface-2 rounded-[var(--radius-md)] border p-[clamp(24px,3.5vw,40px)]">
        {cancelled ? (
          <p className="mb-4">Checkout was cancelled.</p>
        ) : null}
        <p className="text-bone/85 max-w-[52ch]">
          {`Your cart is empty. Every order has a ${MIN_PALLETS_TOTAL} pallet minimum, and one pallet covers ${SQ_FT_PER_PALLET} square feet.`}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/varieties">Choose a grass</ButtonLink>
          <ButtonLink href="/sod-calculator" variant="ghost">
            Work out my pallets
          </ButtonLink>
        </div>
      </div>
    );
  }

  const pallets = totalPallets(items);
  const minimumMet = meetsMinimum(items);
  const sodCents = lines.reduce((sum, line) => sum + line.lineCents, 0);

  const quote = zip.trim() ? quoteDelivery(settings, zip) : null;
  const feeCents = quote?.kind === "fee" ? quote.feeCents : null;
  const dateCheck = deliveryDate ? checkDeliveryDate(settings, deliveryDate) : null;

  const ready = minimumMet && feeCents !== null && dateCheck?.ok === true;

  async function startCheckout() {
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, zip, deliveryDate }),
      });
      const data = (await res.json().catch(() => null)) as CheckoutResponse | null;

      if (res.ok && data && "url" in data) {
        window.location.assign(data.url);
        return;
      }
      setServerError(
        data && "error" in data
          ? data.error
          : `Something went wrong starting checkout. Please call ${BUSINESS.phone}.`,
      );
    } catch {
      setServerError(
        `We could not reach checkout. Check your connection, or call ${BUSINESS.phone}.`,
      );
    }
    setSubmitting(false);
  }

  return (
    <div className="grid gap-[clamp(32px,5vw,64px)] lg:grid-cols-[1.35fr_1fr] lg:items-start">
      <div>
        {cancelled ? (
          <p className="border-line bg-surface-2 mb-6 rounded-[var(--radius-sm)] border p-4 text-[0.95rem]">
            Checkout was cancelled. Your cart is saved.
          </p>
        ) : null}

        <ul className="border-line border-t">
          {lines.map(({ variety, pallets: count, lineCents }) => (
            <li
              key={variety.key}
              className="border-line-soft grid grid-cols-[1fr_auto] gap-4 border-b py-6"
            >
              <div>
                <Link
                  href={`/varieties/${variety.slug}`}
                  className="font-[family-name:var(--font-display)] text-[1.2rem] font-bold hover:underline"
                >
                  {variety.name}
                </Link>
                <p className="text-muted mt-1 text-[0.9rem]">
                  {`${centsToDollars(variety.pricePerPalletCents)} per pallet · covers ${(
                    count * SQ_FT_PER_PALLET
                  ).toLocaleString("en-US")} sq ft`}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <QuantityStepper
                    name={variety.name}
                    value={count}
                    onChange={(n) => setQuantity(variety.key, n)}
                  />
                  <button
                    type="button"
                    onClick={() => remove(variety.key)}
                    className="text-muted hover:text-bone text-[0.85rem] underline underline-offset-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <p className="font-[family-name:var(--font-display)] text-[1.2rem] font-bold tabular-nums">
                {centsToDollars(lineCents)}
              </p>
            </li>
          ))}
        </ul>

        {!minimumMet ? (
          <p className="border-accent/30 bg-accent/10 mt-6 rounded-[var(--radius-sm)] border p-4 text-[0.92rem]">
            {`Every order needs at least ${MIN_PALLETS_TOTAL} pallets. Add ${
              MIN_PALLETS_TOTAL - pallets
            } more to check out.`}
          </p>
        ) : null}
      </div>

      <aside className="border-line bg-surface-2 rounded-[var(--radius-md)] border p-[clamp(24px,3.5vw,40px)] lg:sticky lg:top-28">
        <h2 className="text-[1.6rem]">Delivery</h2>

        <div className="mt-6">
          <label htmlFor={zipId} className={labelClass}>
            Delivery ZIP code
          </label>
          <input
            id={zipId}
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={10}
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            className={inputClass}
          />
          <p aria-live="polite" className="mt-2 text-[0.85rem]">
            {quote === null ? (
              <span className="text-muted">We use it to price delivery.</span>
            ) : quote.kind === "invalid" ? (
              <span className="text-danger">Enter a five digit ZIP code.</span>
            ) : quote.kind === "quote" ? (
              <span>
                {`We price delivery to ${quote.zip} by phone. `}
                <a href={BUSINESS.phoneHref} className={linkClass}>
                  {`Call ${BUSINESS.phone}`}
                </a>
              </span>
            ) : (
              <span className="text-muted">
                {`Delivery to ${quote.zip}: ${centsToDollars(quote.feeCents)}`}
              </span>
            )}
          </p>
        </div>

        <div className="mt-6">
          <label htmlFor={dateId} className={labelClass}>
            Delivery date
          </label>
          <input
            id={dateId}
            type="date"
            min={earliestDate}
            max={latestDate}
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            className={`${inputClass} [color-scheme:dark]`}
          />
          <p aria-live="polite" className="mt-2 text-[0.85rem]">
            {dateCheck === null ? (
              <span className="text-muted">
                {`Earliest available: ${formatDeliveryDate(earliestDate)}.`}
              </span>
            ) : dateCheck.ok ? (
              <span className="text-muted">
                {`Delivered overnight on ${formatDeliveryDate(deliveryDate)}, from ${BUSINESS.deliveryWindow}.`}
              </span>
            ) : (
              <span className="text-danger">{dateCheck.message}</span>
            )}
          </p>
        </div>

        <dl className="border-line mt-8 border-t pt-6 text-[0.95rem]">
          <SummaryRow label="Pallets" value={`${pallets}`} />
          <SummaryRow label="Sod" value={centsToDollars(sodCents)} />
          <SummaryRow
            label="Delivery"
            value={feeCents === null ? "—" : centsToDollars(feeCents)}
          />
          <SummaryRow
            label="Total"
            value={feeCents === null ? "—" : centsToDollars(sodCents + feeCents)}
            total
          />
        </dl>

        {orderingAvailable ? (
          <>
            <Button
              type="button"
              onClick={startCheckout}
              disabled={!ready || submitting}
              className="mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Starting secure checkout…" : "Check out securely"}
            </Button>
            <p className="text-muted mt-3 text-[0.8rem]">
              Payment is handled by Stripe. Orders are paid in full before we
              harvest, because the grass is cut for you.
            </p>
          </>
        ) : (
          <div className="border-line mt-6 rounded-[var(--radius-sm)] border p-4">
            <p className="text-[0.92rem]">
              {`Online checkout is not open yet. Call ${BUSINESS.phone} with this order and we will book it.`}
            </p>
            <ButtonLink href={BUSINESS.phoneHref} className="mt-4">
              {`Call ${BUSINESS.phone}`}
            </ButtonLink>
          </div>
        )}

        {serverError ? (
          <p role="alert" className="text-danger mt-4 text-[0.9rem]">
            {serverError}
          </p>
        ) : null}
      </aside>
    </div>
  );
}

function QuantityStepper({
  name,
  value,
  onChange,
}: {
  name: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="border-line inline-flex items-center rounded-full border">
      <button
        type="button"
        aria-label={`One fewer pallet of ${name}`}
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
        className="h-10 w-10 text-[1.15rem] disabled:opacity-40"
      >
        −
      </button>
      <input
        aria-label={`Pallets of ${name}`}
        type="number"
        inputMode="numeric"
        min={1}
        max={MAX_PALLETS_PER_LINE}
        value={value}
        onChange={(e) => {
          const n = Number.parseInt(e.target.value, 10);
          if (Number.isInteger(n) && n >= 1) {
            onChange(Math.min(n, MAX_PALLETS_PER_LINE));
          }
        }}
        className="w-14 bg-transparent text-center tabular-nums outline-none"
      />
      <button
        type="button"
        aria-label={`One more pallet of ${name}`}
        disabled={value >= MAX_PALLETS_PER_LINE}
        onClick={() => onChange(value + 1)}
        className="h-10 w-10 text-[1.15rem] disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  total = false,
}: {
  label: string;
  value: string;
  total?: boolean;
}) {
  return (
    <div
      className={
        total
          ? "border-line mt-3 flex justify-between border-t pt-4 text-[1.15rem] font-bold"
          : "flex justify-between py-1.5"
      }
    >
      <dt className={total ? "" : "text-muted"}>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
