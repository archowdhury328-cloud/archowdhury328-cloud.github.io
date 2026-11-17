import { GITHUB_URL, SCHOLAR_PROFILE_URL, affiliationLine, profile } from '../data/profile';
import { publications } from '../data/publications';
import { EXTERNAL_LINK_PROPS } from '../lib/url';
import { IconArrowUpRight, IconGitHub, IconScholar } from './Icons';
import { SectionHead } from './Sections';

export function CodeLinks() {
  const repos = publications.filter((p) => p.repositoryUrl);
  if (repos.length === 0) return null;
  return (
    <section className="section" id="code" aria-labelledby="code-title">
      <SectionHead index="06" eyebrow="Code" title="Verified code links" id="code-title">
        <p className="lede">Only repositories that exist and correspond to a listed paper are shown. Having a paper does not imply a public implementation.</p>
      </SectionHead>
      <ul className="repo-list">
        {repos.map((p) => (
          <li key={p.id} className="repo">
            <span className="repo-icon"><IconGitHub size={22} /></span>
            <div>
              <h3 className="pub-title">{p.title}</h3>
              {p.repositoryNote && <p className="note">{p.repositoryNote}</p>}
              <a className="btn small" href={p.repositoryUrl} {...EXTERNAL_LINK_PROPS}>
                View repository on GitHub<span className="sr-only"> (opens in a new tab): {p.title}</span>
                <IconArrowUpRight size={14} />
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Connect() {
  return (
    <section className="section" id="connect" aria-labelledby="connect-title">
      <div className="connect-panel">
        <SectionHead index="07" eyebrow="Connect" title="Follow the work" id="connect-title">
          <p className="lede">
            I welcome thoughtful conversations about AI, analytics and decision-making research. The best places to follow new work are my
            Google Scholar and GitHub profiles.
          </p>
        </SectionHead>
        <div className="connect-links">
          <a className="connect-link" href={SCHOLAR_PROFILE_URL} {...EXTERNAL_LINK_PROPS}>
            <span className="connect-icon"><IconScholar size={26} /></span>
            <span>
              <strong>Google Scholar</strong>
              <span className="mono">Publications and current citation metrics</span>
            </span>
            <IconArrowUpRight size={18} />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a className="connect-link" href={GITHUB_URL} {...EXTERNAL_LINK_PROPS}>
            <span className="connect-icon"><IconGitHub size={26} /></span>
            <span>
              <strong>GitHub</strong>
              <span className="mono">github.com/archowdhury328-cloud</span>
            </span>
            <IconArrowUpRight size={18} />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        <p className="note">{profile.name} · {affiliationLine}</p>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p>
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} width="22" height="22" alt="" className="footer-mark" />© {new Date().getFullYear()}{' '}
          {profile.name}
        </p>
        <p className="note">
          Publication records follow the author&apos;s Google Scholar list; all co-authors are credited in the cited works. Earth coastlines: Natural Earth
          (public domain).
        </p>
      </div>
    </footer>
  );
}
