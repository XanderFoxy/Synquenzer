// SX1 live: dieselbe Rampe beim Abspielen in Echtzeit (Verstärkung am Master-Knoten abgetastet), danach wieder 1;
// ■ mitten im Ausblenden; Schleife an = kein Ausblenden; ohne Wert bleibt der Knoten unberührt auf 1
import { open, SONG8, OUT } from './sx-lib.mjs';
import fs from 'fs';
const res = {}; let ok = true;
const {b, p, errs} = await open();
const song4 = Object.assign({}, SONG8, {bars: 4, marks: [{id: 'M1', a: 0, len: 2, name: 'Strophe'}, {id: 'M2', a: 2, len: 2, name: 'Refrain'}], lanes: SONG8.lanes.map(l => l.filter(e => e.bar < 4))});
await p.evaluate(s => { SYNQUENZER.setSong(s); SYNQUENZER.setBpm ? SYNQUENZER.setBpm(150) : (S.bpm = 150); }, song4);
const sample = async (ms) => p.evaluate(async ms => { const out = [], t0 = performance.now(); while (performance.now() - t0 < ms) { const g = AU.M.fade.gain.value; out.push({t: AU.ctx.currentTime, g, play: !!R.songPlay}); await new Promise(r => setTimeout(r, 25)); } return out; }, ms);
// 1) ohne Wert: der Knoten bleibt die ganze Zeit genau 1
{
  await p.evaluate(() => { SYNQUENZER.sx1Fade(0); songPlayStart(0); });
  const s = await sample(1500); await p.evaluate(() => { if (R.songPlay) songPlayEnd(true); });
  res.ohne = {n: s.length, alle1: s.every(x => x.g === 1)}; res.ohne.ok = res.ohne.alle1; ok = ok && res.ohne.ok;
}
await p.waitForTimeout(800);
// 2) 2 Takte Ausblenden, Song (4 Takte bei 150 BPM = 6,4 s) bis zum Ende
{
  await p.evaluate(() => { SYNQUENZER.sx1Fade(2); songPlayStart(0); });
  const info0 = await p.evaluate(() => SYNQUENZER.sx1Info());
  const s = await sample(8200);
  const fadeS = s.filter(x => x.play && x.t >= info0.tS - .01 && x.t <= info0.tE);
  let mono = true; for (let k = 1; k < fadeS.length; k++) if (fadeS[k].g > fadeS[k - 1].g + 1e-6) mono = false;
  const beforeS = s.filter(x => x.play && x.t < info0.tS - .05), endIdx = s.findIndex(x => !x.play);
  const atEnd = endIdx > 0 ? s[endIdx - 1].g : null, last = s[s.length - 1];
  res.live2 = {tS: info0.tS, tE: info0.tE, dauer: +(info0.tE - info0.tS).toFixed(3), soll: +(2 * 4 * 60 / 150).toFixed(3), vorher1: beforeS.every(x => x.g === 1), mono, nFade: fadeS.length, gAmEnde: atEnd, gDanach: last.g, spielt: last.play};
  res.live2.ok = res.live2.vorher1 && mono && fadeS.length > 20 && Math.abs(res.live2.dauer - res.live2.soll) < .01 && atEnd != null && atEnd < .01 && Math.abs(last.g - 1) < 1e-3 && !last.play;
  ok = ok && res.live2.ok;
}
// 3) ■ mitten im Ausblenden: still, Hall/Echo ab, nach < 1 s wieder 1; Neustart sofort danach klingt gleich laut
{
  await p.evaluate(() => songPlayStart(0));
  const i = await p.evaluate(() => SYNQUENZER.sx1Info());
  await p.waitForFunction(tS => AU.ctx.currentTime > tS + .8, i.tS, {timeout: 10000});
  const gStop = await p.evaluate(() => { const g = AU.M.fade.gain.value; stop(); return g; });
  const s = await sample(1200);
  res.stopp = {gBeimStopp: +gStop.toFixed(4), minDanach: Math.min(...s.map(x => x.g)), gNach12s: s[s.length - 1].g};
  res.stopp.ok = gStop < 1 && gStop > 0 && res.stopp.minDanach < .01 && Math.abs(res.stopp.gNach12s - 1) < 1e-3; ok = ok && res.stopp.ok;
}
// 4) Neustart innerhalb der Ausklang-Pause: sofort wieder 1 (der Anfang ist nicht stumm)
{
  await p.evaluate(() => songPlayStart(0));
  const i = await p.evaluate(() => SYNQUENZER.sx1Info());
  await p.waitForFunction(tS => AU.ctx.currentTime > tS + .5, i.tS, {timeout: 10000});
  await p.evaluate(() => stop()); await p.waitForTimeout(150);
  await p.evaluate(() => songPlayStart(0)); const s = await sample(500); await p.evaluate(() => songPlayEnd(true));
  res.neustart = {g: s.slice(-5).map(x => +x.g.toFixed(3))}; res.neustart.ok = s.slice(-5).every(x => Math.abs(x.g - 1) < 1e-3); ok = ok && res.neustart.ok;
}
await p.waitForTimeout(900);
// 5) Schleife an: kein Ausblenden (der Song hat kein Ende)
{
  await p.evaluate(() => { SYNQUENZER.songSetLoop ? SYNQUENZER.songSetLoop(true) : songSetLoop(true); songPlayStart(0); });
  const s = await sample(7500); await p.evaluate(() => { songPlayEnd(true); songSetLoop(false); });
  res.schleife = {alle1: s.every(x => x.g === 1), spieltNoch: s[s.length - 1].play}; res.schleife.ok = res.schleife.alle1 && res.schleife.spieltNoch; ok = ok && res.schleife.ok;
}
await p.evaluate(() => SYNQUENZER.sx1Fade(0));
res.errors = errs; ok = ok && !errs.length;
console.log(JSON.stringify(res, null, 1)); console.log(ok ? 'OK' : 'FEHLER');
fs.mkdirSync(OUT, {recursive: true}); fs.writeFileSync(OUT + '/t2-sx1-live.json', JSON.stringify(res, null, 1));
await b.close(); process.exit(ok ? 0 : 1);
