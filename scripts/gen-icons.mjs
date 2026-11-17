// Rasterises public/favicon.svg into PNG sizes, an apple-touch icon and a PNG-in-ICO favicon.ico.
import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const svg = readFileSync('public/favicon.svg');
const png = (size) => sharp(svg, { density: 384 }).resize(size, size).png().toBuffer();

const p32 = await png(32);
writeFileSync('public/favicon-32.png', p32);
writeFileSync('public/apple-touch-icon.png', await sharp(svg, { density: 512 }).resize(180, 180).flatten({ background: '#0b0e1a' }).png().toBuffer());
writeFileSync('public/icon-512.png', await png(512));

// ICO container with one embedded 32x32 PNG (supported by all current browsers).
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
const entry = Buffer.alloc(16);
entry.writeUInt8(32, 0);
entry.writeUInt8(32, 1);
entry.writeUInt8(0, 2);
entry.writeUInt8(0, 3);
entry.writeUInt16LE(1, 4);
entry.writeUInt16LE(32, 6);
entry.writeUInt32LE(p32.length, 8);
entry.writeUInt32LE(6 + 16, 12);
writeFileSync('public/favicon.ico', Buffer.concat([header, entry, p32]));
console.log('icons written');
