import { defineQuery } from "next-sanity";

/** Fields every post listing needs. Kept in one place so cards can't drift. */
const POST_CARD = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  _updatedAt,
  coverImage,
  "category": category->{title, "slug": slug.current}
`;

export const postsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)]
    | order(publishedAt desc) { ${POST_CARD} }
`);

export const postSlugsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)].slug.current
`);

export const postBySlugQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug][0] {
    ${POST_CARD},
    body
  }
`);

export const varietiesQuery = defineQuery(`
  *[_type == "variety" && defined(key)] | order(order asc) {
    key,
    name,
    pricePerPallet,
    sqFtPerPallet,
    sunNeeded,
    blade,
    highlightLabel,
    highlightValue,
    description,
    image,
    order
  }
`);

export const siteSettingsQuery = defineQuery(`
  *[_type == "siteSettings"][0] {
    orderingEnabled,
    minLeadTimeDays,
    deliveryBlackoutDates,
    deliveryZones[]{name, fee, zips},
    unknownZipBehavior,
    fallbackFee,
    phone,
    email,
    announcement
  }
`);
