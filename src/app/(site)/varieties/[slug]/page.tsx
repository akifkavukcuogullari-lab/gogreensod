import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCart } from "@/components/cart/AddToCart";
import { LongFormFaq, LongFormSections } from "@/components/site/LongForm";
import { ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { Section } from "@/components/ui/Section";
import { BUSINESS } from "@/lib/business";
import { FALLBACK_VARIETIES } from "@/lib/catalog";
import { getVarieties, getVarietyBySlug } from "@/lib/catalog.server";
import { centsToDollars } from "@/lib/pricing";
import { COMPARISONS, PAGE_META } from "@/lib/pages";
import { breadcrumbJsonLd, faqJsonLd, productJsonLd } from "@/lib/seo/jsonld";
import { createSlugger } from "@/lib/utils/slugify";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return FALLBACK_VARIETIES.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const variety = await getVarietyBySlug(slug);

  if (!variety) return { title: "Variety not found" };

  return {
    // The client can override either in Studio; otherwise both are derived, so
    // they can never contradict the price and specs on the page.
    title: variety.seoTitle || variety.name,
    description:
      variety.seoDescription ||
      `${variety.name} sod, ${centsToDollars(
        variety.pricePerPalletCents,
      )} per pallet covering ${variety.sqFtPerPallet} sq ft. Needs ${
        variety.sunNeeded
      } of sun. Harvested the day of delivery across Metro Atlanta.`,
    alternates: { canonical: `/varieties/${variety.slug}` },
    openGraph: {
      type: "website",
      title: `${variety.name} · Go Green Sod`,
      images: [{ url: variety.image.src }],
    },
  };
}

export default async function VarietyPage({ params }: Params) {
  const { slug } = await params;
  const variety = await getVarietyBySlug(slug);

  if (!variety) notFound();

  const others = (await getVarieties()).filter((v) => v.key !== variety.key);

  const sections = variety.sections ?? [];
  const faq = variety.faq ?? [];

  // One slugger for the whole page: section headings and any headings inside a
  // section body draw from the same pool, so two can never claim the same id.
  const slugFor = createSlugger();

  // Every comparison this variety appears in, straight from the registry, so a
  // new comparison links itself from the right variety pages automatically.
  const compareLinks = Object.entries(COMPARISONS)
    .filter(([, c]) => c.varieties.includes(variety.key))
    .map(([compareSlug, c]) => ({
      href: `/compare/${compareSlug}`,
      label: `Compare: ${PAGE_META[c.pageKey].breadcrumb}`,
    }))
    // The guide is the hub; every variety page points back into it.
    .concat({ href: PAGE_META.guide.path, label: "Atlanta sod guide" });

  return (
    <>
      <JsonLd data={productJsonLd(variety)} />
      {faq.length ? <JsonLd data={faqJsonLd(faq)} /> : null}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Varieties", path: "/varieties" },
          { name: variety.name, path: `/varieties/${variety.slug}` },
        ])}
      />

      <Section>
        <nav aria-label="Breadcrumb" className="text-muted mb-10 text-[0.85rem]">
          <Link href="/varieties" className="hover:text-bone transition-colors">
            Varieties
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-bone">{variety.name}</span>
        </nav>

        <div className="grid gap-[clamp(32px,5vw,72px)] lg:grid-cols-[1.1fr_.9fr]">
          <div className="border-line overflow-hidden rounded-[var(--radius-lg)] border">
            <Image
              src={variety.image.src}
              alt={variety.image.alt}
              width={variety.image.width}
              height={variety.image.height}
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>

          <div>
            <h1 className="text-[clamp(2.2rem,4.6vw,3.4rem)]">{variety.name}</h1>
            <p className="text-muted mt-5 max-w-[46ch] text-[1.05rem]">
              {variety.description}
            </p>

            <p className="mt-8 font-[family-name:var(--font-display)] text-[clamp(2.2rem,5vw,3rem)] font-extrabold tracking-[-.04em] tabular-nums">
              {centsToDollars(variety.pricePerPalletCents)}
              <span className="text-muted ml-3 text-[1rem] font-medium tracking-normal">
                per pallet
              </span>
            </p>

            <dl className="border-line mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t pt-8 sm:grid-cols-4 lg:grid-cols-2">
              <Spec label="Sun needed" value={variety.sunNeeded} />
              <Spec label="Blade" value={variety.blade} />
              <Spec
                label="Coverage"
                value={`${variety.sqFtPerPallet} sq ft`}
              />
              <Spec
                label={variety.highlight.label}
                value={variety.highlight.value}
              />
            </dl>

            <AddToCart
              className="mt-10"
              varietyKey={variety.key}
              name={variety.name}
            />

            <div className="mt-4 flex flex-wrap gap-3">
              <ButtonLink href="/sod-calculator" variant="ghost">
                Work out how many pallets
              </ButtonLink>
              <ButtonLink href={BUSINESS.phoneHref} variant="ghost">
                {`Call ${BUSINESS.phone}`}
              </ButtonLink>
            </div>

            <p className="text-muted mt-6 text-[0.85rem]">
              {`${BUSINESS.policy.minPallets} pallet minimum. Delivered from ${BUSINESS.deliveryWindow}, harvested the day it ships.`}
            </p>

            {compareLinks.length ? (
              <ul className="text-muted mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.85rem]">
                {compareLinks.map((c) => (
                  <li key={c.href}>
                    <Link
                      href={c.href}
                      className="text-accent underline decoration-1 underline-offset-2"
                    >
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </Section>

      <LongFormSections
        tinted
        sections={sections}
        slugFor={slugFor}
        tocTitle={`About ${variety.name}`}
      />

      <LongFormFaq faq={faq} heading={`Questions about ${variety.name}`} />

      <Section tinted>
        <h2 className="text-[clamp(1.6rem,3vw,2.2rem)]">Other varieties</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {others.map((v) => (
            <article key={v.key}>
              <Link
                href={`/varieties/${v.slug}`}
                className="border-line block overflow-hidden rounded-[var(--radius-md)] border"
              >
                <Image
                  src={v.image.src}
                  alt={v.image.alt}
                  width={v.image.width}
                  height={v.image.height}
                  sizes="(min-width: 640px) 30vw, 100vw"
                  className="aspect-[4/3] w-full object-cover"
                />
              </Link>
              <h3 className="mt-4 text-[1.1rem]">
                <Link href={`/varieties/${v.slug}`} className="hover:underline">
                  {v.name}
                </Link>
              </h3>
              <p className="text-muted mt-1 text-[0.9rem]">
                {`${v.sunNeeded} sun · ${centsToDollars(v.pricePerPalletCents)}`}
              </p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted text-[0.68rem] font-semibold tracking-[.16em] uppercase">
        {label}
      </dt>
      <dd className="mt-2 font-[family-name:var(--font-display)] text-[1.05rem] font-bold">
        {value}
      </dd>
    </div>
  );
}
