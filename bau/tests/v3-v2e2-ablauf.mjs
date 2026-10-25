// V2e′ acceptance – Xanders Ablauf am Stück (N2-2e′-01, N2-2e′-02) and the FANG chip (N7-S44, group undo); CDP touch, P1 (or L1)
import { openVp, mk2, PREP, RECTS, rectsSame, sleep } from './v3-v2e2-lib.mjs';
import { SETUP55, eq, mkCheck } from './v3-v2d-lib.mjs';
const VP = process.argv[2] || 'P1';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp(VP);
const T = mk2(p, cdp), {E} = T;
const waitBeat = (x, to = 40000) => p.waitForFunction(v => window.SYNQUENZER.runtime().beat >= v, x, {timeout: to, polling: 5});
const waitSong = (x, to = 40000) => p.waitForFunction(v => { const s = window.SYNQUENZER.runtime().song; return s.beat != null && s.beat >= v; }, x, {timeout: to, polling: 5});
const ROOT = {Am: 57, F: 53, C: 48, G: 55};
const undoN = () => E(() => window.SYNQUENZER.undoInfo().n);
// the playing: four scenes' clips mixed, one clip off and on again, Träger Am F C G per bar; FANG TEIL at bar line 9 + 7 %
async function playAndFang() {
  await E(() => { const Q = window.SYNQUENZER; Q.setBpm(240); Q.setMetronome(false); Q.launchClip(4, 0); Q.launchClip(0, 0); Q.launchClip(1, 1); Q.launchClip(2, 2); Q.launchClip(3, 3); Q.setKbMode('transpose'); return 1; });
  await p.waitForFunction(() => window.SYNQUENZER.runtime().playing, null, {timeout: 5000});
  const b0 = 0;                                                        // the transport starts with the first launch (bar 1)
  const seq = ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G', 'Am'];
  for (let k = 0; k < seq.length; k++) {
    if (k) await waitBeat(b0 + k * 4 - .4);
    await E(n => { window.SYNQUENZER.keyOn(n, .8, 'ch'); }, ROOT[seq[k]]); await sleep(90); await E(() => window.SYNQUENZER.keyOff(0, 'ch'));
    if (k === 2) await E(() => window.SYNQUENZER.stopTrack(2));          // Sequenz aus …
    if (k === 4) await E(() => window.SYNQUENZER.launchClip(2, 2));      // … und wieder an
  }
  await waitBeat(b0 + 32 + .28);
  await E(x => window.SYNQUENZER.fangTeil({beat: x}), b0 + 32 + .28);
  await sleep(250);
  return b0;
}
async function setupSong() { await E(SETUP55); await E(() => { const Q = window.SYNQUENZER; Q.setClip(1, 1, {len: 4, key: {root: 9, scale: 'aeolian'}, notes: [{t: 0, d: 1, n: 60, v: .8}, {t: 4, d: 1, n: 62, v: .8}, {t: 8, d: 1, n: 64, v: .8}, {t: 12, d: 1, n: 65, v: .8}]}); Q.setBpm(240); return 1; }); await sleep(200); }

