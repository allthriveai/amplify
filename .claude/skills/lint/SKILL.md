---
name: lint
description: Health-checks the wiki. Finds orphans, broken links, contradictions, stale claims, missing pages, and index drift, then offers to fix them. Use when the user runs /lint, asks whether the wiki is healthy, or after a batch of ingests.
---

# Lint the Wiki

Wikis rot quietly. A page nothing links to is a page nobody finds again; an index
entry pointing at a deleted file is worse than no entry. None of this announces
itself, so it has to be checked on purpose.

Run this every ten ingests, monthly at minimum, and before leaning on the wiki for
anything large.

## Step 0: Load configuration

Read `.lumisrc` for `paths.wiki` and `paths.sources`, and `{vaultPath}/CLAUDE.md` for
the conventions being checked against.

## Step 1: Build the picture

Read every page under `{wiki}/`. For each, collect the filename, the `# Title`, the
frontmatter, and every `[[link]]` in the body. Then compute the inbound links for
each page. Do the mechanical parts with a script rather than by reading — this part
is bookkeeping, not judgment.

## Step 2: The mechanical checks

**Orphans.** Pages with zero inbound links from any other page. The index does not
count — being listed is not being connected.

**Broken links.** `[[Targets]]` with no page of that title. Usually a rename that did
not propagate, or a link written from the filename instead of the title.

**Index drift.** Pages on disk missing from `index.md`, and index entries naming pages
that no longer exist.

**Dangling sources.** A page whose `sources` frontmatter names a file that is not in
`{sources}/`. Means the audit trail is broken.

**Frontmatter violations.** Missing `tags`, `sources`, `created`, `updated`, or
`aliases`. Extra fields that are not in the schema. An empty `sources` list on anything
but a synthesis page, which means the page is unsupported opinion.

**Missing aliases.** A page whose `aliases` does not contain its own `# Title`. This is
the highest-value mechanical check in the list: links are written from the title while
filenames are kebab-case, so a page without its alias cannot be linked to at all, and it
will read as an orphan for a reason that has nothing to do with how well it is connected.

**Naming.** Filenames that are not kebab-case, titles that are not Title Case, links
written as `[[some-file-name]]` instead of `[[Some File Name]]`.

## Step 3: The judgment checks

These need reading, not scripting.

**Contradictions.** Two pages asserting incompatible things. Report both, with the
sources behind each. Do not resolve it yourself.

**Stale claims.** A page whose `updated` predates a source that bears on it. Especially
where a newer clipping in `{sources}/` was never worked into the pages it touches.

**Missing pages.** A concept, person, or tool named across three or more pages with no
page of its own. That is the wiki asking for a page.

**Missing cross-references.** Pages that clearly relate and do not link. Common after
a batch ingest where each source was filed without looking sideways.

## Step 4: Report

Group by severity. Lead with counts so the trend is visible across runs.

```
Wiki health — [N] pages

Broken     [N] broken links, [N] dangling sources
Index      [N] pages missing, [N] stale entries
Orphans    [N] pages with no inbound links
Schema     [N] frontmatter violations, [N] naming violations
Judgment   [N] contradictions, [N] stale pages, [N] missing pages
```

Then list each finding with the file it is in and the specific fix. Be concrete —
"add a link from [[A]] to [[B]]" beats "improve cross-referencing".

## Step 5: Offer to fix

Mechanical fixes can be applied in a batch once the user agrees: index rebuilds,
link-casing corrections, frontmatter backfill, kebab-case renames.

Judgment findings need the user. Contradictions in particular are theirs to resolve —
picking a side automatically is how a wiki starts quietly lying.

## Step 6: Log the pass

Append to `{wiki}/log.md`:

```markdown
## [YYYY-MM-DD] lint | [N] pages checked
[N] orphans, [N] broken links, [N] contradictions. Fixed [what]. Left [what] for review.
```

Log every pass, including a clean one. The value is the trend: orphan count creeping
up means ingests are being filed without linking sideways.
