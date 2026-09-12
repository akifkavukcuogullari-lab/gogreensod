import type { SchemaTypeDefinition } from "sanity";

import { category } from "./category";
import { post } from "./post";
import { siteSettings } from "./siteSettings";
import { variety } from "./variety";

export const schemaTypes: SchemaTypeDefinition[] = [
  post,
  category,
  variety,
  siteSettings,
];
