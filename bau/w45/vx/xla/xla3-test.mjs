// XLA Prüfung (Nachbessern nach dem Prüfer, Schritt 2): Playwright, Touch per CDP, iPhone 12 Pro Max hochkant 428×926 und quer 926×428.
// Nur synthetische .cbp (Kopien aus vx/cbpimp/tests). Geprüft:
//  B1 Anzeige: im Halbton-Projekt zeigt der Träger, was der Import tut (AKKORD Standard, TONART, Akkord, Tritonus), Lesefeld ohne „Stufe“
//  B2 eigene Spuren: leere Synth-Spuren stehen auf ⇅½ (keine Reibung), „＋ Spur“ (Touch) im Halbton-Projekt ⇅½, im normalen Projekt nicht
//  B3 Song transponieren (Touch im Blatt) nimmt die ⇅½-Spuren mit: Wiedergabe (noteLog), MIDI-Export (Song, Einzelspuren), Video-Tastatur;
//     zusammen mit Rückung je Teil und Träger; eine auf „fest“ getippte Spur nur mit der Rückung; Aufnahme unter Song-Transponieren
//  K1 Hinweis und Guide wie die Tasten im Standard „nächster Weg“
//  K2 Drum-Einzelspur (MTX3) im Halbton-Projekt: ⇅ wie bisher folgt ↔ fest, nie ⇅½
//  A/B normales Projekt: Anzeige und ＋ Spur gleich wie 4.78.0 · 4.78.0 öffnet das Projekt (leere ⇅½-Spuren dort fest) · Layout · Konsole
// Aufruf: node xla3-test.mjs <index.html> <basis.html>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
import fs from 'node:fs';
const file = path.resolve(process.argv[2]), basis = path.resolve(process.argv[3] || ''), here = path.dirname(new URL(import.meta.url).pathname);
const TF = f => path.join(here, 'tests', f), U8 = f => [...fs.readFileSync(TF(f))];
let bad = 0, good = 0; const out = [];
const ok = (c, m, d) => { const s = (c ? 'OK ' : 'FEHLER ') + m + (d != null && d !== '' ? ' – ' + (typeof d === 'string' ? d : JSON.stringify(d)) : ''); if (!c) bad++; else good++; out.push(s); console.log(s); };
const info = m => { out.push('INFO ' + m); console.log('INFO ' + m); };
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const errs = [];
async function page(w, h, f) {
  const p = await b.newPage({viewport: {width: w, height: h}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  p.on('pageerror', e => errs.push((f ? 'basis: ' : '') + String(e))); p.on('console', m => { if (m.type() === 'error') errs.push((f ? 'basis: ' : '') + m.text()); });
  await p.goto('file://' + (f || file)); await p.waitForTimeout(1500);
  p.cdp = await p.context().newCDPSession(p);
  await p.evaluate(HELP);
  return p;
}
const tch = (p, type, x, y) => p.cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1, radiusX: 4, radiusY: 4, force: 1}]});
async function tap(p, x, y, hold) { await tch(p, 'touchStart', x, y); await p.waitForTimeout(hold || 50); await tch(p, 'touchEnd'); await p.waitForTimeout(220); }
const ctr = (p, sel, k) => p.evaluate(([s, k]) => { const L = [...document.querySelectorAll(s)].filter(e => e.offsetParent); const e = L[k || 0]; if (!e) return null; e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }, [sel, k]);
async function tapSel(p, sel, k, hold) { const c = await ctr(p, sel, k); if (!c) return false; await tap(p, c.x, c.y, hold); return true; }
const tapText = async (p, sel, txt) => { const k = await p.evaluate(([s, t]) => [...document.querySelectorAll(s)].filter(e => e.offsetParent).findIndex(e => e.textContent.trim().startsWith(t)), [sel, txt]); return k >= 0 ? tapSel(p, sel, k) : false; };
const cur = p => p.evaluate(() => { const c = window.__xla.cur(); if (!c) return null; return {st: c.st, tp: c.tp, building: !!c.building, res: !!c.res}; });
async function ready(p, ms) { for (let k = 0; k < (ms || 8000) / 100; k++) { await p.waitForTimeout(100); const c = await cur(p); if (c && (c.st === 'fehler' || (c.st === 'fertig' && c.res && !c.building))) return c; } return cur(p); }
async function openImport(p) { await p.evaluate(() => { closePop(); va1Sheet(); }); await p.waitForTimeout(300); await tapSel(p, 'button[data-va="midiin"]'); await p.waitForTimeout(300); }
async function pick(p, f) {
  const fc = p.waitForEvent('filechooser', {timeout: 5000});
  const s = await p.evaluate(() => UI.pop && UI.pop.name === 'xla' ? '.xla button[data-x="pick"]' : '.imp1 button[data-i="pick"]');
  await tapSel(p, s);
  const ch = await fc.catch(() => null); if (!ch) return null;
  await ch.setFiles({name: f, mimeType: 'application/octet-stream', buffer: fs.readFileSync(TF(f))});
  return ready(p);
}
const measure = p => p.evaluate(() => {
  const P = UI.pop.el, r = P.getBoundingClientRect(), vis = e => e.offsetParent && e.getClientRects().length;
  const x = [...P.querySelectorAll('button')].find(b => /✕/.test(b.textContent) || b.getAttribute('aria-label') === 'Schließen'), xr = x && x.getBoundingClientRect();
  const inf = [...P.querySelectorAll('.xlainfo')].find(e => /TRANSPONIEREN|lässt die Spuren aus/.test(e.textContent)), ir = inf && inf.getBoundingClientRect();
  const items = [...P.querySelectorAll('button, .xlainfo, h5')].filter(vis);
  const outside = items.filter(e => { const q = e.getBoundingClientRect(); return q.right > innerWidth + .5 || q.left < -.5; }).length;
  return {xVis: !!xr && xr.top >= 0 && xr.right <= innerWidth + .5, out: outside, hscroll: document.documentElement.scrollWidth > innerWidth + 1, inf: !!inf, infW: ir ? Math.round(ir.width) : 0, infIn: !!ir && ir.left >= -.5 && ir.right <= innerWidth + .5, infClip: inf ? inf.scrollWidth > inf.clientWidth + 1 : true, pop: [r.left, r.width].map(Math.round)};
});
const HELP = () => {
  window.__w = ms => new Promise(r => setTimeout(r, ms));
  window.__press = async (notes, ms) => { if (R.kbMode !== 'transpose') setKbMode('transpose'); for (const n of notes) SYNQUENZER.keyOn(n, .8, 'x' + n); await __w(ms || 60); for (const n of notes) SYNQUENZER.keyOff(n, 'x' + n); await __w(120); const e = T.current(); return {time: e.time, shift: e.shift, now: AU.ctx ? AU.ctx.currentTime : 0}; };
  window.__pc = x => ((x % 12) + 12) % 12;
  // was die Import-Spuren unter dem gültigen Träger wirklich tun (outPitch einer Clip-Note) – Verschiebung
  window.__impShift = () => { const now = nowT(); for (let i = 0; i < S.tracks.length; i++) { const t = S.tracks[i]; if (t.xs !== 1) continue; const c = t.clips.find(x => x && x.notes.length); if (!c) continue; const n = c.notes[0].n; return outPitch(i, c.key, n, now) - n; } return null; };
  window.__readout = () => ({shift: EL.carShift.textContent, tgt: EL.carTgt ? EL.carTgt.textContent : '', lab: EL.carLabel.textContent, val: EL.carVal.textContent, txt: carrierShown().text});
};
const T0 = Date.now();

