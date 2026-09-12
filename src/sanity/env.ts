import { publicEnv } from "@/lib/env";

export const apiVersion = publicEnv.NEXT_PUBLIC_SANITY_API_VERSION;
export const dataset = publicEnv.NEXT_PUBLIC_SANITY_DATASET;
export const projectId = publicEnv.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";

/**
 * Sanity is optional until the project is wired up. Every consumer checks
 * this so a missing project ID degrades to "no posts yet" rather than
 * failing the build or throwing at request time.
 */
export const sanityConfigured = projectId.length > 0;
