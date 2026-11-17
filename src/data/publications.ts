import verified from './verifiedMeta.json';
import { SCHOLAR_USER } from './profile';
import type { Publication, Topic, VerificationStatus } from './types';

interface VerifiedMeta {
  doi: string;
  venue?: string;
  issued?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  authors?: string[];
}
const meta = verified as unknown as Record<string, VerifiedMeta>;

export const scholarCitationUrl = (suffix: string): string =>
  `https://scholar.google.com/citations?view_op=view_citation&hl=en&user=${SCHOLAR_USER}&citation_for_view=${SCHOLAR_USER}:${suffix}`;

interface Base {
  id: string;
  title: string;
  year: number;
  suffix: string;
  citations: number;
  topic: Topic;
  featured?: boolean;
  /** Venue given by the owner in full. Fragments are never completed by guesswork; see verifiedMeta. */
  venue?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  summary: string;
  repositoryUrl?: string;
  repositoryNote?: string;
}

const SNAPSHOT = 'Google Scholar snapshot supplied by the author';

// Titles, years, citation counts, Scholar IDs and topics are owner-supplied. DOI, full venue and author lists are
// taken from matching Crossref records (see docs/content-sources.md). Summaries are title-level descriptions only.
const BASE: readonly Base[] = [
  { id: 'p01', title: 'A compact texture frequency spatial gating network for oral cancer classification from clinical oral images', year: 2026, suffix: 'ULOm3_A8WrAC', citations: 3, topic: 'Healthcare AI', featured: true,
    summary: 'A neural-network study on classifying oral cancer from clinical oral images.' },
  { id: 'p02', title: 'XACT-TB an explainable hybrid CNN–swin transformer framework for tuberculosis screening from chest X-ray images', year: 2026, suffix: 'Zph67rFs4hoC', citations: 1, topic: 'Healthcare AI', featured: true,
    summary: 'An explainable hybrid CNN and Swin-transformer approach to tuberculosis screening from chest X-ray images.',
    repositoryUrl: 'https://github.com/archowdhury328-cloud/XACT-TB', repositoryNote: 'Public repository for the XACT-TB project.' },
  { id: 'p03', title: 'Explainable churn prediction in telecom with tabular ML five model benchmark and SHAP analysis', year: 2026, suffix: 'Se3iqnhoufwC', citations: 10, topic: 'Business Analytics', featured: true,
    volume: '6', issue: '1', pages: '263',
    summary: 'A benchmark of five tabular machine-learning models for telecom churn prediction, with SHAP-based explanation.',
    repositoryUrl: 'https://github.com/archowdhury328-cloud/Explainable-Telecom-Churn',
    repositoryNote: 'Independent public-data reconstruction and statistical audit of this paper; not the original authors’ code.' },
  { id: 'p04', title: 'Efficient Homomorphic Encryption Techniques for Confidential Big-Data Analytics over Public Cloud Infrastructures: Algorithms, Performance, and Trade-Offs', year: 2026, suffix: 'MXK_kJrjxJIC', citations: 2, topic: 'Security & Privacy', featured: true,
    venue: 'International Conference on Computing and Communication Networks', pages: '507–528',
    summary: 'A study of homomorphic-encryption techniques for confidential big-data analytics on public cloud infrastructure.' },
  { id: 'p05', title: 'Artificial Intelligence Models for End-to-End Supply Chain Optimization', year: 2026, suffix: '8k81kl-MbHgC', citations: 3, topic: 'Industry & Supply Chains',
    summary: 'Artificial-intelligence models applied to end-to-end supply chain optimization.' },
  { id: 'p06', title: 'Economic Implications of Homelessness in the US Applying Advanced Business Analytics to Forecast Costs and Develop Sustainable Solutions', year: 2026, suffix: 'hqOjcs7Dif8C', citations: 7, topic: 'Economics & Society',
    summary: 'Business-analytics methods applied to forecasting the economic costs of homelessness in the United States.' },
  { id: 'p07', title: 'Bio-Cognitive AI Systems for Predictive Healthcare Decision Support', year: 2026, suffix: 'UebtZRa9Y70C', citations: 16, topic: 'Healthcare AI',
    summary: 'Bio-cognitive AI systems for predictive decision support in healthcare.' },
  { id: 'p08', title: 'Blockchain-Driven Access Control and Compliance Auditing Framework for Federated Cloud Service Providers: Architecture, Prototype and Evaluation', year: 2026, suffix: 'roLk4NBRz8UC', citations: 8, topic: 'Security & Privacy',
    venue: 'International Conference on Computing and Communication Networks', pages: '464–487',
    summary: 'A blockchain-based access-control and compliance-auditing framework for federated cloud service providers.' },
  { id: 'p09', title: 'AI-augmented big data analytics for real-time cyber attack detection and proactive threat mitigation', year: 2025, suffix: 'WF5omc3nYNoC', citations: 28, topic: 'Security & Privacy',
    summary: 'AI-augmented big-data analytics for real-time cyber-attack detection and proactive threat mitigation.' },
  { id: 'p10', title: 'Understanding the Relationship Between Data Governance and Business Analytics Success: A Case Study of Global Corporations', year: 2024, suffix: '5nxA0vEk-isC', citations: 5, topic: 'Business Analytics',
    summary: 'A case study of how data governance relates to business-analytics success in global corporations.' },
  { id: 'p11', title: "Empowering Women through Microcredit: An Analysis of the Grameen Bank Model's Impact on Socio-Economic Outcomes", year: 2024, suffix: 'eQOLeE2rZwMC', citations: 4, topic: 'Economics & Society',
    summary: 'An analysis of the Grameen Bank microcredit model and socio-economic outcomes for women.' },
  { id: 'p12', title: 'AI-powered workforce analytics forecasting labor market trends and skill gaps for US economic competitiveness', year: 2024, suffix: 'zYLM7Y9cAGgC', citations: 24, topic: 'Business Analytics',
    venue: 'Journal of Computer Science and Technology Studies', volume: '6', issue: '5', pages: '265–277',
    summary: 'AI-powered workforce analytics for forecasting labor-market trends and skill gaps.' },
  { id: 'p13', title: 'A Comparative Review of Machine Learning Algorithms in Supermarket Sales Forecasting with Big Data', year: 2024, suffix: 'IjCSPb-OGe4C', citations: 9, topic: 'Industry & Supply Chains',
    venue: 'Journal of Ecohumanism', volume: '3', issue: '8', pages: '14457–14467',
    summary: 'A comparative review of machine-learning algorithms for supermarket sales forecasting with big data.' },
  { id: 'p14', title: 'Harnessing Business Analytics in Management Information Systems to Foster Sustainable Economic Growth Through Smart Manufacturing and Industry 4.0', year: 2024, suffix: 'UeHWp8X0CEIC', citations: 5, topic: 'Industry & Supply Chains',
    venue: 'Educational Administration: Theory and Practice', volume: '30', issue: '10', pages: '730–739',
    summary: 'Business analytics in management information systems for sustainable growth through smart manufacturing and Industry 4.0.' },
  { id: 'p15', title: 'Enhancing Cybersecurity Threat Detection and Response Through Big Data Analytics in Management Information Systems', year: 2023, suffix: 'qjMakFHDy7sC', citations: 21, topic: 'Security & Privacy',
    venue: 'Fuel Cells Bulletin', volume: '2023', issue: '12', pages: '1–17',
    summary: 'Big-data analytics for cybersecurity threat detection and response in management information systems.' },
];

