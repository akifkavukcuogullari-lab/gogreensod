/**
 * On-page contents for long-form pages.
 *
 * Server-rendered plain anchors, no JavaScript: the links are in the HTML, so a
 * crawler reads the page's structure and an AI assistant can cite a specific
 * section rather than the whole document. Ids come from `extractHeadings`, which
 * shares its slugger logic with the renderer.
 */
export interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

export function TableOfContents({
  entries,
  title = "On this page",
  className,
}: {
  entries: readonly TocEntry[];
  title?: string;
  className?: string;
}) {
  // A contents list of one item is noise, not navigation.
  if (entries.length < 2) return null;

  return (
    <nav
      aria-label={title}
      className={`border-line bg-surface-2 rounded-[var(--radius-md)] border p-[clamp(20px,3vw,32px)] ${className ?? ""}`}
    >
      <h2 className="text-muted text-[0.68rem] font-semibold tracking-[.16em] uppercase">
        {title}
      </h2>
      <ol className="mt-5 space-y-2.5">
        {entries.map((e) => (
          <li key={e.id} className={e.level === 3 ? "pl-5" : undefined}>
            <a
              href={`#${e.id}`}
              className="text-bone/85 hover:text-accent text-[0.95rem] underline decoration-1 underline-offset-2 transition-colors"
            >
              {e.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
