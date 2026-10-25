// QA regression (V2d′): V2c′-fix 4.5.3 (base) vs V2d′ 4.6.0 (new)
import { open, APP } from './v3-v2d-pw.mjs';
import fs from 'fs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/V2c′-fix.html';
const OLD = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-old/';
const only = process.argv[2] ? process.argv[2].split(',') : null;
const waitBeat = (p, b, to = 30000) => p.waitForFunction(x => window.SYNQUENZER.runtime().beat > x, b, {timeout: to, polling: 20});
const grab = p => p.evaluate(() => window.SYNQUENZER.noteLog(4000).filter(n => n.beat != null && n.beat >= 0).map(n => n.track + '@' + n.beat.toFixed(2) + ':' + n.out).sort());
const setupClips = () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'}, N = (t, n, d) => ({t, d: d || .4, n, v: .8});
  Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 57), N(1, 60), N(2, 64), N(3, 60)]}); Q.setClip(0, 1, {len: 2, key: K, notes: [N(0, 53), N(4, 55)]});
  Q.setClip(1, 0, {len: 1, key: K, notes: [N(0, 69, 1.5), N(2, 72, 1.5)]}); Q.setClip(1, 1, {len: 1, key: K, notes: [N(.5, 76, .3), N(2.5, 74, .3)]});
  Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 1, d: .1, n: 42, v: .7}, {t: 2, d: .1, n: 38, v: .9}, {t: 3, d: .1, n: 42, v: .7}]});
  Q.setClip(4, 1, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 2.5, d: .1, n: 36, v: .9}, {t: 3, d: .1, n: 38, v: .9}]}); return 1; };
