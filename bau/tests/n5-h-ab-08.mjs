// VC2a-08 Abnahme: 2-s-Reglerzug (echte Touch-Geste via CDP) an verschiedenen Reglertypen -> genau 1 Ereignis mit Kurve <= 50
import { launch, touchDrag, nCur, since, short } from './n5-h-ab-lib.mjs';
const out = [];
async function test(name, setup, findXY) {
  const {b, p, errs} = await launch({mobile: true});
  await p.evaluate(setup.toString().startsWith('async') || true ? `(${setup.toString()})()` : '');
  await p.waitForTimeout(2800); await p.evaluate(() => historyCheck());
  const xy = await p.evaluate(`(${findXY.toString()})()`);
  if (!xy) { out.push({name, err: 'no control'}); await b.close(); return; }
  const n0 = await nCur(p);
  const d = await touchDrag(p, xy[0], xy[1], t => [xy[0], xy[1] - 60 * t - 15 * Math.sin(t * 4 * Math.PI)], 2000);
  await p.waitForTimeout(2800);
  const ev = (await since(p, n0)).filter(e => e.u !== 'ctx');
  const chk = await p.evaluate(() => historyCheck());
  out.push({name, label: xy[2], moves: d.n, ms: d.ms, nData: ev.length, events: ev.map(short), check: chk, errs: errs.slice(0, 3)});
  console.log(JSON.stringify(out[out.length - 1]));
  await b.close();
}
// A) VA-Regler (makeCtl) Synth 4
await test('VA makeCtl', () => { selectTrack(3); SYNQUENZER.openEditor(); },
  () => { const k = [...document.querySelectorAll('#synthSheet .knob')].find(x => { const r = x.getBoundingClientRect(); return r.width > 20 && r.top > 0 && r.bottom < innerHeight; }); if (!k) return null; const r = k.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, k.getAttribute('aria-label')]; });
// B) MS 2000 Platte, Regler f.cut
await test('MS2000 Platte f.cut', async () => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); },
  () => { const e = SYNQUENZER.mkPanel().elements.find(e => e.id === 'f.cut'); return e ? [e.px.x + e.px.w / 2, e.px.y + e.px.h / 2, 'f.cut'] : null; });
// C) Drum-Editor Regler
await test('Drum makeCtl', () => { SYNQUENZER.selectTrack(DRUM_T); SYNQUENZER.openEditor(); },
  () => { const k = [...document.querySelectorAll('#drumSheet .knob, #drumSheet .fader')].find(x => { const r = x.getBoundingClientRect(); return r.width > 20 && r.top > 0 && r.bottom < innerHeight; }); if (!k) return null; const r = k.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, k.getAttribute('aria-label')]; });
console.log('SUMMARY', JSON.stringify(out.map(o => ({name: o.name, n: o.nData, c: o.events && o.events.map(e => e.c), u: o.events && o.events.map(e => e.u), check: o.check}))));
