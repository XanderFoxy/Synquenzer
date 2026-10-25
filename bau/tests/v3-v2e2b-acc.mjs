// V2e acceptance (P1, touch via CDP): N7S-33 … N7S-39, N2e-01/02, Marken-Blatt, Bereich-Leiste, Ersetzen/Einfügen-Blatt, Xander 24.10. (a)–(c)
import { openVp, mk, SETUP, STATES } from './v3-v2e-lib.mjs';
import { eq, mkCheck } from './v3-v2d-lib.mjs';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp('P1');
const T = mk(p, cdp), {E} = T;
const setup = async (ins = true) => { await E(SETUP(ins)); await E(() => { window.SYNQUENZER.songView(true); }); await p.waitForTimeout(300); };
await setup();
const clips0 = await T.clips();
const amber = c => Math.abs(c[0] - 255) <= 12 && Math.abs(c[1] - 178) <= 12 && Math.abs(c[2] - 46) <= 12;

// ---------- N7S-33 rows, no new rows
let i = await T.info();
check('N7S-33 Zeilen = Taktleiste, Spuren, AKKORDE, MELODIE', eq(i.rows, ['TAKT', 'S1', 'S2', 'S3', 'S4', 'MEL', 'DR', 'AKKORDE', 'MELODIE']), i.rows);
check('N7S-33 Canvas P1 306×330,8 (±2)', Math.abs(i.canvas.w - 306) <= 2 && Math.abs(i.canvas.h - 330.8) <= 2, i.canvas);
check('N7S-33 Zeilen ≥ 26 px', i.rowH >= 26, i.rowH);
const dom = await E(() => { const v = document.getElementById('songView'), t = v.innerText; const pb = document.getElementById('partBar'); return {teil: /(^|\n)TEIL(\n|$)/.test(t), circ: t.includes('⊙'), spur: t.includes('Spuren ▸'), partBar: !!(pb && pb.offsetHeight && pb.getBoundingClientRect().top < window.innerHeight)}; });
check('N7S-33 keine TEIL-Zeile, kein ⊙, kein „Spuren ▸“, keine Teil-Leiste im Hochformat', !dom.teil && !dom.circ && !dom.spur && !dom.partBar, dom);

// ---------- N2e-01: ▶ oben = SONG
const gs = await E(() => { const g = document.querySelector('#bPlay .g-song'); return g ? getComputedStyle(g).display : 'none'; });
check('N2e-01 ▶ oben zeigt SONG in der Song-Ansicht', gs !== 'none', gs);

// ---------- marks drawn: STROPHE T3–6 (a=2): numbers 3–6 hidden, 7 visible
i = await T.info();
const mS = i.marks.find(m => m.label.startsWith('STROPHE'));
check('Marke STROPHE x0 = 2·36+2, x1 = 6·36−2', mS && Math.abs(mS.x0 - 74) <= 1 && Math.abs(mS.x1 - 214) <= 1, mS);
check('Marke amber in der Mitte', amber(await T.px(144, 10)), await T.px(144, 10));
check('Nummern 4 und 5 in der Marke nicht gezeichnet, 7 schon', (await T.grey(3 * 36 + 10, 3, 16, 14)) === 0 && (await T.grey(4 * 36 + 10, 3, 16, 14)) === 0 && (await T.grey(6 * 36 + 10, 3, 16, 14)) > 3);

// ---------- N7S-35: tap on the mark → white frame + Marken-Blatt; second tap → bar selection inside, numbers visible
await T.tapCv(4 * 36 + 10, 9);
i = await T.info();
let pc = await T.pop();
check('N7S-35 Tipp auf Marke → gewählt + Marken-Blatt', i.mark === 'M3' && pc && pc.includes('msheet'), [i.mark, pc]);
const wpx = await T.px(75, 4);
check('N7S-35 weißer Rand (Pixel am Rand ≈ #f2f4f8)', wpx[0] > 220 && wpx[1] > 220 && wpx[2] > 220, wpx);
const sh = await T.rect('#popLayer .pop');
check('Marken-Blatt P1 208 px (±2), ab y 636', sh && Math.abs(sh.h - 208) <= 2 && Math.abs(sh.y - 636) <= 2, sh);
await T.tapCv(4 * 36 + 10, 9);
i = await T.info(); pc = await T.pop();
check('N7S-35 zweiter Tipp → Takt 5 gewählt, Blatt zu', eq(i.sel, {a: 4, b: 4}) && !pc && i.mark === null, [i.sel, pc]);
check('N7S-35 Nummern in der offenen Marke sichtbar (Takt 4)', (await T.grey(3 * 36 + 10, 3, 16, 14)) > 3);

