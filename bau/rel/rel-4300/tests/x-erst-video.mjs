// Diagnose: Video-Ton 3× hintereinander (Song mit Chor-Gruppe, Kit wahlweise); Null-Test je Paar und je Sekunde (erste Abweichung)
// Aufruf: node x-erst-video.mjs <index.html> [kit=Schräg|808] [chor=1]
import {setup as g6setup} from './g6ph-lib.mjs';
import {createRequire} from 'module'; const {chromium} = createRequire(import.meta.url)('playwright');
const [FILE, KIT = 'Schräg', CH = '1'] = process.argv.slice(2);
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 428, height: 926}}); const errs = [];
p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 30000}); await p.waitForTimeout(600);
await g6setup(p, {bars: 16, at: CH === '1' ? [2, 6] : []});
if (CH === '1') await p.evaluate(async () => [await SYNQUENZER.g6pStyle({vox: 'V1'}, '80'), await SYNQUENZER.g6pStyle({vox: 'V2'}, 'gospel')]);
const r = await p.evaluate(async kit => {
  const Q = SYNQUENZER; ensureAudio(); Q.setMetronome && Q.setMetronome(false); if (kit !== 'none') Q.loadKit(kit);
  if (typeof MDS === 'object') { for (let k = 0; k < 40 && kit === 'Schräg' && !(AU.ctx && AU.ctx.state === 'running' && MDS.st === 'ready'); k++) { mdBoot(); await new Promise(r => setTimeout(r, 100)); }
    for (let k = 0; k < 60 && MDX.info().warm === 'on'; k++) await new Promise(r => setTimeout(r, 100)); }
  const G = DRUM_VOICES.map(v => v.gm), PAT = [[0, 4, 8, 12], [4, 12], [7, 15], [12], [0, 2, 4, 6, 8, 10, 12, 14], [14], [9], [10], [11, 13], [0], [3, 7, 11, 15], [1, 5, 9, 13]];
  const notes = []; PAT.forEach((P, i) => P.forEach(s => notes.push({t: s * 0.25, d: .1, n: G[i], v: s % 4 ? .7 : .95})));
  Q.setClip(DRUM_T, 0, {len: 1, key: {root: 7, scale: 'ionian'}, notes});
  const sg = Q.project().song; sg.lanes[DRUM_T] = kit === 'none' ? [] : [{bar: 0, slot: 0}]; Q.setSong(sg);
  const A = [];
  for (let i = 0; i < 3; i++) { await Q.vvRender({}); A.push([VV.last.ch[0].slice(), VV.last.ch[1].slice()]); }
  const sr = VV.last.sr, out = {};
  for (const [i, j] of [[0, 1], [1, 2], [0, 2]]) { const X = A[i], Y = A[j]; let d = 0, s = 0, first = -1; const n = Math.min(X[0].length, Y[0].length), prof = [];
    for (let w = 0; w < n; w += sr) { let dd = 0, ss = 0; for (let k = w; k < Math.min(n, w + sr); k++) for (let c = 0; c < 2; c++) { const x = X[c][k] - Y[c][k]; if (x && first < 0) first = k; dd += x * x; ss += X[c][k] * X[c][k]; } d += dd; s += ss; prof.push(ss ? Math.round(10 * Math.log10(dd / ss + 1e-30)) : 0); }
    out[i + '-' + j] = {db: +(10 * Math.log10(d / s + 1e-30)).toFixed(1), first: first < 0 ? null : +(first / sr).toFixed(3), prof: prof.join(' ')}; }
  return {md: typeof mdIsSrc === 'function' ? DRUM_VOICES.filter(v => mdIsSrc(v.id)).length : 0, out};
}, KIT);
console.log(FILE.split('/').slice(-2).join('/'), KIT, 'chor', CH, JSON.stringify(r), errs.slice(0, 2));
await b.close();
