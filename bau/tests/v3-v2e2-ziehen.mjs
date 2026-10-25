// V2e′ acceptance – Ziehen (CDP touch): N7S-10, N7S-41 … N7S-45, N2-2e′-03 (a)–(g); run per viewport: P1 (default) or L1
import { openVp, mk2, SETUP, PREP, RESET, RECTS, rectsSame, sleep } from './v3-v2e2-lib.mjs';
import { eq, mkCheck } from './v3-v2d-lib.mjs';
const VP = process.argv[2] || 'P1';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp(VP);
const T = mk2(p, cdp), {E} = T;
const FRAME = 17;
const setup = async (ins = false) => { await E(SETUP(ins)); await E(() => { window.SYNQUENZER.songView(false); window.SYNQUENZER.setSongView && 0; }); await sleep(200); };
await setup(); await E(PREP);
// baseline: the song view's controls and rows (opened normally)
await E(() => window.SYNQUENZER.songView(true)); await sleep(250);
const R0 = await E(RECTS), rows0 = (await T.info()).rows;
await E(() => window.SYNQUENZER.songView(false)); await sleep(200);
const P0 = await T.full();
const lay = async (tag) => { const r = await E(RECTS), i = await T.info(); const bad = rectsSame(R0, r); check(`${VP} ${tag}: M-ANSICHT ±2 px, Zeilen gleich`, !bad.length && eq(i.rows, rows0), bad.slice(0, 4)); };
const k0 = await T.key(0);

// ---------- N7S-10 / (a): tap starts; hold, release at 800 ms without moving → Teil-Blatt, song view closed
await E(RESET);
await T.down(k0.x, k0.y); await sleep(470);
const lift = await E(() => ({ghost: !!document.querySelector('.drg-ghost'), spring: document.querySelector('.corner.sw').classList.contains('spring'), src: document.querySelector('#partBar .pk').classList.contains('lift'), lbl: document.querySelector('.corner.sw').textContent}));
check(`${VP} N7S-41 Halten 450 ms → Geist, SONG ⇄ amber „↖ IN DEN SONG“, Quelle grau`, lift.ghost && lift.spring && lift.src && /IN DEN SONG/.test(lift.lbl), lift);
await sleep(330); await T.up(); await sleep(200);
let pg = await T.page();
check(`${VP} (a) Loslassen bei 800 ms → Teil-Blatt offen, Song-Ansicht zu`, (await T.pop() || '').includes('pop') && !(await T.songOn()) && pg.open == null, [await T.pop(), pg.open]);
const hp = pg.hap.map(h => h[1]);
check(`${VP} Haptik „pop“ beim Anheben (14 ms)`, hp.includes(14), hp);
if (await T.pop()) await T.tapSel('#popLayer .pop .ps-x');
check(`${VP} (a) Daten deep-equal`, (await T.full()) === P0);

// ---------- (b): hold still → open at 1050 ms (±1 frame); then release without moving → abort, clip view, no sheet, deep-equal
await E(RESET);
await T.down(k0.x, k0.y); await sleep(1150);
pg = await T.page();
const tOpen = pg.open - pg.down;
check(`${VP} (b)/N7S-41 ruhig halten → Song offen bei 1050 ms (±1 Bild)`, pg.open != null && Math.abs(tOpen - 1050) <= FRAME, Math.round(tOpen));
let dg = await T.drag();
check(`${VP} nach dem Öffnen: Schutz (kein Einfüge-Strich)`, dg && dg.st === 'guard' && !(await T.info()).pv, dg);
await lay('(b) offen');
await T.up(); await sleep(260);
check(`${VP} (b) Loslassen ohne Bewegung → Abbruch, Clip-Ansicht, kein Blatt`, !(await T.songOn()) && !(await T.pop()) && !(await T.drag()), [await T.songOn(), await T.pop()]);
check(`${VP} (b) deep-equal`, (await T.full()) === P0);
const ghostGone = await E(() => new Promise(r => setTimeout(() => r(!document.querySelector('.drg-ghost')), 260)));
check(`${VP} Geist fliegt zurück und ist nach ≤ 250 ms weg`, ghostGone);

