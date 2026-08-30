---
name: wiki
description: Answers a question from the wiki, with citations. Reads the index first, drills into the pages it names, synthesizes an answer, and offers to file anything worth keeping. Use when the user runs /wiki, asks what they know about something, or asks a question their vault should be able to answer.
---

# Query the Wiki

The wiki exists so knowledge is compiled once and kept current, not re-derived from
raw sources on every question. Read it in that order: index, then pages, then raw
material only if the wiki genuinely cannot answer.

## Step 0: Load configuration

Read `.amplifyrc` for `paths.wiki` and `paths.sources`. Read `{vaultPath}/CLAUDE.md`
for the conventions.

## Step 1: Read the index first

`{wiki}/index.md` is the catalog. Read it before opening anything else. It exists so
you can find the three relevant pages without scanning two hundred files.

Pick the pages that plausibly bear on the question — including ones that might
contradict the obvious answer.

## Step 2: Read those pages

Open them. Follow `[[links]]` one hop when a page points at something clearly
relevant. Do not crawl the whole graph.

Check the `updated` dates. A page that has not been touched since a source that
supersedes it is worth flagging in the answer.

## Step 3: Go to raw sources only if you must

If the wiki cannot answer, read the clippings in `{sources}/`. Then say so plainly:
that is a gap, and the fix is a wiki page, not a longer answer. Offer to write it.

If this keeps happening on a topic, the wiki has a hole worth filling deliberately.

## Step 4: Answer with citations

Cite wiki pages as `[[Page Title]]`, inline, where the claim is made. The user should
be able to click straight to the source of any sentence.

- Say what the wiki actually supports, and where it is thin.
- When pages disagree, say so and give both, rather than silently picking one.
- Separate what the sources claim from your own inference. Label the inference.
- No hedging filler. If the answer is uncertain, name the specific uncertainty.

## Step 5: Offer to file what is worth keeping

If the answer produced a real comparison, a resolution, or a connection nobody had
written down, it is a synthesis page. Offer to save it to `{wiki}/Synthesis/`:

```markdown
---
tags: [relevant topics]
sources: [clipping filenames behind it]
created: [today]
updated: [today]
---

# [Title Case Question or Comparison]

[The question being resolved.]

## Where the evidence lands

[What each side holds, cited to [[pages]], and where it comes out.]

## Still open

[What would change the answer.]
```

Then add a line to `{wiki}/index.md` and append to `{wiki}/log.md`:

```markdown
## [YYYY-MM-DD] query | [The question]
Answered from [[Page A]], [[Page B]]. Filed [[New Synthesis Page]].
```

Log the query even when nothing gets filed — a run of queries the wiki could not
answer is the clearest signal of what to ingest next.
