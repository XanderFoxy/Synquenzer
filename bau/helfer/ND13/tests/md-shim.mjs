// Node shim of the AudioWorkletGlobalScope for the 'synq-md' processor (ND1 tests, Anhang M measurements).
import fs from 'node:fs'; import vm from 'node:vm'; import path from 'node:path'; import url from 'node:url';
const HERE = path.dirname(url.fileURLToPath(import.meta.url));
export const SRC_PATH = path.join(HERE, '..', 'src', 'md-worklet.js');
export function loadSrc() { return fs.readFileSync(SRC_PATH, 'utf8'); }
export function makeEngine(sr = 48000, src = loadSrc()) {
  const procs = {};
  class AWP { constructor() { this.port = {onmessage: null, out: [], postMessage(m) { this.out.push(m); }}; } }
  const ctx = {sampleRate: sr, currentFrame: 0, currentTime: 0, registerProcessor: (n, c) => { procs[n] = c; }, AudioWorkletProcessor: AWP, performance, console};   // the context's own Math (a host-realm Math boxes every number)
  vm.createContext(ctx);
  const t0 = performance.now(); vm.runInContext(src, ctx); const loadMs = performance.now() - t0;
  const P = new procs['synq-md']();
  const E = {P, ctx, sr, loadMs, frame: 0,
    send(m) { P.port.onmessage({data: m}); },
    run(nsamp, onBlock) {
      const L = new Float32Array(nsamp), R = new Float32Array(nsamp); const oL = new Float32Array(128), oR = new Float32Array(128);
      for (let i = 0; i < nsamp; i += 128) {
        if (onBlock) onBlock(E.frame);
        ctx.currentFrame = E.frame; ctx.currentTime = E.frame / sr;
        P.process([], [[oL, oR]], {});
        const m = Math.min(128, nsamp - i); L.set(oL.subarray(0, m), i); R.set(oR.subarray(0, m), i); E.frame += 128;
      }
      return {L, R};
    }};
  return E;
}
export const INIT = {mWav: 'A1', mSpc: 0, mFrq: 25, mDyf: 0, mDec: 20, mDm: 'E1', mDd: 20, mBnd: 0, mBt: 10, mPit: 45,
  mNres: 0, mNtyp: 'L1', mNfrq: 30, mNdyf: 0, mNdec: 15, mNdm: 'E1', mNdd: 15, mClv: 0, mCty: 'n1',
  mNlv: 0, mTlv: 40, mLvl: 40, mPan: 0, mEqf: 25, mEqg: 0, mDst: 0, mDty: 'dr', mRvb: 0, mDly: 0, mMono: 0, mCrv: 'Li', mName: '', mCat: ''};
export const prog = o => Object.assign({}, INIT, o || {});
// one-shot render: chans {i: progOverrides}, hits [{ch, at, v, acc, tune, dec}], msgs [[t, msg]] sent at block boundaries
export function render(o) {
  const sr = o.sr || 48000, E = makeEngine(sr, o.src);
  if (o.kit) E.send({t: 'kit', p: o.kit});
  for (const k in (o.chans || {})) E.send({t: 'ch', ch: +k, p: prog(o.chans[k])});
  if (o.tap != null) E.send({t: 'test', tap: o.tap});
  if (o.lim) E.send({t: 'lim', s: o.lim});
  E.send({t: 'reset'});
  if (o.hits) E.send({t: 'hit', list: o.hits});
  const msgs = (o.msgs || []).slice().sort((a, b) => a[0] - b[0]); let mi = 0;
  const r = E.run(Math.round((o.sec || 1) * sr), fr => { while (mi < msgs.length && msgs[mi][0] * sr < fr + 128) E.send(msgs[mi++][1]); });
  r.E = E; return r;
}
