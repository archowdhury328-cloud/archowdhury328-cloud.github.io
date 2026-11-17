import type { ReactNode } from 'react';
import { SCHOLAR_PROFILE_URL, profile } from '../data/profile';
import { publications } from '../data/publications';
import type { Topic } from '../data/types';
import { EXTERNAL_LINK_PROPS } from '../lib/url';
import { TOPIC_STYLE } from '../scenes/topicStyle';
import { IconArrowUpRight, IconBook, IconBrain, IconChart, IconPin, IconPulse, IconQuote, IconScale, IconShield, IconSpark } from './Icons';

export function SectionHead({ index, eyebrow, title, id, children }: { index: string; eyebrow: string; title: ReactNode; id: string; children?: ReactNode }) {
  return (
    <div className="section-head">
      <p className="eyebrow">
        <span className="idx">{index}</span>
        {eyebrow}
      </p>
      <h2 id={id}>{title}</h2>
      {children}
    </div>
  );
}

export function ResearchMetrics() {
  const m = profile.metrics;
  const items = [
    { label: 'Citations', value: m.citations, icon: <IconQuote size={20} /> },
    { label: 'h-index', value: m.hIndex, icon: <IconChart size={20} /> },
    { label: 'i10-index', value: m.i10Index, icon: <IconSpark size={20} /> },
    { label: 'Listed publications', value: publications.length, icon: <IconBook size={20} /> },
  ];
  return (
    <section className="section" id="snapshot" aria-labelledby="snap-title">
      <SectionHead index="01" eyebrow="Research snapshot" title="At a glance" id="snap-title" />
      <ul className="metrics" aria-label="Research metrics">
        {items.map((i) => (
          <li key={i.label} className="metric">
            <span className="metric-icon">{i.icon}</span>
            <span className="metric-value">{i.value}</span>
            <span className="metric-label">{i.label}</span>
          </li>
        ))}
      </ul>
      <p className="note">
        {m.source} The collection date is unknown; these figures are not live.{' '}
        <a href={SCHOLAR_PROFILE_URL} {...EXTERNAL_LINK_PROPS}>
          See current metrics on Google Scholar<span className="sr-only"> (opens in a new tab)</span>
          <IconArrowUpRight size={14} />
        </a>
        .
      </p>
    </section>
  );
}

const count = (t: Topic) => publications.filter((p) => p.topic === t).length;

const INTERESTS: { title: string; text: string; icon: ReactNode; color: string; meta: string }[] = [
  {
    title: 'Artificial intelligence',
    text: 'Deep learning and machine-learning models, with attention to explainability, calibration and leakage-aware evaluation.',
    icon: <IconBrain size={22} />,
    color: '#9B7BFF',
    meta: `Methods used across all ${publications.length} listed papers`,
  },
  {
    title: 'Business analytics',
    text: 'Predictive analytics for customers, workforces and organisations, from churn models to data-governance studies.',
    icon: <IconChart size={22} />,
    color: TOPIC_STYLE['Business Analytics'].color,
    meta: `${count('Business Analytics')} papers in Business Analytics`,
  },
  {
    title: 'Healthcare applications',
    text: 'Medical image classification and clinical decision support, including oral-cancer and tuberculosis screening.',
    icon: <IconPulse size={22} />,
    color: TOPIC_STYLE['Healthcare AI'].color,
    meta: `${count('Healthcare AI')} papers in Healthcare AI`,
  },
  {
    title: 'Cybersecurity',
    text: 'Threat detection with big-data analytics, homomorphic encryption for private analytics and blockchain access control.',
    icon: <IconShield size={22} />,
    color: TOPIC_STYLE['Security & Privacy'].color,
    meta: `${count('Security & Privacy')} papers in Security & Privacy`,
  },
  {
    title: 'Economic decision-making',
    text: 'Analytics for social and economic questions, such as the costs of homelessness and microcredit for women.',
    icon: <IconScale size={22} />,
    color: TOPIC_STYLE['Economics & Society'].color,
    meta: `${count('Economics & Society') + count('Industry & Supply Chains')} papers in Economics, Industry & Supply Chains`,
  },
];

export function About() {
  return (
    <section className="section about" id="about" aria-labelledby="about-title">
      <SectionHead index="02" eyebrow="About" title="Research interests" id="about-title">
        <p className="lede">{profile.intro}</p>
      </SectionHead>
      <ul className="interest-grid" aria-label="Research interests">
        {INTERESTS.map((i) => (
          <li key={i.title} className="interest" style={{ ['--accent' as string]: i.color }}>
            <span className="interest-icon">{i.icon}</span>
            <h3>{i.title}</h3>
            <p>{i.text}</p>
            <p className="mono">{i.meta}</p>
          </li>
        ))}
        <li className="interest affil-tile">
          <span className="interest-icon">
            <IconPin size={22} />
          </span>
          <h3>Affiliation</h3>
          <p>
            {profile.affiliation.unit}
            <br />
            {profile.affiliation.institution}
          </p>
          <p className="mono">{profile.affiliation.place}</p>
        </li>
      </ul>
    </section>
  );
}
