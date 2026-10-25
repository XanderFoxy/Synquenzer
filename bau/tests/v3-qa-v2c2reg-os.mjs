// QA regression V2c′: record / FANG under a Träger (as played?), stop + voice cleanup, defaults on every load path,
// settings roundtrip; base (VS2b-fix 4.5.2) vs new (4.5.3, Eine Skala on for new projects)
import { open, APP } from './v3-v2d-pw.mjs';
import fs from 'fs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/VS2b-fix.html';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/';
const only = process.argv[2] ? process.argv[2].split(',') : null;
const waitBeat = (p, b, to = 40000) => p.waitForFunction(x => window.SYNQUENZER.runtime().beat > x, b, {timeout: to, polling: 10});
const setup = () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(200); const K = {root: 9, scale: 'aeolian'};
  Q.setClip(0, 0, {len: 1, key: K, notes: [0, 1, 2, 3].map(t => ({t, d: .5, n: [45, 48, 52, 48][t], v: .8}))});
  Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 2, d: .1, n: 38, v: .9}]}); return {key: Q.project().key, h: Q.runtime().harmony}; };
const scen = {
  // ● record on track 2 while a latched Träger F is active (TRANSPONIEREN → chord, back to SPIELEN), then the take plays
  recCar: async (p, notes) => { const info = await p.evaluate(setup);
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setKbMode('transpose'); Q.launchScene(0); });
    await waitBeat(p, 1); await p.evaluate(() => window.SYNQUENZER.chord([65, 69, 72], 250)); await waitBeat(p, 3);
    const car = await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setKbMode('play'); const c = Q.runtime().carrier; return {c: c && c.name, kb: Q.kbScaleNow ? Q.kbScaleNow() : null}; });
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setRecOptions({countIn: 0, length: 2, quantize: '1/16'}); Q.selectSlot(2, 0); Q.rec(); });
    await p.waitForFunction(() => window.SYNQUENZER.runtime().rec.state === 'recording', null, {timeout: 15000, polling: 10});
    const sb = await p.evaluate(() => window.SYNQUENZER.runtime().rec.startBeat != null ? window.SYNQUENZER.runtime().rec.startBeat : Math.ceil(window.SYNQUENZER.runtime().beat));
    const s0 = Math.ceil(sb - 1e-6);
    for (let k = 0; k < notes.length; k++) { await waitBeat(p, s0 + k - .02); await p.evaluate(n => window.SYNQUENZER.tap(n, 100), notes[k]); }
    await waitBeat(p, s0 + 8.5);
    await p.evaluate(() => window.SYNQUENZER.clearLog());
    const L0 = await p.evaluate(() => window.SYNQUENZER.runtime().beat);
    await waitBeat(p, L0 + 9);
    const clip = await p.evaluate(() => window.SYNQUENZER.getClip(2, 0));
    const heard = await p.evaluate(() => window.SYNQUENZER.noteLog(4000).filter(n => n.track === 2 && n.beat != null).map(n => n.out));
    const uniq = [...new Set(heard)].sort((a, b) => a - b);
    return {info, car, clip: clip && {key: clip.key, n: clip.notes.map(x => x.n)}, played: notes.slice().sort((a, b) => a - b), heard: uniq}; },
  // FANG on track 3 under the latched Träger F, phrase in the lit scale
  fangCar: async (p, notes) => { await p.evaluate(setup);
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setKbMode('transpose'); Q.launchScene(0); });
    await waitBeat(p, 1); await p.evaluate(() => window.SYNQUENZER.chord([65, 69, 72], 250)); await waitBeat(p, 3);
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setKbMode('play'); Q.selectSlot(3, 0); });
    await waitBeat(p, 3.9);
    for (let k = 0; k < notes.length; k++) { await waitBeat(p, 4 + k - .02); await p.evaluate(n => window.SYNQUENZER.tap(n, 100), notes[k]); }
    await waitBeat(p, 12.2);
    await p.click(await p.evaluate(() => innerWidth > innerHeight ? '#bFangT' : '#bFang')); await p.waitForTimeout(150);
    const clip = await p.evaluate(() => window.SYNQUENZER.getClip(3, 0));
    await waitBeat(p, 16.5); await p.evaluate(() => window.SYNQUENZER.clearLog()); await waitBeat(p, 25);
    const heard = await p.evaluate(() => window.SYNQUENZER.noteLog(4000).filter(n => n.track === 3 && n.beat != null).map(n => n.out));
    return {clip: clip && {key: clip.key, n: clip.notes.map(x => x.n)}, played: notes.slice().sort((a, b) => a - b), heard: [...new Set(heard)].sort((a, b) => a - b)}; },
  // chord changes with notes that move under Eine Skala, then stop single clip / stop all: no voice left
  stopClean: async p => { await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(200); const K = {root: 4, scale: 'aeolian'};
      Q.setClip(0, 0, {len: 1, key: K, notes: [0, 1, 2, 3].map(t => ({t, d: 1.2, n: [64, 66, 67, 71][t], v: .8}))});
      Q.setClip(1, 0, {len: 1, key: K, notes: [{t: 0, d: 4, n: 64, v: .7}, {t: 0, d: 4, n: 67, v: .7}, {t: 0, d: 4, n: 71, v: .7}, {t: 2, d: 2, n: 78, v: .7}]});
      Q.setKbMode('transpose'); Q.launchScene(0); });
    const r = {};
    for (const [b, ch] of [[2, [60, 64, 67]], [5, [65, 69, 72]], [8, [67, 71, 74]], [11, [62, 65, 69]]]) { await waitBeat(p, b); await p.evaluate(c => window.SYNQUENZER.chord(c, 200), ch); }
    await waitBeat(p, 13); await p.evaluate(() => window.SYNQUENZER.stopTrackNow(1)); await p.waitForTimeout(400);
    r.v1 = await p.evaluate(() => window.SYNQUENZER.engineState ? null : window.SYNQUENZER.runtime().slots);
    await waitBeat(p, 17); await p.evaluate(() => window.SYNQUENZER.stop()); await p.waitForTimeout(1500);
    r.voicesAfterStop = await p.evaluate(() => window.SYNQUENZER.runtime().voices);
    r.te = await p.evaluate(() => window.SYNQUENZER.tickErrors());
    return r; },
  // defaults on the load paths and the settings roundtrip
  defaults: async p => p.evaluate(async (files) => { const Q = window.SYNQUENZER, o = {}, H = () => { const h = Q.runtime().harmony; return h.oneScale === undefined ? 'n/a' : h.oneScale; };
    Q.newProject(); o.neu = H(); Q.newProject({init: true}); o.init = H(); await Q.loadDemo(); o.demo = H();
    for (const k of Object.keys(files)) { Q.importJSON(files[k]); await new Promise(r => setTimeout(r, 200)); o[k] = H(); }
    if (Q.oneScale) { Q.newProject({init: true}); Q.setHarmony({oneScale: false, osAmt: .4, osPass: true, osRef: 'auto', drums: true}); Q.setTrackScale(1, false);
      const s = Q.serialize(); Q.newProject({init: true}); Q.importJSON(s); const h = Q.runtime().harmony;
      o.rt = {oneScale: h.oneScale, osAmt: h.osAmt, osPass: h.osPass, osRef: h.osRef, drums: h.drums, tr1: Q.project().tracks[1].os, tr0: Q.project().tracks[0].os};
      await Q.save(); Q.newProject({init: true}); await Q.load(); const h2 = Q.runtime().harmony; o.rt2 = {oneScale: h2.oneScale, osAmt: h2.osAmt, osPass: h2.osPass, osRef: h2.osRef, drums: h2.drums, tr1: Q.project().tracks[1].os}; }
    return o; }, {dir2: fs.readFileSync(D + 'v3-qa-v2c2reg/dirigent-v2.json', 'utf8'), v0a: fs.readFileSync(D + 'v3-qa-old/v0a-project.json', 'utf8'), vs1: fs.readFileSync(D + 'v3-qa-old/vs1-project.json', 'utf8'),
      f452: fs.readFileSync(D + 'v3-qa-vs2breg/save-new-P1.json', 'utf8')}),
};
const res = {base: {}, new: {}};
const IN = [65, 67, 69, 71, 72, 74, 76, 77];          // F G A B C D E F: C major = the one scale under F in C
const CHR = [65, 66, 69, 70, 72, 73, 76, 77];         // with F#, Bb, C#
for (const [name, file] of [['base', BASE], ['new', APP]]) for (const k of ['recCar', 'recCarChr', 'fangCar', 'fangCarChr', 'stopClean', 'defaults']) {
  if (only && !only.includes(k)) continue;
  const {b, p, errs} = await open({width: 390, height: 844}, file);
  try { const f = scen[k.replace('Chr', '')]; res[name][k] = await f(p, k.endsWith('Chr') ? CHR : IN); } catch (e) { res[name][k] = {fail: String(e).slice(0, 300)}; }
  res[name][k].errs = errs.slice(); await b.close();
}
fs.writeFileSync(D + 'v3-qa-v2c2reg-os.json', JSON.stringify(res, null, 1));
for (const k of Object.keys(res.new)) { console.log('==', k); for (const f of Object.keys(res.new[k])) { const a = JSON.stringify(res.base[k] && res.base[k][f]), n = JSON.stringify(res.new[k][f]); console.log('  ' + f, a === n ? 'same' : 'DIFF', (n || '').slice(0, 500), a === n ? '' : '\n    base ' + (a || '').slice(0, 500)); } }
