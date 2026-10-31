// ND1 in Chromium (real AudioWorklet): app smoke + rule 28 (no module at start), offline render = Node shim (bit-identical),
// module load time, CPU per model family (M-CPU: the worklet's own load report, median over 10 s), idle, worst case, groove.
// Usage: node md1-chromium.mjs [--quick]
import {createRequire} from 'node:module'; const {chromium} = createRequire(import.meta.url)('playwright');
import path from 'node:path'; import url from 'node:url'; import fs from 'node:fs';
import {render as shimRender} from './md-shim.mjs';
const HERE = path.dirname(url.fileURLToPath(import.meta.url)), APP = path.join(HERE, '..', 'index.html');
const QUICK = process.argv.includes('--quick'), SEC = QUICK ? 4 : 10;
const out = []; const check = (id, ok, d) => { out.push({id, ok}); console.log((ok ? 'OK  ' : 'FAIL') + ' ' + id + ' ' + d); };
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 390, height: 844}});
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + APP); await p.waitForTimeout(2500);
const st = await p.evaluate(() => ({md: typeof MDX, name: typeof MD_NAME === 'string' ? MD_NAME : null, info: MDX.info(), api: typeof SYNQUENZER.mdInfo, eng: SYNQUENZER.engineInfo().md, progs: MDX.progs.length, kits: MDX.kits.length}));
check('Smoke', errs.length === 0 && st.md === 'object' && st.name === 'North', 'Fehler ' + JSON.stringify(errs.slice(0, 3)) + ', MD_NAME ' + st.name + ', engineInfo().md ' + JSON.stringify(st.eng));
check('Regel 28: kein Modul beim Start', st.info.adds === 0 && st.info.nodes === 0, 'addModule synq-md ' + st.info.adds + ', Knoten ' + st.info.nodes);
// offline render in the real worklet against the Node shim (same program, same hits): bit-identical?
const chans = {0: {mWav: 'd5', mNlv: 30, mNtyp: 'H2', mClv: 20, mDly: 20, mRvb: 15, mDst: 10, mPit: 50}, 3: {mWav: 'C1', mNlv: 20, mPit: 70}, 7: {mWav: 'F1', mSpc: 70, mBnd: 30}, 9: {mWav: 'A3', mPit: 60, mFrq: 40, mDyf: 5}};
const hits = []; for (let i = 0; i < 16; i++) hits.push({ch: [0, 3, 7, 9][i % 4], at: 0.01 + i * 0.1, v: 0.5 + 0.03 * i});
const kit = {rvT: 'p2', rvC: -3, dlR: 40, dlM: 'r', dlB: 60, dlF: 10};
for (const sr of [48000, 44100]) {
  const br = await p.evaluate(async o => { const r = await MDX.render(o); return {l: Array.from(r.l), r: Array.from(r.r)}; }, {sr, sec: 2, chans, hits, kit});
  const full = {}; for (const k in chans) full[k] = Object.assign({}, chans[k]);
  const nr = shimRender({sr, sec: 2, chans: full, hits, kit});
  let diff = 0, ref = 0, same = 0; for (let i = 0; i < br.l.length; i++) { const d = br.l[i] - nr.L[i]; diff += d * d; ref += nr.L[i] ** 2; if (br.l[i] === nr.L[i]) same++; }
  check('Offline = Node-Shim ' + sr, diff === 0 || 10 * Math.log10(diff / ref) <= -90, diff === 0 ? 'bitgleich' : 'M-NULL ' + (10 * Math.log10(diff / ref)).toFixed(1) + ' dB, gleiche Samples ' + same + '/' + br.l.length);
  const br2 = await p.evaluate(async o => { const r = await MDX.render(o); return Array.from(r.l); }, {sr, sec: 2, chans, hits, kit});
  let eq = true; for (let i = 0; i < br2.length; i++) if (br2[i] !== br.l[i]) { eq = false; break; }
  check('ND1-26 Chromium bitgleich ' + sr, eq, eq ? 'zwei Render gleich' : 'Render verschieden');
}
// module load time (addModule in a fresh context: tables are built when the module is evaluated)
const lm = await p.evaluate(async () => { const r = []; for (let k = 0; k < 3; k++) { const oc = new OfflineAudioContext(2, 128, 48000); const t0 = performance.now(); await oc.audioWorklet.addModule('data:application/javascript;base64,' + btoa(MDX.src())); r.push(performance.now() - t0); } return r; });
check('ND1-28 Modul-Laden', Math.min(...lm) <= 10, 'addModule ' + lm.map(x => x.toFixed(1)).join(' / ') + ' ms (Tabellen + Übersetzen; Spec ≤ 10 ms nur Tabellen)');
// real-time CPU: start a running context, one node; programs that sound continuously (DECAY 50, retrigger every 2 s)
await p.evaluate(async () => { window.__ac = new AudioContext({sampleRate: 48000}); await __ac.resume(); await MDX.load(__ac); window.__E = MDX.node(__ac, __ac.destination); });
async function measure(chs, label, hitEvery = 2, n = SEC, kitp) {
  return p.evaluate(async ({chs, hitEvery, n, kitp}) => {
    const E = __E; E.panic(); await new Promise(r => setTimeout(r, 100)); E.reset();
    for (let c = 0; c < 12; c++) E.ch(c, MDX.norm(Object.assign({}, MDX.INIT, {mTlv: 0, mNlv: 0, mClv: 0})));
    for (const c in chs) E.ch(+c, MDX.norm(Object.assign({}, MDX.INIT, chs[c])));
    if (kitp) E.kit(kitp); else E.kit(MDX.KIT0);
    const loads = []; const t0 = __ac.currentTime + 0.05; const L = [];
    for (let t = 0; t < n + 2; t += hitEvery) for (const c in chs) L.push({ch: +c, at: t0 + t, v: 0.9});
    E.hit(L);
    await new Promise(r => setTimeout(r, 1500)); const l0 = E.load;
    for (let s = 0; s < n; s++) { await new Promise(r => setTimeout(r, 1000)); loads.push(E.load); }
    loads.sort((a, b) => a - b); return {med: loads[loads.length >> 1], nv: E.nv, late: E.late, l0};
  }, {chs, hitEvery, n, kitp});
}
const idle = await p.evaluate(async () => { const E = __E; E.panic(); await new Promise(r => setTimeout(r, 300)); E.reset(); for (let c = 0; c < 12; c++) E.ch(c, MDX.INIT); const L = []; for (let s = 0; s < 4; s++) { await new Promise(r => setTimeout(r, 1000)); L.push(E.load); } return L.sort((a, b) => a - b)[2]; });
check('ND1-28 Leerlauf', idle <= 0.001, (idle * 100).toFixed(3) + ' %');
const fam = [['A3 (A2–A5 zwei Osz.)', {mWav: 'A3', mPit: 57, mFrq: 40}, 0.15], ['A6', {mWav: 'A6', mSpc: 50}, 0.15], ['t2', {mWav: 't2', mSpc: 36}, 0.15], ['r2', {mWav: 'r2', mSpc: 20}, 0.15],
  ['P4', {mWav: 'P4'}, 0.15], ['F1', {mWav: 'F1', mFrq: 30}, 0.15], ['F2', {mWav: 'F2', mFrq: 30}, 0.15], ['F4', {mWav: 'F4', mFrq: 30}, 0.15],
  ['F3', {mWav: 'F3', mFrq: 30}, 0.25], ['C2', {mWav: 'C2', mPit: 58}, 0.25], ['C3', {mWav: 'C3', mPit: 58}, 0.25], ['d6 (16 Moden)', {mWav: 'd6', mPit: 45, mSpc: 50}, 0.25],
  ['H1 (32 Moden)', {mWav: 'H1', mPit: 40, mFrq: 30}, 0.35], ['C1 (48 Moden)', {mWav: 'C1', mPit: 55}, 0.5], ['NOISE 24 dB', {mTlv: 0, mNlv: 40, mNtyp: 'L2', mNdec: 50, mNdm: 'G'}, 0.1]];
