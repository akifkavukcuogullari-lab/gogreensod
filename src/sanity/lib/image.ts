import createImageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";

import { dataset, projectId } from "../env";

const builder = createImageUrlBuilder({ projectId, dataset });

/** Builds a CDN URL for a Sanity image, respecting the editor's hotspot. */
export function urlForImage(source: SanityImageSource) {
  return builder.image(source).auto("format").fit("max");
}
