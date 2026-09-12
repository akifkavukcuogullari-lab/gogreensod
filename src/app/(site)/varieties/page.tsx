import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { JsonLd } from "@/components/ui/JsonLd";
import { Section, SectionHead } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { getVarieties } from "@/lib/catalog.server";
import { BUSINESS } from "@/lib/business";
import { centsToDollars } from "@/lib/pricing";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Sod Varieties",
  description:
    "Compare Zeon, Emerald and Meyers Zoysia and Tifway 419 Bermuda: sun requirements, blade type, coverage and price per pallet, delivered across Metro Atlanta.",
  alternates: { canonical: "/varieties" },
};

export default async function VarietiesPage() {
  const varieties = await getVarieties();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Varieties", path: "/varieties" },
        ])}
      />

      <Section>
        <SectionHead
          as="h1"
          title="Four grasses. Pick for your light."
          lede="We grow four turf varieties. How much sun the spot gets is the decision that matters — everything else follows from it."
        />

        {/* A real table: the most quotable asset on the site, and the shape
            search engines and AI assistants extract most reliably. */}
        <div className="rv -mx-[var(--pad)] overflow-x-auto px-[var(--pad)]">
          <table className="w-full min-w-[620px] border-collapse text-left">
            <caption className="sr-only">
              Go Green Sod turf varieties compared by sun requirement, blade
              type, coverage and price per pallet
            </caption>
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
                  <td className="text-muted py-5 pr-6">{`${v.sqFtPerPallet} sq ft`}</td>
                  <td className="text-accent py-5 pr-6 font-semibold tabular-nums">
                    {centsToDollars(v.pricePerPalletCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-muted mt-6 text-[0.85rem]">
          {`Every order has a ${BUSINESS.policy.minPallets} pallet minimum. Delivery only, quoted separately by address.`}
        </p>

        <div className="mt-[clamp(48px,7vw,88px)] grid gap-8 sm:grid-cols-2">
          {varieties.map((v) => (
            <article key={v.key} className="rv">
              <Link
                href={`/varieties/${v.slug}`}
                className="border-line block overflow-hidden rounded-[var(--radius-lg)] border"
              >
                <Image
                  src={v.image.src}
                  alt={v.image.alt}
                  width={v.image.width}
                  height={v.image.height}
                  sizes="(min-width: 640px) 45vw, 100vw"
                  className="aspect-[4/3] w-full object-cover"
                />
              </Link>
              <h2 className="mt-6 text-[clamp(1.4rem,2.4vw,1.9rem)]">
                <Link href={`/varieties/${v.slug}`} className="hover:underline">
                  {v.name}
                </Link>
              </h2>
              <p className="text-muted mt-3 max-w-[44ch]">{v.description}</p>
              <p className="mt-4 font-[family-name:var(--font-display)] font-bold">
                {centsToDollars(v.pricePerPalletCents)}
                <span className="text-muted ml-2 text-[0.85rem] font-normal">
                  per pallet
                </span>
              </p>
            </article>
          ))}
        </div>

        <div className="mt-[clamp(48px,7vw,88px)] flex flex-wrap gap-3">
          <ButtonLink href="/#estimate">Estimate my order</ButtonLink>
          <ButtonLink href={BUSINESS.phoneHref} variant="ghost">
            Call {BUSINESS.phone}
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
