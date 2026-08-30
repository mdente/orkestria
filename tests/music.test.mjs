import assert from 'node:assert/strict';
import test from 'node:test';

test('los motivos alternan obras clásicas de dominio público y riffs originales', async () => {
  const music = await import('../music.js').catch(() => null);

  assert.ok(music, 'debe existir el módulo de motivos musicales');
  assert.ok(music.MOTIFS.length >= 6, 'debe haber al menos seis motivos');

  music.MOTIFS.forEach((motif, index) => {
    assert.equal(motif.kind, index % 2 === 0 ? 'classical' : 'original');
    assert.ok(motif.notes.length >= 6, `${motif.title} debe tener una frase reconocible`);
  });

  assert.match(music.MOTIFS[0].title, /Beethoven/);
  assert.match(music.MOTIFS[2].title, /Mozart/);
  assert.match(music.MOTIFS[4].title, /Bach/);
});

test('la selección rota de forma determinista y la línea de tiempo es válida', async () => {
  const music = await import('../music.js').catch(() => null);

  assert.ok(music, 'debe existir el módulo de motivos musicales');
  assert.equal(music.getMotif(music.MOTIFS.length).id, music.MOTIFS[0].id);

  const timeline = music.buildTimeline(music.MOTIFS[0]);
  assert.equal(timeline.length, music.MOTIFS[0].notes.length);
  assert.ok(timeline.every((note) => note.start >= 0 && note.duration > 0));
  assert.ok(timeline.every((note, index) => index === 0 || note.start >= timeline[index - 1].start));
});
