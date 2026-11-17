export const SCHOLAR_PROFILE_URL =
  'https://scholar.google.com/citations?hl=en&user=mAM8u_UAAAAJ&view_op=list_works&sortby=pubdate';
export const GITHUB_URL = 'https://github.com/archowdhury328-cloud';
export const SCHOLAR_USER = 'mAM8u_UAAAAJ';
export const SITE_URL = 'https://archowdhury328-cloud.github.io/';

export const profile = {
  name: 'Md Asikur Rahman Chy',
  monogram: 'MARC',
  role: 'AI & Business Analytics Researcher',
  headline: 'Research at the intersection of AI, analytics, and real-world decisions.',
  intro:
    'My research interests span artificial intelligence, business analytics, healthcare applications, cybersecurity, and economic decision-making. Explore my publications and research themes below.',
  affiliation: {
    unit: 'School of Business',
    institution: 'University of the Cumberlands',
    place: 'Williamsburg, KY, USA',
  },
  interests: [
    'Artificial intelligence',
    'Business analytics',
    'Healthcare applications',
    'Cybersecurity',
    'Economic decision-making',
  ],
  /** Owner-supplied Google Scholar snapshot; collection date unknown. */
  metrics: { citations: 146, hIndex: 7, i10Index: 5, source: 'Google Scholar snapshot supplied by the author.' },
} as const;

export const affiliationLine = `${profile.affiliation.unit}, ${profile.affiliation.institution}, ${profile.affiliation.place}`;
