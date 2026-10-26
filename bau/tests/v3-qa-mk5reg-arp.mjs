// QA MK5 regression: core flows with ARP ON on an MS 2000 track (new only)
import { open, APP } from './v3-qa-mk5reg-pw.mjs';
import fs from 'fs';
const only = process.argv[2] ? process.argv[2].split(',') : null;
const VP = process.argv[3] === 'L' ? {width: 844, height: 390} : {width: 390, height: 844};
const waitBeat = (p, b, to = 30000) => p.waitForFunction(x => window.SYNQUENZER.runtime().beat > x, b, {timeout: to, polling: 20});
const setup = async () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'}, N = (t, n, d) => ({t, d: d || .4, n, v: .8});
  Q.setEngine(0, 'mk'); Q.setEngine(1, 'mk'); Q.setEngine(3, 'mk'); await new Promise(r => setTimeout(r, 600));
  Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 57), N(1, 60), N(2, 64), N(3, 60)]});
  Q.setClip(1, 0, {len: 1, key: K, notes: [N(0, 57, 4), N(0, 60, 4), N(0, 64, 4)]}); Q.setClip(1, 1, {len: 1, key: K, notes: [N(0, 55, 4), N(0, 59, 4), N(0, 62, 4)]});
  Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 1, d: .1, n: 42, v: .7}, {t: 2, d: .1, n: 38, v: .9}, {t: 3, d: .1, n: 42, v: .7}]});
  Q.setClip(4, 1, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 2.5, d: .1, n: 36, v: .9}, {t: 3, d: .1, n: 38, v: .9}]});
  Q.mkSet(1, 'arp.on', 1); Q.mkSet(3, 'arp.on', 1); await new Promise(r => setTimeout(r, 400)); return 1; };
