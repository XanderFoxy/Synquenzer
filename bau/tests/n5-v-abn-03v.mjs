// VV1-03 for sung takes in the song (song.vox, „Punch im Song“): live capture vs offline render – level and position
import { open, OUT } from './n5-v-abn-lib.mjs';
import { lufs, pcmOf } from './n5-v-lufs.mjs';
const {b, p, errs} = await open();
const setup = await p.evaluate(async () => {
  const A = SYNQUENZER, sr = 48000, n = sr * 3, pcm = new Array(n);
  for (let k = 0; k < n; k++) { const t = k / sr; pcm[k] = Math.round(9000 * Math.sin(2 * Math.PI * 220 * t + 2 * Math.sin(2 * Math.PI * 5 * t)) * Math.min(1, t * 50, (3 - t) * 50)); }
  const r = await A.tkInject({pcm, sr, scene: 7, len: 2});
  const lanes = []; for (let i = 0; i < NT(); i++) lanes.push([]);
  A.setSong({bars: 4, lanes, carrier: [], mel: {}, marks: [], vox: [{id: 'V1', bar: 1, len: 2, take: r.id, in: 0, out: 3, at: 0}]});
  await new Promise(r => setTimeout(r, 600));
  return {id: r.id, vox: S.song.vox, st: stimmeT()};
});
async function live() {
  return p.evaluate(async () => {
    const c = AU.ctx, sp = c.createScriptProcessor(4096, 2, 2), LL = [], RR = []; let on = false, t0 = null;
    sp.onaudioprocess = e => { if (!on) return; if (t0 == null) t0 = e.playbackTime; LL.push(new Float32Array(e.inputBuffer.getChannelData(0))); RR.push(new Float32Array(e.inputBuffer.getChannelData(1))); };
    AU.M.ceil.connect(sp); sp.connect(c.destination); on = true; await new Promise(r => setTimeout(r, 300));
    songPlayStart(0); const st = R.startTime;
    await new Promise(res => { const iv = setInterval(() => { if (!R.playing) { clearInterval(iv); res(); } }, 10); });
    await new Promise(r => setTimeout(r, 3000)); on = false; AU.M.ceil.disconnect(sp); sp.disconnect();
    const n = LL.reduce((a, x) => a + x.length, 0), o = new Int16Array(n * 2); let k = 0;
    for (let j = 0; j < LL.length; j++) for (let i = 0; i < LL[j].length; i++, k++) { o[2 * k] = Math.round(LL[j][i] * 32767); o[2 * k + 1] = Math.round(RR[j][i] * 32767); }
    const u8 = new Uint8Array(o.buffer); let s = ''; for (let q = 0; q < u8.length; q += 32768) s += String.fromCharCode.apply(null, u8.subarray(q, q + 32768));
    return {sr: c.sampleRate, b64: btoa(s), songStartInCapture: st - t0, graphLat: AU.graphLat};
  });
}
const res = {setup};
const lv = await live();
const r = await p.evaluate(async () => { const x = await SYNQUENZER.vvRender(); return {dur: x.dur, songSec: x.songSec, tail: x.tail}; });
const pc = await p.evaluate(() => SYNQUENZER.vvPcm());
const a = pcmOf(lv.b64), o = pcmOf(pc.b64);
const first = (L, sr, from) => { for (let k = Math.round(from * sr); k < L.length; k++) if (Math.abs(L[k]) > .01) return k / sr; return null; };
const la = lufs(a.L, a.R, lv.sr), lo = lufs(o.L, o.R, pc.sr);
const onLive = first(a.L, lv.sr, 0), onOff = first(o.L, pc.sr, 0);
res.cmp = {render: r, liveLUFS: +la.toFixed(2), offLUFS: +lo.toFixed(2), dLU: +(lo - la).toFixed(2), onsetOff: onOff, expect: +(4 * 60 / 112).toFixed(4), onsetLiveRel: onLive != null ? +(onLive - lv.songStartInCapture - lv.graphLat).toFixed(4) : null};
res.errs = errs; console.log(JSON.stringify(res, null, 1)); await b.close();
