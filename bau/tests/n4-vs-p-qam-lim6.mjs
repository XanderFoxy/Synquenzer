// QA musiker: Spitzen-Schutz live – wo liegt die Spitze im Ausgang gegen die geplante Zeit (when + u − off) und gegen die Hüllkurve?
import {open, sleep, APP, BASE} from './n4-vs-p-qa-h.mjs';
import {sung, truePeakDb} from './n4-vs-p-lib.mjs';
const FILE = process.argv[2] || APP, RUNS = +(process.argv[3] || 6);
const H = await open({file: FILE}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(120); });
await sleep(300);
const sr = await p.evaluate(() => window.__ctx.sampleRate);
const y = sung(8, sr, -36, {seed: 5}).y, SPT = [];
const CL = (() => { let s = 7, z = 0, m = 0; const n = Math.round(0.004 * sr), a = new Float32Array(n); for (let j = 0; j < n; j++) { s = (s * 16807) % 2147483647; const w = s / 2147483647 * 2 - 1; z = z + 0.5 * (w - z); a[j] = z; m = Math.max(m, Math.abs(z)); } for (let j = 0; j < n; j++) a[j] /= m; return a; })();
let ci = 0; for (let k = 0; k < 8; k++) { const i0 = Math.round((0.75 + k) * sr); SPT.push(i0); for (let j = 0; j < CL.length; j++) { y[i0 + j] = 0.98 * Math.sin(Math.PI * j / CL.length) * CL[j]; if (Math.abs(CL[j]) === 1) ci = j; } }
const pcm = Array.from(y, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767))));
const r = await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 4}), [pcm, sr]);
await p.evaluate(() => { if (SYNQUENZER.vpInfo) { SYNQUENZER.vpInfo(); return SYNQUENZER.vpWait(); } });
const st = await p.evaluate(() => SYNQUENZER.tkInfo().stimme);
await p.evaluate(st => SYNQUENZER.setTrackFx(st, 'vol', 1), st);
console.log(FILE.split('/').slice(-2).join('/'), await p.evaluate(() => SYNQUENZER.version));
const res = [];
for (let run = 0; run < RUNS; run++) {
  await p.evaluate(st => { window.__cap('in', AU.tracks[st].trackIn); window.__pl = []; }, st);
  // Szene starten, nach 1,3 … 3,3 s Neu-Planung (wie Take wählen / Undo / Take fertig)
  const at = 1.3 + run * 0.37;
  await p.evaluate(at => { SYNQUENZER.launchScene(0); setTimeout(() => { tkTrackResync(SYNQUENZER.tkInfo().stimme); window.__pl = TK.src.filter(r => !r.dead).map(r => ({when: r.start, off: r.off, cur: window.__ctx.currentTime, lim: !!r.lim})); }, at * 1000); }, at);
  await sleep(at * 1000 + 3000);
  const o = await p.evaluate(() => { const C = window.__capGet('in'); return {t0: C.t0, I: Array.from(C.L), pl: window.__pl}; });
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(400);
  const I = Float32Array.from(o.I), pc = o.pl.filter(x => x.off > 0.5).pop();
  if (!pc) { console.log('  kein neues Stück', JSON.stringify(o.pl)); continue; }
  // die erste Spitze nach dem Versatz: geplante Ausgangszeit und gemessene
  const k = SPT.findIndex(i => i / sr > pc.off + 0.02);
  const u = (SPT[k] + ci) / sr, tExp = pc.when + (u - pc.off), iExp = Math.round((tExp - o.t0) * sr);
  let im = iExp - 2000, mv = 0; for (let i = iExp - 2000; i < iExp + 2000; i++) if (i >= 0 && i < I.length && Math.abs(I[i]) > mv) { mv = Math.abs(I[i]); im = i; }
  const tp = truePeakDb([I.subarray(im - 300, im + 300)]);
  res.push({at, lateStart: +((pc.cur - pc.when) * 1000).toFixed(1), shiftMs: +((im - iExp) / sr * 1000).toFixed(2), spikeTP: tp, lim: pc.lim});
  console.log('  ', JSON.stringify(res[res.length - 1]));
}
console.log('  Konsole', JSON.stringify(H.errs.slice(0, 2)));
await H.br.close();
