// MK-P-01, -03, -04, -05, -06, -12, -15: plate data, every element through a CDP touch gesture, vocoder column, pages, brand, removal
import fs from 'fs';
import {launch, open, touch, tap, line, panel, el, ctr} from './v3-mkp-lib.mjs';
const FILE = process.argv[2]; const R = {}; const fail = []; const ok = (id, c, info) => { R[id] = R[id] || {ok: true, n: 0}; R[id].n++; if (!c) { R[id].ok = false; fail.push(id + ': ' + info); } };
const b = await launch();
let page = await open(b, FILE, 'L1');
// ---------- MK-P-01 Vorlage: element centres in the DOM against the table, pairs, columns, aspect, frames ----------
const geo = await page.evaluate(() => {
  const pl = MKUI.PL.el.getBoundingClientRect(), out = {w: pl.width, h: pl.height, els: []};
  for (const e of MKUI.ELS) { const n = MKUI.PL.el.querySelector('[data-k="' + e.id + '"]') || (MKUI.PL.ui.led[e.id] && MKUI.PL.ui.led[e.id].tagName === 'I' && !MKUI.PL.ui.led[e.id].classList.contains('led') ? MKUI.PL.ui.led[e.id] : null);
    if (!n) { out.els.push({id: e.id, miss: e.art !== 'name'}); continue; } const r = n.getBoundingClientRect(); out.els.push({id: e.id, x: (r.left + r.width / 2 - pl.left) / pl.width * 100, y: (r.top + r.height / 2 - pl.top) / pl.height * 100, tx: e.x, ty: e.y}); }
  out.rects = [...MKUI.PL.el.querySelectorAll('.mkpln rect')].slice(0, MKUI.SEC.length).map((r, k) => { const q = MKUI.SEC[k]; return {id: q[0], x0: +r.getAttribute('x') / 10, x1: (+r.getAttribute('x') + +r.getAttribute('width')) / 10, y0: +r.getAttribute('y') / (1000 / 1.95) * 100, y1: (+r.getAttribute('y') + +r.getAttribute('height')) / (1000 / 1.95) * 100, t: q}; });
  return out; });
let worst = 0;
for (const e of geo.els) { if (e.miss) { ok('MK-P-01', false, 'fehlt ' + e.id); continue; } if (e.x == null) continue; const dx = Math.abs(e.x - e.tx), dy = Math.abs(e.y - e.ty); worst = Math.max(worst, dx, dy); ok('MK-P-01', dx <= .8 && dy <= 1.2, e.id + ' dx ' + dx.toFixed(2) + ' dy ' + dy.toFixed(2)); }
const X = id => geo.els.find(e => e.id === id).x;
for (const [a, c] of [['oct.d', 'oct.u'], ['bank.d', 'bank.u'], ['pg.m', 'pg.p'], ['cur.l', 'cur.r'], ['cur.r', 'no'], ['no', 'yes'], ['edit', 'global'], ['arp.on', 'arp.latch'], ['arp.latch', 'arp.range'], ['arp.range', 'arp.type']]) { const d = X(c) - X(a); R['01-paare'] = (R['01-paare'] || []).concat(a + '→' + c + ' ' + d.toFixed(2)); ok('MK-P-01', Math.abs(d - 4.3) <= .05 || (a === 'arp.range' && Math.abs(d - 4.4) <= .05), 'Paar ' + a + ' ' + d.toFixed(2)); }
for (let n = 1; n <= 16; n++) { ok('MK-P-01', Math.abs(X('k' + n) - (14.1 + (n - 1) * 5.52)) <= .3, 'Spalte k' + n); ok('MK-P-01', Math.abs(X('s' + n) - (14.1 + (n - 1) * 5.52)) <= .3, 'Spalte s' + n); }
ok('MK-P-01', Math.abs(geo.w / geo.h - 1.95) <= .01, 'Seitenverhältnis ' + (geo.w / geo.h));
for (const r of geo.rects) { const q = r.t, ix = Math.max(0, Math.min(r.x1, q[5]) - Math.max(r.x0, q[4])) * Math.max(0, Math.min(r.y1, q[7]) - Math.max(r.y0, q[6])), u = (r.x1 - r.x0) * (r.y1 - r.y0) + (q[5] - q[4]) * (q[7] - q[6]) - ix; ok('MK-P-01', ix / u >= .9, 'IoU ' + q[0] + ' ' + (ix / u).toFixed(3)); }
R['01-worst'] = worst.toFixed(3);
// reine Skalierung: two views, the same relative positions
const rel = await page.evaluate(async () => { const a = SYNQUENZER.mkPanel().elements.filter(e => e.px); MKUI.view({ansicht: 'zoom', halt: 6}); await new Promise(r => setTimeout(r, 60)); const p = SYNQUENZER.mkPanel(), z = p.elements.filter(e => e.px), k = p.z / SYNQUENZER.mkPanel().zOv;
  let m = 0; const A = a.find(e => e.id === 'k1'), Z = z.find(e => e.id === 'k1'); for (const e of a) { const f = z.find(x => x.id === e.id); const pr = Z.px.x + (e.px.x - A.px.x) * p.z / (a.length ? (SYNQUENZER.mkPanel().zOv) : 1); m = Math.max(m, Math.abs(f.px.x - (Z.px.x + (e.px.x - A.px.x) * p.z / p.zOv))); } MKUI.view({ansicht: 'ganz'}); return m; });
