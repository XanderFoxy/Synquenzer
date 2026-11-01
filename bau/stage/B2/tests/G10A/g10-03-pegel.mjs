// G10-03: Pegel-Balken in der Aufnahme-Leiste folgt dem Fake-Mikro (Korrelation Balken ↔ RMS des Mikros ≥ 0,9), ≤ 15 Bilder/s, nur transform,
// Kosten je Bild p95 ≤ 0,2 ms. Dazu Bildschirmfotos 428×926, 926×428, 428×650.
import {launch, open, micOn, waitBeat, sleep, report, writeWav, voice, TMP, HERE} from './lib.mjs';
const R = report('G10-03');
const sr = 48000, wav = TMP + '/g10-03-am.wav';
// Lautstärke wandert langsam (−48 … −1 dBFS, 0,4 Hz), kurze Spitzen über −1 dBFS für „Übersteuern“
writeWav(wav, voice(196, 30, sr, 1, t => { const db = -48 + 47 * (.5 + .5 * Math.sin(2 * Math.PI * .4 * t)); return (t % 2.5 > .55 && t % 2.5 < .7) ? 1.3 : Math.pow(10, db / 20) * .96; }), sr);
const br = await launch(wav);
const shots = [[428, 926], [926, 428], [428, 650]];
let res = null;
for (const [w, h] of shots) {
  const ctx = await br.newContext({viewport: {width: w, height: h}});
  const {p, errs} = await open(br, {ctx});
  await p.evaluate(async () => { SYNQUENZER.newProject({init: true}); await new Promise(r => setTimeout(r, 400)); });
  await micOn(p, 'wired');
  await p.evaluate(() => { SYNQUENZER.play(); });
  await waitBeat(p, 1);
  await p.evaluate(() => { SYNQUENZER.g10aLvlLog(true); SYNQUENZER.rec(); });
  await p.waitForFunction(() => SYNQUENZER.g10aInfo().lvl.on, null, {timeout: 10000});
  await sleep(w === 428 && h === 926 ? 9000 : 2500);
  const info = await p.evaluate(() => SYNQUENZER.g10aInfo());
  await p.screenshot({path: `${HERE}/bilder/g10-03-pegel-${w}x${h}.png`});
  const lane = await p.evaluate(() => { const e = document.querySelector('.g10a-lvl'), c = document.getElementById('recLaneCv'); if (!e) return null; const a = e.getBoundingClientRect(), b = c.getBoundingClientRect(); return {lvl: [a.x, a.y, a.width, a.height].map(Math.round), cv: [b.x, b.y, b.width, b.height].map(Math.round), css: e.firstChild.style.cssText}; });
  if (w === 428 && h === 926) {
    const L = await p.evaluate(() => SYNQUENZER.g10aLvlLog());
    // RMS des Mikros zur selben Zeit aus dem Ringpuffer (dieselbe Abbildung −60 … 0 dB → 0 … 1)
    const rms = await p.evaluate(log => log.map(e => { if (e.end < 2048) return null; const x = SYNQUENZER.stimmeRead(e.end - 1024, e.end); if (!x) return null; let s = 0; for (const v of x.mic) s += v * v; const db = 10 * Math.log10(s / x.mic.length + 1e-20); return Math.max(0, Math.min(1, (db + 60) / 60)); }), L.log);
    const pr = L.log.map((e, i) => [e.k, rms[i]]).filter(x => x[1] != null);
    const n = pr.length, mx = pr.reduce((s, x) => s + x[0], 0) / n, my = pr.reduce((s, x) => s + x[1], 0) / n;
    let sxy = 0, sxx = 0, syy = 0; for (const [x, y] of pr) { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; }
    const r = sxy / Math.sqrt(sxx * syy);
    const dts = L.log.slice(1).map((e, i) => e.t - L.log[i].t), fps = 1000 / (dts.reduce((a, b) => a + b, 0) / dts.length), minDt = Math.min(...dts);
    const cs = L.cost.slice().sort((a, b) => a - b), p95 = cs[Math.floor(cs.length * .95)];
    res = {n, r: +r.toFixed(3), fps: +fps.toFixed(1), minDt: +minDt.toFixed(1), p95: +p95.toFixed(3), kMin: Math.min(...pr.map(x => x[0])), kMax: Math.max(...pr.map(x => x[0]))};
    R.check('Korrelation Balken ↔ Mikro-RMS ≥ 0,9', r >= .9 && n > 60, res);
    R.check('höchstens 15 Bilder/s', fps <= 15.5 && minDt >= 65, {fps: res.fps, minDt: res.minDt});
    R.check('Kosten je Bild p95 ≤ 0,2 ms', p95 <= .2, res.p95);
    R.check('Balken bewegt sich über den Bereich', res.kMax - res.kMin > .5, [res.kMin, res.kMax]);
    const clip = L.log.some(e => e.lvl > -1.5);
    R.check('Übersteuern wird rot (Klasse g10a-clip)', await p.evaluate(() => new Promise(res => { let seen = false; const t0 = performance.now(); const f = () => { if (SYNQUENZER.g10aInfo().lvl.clip) seen = true; if (seen || performance.now() - t0 > 11000) res(seen); else requestAnimationFrame(f); }; f(); })), {lautesteRmsDb: Math.max(...L.log.map(e => e.lvl)).toFixed(1)});
  }
  R.check(`${w}×${h}: Balken liegt genau über der Noten-Fläche`, lane && lane.lvl.join() === lane.cv.join(), lane);
  R.check(`${w}×${h}: nur transform am Balken`, lane && /^transform: scaleX\([\d.]+\);$/.test(lane.css), lane && lane.css);
  R.check(`${w}×${h}: Leiste zeigt „Stimme“`, await p.evaluate(() => /Stimme/.test(document.getElementById('recLaneTxt').textContent)));
  await p.evaluate(() => SYNQUENZER.rec());
  await p.waitForFunction(() => !SYNQUENZER.g10aInfo().lvl.on, null, {timeout: 8000}).catch(() => {}); await sleep(200);
  const off = await p.evaluate(() => SYNQUENZER.g10aInfo().lvl);
  R.check(`${w}×${h}: nach der Aufnahme aus`, !off.on, off);
  R.check(`${w}×${h}: keine Seitenfehler`, errs.length === 0, errs.slice(0, 3));
  await ctx.close();
}
// ohne 🎤: keine Pegel-Leiste (Noten wie bisher)
{
  const ctx = await br.newContext({viewport: {width: 428, height: 926}}); const {p} = await open(br, {ctx});
  await p.evaluate(async () => { SYNQUENZER.newProject({init: true}); await new Promise(r => setTimeout(r, 400)); SYNQUENZER.play(); });
  await waitBeat(p, 1); await p.evaluate(() => SYNQUENZER.rec()); await sleep(3000);
  const i = await p.evaluate(() => SYNQUENZER.g10aInfo().lvl);
  R.check('ohne 🎤: kein Pegel-Balken', !i.on && !i.el, i);
  await p.screenshot({path: `${HERE}/bilder/g10-03-ohne-mikro-428x926.png`});
  await ctx.close();
}
await br.close(); R.done();
