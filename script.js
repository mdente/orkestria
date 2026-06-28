(() => {
  const root = document.documentElement;
  let audioContext = null;
  let master = null;
  let unlocked = false;
  let lastSoundAt = 0;
  let lastInstrument = -1;
  let lastRippleAt = 0;

  const instruments = [
    { name: 'strings', wave: 'sawtooth', attack: 0.018, release: 0.78, gain: 0.035, filter: 1500, chord: [0, 7, 12] },
    { name: 'cello', wave: 'sawtooth', attack: 0.03, release: 1.05, gain: 0.042, filter: 620, chord: [-12, -5, 0] },
    { name: 'flute', wave: 'sine', attack: 0.012, release: 0.62, gain: 0.034, filter: 2400, chord: [0, 12] },
    { name: 'brass', wave: 'square', attack: 0.035, release: 0.7, gain: 0.029, filter: 920, chord: [0, 4, 7] },
    { name: 'harp', wave: 'triangle', attack: 0.003, release: 0.5, gain: 0.045, filter: 3600, chord: [0, 7, 14, 19] },
    { name: 'clarinet', wave: 'triangle', attack: 0.02, release: 0.72, gain: 0.032, filter: 1300, chord: [0, 5, 12] },
    { name: 'choir', wave: 'sine', attack: 0.08, release: 1.25, gain: 0.025, filter: 1700, chord: [0, 7, 12, 16] },
    { name: 'timpani', wave: 'sine', attack: 0.002, release: 0.55, gain: 0.065, filter: 420, chord: [-24] }
  ];

  const scale = [196, 220, 246.94, 261.63, 293.66, 329.63, 392, 440, 493.88, 523.25];

  function unlockAudio() {
    if (unlocked) return;

    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    master = audioContext.createGain();
    master.gain.value = 0.72;

    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.value = -28;
    compressor.knee.value = 22;
    compressor.ratio.value = 8;
    compressor.attack.value = 0.006;
    compressor.release.value = 0.18;

    master.connect(compressor);
    compressor.connect(audioContext.destination);

    audioContext.resume().then(() => {
      unlocked = true;
      playGesture(window.innerWidth / 2, window.innerHeight / 2, true);
    }).catch(() => {});
  }

  function midiToFrequency(base, semitones) {
    return base * Math.pow(2, semitones / 12);
  }

  function createTone(freq, instrument, start, duration, detune = 0) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    const pan = audioContext.createStereoPanner();

    osc.type = instrument.wave;
    osc.frequency.setValueAtTime(freq, start);
    osc.detune.setValueAtTime(detune, start);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(instrument.filter, start);
    filter.Q.setValueAtTime(instrument.name === 'brass' ? 6 : 1.2, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(instrument.gain, start + instrument.attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration + instrument.release);

    pan.pan.value = Math.max(-0.85, Math.min(0.85, (Math.random() - 0.5) * 1.2));

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(pan);
    pan.connect(master);

    osc.start(start);
    osc.stop(start + duration + instrument.release + 0.04);
  }

  function playTimpani(base, start) {
    const instrument = instruments[7];
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(base / 2, start);
    osc.frequency.exponentialRampToValueAtTime(base / 4, start + 0.32);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(instrument.filter, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(instrument.gain, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.62);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);

    osc.start(start);
    osc.stop(start + 0.68);
  }

  function instrumentFromPoint(x, y) {
    const nx = x / window.innerWidth;
    const ny = y / window.innerHeight;

    if (ny > 0.72) return 4;
    if (ny < 0.28) return 6;
    if (nx < 0.18) return 2;
    if (nx > 0.82) return 3;
    if (ny > 0.58 && nx < 0.5) return 1;
    if (ny > 0.58 && nx >= 0.5) return 7;

    return Math.floor(nx * 5) % 5;
  }

  function playGesture(x, y, intro = false) {
    if (!unlocked || !audioContext) return;

    const nowMs = performance.now();
    if (!intro && nowMs - lastSoundAt < 260) return;

    const instrumentIndex = instrumentFromPoint(x, y);
    if (!intro && instrumentIndex === lastInstrument && nowMs - lastSoundAt < 640) return;

    lastSoundAt = nowMs;
    lastInstrument = instrumentIndex;

    const instrument = instruments[instrumentIndex];
    const start = audioContext.currentTime + 0.004;
    const nx = x / window.innerWidth;
    const ny = y / window.innerHeight;
    const base = scale[Math.floor((nx * scale.length + ny * 3) % scale.length)];
    const duration = intro ? 0.36 : 0.14 + (1 - ny) * 0.18;

    if (instrument.name === 'timpani') {
      playTimpani(base, start);
      return;
    }

    instrument.chord.forEach((semi, index) => {
      const delay = instrument.name === 'harp' ? index * 0.045 : index * 0.012;
      const detune = instrument.name === 'strings' ? (index - 1) * 5 : 0;
      createTone(midiToFrequency(base, semi), instrument, start + delay, duration, detune);
    });
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
    root.style.setProperty('--glow', unlocked ? '1' : '.62');

    addRipple(x, y);
    playGesture(x, y);
  }

  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
  window.addEventListener('pointermove', updateLight, { passive: true });
  window.addEventListener('pointerenter', updateLight, { passive: true });
  window.addEventListener('blur', () => {
    if (audioContext && audioContext.state === 'running') audioContext.suspend();
    unlocked = false;
    root.style.setProperty('--glow', '0');
  });
})();
