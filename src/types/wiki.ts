/**
 * The wiki layer: LLM-owned pages distilled from the immutable source layer.
 *
 * Every page carries the same frontmatter regardless of kind. That uniformity is
 * the point — the vault previously ran four incompatible schemas, which made any
 * cross-cutting query impossible.
 */

/**
 * Wiki page kinds. Each maps to a subfolder under the wiki root.
 *
 * A distilled page about a source is a `summary`, filed in `Wiki/Summaries/`. It is
 * deliberately not called a "source" — the raw layer is `Sources/`, and the `sources`
 * frontmatter field points there. Two folders named Sources is how that gets confused.
 */
export type WikiPageKind = "summary" | "concept" | "entity" | "synthesis";

/** Subfolder name for each page kind, relative to the wiki root */
export const WIKI_SUBDIRS: Record<WikiPageKind, string> = {
  summary: "Summaries",
  concept: "Concepts",
  entity: "Entities",
  synthesis: "Synthesis",
};

/** The one frontmatter shape every wiki page uses */
export interface WikiFrontmatter {
  /** Topic tags in kebab-case */
  tags: string[];
  /** Filenames in the source layer this page was distilled from */
  sources: string[];
  /** YYYY-MM-DD */
  created: string;
  /** YYYY-MM-DD, bumped on every rewrite */
  updated: string;
  /**
   * Must contain the page's Title Case title. Filenames are kebab-case and
   * links are written from the title, so without this alias every inbound
   * [[Link]] to the page dangles. Additional aliases are welcome after it.
   */
  aliases: string[];
}

export interface WikiPage {
  /** Filename without path, kebab-case */
  filename: string;
  /** Which subfolder this page lives in */
  kind: WikiPageKind;
  /** Full path relative to vault root */
  path: string;
  /** Title Case page title, taken from the leading H1 */
  title: string;
  frontmatter: WikiFrontmatter;
  /** Raw markdown body (without frontmatter) */
  content: string;
  /** Page titles this page links out to, parsed from [[wikilinks]] */
  links: string[];
}

/** One line in the wiki index */
export interface IndexEntry {
  kind: WikiPageKind;
  /** Title Case page title, used as the wikilink target */
  title: string;
  /** One-line summary. Kept under 120 characters. */
  summary: string;
}

/** One append-only entry in the wiki log */
export interface LogEntry {
  /** YYYY-MM-DD */
  date: string;
  operation: "ingest" | "query" | "lint" | "restructure";
  title: string;
  /** What happened, one or two lines */
  detail: string;
}

/** Findings from a lint pass over the wiki */
export interface LintReport {
  /** Pages with no inbound links from any other page */
  orphans: string[];
  /** Wikilinks whose target page does not exist */
  brokenLinks: { from: string; to: string }[];
  /** Pages on disk but absent from the index */
  missingFromIndex: string[];
  /** Index entries pointing at pages that no longer exist */
  staleIndexEntries: string[];
  /** Pages whose `sources` frontmatter names a file not in the source layer */
  danglingSources: { page: string; source: string }[];
}
