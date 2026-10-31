// K1-05 (older builds without mkRender): the worklet of each build in Node with the flat patch + routes + FM block of every
// factory VA/WT/FM sound (taken from the new build's main thread), same phrase, seeded Math.random
import {chromium} from 'playwright';
import fs from 'fs';
import {makeScope} from './v3-mk1-node.mjs';
const [NEW, ...OLDS] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage();
await p.goto('file://' + NEW); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version);
const sounds = await p.evaluate(() => { const o = []; for (const [id, f] of FACTORY_BY_ID) if (f.engine === 'analog' || f.engine === 'wt' || f.engine === 'fm6') { const s = SQStore.normalizeSound(soundCopy(f)); o.push({id, flat: wkFlat(s), mods: wkMods(s), fm: s.engine === 'fm6' && s.p.fm6 ? s.p.fm6 : null}); } return o; });
await b.close();
const sr = 48000, N = Math.round(2.6 * sr / 128) * 128;
const ev = [[0, 1, 1, 48, .9, -1], [0, 1, 2, 55, .8, -1], [0, 1, 3, 64, .7, -1], [1.0, 2, 1], [1.0, 2, 2], [1.0, 2, 3], [1.1, 1, 4, 67, .8, -1], [1.6, 1, 5, 69, .6, -1], [1.7, 2, 4], [2.1, 2, 5]];
function render(file, s, fmOld) {
  const {G, procs} = makeScope(sr, file);
  const opt = {patch: s.flat, mods: s.mods}; if (s.fm) opt.fm6 = s.fm;
  const P = new procs['dirigent-analog']({processorOptions: opt});
  P.onMsg({tempo: {bpm: 120, start: null}}); P.onMsg({ev: ev.map(e => e.slice())});
  const l = new Float32Array(N), L = new Float32Array(128), R = new Float32Array(128);
  for (let f = 0; f < N; f += 128) { G.currentFrame = f; P.process([], [[L, R]]); l.set(L, f); }
  return l;
}
for (const OLD of OLDS) {
  const diff = []; let same = 0;
  for (const s of sounds) {
    let x, y; try { x = render(NEW, s); y = render(OLD, s); } catch (e) { diff.push({id: s.id, err: String(e).slice(0, 80)}); continue; }
    let a = 0, r = 0; for (let i = 0; i < x.length; i++) { const d = x[i] - y[i]; a += d * d; r += y[i] * y[i]; }
    const dB = r > 0 ? 10 * Math.log10(Math.max(1e-30, a) / r) : (a > 0 ? 0 : -999); if (dB <= -90) same++; else diff.push({id: s.id, dB: +dB.toFixed(1)});
  }
  console.log(OLD.split('/').pop(), JSON.stringify({n: sounds.length, same, diff}));
}
