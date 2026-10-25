import { openT, mk, SETUP } from './v3-qa2d2-lib.mjs';
const {b, p} = await openT({width: 390, height: 844}, false);
await p.evaluate(SETUP(false));
const r = await p.evaluate(() => { const Q = window.SYNQUENZER; Q.placePart(0, 2, 'replace'); const s = Q.song(); return {l2: s.lanes[2], marks: s.marks, part: Q.parts()[0].lanes[2]}; });
console.log(JSON.stringify(r));
await b.close();
