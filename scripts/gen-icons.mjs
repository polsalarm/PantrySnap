import sharp from 'sharp';
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcPath = join(__dirname, '..', 'steve.png');
const publicSteve = join(__dirname, '..', 'public', 'steve.png');
const outDir = join(__dirname, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

/** App paper ground. */
const BG = { r: 247, g: 245, b: 242, alpha: 1 };

/**
 * Punch the studio-black backdrop so Steve can sit on paper UI.
 * Only near-pure black is cleared — dark fur and the mouth stay.
 */
async function knockOutBlack(inputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const px = data;
  for (let i = 0; i < px.length; i += 4) {
    const maxc = Math.max(px[i], px[i + 1], px[i + 2]);
    if (maxc < 16) {
      px[i + 3] = 0;
    } else if (maxc < 32) {
      px[i + 3] = Math.round(((maxc - 16) / 16) * px[i + 3]);
    }
  }

  return sharp(px, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png();
}

const cutout = knockOutBlack(srcPath);
await (await cutout).toFile(publicSteve);

async function renderIcon(size, padRatio) {
  const pad = Math.round(size * padRatio);
  const inner = size - pad * 2;
  const mascot = await sharp(publicSteve)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: mascot, left: pad, top: pad }])
    .png();
}

for (const size of [192, 512]) {
  await (await renderIcon(size, 0.12)).toFile(join(outDir, `icon-${size}.png`));
  await (await renderIcon(size, 0.2)).toFile(join(outDir, `maskable-${size}.png`));
}

await (await renderIcon(32, 0.08)).toFile(join(__dirname, '..', 'public', 'favicon-32.png'));
await (await renderIcon(180, 0.1)).toFile(join(__dirname, '..', 'public', 'apple-touch-icon.png'));

copyFileSync(publicSteve, join(__dirname, 'steve.png'));

console.log('Icons generated from steve.png');
