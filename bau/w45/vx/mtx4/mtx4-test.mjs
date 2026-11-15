// MTX4 Teil 1 – mehrere Clips zugleich: Auswahl (Clip-Blatt › Mehrere wählen, Tipp = dazu/weg, Szenen-Kopf), Leiste −12 −1 +1 +12,
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
  ok('Leiste: −12 −1 +1 +12 · Stufe ▲▼ · Tonart ▾ · Quant. ▾ · ✕', ['−12', '−1', '+1', '+12', '▲ Stufe', '▼ Stufe', 'Tonart ▾', 'Quant. ▾', '✕'].every(x => (bar.names || []).includes(x)), bar.names);
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
  ok('„Drums ±“ (ausdrücklich): Drum-Clip +1', JSON.parse(dr0).notes.every((n, j) => dr2.c[j] === n.n + 1) && dr2.lab === 'Drums ±', dr2.lab);
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
    const t1 = performance.now(); SYNQUENZER.mtx4.semi(1); const dSemi = performance.now() - t1;
    const t2 = performance.now(); SYNQUENZER.mtx4.fit('dorian'); const dFit = performance.now() - t2;
    const t3 = performance.now(); SYNQUENZER.mtx4.quant('1/16'); const dQ = performance.now() - t3;
    await W(1500); run = false; const ltAct = lt.slice(lt0); stop(); if (po) po.disconnect();
    const s = rg.slice().sort((a, b) => a - b), f = fr.slice(5).sort((a, b) => a - b);
    return {n: L.length, nt: NT(), rgMed: +s[s.length >> 1].toFixed(2), rgMax: +s[s.length - 1].toFixed(2), frP95: +f[Math.floor(f.length * .95)].toFixed(1), dSemi: Math.round(dSemi), dFit: Math.round(dFit), dQ: Math.round(dQ), lt, ltAct, undo: UNDO.slice(-3).map(u => (u.items || []).length)};
  });
  ok('8 Spuren × 8 Szenen gewählt', r.nt === 8 && r.n >= 56, {n: r.n, nt: r.nt});
  ok('Bild der Matrix mit Auswahl (renderGrid ohne Zwischenspeicher, alle Zellen) ≤ 16 ms', r.rgMax <= 16, {median: r.rgMed, max: r.rgMax, frameP95: r.frP95});
  ok('±1 / Dorisch / Quantisieren über alle 64 Clips je < 50 ms, kein Long Task > 50 ms ab den Aktionen', r.dSemi < 50 && r.dFit < 50 && r.dQ < 50 && r.ltAct.every(x => x <= 50), {semi: r.dSemi, fit: r.dFit, quant: r.dQ, longtasksAktion: r.ltAct, longtasksBild: r.lt});
  ok('je Aktion ein ↶-Schritt über alle Clips', r.undo.every(x => x >= 40), r.undo);
  ok('Leistung: keine Fehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close();
}
const bad = res.filter(x => !x.ok);
console.log('\nERGEBNIS ' + (res.length - bad.length) + '/' + res.length + (bad.length ? ' – offen: ' + bad.map(x => x.name).join(' | ') : ''));
await b.close();
