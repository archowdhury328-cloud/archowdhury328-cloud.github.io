export const TOPICS = [
  'Healthcare AI',
  'Business Analytics',
  'Security & Privacy',
  'Economics & Society',
  'Industry & Supply Chains',
] as const;
export type Topic = (typeof TOPICS)[number];

export type VerificationStatus =
  /** Title, DOI, venue and (where present) authors matched a Crossref record; Scholar page not retrieved. */
  | 'crossref-matched'
  /** Only owner-supplied data; no external record matched. */
  | 'supplied-only';

export interface Publication {
  id: string;
  title: string;
  /** Year as shown on the owner-supplied Scholar list (used for sorting and filters). */
  year: number;
  venue?: string;
  /** Verified, complete author list when available; otherwise undefined (never guessed). */
  authors?: readonly string[];
  topic: Topic;
  scholarUrl: string;
  doiUrl?: string;
  repositoryUrl?: string;
  repositoryNote?: string;
  /** Owner-supplied Google Scholar snapshot count (collection date unknown). */
  citationCount: number;
  citationCountSource: string;
  snapshotDate: 'unknown';
  verificationStatus: VerificationStatus;
  sourceUrls: readonly string[];
  volume?: string;
  issue?: string;
  pages?: string;
  /** Crossref issued date, kept separate from the supplied year (may differ, e.g. conference vs. listing year). */
  crossrefIssued?: string;
  /** Two-sentence description written from the paper's published abstract (see summarySource). */
  summary: string;
  /** Where the abstract used for the summary came from. */
  summarySource: string;
  /** Method / theme tags taken from the abstract. */
  keywords: readonly string[];
  featured: boolean;
}