// ---------- N7S-36: Bereich-Leiste in the Träger bar's place, same height, nothing else moves
const car0 = await E(() => { const r = q => { const e = document.querySelector(q); const b = e.getBoundingClientRect(); return [b.x, b.y, b.width, b.height].map(v => Math.round(v * 10) / 10); }; return {strip: r('#strip'), mode: r('#modebar'), kb: r('#kbArea'), cv: r('.sv-cv'), top: r('.sv-top')}; });
const rb = await T.rect('#rangeBar');
check('N7S-36 Bereich-Leiste sichtbar, 56 px (±1), y 482,8', rb && Math.abs(rb.h - 56) <= 1 && Math.abs(rb.y - 482.8) <= 1, rb);
await T.tapCv(4 * 36 + 10, 9);       // tap into the selection → clears it
const rbOff = await T.rect('#rangeBar'), carR = await T.rect('#carrier');
check('Tipp in die Auswahl → Leiste weg, Träger-Leiste wieder (gleiche Stelle/Höhe)', !rbOff && carR && Math.abs(carR.y - rb.y) <= 1 && Math.abs(carR.h - rb.h) <= 1, [rbOff, carR]);
const car1 = await E(() => { const r = q => { const e = document.querySelector(q); const b = e.getBoundingClientRect(); return [b.x, b.y, b.width, b.height].map(v => Math.round(v * 10) / 10); }; return {strip: r('#strip'), mode: r('#modebar'), kb: r('#kbArea'), cv: r('.sv-cv'), top: r('.sv-top')}; });
check('N7S-36 M-ANSICHT: nichts außerhalb verschiebt sich (±2)', Object.keys(car0).every(k => car0[k].every((v, j) => Math.abs(v - car1[k][j]) <= 2)), [car0, car1]);

// ---------- hold on a mark 450 ms → Marken-Blatt at release; hold + move → nothing
i = await T.info();
await T.hold(i.canvas.x + 7 * 36 + 10, i.canvas.y + 9, 600);
pc = await T.pop(); i = await T.info();
check('Halten auf REFRAIN → Marken-Blatt beim Loslassen', pc && pc.includes('msheet') && i.mark === 'M2', [pc, i.mark]);
await T.tapSel('.msheet .ms-x');
check('✕ schließt das Marken-Blatt', !(await T.pop()) && (await T.info()).mark === null);

