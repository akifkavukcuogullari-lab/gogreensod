import type { StructureResolver } from "sanity/structure";

/**
 * The Studio sidebar.
 *
 * Explicit rather than automatic: the client sees exactly six things, in the
 * order they matter to them, with Site settings pinned as a single editable
 * document instead of a list they could add duplicates to.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      // Paid orders first, soonest delivery at the top — the list the client
      // works from each day. Written by the Stripe webhook, never by hand.
      S.listItem()
        .title("Orders")
        .id("orders")
        .child(
          S.documentTypeList("order")
            .title("Orders")
            .defaultOrdering([{ field: "deliveryDate", direction: "asc" }]),
        ),
      S.divider(),
      S.documentTypeListItem("post").title("Blog posts"),
      S.documentTypeListItem("category").title("Categories"),
      S.divider(),
      S.documentTypeListItem("variety").title("Grass varieties"),
      S.documentTypeListItem("page").title("Pages"),
      S.divider(),
      S.listItem()
        .title("Site settings")
        .id("siteSettings")
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings")
            .title("Site settings"),
        ),
    ]);
