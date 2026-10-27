// QA MK8b-01 live: every Kompakt program loaded through the library on track 1, C3 held 2.5 s by the real keyboard path,
// app output captured (ScriptProcessor on all outputs); loudest 400 ms window RMS (mean of L/R power) > -40 dBFS; NaN check;
// stuck notes: 1.5 s after release + PANIK the tail must die (< -70 dBFS). Vocoders with Chromium's fake microphone (E2 = mic).
import {launch, open, mkOk, sleep, DIR} from './v3-qa-mk8b-h.mjs';
import fs from 'fs';
const {ok, fails} = mkOk();
const G = (process.env.G || '1,2,3,4,5,6,7,8').split(',').map(Number);
const br = await launch(true, process.env.WAV);
const {ctx, page, errs} = await open(br, {mic: true});
await page.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); mkLoad(); await MKK.decodeAll(); });
await sleep(800);
await page.evaluate(() => window.__recOut());
const res = [];
for (const g of G) for (let s = 1; s <= 16; s++) {
  const r = await page.evaluate(async ([g, s]) => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    const id = MKK.rec(g, s).id; SYNQUENZER.browserTap(id); closeBrowser(false); await w(g === 8 ? 600 : 250);
    window.__recStop();
    SYNQUENZER.keyOn(48, .8, 'q'); await w(2500); SYNQUENZER.keyOff(48, 'q'); await w(100);
    const a = window.__recStop();
    let best = 0, nan = 0; const W = Math.round(.4 * a.sr);
    for (let i = 0; i < a.L.length; i++) if (!isFinite(a.L[i]) || !isFinite(a.R[i])) nan++;
    for (let st = 0; st + W <= a.L.length; st += Math.round(W / 4)) { let e = 0; for (let i = st; i < st + W; i++) e += .5 * (a.L[i] * a.L[i] + a.R[i] * a.R[i]); best = Math.max(best, e / W); }
    let pk = 0; for (let i = 0; i < a.L.length; i++) pk = Math.max(pk, Math.abs(a.L[i]), Math.abs(a.R[i]));
    // tail after PANIK (double stop)
    SYNQUENZER.stop(); SYNQUENZER.stop(); await w(1500); window.__recStop(); await w(400); const t = window.__recStop(); let te = 0; for (let i = 0; i < t.L.length; i++) te += .5 * (t.L[i] * t.L[i] + t.R[i] * t.R[i]);
    return {id, name: MKK.rec(g, s).name, e2: S.tracks[0].mkIn && S.tracks[0].mkIn.e2, held: 10 * Math.log10(best + 1e-30), pk: 20 * Math.log10(pk + 1e-12), nan, tail: 10 * Math.log10(te / Math.max(1, t.L.length) + 1e-30), n: a.L.length};
  }, [g, s]);
  res.push(r);
  console.log((r.held > -40 && !r.nan ? 'ok   ' : 'FAIL ') + r.id.slice(5) + ' ' + r.name.padEnd(13) + ' C3 held ' + r.held.toFixed(1).padStart(6) + ' dBFS  peak ' + r.pk.toFixed(1).padStart(6) + '  tail ' + r.tail.toFixed(1) + (r.e2 ? '  E2=' + r.e2 : '') + (r.nan ? ' NaN ' + r.nan : ''));
}
fs.writeFileSync(DIR + '/live-' + G.join('') + '.json', JSON.stringify(res));
ok('MK8b-01 live: all audible > -40 dBFS at C3', res.every(r => r.held > -40), res.filter(r => !(r.held > -40)).map(r => r.name + ' ' + r.held.toFixed(1)).join(', ') || 'quietest ' + Math.min(...res.map(r => r.held)).toFixed(1));
ok('no NaN', res.every(r => !r.nan));
ok('tail after double stop < -70 dBFS', res.every(r => r.tail < -70), res.filter(r => r.tail >= -70).map(r => r.name + ' ' + r.tail.toFixed(1)).join(', '));
ok('vocoders E2 = mic', res.filter(r => r.id.startsWith('f-mk-k8')).every(r => r.e2 === 'mic'));
ok('console', errs.length === 0, errs.slice(0, 3).join(' | '));
await br.close();
console.log(fails() ? 'FAIL ' + fails() : 'ALL PASS');
