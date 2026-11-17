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
  keywords: string[];
  summarySource: string;
  repositoryUrl?: string;
  repositoryNote?: string;
}

const SNAPSHOT = 'Google Scholar snapshot supplied by the author';

// Titles, years, citation counts, Scholar IDs and topics are owner-supplied. DOI, full venue and author lists are
// taken from matching Crossref records (see docs/content-sources.md). Summaries are written from each paper's published abstract (source recorded per record).
const BASE: readonly Base[] = [
  { id: 'p01', title: 'A compact texture frequency spatial gating network for oral cancer classification from clinical oral images', year: 2026, suffix: 'ULOm3_A8WrAC', citations: 3, topic: 'Healthcare AI', featured: true,
    summary: 'Proposes OCAT-Net-S, a compact 3.55M-parameter network that combines MBConv blocks with texture-frequency-spatial gating to classify clinical oral photographs as normal or oral cancer. Under leakage-aware grouped five-fold cross-validation on 1,238 images, the paper reports an AUC-ROC of 0.956 and a cancer F1 of 0.942, ahead of a TinyViT-5M baseline, with calibrated probabilities.',
    keywords: ['Oral cancer', 'Lightweight CNN', 'Attention gating', 'Calibration'], summarySource: 'OpenAlex', },
  { id: 'p02', title: 'XACT-TB an explainable hybrid CNN–swin transformer framework for tuberculosis screening from chest X-ray images', year: 2026, suffix: 'Zph67rFs4hoC', citations: 1, topic: 'Healthcare AI', featured: true,
    summary: 'Introduces XACT-TB, a dual-branch framework for tuberculosis screening on chest X-rays: a custom CNN captures local lesion detail while a Swin Transformer models global context, and the fused features are classified by an SVM. Grad-CAM heatmaps and attention maps make every prediction visually inspectable for clinicians.',
    keywords: ['Tuberculosis', 'CNN + Swin Transformer', 'Grad-CAM', 'Explainable AI'], summarySource: 'OpenAlex',
    repositoryUrl: 'https://github.com/archowdhury328-cloud/XACT-TB', repositoryNote: 'Public repository for the XACT-TB project.' },
  { id: 'p03', title: 'Explainable churn prediction in telecom with tabular ML five model benchmark and SHAP analysis', year: 2026, suffix: 'Se3iqnhoufwC', citations: 10, topic: 'Business Analytics', featured: true,
    volume: '6', issue: '1', pages: '263',
    summary: 'Benchmarks five tabular learners (elastic-net logistic regression, RBF SVM, random forest, XGBoost and a multilayer perceptron) for telecom churn under nested cross-validation with fold-wise Wilcoxon tests. SHAP, partial-dependence and ICE analyses relate churn risk to tenure, technical tickets, monthly charges and month-to-month contracts.',
    keywords: ['Customer churn', 'Nested CV', 'SHAP', 'Model benchmarking'], summarySource: 'OpenAlex',
    repositoryUrl: 'https://github.com/archowdhury328-cloud/Explainable-Telecom-Churn',
    repositoryNote: 'Independent public-data reconstruction and statistical audit of this paper, not the original authors’ code. On the public Telco table it did not reproduce the reported accuracy; the repository documents why.' },
  { id: 'p04', title: 'Efficient Homomorphic Encryption Techniques for Confidential Big-Data Analytics over Public Cloud Infrastructures: Algorithms, Performance, and Trade-Offs', year: 2026, suffix: 'MXK_kJrjxJIC', citations: 2, topic: 'Security & Privacy', featured: true,
    venue: 'International Conference on Computing and Communication Networks', pages: '507–528',
    summary: 'Compares partially, somewhat, fully and SIMD-batched fully homomorphic encryption for confidential big-data analytics on public clouds, with tuned parameters and noise-resistant encoding to cut overhead. In simulation, the paper reports that SIMD-FHE lowers encryption time relative to conventional FHE, sustains more than 55 operations per second and shrinks ciphertext expansion.',
    keywords: ['Homomorphic encryption', 'Cloud privacy', 'SIMD-FHE', 'Performance trade-offs'], summarySource: 'Springer chapter page', },
  { id: 'p05', title: 'Artificial Intelligence Models for End-to-End Supply Chain Optimization', year: 2026, suffix: '8k81kl-MbHgC', citations: 3, topic: 'Industry & Supply Chains',
    summary: 'Proposes an end-to-end AI framework for supply chains that pairs predictive demand forecasting, adaptive inventory optimisation, reinforcement-learning logistics routing and explainable supplier-risk scoring. IoT data streams and digital-twin models of the network support real-time decisions, evaluated against conventional and rule-based approaches.',
    keywords: ['Supply chain', 'Reinforcement learning', 'Digital twins', 'Demand forecasting'], summarySource: 'OpenAlex', },
  { id: 'p06', title: 'Economic Implications of Homelessness in the US Applying Advanced Business Analytics to Forecast Costs and Develop Sustainable Solutions', year: 2026, suffix: 'hqOjcs7Dif8C', citations: 7, topic: 'Economics & Society',
    summary: 'Uses business-analytics forecasting to quantify the direct and indirect costs of homelessness in the United States, from shelters and healthcare to lost productivity. The study projects total costs rising from $26.2 billion in FY2023 to $42.2 billion by FY2033 without intervention, and models how affordable housing, health promotion and workforce programmes could reduce that burden.',
    keywords: ['Homelessness', 'Cost forecasting', 'Public policy', 'Business analytics'], summarySource: 'Semantic Scholar', },
  { id: 'p07', title: 'Bio-Cognitive AI Systems for Predictive Healthcare Decision Support', year: 2026, suffix: 'UebtZRa9Y70C', citations: 16, topic: 'Healthcare AI',
    summary: 'Designs a bio-cognitive AI architecture for predictive clinical decision support that fuses electronic health records, physiological signals and longitudinal biomarkers through deep learning, cognitive reasoning and adaptive learning. It targets early warning for chronic disease with explainable predictions, uncertainty estimates and privacy-preserving federated learning.',
    keywords: ['Clinical decision support', 'Multimodal EHR', 'Federated learning', 'Explainability'], summarySource: 'OpenAlex', },
  { id: 'p08', title: 'Blockchain-Driven Access Control and Compliance Auditing Framework for Federated Cloud Service Providers: Architecture, Prototype and Evaluation', year: 2026, suffix: 'roLk4NBRz8UC', citations: 8, topic: 'Security & Privacy',
    venue: 'International Conference on Computing and Communication Networks', pages: '464–487',
    summary: 'Proposes a blockchain-based access-control and compliance-auditing framework for federated cloud providers that combines decentralised attribute-based access control with smart contracts. Access rules are enforced autonomously and logged immutably, and a cryptographic token scheme lets policies be checked without exposing sensitive attributes; a prototype is evaluated in simulation.',
    keywords: ['Blockchain', 'Access control (ABAC)', 'Smart contracts', 'Compliance auditing'], summarySource: 'Springer chapter page', },
  { id: 'p09', title: 'AI-augmented big data analytics for real-time cyber attack detection and proactive threat mitigation', year: 2025, suffix: 'WF5omc3nYNoC', citations: 28, topic: 'Security & Privacy',
    summary: 'Examines how AI-augmented big-data analytics supports real-time detection and prevention of cyberattacks, from malware and phishing to ransomware and advanced persistent threats. It reviews behavioural analysis, threat-intelligence integration and anomaly detection as foundations for predictive modelling and automated incident response.',
    keywords: ['Threat detection', 'Big data', 'Anomaly detection', 'Incident response'], summarySource: 'OpenAlex', },
  { id: 'p10', title: 'Understanding the Relationship Between Data Governance and Business Analytics Success: A Case Study of Global Corporations', year: 2024, suffix: '5nxA0vEk-isC', citations: 5, topic: 'Business Analytics',
    summary: 'Studies how data governance relates to business-analytics success in multinational firms, using a mixed-methods design and structural equation modelling on survey data from 250 firms. The paper reports positive associations for data-quality management (β = 0.42), policy compliance (β = 0.36) and governance frameworks (β = 0.49).',
    keywords: ['Data governance', 'Structural equation modelling', 'Mixed methods', 'Business analytics'], summarySource: 'OpenAlex', },
  { id: 'p11', title: "Empowering Women through Microcredit: An Analysis of the Grameen Bank Model's Impact on Socio-Economic Outcomes", year: 2024, suffix: 'eQOLeE2rZwMC', citations: 4, topic: 'Economics & Society',
    summary: 'Assesses how the Grameen Bank microcredit model affects women’s socio-economic status in Bangladesh, using mixed methods drawn from impact reports and case studies. It finds gains in income, financial independence, decision-making autonomy and social mobility, alongside repayment pressure and dependency risks, and offers recommendations for policymakers and lenders.',
    keywords: ['Microfinance', 'Women’s empowerment', 'Grameen Bank', 'Mixed methods'], summarySource: 'OpenAlex', },
  { id: 'p12', title: 'AI-powered workforce analytics forecasting labor market trends and skill gaps for US economic competitiveness', year: 2024, suffix: 'zYLM7Y9cAGgC', citations: 24, topic: 'Business Analytics',
    venue: 'Journal of Computer Science and Technology Studies', volume: '6', issue: '5', pages: '265–277',
    summary: 'Investigates how AI-driven workforce analytics forecasts labour-market trends and skill gaps, surveying 300 HR analysts, labour economists and policymakers across U.S. industries. The paper reports that AI integration and predictive accuracy are the strongest predictors of economic competitiveness (R² = 0.61).',
    keywords: ['Workforce analytics', 'Labour markets', 'Skill gaps', 'Regression analysis'], summarySource: 'OpenAlex', },
  { id: 'p13', title: 'A Comparative Review of Machine Learning Algorithms in Supermarket Sales Forecasting with Big Data', year: 2024, suffix: 'IjCSPb-OGe4C', citations: 9, topic: 'Industry & Supply Chains',
    venue: 'Journal of Ecohumanism', volume: '3', issue: '8', pages: '14457–14467',
    summary: 'Compares machine-learning models (decision trees, gradient boosting, XGBoost, random forest and extra trees) for forecasting supermarket sales after big-data preprocessing and anomaly analysis. The paper reports that the Extra Trees model performed best, with R² = 0.94 and MAE = 1.96.',
    keywords: ['Sales forecasting', 'Ensemble learning', 'Retail analytics', 'Big data'], summarySource: 'OpenAlex', },
  { id: 'p14', title: 'Harnessing Business Analytics in Management Information Systems to Foster Sustainable Economic Growth Through Smart Manufacturing and Industry 4.0', year: 2024, suffix: 'UeHWp8X0CEIC', citations: 5, topic: 'Industry & Supply Chains',
    venue: 'Educational Administration: Theory and Practice', volume: '30', issue: '10', pages: '730–739',
    summary: 'Reviews how business analytics and management information systems support decision-making and sustainable growth in Industry 4.0 smart manufacturing. The work combines case analysis of manufacturing firms, expert surveys and a real-time IoT environment with predictive and prescriptive models.',
    keywords: ['Industry 4.0', 'Smart manufacturing', 'MIS', 'Prescriptive analytics'], summarySource: 'OpenAlex', },
  { id: 'p15', title: 'Enhancing Cybersecurity Threat Detection and Response Through Big Data Analytics in Management Information Systems', year: 2023, suffix: 'qjMakFHDy7sC', citations: 21, topic: 'Security & Privacy',
    venue: 'Fuel Cells Bulletin', volume: '2023', issue: '12', pages: '1–17',
    summary: 'Analyses how big-data analytics strengthens threat detection and response inside management information systems, combining quantitative and qualitative methods. Machine-learning models trained on incident and response data are used to assess predictive threat detection and earlier, faster organisational response.',
    keywords: ['Cybersecurity', 'Big data analytics', 'MIS', 'Machine learning'], summarySource: 'OpenAlex', },
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
    summarySource: `Written from the published abstract (via ${b.summarySource})`,
    keywords: b.keywords,
    featured: b.featured ?? false,
  };
}

export const publications: readonly Publication[] = BASE.map(build);
export const featuredPublications = publications.filter((p) => p.featured);
export const publicationById = (id: string): Publication | undefined => publications.find((p) => p.id === id);
