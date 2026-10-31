// QA musiker: Wie spät setzt ein neu geplantes Stück ein (Neu-Planung mitten im Clip bzw. Song ab Takt n)? Ausrichtung Stimme vor/nach dem Wechsel
// node n4-vs-p-qam-late.mjs <app> <runs> <resync|song>
import {open, sleep, APP} from './n4-vs-p-qa-h.mjs';
import {sung, truePeakDb} from './n4-vs-p-lib.mjs';
const FILE = process.argv[2] || APP, RUNS = +(process.argv[3] || 5), MODE = process.argv[4] || 'resync';
const H = await open({file: FILE}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(120); });
await sleep(300);
const sr = await p.evaluate(() => window.__ctx.sampleRate);
const y = sung(8, sr, -30, {seed: 5}).y;
const pcm = Array.from(y, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767)))), x = Float32Array.from(pcm, v => v / 32767);
const r = await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 4}), [pcm, sr]);
await p.evaluate(() => { if (SYNQUENZER.vpInfo) { SYNQUENZER.vpInfo(); return SYNQUENZER.vpWait(); } });
const st = await p.evaluate(() => SYNQUENZER.tkInfo().stimme);
// Referenz-Klick-Spur: Metronom aus; wir schneiden STIMME-Eingang und einen Bezug (Ausgang des ctx-Zeit-Oszillators) im selben ScriptProcessor (L/R)
await p.evaluate(() => { const c = window.__ctx; window.__ref = (t) => { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = 3000; g.gain.value = 0; g.gain.setValueAtTime(1, t); g.gain.setValueAtTime(0, t + 0.002); o.connect(g); o.start(t); o.stop(t + 0.01); return g; }; });
console.log(FILE.split('/').slice(-2).join('/'), await p.evaluate(() => SYNQUENZER.version), MODE);
if (MODE === 'song') await p.evaluate(st => { const lanes = []; for (let i = 0; i < NT(); i++) lanes.push(i === st ? [{bar: 0, slot: 0}] : []); SYNQUENZER.setSong({bars: 4, lanes, carrier: [], mel: {}}); }, st);
for (let run = 0; run < RUNS; run++) {
  // Mitschnitt: L = STIMME-Eingang, R = Bezugsimpulse an bekannten Kontextzeiten
  await p.evaluate(st => { const c = window.__ctx, sp = c.createScriptProcessor(4096, 2, 2), m = c.createChannelMerger(2), z = c.createGain(); z.gain.value = 0;
    AU.tracks[st].trackIn.connect(m, 0, 0); window.__refBus = c.createGain(); window.__refBus.connect(m, 0, 1); m.connect(sp); sp.connect(z); z.connect(c.destination);
    const C = window.__C2 = {L: [], R: []}; sp.onaudioprocess = e => { C.L.push(new Float32Array(e.inputBuffer.getChannelData(0))); C.R.push(new Float32Array(e.inputBuffer.getChannelData(1))); }; C.sp = sp; C.m = m; }, st);
  const at = 1.6 + run * 0.29;
  if (MODE === 'resync') await p.evaluate(at => { SYNQUENZER.launchScene(0); setTimeout(() => { tkTrackResync(SYNQUENZER.tkInfo().stimme); }, at * 1000); }, at);
  else await p.evaluate(b => SYNQUENZER.songPlay(b), 1 + run % 2);
  await sleep(600);
  // Bezug: Impulse an Kontextzeiten, die genau Take-Zeiten entsprechen sollen – aus dem ersten/aktuellen Stück: T(u) = when + (u − off)
  const pieces = [];
  const t1 = Date.now();
  while (Date.now() - t1 < (MODE === 'resync' ? at * 1000 + 2500 : 2500)) { const s = await p.evaluate(() => TK.src.filter(r => !r.dead).map(r => ({when: r.start, off: r.off, end: r.end}))); for (const q of s) if (!pieces.some(z => Math.abs(z.when - q.when) < 1e-6)) pieces.push(q); await sleep(50); }
  // Bezugsimpulse für jedes Stück bei Take-Zeit u = 0.5 s-Raster
  await p.evaluate(ps => { for (const q of ps) for (let u = Math.ceil(q.off * 2) / 2 + 0.5; u < q.off + (q.end - q.when) - 0.1; u += 0.5) { const t = q.when + (u - q.off); if (t > window.__ctx.currentTime + 0.05) window.__ref(t).connect(window.__refBus); } }, pieces.slice(-1));
  await sleep(2600);
  const o = await p.evaluate(() => { const C = window.__C2; C.sp.onaudioprocess = null; const cat = a => { const n = a.reduce((s, x) => s + x.length, 0), y = new Float32Array(n); let k = 0; for (const z of a) { y.set(z, k); k += z.length; } return y; }; return {L: Array.from(cat(C.L)), R: Array.from(cat(C.R))}; });
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(400);
  const L = Float32Array.from(o.L), R = Float32Array.from(o.R), q = pieces[pieces.length - 1];
  // Impulse im Bezug finden → ihre Take-Zeit u ist bekannt (Reihenfolge)
  const us = []; for (let u = Math.ceil(q.off * 2) / 2 + 0.5; u < q.off + (q.end - q.when) - 0.1; u += 0.5) us.push(u);
  const imp = []; for (let i = 1; i < R.length; i++) if (Math.abs(R[i]) > 0.3 && Math.abs(R[i - 1]) <= 0.3 && (!imp.length || i - imp[imp.length - 1] > sr * 0.1)) imp.push(i);
  const k0 = us.length - imp.length; // nur die späten Impulse wurden gesetzt
  const lag = [];
  for (let j = 0; j < imp.length; j++) {
    const u = us[j + k0], iu = Math.round(u * sr), ic = imp[j];
    // Stimme um u: Mitschnitt-Index ic + d ↔ Take-Index iu; beste d in ±60 ms
    let best = null; for (let d = -Math.round(.06 * sr); d <= Math.round(.06 * sr); d++) { let s = 0; for (let k = -Math.round(.12 * sr); k < Math.round(.12 * sr); k += 2) { const a = ic + d + k, b = iu + k; if (a < 0 || a >= L.length || b < 0 || b >= x.length) continue; s += L[a] * x[b]; } if (!best || s > best.s) best = {d, s}; }
    lag.push(+(best.d / sr * 1000).toFixed(2));
  }
  console.log(`  Lauf ${run} ${MODE === 'resync' ? 'Neu-Planung ' + at.toFixed(2) + ' s' : 'Song ab Takt ' + (2 + run % 2)}: Stück when ${q.when.toFixed(4)} off ${q.off.toFixed(4)}; Stimme gegen Plan (ms, + = später):`, JSON.stringify(lag));
}
console.log('  Konsole', JSON.stringify(H.errs.slice(0, 2)));
await H.br.close();
