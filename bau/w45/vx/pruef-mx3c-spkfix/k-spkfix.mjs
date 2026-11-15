// Prüfer-Sonde SPKFIX (Kern, node): eigene Fälle für Notenname + Neu-Rechnen + Nebenwirkungen. Aufruf: node k-spkfix.mjs <html>
import {load} from '../spkfix/sonde/kern.mjs';
const {call} = load(process.argv[2]);
const sr = 48000, out = {};
const mono = ch => { const y = new Float32Array(ch[0].length); for (const c of ch) for (let i = 0; i < y.length; i++) y[i] += c[i] / ch.length; return y; };
const rms = (x, a, b) => { let s = 0, n = 0; for (let i = Math.round(a * sr); i < Math.round(b * sr); i++) { s += x[i] * x[i]; n++; } return +Math.sqrt(s / n).toFixed(5); };
const mad = (x, y, a, b) => { let d = 0; for (let i = Math.round(a * sr); i < Math.round(b * sr); i++) d = Math.max(d, Math.abs(x[i] - y[i])); return +d.toFixed(6); };
// ---- A: Notenname, eigene Fälle ----
const tones = [
  ['sin 98', t => Math.sin(2 * Math.PI * 98 * t)],
  ['sin 146.83', t => Math.sin(2 * Math.PI * 146.83 * t)],
  ['sin 220', t => Math.sin(2 * Math.PI * 220 * t)],
  ['sin 277.18', t => Math.sin(2 * Math.PI * 277.18 * t)],
  ['sin 392', t => Math.sin(2 * Math.PI * 392 * t)],
  ['sin 587.33', t => Math.sin(2 * Math.PI * 587.33 * t)],
  ['sin 880', t => Math.sin(2 * Math.PI * 880 * t)],
  ['sin 226.4 (+50ct)', t => Math.sin(2 * Math.PI * 226.4 * t)],
  ['sin 213.8 (-50ct)', t => Math.sin(2 * Math.PI * 213.8 * t)],
  ['vibrato 220 ±40ct 5Hz', t => Math.sin(2 * Math.PI * 220 * (t + 0.0231 * 40 / 100 / (2 * Math.PI * 5) * 2 * Math.PI * 220 / 220 * 0 ) ) ],
  ['h1+0.8h2 220', t => Math.sin(2 * Math.PI * 220 * t) + 0.8 * Math.sin(2 * Math.PI * 440 * t)],
  ['schwacher Grundton 220 (0.2,1,0.8)', t => 0.2 * Math.sin(2 * Math.PI * 220 * t) + Math.sin(2 * Math.PI * 440 * t) + 0.8 * Math.sin(2 * Math.PI * 660 * t)],
  ['dreieck 220', t => { let v = 0; for (let h = 1; h < 12; h += 2) v += ((h - 1) / 2 % 2 ? -1 : 1) * Math.sin(2 * Math.PI * 220 * h * t) / (h * h); return v; }],
  ['sin 220 + rauschen', t => Math.sin(2 * Math.PI * 220 * t) + 0.3 * (Math.random() * 2 - 1)],
];
// echtes Vibrato (Phase integriert)
const vib = (f, ct, fm) => { let ph = 0; return t => { const fi = f * Math.pow(2, ct / 1200 * Math.sin(2 * Math.PI * fm * t)); ph += 2 * Math.PI * fi / sr; return Math.sin(ph); }; };
tones[9] = ['vibrato 220 ±40ct 5Hz', vib(220, 40, 5)];
out.name = [];
let rs = 12345; Math.random = () => { rs = (rs * 1103515245 + 12345) % 2147483648; return rs / 2147483648; };
for (const [nm, fn] of tones) {
  const n = sr * 3, L = new Float32Array(n);
  for (let i = sr; i < 2 * sr; i++) L[i] = 0.25 * fn(i / sr) * Math.min(1, (i - sr) / 960, (2 * sr - i) / 960);
  const doc = (await call('create', {name: 'P', sr, ch: [L]})).meta.id, C = (op, a) => call(op, Object.assign({doc}, a));
  await C('transfer', {von: 'orig', nach: {art: 'lead', name: 'Lead'}, sel: {art: 'rect', t0: 0.8, t1: 2.2, f0: 60, f1: 4000}});
  await C('noten', {lid: 'L1'});
  const N = (await C('open', {})).meta.teil2.notes.L1 || [];
  out.name.push({nm, n: N.map(q => q.m + '@' + q.f + (q.fz ? '' : '')).join(' ')});
  await call('close', {doc});
}
// ---- B: Neu-Rechnen: Inhalt AUS der Audio-Ebene herausnehmen, fremde Ebene ändern, ↶/↷, Zeit ----
{
  const formant = f => 1 / (1 + ((f - 700) / 180) ** 2) + 0.7 / (1 + ((f - 1200) / 220) ** 2);
  const sek = 8, n = sr * sek, L = new Float32Array(n);
  for (const [a, b, f] of [[0.5, 1.5, 196], [2.0, 3.0, 261.63], [3.5, 4.5, 329.63], [5.0, 6.0, 220]]) for (let i = Math.round(a * sr); i < Math.round(b * sr); i++) { const t = i / sr, env = Math.min(1, (t - a) / 0.02, (b - t) / 0.03); let v = 0; for (let h = 1; h <= 16 && h * f < 9000; h++) v += formant(h * f) * Math.sin(2 * Math.PI * h * f * t) / Math.sqrt(h); L[i] += 0.12 * env * v; }
  // dazu ein Bass-Ton 82 Hz überall (für eine zweite, fremde Ebene)
  for (let i = 0; i < n; i++) L[i] += 0.08 * Math.sin(2 * Math.PI * 82.41 * i / sr);
  const doc = (await call('create', {name: 'B', sr, ch: [L, L], grid: {bpm: 120, off: 0, ts: '4/4'}})).meta.id, C = (op, a) => call(op, Object.assign({doc}, a));
  await C('transfer', {von: 'orig', nach: {art: 'gesang', name: 'Gesang'}, sel: {art: 'rect', t0: 0.3, t1: 6.2, f0: 150, f1: 9500}});
  await C('noten', {lid: 'L1'}); const N = (await C('open', {})).meta.teil2.notes.L1 || [];
  out.b_noten = N.map(q => q.m + '@' + q.a.toFixed(2));
  await C('s6plan', {lid: 'L1', mv: [{id: N[1].id, dm: 2, dt: 0}]});
  const m0 = await C('open', {}); const a0 = m0.meta.layers.find(l => l.id === 'L1').a6;
  const r0 = mono((await C('render', {mix: 'L1', a: 0, b: sek * sr})).ch);
  // B1: Note 4 (5.0–6.0) aus der Audio-Ebene herausnehmen → in eine neue Ebene
  let t0 = Date.now(); const tr = await C('transfer', {von: 'L1', nach: {art: 'lead', name: 'Raus'}, sel: {art: 'rect', t0: 4.8, t1: 6.2, f0: 150, f1: 9500}}); const ms1 = Date.now() - t0;
  const a1 = tr.meta.layers.find(l => l.id === 'L1').a6, r1 = mono((await C('render', {mix: 'L1', a: 0, b: sek * sr})).ch);
  out.b1 = {idVor: a0 && a0.id, idNach: a1 && a1.id, neu6: tr.neu6 || 0, ms: ms1, rmsNote4: {vor: rms(r0, 5.1, 5.9), nach: rms(r1, 5.1, 5.9)}, maxAbwNote1bis3: mad(r0, r1, 0, 4.7), rmsNote2Verschoben: {vor: rms(r0, 2.1, 2.9), nach: rms(r1, 2.1, 2.9)}};
  // B2: fremde Ebene (orig → Bass), L1 unberührt → kein Neu-Rechnen, a6 bleibt
  t0 = Date.now(); const tb = await C('transfer', {von: 'orig', nach: {art: 'bass', name: 'Bass'}, sel: {art: 'rect', t0: 0, t1: 8, f0: 40, f1: 120}}); const ms2 = Date.now() - t0;
  const a2 = tb.meta.layers.find(l => l.id === 'L1').a6;
  out.b2 = {idGleich: a2.id === a1.id, neu6: tb.neu6 || 0, ms: ms2};
  // B3: ↶ (B2), ↶ (B1) → a6 wie vorher, Audio bitgleich
  await C('undo', {}); const u = await C('undo', {}); const au = u.meta.layers.find(l => l.id === 'L1').a6, ru = mono((await C('render', {mix: 'L1', a: 0, b: sek * sr})).ch);
  out.b3 = {label: u.label, idZurueck: au.id === (a0 && a0.id), maxAbw: mad(r0, ru, 0, sek - 0.01)};
  const re = await C('redo', {}); const ar = re.meta.layers.find(l => l.id === 'L1').a6, rr = mono((await C('render', {mix: 'L1', a: 0, b: sek * sr})).ch);
  out.b4 = {idRedo: ar.id === (a1 && a1.id), maxAbw: mad(r1, rr, 0, sek - 0.01)};
  // B5: Zeit „Zuordnen“-freie Op (noten auf Bass, kein Masken-Op) – soll kein neu6 bringen
  const nb = await C('noten', {lid: 'L3'}).catch(e => ({err: String(e)}));
  out.b5 = {neu6: nb && nb.neu6 || 0};
  await call('close', {doc});
}
console.log(JSON.stringify(out));
