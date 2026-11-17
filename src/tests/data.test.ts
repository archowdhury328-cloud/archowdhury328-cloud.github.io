import { describe, expect, it } from 'vitest';
import { SCHOLAR_USER } from '../data/profile';
import { featuredPublications, publicationById, publications, scholarCitationUrl } from '../data/publications';
import { TOPICS } from '../data/types';
import { isSafeExternalUrl } from '../lib/url';

const SUPPLIED_SUFFIXES = [
  'ULOm3_A8WrAC', 'Zph67rFs4hoC', 'Se3iqnhoufwC', 'MXK_kJrjxJIC', '8k81kl-MbHgC', 'hqOjcs7Dif8C', 'UebtZRa9Y70C', 'roLk4NBRz8UC',
  'WF5omc3nYNoC', '5nxA0vEk-isC', 'eQOLeE2rZwMC', 'zYLM7Y9cAGgC', 'IjCSPb-OGe4C', 'UeHWp8X0CEIC', 'qjMakFHDy7sC',
];

describe('publication dataset', () => {
  it('contains all 15 supplied records with unique ids', () => {
    expect(publications).toHaveLength(15);
    expect(new Set(publications.map((p) => p.id)).size).toBe(15);
  });

  it('builds Scholar links from the exact supplied citation IDs, in order', () => {
    publications.forEach((p, i) => {
      expect(p.scholarUrl).toBe(
        `https://scholar.google.com/citations?view_op=view_citation&hl=en&user=${SCHOLAR_USER}&citation_for_view=${SCHOLAR_USER}:${SUPPLIED_SUFFIXES[i]}`,
      );
    });
    expect(scholarCitationUrl('X')).toContain(`${SCHOLAR_USER}:X`);
  });

  it('assigns every publication to exactly one of the five topics', () => {
    const counts = TOPICS.map((t) => publications.filter((p) => p.topic === t).length);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(15);
    counts.forEach((c) => expect(c).toBeGreaterThan(0));
  });

  it('marks exactly the four supplied featured records', () => {
    expect(featuredPublications.map((p) => p.id)).toEqual(['p01', 'p02', 'p03', 'p04']);
  });

  it('keeps supplied citation counts and does not invent a snapshot date', () => {
    expect(publicationById('p09')?.citationCount).toBe(28);
    expect(publications.reduce((s, p) => s + p.citationCount, 0)).toBe(146);
    publications.forEach((p) => expect(p.snapshotDate).toBe('unknown'));
  });

  it('only exposes author lists that are complete (>=2 names) and include the owner', () => {
    publications.forEach((p) => {
      if (p.authors) {
        expect(p.authors.length).toBeGreaterThanOrEqual(2);
        expect(p.authors.some((a) => /asikur rahman chy/i.test(a))).toBe(true);
        p.authors.forEach((a) => expect(a).not.toMatch(/[Ѐ-ӿ]/)); // no Cyrillic homoglyphs
      }
    });
    expect(publicationById('p10')?.authors).toBeUndefined();
  });

  it('only links to allow-listed https hosts', () => {
    publications.forEach((p) => {
      [p.scholarUrl, p.doiUrl, p.repositoryUrl].filter(Boolean).forEach((u) => expect(isSafeExternalUrl(u as string)).toBe(true));
    });
  });

  it('keeps the supplied year separate from the matched record date', () => {
    expect(publicationById('p07')?.year).toBe(2026);
    expect(publicationById('p07')?.crossrefIssued).toMatch(/^2025/);
  });

  it('only attaches repositories that were verified to correspond to a paper', () => {
    expect(publications.filter((p) => p.repositoryUrl).map((p) => p.id)).toEqual(['p02', 'p03']);
  });

  it('gives every publication an abstract-based summary, keywords and a recorded source', () => {
    publications.forEach((p) => {
      expect(p.summary.length).toBeGreaterThan(150);
      expect(p.summary.toLowerCase()).not.toBe(p.title.toLowerCase());
      expect(p.keywords.length).toBeGreaterThanOrEqual(3);
      expect(p.summarySource).toMatch(/^Written from the published abstract/);
    });
  });
});
