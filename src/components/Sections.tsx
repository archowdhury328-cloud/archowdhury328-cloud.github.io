import { SCHOLAR_PROFILE_URL, affiliationLine, profile } from '../data/profile';
import { publications } from '../data/publications';
import { EXTERNAL_LINK_PROPS } from '../lib/url';

export function ResearchMetrics() {
  const m = profile.metrics;
  const items = [
    { label: 'Citations', value: m.citations },
    { label: 'h-index', value: m.hIndex },
    { label: 'i10-index', value: m.i10Index },
    { label: 'Listed publications', value: publications.length },
  ];
  return (
    <section className="section" id="snapshot" aria-labelledby="snap-title">
      <div className="section-head">
        <p className="eyebrow">Research snapshot</p>
        <h2 id="snap-title">At a glance</h2>
      </div>
      <dl className="metrics">
        {items.map((i) => (
          <div key={i.label} className="metric">
            <dd>{i.value}</dd>
            <dt>{i.label}</dt>
          </div>
        ))}
      </dl>
      <p className="note">
        {m.source} The collection date is unknown; these figures are not live.{' '}
        <a href={SCHOLAR_PROFILE_URL} {...EXTERNAL_LINK_PROPS}>See current metrics on Google Scholar<span className="sr-only"> (opens in a new tab)</span></a>.
      </p>
    </section>
  );
}

export function About() {
  return (
    <section className="section about" id="about" aria-labelledby="about-title">
      <div className="section-head">
        <p className="eyebrow">About</p>
        <h2 id="about-title">Research interests</h2>
      </div>
      <div className="about-grid">
        <p className="lede">{profile.intro}</p>
        <div>
          <ul className="chips" aria-label="Research interests">
            {profile.interests.map((i) => <li key={i}>{i}</li>)}
          </ul>
          <p className="affil-card">
            <span className="mono">Affiliation</span>
            <br />
            {affiliationLine}
          </p>
        </div>
      </div>
    </section>
  );
}
