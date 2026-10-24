// QA regression: make an old (format 3) project file with the V0a app (3.1.0) and the VS1 app (3.11.5)
import { open } from './v3-v2d-pw.mjs';
import fs from 'fs';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-old/';
for (const v of ['v0a', 'vs1']) {
  const {b, p, errs} = await open({width: 390, height: 844}, D + v + '.html');
  const info = await p.evaluate(async () => {
    const Q = window.SYNQUENZER;
    await Q.loadDemo();
    Q.setBpm(200);
    // a song (WP6 chain) with a chord change, so the file holds clips, song lanes, carrier
    Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}, {scene: 0, bars: 1}]);
    try { Q.songSetChord && Q.songSetChord(1, 'F'); } catch (e) {}
    return {version: Q.version, txt: Q.serialize(), song: Q.song ? Q.song() : null};
  });
  const o = JSON.parse(info.txt);
  console.log(v, 'app', info.version, 'format', o.format, 'appVersion', o.appVersion, 'tracks', o.project.tracks.length, 'song bars', o.project.song && o.project.song.bars, 'errs', errs.filter(e => !/font|net::|Failed to load/.test(e)));
  fs.writeFileSync(D + v + '-project.json', info.txt);
  await b.close();
}