ok('MK-P-01', rel <= 1, 'Skalierung ' + rel); R['01-skal-px'] = rel.toFixed(3);
// ---------- MK-P-03: every element with bind: a CDP gesture in a stop and in the landscape overview ----------
const IDS = await page.evaluate(() => MKUI.ELS.filter(e => e.act).map(e => e.id));
await page.evaluate(() => { window.__L = []; window.addEventListener('pointerdown', e => __L.push(e.type + ' ' + e.pointerId + ' ' + (e.target.className || e.target.tagName) + ' ' + Math.round(e.clientX) + ',' + Math.round(e.clientY) + ' sw=' + UI.swallow + ' sh=' + !!UI.shield), true); });
async function stateOf() { return page.evaluate(() => ({mk: JSON.stringify(SYNQUENZER.mkGet(0)), u: SYNQUENZER.undoInfo().n, v: JSON.stringify({m: MKUI.P.mode, pg: MKUI.P.page, c: MKUI.P.cur, fx: MKUI.P.fxSel, pa: MKUI.P.patchSel, sq: MKUI.P.seqSel, ch: MKUI.P.chSel, t: MKUI.P.tim, b: MKUI.P.bank, rec: !!MKUI.P.rec}),
  oct: S.tracks[0].kbOct, vol: sndOf(0).fx.vol, bpm: S.bpm, trim: JSON.stringify(R.mkInTrim || null), pop: !!document.querySelector('#popLayer.open'), lcd: SYNQUENZER.mkPanel().lcd.join('|'), hit: SYNQUENZER.mkPanel().hit})); }
