// T5b: PANIK while a 4-bar take plays: does the take stay silent until the next clip start (like a held synth note)?
import {launch, open, sleep} from './v3-qa-vs3-h.mjs';
const sine = (sr, sec, f, a = 0.3) => { const n = Math.round(sr * sec), x = new Array(n); for (let i = 0; i < n; i++) x[i] = Math.round(Math.sin(2 * Math.PI * f * i / sr) * a * 32767); return x; };
const br = await launch(null);
for (let run = 1; run <= 2; run++) {
  const H = await open(br), p = H.p;
  await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(120); });
  const r = await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 7, len: 4}), sine(48000, 8.2, 330));
  await p.evaluate(() => { window.__tap(); SYNQUENZER.launchScene(7); }); await sleep(2500);
  const pre = await p.evaluate(() => window.__lvl());
  const out = [];
  await p.evaluate(() => { window.__pt = window.__ctx.currentTime; SYNQUENZER.panic(); });
  for (const ms of [40, 120, 300, 800]) { await sleep(ms - (out.length ? [40, 120, 300, 800][out.length - 1] : 0)); out.push([ms, +(await p.evaluate(() => window.__lvl())).rmsDb.toFixed(1)]); }
  const src = await p.evaluate(() => SYNQUENZER.tkInfo().src.map(s => ({start: +(s.start - window.__pt).toFixed(3), off: +s.off.toFixed(3)})));
  console.log(`run ${run}: before panic ${pre.rmsDb.toFixed(1)} dB; after panic [ms, dB]`, JSON.stringify(out), 'sources rel. to panic', JSON.stringify(src));
  await p.evaluate(() => SYNQUENZER.stop()); await p.close();
}
await br.close();
