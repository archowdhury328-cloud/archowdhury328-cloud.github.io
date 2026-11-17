import type { Publication } from '../data/types';
import { formatCitation } from '../lib/publicationQuery';
import { EXTERNAL_LINK_PROPS } from '../lib/url';
import { TOPIC_STYLE } from '../scenes/topicStyle';
import { IconArrowUpRight, IconBook, IconCode, IconGitHub, IconScholar } from './Icons';
import { TOPIC_ICON } from './topicIcons';

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
  const Icon = TOPIC_ICON[topic];
  return (
    <span className="tag" style={{ ['--tag' as string]: s.color }}>
      <Icon size={14} /> {topic}
    </span>
  );
}

export function Keywords({ words }: { words: readonly string[] }) {
  if (!words.length) return null;
  return (
    <ul className="keywords" aria-label="Keywords">
      {words.map((k) => (
        <li key={k}>{k}</li>
      ))}
    </ul>
  );
}

export function PublicationLinks({ pub }: { pub: Publication }) {
  return (
    <div className="pub-links">
      {pub.doiUrl && (
        <a className="btn small primary-soft" href={pub.doiUrl} {...EXTERNAL_LINK_PROPS}>
          <IconBook size={16} /> Read publication<span className="sr-only"> (opens in a new tab): {pub.title}</span>
          <IconArrowUpRight size={14} />
        </a>
      )}
      <a className="btn small" href={pub.scholarUrl} {...EXTERNAL_LINK_PROPS}>
        <IconScholar size={16} /> View on Scholar<span className="sr-only"> (opens in a new tab): {pub.title}</span>
      </a>
      {pub.repositoryUrl && (
        <a className="btn small" href={pub.repositoryUrl} {...EXTERNAL_LINK_PROPS}>
          <IconGitHub size={16} /> Code repository<span className="sr-only"> (opens in a new tab): {pub.title}</span>
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
  const color = TOPIC_STYLE[pub.topic].color;
  return (
    <article
      className={`pub-card${selected ? ' selected' : ''}${compact ? ' featured-card' : ''}`}
      aria-labelledby={`t-${pub.id}${compact ? '-f' : ''}`}
      style={{ ['--accent' as string]: color }}
    >
      <div className="pub-meta">
        <span className="year">{pub.year}</span>
        <TopicTag topic={pub.topic} />
        {pub.repositoryUrl && (
          <span className="tag code-tag">
            <IconCode size={14} /> Code
          </span>
        )}
      </div>
      <h3 id={`t-${pub.id}${compact ? '-f' : ''}`} className="pub-title">{pub.title}</h3>
      {pub.venue && (
        <p className="venue">
          {pub.venue}
          {cite ? <span className="cite">, {cite}</span> : null}
        </p>
      )}
      <p className="summary">{pub.summary}</p>
      <Keywords words={pub.keywords} />
      {!compact && <AuthorLine authors={pub.authors} />}
      <div className="card-foot">
        <PublicationLinks pub={pub} />
        <p className="mono small-meta" title={`${pub.citationCountSource}; collection date unknown`}>
          {pub.citationCount} {pub.citationCount === 1 ? 'citation' : 'citations'} · snapshot
        </p>
      </div>
      <button type="button" className="link-btn select-btn" aria-pressed={selected} onClick={() => onSelect(selected ? null : pub.id)}>
        {selected ? 'Selected (clear)' : 'Select to highlight in the solar system'}
      </button>
    </article>
  );
}
