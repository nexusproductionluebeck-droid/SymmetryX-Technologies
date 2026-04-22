#!/usr/bin/env node
/**
 * Generates the Expo asset PNGs from the authored SVGs under
 * apps/mobile/assets/src/. Run once after editing any of those SVGs:
 *
 *   node scripts/generate-icons.mjs
 *
 * Depends on `@resvg/resvg-js` (no native toolchain needed).
 */
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');
const srcDir = resolve(repoRoot, 'apps/mobile/assets/src');
const outDir = resolve(repoRoot, 'apps/mobile/assets');

const jobs = [
  { svg: 'app-icon.svg', out: 'icon.png', width: 1024 },
  { svg: 'adaptive-foreground.svg', out: 'adaptive-icon.png', width: 1024 },
  { svg: 'splash.svg', out: 'splash.png', width: 1242 },
  { svg: 'app-icon.svg', out: 'favicon.png', width: 48 },
];

mkdirSync(outDir, { recursive: true });

for (const job of jobs) {
  const svgPath = resolve(srcDir, job.svg);
  const svg = readFileSync(svgPath);
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: job.width },
    background: 'rgba(0,0,0,0)',
    font: { loadSystemFonts: true },
  });
  const png = resvg.render().asPng();
  writeFileSync(resolve(outDir, job.out), png);
  console.info(`wrote ${job.out} (${job.width}px)`);
}

console.info('Icons generated.');