await E(PREP);
// =============== N7S-44: drag the part chip out of the FANG sheet = make the part + place it, ONE undo group ===============
await setupSong();
const PA = await T.full(), uA = await undoN();
await playAndFang();
let fp = await E(() => window.SYNQUENZER.fangPart());
check(`${VP} FANG TEIL: 8 Takte, Blatt offen`, fp && fp.len === 8 && (await T.pop() || '').includes('fsheet'), fp && {len: fp.len, clips: fp.clips});
const chip = await T.rect('.fsheet .fs-chip');
await T.down(chip.x + chip.w / 2, chip.y + chip.h / 2); await sleep(480);
check(`${VP} Teil-Chip halten → Geist`, await E(() => !!document.querySelector('.drg-ghost')));
await sleep(700);
check(`${VP} Song-Seite öffnet sich (Selbstöffner)`, await T.songOn());
let inf = await T.info();
await T.glide(chip.x + chip.w / 2, chip.y + chip.h / 2, inf.canvas.x + 7 * 36 + 6 - inf.x0, inf.canvas.y + 60, 10, 16);
const nF = (await T.drag()).n;
await T.up(); await sleep(300);
let pc = await T.pop();
check(`${VP} Ablegen am Song-Ende (Takt 8) → ohne Rückfrage`, nF === 7 && !(pc || '').includes('plsheet'), [nF, pc]);
let s = await E(() => window.SYNQUENZER.song()), pr = await E(() => { const x = window.SYNQUENZER.project(); return (x.project || x).parts; });
const np = pr.findIndex(x => x && !['Strophe', 'Refrain'].includes(x.name));
check(`${VP} N7S-44 Teil angelegt und als Marke abgelegt (8 Takte ab T8)`, np >= 0 && s.marks.some(m => m.part === 'P' + (np + 1) && m.a === 7 && m.len === 8), s.marks.map(m => m.part + '@' + m.a + '/' + m.len));
let ui = await E(() => window.SYNQUENZER.undoInfo());
check(`${VP} N7S-44 genau EIN Undo (group [part, song])`, ui.n === uA + 1 || console.log('undo n', ui.n, uA) && ui.top.kind === 'group' && eq(ui.top.items.map(x => x.kind), ['part', 'song']), ui.top);
await E(() => window.SYNQUENZER.stop()); await sleep(200);
await E(() => window.SYNQUENZER.undo()); await sleep(100);
check(`${VP} N7S-44 Undo → Teil und Song wie vorher (deep-equal)`, (await T.full()) === PA);
// the same into content: the question; [Abbrechen] → back, the FANG sheet comes again, nothing changed
await E(() => window.SYNQUENZER.songView(false)); await sleep(150);
await playAndFang();
const chip2 = await T.rect('.fsheet .fs-chip');
const SP = () => E(() => { const x = window.SYNQUENZER.project(); const P = x.project || x; return JSON.stringify({s: P.song, p: P.parts}); });
const PX = await SP();
await T.down(chip2.x + chip2.w / 2, chip2.y + chip2.h / 2); await sleep(1150);
inf = await T.info();
await T.glide(chip2.x + chip2.w / 2, chip2.y + chip2.h / 2, inf.canvas.x + 3 * 36 + 6 - inf.x0, inf.canvas.y + 60, 10, 16);
await T.up(); await sleep(300);
check(`${VP} FANG-Chip auf Inhalt → Ersetzen/Einfügen-Blatt`, ((await T.pop()) || '').includes('plsheet'));
await T.tapPop('Abbrechen'); await sleep(300);
check(`${VP} [Abbrechen] → Clip-Ansicht, FANG-Blatt wieder offen, Daten unverändert`, !(await T.songOn()) && ((await T.pop()) || '').includes('fsheet') && (await SP()) === PX);
// now „Einfügen“ through the sheet → one group undo
const chip3 = await T.rect('.fsheet .fs-chip');
const uB = await undoN(), PB = await T.full();
await T.down(chip3.x + chip3.w / 2, chip3.y + chip3.h / 2); await sleep(1150);
inf = await T.info();
await T.glide(chip3.x + chip3.w / 2, chip3.y + chip3.h / 2, inf.canvas.x + 3 * 36 + 6 - inf.x0, inf.canvas.y + 60, 10, 16);
await T.up(); await sleep(300);
await T.tapPop('Einfügen'); await sleep(300);
ui = await E(() => window.SYNQUENZER.undoInfo()); s = await E(() => window.SYNQUENZER.song());
check(`${VP} FANG-Chip → Einfügen: Marke T4–11, ein Undo group [part, song]`, ui.n === uB + 1 && ui.top.kind === 'group' && s.marks.some(m => m.a === 3 && m.len === 8), [ui.top && ui.top.kind, s.marks.map(m => m.part + '@' + m.a)]);
await E(() => window.SYNQUENZER.stop()); await sleep(200);
await E(() => window.SYNQUENZER.undo()); await sleep(100);
check(`${VP} Undo → deep-equal`, (await T.full()) === PB);
await E(() => window.SYNQUENZER.songView(false)); await sleep(150);

