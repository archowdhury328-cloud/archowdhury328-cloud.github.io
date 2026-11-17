import { useState } from 'react';
import type { Publication } from '../data/types';
import { formatCitation, toBibtex, toCitationText } from '../lib/publicationQuery';
import { AuthorLine, PublicationLinks, TopicTag } from './PublicationCard';

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Readable HTML panel for the selected publication; lives in normal document flow. */
export function PublicationDetails({ pub, onClear }: { pub: Publication | undefined; onClear: () => void }) {
  const [status, setStatus] = useState('');

  if (!pub) {
    return (
      <aside className="details empty" aria-label="Publication details">
        <h3>Publication details</h3>
        <p>Select a publication satellite in the scene, or a title in the list, to read its details here.</p>
      </aside>
    );
  }
  const bib = toBibtex(pub);
  const cite = formatCitation(pub);
  const doCopy = async (text: string, what: string) => setStatus((await copy(text)) ? `${what} copied.` : `Could not copy ${what.toLowerCase()}; select the text manually.`);

  return (
    <aside className="details" aria-label="Publication details" data-testid="details">
      <div className="pub-meta">
        <span className="mono">{pub.year}</span>
        <TopicTag topic={pub.topic} />
      </div>
      <h3 className="pub-title">{pub.title}</h3>
      {pub.venue && <p className="venue">{pub.venue}{cite ? `, ${cite}` : ''}</p>}
      <AuthorLine authors={pub.authors} />
      <p className="summary">{pub.summary}</p>
      <p className="mono small-meta">
        {pub.citationCount} {pub.citationCount === 1 ? 'citation' : 'citations'} · {pub.citationCountSource}; collection date unknown
      </p>
      {pub.repositoryNote && <p className="note">{pub.repositoryNote}</p>}
      <PublicationLinks pub={pub} />
      <div className="pub-links">
        <button type="button" className="btn small" onClick={() => doCopy(toCitationText(pub), 'Citation')}>Copy citation</button>
        {bib && <button type="button" className="btn small" onClick={() => doCopy(bib, 'BibTeX')}>Copy BibTeX</button>}
        <button type="button" className="link-btn" onClick={onClear}>Clear selection</button>
      </div>
      <p className="sr-status" role="status">{status}</p>
      {!pub.authors && <p className="note">Author list not shown: no complete, verified list was available.</p>}
    </aside>
  );
}
