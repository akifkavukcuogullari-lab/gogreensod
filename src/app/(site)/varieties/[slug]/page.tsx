import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PortableTextBody } from "@/components/blog/PortableTextBody";
import { Accordion } from "@/components/ui/Accordion";
import { ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { Section } from "@/components/ui/Section";
import { TableOfContents } from "@/components/ui/TableOfContents";
import { BUSINESS } from "@/lib/business";
import { FALLBACK_VARIETIES } from "@/lib/catalog";
import { getVarieties, getVarietyBySlug } from "@/lib/catalog.server";
import { centsToDollars } from "@/lib/pricing";
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
  const sectionIds = sections.map((section) => slugFor(section.heading));

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

            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/#estimate">Estimate my order</ButtonLink>
              <ButtonLink href={BUSINESS.phoneHref} variant="ghost">
                {`Call ${BUSINESS.phone}`}
              </ButtonLink>
            </div>

            <p className="text-muted mt-6 text-[0.85rem]">
              {`${BUSINESS.policy.minPallets} pallet minimum. Delivered between ${BUSINESS.deliveryWindow}, harvested the day it ships.`}
            </p>
          </div>
        </div>
      </Section>

      {sections.length ? (
        <Section tinted>
          <div className="grid gap-[clamp(32px,5vw,72px)] lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
            <div className="min-w-0">
              {sections.map((section, i) => (
                <section key={sectionIds[i]} className="rv">
                  <h2
                    id={sectionIds[i]}
                    className="mt-14 mb-5 max-w-[34ch] scroll-mt-28 text-[clamp(1.5rem,3vw,2.1rem)] first:mt-0"
                  >
                    {section.heading}
                  </h2>
                  <PortableTextBody value={section.body} slug={slugFor} />
                </section>
              ))}
            </div>

            <TableOfContents
              className="rv lg:sticky lg:top-28"
              title={`About ${variety.name}`}
              entries={sections.map((section, i) => ({
                id: sectionIds[i],
                text: section.heading,
                level: 2 as const,
              }))}
            />
          </div>
        </Section>
      ) : null}

      {faq.length ? (
        <Section>
          <div className="grid gap-[clamp(32px,5vw,72px)] lg:grid-cols-[.8fr_1.2fr]">
            <h2
              className="text-[clamp(2.1rem,5.2vw,3rem)]"
              style={{ maxWidth: "14ch" }}
            >
              {`Questions about ${variety.name}`}
            </h2>
            <div className="rv">
              <Accordion entries={faq} defaultOpenId={faq[0].id} />
            </div>
          </div>
        </Section>
      ) : null}

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