// ---------- (c): hold, at 500 ms move 20 px → open at 1050 ms; 15 px further → insertion line; release at x = 3·36 + 10 → sheet
await E(RESET);
await T.down(k0.x, k0.y); await sleep(500);
await T.glide(k0.x, k0.y, k0.x + 20, k0.y, 4, 10);
dg = await T.drag();
check(`${VP} (c) 20 px nach dem Anheben → ZIEHEN, noch zu`, dg && dg.st === 'drag' && !(await T.songOn()), dg);
await sleep(600);
pg = await T.page();
check(`${VP} (c) offen bei 1050 ms (±1 Bild), auch mit Bewegung`, pg.open != null && Math.abs(pg.open - pg.down - 1050) <= FRAME, Math.round(pg.open - pg.down));
await T.glide(k0.x + 20, k0.y, k0.x + 35, k0.y, 3, 10);
let inf = await T.info();
if (VP[0] === 'L') {             // L: the part bar lies in the side field (L-2) – the finger first has to reach the song canvas
  check(`${VP} (c) über dem Seitenfeld: noch kein Einfüge-Strich`, !inf.pv && inf.drag.st === 'ready' && !inf.drag.over, inf.drag);
  await T.glide(k0.x + 35, k0.y, inf.canvas.x + inf.canvas.w - 60, inf.canvas.y + inf.canvas.h * .5, 6, 16); inf = await T.info();
}
check(`${VP} (c) 15 px weiter → Einfüge-Strich sichtbar`, inf.pv && inf.pv.drag && inf.drag.st === 'ready', [inf.pv, inf.drag]);
await lay('(c) ZIEHEN über dem Song');
const cv = inf.canvas, yC = cv.y + cv.h * .6;
await T.glide(k0.x + 35, k0.y, cv.x + 3 * 36 + 10, yC, 8, 16);
inf = await T.info();
check(`${VP} N7S-42 Finger bei x = 3·36 + 10 → n = 3`, inf.drag && inf.drag.n === 3 && inf.pv && inf.pv.a === 3, inf.drag);
const pxLine = await T.px(3 * 36, cv.h - 20);
check(`${VP} N7S-42 Einfüge-Strich amber am Taktstrich 3`, Math.abs(pxLine[0] - 255) < 20 && Math.abs(pxLine[1] - 178) < 25, pxLine);
await T.up(); await sleep(250);
let pc = await T.pop();
const opts = await E(() => [...document.querySelectorAll('#popLayer .pop button[data-a]')].map(b => b.dataset.a));
check(`${VP} (c)/N7S-42 auf Inhalt → Blatt [ersetzen] [Einfügen] [Abbrechen]`, (pc || '').includes('plsheet') && eq(opts.filter(x => x !== 'x'), ['replace', 'insert']), [pc, opts]);
check(`${VP} Blatt offen: Song zeigt die Vorschau, Daten unverändert`, !!(await T.info()).pv && (await T.full()) === P0);
await T.tapPop('Abbrechen'); await sleep(250);
check(`${VP} [Abbrechen] → zurück zur Clip-Ansicht, deep-equal`, !(await T.songOn()) && (await T.full()) === P0);

