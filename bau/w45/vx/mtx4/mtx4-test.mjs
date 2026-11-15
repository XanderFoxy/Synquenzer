// MTX4 Teil 1+2 + Prüfung (Befunde 1–10, Abschnitt am Ende) – mehrere Clips zugleich (Teil 2: Länge ÷2/×2, neue Clip-Versionen, Länge im Lauf): Auswahl (Clip-Blatt › Mehrere wählen, Tipp = dazu/weg, Szenen-Kopf), Leiste −12 −1 +1 +12,
// Stufe ▲▼, In Tonart einpassen ▾, Quantisieren ▾, Drum-Clips nur mit „Drums ±“, ein ↶ je Aktion, Änderung ab dem nächsten Takt, Leistung.
// Aufruf: node mtx4-test.mjs <index.html> <fotoordner>   (absolute Pfade). Echte Touch-Ereignisse über CDP (428×926, 926×428, 926×370).
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2], dir = process.argv[3];
if (!file || !dir) { console.log('Aufruf: node mtx4-test.mjs <index.html> <fotoordner>'); process.exit(2); }
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const res = []; const ok = (name, cond, info) => { res.push({name, ok: !!cond}); console.log((cond ? 'OK     ' : 'FEHLER ') + name + (info !== undefined ? ' · ' + JSON.stringify(info) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function open(w, h) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1800);
  const cdp = await ctx.newCDPSession(p);
  const T = {
    async down(x, y) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1}]}); },
    async up() { await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); },
    async tap(x, y) { await this.down(x, y); await sleep(60); await this.up(); await sleep(260); },
    async hold(x, y, ms = 700) { await this.down(x, y); await sleep(ms); await this.up(); await sleep(300); },
  };
  return {ctx, p, errs, T};
}
const R_ = (p, fn, arg) => p.evaluate(([src, a]) => { const e = (0, eval)(src)(a); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2, r: r.right, b: r.bottom}; }, [fn.toString(), arg]);
const cell = (p, t, s) => R_(p, a => UI.cells[a[0]][a[1]].el, [t, s]);
const sig = p => p.evaluate(() => S.tracks.map(tr => tr.clips.map(c => (c ? JSON.stringify(cleanClip(c)) : null))));
const popName = p => p.evaluate(() => (UI.pop ? UI.pop.name : null));
async function popCheck(p, label) {
  const r = await p.evaluate(() => {
    const P = UI.pop && UI.pop.el; if (!P) return null;
    const q = P.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
    const small = [...P.querySelectorAll('button')].filter(b => b.getClientRects().length && !b.classList.contains('ux1-px')).map(b => b.getBoundingClientRect()).filter(r => r.height < 43.5 || r.width < 43.5).length;
    const B = SYNQUENZER.mtx4.bar(), z = B && !B.hidden ? B.getBoundingClientRect() : null;
    const over = z ? !(q.right <= z.left || q.left >= z.right || q.bottom <= z.top || q.top >= z.bottom) : false;
    return {in: q.left >= 7.5 && q.top >= 7.5 && q.right <= vw - 7.5 && q.bottom <= vh - 7.5, box: [q.left, q.top, q.right, q.bottom].map(Math.round), small, over};
  });
  ok(label + ': Blatt ganz im Bild, Knöpfe ≥ 44 px, nicht unter/über der Leiste', r && r.in && r.small === 0 && !r.over, r);
}
async function barCheck(p, label) {
  const r = await p.evaluate(() => {
    const B = SYNQUENZER.mtx4.bar(); if (!B || B.hidden) return {vis: false};
    const q = B.getBoundingClientRect(), vw = innerWidth, vh = innerHeight, g = EL.grid.getBoundingClientRect();
    const bs = [...B.querySelectorAll('button')].filter(x => x.getClientRects().length).map(x => x.getBoundingClientRect());
    const small = bs.filter(r => r.height < 43.5 || r.width < 43.5).length, out = bs.filter(r => r.left < q.left - .5 || r.right > q.right + .5 || r.top < q.top - .5 || r.bottom > q.bottom + .5).length;
    // keine Überlappung mit den Zellen der Matrix
    const cells = [...document.querySelectorAll('#clipGrid .slot')].filter(c => c.offsetParent).map(c => c.getBoundingClientRect());
    const hit = cells.filter(c => c.right > q.left + 1 && c.left < q.right - 1 && c.bottom > q.top + 1 && c.top < q.bottom - 1).length;
    const kb = document.querySelector('#modeSeg, #segPlay'), kr = kb && kb.offsetParent ? kb.getBoundingClientRect() : null;
    return {vis: true, in: q.left >= -.5 && q.top >= 0 && q.right <= vw + .5 && q.bottom <= vh, box: [q.left, q.top, q.right, q.bottom].map(Math.round), n: bs.length, small, out, hit,
      names: [...B.querySelectorAll('button')].filter(x => x.getClientRects().length).map(x => x.textContent.trim())};
  });
  ok(label + ': Leiste sichtbar, ganz im Bild, alle Knöpfe ≥ 44 px und in der Leiste, keine Matrix-Zelle verdeckt', r.vis && r.in && r.small === 0 && r.out === 0 && r.hit === 0, r);
  return r;
}
const btn = (p, k) => R_(p, a => SYNQUENZER.mtx4.bar().querySelector('[data-m4="' + a + '"]'), k);
async function tapBtn(T, p, k) { const r = await btn(p, k); if (!r) { ok('Knopf ' + k + ' da', false); return false; } await T.tap(r.cx, r.cy); return true; }
async function tapPop(T, p, sel) { const r = await R_(p, a => (UI.pop && UI.pop.el ? UI.pop.el.querySelector(a) : null), sel); if (!r) { ok('Blatt-Knopf ' + sel, false); return false; } await T.tap(r.cx, r.cy); return true; }