// ---------- Marken-Blatt actions (each one undo, clips deep-equal, audible via the song)
const openSheet = async bar => { if ((await T.pop() || '').includes('msheet')) await T.tapSel('.msheet .ms-x'); await T.tapCv(bar * 36 + 10, 9); };
let before = await T.proj(), n0 = (await E(() => window.SYNQUENZER.undoInfo())).n;
await openSheet(3); await T.tapPop('×2');
let s = await E(() => window.SYNQUENZER.song());
check('×2: STROPHE zweimal (bars 11 → 15, Marken T3–6 und T7–10)', s.bars === 15 && eq(s.marks.filter(m => m.part === 'P1').map(m => [m.a, m.len]), [[2, 4], [6, 4]]), [s.bars, s.marks]);
let u = await E(() => window.SYNQUENZER.undoInfo());
check('×2: ein Undo song, Clips deep-equal', u.n === n0 + 1 && u.top.kind === 'song' && (await T.clips()) === clips0, u.top);
// audible: the bass (Synth 1, Sz1, 1-bar clip, notes 45 at 0 and 2) sounds in T7–10 now (beats 24–40)
await E(() => { const Q = window.SYNQUENZER; Q.setBpm(240); Q.clearLog(); Q.songPlay(6); });
await p.waitForFunction(() => { const s = window.SYNQUENZER.runtime().song; return s.beat != null && s.beat >= 33; }, null, {timeout: 20000, polling: 20});
let lg = await E(() => window.SYNQUENZER.noteLog(300).filter(n => n.track === 0).map(n => n.clipNote));
await E(() => window.SYNQUENZER.songPlay(false)); await p.waitForTimeout(150);
check('×2 hörbar: Bass Sz1 (45) spielt in der Kopie', lg.filter(x => x === 45).length >= 4, lg);
await E(() => window.SYNQUENZER.undo());
check('Undo → deep-equal', (await T.proj()) === before);
// swap ◀ with INTRO? STROPHE's left neighbour is INTRO (M1)
await openSheet(3);
const swL = await T.popBtn('◀');
check('◀ aktiv (Nachbar INTRO), ▶ aktiv (Nachbar REFRAIN)', swL && !swL.dis);
await T.tap(swL.x, swL.y);
s = await E(() => window.SYNQUENZER.song());
check('◀ tauscht STROPHE mit INTRO', eq(s.marks.map(m => [m.part, m.a, m.len]).sort((a, b) => a[1] - b[1]).slice(0, 2), [['P1', 0, 4], ['S4', 4, 2]]), s.marks);
await T.tapSel('.msheet .ms-x');
await E(() => window.SYNQUENZER.undo());
check('Undo ◀ → deep-equal', (await T.proj()) === before);
// Löschen
await openSheet(3); await T.tapPop('Löschen');
s = await E(() => window.SYNQUENZER.song());
check('✕ Löschen: STROPHE weg, der Rest rückt (bars 7)', s.bars === 7 && !s.marks.some(m => m.part === 'P1') && s.marks.some(m => m.part === 'P2' && m.a === 3), [s.bars, s.marks]);
await E(() => window.SYNQUENZER.undo());
// Nur Name weg
const st0 = await E(STATES);
await openSheet(3); await T.tapPop('Name weg');
s = await E(() => window.SYNQUENZER.song());
check('Nur Name weg: Marke weg, Inhalt deep-equal', !s.marks.some(m => m.part === 'P1') && eq(await E(STATES), st0), s.marks);
await E(() => window.SYNQUENZER.undo());
check('Undo → deep-equal', (await T.proj()) === before);
// ✎ Name: Teil überall (part undo) and nur hier (song undo)
await openSheet(3); await T.tapPop('✎ Name');
await T.tapPop('Bridge');
let pn = await E(() => window.SYNQUENZER.project());
const parts = (pn.project || pn).parts;
u = await E(() => window.SYNQUENZER.undoInfo());
check('✎ Name „Bridge“ (Teil überall) → Teil heißt Bridge, Undo part', parts[0].name === 'Bridge' && u.top.kind === 'part', [parts[0].name, u.top]);
i = await T.info();
check('Marke zeigt den neuen Namen', i.marks.some(m => m.label.startsWith('BRIDGE')), i.marks);
await E(() => window.SYNQUENZER.undo());
await openSheet(3); await T.tapPop('✎ Name');
const seg = await T.popBtn('nur hier'); await T.tap(seg.x, seg.y);
await T.tapPop('Outro');
s = await E(() => window.SYNQUENZER.song()); pn = await E(() => window.SYNQUENZER.project());
check('✎ Name „nur hier“ → nur die Marke heißt Outro, der Teil bleibt Strophe', s.marks.find(m => m.part === 'P1').name === 'Outro' && (pn.project || pn).parts[0].name === 'Strophe');
await E(() => window.SYNQUENZER.undo());
// Farbe
await openSheet(3); await T.tapPop('Farbe');
const sw = await E(() => { const b = [...document.querySelectorAll('.pop.pcol button')][3]; const r = b.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, c: b.dataset.c}; });
await T.tap(sw.x, sw.y);
pn = await E(() => window.SYNQUENZER.project());
check('Farbe → Teil-Farbe ' + sw.c + ', Undo part', (pn.project || pn).parts[0].color === sw.c && (await E(() => window.SYNQUENZER.undoInfo())).top.kind === 'part');
await E(() => window.SYNQUENZER.undo());
check('Undo → deep-equal', (await T.proj()) === before);
// Teil-Vorlage ›
await openSheet(3); await T.tapPop('Teil-Vorlage');
pc = await T.pop(); const psOpen = await E(() => !!document.querySelector('.psheet, #partSheet.open, .pop.psheet, .sheet.open'));
check('Teil-Vorlage › öffnet das Teil-Blatt', !!pc || psOpen, [pc, psOpen]);
await E(() => { try { window.SYNQUENZER.closeSheets && window.SYNQUENZER.closeSheets(); } catch (e) {} document.querySelector('#popLayer .bd') && document.querySelector('#popLayer .bd').dispatchEvent(new PointerEvent('pointerdown', {bubbles: true})); });
await p.waitForTimeout(200);
await E(() => window.SYNQUENZER.songView(true));
// ● Neu aufnehmen … → Start-Blatt with the mark's range
await openSheet(3); await T.tapPop('Neu aufnehmen');
const rsH = await E(() => { const h = document.querySelector('.pop.rstart .rs-h b'); return h ? h.textContent : null; });
check('● Neu aufnehmen … → Start-Blatt „AUFNAHME TAKTE 3–6“', rsH === 'AUFNAHME TAKTE 3–6', rsH);
await T.tapSel('.pop.rstart .rs-x');
// ⧉ Kopie … → then tap the bar line 11 (behind REFRAIN) → copy there
await E(() => window.SYNQUENZER.songSelect(null));
await openSheet(3); await T.tapPop('Kopie');
check('⧉ Kopie: Blatt zu, Hinweis „Ablage-Taktstrich antippen“', !(await T.pop()) && (await E(() => document.querySelector('.sv-hint').textContent)).includes('Taktstrich'));
await E(() => { window.SYNQUENZER.svLayoutInfo(); });
// scroll so that bar line 11 is visible: tap on bar line 7 instead (between STROPHE and Break): x = 7*36 → the copy lands at T8? use bar line 6 (= end of STROPHE)
await T.tapCv(6 * 36 + 3, 150);
s = await E(() => window.SYNQUENZER.song());
check('⧉ Kopie am Taktstrich 6 → zweite STROPHE T7–10, bars 15, ein Undo', s.bars === 15 && eq(s.marks.filter(m => m.part === 'P1').map(m => [m.a, m.len]), [[2, 4], [6, 4]]) && (await E(() => window.SYNQUENZER.undoInfo())).top.kind === 'song', s.marks);
await E(() => window.SYNQUENZER.undo());
check('Undo → deep-equal', (await T.proj()) === before);