// ---------- (d): hold, move 20 px, at 600 ms on SONG ⇄ → open ≤ 1 frame later (Federtaste)
await E(RESET);
await T.down(k0.x, k0.y); await sleep(480);
await T.glide(k0.x, k0.y, k0.x + 20, k0.y - 20, 3, 10);
const cn = await T.corner();
await sleep(Math.max(0, 600 - 480 - 30));
const cr = await T.rect('.corner.sw');
await T.glide(k0.x + 20, k0.y - 20, cr.x + cr.w + 14, cr.y + cr.h + 14, 2, 8);
check(`${VP} (d) knapp neben SONG ⇄ (außerhalb +8 px) → noch zu`, !(await T.songOn()));
const tMove = await E(() => performance.now());
await T.move(cn.x, cn.y);
pg = await T.page(); const dd = await T.drag();
check(`${VP} (d)/N7S-41 Finger auf SONG ⇄ → offen ≤ 1 Bild nach dem Darüberfahren (vor dem Selbstöffner)`, pg.open != null && pg.open - pg.down < 1000 && dd.why === 'spring' && dd.lag != null && dd.lag <= FRAME, [Math.round(pg.open - pg.down), dd.why, 'Öffnen ' + dd.lag + ' ms', 'Zustellung ' + dd.evLag + ' ms', Math.round(pg.open - tMove)]);
// (e): after the opening only 11 px → release = abort (Schutz), deep-equal, the hint
await T.glide(cn.x, cn.y, cn.x + 11, cn.y, 2, 10);
dg = await T.drag();
check(`${VP} (e) 11 px nach dem Öffnen → noch Schutz`, dg && dg.st === 'guard', dg);
await T.up(); await sleep(260);
const tst = await E(() => window.SYNQUENZER.runtime().toast || document.getElementById('toast').textContent);
check(`${VP} (e) Loslassen im Schutz → Abbruch, Clip-Ansicht, deep-equal, Hinweis`, !(await T.songOn()) && (await T.full()) === P0 && /Taktstrich ziehen/.test(String(tst)), tst);

// ---------- (f): pointercancel while ZIEHEN → abort, deep-equal
await T.down(k0.x, k0.y); await sleep(480);
await T.glide(k0.x, k0.y, k0.x + 30, k0.y, 3, 10);
await T.cancel(); await sleep(260);
check(`${VP} (f) pointercancel während ZIEHEN → Abbruch, deep-equal`, !(await T.drag()) && !(await T.songOn()) && (await T.full()) === P0);
// release while dragging before the opening → abort (B.5 #7)
await T.down(k0.x, k0.y); await sleep(480);
await T.glide(k0.x, k0.y, k0.x + 30, k0.y + 10, 3, 10); await T.up(); await sleep(260);
check(`${VP} B.5 #7 Loslassen in ZIEHEN vor dem Öffnen → Abbruch, kein Teil-Blatt`, !(await T.pop()) && !(await T.songOn()) && (await T.full()) === P0);

// ---------- N7S-42: drop on transport / labels → abort, back to the clip view, deep-equal
for (const [tag, q] of [['Transport', '.sv-play'], ['Etiketten', '.sv-labs .sv-l.trk']]) {
  await T.down(k0.x, k0.y); await sleep(1100);
  await T.glide(k0.x, k0.y, k0.x + 30, k0.y - 30, 3, 10);
  const r = await T.rect(q);
  await T.glide(k0.x + 30, k0.y - 30, r.x + r.w / 2, r.y + r.h / 2, 5, 12); await T.up(); await sleep(260);
  check(`${VP} N7S-42 Ablegen auf ${tag} → Abbruch, Clip-Ansicht, deep-equal`, !(await T.songOn()) && !(await T.pop()) && (await T.full()) === P0);
}

