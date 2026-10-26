// Core flows with an MS 2000 track in Split (mode 2, split 64) / Schicht: record, FANG, transpose, MIDI zip — base 4.10.0 vs 4.11.0
import { open, APP } from './v3-qa-mk3reg-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/MK2.html';
const waitBeat = (p, b, to = 30000) => p.waitForFunction(x => window.SYNQUENZER.runtime().beat > x, b, {timeout: to, polling: 20});
const setup = async (p, mode) => p.evaluate(async mode => { const Q = window.SYNQUENZER; await Q.newProject({init: true}); Q.setBpm(240); Q.setEngine(0, 'mk'); Q.setEngine(1, 'mk'); await new Promise(r => setTimeout(r, 500));
  for (const t of [0, 1]) { Q.mkSet(t, 'mode', mode); Q.mkSet(t, 'split', 64); Q.mkSet(t, 't.1.o1.w', 1); }
  const K = {root: 9, scale: 'aeolian'}, N = (t, n, d) => ({t, d: d || .4, n, v: .8});
  Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 57), N(1, 60), N(2, 64), N(3, 69)]}); Q.setClip(1, 0, {len: 1, key: K, notes: [N(0, 69, 1.5), N(0, 72, 1.5), N(2, 76, 1.5)]});
  Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 1, d: .1, n: 42, v: .7}, {t: 2, d: .1, n: 38, v: .9}, {t: 3, d: .1, n: 42, v: .7}]}); }, mode);
const grab = p => p.evaluate(() => window.SYNQUENZER.noteLog(4000).filter(n => n.beat != null && n.beat >= 0).map(n => n.track + ':' + n.out));
const meas = (p, ms) => p.evaluate(async ms => { let mx = -200; const t0 = performance.now(); while (performance.now() - t0 < ms) { const m = window.SYNQUENZER.meter(); if (isFinite(m.rmsDb)) mx = Math.max(mx, m.rmsDb); await new Promise(r => setTimeout(r, 30)); } return +mx.toFixed(1); }, ms);
const res = {};
for (const [name, file] of [['base', BASE], ['new', APP]]) for (const mode of [2, 1]) {
  const r = {}; let {b, p, errs} = await open({width: 390, height: 844}, file, true);
  // record on the MS 2000 track 0 slot 2 (keyboard), notes across the split point
  await setup(p, mode);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setRecOptions({countIn: 1, length: 'auto', quantize: '1/16'}); Q.selectSlot(0, 2); Q.rec(); });
  await p.waitForFunction(() => /rec/.test(window.SYNQUENZER.runtime().rec.state) && window.SYNQUENZER.runtime().rec.state !== 'off', null, {timeout: 10000, polling: 10}).catch(() => {});
  const sb = await p.evaluate(() => window.SYNQUENZER.runtime().beat); const at = [0, 1, 2, 3, 4, 5, 6, 7].map(k => Math.ceil(sb) + k), ns = [60, 62, 64, 65, 67, 72, 59, 66];
  for (let k = 0; k < 8; k++) { await waitBeat(p, at[k] - .02); await p.evaluate(n => window.SYNQUENZER.tap(n, 120), ns[k]); }
  await waitBeat(p, at[7] + .6); await p.evaluate(() => window.SYNQUENZER.rec()); await waitBeat(p, at[7] + 6);
  r.rec = await p.evaluate(() => { const c = window.SYNQUENZER.getClip(0, 2); return c && {len: c.len, n: c.notes.map(x => x.n).join(',')}; });
  r.recLevel = await meas(p, 800); await p.evaluate(() => window.SYNQUENZER.stop()); await p.waitForTimeout(500);
  // FANG on MS 2000 track 1
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectSlot(1, 3); Q.clearLog(); Q.launchScene(0); });
  await waitBeat(p, 3.9); const fs_ = [72, 74, 76, 79, 60, 62, 64, 55];
  for (let k = 0; k < 8; k++) { await waitBeat(p, 4 + k - .03); await p.evaluate(n => window.SYNQUENZER.tap(n, 150), fs_[k]); }
  await waitBeat(p, 12.3); await p.click('#bFang'); await p.waitForTimeout(200);
  r.fang = await p.evaluate(() => { const c = window.SYNQUENZER.getClip(1, 3); return c && {len: c.len, n: c.notes.map(x => x.n).join(',')}; });
  await waitBeat(p, 22); r.fangSlots = await p.evaluate(() => window.SYNQUENZER.runtime().slots.join(','));
  await p.evaluate(() => window.SYNQUENZER.stop()); await p.waitForTimeout(300);
  // transpose with a chord and a single note
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setKbMode('transpose'); Q.clearLog(); Q.launchScene(0); });
  await waitBeat(p, 3); await p.evaluate(() => window.SYNQUENZER.tap(62, 300)); await waitBeat(p, 7); await p.evaluate(() => window.SYNQUENZER.chord([65, 69, 72], 300)); await waitBeat(p, 12.5);
  const tl = await grab(p); r.trans = {n: tl.length, t0: [...new Set(tl.filter(x => x.startsWith('0:')))].sort().join(' '), t1: [...new Set(tl.filter(x => x.startsWith('1:')))].sort().join(' ')};
  r.carrier = await p.evaluate(() => { const c = window.SYNQUENZER.runtime().carrier; return c && c.name; });
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.stop(); Q.setKbMode('play'); });
  // MIDI zip
  r.midi = await p.evaluate(async () => { const Q = window.SYNQUENZER; const got = [];
    window.claude = {use: async k => (k === 'downloads' ? {save: async ({filename, data}) => { got.push({filename, n: (await data.arrayBuffer()).byteLength, b: Array.from(new Uint8Array(await data.arrayBuffer())).join(',')}); }} : null)};
    await Q.exportMidi({mode: 'all'}); await new Promise(r => setTimeout(r, 800)); return got.map(g => g.filename + ':' + g.n + ':' + g.b.length + ':' + g.b.slice(-300)); });
  r.te = await p.evaluate(() => window.SYNQUENZER.tickErrors()); r.errs = errs.slice(); res[name + mode] = r; await b.close();
}
for (const mode of [2, 1]) { const A = res['base' + mode], B = res['new' + mode]; console.log('== mode', mode);
  for (const k of Object.keys(B)) { const s = JSON.stringify(B[k]), same = s === JSON.stringify(A[k]); console.log(' ', k, same ? 'same' : 'DIFF', s.slice(0, 400), same ? '' : '\n     base ' + JSON.stringify(A[k]).slice(0, 400)); } }
