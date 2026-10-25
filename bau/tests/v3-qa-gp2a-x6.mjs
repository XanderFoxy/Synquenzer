import {open, OUT, sleep} from './v3-qa-gp2a-lib.mjs';
import fs from 'fs';
const T = await open({mic: false}); const {p, E, errs} = T;
const pj = JSON.parse(fs.readFileSync(OUT + 'flow-P1-proj4.json'));
await E(pj => SYNQUENZER.importJSON(JSON.stringify({app: 'SYNQUENZER', kind: 'project', format: 4, project: pj})), pj); await sleep(400);
await E(() => SYNQUENZER.songView(true)); await sleep(300);
// tap the STROPHE mark over T4
let inf = await T.info(); console.log('marks', JSON.stringify(inf.marks));
await T.tap(inf.canvas.x + 3 * 36 + 12 - inf.x0, inf.canvas.y + 9); await sleep(300);
console.log('pop', await T.pop(), JSON.stringify(await T.popTexts()));
await T.shot('x6-msheet');
await T.tapPop(/^×2/); await sleep(400);
console.log('undo', JSON.stringify(await T.undoTop()), 'bars', await E(() => SYNQUENZER.song().bars), JSON.stringify((await T.info()).marks.map(m => m.label + '@' + m.a)));
console.log('pop after', await T.pop());
await T.shot('x6-x2');
// close sheet if any
if (await T.pop()) { await T.tapPop(/^✕$/); await sleep(200); }
// tap bar number 2 in the ruler (T2 is inside STR′ mark) → choose first tap on ruler
inf = await T.info();
await T.tap(inf.canvas.x + 1 * 36 + 18 - inf.x0, inf.canvas.y + 9); await sleep(300);
console.log('after tap ruler T2', JSON.stringify({sel: (await T.info()).sel, mark: (await T.info()).mark}), await T.pop());
await T.tap(inf.canvas.x + 1 * 36 + 18 - inf.x0, inf.canvas.y + 9); await sleep(300);
console.log('after 2nd tap', JSON.stringify({sel: (await T.info()).sel, mark: (await T.info()).mark}), await T.pop());
await T.shot('x6-sel');
if (await T.pop()) { await T.tapPop(/^✕$/); await sleep(200); }
await T.tapSel('.sv-rec'); await sleep(300);
console.log('rstart', await T.pop(), JSON.stringify(await T.popTexts()));
console.log(JSON.stringify(await E(() => [...document.querySelectorAll('.pop.rstart button')].map(b => b.className + '|' + (b.dataset.m || '') + '|' + b.textContent.trim()))));
await T.shot('x6-rstart');
console.log('errs', errs);
await T.br.close();