// ======================= hochkant 428 × 926: Bedienung per Touch =======================
{
  const {ctx, p, errs, T} = await open(428, 926);
  const before = await sig(p);
  // Clip (0,0) lange drücken → Clip-Blatt → [Mehrere wählen]
  let c = await cell(p, 0, 0); await T.hold(c.cx, c.cy, 700);
  const cs = await p.evaluate(() => { const b = EL.clipSheet.querySelector('.mtx4cs'); if (!b) return null; b.scrollIntoView({block: 'nearest'}); const r = b.getBoundingClientRect(), sh = EL.clipSheet.getBoundingClientRect(); return {w: r.width, h: r.height, in: r.top >= sh.top - .5 && r.bottom <= sh.bottom + .5 && r.bottom <= innerHeight, sheet: [sh.top, sh.bottom].map(Math.round)}; });
  ok('Clip-Blatt hat [Mehrere wählen] (≥ 44 px, im Blatt, im Bild)', cs && cs.h >= 43.5 && cs.w >= 43.5 && cs.in, cs);
  await p.screenshot({path: dir + '/mtx4-clipblatt-hochkant.png'});
  let r = await R_(p, () => EL.clipSheet.querySelector('.mtx4cs')); if (r) await T.tap(r.cx, r.cy);
  let st = await p.evaluate(() => ({on: SYNQUENZER.mtx4.on(), sel: SYNQUENZER.mtx4.sel(), editor: R.editor}));
  const ser0 = await p.evaluate(() => serialize());   // nach dem Halten (das wählt wie immer Spur/Szene = S.ui.selT) – ab hier darf sich nichts ändern
  ok('[Mehrere wählen]: Modus an, der Clip ist gewählt, Blatt zu', st.on && st.sel.length === 1 && st.sel[0].t === 0 && st.sel[0].s === 0 && !st.editor, st);
  // weitere Clips antippen: (1,1) und (2,1) → 3 Clips in 2 Szenen; nichts startet
  for (const [t, s] of [[1, 1], [2, 1]]) { c = await cell(p, t, s); await T.tap(c.cx, c.cy); }
  st = await p.evaluate(() => ({sel: SYNQUENZER.mtx4.sel().map(x => x.t + ':' + x.s).join(','), playing: R.playing, slots: R.slot.slice(),
    cls: [...document.querySelectorAll('#clipGrid .slot.mtx4sel')].map(e => e.dataset.t + ':' + e.dataset.s).sort().join(','),
    out: getComputedStyle(UI.cells[1][1].el).outlineStyle, op: [getComputedStyle(UI.cells[1][1].el).opacity, getComputedStyle(UI.cells[1][0].el).opacity]}));
  ok('Tipp nimmt Clips dazu: 3 Clips in 2 Szenen, Markierung (Rahmen, übrige blass)', st.sel === '0:0,1:1,2:1' && st.cls === '0:0,1:1,2:1' && st.out === 'solid' && +st.op[0] === 1 && +st.op[1] < 1, st);
  ok('im Modus startet ein Tipp keinen Clip', !st.playing, st.slots);
  ok('Auswahl und Modus sind kein Projektfeld (Speicherstand nach 2 weiteren Tipps bit-gleich)', (await p.evaluate(() => serialize())) === ser0);
  const bar = await barCheck(p, 'hochkant');
  ok('Leiste: −12 −1 +1 +12 · Stufe ▲▼ · Länge ÷2 ×2 · Tonart ▾ · Quant. ▾ · ✕', ['−12', '−1', '+1', '+12', '▲Stufe', '▼Stufe', '÷2Länge', '×2Länge', 'Tonart ▾', 'Quant. ▾', '✕'].every(x => (bar.names || []).includes(x)), bar.names);
  await p.screenshot({path: dir + '/mtx4-auswahl-hochkant.png'});
  // +1 → alle Noten der 3 Clips +1, alle anderen Clips bit-gleich, ein ↶-Schritt
  const u0 = await p.evaluate(() => UNDO.length);
  await tapBtn(T, p, 'p1');
  const a = await sig(p), u1 = await p.evaluate(() => ({n: UNDO.length, kind: UNDO[UNDO.length - 1].kind, items: (UNDO[UNDO.length - 1].items || []).length}));
  const chosen = new Set(['0:0', '1:1', '2:1']); let same = 0, diff = [], plus = true;
  for (let t = 0; t < before.length; t++) for (let s = 0; s < before[t].length; s++) {
    const k = t + ':' + s;
    if (!chosen.has(k)) { if (before[t][s] === a[t][s]) same++; else diff.push(k); continue; }
    const X = JSON.parse(before[t][s]).notes, Y = JSON.parse(a[t][s]).notes;
    if (X.length !== Y.length || X.some((n, j) => Y[j].n !== n.n + 1 || Y[j].t !== n.t || Y[j].d !== n.d || Y[j].v !== n.v)) plus = false;
  }
  ok('+1: alle Noten der 3 Clips +1 (Zeit, Dauer, Anschlag gleich)', plus);
  ok('+1: alle anderen Clips bit-gleich', diff.length === 0, {gleich: same, anders: diff});
  ok('+1 = ein ↶-Schritt (Gruppe aus 3 Clip-Schritten)', u1.n === u0 + 1 && u1.kind === 'group' && u1.items === 3, u1);
  await p.evaluate(() => undo()); await sleep(200);
  const back = await sig(p);
  ok('ein ↶ macht alles rückgängig (alle Clips bit-gleich wie vorher)', JSON.stringify(back) === JSON.stringify(before));
  await p.evaluate(() => redo()); await sleep(200);
  ok('↷ bringt +1 zurück', JSON.stringify(await sig(p)) === JSON.stringify(a));
  await p.evaluate(() => undo()); await sleep(150);
  // −12 / +12 / −1 über die Knöpfe
  await tapBtn(T, p, 'p12'); await tapBtn(T, p, 'm12'); await tapBtn(T, p, 'm1');
  const m = await p.evaluate(() => ({n0: S.tracks[0].clips[0].notes.map(n => n.n), u: UNDO.slice(-3).map(x => x.label)}));
  ok('+12, −12, −1 je ein Schritt', m.u.length === 3 && /\+12/.test(m.u[0]) && /−12/.test(m.u[1]) && /−1 /.test(m.u[2] + ' '), m.u);
  await p.evaluate(() => { undo(); undo(); undo(); }); await sleep(150);
  ok('drei ↶: wieder wie vorher', JSON.stringify(await sig(p)) === JSON.stringify(before));
  // Szenen-Kopf im Modus: nimmt die Noten-Clips der Szene dazu (keine Drums), startet nichts
  r = await R_(p, () => UI.scenes[0]); await T.tap(r.cx, r.cy);
  st = await p.evaluate(() => ({sel: SYNQUENZER.mtx4.sel().map(x => x.t + ':' + x.s).join(','), playing: R.playing}));
  ok('Szenen-Kopf ▶1 im Modus: alle Noten-Clips der Szene dazu, keine Drums, nichts startet', st.sel === '0:0,1:0,2:0,1:1,2:1' && !st.playing, st);
  // Drum-Clip: nur per eigenem Tipp; ± nur mit [Drums ±]
  c = await cell(p, 4, 0); await T.tap(c.cx, c.cy);
  const dr0 = await p.evaluate(() => JSON.stringify(cleanClip(S.tracks[4].clips[0])));
  const bd = await btn(p, 'dr'); ok('mit Drum-Clip: Knopf „Drums fest“ in der Leiste', bd && bd.h >= 43.5, bd);
  await tapBtn(T, p, 'p1');
  const dr1 = await p.evaluate(() => JSON.stringify(cleanClip(S.tracks[4].clips[0])));
  ok('+1 mit „Drums fest“: Drum-Clip bleibt gleich', dr0 === dr1);
  await p.evaluate(() => undo()); await sleep(150);
  await tapBtn(T, p, 'dr'); await tapBtn(T, p, 'p1');
  const dr2 = await p.evaluate(() => ({c: S.tracks[4].clips[0].notes.map(n => n.n), lab: SYNQUENZER.mtx4.bar().querySelector('[data-m4="dr"]').textContent}));
  ok('„Drums ±“ (ausdrücklich): Drum-Clip +1', JSON.parse(dr0).notes.every((n, j) => dr2.c[j] === n.n + 1) && dr2.lab.replace(/\s/g, '') === 'Drums±', dr2.lab);
  await p.screenshot({path: dir + '/mtx4-drums-hochkant.png'});
  await p.evaluate(() => undo()); await sleep(150);
  ok('↶: wieder alles wie vorher', JSON.stringify(await sig(p)) === JSON.stringify(before));
  // In Tonart einpassen: C-Dur-Clip → Dorisch (über das Blatt)
  await p.evaluate(() => {
    const c = S.tracks[0].clips[0]; c.len = 2; c.key = {root: 0, scale: 'ionian', src: 'user'};
    const P = [60, 62, 64, 65, 67, 69, 71, 72, 71, 69, 67, 65, 64, 62, 60, 76];   // C-Dur hoch und runter + e″
    c.notes = P.map((n, k) => ({t: k * .5 + (k % 3 ? .02 : 0), d: k % 2 ? .25 : .5, n, v: Math.round((.4 + (k % 5) * .12) * 100) / 100}));
    clipChanged(0, 0); SYNQUENZER.mtx4.set([[0, 0]]);
  });
  const fb0 = await p.evaluate(() => JSON.parse(JSON.stringify(S.tracks[0].clips[0].notes)));
  await tapBtn(T, p, 'fit'); await sleep(200);
  ok('Tonart ▾ öffnet „In Tonart einpassen“', (await popName(p)) === 'mtx4fit');
  await popCheck(p, 'Tonart ▾ hochkant');
  await p.screenshot({path: dir + '/mtx4-tonart-hochkant.png'});
  await tapPop(T, p, '[data-m4f="dorian"]'); await sleep(200);
  const fd = await p.evaluate(() => ({ns: S.tracks[0].clips[0].notes.map(n => ({t: n.t, d: n.d, n: n.n, v: n.v})), key: S.tracks[0].clips[0].key}));
  const DOR = [0, 2, 3, 5, 7, 9, 10];
  ok('Dorisch auf C-Dur-Clip: jede Note in C-Dorisch', fd.ns.every(n => DOR.includes(((n.n % 12) + 12) % 12)), fd.ns.map(n => n.n));
  ok('Rhythmus und Anschlag unverändert (Zeit, Dauer, Anschlag, Anzahl)', fd.ns.length === fb0.length && fd.ns.every((n, j) => n.t === fb0[j].t && n.d === fb0[j].d && n.v === fb0[j].v));
  ok('Stufe für Stufe: E→E♭, H→B, A bleibt; Tonart des Clips = C-Dorisch (fest)', fd.ns[2].n === 63 && fd.ns[6].n === 70 && fd.ns[5].n === 69 && fd.key.root === 0 && fd.key.scale === 'dorian' && fd.key.src === 'user', {n: fd.ns.map(n => n.n), key: fd.key});
  // weitere Modi (Kern) + Pentatonik
  const modes = await p.evaluate(() => {
    const o = {}; const Z = {ionian: [0, 2, 4, 5, 7, 9, 11], aeolian: [0, 2, 3, 5, 7, 8, 10], mixolydian: [0, 2, 4, 5, 7, 9, 10], phrygian: [0, 1, 3, 5, 7, 8, 10], pent: [0, 2, 4, 7, 9]};
    undo();
    for (const m of ['ionian', 'aeolian', 'mixolydian', 'phrygian', 'pent']) { const q = SYNQUENZER.mtx4.fitNotes(0, 0, m); o[m] = q.every(n => Z[m].includes(n % 12)); }
    SYNQUENZER.mtx4.fit('pent'); const c = S.tracks[0].clips[0]; o.pentAll = c.notes.every(n => Z.pent.includes(n.n % 12)); o.pentKey = c.key.scale; undo();
    return o;
  });
  ok('Dur, Moll, Mixolydisch, Phrygisch, Pentatonik: jede Note in der Leiter', Object.values(modes).filter(x => typeof x === 'boolean').every(Boolean), modes);
  // Stufe ▲: C-Dur-Clip: C→D, E→F, H→C
  await tapBtn(T, p, 'su');
  const su = await p.evaluate(() => S.tracks[0].clips[0].notes.map(n => n.n));
  ok('Stufe ▲ in C-Dur: C→D, E→F, H→C', su[0] === 62 && su[2] === 65 && su[6] === 72, su);
  await p.evaluate(() => undo()); await sleep(100);
  // Quantisieren ▾ 1/16 (zwei Clips)
  await p.evaluate(() => SYNQUENZER.mtx4.set([[0, 0], [1, 0]]));
  await tapBtn(T, p, 'q'); await sleep(200);
  ok('Quant. ▾ öffnet „Quantisieren“', (await popName(p)) === 'mtx4q');
  await popCheck(p, 'Quant. ▾ hochkant');
  const uq = await p.evaluate(() => UNDO.length);
  await tapPop(T, p, '[data-m4q="1/16"]'); await sleep(200);
  const q = await p.evaluate(() => ({on: S.tracks[0].clips[0].notes.every(n => Math.abs(n.t * 4 - Math.round(n.t * 4)) < 1e-6), q: S.tracks[0].clips[0].q, u: UNDO.length, last: UNDO[UNDO.length - 1].label}));
  ok('Quantisieren 1/16: alle Noten auf 1/16, ein ↶-Schritt', q.on && q.q && q.q.grid === '1/16' && q.u === uq + 1, q);
  ok('↶/↷ der ganzen Sitzung bleibt stimmig (alles zurück, alles wieder)', await p.evaluate(() => undoRedoCheck()));
  // Teil 2: Länge ×2 / ÷2 per Touch (3 Clips in 2 Szenen: 1, 1 und 2 Takte)
  await p.evaluate(() => { while (UNDO.length) undo(); SYNQUENZER.mtx4.set([[0, 0], [1, 1], [2, 1]]); }); await sleep(150);
  const L0 = await sig(p), lu0 = await p.evaluate(() => UNDO.length);
  await tapBtn(T, p, 'x2'); await sleep(150);
  const L1 = await sig(p), lu1 = await p.evaluate(() => ({n: UNDO.length, items: (UNDO[UNDO.length - 1].items || []).length, label: UNDO[UNDO.length - 1].label}));
  const pick = new Set(['0:0', '1:1', '2:1']); let lenOk = true, lenOther = [];
  for (let t = 0; t < L0.length; t++) for (let s = 0; s < L0[t].length; s++) {
    const k = t + ':' + s;
    if (!pick.has(k)) { if (L0[t][s] !== L1[t][s]) lenOther.push(k); continue; }
    const X = JSON.parse(L0[t][s]), Y = JSON.parse(L1[t][s]), B = X.len * 4;
    const want = X.notes.concat(X.notes.map(n => Object.assign({}, n, {t: n.t + B}))).map(n => n.t + ':' + n.n).sort().join();
    if (Y.len !== X.len * 2 || Y.notes.map(n => n.t + ':' + n.n).sort().join() !== want) lenOk = false;
  }
  ok('Länge ×2: die 3 Clips doppelt so lang, Inhalt verdoppelt', lenOk, lu1);
  ok('Länge ×2: alle anderen Clips bit-gleich, ein ↶-Schritt (Gruppe aus 3)', lenOther.length === 0 && lu1.n === lu0 + 1 && lu1.items === 3, {anders: lenOther, u: lu1});
  await tapBtn(T, p, 'h2'); await sleep(150);
  ok('danach Länge ÷2: wieder genau wie vorher (bit-gleich)', JSON.stringify(await sig(p)) === JSON.stringify(L0));
  await p.evaluate(() => { undo(); undo(); }); await sleep(100);
  ok('zwei ↶: bit-gleich wie vor ×2', JSON.stringify(await sig(p)) === JSON.stringify(L0));
  const lens0 = [[0, 0], [1, 1], [2, 1]].map(([t, s]) => JSON.parse(L0[t][s]).len), one = lens0.filter(x => x === 1).length;
  await tapBtn(T, p, 'h2'); await sleep(150);
  const h = await p.evaluate(() => ({lens: [[0, 0], [1, 1], [2, 1]].map(([t, s]) => S.tracks[t].clips[s].len), last: SYNQUENZER.mtx4.info().last}));
  ok('Länge ÷2: 1-Takt-Clips bleiben (am Rand, Hinweis), längere werden halb so lang', one >= 1 && one < 3 && h.lens.join() === lens0.map(x => Math.max(1, x >> 1)).join() && h.last.n === 3 - one && h.last.skipR === one, {vorher: lens0, h});
  await p.evaluate(() => undo()); await sleep(100);
  ok('↶/↷ mit Länge bleibt stimmig', await p.evaluate(() => undoRedoCheck()));
  // ✕ beendet: Leiste weg, keine Markierung, Tipp startet wieder
  await tapBtn(T, p, 'x');
  st = await p.evaluate(() => ({on: SYNQUENZER.mtx4.on(), bar: SYNQUENZER.mtx4.bar().hidden, cls: document.querySelectorAll('#clipGrid .mtx4sel').length, mode: EL.grid.classList.contains('mtx4on')}));
  ok('✕: Modus aus, Leiste weg, keine Markierung', !st.on && st.bar && st.cls === 0 && !st.mode, st);
  c = await cell(p, 1, 1); await T.tap(c.cx, c.cy); await sleep(300);
  ok('danach startet ein Tipp den Clip wieder', await p.evaluate(() => R.playing && (R.slot[1] === 1 || (R.pend[1] && R.pend[1].slot === 1))));
  await p.evaluate(() => stop());
  // Guide-Eintrag
  const gd = await p.evaluate(() => { const e = ui1Entries().find(x => x.id === 'mtx4multi'); if (!e) return null; const ok1 = e.go(); const q = e.q(); return {n: e.n, w: e.w, go: ok1, q: !!q}; });
  ok('„Wo finde ich …?“: Eintrag „Mehrere Clips zugleich“ öffnet das Clip-Blatt und zeigt [Mehrere wählen]', gd && gd.go && gd.q, gd);
  ok('hochkant: keine Fehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close();
}
// ======================= quer 926×428 und 926×370 =======================
for (const [w, h] of [[926, 428], [926, 370]]) {
  const {ctx, p, errs, T} = await open(w, h);
  const c = await cell(p, 0, 0); await T.hold(c.cx, c.cy, 700);
  const cs = await p.evaluate(() => { const b = EL.clipSheet.querySelector('.mtx4cs'); if (!b) return null; b.scrollIntoView({block: 'nearest'}); const r = b.getBoundingClientRect(), sh = EL.clipSheet.getBoundingClientRect(); return {h: r.height, w: r.width, in: r.top >= sh.top - .5 && r.bottom <= sh.bottom + .5 && r.bottom <= innerHeight && r.right <= innerWidth}; });
  ok(w + '×' + h + ': [Mehrere wählen] im Clip-Blatt erreichbar (≥ 44 px, im Bild)', cs && cs.h >= 43.5 && cs.w >= 43.5 && cs.in, cs);
  const r = await R_(p, () => EL.clipSheet.querySelector('.mtx4cs')); if (r) await T.tap(r.cx, r.cy);
  for (const [t, s] of [[1, 1], [2, 1]]) { const q = await cell(p, t, s); await T.tap(q.cx, q.cy); }
  const n = await p.evaluate(() => SYNQUENZER.mtx4.sel().length);
  ok(w + '×' + h + ': 3 Clips per Tipp gewählt', n === 3, n);
  await barCheck(p, w + '×' + h);
  await p.screenshot({path: dir + `/mtx4-auswahl-${w}x${h}.png`});
  const q4 = await cell(p, 4, 0); await T.tap(q4.cx, q4.cy);
  await barCheck(p, w + '×' + h + ' mit Drum-Clip');
  await tapBtn(T, p, 'fit'); await sleep(200); await popCheck(p, w + '×' + h + ' Tonart ▾');
  await p.screenshot({path: dir + `/mtx4-tonart-${w}x${h}.png`});
  await p.evaluate(() => closePop()); await sleep(100);
  await tapBtn(T, p, 'q'); await sleep(200); await popCheck(p, w + '×' + h + ' Quant. ▾');
  await p.evaluate(() => closePop());
  ok(w + '×' + h + ': keine Fehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close();
}
// ======================= Teil 2: neue Clip-Versionen (Clip spielt im Song) =======================
{
  const {ctx, p, errs, T} = await open(428, 926);
  const r = await p.evaluate(() => {
    // Song: Spur 0 Szene 1, Spur 1 Szene 1 → 2, Spur 2 nur Szene 1 (Clip 2:1 spielt also nicht im Song)
    songEdit('Test-Song', sg => { sg.bars = 4; sg.lanes[0] = [{bar: 0, slot: 0}]; sg.lanes[1] = [{bar: 0, slot: 0}, {bar: 2, slot: 1}]; sg.lanes[2] = [{bar: 0, slot: 0}]; });
    restoreSong(JSON.parse(songSnapshot()));                         // den Test-Song einmal normalisieren (Schleife usw.)
    while (UNDO.length) UNDO.pop(); REDO.length = 0;
    const ser0 = serialize(), lanes0 = JSON.stringify(S.song.lanes), c00 = JSON.stringify(cleanClip(S.tracks[0].clips[0])), c11 = JSON.stringify(cleanClip(S.tracks[1].clips[1]));
    SYNQUENZER.mtx4.start(); SYNQUENZER.mtx4.set([[0, 0], [1, 1], [2, 1]]);
    return {ser0, lanes0, c00, c11, bars: S.song.bars};
  });
  await tapBtn(T, p, 'p1'); await sleep(150);
  const v1 = await p.evaluate(() => {
    const own = S.song.own || {}, L = Object.keys(own).map(id => ({id, from: own[id].from, ver: own[id].ver, notes: own[id].notes.map(n => n.n)}));
    const u = UNDO[UNDO.length - 1];
    return {L, n: UNDO.length, kinds: (u.items || [u]).map(x => x.kind), lanes: JSON.stringify(S.song.lanes), last: SYNQUENZER.mtx4.info().last, vers: SYNQUENZER.mtx4.vers(),
      own00: (() => { const k = Object.keys(own).find(id => own[id].from.t === 0 && own[id].from.s === 0); return k ? JSON.stringify(cleanClip(own[k])) : null; })()};
  });
  const L = v1.L, a = L.find(x => x.from.t === 0 && x.from.s === 0), b = L.find(x => x.from.t === 1 && x.from.s === 1);
  ok('+1 auf Clips im Song: die Fassung von vorher wird je Clip eine neue Version (v2)', L.length === 2 && a && b && a.ver === 2 && b.ver === 2 && !L.some(x => x.from.t === 2), v1.L.map(x => x.from.t + ':' + x.from.s + ' v' + x.ver));
  ok('die Version hält genau den alten Inhalt (Clip 0:0: vorher = v2)', v1.own00 !== null && JSON.parse(v1.own00).notes.map(n => n.n).join() === JSON.parse(r.c00).notes.map(n => n.n).join(), {v2: a && a.notes, vorher: JSON.parse(r.c00).notes.map(n => n.n)});
  ok('Clip im Song nicht dabei (2:1): keine Version; der Song spielt weiter v1 (Spuren-Einträge gleich)', v1.lanes === r.lanes0);
  ok('Änderung + Versionen = ein ↶-Schritt (3 Clip-Schritte + 2 Versions-Schritte)', v1.n === 1 && v1.kinds.join() === 'clip,clip,clip,own,own', v1.kinds);
  await tapBtn(T, p, 'p1'); await sleep(150);
  const v2 = await p.evaluate(() => ({n: Object.keys(S.song.own || {}).length, u: UNDO.length, kinds: (UNDO[UNDO.length - 1].items || []).map(x => x.kind)}));
  ok('zweite Aktion in derselben Auswahl: keine weitere Version (die Fassung vor der Auswahl bleibt v2)', v2.n === 2 && v2.u === 2 && !v2.kinds.includes('own'), v2);
  const rt = await p.evaluate(() => { const a = serialize(), q = normalizeProject(projFromFile(JSON.parse(a))); return {own: JSON.stringify(q.song.own) === JSON.stringify(S.song.own), all: JSON.stringify(projectFileObj(q, true, true)) === a}; });
  ok('Speichern/Laden: die Versionen kommen bit-gleich zurück', rt.own, rt);
  await p.evaluate(() => { undo(); undo(); }); await sleep(800);                // die automatische Szenen-Tonart folgt nach 400 ms (wie immer)
  const bk = await p.evaluate(s0 => { const flat = (o, pre = '', out = {}) => { if (o && typeof o === 'object') { for (const k in o) flat(o[k], pre + '.' + k, out); } else out[pre] = o; return out; };
    const a = flat(JSON.parse(s0)), q = flat(JSON.parse(serialize())); return Object.keys({...a, ...q}).filter(k => a[k] !== q[k] && k !== '.sum').slice(0, 8).map(k => k + ': ' + a[k] + ' → ' + q[k]); }, r.ser0);
  ok('zwei ↶: Clips, Song und Versionen bit-gleich wie vorher', bk.length === 0, bk);
  ok('↶/↷ stimmig', await p.evaluate(() => { redo(); redo(); return undoRedoCheck(); }));
  // Clip-Blatt zeigt die Versionen (vorhandene Zeile VERSIONEN IM SONG): v1 v2
  await tapBtn(T, p, 'x'); await sleep(150);
  const c = await cell(p, 0, 0); await T.hold(c.cx, c.cy, 700);
  const cv = await p.evaluate(() => { const r = EL.clipSheet.querySelector('.wg-cv'); if (!r) return null; r.scrollIntoView({block: 'nearest'}); return [...r.querySelectorAll('button')].map(b => b.textContent.trim()); });
  ok('Clip-Blatt › VERSIONEN IM SONG zeigt v1 v2', cv && cv.join() === 'v1,v2', cv);
  await p.screenshot({path: dir + '/mtx4-versionen-hochkant.png'});
  await p.evaluate(() => closeClipSheet()); await sleep(100);
  // Prüfung 4: neue Auswahl-Sitzung – der Clip hat schon v2: keine weitere automatische Version (höchstens eine je Clip)
  const v3 = await p.evaluate(async () => { SYNQUENZER.mtx4.start(0, 0); await SYNQUENZER.mtx4.len(2); const own = S.song.own; return Object.keys(own).filter(id => own[id].from.t === 0 && own[id].from.s === 0).map(id => own[id].ver).sort().join(); });
  ok('neue Auswahl-Sitzung (Länge ×2): keine zweite automatische Version (bleibt v2)', v3 === '2', v3);
  ok('Versionen: keine Fehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close();
}
// ======================= Teil 2: Länge ÷2 / ×2 während der Wiedergabe – ab dem nächsten Takt, nichts stockt =======================
{
  const {ctx, p, errs} = await open(428, 926);
  const r = await p.evaluate(async () => {
    const W = ms => new Promise(r => setTimeout(r, ms));
    ensureAudio(); await W(300);
    for (let i = 1; i < NT(); i++) S.tracks[i].clips = S.tracks[i].clips.map(() => null);
    const c = S.tracks[0].clips[0]; c.len = 2; c.notes = [0, .5, 1, 1.5, 2, 2.5, 3, 3.5].flatMap(t => [{t, d: .25, n: 60, v: .8}, {t: t + 4, d: .25, n: 62, v: .8}]).sort((a, b) => a.t - b.t); clipChanged(0, 0);
    launch(0, 0); play(); await W(900);
    // im 1. Takt des Clips tippen (der 2. Takt hätte 62), mit > 1,6 Schlägen Abstand zum Taktstrich
    for (let k = 0; k < 200; k++) { const nb = nextBarFromAudible(), ph = ((audBeat() - R.cstart[0]) % 8 + 8) % 8; if (nb - audBeat() > 1.6 && ph < 2.4) break; await W(30); }
    SYNQUENZER.mtx4.start(0, 0);
    const bar = nextBarFromAudible(), sb = R.schedBeat, t0 = performance.now();
    SYNQUENZER.mtx4.len(.5);
    const dt = performance.now() - t0;
    await W(Math.max(1500, (bar - audBeat()) * spb() * 1000 + 2600));
    // danach ×2 (Inhalt doppelt = gleiche Achtel): wieder ab dem nächsten Takt, lückenlos
    const bar2 = nextBarFromAudible(); SYNQUENZER.mtx4.len(2);
    await W(Math.max(1500, (bar2 - audBeat()) * spb() * 1000 + 1500));
    const E = []; for (let k = 0; k < Math.min(LOG.n, 4096); k++) { const e = LOG.buf[k]; if (e && !e.removed && e.track === 0 && e.beat != null) E.push({b: e.beat, n: e.clipNote != null ? e.clipNote : e.out}); }
    const pre = E.filter(e => e.b < bar - 1e-3 && e.b >= sb - 1e-3), post = E.filter(e => e.b >= bar - 1e-3 && e.b < bar + 4 - 1e-3);
    const grid = []; for (let x = Math.ceil(sb * 2) / 2; x < bar2 + 2; x += .5) grid.push(x);
    const miss = grid.filter(x => E.filter(e => Math.abs(e.b - x) < .02).length !== 1);
    const o = {bar, bar2, sb, dt: Math.round(dt * 10) / 10, pre: pre.map(e => e.n), post: post.map(e => e.n), miss: miss.length, len: S.tracks[0].clips[0].len, playing: R.playing};
    stop(); return o;
  });
  ok('Länge ÷2 im Lauf: bis zum Taktstrich der alte Inhalt (1. Takt, 60)', r.pre.length >= 1 && r.pre.every(n => n === 60), r);
  ok('ab dem Taktstrich der neue Inhalt: 1-Takt-Clip (nur 60, nicht der alte 2. Takt mit 62)', r.post.length === 8 && r.post.every(n => n === 60), r.post);
  ok('÷2 und danach ×2: jede Achtel genau einmal, Wiedergabe läuft, Aktion < 50 ms', r.miss === 0 && r.playing && r.dt < 50 && r.len === 2, {miss: r.miss, dt: r.dt, len: r.len});
  ok('Wiedergabe Länge: keine Fehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close();
}
// ======================= Wiedergabe: Änderung greift am nächsten Taktstrich, nichts stockt =======================
{
  const {ctx, p, errs} = await open(428, 926);
  const r = await p.evaluate(async () => {
    const W = ms => new Promise(r => setTimeout(r, ms));
    ensureAudio(); await W(300);
    for (let i = 1; i < NT(); i++) S.tracks[i].clips = S.tracks[i].clips.map(() => null);   // nur Spur 0 klingt
    const c = S.tracks[0].clips[0]; c.len = 1; c.notes = [0, .5, 1, 1.5, 2, 2.5, 3, 3.5].map(t => ({t, d: .25, n: 60, v: .8})); clipChanged(0, 0);
    launch(0, 0); play(); await W(900);
    // warten, bis bis zum Taktstrich mehr als 1,5 Schläge fehlen (dann liegt Planungs-Vorlauf vor dem Takt)
    for (let k = 0; k < 80; k++) { const nb = nextBarFromAudible(); if (nb - audBeat() > 1.6) break; await W(40); }
    SYNQUENZER.mtx4.start(0, 0);
    const bar = nextBarFromAudible(), sb = R.schedBeat, s0 = LOG.seq, t0 = performance.now();
    SYNQUENZER.mtx4.semi(1);
    const dt = performance.now() - t0, hold = SYNQUENZER.mtx4.info().hold[0];
    await W(Math.max(1500, (bar - audBeat()) * spb() * 1000 + 1500));
    const E = []; for (let k = 0; k < Math.min(LOG.n, 4096); k++) { const e = LOG.buf[k]; if (e && !e.removed && e.track === 0 && e.beat != null) E.push({b: e.beat, n: e.clipNote != null ? e.clipNote : e.out, seq: e.seq}); }
    const pre = E.filter(e => e.b < bar - 1e-3 && e.b >= sb - 1e-3), post = E.filter(e => e.b >= bar - 1e-3);
    // lückenlos: jeder Achtel-Schlag zwischen sb und bar + 2 hat genau eine Note
    const grid = []; for (let x = Math.ceil(sb * 2) / 2; x < bar + 2; x += .5) grid.push(x);
    const miss = grid.filter(x => E.filter(e => Math.abs(e.b - x) < .02).length !== 1);
    const o = {bar, sb, dt: Math.round(dt * 10) / 10, hold, pre: pre.map(e => e.n), post: post.slice(0, 6).map(e => e.n), miss: miss.length, playing: R.playing};
    stop(); return o;
  });
  ok('läuft der Clip: bis zum Taktstrich der alte Inhalt (auch was nach dem Tipp geplant wird)', r.pre.length >= 1 && r.pre.every(n => n === 60), r);
  ok('ab dem nächsten Taktstrich der neue Inhalt (+1)', r.post.length >= 4 && r.post.every(n => n === 61), r.post);
  ok('nichts stockt: jede Achtel genau einmal, Wiedergabe läuft', r.miss === 0 && r.playing, {miss: r.miss});
  ok('Aktion kurz (< 50 ms)', r.dt < 50, r.dt);
  ok('Wiedergabe: keine Fehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close();
}
// ======================= Leistung: 8 Spuren × 8 Szenen mit Auswahl =======================
{
  const {ctx, p, errs} = await open(428, 926);
  const r = await p.evaluate(async () => {
    const W = ms => new Promise(r => setTimeout(r, ms));
    while (NT() < 8) addTrack();
    const src = S.tracks[0].clips[0];
    for (let i = 0; i < NT(); i++) { const tr = S.tracks[i]; if (tr.stimme || tr.orig) continue; for (let s = 0; s < NS(); s++) if (!tr.clips[s]) tr.clips[s] = deep(tr.kind === 'drum' ? S.tracks[4].clips[0] : src); }
    UI.dirty.all = UI.dirty.grid = true; await W(400);
    const L = []; for (let i = 0; i < NT(); i++) for (let s = 0; s < NS(); s++) if (S.tracks[i].clips[s]) L.push([i, s]);
    SYNQUENZER.mtx4.start(); SYNQUENZER.mtx4.set(L);
    ensureAudio(); launchScene(0); play(); await W(1200);                // Long Tasks erst nach dem Start der Wiedergabe zählen
    const lt = []; let po = null; try { po = new PerformanceObserver(l => { for (const e of l.getEntries()) lt.push(Math.round(e.duration)); }); po.observe({entryTypes: ['longtask']}); } catch (e) {}
    // Bild: Zeit von renderGrid je Aufruf (mit Auswahl) + Frame-Abstände
    const orig = renderGrid; const rg = [];
    const fr = []; let last = performance.now(), run = true; const loop = () => { const n = performance.now(); fr.push(n - last); last = n; if (run) requestAnimationFrame(loop); }; requestAnimationFrame(loop);
    for (let k = 0; k < 60; k++) { UI.dirty.grid = true; for (const C of UI.cells.flat()) if (C) { C.st = {}; C.sig = null; } const t0 = performance.now(); orig(audBeat()); rg.push(performance.now() - t0); await W(16); }
    const lt0 = lt.length; await W(300);
    // je Aktion ein eigener Tipp (eigene Aufgabe) – wie in der App; früher liefen alle Aktionen in einer Aufgabe hintereinander
    const t1 = performance.now(); let pr = SYNQUENZER.mtx4.semi(1); const dSemi = performance.now() - t1; await pr; await W(120);
    const t2 = performance.now(); pr = SYNQUENZER.mtx4.fit('dorian'); const dFit = performance.now() - t2; await pr; await W(120);
    const t3 = performance.now(); pr = SYNQUENZER.mtx4.quant('1/16'); const dQ = performance.now() - t3; await pr; await W(120);
    const t4 = performance.now(); pr = SYNQUENZER.mtx4.len(2); const dX2 = performance.now() - t4; await pr; await W(120);
    const t5 = performance.now(); pr = SYNQUENZER.mtx4.len(.5); const dH2 = performance.now() - t5; await pr; await W(120);
    await SYNQUENZER.mtx4.len(2); await W(200);
    const rg2 = []; for (let k = 0; k < 40; k++) { UI.dirty.grid = true; for (const C of UI.cells.flat()) if (C) { C.st = {}; C.sig = null; } const t0 = performance.now(); orig(audBeat()); rg2.push(performance.now() - t0); await W(16); }
    await W(1500); run = false; const ltAct = lt.slice(lt0); stop(); if (po) po.disconnect();
    const s = rg.slice().sort((a, b) => a - b), f = fr.slice(5).sort((a, b) => a - b);
    const s2 = rg2.slice().sort((a, b) => a - b);
    return {n: L.length, nt: NT(), rgMed: +s[s.length >> 1].toFixed(2), rgMax: +s[s.length - 1].toFixed(2), rg2Med: +s2[s2.length >> 1].toFixed(2), rg2Max: +s2[s2.length - 1].toFixed(2), frP95: +f[Math.floor(f.length * .95)].toFixed(1), dSemi: Math.round(dSemi), dFit: Math.round(dFit), dQ: Math.round(dQ), dX2: Math.round(dX2), dH2: Math.round(dH2), lt, ltAct, undo: UNDO.slice(-6).map(u => (u.items || []).length)};
  });
  ok('8 Spuren × 8 Szenen gewählt', r.nt === 8 && r.n >= 56, {n: r.n, nt: r.nt});
  ok('Bild der Matrix mit Auswahl (renderGrid ohne Zwischenspeicher, alle Zellen) ≤ 16 ms', r.rgMax <= 16, {median: r.rgMed, max: r.rgMax, frameP95: r.frP95});
  ok('±1 / Dorisch / Quantisieren über alle 64 Clips je < 50 ms, kein Long Task > 50 ms ab den Aktionen', r.dSemi < 50 && r.dFit < 50 && r.dQ < 50 && r.ltAct.every(x => x <= 50), {semi: r.dSemi, fit: r.dFit, quant: r.dQ, longtasksAktion: r.ltAct, longtasksBild: r.lt});
  ok('Länge ×2 / ÷2 über alle 64 Clips je < 50 ms (kein Long Task, siehe oben)', r.dX2 < 50 && r.dH2 < 50, {x2: r.dX2, h2: r.dH2});
  ok('Bild der Matrix mit Auswahl nach ×2 (doppelt so viele Noten) ≤ 16 ms', r.rg2Max <= 16, {median: r.rg2Med, max: r.rg2Max});
  ok('je Aktion ein ↶-Schritt über alle Clips', r.undo.every(x => x >= 40), r.undo);
  ok('Leistung: keine Fehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close();
}
// ======================= Prüfung 15.11.: Befunde 1–10 nachgemessen =======================
// P1 (schwer): ↶ ↷ in der Leiste, ↶ genau über dem ↶ der Spur-Leiste; Hinweise ohne Aktionsknopf; per Touch in allen 3 Größen
for (const [w, h] of [[428, 926], [926, 428], [926, 370]]) {
  const {ctx, p, errs, T} = await open(w, h); const L = w + '×' + h;
  await p.evaluate(() => { SYNQUENZER.mtx4.start(0, 0); while (UNDO.length) UNDO.pop(); REDO.length = 0; }); await sleep(1900);   // Start-Hinweis ist weg
  // P10: Tipp auf einen weiteren Clip – kein Hinweis über den Szenen-Köpfen (der Zähler der Leiste sagt es)
  for (const [t, s] of [[1, 1], [2, 1]]) { const c = await cell(p, t, s); await T.tap(c.cx, c.cy); }
  const hint = await p.evaluate(() => ({show: EL.toast.classList.contains('show'), n: SYNQUENZER.mtx4.bar().querySelector('.n').textContent}));
  ok(L + ' P10: Tipp im Modus ohne Hinweis über den Szenen-Köpfen, Zähler der Leiste zählt', !hint.show && /^3 Clips/.test(hint.n), hint);
  const bar = await barCheck(p, L + ' P1');
  ok(L + ' P1: Leiste trägt ↶ und ↷', (bar.names || []).includes('↶') && (bar.names || []).includes('↷'), bar.names);
  const s0 = await sig(p);
  await tapBtn(T, p, 'p1'); await sleep(200);
  const a = await p.evaluate(() => { const B = SYNQUENZER.mtx4.bar(), u = document.getElementById('bUndo').getBoundingClientRect(), top = document.elementFromPoint(u.left + u.width / 2, u.top + u.height / 2);
    return {u: UNDO.length, acts: EL.toast.querySelectorAll('button').length, zT: +getComputedStyle(EL.toast).zIndex, zB: +getComputedStyle(B).zIndex, top: top && (top.closest('[data-m4]') || {dataset: {}}).dataset.m4, msg: UI.lastToast}; });
  ok(L + ' P1: +1 per Touch = ein Schritt; Hinweis ohne Aktionsknopf und über der Leiste', a.u === 1 && a.acts === 0 && a.zT > a.zB, a);
  ok(L + ' P1: auf der Mitte des ↶ der Spur-Leiste liegt das ↶ der Leiste', a.top === 'un', a.top);
  await p.screenshot({path: dir + '/mtx4-pruef-undo-' + w + 'x' + h + '.png'});
  const ur = await p.evaluate(() => { const r = document.getElementById('bUndo').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await T.tap(ur[0], ur[1]); await sleep(250);
  const b1 = await p.evaluate(() => ({u: UNDO.length, r: REDO.length, on: SYNQUENZER.mtx4.on(), acts: EL.toast.querySelectorAll('button').length, msg: UI.lastToast}));
  const s1 = await sig(p);
  ok(L + ' P1: Tipp auf die Stelle des gewohnten ↶ macht +1 rückgängig (alles bit-gleich, Modus bleibt, Hinweis ohne Knopf)', b1.u === 0 && b1.r === 1 && b1.on && b1.acts === 0 && JSON.stringify(s0) === JSON.stringify(s1), b1);
  await tapBtn(T, p, 're'); await sleep(250);
  const b2 = await p.evaluate(() => ({u: UNDO.length, r: REDO.length, acts: EL.toast.querySelectorAll('button').length, chk: undoRedoCheck()}));
  ok(L + ' P1: ↷ der Leiste wiederholt (ein Schritt), Hinweis ohne Knopf, ↶/↷ stimmig', b2.u === 1 && b2.r === 0 && b2.acts === 0 && b2.chk, b2);
  ok(L + ' P1: keine Fehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close();
}
// P2 (mittel): dichte Clips (64 × 64 Noten, Song mit 64 Clips), Wiedergabe läuft – keine Long Tasks; 4× gedrosselt zum Vergleich mit Grundlast
for (const rate of [1, 4]) {
  const {ctx, p, errs} = await open(428, 926);
  const cdp = await ctx.newCDPSession(p); if (rate > 1) await cdp.send('Emulation.setCPUThrottlingRate', {rate});
  const r = await p.evaluate(async () => {
    const W = ms => new Promise(r => setTimeout(r, ms));
    while (NT() < 8) addTrack();
    for (let i = 0; i < NT(); i++) { const tr = S.tracks[i]; if (tr.stimme || tr.orig) continue; for (let s = 0; s < 8; s++) {
      const notes = []; for (let k = 0; k < 64; k++) notes.push({t: k * .25, d: .2, n: (tr.kind === 'drum' ? 36 + (k % 4) * 2 : 60 + [0, 2, 4, 5, 7, 9, 11, 12][(k * 3 + s) % 8]), v: .5 + (k % 5) / 10});
      tr.clips[s] = Object.assign(deep(S.tracks[0].clips[0] || {}), {len: 4, notes}); } }
    UI.dirty.all = UI.dirty.grid = true; await W(600);
    songEdit('Test', sg => { sg.bars = 32; for (let i = 0; i < NT(); i++) sg.lanes[i] = [0, 1, 2, 3, 4, 5, 6, 7].map(s => ({bar: s * 4, slot: s})); });
    await W(300); while (UNDO.length) UNDO.pop(); REDO.length = 0;
    const L = []; for (let i = 0; i < NT(); i++) for (let s = 0; s < 8; s++) if (S.tracks[i].clips[s]) L.push([i, s]);
    SYNQUENZER.mtx4.start(); SYNQUENZER.mtx4.set(L); SYNQUENZER.mtx4.drums(true);
    ensureAudio(); launchScene(0); play(); await W(1500);
    const lt = []; const po = new PerformanceObserver(l => { for (const e of l.getEntries()) lt.push({d: Math.round(e.duration), at: e.startTime}); }); po.observe({entryTypes: ['longtask']});
    const fr = []; let last = performance.now(), run = true; const loop = () => { const n = performance.now(); fr.push(n - last); last = n; if (run) requestAnimationFrame(loop); }; requestAnimationFrame(loop);
    await W(1500); const base = lt.map(x => x.d); lt.length = 0;                     // Grundlast: Wiedergabe ohne Aktion
    const acts = [['+1 (64 Versionen)', () => SYNQUENZER.mtx4.semi(1)], ['Dorisch', () => SYNQUENZER.mtx4.fit('dorian')], ['Quant 1/16', () => SYNQUENZER.mtx4.quant('1/16')], ['×2', () => SYNQUENZER.mtx4.len(2)], ['÷2', () => SYNQUENZER.mtx4.len(.5)], ['↶', () => SYNQUENZER.mtx4.undo()], ['↷', () => SYNQUENZER.mtx4.undo(true)]];
    const out = [];
    for (const [n, f] of acts) { const f0 = fr.length, a0 = performance.now(); const pr = f(); const sync = performance.now() - a0; await pr; await W(900); const fx = fr.slice(f0); out.push({n, sync: Math.round(sync), maxFrame: Math.round(Math.max(...fx)), lt: lt.filter(x => x.at >= a0 - 5).map(x => x.d)}); lt.length = 0; }
    run = false; po.disconnect(); stop();
    return {clips: L.length, notes: L.length * 64, own: Object.keys(S.song.own || {}).length, undo: UNDO.length, base, out, chk: undoRedoCheck()};
  });
  const all = r.out.flatMap(x => x.lt);
  if (rate === 1) {
    ok('P2 1×: 64 dichte Clips (4096 Noten), 7 Aktionen inkl. ↶ ↷ der Leiste: kein Long Task > 50 ms, synchroner Teil < 50 ms', r.clips === 64 && all.every(x => x <= 50) && r.out.every(x => x.sync < 50), r.out);
    ok('P2 1×: 5 Aktionen = 5 ↶-Schritte nach ↶ ↷, Versionen 64, ↶/↷ stimmig', r.undo === 5 && r.own === 64 && r.chk, {undo: r.undo, own: r.own});
  } else console.log('INFO   P2 4× gedrosselt (Grenzfall, Kopflos auf geteilter VM): Grundlast ohne Aktion ' + JSON.stringify(r.base) + ' · Aktionen ' + JSON.stringify(r.out));
  ok('P2 ' + rate + '×: keine Fehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close();
}
// P3 (mittel) Pentatonik · P4 (mittel) höchstens eine Auto-Version · P7 ÷2 bei 3 Takten · P9 Clip spielt nur als v2
{
  const {ctx, p, errs} = await open(428, 926);
  const r = await p.evaluate(async () => {
    const o = {};
    const c = S.tracks[0].clips[0]; c.len = 1; c.key = {root: 0, scale: 'ionian', src: 'user'};
    c.notes = [60, 62, 64, 65, 67, 69, 71, 72].map((n, j) => ({t: j * .5, d: .25, n, v: .8})); clipChanged(0, 0);
    SYNQUENZER.mtx4.start(0, 0); await SYNQUENZER.mtx4.fit('pent');
    o.pent = S.tracks[0].clips[0].notes.map(n => n.n); undo();
    const c0 = S.tracks[0].clips[0];                                  // ↶ legt ein neues Clip-Objekt an
    // Zufall: 3 Grundtöne × 480 Noten – kein Ton springt mehr als 1 Halbton, Töne der Pentatonik bleiben
    let moved3 = 0, keptBad = 0, out = 0, tot = 0;
    for (const root of [0, 2, 9]) for (const sc of ['ionian', 'aeolian']) {
      const P = G10G_SCALES[Harmony.SCALES[sc][2] === 4 ? 'pentMaj' : 'pentMin'].map(x => (root + x) % 12);
      c0.key = {root, scale: sc, src: 'user'}; c0.notes = []; for (let k = 0; k < 240; k++) c0.notes.push({t: k * .25, d: .2, n: 48 + ((k * 7 + root * 3 + (k >> 3)) % 30), v: .7});
      const f = SYNQUENZER.mtx4.fitNotes(0, 0, 'pent');
      c0.notes.forEach((n, j) => { tot++; if (Math.abs(f[j] - n.n) > 1) moved3++; if (P.includes(n.n % 12) && f[j] !== n.n) keptBad++; if (!P.includes(f[j] % 12)) out++; });
    }
    o.rand = {tot, moved3, keptBad, out};
    SYNQUENZER.mtx4.end();
    // P4: 9 Sitzungen „Quantisieren + 1“ auf einem Clip im Song
    S.tracks[0].clips[0].notes = [0, 1, 2, 3].map(t => ({t, d: .5, n: 60, v: .8})); S.tracks[0].clips[0].key = {root: 0, scale: 'ionian', src: 'user'};
    songEdit('Test', sg => { sg.bars = 4; sg.lanes[0] = [{bar: 0, slot: 0}]; });
    const seq = [];
    for (let k = 0; k < 9; k++) { SYNQUENZER.mtx4.start(0, 0); await SYNQUENZER.mtx4.quant('1/16'); await SYNQUENZER.mtx4.semi(1); SYNQUENZER.mtx4.end(); seq.push(sx9List(S.song, 0, 0).map(x => x.v).join('')); }
    o.seq = seq; o.manual = sx9Add(0, 0); o.after = sx9List(S.song, 0, 0).map(x => x.v).join('');
    // P9: Clip 1:0 spielt im Song nur als v2 → eine Änderung an v1 legt keine Version an
    const id9 = 'o99'; S.song.own = S.song.own || {}; S.song.own[id9] = Object.assign(deep(cleanClip(S.tracks[1].clips[0])), {from: {t: 1, s: 0, bar: 0}, ver: 2});
    songEdit('Test v2', sg => { sg.lanes[1] = [{bar: 0, slot: 0, own: id9}]; });
    o.v2only = {at: sx9At(S.song, 1, 0), before: sx9List(S.song, 1, 0).map(x => x.v).join('')};
    SYNQUENZER.mtx4.start(1, 0); await SYNQUENZER.mtx4.semi(1); SYNQUENZER.mtx4.end();
    o.v2only.after = sx9List(S.song, 1, 0).map(x => x.v).join(''); o.v2only.vers = SYNQUENZER.mtx4.info().last.vers;
    // P7: ÷2 auf einem 3-Takt-Clip sagt es im Hinweis
    const c3 = S.tracks[2].clips[0]; c3.len = 3; c3.notes = [0, 4, 8].map((t, j) => ({t, d: 1, n: 60 + 4 * j, v: .8})); clipChanged(2, 0);
    SYNQUENZER.mtx4.start(2, 0); await SYNQUENZER.mtx4.len(.5); o.odd = {msg: UI.lastToast, len: S.tracks[2].clips[0].len, last: SYNQUENZER.mtx4.info().last.odd}; SYNQUENZER.mtx4.end();
    return o;
  });
  ok('P3 Pentatonik: C-Dur-Leiter → Töne der Pentatonik bleiben stehen, F→E, H→C′ (Umfang bleibt 12)', r.pent.join() === '60,62,64,64,67,69,72,72', r.pent);
  ok('P3 Pentatonik Zufall (6 Tonarten × 240 Noten): 0 Töne der Pentatonik verschoben, 0 Sprünge > 1 Halbton, 0 außerhalb', r.rand.keptBad === 0 && r.rand.moved3 === 0 && r.rand.out === 0, r.rand);
  ok('P4 9 Sitzungen auf einem Clip im Song: höchstens eine Auto-Version (v2), das eigene ＋ geht danach', r.seq.every(x => x === '2') && !!r.manual && r.after === '23', {seq: r.seq, manual: r.manual, after: r.after});
  ok('P9 Clip spielt im Song nur als v2: Änderung an v1 legt keine Version an', r.v2only.at && r.v2only.at.v === 2 && r.v2only.before === '2' && r.v2only.after === '2' && r.v2only.vers.length === 0, r.v2only);
  ok('P7 ÷2 bei 3 Takten: Hinweis sagt „ungerade Länge abgerundet (3 → 1 Takt)“', /ungerade Länge abgerundet \(3 → 1 Takt\)/.test(r.odd.msg) && r.odd.len === 1 && r.odd.last === 1, r.odd);
  ok('P3/P4/P7/P9: keine Fehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close();
}
// P6 (leicht): ↶ und ↷ eines MTX4-Schritts mitten im Takt greifen am nächsten Taktstrich
{
  const {ctx, p, errs} = await open(428, 926);
  const r = await p.evaluate(async () => {
    const W = ms => new Promise(r => setTimeout(r, ms));
    ensureAudio(); await W(300);
    for (let i = 1; i < NT(); i++) S.tracks[i].clips = S.tracks[i].clips.map(() => null);
    const c = S.tracks[0].clips[0]; c.len = 1; c.notes = [0, .5, 1, 1.5, 2, 2.5, 3, 3.5].map(t => ({t, d: .25, n: 60, v: .8})); clipChanged(0, 0);
    launch(0, 0); play(); await W(900);
    const waitMid = async () => { for (let k = 0; k < 120; k++) { const nb = nextBarFromAudible(), ph = 4 - (nb - audBeat()); if (ph > .4 && ph < 1.8) return; await W(25); } };
    SYNQUENZER.mtx4.start(0, 0);
    for (let k = 0; k < 80; k++) { if (nextBarFromAudible() - audBeat() > 1.6) break; await W(40); }
    await SYNQUENZER.mtx4.semi(1);
    const barA = SYNQUENZER.mtx4.info().hold[0] ? SYNQUENZER.mtx4.info().hold[0].bar : null;
    await W((barA - audBeat()) * spb() * 1000 + 200); await waitMid();
    const uAt = audBeat(), barU = nextBarFromAudible(); SYNQUENZER.mtx4.undo();
    await W((barU - audBeat()) * spb() * 1000 + 200); await waitMid();
    const rAt = audBeat(), barR = nextBarFromAudible(); SYNQUENZER.mtx4.undo(true);
    await W((barR - audBeat()) * spb() * 1000 + 2800);
    const E = []; for (let k = 0; k < Math.min(LOG.n, 4096); k++) { const e = LOG.buf[k]; if (e && !e.removed && e.track === 0 && e.beat != null) E.push({b: e.beat, n: e.clipNote != null ? e.clipNote : e.out}); }
    const seg = (a, b) => E.filter(e => e.b >= a - 1e-3 && e.b < b - 1e-3).map(e => e.n);
    const grid = []; for (let x = Math.ceil(barA * 2) / 2 - 4; x < barR + 2; x += .5) grid.push(x);
    const miss = grid.filter(x => E.filter(e => Math.abs(e.b - x) < .02).length !== 1);
    const o = {barA, uAt: +uAt.toFixed(2), barU, rAt: +rAt.toFixed(2), barR, afterUndoToBar: seg(uAt, barU), fromBarU: seg(barU, barU + 4), afterRedoToBar: seg(rAt, barR), fromBarR: seg(barR, barR + 4), miss: miss.length, playing: R.playing};
    stop(); return o;
  });
  ok('P6 ↶ mitten im Takt: bis zum Taktstrich weiter +1 (61), ab dem Taktstrich wieder 60', r.barA != null && r.afterUndoToBar.length >= 2 && r.afterUndoToBar.every(n => n === 61) && r.fromBarU.length === 8 && r.fromBarU.every(n => n === 60), r);
  ok('P6 ↷ mitten im Takt: bis zum Taktstrich 60, ab dem Taktstrich 61', r.afterRedoToBar.length >= 2 && r.afterRedoToBar.every(n => n === 60) && r.fromBarR.length === 8 && r.fromBarR.every(n => n === 61), {vor: r.afterRedoToBar, ab: r.fromBarR});
  ok('P6 nichts stockt: jede Achtel genau einmal, Wiedergabe läuft, keine Fehler', r.miss === 0 && r.playing && errs.length === 0, {miss: r.miss, errs: errs.slice(0, 3)});
  await ctx.close();
}
const bad = res.filter(x => !x.ok);
console.log('\nERGEBNIS ' + (res.length - bad.length) + '/' + res.length + (bad.length ? ' – offen: ' + bad.map(x => x.name).join(' | ') : ''));
await b.close();
