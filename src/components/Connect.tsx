import { GITHUB_URL, SCHOLAR_PROFILE_URL, affiliationLine, profile } from '../data/profile';
import { publications } from '../data/publications';
import { EXTERNAL_LINK_PROPS } from '../lib/url';

export function CodeLinks() {
  const repos = publications.filter((p) => p.repositoryUrl);
  if (repos.length === 0) return null;
  return (
    <section className="section" id="code" aria-labelledby="code-title">
      <div className="section-head">
        <p className="eyebrow">Code</p>
        <h2 id="code-title">Verified code links</h2>
        <p className="lede">Only repositories that exist and correspond to a listed paper are shown. Having a paper does not imply a public implementation.</p>
      </div>
      <ul className="repo-list">
        {repos.map((p) => (
          <li key={p.id} className="repo">
            <h3 className="pub-title">{p.title}</h3>
            {p.repositoryNote && <p className="note">{p.repositoryNote}</p>}
            <a className="btn small" href={p.repositoryUrl} {...EXTERNAL_LINK_PROPS}>
              View repository on GitHub<span className="sr-only"> (opens in a new tab): {p.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Connect() {
  return (
    <section className="section" id="connect" aria-labelledby="connect-title">
      <div className="section-head">
        <p className="eyebrow">Connect</p>
        <h2 id="connect-title">Follow the work</h2>
        <p className="lede">
          I welcome thoughtful conversations about AI, analytics, and decision-making research. The best places to follow my work are my
          Google Scholar and GitHub profiles.
        </p>
      </div>
      <div className="actions">
        <a className="btn primary" href={SCHOLAR_PROFILE_URL} {...EXTERNAL_LINK_PROPS}>Google Scholar<span className="sr-only"> (opens in a new tab)</span></a>
        <a className="btn" href={GITHUB_URL} {...EXTERNAL_LINK_PROPS}>GitHub<span className="sr-only"> (opens in a new tab)</span></a>
      </div>
      <p className="note">{profile.name} · {affiliationLine}</p>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <p>
        © {profile.name}. Publication records follow the author's Google Scholar list; all co-authors are credited in the cited works.
      </p>
      <p className="note">
        Earth data: Natural Earth (public domain) via the world-atlas package (ISC). See the repository's asset-license notes.
      </p>
    </footer>
  );
}
