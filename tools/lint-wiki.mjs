#!/usr/bin/env node
/**
 * Mechanical half of the wiki lint.
 *
 * The `/lint` skill covers the judgment checks — contradictions, stale claims,
 * missing pages. Those need reading. These do not: broken links, orphans, index
 * drift, missing aliases, and dangling sources are all countable, and counting
 * them by hand is exactly the bookkeeping the wiki pattern exists to avoid.
 *
 * Exits non-zero when something is broken (links, index, aliases). Orphans and
 * empty-source pages are reported but do not fail, since a fresh page can
 * legitimately sit unlinked for a moment.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { loadConfig } from "../dist/config.js";
import { WIKI_SUBDIRS } from "../dist/types/wiki.js";

const config = loadConfig();
const wikiRoot = join(config.vaultPath, config.paths.wiki);
const sourcesRoot = join(config.vaultPath, config.paths.sources);

if (!existsSync(wikiRoot)) {
  console.error(`No wiki at ${wikiRoot}`);
  process.exit(1);
}

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
const WIKILINK = /\[\[([^\]]+)\]\]/g;

/** Every markdown file under the wiki, excluding index.md and log.md */
function wikiPages() {
  const out = [];
  for (const sub of Object.values(WIKI_SUBDIRS)) {
    const dir = join(wikiRoot, sub);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".md") || f === "README.md") continue;
      out.push({ rel: `${sub}/${f}`, path: join(dir, f), stem: f.slice(0, -3) });
    }
  }
  return out;
}

const pages = wikiPages().map((p) => {
  const raw = readFileSync(p.path, "utf-8");
  const m = raw.match(FRONTMATTER);
  const front = m ? m[1] : "";
  const body = m ? m[2] : raw;
  const title = (body.match(/^#\s+(.+)$/m)?.[1] ?? p.stem).trim();
  const aliasLine = front.match(/^aliases:\s*\[(.*?)\]/m)?.[1] ?? "";
  const aliases = aliasLine.split(",").map((a) => a.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
  const sourceLine = front.match(/^sources:\s*\[(.*?)\]/m)?.[1] ?? "";
  const sources = sourceLine.split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
  const links = [...body.matchAll(WIKILINK)].map((mm) => mm[1].split("|")[0].trim());
  return { ...p, front, body, title, aliases, sources, links };
});

// Anything a [[link]] may legitimately resolve to
const resolvable = new Map();
for (const p of pages) {
  for (const key of [p.title, p.stem, ...p.aliases]) resolvable.set(key, p);
}

const inbound = new Map(pages.map((p) => [p.rel, 0]));
const broken = [];
for (const p of pages) {
  for (const link of p.links) {
    const target = resolvable.get(link);
    if (!target) broken.push({ from: p.rel, to: link });
    else if (target.rel !== p.rel) inbound.set(target.rel, inbound.get(target.rel) + 1);
  }
}

const orphans = pages.filter((p) => inbound.get(p.rel) === 0);
const noAlias = pages.filter((p) => !p.aliases.includes(p.title));
const emptySources = pages.filter((p) => p.sources.length === 0);

const clippings = existsSync(join(sourcesRoot, "Clippings"))
  ? new Set(readdirSync(join(sourcesRoot, "Clippings")))
  : new Set();
const dangling = [];
for (const p of pages) {
  for (const s of p.sources) if (clippings.size && !clippings.has(s)) dangling.push({ page: p.rel, source: s });
}

const indexPath = join(wikiRoot, "index.md");
const indexText = existsSync(indexPath) ? readFileSync(indexPath, "utf-8") : "";
const indexed = new Set([...indexText.matchAll(WIKILINK)].map((m) => m[1].split("|")[0].trim()));
const missingFromIndex = pages.filter((p) => !indexed.has(p.title) && !p.aliases.some((a) => indexed.has(a)));
const staleIndex = [...indexed].filter((t) => !resolvable.has(t));

console.log(`Wiki health — ${pages.length} pages\n`);
console.log(`  Broken links       ${broken.length}`);
console.log(`  Missing from index ${missingFromIndex.length}`);
console.log(`  Stale index entries${String(staleIndex.length).padStart(2)}`);
console.log(`  Orphans            ${orphans.length}`);
console.log(`  Missing aliases    ${noAlias.length}`);
console.log(`  Dangling sources   ${dangling.length}`);
console.log(`  Empty sources      ${emptySources.length}`);

const verbose = process.argv.includes("--verbose") || process.argv.includes("-v");
for (const b of broken) console.error(`    BROKEN       ${b.from} -> [[${b.to}]]`);
for (const p of missingFromIndex) console.error(`    NOT INDEXED  ${p.title}`);
for (const t of staleIndex) console.error(`    STALE INDEX  [[${t}]]`);
for (const p of noAlias) console.error(`    NO ALIAS     ${p.rel} (title "${p.title}")`);
for (const d of dangling) console.error(`    DANGLING     ${d.page} -> ${d.source}`);
if (verbose) {
  for (const p of orphans) console.log(`    orphan       ${p.rel}`);
  for (const p of emptySources) console.log(`    no sources   ${p.rel}`);
}

// Orphans and empty sources are smells, not breakage — a page written a minute ago
// is legitimately both. Only structural breakage fails the run.
const failed = broken.length + missingFromIndex.length + staleIndex.length + noAlias.length + dangling.length;
if (failed > 0) {
  console.error(`\n${failed} structural problem(s). Orphans and empty sources are reported, not failed.`);
  process.exit(1);
}
console.log("\nNo broken links, no index drift, no missing aliases.");
