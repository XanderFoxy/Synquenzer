// VV3-03: the track shot changes nothing (VV1-06 with the Spur-Bild) and the render speed stays as VV1-05 (3-min song, 9:16)
import { open } from './lib.mjs';
import { setup } from './setup.mjs';
import { lufs, pcmOf } from './n5-v-lufs.mjs';
import fs from 'fs';
const {b, p, errs} = await open();
await setup(p, {seq: true});
const res = {};
async function live() {
  return p.evaluate(async () => {
    const c = AU.ctx, sp = c.createScriptProcessor(4096, 2, 2), LL = [], RR = []; let on = false;
    sp.onaudioprocess = e => { if (!on) return; LL.push(new Float32Array(e.inputBuffer.getChannelData(0))); RR.push(new Float32Array(e.inputBuffer.getChannelData(1))); };
    AU.M.ceil.connect(sp); sp.connect(c.destination); clearLog(); on = true; SYNQUENZER.songSelect(null); songPlayStart(0);
    await new Promise(res => { const iv = setInterval(() => { if (!R.playing) { clearInterval(iv); res(); } }, 10); });
    const log = noteLog(4096); await new Promise(r => setTimeout(r, 4000)); on = false; AU.M.ceil.disconnect(sp); sp.disconnect();
    const n = LL.reduce((a, x) => a + x.length, 0), o = new Int16Array(n * 2); let k = 0;
    for (let j = 0; j < LL.length; j++) for (let i = 0; i < LL[j].length; i++, k++) { o[2 * k] = Math.max(-32768, Math.min(32767, Math.round(LL[j][i] * 32767))); o[2 * k + 1] = Math.max(-32768, Math.min(32767, Math.round(RR[j][i] * 32767))); }
    const u8 = new Uint8Array(o.buffer); let s = ''; for (let q = 0; q < u8.length; q += 32768) s += String.fromCharCode.apply(null, u8.subarray(q, q + 32768));
    return {sr: c.sampleRate, b64: btoa(s), log};
  });
}
const notes = log => log.filter(e => e.src !== 'click').map(e => [e.track, e.src, e.out, +(+e.beat).toFixed(3), e.vel]).sort((a, b) => a[3] - b[3] || a[0] - b[0] || a[2] - b[2]);
{
  const before = await p.evaluate(() => JSON.stringify(SYNQUENZER.serialize()));
  const live0 = await live();
  const m = await p.evaluate(async () => {
    window.__ids = [AU.ctx, AU.M, AU.hall, AU.echo, AU.kit, ...AU.tracks, ...AU.synth]; window.__sent = JSON.stringify(AU.synth.map(E => E ? E.sent : null));
    const out = {};
    for (const i of [2, 1, 0, 4]) { SYNQUENZER.vvTest({opus: true, spur: i}); const x = await SYNQUENZER.vvMake({fmt: i % 2 ? '16:9' : '9:16', view: 'song'}); out[i] = {dur: +x.dur.toFixed(2), how: x.how}; }
    SYNQUENZER.vvTest({}); return out;
  });
  const after = await p.evaluate(() => ({proj: JSON.stringify(SYNQUENZER.serialize()), same: [AU.ctx, AU.M, AU.hall, AU.echo, AU.kit, ...AU.tracks, ...AU.synth].every((x, k) => x === window.__ids[k]), sent: JSON.stringify(AU.synth.map(E => E ? E.sent : null)) === window.__sent, timer: !!AU.timer}));
  const live1 = await live();
  const a0 = pcmOf(live0.b64), a1 = pcmOf(live1.b64), l0 = lufs(a0.L, a0.R, live0.sr), l1 = lufs(a1.L, a1.R, live1.sr), n0 = notes(live0.log), n1 = notes(live1.log);
  // the offline sound with and without the track shot: same notes, same loudness (the picture only reads the note log)
  const off = await p.evaluate(async () => { const a = await SYNQUENZER.vvRender({}); SYNQUENZER.vvTest({spur: 2}); const b = await SYNQUENZER.vvRender({}); SYNQUENZER.vvTest({}); const k = l => JSON.stringify(l.map(e => [e.track, e.out, e.beat, e.vel])); return {sameNotes: k(a.log) === k(b.log), rmsA: a.rms, rmsB: b.rms}; });
  res['VV3-03 Klang'] = {jobs: m, projEqual: before === after.proj, nodesSame: after.same, paramsSame: after.sent, timer: after.timer, liveNotesSame: JSON.stringify(n0) === JSON.stringify(n1), notes: n0.length,
    liveLUFSbefore: +l0.toFixed(2), liveLUFSafter: +l1.toFixed(2), offline: {sameNotes: off.sameNotes, dRmsDb: +(20 * Math.log10(off.rmsB / off.rmsA)).toFixed(3)},
    ok: before === after.proj && after.same && after.sent && after.timer && JSON.stringify(n0) === JSON.stringify(n1) && Math.abs(l0 - l1) <= .1 && off.sameNotes && Math.abs(20 * Math.log10(off.rmsB / off.rmsA)) < .1};
}
// speed: 3-min song (the VV1-05 song + the MS track and its seq), 9:16, Song-Bild (VV1) vs Spur-Bild MS / FM
await p.evaluate(() => {
  const bars = Math.ceil(180 / (4 * 60 / S.bpm)), lanes = [[], [], [], [], [], []], marks = [];
  for (let k = 0; k < bars; k += 8) { lanes[0].push({bar: k, slot: 0}); lanes[1].push({bar: k, slot: (k / 8) % 2}); lanes[2].push({bar: k + 2, slot: 0}, {bar: k + 6, slot: -1}); lanes[4].push({bar: k, slot: 0}, {bar: k + 4, slot: 1}); marks.push({id: 'm' + k, a: k, len: Math.min(8, bars - k), name: k % 16 ? 'Refrain' : 'Strophe'}); }
  SYNQUENZER.setSong({bars, lanes, carrier: [], mel: {}, marks});
  window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push({t: Math.round(e.startTime), d: Math.round(e.duration)}); }).observe({type: 'longtask', buffered: false});
});
for (const [name, spur] of [['Song-Bild (VV1)', null], ['Spur-Bild MS (Synth 3)', 2], ['Spur-Bild FM (Synth 2)', 1]]) {
  const m = await p.evaluate(async spur => {
    SYNQUENZER.vvTest(spur == null ? {opus: true} : {opus: true, spur}); window.__lt = []; const t0 = performance.now();
    const x = await SYNQUENZER.vvMake({fmt: '9:16', view: 'song'}); const wall = performance.now() - t0, pr = SYNQUENZER.vvInfo().prof; SYNQUENZER.vvTest({});
    return {dur: x.dur, wall, msAudio: x.msAudio, frameMean: pr.frame ? pr.frame.sum / pr.frame.n : null, frameMax: pr.frame ? pr.frame.max : null, lt: window.__lt.map(e => ({at: e.t - t0, d: e.d})), big: pr.big || []};
  }, spur);
  const lt = m.lt.filter(e => e.at >= 0), outside = lt.filter(e => !m.big.some(x => x[0] === 'frame' && Math.abs(x[1] - (e.at + 0)) < 400));
  res['VV3-03 Tempo ' + name] = {dur: +m.dur.toFixed(1), wallS: +(m.wall / 1000).toFixed(1), xRealtime: +(m.dur * 1000 / m.wall).toFixed(2), frameMeanMs: +(m.frameMean || 0).toFixed(1), frameMaxMs: Math.round(m.frameMax || 0), longTasks: lt.length, longest: lt.length ? Math.max(...lt.map(e => e.d)) : 0};
}
const base = res['VV3-03 Tempo Song-Bild (VV1)'];
for (const k of Object.keys(res)) if (k.startsWith('VV3-03 Tempo') && k !== 'VV3-03 Tempo Song-Bild (VV1)') res[k].ok = res[k].xRealtime > 1 && res[k].xRealtime >= base.xRealtime * .9;
console.log(JSON.stringify(res, null, 1)); console.log('errors', errs);
fs.writeFileSync(new URL('../out-vv3-03.json', import.meta.url), JSON.stringify(res, null, 1));
await b.close();
