import {launch, open} from './v3-mkp-lib.mjs';
const b = await launch(); const page = await open(b, process.argv[2], 'P1');
console.log(await page.evaluate(() => { const L = stepList(0); const r = {n: L.length, ids: L.slice(0, 5).map(x => [x.id, x.name, x.engine]), eng: S.tracks[0].sound.engine, origin: S.tracks[0].sound.origin};
  MKUI.mkPanelProg('step', 1); r.after = [S.tracks[0].sound.engine, S.tracks[0].sound.name, S.tracks[0].sound.origin]; return JSON.stringify(r); }));
await b.close();
