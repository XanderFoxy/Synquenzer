import { chromium } from 'playwright';
const F = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/n5-br-V/index.html';
const b = await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport:{width:390,height:844}});
const errs=[]; p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://'+F); await p.waitForTimeout(1500);
const r = await p.evaluate(() => {
  const A = window.SYNQUENZER; 
  return {keys: Object.keys(A).join(' '), song: S.song ? {bars: S.song.bars, marks: S.song.marks.length, lanes: S.song.lanes.length, loop: S.song.loop, bpm: S.bpm, vox: S.song.vox} : null, nt: NT(), tracks: S.tracks.map(t=>t.name+':'+t.kind+':'+(t.sound&&t.sound.engine))};
});
console.log(JSON.stringify(r, null, 1).slice(0, 6000)); console.log(errs);
await b.close();
