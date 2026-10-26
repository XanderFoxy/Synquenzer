import {open, sleep, OUT} from './v3-qa-gmk4-tl.mjs';
const L = process.argv[2] !== 'P';
const T = await open({viewport: L ? {width: 926, height: 428} : {width: 428, height: 926}}); const {p, E, errs} = T;
await T.openEd(0);
const mkb = await T.rectText('button', /^MS ?2000$/); if (mkb) await T.tap(mkb.cx, mkb.cy, 800);
await T.w2(/^6 DELAY/);
await E(() => { window.__ev = []; for (const t of ['touchstart', 'touchend', 'pointerdown', 'pointerup', 'pointercancel', 'touchcancel']) window.addEventListener(t, e => window.__ev.push([Math.round(performance.now()), t, (typeof e.target.className === 'string' ? e.target.className : e.target.tagName).slice(0, 30), e.pointerType || '', e.pointerId || '', e.isPrimary]), {capture: true}); });
const wait = +(process.argv[3] || 150);
for (let k = 0; k < 4; k++) {
  await E(() => window.__ev.length = 0);
  await T.tapMk('k1', 300); await T.tapPop(k % 2 ? /^aus$/ : /^an$/, 0); await sleep(wait);
  const kn = await T.panel(); const lab = kn.knobs[2] && kn.knobs[2].l;
  const d0 = await E(() => SYNQUENZER.mkGet(0).dly.dep);
  await T.sweep('k3', -40, 10, 20);
  const d1 = await E(() => SYNQUENZER.mkGet(0).dly.dep);
  console.log('sync', k % 2 ? 'aus' : 'an', 'k2', lab, 'dep', d0, '→', d1, JSON.stringify(await E(() => window.__ev.map(x => x.join(':')))));
  await E(() => SYNQUENZER.mkSet(0, 'dly.dep', 0)); await sleep(300);
}
await T.br.close();
