import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PortableTextBody } from "@/components/blog/PortableTextBody";
import { SanityImage } from "@/components/blog/SanityImage";
import { ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { Section } from "@/components/ui/Section";
import { BUSINESS, SITE_URL } from "@/lib/business";
import { getPost, getPostSlugs } from "@/lib/blog.server";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { urlForImage } from "@/sanity/lib/image";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return { title: "Post not found", robots: { index: false } };

  const ogImage = post.coverImage?.asset
    ? urlForImage(post.coverImage).width(1200).height(630).url()
    : undefined;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
      publishedTime: post.publishedAt,
      modifiedTime: post._updatedAt,
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
    },
  };
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.publishedAt,
          dateModified: post._updatedAt,
          url: `${SITE_URL}/blog/${post.slug}`,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${SITE_URL}/blog/${post.slug}`,
          },
          ...(post.coverImage?.asset
            ? { image: urlForImage(post.coverImage).width(1200).url() }
            : {}),
          author: { "@type": "Organization", name: BUSINESS.name },
          publisher: {
            "@type": "Organization",
            name: BUSINESS.name,
            url: SITE_URL,
          },
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Journal", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />

      <Section>
        <article className="mx-auto max-w-[760px]">
          <nav aria-label="Breadcrumb" className="text-muted mb-8 text-[0.85rem]">
            <Link href="/blog" className="hover:text-bone transition-colors">
              Journal
            </Link>
          </nav>

          <div className="text-muted flex flex-wrap items-center gap-3 text-[0.72rem] font-semibold tracking-[.14em] uppercase">
            {post.category ? (
              <span className="text-accent">{post.category.title}</span>
            ) : null}
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          </div>

          <h1 className="mt-4 text-[clamp(2rem,4.4vw,3.2rem)]">{post.title}</h1>
          <p className="text-muted mt-5 max-w-[54ch] text-[1.1rem]">
            {post.excerpt}
          </p>

          {post.coverImage?.asset ? (
            <div className="border-line mt-10 overflow-hidden rounded-[var(--radius-lg)] border">
              <SanityImage
                image={post.coverImage}
                width={1400}
                height={933}
                priority
                sizes="(min-width: 768px) 760px, 100vw"
                className="h-auto w-full"
              />
            </div>
          ) : null}

          <div className="mt-12">
            <PortableTextBody value={post.body} />
          </div>

          <aside className="border-line bg-surface-2 mt-16 rounded-[var(--radius-md)] border p-[clamp(24px,3.5vw,40px)]">
            <h2 className="text-[1.25rem]">Ready to order?</h2>
            <p className="text-muted mt-3 max-w-[44ch]">
              {`Four grasses, ${BUSINESS.policy.minPallets} pallet minimum, delivered across Metro Atlanta between ${BUSINESS.deliveryWindow}.`}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/sod-calculator">Estimate my order</ButtonLink>
              <ButtonLink href={BUSINESS.phoneHref} variant="ghost">
                {`Call ${BUSINESS.phone}`}
              </ButtonLink>
            </div>
          </aside>
        </article>
      </Section>
    </>
  );
}