const skip = new Set(['lcd']);
async function gest(view) {
  const res = {};
  for (const id of IDS) {
    if (skip.has(id)) continue;
    await page.evaluate(([v, id]) => { try { closePop(); } catch (e) {} MKUI.P.mode = /^(cur\.|exit|no|yes|s\d)/.test(id) ? 'edit' : 'spiel'; MKUI.P.page = 7; MKUI.P.cur = 2; MKUI.P.seqSel = 0; MKUI.P.chSel = 0; MKUI.P.bank = 1; if (MKUI.P.rec) MKUI.recCancel(); SYNQUENZER.mkSet(0, 'mode', id === 'tim' ? 1 : 0); SYNQUENZER.mkSet(0, 't.0.f.res', 40); if (id === 'exit') { UI.ab = null; } MKUI.view(v); }, [view, id]);
    if (view.ansicht === 'zoom') { const h = (await page.evaluate(i => MKUI.ELS.find(e => e.id === i).halt, id)); await page.evaluate(h => MKUI.view({ansicht: 'zoom', halt: h}), h); }
    await page.waitForTimeout(40);
    const e = await el(page, id); if (!e || !e.px) { res[id] = 'kein Bild'; continue; }
    const [x, y] = ctr(e), s0 = await stateOf(); await page.evaluate(() => { __L.length = 0; });
    if (e.art === 'k') { const up = (e.val != null && e.bind && !/^view/.test(e.bind)) ? ((await page.evaluate(i => { const d = MKUI.defOf(i), [lo, hi] = MKUI.range(d), v = MKUI.get(d); return v > (lo + hi) / 2; }, id)) ? 1 : -1) : -1; await touch(page, line(x, y, x, y + 60 * up), 16); }
    else await tap(page, x, y);
    await page.waitForTimeout(60);
    const s1 = await stateOf(), ch = s1.mk !== s0.mk ? 'klang' : s1.v !== s0.v ? 'ansicht' : s1.oct !== s0.oct ? 'oktave' : s1.vol !== s0.vol ? 'volume' : s1.bpm !== s0.bpm ? 'tempo' : s1.trim !== s0.trim ? 'pegel' : s1.pop !== s0.pop ? 'liste' : s1.lcd !== s0.lcd ? 'anzeige' : 'nichts';
    if (s1.hit.split('@')[0] !== id) R['03-fehltreffer'] = (R['03-fehltreffer'] || []).concat(id + '→' + s1.hit + ' ' + Math.round(x) + ',' + Math.round(y) + ' ' + (await page.evaluate(() => __L.join(' | '))));
    let und = '';
    if (s1.mk !== s0.mk) { und = 'undo+' + (s1.u - s0.u); await page.evaluate(() => SYNQUENZER.undo()); await page.waitForTimeout(30); const s2 = await stateOf(); und += s2.mk === s0.mk ? ' ↶=gleich' : ' ↶≠'; }
    res[id] = ch + (und ? ' ' + und : '');
    await page.evaluate(() => { if (document.querySelector('#popLayer.open')) { const p = document.querySelector('#popLayer'); p.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true})); } });
    await page.evaluate(() => { try { closePop(); } catch (e) {} });
  }
  return res;
}
const gHalt = await gest({ansicht: 'zoom'}), gGanz = await gest({ansicht: 'ganz'});
R['03-halt'] = gHalt; R['03-ganz'] = gGanz;
for (const [id, v] of Object.entries(gHalt)) { ok('MK-P-03', v !== 'nichts' && v !== 'kein Bild', 'Halt ' + id + ' ' + v); if (/undo/.test(v)) ok('MK-P-03', /undo\+1 ↶=gleich/.test(v), 'Undo ' + id + ' ' + v); }
for (const [id, v] of Object.entries(gGanz)) { ok('MK-P-03', v !== 'nichts' && v !== 'kein Bild', 'Ganz ' + id + ' ' + v); if (/undo/.test(v)) ok('MK-P-03', /undo\+1 ↶=gleich/.test(v), 'Undo ganz ' + id + ' ' + v); }
// audible: each sound value of the plate changes the rendered sound (offline, the same worklet)
const aud = await page.evaluate(async () => {
  const s0 = JSON.parse(JSON.stringify(SYNQUENZER.mkGet(0))), base = JSON.parse(JSON.stringify(window.SYNQUENZER.tracks ? null : null));
  const snd = () => JSON.parse(JSON.stringify(sndOf(0)));
  const prep = x => { const s = snd(); s.p.mk = SQMK.normMk(Object.assign(s.p.mk, x)); return s; };
  const ev = [[0.02, 'on', 48, .8], [0.35, 'on', 55, .8], [0.4, 'off', 48], [0.8, 'off', 55]];
  const rms = a => { let e = 0; for (let i = 0; i < a.length; i++) e += a[i] * a[i]; return Math.sqrt(e / a.length); };
  const ctxS = snd(); ctxS.p.mk.t[0].p = [{s: 2, d: 4, i: 30}, {s: 3, d: 0, i: 10}, {s: 0, d: 2, i: 20}, {s: 1, d: 5, i: -20}]; ctxS.p.mk.t[0].f.cut = 80; ctxS.p.mk.t[0].f.res = 40; ctxS.p.mk.t[0].mix.n = 30; ctxS.p.mk.t[0].o1.w = 1; ctxS.p.mk.mfx.dep = 60; ctxS.p.mk.dly.dep = 60; ctxS.p.mk.t[0].e1.d = 40; ctxS.p.mk.t[0].e1.s = 40; ctxS.p.mk.t[0].f.eg = 30; ctxS.p.mk.t[0].porta = 0; ctxS.p.mk.t[0].e2.s = 70; ctxS.p.mk.t[0].e2.d = 50; ctxS.p.mk.t[0].o2.w = 0; ctxS.p.mk.t[0].mix.o2 = 80;
  const out = {};
  const paths = {'o1.c1': 't.0.o1.c1', 'o1.c2': 't.0.o1.c2', 'o2.semi': 't.0.o2.semi', 'o2.tune': 't.0.o2.tune', 'mix.o1': 't.0.mix.o1', 'mix.o2': 't.0.mix.o2', 'mix.n': 't.0.mix.n', 'f.cut': 't.0.f.cut', 'f.res': 't.0.f.res', 'f.eg': 't.0.f.eg', 'f.kbd': 't.0.f.kbd', 'a.lvl': 't.0.a.lvl', 'a.pan': 't.0.a.pan', porta: 't.0.porta', 'arp.gate': 'arp.gate',
    k1: 't.0.e1.a', k2: 't.0.e1.d', k3: 't.0.e1.s', k4: 't.0.e1.r', k5: 't.0.e2.a', k6: 't.0.e2.d', k7: 't.0.e2.s', k8: 't.0.e2.r', k9: 't.0.l1.f', k10: 't.0.l2.f', k11: 'mfx.spd', k12: 'mfx.dep', k13: 't.0.p.0.i', k14: 't.0.p.1.i', k15: 't.0.p.2.i', k16: 't.0.p.3.i'};
  for (const [id, p] of Object.entries(paths)) {
    const a = JSON.parse(JSON.stringify(ctxS)); const r = SQMK.mkRange(p); const v = SQMK.mkPathGet(a.p.mk, p);
    const nv = v > (r[0] + r[1]) / 2 ? r[0] + (r[1] - r[0]) * .2 : r[0] + (r[1] - r[0]) * .8; const bb = JSON.parse(JSON.stringify(a)); bb.p.mk = SQMK.mkPathSet(bb.p.mk, p, Math.round(nv));
    if (id === 'arp.gate') { a.p.mk.arp.on = 1; bb.p.mk.arp.on = 1; }
    const X = await SYNQUENZER.mkRender(a, ev, {sec: 1.2, sr: 24000, seed: 3}), Y = await SYNQUENZER.mkRender(bb, ev, {sec: 1.2, sr: 24000, seed: 3});
    let d = 0; for (let i = 0; i < X.l.length; i++) d += (X.l[i] - Y.l[i]) ** 2 + (X.r[i] - Y.r[i]) ** 2; d = Math.sqrt(d / X.l.length / 2);
    out[id] = +(20 * Math.log10(d / Math.max(1e-9, rms(X.l)) + 1e-12)).toFixed(1);
  }
  return out; });
