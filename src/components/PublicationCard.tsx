import type { Publication } from '../data/types';
import { formatCitation } from '../lib/publicationQuery';
import { EXTERNAL_LINK_PROPS } from '../lib/url';
import { TOPIC_STYLE } from '../scenes/topicStyle';

const OWNER = /asikur\s+rahman\s+chy/i;

/** Verified author list with the portfolio owner emphasised. Renders nothing when authors are unverified. */
export function AuthorLine({ authors }: { authors?: readonly string[] }) {
  if (!authors?.length) return null;
  return (
    <p className="authors">
      {authors.map((a, i) => (
        <span key={`${a}-${i}`}>
          {OWNER.test(a) ? <strong>{a}</strong> : a}
          {i < authors.length - 1 ? ', ' : ''}
        </span>
      ))}
    </p>
  );
}

export function TopicTag({ topic }: { topic: Publication['topic'] }) {
  const s = TOPIC_STYLE[topic];
  return (
    <span className="tag" style={{ ['--tag' as string]: s.color }}>
      <span aria-hidden="true" className="tag-glyph">{s.glyph}</span> {topic}
    </span>
  );
}

export function PublicationLinks({ pub }: { pub: Publication }) {
  return (
    <div className="pub-links">
      {pub.doiUrl && (
        <a className="btn small" href={pub.doiUrl} {...EXTERNAL_LINK_PROPS}>
          Read publication<span className="sr-only"> (opens in a new tab): {pub.title}</span>
        </a>
      )}
      <a className="btn small" href={pub.scholarUrl} {...EXTERNAL_LINK_PROPS}>
        View on Scholar<span className="sr-only"> (opens in a new tab): {pub.title}</span>
      </a>
      {pub.repositoryUrl && (
        <a className="btn small" href={pub.repositoryUrl} {...EXTERNAL_LINK_PROPS}>
          Code repository<span className="sr-only"> (opens in a new tab): {pub.title}</span>
        </a>
      )}
    </div>
  );
}

interface Props {
  pub: Publication;
  selected: boolean;
  onSelect: (id: string | null) => void;
  compact?: boolean;
}

export function PublicationCard({ pub, selected, onSelect, compact = false }: Props) {
  const cite = formatCitation(pub);
  return (
    <article className={`pub-card${selected ? ' selected' : ''}${compact ? ' compact' : ''}`} aria-labelledby={`t-${pub.id}${compact ? '-f' : ''}`}>
      <div className="pub-meta">
        <span className="mono">{pub.year}</span>
        <TopicTag topic={pub.topic} />
      </div>
      <h3 id={`t-${pub.id}${compact ? '-f' : ''}`} className="pub-title">{pub.title}</h3>
      {pub.venue && <p className="venue">{pub.venue}{cite ? `, ${cite}` : ''}</p>}
      <AuthorLine authors={pub.authors} />
      {!compact && <p className="summary">{pub.summary}</p>}
      <p className="mono small-meta">
        {pub.citationCount} {pub.citationCount === 1 ? 'citation' : 'citations'} · Scholar snapshot (date unknown)
      </p>
      <PublicationLinks pub={pub} />
      <button type="button" className="link-btn select-btn" aria-pressed={selected} onClick={() => onSelect(selected ? null : pub.id)}>
        {selected ? 'Selected (clear)' : 'Select to highlight in the solar system'}
      </button>
    </article>
  );
}
