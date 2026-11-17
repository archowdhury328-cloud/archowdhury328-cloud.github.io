# Content sources and verification

Everything shown on the site comes from `src/data/` (version-controlled). Nothing is fetched at runtime and nothing is scraped from
a visitor's browser.

## What is owner-supplied (authoritative)

* Name, affiliation, headline, introduction, GitHub and Google Scholar URLs.
* For each of the 15 publications: title, listing year, Scholar citation ID, snapshot citation count, topic (an editorial grouping) and
  "featured" flag. Pages / volume / issue were used where the owner supplied them.
* Research snapshot: 146 citations, h-index 7, i10-index 5. The collection date is **unknown** and stored as such (`snapshotDate: 'unknown'`).
  These are labelled "Google Scholar snapshot supplied by the author", never "live" or "verified today".

## What was verified, and how

Google Scholar pages were **not scraped** and direct verification against Scholar was not performed. Instead each title was looked up
in the public **Crossref REST API** (`scripts/verify-crossref.mjs` -> `data/crossref-raw.json`, reproducible). A match was accepted only
at token-overlap >= 0.85 and was then reviewed by hand (the two lower scores, p06 and p12, differ from the supplied titles only in
"US" vs "U.S." and capitalisation).

`scripts/build-verified-meta.mjs` turns that into `src/data/verifiedMeta.json`:

| Field | Source | Rule |
|---|---|---|
| DOI link ("Read publication") | Crossref | Present for all 15 matched records |
| Full venue name | Owner text where complete, else Crossref container title | Never inferred from a fragment: p06, p07, p09, p11 fragments are consistent with the matched full names; p10's venue (not supplied reliably) comes from the matched record |
| Author list | Crossref | Shown only if it has >= 2 names **and** contains the owner (guards against incomplete arrays). Cyrillic look-alike letters (A/a) that appear in some Crossref author strings were normalised to Latin. |
| Matched record date | Crossref `issued` | Stored separately from the listing year (`crossrefIssued`) |

### Records with no author line

p10, p14 and p15: the matched Crossref records list a single name only, which is not credible as a complete author list for the
Scholar entry. **No author line is displayed** for these, and the details panel says so. Co-author credit is therefore never invented or
dropped silently, just omitted until a complete list is verified. To fix, add the verified list under `authors` in `src/data/publications.ts`.

### Known discrepancies (kept visible, not resolved by guessing)

* p06 (ICECET 2025, issued 2025-07-03) and p07 (ICAFT, issued 2025-12-19): the owner-supplied listing year is 2026 and is used for
  sorting/filters. The record dates are kept in `crossrefIssued`. The event year and listing year can legitimately differ.
* p04 / p08: the owner's venue is "International Conference on Computing and Communication Networks"; the matched record is the
  Springer LNNS volume "Proceedings of Fifth International Conference on Computing and Communication Networks". The owner's wording is displayed.
* p03 (Discover Artificial Intelligence 6(1), article 263): matched DOI `10.1007/s44163-026-00983-0`.

## Summaries

Each summary is a two-sentence description written from the paper's **published abstract**, retrieved with
`scripts/fetch-abstracts.mjs` into `data/abstracts-raw.json`:

| Source | Records |
|---|---|
| OpenAlex (abstract index) | p01-p03, p05, p07, p09-p15 |
| Springer chapter page (abstract section) | p04, p08 |
| Semantic Scholar API | p06 |

Rules used when writing them: describe the method and setting; repeat a number only if the abstract states it, and attribute it ("the paper
reports"); never add claims the abstract does not make. Where an abstract was internally inconsistent or truncated (e.g. p04's encryption-time
figure lacks a unit; p06 mixes billions and millions), the uncertain figure was left out. Keywords are 3-4 tags taken from the abstract.
Each record stores `summarySource`. For p03 the site also notes that an independent reconstruction on the public dataset did not reproduce
the reported accuracy.

## Repositories

Only two repositories are linked, each checked to exist:

* `archowdhury328-cloud/XACT-TB` for p02 (owner-supplied XACT-TB repository).
* `archowdhury328-cloud/Explainable-Telecom-Churn` for p03: an independent public-data reconstruction and statistical audit, stated as such
  on the page; it is not the original authors' code.

No other paper is given a code link: having a paper does not imply a public implementation.

## Updating

* **Add / edit a publication:** edit `BASE` in `src/data/publications.ts` (Scholar suffix, year, citations, topic). Run `npm run test`; the
  dataset tests assert 15 unique IDs, correct Scholar URLs and allow-listed hosts (update those expectations deliberately if the count changes).
* **Refresh Crossref data:** `node scripts/verify-crossref.mjs && node scripts/build-verified-meta.mjs`, then review the diff.
* **Update citation metrics:** edit `profile.metrics` in `src/data/profile.ts` and the per-paper `citations`. Keep the "snapshot" wording and
  record the real collection date if known (change the `snapshotDate` type from `'unknown'` to a date string at the same time).