for (const [l, pr, lim] of fam) {
  const chs = {}; for (let c = 0; c < 4; c++) chs[c] = Object.assign({mDec: 50, mDm: 'E1', mTlv: 40}, pr);
  const r = await measure(chs, l, 3);
  const per = r.med / Math.max(1, r.nv);
  check('ND1-28 CPU ' + l, per * 100 <= lim, 'je Stimme ' + (per * 100).toFixed(3) + ' % (Grenze ' + lim + ' %), 4 Kanäle = ' + (r.med * 100).toFixed(2) + ' %, Stimmen ' + r.nv);
}
{ const chs = {}; for (let c = 0; c < 12; c++) chs[c] = {mWav: 'C1', mPit: 50 + c, mDec: 50, mNlv: 30, mNtyp: 'L2', mNdec: 50, mNdm: 'G', mDst: 30, mDly: 20, mRvb: 20, mEqg: 3};
  const r = await measure(chs, 'worst', 0.25, SEC, {rvT: 'hA', dlR: 30, dlF: 15});
  check('ND1-28 schlimmster Fall (12 × C1 + NOISE + Dist + Echo, Hall)', r.med <= 0.08, (r.med * 100).toFixed(2) + ' %, Stimmen ' + r.nv + ', late ' + r.late); }
{ const g = await p.evaluate(async n => {   // ND3 kit "Fell & Holz", 16th groove
    const E = __E, K = MDX.kits[0]; E.panic(); await new Promise(r => setTimeout(r, 100)); E.reset(); MDX.ORDER.forEach((id, i) => E.ch(i, K.slots[id])); E.kit(K.md);
    const step = 60 / 120 / 4, t0 = __ac.currentTime + 0.05, L = []; const pat = [[0, 0, 4, 8, 12], [1, 4, 12], [4, 0, 2, 4, 6, 8, 10, 12, 14], [5, 14], [3, 12], [6, 10], [7, 11], [10, 3, 7], [11, 1, 5, 9, 13]];
    for (let bar = 0; bar < n / 2 + 2; bar++) for (const [ch, ...steps] of pat) for (const s of steps) L.push({ch, at: t0 + (bar * 16 + s) * step, v: 0.8});
    E.hit(L); await new Promise(r => setTimeout(r, 1500)); const loads = []; for (let s = 0; s < n; s++) { await new Promise(r => setTimeout(r, 1000)); loads.push(E.load); }
    loads.sort((a, b) => a - b); return {med: loads[loads.length >> 1], late: E.late}; }, SEC);
  check('ND1-28 typischer Groove (Kit Fell & Holz, 16tel)', g.med <= 0.03, (g.med * 100).toFixed(2) + ' %, late ' + g.late); }
await b.close();
const bad = out.filter(o => !o.ok); console.log('\n' + (out.length - bad.length) + '/' + out.length + ' bestanden' + (bad.length ? '\nFEHLT: ' + bad.map(o => o.id).join(', ') : ''));
