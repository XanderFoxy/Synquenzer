import {open, sleep, OUT} from './v3-qa-gmk2a-tl.mjs';
const L = process.argv[2] === 'L';
const T = await open({viewport: L ? {width: 926, height: 428} : {width: 428, height: 926}}); const {p, E, errs} = T;
await T.openEd(0);
const mkb = await T.rectText('button', /^MS ?2000$/); await T.tap(mkb.cx, mkb.cy, 800);
await T.tapMk('w1', 300); await T.tapPop(/^3 OSZ 1/); await sleep(300);
await T.tapMk('k0', 300); await T.tapPop(/Speicherwelle/); await sleep(300);
await E(() => { window.__pd = []; document.addEventListener('pointerdown', e => window.__pd.push(e.target.className + '/' + e.pointerType), true); });
await T.tapMk('k2', 400); 
const info = await E(() => { const p = document.querySelector('#popLayer .pop'); const r = p.getBoundingClientRect(); return {r: [r.x, r.y, r.width, r.height].map(Math.round), open: document.getElementById('popLayer').className, W: innerWidth, H: innerHeight}; });
console.log('wave pop', JSON.stringify(info));
await p.screenshot({path: OUT + 'ex4-wave-' + (L ? 'L' : 'P') + '.png'});
for (const [x, y] of [[8, 8], [info.W - 8, info.H - 8], [info.W / 2, info.H - 30]]) {
  const hit = await E(([x, y]) => { const e = document.elementFromPoint(x, y); return e && e.className; }, [x, y]);
  await T.tap(x, y, 700);
  console.log('tap', x, y, 'hit', hit, '→ popLayer', await E(() => document.getElementById('popLayer').className), 'pd', JSON.stringify(await E(() => window.__pd.splice(0))));
}
await T.br.close();
