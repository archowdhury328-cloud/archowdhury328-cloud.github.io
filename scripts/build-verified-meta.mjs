// Turns data/crossref-raw.json into src/data/verifiedMeta.json.
// Rules: accept a Crossref match only when title similarity >= 0.85; include an author list only when it has
// >= 2 authors and contains the portfolio owner (guards against incomplete Crossref author arrays).
import { readFileSync, writeFileSync } from 'node:fs';
const raw = JSON.parse(readFileSync('data/crossref-raw.json', 'utf8'));
const HOMOGLYPHS = { 'А': 'A', 'а': 'a' }; // Cyrillic А/а sometimes appear in Crossref author strings
const clean = (s) => s.replace(/[Аа]/g, (c) => HOMOGLYPHS[c]).replace(/\s+/g, ' ').trim().normalize('NFC');
const OWNER = /asikur\s+rahman\s+chy/i;
const out = {};
for (const [id, v] of Object.entries(raw)) {
  const b = v.best;
  if (!b || v.similarity < 0.85) continue;
  const names = (b.author ?? []).map((a) => clean(`${a.given ?? ''} ${a.family ?? ''}`)).filter(Boolean);
  const okAuthors = names.length >= 2 && names.some((n) => OWNER.test(n));
  const issued = b.issued?.['date-parts']?.[0] ?? [];
  out[id] = {
    doi: b.DOI,
    crossrefTitle: b.title?.[0],
    similarity: Number(v.similarity.toFixed(2)),
    venue: (b['container-title'] ?? []).slice(-1)[0],
    publisher: b.publisher,
    type: b.type,
    issued: issued.join('-'),
    volume: b.volume,
    issue: b.issue,
    pages: b.page,
    authors: okAuthors ? names : undefined,
  };
}
writeFileSync('src/data/verifiedMeta.json', JSON.stringify(out, null, 2));
console.log(Object.keys(out).length, 'records;', Object.values(out).filter((o) => o.authors).length, 'with author lists');
