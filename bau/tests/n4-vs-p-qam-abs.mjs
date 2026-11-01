// QA musiker: Chromium-Probe – Versatz zwischen AudioBufferSource.start(when, off) und GainNode-Automation (absolute Zeit), Vorlauf 6 ms vs 200 ms
import {open, sleep, APP} from './n4-vs-p-qa-h.mjs';
const H = await open({file: APP}), p = H.p;
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
await sleep(300);
for (const lead of [0.006, 0.2, 0.0061, 0.05, 0.006]) {
  const r = await p.evaluate(async lead => {
    const c = window.__ctx, sr = c.sampleRate, n = sr * 2, b = c.createBuffer(1, n, sr), d = b.getChannelData(0), U = [];
    for (let k = 1; k < 38; k++) { const i = Math.round(k * 0.05 * sr); d[i] = 1; U.push(i / sr); }
    const off = 0.4321, s = c.createBufferSource(), g = c.createGain(); s.buffer = b; s.connect(g);
    const sp = c.createScriptProcessor(4096, 1, 1), z = c.createGain(); z.gain.value = 0; g.connect(sp); sp.connect(z); z.connect(c.destination);
    const cap = []; let t0 = null; sp.onaudioprocess = e => { cap.push(new Float32Array(e.inputBuffer.getChannelData(0))); };
    const when = c.currentTime + lead; g.gain.value = 0;
    for (const u of U) { if (u <= off + 0.02) continue; const T = when + (u - off); g.gain.setValueAtTime(0, T - 0.01); g.gain.linearRampToValueAtTime(1, T + 0.01); }
    s.start(when, off);
    await new Promise(r => setTimeout(r, 2200));
    sp.onaudioprocess = null; s.stop(); g.disconnect(); sp.disconnect();
    const flat = []; for (const a of cap) for (const v of a) flat.push(v); const all = []; for (let i = 0; i < flat.length; i++) if (flat[i] > 0.002) { let s2 = 0; while (i < flat.length && flat[i] > 0.002) s2 += flat[i++]; all.push(s2); }
    // jedes Impuls-Abbild: Amplitude a = 0.5 + δ/20 ms  →  δ = (a − 0.5) * 20 ms (positiv = Audio später als die Automation)
    const del = all.map(a => +((a - 0.5) * 20).toFixed(2));
    return {n: all.length, deltaMs: del.slice(0, 8), mean: +(del.reduce((x, y) => x + y, 0) / del.length).toFixed(2)};
  }, lead);
  console.log('Vorlauf', lead * 1000, 'ms →', JSON.stringify(r));
}
await H.br.close();