/* ===== Import (Touch) – hochkant ===== */
let p = await page(428, 926);
await p.evaluate(async () => { ensureAudio(); await __w(1200); });
await openImport(p); let c = await pick(p, 'synth-song.cbp');
ok(c && c.st === 'fertig' && c.tp === 'halbton', 'Datei per Touch gewählt, Blatt offen, Halbton vorgewählt', c);

/* K1: Hinweis im Blatt wie die Tasten */
const HB = await p.evaluate(() => { const L = [...UI.pop.el.querySelectorAll('.xlainfo')].map(e => e.textContent); return L.find(t => /TRANSPONIEREN/.test(t)) || ''; });
ok(/die Taste [A-H][♯♭]? spielt das Original/.test(HB) && /kürzesten Weg, höchstens 6 Halbtöne höher oder tiefer/.test(HB) && !/eine Taste höher = einen Halbton/.test(HB), 'K1 Hinweis im Blatt: Original-Taste, jede andere Taste auf dem kürzesten Weg (höchstens 6 Halbtöne) – nicht mehr „eine Taste höher = einen Halbton höher“', HB);
let m = await measure(p);
ok(m.xVis && !m.out && !m.hscroll && m.inf && m.infIn && !m.infClip, 'Blatt hochkant 428×926: Hinweis ganz sichtbar (umbrochen, nicht abgeschnitten), ✕ sichtbar, nichts außerhalb', m);
await tapSel(p, '.xla button[data-x="ok"]'); await p.waitForTimeout(1600);

