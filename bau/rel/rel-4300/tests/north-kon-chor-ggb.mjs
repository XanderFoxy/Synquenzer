// 4.30.0 Zusammenspiel North × Chor-Gruppe (4.27.0) × Konsolidieren (4.28.0) × GarageBand-Umweg (4.27.1):
//  1) Song 16 Takte: Begleitung, Song-Stimme mit Chor-Gruppe an 2 Stellen (Stil 80, Gospel), Drum-Spur mit North-Kit „Schräg“ (alle 12 Pads North)
//  2) Video-Ton (vvRender) vorher = nachher: Takt 3–10 (beide Chor-Stellen + North-Drums) konsolidieren → dieselben North-Schläge an den
//     Offline-Knoten (Kanal, Zeit, Stärke …), gleiche Noten, Ton gleich bis auf die Eigen-Schwankung des Chors (zwei Renders desselben Songs
//     unterscheiden sich schon in 4.28.0 an den Chor-Einsätzen um ≈ −45 dB, Altlast G6); zurückholen → Song exakt wie vorher; ↶ → wieder gleich
//  3) GarageBand-Instrumental (ggbExport): North-Drums sind drin (Offline-Knoten der Engine, 0 späte Schläge; mit Drum-Stimme statt North klingt es
//     anders), zweimal gerechnet gleich (16 Bit)
// Aufruf: node north-kon-chor-ggb.mjs [index.html] [kit=Schräg]
import {setup as g6setup} from './g6ph-lib.mjs';
import {createRequire} from 'module'; const {chromium} = createRequire(import.meta.url)('playwright');
const FILE = process.argv[2] || new URL('../index.html', import.meta.url).pathname, KIT = process.argv[3] || 'Schräg';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 428, height: 926}}); const errs = [];
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 30000}); await p.waitForTimeout(600);
let N = 0, F = 0; const fails = [];
const ok = (c, name, info) => { N++; if (!c) { F++; fails.push(name); } console.log((c ? '✓ ' : '✗ ') + name + (info !== undefined ? ' ' + JSON.stringify(info).slice(0, 300) : '')); };
const T0 = Date.now();
await g6setup(p, {bars: 16, at: [2, 6]});
const sty = await p.evaluate(async () => [await SYNQUENZER.g6pStyle({vox: 'V1'}, '80'), await SYNQUENZER.g6pStyle({vox: 'V2'}, 'gospel')]);
const setup = await p.evaluate(async kit => {
  const Q = SYNQUENZER; ensureAudio(); Q.setMetronome && Q.setMetronome(false); Q.loadKit(kit);
  for (let k = 0; k < 80 && !(AU.ctx && AU.ctx.state === 'running' && MDS.st === 'ready'); k++) { mdBoot(); await new Promise(r => setTimeout(r, 100)); }
  for (let k = 0; k < 60 && MDX.info().warm === 'on'; k++) await new Promise(r => setTimeout(r, 100));
  const G = DRUM_VOICES.map(v => v.gm), PAT = [[0, 4, 8, 12], [4, 12], [7, 15], [12], [0, 2, 4, 6, 8, 10, 12, 14], [14], [9], [10], [11, 13], [0], [3, 7, 11, 15], [1, 5, 9, 13]];
  const notes = []; PAT.forEach((P, i) => P.forEach(s => notes.push({t: s * 0.25, d: .1, n: G[i], v: s % 4 ? .7 : .95})));
  Q.setClip(DRUM_T, 0, {len: 1, key: {root: 7, scale: 'ionian'}, notes});
  const sg = Q.project().song; sg.lanes[DRUM_T] = [{bar: 0, slot: 0}]; Q.setSong(sg); UNDO.length = 0; REDO.length = 0;
  // Offline-Knoten der Engine mitzählen (Video und Instrumental rechnen über vvRenderAudio)
  window.__off = []; window.__H = []; const o0 = MDX.node; MDX.node = function () { const E = o0.apply(this, arguments); if (E.offline) { window.__off.push(E); const H = []; window.__H.push(H);
    const port = E.node.port, pm = port.postMessage.bind(port); port.postMessage = m => { if (m && m.t === 'hit') for (const h of m.list) H.push([h.ch, Math.round(h.at * 48000), +h.v.toFixed(4), h.acc, h.tune, h.dec]); return pm(m); }; } return E; };
  return {md: DRUM_VOICES.filter(v => mdIsSrc(v.id)).length, st: MDS.st, vox: S.song.vox.map(v => [v.id, v.bar, v.len, v.chor && v.chor.v, v.chor && v.chor.style])};
}, KIT);
ok(sty[0] && sty[1] && setup.md === 12 && setup.st === 'ready' && setup.vox.every(v => v[3] === 2), 'Song: 2 Chor-Gruppe-Stellen (v2, 80 + Gospel) und 12 North-Pads', {sty, setup});
// Video-Ton: Puffer + Noten (Spur, Ton, Schlag) + späte Schläge im Offline-Knoten
const render = () => p.evaluate(async () => {
  const n0 = window.__off.length, r = await SYNQUENZER.vvRender({}); const E = window.__off[window.__off.length - 1];
  window.__A = window.__A || []; window.__A.push([VV.last.ch[0].slice(), VV.last.ch[1].slice()]);
  const notes = (r.log || []).filter(e => e.src !== 'click').map(e => [e.track, e.out, +(+e.beat).toFixed(3)]).sort((x, y) => x[2] - y[2] || x[0] - y[0] || x[1] - y[1]);
  return {k: window.__A.length - 1, dur: r.dur, rms: r.rms, nNotes: notes.length, drum: notes.filter(x => x[0] === DRUM_T).length, notes: JSON.stringify(notes), offNode: window.__off.length > n0, late: E ? E.late : null,
    hits: JSON.stringify(window.__H[window.__H.length - 1]), nHits: window.__H[window.__H.length - 1].length,
    ready: S.song.vox.map(v => g6Ready(v))};
});
const nul = (i, j) => p.evaluate(([i, j]) => { const A = window.__A[i], B = window.__A[j]; let d = 0, s = 0; const n = Math.min(A[0].length, B[0].length);
  for (let c = 0; c < 2; c++) for (let k = 0; k < n; k++) { const x = A[c][k] - B[c][k]; d += x * x; s += A[c][k] * A[c][k]; } return {db: s ? +(10 * Math.log10(d / s + 1e-30)).toFixed(1) : 0, len: [A[0].length, B[0].length]}; }, [i, j]);
