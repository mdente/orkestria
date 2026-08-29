import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('los activos publicados existen en un directorio real', async () => {
  const html = await readFile(new URL('index.html', root), 'utf8');
  const assets = await stat(new URL('assets', root));

  assert.equal(assets.isDirectory(), true, '`assets` debe ser un directorio');

  const references = [...html.matchAll(/(?:src|href)="(assets\/[^"#?]+)"/g)]
    .map(([, reference]) => reference);

  assert.ok(references.length > 0, 'el HTML debe referenciar activos locales');

  for (const reference of references) {
    const target = await stat(new URL(reference, root));
    assert.equal(target.isFile(), true, `falta el activo ${reference}`);
  }
});

test('la página declara dominio, metadatos sociales y contenido accesible', async () => {
  const html = await readFile(new URL('index.html', root), 'utf8');
  const cname = await readFile(new URL('CNAME', root), 'utf8');
  const noJekyll = await stat(new URL('.nojekyll', root));

  assert.equal(cname.trim(), 'orkestria.uy');
  assert.equal(noJekyll.isFile(), true);
  assert.match(html, /<link rel="canonical" href="https:\/\/orkestria\.uy\/"/);
  assert.match(html, /property="og:url" content="https:\/\/orkestria\.uy\/"/);
  assert.match(html, /property="og:image" content="https:\/\/orkestria\.uy\/assets\/orkestria-hero\.png"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /<h1[^>]*>orkestria\.uy<\/h1>/);
  assert.match(html, /href="tel:\+59895221683"/);
  assert.match(html, /<img[^>]+width="1672"[^>]+height="941"/);
});

test('la imagen principal ofrece una variante WebP más liviana', async () => {
  const html = await readFile(new URL('index.html', root), 'utf8');
  const png = await stat(new URL('assets/orkestria-hero.png', root));
  const webp = await stat(new URL('assets/orkestria-hero.webp', root));

  assert.match(html, /<source srcset="assets\/orkestria-hero\.webp" type="image\/webp"/);
  assert.ok(webp.size < png.size, 'la variante WebP debe pesar menos que el PNG');
});

test('la bandera de Uruguay se muestra una sola vez dentro de la imagen principal', async () => {
  const html = await readFile(new URL('index.html', root), 'utf8');

  assert.doesNotMatch(html, /class="uruguay-flag-wrap"/);
  assert.doesNotMatch(html, /class="uruguay-flag"/);
});

test('la composición principal ocupa la altura disponible en pantallas verticales', async () => {
  const css = await readFile(new URL('styles.css', root), 'utf8');
  const portraitRules = css.match(/@media \(max-aspect-ratio: 11 \/ 10\) \{([\s\S]*?)\n\}/)?.[1] ?? '';

  assert.match(portraitRules, /\.hero-image\s*\{[\s\S]*?width:\s*auto;/);
  assert.match(portraitRules, /\.hero-image\s*\{[\s\S]*?height:\s*100svh;/);
  assert.match(portraitRules, /\.hero-image\s*\{[\s\S]*?left:\s*50%;/);
  assert.match(portraitRules, /\.hero-image\s*\{[\s\S]*?translate:\s*-50% 0;/);
});
