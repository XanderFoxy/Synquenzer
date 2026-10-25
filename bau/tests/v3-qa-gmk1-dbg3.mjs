import {open, sleep, OUT, check, done, eq} from './v3-qa-gmk1-tl.mjs';
const T = await open(); const {p, E, errs} = T;
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(500);
const mkb = await T.rectText('button', /^MS ?2000$/); await T.tap(mkb.cx, mkb.cy, 700);
const wb = await E(() => { const e = document.querySelector('#mkWh .mkwheel[data-w="bend"] .mwell'); const r = e.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2, h: r.height}; });
const k0 = await T.key(0);
await E(() => { window.__pe = []; for (const t of ['pointerdown', 'pointerup', 'pointercancel']) document.addEventListener(t, e => window.__pe.push(t + ':' + e.pointerId + ':' + (e.target.className || e.target.id || e.target.tagName)), true); });
for (const mode of ['start', 'move']) {
  await T.send('touchStart', [{x: k0.cx, y: k0.cy, id: 1}]); await sleep(100);
  await T.send('touchStart', [{x: k0.cx, y: k0.cy, id: 1}, {x: wb.cx, y: wb.cy, id: 2}]);
  for (let k = 1; k <= 8; k++) { await T.send('touchMove', [{x: k0.cx, y: k0.cy, id: 1}, {x: wb.cx, y: wb.cy - k * 8, id: 2}]); await sleep(16); }
  const b1 = await E(() => SYNQUENZER.mkWheel(0, 'bend'));
  await T.send(mode === 'start' ? 'touchStart' : 'touchMove', [{x: k0.cx, y: k0.cy + 1, id: 1}]); await sleep(250);
  const b2 = await E(() => SYNQUENZER.mkWheel(0, 'bend')); const v2 = await E(() => SYNQUENZER.voices().filter(v => v.state !== 'off').length);
  console.log(mode, 'bend', b1, '→ wheel finger lifted', b2, 'voices', v2, JSON.stringify(await E(() => window.__pe.splice(0))));
  await T.send('touchEnd', []); await sleep(300);
  console.log(' all up', await E(() => SYNQUENZER.mkWheel(0, 'bend')), JSON.stringify(await E(() => window.__pe.splice(0))));
}
await T.br.close();
