import {open, OUT, sleep} from './v3-qa-gp2a-lib.mjs';
import fs from 'fs';
const T = await open({mic: false}); const {p, E, errs} = T;
const pj = JSON.parse(fs.readFileSync(OUT + 'flow-P1-proj4.json'));
const LOAD = async () => { await E(pj => SYNQUENZER.importJSON(JSON.stringify({app: 'SYNQUENZER', kind: 'project', format: 4, project: pj})), pj); await sleep(300); await E(() => SYNQUENZER.songView(true)); await sleep(300); };
const copyDrag = async (label, dx = 20) => {
  const inf = await T.info(); const m = inf.marks.find(x => x.label === label); const sx = inf.canvas.x + Math.max(m.x0, 4) + dx, sy = inf.canvas.y + 9;
  const u0 = await T.undoN();
  await T.down(sx, sy); await sleep(500); await T.glide(sx, sy, sx, sy + 30, 4, 16);
  const d1 = (await T.info()).drag;
  const cp = await T.rect('.sv-sw'); await T.glide(sx, sy + 30, cp.cx, cp.cy, 8, 16); await sleep(320);
  const d2 = (await T.info()).drag;
  const i2 = await T.info(); await T.glide(cp.cx, cp.cy, i2.canvas.x + 8 * 36 - i2.x0 + 3, i2.canvas.y + 120, 12, 16);
  const d3 = (await T.info()).drag;
  await T.up(); await sleep(500);
  const pp = await T.pop(); if (/plsheet/.test(pp || '')) { await T.tapPop(/^Einfügen/); await sleep(300); }
  return {label, sx, d1: d1 && d1.st, d2: d2 && {copy: d2.copy}, d3: d3 && {n: d3.n, copy: d3.copy}, pop: pp, did: (await T.undoN()) - u0, top: (await T.undoTop() || {}).label};
};
await LOAD();
console.log('fresh', JSON.stringify(await copyDrag('STROPHE')));
await LOAD();
console.log('fresh dx=164', JSON.stringify(await copyDrag('STROPHE', 164)));
await LOAD();
let inf = await T.info(); let m = inf.marks.find(x => x.label === 'REFRAIN');
await T.down(inf.canvas.x + m.x0 + 6, inf.canvas.y + 9); await sleep(500); await T.glide(inf.canvas.x + m.x0 + 6, inf.canvas.y + 9, inf.canvas.x + 2, inf.canvas.y + 50, 12, 16); await T.up(); await sleep(500);
console.log('moved', JSON.stringify(await T.undoTop()));
console.log('after move', JSON.stringify(await copyDrag('STROPHE')));
await T.br.close();
