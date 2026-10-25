import { openVp, mk, SETUP, mkCheck } from './v3-qa-v2e-lib.mjs';
const {b, p, errs, cdp} = await openVp('P1');
const T = mk(p, cdp), {E} = T;
await E(SETUP(true));
console.log(await E(() => JSON.stringify({clips: S.tracks.map(t => t.clips.map(c => !!c)), sc: sceneChunk(0), src: sceneChunk.toString().slice(0, 300), partRefS1: partRef('S1')})));
await b.close();