/* ===== B2 eigene Spuren: leere Synth-Spuren ⇅½ ===== */
const A = await p.evaluate(() => ({ht: S.xlaHt, tr: S.tracks.map((t, i) => ({i, n: t.name, k: t.kind, f: t.follow, xs: t.xs, cl: t.clips.filter(Boolean).length, fb: UI.heads && UI.heads[i] && UI.heads[i].fb ? UI.heads[i].fb.textContent : null}))}));
const syn = A.tr.filter(t => t.k === 'synth'), empty = syn.filter(t => !t.cl);
ok(A.ht === 1 && syn.length >= 5 && empty.length >= 2 && syn.every(t => t.f === false && t.xs === 1) && A.tr.filter(t => t.k === 'drum').every(t => t.xs == null), 'B2 Passt: alle Synth-Spuren ⇅½ – auch die leeren (' + empty.map(t => t.n).join(', ') + '); DRUMS ohne', A.tr.map(t => t.n + ':' + (t.xs ? '½' : t.f === false ? 'F' : 'f')));

/* B1 + B2: Anzeige und Reibung unter AKKORD (Standard), TONART und Akkord */
const KEYS = [[2], [4], [5], [6], [7], [9], [11], 'Am'];
const DISP = await p.evaluate(async KEYS => {
  setSongView(false); await __w(200);
  const r = S.key.root, sc = S.key.scale, h = S.settings.harmony, own = S.tracks.findIndex((t, i) => t.kind === 'synth' && !t.clips.some(Boolean) && !t.mel);
  SYNQUENZER.setClip(own, 1, {len: 1, key: {root: r, scale: sc}, notes: [0, 2, 4, 5, 7, 9, 11].map((q, k) => ({t: k * .5, d: .4, n: 60 + r + q, v: .7}))});   // eigene Stimme: die Tonleiter der Song-Tonart
  const imp = S.tracks.findIndex(t => t.xs === 1 && t.clips.some(Boolean));
  const res = [];
  for (const mode of ['chord', 'scale']) {
    h.mode = mode; syncTransposer(); await __w(60);
    for (const k of KEYS) {
      const ks = k === 'Am' ? [57 + r, 60 + r, 64 + r] : [60 + r + k[0]];
      await __press(ks); await __w(260);
      const now = nowT(), ro = __readout(), sh = __impShift();
      const ci = S.tracks[imp].clips.find(x => x && x.notes.length), cO = S.tracks[own].clips[1];
      const pcI = new Set(ci.notes.map(n => __pc(outPitch(imp, ci.key, n.n, now)))), sI = [0, 2, 4, 5, 7, 9, 11].map(q => __pc(60 + r + q + sh));
      const pcO = cO.notes.map(n => __pc(outPitch(own, cO.key, n.n, now)));
      res.push({mode, k: Array.isArray(k) ? k[0] : k, sh, shown: carrierShown().shift, txt: ro.txt, want: keyName({root: __pc(r + sh), scale: sc}), ro, clash: pcO.filter(x => !sI.includes(x)).length, impIn: [...pcI].every(x => sI.includes(x))});
    }
  }
  h.mode = 'chord'; syncTransposer(); await __press([60 + r]); setKbMode('play');
  return {res, own: S.tracks[own].name, ownXs: S.tracks[own].xs};
}, KEYS);
const badD = DISP.res.filter(x => x.shown !== x.sh || x.txt !== fmt(x.sh) + ' · → ' + x.want);
function fmt(s) { return s > 0 ? '+' + s : s < 0 ? '−' + Math.abs(s) : '±0'; }
ok(DISP.res.length === 16 && !badD.length, 'B1 Anzeige im Halbton-Projekt = was der Import tut (AKKORD Standard + TONART, 7 Tasten + Akkord Am): z. B. ' + DISP.res.filter(x => x.mode === 'chord').slice(0, 3).map(x => '„' + x.txt + '“').join(', '), badD.slice(0, 3));
const badR = DISP.res.filter(x => /Stufe/.test(x.ro.shift + x.ro.lab) || /TONART [A-H]/.test(x.ro.lab) || x.ro.shift.indexOf(fmt(x.sh)) < 0);
ok(!badR.length, 'B1 Lesefeld: zeigt die Verschiebung (keine „Stufe … Dorisch“, kein „TONART F“-Einrasten); Ziel-Tonart, wo Platz ist', badR.slice(0, 2).map(x => x.ro));
info('Lesefeld z. B.: ' + JSON.stringify(DISP.res.filter(x => x.k === 6 || x.k === 'Am').map(x => [x.mode, x.k, x.ro.val, x.ro.shift, x.ro.tgt, x.ro.lab])));
const HD = await p.evaluate(async () => { setSongView(false); await __w(300); return S.tracks.map((t, i) => t.kind === 'synth' ? (UI.heads[i] && UI.heads[i].fb ? UI.heads[i].fb.textContent : null) : 'D'); });
ok(HD.filter(x => x !== 'D').length >= 5 && HD.every(x => x === 'D' || x === '⇅½'), 'B2 Spurköpfe in der Matrix: jede Synth-Spur zeigt ⇅½ (auch die leeren)', HD);
ok(DISP.ownXs === 1 && DISP.res.every(x => x.clash === 0 && x.impIn), 'B2 keine Reibung: die eigene Stimme auf der leeren Spur „' + DISP.own + '“ (⇅½) liegt unter jeder Taste in der Tonart des Imports (0 fremde Töne)', DISP.res.map(x => x.mode[0] + x.k + ':' + x.clash).join(' '));

