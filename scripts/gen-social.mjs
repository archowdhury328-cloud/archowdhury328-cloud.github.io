// Generates public/social-preview/og.png (1200x630) locally from an SVG; no external services or fonts fetched.
import { mkdirSync } from 'node:fs';
import sharp from 'sharp';

const rings = Array.from({ length: 10 }, (_, i) => {
  const rx = 150 + i * 62;
  const ry = 80 + i * 34;
  return `<ellipse cx="860" cy="330" rx="${rx}" ry="${ry}" fill="none" stroke="#9B7BFF" stroke-opacity="${(0.5 - i * 0.045).toFixed(2)}" stroke-width="1.5"/>`;
}).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#070910"/>
  ${rings}
  <rect x="80" y="96" width="128" height="52" rx="10" fill="none" stroke="#9B7BFF" stroke-width="2"/>
  <text x="144" y="133" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="30" letter-spacing="3" fill="#9B7BFF">MARC</text>
  <text x="80" y="268" font-family="Georgia, 'Times New Roman', serif" font-size="68" fill="#F3F5FA">Md Asikur</text>
  <text x="80" y="346" font-family="Georgia, 'Times New Roman', serif" font-size="68" fill="#F3F5FA">Rahman Chy</text>
  <text x="80" y="410" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#AAB4C8">Research at the intersection of AI, analytics,</text>
  <text x="80" y="446" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#AAB4C8">and real-world decisions.</text>
  <text x="80" y="548" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#69D9E8">School of Business, University of the Cumberlands</text>
  <text x="80" y="580" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#69D9E8">Williamsburg, KY, USA</text>
</svg>`;

mkdirSync('public/social-preview', { recursive: true });
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile('public/social-preview/og.png');
console.log('wrote public/social-preview/og.png');
