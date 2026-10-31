// VV1-03 for the MS 2000 engine (named in the VV1 Grundsatz): live capture vs offline render, track solo (only its lane in the song); plain and with ARP on
import { open, OUT } from './n5-v-abn-lib.mjs';
import { lufs, pcmOf } from './n5-v-lufs.mjs';
import fs from 'fs';
const tag = process.argv[2] || 'r1';
const {b, p, errs} = await open();
const res = {};
async function live() {
  return p.evaluate(async () => {
    const c = AU.ctx, sp = c.createScriptProcessor(4096, 2, 2), LL = [], RR = [];
    let on = false; sp.onaudioprocess = e => { if (!on) return; LL.push(new Float32Array(e.inputBuffer.getChannelData(0))); RR.push(new Float32Array(e.inputBuffer.getChannelData(1))); };
    AU.M.ceil.connect(sp); sp.connect(c.destination);
    clearLog(); on = true; songPlayStart(0);
    await new Promise(res => { const iv = setInterval(() => { if (!R.playing) { clearInterval(iv); res(); } }, 10); });
    const log = noteLog(4096); await new Promise(r => setTimeout(r, 5000));
    on = false; AU.M.ceil.disconnect(sp); sp.disconnect();
    const n = LL.reduce((a, x) => a + x.length, 0), o = new Int16Array(n * 2); let k = 0;
    for (let j = 0; j < LL.length; j++) for (let i = 0; i < LL[j].length; i++, k++) { o[2 * k] = Math.max(-32768, Math.min(32767, Math.round(LL[j][i] * 32767))); o[2 * k + 1] = Math.max(-32768, Math.min(32767, Math.round(RR[j][i] * 32767))); }
    const u8 = new Uint8Array(o.buffer); let s = ''; for (let q = 0; q < u8.length; q += 32768) s += String.fromCharCode.apply(null, u8.subarray(q, q + 32768));
    return {sr: c.sampleRate, b64: btoa(s), log: log.length};
  });
}
// onsets (rises of the 10-ms envelope by > 9 dB above −45 dBFS) – the arp steps
const onsets = (L, R, sr) => { const w = Math.round(sr / 100), e = []; for (let k = 0; k + w <= L.length; k += w) { let s = 0; for (let j = k; j < k + w; j++) s += L[j] * L[j] + R[j] * R[j]; e.push(10 * Math.log10(s / w / 2 + 1e-12)); } let n = 0; for (let k = 2; k < e.length; k++) if (e[k] > -45 && e[k] - e[k - 2] > 9) { n++; k += 4; } return n; };
await p.evaluate(async () => { setEngine(2, 'mk'); await new Promise(r => setTimeout(r, 1500)); });
const eng = await p.evaluate(() => ({eng: S.tracks[2].sound.engine, clips: S.tracks[2].clips.map(c => c ? c.notes.length : null), arpc: typeof ARPC}));
res.setup = eng;
await p.evaluate(() => SYNQUENZER.setSong({bars: 4, lanes: [[], [], [{bar: 0, slot: 0}], [], [], []], carrier: [], mel: {}, marks: []}));
for (const arp of [0, 1]) {
  if (arp) await p.evaluate(() => { SYNQUENZER.mkSet(2, 'arp.on', 1); });
  const st = await p.evaluate(() => ({arp: SYNQUENZER.mkGet(2).arp, arpc: typeof ARPC}));
  const lv = await live();
  const of = await p.evaluate(async () => { const r = await SYNQUENZER.vvRender(); return {dur: r.dur, log: r.log.length}; });
  const pc = await p.evaluate(() => SYNQUENZER.vvPcm());
  const a = pcmOf(lv.b64), o = pcmOf(pc.b64);
  const la = lufs(a.L, a.R, lv.sr), lo = lufs(o.L, o.R, pc.sr);
  // a second live run (spread of live vs live)
  const lv2 = await live(); const a2 = pcmOf(lv2.b64), la2 = lufs(a2.L, a2.R, lv2.sr);
  res['mk-arp' + arp] = {arpState: st, liveLUFS: +la.toFixed(2), live2LUFS: +la2.toFixed(2), offLUFS: +lo.toFixed(2), dLU: +(lo - la).toFixed(2), onsetsLive: onsets(a.L, a.R, lv.sr), onsetsLive2: onsets(a2.L, a2.R, lv2.sr), onsetsOff: onsets(o.L, o.R, pc.sr), logLive: lv.log, logOff: of.log};
}
res.errs = errs; console.log(JSON.stringify(res, null, 1));
fs.writeFileSync(OUT + tag + '-03m.json', JSON.stringify(res, null, 1));
await b.close();
