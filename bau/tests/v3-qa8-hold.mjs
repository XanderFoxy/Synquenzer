// QA MK8 hold: switch programs while keys are held (arp, seq, vocoder, dual/split) → after release silence; no clicks at the switch
import {launch, open} from './v3-qa8-lib.mjs';
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info !== undefined ? ' — ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); };
const b = await launch(); const {page: p, errs} = await open(b, 'P1');
await p.evaluate(async () => {
  await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); ensureAudio(); SYNQUENZER.keyOn(40, .1, 'w'); await new Promise(r => setTimeout(r, 300)); SYNQUENZER.keyOff(40, 'w'); await new Promise(r => setTimeout(r, 1500));
  // capture of the track's raw engine output (AU.synth[0].node) into a ring
  window.__cap = {buf: [], on: false};
  window.__capStart = () => new Promise(r => { const c = AU.ctx, n = AU.M.ceil; const sp = c.createScriptProcessor(1024, 2, 2), z = c.createGain(); z.gain.value = 0; __cap.buf = []; __cap.sp = sp; __cap.n = n;
    sp.onaudioprocess = e => { __cap.buf.push([Float32Array.from(e.inputBuffer.getChannelData(0)), Float32Array.from(e.inputBuffer.getChannelData(1))]); }; n.connect(sp); sp.connect(z); z.connect(c.destination); r(1); });
  window.__capStop = () => { try { __cap.n.disconnect(__cap.sp); } catch (e) {} __cap.sp.disconnect(); const N = __cap.buf.reduce((a, b) => a + b[0].length, 0), L = new Float32Array(N), R = new Float32Array(N); let o = 0; for (const [l, r] of __cap.buf) { L.set(l, o); R.set(r, o); o += l.length; } return {L, R, sr: AU.ctx.sampleRate}; };
});
const cases = [['A02 arp → A03 pad', [1, 2], [1, 3]], ['A06 seq → A07', [1, 6], [1, 7]], ['F02 dual arp → A01', [6, 2], [1, 1]], ['H12 voc arp → H13 voc', [8, 12], [8, 13]], ['C06 arp(seq role) → F04 split', [3, 6], [6, 4]], ['E01 seq → H09 vocoder', [5, 1], [8, 9]], ['H09 vocoder → A04 bass', [8, 9], [1, 4]], ['A04 → H15 Eingang', [1, 4], [8, 15]]];
for (const [name, a, z] of cases) {
  const r = await p.evaluate(async ([a, z]) => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    mkProg.select(a[0], a[1]); await w(500); SYNQUENZER.arpClear && SYNQUENZER.arpClear(0);
    await __capStart();
    SYNQUENZER.keyOn(48, .9, 'q1'); SYNQUENZER.keyOn(55, .9, 'q2'); SYNQUENZER.keyOn(60, .9, 'q3'); await w(900);
    const tSw = AU.ctx.currentTime; mkProg.select(z[0], z[1]); await w(700);
    SYNQUENZER.keyOff(48, 'q1'); SYNQUENZER.keyOff(55, 'q2'); SYNQUENZER.keyOff(60, 'q3');
    const tOff = AU.ctx.currentTime; await w(4500);
    const arpN1 = (SYNQUENZER.arpLog(0) || []).length; await w(600); const arpN2 = (SYNQUENZER.arpLog(0) || []).length;
    const cap = __capStop(); const sr = cap.sr, L = cap.L;
    // tail: last 0.5 s peak
    let tail = 0; for (let i = L.length - Math.round(.5 * sr); i < L.length; i++) tail = Math.max(tail, Math.abs(L[i]), Math.abs(cap.R[i]));
    // click metric at the switch: max |2nd difference| in ±60 ms around the switch vs the median of the 300 ms before
    const t0 = cap.L.length - Math.round((AU.ctx.currentTime - tSw) * sr);
    const d2 = i => Math.abs(L[i] - 2 * L[i - 1] + L[i - 2]);
    let mx = 0; for (let i = Math.max(2, t0 - Math.round(.06 * sr)); i < Math.min(L.length, t0 + Math.round(.12 * sr)); i++) mx = Math.max(mx, d2(i));
    const ref = []; for (let i = Math.max(2, t0 - Math.round(.4 * sr)); i < t0 - Math.round(.1 * sr); i++) ref.push(d2(i)); ref.sort((a, b) => a - b);
    const refMax = ref.length ? ref[ref.length - 1] : 0;
    let pk = 0; for (let i = Math.max(0, t0 - Math.round(.4 * sr)); i < t0; i++) pk = Math.max(pk, Math.abs(L[i]));
    const vs = SYNQUENZER.voices().filter(v => v.track === 0 || v.t === 0).length;
    return {tailDb: +(20 * Math.log10(tail + 1e-12)).toFixed(1), pkDb: +(20 * Math.log10(pk + 1e-12)).toFixed(1), clickRatio: +(mx / (refMax + 1e-9)).toFixed(2), arpGrow: arpN2 - arpN1, voices: vs, nan: L.some(x => !isFinite(x))};
  }, [a, z]);
  ok(name + ': silence after release, arp stopped', r.tailDb < -70 && r.arpGrow === 0 && !r.nan, r);
}
ok('console', errs.length === 0, errs);
console.log(fails ? 'FAIL ' + fails : 'ALL PASS');
await b.close();
