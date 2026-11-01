// VV4-04: Lage je Bereich und je Knopf ±2 pt zu getBoundingClientRect der App (P-Raster 428 × 761, TRANSPONIEREN, Song läuft);
// Matrix-Zellen ±2 pt; Song-Ansicht. Dazu die Sonde (§2.1 Punkt 4): jedes gezeichnete Element hat ein Gegenstück in der App.
import { open, songWithChords, report } from './lib.mjs';
const W = +(process.argv[2] || 428), H = +(process.argv[3] || 761);
const {b, p, errs} = await open({w: W, h: H});
await songWithChords(p);
await p.evaluate(() => { setKbMode('transpose'); SYNQUENZER.songPlay(0); }); await p.waitForTimeout(2500);
await p.evaluate(() => SYNQUENZER.vvRender({range: {a: 0, b: 2}}));
const res = {vp: [W, H], checks: {}, diff: {}};
const L = await p.evaluate(() => SYNQUENZER.vvAppLayout());
const rectOf = sel => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? [r.x, r.y, r.width, r.height] : null; }, sel);
const cmp = async (name, sel, mine) => { const d = await rectOf(sel); const m = Array.isArray(mine) ? mine : [mine.x, mine.y, mine.w, mine.h]; const dev = d ? Math.max(...d.map((v, k) => Math.abs(v - m[k]))) : 999; res.diff[name] = {app: d && d.map(v => +v.toFixed(1)), video: m, dev: +dev.toFixed(1)}; res.checks[name] = dev <= 2; };
const REG = [['kopf', '#top', L.top], ['matrix', '#clipGrid', L.grid], ['teile', '#partBar', L.part], ['spur', '#strip', L.strip], ['traeger', '#carrier', L.carrier], ['modus', '#modebar', L.mode], ['tastaturfeld', '#kbArea', L.kbArea], ['tastatur', '#kb', L.kb]];
for (const [n, s, r] of REG) await cmp(n, s, r);
const BTN = {bPlay: '#bPlay', bRec: '#bRec', takt: '#takt', bBpm: '#bBpm', bMetro: '#bMetro', bMenu: '#bMenu', corner: '#clipGrid .corner', szb: '#clipGrid .szb', stopAll: '#clipGrid .stp.all',
  bKlang: '#bKlang', bEdit: '#bEdit', bFolgt: '#bFolgt', bMute: '#bMute', bUndo: '#bUndo', bHMode: '#bHMode', readout: '#readout', bLatch: '#bLatch', bOrig: '#bOrig', octDn: '#octDn', modeSeg: '#modeSeg', segTr: '#segTr', octUp: '#octUp', bFang: '#bFang'};
for (const k in BTN) await cmp('knopf-' + k, BTN[k], L.R[k]);
// matrix cells of the shown rows / scenes
const M = await p.evaluate(() => SYNQUENZER.vvAppMatrix(0));
const dom = await p.evaluate(() => [...document.querySelectorAll('#clipGrid .slot')].filter(e => e.getBoundingClientRect().width).map(e => { const r = e.getBoundingClientRect(); return {t: +e.dataset.t, s: +e.dataset.s, r: [r.x, r.y, r.width, r.height]}; }));
let cd = 0, cn = 0; M.rows.forEach((t, q) => M.cells[q].forEach((c, k) => { const d = dom.find(x => x.t === t && x.s === M.c0 + k); cn++; if (!d) { cd = 999; return; } cd = Math.max(cd, ...d.r.map((v, j) => Math.abs(v - [c.x, c.y, c.w, c.h][j]))); }));
res.diff.zellen = {n: cn, dom: dom.length, dev: +cd.toFixed(1), rows: M.rows}; res.checks.zellen = cd <= 2 && cn === dom.length;
// song view (the part bar is hidden there in the app, as in the video)
await p.evaluate(() => SYNQUENZER.songView(true)); await p.waitForTimeout(500);
await cmp('song', '#songView', L.song);
for (const k of ['svSw', 'svRec', 'svPlay', 'svLoop', 'svHome', 'svGl', 'svBank']) await cmp('knopf-' + k, '#songView .' + k.replace(/^sv/, 'sv-').toLowerCase(), L.R[k]);
res.diff.teileImSong = await rectOf('#partBar'); res.checks.teileImSongVerdeckt = res.diff.teileImSong == null;
// Sonde
res.sonde = await p.evaluate(() => SYNQUENZER.vvAppProbe());
res.checks.sonde = res.sonde.every(x => x.dom);
res.checks.konsole = errs.length === 0; res.errs = errs;
const bad = report('vv4a-layout-' + W + 'x' + H, res);
for (const [k, v] of Object.entries(res.diff)) if (v && v.dev > 2) console.log(k, JSON.stringify(v));
console.log('Sonde ohne Gegenstück:', JSON.stringify(res.sonde.filter(x => !x.dom)));
await b.close(); process.exit(bad ? 1 : 0);
