// Klick-Suche bei Szenenwechseln mit 16-Takt-STIMME-Clip (nur STIMME hörbar, alle Spuren laufen): Mitschnitt je 256-Block
// (größte 2. Differenz + Pegel), Vergleich mit der 2. Differenz des Takes selbst.
import {start, sing, melN, prep, fire, waitBeat, idle, stInfo, NEW, sleep, tapSel} from './n4-vs-l-mus-h.mjs';
const file = process.argv[2] || NEW, BPM = 112;
const H = await start(file, BPM, {demo: true, touch: true, mel: false}), p = H.p;
const k1 = await prep(H, sing(melN(16), BPM));
await p.evaluate(() => { SYNQUENZER.launchScene(0); SYNQUENZER.selectSlot(5, 0); SYNQUENZER.play(); });
await waitBeat(p, 1.0); await tapSel(H, '#bRec'); await fire(H, k1, 4);
await waitBeat(p, 67.5); await tapSel(H, '#bRec'); await waitBeat(p, 70); await idle(p); await sleep(400);
const r = await stInfo(p, 0);
await p.evaluate(() => SYNQUENZER.stop()); await sleep(500);
const tk = await p.evaluate(async id => { const m = SYNQUENZER.takes()[id]; const s = await SYNQUENZER.tkPcmRange(id, 0, m.len); let mx = 0, at = 0; const ds = []; for (let i = 2; i < s.length; i++) { const d = Math.abs(s[i] - 2 * s[i - 1] + s[i - 2]) / 32767; ds.push(d); if (d > mx) { mx = d; at = i; } } ds.sort((a, b) => a - b); return {sr: m.sr, max: mx, atSec: at / m.sr, p999: ds[Math.floor(ds.length * 0.999)], med: ds[Math.floor(ds.length / 2)]}; }, r.audio.take);
console.log('STIMME', JSON.stringify({len: r.len, cstart: r.cstart, in: r.audio.in, out: r.audio.out}), '| Take selbst: 2. Differenz', JSON.stringify(tk));
await p.evaluate(async () => { const ctx = window.__ctx;
  const code = `class R extends AudioWorkletProcessor { constructor() { super(); this.b = new Float32Array(4096); this.n = 0; this.t = -1; } process(i) { const x = i[0] && i[0][0]; if (x) { if (this.t < 0) this.t = currentTime; this.b.set(x, this.n); this.n += x.length; if (this.n >= 4096) { this.port.postMessage([this.t, this.b]); this.b = new Float32Array(4096); this.n = 0; this.t = -1; } } return true; } } registerProcessor('n4mrec', R);`;
  await ctx.audioWorklet.addModule('data:application/javascript;base64,' + btoa(code));
  const w = new AudioWorkletNode(ctx, 'n4mrec', {numberOfInputs: 1, numberOfOutputs: 0, channelCount: 1, channelCountMode: 'explicit'}); window.__cap = []; w.port.onmessage = e => window.__cap.push(e.data);
  for (const n of window.__outs) { try { n.connect(w); } catch (e) {} } window.__w = w; });
await p.evaluate(() => { const st = SYNQUENZER.tkInfo().stimme; for (let t = 0; t < 8; t++) if (t !== st) try { SYNQUENZER.setMute(t, true); } catch (e) {} SYNQUENZER.launchScene(0); SYNQUENZER.play(); });
const plan = [[0, 16], [1, 4], [0, 6], [1, 3], [0, 16], [1, 2]];
let bar = 0; const sw = [];
for (const [sc, n] of plan) { if (bar > 0) { await waitBeat(p, bar * 4 - 1.5); await p.evaluate(s => SYNQUENZER.launchScene(s), sc); } sw.push([bar * 4, sc]); bar += n; }
await waitBeat(p, bar * 4 + 0.5); await p.evaluate(() => SYNQUENZER.stop()); await sleep(800);
const res = await p.evaluate(() => { const c = SYNQUENZER.vsClock(), b = window.__cap, n = b.reduce((a, x) => a + x[1].length, 0), y = new Float32Array(n); let o = 0; for (const x of b) { y.set(x[1], o); o += x[1].length; }
  const t0 = b[0][0], sr = window.__ctx.sampleRate, beatAt = i => (t0 + i / sr - c.start) / c.spb;
  // Lücken-Prüfung der Blöcke (Zeitstempel fortlaufend?)
  let holes = 0; for (let k = 1; k < b.length; k++) if (Math.abs(b[k][0] - b[k - 1][0] - 4096 / sr) > 1e-4) holes++;
  const W = Math.round(sr * 0.005), rows = [];
  for (let i = 0; i + W <= n; i += W) { let m = 0, q = 0; for (let j = Math.max(2, i); j < i + W; j++) { const d = Math.abs(y[j] - 2 * y[j - 1] + y[j - 2]); if (d > m) m = d; q += y[j] * y[j]; } rows.push([+beatAt(i).toFixed(3), +m.toFixed(5), +(10 * Math.log10(q / W + 1e-20)).toFixed(1)]); }
  const ds = rows.map(r => r[1]).sort((a, b) => a - b);
  return {holes, n, from: rows[0][0], to: rows[rows.length - 1][0], med: ds[ds.length >> 1], p999: ds[Math.floor(ds.length * 0.999)], top: rows.slice().sort((a, b) => b[1] - a[1]).slice(0, 8), rows: rows.filter(r => r[1] > 0.03).slice(0, 30)}; });
console.log('Mitschnitt', JSON.stringify({holes: res.holes, from: res.from, to: res.to, med: res.med, p999: res.p999}));
console.log('größte 2. Differenz je 5 ms [Schlag, d2, dB]:', JSON.stringify(res.top));
for (const t of res.top) { const s = sw.filter(w => w[0] <= t[0] + 0.01).pop(); console.log(`  Schlag ${t[0]} → Szene ${s ? s[1] + 1 : '?'}, ${s ? (t[0] - s[0]).toFixed(2) : '?'} Schläge nach Szenen-Anfang (Clip-Schlag ${s && s[1] === 0 ? ((t[0] - s[0]) % 64).toFixed(2) : '-'})`); }
console.log('Szenenwechsel (Schlag, Szene):', JSON.stringify(sw));
console.log('Fehler:', JSON.stringify(H.errs.slice(0, 3)));
await H.close();
