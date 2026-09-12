import Link from "next/link";

import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "ghost";
type Size = "md" | "sm";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold " +
  "transition-transform duration-200 ease-out-expo will-change-transform " +
  "hover:-translate-y-0.5 active:scale-[.98] disabled:pointer-events-none disabled:opacity-45";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink hover:bg-accent-hi",
  ghost: "border border-line text-bone hover:border-bone/40",
};

const SIZES: Record<Size, string> = {
  md: "px-6 py-[13px] text-[0.95rem]",
  sm: "px-[18px] py-[9px] text-[0.85rem]",
};

function classes(variant: Variant, size: Size, className?: string) {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return <button className={classes(variant, size, className)} {...props} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  external,
  ...props
}: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  variant?: Variant;
  size?: Size;
  external?: boolean;
}) {
  const cls = classes(variant, size, className);

  // tel:, mailto: and off-site links must not go through the client router.
  if (external || /^(tel:|mailto:|https?:)/.test(href)) {
    return <a href={href} className={cls} {...props} />;
  }

  return <Link href={href} className={cls} {...props} />;
}
