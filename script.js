import { buildTimeline, getMotif } from './music.js?v=1';

(() => {
  const root = document.documentElement;
  const stage = document.querySelector('.stage');
  const musicStatus = document.querySelector('#music-status');
  let audioContext = null;
  let master = null;
  let motifIndex = 0;
  let lastRippleAt = 0;

  const instruments = {
    strings: { wave: 'sawtooth', attack: .026, release: .62, gain: .03, filter: 1450 },
    brass: { wave: 'square', attack: .025, release: .46, gain: .025, filter: 980 },
    harp: { wave: 'triangle', attack: .004, release: .44, gain: .04, filter: 3400 },
    lead: { wave: 'sawtooth', attack: .008, release: .2, gain: .028, filter: 1750 }
  };

  function midiToFrequency(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function prepareAudio() {
    if (audioContext) return true;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      musicStatus.textContent = 'El audio no está disponible en este navegador.';
      return false;
    }

    audioContext = new AudioContextClass();
    master = audioContext.createGain();
    master.gain.value = .68;

    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.value = -26;
    compressor.knee.value = 20;
    compressor.ratio.value = 7;
    compressor.attack.value = .006;
    compressor.release.value = .2;

    master.connect(compressor);
    compressor.connect(audioContext.destination);
    return true;
  }

  async function unlockAudio() {
    if (!prepareAudio()) return false;

    try {
      await audioContext.resume();
      root.style.setProperty('--glow', '1');
      return audioContext.state === 'running';
    } catch {
      musicStatus.textContent = 'No fue posible iniciar el audio.';
      return false;
    }
  }

  function createTone(note, instrument, start, index) {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    const noteStart = start + note.start;
    const noteGain = Math.max(.0001, instrument.gain * note.velocity);

    oscillator.type = instrument.wave;
    oscillator.frequency.setValueAtTime(midiToFrequency(note.midi), noteStart);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(instrument.filter, noteStart);
    filter.Q.setValueAtTime(instrument.wave === 'square' ? 4.5 : 1.1, noteStart);

    gain.gain.setValueAtTime(.0001, noteStart);
    gain.gain.exponentialRampToValueAtTime(noteGain, noteStart + instrument.attack);
    gain.gain.exponentialRampToValueAtTime(.0001, noteStart + note.duration + instrument.release);

    oscillator.connect(filter);
    filter.connect(gain);

    if (typeof audioContext.createStereoPanner === 'function') {
      const pan = audioContext.createStereoPanner();
      pan.pan.value = index % 2 === 0 ? -.18 : .18;
      gain.connect(pan);
      pan.connect(master);
    } else {
      gain.connect(master);
    }

    oscillator.start(noteStart);
    oscillator.stop(noteStart + note.duration + instrument.release + .04);
  }

  async function playNextMotif() {
    if (!await unlockAudio()) return;

    const motif = getMotif(motifIndex);
    const instrument = instruments[motif.instrument];
    const start = audioContext.currentTime + .035;

    buildTimeline(motif).forEach((note, index) => createTone(note, instrument, start, index));
    musicStatus.textContent = `Reproduciendo ${motif.title}.`;
    stage.dataset.motif = motif.id;
    motifIndex += 1;
  }

  function addRipple(x, y) {
    const now = performance.now();
    if (now - lastRippleAt < 130) return;
    lastRippleAt = now;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.setProperty('--x', `${x}px`);
    ripple.style.setProperty('--y', `${y}px`);
    document.body.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 980);
  }

  function updateLight(event) {
    const x = event.clientX ?? window.innerWidth / 2;
    const y = event.clientY ?? window.innerHeight / 2;

    root.style.setProperty('--mx', `${x}px`);
    root.style.setProperty('--my', `${y}px`);
    root.style.setProperty('--glow', audioContext?.state === 'running' ? '1' : '.62');
    addRipple(x, y);
  }

  stage.addEventListener('click', playNextMotif);
  stage.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    playNextMotif();
  });
  window.addEventListener('pointermove', updateLight, { passive: true });
  window.addEventListener('pointerenter', updateLight, { passive: true });
  window.addEventListener('blur', () => {
    if (audioContext?.state === 'running') audioContext.suspend();
    root.style.setProperty('--glow', '0');
  });
})();
