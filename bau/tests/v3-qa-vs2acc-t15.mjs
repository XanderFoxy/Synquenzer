// T15: Segmentierungs-Regeln aus r7/stimme.md §4.2/§4.4 mit eigener Stimme (App-DSP): Tonwiederholung mit Einbruch 8/10/15 dB
// ohne Pause, gebundener Tonwechsel mit Glissando, Vibrato ±70/±100, Anschleifen, kurze Noten, Verstimmung −30 ct.
import fs from 'fs';
const s = fs.readFileSync('../dirigent-wt/index.html', 'utf8'); const a = s.indexOf('/* VSDSP-BEGIN */'), b = s.indexOf('/* VSDSP-END */');
const D = new Function(s.slice(a, b) + ';return vsDspMake();')();
const FS = 16000, AM = Array.from({length: 12}, (_, k) => [9, 11, 0, 2, 4, 5, 7].includes(k));
const F = [[730, 90, 1], [1090, 110, 0.5], [2440, 170, 0.25]];
const fg = f => { let g = 0.03; for (const [c, bw, aa] of F) g += aa / Math.sqrt(1 + ((f - c) / (bw / 2)) ** 2); return g; };
// Pfad: [{t, m, amp}] Stützpunkte (linear), Ausgabe Stimme
function render(path, dur, o = {}) {
  const n = Math.ceil(dur * FS), x = new Float32Array(n); let ph = 0, k = 0, seed = 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) {
    const t = i / FS; while (k + 1 < path.length && path[k + 1].t <= t) k++;
    const p0 = path[k], p1 = path[Math.min(k + 1, path.length - 1)], u = p1.t > p0.t ? Math.max(0, Math.min(1, (t - p0.t) / (p1.t - p0.t))) : 0;
    let m = p0.m + (p1.m - p0.m) * u, amp = t < path[0].t ? 0 : p0.amp + (p1.amp - p0.amp) * u;
    if (o.vib && amp > 0) m += o.vib / 100 * Math.sin(2 * Math.PI * 5.5 * t);
    m += (o.det || 0) / 100;
    const f0 = 440 * Math.pow(2, (m - 69) / 12); ph += 2 * Math.PI * f0 / FS;
    let v = 0; for (let h = 1; h * f0 < 7000; h++) v += fg(h * f0) / h * Math.sin(h * ph);
    x[i] = 0.1 * amp * v + (rnd() - 0.5) * 0.0004;
  }
  return x;
}
const seg = (x, snap = true) => D.segment(D.pyin(x, {fs: FS}), {snap, scale: AM, root: 0, tuning: 'auto'});
const show = r => r.notes.map(q => q.n + '@' + q.t0.toFixed(2)).join(' ');
const env = (t0, t1, m, o = {}) => [{t: t0, m: m - (o.scoop || 0), amp: 0}, {t: t0 + 0.012, m: m - (o.scoop || 0) * 0.67, amp: 1}, {t: t0 + 0.08, m, amp: 1}, {t: t1 - 0.025, m, amp: 1}, {t: t1, m, amp: 0}];
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
// (a) Tonwiederholung „da-da-da“ ohne Pause: Einbruch dB über 40 ms, stimmhaft durchgehend
for (const dip of [8, 10, 15, 20]) {
  const g = Math.pow(10, -dip / 20), P = [{t: 0.2, m: 57, amp: 0}, {t: 0.212, m: 57, amp: 1}];
  for (let k = 1; k <= 3; k++) { const tb = 0.2 + k * 0.45; P.push({t: tb - 0.03, m: 57, amp: 1}, {t: tb - 0.01, m: 57, amp: g}, {t: tb + 0.01, m: 57, amp: g}, {t: tb + 0.03, m: 57, amp: 1}); }
  P.push({t: 0.2 + 4 * 0.45 - 0.03, m: 57, amp: 1}, {t: 0.2 + 4 * 0.45, m: 57, amp: 0}, {t: 3, m: 57, amp: 0});
  const r = seg(render(P, 2.4));
  ok(r.notes.length === 4, `Tonwiederholung 4× A3, Einbruch ${dip} dB/40 ms ohne Pause → ${r.notes.length} Noten (${show(r)})`);
}
// (b) gebundener Tonwechsel mit Glissando 80 ms: A3 → C4 → E4 → D4 (je 0,3 s = 1/8 bei 100 BPM)
{ const ms = [57, 60, 64, 62], P = [{t: 0.2, m: 57, amp: 0}, {t: 0.212, m: 57, amp: 1}]; ms.forEach((m, k) => { const t0 = 0.2 + k * 0.3; if (k) P.push({t: t0 - 0.04, m: ms[k - 1], amp: 1}, {t: t0 + 0.04, m, amp: 1}); }); P.push({t: 1.4 - 0.025, m: 62, amp: 1}, {t: 1.4, m: 62, amp: 0}, {t: 2, m: 62, amp: 0});
  const r = seg(render(P, 1.8)); ok(r.notes.map(q => q.n).join() === ms.join(), `Legato mit Glissando 80 ms → ${show(r)}`); }
{ const ms = [57, 59, 60, 62, 64], P = [{t: 0.2, m: 57, amp: 0}, {t: 0.212, m: 57, amp: 1}]; ms.forEach((m, k) => { const t0 = 0.2 + k * 0.15; if (k) P.push({t: t0 - 0.04, m: ms[k - 1], amp: 1}, {t: t0 + 0.04, m, amp: 1}); }); P.push({t: 0.95 - 0.025, m: 64, amp: 1}, {t: 0.95, m: 64, amp: 0}, {t: 2, m: 64, amp: 0});
  const r = seg(render(P, 1.5)); ok(r.notes.map(q => q.n).join() === ms.join(), `Legato-Lauf 1/16 (150 ms) Sekundschritte, Glissando 80 ms → ${show(r)}`); }
