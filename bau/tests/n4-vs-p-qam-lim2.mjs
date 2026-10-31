// QA musiker: Spitzen-Schutz – Versatz der Hüllkurve gegen das Audio bei Stücken mit Versatz messen (Song ab Takt n, BPM b)
// node n4-vs-p-qam-lim2.mjs [bpm] [app]
import {open, sleep, APP} from './n4-vs-p-qa-h.mjs';
import {sung, truePeakDb} from './n4-vs-p-lib.mjs';
const BPM = +(process.argv[2] || 120), FILE = process.argv[3] || APP;
const H = await open({file: FILE}), p = H.p;
await p.evaluate(b => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(b); }, BPM);
await sleep(300);
const sr = await p.evaluate(() => window.__ctx.sampleRate), bar = 240 / BPM;
const len = 4, sec = len * bar;
const y = sung(sec, sr, -36, {seed: 5}).y, SP = [];
for (let t = 0.75; t < sec - 0.3; t += 0.5) { const i0 = Math.round(t * sr), n = Math.round(0.004 * sr); SP.push(t); for (let j = 0; j < n; j++) y[i0 + j] = 0.98 * Math.sin(Math.PI * j / n) * Math.sign(Math.sin(2 * Math.PI * 250 * j / sr) + 1e-9); }
const pcm = Array.from(y, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767))));
const r = await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 4}), [pcm, sr]);
await p.evaluate(() => { SYNQUENZER.vpInfo(); return SYNQUENZER.vpWait(); });
const st = await p.evaluate(() => SYNQUENZER.tkInfo().stimme);
const E = await p.evaluate(id => SYNQUENZER.vpEnv(id), r.id);
console.log(await p.evaluate(() => SYNQUENZER.version), 'BPM', BPM, 'sr', sr, 'take sr', E.sr, 'g', E.g.toFixed(3), 'env', E.env ? E.env.length : null);
await p.evaluate(st => { SYNQUENZER.setTrackFx(st, 'vol', 1); const lanes = []; for (let i = 0; i < NT(); i++) lanes.push(i === st ? [{bar: 0, slot: 0}] : []); SYNQUENZER.setSong({bars: 4, lanes, carrier: [], mel: {}}); }, st);
const env = Float32Array.from(E.env), K = E.K;
const envAt = x => { const b = x / K, i = Math.floor(b), f = b - i; if (i < 0) return 1; if (i + 1 >= env.length) return 1; return env[i] * (1 - f) + env[i + 1] * f; };
for (const from of [0, 1, 2, 3]) {
  await p.evaluate(st => window.__cap('v', AU.tracks[st].cut), st);
  await p.evaluate(f => SYNQUENZER.songPlay(f), from);
  await sleep((len - from) * bar * 1000 + 600);
  const src = await p.evaluate(() => SYNQUENZER.vpInfo().src);
  const o = await p.evaluate(() => { const C = window.__capGet('v'); return {t0: C.t0, L: Array.from(C.L)}; });
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(400);
  const L = Float32Array.from(o.L);
  // Audio-Ausrichtung: Ausgang ≈ x[n + D] * g * env * pan → D über Kreuzkorrelation in einem Abschnitt ohne Spitze
  const xs = y; let best = null;
  // grob: erste Spitze im Ausgang finden
  let i0 = -1; for (let i = 0; i < L.length; i++) if (Math.abs(L[i]) > 0.2) { i0 = i; break; }
  const firstSp = SP.find(t => t >= from * bar - 1e-9);
  const D0 = Math.round(firstSp * sr) - i0;           // grob: Take-Index = Ausgangsindex + D0
  for (let D = D0 - 400; D <= D0 + 400; D++) { let e = 0, n = 0; for (let i = i0 + 2000; i < i0 + 2000 + 8000 && i < L.length; i++) { const k = i + D; if (k < 0 || k >= xs.length) continue; e += L[i] * xs[k]; n++; } if (!best || e > best.e) best = {D, e}; }
  const D = best.D;
  // Pegel ohne Begrenzung: Verhältnis außerhalb der Spitzen
  let num = 0, den = 0; for (let i = i0 + 2000; i < i0 + 10000; i++) { const k = i + D; num += L[i] * xs[k]; den += xs[k] * xs[k]; }
  const G = num / den;
  // Hüllkurve gegen Audio verschieben: welche Verschiebung (Samples) erklärt das Ausgangssignal in den Spitzen am besten?
  let bl = null;
  for (let lag = -64; lag <= 64; lag += 1) { let e = 0; for (const t of SP) { if (t < from * bar + 0.05) continue; const c = Math.round(t * sr); for (let k = c - 100; k < c + Math.round(0.006 * sr); k++) { const i = k - D; if (i < 0 || i >= L.length) continue; const pred = xs[k] * G * envAt(k + lag); e += (L[i] - pred) ** 2; } } if (!bl || e < bl.e) bl = {lag, e}; }
  const pk = []; for (const t of SP) { if (t < from * bar + 0.05) continue; const i = Math.round(t * sr) - D; if (i < 0 || i + 400 > L.length) continue; pk.push(truePeakDb([L.subarray(i - 200, i + 400)])); }
  console.log(`  Song ab Takt ${from + 1}: Stücke ${JSON.stringify(src.map(s => [+(s.start).toFixed(3), s.lim]))} Ausrichtung D=${D}, G=${G.toFixed(3)}; Hüllkurve liegt ${-bl.lag} Samples (${(-bl.lag / sr * 1000).toFixed(2)} ms) ${bl.lag < 0 ? 'zu spät' : bl.lag > 0 ? 'zu früh' : 'genau'}; Spitzen dBTP max ${Math.max(...pk)} min ${Math.min(...pk)}`);
}
console.log('  Konsole:', JSON.stringify(H.errs.slice(0, 3)));
await H.br.close();
