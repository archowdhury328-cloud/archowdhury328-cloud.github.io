// Fetches abstracts for the matched DOIs from public bibliographic APIs (OpenAlex, then Crossref).
// Output data/abstracts-raw.json is reviewed by hand; summaries in src/data are written from it.
import { readFileSync, writeFileSync } from 'node:fs';
const meta = JSON.parse(readFileSync('src/data/verifiedMeta.json', 'utf8'));
const ua = { 'User-Agent': 'research-portfolio-verifier/1.0' };
const fromInverted = (inv) => {
  if (!inv) return null;
  const words = [];
  for (const [w, pos] of Object.entries(inv)) for (const p of pos) words[p] = w;
  return words.join(' ');
};
const strip = (s) => s?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ?? null;
const out = {};
for (const [id, m] of Object.entries(meta)) {
  let abs = null, src = null, concepts = [];
  try {
    const r = await fetch('https://api.openalex.org/works/https://doi.org/' + m.doi, { headers: ua });
    if (r.ok) { const j = await r.json(); abs = fromInverted(j.abstract_inverted_index); src = abs ? 'openalex' : null; concepts = (j.keywords ?? []).map((k) => k.display_name).slice(0, 6); }
  } catch {}
  if (!abs) {
    try {
      const r = await fetch('https://api.crossref.org/works/' + m.doi, { headers: ua });
      if (r.ok) { const j = await r.json(); abs = strip(j.message?.abstract); src = abs ? 'crossref' : null; }
    } catch {}
  }
  out[id] = { doi: m.doi, source: src, keywords: concepts, abstract: abs };
  console.log(id, src ?? 'NONE', abs ? abs.length : 0);
}
writeFileSync('data/abstracts-raw.json', JSON.stringify(out, null, 2));
