import {open, OUT, sleep} from './v3-qa-gp2a-lib.mjs';
import fs from 'fs';
const T = await open({mic: false}); const {p, E, errs} = T;
const pj = JSON.parse(fs.readFileSync(OUT + 'flow-P1-proj4.json'));
const LOAD = async () => { await E(pj => SYNQUENZER.importJSON(JSON.stringify({app: 'SYNQUENZER', kind: 'project', format: 4, project: pj})), pj); await sleep(300); await E(() => SYNQUENZER.songView(true)); await sleep(300); };
const tryLift = async (label, wait = 0) => { await sleep(wait); const inf = await T.info(); const m = inf.marks.find(x => x.label === label); const sx = inf.canvas.x + Math.max(m.x0, 4) + 20, sy = inf.canvas.y + 9; await T.down(sx, sy); await sleep(520); const d = (await T.info()).drag; const g = await E(() => !!document.querySelector('.drg-ghost')); await T.up(); await sleep(300); const pp = await T.pop(); if (pp) { await T.tapTxt('#popLayer .pop button', /^✕$/); await sleep(200); } return {label, x: sx, lifted: !!d, g, pop: pp}; };
await LOAD();
console.log('fresh', JSON.stringify(await tryLift('STROPHE')));
console.log('fresh again', JSON.stringify(await tryLift('STROPHE')));
console.log('fresh REFRAIN', JSON.stringify(await tryLift('REFRAIN')));
await LOAD();
// move REFRAIN by drag
let inf = await T.info(); let m = inf.marks.find(x => x.label === 'REFRAIN');
await T.down(inf.canvas.x + m.x0 + 6, inf.canvas.y + 9); await sleep(500); await T.glide(inf.canvas.x + m.x0 + 6, inf.canvas.y + 9, inf.canvas.x + 2, inf.canvas.y + 50, 12, 16); await T.up(); await sleep(500);
console.log('moved', JSON.stringify(await T.undoTop()));
console.log('after move STROPHE', JSON.stringify(await tryLift('STROPHE')));
console.log('after move +2s STROPHE', JSON.stringify(await tryLift('STROPHE', 2000)));
console.log('after move REFRAIN', JSON.stringify(await tryLift('REFRAIN')));
// a cell hold after the move
const c = await T.cell('S1', 5); await T.down(c.x, c.y); await sleep(520); const cl = (await T.info()).cell; await T.up(); await sleep(300); console.log('cell hold after move', JSON.stringify(cl), await T.pop());
if (await T.pop()) { await T.tapTxt('#popLayer .pop button', /Abbrechen|^✕$/); await sleep(200); }
// key drag from the clip view after the move
await T.tapSel('.sv-sw'); await sleep(300);
const k = await E(() => { const k = document.querySelectorAll('#partBar .pk')[0]; const r = k.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2}; });
await T.down(k.cx, k.cy); await sleep(500); const kg = await E(() => !!document.querySelector('.drg-ghost')); await T.up(); await sleep(300); console.log('key lift after move', kg, await T.pop());
console.log('errs', errs);
await T.br.close();
