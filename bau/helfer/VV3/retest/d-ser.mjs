import { open } from './lib.mjs';
import fs from 'fs';
const {b, p, errs} = await open();
const res = {};
const diffOf = () => p.evaluate(async (mode) => {
  const A = SYNQUENZER;
  const dd = (a, b, path, out) => { if (out.length > 12) return; if (JSON.stringify(a) === JSON.stringify(b)) return; if (a && b && typeof a === 'object' && typeof b === 'object') { for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) dd(a[k], b[k], path + '.' + k, out); } else out.push([path, JSON.stringify(a)?.slice(0, 120), JSON.stringify(b)?.slice(0, 120)]); };
  const parse = s => { let o = s; while (typeof o === 'string') o = JSON.parse(o); return o; };
  const out = {};
  // (a) twice serialize without anything in between
  const s0 = A.serialize(), s1 = A.serialize(); const d0 = []; dd(parse(s0), parse(s1), '', d0); out.idle = d0;
  // (b) around vvMake
  const b0 = A.serialize(); A.vvTest({opus: true, spur: 2}); await A.vvMake({fmt: '9:16', view: 'song'}); A.vvTest({}); const b1 = A.serialize();
  const d1 = []; dd(parse(b0), parse(b1), '', d1); out.make = d1;
  // (c) around vvRender + probes only
  const c0 = A.serialize(); await A.vvRender({}); for (let i = 0; i < S.tracks.length; i++) A.vv3Probe(i, 1, '9:16'); const c1 = A.serialize();
  const d2 = []; dd(parse(c0), parse(c1), '', d2); out.render = d2;
  out.type = typeof s0;
  return out;
});
await p.evaluate(async () => { const A = SYNQUENZER; A.setBpm(120); A.setEngine(2, 'mk'); A.setClip(2, 0, {len: 1, notes: [{t: 0, d: 2, n: 57, v: .9}]});
  const lanes = []; for (let i = 0; i < NT(); i++) lanes.push([]); lanes[2] = [{bar: 0, slot: 0}]; lanes[4] = [{bar: 0, slot: 0}]; A.setSong({bars: 2, lanes, carrier: [], mel: {}, marks: []}); await new Promise(r => setTimeout(r, 1500)); });
res.ser = await diffOf();
// VA tempo sync + retrig, note not on the bar
res.vaRetrig = await p.evaluate(async () => {
  const A = SYNQUENZER; A.setClip(0, 0, {len: 1, notes: [{t: .5, d: 3, n: 60, v: 1}]});
  const lanes = []; for (let i = 0; i < NT(); i++) lanes.push([]); lanes[0] = [{bar: 0, slot: 0}]; A.setSong({bars: 2, lanes, carrier: [], mel: {}, marks: []});
  const snd = S.tracks[0].sound, kp = {l1sync: snd.p.l1sync, l1retrig: snd.p.l1retrig}; snd.p.l1sync = 1; snd.p.l1retrig = 1;
  await A.vvRender({}); const t = .6, vs = vv3VaState(0, t, VV.last), nv = vs.nv;
  const r = {noteA: nv.a, modelPh: +vs.l1.ph.toFixed(3), workletPhRetrig: +vv3Frac(2 * (t - nv.a)).toFixed(3)}; Object.assign(snd.p, kp); return r;
});
res.errs = errs;
console.log(JSON.stringify(res, null, 1));
fs.writeFileSync(new URL('./out-d.json', import.meta.url), JSON.stringify(res, null, 1));
await b.close();
