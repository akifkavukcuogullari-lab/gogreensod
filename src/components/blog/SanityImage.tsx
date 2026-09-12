import Image from "next/image";

import { urlForImage } from "@/sanity/lib/image";
import type { SanityImage as SanityImageType } from "@/sanity/lib/types";

/**
 * Renders a Sanity image through next/image.
 *
 * Alt text is required by the schema, so a missing one means the document
 * predates that rule — fall back to empty rather than inventing a
 * description, which would be worse than none for a screen reader.
 */
export function SanityImage({
  image,
  width,
  height,
  sizes,
  priority = false,
  className,
}: {
  image: SanityImageType;
  width: number;
  height: number;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!image?.asset) return null;

  return (
    <Image
      src={urlForImage(image).width(width).height(height).url()}
      alt={image.alt ?? ""}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
