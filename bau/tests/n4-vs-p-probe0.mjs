import {chromium} from 'playwright';
const F = process.argv[2];
const br = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await (await br.newContext({viewport: {width: 390, height: 844}})).newPage();
p.on('pageerror', e => console.log('ERR', String(e)));
await p.goto('file://' + F); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version);
const r = await p.evaluate(() => {
  SYNQUENZER.loadDemo();
  return {v: VERSION, bpm: S.bpm, n: S.tracks.length, tracks: S.tracks.map((t, i) => ({i, name: t.name, kind: t.kind, eng: t.sound && t.sound.engine, vol: t.sound && t.sound.fx && t.sound.fx.vol, rev: t.sound && t.sound.fx && t.sound.fx.rev, clips: t.clips.map(c => c ? c.len : 0).join(','), mute: t.mute})), master: S.fxBus && S.fxBus.master, scenes: typeof N_SCN !== 'undefined' ? N_SCN : null, ST_SEC: typeof ST_SEC !== 'undefined' ? ST_SEC : null};
});
console.log(JSON.stringify(r, null, 1));
await br.close();
