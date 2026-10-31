// VV1-03 (Ton = live: loudness, every track solo, takes) and VV1-06 (nothing changes, live afterwards the same)
import { open, SONG8 } from './lib.mjs';
import { lufs, pcmOf } from './n5-v-lufs.mjs';
import fs from 'fs';
const {b, p, errs} = await open();
const res = {};
// a take on the STIMME track (2 s, a sung-like tone with vibrato) in scene 1, in the song from bar 2
const song = await p.evaluate(async (s) => {
  const A = SYNQUENZER, sr = 48000, n = sr * 2, pcm = new Array(n);
  for (let k = 0; k < n; k++) { const t = k / sr, f = 220 * Math.pow(2, .3 * Math.sin(2 * Math.PI * 5 * t) / 12); pcm[k] = Math.round(9000 * Math.sin(2 * Math.PI * 220 * t + 2 * Math.sin(2 * Math.PI * 5 * t)) * Math.min(1, t * 20, (2 - t) * 20)); }
  const r = A.tkInject({pcm, sr, scene: 0, len: 1});
  const st = stimmeT(); const so = JSON.parse(JSON.stringify(s)); while (so.lanes.length < NT()) so.lanes.push([]); so.lanes[st] = [{bar: 2, slot: 0}];
  A.setSong(so); await new Promise(r => setTimeout(r, 600));
  return {st, r: !!r, ok: tkAudioOk(), buf: !!TK.buf.size, lanes: so.lanes.length};
}, SONG8);
res.setup = song;
// live capture of the master (ScriptProcessor on the ceiling) while the song plays once
async function live(range) {
  return p.evaluate(async (range) => {
    const c = AU.ctx, sp = c.createScriptProcessor(4096, 2, 2), LL = [], RR = [];
    let on = false; sp.onaudioprocess = e => { if (!on) return; LL.push(new Float32Array(e.inputBuffer.getChannelData(0))); RR.push(new Float32Array(e.inputBuffer.getChannelData(1))); };
    AU.M.ceil.connect(sp); sp.connect(c.destination);
    clearLog(); on = true;
    if (range) SYNQUENZER.songSelect(range.a, range.b - 1); else SYNQUENZER.songSelect(null);
    songPlayStart(range ? range.a : 0);
    const endB = range ? (range.b - range.a) * 4 : null;
    await new Promise(res => { const iv = setInterval(() => { if (endB != null && R.songPlay && songBeatOf(audBeat()) >= (range.b) * 4 - .02) songPlayEnd(true); if (!R.playing) { clearInterval(iv); res(); } }, 10); });
    const log = noteLog(4096);
    await new Promise(r => setTimeout(r, 6000));
    on = false; AU.M.ceil.disconnect(sp); sp.disconnect();
    const n = LL.reduce((a, x) => a + x.length, 0), o = new Int16Array(n * 2); let k = 0;
    for (let j = 0; j < LL.length; j++) for (let i = 0; i < LL[j].length; i++, k++) { o[2 * k] = Math.max(-32768, Math.min(32767, Math.round(LL[j][i] * 32767))); o[2 * k + 1] = Math.max(-32768, Math.min(32767, Math.round(RR[j][i] * 32767))); }
    const u8 = new Uint8Array(o.buffer); let s = ''; for (let q = 0; q < u8.length; q += 32768) s += String.fromCharCode.apply(null, u8.subarray(q, q + 32768));
    SYNQUENZER.songSelect(null);
    return {sr: c.sampleRate, b64: btoa(s), log};
  }, range || null);
}
async function offline(range) { const r = await p.evaluate(async range => SYNQUENZER.vvRender(range ? {range} : {}), range || null); const pc = await p.evaluate(() => SYNQUENZER.vvPcm()); return {r, pc}; }
const notes = log => log.filter(e => e.src !== 'click').map(e => [e.track, e.src === 'own' ? 'clip' : e.src, e.out, +(+e.beat).toFixed(3), e.vel]).sort((a, b) => a[3] - b[3] || a[0] - b[0] || a[2] - b[2]);
// whole song
{
  const lv = await live(null), of = await offline(null);
  const a = pcmOf(lv.b64), o = pcmOf(of.pc.b64), la = lufs(a.L, a.R, lv.sr), lo = lufs(o.L, o.R, of.pc.sr);
  const nl = notes(lv.log), no = notes(of.r.log), same = JSON.stringify(nl) === JSON.stringify(no);
  const takeNotes = 0;
  res['03-song'] = {liveLUFS: +la.toFixed(2), offLUFS: +lo.toFixed(2), dLU: +(lo - la).toFixed(2), notesLive: nl.length, notesOff: no.length, sameNotes: same, ok: Math.abs(lo - la) <= .5 && same};
  if (!same) { const d = []; for (let k = 0; k < Math.max(nl.length, no.length) && d.length < 6; k++) if (JSON.stringify(nl[k]) !== JSON.stringify(no[k])) d.push([nl[k], no[k]]); res['03-song'].diff = d; }
}
// every track solo (the others muted for the measurement, then back), 4 bars (2 … 6: the take sounds there)
const trk = await p.evaluate(() => S.tracks.map((t, i) => ({i, name: t.name, has: !!(S.song.lanes[i] && S.song.lanes[i].some(e => e.slot >= 0))})).filter(x => x.has));
for (const t of trk) {
  await p.evaluate(i => { window.__mute = S.tracks.map(x => !!x.mute); S.tracks.forEach((x, k) => { x.mute = k !== i; }); }, t.i);
  const rg = {a: 2, b: 6};
  const lv = await live(rg), of = await offline(rg);
  await p.evaluate(() => { S.tracks.forEach((x, k) => { x.mute = window.__mute[k]; }); });
  const a = pcmOf(lv.b64), o = pcmOf(of.pc.b64), la = lufs(a.L, a.R, lv.sr), lo = lufs(o.L, o.R, of.pc.sr);
  res['03-solo-' + t.name] = {liveLUFS: +la.toFixed(2), offLUFS: +lo.toFixed(2), dLU: +(lo - la).toFixed(2), ok: isFinite(lo) && lo > -45 && Math.abs(lo - la) <= .5};
}
// VV1-06: project deep-equal around a whole video job; the live engine afterwards as before
{
  const before = await p.evaluate(() => ({proj: JSON.stringify(SYNQUENZER.serialize()), sent: JSON.stringify(AU.synth.map(E => E ? E.sent : null)), nodes: [AU.M, AU.hall, AU.echo, ...AU.tracks].map(x => x), ctx: AU.ctx}).proj);
  const live0 = await live(null);
  const m = await p.evaluate(async () => { SYNQUENZER.vvTest({opus: true}); window.__ids = [AU.ctx, AU.M, AU.hall, AU.echo, AU.kit, ...AU.tracks, ...AU.synth]; window.__sent = JSON.stringify(AU.synth.map(E => E ? E.sent : null)); const x = await SYNQUENZER.vvMake({fmt: '9:16', view: 'matrix'}); return x.how; });
  const after = await p.evaluate(() => ({proj: JSON.stringify(SYNQUENZER.serialize()), same: [AU.ctx, AU.M, AU.hall, AU.echo, AU.kit, ...AU.tracks, ...AU.synth].every((x, k) => x === window.__ids[k]), sent: JSON.stringify(AU.synth.map(E => E ? E.sent : null)) === window.__sent, timer: !!AU.timer, voices: VOICES.length, R: R.playing}));
  const live1 = await live(null);
  const a0 = pcmOf(live0.b64), a1 = pcmOf(live1.b64), l0 = lufs(a0.L, a0.R, live0.sr), l1 = lufs(a1.L, a1.R, live1.sr);
  const n0 = notes(live0.log), n1 = notes(live1.log);
  // two offline renders: bit-identical?
  const o1 = await offline(null), o2 = await offline(null);
  res['06'] = {how: m, projEqual: before === after.proj, nodesSame: after.same, paramsSame: after.sent, timer: after.timer, liveNotesSame: JSON.stringify(n0) === JSON.stringify(n1), notes: n0.length, liveLUFSbefore: +l0.toFixed(2), liveLUFSafter: +l1.toFixed(2), offlineBitEqual: o1.pc.b64 === o2.pc.b64,
    ok: before === after.proj && after.same && after.sent && after.timer && JSON.stringify(n0) === JSON.stringify(n1) && Math.abs(l0 - l1) <= .1};
}
console.log(JSON.stringify(res, null, 1)); console.log('errors', errs);
fs.writeFileSync('n5-v-out/a3.json', JSON.stringify(res, null, 1));
await b.close();
