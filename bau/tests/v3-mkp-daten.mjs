// MK-P-10 Daten unverändert: (1) Klänge aus dem Vorgänger (4.15.0) rendern in beiden Ständen bitgleich (mkRender, App-Worklet);
// (2) normalizeSound, normMk und die Format-Konstanten sind im Quelltext gleich; (3) dieselben Werte über die Platte (MKUI.setv mit der
// Bindung des Elements) und über mkSet im Vorgänger ergeben deep-equal Sounds; (4) ein Projekt des Vorgängers lädt deep-equal;
// (5) reine Ansichtswechsel ändern weder soundHash noch rufen sie Autosave. Usage: node v3-mkp-daten.mjs <neu.html> <vorg.html>
import {launch, open} from './v3-mkp-lib.mjs';
import fs from 'fs';
const NEW = process.argv[2], OLD = process.argv[3]; const fail = [], R = {}; const ok = (id, c, info) => { if (!c) fail.push(id + ': ' + info); };
const b = await launch();
// (2) source text
const fnText = (src, sig) => { const a = src.indexOf(sig); if (a < 0) return null; let d = 0, k = src.indexOf('{', a); for (; k < src.length; k++) { if (src[k] === '{') d++; else if (src[k] === '}' && !--d) break; } return src.slice(a, k + 1); };
const sN = fs.readFileSync(NEW, 'utf8'), sO = fs.readFileSync(OLD, 'utf8');
for (const sig of ['function normalizeSound(', '  function normMk(p) {', 'function normSynthP(', 'function normMkIn(']) { const a = fnText(sN, sig), o = fnText(sO, sig); R['quelltext ' + sig.trim()] = a && o ? (a === o ? 'gleich' : 'ANDERS') : 'fehlt'; ok('MK-P-10', a && a === o, 'Quelltext ' + sig); }
for (const re of [/const PROJECT_FORMAT = [^;]+;/, /const SOUNDS_FORMAT = [^;]+;/]) { const a = (sN.match(re) || [])[0], o = (sO.match(re) || [])[0]; R[String(re)] = a; ok('MK-P-10', a && a === o, 'Format ' + a + ' / ' + o); }
// (1) sounds made in the predecessor
const p0 = await open(b, OLD, 'P1', {noMk: true});
const made = await p0.evaluate(() => { const Q = SYNQUENZER, out = []; let seed = 4711; Math.random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  Q.newProject({init: true}); Q.setEngine(0, 'mk'); Q.selectTrack(0); out.push(['init', Q.getSound(0)]);
  for (let k = 0; k < 6; k++) { MKUI.randomize(0); out.push(['zufall' + k, Q.getSound(0)]); }
  const V = [['arp-seq', {'arp.on': 1, 'arp.type': 2, 't.0.seq.on': 1, 't.0.seq.q.0.k': 11, 't.0.seq.q.0.v.3': 30, 't.0.seq.res': 3}], ['dual', {mode: 1, 't.1.o1.w': 1, 't.1.f.cut': 60}], ['split', {mode: 2, split: 60}],
    ['vocoder', {mode: 3, 'voc.fs': 1, 'voc.res': 70}], ['fx', {'mfx.type': 2, 'mfx.dep': 90, 'dly.dep': 80, 'dly.sync': 1, 'eq.hg': 6}]];
  for (const [n, set] of V) { Q.newProject({init: true}); Q.setEngine(0, 'mk'); for (const [k, v] of Object.entries(set)) Q.mkSet(0, k, v); out.push([n, Q.getSound(0)]); }
  // (4) a project of the predecessor with two MS 2000 tracks
  Q.newProject({init: true}); Q.setEngine(0, 'mk'); Q.setEngine(1, 'mk'); Q.mkSet(1, 't.0.f.cut', 33); Q.mkSet(0, 'arp.on', 1); Q.mkIn(1, 'e1', 0);
  return {sounds: out, proj: serializeProject()}; });
await p0.ctx.close();
const ev = [[0.05, 'on', 57, .9], [0.3, 'on', 64, .7], [0.55, 'on', 69, .8], [1.0, 'off', 57], [1.1, 'off', 64], [1.2, 'off', 69], [1.3, 'on', 45, 1], [1.8, 'off', 45]];
const render = async file => { const p = await open(b, file, 'P1', {noMk: true});
  const r = await p.evaluate(async ([sounds, ev]) => { const out = {}; for (const [k, s] of sounds) { try { const x = await SYNQUENZER.mkRender(s, ev, {sec: 2.2, seed: 7, bpm: 120}); out[k] = [Array.from(x.l), Array.from(x.r)]; } catch (e) { out[k] = String(e); } } return out; }, [made.sounds, ev]);
  await p.ctx.close(); return r; };
const A = await render(OLD), B = await render(NEW); R.render = {};
for (const [k] of made.sounds) { const a = A[k], c = B[k]; if (typeof a === 'string' || typeof c === 'string') { R.render[k] = 'ERR ' + String(a).slice(0, 60) + ' / ' + String(c).slice(0, 60); ok('MK-P-10', false, 'Render ' + k + ' ' + R.render[k]); continue; }
  let d = 0, pk = 0; for (let ch = 0; ch < 2; ch++) for (let i = 0; i < a[ch].length; i++) { d = Math.max(d, Math.abs(a[ch][i] - c[ch][i])); pk = Math.max(pk, Math.abs(a[ch][i])); }
  R.render[k] = 'Spitze ' + pk.toFixed(3) + ' max|Δ| ' + d; ok('MK-P-10', d === 0 && pk > 1e-3, 'Render ' + k + ' ' + R.render[k]); }
