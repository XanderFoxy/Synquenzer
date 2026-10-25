import { openVp, T, SETUP55, sleep } from './v3-qa-v2e2-lib.mjs';
const {b, p} = await openVp('P1'); const E = (f, a) => p.evaluate(f, a);
await E(SETUP55(true));
await E(() => window.SYNQUENZER.makeOwn(0, 4));
const SA = await E(() => JSON.stringify(window.SYNQUENZER.song()));
await E(() => window.SYNQUENZER.makeOwn(0, 8)); await E(() => window.SYNQUENZER.undo());
console.log('after undo b eq', await E(() => JSON.stringify(window.SYNQUENZER.song())) === SA);
console.log(await E(() => { const r = window.SYNQUENZER.makeOwn(0, 8, true); return [r, JSON.stringify(S.song.lanes[0]), Object.keys(S.song.own)]; }));
await E(() => window.SYNQUENZER.undo());
const SB = await E(() => JSON.stringify(window.SYNQUENZER.song()));
console.log(SA === SB); if (SA !== SB) { console.log(SA.slice(0, 900)); console.log(SB.slice(0, 900)); }
await b.close();