/* B1: gemischt – eine Spur auf ⇅ folgt getippt: die Anzeige bleibt beim Import */
const MIX = await p.evaluate(async () => {
  const i = S.tracks.findIndex(t => t.kind === 'synth' && !t.mel && t.clips[1] && t.clips[1].notes.length && !t.clips[0]); selectTrack(i >= 0 ? i : 2); await __w(150);
  return {i: R.selT};
});
await tapSel(p, '#bFolgt'); await tapSel(p, '#bFolgt'); await p.waitForTimeout(200);
const MIX2 = await p.evaluate(async () => { const st = S.tracks[R.selT]; const e = await __press([60 + S.key.root + 4]); await __w(250); const r = {f: st.follow, xs: st.xs, sh: __impShift(), shown: carrierShown().shift, txt: carrierShown().text}; await __press([60 + S.key.root]); setKbMode('play'); return r; });
ok(MIX2.f === true && MIX2.xs == null && MIX2.shown === MIX2.sh && MIX2.sh === 4, 'B1 eine Spur per Touch auf ⇅ folgt getippt (⇅½ → fest → ⇅): die Anzeige zeigt weiter den Import (+4)', MIX2);
await p.evaluate(() => { const t = S.tracks[R.selT]; t.follow = false; t.xs = 1; UI.dirty.all = true; });

/* B2: ＋ Spur per Touch im Halbton-Projekt */
const nt0 = await p.evaluate(() => NT());
await p.evaluate(() => openMenu()); await p.waitForTimeout(400);
let added = await tapText(p, 'button', '＋ Spur'); await p.waitForTimeout(500);
const NTR = await p.evaluate(n0 => { const i = NT() - 1, t = S.tracks[i]; return {n: NT(), i, f: t.follow, xs: t.xs, fb: UI.heads[i] && UI.heads[i].fb ? UI.heads[i].fb.textContent : null, ck: EL.bFolgt.querySelector('.ck').textContent, sel: R.selT, top: UNDO.length ? UNDO[UNDO.length - 1].label : ''}; }, nt0);
ok(added && NTR.n === nt0 + 1 && NTR.f === false && NTR.xs === 1 && NTR.sel === NTR.i && NTR.ck === '½', 'B2 Menü › ＋ Spur (Touch) im Halbton-Projekt: neue Synth-Spur ⇅½ (Spur-Taste ⇅½), ein ↶', NTR);
await p.evaluate(() => { closeMenu && closeMenu(); undo(); }); await p.waitForTimeout(300);
ok(await p.evaluate(n0 => NT() === n0, nt0), 'B2 ↶ nimmt die neue Spur wieder weg');

