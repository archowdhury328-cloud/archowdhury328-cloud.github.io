import type { Publication, Topic } from '../data/types';

export type SortMode = 'newest' | 'citations';

export interface Filters {
  query: string;
  year: number | 'all';
  topic: Topic | 'all';
  sort: SortMode;
}

export const DEFAULT_FILTERS: Filters = { query: '', year: 'all', topic: 'all', sort: 'newest' };

const norm = (s: string): string => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');

/** Searchable text: title, venue and verified author names only (never guessed fields). */
export function searchText(p: Publication): string {
  return norm([p.title, p.venue ?? '', ...(p.authors ?? [])].join(' '));
}

export function matchesQuery(p: Publication, query: string): boolean {
  const terms = norm(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const hay = searchText(p);
  return terms.every((t) => hay.includes(t));
}

export function filterPublications(list: readonly Publication[], f: Filters): Publication[] {
  const out = list.filter(
    (p) => matchesQuery(p, f.query) && (f.year === 'all' || p.year === f.year) && (f.topic === 'all' || p.topic === f.topic),
  );
  // Stable, deterministic ordering: ties fall back to id so the list never reshuffles.
  return out.sort((a, b) => {
    if (f.sort === 'citations' && b.citationCount !== a.citationCount) return b.citationCount - a.citationCount;
    if (b.year !== a.year) return b.year - a.year;
    return a.id.localeCompare(b.id);
  });
}

export const yearsOf = (list: readonly Publication[]): number[] =>
  [...new Set(list.map((p) => p.year))].sort((a, b) => b - a);

export const isDefaultFilters = (f: Filters): boolean =>
  f.query.trim() === '' && f.year === 'all' && f.topic === 'all' && f.sort === 'newest';

export function formatCitation(p: Publication): string {
  const parts: string[] = [];
  if (p.volume) parts.push(p.issue ? `vol. ${p.volume}(${p.issue})` : `vol. ${p.volume}`);
  if (p.pages) parts.push(`${/^\d+$/.test(p.pages) ? 'art.' : 'pp.'} ${p.pages}`);
  return parts.join(', ');
}

/** Plain-text citation export; only fields that exist are emitted. */
export function toCitationText(p: Publication): string {
  const bits = [
    p.authors?.length ? `${p.authors.join(', ')}.` : '',
    `${p.title}.`,
    p.venue ? `${p.venue},` : '',
    formatCitation(p) ? `${formatCitation(p)},` : '',
    `${p.year}.`,
    p.doiUrl ?? '',
  ];
  return bits.filter(Boolean).join(' ').replace(/,\s*(\d{4})\./, ' ($1).').replace(/\s+/g, ' ').trim();
}

/** BibTeX is offered only when metadata is complete enough (authors, venue, DOI). */
export function toBibtex(p: Publication): string | null {
  if (!p.authors?.length || !p.venue || !p.doiUrl) return null;
  const key = `chy${p.year}_${p.id}`;
  const esc = (s: string) => s.replace(/([{}&%$#_])/g, '\\$1');
  return [
    `@misc{${key},`,
    `  author = {${p.authors.map(esc).join(' and ')}},`,
    `  title = {${esc(p.title)}},`,
    `  howpublished = {${esc(p.venue)}},`,
    `  year = {${p.year}},`,
    `  doi = {${p.doiUrl.replace('https://doi.org/', '')}}`,
    '}',
  ].join('\n');
}
