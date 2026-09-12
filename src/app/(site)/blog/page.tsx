import type { Metadata } from "next";

import { PostCard } from "@/components/blog/PostCard";
import { ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { Section, SectionHead } from "@/components/ui/Section";
import { BUSINESS, SITE_URL } from "@/lib/business";
import { getPosts } from "@/lib/blog.server";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Straight answers on laying sod in Metro Atlanta: choosing between zoysia and bermuda, watering new turf, and when to lay it.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Journal", path: "/blog" },
        ])}
      />
      {posts.length > 0 ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Blog",
            name: `${BUSINESS.name} Journal`,
            url: `${SITE_URL}/blog`,
            blogPost: posts.map((p) => ({
              "@type": "BlogPosting",
              headline: p.title,
              datePublished: p.publishedAt,
              dateModified: p._updatedAt,
              url: `${SITE_URL}/blog/${p.slug}`,
            })),
          }}
        />
      ) : null}

      <Section>
        <SectionHead
          title="Notes from the field"
          lede="What we tell people on the phone, written down. Choosing a grass, getting it in the ground, and keeping it alive through a Georgia summer."
        />

        {posts.length === 0 ? (
          <div className="border-line bg-surface-2 rv rounded-[var(--radius-md)] border p-[clamp(28px,4vw,56px)]">
            <h2 className="text-[1.3rem]">Nothing published yet</h2>
            <p className="text-muted mt-3 max-w-[46ch]">
              The first posts are on the way. In the meantime, call or text and
              we will answer anything you want to know about your yard.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href={BUSINESS.phoneHref}>
                Call {BUSINESS.phone}
              </ButtonLink>
              <ButtonLink href="/varieties" variant="ghost">
                Compare varieties
              </ButtonLink>
            </div>
          </div>
        ) : (
          <div className="grid gap-[clamp(36px,5vw,64px)] sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
