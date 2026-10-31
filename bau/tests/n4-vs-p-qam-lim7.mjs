// QA musiker: Spitzen-Schutz live – Hüllkurve gegen Audio nach Neu-Planung (tkTrackResync) bzw. Song-Start mitten im Clip
// Ausrichtung des Audios über die Stimme (Kreuzkorrelation), dann wirksame Verstärkung um jede Spitze gegen vpEnv → Versatz der Hüllkurve
import {open, sleep, APP} from './n4-vs-p-qa-h.mjs';
import {sung, truePeakDb} from './n4-vs-p-lib.mjs';
const FILE = process.argv[2] || APP, RUNS = +(process.argv[3] || 6), MODE = process.argv[4] || 'resync';
const H = await open({file: FILE}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(120); });
await sleep(300);
const sr = await p.evaluate(() => window.__ctx.sampleRate);
const y = sung(8, sr, -36, {seed: 5}).y, SPT = [];
const CL = (() => { let s = 7, z = 0, m = 0; const n = Math.round(0.004 * sr), a = new Float32Array(n); for (let j = 0; j < n; j++) { s = (s * 16807) % 2147483647; const w = s / 2147483647 * 2 - 1; z = z + 0.5 * (w - z); a[j] = z; m = Math.max(m, Math.abs(z)); } for (let j = 0; j < n; j++) a[j] /= m; return a; })();
for (let k = 0; k < 8; k++) { const i0 = Math.round((0.75 + k) * sr); SPT.push(i0); for (let j = 0; j < CL.length; j++) y[i0 + j] = 0.98 * Math.sin(Math.PI * j / CL.length) * CL[j]; }
const pcm = Array.from(y, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767)))), x = Float32Array.from(pcm, v => v / 32767);
const r = await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 4}), [pcm, sr]);
await p.evaluate(() => { SYNQUENZER.vpInfo(); return SYNQUENZER.vpWait(); });
const st = await p.evaluate(() => SYNQUENZER.tkInfo().stimme), E = await p.evaluate(id => SYNQUENZER.vpEnv(id), r.id), env = E.env, K = E.K, g = E.g;
const envAt = n => { const b = n / K, i = Math.floor(b), f = b - i; if (i < 0 || i + 1 >= env.length) return 1; return env[i] * (1 - f) + env[i + 1] * f; };
await p.evaluate(st => { SYNQUENZER.setTrackFx(st, 'vol', 1); const lanes = []; for (let i = 0; i < NT(); i++) lanes.push(i === st ? [{bar: 0, slot: 0}] : []); SYNQUENZER.setSong({bars: 4, lanes, carrier: [], mel: {}}); }, st);
console.log(await p.evaluate(() => SYNQUENZER.version), 'Modus', MODE, 'g', g.toFixed(3));
for (let run = 0; run < RUNS; run++) {
  await p.evaluate(st => window.__cap('in', AU.tracks[st].trackIn), st);
  const at = 1.3 + run * 0.37;
  if (MODE === 'resync') await p.evaluate(at => { SYNQUENZER.launchScene(0); setTimeout(() => tkTrackResync(SYNQUENZER.tkInfo().stimme), at * 1000); }, at);
  else await p.evaluate(b => SYNQUENZER.songPlay(b), 1 + (run % 3));
  await sleep(MODE === 'resync' ? at * 1000 + 2600 : 3000);
  const I = Float32Array.from(await p.evaluate(() => Array.from(window.__capGet('in').L)));
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(400);
  // grobe Ausrichtung über 10-ms-Pegel, dann fein
  const F = Math.round(sr * 0.01), fe = a => { const o = new Float32Array(Math.floor(a.length / F)); for (let k = 0; k < o.length; k++) { let s = 0; for (let i = k * F; i < k * F + F; i++) s += a[i] * a[i]; o[k] = Math.sqrt(s / F); } return o; };
  const eI = fe(I), eX = fe(x); let bl = null;
  for (let L = -eX.length; L < eI.length; L++) { let s = 0, n = 0; for (let k = Math.max(0, L); k < Math.min(eI.length, L + eX.length); k++) { s += Math.min(eI[k], .05) * Math.min(eX[k - L] * g, .05); n++; } if (n > 100 && (!bl || s > bl.s)) bl = {L, s}; }
  // Spitzen, die im Mitschnitt liegen und nach dem Wechsel kommen
  const out = [];
  for (const sp of SPT) {
    const c0 = sp + 0 - bl.L * F; // ungefähr Index im Mitschnitt
    if (c0 < sr * (MODE === 'resync' ? at + 0.15 : 0.2) || c0 + 2000 > I.length) continue;
    // fein: Kreuzkorrelation der Stimme 250 … 30 ms vor der Spitze
    let best = null;
    for (let d = -900; d <= 900; d++) { let s = 0; for (let k = sp - Math.round(.25 * sr); k < sp - Math.round(.03 * sr); k += 2) { const i = k - bl.L * F + d; if (i < 0 || i >= I.length) continue; s += I[i] * x[k]; } if (!best || s > best.s) best = {d, s}; }
    const D = -bl.L * F + best.d;   // Mitschnitt-Index = Take-Index + D
    // wirksame Verstärkung über die Spitze gegen die Hüllkurve, beste Verschiebung der Hüllkurve
    let fit = null;
    for (let lag = -400; lag <= 400; lag += 2) { let e = 0; for (let k = sp - 40; k < sp + CL.length + 40; k++) { if (Math.abs(x[k]) < .1) continue; const eff = I[k + D] / (x[k] * g); e += (eff - envAt(k + lag)) ** 2; } if (!fit || e < fit.e) fit = {lag, e}; }
    out.push({t: +(sp / sr).toFixed(2), envShiftMs: +(fit.lag / sr * 1000).toFixed(2), tp: truePeakDb([I.subarray(sp + D - 300, sp + D + 500)])});
  }
  console.log('  Lauf', run, MODE === 'resync' ? 'Neu-Planung bei ' + at.toFixed(2) + ' s' : 'Song ab Takt ' + (2 + run % 3), JSON.stringify(out));
}
console.log('  Konsole', JSON.stringify(H.errs.slice(0, 2)));
await H.br.close();
