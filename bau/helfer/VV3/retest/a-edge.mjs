// edge-case sweep: every track / engine / format / time, collect console errors and non-finite probe values, write PNGs
import { open } from './lib.mjs';
import fs from 'fs';
const {b, p, errs} = await open();
fs.mkdirSync(new URL('./png/', import.meta.url), {recursive: true});
const info = await p.evaluate(async () => {
  const A = SYNQUENZER; A.setBpm(120);
  A.setEngine(2, 'mk'); A.setEngine(3, 'wt');
  const out = {clips: [0,1,2,3,4,5].map(i => { try { const c = A.getClip(i, 0); return c ? (c.notes || []).length : null; } catch (e) { return 'ERR ' + e.message; } })};
  A.setClip(0, 0, {len: 1, notes: [{t: 0, d: 1, n: 40, v: .9}, {t: 2, d: .5, n: 43, v: .6}]});
  A.setClip(1, 0, {len: 1, notes: [{t: 0, d: .5, n: 60, v: .9}, {t: 1, d: .5, n: 64, v: .7}, {t: 2, d: 1.5, n: 67, v: .5}]});
  A.setClip(2, 0, {len: 2, notes: [{t: 0, d: 3.5, n: 57, v: .9}, {t: 4, d: 1, n: 60, v: .8}, {t: 4.5, d: 2, n: 64, v: .8}]});
  A.setClip(3, 0, {len: 1, notes: [{t: 1, d: 2, n: 52, v: .9}]});
  const sr = 48000, n = sr * 2, pcm = new Array(n); for (let k = 0; k < n; k++) pcm[k] = Math.round(9000 * Math.sin(2 * Math.PI * 220 * k / sr) * Math.min(1, k / 2000, (n - k) / 2000));
  const r = await A.tkInject({pcm, sr, scene: 0, len: 1}); const st = stimmeT();
  const lanes = []; for (let i = 0; i < NT(); i++) lanes.push([]);
  lanes[0] = [{bar: 0, slot: 0}]; lanes[1] = [{bar: 0, slot: 0}]; lanes[2] = [{bar: 0, slot: 0}]; lanes[3] = [{bar: 1, slot: 0}]; lanes[4] = [{bar: 0, slot: 0}];
  if (st >= 0) lanes[st] = [{bar: 2, slot: 0}];
  A.setSong({bars: 4, lanes, carrier: [], mel: {}, marks: []});
  await new Promise(r => setTimeout(r, 600));
  out.st = st; out.tr = S.tracks.map(t => [t.name, t.kind, !!t.stimme, t.sound && t.sound.engine]); out.r = r;
  return out;
});
console.log(JSON.stringify(info));
const res = {bad: [], probes: {}};
async function sweep(tag, fmts = ['9:16', '16:9']) {
  const r = await p.evaluate(async ({tag, fmts}) => {
    const A = SYNQUENZER, bad = [], pr = {};
    const finite = (o, path) => { if (o == null) return; if (typeof o === 'number') { if (!isFinite(o)) bad.push(path + '=' + o); return; } if (Array.isArray(o)) o.forEach((x, k) => finite(x, path + '[' + k + ']')); else if (typeof o === 'object') for (const k in o) finite(o[k], path + '.' + k); };
    const dur = VV.last ? VV.last.dur : 10;
    const ts = [-3, -0.01, 0, 0.001, 0.25, 1, 1.999, 2.0, 3.3, 4.01, dur / 2, dur - .01, dur, dur + 2, dur + 30, 1e5, NaN];
    for (let i = 0; i < S.tracks.length; i++) for (const fmt of fmts) for (const t of ts) {
      let q; try { q = A.vv3Probe(i, t, fmt); } catch (e) { bad.push(tag + ' THROW i' + i + ' ' + fmt + ' t' + t + ': ' + e.message); continue; }
      if (!isNaN(t)) finite(q, tag + ' i' + i + ' ' + fmt + ' t' + t);
      if (fmt === '16:9' && (t === 1 || t === 4.01)) pr['i' + i + ' t' + t] = q;
      if (!q && !(S.tracks[i].stimme)) bad.push(tag + ' noprobe i' + i + ' ' + fmt + ' t' + t);
    }
    return {bad, pr};
  }, {tag, fmts});
  res.bad.push(...r.bad); res.probes[tag] = r.pr;
}
async function png(name, i, t, fmt) {
  const d = await p.evaluate(({i, t, fmt}) => SYNQUENZER.vv3Png(i, t, fmt), {i, t, fmt});
  fs.writeFileSync(new URL('./png/' + name + '.png', import.meta.url), Buffer.from(d.split(',')[1], 'base64'));
}
// 0) without any render (live source) and before any vvRender
await sweep('noRender', ['16:9']);
await p.evaluate(async () => { await SYNQUENZER.vvRender({}); });
console.log('dur', await p.evaluate(() => [VV.last.dur, VV.last.t0, VV.last.a, (VV.last.nt || []).map(x => x ? x.length : 0)]));
await sweep('base');
const NTR = await p.evaluate(() => S.tracks.length);
for (let i = 0; i < NTR; i++) for (const fmt of ['9:16', '16:9']) await png('base-i' + i + '-' + fmt.replace(':', 'x'), i, i === 6 ? 5 : 1.1, fmt);
// MS variations
const mkCfg = [];
for (const ks of [0, 1, 2]) for (const ty of [0, 1, 2, 3]) for (const run of [0, 1]) mkCfg.push({ks, ty, run});
for (const c of mkCfg) {
  await p.evaluate(c => { const s = (k, v) => SYNQUENZER.mkSet(2, 't.0.' + k, v);
    s('seq.on', 1); s('seq.ks', c.ks); s('seq.type', c.ty); s('seq.run', c.run); s('seq.last', 6); s('seq.res', 7);
    s('seq.q.0.k', 11); s('seq.q.1.k', 2); for (let k = 0; k < 16; k++) { s('seq.q.0.v.' + k, (k * 17) % 60 - 30); s('seq.q.1.v.' + k, (k % 3) - 1); }
    s('l1.w', c.ty); s('l2.w', 3 - c.ty); s('l1.ks', c.ks); s('l2.ks', 2 - c.ks); s('l1.sync', c.run); s('l2.sync', 1 - c.run); }, c);
  await sweep('mk ks' + c.ks + ' ty' + c.ty + ' run' + c.run, c.ty === 0 && c.run === 0 ? ['9:16', '16:9'] : ['16:9']);
}
// Dual mode
await p.evaluate(() => { SYNQUENZER.mkSet(2, 'mode', 1); });
await sweep('mk dual');
for (const fmt of ['9:16', '16:9']) await png('mk-dual-' + fmt.replace(':', 'x'), 2, 1.3, fmt);
await p.evaluate(async () => { await SYNQUENZER.vvRender({}); });
await sweep('mk dual rerender');
// fm2, and wt LFO shapes, analog retrig/sync/fade
await p.evaluate(() => { SYNQUENZER.setEngine(0, 'fm2'); });
await sweep('fm2 on 0 (no rerender)');
await p.evaluate(async () => { SYNQUENZER.setEngine(0, 'analog'); for (const [k, v] of [['l1shape', 4], ['l1sync', .5], ['l1retrig', 1], ['l1fade', 2], ['l2shape', 3], ['l2rate', 0]]) { try { SYNQUENZER.setParam(0, k, v); } catch (e) { console.error('setParam ' + k + ' ' + e.message); } } await SYNQUENZER.vvRender({}); });
await sweep('va lfo shapes');
// empty song tail: a render range and a track whose engine changes after the render
await p.evaluate(async () => { await SYNQUENZER.vvRender({range: {a: 1, b: 3}}); });
await sweep('range 1-3');
for (const fmt of ['9:16', '16:9']) { await png('mk-range-' + fmt.replace(':', 'x'), 2, 1.3, fmt); await png('va-range-' + fmt.replace(':', 'x'), 0, .6, fmt); }
res.errs = errs;
fs.writeFileSync(new URL('./out-a.json', import.meta.url), JSON.stringify(res, null, 1));
console.log('bad', res.bad.length, res.bad.slice(0, 40)); console.log('errs', errs.slice(0, 40));
await b.close();