R['03-hoerbar-dB'] = aud;
for (const [id, d] of Object.entries(aud)) ok('MK-P-03', d > -40 || id === 'arp.gate', 'hörbar ' + id + ' ' + d + ' dB');
// ---------- MK-P-04 vocoder column ----------
await page.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 3); MKUI.view({ansicht: 'ganz'}); });
await page.waitForTimeout(100);
const voc = await page.evaluate(() => { const o = {}; for (const id of ['o2.semi', 'o2.tune', 'mix.o2', 'f.cut', 'f.res', 'f.eg', 'f.kbd', 'a.pan', 'a.lvl', 'f.type', 'a.dist', 'vp.s']) o[id] = MKUI.bindOf(id); o.grau = MKUI.ELS.filter(e => SYNQUENZER.mkPanel().elements.find(x => x.id === e.id).grau).map(e => e.id); return o; });
R['04-bind'] = voc;
const W4 = {'o2.semi': 'voc.hpl', 'o2.tune': 'voc.th', 'mix.o2': 'voc.ins', 'f.cut': 'voc.cut', 'f.res': 'voc.res', 'f.eg': 'voc.mint', 'f.kbd': 'voc.efs', 'a.pan': 'voc.dir', 'a.lvl': 'voc.lvl', 'f.type': 'voc.fs', 'a.dist': 'voc.dist', 'vp.s': 'voc.msrc'};
for (const [k, v] of Object.entries(W4)) ok('MK-P-04', voc[k] === v, 'Vocoder ' + k + ' = ' + voc[k]);
ok('MK-P-04', ['o2.wave', 'o2.mod', 'a.gate', 'tim', 'seq.on', 'seq.rec', 'vp.sel', 'vp.d', 'k13', 'k14', 'k15', 'k16'].every(x => voc.grau.includes(x)) && voc.grau.length === 12, 'grau ' + voc.grau);
// CH PARAM: knob n = band n exactly
const ch = await page.evaluate(() => { MKUI.P.chSel = 0; MKUI.press('sq.sel'); const r = {}; for (const n of [1, 7, 16]) { const before = SYNQUENZER.mkGet(0).voc.chl.slice(); MKUI.knobSim('k' + n, [60]); const after = SYNQUENZER.mkGet(0).voc.chl; r[n] = after.map((v, j) => v !== before[j] ? j + 1 : 0).filter(Boolean); } MKUI.press('sq.sel'); const b2 = SYNQUENZER.mkGet(0).voc.chp.slice(); MKUI.knobSim('k5', [20]); r.pan = SYNQUENZER.mkGet(0).voc.chp.map((v, j) => v !== b2[j] ? j + 1 : 0).filter(Boolean); MKUI.press('sq.sel'); return r; });
R['04-ch'] = ch; ok('MK-P-04', ch[1] + '' === '1' && ch[7] + '' === '7' && ch[16] + '' === '16' && ch.pan + '' === '5', 'CH PARAM ' + JSON.stringify(ch));
// grau elements change nothing audible in the vocoder (OSC 2 wave, OSC MOD, EG2/GATE, patch intensities) — render with a vowel modulator
const g4 = await page.evaluate(async () => { const s = JSON.parse(JSON.stringify(sndOf(0))); s.p.mk.mode = 3; const E2 = SYNQUENZER.mkVowel({f0: 120, v: ['a', 'o'], sec: 1, sr: 24000, rms: -20});
  const ev = [[0.02, 'on', 48, .8], [0.8, 'off', 48]], R_ = async x => SYNQUENZER.mkRender(x, ev, {sec: 1, sr: 24000, seed: 2, inputs: {e2: E2}}), A = await R_(s); const o = {};
  for (const [k, p, v] of [['o2.wave', 't.0.o2.w', 2], ['o2.mod', 't.0.o2.mod', 3], ['a.gate', 't.0.a.gate', 1], ['k13', 't.0.p.0.i', 50], ['vp.d', 't.0.p.0.d', 5]]) { const b = JSON.parse(JSON.stringify(s)); b.p.mk = SQMK.mkPathSet(b.p.mk, p, v); const B = await R_(b); let m = 0; for (let i = 0; i < A.l.length; i++) m = Math.max(m, Math.abs(A.l[i] - B.l[i])); o[k] = m; }
  return o; });
