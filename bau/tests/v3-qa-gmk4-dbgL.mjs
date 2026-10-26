import {open, sleep, OUT} from './v3-qa-gmk4-tl.mjs';
const T = await open({viewport: {width: 926, height: 428}}); const {p, E, errs} = T;
await T.openEd(0);
const mkb = await T.rectText('button', /^MS ?2000$/); if (mkb) await T.tap(mkb.cx, mkb.cy, 800);
await T.w2(/^6 DELAY/);
await T.knobList('k1', /^an$/);
await T.knobList('k2', /^1\/8$/);
const r = await T.mk('k3'); console.log('k3', JSON.stringify(r));
console.log('elAt', await E(([x, y]) => { const e = document.elementFromPoint(x, y); return e && (e.className + ' ' + (e.dataset && e.dataset.k)); }, [r.cx, r.cy]));
for (const dy of (process.argv[2] ? process.argv[2].split(",").map(Number) : [-95, -60, -40])) {
  await E(() => { window.__ev = []; for (const t of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'touchcancel']) document.addEventListener(t, e => window.__ev.push(t + ':' + (e.target.className || e.target.tagName)), {capture: true, once: false}); });
  await T.sweep('k3', dy, 20, 20);
  console.log(dy, 'dep', await E(() => SYNQUENZER.mkGet(0).dly.dep), 'u', await T.undoN(), 'pop', await T.pop(), 'ev', JSON.stringify(await E(() => { const a = window.__ev; const out = []; for (const x of a) if (out[out.length - 1] !== x) out.push(x); return out.slice(0, 12); })));
  await T.closePop();
}
await p.screenshot({path: OUT + 'dbgL.png'});
console.log(JSON.stringify(errs));
await T.br.close();
