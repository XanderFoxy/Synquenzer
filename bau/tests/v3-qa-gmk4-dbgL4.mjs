import {open, sleep, OUT} from './v3-qa-gmk4-tl.mjs';
const L = process.argv[2] !== 'P';
const T = await open({viewport: L ? {width: 926, height: 428} : {width: 428, height: 926}}); const {p, E, errs} = T;
await T.openEd(0);
const mkb = await T.rectText('button', /^MS ?2000$/); if (mkb) await T.tap(mkb.cx, mkb.cy, 800);
await T.w2(/^6 DELAY/);
await T.knobList('k1', /^an$/);
await E(() => { window.__ev = []; for (const t of ['touchstart', 'touchend', 'pointerdown', 'pointerup', 'pointercancel', 'touchcancel']) window.addEventListener(t, e => window.__ev.push([Math.round(performance.now()), t, (typeof e.target.className === 'string' ? e.target.className : e.target.tagName).slice(0, 30), e.pointerType || '', e.pointerId || '']), {capture: true}); });
const wait = +(process.argv[3] || 150);
const notes = [/^1\/8$/, /^1\/4$/, /^3\/16$/, /^1\/16$/];
for (let k = 0; k < 4; k++) {
  await E(() => window.__ev.length = 0);
  await T.tapMk('k2', 300); const pt = await T.popTexts(); const hit = await T.tapPop(notes[k], 0); await sleep(wait);
  const d0 = await E(() => SYNQUENZER.mkGet(0).dly);
  const pop = await E(() => { const pl = document.getElementById('popLayer'); return pl ? pl.className + ' ' + getComputedStyle(pl).pointerEvents + ' ' + pl.children.length : null; });
  await T.sweep('k3', -40, 10, 20);
  const d1 = await E(() => SYNQUENZER.mkGet(0).dly.dep);
  console.log('note', notes[k], 'hit', !!hit, 'list', pt && pt.length, 'dly', JSON.stringify(d0), '→ dep', d1, 'pop', pop, JSON.stringify(await E(() => window.__ev.map(x => x.join(':')))));
  await E(() => SYNQUENZER.mkSet(0, 'dly.dep', 0)); await sleep(300);
}
await T.br.close();