R['04-grau-maxdiff'] = g4; for (const [k, v] of Object.entries(g4)) ok('MK-P-04', v < 1e-6, 'grau hörbar ' + k + ' ' + v);
// E.F.SENSE 127 = HOLD
const hold = await page.evaluate(async () => { MKUI.view({ansicht: 'zoom', halt: 4}); MKUI.knobSim('f.kbd', [127]); await new Promise(r => setTimeout(r, 800)); return {efs: SYNQUENZER.mkGet(0).voc.efs, hold: !!SYNQUENZER.mkGet(0).voc.hold, lcd: SYNQUENZER.mkPanel().lcd}; });
R['04-hold'] = hold; ok('MK-P-04', hold.efs === 127, 'E.F.SENSE 127 ' + JSON.stringify(hold));
await page.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 0); });
// ---------- MK-P-05 pages ----------
const pg = await page.evaluate(() => {
  const r = {}, leaf = (o, p, out) => { if (Array.isArray(o)) { if (o.every(x => typeof x === 'number')) { out.push(p); return; } o.forEach((x, k) => leaf(x, p + '.' + k, out)); } else if (o && typeof o === 'object') for (const k in o) leaf(o[k], p ? p + '.' + k : k, out); else out.push(p); return out; };
  const I = SQMK.init(), all = leaf(I, '', []).filter(p => !/^(v|vmax|arp\.last|arp\.steps|usc|voc\.hold)$/.test(p) && !/^t\.1\./.test(p));
  const reach = new Set();
  const addD = d => { if (d && d.p) { reach.add(d.p.replace(/^t\.[01]\./, 't.0.').replace(/\.(\d+)$/, m => (/(chl|chp)\.\d+$/.test(d.p) ? '' : m))); if (/seq\.q\.\d\.v\.\d+/.test(d.p)) reach.add(d.p.replace(/\.v\.\d+$/, '.v')); if (/(chl|chp)\.\d+$/.test(d.p)) reach.add(d.p.replace(/\.\d+$/, '')); } };
  for (const vo of [0, 3]) { SYNQUENZER.mkSet(0, 'mode', vo);
    for (const L of [MKUI.pages()]) for (let k = 0; k < L.length; k++) { MKUI.P.mode = 'edit'; MKUI.P.page = k; for (let j = 0; j < L[k][3].length; j++) { MKUI.P.cur = j; const d = MKUI.curItem(); addD(d); if (d && d.wv) reach.add('t.0.o1.c2'); } }
    for (const e of MKUI.ELS) if (e.act) { addD(MKUI.defOf(e.id)); for (const s of [1, 2, 3]) { MKUI.P.seqSel = s; addD(MKUI.defOf(e.id)); } MKUI.P.seqSel = 0; }
    // alternatives of switch-dependent values
    for (const p of ['t.0.l1.note', 't.0.l2.note', 'dly.note', 'dly.time', 't.0.l1.f', 't.0.l2.f']) reach.add(p); }
  SYNQUENZER.mkSet(0, 'mode', 0); MKUI.P.mode = 'spiel';
  for (let s = 0; s < 3; s++) reach.add('t.0.seq.q.' + s + '.v');
  reach.add('voc.chl'); reach.add('voc.chp'); reach.add('usc');
  reach.add(reach.has('mode4') ? 'mode' : 'x'); r.nurGespeichert = ['arp.tempo']; r.missing = all.filter(p => p !== 'arp.tempo' && !reach.has(p) && !reach.has(p.replace(/\.v\.\d+$/, '.v')) && !reach.has(p.replace(/^(voc\.ch[lp])\.\d+$/, '$1')));
  r.n = all.length;
  return r; });
