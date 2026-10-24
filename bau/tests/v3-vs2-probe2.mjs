import {open} from './v3-vs2-h.mjs';
const {br, p} = await open();
console.log(await p.evaluate(() => ({sk: [0,1,2,3].map(s => SYNQUENZER.sceneKey(s)), key: SYNQUENZER.project().key, selS: SYNQUENZER.runtime().selS, clips: SYNQUENZER.project().tracks.map(t => t.clips.map(c => c ? c.notes.length : 0).join(','))})));
await br.close();