// (c) Vibrato
for (const v of [70, 100]) { const P = [...env(0.2, 1.4, 57), ...env(1.5, 2.7, 64)]; const r = seg(render(P, 3, {vib: v})); ok(r.notes.map(q => q.n).join() === '57,64', `Vibrato ±${v} ct, 2 Noten à 1,2 s → ${show(r)}`); }
// (d) Anschleifen 1,5 HT von unten (τ 30 ms)
{ const P = []; [57, 60, 64].forEach((m, k) => { const t0 = 0.2 + k * 0.5; P.push({t: t0, m: m - 1.5, amp: 0}, {t: t0 + 0.012, m: m - 1.2, amp: 1}, {t: t0 + 0.06, m: m - 0.2, amp: 1}, {t: t0 + 0.1, m, amp: 1}, {t: t0 + 0.42, m, amp: 1}, {t: t0 + 0.45, m, amp: 0}); }); P.push({t: 2, m: 64, amp: 0});
  const r = seg(render(P, 1.9)); ok(r.notes.map(q => q.n).join() === '57,60,64', `Anschleifen 1,5 HT → ${show(r)}`); }
// (e) kurze Noten: 1/16 bei 120 BPM (125 ms) mit 20 ms Lücke
{ const ms = [57, 60, 57, 60, 64, 62, 60, 59], P = []; ms.forEach((m, k) => { const t0 = 0.2 + k * 0.125; P.push(...env(t0, t0 + 0.105, m)); }); P.push({t: 2, m: 59, amp: 0});
  const r = seg(render(P, 1.6)); ok(r.notes.map(q => q.n).join() === ms.join(), `1/16-Noten 120 BPM (105 ms) → ${show(r)}`); }
// (f) Verstimmung −30 ct, Melodie
{ const ms = [57, 60, 64, 62, 60, 57, 59, 57], P = []; ms.forEach((m, k) => { const t0 = 0.2 + k * 0.35; P.push(...env(t0, t0 + 0.3, m)); }); P.push({t: 4, m: 57, amp: 0});
  const r = seg(render(P, 3.3, {det: -30})); ok(r.notes.map(q => q.n).join() === ms.join() && Math.abs(r.tuneCt + 30) <= 5, `Verstimmt −30 ct → ${show(r)}, Stimmung ${r.tuneCt.toFixed(1)}`); }
console.log(fail ? 'FAIL ' + fail : 'ALLE OK');
