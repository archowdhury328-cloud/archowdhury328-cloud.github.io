import { lazy, useState } from 'react';
import { publications } from '../data/publications';
import { TOPICS, type Topic } from '../data/types';
import { useFinePointer } from '../hooks/useCapabilities';
import { usePreferences } from '../hooks/useMotionPreference';
import { useSelection } from '../lib/selection';
import { SceneShell } from '../scenes/SceneShell';
import { TOPIC_STYLE } from '../scenes/topicStyle';
import { IconCube, IconHand, IconList, IconReset } from './Icons';
import { TOPIC_ICON } from './topicIcons';
import { PublicationDetails } from './PublicationDetails';

const PublicationSystem = lazy(() => import('../scenes/PublicationSystem'));

function TopicIcon({ t }: { t: Topic }) {
  const I = TOPIC_ICON[t];
  return <I size={15} />;
}


type View = 'scene' | 'list';

export function SolarSection() {
  const { filters, selectedId, selected, selectPublication, selectTopic } = useSelection();
  const { viewMode } = usePreferences();
  const fine = useFinePointer();
  const [view, setView] = useState<View>('scene');
  const [interactive, setInteractive] = useState(false);
  const [hold, setHold] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const effective: View = viewMode === 'simple' ? 'list' : view;
  const showAll = () => {
    selectTopic('all');
    selectPublication(null);
  };

  return (
    <section className="section" id="solar-system" aria-labelledby="solar-title">
      <div className="section-head">
        <p className="eyebrow"><span className="idx">04</span>Publication solar system</p>
        <h2 id="solar-title">All {publications.length} publications, by topic</h2>
        <p className="lede">
          Each planet is a topic and each satellite is one publication. The grouping is editorial navigation, not a claim made by the papers.
          Every publication node is the same size, so size encodes nothing; topics are told apart by shape and label as well as colour.
        </p>
      </div>

      <div className="toolbar">
        <div role="group" aria-label="Filter by topic" className="topic-bar">
          {TOPICS.map((t) => {
            const on = filters.topic === t;
            return (
              <button key={t} type="button" className={`topic-btn${on ? ' on' : ''}`} aria-pressed={on} onClick={() => selectTopic(on ? 'all' : t)} style={{ ['--tag' as string]: TOPIC_STYLE[t].color }}>
                <TopicIcon t={t} /> {t}
              </button>
            );
          })}
          <button type="button" className="btn small" onClick={showAll}>View all publications</button>
        </div>
        <div role="group" aria-label="View" className="view-toggle">
          <button type="button" className="pref-btn" aria-pressed={effective === 'scene'} disabled={viewMode === 'simple'} onClick={() => setView('scene')}>
            <IconCube size={16} /> 3D scene
          </button>
          <button type="button" className="pref-btn" aria-pressed={effective === 'list'} onClick={() => setView('list')}>
            <IconList size={16} /> List view
          </button>
        </div>
      </div>

      <div className="solar-layout" onPointerEnter={() => setHold(true)} onPointerLeave={() => setHold(false)} onFocusCapture={() => setHold(true)} onBlurCapture={() => setHold(false)}>
        <div>
          {effective === 'scene' ? (
            <>
              <SceneShell
                kind="system"
                Scene={PublicationSystem}
                sceneProps={{ topic: filters.topic, selectedId, onSelect: selectPublication, onTopic: selectTopic, hold, interactive: interactive || fine, resetKey }}
              />
              <div className="scene-bar">
                {!fine && (
                  <button type="button" className="pref-btn" aria-pressed={interactive} onClick={() => setInteractive((v) => !v)}>
                    <IconHand size={16} />
                    {interactive ? 'Exit scene interaction (scroll the page)' : 'Interact with scene'}
                  </button>
                )}
                <button type="button" className="pref-btn" onClick={() => setResetKey((k) => k + 1)}>
                  <IconReset size={16} /> Reset view
                </button>
              </div>
            </>
          ) : (
            <ul className="solar-list" aria-label="Publications grouped by topic">
              {TOPICS.map((t) => (
                <li key={t}>
                  <h3 className="sub"><TopicIcon t={t} /> {t}</h3>
                  <ul>
                    {publications.filter((p) => p.topic === t).map((p) => (
                      <li key={p.id}>
                        <button type="button" className={`list-pick${selectedId === p.id ? ' on' : ''}`} aria-pressed={selectedId === p.id} onClick={() => selectPublication(selectedId === p.id ? null : p.id)}>
                          <span className="mono">{p.year}</span> {p.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
        <PublicationDetails pub={selected} onClear={() => selectPublication(null)} />
      </div>
    </section>
  );
}
