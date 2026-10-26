// T4: song punch with real fake mic: overwrite, overdub (alt), insert bars → split vox; alt alignment after split; insert punch; undo
import {launch, open, micOn, waitBeat, idle, sleep, writeWav, tone, concat, pitch, rmsDb, deq, DIR} from './v3-qa-vs3-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const SR = 48000, wav = DIR + '/t4.wav';
writeWav(wav, concat(tone(330, 2, SR), tone(440, 2, SR), tone(550, 2, SR), tone(660, 2, SR)), SR);
const br = await launch(wav);
const H = await open(br), p = H.p;
const sr = await micOn(p);
await p.evaluate(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); });
ok(await p.evaluate(() => SYNQUENZER.setSong({bars: 4, lanes: [[], [], [], [], [], []], carrier: [], mel: {}})), 'song 4 bars');
const T = {clips: false, chords: false, mel: true};
async function punch(o, endBeat) {
  await p.evaluate(o => SYNQUENZER.songRecFrom(o), o);
  await p.waitForFunction(() => SYNQUENZER.runtime().song.play && SYNQUENZER.vsClock().playing, null, {timeout: 5000});
  if (endBeat != null) { await waitBeat(p, endBeat + 0.2); await p.evaluate(b => SYNQUENZER.songRecEnd({beat: b}), endBeat); }
  else await p.waitForFunction(() => !SYNQUENZER.runtime().song.rec, null, {timeout: 30000});
  await sleep(300); await idle(p); await p.evaluate(() => SYNQUENZER.stop()); await sleep(200);
  return p.evaluate(() => SYNQUENZER.tkInfo().vox);
}
const v1 = await punch({from: 0, mode: 'over', targets: T, preroll: false}, 16);
console.log('v1', JSON.stringify(v1));
ok(v1 && v1.length === 1 && v1[0].bar === 0 && v1[0].len === 4, 'first punch → vox bar 0 len 4');
const pc1 = await p.evaluate(id => SYNQUENZER.tkPcmRange(id), v1[0].take), m1 = (await p.evaluate(() => SYNQUENZER.takes()))[v1[0].take];
const segs = []; for (let k = Math.round(v1[0].in * m1.sr); k + 4096 < pc1.length; k += m1.sr) segs.push([Math.round(pitch(pc1.slice(k, k + 4096), m1.sr)), +rmsDb(pc1.slice(k, k + 4096)).toFixed(1)]);
console.log('  take1 per s [Hz,dB]', JSON.stringify(segs));
ok(segs.length >= 7 && segs.every(s => s[1] > -30), 'take 1 holds the mic signal over the whole punch');
// overdub over bars 1-4 (range)
const md = await p.evaluate(() => SYNQUENZER.recModes(0, 4, false)); console.log('  modes', JSON.stringify(md));
const v2 = await punch({from: 0, to: 4, mode: 'overdub', targets: T, preroll: true});
console.log('v2', JSON.stringify(v2));
ok(v2 && v2.length === 1 && v2[0].alt && v2[0].alt[0].take === v1[0].take, 'overdub → new take on top, old in alt');
// insert 1 empty bar at bar 3 (index 2) → splits the vox
const before = await p.evaluate(() => SYNQUENZER.project().song);
ok(await p.evaluate(() => SYNQUENZER.songRange('insertEmpty', 2, 2)), 'insert 1 empty bar at bar 3');
const v3 = await p.evaluate(() => SYNQUENZER.tkInfo().vox); console.log('v3', JSON.stringify(v3));
const right = v3.find(v => v.bar === 3);
ok(right && Math.abs(right.in - (v2[0].in + 2 * 2)) < 1e-3, 'right part top take starts 2 bars (4 s) into its take: in ' + (right && right.in) + ' vs ' + (v2[0].in + 4));
ok(right && right.alt && Math.abs(right.alt[0].in - (v2[0].alt[0].in + 4)) < 1e-3, 'right part ALT take also trimmed to the same place: alt.in ' + (right && right.alt && right.alt[0].in) + ' expected ' + (v2[0].alt[0].in + 4));
// A/B on the right part → what plays at bar 4 is the old take from its 3rd bar?
await p.evaluate(id => SYNQUENZER.tkPick({vox: id}, 1), right.id);
const v4 = await p.evaluate(() => SYNQUENZER.tkInfo().vox), r4 = v4.find(v => v.bar === 3);
console.log('  after A/B right part:', JSON.stringify(r4));
ok(r4 && r4.take === v1[0].take && Math.abs(r4.in - (v1[0].in + 4)) < 1e-3, 'after A/B the old take plays from the same song position (in ' + (r4 && r4.in) + ', expected ' + (v1[0].in + 4) + ')');
// audible check: play song from bar 4 (index 3) and look at the pitch heard
await p.evaluate(() => { window.__tap(); SYNQUENZER.songPlay(3); });
await sleep(1200);
const heard = await p.evaluate(() => window.__lvl()); await p.evaluate(() => SYNQUENZER.stop());
// expected = take1 content at in+4 s
const k = Math.round((v1[0].in + 4 + 0.6) * m1.sr), want = pitch(pc1.slice(k, k + 4096), m1.sr), wrong = pitch(pc1.slice(Math.round((v1[0].in + 0.6) * m1.sr), Math.round((v1[0].in + 0.6) * m1.sr) + 4096), m1.sr);
console.log('  heard at bar 4:', heard.peakHz.toFixed(0), 'Hz (', heard.rmsDb.toFixed(1), 'dB); correct would be', want.toFixed(0), 'Hz, take start is', wrong.toFixed(0), 'Hz');
ok(Math.abs(heard.peakHz - want) < 15, 'A/B alt at bar 4 sounds the right part of the old take');
ok(!H.errs.length, 'no console errors ' + JSON.stringify(H.errs.slice(0, 3)));
await br.close();
console.log(fail ? fail + ' FAIL' : 'all ok');
