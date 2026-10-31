// builds the demo song INSIDE the app (API), saves project JSON + renders WAV via the app's offline renderer
import { open } from './lib.mjs'; import fs from 'fs';
const voc = fs.readFileSync('voc48.raw').toString('base64');
const {b, p, errs} = await open();
const out = await p.evaluate(async (voc) => {
  const A = SYNQUENZER, W = ms => new Promise(r => setTimeout(r, ms));
  try { const m = mkLoad(); if (m && m.then) await m; } catch (e) {} for (let i = 0; i < 50 && !FACTORY_BY_ID.has('f-mk-h14'); i++) await W(100);
  A.newProject({}); await W(400);
  setBpm(118); setProjectKey({root: 9, scale: 'aeolian'}); A.oneScale(false);
  S.name = 'Synthie-Demo 84';
  while (A.canAddTrack()) A.addTrack();
  await W(200);
  const P = (t, id) => A.loadPreset(t, id);
  P(0, 'f-synthpop-bass'); P(1, 'f-kristallglocke'); P(2, 'f-ensemble-streicher'); P(3, 'f-poly-stab'); P(5, 'f-sync-lead'); P(6, 'f-mk-h14');
  A.loadKit('Gated 84');
  const names = ['Bass', 'Arp', 'Fläche', 'Stabs', 'Drums', 'Lead', 'Vocoder', 'Stimme'];
  S.tracks.forEach((t, i) => t.name = names[i]);
  tkFlag(7, true);
  // voice take (modulator for the vocoder)
  const raw = Uint8Array.from(atob(voc), c => c.charCodeAt(0)), pcm = new Int16Array(raw.buffer);
  const tk = tkAddPcmTake(pcm, 48000, 'import'); await tk.stored;
  const tlen = pcm.length / 48000;
  A.mkIn(6, 'e2', 7, 0); A.mkSet(6, 'voc.hold', null); A.mkSet(6, 'voc.lvl', 60);
  const lf = S.tracks[5].sound.fx; if (lf) { lf.dly = Math.max(lf.dly || 0, .35); lf.rev = Math.max(lf.rev || 0, .25); } applyTrackParams(5, true);
  // ---------- music ----------
  const K = {root: 9, scale: 'aeolian'};
  const N = (t, n, d, v) => ({t, n, d, v});
  const CH = [ // Am F C G
    {r: 33, pad: [57, 60, 64], st: [69, 72, 76], arp: [69, 72, 76, 81]},
    {r: 29, pad: [57, 60, 65], st: [69, 72, 77], arp: [65, 69, 72, 77]},
    {r: 36, pad: [55, 60, 64], st: [67, 72, 76], arp: [67, 72, 76, 79]},
    {r: 31, pad: [55, 59, 62], st: [67, 71, 74], arp: [67, 71, 74, 79]}];
  const clip = (len, notes) => ({len, key: K, notes});
  const rep = (bars, fn) => { const o = []; for (let b = 0; b < bars; b++) fn(CH[b % 4], b * 4, b, o); return o; };
  // bass: 16th sequencer with octave jumps
  const BPAT = [0, 0, 12, 0, 0, 12, 0, 0, 0, 0, 12, 0, 0, 12, 0, 12];
  const bass16 = (vel) => rep(4, (c, o, b, a) => BPAT.forEach((x, i) => a.push(N(o + i * .25, c.r + x, .2, (i % 4 === 0 ? .95 : .7) * vel))));
  const bass8 = () => rep(4, (c, o, b, a) => { for (let i = 0; i < 8; i++) a.push(N(o + i * .5, c.r + (i % 2 ? 12 : 0), .4, .8)); });
  // arp: FM bell
  const arp16 = (v) => rep(4, (c, o, b, a) => { const s = [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 2, 3, 2, 1]; s.forEach((k, i) => a.push(N(o + i * .25, c.arp[k], .22, (i % 4 === 0 ? .9 : .6) * v))); });
  const arp8 = () => rep(4, (c, o, b, a) => { const s = [0, 2, 1, 3, 2, 1, 3, 2]; s.forEach((k, i) => a.push(N(o + i * .5, c.arp[k], .45, i % 2 ? .55 : .8))); });
  const pad = () => rep(4, (c, o, b, a) => c.pad.forEach(n => a.push(N(o, n, 3.9, .7))));
  const stabs = () => rep(4, (c, o, b, a) => [[0, .9], [1.5, .75], [2.75, .7], [3.5, .8]].forEach(([t, v]) => c.st.forEach(n => a.push(N(o + t, n, .22, v)))));
  const stabsSparse = () => rep(4, (c, o, b, a) => [[0, .85], [2.5, .7]].forEach(([t, v]) => c.st.forEach(n => a.push(N(o + t, n, .25, v)))));
  const HOOK = [[0, 76, .75], [1, 79, .5], [1.5, 76, .5], [2, 74, .5], [2.5, 72, 1.4], [4, 72, .5], [4.5, 74, .5], [5, 72, .5], [5.5, 69, 1.2], [7, 72, .5], [7.5, 74, .5],
    [8, 76, .75], [9, 79, .5], [9.5, 84, .75], [10.5, 79, .5], [11, 76, .9], [12, 74, 1], [13, 71, .5], [13.5, 74, .5], [14, 79, 1.4], [15.5, 74, .45]];
  const VERSE = [[0, 69, 1.5], [2, 72, 1], [3, 71, .5], [3.5, 69, .5], [4, 65, 2], [6, 69, 1], [7, 72, 1], [8, 67, 1.5], [10, 72, 1], [11, 76, 1], [12, 74, 2.8], [15, 71, .9]];
  const mel = (arr, v) => arr.map(([t, n, d]) => N(t, n, d, v));
  // drums
  const D = {k: 36, s: 38, cl: 39, hc: 42, ho: 46, tl: 45, tm: 47, th: 50, cy: 49, sh: 70, rim: 37};
  const groove = (bars, o) => { o = o || {}; const a = []; for (let b = 0; b < bars; b++) { const B = b * 4;
      for (const t of (o.four ? [0, 1, 2, 3] : [0, 1.75, 2, 2.5])) a.push(N(B + t, D.k, .1, .95));
      for (const t of [1, 3]) { a.push(N(B + t, D.s, .1, .95)); if (o.clap) a.push(N(B + t, D.cl, .1, .7)); }
      for (let i = 0; i < (o.h16 ? 16 : 8); i++) { const t = i * (o.h16 ? .25 : .5); a.push(N(B + t, (o.open && i % (o.h16 ? 4 : 2) === (o.h16 ? 2 : 1)) ? D.ho : D.hc, .1, i % 2 ? .45 : .7)); }
      if (o.sh) for (let i = 0; i < 16; i++) a.push(N(B + i * .25, D.sh, .1, i % 2 ? .35 : .5));
      if (b === 0 && o.crash) a.push(N(B, D.cy, .5, .9));
      if (o.fill && b === bars - 1) { a.push(N(B + 3, D.th, .1, .8)); a.push(N(B + 3.25, D.tm, .1, .8)); a.push(N(B + 3.5, D.tl, .1, .85)); a.push(N(B + 3.75, D.s, .1, 1)); } }
    return a; };
  const build = () => { const a = []; for (let b = 0; b < 4; b++) { const B = b * 4; a.push(N(B, D.k, .1, .9)); a.push(N(B + 2, D.k, .1, .9));
      const st = b < 2 ? .5 : (b < 3 ? .25 : .125); for (let t = 0; t < 4 - 1e-6; t += st) a.push(N(B + t, D.s, .08, .35 + .6 * ((B + t) / 16)));
      for (let i = 0; i < 8; i++) a.push(N(B + i * .5, D.hc, .1, .4)); } return a; };
  const set = (t, s, c) => A.setClip(t, s, c);
  // scene 0: HOOK (2 bars)
  set(0, 0, clip(2, bass16(1).filter(n => n.t < 8)));
  set(3, 0, clip(2, [[0, CH[0]], [.75, CH[0]], [1.5, CH[0]], [2.5, CH[0]], [4, CH[1]], [4.75, CH[1]], [5.5, CH[1]], [6.5, CH[1]], [7, CH[1]]].flatMap(([t, c]) => c.st.map(n => N(t, n, .25, .9)))));
  set(4, 0, clip(2, groove(2, {crash: true, clap: true, fill: true})));
  set(6, 0, clip(2, [57, 60, 64].map(n => N(0, n, 3.6, .95)).concat([57, 60, 65].map(n => N(4, n, 3.6, .9)))));
  set(7, 0, {len: 2, key: K, notes: [], audio: {take: tk.id, in: 0, out: tlen, at: 0, gain: 1}});
  set(2, 0, clip(2, pad().filter(n => n.t < 8)));
  // scene 1: VERSE A (4-bar loop)
  set(0, 1, clip(4, bass16(.9))); set(1, 1, clip(4, arp8())); set(2, 1, clip(4, pad())); set(4, 1, clip(4, groove(4, {fill: true})));
  // scene 2: VERSE B
  set(0, 2, clip(4, bass16(1))); set(1, 2, clip(4, arp16(.8))); set(2, 2, clip(4, pad())); set(3, 2, clip(4, stabsSparse())); set(4, 2, clip(4, groove(4, {open: true, fill: true}))); set(5, 2, clip(4, mel(VERSE, .8)));
  // scene 3: BUILD (4 bars)
  set(0, 3, clip(4, bass8())); set(1, 3, clip(4, rep(4, (c, o, b, a) => { for (let i = 0; i < 16; i++) a.push(N(o + i * .25, c.arp[i % 4] + (b >= 2 ? 12 : 0), .2, .45 + .5 * ((o + i * .25) / 16))); })));
  set(2, 3, clip(4, pad())); set(4, 3, clip(4, build()));
  set(6, 3, clip(1, [57, 60, 64].map(n => N(0, n, 3.4, .85)))); set(7, 3, {len: 1, key: K, notes: [], audio: {take: tk.id, in: 0, out: tlen, at: 0, gain: 1}});
  // scene 4: DROP / REFRAIN
  set(0, 4, clip(4, bass16(1))); set(1, 4, clip(4, arp16(.9))); set(2, 4, clip(4, pad())); set(3, 4, clip(4, stabs())); set(4, 4, clip(4, groove(4, {four: true, clap: true, open: true, crash: true, sh: true, fill: true})));
  set(5, 4, clip(4, mel(HOOK, .95)));
  set(6, 4, clip(4, [57, 60, 64].map(n => N(0, n, 3.6, .9)))); set(7, 4, {len: 4, key: K, notes: [], audio: {take: tk.id, in: 0, out: tlen, at: 0, gain: 1}});
  // scene 5: BREAK
  set(1, 5, clip(4, arp8())); set(2, 5, clip(4, pad())); set(0, 5, clip(4, rep(4, (c, o, b, a) => a.push(N(o, c.r + 12, 3.8, .6)))));
  set(6, 5, clip(2, [57, 60, 64].map(n => N(0, n, 3.6, .8)).concat([55, 59, 62].map(n => N(4, n, 3.6, .8))))); set(7, 5, {len: 2, key: K, notes: [], audio: {take: tk.id, in: 0, out: tlen, at: 0, gain: 1}});
  set(4, 5, clip(4, [0, 1, 2, 3].flatMap(b => [N(b * 4, D.k, .1, .5), N(b * 4 + 2, D.rim, .1, .5)]).concat(build().filter(n => n.t >= 12))));
  // scene 6: OUTRO
  set(3, 6, clip(2, CH[0].st.map(n => N(0, n, .5, 1)).concat(CH[0].st.map(n => N(4, n - 12, 2, .8)))));
  set(2, 6, clip(2, [57, 60, 64, 69].map(n => N(0, n, 7.5, .7)))); set(0, 6, clip(2, [N(0, 33, 6, .9)]));
  set(4, 6, clip(2, [N(0, D.k, .1, 1), N(0, D.cy, 1, 1), N(0, D.s, .1, 1)]));
  set(6, 6, clip(2, [57, 60, 64].map(n => N(0, n, 3.8, .9)))); set(7, 6, {len: 2, key: K, notes: [], audio: {take: tk.id, in: 0, out: tlen, at: 0, gain: 1}});
  ['Haken', 'Strophe A', 'Strophe B', 'Aufbau', 'Drop', 'Break', 'Schluss'].forEach((n, i) => S.scenes[i].name = n);
  // ---------- song ----------
  const SEC = [[0, 0, 'Haken'], [2, 1, 'Strophe'], [10, 2, 'Strophe 2'], [18, 3, 'Aufbau'], [22, 4, 'Drop'], [30, 5, 'Break'], [34, 4, 'Drop 2'], [42, 6, 'Schluss']], BARS = 44;
  const lanes = S.tracks.map((tr, t) => SEC.map(([bar, s]) => ({bar, slot: tr.clips[s] ? s : -1})));
  // re-trigger drop clips in the second half of each section: keep; marks
  const marks = SEC.map(([bar, s, name], i) => ({id: 'm' + (i + 1), a: bar, len: (SEC[i + 1] ? SEC[i + 1][0] : BARS) - bar, name}));
  A.setSong({bars: BARS, lanes, carrier: [], mel: {}, marks});
  // filter movement on pad + arp (slow LFO), delay on lead
  return {tk: tk.id, tlen, nt: A.NT(), song: !!S.song, mkIn: A.mkIn(6), err: null};
}, voc);
console.log(out);
const proj = await p.evaluate(() => serialize());
fs.writeFileSync('demo-synthie-track.json', proj);
const r = await p.evaluate(async () => { const x = await SYNQUENZER.vvRender(); return x; });
console.log(JSON.stringify(r).slice(0, 400));
const pcm = await p.evaluate(() => SYNQUENZER.vvPcm(0));
const L = Buffer.from(pcm.b64, 'base64');
const hdr = Buffer.alloc(44); const sr = pcm.sr || 48000; hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + L.length, 4); hdr.write('WAVEfmt ', 8); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22); hdr.writeUInt32LE(sr, 24); hdr.writeUInt32LE(sr * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34); hdr.write('data', 36); hdr.writeUInt32LE(L.length, 40);
fs.writeFileSync('raw.wav', Buffer.concat([hdr, L]));
console.log('sr', pcm.sr, Object.keys(pcm), 'errs', errs.slice(0, 5));
await b.close();
