export function createSound() {
  let audio;
  return (kind = 'turn') => {
    try {
      audio ??= new AudioContext(); if (audio.state === 'suspended') audio.resume();
      const notes = kind === 'win' ? [523, 659, 784] : kind === 'grow' ? [392, 587] : [330];
      notes.forEach((hz, i) => { const o = audio.createOscillator(); const g = audio.createGain(); o.type = 'sine'; o.frequency.value = hz; g.gain.setValueAtTime(0.045, audio.currentTime + i * 0.09); g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + i * 0.09 + 0.24); o.connect(g).connect(audio.destination); o.start(audio.currentTime + i * 0.09); o.stop(audio.currentTime + i * 0.09 + 0.25); });
    } catch { /* The puzzle remains playable when browser audio is unavailable. */ }
  };
}