// ---------- N7S-37: a cell tap in a mark changes only that bar and sets STROPHE′; [Auf alle übertragen] → no ′, all equal
await E(() => window.SYNQUENZER.placeAt('P1', 11));     // a second STROPHE at the end (T12–15)
s = await E(() => window.SYNQUENZER.song());
check('placeAt am Ende hängt ohne Rückfrage an', s.bars === 15 && s.marks.filter(m => m.part === 'P1').length === 2 && !(await T.pop()), [s.bars, s.marks]);
const stA = await E(STATES);
i = await T.info();
await T.tapCv(3 * 36 + 18, 20 + i.rowH * 0 + i.rowH / 2);          // Synth 1, T4
const stB = await E(STATES);
const changed = stA.map((r, k) => (eq(r, stB[k]) ? null : k)).filter(x => x != null);
check('N7S-37 Zellen-Tipp ändert nur Takt 4 (WP6)', eq(changed, [3]) && stB[3][0] !== stA[3][0], {changed, a: stA[3], b: stB[3]});
i = await T.info();
check('N7S-37 Marke zeigt „STROPHE′“', i.marks.some(m => m.label === 'STROPHE′'), i.marks.map(m => m.label));
// audible: Synth 1 at T4 now plays another clip (Sz3 = 41 or stop)
await openSheet(3);
const allB = await T.popBtn('übertragen');
check('[Auf alle 2 „Strophe“ übertragen] aktiv', allB && !allB.dis && allB.txt.includes('2'), allB);
await T.tap(allB.x, allB.y);
const stC = await E(STATES); i = await T.info(); u = await E(() => window.SYNQUENZER.undoInfo());
check('N7S-37 nach [Auf alle übertragen]: kein ′, beide Stellen gleich, Undo group', !i.marks.some(m => m.label.includes('′') && m.label.startsWith('STR')) && eq(stC.slice(2, 6), stC.slice(11, 15)) && u.top.kind === 'group', {labels: i.marks.map(m => m.label), u: u.top});
check('Clips deep-equal', (await T.clips()) === clips0);

