export function createSound() {
  let context;
  function tone(frequency, duration, type = 'sine', volume = 0.045, end = frequency * 1.6) {
    try {
      context ??= new (window.AudioContext || window.webkitAudioContext)();
      if (context.state === 'suspended') context.resume();
      const osc = context.createOscillator(); const gain = context.createGain();
      osc.type = type; osc.frequency.setValueAtTime(frequency, context.currentTime);
      osc.frequency.exponentialRampToValueAtTime(Math.max(30, end), context.currentTime + duration);
      gain.gain.setValueAtTime(volume, context.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
      osc.connect(gain).connect(context.destination); osc.start(); osc.stop(context.currentTime + duration);
    } catch { /* Audio is optional when browser audio is unavailable. */ }
  }
  return {
    catch: () => { tone(620, 0.16, 'sine', 0.05, 1050); tone(930, 0.11, 'sine', 0.025, 1300); },
    rain: () => {
      try {
        context ??= new (window.AudioContext || window.webkitAudioContext)();
        if (context.state === 'suspended') context.resume();
        const length = Math.floor(context.sampleRate * 0.28); const buffer = context.createBuffer(1, length, context.sampleRate);
        const data = buffer.getChannelData(0); for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
        const source = context.createBufferSource(); const filter = context.createBiquadFilter(); const gain = context.createGain();
        source.buffer = buffer; filter.type = 'lowpass'; filter.frequency.value = 1400; gain.gain.value = 0.075;
        source.connect(filter).connect(gain).connect(context.destination); source.start();
        tone(175, 0.22, 'triangle', 0.022, 70);
      } catch { tone(175, 0.22, 'triangle', 0.022, 70); }
    },
    upgrade: () => { tone(420, 0.24, 'triangle', 0.05, 880); tone(790, 0.3, 'sine', 0.025, 1180); },
    end: () => { tone(260, 0.45, 'sawtooth', 0.04, 160); setTimeout(() => tone(130, 0.7, 'triangle', 0.04, 55), 230); },
    feed: () => tone(360, 0.3, 'sine', 0.05, 760),
  };
}
