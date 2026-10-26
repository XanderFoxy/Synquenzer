import {open, sleep, OUT} from './v3-qa-gmk4-tl.mjs';
const L = process.argv[2] !== 'P';
const T = await open({viewport: L ? {width: 926, height: 428} : {width: 428, height: 926}}); const {p, E, errs} = T;
await T.openEd(0);
const mkb = await T.rectText('button', /^MS ?2000$/); if (mkb) await T.tap(mkb.cx, mkb.cy, 800);
await T.w2(/^6 DELAY/);
await E(() => { window.__ev = []; for (const t of ['touchstart', 'pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'touchcancel', 'click']) document.addEventListener(t, e => window.__ev.push([Math.round(performance.now()), t, (typeof e.target.className === 'string' ? e.target.className : e.target.tagName).slice(0, 30)]), {capture: true}); });
for (const wait of [0, 100, 200, 300, 450, 600, 900]) {
  await T.tapMk('k2', 300); await T.tapPop(/^1\/8$/, 0); const tl = await E(() => performance.now());
  await sleep(wait);
  const d0 = await E(() => SYNQUENZER.mkGet(0).dly.dep);
  await E(() => window.__ev.length = 0);
  await T.sweep('k3', -40, 10, 20);
  const d1 = await E(() => SYNQUENZER.mkGet(0).dly.dep);
  const ev = await E(() => window.__ev.map(x => x[1] + ':' + x[2]).filter((x, i, a) => a[i - 1] !== x).slice(0, 6));
  console.log('wait', wait, 'dep', d0, '→', d1, 'popOpen', await E(() => !!document.querySelector('#popLayer.open')), JSON.stringify(ev));
  await E(() => SYNQUENZER.mkSet(0, 'dly.dep', 0)); await sleep(300);
}
console.log(JSON.stringify(errs));
await T.br.close();
