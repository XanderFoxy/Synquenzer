// QA MK5 regression: core flows on MS 2000 (mk) tracks with ARP OFF, base 4.12.0 vs MK5 4.13.0
import { open, APP } from './v3-qa-mk5reg-pw.mjs';
import fs from 'fs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk5-base-4.12.0.html';
const only = process.argv[2] ? process.argv[2].split(',') : null;
const waitBeat = (p, b, to = 30000) => p.waitForFunction(x => window.SYNQUENZER.runtime().beat > x, b, {timeout: to, polling: 20});
const grab = p => p.evaluate(() => window.SYNQUENZER.noteLog(4000).filter(n => n.beat != null && n.beat >= 0).map(n => n.track + '@' + n.beat.toFixed(2) + ':' + n.out + (n.src === 'live' ? 'L' : '')).sort());
const setup = async () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'}, N = (t, n, d) => ({t, d: d || .4, n, v: .8});
  Q.setEngine(0, 'mk'); Q.setEngine(1, 'mk'); Q.setEngine(3, 'mk'); await new Promise(r => setTimeout(r, 600));
  Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 57), N(1, 60), N(2, 64), N(3, 60)]}); Q.setClip(0, 1, {len: 2, key: K, notes: [N(0, 53), N(4, 55)]});
  Q.setClip(1, 0, {len: 1, key: K, notes: [N(0, 69, 1.5), N(0, 72, 1.5), N(2, 72, 1.5)]}); Q.setClip(1, 1, {len: 1, key: K, notes: [N(.5, 76, .3), N(2.5, 74, .3)]});
  Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 1, d: .1, n: 42, v: .7}, {t: 2, d: .1, n: 38, v: .9}, {t: 3, d: .1, n: 42, v: .7}]});
  Q.setClip(4, 1, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 2.5, d: .1, n: 36, v: .9}, {t: 3, d: .1, n: 38, v: .9}]}); return 1; };
