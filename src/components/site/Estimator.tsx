"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/Button";
import {
  MIN_PALLETS_TOTAL,
  SQ_FT_PER_PALLET,
  type Variety,
  type VarietyKey,
} from "@/lib/catalog";
import {
  billablePalletsForSqFt,
  centsToDollars,
  formatSqFt,
  isBelowMinimum,
  parseArea,
} from "@/lib/pricing";
import { cn } from "@/lib/utils/cn";

interface Estimate {
  pallets: number;
  belowMinimum: boolean;
  variety: Variety;
  sqFt: number;
}

/**
 * Pallet estimator, ported from the approved concept including its exact
 * validation messages. In Release 2 the result gains an "Add to cart" action;
 * until then it hands off to the phone, as the current site does.
 */
export function Estimator({ varieties }: { varieties: readonly Variety[] }) {
  const areaId = useId();
  const varietyId = useId();

  const [area, setArea] = useState("");
  const [key, setKey] = useState<VarietyKey>(varieties[0].key);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Estimate | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = parseArea(area);
    if (!parsed.ok) {
      setError(parsed.message);
      setResult(null);
      return;
    }

    const variety = varieties.find((v) => v.key === key) ?? varieties[0];
    setError(null);
    setResult({
      pallets: billablePalletsForSqFt(parsed.sqFt),
      belowMinimum: isBelowMinimum(parsed.sqFt),
      variety,
      sqFt: parsed.sqFt,
    });
  }

  return (
    <div className="grid gap-[clamp(28px,4vw,64px)] md:grid-cols-2">
      <form onSubmit={onSubmit} noValidate>
        <div>
          <label
            htmlFor={areaId}
            className="text-muted text-[0.68rem] font-semibold tracking-[.16em] uppercase"
          >
            Area to cover
          </label>
          <input
            id={areaId}
            inputMode="decimal"
            autoComplete="off"
            placeholder="2400"
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
              if (error) setError(null);
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${areaId}-err` : undefined}
            className={cn(
              "bg-surface-2 mt-3 w-full rounded-[var(--radius-sm)] border px-4 py-3.5 text-[1rem] outline-none transition-colors",
              error ? "border-danger" : "border-line focus:border-accent",
            )}
          />
          <p className="text-muted mt-2 text-[0.8rem]">
            {`Square feet. One pallet covers ${SQ_FT_PER_PALLET} sq ft.`}
          </p>
          {error ? (
            <p id={`${areaId}-err`} role="alert" className="text-danger mt-2 text-[0.85rem]">
              {error}
            </p>
          ) : null}
        </div>

        <div className="mt-7">
          <label
            htmlFor={varietyId}
            className="text-muted text-[0.68rem] font-semibold tracking-[.16em] uppercase"
          >
            Variety
          </label>
          <select
            id={varietyId}
            value={key}
            onChange={(e) => setKey(e.target.value as VarietyKey)}
            className="bg-surface-2 border-line focus:border-accent mt-3 w-full rounded-[var(--radius-sm)] border px-4 py-3.5 text-[1rem] outline-none transition-colors"
          >
            {varieties.map((v) => (
              <option key={v.key} value={v.key}>
                {`${v.name} \u2014 ${centsToDollars(v.pricePerPalletCents)} / pallet`}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" className="mt-8 w-full sm:w-auto">
          Calculate pallets
        </Button>
      </form>

      <div
        aria-live="polite"
        className="border-line bg-surface-2 rounded-[var(--radius-md)] border p-[clamp(24px,3.5vw,40px)]"
      >
        {!result ? (
          <p className="text-muted">
            Enter your square footage and we will work out the pallets, the
            coverage and what the sod comes to.
          </p>
        ) : (
          <>
            <span className="text-muted text-[0.68rem] font-semibold tracking-[.16em] uppercase">
              You need
            </span>
            <p className="mt-3 font-[family-name:var(--font-display)] text-[clamp(3.2rem,8vw,5rem)] leading-none font-extrabold tracking-[-.04em] tabular-nums">
              {result.pallets}
              <span className="text-muted ml-3 text-[1.1rem] font-semibold tracking-normal">
                {result.pallets === 1 ? "pallet" : "pallets"}
              </span>
            </p>

            {result.belowMinimum ? (
              <p className="border-accent/30 bg-accent/10 mt-5 rounded-[var(--radius-sm)] border p-4 text-[0.88rem]">
                Your area needs less than {MIN_PALLETS_TOTAL} pallets, so we have
                rounded up to our {MIN_PALLETS_TOTAL} pallet minimum.
              </p>
            ) : null}

            <dl className="mt-7">
              <Row label="Variety" value={result.variety.name} />
              <Row label="Area" value={formatSqFt(result.sqFt)} />
              <Row
                label="Per pallet"
                value={centsToDollars(result.variety.pricePerPalletCents)}
              />
              <Row
                label="Sod subtotal"
                value={centsToDollars(
                  result.pallets * result.variety.pricePerPalletCents,
                )}
                total
              />
            </dl>

            <p className="text-muted mt-6 text-[0.82rem]">
              Delivery is quoted separately by address. Call to confirm before
              you book.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Row({
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
      className={cn(
        "border-line-soft flex items-baseline justify-between gap-4 border-t py-3.5",
        total && "border-line mt-2 border-t-2",
      )}
    >
      <dt className={cn("text-[0.9rem]", total ? "text-bone font-semibold" : "text-muted")}>
        {label}
      </dt>
      <dd
        className={cn(
          "font-[family-name:var(--font-display)] font-bold tabular-nums",
          total ? "text-accent text-[1.35rem]" : "text-[1rem]",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
