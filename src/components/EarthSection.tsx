import { lazy, useState } from 'react';
import { SCHOLAR_PROFILE_URL, profile } from '../data/profile';
import { TOPICS, type Topic } from '../data/types';
import { useFinePointer } from '../hooks/useCapabilities';
import { useSelection } from '../lib/selection';
import { EXTERNAL_LINK_PROPS } from '../lib/url';
import { SceneShell } from '../scenes/SceneShell';
import { TOPIC_STYLE } from '../scenes/topicStyle';
import { IconHand, IconPin, IconReset, IconScholar } from './Icons';
import { TOPIC_ICON } from './topicIcons';

const ConnectedEarth = lazy(() => import('../scenes/ConnectedEarth'));

function TopicIcon({ t }: { t: Topic }) {
  const I = TOPIC_ICON[t];
  return <I size={15} />;
}


export function EarthSection() {
  const { filters, selectTopic } = useSelection();
  const fine = useFinePointer();
  const [open, setOpen] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [hold, setHold] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  return (
    <section className="section" id="research" aria-labelledby="earth-title">
      <div className="section-head">
        <p className="eyebrow"><span className="idx">03</span>Research</p>
        <h2 id="earth-title">The connected Earth</h2>
        <p className="lede">
          A gateway to my affiliation and research themes. The marker near Williamsburg, Kentucky is the institution location.
          The orbiting markers are research topics, and the arcs are a decorative, conceptual research network. They do not depict
          collaborations, partners or travel.
        </p>
      </div>
      <div
        className="earth-layout"
        onPointerEnter={() => setHold(true)}
        onPointerLeave={() => setHold(false)}
        onFocusCapture={() => setHold(true)}
        onBlurCapture={() => setHold(false)}
      >
        <div>
          <SceneShell
            kind="earth"
            Scene={ConnectedEarth}
            sceneProps={{ topic: filters.topic, onTopic: selectTopic, onAffiliation: () => setOpen((o) => !o), affiliationOpen: open, hold, interactive: interactive || fine, resetKey }}
          />
          <div className="scene-bar">
            {!fine && (
              <button type="button" className="pref-btn" aria-pressed={interactive} onClick={() => setInteractive((v) => !v)}>
                <IconHand size={16} />
                {interactive ? 'Exit globe interaction (scroll the page)' : 'Interact with globe'}
              </button>
            )}
            <button type="button" className="pref-btn" onClick={() => setResetKey((k) => k + 1)}>
              <IconReset size={16} /> Reset view
            </button>
          </div>
        </div>
        <div className="side">
          <button type="button" className="btn" aria-expanded={open} aria-controls="affil-card" onClick={() => setOpen((o) => !o)}>
            <IconPin size={17} />
            {open ? 'Hide affiliation' : 'Show affiliation'}
          </button>
          <div id="affil-card" className="affil-card" hidden={!open}>
            <span className="mono">Affiliation</span>
            <br />
            <strong>{profile.affiliation.institution}</strong>
            <br />
            {profile.affiliation.unit}, {profile.affiliation.place}
          </div>
          <h3 className="sub">Filter publications by topic</h3>
          <ul className="topic-list">
            {TOPICS.map((t) => {
              const on = filters.topic === t;
              return (
                <li key={t}>
                  <button type="button" className={`topic-btn${on ? ' on' : ''}`} aria-pressed={on} onClick={() => selectTopic(on ? 'all' : t)} style={{ ['--tag' as string]: TOPIC_STYLE[t].color }}>
                    <TopicIcon t={t} /> {t}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="note">
            Selecting a topic filters the <a href="#publications">publication directory</a>.{' '}
            <a href={SCHOLAR_PROFILE_URL} {...EXTERNAL_LINK_PROPS}><IconScholar size={15} /> Google Scholar profile<span className="sr-only"> (opens in a new tab)</span></a>
          </p>
        </div>
      </div>
    </section>
  );
}