/* ===== B3: Song transponieren nimmt ⇅½ mit ===== */
const SG = await p.evaluate(async () => {
  setSongView(true); await __w(250);
  // eine Import-Spur auf „fest“ tippen (Vergleich): sie geht nur mit der Rückung, nicht mit Song transponieren (wie bisher für feste Spuren)
  const fi = S.tracks.findIndex(t => t.xs === 1 && t.clips.some(Boolean) && !t.mel); window.__xla.folgtTap(fi);
  return {fi, fF: S.tracks[fi].follow, fXs: S.tracks[fi].xs || 0, xp0: JSON.stringify(S.song.xp)};
});
await p.evaluate(() => gr1XpOpen()); await p.waitForTimeout(400);
await tapSel(p, '.gr1sheet button[data-gx="1"]'); await tapSel(p, '.gr1sheet button[data-gx="1"]'); await p.waitForTimeout(300);
const GX = await p.evaluate(() => ({xp: JSON.stringify(S.song.xp), tip: (UI.pop && UI.pop.el.querySelector('.gr1-tip') || {}).textContent || '', toast: EL.toast.textContent}));
await p.evaluate(() => closePop()); await p.waitForTimeout(200);
ok(SG.fF === false && !SG.fXs && /"semi":2/.test(GX.xp) && /Song \+2/.test(GX.toast), 'B3 Touch: Menü-Blatt „Song transponieren“ 2× + 1 → song.xp +2 (eine Import-Spur zum Vergleich auf „fest“)', {xp: GX.xp, toast: GX.toast.slice(0, 40)});
const SP = await p.evaluate(async fi => {
  const ms = S.song.marks.slice().sort((a, b) => a.a - b.a), m = ms[2]; jam2RkSet(m.id, 1); await __w(100);   // Rückung +1 ab dem 3. Teil
  const mb = barBeat(m.a), song = S.song;
  // MIDI-Export Song: ⇅½-Spuren +2 vor dem Teil, +3 ab dem Teil; die feste Spur 0 / +1; DRUMS gleich
  const parse = u8 => va1MidiParse(u8.bytes || u8).tracks.map(t => ({name: t.name, notes: t.notes.map(n => [+n.t.toFixed(3), n.n])}));
  const E = parse(buildMidiSong(false)), xpOld = song.xp; song.xp = []; const mOld = song.marks.map(x => x.rk); song.marks.forEach(x => { delete x.rk; delete x.rkx; }); JAM3.fc = null; UI.songVer = (UI.songVer | 0) + 1;
  const E0 = parse(buildMidiSong(false)); song.xp = xpOld; song.marks.forEach((x, k) => { if (mOld[k] != null) x.rk = mOld[k]; }); JAM3.fc = null; UI.songVer = (UI.songVer | 0) + 1;
  const of = (L, t) => (L.find(x => t.kind === 'drum' ? /^Drums/.test(x.name) : x.name.startsWith(t.name + ' (')) || {}).notes;
  const want = (i, beat) => { const t = S.tracks[i]; if (t.kind === 'drum') return 0; const after = beat >= mb - 1e-6; if (t.xs === 1) return 2 + (after ? 1 : 0); return after ? 1 : 0; };
  let n = 0, badN = 0, nF = 0, badF = 0, nD = 0, badD = 0; const ex = [];
  S.tracks.forEach((t, i) => { const A = of(E, t), Z = of(E0, t); if (!A || !Z || A.length !== Z.length) { if (Z && Z.length) { badN++; ex.push(['len', t.name]); } return; }
    for (let k = 0; k < A.length; k++) { const d = A[k][1] - Z[k][1], w = want(i, Z[k][0]); if (t.kind === 'drum') { nD++; if (d) badD++; } else if (i === fi) { nF++; if (d !== w) badF++; } else if (t.xs === 1) { n++; if (d !== w) { badN++; if (ex.length < 3) ex.push([t.name, Z[k], A[k], w]); } } } });
  const xi = S.tracks.findIndex(t => t.xs === 1 && t.clips.some(Boolean));
  return {n, badN, nF, badF, nD, badD, ex, mb, xi};
}, SG.fi);
ok(SP.n > 100 && SP.badN === 0 && SP.nF > 20 && SP.badF === 0 && SP.nD > 20 && SP.badD === 0, 'B3 MIDI-Export Song: ⇅½-Spuren +2 (Song transponieren), ab dem 3. Teil +3 (dazu Rückung +1); die feste Spur nur die Rückung (0/+1); DRUMS gleich', {xs: SP.n, falsch: SP.badN, fest: SP.nF, festFalsch: SP.badF, ex: SP.ex});
// Einzelspuren-MIDI und Video-Tastatur: dieselbe Rechnung (song.xp) – Vergleich der Tonhöhen gegen den Song-Export
const SP2 = await p.evaluate(xi => {
  const P = u8 => va1MidiParse(u8.bytes || u8).tracks, nm = S.tracks[xi].name, key = (t, n) => Math.round(t * 480) + ':' + n;
  const set = L => [...new Set(L)].sort().join(',');
  const A = P(buildMidiSong(false)).find(t => t.name.startsWith(nm + ' (')), Bs = P(va1MidiSong([xi], false)), B = Bs.find(t => t.name.startsWith(nm)) || Bs.find(t => t.notes && t.notes.length);
  const sA = set(A.notes.map(n => key(n.t, n.n))), sB = B ? set(B.notes.map(n => key(n.t, n.n))) : '';
  // Video-Tastatur: vvkScore(a, b).tr[i] = [{s, e, n, v}] in Song-Schlägen – dieselben Tonhöhen wie der MIDI-Export
  const V = vvkScore(0, S.song.bars).tr[xi] || [], sV = set(V.map(x => key(x.s, x.n)));
  return {same: sA === sB, nA: A.notes.length, nB: B ? B.notes.length : 0, vSame: sV === sA, nV: V.length, d: sV === sA ? null : [sV.slice(0, 60), sA.slice(0, 60)]};
}, SP.xi);
ok(SP2.same && SP2.nA > 20, 'B3 Einzelspuren-MIDI der ⇅½-Spur = Song-MIDI (song.xp gleich gerechnet)', {n: SP2.nA, nB: SP2.nB});
ok(SP2.vSame && SP2.nV > 20, 'B3 Video-Tastatur (Noten im Video) der ⇅½-Spur = MIDI-Export', {nV: SP2.nV, d: SP2.d});
// Wiedergabe: Song ab Takt 1 und ab dem 3. Teil, noteLog: ⇅½ +2 bzw. +3, feste Spur 0 bzw. +1, dazu der Träger (+1)
const PL = await p.evaluate(async fi => {
  const ms = S.song.marks.slice().sort((a, b) => a.a - b.a), m = ms[2], res = {};
  for (const [nm, bar] of [['vor', 0], ['ab', m.a]]) {
    clearLog(); SYNQUENZER.songPlay(bar); await __w(1200);
    const e = await __press([60 + S.key.root + 1]); setKbMode('play'); await __w(6000);
    const L = noteLog(4096).filter(x => x.src !== 'live' && x.time > e.time + .05);
    SYNQUENZER.songPlay(false); SYNQUENZER.stop(); await __w(700);
    let n = 0, badN = 0, nF = 0, badF = 0; const ex = [], wx = nm === 'vor' ? 3 : 4, wf = nm === 'vor' ? 0 : 1;
    for (const x of L) { const t = S.tracks[x.track]; if (!t || t.kind !== 'synth' || x.clipNote == null) continue; const d = x.out - x.clipNote;
      if (x.track === fi) { nF++; if (d !== wf) badF++; } else if (t.xs === 1) { n++; if (d !== wx) { badN++; if (ex.length < 3) ex.push([x.track, x.clipNote, x.out, wx]); } } }
    res[nm] = {n, badN, nF, badF, ex};
    await __press([60 + S.key.root]); setKbMode('play');
  }
  return res;
}, SG.fi);
ok(PL.vor.n >= 3 && PL.vor.badN === 0 && PL.ab.n >= 3 && PL.ab.badN === 0, 'B3 Wiedergabe (noteLog): ⇅½-Spuren = Song +2 + Träger +1 → +3, ab dem 3. Teil mit Rückung → +4', {vor: PL.vor, ab: PL.ab});
ok(PL.vor.badF === 0 && PL.ab.badF === 0 && (PL.vor.nF + PL.ab.nF) > 0, 'B3 Wiedergabe: die feste Spur bleibt beim Song transponieren und Träger fest, nur die Rückung (+1) nimmt sie mit', {vor: PL.vor.nF, ab: PL.ab.nF});
// Aufnahme unter Song transponieren + Träger: gespeichert wird die Note, die als die gespielte klingt
const RC = await p.evaluate(async () => {
  const xi = S.tracks.findIndex(t => t.xs === 1 && t.clips.some(Boolean)), c = S.tracks[xi].clips.find(Boolean);
  SYNQUENZER.songPlay(0); await __w(1200); await __press([60 + S.key.root + 2]); setKbMode('play'); await __w(900);
  const now = nowT(), x = xpAt(now + 1e-6), sh = T.targetAt(now + 1e-6).shift, out = [];
  for (const played of [55, 60, 64, 67, 71]) { const n0 = clipNoteFor(xi, c.key, played, now); out.push([played, n0, outPitch(xi, c.key, n0, now)]); }
  SYNQUENZER.songPlay(false); SYNQUENZER.stop(); await __w(500); await __press([60 + S.key.root]); setKbMode('play');
  return {x, sh, out, ok: out.every(o => o[2] === o[0] && o[1] === o[0] - x - sh)};
});
ok(RC.ok && RC.x === 2 && RC.sh === 2, 'B3 Aufnahme/FANG unter Song transponieren (+2) und Träger (+2): gespeicherte Note = gespielt − 4, klingt wie gespielt', RC);
await p.evaluate(() => { undo(); undo(); undo(); }); await p.waitForTimeout(300);
const UN = await p.evaluate(() => ({xp: JSON.stringify(S.song.xp)}));
ok(!/"semi":-?[1-9]/.test(UN.xp), 'B3 ↶ ↶ ↶ nimmt Rückung und beide „+ 1“ zurück', UN);

