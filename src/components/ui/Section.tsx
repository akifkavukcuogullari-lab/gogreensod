import { cn } from "@/lib/utils/cn";
import { Shell } from "./Shell";

/** A page section with the standard vertical rhythm. `tinted` matches the
 *  estimator and delivery bands from the concept. */
export function Section({
  id,
  tinted = false,
  className,
  children,
}: {
  id?: string;
  tinted?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "py-[clamp(72px,11vh,140px)]",
        tinted && "bg-surface border-y border-line-soft",
        className,
      )}
    >
      <Shell>{children}</Shell>
    </section>
  );
}

export function SectionHead({
  title,
  lede,
  narrow,
  className,
  as: Heading = "h2",
}: {
  title: React.ReactNode;
  lede?: React.ReactNode;
  /** Tightens the heading measure — the concept used 12ch on short headings. */
  narrow?: string;
  className?: string;
  /**
   * The heading level. Defaults to `h2` because this component was written for
   * sections inside a page that already has an `h1`.
   *
   * Pass `"h1"` when this is the page's own title — a page whose top heading is
   * an `h2` has no `h1` at all, which is how /varieties, /faq and /blog each
   * shipped without one.
   */
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn("rv mb-[clamp(40px,6vw,72px)]", className)}>
      <Heading
        className="text-[clamp(2.1rem,5.2vw,4rem)]"
        style={{ maxWidth: narrow ?? "16ch" }}
      >
        {title}
      </Heading>
      {lede ? (
        <p className="text-muted mt-4 max-w-[52ch] text-[clamp(1rem,1.5vw,1.125rem)]">
          {lede}
        </p>
      ) : null}
    </div>
  );
}
