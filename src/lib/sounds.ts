// Sound effects using Web Audio API - no external dependencies needed
const audioCtx = () => new (window.AudioContext || (window as any).webkitAudioContext)();

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  try {
    const ctx = audioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

export function playSendSound() {
  playTone(880, 0.12, 'sine', 0.1);
  setTimeout(() => playTone(1100, 0.1, 'sine', 0.08), 60);
}

export function playReceiveSound() {
  playTone(660, 0.15, 'triangle', 0.1);
  setTimeout(() => playTone(880, 0.12, 'triangle', 0.08), 80);
}

export function playClickSound() {
  playTone(1200, 0.05, 'square', 0.05);
}

export function playNewChatSound() {
  playTone(523, 0.1, 'sine', 0.08);
  setTimeout(() => playTone(659, 0.1, 'sine', 0.08), 80);
  setTimeout(() => playTone(784, 0.12, 'sine', 0.1), 160);
}

export function playDeleteSound() {
  playTone(400, 0.15, 'sawtooth', 0.06);
  setTimeout(() => playTone(300, 0.2, 'sawtooth', 0.04), 100);
}
