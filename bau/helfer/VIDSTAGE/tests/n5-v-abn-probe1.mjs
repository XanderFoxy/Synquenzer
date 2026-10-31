import { open } from './n5-v-abn-lib.mjs';
const {b, p, errs} = await open();
console.log(JSON.stringify(await p.evaluate(() => ({eng: S.tracks.map(t => t.sound && t.sound.engine), keys: Object.keys(SYNQUENZER).filter(k => /engine|Engine|preset|Preset|mk|fm|tk/i.test(k)).slice(0, 80)}))));
await b.close();