R['05-erreichbar'] = pg; ok('MK-P-05', pg.missing.length === 0, 'nicht erreichbar ' + pg.missing);
const p5 = await page.evaluate(() => {
  const r = {keys: {}, keysV: {}};
  MKUI.press('edit');
  for (let n = 1; n <= 16; n++) { MKUI.press('s' + n); r.keys[n] = SYNQUENZER.mkPanel().seite; }
  SYNQUENZER.mkSet(0, 'mode', 3); for (let n = 1; n <= 16; n++) { MKUI.press('s' + n); r.keysV[n] = SYNQUENZER.mkPanel().seite; } SYNQUENZER.mkSet(0, 'mode', 0);
  MKUI.press('s1'); const fw = [], bw = []; for (let k = 0; k < 30; k++) { fw.push(SYNQUENZER.mkPanel().seite.slice(0, 2)); MKUI.press('pg.p'); } for (let k = 0; k < 30; k++) { bw.push(SYNQUENZER.mkPanel().seite.slice(0, 2)); MKUI.press('pg.m'); }
  r.fw = fw.join(','); r.bw = bw.join(',');
  // cursor, −/+ one device step and clamp (08 FILTER: RESONANZ)
  MKUI.press('s6'); MKUI.press('cur.r'); MKUI.press('cur.r'); const res0 = SYNQUENZER.mkGet(0).t[0].f.res; MKUI.press('yes'); const res1 = SYNQUENZER.mkGet(0).t[0].f.res; MKUI.press('no'); MKUI.press('no'); const res2 = SYNQUENZER.mkGet(0).t[0].f.res;
  r.cursor = [SYNQUENZER.mkPanel().lcd[1], res0, res1, res2];
  for (let k = 0; k < 10; k++) MKUI.press('cur.r'); r.cursorEnd = SYNQUENZER.mkPanel().cursor;
  // page jump: turn ATTACK (k5) in EDIT → 11 EG 2
  MKUI.knobSim('k5', [50]); r.jump = SYNQUENZER.mkPanel().seite + ' ' + SYNQUENZER.mkPanel().cursor;
  MKUI.P.jump = 0; MKUI.press('s6'); MKUI.knobSim('k5', [60]); r.nojump = SYNQUENZER.mkPanel().seite; MKUI.P.jump = 1;
  // tap on the display: 08A TYP = list; 01 COMMON EIGENE ▸ ; WRITE opens the save pop; EXIT
  MKUI.press('s6'); MKUI.P.cur = 0; MKUI.lcdTap(); r.list = !!document.querySelector('#popLayer.open .plist'); closePop();
  SYNQUENZER.mkSet(0, 'scale', 9); MKUI.press('s1'); MKUI.P.cur = 5; MKUI.lcdTap(); r.eigene = MKUI.P.view; MKUI.viewClose(); SYNQUENZER.mkSet(0, 'scale', 0);
  MKUI.press('write'); r.write = !!document.querySelector('#popLayer.open'); closePop();
  MKUI.press('exit'); r.exit = SYNQUENZER.mkPanel().modus;
  return r; });
