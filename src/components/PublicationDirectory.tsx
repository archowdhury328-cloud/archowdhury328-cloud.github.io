import { useMemo } from 'react';
import { featuredPublications, publications } from '../data/publications';
import { TOPICS, type Topic } from '../data/types';
import { filterPublications, isDefaultFilters, yearsOf, type SortMode } from '../lib/publicationQuery';
import { useSelection } from '../lib/selection';
import { IconSearch } from './Icons';
import { PublicationCard } from './PublicationCard';

export function PublicationDirectory() {
  const { filters, setFilters, resetFilters, selectedId, selectPublication } = useSelection();
  const years = useMemo(() => yearsOf(publications), []);
  const results = useMemo(() => filterPublications(publications, filters), [filters]);

  return (
    <section className="section" id="publications" aria-labelledby="pubs-title">
      <div className="section-head">
        <p className="eyebrow"><span className="idx">05</span>Publications</p>
        <h2 id="pubs-title">{publications.length} listed publications</h2>
        <p className="lede">
          The publications listed on my Google Scholar profile, from the records I supplied. This is not a claim of a complete
          lifetime publication count. Co-authors are credited where a complete author list could be verified.
        </p>
      </div>

      <div className="featured" aria-labelledby="featured-title">
        <h3 id="featured-title" className="sub">Featured research</h3>
        <div className="grid">
          {featuredPublications.map((p) => (
            <PublicationCard key={p.id} pub={p} compact selected={selectedId === p.id} onSelect={selectPublication} />
          ))}
        </div>
      </div>

      <form className="filters" role="search" aria-label="Search and filter publications" onSubmit={(e) => e.preventDefault()}>
        <label className="field grow">
          <span>Search title, venue or author</span>
          <span className="input-icon"><IconSearch size={17} /></span>
          <input type="search" value={filters.query} onChange={(e) => setFilters({ query: e.target.value })} placeholder="e.g. churn, security, Scientific Reports" autoComplete="off" />
        </label>
        <label className="field">
          <span>Year</span>
          <select value={String(filters.year)} onChange={(e) => setFilters({ year: e.target.value === 'all' ? 'all' : Number(e.target.value) })}>
            <option value="all">All years</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Topic</span>
          <select value={filters.topic} onChange={(e) => setFilters({ topic: e.target.value as Topic | 'all' })}>
            <option value="all">All topics</option>
            {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Sort</span>
          <select value={filters.sort} onChange={(e) => setFilters({ sort: e.target.value as SortMode })}>
            <option value="newest">Newest first</option>
            <option value="citations">Citations (Scholar snapshot)</option>
          </select>
        </label>
        <button type="button" className="btn small" onClick={resetFilters} disabled={isDefaultFilters(filters)}>Reset filters</button>
      </form>

      <p className="count mono" role="status" aria-live="polite">
        Showing {results.length} of {publications.length} publications
      </p>

      {results.length === 0 ? (
        <div className="empty-state">
          <p>No publications match these filters.</p>
          <button type="button" className="btn small" onClick={resetFilters}>Reset filters</button>
        </div>
      ) : (
        <ol className="pub-list">
          {results.map((p) => (
            <li key={p.id}>
              <PublicationCard pub={p} selected={selectedId === p.id} onSelect={selectPublication} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
