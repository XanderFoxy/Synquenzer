// ND1-28 CPU (M-CPU): render time of the real 'synq-md' worklet in a Chromium OfflineAudioContext / audio time (single thread,
// no device jitter). Per case 4 channels with one sounding voice each (DECAY 50, retrigger every 3 s); minus an idle baseline.
// Usage: node md1-cpu.mjs [seconds=10]
import {createRequire} from 'node:module'; const {chromium} = createRequire(import.meta.url)('playwright');
import path from 'node:path'; import url from 'node:url';
const HERE = path.dirname(url.fileURLToPath(import.meta.url)), SEC = +(process.argv.find(a => /^\d+$/.test(a)) || 10);
const out = []; const check = (id, ok, d) => { out.push({id, ok}); console.log((ok ? 'OK  ' : 'FAIL') + ' ' + id + ' ' + d); };
const b = await chromium.launch(); const p = await b.newPage(); await p.goto('file://' + path.join(HERE, '..', 'index.html')); await p.waitForTimeout(1500);
const cpu = (chs, o = {}) => p.evaluate(async ({chs, o, SEC}) => {
  const sr = 48000, oc = new OfflineAudioContext(2, Math.round((SEC + 1) * sr), sr);
  await oc.audioWorklet.addModule('data:application/javascript;base64,' + btoa(MDX.src()));
  const init = []; if (o.kit) init.push({t: 'kit', p: MDX.normKit(o.kit)}); for (const c in chs) init.push({t: 'ch', ch: +c, p: MDX.flat(MDX.norm(Object.assign({}, MDX.INIT, chs[c])))});
  if (o.lim) init.push({t: 'lim', s: o.lim}); init.push({t: 'reset'}); const L = []; const ev = o.every || 3; for (let t = 0; t < SEC + 1; t += ev) for (const c in chs) L.push({ch: +c, at: t + 0.001 * c, v: 0.9}); init.push({t: 'hit', list: L});
  const n = new AudioWorkletNode(oc, 'synq-md', {numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [2], processorOptions: {init}}); n.connect(oc.destination);
  const t0 = performance.now(); await oc.startRendering(); return (performance.now() - t0) / ((SEC + 1) * 1000);
}, {chs, o, SEC});
const best = async (chs, o) => { let m = 1e9; for (let k = 0; k < 3; k++) m = Math.min(m, await cpu(chs, o)); return m; };
const silent = {}; for (let c = 0; c < 4; c++) silent[c] = {mTlv: 0};
const base0 = await best({}, {every: 1000}), base = await best(silent, {every: 1000});
check('Leerlauf', base - base0 <= 0.001, 'Engine ohne Klang ' + ((base - base0) * 100).toFixed(3) + ' % (Grundlast des Offline-Graphen ' + (base0 * 100).toFixed(2) + ' %)');
const fam = [['A3 (A2–A5 zwei Osz.)', {mWav: 'A3', mPit: 57, mFrq: 40}, 0.15], ['A2 Dreieck', {mWav: 'A2', mPit: 57, mFrq: 40}, 0.15], ['A6', {mWav: 'A6', mSpc: 50}, 0.15], ['t1', {mWav: 't1'}, 0.15], ['t2', {mWav: 't2', mSpc: 36}, 0.15], ['r1', {mWav: 'r1', mSpc: 20}, 0.15], ['r2', {mWav: 'r2', mSpc: 20}, 0.15],
  ['P4', {mWav: 'P4'}, 0.15], ['F1', {mWav: 'F1', mFrq: 30}, 0.15], ['F2', {mWav: 'F2', mFrq: 30}, 0.15], ['F4', {mWav: 'F4', mFrq: 30}, 0.15],
  ['F3', {mWav: 'F3', mFrq: 30}, 0.25], ['C2', {mWav: 'C2', mPit: 58}, 0.25], ['C3', {mWav: 'C3', mPit: 58}, 0.25], ['d6 (16 Moden)', {mWav: 'd6', mPit: 45, mSpc: 50}, 0.25], ['d5 (Teppich)', {mWav: 'd5', mPit: 50}, 0.25],
  ['H1 (32 Moden)', {mWav: 'H1', mPit: 40, mFrq: 30}, 0.35], ['C1 (48 Moden)', {mWav: 'C1', mPit: 55}, 0.5], ['NOISE 24 dB', {mTlv: 0, mNlv: 40, mNtyp: 'L2', mNdec: 50, mNdm: 'G'}, 0.1]];
for (const [l, pr, lim] of fam) { const chs = {}; for (let c = 0; c < 4; c++) chs[c] = Object.assign({mDec: 50, mDm: 'E1', mTlv: 40}, pr); const per = (await best(chs) - base) / 4; check('CPU ' + l, per * 100 <= lim, 'je Stimme ' + (per * 100).toFixed(3) + ' % (Grenze ' + lim + ' %)'); }
{ const a = {}, c0 = {}; for (let c = 0; c < 4; c++) { a[c] = {mWav: 'A1', mDec: 50, mDst: 30, mDty: 'dr', mEqg: 3, mDly: 20}; c0[c] = {mWav: 'A1', mDec: 50}; } const d = (await best(a) - await best(c0)) / 4; check('CPU Kanal-Effekte (Dist dr + EQ + Echo)', d * 100 <= 0.1, 'je Kanal ' + (d * 100).toFixed(3) + ' % (Grenze 0,10 %)'); }
{ const h = await best({0: {mWav: 'A1', mDec: 50, mRvb: 20}}, {kit: {rvT: 'hA'}}), n = await best({0: {mWav: 'A1', mDec: 50}}); check('CPU Hall (gemeinsam)', (h - n) * 100 <= 1, ((h - n) * 100).toFixed(3) + ' % (Grenze 1 %)'); }
{ const chs = {}; for (let c = 0; c < 12; c++) chs[c] = {mWav: 'C1', mPit: 50 + c, mDec: 50, mNlv: 30, mNtyp: 'L2', mNdec: 50, mNdm: 'G', mDst: 30, mDly: 20, mRvb: 20, mEqg: 3};
  const r = await best(chs, {kit: {rvT: 'hA', dlR: 30, dlF: 15}, every: 0.25}) - base0; check('schlimmster Fall (12 × C1 + NOISE + Dist + Echo + Hall, 16tel)', r <= 0.08, (r * 100).toFixed(2) + ' % (Grenze 8 %)');
  const r1 = await best(chs, {kit: {rvT: 'hA', dlR: 30, dlF: 15}, every: 0.25, lim: 1}) - base0, r2 = await best(chs, {kit: {rvT: 'hA', dlR: 30, dlF: 15}, every: 0.25, lim: 2}) - base0;
  console.log('     mit Begrenzer Stufe 1: ' + (r1 * 100).toFixed(2) + ' %, Stufe 2: ' + (r2 * 100).toFixed(2) + ' %'); }
await b.close();
const bad = out.filter(o => !o.ok); console.log('\n' + (out.length - bad.length) + '/' + out.length + ' bestanden' + (bad.length ? '\nFEHLT: ' + bad.map(o => o.id).join(', ') : ''));