const songOf = () => p.evaluate(() => JSON.stringify({song: S.song, parts: S.parts}));
const v0 = await render(); const song0 = await songOf();
ok(v0.offNode && v0.late === 0 && v0.drum >= 16 * 31 && v0.ready.every(Boolean), 'Video-Ton vorher: North-Knoten offline, 0 späte Schläge, Chor fertig', {drum: v0.drum, late: v0.late, ready: v0.ready, rms: v0.rms});
const v0b = await render(); const n00 = await nul(0, 1), TOL = Math.max(-40, n00.db + 6);
ok(v0b.hits === v0.hits && v0b.notes === v0.notes && n00.db <= -40, 'Video-Ton zweimal gerechnet: gleiche North-Schläge (' + v0.nHits + '), gleiche Noten, Ton gleich bis auf die Chor-Schwankung', n00);
const kon = await p.evaluate(() => SYNQUENZER.konsolidieren(2, 9, 'Kern'));
ok(kon && kon.part >= 0 && kon.mark, 'Takt 3–10 (beide Chor-Stellen, North-Drums) als Teil „Kern“ konsolidiert', kon);
const pk = await p.evaluate(k => { const P = S.parts[k]; return {vox: (P.vox || []).map(v => [v.chor && v.chor.v, v.chor && v.chor.style]), drumLane: !!(P.lanes && P.lanes[DRUM_T] && P.lanes[DRUM_T].length)}; }, kon.part);
ok(pk.vox.length === 2 && pk.vox.every(v => v[0] === 2) && pk.drumLane, 'der Teil trägt beide Chor-Gruppen und die Drum-Spur', pk);
const v1 = await render(); const n01 = await nul(0, v1.k);
ok(v1.hits === v0.hits && v1.notes === v0.notes && n01.db <= TOL && v1.late === 0 && v1.ready.every(Boolean), 'konsolidiert: klingt identisch (dieselben North-Schläge, gleiche Noten, Null-Test im Rahmen der Chor-Schwankung, 0 späte Schläge)', {n01, TOL, notes: [v0.nNotes, v1.nNotes], hits: v1.nHits, late: v1.late});
ok(await p.evaluate(id => SYNQUENZER.zurueckholen(id), kon.mark), 'zurückgeholt');
ok((await songOf()) === song0, 'Song nach Zurückholen exakt wie vorher');
const v2 = await render(); const n02 = await nul(0, v2.k);
ok(v2.hits === v0.hits && v2.notes === v0.notes && n02.db <= TOL, 'zurückgeholt: klingt identisch', {n02, notes: v2.nNotes});
await p.evaluate(() => SYNQUENZER.undo());
const v3 = await render(); const n03 = await nul(0, v3.k);
ok(v3.hits === v0.hits && v3.notes === v0.notes && n03.db <= TOL, '↶ (wieder konsolidiert): klingt identisch', {n03});
await p.evaluate(() => SYNQUENZER.undo());
ok((await songOf()) === song0, '↶ (Konsolidieren zurück): Song exakt wie vorher');
// GarageBand-Instrumental
const gx = () => p.evaluate(async () => { const n0 = window.__off.length, m = await SYNQUENZER.ggbExport({remember: false}); const E = window.__off[window.__off.length - 1];
  const w = SYNQUENZER.ggbWav(), s = atob(w.b64); const a = new Int16Array(s.length >> 1); for (let i = 0; i < a.length; i++) { const lo = s.charCodeAt(2 * i), hi = s.charCodeAt(2 * i + 1); a[i] = (hi << 8 | lo) << 16 >> 16; }
  window.__W = window.__W || []; window.__W.push(a.subarray(22)); return {k: window.__W.length - 1, n: m.n, sr: m.sr, offNode: window.__off.length > n0, late: E ? E.late : null}; });
