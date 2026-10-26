// multi-touch: hold a chord on the keyboard, tap TIMBRE (HALTEN) with another finger
import {open, sleep, OUT} from './v3-qa-gmk7-tl.mjs';
import {setupProject} from './v3-qa-gmk7-setup.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
const log = (...a) => console.log(...a);
await setupProject(E);
await E(() => { SYNQUENZER.setEngine(2, 'mk'); SYNQUENZER.mkSet(2, 'mode', 3); SYNQUENZER.mkIn(2, 'e2', 3); SYNQUENZER.launchScene(0); SYNQUENZER.play(); });
await T.openEd(2); await sleep(1500);
await E(() => { window.__pe = []; for (const ty of ['pointerdown', 'pointerup', 'pointercancel', 'touchstart', 'touchend', 'touchcancel']) document.addEventListener(ty, e => window.__pe.push(ty + ':' + (e.pointerId != null ? e.pointerId : (e.changedTouches ? [...e.changedTouches].map(t => t.identifier).join('/') : '')) + ':' + (e.target.closest && e.target.closest('[data-k]') ? e.target.closest('[data-k]').dataset.k : e.target.id || e.target.className)), true); });
const mode = process.argv[2] || 'multi';
const ks = [await T.key(0), await T.key(4), await T.key(7)], tb = await T.mk('timbre');
const chordPts = ks.map((k, j) => ({x: k.cx, y: k.cy, id: 10 + j}));
if (mode === 'multi') {
  await T.send('touchStart', chordPts); await sleep(400);
  await T.send('touchStart', chordPts.concat([{x: tb.cx, y: tb.cy, id: 30}])); await sleep(60); await T.send('touchEnd', [{x: tb.cx, y: tb.cy, id: 30}]); await sleep(1500);
  log('lcd', await T.lcd2(), 'hold', JSON.stringify((await T.pm(2)).voc.hold), 'voices', (await E(() => SYNQUENZER.runtime().liveVoices)));
  await T.send('touchEnd', []); await sleep(300);
} else {
  await T.tapMk('timbre', 1500);
  log('lcd', await T.lcd2(), 'hold', JSON.stringify((await T.pm(2)).voc.hold));
}
log('events', JSON.stringify(await E(() => window.__pe)));
log('errs', errs);
await T.br.close();
