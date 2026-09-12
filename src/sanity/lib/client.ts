import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Served from our own cache via fetch tags, so Sanity's CDN would only add
  // a second layer of staleness we cannot invalidate.
  useCdn: false,
  perspective: "published",
});
