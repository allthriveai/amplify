/**
 * Filename and identifier slugs.
 *
 * Wiki filenames are kebab-case while page titles are Title Case, so a title
 * round-trips to a filename through here and links are written from the title.
 */

/** Lowercase kebab-case slug. Strips a trailing .md so filenames can be re-slugged. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\.md$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Turn a slug or filename back into a Title Case page title.
 *
 * Lossy on purpose: it will not recover acronym casing (`rag` becomes `Rag`), so
 * read the title from a page's leading H1 when the page exists. This is for
 * seeding a new page, not for resolving links to existing ones.
 */
export function titleize(slug: string): string {
  return slugify(slug)
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
