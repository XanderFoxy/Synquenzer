// H3 Abnahme H-20 … H-23: Klick beim Singen „Nur Einzähler“. node h3.mjs <index.html> [basis.html]
import {open, micOn, g10demo, closeAll, sleep, log, waitBeat, T, FMT, platz} from './h-lib.mjs';
const FILE = process.argv[2], OLD = process.argv[3], ok = T();
const free = p => p.evaluate(() => { for (let i = 0; i < NT(); i++) { R.slot[i] = -1; R.pend[i] = null; } });
async function run(file, o) {   // o: {mic, track, metro, vc, bars}
  const H = await open(file), p = H.p; await g10demo(p); if (o.mic) await micOn(p); await free(p);
  await p.evaluate(o => { if (o.vc) setVocClick(o.vc); SYNQUENZER.setMetronome(!!o.metro); SYNQUENZER.selectSlot(o.track === 'st' ? SYNQUENZER.tkInfo().stimme : o.track, 0); SYNQUENZER.clearLog(); SYNQUENZER.rec(); }, o);
  await waitBeat(p, o.bars * 4 - 3.7); await p.evaluate(() => SYNQUENZER.rec()); await waitBeat(p, o.bars * 4 + 2.5);
  const L = await log(p), r = await p.evaluate(() => SYNQUENZER.runtime().rec);
  await H.close();
  return {clicks: L.filter(e => e.src === 'click').map(e => ({b: Math.round(e.beat * 100) / 100, a: e.out})), errs: H.errs};
}
const inT = (c, a, b) => c.filter(x => x.b >= a - 1e-6 && x.b < b - 1e-6);
{
  const r = await run(FILE, {mic: true, track: 'st', bars: 2});
  const ci = inT(r.clicks, -4, 0), tk = inT(r.clicks, 0, 8);
  ok('H-20 Standard: genau 4 Klicks auf −4…−1, Betonung auf −4', ci.length === 4 && ci.map(x => x.b).join() === '-4,-3,-2,-1' && ci[0].a === 1 && ci.slice(1).every(x => !x.a), JSON.stringify(ci));
  ok('H-20 Standard: 0 Klicks im Take [0, Ende)', tk.length === 0, JSON.stringify(tk));
  ok('H-20 Konsole', !r.errs.length, r.errs.join('|').slice(0, 200));
}
{
  const r = await run(FILE, {mic: true, track: 'st', bars: 2, vc: 'always'}), tk = inT(r.clicks, 0, 8);
  ok('H-21 „Immer“: Klick auf jedem Schlag des Takes', tk.length === 8 && tk.every((x, k) => x.b === k), tk.map(x => x.b).join());
  const m1 = await run(FILE, {mic: true, track: 'st', bars: 2, metro: true}), m2 = await run(FILE, {mic: true, track: 'st', bars: 2, metro: true, vc: 'always'});
  ok('H-21 ♩ an: jeder Schlag in beiden Fällen', inT(m1.clicks, 0, 8).length === 8 && inT(m2.clicks, 0, 8).length === 8, inT(m1.clicks, 0, 8).length + ' / ' + inT(m2.clicks, 0, 8).length);
}
{
  const n = await run(FILE, {mic: false, track: 3, bars: 2});
  const exp = [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7];
  let same = JSON.stringify(inT(n.clicks, -4, 8).map(x => x.b)) === JSON.stringify(exp), info = inT(n.clicks, -4, 8).map(x => x.b).join();
  if (OLD) { const o = await run(OLD, {mic: false, track: 3, bars: 2}); same = same && JSON.stringify(inT(o.clicks, -4, 8)) === JSON.stringify(inT(n.clicks, -4, 8)); info += ' | 4.25.0: ' + inT(o.clicks, -4, 8).map(x => x.b).join(); }
  ok('H-22 MIDI-Take ohne 🎤, metroInRec an: Klicks wie 4.25.0', same, info);
}
{
  const H = await open(FILE), p = H.p; await g10demo(p); await sleep(2000);   // Tonart-Erkennung der neuen Clips abwarten
  const before = await p.evaluate(() => JSON.stringify(SYNQUENZER.state().project));
  await p.evaluate(() => openMenu()); await sleep(400);
  const hit = await p.evaluate(() => { const r = [...document.querySelectorAll('.vclk button')]; const b = r.find(x => x.textContent === 'Immer'); if (!b) return null; b.scrollIntoView({block: 'center'}); return r.length; });
  if (hit) await p.locator('.vclk button', {hasText: 'Immer'}).click();
  const after = await p.evaluate(() => ({pj: JSON.stringify(SYNQUENZER.state().project), vc: UI.vocClick, pref: uiPrefs().vocClick}));
  ok('H-23 Menüzeile „Klick beim Singen“ schaltet, Projekt unverändert (M-DATA)', hit === 2 && after.vc === 'always' && after.pref === 'always' && after.pj === before, JSON.stringify({hit, vc: after.vc, pref: after.pref, same: after.pj === before}));
  await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000}); await sleep(300);
  ok('H-23 Wahl übersteht Neuladen', await p.evaluate(() => UI.vocClick === 'always'));
  await p.evaluate(() => setVocClick('ci'));
  const bad = [];
  for (const [f, [w, h]] of Object.entries(FMT)) {
    await p.setViewportSize({width: w, height: h}); await sleep(250);
    await p.evaluate(() => openMenu()); await sleep(300);
    await p.evaluate(() => document.querySelector('.vclk').scrollIntoView({block: 'center'})); await sleep(150);
    for (const x of await platz(p, '.vclk button')) bad.push(f + ' Menü: ' + x);
    await p.evaluate(() => { closeMenu(); popRecOpts(); }); await sleep(300);
    await p.evaluate(() => { const s = document.querySelector('#roVc'); s && s.scrollIntoView({block: 'center'}); }); await sleep(100);
    for (const x of await platz(p, '#roVc button')) bad.push(f + ' ●-Blatt: ' + x);
    await p.evaluate(() => closePop()); await sleep(150);
  }
  ok('H-23 M-PLATZ der beiden neuen Zeilen (6 Formate)', !bad.length, bad.join(' | ').slice(0, 400));
  ok('H-23 Konsole', !H.errs.length, H.errs.join('|').slice(0, 200));
  await H.close();
}
await closeAll(); process.exit(ok.sum() ? 1 : 0);
