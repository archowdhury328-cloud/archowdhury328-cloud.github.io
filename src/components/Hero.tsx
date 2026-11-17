import { lazy, useState } from 'react';
import { GITHUB_URL, SCHOLAR_PROFILE_URL, profile } from '../data/profile';
import { publications } from '../data/publications';
import { EXTERNAL_LINK_PROPS } from '../lib/url';
import { SceneShell } from '../scenes/SceneShell';
import { IconArrowDown, IconGitHub, IconPin, IconReset, IconScholar } from './Icons';

const ResearchWorkstation = lazy(() => import('../scenes/ResearchWorkstation'));

export function Hero() {
  const [resetKey, setResetKey] = useState(0);
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow pill">
          <span className="live-dot" aria-hidden="true" />
          {profile.role}
        </p>
        <h1 id="hero-title" className="name">
          <span className="name-line">Md Asikur</span> <span className="name-line gradient-text">Rahman Chy</span>
        </h1>
        <p className="headline">{profile.headline}</p>
        <p className="lede">{profile.intro}</p>
        <p className="affil">
          <IconPin size={16} />
          <span>
            {profile.affiliation.unit}, {profile.affiliation.institution}
            <span className="affil-place">{profile.affiliation.place}</span>
          </span>
        </p>
        <div className="actions">
          <a className="btn primary" href="#publications">
            Explore publications <IconArrowDown size={17} />
          </a>
          <a className="btn" href={SCHOLAR_PROFILE_URL} {...EXTERNAL_LINK_PROPS}>
            <IconScholar /> Google Scholar<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a className="btn" href={GITHUB_URL} {...EXTERNAL_LINK_PROPS}>
            <IconGitHub /> GitHub<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        <dl className="hero-stats" aria-label="Research snapshot">
          <div>
            <dd>{publications.length}</dd>
            <dt>listed publications</dt>
          </div>
          <div>
            <dd>{profile.metrics.citations}</dd>
            <dt>citations*</dt>
          </div>
          <div>
            <dd>{profile.metrics.hIndex}</dd>
            <dt>h-index*</dt>
          </div>
        </dl>
        <p className="fineprint">* Google Scholar snapshot supplied by the author; see current figures on Scholar.</p>
      </div>
      <div className="hero-scene">
        <SceneShell kind="workstation" Scene={ResearchWorkstation} sceneProps={{ resetKey }} className="borderless" />
        <div className="scene-bar">
          <ul className="shortcuts" aria-label="Workstation shortcuts">
            <li><a href="#publications">Publications</a></li>
            <li><a href={SCHOLAR_PROFILE_URL} {...EXTERNAL_LINK_PROPS}>Scholar<span className="sr-only"> (opens in a new tab)</span></a></li>
            <li><a href={GITHUB_URL} {...EXTERNAL_LINK_PROPS}>GitHub<span className="sr-only"> (opens in a new tab)</span></a></li>
          </ul>
          <button type="button" className="pref-btn ghost" onClick={() => setResetKey((k) => k + 1)}>
            <IconReset size={16} /> Reset view
          </button>
        </div>
      </div>
    </section>
  );
}
