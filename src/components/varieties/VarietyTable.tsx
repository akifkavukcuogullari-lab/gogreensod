import Link from "next/link";

import type { Variety } from "@/lib/catalog";
import { centsToDollars } from "@/lib/pricing";
import { cn } from "@/lib/utils/cn";

/**
 * The variety comparison table.
 *
 * A real `<table>` is the shape search engines and AI assistants extract most
 * reliably — a spec grid built from divs carries no relationship between a
 * label and its value. Extracted from /varieties so the prices page and the
 * comparison pages render the identical markup instead of three tables that
 * drift apart.
 *
 * Accepts any subset of varieties, so a two-variety comparison is just a
 * filtered list.
 */
export function VarietyTable({
  varieties,
  caption,
  className,
}: {
  varieties: readonly Variety[];
  /** Screen-reader caption. Describe the specific comparison being made. */
  caption: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "-mx-[var(--pad)] overflow-x-auto px-[var(--pad)]",
        className,
      )}
    >
      <table className="w-full min-w-[620px] border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-line border-b">
            {["Variety", "Sun needed", "Blade", "Coverage", "Per pallet"].map(
              (h) => (
                <th
                  key={h}
                  scope="col"
                  className="text-muted py-4 pr-6 text-[0.68rem] font-semibold tracking-[.16em] uppercase"
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {varieties.map((v) => (
            <tr key={v.key} className="border-line-soft border-b">
              <th scope="row" className="py-5 pr-6 font-normal">
                <Link
                  href={`/varieties/${v.slug}`}
                  className="font-[family-name:var(--font-display)] text-[1.05rem] font-bold hover:underline"
                >
                  {v.name}
                </Link>
              </th>
              <td className="text-muted py-5 pr-6">{v.sunNeeded}</td>
              <td className="text-muted py-5 pr-6">{v.blade}</td>
              {/* Template literal, not adjacent nodes: React inserts a comment
                  between two children and splits "450 sq ft" in the served
                  HTML, which breaks verbatim extraction. */}
              <td className="text-muted py-5 pr-6">{`${v.sqFtPerPallet} sq ft`}</td>
              <td className="text-accent py-5 pr-6 font-semibold tabular-nums">
                {centsToDollars(v.pricePerPalletCents)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