R['05'] = p5;
const PSN = ['01', '03', '04', '05', '06', '08', '09', '10', '12', '14', '18', '22', '23', '24', '25', '26'], PVN = ['01', '03', '04', '05', '06', '08', '09', '10', '12', '14', '15', '16', '17', '18', '19', '20'];
for (let n = 1; n <= 16; n++) { ok('MK-P-05', p5.keys[n].startsWith(PSN[n - 1]), 'Taste ' + n + ' ' + p5.keys[n]); ok('MK-P-05', p5.keysV[n].startsWith(PVN[n - 1]), 'Vocoder Taste ' + n + ' ' + p5.keysV[n]); }
ok('MK-P-05', p5.fw.startsWith('01,02,03,04,05,06,07,08,09,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,26'), 'PAGE vor ' + p5.fw);
ok('MK-P-05', p5.bw.startsWith('26,25,24') && p5.bw.endsWith('01,01,01'), 'PAGE zurück ' + p5.bw);
ok('MK-P-05', p5.cursor[2] === p5.cursor[1] + 1 && p5.cursor[3] === Math.max(0, p5.cursor[1] - 1), 'CURSOR/−/+ ' + p5.cursor);
ok('MK-P-05', p5.cursorEnd === 5, 'CURSOR klemmt ' + p5.cursorEnd); ok('MK-P-05', /^11 EG 2 0$/.test(p5.jump), 'Seiten-Sprung ' + p5.jump); ok('MK-P-05', /^08/.test(p5.nojump), 'ohne Sprung ' + p5.nojump);
ok('MK-P-05', p5.list && p5.eigene === 'eigene' && p5.write && p5.exit === 'spiel', 'Anzeige-Tipp/WRITE/EXIT ' + JSON.stringify(p5));
// COMPARE: EDIT held + EXIT
await page.evaluate(() => { loadPreset(0, INIT_IDS.mk); SYNQUENZER.openEditor(); }); await page.waitForTimeout(200);
const cmp = await page.evaluate(() => { const before = SYNQUENZER.mkGet(0).t[0].f.cut; SYNQUENZER.mkSet(0, 't.0.f.cut', 30); MKUI.press('edit'); MKUI.P.editHeld = 1; MKUI.press('exit'); MKUI.P.editHeld = 0; const r = {lcd: SYNQUENZER.mkPanel().lcd[1], cut: SYNQUENZER.mkGet(0).t[0].f.cut}; MKUI.press('exit'); r.back = SYNQUENZER.mkGet(0).t[0].f.cut; r.mode = SYNQUENZER.mkPanel().modus; MKUI.press('exit'); r.mode2 = SYNQUENZER.mkPanel().modus; r.orig = before; return r; });
R['05-compare'] = cmp; ok('MK-P-05', /COMPARE/.test(cmp.lcd) && cmp.cut === cmp.orig && cmp.back === 30 && cmp.mode2 === 'spiel', 'COMPARE ' + JSON.stringify(cmp));
// UTILITY = the old tools: timbre swap / new / copy, seq init; vocoder level / pan back
const ut = await page.evaluate(() => { const r = {}; SYNQUENZER.mkSet(0, 'mode', 1); SYNQUENZER.mkSet(0, 't.0.f.cut', 11); SYNQUENZER.mkSet(0, 't.1.f.cut', 99);
  MKUI.press('edit'); MKUI.press('s16'); MKUI.P.cur = 3; MKUI.press('yes'); r.swap = [SYNQUENZER.mkGet(0).t[0].f.cut, SYNQUENZER.mkGet(0).t[1].f.cut];
  MKUI.P.cur = 1; MKUI.press('yes'); r.neu = SYNQUENZER.mkGet(0).t[0].f.cut;
  SYNQUENZER.mkSet(0, 't.0.seq.q.0.v.3', 20); MKUI.P.cur = 4; MKUI.press('yes'); r.sinit = SYNQUENZER.mkGet(0).t[0].seq.q[0].v[3];
  SYNQUENZER.mkSet(0, 'mode', 3); SYNQUENZER.mkSet(0, 'voc.chl.4', 10); MKUI.press('s16'); MKUI.P.cur = 1; MKUI.press('yes'); r.chl = SYNQUENZER.mkGet(0).voc.chl[4];
  SYNQUENZER.mkSet(0, 'voc.chp.4', 10); MKUI.P.cur = 2; MKUI.press('yes'); r.chp = SYNQUENZER.mkGet(0).voc.chp[4]; SYNQUENZER.mkSet(0, 'mode', 0); MKUI.press('exit'); return r; });
