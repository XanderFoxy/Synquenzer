// QA musiker: 16-Takt-Gesang (leise gesungen, natürliche Plosive), zwei gleiche Takes; beim Spielen im Takes-Blatt den anderen Take wählen (tkPick).
// Misst: Zeit in tkStartSrc, Versatz der Stimme nach dem Wechsel (Abstand der Plosive vor/nach gegen Soll), wahre Spitze der Plosive am STIMME-Eingang.
// node n4-vs-p-qam-pick16.mjs <app> <runs> [pick|undo]
import {open, sleep, APP, mysing} from './n4-vs-p-qa-h.mjs';
import {truePeakDb} from './n4-vs-p-lib.mjs';
const FILE = process.argv[2] || APP, RUNS = +(process.argv[3] || 3), MODE = process.argv[4] || 'pick', BPM = 120;
const H = await open({file: FILE}), p = H.p;
await p.evaluate(b => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(b); }, BPM);
await sleep(300);
const sr = await p.evaluate(() => window.__ctx.sampleRate), sec = 16 * 240 / BPM;
const g0 = mysing(sec, sr, -34, 11), y = g0.y, PL = [], rms = Math.pow(10, -34 / 20);
g0.notes.forEach((nt, k) => { if (k % 2) return; const i0 = Math.round(nt.t * sr), n = Math.round(0.006 * sr), f = 120 + (k * 37) % 280; PL.push(i0); for (let j = 0; j < n && i0 + j < y.length; j++) y[i0 + j] += rms * 10 * Math.sin(Math.PI * j / n) * Math.sin(2 * Math.PI * f * j / sr); });
const pcm = Array.from(y, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767))));
await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 16}), [pcm, sr]);
const r = await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 16}), [pcm, sr]);
await p.evaluate(() => { if (SYNQUENZER.vpInfo) { SYNQUENZER.vpInfo(); return SYNQUENZER.vpWait(); } });
for (let k = 0; k < 2; k++) { await p.evaluate(() => SYNQUENZER.tkPick({t: SYNQUENZER.tkInfo().stimme, s: 0}, 1, false)); await p.evaluate(() => { if (SYNQUENZER.vpInfo) { SYNQUENZER.vpInfo(); return SYNQUENZER.vpWait(); } }); }
const st = await p.evaluate(() => SYNQUENZER.tkInfo().stimme);
await p.evaluate(st => { SYNQUENZER.setTrackFx(st, 'vol', 1); const c = window.__ctx; window.__log = []; const o0 = window.tkStartSrc; window.tkStartSrc = function (o) { const t0 = performance.now(), ct = c.currentTime, w = o.when; const rr = o0(o); window.__log.push({ms: +(performance.now() - t0).toFixed(1), lead: +((w - ct) * 1000).toFixed(1)}); return rr; }; }, st);
console.log(FILE.split('/').slice(-2).join('/'), await p.evaluate(() => SYNQUENZER.version), MODE, 'Plosive', PL.length);
for (let run = 0; run < RUNS; run++) {
  await p.evaluate(st => { window.__log = []; window.__cap('in', AU.tracks[st].trackIn); }, st);
  const at = 9.3 + run * 1.7;
  await p.evaluate(([at, mode]) => { SYNQUENZER.launchScene(0); setTimeout(() => { window.__log.push('— Wechsel'); if (mode === 'pick') SYNQUENZER.tkPick({t: SYNQUENZER.tkInfo().stimme, s: 0}, 1, false); else { SYNQUENZER.undo(); } }, at * 1000); }, [at, MODE]);
  await sleep(at * 1000 + 6000);
  const I = Float32Array.from(await p.evaluate(() => Array.from(window.__capGet('in').L)));
  const log = await p.evaluate(() => window.__log);
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(500);
  if (MODE === 'undo') { await p.evaluate(() => SYNQUENZER.redo()); await p.evaluate(() => { if (SYNQUENZER.vpInfo) { SYNQUENZER.vpInfo(); return SYNQUENZER.vpWait(); } }); }
  // Plosive im Mitschnitt: lokale Maxima > 0.25, Abstand ≥ 150 ms; Zuordnung über Abstände zum Soll
  const found = []; for (let i = 0; i < I.length; i++) if (Math.abs(I[i]) > 0.25) { let im = i; for (let k = i; k < i + Math.round(.006 * sr) && k < I.length; k++) if (Math.abs(I[k]) > Math.abs(I[im])) im = k; found.push({i: im, tp: truePeakDb([I.subarray(Math.max(0, im - 400), im + 400)])}); i += Math.round(.15 * sr); }
  // erste Fundstelle ↔ Soll-Plosiv mit passendem Abstandsmuster
  let bestOff = null; for (let a = 0; a < PL.length; a++) { const off = found[0].i - PL[a]; let s = 0; for (const f of found.slice(0, 4)) { const d = Math.min(...PL.map(q => Math.abs(q + off - f.i))); s += d; } if (!bestOff || s < bestOff.s) bestOff = {off, s}; }
  const dev = found.map(f => { const q = PL.reduce((b, q) => Math.abs(q + bestOff.off - f.i) < Math.abs(b + bestOff.off - f.i) ? q : b, PL[0]); return {t: +(f.i / sr).toFixed(2), shiftMs: +((f.i - q - bestOff.off) / sr * 1000).toFixed(1), tp: f.tp}; });
  console.log(`  Lauf ${run} (${MODE} bei ${at.toFixed(1)} s): tkStartSrc`, JSON.stringify(log), '\n    Plosive (Zeit, Versatz gegen vorher ms, dBTP):', JSON.stringify(dev));
}
console.log('  Konsole', JSON.stringify(H.errs.slice(0, 2)));
await H.br.close();
