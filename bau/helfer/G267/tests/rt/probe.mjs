import {launch, openG, sleep, setKey} from './h.mjs';
const br = await launch(null), H = await openG(br), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); });
console.log(await setKey(p, 3, 'ionian'));
console.log(await p.evaluate(() => Object.keys(JSON.parse(SYNQUENZER.serialize()))));
console.log(await p.evaluate(() => [SYNQUENZER.sceneKey(0), SYNQUENZER.project().key, SYNQUENZER.project().tracks.map(t=>t.kind+':'+t.follow)]));
await br.close();
