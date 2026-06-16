import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = join(__dirname, 'icon.svg');
const outDir = join(__dirname, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const sizes = [192, 512];
for (const size of sizes) {
  await sharp(svgPath).resize(size, size).png().toFile(join(outDir, `icon-${size}.png`));
}
// maskable (same art, safe-zone padding already baked into rounded rect design)
for (const size of sizes) {
  await sharp(svgPath).resize(size, size).png().toFile(join(outDir, `maskable-${size}.png`));
}
await sharp(svgPath).resize(32, 32).png().toFile(join(__dirname, '..', 'public', 'favicon-32.png'));
await sharp(svgPath).resize(180, 180).png().toFile(join(__dirname, '..', 'public', 'apple-touch-icon.png'));

console.log('Icons generated.');
