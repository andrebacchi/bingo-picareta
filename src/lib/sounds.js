// Efeitos sonoros sintetizados via Web Audio API — sem arquivos externos.
let ctx = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function tone({ freq, duration = 0.15, type = "sine", gain = 0.15, delay = 0, slideTo = null }) {
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  const start = ac.currentTime + delay;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function playMark() {
  tone({ freq: 520, duration: 0.1, type: "triangle", gain: 0.18 });
  tone({ freq: 780, duration: 0.08, type: "triangle", gain: 0.12, delay: 0.04 });
}

export function playDraw() {
  tone({ freq: 300, slideTo: 600, duration: 0.22, type: "sawtooth", gain: 0.1 });
}

export function playWin() {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((f, i) =>
    tone({ freq: f, duration: 0.22, type: "triangle", gain: 0.2, delay: i * 0.12 })
  );
}

export function playLose() {
  const notes = [440, 349.23, 261.63];
  notes.forEach((f, i) =>
    tone({ freq: f, duration: 0.25, type: "sine", gain: 0.16, delay: i * 0.14 })
  );
}