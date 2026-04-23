#!/usr/bin/env node
/**
 * Post-process the Expo web export so the dist/ is production-ready
 * PWA. Runs after `expo export -p web`:
 *
 *   npm run build:web
 *
 * Applies:
 * - Replaces index.html with a branded, German-meta PWA shell that
 *   links the manifest, Apple touch icon, theme-color and standalone
 *   meta tags.
 * - Writes manifest.webmanifest with SymmetryX branding.
 * - Copies the app icon + splash image into dist/assets/ so iOS /
 *   Android "Add to Home Screen" pick up the brand mark.
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');
const distDir = resolve(repoRoot, 'apps/mobile/dist');
const assetsOut = resolve(distDir, 'assets');
const iconSource = resolve(repoRoot, 'apps/mobile/assets/icon.png');
const splashSource = resolve(repoRoot, 'apps/mobile/assets/splash.png');

// Find the Expo-generated JS bundle (name has a content hash).
const jsDir = resolve(distDir, '_expo/static/js/web');
const jsFiles = readdirSync(jsDir).filter((f) => f.endsWith('.js'));
if (jsFiles.length === 0) {
  throw new Error('No JS bundle found under _expo/static/js/web');
}
const bundleFile = jsFiles[0];

const indexHtml = `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
    <title>MAGNA-X · SymmetryX Technologies</title>
    <meta name="description" content="MAGNA-X — die Revolution der Deckeninfrastruktur." />

    <link rel="manifest" href="/manifest.webmanifest" />
    <meta name="theme-color" content="#05090F" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="MAGNA-X" />
    <link rel="apple-touch-icon" href="/assets/icon.png" />
    <link rel="shortcut icon" href="/favicon.ico" />

    <style id="expo-reset">
      html, body { height: 100%; margin: 0; }
      body { overflow: hidden; background: #05090F; }
      #root { display: flex; height: 100%; flex: 1; background: #05090F; }
    </style>
  </head>

  <body>
    <noscript>Diese App benötigt JavaScript.</noscript>
    <div id="root"></div>
    <script src="/_expo/static/js/web/${bundleFile}" defer></script>
  </body>
</html>
`;

const manifest = {
  name: 'MAGNA-X',
  short_name: 'MAGNA-X',
  description: 'MAGNA-X by SymmetryX Technologies — die Revolution der Deckeninfrastruktur.',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#05090F',
  theme_color: '#1B3A5C',
  icons: [
    { src: '/assets/icon.png', sizes: '1024x1024', type: 'image/png', purpose: 'any' },
    { src: '/assets/icon.png', sizes: '1024x1024', type: 'image/png', purpose: 'maskable' },
  ],
};

mkdirSync(assetsOut, { recursive: true });
writeFileSync(resolve(distDir, 'index.html'), indexHtml);
writeFileSync(resolve(distDir, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2));
copyFileSync(iconSource, resolve(assetsOut, 'icon.png'));
copyFileSync(splashSource, resolve(assetsOut, 'splash.png'));

console.info('post-export-web: done');
console.info('  index.html → ' + bundleFile);
console.info('  manifest.webmanifest written');
console.info('  assets/icon.png + assets/splash.png copied');

// Verify _redirects survived — it comes from public/ via Expo.
try {
  readFileSync(resolve(distDir, '_redirects'));
  console.info('  _redirects present ✓');
} catch {
  console.warn('  _redirects missing — SPA routing may 404 under deep links.');
}
