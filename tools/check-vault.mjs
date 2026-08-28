#!/usr/bin/env node
/**
 * Assert that every path Lumis resolves actually exists in the vault.
 *
 * Config drift is silent: a renamed folder or a category that was configured but
 * never created leaves the resolver pointing at nothing, and the skill that uses
 * it quietly writes into a directory it just created rather than failing. This
 * catches that.
 *
 * Exits non-zero when something is missing, so it can gate a commit.
 */
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { loadConfig } from "../dist/config.js";
import { WIKI_SUBDIRS } from "../dist/types/wiki.js";

const config = loadConfig();

if (!config.vaultPath || !existsSync(config.vaultPath)) {
  console.error(`Vault path does not exist: ${config.vaultPath || "(unset)"}`);
  console.error("Set vaultPath in .lumisrc or the VAULT_PATH env var.");
  process.exit(1);
}

/** Paths that name a file rather than a directory */
const FILE_KEYS = new Set(["canvas", "voice", "goals"]);
/**
 * Files created by later workflows, not by init — the canvas by the first
 * /moment, Goals.md by /goals. Missing on a fresh vault is expected, so these
 * warn instead of failing the check.
 */
const LATER_KEYS = new Set(["canvas", "goals"]);
/** Not a path at all */
const SKIP_KEYS = new Set(["dailyNoteFormat"]);

const checks = [];

for (const [key, value] of Object.entries(config.paths)) {
  if (SKIP_KEYS.has(key)) continue;
  checks.push({ label: key, rel: value, kind: FILE_KEYS.has(key) ? "file" : "dir" });
}

// Conventions derived in paths.ts rather than named in config
checks.push(
  { label: "sources/Clippings", rel: join(config.paths.sources, "Clippings"), kind: "dir" },
  { label: "wiki/index.md", rel: join(config.paths.wiki, "index.md"), kind: "file" },
  { label: "wiki/log.md", rel: join(config.paths.wiki, "log.md"), kind: "file" },
  { label: "memory/sessions", rel: join(config.paths.memory, "sessions"), kind: "dir" },
  { label: "brand/Inspiration", rel: join(config.paths.brand, "Inspiration"), kind: "dir" },
);
for (const sub of Object.values(WIKI_SUBDIRS)) {
  checks.push({ label: `wiki/${sub}`, rel: join(config.paths.wiki, sub), kind: "dir" });
}

const missing = [];
const later = [];
const wrongKind = [];

for (const check of checks) {
  const abs = join(config.vaultPath, check.rel);
  if (!existsSync(abs)) {
    (LATER_KEYS.has(check.label) ? later : missing).push(check);
    continue;
  }
  const isDir = statSync(abs).isDirectory();
  if (check.kind === "dir" && !isDir) wrongKind.push({ ...check, found: "file" });
  if (check.kind === "file" && isDir) wrongKind.push({ ...check, found: "directory" });
}

console.log(`Vault: ${config.vaultPath}`);
console.log(`Checked ${checks.length} configured paths.`);

for (const l of later) {
  console.log(`  not yet  ${l.label.padEnd(22)} ${l.rel} (created by a later workflow — fine on a fresh vault)`);
}
if (missing.length === 0 && wrongKind.length === 0) {
  console.log("All required paths exist.");
  process.exit(0);
}

for (const m of missing) {
  console.error(`  MISSING  ${m.label.padEnd(22)} ${m.rel}`);
}
for (const w of wrongKind) {
  console.error(`  WRONG    ${w.label.padEnd(22)} ${w.rel} (expected ${w.kind}, found ${w.found})`);
}
console.error(`\n${missing.length} missing, ${wrongKind.length} wrong type.`);
process.exit(1);