// ---------- N7S-42 / N7S-19: drop at bar line 2 → Einfügen = data like placePart(STROPHE, 2, 'insert'); unfold ≤ 300 ms, haptic once
const want = await E(() => { const Q = window.SYNQUENZER; Q.placePart(0, 2, 'insert'); const s = JSON.stringify(Q.song()); Q.undo(); return s; });
check(`${VP} Undo der API-Probe → deep-equal`, (await T.full()) === P0);
await T.down(k0.x, k0.y); await sleep(1100);
inf = await T.info();
await T.glide(k0.x, k0.y, inf.canvas.x + 2 * 36 + 8, inf.canvas.y + inf.canvas.h * .5, 8, 16);
check(`${VP} n = 2`, (await T.drag()).n === 2);
await T.up(); await sleep(250);
const u0 = await E(() => window.SYNQUENZER.undoInfo().n);
await E(RESET);
const ins = await T.popBtn('Einfügen'); await T.tap(ins.x, ins.y, 0);
const unf = await E(() => { const t0 = performance.now(), u = window.SYNQUENZER.svLayoutInfo().unfold; return new Promise(r => { const f = () => { const v = window.SYNQUENZER.svLayoutInfo().unfold; if (!v) r({u, ms: performance.now() - t0}); else requestAnimationFrame(f); }; f(); }); });
check(`${VP} N7S-45 Entfalten ≤ 300 ms (Dauer ${unf.u && unf.u.dur} ms)`, unf.u && unf.u.dur <= 300 && unf.ms <= 300 + 2 * FRAME, unf);
await sleep(200);
pg = await T.page();
check(`${VP} N7S-45 Haptik einmal („snap“)`, pg.hap.length === 1 && pg.hap[0][1] === 10, pg.hap);
const got = await E(() => JSON.stringify(window.SYNQUENZER.song()));
check(`${VP} N7S-42 „Einfügen“ = Daten wie N7S-19 (placePart(STROPHE, 2, insert))`, got === want);
const u1 = await E(() => window.SYNQUENZER.undoInfo());
check(`${VP} ein Undo (song)`, u1.n === u0 + 1 && u1.top.kind === 'song', u1.top);
check(`${VP} Song bleibt offen nach dem Ablegen`, await T.songOn());
await lay('nach Ablegen + Entfalten');
const mk = (await T.info()).marks.find(m => m.label.startsWith('STROPHE'));
check(`${VP} gelbe Marke STROPHE über T3–6`, mk && Math.abs(mk.x0 - (2 * 36 + 2 - (await T.info()).x0)) <= 1, mk);
await E(() => window.SYNQUENZER.undo());
check(`${VP} Undo → deep-equal`, (await T.full()) === P0);
await E(() => window.SYNQUENZER.songView(false)); await sleep(150);

// ---------- N7S-22 / Xander 24.10 (a): behind the end → append without a question (bars between stay empty)
await T.down(k0.x, k0.y); await sleep(1100);
inf = await T.info();
await T.glide(k0.x, k0.y, inf.canvas.x + inf.canvas.w - 12, inf.canvas.y + 40, 8, 16);
// scroll to the end by the edge (N7S-43): sample SV.x in the page
const sc = await E(() => new Promise(r => { const out = [], t0 = performance.now(); const f = () => { const t = performance.now() - t0; out.push([t, window.SYNQUENZER.svLayoutInfo().x0]); if (t < 600) requestAnimationFrame(f); else r(out); }; f(); }));
await T.move(inf.canvas.x + inf.canvas.w - 60, inf.canvas.y + 40); await sleep(80);
const xs = sc.filter(s => s[0] > 100 && s[0] < 500); const v = xs.length > 1 ? (xs[xs.length - 1][1] - xs[0][1]) / ((xs[xs.length - 1][0] - xs[0][0]) / 1000) / 36 : 0;
const mx = sc[sc.length - 1][1];
check(`${VP} N7S-43 Rand-Rollen 2 Takte/s (±10 %) bzw. bis zum Ende + 4`, (v >= 1.8 && v <= 2.2) || mx >= (await E(() => (window.SYNQUENZER.song().bars + 4) * 36)) - inf.canvas.w + 8 - 1, [v.toFixed(2), mx]);
const dropX = await E(() => { const i = window.SYNQUENZER.svLayoutInfo(), s = window.SYNQUENZER.song(); return i.canvas.x + (s.bars + 2) * 36 - i.x0; });
await T.glide(inf.canvas.x + inf.canvas.w - 60, inf.canvas.y + 40, Math.min(dropX, inf.canvas.x + inf.canvas.w - 30), inf.canvas.y + 40, 4, 16);
const nEnd = (await T.drag()).n;
await T.up(); await sleep(300);
const sA = await E(() => window.SYNQUENZER.song());
check(`${VP} N7S-22 hinter dem Ende → ohne Rückfrage angehängt (Lücke bleibt leer, Xander a)`, !(await T.pop()) && sA.marks.some(m => m.part === 'P1' && m.a === nEnd) && sA.bars === nEnd + 4, [nEnd, sA.bars, sA.marks.map(m => m.part + '@' + m.a)]);
await E(() => window.SYNQUENZER.undo()); await E(() => window.SYNQUENZER.songView(false)); await sleep(150);
check(`${VP} Undo → deep-equal`, (await T.full()) === P0);

