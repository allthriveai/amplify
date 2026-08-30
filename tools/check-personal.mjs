#!/usr/bin/env node
/**
 * Personal-data guard for a public repo.
 *
 * Amplify is open source. Everything personal — moments, goals, journal entries,
 * names, vault paths — belongs in the user's private Obsidian vault, never here.
 * This blocks the common ways that boundary gets crossed by accident.
 *
 *   node tools/check-personal.mjs            scan every tracked file
 *   node tools/check-personal.mjs --staged   scan staged changes (pre-commit)
 *
 * The patterns below are deliberately generic so this file is safe to publish.
 * Names of real people belong in `.personal-patterns`, which is gitignored —
 * one pattern per line, `#` for comments.
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

const STAGED = process.argv.includes("--staged");

/** Extensions worth reading as text */
const TEXT = /\.(ts|tsx|js|jsx|mjs|cjs|json|md|txt|ya?ml|html|css|sh|example)$/i;

/** Paths exempt from every rule */
const ALLOW_PATHS = [
  /^tools\/check-personal\.mjs$/,   // this file describes the patterns
  /^\.gitignore$/,
  /^package-lock\.json$/,
];

/**
 * Paths where naming the author and the project is the point — a public repo
 * needs its own URL and attribution. Local name rules are skipped here, but the
 * hard rules (keys, home paths, emails, vault paths) still apply.
 */
const ATTRIBUTION_PATHS = [
  /^package\.json$/,
  /^README\.md$/,
  /^LICENSE$/,
];

const RULES = [
  {
    id: "home-path",
    severity: "error",
    // A committed absolute home path leaks the author's username and layout
    re: /\/(?:Users|home)\/(?!runner\b|user\b|you\b|username\b)[A-Za-z0-9._-]+\//g,
    hint: "Absolute home path. Use a config value or a relative path.",
  },
  {
    id: "windows-home-path",
    severity: "error",
    re: /[A-Z]:\\Users\\(?!Public\b)[A-Za-z0-9._-]+\\/g,
    hint: "Absolute Windows home path. Use a config value.",
  },
  {
    id: "email",
    severity: "error",
    re: /\b[A-Za-z0-9._%+-]+@(?!example\.(?:com|org)|test\b|localhost|sentry\b|noreply\b)[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    hint: "Email address. Use user@example.com in docs.",
  },
  {
    id: "api-key",
    severity: "error",
    re: /\b(?:sk-ant-[A-Za-z0-9_-]{16,}|sk_[A-Za-z0-9]{24,}|AIza[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{10,})\b/g,
    hint: "Looks like a live API key. Move it to .env.",
  },
  {
    id: "private-key",
    severity: "error",
    re: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/g,
    hint: "Private key material.",
  },
  {
    id: "vault-path",
    severity: "error",
    // A specific vault directory name pinned into source
    re: /\b(?:Sites|Documents|Dropbox|Obsidian)\/[A-Za-z0-9._-]*(?:vault|brain|notes)\b/gi,
    hint: "Hardcoded vault location. Read it from .amplifyrc.",
  },
];

/** Extra patterns the user keeps locally so real names never enter the repo */
function localRules() {
  if (!existsSync(".personal-patterns")) return [];
  return readFileSync(".personal-patterns", "utf-8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((line, i) => {
      try {
        return {
          id: `personal-${i + 1}`,
          severity: "error",
          re: new RegExp(line, "gi"),
          hint: "Matches a pattern in .personal-patterns. Personal detail — belongs in the vault.",
          local: true,
        };
      } catch {
        console.error(`  .personal-patterns line ${i + 1} is not a valid regex, skipped: ${line}`);
        return null;
      }
    })
    .filter(Boolean);
}

function filesToScan() {
  // A full scan covers untracked-but-not-ignored files too: those are one
  // `git add -A` away from being published.
  const cmds = STAGED
    ? ["git diff --cached --name-only --diff-filter=ACMR"]
    : ["git ls-files", "git ls-files --others --exclude-standard"];
  return cmds
    .flatMap((cmd) => execSync(cmd, { encoding: "utf-8" }).split("\n"))
    .map((f) => f.trim())
    .filter((f) => f && TEXT.test(f))
    .filter((f) => !ALLOW_PATHS.some((re) => re.test(f)));
}

function contentOf(file) {
  try {
    return STAGED
      ? execSync(`git show :${JSON.stringify(file)}`, { encoding: "utf-8", maxBuffer: 32 * 1024 * 1024 })
      : readFileSync(file, "utf-8");
  } catch {
    return null;
  }
}

const rules = [...RULES, ...localRules()];
const findings = [];

for (const file of filesToScan()) {
  const content = contentOf(file);
  if (content === null) continue;

  const isAttribution = ATTRIBUTION_PATHS.some((re) => re.test(file));
  const lines = content.split("\n");
  for (const rule of rules) {
    if (rule.local && isAttribution) continue;
    lines.forEach((line, i) => {
      // Allow an explicit, reviewed exemption
      if (line.includes("personal-ok")) return;
      rule.re.lastIndex = 0;
      const match = rule.re.exec(line);
      if (!match) return;
      findings.push({
        file,
        line: i + 1,
        rule: rule.id,
        hint: rule.hint,
        // Never print what a local (name) rule matched — that is the secret
        excerpt: rule.local ? "[redacted]" : match[0].slice(0, 80),
      });
    });
  }
}

if (findings.length === 0) {
  const scope = STAGED ? "staged changes" : "tracked files";
  console.log(`✓ no personal data found in ${scope}`);
  process.exit(0);
}

console.error(`\n✗ ${findings.length} personal-data finding${findings.length === 1 ? "" : "s"}:\n`);
for (const f of findings) {
  console.error(`  ${f.file}:${f.line}  [${f.rule}]  ${f.excerpt}`);
  console.error(`    ${f.hint}\n`);
}
console.error("Personal content belongs in your Obsidian vault, not this repo.");
console.error("If a match is genuinely fine, add a `personal-ok` comment on that line.\n");
process.exit(1);
