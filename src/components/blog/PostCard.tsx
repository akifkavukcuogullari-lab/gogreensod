import Link from "next/link";

import type { PostCard as PostCardType } from "@/sanity/lib/types";

import { SanityImage } from "./SanityImage";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export function PostCard({ post }: { post: PostCardType }) {
  return (
    <article className="rv">
      {post.coverImage?.asset ? (
        <Link
          href={`/blog/${post.slug}`}
          className="border-line block overflow-hidden rounded-[var(--radius-lg)] border"
        >
          <SanityImage
            image={post.coverImage}
            width={800}
            height={600}
            sizes="(min-width: 768px) 45vw, 100vw"
            className="aspect-[4/3] w-full object-cover"
          />
        </Link>
      ) : null}

      <div className="text-muted mt-5 flex flex-wrap items-center gap-3 text-[0.72rem] font-semibold tracking-[.14em] uppercase">
        {post.category ? <span className="text-accent">{post.category.title}</span> : null}
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
      </div>

      <h2 className="mt-3 text-[clamp(1.3rem,2.4vw,1.8rem)]">
        <Link href={`/blog/${post.slug}`} className="hover:underline">
          {post.title}
        </Link>
      </h2>

      <p className="text-muted mt-3 max-w-[46ch]">{post.excerpt}</p>
    </article>
  );
}
