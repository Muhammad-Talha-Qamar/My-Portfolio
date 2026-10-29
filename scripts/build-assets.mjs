#!/usr/bin/env node
/**
 * Minify theme CSS/JS and compress heavy PNGs used on first paint.
 * Output → wordpress-theme/talbyte-portfolio/assets/dist/
 */
import * as esbuild from 'esbuild';
import sharp from 'sharp';
import { mkdir, readFile, writeFile, copyFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const themeAssets = path.join(root, 'wordpress-theme/talbyte-portfolio/assets');
const dist = path.join(themeAssets, 'dist');

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function minifyCss(src, dest) {
  const css = await readFile(src, 'utf8');
  const result = await esbuild.transform(css, {
    loader: 'css',
    minify: true,
    legalComments: 'none',
  });
  await writeFile(dest, result.code);
  return { before: css.length, after: result.code.length };
}

async function minifyJs(src, dest) {
  await esbuild.build({
    entryPoints: [src],
    outfile: dest,
    bundle: false,
    minify: true,
    legalComments: 'none',
    target: ['es2018'],
    logLevel: 'silent',
  });
  const before = (await readFile(src)).length;
  const after = (await readFile(dest)).length;
  return { before, after };
}

async function toWebp(srcRel, quality = 78) {
  const src = path.join(themeAssets, srcRel);
  if (!(await exists(src))) return null;
  const destRel = srcRel.replace(/\.(png|jpe?g)$/i, '.webp');
  const dest = path.join(themeAssets, destRel);
  await sharp(src).webp({ quality, effort: 4 }).toFile(dest);
  const before = (await readFile(src)).length;
  const after = (await readFile(dest)).length;
  return { srcRel, destRel, before, after };
}

function kb(n) {
  return `${(n / 1024).toFixed(1)}KB`;
}

await mkdir(dist, { recursive: true });

const css = await minifyCss(
  path.join(themeAssets, 'style.css'),
  path.join(dist, 'style.min.css')
);
const main = await minifyJs(
  path.join(themeAssets, 'main.js'),
  path.join(dist, 'main.min.js')
);
const aos = await minifyJs(
  path.join(themeAssets, 'aos-init.js'),
  path.join(dist, 'aos-init.min.js')
);

const images = [];
for (const img of [
  'images/digital-brain.png',
  'images/grid2.png',
  'images/grid4.png',
  'images/main.jpg',
]) {
  const r = await toWebp(img, img.endsWith('.jpg') ? 80 : 76);
  if (r) images.push(r);
}

const manifest = {
  builtAt: new Date().toISOString(),
  css: { file: 'dist/style.min.css', ...css },
  js: {
    main: { file: 'dist/main.min.js', ...main },
    aosInit: { file: 'dist/aos-init.min.js', ...aos },
  },
  webp: images,
};
await writeFile(path.join(dist, 'manifest.json'), JSON.stringify(manifest, null, 2));

console.log('Build complete → assets/dist/');
console.log(`  CSS  ${kb(css.before)} → ${kb(css.after)}`);
console.log(`  JS   ${kb(main.before)} → ${kb(main.after)}`);
console.log(`  AOS  ${kb(aos.before)} → ${kb(aos.after)}`);
for (const img of images) {
  console.log(`  WEBP ${img.srcRel} ${kb(img.before)} → ${img.destRel} ${kb(img.after)}`);
}
