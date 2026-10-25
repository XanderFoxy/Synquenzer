import {open, OUT, sleep} from './v3-qa-gp2a-lib.mjs';
import fs from 'fs';
const T = await open({mic: false}); const {p, E, errs} = T;
const proj = JSON.parse(fs.readFileSync(OUT + 'flow-P1-final.json', 'utf8'));
await E(s => SYNQUENZER.importJSON(s), JSON.stringify(proj)); await sleep(400);
await E(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); SYNQUENZER.songLoop(true); SYNQUENZER.songView(true); }); await sleep(250);
await T.tapSel('.sv-home'); await sleep(100);
await T.tapSel('.sv-play');
for (const b of [3, 6, 10, 14]) { await p.waitForFunction(x => audBeat() >= x, b * 4, {timeout: 60000}); const i = await T.info(); console.log('bar', b, 'x0', i.x0, 'pos', i.pos, JSON.stringify(i.marks.map(m => [m.label, m.x0, m.x1]))); await T.shot('x9-bar' + b); }
await E(() => SYNQUENZER.songPlay(false));
await T.br.close();
