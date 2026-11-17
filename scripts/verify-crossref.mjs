// Looks up each supplied title in Crossref (public bibliographic API) and records the best match.
// Output: data/crossref-raw.json  (reviewed by hand before anything enters src/data/publications.ts)
import { writeFileSync } from 'node:fs';
const titles = {
  '01': 'A compact texture frequency spatial gating network for oral cancer classification from clinical oral images',
  '02': 'XACT-TB an explainable hybrid CNN–swin transformer framework for tuberculosis screening from chest X-ray images',
  '03': 'Explainable churn prediction in telecom with tabular ML five model benchmark and SHAP analysis',
  '04': 'Efficient Homomorphic Encryption Techniques for Confidential Big-Data Analytics over Public Cloud Infrastructures: Algorithms, Performance, and Trade-Offs',
  '05': 'Artificial Intelligence Models for End-to-End Supply Chain Optimization',
  '06': 'Economic Implications of Homelessness in the US Applying Advanced Business Analytics to Forecast Costs and Develop Sustainable Solutions',
  '07': 'Bio-Cognitive AI Systems for Predictive Healthcare Decision Support',
  '08': 'Blockchain-Driven Access Control and Compliance Auditing Framework for Federated Cloud Service Providers: Architecture, Prototype and Evaluation',
  '09': 'AI-augmented big data analytics for real-time cyber attack detection and proactive threat mitigation',
  '10': 'Understanding the Relationship Between Data Governance and Business Analytics Success: A Case Study of Global Corporations',
  '11': "Empowering Women through Microcredit: An Analysis of the Grameen Bank Model's Impact on Socio-Economic Outcomes",
  '12': 'AI-powered workforce analytics forecasting labor market trends and skill gaps for US economic competitiveness',
  '13': 'A Comparative Review of Machine Learning Algorithms in Supermarket Sales Forecasting with Big Data',
  '14': 'Harnessing Business Analytics in Management Information Systems to Foster Sustainable Economic Growth Through Smart Manufacturing and Industry 4.0',
  '15': 'Enhancing Cybersecurity Threat Detection and Response Through Big Data Analytics in Management Information Systems',
};
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const sim = (a, b) => { const A = new Set(norm(a).split(' ')), B = new Set(norm(b).split(' ')); let i = 0; A.forEach(w => B.has(w) && i++); return i / Math.max(A.size, B.size); };
const out = {};
for (const [id, t] of Object.entries(titles)) {
  const url = 'https://api.crossref.org/works?rows=3&select=DOI,title,author,container-title,issued,volume,issue,page,publisher,type,URL&query.bibliographic=' + encodeURIComponent(t);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'research-portfolio-verifier/1.0' } });
    const j = await r.json();
    const items = (j.message?.items ?? []).map(it => ({ ...it, score: sim(t, it.title?.[0] ?? '') }));
    items.sort((a, b) => b.score - a.score);
    out[id] = { query: t, best: items[0] ?? null, similarity: items[0]?.score ?? 0 };
    console.log(id, out[id].similarity.toFixed(2), items[0]?.DOI ?? '-', '|', (items[0]?.['container-title'] ?? []).join('/'));
  } catch (e) { out[id] = { query: t, error: String(e) }; console.log(id, 'ERR', String(e)); }
}
writeFileSync('data/crossref-raw.json', JSON.stringify(out, null, 2));
