// QA VS-P (abnahme): eigene Signale + Helfer; Harness (Mikro-Attrappe, Mitschnitt) aus n4-vs-p-h.mjs, Lautheit aus n4-vs-p-lib.mjs (geprüft gegen 997-Hz-Referenz)
export {open, micOn, sleep, waitBeat, idle, b64, APP, BASE, voice} from './n4-vs-p-h.mjs';
import {sleep, waitBeat, idle, b64} from './n4-vs-p-h.mjs';
// eigener „natürlicher“ Gesang: Glottis-Quelle (Harmonische 1/k^1.3), wechselnde Vokale (Formanten), Vibrato, Lautstärke je Ton ±4 dB,
// Crescendo/Decrescendo, Atemrauschen, Zischlaute vor manchen Tönen. rmsDb = RMS über die gesungenen (stimmhaften) Abschnitte.
export function mysing(sec, sr, rmsDb, seed = 1, o = {}) {
  let s = seed * 9301 + 49297; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const n = Math.round(sec * sr), y = new Float32Array(n), voiced = new Uint8Array(n);
  const V = {a: [[730, 90], [1090, 110], [2440, 170]], e: [[530, 80], [1840, 100], [2480, 160]], i: [[300, 60], [2300, 120], [3000, 180]], o: [[570, 80], [840, 90], [2410, 170]], u: [[440, 70], [1020, 90], [2240, 160]]};
  const vk = Object.keys(V), mel = o.mel || [62, 64, 66, 67, 69, 67, 66, 64, 62, 69, 71, 69, 67, 66, 64, 62];
  const notes = []; let t = o.t0 != null ? o.t0 : 0.3, k = 0;
  while (t < sec - 0.6) { const d = 0.45 + rnd() * 0.8; notes.push({t, d, f: 440 * Math.pow(2, (mel[k % mel.length] - 69 - (o.oct || 0) * 12) / 12), g: Math.pow(10, (rnd() * 8 - 4) / 20), v: vk[k % 5], sib: rnd() < 0.3}); t += d + 0.08 + (rnd() < 0.25 ? 0.5 : rnd() * 0.15); k++; }
  const src = new Float32Array(n); let ph = 0;
  for (const nt of notes) {
    const i0 = Math.round(nt.t * sr), i1 = Math.min(n, Math.round((nt.t + nt.d) * sr)), H = Math.floor(sr / 2 / nt.f * 0.9);
    for (let i = i0; i < i1; i++) {
      const u = (i - i0) / sr, L = nt.d, env = Math.min(1, u / 0.05) * Math.min(1, (L - u) / 0.07) * nt.g * (1 + 0.15 * Math.sin(Math.PI * u / L));
      const f = nt.f * (1 + 0.01 * Math.sin(2 * Math.PI * 5.5 * u) * Math.min(1, u / 0.25));
      ph += f / sr; if (ph > 1) ph -= 1;
      let v = 0; for (let h = 1; h <= Math.min(H, 40); h++) v += Math.sin(2 * Math.PI * h * ph) / Math.pow(h, 1.3);
      src[i] = env * v + env * 0.03 * (rnd() * 2 - 1); if (env > 0.25 * nt.g) voiced[i] = 1;
    }
  }
  // Formanten je Ton (Vokal), Resonatoren parallel
  let si = 0; const R = [0, 1, 2].map(() => ({y1: 0, y2: 0}));
  for (let i = 0; i < n; i++) {
    while (si < notes.length - 1 && i > Math.round((notes[si].t + notes[si].d + 0.04) * sr)) si++;
    const F = V[notes[si] ? notes[si].v : 'a']; let out = 0;
    for (let j = 0; j < 3; j++) { const [fc, bw] = F[j], r = Math.exp(-Math.PI * bw / sr), a1 = -2 * r * Math.cos(2 * Math.PI * fc / sr), a2 = r * r, gg = [1, 0.5, 0.25][j] * (1 - r);
      const v = gg * src[i] - a1 * R[j].y1 - a2 * R[j].y2; R[j].y2 = R[j].y1; R[j].y1 = v; out += v; }
    y[i] = out;
  }
  // Zischlaute (60 ms Hochpass-Rauschen) vor manchen Tönen, etwa auf Höhe der Stimme
  let ss = 0, nv = 0; for (let i = 0; i < n; i++) if (voiced[i]) { ss += y[i] * y[i]; nv++; }
  const rms = Math.sqrt(ss / nv);
  for (const nt of notes) if (nt.sib) { const i1 = Math.round(nt.t * sr), m = Math.round(0.06 * sr); let z = 0; for (let j = 0; j < m; j++) { const i = i1 - m + j; if (i < 0) continue; const w = rnd() * 2 - 1; y[i] += rms * 1.0 * (w - z) * Math.sin(Math.PI * j / m); z = w; } }
  const g = Math.pow(10, rmsDb / 20) / rms;
  for (let i = 0; i < n; i++) y[i] = y[i] * g + 0.0002 * (rnd() * 2 - 1);
  return {y, voiced, notes};
}
export const i16 = x => Array.from(x, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767))));
// ● REC mit 🎤 (Kabel-Weg), Gesang ab Schlag 4 (Takt 2), Länge len Takte; Rückgabe: Take-Id und STIMME-Spur
export async function recMic(p, y, o = {}) {
  const len = o.len || 4, scene = o.scene != null ? o.scene : 2, track = o.track != null ? o.track : 0;
  await p.evaluate(([len, sc, tr, bpm]) => { SYNQUENZER.setBpm(bpm); SYNQUENZER.setMetronome(false); SYNQUENZER.setRecOptions({countIn: 0, length: len}); SYNQUENZER.selectSlot(tr, sc); }, [len, scene, track, o.bpm || 120]);
  await p.evaluate(([b]) => { SYNQUENZER.play(); const c = SYNQUENZER.vsClock(); window.__fake.play(b, c.start + 4 * c.spb - 0.04); }, [b64(y)]);
  await waitBeat(p, 3.6); await p.evaluate(() => SYNQUENZER.rec());
  await waitBeat(p, 4 + len * 4 + 1); await idle(p); await p.evaluate(() => SYNQUENZER.stop()); await sleep(400);
  return p.evaluate(sc => { const st = SYNQUENZER.tkInfo().stimme, c = SYNQUENZER.getClip(st, sc); return {st, id: c && c.audio ? c.audio.take : null, len: c ? c.len : null}; }, scene);
}