function build(b: Base): Publication {
  const num = b.id.slice(1);
  const v = meta[num];
  const status: VerificationStatus = v ? 'crossref-matched' : 'supplied-only';
  return {
    id: b.id,
    title: b.title,
    year: b.year,
    // Owner-supplied complete venue wins; otherwise the matched Crossref container title.
    venue: b.venue ?? v?.venue,
    authors: v?.authors,
    topic: b.topic,
    scholarUrl: scholarCitationUrl(b.suffix),
    doiUrl: v ? `https://doi.org/${v.doi}` : undefined,
    repositoryUrl: b.repositoryUrl,
    repositoryNote: b.repositoryNote,
    citationCount: b.citations,
    citationCountSource: SNAPSHOT,
    snapshotDate: 'unknown',
    verificationStatus: status,
    sourceUrls: v ? [`https://api.crossref.org/works/${v.doi}`] : [],
    volume: b.volume ?? v?.volume,
    issue: b.issue ?? v?.issue,
    pages: b.pages ?? v?.pages,
    crossrefIssued: v?.issued,
    summary: b.summary,
    featured: b.featured ?? false,
  };
}

export const publications: readonly Publication[] = BASE.map(build);
export const featuredPublications = publications.filter((p) => p.featured);
export const publicationById = (id: string): Publication | undefined => publications.find((p) => p.id === id);
