// Diagnose: Video-Ton mit North-Kit mehrmals rechnen; je Render: späte Schläge im Offline-Knoten, Unterschied je 0,5 s zum 1. Render.
// Aufruf: node x-nv-diag.mjs <index.html> [n=4]
import {createRequire} from 'module'; const {chromium} = createRequire(import.meta.url)('playwright');
const FILE = process.argv[2], N = +(process.argv[3] || 4);
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 390, height: 844}}); const errs = [];
p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 30000}); await p.waitForTimeout(600);
const r = await p.evaluate(async N => {
  const Q = SYNQUENZER; ensureAudio(); Q.setMetronome && Q.setMetronome(false); Q.loadKit('Schräg');
  for (let k = 0; k < 80 && !(AU.ctx && AU.ctx.state === 'running' && MDS.st === 'ready'); k++) { mdBoot(); await new Promise(r => setTimeout(r, 100)); }
  for (let k = 0; k < 60 && MDX.info().warm === 'on'; k++) await new Promise(r => setTimeout(r, 100));
  const offs = []; const o0 = MDX.node; MDX.node = function (ctx, d, init) { const E = o0.apply(this, arguments); if (E.offline) offs.push(E); return E; };
  const G = DRUM_VOICES.map(v => v.gm), PAT = [[0, 4, 8, 12], [4, 12], [7, 15], [12], [0, 2, 4, 6, 8, 10, 12, 14], [14], [9], [10], [11, 13], [0], [3, 7, 11, 15], [1, 5, 9, 13]];
  const notes = []; PAT.forEach((P, i) => P.forEach(s => notes.push({t: s * 0.25, d: .1, n: G[i], v: s % 4 ? .7 : .95})));
  Q.setBpm(120); Q.setClip(DRUM_T, 0, {len: 1, key: {root: 0, scale: 'ionian'}, notes});
  const lanes = Array.from({length: NT()}, () => []); lanes[DRUM_T] = [{bar: 0, slot: 0}];
  Q.setSong({bars: 8, lanes, carrier: [], marks: []}); await new Promise(r => setTimeout(r, 400));
  const grab = () => [VV.last.ch[0].slice(), VV.last.ch[1].slice()];
  const out = []; let A0 = null; const sr = AU.ctx.sampleRate;
  for (let i = 0; i < N; i++) {
    const t0 = performance.now(); await Q.vvRender({}); const A = grab(); const E = offs[offs.length - 1];
    await new Promise(r => setTimeout(r, 50));
    const row = {ms: Math.round(performance.now() - t0), late: E ? E.late : null, nodes: offs.length};
    if (!A0) A0 = A; else { const W = Math.round(sr / 2), d = []; let first = -1;
      for (let w = 0; w < A0[0].length; w += W) { let dd = 0, s = 0; for (let k = w; k < Math.min(w + W, A0[0].length); k++) { const x = A0[0][k] - A[0][k]; if (x && first < 0) first = k; dd += x * x; s += A0[0][k] * A0[0][k]; } d.push(s ? +(10 * Math.log10(dd / s + 1e-30)).toFixed(0) : 0); }
      row.first = first < 0 ? null : +(first / sr).toFixed(4); row.d = d.join(' '); }
    out.push(row);
  }
  return out;
}, N).catch(e => ({err: String(e && e.stack || e)}));
console.log(JSON.stringify(r, null, 0), errs.slice(0, 3));
await b.close();