const L = (p, f) => p.evaluate(f => window.SYNQUENZER.noteLog(4000).filter(n => n.beat != null && n.beat >= 0 && (!f || n.track === f.t)).map(n => ({t: n.track, b: +n.beat.toFixed(3), n: n.out, src: n.src})), f);
const scen = {
  scenes: async p => { await p.evaluate(setup); await p.evaluate(() => { window.SYNQUENZER.clearLog(); window.SYNQUENZER.launchScene(0); });
    const r = {};
    await waitBeat(p, 5.2); await p.evaluate(() => window.SYNQUENZER.tapSlot(1, 0)); r.q = await p.evaluate(() => window.SYNQUENZER.runtime().stopQ);
    await waitBeat(p, 9.5);
    const lg = await L(p, {t: 1}); r.arpBefore8 = lg.filter(x => x.b < 8).length; r.arpAfter8 = lg.filter(x => x.b >= 8.0001).map(x => x.b + ':' + x.n);
    r.srcs = [...new Set(lg.map(x => x.src))];
    r.slots1 = await p.evaluate(() => window.SYNQUENZER.runtime().slots);
    await p.evaluate(() => window.SYNQUENZER.launchScene(1)); await waitBeat(p, 13.5);
    const lg2 = await L(p, {t: 1}); r.scene1 = [...new Set(lg2.filter(x => x.b >= 12 && x.b < 13.5).map(x => x.n))].sort();
    await p.evaluate(() => window.SYNQUENZER.stopTrackNow(1)); const bStop = await p.evaluate(() => window.SYNQUENZER.runtime().beat);
    await waitBeat(p, bStop + 3); const lg3 = await L(p, {t: 1}); r.afterStopNow = lg3.filter(x => x.b > bStop + 0.3).map(x => x.b + ':' + x.n);
    r.drums = (await L(p, {t: 4})).filter(x => x.b >= 12).length;
    r.voicesT1 = await p.evaluate(() => { const v = window.SYNQUENZER.voices(); return v.filter ? v.filter(x => x.track === 1 && x.state !== 'released').length : JSON.stringify(v).slice(0, 200); });
    await p.evaluate(() => window.SYNQUENZER.stop()); await p.waitForTimeout(2500); r.vEnd = await p.evaluate(() => window.SYNQUENZER.voices());
    r.te = await p.evaluate(() => window.SYNQUENZER.tickErrors());
    return r; },
  record: async p => { await p.evaluate(setup); await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setRecOptions({countIn: 1, length: 'auto', quantize: '1/16'}); Q.selectSlot(3, 0); Q.rec(); });
    await p.waitForFunction(() => window.SYNQUENZER.runtime().rec.state === 'recording', null, {timeout: 10000, polling: 10}).catch(() => {});
    const sb = await p.evaluate(() => window.SYNQUENZER.runtime().beat);
    const at = [0, 2, 4, 6].map(k => Math.ceil(sb) + k), ch = [[60, 64, 67], [62, 65, 69], [64, 67, 71], [65, 69, 72]];
    for (let k = 0; k < at.length; k++) { await waitBeat(p, at[k] - .02); await p.evaluate(n => window.SYNQUENZER.chord(n, 700), ch[k]); }
    await waitBeat(p, at[3] + 1.6); await p.evaluate(() => window.SYNQUENZER.rec());
    const b0 = await p.evaluate(() => window.SYNQUENZER.runtime().beat);
    await waitBeat(p, b0 + 8);
    const clip = await p.evaluate(() => window.SYNQUENZER.getClip(3, 0));
    const lg = await L(p, {t: 3});
    return {clip: clip && {len: clip.len, n: clip.notes.map(x => x.n), t: clip.notes.map(x => Math.round(x.t * 4) / 4)}, arpDuringRec: lg.filter(x => x.b < b0 && x.src === 'arp').length, liveSrc: lg.filter(x => x.src === 'live').length,
      playback: lg.filter(x => x.b > b0 + 1).length, undo: await p.evaluate(() => window.SYNQUENZER.undoInfo().top && window.SYNQUENZER.undoInfo().top.label)}; },
  fang: async p => { await p.evaluate(setup); await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectSlot(3, 0); Q.clearLog(); Q.launchScene(0); });
    await waitBeat(p, 3.9); const ns = [72, 74, 76, 79, 76, 74, 72, 71];
    for (let k = 0; k < 8; k++) { await waitBeat(p, 4 + k - .03); await p.evaluate(n => window.SYNQUENZER.tap(n, 150), ns[k]); }
    await waitBeat(p, 12.3);
    const id = await p.evaluate(() => innerWidth > innerHeight ? '#bFangT' : '#bFang');
    const before = await p.evaluate(id => { const b = document.querySelector(id); return {lit: window.SYNQUENZER.runtime().fang, label: b.textContent}; }, id);
    await p.click(id); await p.waitForTimeout(150);
    const clip = await p.evaluate(() => window.SYNQUENZER.getClip(3, 0));
    await waitBeat(p, 22);
    const lg = await L(p, {t: 3});
    return {before, clip: clip && {len: clip.len, n: clip.notes.map(x => x.n)}, played: lg.filter(x => x.b >= 16).length, srcs: [...new Set(lg.map(x => x.src))]}; },
  transpose: async p => { await p.evaluate(setup); await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack(1); Q.setKbMode('transpose'); Q.clearLog(); Q.launchScene(0); });
    const car = [], cn = () => p.evaluate(() => { const c = window.SYNQUENZER.runtime().carrier; return c && c.name; });
    await waitBeat(p, 3); await p.evaluate(() => window.SYNQUENZER.tap(62, 300)); await waitBeat(p, 6); car.push(await cn());
    await waitBeat(p, 7); await p.evaluate(() => window.SYNQUENZER.chord([65, 69, 72], 300)); await waitBeat(p, 10); car.push(await cn());
    await waitBeat(p, 11); await p.evaluate(() => window.SYNQUENZER.tap(64, 300)); await waitBeat(p, 14); car.push(await cn());
    await waitBeat(p, 15); await p.evaluate(() => window.SYNQUENZER.resetCarrier()); await waitBeat(p, 20); car.push(await cn());
    const lg = await L(p, {t: 1});
    const bar = b0 => [...new Set(lg.filter(x => x.b >= b0 && x.b < b0 + 4).map(x => x.n))].sort((a, b) => a - b);
    const lg0 = await L(p, {t: 0});
    const bar0 = b0 => [...new Set(lg0.filter(x => x.b >= b0 && x.b < b0 + 4).map(x => x.n))].sort((a, b) => a - b);
    return {car, arp: [0, 4, 8, 12, 16].map(bar), clip0: [0, 4, 8, 12, 16].map(bar0), live: lg.filter(x => x.src === 'live').length, arpKeyNotes: lg.filter(x => x.src === 'arp' && [62, 65, 69, 72, 64].includes(x.n) && x.b > 3 && x.b < 4).length}; },
  save: async p => { await p.evaluate(setup);
    const v2 = fs.readFileSync('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-vs2reg/dirigent-v2.json', 'utf8');
    return p.evaluate(async v2 => { const Q = window.SYNQUENZER; const sl = ms => new Promise(r => setTimeout(r, ms));
      Q.mkSet(1, 'arp.type', 3); Q.mkSet(1, 'arp.range', 2); Q.mkSet(1, 'arp.steps', 0b10110111); Q.mkSet(1, 'arp.last', 6); Q.mkSet(1, 'arp.latch', 1); Q.mkSet(1, 'arp.swing', -40); Q.mkSet(1, 'arp.gate', 33); Q.mkSet(1, 'arp.res', 4); Q.mkSet(1, 'arp.ks', 1); Q.mkSet(1, 'arp.tgt', 2);
      const a1 = Q.mkGet(1).arp; const s1 = Q.serialize();
      await Q.newProject({init: true}); const ok = Q.importJSON(s1); await sl(300); const a2 = Q.mkGet(1) && Q.mkGet(1).arp;
      await Q.save(); await Q.newProject({init: true}); const ld = await Q.load(); await sl(300); const a3 = Q.mkGet(1) && Q.mkGet(1).arp;
      // old DIRIGENT v2 file, then switch a track to MS 2000 and arp on, play
      const ok2 = Q.importJSON(v2); await sl(500); const pj = Q.project();
      Q.setEngine(0, 'mk'); await sl(400); Q.mkSet(0, 'arp.on', 1); await sl(300); Q.setBpm(240); Q.clearLog(); Q.launchScene(0); await sl(2200);
      const lg = Q.noteLog(4000).filter(n => n.beat != null && n.beat >= 0); const by = {}; for (const n of lg) by[n.track + ':' + n.src] = (by[n.track + ':' + n.src] || 0) + 1;
      Q.stop();
      return {a1, rt1: JSON.stringify(a1) === JSON.stringify(a2), rt2: JSON.stringify(a1) === JSON.stringify(a3), ok, ld, ok2, v2fmt: pj.format, v2tracks: pj.tracks.map(t => t.sound && t.sound.engine), play: by}; }, v2); },
  midi: async p => { await p.evaluate(setup);
    return p.evaluate(async () => { const Q = window.SYNQUENZER; const got = [];
      window.claude = {use: async k => (k === 'downloads' ? {save: async ({filename, data}) => { got.push({filename, type: data.type, bytes: Array.from(new Uint8Array(await data.arrayBuffer()))}); }} : null)};
      Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]);
      for (const mode of ['scene', 'all', 'song']) { await Q.exportMidi({mode, scene: 0}); await new Promise(r => setTimeout(r, 800)); }
      const un = z => { const out = []; let i = 0; const dv = new DataView(new Uint8Array(z).buffer); while (i + 4 <= z.length && dv.getUint32(i, true) === 0x04034b50) { const m = dv.getUint16(i + 8, true), cs = dv.getUint32(i + 18, true), nl = dv.getUint16(i + 26, true), xl = dv.getUint16(i + 28, true); const name = String.fromCharCode(...z.slice(i + 30, i + 30 + nl)); out.push({name, method: m, data: z.slice(i + 30 + nl + xl, i + 30 + nl + xl + cs)}); i += 30 + nl + xl + cs; } return out; };
      const cnt = d => { let n = 0; for (let i = 0; i < d.length - 2; i++) if ((d[i] & 0xf0) === 0x90 && d[i + 2] > 0) n++; return n; };
      return got.map(g => { const f = un(g.bytes); const d = f[0] && f[0].data; return {filename: g.filename, type: g.type, files: f.map(x => x.name + ':' + x.method), mthd: d ? String.fromCharCode(...d.slice(0, 4)) : null, approxNoteOns: d ? cnt(d) : null}; }); }); },
  undo: async p => { await p.evaluate(setup);
    return p.evaluate(async () => { const Q = window.SYNQUENZER; const sl = ms => new Promise(r => setTimeout(r, ms));
      const u0 = Q.undoInfo().n; Q.mkSet(0, 'arp.on', 1); const a = Q.mkGet(0).arp.on; Q.undo(); await sl(100); const b = Q.mkGet(0).arp.on; Q.redo(); await sl(100); const c = Q.mkGet(0).arp.on;
      Q.selectTrack(0); Q.keyOn(60, .8, 'x1'); Q.keyOn(64, .8, 'x2'); await sl(600); Q.setEngine(0, 'analog'); await sl(100); Q.keyOff(60, 'x1'); Q.keyOff(64, 'x2'); await sl(1500);
      const v = Q.voices(); Q.panic();
      return {a, b, c, du: Q.undoInfo().n - u0, voicesAfterEngineSwitch: v.length != null ? v.length : v}; }); },
};
const res = {};
for (const k of Object.keys(scen)) {
  if (only && !only.includes(k)) continue;
  const {b, p, errs} = await open(VP, APP);
  try { res[k] = await scen[k](p); } catch (e) { res[k] = {fail: String(e).slice(0, 500)}; }
  res[k].errs = errs.slice();
  await b.close();
  console.log('==', k, JSON.stringify(res[k]).slice(0, 1800));
}