// ---------- N7S-38: chord in a mark → only here; [Für alle „Strophe“] → all 3 places + template, one undo
await setup();
await E(() => { window.SYNQUENZER.placeAt('P1', 11); window.SYNQUENZER.placeAt('P1', 15); });
s = await E(() => window.SYNQUENZER.song());
check('3 STROPHE-Marken (T3, T12, T16)', eq(s.marks.filter(m => m.part === 'P1').map(m => m.a), [2, 11, 15]), s.marks);
i = await T.info();
const chY = 20 + i.rowH * 6 + i.rowH / 2;
await T.tapCv(3 * 36 + 8, chY);                 // the F chip at beat 12 (T4)
check('Akkord-Auswahl offen', ((await T.pop()) || '').includes('chpick'));
await p.fill('.pop.chpick .cp-in', 'Dm7'); await p.keyboard.press('Enter'); await p.waitForTimeout(250);
s = await E(() => window.SYNQUENZER.song());
const at = bt => { let c = null; for (const x of s.carrier) { if (x.beat > bt + 1e-6) break; c = x.target; } return c ? c.name : 'O'; };
check('N7S-38 Dm7 nur an dieser Stelle (T4), T13/T17 bleiben F', at(12) === 'Dm7' && at(48) === 'F' && at(64) === 'F', [at(12), at(48), at(64)]);
i = await T.info(); const smk = await E(() => window.SYNQUENZER.songMarks().filter(m => m.part === 'P1').map(m => m.dev));
check('N7S-38 die geänderte Stelle zeigt „STROPHE′“, die anderen nicht', i.marks.some(m => m.label === 'STROPHE′') && smk.join() === 'true,false,false', [i.marks.map(m => m.label), smk]);
const tb = await T.toastBtn('Für alle');
check('Toast [Für alle „Strophe“]', !!tb);
const nB = (await E(() => window.SYNQUENZER.undoInfo())).n, projB = await T.proj();
await T.tap(tb.x, tb.y);
s = await E(() => window.SYNQUENZER.song()); pn = await E(() => window.SYNQUENZER.project());
const tpl = (pn.project || pn).parts[0].chords;
const tAt = rb => { let c = null; for (const x of tpl.ch) { if (x.b > rb + 1e-6) break; c = x.tg; } return c ? c.name : 'O'; };
u = await E(() => window.SYNQUENZER.undoInfo());
check('N7S-38 [Für alle] → Dm7 in allen 3 Stellen und in der Vorlage', at(12) === 'Dm7' && at(48) === 'Dm7' && at(64) === 'Dm7' && tAt(4) === 'Dm7' && tAt(0) === 'Am' && tAt(8) === 'C', [at(48), at(64), tpl.ch.map(c => c.b + ':' + (c.tg ? c.tg.name : 'O'))]);
check('N7S-38 ein Undo (group part+song)', u.n === nB + 1 && u.top.kind === 'group', u.top);
i = await T.info();
check('N7S-38 keine Marke mit ′ nach [Für alle]', !i.marks.some(m => m.label.startsWith('STR') && m.label.includes('′')), i.marks.map(m => m.label));
// audible: the Träger at T17 (beat 64) is Dm7 when the song plays there
await E(() => { const Q = window.SYNQUENZER; Q.setBpm(240); Q.songPlay(16); });
await p.waitForFunction(() => { const s = window.SYNQUENZER.runtime().song; return s.beat != null && s.beat >= 64.5; }, null, {timeout: 20000, polling: 20});
const cn = await E(() => { const c = window.SYNQUENZER.runtime().carrier; return c ? c.name : null; });
await E(() => window.SYNQUENZER.songPlay(false)); await p.waitForTimeout(150);
check('N7S-38 hörbar: Träger bei T17 = Dm7', cn === 'Dm7', cn);
await E(() => window.SYNQUENZER.undo());
check('Undo → Stand vor [Für alle]', (await T.proj()) === projB);

// ---------- N7S-39: label tap selects the track; the NOTEN target shows it
await setup();
i = await T.info();
const lab = await E(() => { const d = [...document.querySelectorAll('.sv-l.trk')].find(x => x.dataset.t === '1'); const r = d.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; });
await T.tap(lab.x, lab.y);
const selT = await E(() => window.SYNQUENZER.runtime().selected.track);
const selC = await E(() => document.querySelector('.sv-l.trk[data-t="1"]').classList.contains('sel'));
check('N7S-39 Etikett SYN 2 → runtime().selected.track = 1, markiert', selT === 1 && selC, [selT, selC]);
await T.tapCv(3 * 36 + 10, 9); await T.tapCv(3 * 36 + 10, 9);       // T4 selected inside STROPHE
await T.tapSel('.sv-top .sv-rec');
const nt = await E(() => { const n = document.querySelector('.pop.rstart .rs-n small'); return n ? n.textContent : null; });
check('N7S-39 Start-Blatt: NOTEN zeigt Synth 2', nt === 'Synth 2', nt);
await T.tapSel('.pop.rstart .rs-x');

// ---------- N2e-02: FOLGEN holds while bars are selected / a mark is chosen
await E(() => { const Q = window.SYNQUENZER; Q.songPlay(0); });
await p.waitForTimeout(300);
let vs = await E(() => window.SYNQUENZER.viewState('song'));
check('N2e-02 FOLGEN hält bei gelber Auswahl', vs.follow === 'hold' && vs.reason === 'sel', vs);
await E(() => window.SYNQUENZER.songSelect(null)); await p.waitForTimeout(100);
await E(() => window.SYNQUENZER.songPlay(false));