// (3) the plate (the element's binding) against mkSet in the predecessor, (5) view changes
const pn = await open(b, NEW, 'L1');
const plate = await pn.evaluate(() => { const Q = SYNQUENZER; loadPreset(0, INIT_IDS.mk); const P = Q.mkPanel(), list = [];
  for (const e of P.elements) { if (!['k', 'b', 'bl'].includes(e.art) || !e.bind) continue; const d = MKUI.defOf(e.id); if (!d || !d.p || d.src || /^(mode4|bpm|kbOct|jump|trim[12]|mw|vol)$/.test(d.p) || d.wv) continue;
    const [lo, hi] = MKUI.range(d), v = d.L || d.sst != null ? Math.round(lo + (hi - lo) * .66) : Math.round(lo + (hi - lo) * .37); list.push([e.id, d.p, v]); }
  // the plate: each value through setv (as a gesture does: soundEdit, one undo)
  for (const [id, p, v] of list) soundEdit(0, 'test', () => MKUI.setv(MKUI.defOf(id), v, false));
  return {list, sound: Q.getSound(0)}; });
const views = await pn.evaluate(async () => { const sl = ms => new Promise(r => setTimeout(r, ms)), h0 = SQStore.soundHash(S.tracks[0].sound); let n = 0; const A = autosave, m1 = A.markDirty, m2 = A.markDirtyPlaying;
  A.markDirty = function () { n++; return m1.apply(this, arguments); }; A.markDirtyPlaying = function () { n++; return m2.apply(this, arguments); };
  for (const v of [{ansicht: 'zoom', halt: 4}, {ansicht: 'zoom', halt: 13}, {ansicht: 'ganz'}, {ansicht: 'ganz', modus: 'edit', seite: '08'}, {ansicht: 'ganz', modus: 'global', seite: '1A'}, {ansicht: 'spiel'}, {ansicht: 'fx'}, {ansicht: 'ganz'}]) { MKUI.P.mode = v.modus || 'spiel'; if (v.ansicht !== 'spiel' && v.ansicht !== 'fx' && ED.tab !== 'geraet') { ED.tab = 'geraet'; safeRebuild(buildSynthEd); } MKUI.view(v); await sl(300); }
  MKUI.zoomTo(6); await sl(300); MKUI.step(1); await sl(300); MKUI.toOverview(); await sl(300); MKUI.viewOpen('schritte'); await sl(300); MKUI.viewClose(); await sl(300);
  return {hashGleich: SQStore.soundHash(S.tracks[0].sound) === h0, autosave: n}; });
ok('MK-P-10', views.hashGleich && views.autosave === 0, 'Ansichtswechsel ' + JSON.stringify(views)); R.ansichten = views;
// (4) the predecessor's project in the new build
const proj = await pn.evaluate(async txt => { const Q = SYNQUENZER; try { await Q.importJSON(txt); } catch (e) { return {err: String(e)}; } await new Promise(r => setTimeout(r, 300)); return {out: serializeProject()}; }, made.proj);
await pn.ctx.close();
const po = await open(b, OLD, 'L1', {noMk: true});
const ref = await po.evaluate(async ([list, txt]) => { const Q = SYNQUENZER; Q.newProject({init: true}); Q.setEngine(0, 'mk'); loadPreset(0, INIT_IDS.mk); for (const [id, p, v] of list) Q.mkSet(0, p, v); const s = Q.getSound(0);
  await Q.importJSON(txt); await new Promise(r => setTimeout(r, 300)); return {sound: s, proj: serializeProject()}; }, [plate.list, made.proj]);
await po.ctx.close();
const norm = s => { const o = JSON.parse(JSON.stringify(s)); delete o.id; delete o.name; delete o.origin; return o; };
const deq = (x, y) => JSON.stringify(x) === JSON.stringify(y);
const sa = norm(plate.sound).p.mk, sb = norm(ref.sound).p.mk, diff = []; (function cmp(a, c, pth) { if (typeof a !== 'object' || a === null) { if (a !== c) diff.push(pth + ' ' + a + '/' + c); return; } for (const k of new Set([...Object.keys(a), ...Object.keys(c || {})])) cmp(a[k], c && c[k], pth + '.' + k); })(sa, sb, 'mk');
R.platte = {werte: plate.list.length, unterschiede: diff.slice(0, 10)}; ok('MK-P-10', plate.list.length > 60 && !diff.length, 'Platte = mkSet ' + JSON.stringify(R.platte));
const strip = t => { const o = JSON.parse(t); delete o.app; delete o.saved; delete o.ts; delete o.at; delete o.updated; return o; };
if (proj.err) ok('MK-P-10', false, 'Projekt ' + proj.err); else { const x = strip(proj.out), y = strip(ref.proj), ks = Object.keys(x).filter(k => !deq(x[k], y[k])); R.projekt = ks.length ? 'Unterschiede in ' + ks.join(',') : 'deep-equal'; ok('MK-P-10', !ks.length, 'Projekt ' + R.projekt); }
console.log(JSON.stringify(R, null, 1)); console.log('FEHLER', fail.length, JSON.stringify(fail, null, 1));
await b.close();
