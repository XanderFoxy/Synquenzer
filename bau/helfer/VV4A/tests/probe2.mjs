import { open, SONG } from './lib.mjs';
const O = '/tmp/claude-0/-home-user-Synquenzer/993410ec-5e46-5708-b50a-74fa5caa208d/scratchpad/out/';
const {b, p, errs} = await open();
await p.evaluate(s => SYNQUENZER.setSong(s), SONG);
console.log(await p.evaluate(() => { SYNQUENZER.songSetChord(1, 'Am'); SYNQUENZER.songSetChord(2, 'F'); S.song.xp = [{beat: 12, semi: 2}, {beat: 20, semi: 0}]; return JSON.stringify(S.song.carrier); }));
await p.evaluate(() => { setKbMode('transpose'); }); await p.waitForTimeout(200);
await p.evaluate(() => SYNQUENZER.songPlay && SYNQUENZER.songPlay(0));
for (const [k, ms] of [['a', 2600], ['b', 2200], ['c', 2400]]) { await p.waitForTimeout(ms);
  console.log(k, await p.evaluate(() => JSON.stringify({sb: songBeatOf(audBeat()), lt: [...document.querySelectorAll('#kb .key.lt')].map(e => [...KB.byNote].find(x => x[1].el === e)[0]), ink: [...document.querySelectorAll('#kb .key.inkey')].length, car: document.getElementById('carVal').textContent, sh: document.getElementById('carShift').textContent, tg: document.getElementById('carTgt').textContent, xp: xpNow()})));
  await p.screenshot({path: O + 'play-' + k + '.png'}); }
console.log(errs); await b.close();
