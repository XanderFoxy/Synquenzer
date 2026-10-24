// QA group: first ▶ SONG after opening a project file in a fresh page – is the downbeat (beat 0) played on every track?
import {open, OUT, check, done} from './v3-qa-grp-lib.mjs';
import fs from 'fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const file = fs.readdirSync(OUT).filter(f => f.startsWith('export-')).map(f => OUT + f).pop();
const mic = process.argv[2] === 'mic', how = process.argv[3] || 'api';
const H = await open({mic, file: process.argv[4] || undefined});
await H.p.setInputFiles('#fileIn', file); await sleep(1500);
const run = async () => { await H.E(() => SYNQUENZER.stop()); await sleep(1300); await H.E(() => { SYNQUENZER.setBpm(140); SYNQUENZER.clearLog(); SYNQUENZER.songLoop(false); });
  if (how === 'api') await H.E(() => SYNQUENZER.songPlay(0)); else if (how === 'scene') await H.E(() => SYNQUENZER.launchScene(0)); else { await H.E(() => SYNQUENZER.songView(true)); await sleep(200); const b = await H.E(() => { const r = document.querySelector('.sv-play').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }); await H.p.touchscreen.tap(b[0], b[1]); }
  await H.p.waitForFunction(() => audBeat() >= 4.2, null, {timeout: 30000, polling: 20});
  return H.E(() => SYNQUENZER.noteLog(4096).filter(n => n.beat != null && n.beat < 4).map(n => [n.track, +n.beat.toFixed(2), n.out])); };
const a = await run(), b = await run();
console.log('first ', JSON.stringify(a)); console.log('second', JSON.stringify(b));
const d0 = x => x.filter(n => n[1] === 0).map(n => n[0]).sort().join(',');
check(`${mic ? 'mic-init' : 'plain'}/${how}: first ▶ SONG plays the same downbeat as the second`, d0(a) === d0(b), {first: d0(a), second: d0(b)});
console.log('errs', H.errs); await H.br.close(); done();
