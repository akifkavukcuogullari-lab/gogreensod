/**
 * Turns heading text into a URL fragment.
 *
 * Used to give long-form headings stable `id`s so a table of contents can link
 * to them and an AI assistant can cite a specific section rather than the whole
 * page. Deliberately simple and deterministic: the same heading text must
 * always produce the same id, on the server and in any client that re-derives
 * it.
 */
export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize("NFKD")
      // Strip combining marks so "Zoysia" and "Zóysia" collapse to one slug.
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

/**
 * Disambiguates repeated slugs within one document.
 *
 * Two headings reading "Delivery" would otherwise produce duplicate `id`s,
 * which is invalid HTML and makes anchor links jump to the wrong place. Call
 * once per document and reuse the returned function for every heading in it.
 */
export function createSlugger(): (text: string) => string {
  const seen = new Map<string, number>();

  return (text: string) => {
    const base = slugify(text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };
}