// ---------- N7S-43: edge scrolling on a long song: 2 bars/s, after 1 s 6 bars/s; second finger ignored; no launch; FOLGEN holds
await E(() => { const Q = window.SYNQUENZER; for (let k = 0; k < 5; k++) Q.placePart(1, 7 + k * 4, 'insert'); });
const P1 = await T.full();
await E(() => { const Q = window.SYNQUENZER; Q.launchScene(0); });
await sleep(400);
const rt0 = await E(() => { const r = window.SYNQUENZER.runtime(); return {part: r.part, slots: r.slots}; });
await T.down(k0.x, k0.y); await sleep(1100);
inf = await T.info();
const ex = inf.canvas.x + inf.canvas.w - 10, ey = inf.canvas.y + 60;
await T.glide(k0.x, k0.y, ex, ey, 8, 12);
const samp = await E(() => new Promise(r => { const out = [], t0 = performance.now(); const f = () => { const t = performance.now() - t0; out.push([t, window.SYNQUENZER.svLayoutInfo().x0]); if (t < 1700) requestAnimationFrame(f); else r(out); }; f(); }));
const rate = (a, z) => { const s = samp.filter(x => x[0] >= a && x[0] <= z); return s.length > 1 ? (s[s.length - 1][1] - s[0][1]) / ((s[s.length - 1][0] - s[0][0]) / 1000) / 36 : 0; };
const v1 = rate(100, 900), v2 = rate(1150, 1650);
check(`${VP} N7S-43 Rand-Rollen 2 Takte/s (±10 %)`, v1 >= 1.8 && v1 <= 2.2, v1.toFixed(2));
check(`${VP} N7S-43 nach 1 s 6 Takte/s (±10 %)`, v2 >= 5.4 && v2 <= 6.6, v2.toFixed(2));
// second finger: down + up somewhere (a cell, the keyboard) → nothing
const fol = await E(() => window.SYNQUENZER.viewState('song'));
check(`${VP} N7S-43 FOLGEN hält („Finger“)`, fol && fol.follow === 'hold' && fol.reason === 'finger', fol);
await T.glide(ex, ey, ex - 100, ey, 3, 10);
const before2 = await T.full();
const kb = await T.rect('#kbArea');
await T.send('touchStart', [{x: ex - 100, y: ey, id: 1}, {x: kb.x + 30, y: kb.y + kb.h - 20, id: 2}]); await sleep(60);
await T.send('touchMove', [{x: ex - 100, y: ey, id: 1}]); await sleep(60);          // finger 2 lifts
const cvr = await T.info();
await T.send('touchStart', [{x: ex - 100, y: ey, id: 1}, {x: cvr.canvas.x + 50, y: cvr.canvas.y + 50, id: 3}]); await sleep(60);
await T.send('touchMove', [{x: ex - 100, y: ey, id: 1}]); await sleep(60);
dg = await T.drag();
check(`${VP} N7S-43 zweiter Finger ändert nichts (Ziehen läuft weiter, Daten gleich)`, dg && dg.st === 'ready' && (await T.full()) === before2, dg);
const rt1 = await E(() => { const r = window.SYNQUENZER.runtime(); return {part: r.part, slots: r.slots}; });
check(`${VP} N7S-43 während des Ziehens startet nichts`, eq(rt0, rt1), [rt0, rt1]);
await T.glide(ex - 100, ey, k0.x, (await T.rect('.sv-top')).y + 10, 4, 12); await T.up(); await sleep(250);
check(`${VP} Ablegen auf der Transportzeile → Abbruch, deep-equal`, (await T.full()) === P1);
await E(() => window.SYNQUENZER.stop()); await sleep(200);

