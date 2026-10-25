// Independent repro of MK1-24 in real Chromium: the app's worklet source in an OfflineAudioContext (real AudioWorkletGlobalScope,
// real Math, no harness). Every context holds 4 AM nodes + 4 VA nodes (shared scope as in the app); only which ones play differs.
// Cost per config = marginal render wall time (T 30 s - T 10 s) / 20 s, so JIT warm-up and fixed graph overhead cancel.
// Ratios: am1 = (A1 - Z) / (V1 - Z) per node (4 nodes each, same count), am4 = (A4 - Z) / (V1 - Z).
import fs from 'fs';
import {chromium} from 'playwright';
const FILE = process.env.MK_FILE || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
const s = fs.readFileSync(FILE, 'utf8'); const i = s.indexOf('id="sq-worklet-src">') + 'id="sq-worklet-src">'.length; const src = s.slice(i, s.indexOf('</script>', i));
const pagePath = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-rp-blank.html';
fs.writeFileSync(pagePath, '<!doctype html><meta charset="utf-8"><title>rp</title><body>rp</body>');
import {mkPatch} from './v3-mk1-node.mjs';
const base = {o1: {w: 0, c1: 30, c2: 40}, o2: {w: 1, mod: 2, semi: 7}, mix: {o1: 127, o2: 100, n: 40}, f: {type: 0, cut: 70, res: 100, eg: 30}, a: {dist: 1}, vib: 20};
const AMP = mkPatch(base), AMND = mkPatch(Object.assign({}, base, {a: {dist: 0}}));
const VA = {o1w: 0, o2w: 1, o3w: 0, o1lvl: 1, o2lvl: .8, o3lvl: .6, cutoff: 900, res: .6, poly: 8};
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const pg = await b.newPage(); await pg.goto('file://' + pagePath);
const errs = []; pg.on('pageerror', e => errs.push(String(e))); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await pg.evaluate(({src, AMP, AMND, VA}) => {
  const url = 'data:application/javascript;base64,' + btoa(unescape(encodeURIComponent(src)));
  window.__run = async (cfg, sec) => {
    const SR = 48000, oc = new OfflineAudioContext(2, Math.round(sec * SR), SR);
    await oc.audioWorklet.addModule(url);
    const mkNode = (eng, flat, pmk, n) => {
      const po = {patch: Object.assign({eng}, flat || {}), mods: []}; if (pmk) po.mk = pmk;
      const node = new AudioWorkletNode(oc, 'dirigent-analog', {numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [2], processorOptions: po});
      node.connect(oc.destination); let nv = 0; node.port.onmessage = e => { if (e.data && e.data.voices != null) nv = Math.max(nv, e.data.voices); };
      node.port.postMessage({tempo: {bpm: 120, start: null}}); node.port.postMessage({mkSeed: 1}); if (eng === 3) node.port.postMessage({mkWheel: {mw0: .5}});
      node.port.postMessage({ev: [36, 43, 48, 52].slice(0, n).map((x, k) => [0, 1, k + 1, x, .8, -1])}); return {node, nv: () => nv};
    };
    const am = cfg.amNoDist ? AMND : AMP, N = [];
    for (let k = 0; k < 4; k++) N.push(mkNode(3, null, am, cfg.am));
    for (let k = 0; k < 4; k++) N.push(mkNode(0, VA, null, cfg.va));
    await new Promise(r => setTimeout(r, 50));
    const t0 = performance.now(); const buf = await oc.startRendering(); const ms = performance.now() - t0;
    await new Promise(r => setTimeout(r, 30));
    let pk = 0; const d = buf.getChannelData(0); for (let j = 0; j < d.length; j += 97) pk = Math.max(pk, Math.abs(d[j]));
    return {ms, pk, nv: N.map(x => x.nv())};
  };
}, {src, AMP, AMND, VA});
const CF = {Z: {am: 0, va: 0}, A1: {am: 1, va: 0}, A4: {am: 4, va: 0}, V1: {am: 0, va: 1}, N1: {am: 1, va: 0, amNoDist: 1}, N4: {am: 4, va: 0, amNoDist: 1}, ZN: {am: 0, va: 0, amNoDist: 1}};
const REPS = +(process.env.R || 5), rows = [];
for (let r = 0; r < REPS; r++) {
  const c = {}; let info = {};
  for (const k of Object.keys(CF).sort(() => Math.random() - .5)) {
    const a = await pg.evaluate(([cfg, sec]) => window.__run(cfg, sec), [CF[k], 10]);
    const z = await pg.evaluate(([cfg, sec]) => window.__run(cfg, sec), [CF[k], 30]);
    c[k] = (z.ms - a.ms) / 20; info[k] = {nv: z.nv.join(''), pk: +z.pk.toFixed(3)};
  }
  const va = c.V1 - c.Z;
  const row = {am1: (c.A1 - c.Z) / va, am4: (c.A4 - c.Z) / va, am1noDist: (c.N1 - c.ZN) / va, am4noDist: (c.N4 - c.ZN) / va, vaPctRT: va / 4 / 1000 * 100};
  rows.push(row); console.log('run', r, JSON.stringify(Object.fromEntries(Object.entries(row).map(([k, v]) => [k, +v.toFixed(2)]))), r === 0 ? JSON.stringify(info) : '');
}
const med = k => { const a = rows.map(x => x[k]).sort((x, y) => x - y); return +a[a.length >> 1].toFixed(2); };
console.log('MEDIAN', JSON.stringify({am1: med('am1'), am4: med('am4'), am1noDist: med('am1noDist'), am4noDist: med('am4noDist'), vaPctRT: med('vaPctRT')}), 'errors', errs.length, errs.slice(0, 3));
await b.close();