const vox = p => p.evaluate(() => { const v = window.SYNQUENZER.voices(); return typeof v === 'object' ? (v.voices != null ? v.voices : JSON.stringify(v).slice(0, 200)) : v; });
const scen = {
  live: async p => { await p.evaluate(setup); await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack(0); Q.clearLog(); });
    const r = {};
    await p.evaluate(() => window.SYNQUENZER.chord([60, 64, 67], 300)); await p.waitForTimeout(400);
    r.stoppedLog = await p.evaluate(() => window.SYNQUENZER.noteLog(100).map(n => n.track + ':' + n.src + ':' + n.out).sort());
    r.vAfter = await p.evaluate(async () => { await new Promise(r => setTimeout(r, 2500)); return window.SYNQUENZER.voices(); });
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.clearLog(); Q.launchScene(0); }); await waitBeat(p, 2);
    await p.evaluate(() => window.SYNQUENZER.tap(62, 200)); await waitBeat(p, 4);
    r.playLive = await p.evaluate(() => window.SYNQUENZER.noteLog(400).filter(n => n.src === 'live').map(n => n.track + ':' + n.out));
    await p.evaluate(() => window.SYNQUENZER.stop()); await p.waitForTimeout(2500);
    r.vEnd = await p.evaluate(() => window.SYNQUENZER.voices());
    return r; },
  scenes: async p => { await p.evaluate(setup); await p.evaluate(() => { window.SYNQUENZER.clearLog(); window.SYNQUENZER.launchScene(0); });
    await waitBeat(p, 5.2); await p.evaluate(() => window.SYNQUENZER.tapSlot(0, 0));
    const q = await p.evaluate(() => window.SYNQUENZER.runtime().stopQ);
    await waitBeat(p, 9.2); const s1 = await p.evaluate(() => window.SYNQUENZER.runtime().slots);
    await p.evaluate(() => window.SYNQUENZER.launchScene(1)); await waitBeat(p, 13.5);
    await p.evaluate(() => window.SYNQUENZER.stopTrackNow(1)); const s2 = await p.evaluate(() => window.SYNQUENZER.runtime().slots);
    await p.waitForTimeout(1500); const v1 = await p.evaluate(() => { const v = window.SYNQUENZER.voices(); return JSON.stringify(v).slice(0, 300); });
    await waitBeat(p, 17.2); await p.evaluate(() => window.SYNQUENZER.launchClip(0, 0)); await waitBeat(p, 25);
    return {log: await grab(p), q, s1, s2, s3: await p.evaluate(() => window.SYNQUENZER.runtime().slots), te: await p.evaluate(() => window.SYNQUENZER.tickErrors())}; },
  transpose: async p => { await p.evaluate(setup); await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setKbMode('transpose'); Q.clearLog(); Q.launchScene(0); });
    const car = [];
    const cn = () => p.evaluate(() => { const c = window.SYNQUENZER.runtime().carrier; return c && c.name; });
    await waitBeat(p, 3); await p.evaluate(() => window.SYNQUENZER.tap(62, 300)); await waitBeat(p, 6); car.push(await cn());
    await waitBeat(p, 7); await p.evaluate(() => window.SYNQUENZER.chord([65, 69, 72], 300)); await waitBeat(p, 10); car.push(await cn());
    await waitBeat(p, 11); await p.evaluate(() => window.SYNQUENZER.chord([67, 71, 74], 300)); await waitBeat(p, 14); car.push(await cn());
    await waitBeat(p, 15); await p.evaluate(() => window.SYNQUENZER.tap(64, 300)); await waitBeat(p, 18); car.push(await cn());
    await waitBeat(p, 19); await p.evaluate(() => window.SYNQUENZER.resetCarrier()); await waitBeat(p, 24); car.push(await cn());
    // only the bar-start notes (deterministic: clip notes exactly on beats)
    const log = (await grab(p)).filter(x => /@\d+\.00:/.test(x));
    return {car, log, live: await p.evaluate(() => window.SYNQUENZER.noteLog(4000).filter(n => n.src === 'live').length)}; },
  record: async p => { await p.evaluate(setup); await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setRecOptions({countIn: 1, length: 'auto', quantize: '1/16'}); Q.selectSlot(3, 0); Q.rec(); });
    await p.waitForFunction(() => window.SYNQUENZER.runtime().rec.state === 'recording', null, {timeout: 10000, polling: 10}).catch(() => {});
    const sb = await p.evaluate(() => window.SYNQUENZER.runtime().beat);
    const at = [0, 1, 2, 3, 4, 5, 6, 7].map(k => Math.ceil(sb) + k), ns = [60, 62, 64, 65, 67, 65, 64, 62];
    for (let k = 0; k < at.length; k++) { await waitBeat(p, at[k] - .02); await p.evaluate(n => window.SYNQUENZER.tap(n, 120), ns[k]); }
    await waitBeat(p, at[7] + .6); await p.evaluate(() => window.SYNQUENZER.rec());
    const b0 = await p.evaluate(() => window.SYNQUENZER.runtime().beat);
    await waitBeat(p, at[7] + 10);
    const clip = await p.evaluate(() => window.SYNQUENZER.getClip(3, 0));
    const pl = (await grab(p)).filter(x => x.startsWith('3@') && !x.endsWith('L')).length;
    return {clip: clip && {len: clip.len, n: clip.notes.map(x => x.n), t: clip.notes.map(x => Math.round(x.t * 4) / 4)}, playedFromClip: pl > 0, undo: await p.evaluate(() => window.SYNQUENZER.undoInfo().top && window.SYNQUENZER.undoInfo().top.label)}; },
  fang: async p => { await p.evaluate(setup); await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectSlot(3, 0); Q.clearLog(); Q.launchScene(0); });
    await waitBeat(p, 3.9); const ns = [72, 74, 76, 79, 76, 74, 72, 71];
    for (let k = 0; k < 8; k++) { await waitBeat(p, 4 + k - .03); await p.evaluate(n => window.SYNQUENZER.tap(n, 150), ns[k]); }
    await waitBeat(p, 12.3);
    const id = await p.evaluate(() => innerWidth > innerHeight ? '#bFangT' : '#bFang');
    await p.click(id); await p.waitForTimeout(150);
    const clip = await p.evaluate(() => window.SYNQUENZER.getClip(3, 0));
    await waitBeat(p, 22);
    const log = (await grab(p)).filter(x => x.startsWith('3@') && !x.endsWith('L') && parseFloat(x.slice(2)) >= 16).map(x => x.replace(/@[\d.]+/, ''));
    return {clip: clip && {len: clip.len, n: clip.notes.map(x => x.n)}, log}; },
  save: async p => { await p.evaluate(setup);
    return p.evaluate(async () => { const Q = window.SYNQUENZER; Q.mkSet(0, 't.0.o1.w', 1); Q.mkSet(0, 't.0.f.cut', 80);
      const s1 = Q.serialize(); const g1 = Q.mkGet(0); await Q.newProject({init: true}); const ok = Q.importJSON(s1); await new Promise(r => setTimeout(r, 300)); const g2 = Q.mkGet(0);
      const strip = o => { const x = JSON.parse(JSON.stringify(o)); delete x.arp; return x; };
      return {ok, same: JSON.stringify(strip(g1)) === JSON.stringify(strip(g2)), arp: g2 && g2.arp, eng: Q.getSound(0).engine}; }); },
};
const res = {};
for (const [name, file] of [['base', BASE], ['new', APP]]) {
  res[name] = {};
  for (const k of Object.keys(scen)) {
    if (only && !only.includes(k)) continue;
    const {b, p, errs} = await open(process.argv[3] === 'L' ? {width: 844, height: 390} : {width: 390, height: 844}, file);
    try { res[name][k] = await scen[k](p); } catch (e) { res[name][k] = {fail: String(e)}; }
    res[name][k].errs = errs.slice();
    await b.close();
  }
}
fs.writeFileSync('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-mk5reg/mkcore-' + (process.argv[3]||'P') + '.json', JSON.stringify(res, null, 1));
for (const k of Object.keys(scen)) {
  if (only && !only.includes(k)) continue;
  const a = res.base[k], n = res.new[k];
  console.log('==', k);
  for (const f of Object.keys(n)) {
    if (f === 'log') { const A = a.log || [], B = n.log || []; const miss = A.filter(x => !B.includes(x)), extra = B.filter(x => !A.includes(x)); console.log('  log', A.length, B.length, miss.length || extra.length ? 'DIFF miss=' + JSON.stringify(miss.slice(0, 12)) + ' extra=' + JSON.stringify(extra.slice(0, 12)) : 'same'); continue; }
    const same = JSON.stringify(a[f]) === JSON.stringify(n[f]);
    const s = JSON.stringify(n[f]); console.log('  ' + f, same ? 'same' : 'DIFF', (s || '').slice(0, 600), same ? '' : '\n    base: ' + (JSON.stringify(a[f]) || '').slice(0, 600));
  }
}
