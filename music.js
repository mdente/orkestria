export const MOTIFS = [
  {
    id: 'beethoven-fifth',
    title: 'Beethoven — Quinta sinfonía',
    kind: 'classical',
    instrument: 'brass',
    bpm: 108,
    notes: [[67, .25, 1], [67, .25, .9], [67, .25, 1], [63, 1, 1], [65, .25, 1], [65, .25, .9], [65, .25, 1], [62, 1, 1]]
  },
  {
    id: 'golden-circuit',
    title: 'Riff original — Circuito dorado',
    kind: 'original',
    instrument: 'lead',
    bpm: 138,
    notes: [[52, .5, 1], [55, .25, .85], [57, .25, 1], [59, .5, .9], [57, .25, .8], [55, .25, .9], [52, .5, 1], [50, .5, .85], [52, .25, 1], [55, .25, .9], [57, .5, 1], [52, .75, .8]]
  },
  {
    id: 'mozart-serenade',
    title: 'Mozart — Pequeña serenata nocturna',
    kind: 'classical',
    instrument: 'strings',
    bpm: 132,
    notes: [[67, .5, 1], [74, .25, .86], [67, .25, .9], [79, .75, 1], [78, .25, .82], [76, .25, .84], [74, .25, .9], [72, .5, .86], [71, .25, .8], [69, .25, .82], [67, .5, .9], [66, .75, .78]]
  },
  {
    id: 'blue-route',
    title: 'Riff original — Ruta azul',
    kind: 'original',
    instrument: 'lead',
    bpm: 126,
    notes: [[45, .5, 1], [48, .25, .86], [50, .25, .92], [52, .5, 1], [50, .5, .82], [48, .25, .88], [45, .25, 1], [43, .5, .8], [45, .25, .92], [48, .25, .88], [52, .5, 1], [45, 1, .78]]
  },
  {
    id: 'bach-prelude',
    title: 'Bach — Preludio en do mayor',
    kind: 'classical',
    instrument: 'harp',
    bpm: 104,
    notes: [[48, .25, .8], [52, .25, .84], [55, .25, .88], [60, .25, .92], [64, .25, 1], [55, .25, .82], [60, .25, .9], [64, .25, 1], [48, .25, .8], [52, .25, .84], [57, .25, .88], [60, .25, .92], [65, .25, 1], [57, .25, .82], [60, .25, .9], [65, .5, 1]]
  },
  {
    id: 'montevideo-pulse',
    title: 'Riff original — Pulso montevideano',
    kind: 'original',
    instrument: 'lead',
    bpm: 144,
    notes: [[40, .25, 1], [40, .25, .82], [43, .5, .94], [45, .25, 1], [47, .25, .9], [45, .5, .84], [43, .25, .92], [40, .25, 1], [47, .5, .88], [45, .25, .9], [43, .25, .86], [40, .75, 1]]
  }
];

export function getMotif(index) {
  return MOTIFS[((index % MOTIFS.length) + MOTIFS.length) % MOTIFS.length];
}

export function buildTimeline(motif) {
  const secondsPerBeat = 60 / motif.bpm;
  let cursor = 0;

  return motif.notes.map(([midi, beats, velocity = 1]) => {
    const note = {
      midi,
      start: cursor,
      duration: Math.max(secondsPerBeat * beats * .88, .04),
      velocity
    };

    cursor += secondsPerBeat * beats;
    return note;
  });
}
