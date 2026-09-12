import type { StructureResolver } from "sanity/structure";

/**
 * The Studio sidebar.
 *
 * Explicit rather than automatic: the client sees exactly five things, in the
 * order they matter to them, with Site settings pinned as a single editable
 * document instead of a list they could add duplicates to.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
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
