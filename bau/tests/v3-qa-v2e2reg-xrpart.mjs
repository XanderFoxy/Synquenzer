// QA regression (V2d): a V2c part (slots + 2-bar chord row) that starts a 4-bar clip — V2c-fix vs V2d
import { open, NEW as APP, BASE as BASE0 } from './v3-qa-v2e2reg-pw.mjs';
const BASE = BASE0;
const waitBeat = (p, b, to = 40000) => p.waitForFunction(x => window.SYNQUENZER.runtime().beat > x, b, {timeout: to, polling: 20});
const out = {};
for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: 390, height: 844}, file);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'}, N = (t, n) => ({t, d: .4, n, v: .8});
    // a 4-bar bass line (one note per bar: A, C, D, E) and a 1-bar drum clip
    Q.setClip(0, 0, {len: 4, key: K, notes: [N(0, 45), N(4, 48), N(8, 50), N(12, 52)]});
    Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}]});
    const C = n => Q.parseChord(n);
    Q.setPart(0, {name: 'Strophe', slots: [{s: 0}, null, null, null, {s: 0}, null], chords: {len: 2, ch: [{b: 0, tg: C('Am')}, {b: 4, tg: C('F')}]}});
    Q.clearLog(); Q.launchPart(0); });
  await waitBeat(p, 32.5);
  out[name] = {bass: await p.evaluate(() => window.SYNQUENZER.noteLog(4000).filter(n => n.track === 0 && n.beat != null).map(n => n.beat.toFixed(0) + ':' + n.clipNote)), part: await p.evaluate(() => window.SYNQUENZER.parts()[0]), errs};
  await b.close();
}
console.log('base bass (beat:clipNote):', out.base.bass.join(' '));
console.log('new  bass (beat:clipNote):', out.new.bass.join(' '));
console.log('new part:', JSON.stringify(out.new.part).slice(0, 400));
console.log('errs', JSON.stringify(out.base.errs), JSON.stringify(out.new.errs));
