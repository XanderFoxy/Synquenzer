// MK3-01 / MK3-07 / MK3-06 in Chromium OfflineAudioContext via the app's mkRender (B.4 Nr. 3, B.7)
import {launch, open, J} from './v3-qa-mk3-lib.mjs';
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const b = await launch();
const MK2 = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/MK2.html';
const run = async (file, fn, arg) => { const {ctx, page, errs} = await open('L1', {file}); const r = await page.evaluate(fn, arg); await ctx.close(); return [r, errs]; };
const EV = [[0, 'on', 48, .8], [.05, 'on', 55, .7], [.1, 'on', 60, .9], [.15, 'on', 64, .6], [.2, 'on', 67, .8], [.5, 'off', 48], [.6, 'off', 55], [.7, 'off', 60], [.8, 'off', 64], [.9, 'off', 67]];
const [r1, e1] = await run(undefined, async EV => {
  const s = deep(sndOf(0)), m = s.p.mk; m.mode = 1; m.tv = 1; m.scale = 6; m.skey = 3;
  Object.assign(m.t[0].o1, {w: 6, c1: 70, c2: 30}); Object.assign(m.t[0].mix, {o1: 100, o2: 50, n: 80}); Object.assign(m.t[0].l1, {w: 3, f: 90}); m.t[0].p[0] = {s: 2, d: 4, i: 40};
  Object.assign(m.t[1].o1, {w: 1, c1: 30}); Object.assign(m.t[1].mix, {o1: 100, o2: 0, n: 60}); Object.assign(m.t[1].l2, {w: 3, f: 100, ks: 2}); m.t[1].p[1] = {s: 3, d: 0, i: 5}; m.t[1].a.pan = 30;
  const R = (x, o) => SYNQUENZER.mkRender(x, EV, Object.assign({sec: 1.4, seed: 9}, o || {}));
  const d = await R(s), a = await R(s, {solo: 1}), c = await R(s, {solo: 2});
  const q1 = deep(s); q1.p.mk.t[1].a.lvl = 0; const q2 = deep(s); q2.p.mk.t[0].a.lvl = 0; const a2 = await R(q1), c2 = await R(q2);
  let m1 = 0, m2 = 0, pk = 0; for (let i = 0; i < d.l.length; i++) { m1 = Math.max(m1, Math.abs(d.l[i] - a.l[i] - c.l[i]), Math.abs(d.r[i] - a.r[i] - c.r[i])); m2 = Math.max(m2, Math.abs(d.l[i] - a2.l[i] - c2.l[i]), Math.abs(d.r[i] - a2.r[i] - c2.r[i])); pk = Math.max(pk, Math.abs(d.l[i])); }
  return {m1, m2, pk};
}, EV);
ok('MK3-01 Chromium-OfflineAudioContext: Dual = Solo T1 + Solo T2 und = (T2 PEGEL 0) + (T1 PEGEL 0) (Rauschen, S/H, Stimmung)', r1.m1 <= 1e-4 && r1.m2 <= 1e-4 && r1.pk > .01, J(r1) + ' ' + e1.join('|'));
// MK3-07 in Chromium: random Single sounds MK2 vs MK3 bit-equal
const gen = () => { let rs = 31; const rnd = () => { rs = (Math.imul(rs, 1103515245) + 12345) >>> 0; return rs / 4294967296; }, ri = (a, b) => a + Math.floor(rnd() * (b - a + 1)); const out = [];
  for (let k = 0; k < 8; k++) out.push({tv: ri(0, 2), split: ri(0, 127), skey: ri(0, 11), t: [0, 1].map(() => ({asg: ri(0, 2), udet: ri(0, 99), porta: ri(0, 1) * ri(0, 90), o1: {w: ri(0, 6), c1: ri(0, 127), c2: ri(0, 127)}, o2: {w: ri(0, 2), mod: ri(0, 3), semi: ri(-12, 12)}, mix: {o1: ri(0, 127), o2: ri(0, 127), n: ri(0, 127)}, f: {type: ri(0, 3), cut: ri(30, 127), res: ri(0, 110), eg: ri(-63, 63)}, l1: {w: ri(0, 3), f: ri(0, 127)}, l2: {w: ri(0, 3), f: ri(0, 127), ks: ri(0, 2)}, p: [{s: ri(0, 7), d: ri(0, 7), i: ri(-63, 63)}, {s: 2, d: 4, i: ri(-63, 63)}, {s: 3, d: 0, i: ri(-20, 20)}, {s: 4, d: 5, i: ri(-63, 63)}]}))}); return out; };
const progs = gen();
const rend = async (P) => { const out = []; for (const pr of P) { const s = deep(sndOf(0)), m = s.p.mk; m.mode = 0; m.tv = pr.tv; m.split = pr.split; m.skey = pr.skey;
  for (let k = 0; k < 2; k++) { const t = m.t[k], q = pr.t[k]; for (const a in q) { if (Array.isArray(q[a])) t[a] = q[a]; else if (typeof q[a] === 'object') Object.assign(t[a], q[a]); else t[a] = q[a]; } }
  const r = await SYNQUENZER.mkRender(s, [[0, 'on', 48, .8], [.05, 'on', 55, .7], [.1, 'on', 60, .9], [.15, 'on', 64, .6], [.2, 'on', 67, .8], [.5, 'off', 48], [.7, 'off', 60], [.9, 'off', 67], [1, 'off', 55], [1, 'off', 64]], {sec: 1.3, seed: 4}); out.push([Array.from(r.l.slice(0, 62400)), Array.from(r.r.slice(0, 62400))]); } return out; };
const [A] = await run(MK2, rend, progs), [B] = await run(undefined, rend, progs);
let w = 0; for (let k = 0; k < A.length; k++) for (let c = 0; c < 2; c++) for (let i = 0; i < A[k][c].length; i++) w = Math.max(w, Math.abs(A[k][c][i] - B[k][c][i]));
ok('MK3-07 Chromium: 8 Zufalls-Single-Sounds bitgleich zu MK2 (mkRender)', w === 0, 'max |Δ| ' + w);
await b.close();
