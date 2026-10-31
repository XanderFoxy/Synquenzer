// ND1-28 GC: 60 s render of a 12-channel 16th groove (all model families, effects) with --trace-gc; GC events after a 10 s warm-up.
// The processor is loaded with new Function (the realm's own Math - a vm context given the host Math boxes every number).
// Usage: node md1-gc.mjs   (re-runs itself with --trace-gc)
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url'; import {spawnSync} from 'node:child_process';
const HERE = path.dirname(url.fileURLToPath(import.meta.url));
if (!process.argv.includes('--child')) {
  const r = spawnSync(process.execPath, ['--trace-gc', url.fileURLToPath(import.meta.url), '--child'], {encoding: 'utf8', maxBuffer: 1 << 26});
  const out = r.stdout + r.stderr, a = out.indexOf('MARK'), b = out.indexOf('END');
  const seg = out.slice(a, b), sc = (seg.match(/Scavenge/g) || []).length, ms = (seg.match(/Mark-Compact|Mark-sweep/g) || []).length;
  const heap = (out.match(/HEAP ([-\d.]+) MB/) || [])[1];
  console.log((sc + ms === 0 ? 'OK  ' : 'FAIL') + ' ND1-28 GC 60 s (nach 10 s Warmlauf): Scavenge ' + sc + ', Mark-Compact ' + ms + ', Heap-Änderung ' + heap + ' MB');
  process.exit(0);
}
const src = fs.readFileSync(path.join(HERE, '../src/md-worklet.js'), 'utf8');
let Proc = null; class AWP { constructor() { this.port = {postMessage() {}, onmessage: null}; } } globalThis.currentFrame = 0;
new Function('sampleRate', 'registerProcessor', 'AudioWorkletProcessor', src)(48000, (n, c) => { Proc = c; }, AWP);
const INIT = {mWav: 'A1', mSpc: 0, mFrq: 25, mDyf: 0, mDec: 20, mDm: 'E1', mDd: 20, mBnd: 0, mBt: 10, mPit: 45, mNres: 0, mNtyp: 'L1', mNfrq: 30, mNdyf: 0, mNdec: 15, mNdm: 'E1', mNdd: 15, mClv: 0, mCty: 'n1', mNlv: 0, mTlv: 40, mLvl: 40, mPan: 0, mEqf: 25, mEqg: 0, mDst: 0, mDty: 'dr', mRvb: 0, mDly: 0, mMono: 0, mCrv: 'Li'};
const W = ['d5', 'C1', 'F2', 'A3', 'H1', 'C2', 'P1', 't2', 'r1', 'A6', 'd7', 'C3'];
const P = new Proc({}); const send = m => P.port.onmessage({data: m});
send({t: 'kit', p: {rvT: 'hA', rvC: -3, dlR: 40, dlF: 10}});
W.forEach((w, c) => send({t: 'ch', ch: c, p: Object.assign({}, INIT, {mWav: w, mPit: 40 + 3 * c, mBnd: c % 3 ? 20 : 0, mNlv: c % 2 ? 25 : 0, mNtyp: 'b2', mClv: 20, mCty: 'P2', mDst: c % 4 ? 0 : 20, mDty: ['dr', 'SA', 'rn'][c % 3], mEqg: c % 5 ? 0 : 4, mDly: c % 3 ? 0 : 15, mRvb: 10, mMono: c === 4 || c === 5 ? 1 : 0})}));
send({t: 'reset'});
const oL = new Float32Array(128), oR = new Float32Array(128), IN = [], OUT = [[oL, oR]], PA = {}; let f = 0;
const step = 0.125; let nextT = 0;
const run = sec => { for (let i = 0; i < 48000 * sec; i += 128) { const t = f / 48000; if (t + 0.5 > nextT) { const L = []; for (let k = 0; k < 8; k++) for (let c = 0; c < 12; c++) if ((k + c) % 3 !== 0) L.push({ch: c, at: nextT + k * step, v: 0.6 + 0.05 * (k % 4)}); send({t: 'hit', list: L}); nextT += 8 * step; } globalThis.currentFrame = f; P.process(IN, OUT, PA); f += 128; } };
run(10); globalThis.gc && gc(); const h0 = process.memoryUsage().heapUsed; console.error('MARK');
run(60); console.error('END'); console.error('HEAP ' + ((process.memoryUsage().heapUsed - h0) / 1048576).toFixed(2) + ' MB');