/* ===== K1 Guide ===== */
const GD = await p.evaluate(() => { const e = ui1Entries().find(x => x.id === 'xlaht'); return e ? e.d : ''; });
const KS = await p.evaluate(async () => { const r = S.key.root, o = []; for (let k = 0; k <= 12; k++) { await __press([60 + r + k]); o.push(window.__xla.xsShift(null, T.current())); } await __press([60 + r]); setKbMode('play'); return o; });
ok(/kürzesten Weg, höchstens 6 Halbtöne/.test(GD) && /absolut/.test(GD) && /Leere und neue Synth-Spuren stehen hier auch auf ⇅½/.test(GD) && !/eine Taste höher klingt einen Halbton höher\./.test(GD), 'K1 Guide-Eintrag: kürzester Weg (höchstens 6), „absolut“ erklärt, eigene Spuren ⇅½', GD.slice(0, 90));
ok(KS.slice(0, 6).every((v, k) => v === k) && Math.abs(KS[6]) === 6 && KS.slice(7, 12).every((v, k) => v === k - 5) && KS[12] === 0 && KS.every(v => Math.abs(v) <= 6), 'K1 die Tasten tun, was Hinweis und Guide sagen: 0 … +5, Tritonus ±6, dann −5 … −1, obere Taste = Original', KS.join(' '));

