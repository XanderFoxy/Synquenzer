// VV1-03: a song with Träger chords (carrier), song transposition and a MELODIE line – notes live vs offline (pitch after mapping, beat, velocity)
import { open, OUT } from './n5-v-abn-lib.mjs';
import { lufs, pcmOf } from './n5-v-lufs.mjs';
const {b, p, errs} = await open();
const setup = await p.evaluate(() => {
  const Q = SYNQUENZER, ch = c => Q.parseChord(c);
  const mel = []; for (let k = 0; k < 28; k++) mel.push({t: k + .5, d: .5, n: 72 + [0, 2, 4, 5, 7, 5, 4, 2][k % 8], v: .8});
  Q.setSong({bars: 8, lanes: [[{bar: 0, slot: 0}], [{bar: 0, slot: 0}], [{bar: 2, slot: 0}], [], [{bar: 0, slot: 0}, {bar: 4, slot: 1}], []],
    carrier: [{beat: 0, target: ch('C')}, {beat: 8, target: ch('Am')}, {beat: 16, target: ch('F')}, {beat: 24, target: ch('G')}], mel: {5: {notes: mel}}, marks: [{id: 'm1', a: 0, len: 4, name: 'Strophe'}, {id: 'm2', a: 4, len: 4, name: 'Refrain'}]});
  return {carrier: S.song.carrier.length, mel: S.song.mel[5] && S.song.mel[5].notes.length, xp: S.song.xp};
});
const notes = log => log.filter(e => e.src !== 'click').map(e => [e.track, e.src === 'own' ? 'clip' : e.src, e.out, +(+e.beat).toFixed(3), e.vel]).sort((a, b) => a[3] - b[3] || a[0] - b[0] || a[2] - b[2]);
const res = {setup};
for (const run of [1, 2]) {
  const lv = await p.evaluate(async () => { clearLog(); songPlayStart(0); await new Promise(res => { const iv = setInterval(() => { if (!R.playing) { clearInterval(iv); res(); } }, 10); }); return noteLog(4096); });
  const of = await p.evaluate(async () => (await SYNQUENZER.vvRender()).log);
  const nl = notes(lv), no = notes(of);
  const d = []; for (let k = 0; k < Math.max(nl.length, no.length) && d.length < 5; k++) if (JSON.stringify(nl[k]) !== JSON.stringify(no[k])) d.push([nl[k], no[k]]);
  res['run' + run] = {live: nl.length, off: no.length, same: JSON.stringify(nl) === JSON.stringify(no), melLive: nl.filter(x => x[0] === 5).length, melOff: no.filter(x => x[0] === 5).length, firstDiffs: d};
  await p.waitForTimeout(1500);
}
res.errs = errs; console.log(JSON.stringify(res, null, 1)); await b.close();
