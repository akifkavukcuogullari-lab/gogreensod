import type { SchemaTypeDefinition } from "sanity";

import { category } from "./category";
import { contentSection } from "./objects/contentSection";
import { faqItem } from "./objects/faqItem";
import { order } from "./order";
import { page } from "./page";
import { post } from "./post";
import { siteSettings } from "./siteSettings";
import { variety } from "./variety";

export const schemaTypes: SchemaTypeDefinition[] = [
  post,
  category,
  variety,
  page,
  order,
  siteSettings,
  // Reusable objects. Not documents — they only exist inside the types above.
  contentSection,
  faqItem,
];