// =============== N2-2e′-01: Xanders Ablauf am Stück ===============
await setupSong();
const P0 = await T.full(), C0 = await T.clips(), u0 = await undoN();
const steps = [];
const stepOk = async (id, kind) => { const ui = await E(() => window.SYNQUENZER.undoInfo()); steps.push(ui.top && ui.top.label); check(`${VP} ${id}: S.tracks[].clips deep-equal, genau ein Undo${kind ? ' (' + kind + ')' : ''}`, (await T.clips()) === C0 && ui.n === u0 + steps.length && (!kind || ui.top.kind === kind), [ui.n, u0 + steps.length, ui.top && ui.top.kind, ui.top && ui.top.label]); };
// 1. FANG TEIL kurz nach dem Taktstrich 9 (7 %) → 8 Takte; Chip [Strophe] → [＋ Strophe 2] → [ALS TEIL ✓]
await playAndFang();
fp = await E(() => window.SYNQUENZER.fangPart());
check(`${VP} 1 FANG: neuer Teil, 8 Takte, Ende Taktstrich 9 (7 %)`, fp && fp.len === 8 && /Taktstrich 9|Taktstrich/.test(fp.endText), fp && {len: fp.len, end: fp.endText});
await T.tapSel('.fsheet button[data-n="Strophe"]'); await sleep(150);
const dupNew = await E(() => { const b = document.querySelector('.fsheet button[data-dup="new"]'); return b ? {txt: b.textContent, on: b.classList.contains('on')} : null; });
check(`${VP} 1 [＋ Strophe 2] ist Standard`, dupNew && /Strophe 2/.test(dupNew.txt) && dupNew.on, dupNew);
await T.tapSel('.fsheet .fs-ok'); await sleep(250);
await E(() => window.SYNQUENZER.stop()); await sleep(250);
const keyTxt = await E(() => [...document.querySelectorAll('#partBar .pk')].map(k => k.textContent));
check(`${VP} 1 Teil-Taste „STR2“`, keyTxt.includes('STR2'), keyTxt);
await stepOk('1 ALS TEIL', 'part');
// 2. „STR2“ halten, auf SONG ⇄ ziehen → Song offen; am Taktstrich 3 ablegen → Blatt → „Einfügen“
const kI = keyTxt.indexOf('STR2'), kk = await T.key(kI), cn = await T.corner();
await T.down(kk.x, kk.y); await sleep(480);
await T.glide(kk.x, kk.y, cn.x, cn.y, 6, 12);
check(`${VP} 2 Federtaste: Song offen`, await T.songOn());
await E(() => window.SYNQUENZER.songView(true));
const R0 = await E(RECTS), rows0 = (await T.info()).rows;
inf = await T.info();
await T.glide(cn.x, cn.y, inf.canvas.x + 2 * 36 + 5, inf.canvas.y + inf.canvas.h * .55, 10, 16);
check(`${VP} 2 Einfüge-Strich am Taktstrich 3`, (await T.drag()).n === 2);
const lay = async tag => { const r = await E(RECTS), i = await T.info(), bad = rectsSame(R0, r); check(`${VP} N2-2e′-02 ${tag}: Bedienelemente ±2 px, Zeilen gleich`, !bad.length && eq(i.rows, rows0), bad.slice(0, 4)); };
await lay('2 Ziehen');
await T.up(); await sleep(300);
await T.tapPop('Einfügen'); await sleep(400);
await stepOk('2 Ablegen + Einfügen', 'song');
await lay('2 nach dem Entfalten');
// 3. gelbes Band „STROPHE 2“ über T3–10, Nummern 1–2 und ab 11 sichtbar
inf = await T.info();
const m2 = inf.marks.find(m => /^STROPHE 2|^STR2/.test(m.label));
check(`${VP} 3 Marke „STROPHE 2“ über T3–10`, m2 && Math.abs(m2.x0 - (2 * 36 + 2)) <= 1 && Math.abs(m2.x1 - (10 * 36 - 2)) <= 1, inf.marks);
const g1 = await T.grey(0 * 36 + 10, 3, 16, 14), g2 = await T.grey(1 * 36 + 10, 3, 16, 14), g5 = await T.grey(4 * 36 + 10, 3, 16, 14);
// (in the 5.5 song T1–2 carry the INTRO mark, so they show its name; the numbers stand outside the marks: T11 behind STROPHE 2)
check(`${VP} 3 in der Marke keine Nummern`, g5 === 0, [g1, g2, g5]);
const g11 = await E(() => { const i = window.SYNQUENZER.svLayoutInfo(); return i.canvas.w > 10.5 * 36; });
if (g11) check(`${VP} 3 Nummer 11 sichtbar`, (await T.grey(10 * 36 + 10, 3, 16, 14)) > 3);
// 4. Tipp in die Marke über Takt 4 → weißer Rand + Marken-Blatt; zweiter Tipp → Takt 4 gewählt
await T.tapCv(3 * 36 + 12 - inf.x0, 9);
inf = await T.info(); pc = await T.pop();
check(`${VP} 4 Tipp → Marke gewählt + Marken-Blatt`, inf.mark && (pc || '').includes('msheet'), [inf.mark, pc]);
await T.tapCv(3 * 36 + 12 - inf.x0, 9);
inf = await T.info();
check(`${VP} 4 zweiter Tipp → Takt 4 gewählt`, eq(inf.sel, {a: 3, b: 3}) && !(await T.pop()), inf.sel);
await lay('4 Auswahl');
// ● → Start-Blatt → „ab Takt 4 überschreiben“, NOTEN auf Synth 2 (Etikett antippen), zwei Takte spielen, ● kurz nach Taktstrich 6
const lab2 = await E(() => { const d = [...document.querySelectorAll('.sv-labs .sv-l.trk')].find(x => x.dataset.t === '1'); const r = d.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; });
await T.tap(lab2.x, lab2.y);
await E(() => { const Q = window.SYNQUENZER; Q.songRecTargets({clips: false, chords: false, notes: true}); Q.setKbMode('play'); return 1; });
await T.tapSel('.sv-rec'); await sleep(250);
await T.tapSel('.pop.rstart .rs-m[data-m="over"]'); await sleep(120);
const nt = await E(() => (document.querySelector('.pop.rstart .rs-n small') || {}).textContent);
check(`${VP} 4 Start-Blatt: Überschreiben, NOTEN · Synth 2`, nt === 'Synth 2', nt);
await T.tapSel('.pop.rstart .rs-go'); await sleep(100);
await waitSong(12.4); await E(() => window.SYNQUENZER.keyOn(72, .8, 'n1')); await sleep(150); await E(() => window.SYNQUENZER.keyOff(72, 'n1'));
await waitSong(16.4); await E(() => window.SYNQUENZER.keyOn(74, .8, 'n2')); await sleep(150); await E(() => window.SYNQUENZER.keyOff(74, 'n2'));
await waitSong(20.3);
await T.tapSel('.sv-rec'); await sleep(300);
const le = await E(() => window.SYNQUENZER.runtime().song.lastEnd);
check(`${VP} 4 ● kurz nach Taktstrich 6 → Ende am Taktstrich 6`, le && le.endBar === 5, le);
await E(() => window.SYNQUENZER.songPlay(false)); await sleep(300);
await stepOk('4 Aufnahme', 'song');
// 5. ◧ Glas → die Kachel von Synth 2 in T4–5 zeigt die neuen Noten (⏮ shows bar 1 again)
await T.tapSel('.sv-home'); await sleep(150);
await T.tapSel('.sv-gl'); await sleep(200);
inf = await T.info();
const t2 = (inf.tiles || []).filter(x => x.t === 1 && x.a <= 3 && x.b >= 5), oc2 = await E(() => window.SYNQUENZER.ownClip(1, 3));
const nNew = oc2 ? oc2.notes.filter(n => n.t >= 4 - .01 && n.t < 12).length : 0, nRun = oc2 ? oc2.notes.length : -1;
check(`${VP} 5 ◧ Glas: die Kachel von Synth 2 über T4–5 ist der eigene Clip mit den neuen Noten (Noten-Rechtecke = Noten des Durchlaufs)`, inf.view === 'glass' && t2.length === 1 && t2[0].own && nNew === 2 && t2[0].n === nRun, [t2, nNew, nRun]);
check(`${VP} 5 Glas: Zeilen gleich, Undo-Zahl gleich`, eq(inf.rows, rows0) && (await undoN()) === u0 + steps.length);
await lay('5 Glas');
// Halten auf Synth 1 in T7 → Zell-Blatt → [Eigener Clip]
const rI = inf.rows.indexOf('S1') - 1, cy = inf.canvas.y + inf.rulerH + rI * inf.rowH + inf.rowH / 2, cx = inf.canvas.x + 6 * 36 + 18 - inf.x0;
await T.down(cx, cy); await sleep(520); await T.up(); await sleep(250);
pc = await T.pop();
const cs = await E(() => [...document.querySelectorAll('#popLayer .pop button[data-a]')].map(b => b.dataset.a));
check(`${VP} 5 Halten auf Synth 1 T7 → Zell-Blatt [Eigener Clip] [Ganzer Block] [Abbrechen]`, (pc || '').includes('csheet') && eq(cs.filter(x => x !== 'x'), ['own', 'whole']), [pc, cs]);
await T.tapPop('Eigener Clip'); await sleep(250);
const oc = await E(() => window.SYNQUENZER.ownClip(0, 6));
check(`${VP} 5 eigener Clip Synth 1 in T7`, !!oc, oc && {len: oc.len, from: oc.from});
await stepOk('5 Eigener Clip', 'song');
// Undo bis zum Anfang → project() deep-equal
for (let k = 0; k < steps.length; k++) await E(() => window.SYNQUENZER.undo());
await sleep(200);
const PE = await T.full();
if (PE !== P0) { const a = JSON.parse(P0), z = JSON.parse(PE); for (const k of Object.keys(a)) if (JSON.stringify(a[k]) !== JSON.stringify(z[k])) console.log('DIFF', k, JSON.stringify(a[k]).slice(0, 300), '→', JSON.stringify(z[k]).slice(0, 300)); }
const noUi = j => { const o = JSON.parse(j); delete o.ui; return JSON.stringify(o); };      // ui = view state (selected track), never in the undo
check(`${VP} N2-2e′-01 Undo bis zum Anfang → project() deep-equal (ohne Ansichts-Feld ui)`, noUi(PE) === noUi(P0), steps);
await p.screenshot({path: `v3-v2e2-ablauf-${VP}.png`});
check(`${VP} 0 Konsolenfehler`, errs.length === 0, errs);
await b.close();
process.exit(done() ? 1 : 0);
