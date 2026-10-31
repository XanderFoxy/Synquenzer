// QA VS-P-03: Take mit Spitzen bei 0 dBFS über das echte Mikro → wahre Spitze am STIMME-Ausgang ≤ −1 dBTP (Pegel/Panorama-Stellungen);
// natürlicher Gesang: Pegelminderung ≤ 3 dB in ≥ 95 % der stimmhaften Frames
import {open, micOn, sleep, APP, mysing, recMic} from './n4-vs-p-qa-h.mjs';
const FILE = process.argv[2] || APP;
const H = await open({file: FILE}), p = H.p, sr = await micOn(p, 'wired');
// leiser Gesang −30 dBFS RMS + 5 Plosive mit Spitze 0,99 (0 dBFS)
const g = mysing(9.5, sr, -30, 5); const y = g.y;
const pop = (at, amp) => { const n = Math.round(0.006 * sr), i0 = Math.round(at * sr); for (let k = 0; k < n; k++) y[i0 + k] += amp * Math.sin(Math.PI * k / n) * Math.sin(2 * Math.PI * 160 * k / sr); };
for (const t of [1.1, 2.6, 4.2, 5.9, 7.6]) pop(t, 0.99);
let pk = 0; for (const v of y) pk = Math.max(pk, Math.abs(v)); for (let i = 0; i < y.length; i++) y[i] *= 0.99 / pk;
const tk = await recMic(p, y, {len: 4});
const inf0 = await p.evaluate(id => SYNQUENZER.vpInfo().takes[id], tk.id); console.log('vpInfo vor Warten', JSON.stringify(inf0));
await p.evaluate(() => SYNQUENZER.vpWait());
const inf = await p.evaluate(id => SYNQUENZER.vpInfo().takes[id], tk.id); console.log('vpInfo nach Warten', JSON.stringify(inf));
const rawPk = await p.evaluate(id => { const d = tkBuffer(id).getChannelData(0); let m = 0; for (const v of d) m = Math.max(m, Math.abs(v)); return 20 * Math.log10(m); }, tk.id);
console.log(`Take ${tk.id}: Roh-Spitze ${rawPk.toFixed(2)} dBFS, Ausgleich ${inf.heard.gDb} dB → ohne Schutz ${(rawPk + inf.heard.gDb).toFixed(2)} dBFS; Hüllkurve ${inf.heard.lim} Abschnitte, max −${inf.heard.grDb} dB`);
async function play(vol, pan) {
  await p.evaluate(([st, vol, pan]) => { SYNQUENZER.setTrackFx(st, 'vol', vol); SYNQUENZER.setTrackFx(st, 'pan', pan); }, [tk.st, vol, pan]);
  await sleep(300);
  await p.evaluate(([st]) => { window.__cap('v', AU.tracks[st].cut); SYNQUENZER.launchScene(2); for (let i = 0; i < NT(); i++) if (i !== st) R.slot[i] = -1; }, [tk.st]);
  await sleep(17000);
  const o = await p.evaluate(() => { const c = window.__capGet('v'), sr = window.__ctx.sampleRate, k = Math.round(0.3 * sr), L = c.L.subarray(k), R = c.R.subarray(k);
    return {tp: window.__L.truePeakDb([L, R]), tpL: window.__L.truePeakDb([L]), tpR: window.__L.truePeakDb([R]), lufs: window.__L.lufs([L, R], sr).lufs}; });
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(400);
  return o;
}
let fail = 0;
for (const [vol, pan] of [[0.8, 0], [1, 0], [0.8, -1], [0.8, 1], [0.8, -0.5], [1, -1]]) {
  const o = await play(vol, pan);
  const okk = o.tp <= -1; if (!okk) fail++;
  console.log(`${okk ? '✓' : '✗'} Pegel ${vol} Panorama ${pan}: wahre Spitze Ausgang ${o.tp} dBTP (L ${o.tpL} / R ${o.tpR}), ${o.lufs} LUFS`);
}
// natürlicher Gesang (eigener Generator, mit Zischlauten): Pegelminderung je stimmhaftem 20-ms-Frame aus der Hüllkurve der App
await p.evaluate(st => { SYNQUENZER.setTrackFx(st, 'vol', .8); SYNQUENZER.setTrackFx(st, 'pan', 0); }, tk.st);
for (const [lv, sc] of [[-28, 3], [-20, 4], [-36, 5]]) {
  const n = mysing(9.5, sr, lv, 40 + lv);
  const t2 = await recMic(p, n.y, {len: 4, scene: sc});
  await p.evaluate(() => SYNQUENZER.vpWait());
  const e = await p.evaluate(id => SYNQUENZER.vpEnv(id), t2.id);
  // Frames des Takes: der Take beginnt mit Vorlauf; stimmhaft = Frame-Pegel des Takes höchstens 20 dB unter dem lautesten Frame
  const d = await p.evaluate(id => Array.from(tkBuffer(id).getChannelData(0)), t2.id);
  const F = Math.round(0.02 * sr), nf = Math.floor(d.length / F), fr = [];
  for (let f = 0; f < nf; f++) { let s = 0; for (let i = f * F; i < (f + 1) * F; i++) s += d[i] * d[i]; fr.push(10 * Math.log10(s / F + 1e-20)); }
  const mx = Math.max(...fr); let nv = 0, good = 0, worst = 0;
  for (let f = 0; f < nf; f++) { if (fr[f] < mx - 20) continue; nv++; let mn = 1; if (e.env) for (let b = Math.floor(f * F / e.K); b <= Math.ceil((f + 1) * F / e.K) && b < e.env.length; b++) mn = Math.min(mn, e.env[b]); const gr = -20 * Math.log10(mn); worst = Math.max(worst, gr); if (gr <= 3) good++; }
  const okk = good / nv >= 0.95; if (!okk) fail++;
  console.log(`${okk ? '✓' : '✗'} natürlicher Gesang ${lv} dBFS RMS: ${(100 * good / nv).toFixed(1)} % von ${nv} Frames ≤ 3 dB (größte ${worst.toFixed(2)} dB, Ausgleich ${(20 * Math.log10(e.g)).toFixed(2)} dB, Hüllkurve ${e.env ? 'ja' : 'nein'})`);
}
if (H.errs.length) console.log('Konsole:', H.errs.slice(0, 3));
console.log(fail ? fail + ' ✗' : 'alle ✓');
await H.br.close();