// ---------- Quelle c (N7S-44): a mark held + dragged = move; over ⧉ ≥ 250 ms = copy
await setup(true); await E(() => window.SYNQUENZER.songView(true)); await sleep(250);
const PM = await T.full(), clipsM = await T.clips();
inf = await T.info();
let mR = inf.marks.find(m => m.label.startsWith('REFRAIN'));
const hx = inf.canvas.x + mR.x0 + 12 - inf.x0, hy = inf.canvas.y + 9;
await T.down(hx, hy); await sleep(500);
await T.glide(hx, hy, inf.canvas.x + 0 * 36 + 4, inf.canvas.y + 100, 8, 16);
dg = await T.drag();
check(`${VP} N7S-44 Marke halten + 12 px → Ziehen (Einfüge-Strich)`, dg && dg.src === 'mark' && dg.st === 'ready' && dg.n === 0, dg);
await T.up(); await sleep(300);
let s = await E(() => window.SYNQUENZER.song());
check(`${VP} N7S-44 verschoben: REFRAIN an Takt 1`, s.marks.find(m => m.part === 'P2').a === 0 && (await T.clips()) === clipsM, s.marks.map(m => m.part + '@' + m.a));
let u = await E(() => window.SYNQUENZER.undoInfo());
check(`${VP} ein Undo song`, u.top.kind === 'song', u.top);
await E(() => window.SYNQUENZER.undo()); await sleep(150);
check(`${VP} Undo → deep-equal`, (await T.full()) === PM);
inf = await T.info(); mR = inf.marks.find(m => m.label.startsWith('REFRAIN'));
const sw = await T.rect('.sv-sw');
await T.down(inf.canvas.x + mR.x0 + 12 - inf.x0, hy); await sleep(500);
await T.glide(inf.canvas.x + mR.x0 + 12 - inf.x0, hy, sw.x + sw.w / 2, sw.y + sw.h / 2, 8, 16);
const zone = await E(() => document.querySelector('.sv-sw').textContent);
await sleep(300);
dg = await T.drag();
check(`${VP} N7S-44 ⧉ an der Stelle von CLIPS ⇄; ≥ 250 ms darüber = Kopie`, /KOPIE/.test(zone) && dg.copy, [zone, dg]);
await T.glide(sw.x + sw.w / 2, sw.y + sw.h / 2, inf.canvas.x + 2 * 36 + 4, inf.canvas.y + 100, 8, 16);
await T.up(); await sleep(300);
s = await E(() => window.SYNQUENZER.song());
check(`${VP} N7S-44 Kopie an Takt 3, Original bleibt (rückt)`, s.marks.filter(m => m.part === 'P2').length === 2 && s.marks.some(m => m.part === 'P2' && m.a === 2) && (await T.clips()) === clipsM, s.marks.map(m => m.part + '@' + m.a));
await E(() => window.SYNQUENZER.undo()); await sleep(150);
check(`${VP} Undo → deep-equal`, (await T.full()) === PM);
const swTxt = await E(() => document.querySelector('.sv-sw').textContent);
check(`${VP} CLIPS ⇄ wieder da`, /CLIPS/.test(swTxt), swTxt);

check(`${VP} 0 Konsolenfehler`, errs.length === 0, errs);
await b.close();
process.exit(done() ? 1 : 0);