const scen = {
  // demo: scenes 1 and 2 with drums, 0 tick errors
  demo: async p => { await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setBpm(240); Q.clearLog(); Q.launchScene(0); });
    await waitBeat(p, 16); await p.evaluate(() => window.SYNQUENZER.launchScene(1)); await waitBeat(p, 34);
    return {log: await grab(p), te: await p.evaluate(() => window.SYNQUENZER.tickErrors())}; },
  // launch scenes, tap running clip = stop at bar end, ■ now, relaunch
  scenes: async p => { await p.evaluate(setupClips); await p.evaluate(() => { window.SYNQUENZER.clearLog(); window.SYNQUENZER.launchScene(0); });
    await waitBeat(p, 5.2); await p.evaluate(() => window.SYNQUENZER.tapSlot(0, 0));
    const q = await p.evaluate(() => window.SYNQUENZER.runtime().stopQ);
    await waitBeat(p, 9.2); const s1 = await p.evaluate(() => window.SYNQUENZER.runtime().slots);
    await p.evaluate(() => window.SYNQUENZER.launchScene(1)); await waitBeat(p, 13.5);
    await p.evaluate(() => window.SYNQUENZER.stopTrackNow(1)); const s2 = await p.evaluate(() => window.SYNQUENZER.runtime().slots);
    await waitBeat(p, 17.2); await p.evaluate(() => window.SYNQUENZER.launchClip(0, 0)); await waitBeat(p, 25);
    return {log: await grab(p), q, s1, s2, s3: await p.evaluate(() => window.SYNQUENZER.runtime().slots)}; },
  // TRANSPONIEREN with single notes and chords (latch), ORIGINAL
  transpose: async p => { await p.evaluate(setupClips); await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setKbMode('transpose'); Q.clearLog(); Q.launchScene(0); });
    const car = [];
    await waitBeat(p, 3); await p.evaluate(() => window.SYNQUENZER.tap(62, 300)); await waitBeat(p, 6); car.push(await p.evaluate(() => { const c = window.SYNQUENZER.runtime().carrier; return c && c.name; }));
    await waitBeat(p, 7); await p.evaluate(() => window.SYNQUENZER.chord([65, 69, 72], 300)); await waitBeat(p, 10); car.push(await p.evaluate(() => { const c = window.SYNQUENZER.runtime().carrier; return c && c.name; }));
    await waitBeat(p, 11); await p.evaluate(() => window.SYNQUENZER.chord([67, 71, 74], 300)); await waitBeat(p, 14); car.push(await p.evaluate(() => { const c = window.SYNQUENZER.runtime().carrier; return c && c.name; }));
    await waitBeat(p, 15); await p.evaluate(() => window.SYNQUENZER.tap(64, 300)); await waitBeat(p, 18); car.push(await p.evaluate(() => { const c = window.SYNQUENZER.runtime().carrier; return c && c.name; }));
    await waitBeat(p, 19); await p.evaluate(() => window.SYNQUENZER.resetCarrier()); await waitBeat(p, 24); car.push(await p.evaluate(() => { const c = window.SYNQUENZER.runtime().carrier; return c && c.name; }));
    // compare only notes after each change settled: the per-bar out set
    const log = await grab(p);
    return {car, log}; },
  // ● record a new clip (count-in 1), notes via keyboard, ● again; then the clip plays
  record: async p => { await p.evaluate(setupClips); await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setRecOptions({countIn: 1, length: 'auto', quantize: '1/16'}); Q.selectSlot(2, 0); Q.rec(); });
    await p.waitForFunction(() => window.SYNQUENZER.runtime().rec.state === 'rec' || window.SYNQUENZER.runtime().rec.state === 'recording', null, {timeout: 10000, polling: 10}).catch(() => {});
    const st = await p.evaluate(() => window.SYNQUENZER.runtime().rec);
    const sb = await p.evaluate(() => window.SYNQUENZER.runtime().beat);
    const at = [0, 1, 2, 3, 4, 5, 6, 7].map(k => Math.ceil(sb) + k);
    const ns = [60, 62, 64, 65, 67, 65, 64, 62];
    for (let k = 0; k < at.length; k++) { await waitBeat(p, at[k] - .02); await p.evaluate(n => window.SYNQUENZER.tap(n, 120), ns[k]); }
    await waitBeat(p, at[7] + .6); await p.evaluate(() => window.SYNQUENZER.rec());
    await waitBeat(p, at[7] + 10);
    const clip = await p.evaluate(() => window.SYNQUENZER.getClip(2, 0));
    const after = await p.evaluate(() => ({rec: window.SYNQUENZER.runtime().rec.state, slots: window.SYNQUENZER.runtime().slots}));
    return {st: st.state, clip: clip && {len: clip.len, n: clip.notes.map(x => x.n), t: clip.notes.map(x => Math.round(x.t * 4) / 4)}, after}; },
  // FANG (SPIELEN): play a phrase, tap the FANG button (DOM), the clip lands in a free slot and plays in phase
  fang: async p => { await p.evaluate(setupClips); await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectSlot(3, 0); Q.clearLog(); Q.launchScene(0); });
    await waitBeat(p, 3.9); const ns = [72, 74, 76, 79, 76, 74, 72, 71];
    for (let k = 0; k < 8; k++) { await waitBeat(p, 4 + k - .03); await p.evaluate(n => window.SYNQUENZER.tap(n, 150), ns[k]); }
    await waitBeat(p, 12.3);
    const before = await p.evaluate(() => { const r = window.SYNQUENZER.runtime(); const b = document.getElementById(innerWidth > innerHeight ? 'bFangT' : 'bFang'); return {lit: r.fang, mode: r.fangMode || null, label: b.textContent, cls: b.className}; });
    const id = await p.evaluate(() => innerWidth > innerHeight ? '#bFangT' : '#bFang');
    await p.click(id);
    await p.waitForTimeout(150);
    const clip = await p.evaluate(() => window.SYNQUENZER.getClip(3, 0));
    const r1 = await p.evaluate(() => { const r = window.SYNQUENZER.runtime(); return {mode: r.fangMode || null, sel: r.selected, queued: r.queued[3], part: r.part}; });
    await waitBeat(p, 22);
    const r2 = await p.evaluate(() => { const r = window.SYNQUENZER.runtime(); const b = document.getElementById(innerWidth > innerHeight ? 'bFangT' : 'bFang'); return {mode: r.fangMode || null, label: b.textContent, slots: r.slots, pop: !!document.querySelector('.pop.fsheet')}; });
    const log = (await grab(p)).filter(x => x.startsWith('3@'));
    return {before, clip: clip && {len: clip.len, n: clip.notes.map(x => x.n)}, r1, r2, log}; },
  // drums: pads + clip; synth editor + FM page; no errors
  edit: async p => { await p.evaluate(setupClips);
    const o = await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.launchScene(0); Q.pad('kick'); Q.pad('snare');
      Q.selectSlot(0, 0); Q.openEditor(); await new Promise(r => setTimeout(r, 300)); const ed1 = Q.runtime().editor;
      Q.setEngine(0, 'fm'); await new Promise(r => setTimeout(r, 300)); const fm = Q.fmUi();
      const btns = [...document.querySelectorAll('#editor button, .editor button, [id*=ed] button')].filter(b => b.offsetParent).length;
      Q.closeEditor && Q.closeEditor(); Q.selectSlot(4, 0); Q.openEditor(); await new Promise(r => setTimeout(r, 300)); const ed2 = Q.runtime().editor; Q.closeEditor && Q.closeEditor();
      return {ed1, fm, ed2, btns}; });
    await waitBeat(p, 12); const log = (await grab(p)).filter(x => x.startsWith('4@'));
    return {o, drums: log.length}; },
  // save/load: serialize → new → import; save() → load(); old format-3 file
  save: async p => { await p.evaluate(setupClips);
    const r = await p.evaluate(async (old) => { const Q = window.SYNQUENZER; Q.setPart(0, {name: 'A', slots: [{s: 1}, null, {s: 0}, -1, {s: 1}, -1]});
      Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 3}]);
      const s1 = Q.serialize(); const p1 = Q.project(); await Q.newProject({init: true}); const ok = Q.importJSON(s1); const p2 = Q.project();
      const strip = o => { const x = JSON.parse(JSON.stringify(o)); delete x.id; delete x.uid; delete x.mt; delete x.ct; delete x.name; return x; };
      const eqp = JSON.stringify(strip(p1.tracks)) === JSON.stringify(strip(p2.tracks)) && JSON.stringify(p1.song) === JSON.stringify(p2.song) && JSON.stringify(p1.parts) === JSON.stringify(p2.parts);
      await Q.save(); const ld = await Q.load(); const p3 = Q.project();
      const eq3 = JSON.stringify(p3.tracks.map(t => t.clips)) === JSON.stringify(p1.tracks.map(t => t.clips));
      const res = {};
      for (const k of Object.keys(old)) { const ok2 = Q.importJSON(old[k]); const pj = Q.project(); res[k] = {ok: ok2, tracks: pj.tracks.length, clips: pj.tracks.map(t => t.clips.filter(Boolean).length), notes: pj.tracks.map(t => t.clips.reduce((a, c) => a + (c ? c.notes.length : 0), 0)), song: pj.song ? {bars: pj.song.bars, lanes: pj.song.lanes, carrier: pj.song.carrier.length, marks: pj.song.marks} : null, bpm: pj.bpm, parts: (pj.parts || []).filter(Boolean).length}; }
      return {ok, eqp, ld, eq3, res}; }, {v0a: fs.readFileSync(OLD + 'v0a-project.json', 'utf8'), vs1: fs.readFileSync(OLD + 'vs1-project.json', 'utf8'), dir2: fs.readFileSync('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-vs2reg/dirigent-v2.json', 'utf8')});
    // play the old v0a project's song
    await p.evaluate((t) => { const Q = window.SYNQUENZER; Q.importJSON(t); Q.setBpm(240); Q.clearLog(); Q.songPlay(0); }, fs.readFileSync(OLD + 'v0a-project.json', 'utf8'));
    await waitBeat(p, 19.5);
    return {r, log: await grab(p)}; },
  // MIDI export as zip (viewer downloads capability mocked)
  midi: async p => { await p.evaluate(setupClips);
    return p.evaluate(async () => { const Q = window.SYNQUENZER; const got = [];
      window.claude = {use: async k => (k === 'downloads' ? {save: async ({filename, data}) => { got.push({filename, bytes: Array.from(new Uint8Array(await data.arrayBuffer()))}); }} : null)};
      Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]);
      for (const mode of ['scene', 'all', 'song']) { await Q.exportMidi({mode, scene: 0}); await new Promise(r => setTimeout(r, 800)); }
      const un = z => { const out = []; let i = 0; const dv = new DataView(new Uint8Array(z).buffer); while (dv.getUint32(i, true) === 0x04034b50) { const m = dv.getUint16(i + 8, true), cs = dv.getUint32(i + 18, true), nl = dv.getUint16(i + 26, true), xl = dv.getUint16(i + 28, true); const name = String.fromCharCode(...z.slice(i + 30, i + 30 + nl)); out.push({name, method: m, data: z.slice(i + 30 + nl + xl, i + 30 + nl + xl + cs)}); i += 30 + nl + xl + cs; } return out; };
      return got.map(g => { const f = un(g.bytes); const d = f[0] && f[0].data; return {filename: g.filename, files: f.map(x => x.name + ':' + x.method), mthd: d ? String.fromCharCode(...d.slice(0, 4)) : null, midi: d ? d.join(',') : null}; }); }); },
  // DIRIGENT format-2 file: import, sounds on every synth track, scene 1 plays (incl. drums)
  dir2: async p => { const t = fs.readFileSync('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-vs2reg/dirigent-v2.json', 'utf8');
    const info = await p.evaluate(async (t) => { const Q = window.SYNQUENZER; const toasts = []; const ok = Q.importJSON(t); await new Promise(r => setTimeout(r, 400));
      const pj = Q.project(); const ts = [...document.querySelectorAll('.toast, #toast, [class*=toast]')].map(e => e.textContent).filter(Boolean).join(' | ');
      return {ok, format: pj.format, bpm: pj.bpm, key: pj.key, tracks: pj.tracks.map(t => ({kind: t.kind, name: t.name, eng: t.sound && t.sound.engine, snd: t.sound && t.sound.name, clips: (t.clips || []).map(c => c ? c.notes.map(n => n.n + '@' + n.t).join(',') : null)})), fx: pj.fxBus && {echo: pj.fxBus.echo && pj.fxBus.echo.divL, vol: pj.fxBus.master && pj.fxBus.master.vol}, countIn: pj.settings.countIn, toast: ts}; }, t);
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setBpm(240); Q.clearLog(); Q.launchScene(0); });
    await waitBeat(p, 9);
    return {info, log: await grab(p), te: await p.evaluate(() => window.SYNQUENZER.tickErrors())}; },
};
const res = {};
for (const [name, file] of [['base', BASE], ['new', APP]]) {
  res[name] = {};
  for (const k of Object.keys(scen)) {
    if (only && !only.includes(k)) continue;
    const {b, p, errs} = await open({width: 390, height: 844}, file);
    try { res[name][k] = await scen[k](p); } catch (e) { res[name][k] = {fail: String(e)}; }
    res[name][k].errs = errs.slice();
    await b.close();
  }
}
fs.writeFileSync('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2d2reg/core.json', JSON.stringify(res, null, 1));
for (const k of Object.keys(scen)) {
  if (only && !only.includes(k)) continue;
  const a = res.base[k], n = res.new[k];
  console.log('==', k);
  for (const f of Object.keys(n)) {
    if (f === 'log') { const A = a.log || [], B = n.log || []; const miss = A.filter(x => !B.includes(x)), extra = B.filter(x => !A.includes(x)); console.log('  log', A.length, B.length, miss.length || extra.length ? 'DIFF miss=' + JSON.stringify(miss.slice(0, 10)) + ' extra=' + JSON.stringify(extra.slice(0, 10)) : 'same'); continue; }
    const same = JSON.stringify(a[f]) === JSON.stringify(n[f]);
    const s = JSON.stringify(n[f]); console.log('  ' + f, same ? 'same' : 'DIFF', (s || '').slice(0, 600), same ? '' : '\n    base: ' + (JSON.stringify(a[f]) || '').slice(0, 600));
  }
}
