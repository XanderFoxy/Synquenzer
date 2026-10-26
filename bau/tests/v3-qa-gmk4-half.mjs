// half views (P3 320x568, L2 667x375): pick DELAY with EDIT-WAHL 2 and drag TIEFE / pick NOTE by touch
import {open, sleep, OUT, check, done} from './v3-qa-gmk4-tl.mjs';
for (const [nm, vp] of [['P3', {width: 320, height: 568}], ['P2', {width: 375, height: 667}], ['L2', {width: 667, height: 375}]]) {
  const T = await open({viewport: vp}); const {p, E, errs} = T;
  T.knobList = async (k, re) => { await T.tapMk(k, 300); const r = await T.tapPop(re); await sleep(600); return r ? 'ok' : 'no list item ' + re + ' ' + JSON.stringify(await T.popTexts()); };
  await T.openEd(0);
  await E(() => { SYNQUENZER.setEngine(0, 'mk'); }); await sleep(300); await T.openEd(0); await sleep(500);
  let pn = await T.panel(); const halfs = [pn.half];
  const vis = k => T.mk(k).then(r => !!r);
  const w2vis = await vis('w2'), k3vis = await vis('k3');
  let w = null; if (w2vis) w = await T.w2(/^6 DELAY/);
  else { await T.tapTxt('.tab, button', /^LINKS$/); await sleep(400); w = await T.w2(/^6 DELAY/); }
  pn = await T.panel(); halfs.push(pn.half);
  if (!(await vis('k3'))) { await T.tapTxt('.tab, button', /^RECHTS$/); await sleep(400); }
  pn = await T.panel(); halfs.push(pn.half);
  const a = await T.knobList('k1', /^an$/); const b = await T.knobList('k2', /^1\/8$/);
  await T.sweep('k3', -80, 15, 20);
  const d = await E(() => SYNQUENZER.mkGet(0).dly); const lcd = await E(() => ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : null);
  await p.screenshot({path: OUT + 'half-' + nm + '.png'});
  check(nm + ' half view: DELAY via EDIT-WAHL 2, T-SYNC an, NOTE 1/8, TIEFE drag (touch)', d.sync === 1 && d.note === 5 && d.dep > 30 && a === 'ok' && b === 'ok', {halfs, w, d, lcd, w2vis, k3vis, errs: errs.slice(0, 3)});
  await T.br.close();
}
done();