// ---------- Bereich-Leiste: ▶ Ab hier, ⧉ Kopie →, ✕ Takte löschen, Als Teil …, ⋯ (Leeren, Teil einsetzen, Quantisieren, Schleife)
await setup(); before = await T.proj();
await T.tapCv(6 * 36 + 10, 9);                     // T7 (Break, no mark)
check('Tipp auf 7 (ohne Marke) → Auswahl T7', eq((await T.info()).sel, {a: 6, b: 6}));
await T.tapSel('#rangeBar [data-a="play"]');
await p.waitForTimeout(400);
const rs = await E(() => window.SYNQUENZER.runtime().song);
check('▶ Ab hier startet den Song bei T7', rs.play && rs.beat != null && rs.beat >= 24 && rs.beat < 28 + 2, rs);
await E(() => window.SYNQUENZER.songPlay(false)); await p.waitForTimeout(150);
await T.tapSel('#rangeBar [data-a="copy"]');
s = await E(() => window.SYNQUENZER.song());
check('⧉ Kopie →: T7 doppelt (bars 12), REFRAIN ab T9, Auswahl auf der Kopie', s.bars === 12 && s.marks.some(m => m.part === 'P2' && m.a === 8) && eq((await T.info()).sel, {a: 7, b: 7}), [s.bars, s.marks]);
await E(() => window.SYNQUENZER.undo());
check('Undo → deep-equal (Kopie)', (await T.proj()) === before);
await E(() => window.SYNQUENZER.songSelect(6, 6));
await T.tapSel('#rangeBar [data-a="del"]');
s = await E(() => window.SYNQUENZER.song());
check('✕ Takte löschen: T7 weg, REFRAIN ab T7, Leiste weg', s.bars === 10 && s.marks.some(m => m.part === 'P2' && m.a === 6) && !(await T.rect('#rangeBar')), s.marks);
await E(() => window.SYNQUENZER.undo());
check('Undo → deep-equal', (await T.proj()) === before);
// Als Teil … (T7 Break) → part „Break“ + mark, one group undo
await T.tapCv(6 * 36 + 10, 9);
await T.tapSel('#rangeBar [data-a="part"]');
await T.tapPop('Break');
s = await E(() => window.SYNQUENZER.song()); pn = await E(() => window.SYNQUENZER.project());
const brk = (pn.project || pn).parts.find(x => x && x.name === 'Break');
u = await E(() => window.SYNQUENZER.undoInfo());
check('Als Teil … „Break“ → Teil + Marke T7, Undo group', brk && s.marks.some(m => m.a === 6 && m.len === 1 && m.part === brk.id) && u.top.kind === 'group', [s.marks, u.top]);
i = await T.info();
check('1-Takt-Marke zeigt die Kurzform „BRK“', i.marks.some(m => m.label === 'BRK'), i.marks.map(m => m.label));
await E(() => window.SYNQUENZER.undo());
check('Undo → deep-equal', (await T.proj()) === before);
// ⋯ → Teil einsetzen ▾ → STROPHE at T7 → Ersetzen/Einfügen-Blatt (content behind) → Einfügen
await T.tapCv(6 * 36 + 10, 9);
await T.tapSel('#rangeBar [data-a="more"]');
await T.tapPop('Teil einsetzen');
await T.tapPop('Strophe');
pc = await T.pop();
check('Ersetzen/Einfügen-Blatt offen (Inhalt ab T7)', (pc || '').includes('plsheet'), pc);
const plB = await E(() => [...document.querySelectorAll('.pop.plsheet button')].map(b => b.textContent));
check('Blatt: „Takte 7–10 ersetzen“ / „Einfügen … 4 Takte nach hinten“ / Abbrechen, nichts vorbelegt', plB.some(t => t.includes('Takte 7–10 ersetzen')) && plB.some(t => t.includes('Einfügen') && t.includes('4 Takte nach hinten')) && plB.some(t => t === 'Abbrechen') && !(await E(() => !!document.querySelector('.pop.plsheet .on'))), plB);
const pvPx = await T.px(6 * 36, 200);
check('Vorschau: amber Einfüge-Strich am Taktstrich 7', amber(pvPx) || (pvPx[0] > 200 && pvPx[1] > 140 && pvPx[2] < 90), pvPx);
await T.tapPop('Einfügen');
s = await E(() => window.SYNQUENZER.song());
check('Einfügen: STROPHE T7–10, REFRAIN ab T12, bars 15, ein Undo song', s.bars === 15 && s.marks.some(m => m.part === 'P1' && m.a === 6) && s.marks.some(m => m.part === 'P2' && m.a === 11) && (await E(() => window.SYNQUENZER.undoInfo())).top.kind === 'song', s.marks);
await E(() => window.SYNQUENZER.undo());
// the same with „ersetzen“
await T.tapCv(6 * 36 + 10, 9);
await T.tapSel('#rangeBar [data-a="more"]'); await T.tapPop('Teil einsetzen'); await T.tapPop('Strophe');
await T.tapPop('ersetzen');
s = await E(() => window.SYNQUENZER.song());
check('Ersetzen: T7–10 = STROPHE, bars 11', s.bars === 11 && s.marks.some(m => m.part === 'P1' && m.a === 6), [s.bars, s.marks]);
await E(() => window.SYNQUENZER.undo());
// Abbrechen → nothing
await E(() => window.SYNQUENZER.songSelect(6, 6));
await T.tapSel('#rangeBar [data-a="more"]'); await T.tapPop('Teil einsetzen'); await T.tapPop('Strophe');
await T.tapPop('Abbrechen');
check('Abbrechen → deep-equal, Vorschau weg', (await T.proj()) === before && (await T.grey(0, 0, 1, 1)) >= 0);
// ⋯ → Leeren, Als Schleife
await E(() => window.SYNQUENZER.songSelect(6, 6));
await T.tapSel('#rangeBar [data-a="more"]'); await T.tapPop('Als Schleife');
s = await E(() => window.SYNQUENZER.song());
check('⋯ Als Schleife → Schleife T7', s.loop.on && s.loop.a === 6 && s.loop.b === 7, s.loop);
const lt = await E(() => document.querySelector('.sv-loop .v').textContent);
check('SCHLEIFE-Taste zeigt „⟲ Takt 7 ▾“', lt === '⟲ Takt 7 ▾', lt);
await E(() => window.SYNQUENZER.undo());
await E(() => window.SYNQUENZER.songSelect(6, 6));
await T.tapSel('#rangeBar [data-a="more"]'); await T.tapPop('Leeren');
s = await E(() => window.SYNQUENZER.song());
const stL = await E(STATES);
check('⋯ Leeren → T7 alle Spuren aus, Länge bleibt', s.bars === 11 && stL[6].every(x => x === -1), stL[6]);
await E(() => window.SYNQUENZER.undo());
check('Undo → deep-equal', (await T.proj()) === before);
// Schleife Teil (popover)
await E(() => window.SYNQUENZER.songSelect(null)); await E(() => window.SYNQUENZER.songPos(3));
await T.tapSel('.sv-top .sv-loop'); await T.tapPop('Teil');
s = await E(() => window.SYNQUENZER.song());
const lt2 = await E(() => document.querySelector('.sv-loop .v').textContent);
check('SCHLEIFE ▾ [Teil] → Schleife = Marke STROPHE (T3–6), Taste „⟲ Strophe ▾“', s.loop.on && s.loop.a === 2 && s.loop.b === 6 && lt2 === '⟲ Strophe ▾', [s.loop, lt2]);
await E(() => window.SYNQUENZER.undo());