/* ===== K2 Drum-Einzelspur (MTX3) im Halbton-Projekt ===== */
const DJ = await p.evaluate(async () => {
  setSongView(false); await __w(200);
  const P = mtx3Plan(), ids = (P.def && P.def.length ? P.def : P.can.map(x => x.id)).slice(0, 1), n0 = S.tracks.length; mtx3Split(ids, true); await __w(300);
  const j = S.tracks.length > n0 ? S.tracks.length - 1 : -1; if (j >= 0) selectTrack(j); await __w(200);
  return {j, dvx: j >= 0 && !!S.tracks[j].dvx, f: j >= 0 ? S.tracks[j].follow : null, xs: j >= 0 ? S.tracks[j].xs : null};
});
const seq = [];
for (let k = 0; k < 3; k++) { await tapSel(p, '#bFolgt'); await p.waitForTimeout(150); seq.push(await p.evaluate(j => ({f: S.tracks[j].follow, xs: S.tracks[j].xs || 0, toast: EL.toast.hidden ? '' : EL.toast.textContent.slice(0, 30), ck: EL.bFolgt.querySelector('.ck').textContent}), DJ.j)); }
ok(DJ.j >= 0 && DJ.dvx && seq.every(s => !s.xs && !/⇅½/.test(s.toast) && s.ck !== '½') && seq[0].f !== seq[1].f && seq[1].f !== seq[2].f, 'K2 Drum-Einzelspur (MTX3) im Halbton-Projekt: ⇅ per Touch wechselt wie bisher folgt ↔ fest, nie ⇅½', {start: DJ, seq});
await p.evaluate(() => { undo(); }); await p.waitForTimeout(300);

