import { cn } from "@/lib/utils/cn";

/** The page container: max-width plus the responsive side gutter. */
export function Shell({
  className,
  children,
  as: Tag = "div",
}: {
  className?: string;
  children: React.ReactNode;
  as?: "div" | "header" | "footer" | "nav";
}) {
  return (
    <Tag
      className={cn("mx-auto w-full", className)}
      style={{ maxWidth: "var(--shell)", paddingInline: "var(--pad)" }}
    >
      {children}
    </Tag>
  );
}