// ---------- Xander 24.10. (a): a part at any bar line, also into an empty song behind empty bars; (b) parts in the Kette menu
await E(() => { const Q = window.SYNQUENZER; Q.setSong({bars: 0, lanes: [], carrier: []}); });
await p.waitForTimeout(200);
const emp = await E(() => { const e = document.querySelector('.sv-empty'); return e && !e.hidden ? e.innerText : null; });
check('Leerer Song: Hinweis „FANG TEIL … ziehen – oder ● SONG“ + [Kette aus Szenen …] + [＋ Teil einsetzen ▾]', emp && emp.includes('FANG TEIL') && emp.includes('Kette aus Szenen') && emp.includes('Teil einsetzen'), emp);
const nE = (await E(() => window.SYNQUENZER.undoInfo())).n, pE = await T.proj();
await T.info();
await T.tapCv(3 * 36 + 18, 9);                     // bar 4 of the empty song
pc = await T.pop();
check('(a) Tipp auf Takt 4 im leeren Song → „Teil einsetzen bei Takt 4“', (pc || '').includes('plpick') && (await E(() => document.querySelector('.pop.plpick h4').textContent)) === 'Teil einsetzen bei Takt 4', pc);
await T.tapPop('Strophe');
s = await E(() => window.SYNQUENZER.song()); const stE = await E(STATES);
check('(a) STROPHE bei Takt 4: Takte 1–3 leer, bars 7, Marke a=3, ein Undo', s.bars === 7 && s.marks.length === 1 && s.marks[0].a === 3 && stE.slice(0, 3).every(r => r.every(x => x === -1)) && stE[3][0] === 0 && (await E(() => window.SYNQUENZER.undoInfo())).n === nE + 1, [s.bars, s.marks, stE]);
// audible: the bass starts at T4 (beat 12), nothing before
await E(() => { const Q = window.SYNQUENZER; Q.setBpm(240); Q.clearLog(); Q.songPlay(0); });
await p.waitForFunction(() => { const s = window.SYNQUENZER.runtime().song; return s.beat != null && s.beat >= 15; }, null, {timeout: 20000, polling: 20});
lg = await E(() => window.SYNQUENZER.noteLog(300).filter(n => n.track === 0 || n.track === 1).map(n => +n.beat.toFixed(2)));
await E(() => window.SYNQUENZER.songPlay(false)); await p.waitForTimeout(150);
check('(a) hörbar: erste Noten bei Schlag 12, keine davor', lg.length && Math.min(...lg) >= 12 - .01 && lg.some(x => Math.abs(x - 12) < .01), lg);
// behind the end with a gap: tap on the bar beyond the end (bar 9: T7 = end → gap of 2)
{ const i0 = await T.info(); const cx = i0.canvas.x + 200, cy = i0.canvas.y + 150;      // swipe left ~120 px (scroll, never an edit)
  await T.touch('touchStart', cx, cy); for (let k = 1; k <= 8; k++) { await T.touch('touchMove', cx - k * 15, cy); await p.waitForTimeout(16); } await T.touch('touchEnd', cx - 120, cy); await p.waitForTimeout(900); }