/* ===== 4.78.0 öffnet das Projekt: die leeren ⇅½-Spuren sind dort fest (Noten exakt) ===== */
const FO = await p.evaluate(() => serialize());
if (fs.existsSync(basis)) {
  const q = await page(428, 926, basis);
  const O = await q.evaluate(async f => { const fo = JSON.parse(f), want = fo.project.tracks.map(t => t && t.kind === 'synth' && t.xs === 1), emp = fo.project.tracks.map(t => t && t.xs === 1 && !t.clips.some(Boolean)); applyProject(projFromFile(fo), {ui: true}); await __w(300);
    return {n: want.filter(Boolean).length, leer: emp.filter(Boolean).length, fest: S.tracks.every((t, i) => !want[i] || (t.follow === false && t.xs == null)), ver: typeof VERSION !== 'undefined' ? VERSION : null}; }, FO);
  ok(O.n >= 4 && O.leer >= 1 && O.fest, '4.78.0 öffnet das Projekt: alle ⇅½-Spuren (auch die leeren) sind dort ⇅ fest, xs fällt weg', O);
  /* A/B normales Projekt: Anzeige und ＋ Spur wie 4.78.0 */
  const AB = async pg => pg.evaluate(async () => { applyProject(normalizeProject(demoProjectRaw()), {ui: true}); ensureAudio(); await __w(900); setSongView(false); await __w(200);
    const r = S.key.root, h = S.settings.harmony, o = [];
    for (const mode of ['chord', 'scale']) { h.mode = mode; syncTransposer(); for (const ks of [[62], [64], [66], [67], [57, 60, 64]]) { await __press(ks.map(n => n + r)); await __w(250); const ro = __readout(); o.push([mode, ks.join('+'), ro.txt, ro.shift, ro.lab, ro.tgt]); } }
    h.mode = 'chord'; syncTransposer(); await __press([60 + r]); setKbMode('play');
    const i = addTrack(), t = i >= 0 ? Object.assign({}, S.tracks[i]) : null; if (t) { delete t.uid; delete t.sound; delete t.clips; }
    return {o, t: JSON.stringify(t)}; });
  const a1 = await AB(q), a2 = await AB(p);
  ok(JSON.stringify(a1.o) === JSON.stringify(a2.o) && a1.o.length === 10, 'A/B normales Projekt (AKKORD + TONART, 5 Tasten): Lesefeld und Anzeige genau wie 4.78.0', a2.o.slice(0, 2));
  ok(a1.t === a2.t && /"follow":true/.test(a2.t) && !/"xs"/.test(a2.t), 'A/B normales Projekt: ＋ Spur genau wie 4.78.0 (⇅ folgt, ohne xs)', a2.t.slice(0, 80));
  await q.close();
}

/* ===== Layout quer + 320: Blatt mit dem längeren Hinweis, Lesefeld mit „· → F♯-Dur“ ===== */
await p.close();
p = await page(926, 428);
await p.evaluate(async () => { ensureAudio(); await __w(1000); });
await openImport(p); c = await pick(p, 'synth-song.cbp');
m = await measure(p);
ok(c && c.st === 'fertig' && m.xVis && !m.out && !m.hscroll && m.inf && m.infIn && !m.infClip, 'Blatt quer 926×428: Hinweis ganz sichtbar, ✕ sichtbar, nichts außerhalb', m);
await tapSel(p, '.xla button[data-x="ok"]'); await p.waitForTimeout(1600);
const LQ = await p.evaluate(async () => { setSongView(false); await __w(200); const r = S.key.root; await __press([60 + r + 6]); await __w(300);
  const ro = __readout(), box = EL.carShift.closest('#readout') || EL.carShift.parentNode.parentNode, R0 = box.getBoundingClientRect();
  const kids = [EL.carVal, EL.carShift, EL.carTgt].filter(e => e && e.textContent).map(e => e.getBoundingClientRect()), inside = kids.every(q => q.left >= R0.left - .5 && q.right <= R0.right + .5);
  const cut = [EL.carVal, EL.carShift, EL.carTgt].filter(e => e && e.textContent).some(e => e.scrollWidth > e.clientWidth + 1);
  return {ro, inside, cut}; });
ok(/[+−]6/.test(LQ.ro.shift) && LQ.inside && !LQ.cut, 'Lesefeld quer: Tritonus „±6“ mit Ziel-Tonart, nichts abgeschnitten oder außerhalb', LQ.ro);
await p.evaluate(() => { closePop(); }); await p.setViewportSize({width: 320, height: 640}); await p.waitForTimeout(300);
await openImport(p); c = await pick(p, 'synth-loop4.cbp');
m = await measure(p);
ok(c && c.st === 'fertig' && m.xVis && !m.out && !m.hscroll && m.inf && m.infIn && !m.infClip, 'Blatt 320×640: Hinweis ganz sichtbar, nichts außerhalb, kein waagrechtes Rollen', m);
await p.evaluate(() => closePop());
await p.close();

ok(!errs.length, 'Konsole ohne Fehler (neu und 4.78.0)', errs.slice(0, 4));
await b.close();
const sum = `\n${good} OK, ${bad} FEHLER · ${((Date.now() - T0) / 1000).toFixed(0)} s`;
console.log(sum); out.push(sum);
fs.writeFileSync(path.join(here, 'xla3-test.out'), out.join('\n') + '\n');
process.exit(bad ? 1 : 0);