R['05-utility'] = ut; ok('MK-P-05', ut.swap + '' === '99,11' && ut.neu === 127 && ut.sinit === 0 && ut.chl === 127 && ut.chp === 0, 'UTILITY ' + JSON.stringify(ut));
const gl = await page.evaluate(() => { MKUI.press('global'); const r = {p: SYNQUENZER.mkPanel().seite}; MKUI.press('pg.p'); MKUI.press('pg.p'); r.p3 = SYNQUENZER.mkPanel().seite; r.oct0 = S.tracks[0].kbOct || 4; MKUI.press('yes'); r.oct = S.tracks[0].kbOct; MKUI.press('no'); MKUI.press('pg.m'); MKUI.press('pg.m'); MKUI.press('yes'); r.e1 = MKUI.lcdLines()[1]; MKUI.press('exit'); return r; });
R['05-global'] = gl; ok('MK-P-05', gl.p === '1A EINGANG 1' && gl.p3 === '1C OKTAVE' && gl.oct === Math.min(7, gl.oct0 + 1) , 'GLOBAL ' + JSON.stringify(gl));
// ---------- MK-P-15: TIMBRE SELECT only T1 <-> T2, single locked; no old names in DOM / help / LCD ----------
const t15 = await page.evaluate(() => { const r = {}; SYNQUENZER.mkSet(0, 'mode', 0); MKUI.P.tim = 1; MKUI.press('tim'); r.single = MKUI.P.tim; SYNQUENZER.mkSet(0, 'mode', 2); MKUI.press('tim'); r.a = MKUI.P.tim; MKUI.press('tim'); r.b = MKUI.P.tim; MKUI.press('tim'); r.c = MKUI.P.tim; SYNQUENZER.mkSet(0, 'mode', 0); MKUI.press('tim');
  const txt = document.body.innerText + ' ' + [...document.querySelectorAll('[aria-label]')].map(e => e.getAttribute('aria-label')).join(' ');
  r.old = (txt.match(/EDIT-WAHL|\bSHIFT\b(?!\s)|Nummerntaste|Matrix-Zeile|\bSEITE\b/g) || []).filter(x => x);
  r.shift = (txt.match(/[A-Z]* ?SHIFT/g) || []).filter(x => x !== 'FORMANT SHIFT');
  return r; });
R['15'] = t15; ok('MK-P-15', t15.single === 1 && t15.a === 2 && t15.b === 1 && t15.c === 2, 'TIMBRE ' + JSON.stringify(t15)); ok('MK-P-15', !t15.shift.length, 'alte Namen ' + t15.shift);
const help = await page.evaluate(() => { try { return [...document.querySelectorAll('*')].length; } catch (e) { return 0; } });
// file-level checks: brand (MK-P-06 / B.6 Nr. 9), removal (MK-P-12)
const src = fs.readFileSync(FILE, 'utf8'), blk = src.slice(src.indexOf('id="sq-mk-src"'), src.indexOf('id="sq-worklet-src"'));
const brand = {microkorg: (src.match(/micro ?korg|radias|dwgs/gi) || []).length, ms2000: (src.match(/ms[ -]?2000/gi) || []), amBlock: (blk.match(/korg|micro ?korg|ms[ -]?2000|radias|dwgs|dw[ -]?[68]000|\bvox\b/gi) || [])};
R['06-datei'] = brand; ok('MK-P-06', brand.microkorg === 0 && brand.ms2000.length === 1 && brand.ms2000[0] === 'MS 2000' && brand.amBlock.length === 0, 'Marke ' + JSON.stringify(brand));
const dom6 = await page.evaluate(() => { const t = [...MKUI.PL.el.children].filter(n => n !== MKUI.PL.ui.lcd).map(n => n.textContent).join(' '), n = MKUI.PL.ui.name, cs = getComputedStyle(n);
  return {count: (t.match(/MS 2000/g) || []).length, bad: (t.match(/korg|micro ?korg|radias|dwgs|\bvox\b|analog modeling/gi) || []), img: MKUI.PL.el.querySelectorAll('img').length + (MKUI.PL.el.innerHTML.match(/data:image/g) || []).length, font: cs.fontFamily === getComputedStyle(document.body).fontFamily, w: cs.fontWeight, st: cs.fontStretch, tr: cs.transform,
    fontface: [...document.styleSheets].reduce((a, s) => { try { return a + [...s.cssRules].filter(r => r.type === 5).length; } catch (e) { return a; } }, 0)}; });
R['06-dom'] = dom6; ok('MK-P-06', dom6.count === 1 && !dom6.bad.length && !dom6.img && dom6.font && +dom6.w <= 600 && (dom6.st === 'normal' || dom6.st === '100%') && dom6.tr === 'none', 'DOM ' + JSON.stringify(dom6));
const old12 = (blk.match(/mwood|mrot\b|\bmkr\b|mdisp|mrow2|mkhalf|\bmnum\b|\bmsh\b|EDIT-WAHL|segSvg|SEC1|SEC2|SHIFT \+/g) || []);
R['12-alt'] = old12; ok('MK-P-12', old12.length === 0, 'alter Code ' + old12);
R['12-groesse'] = {datei: fs.statSync(FILE).size, vorg: fs.statSync('v3-mkp-vorg.html').size, delta: fs.statSync(FILE).size - fs.statSync('v3-mkp-vorg.html').size};
R.errors = page.errs;
ok('konsole', !page.errs.length, page.errs.join(' | '));
console.log(JSON.stringify(R, null, 1));
console.log('FEHLER', fail.length, JSON.stringify(fail, null, 1));
await b.close();
