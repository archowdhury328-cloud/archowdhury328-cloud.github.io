import { describe, expect, it } from 'vitest';
import { publicationById, publications } from '../data/publications';
import {
  DEFAULT_FILTERS,
  filterPublications,
  formatCitation,
  isDefaultFilters,
  matchesQuery,
  toBibtex,
  toCitationText,
  yearsOf,
} from '../lib/publicationQuery';

describe('filterPublications', () => {
  it('defaults to newest first, stable for equal years', () => {
    const out = filterPublications(publications, DEFAULT_FILTERS);
    expect(out).toHaveLength(15);
    expect(out[0]?.year).toBe(2026);
    expect(out.at(-1)?.year).toBe(2023);
    const ids2026 = out.filter((p) => p.year === 2026).map((p) => p.id);
    expect(ids2026).toEqual([...ids2026].sort());
  });

  it('searches titles case-insensitively with all terms required', () => {
    expect(filterPublications(publications, { ...DEFAULT_FILTERS, query: 'CHURN shap' }).map((p) => p.id)).toEqual(['p03']);
    expect(filterPublications(publications, { ...DEFAULT_FILTERS, query: 'churn zebra' })).toEqual([]);
  });

  it('searches venue and verified author names', () => {
    expect(filterPublications(publications, { ...DEFAULT_FILTERS, query: 'scientific reports' }).map((p) => p.id)).toContain('p01');
    expect(filterPublications(publications, { ...DEFAULT_FILTERS, query: 'Rijvi' }).map((p) => p.id)).toEqual(['p01']);
  });

  it('filters by year and topic and combines them', () => {
    expect(filterPublications(publications, { ...DEFAULT_FILTERS, year: 2024 })).toHaveLength(5);
    const sec = filterPublications(publications, { ...DEFAULT_FILTERS, topic: 'Security & Privacy' });
    expect(sec.map((p) => p.id).sort()).toEqual(['p04', 'p08', 'p09', 'p15']);
    expect(filterPublications(publications, { ...DEFAULT_FILTERS, topic: 'Security & Privacy', year: 2025 }).map((p) => p.id)).toEqual(['p09']);
  });

  it('sorts by supplied citation snapshot when asked', () => {
    const out = filterPublications(publications, { ...DEFAULT_FILTERS, sort: 'citations' });
    expect(out[0]?.id).toBe('p09');
    const counts = out.map((p) => p.citationCount);
    expect(counts).toEqual([...counts].sort((a, b) => b - a));
  });

  it('does not mutate the source list', () => {
    const before = publications.map((p) => p.id).join();
    filterPublications(publications, { ...DEFAULT_FILTERS, sort: 'citations' });
    expect(publications.map((p) => p.id).join()).toBe(before);
  });

  it('reports default state and distinct years', () => {
    expect(isDefaultFilters(DEFAULT_FILTERS)).toBe(true);
    expect(isDefaultFilters({ ...DEFAULT_FILTERS, query: ' x ' })).toBe(false);
    expect(yearsOf(publications)).toEqual([2026, 2025, 2024, 2023]);
    expect(matchesQuery(publications[0]!, '   ')).toBe(true);
  });
});

describe('citation helpers', () => {
  it('formats volume, issue and pages only when present', () => {
    expect(formatCitation(publicationById('p12')!)).toBe('vol. 6(5), pp. 265–277');
    expect(formatCitation(publicationById('p03')!)).toBe('vol. 6(1), art. 263');
  });

  it('omits the author clause when authors are unverified', () => {
    const text = toCitationText(publicationById('p10')!);
    expect(text).toContain('Understanding the Relationship');
    expect(text).not.toMatch(/Asikur/);
  });

  it('exports BibTeX only for complete metadata', () => {
    const ok = toBibtex(publicationById('p03')!);
    expect(ok).toContain('doi = {10.1007/s44163-026-00983-0}');
    expect(ok).toContain('Zerine');
    expect(toBibtex(publicationById('p10')!)).toBeNull();
  });
});