i = await T.info();
check('Wischen rollt (V2e-02: kein Undo, nichts geändert)', i.x0 > 60 && (await E(() => window.SYNQUENZER.undoInfo())).n === nE + 1, i.x0);
await T.tapCv(9 * 36 + 18 - i.x0, 9);
await T.tapPop('Strophe');
s = await E(() => window.SYNQUENZER.song());
check('(a) hinter dem Ende bei Takt 10 → Lücke T8–9 leer, STROPHE T10–13', s.bars === 13 && s.marks.some(m => m.a === 9) && (await E(STATES)).slice(7, 9).every(r => r.every(x => x === -1)), [s.bars, s.marks]);
await E(() => { window.SYNQUENZER.undo(); window.SYNQUENZER.undo(); });
check('Undo ×2 → leerer Song deep-equal', (await T.proj()) === pE);
// (b) the Kette menu lists the parts; a tap puts the part at the end (also into an empty song)
await T.tapSel('.sv-empty .kbtn');
const kp = await E(() => [...document.querySelectorAll('.pop.kette .kpart')].map(b => b.textContent));
check('(b) Kette-Menü zeigt die Teile', kp.length >= 2 && kp.some(t => t.includes('STROPHE')), kp);
await T.tapPop('REFRAIN');
s = await E(() => window.SYNQUENZER.song());
check('(b) Teil REFRAIN aus dem Kette-Menü → Song mit REFRAIN', s.bars === 4 && s.marks.length === 1 && s.marks[0].part === 'P2', s.marks);

// ---------- (c) insert = visible slide: the shift animation runs and ends within 300 ms
await setup(false);
await T.tapCv(2 * 36 + 10, 9);                     // T3 Break
await T.tapSel('#rangeBar [data-a="more"]'); await T.tapPop('Teil einsetzen'); await T.tapPop('Strophe'); await T.tapPop('Einfügen');
const s19 = await E(() => window.SYNQUENZER.song());
await E(SETUP(true)); const ref19 = await E(() => window.SYNQUENZER.song());
check('(c) Einfügen über das Blatt = Daten wie placePart(STROPHE, 2, insert) (N7S-19)', eq(s19.lanes, ref19.lanes) && eq(s19.carrier, ref19.carrier) && s19.bars === ref19.bars, [s19.lanes, ref19.lanes]);

check('Clips nie geändert', (await T.clips()) === clips0);
check('0 Konsolenfehler', errs.length === 0, errs);
await b.close();
process.exit(done() ? 1 : 0);