const wnul = (i, j) => p.evaluate(([i, j]) => { const A = window.__W[i], B = window.__W[j], n = Math.min(A.length, B.length); let d = 0, s = 0; for (let k = 0; k < n; k++) { const x = A[k] - B[k]; d += x * x; s += A[k] * A[k]; }
  return {db: s ? +(10 * Math.log10(d / s + 1e-30)).toFixed(1) : 0, len: [A.length, B.length]}; }, [i, j]);
const g0 = await gx(), g1 = await gx();
ok(g0.offNode && g0.late === 0 && g1.late === 0, 'Instrumental: North-Knoten im Offline-Kontext, 0 späte Schläge', {g0, g1});
ok((await wnul(0, 1)).db <= -90, 'Instrumental zweimal gerechnet gleich (16 Bit)', await wnul(0, 1));
await p.evaluate(() => { for (const v of DRUM_VOICES) SYNQUENZER.setPadSource(v.id, 'drum'); });
await p.waitForTimeout(200);
const g2 = await gx(); const d02 = await wnul(0, g2.k);
ok(!g2.offNode && d02.db > -20, 'mit Drum-Stimme statt North klingt das Instrumental anders → North ist im Instrumental', {d02, offNode: g2.offNode});
for (let k = 0; k < 12; k++) await p.evaluate(() => SYNQUENZER.undo());
ok(await p.evaluate(() => DRUM_VOICES.filter(v => mdIsSrc(v.id)).length) === 12, '↶ 12×: wieder 12 North-Pads');
const g3 = await gx(); ok((await wnul(0, g3.k)).db <= -90, 'Instrumental danach wieder gleich dem ersten', await wnul(0, g3.k));
ok(!errs.length, 'keine Konsolenfehler', errs.slice(0, 3));
console.log(`north-kon-chor-ggb: ${N - F}/${N} grün (${Math.round((Date.now() - T0) / 1000)} s)` + (F ? ' · FEHLER: ' + fails.join(' | ') : ''));
await b.close(); process.exit(F ? 1 : 0);
