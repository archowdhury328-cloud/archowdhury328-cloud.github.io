import { lazy, useState } from 'react';
import { GITHUB_URL, SCHOLAR_PROFILE_URL, affiliationLine, profile } from '../data/profile';
import { EXTERNAL_LINK_PROPS } from '../lib/url';
import { SceneShell } from '../scenes/SceneShell';

const ResearchWorkstation = lazy(() => import('../scenes/ResearchWorkstation'));

export function Hero() {
  const [resetKey, setResetKey] = useState(0);
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow">{profile.role}</p>
        <h1 id="hero-title" className="name">{profile.name}</h1>
        <p className="headline">{profile.headline}</p>
        <p className="lede">{profile.intro}</p>
        <p className="affil">{affiliationLine}</p>
        <div className="actions">
          <a className="btn primary" href="#publications">Explore publications</a>
          <a className="btn" href={SCHOLAR_PROFILE_URL} {...EXTERNAL_LINK_PROPS}>
            Google Scholar<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a className="btn" href={GITHUB_URL} {...EXTERNAL_LINK_PROPS}>
            GitHub<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
      <div className="hero-scene">
        <SceneShell kind="workstation" Scene={ResearchWorkstation} sceneProps={{ resetKey }} />
        <div className="scene-bar">
          <ul className="shortcuts" aria-label="Workstation shortcuts">
            <li><a href="#publications">Publications</a></li>
            <li><a href={SCHOLAR_PROFILE_URL} {...EXTERNAL_LINK_PROPS}>Scholar<span className="sr-only"> (opens in a new tab)</span></a></li>
            <li><a href={GITHUB_URL} {...EXTERNAL_LINK_PROPS}>GitHub<span className="sr-only"> (opens in a new tab)</span></a></li>
          </ul>
          <button type="button" className="pref-btn" onClick={() => setResetKey((k) => k + 1)}>Reset view</button>
        </div>
      </div>
    </section>
  );
}
