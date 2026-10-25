// QA G-P2a: Xander's songwriting flow end to end (P1, CDP touch): FANG TEIL ×2 → drag parts into the song (spring key, self-open,
// insert sheet) → ▶ SONG listen → ◧ glass → hold cell → own clip → ROLLE edit → mark sheet ×2 → ● overdub bar → undo all / redo all
import {open, OUT, sleep, check, done, eq, diff} from './v3-qa-gp2a-lib.mjs';
import {fangRun} from './v3-qa-gp2a-parts.mjs';
import fs from 'fs';
const VP = process.argv[2] || 'P1';
const VPS = {P1: [390, 844], P2: [375, 667], L1: [844, 390]};
const T = await open({mic: false, viewport: {width: VPS[VP][0], height: VPS[VP][1]}}); const {p, E, errs} = T;
await E(() => { SYNQUENZER.setBpm(160); SYNQUENZER.setMetronome(false); });
const C00 = await T.clips();
const hist = [];   // [label, full project after the step]
const P_START = await T.full(), U0 = await T.undoN();
const step = async (label, kind) => { const u = await T.undoTop(), n = await T.undoN(); hist.push([label, await T.full()]); check(`${VP} ${label}: genau ein Undo${kind ? ' (' + kind + ')' : ''}, Szenen-Clips deep-equal`, n === U0 + hist.length && (!kind || (u && u.kind === kind)) && (await T.clips()) === C00, {n, want: U0 + hist.length, top: u}); };
const marks = () => E(() => { const s = SYNQUENZER.song(); return s ? s.marks.map(m => (SYNQUENZER.parts()[+m.part.slice(1) - 1] || {}).name + '@' + (m.a + 1) + '+' + m.len + (m.name ? '"' + m.name + '"' : '')) : []; });
// ---------- 1. two parts from playing (FANG TEIL) ----------
const r1 = await fangRun(T, 1, ['Am', 'F', 'C', 'G']);
check(`${VP} 1 FANG TEIL Strophe: 4 Takte Am F C G`, r1.fp && r1.fp.len === 4 && r1.fp.name === 'Strophe', r1.fp);
await E(() => SYNQUENZER.stop()); await sleep(400);
await step('1 ALS TEIL Strophe', 'part');
const r2 = await fangRun(T, 2, ['F', 'G', 'Am', 'E']);
check(`${VP} 1 FANG TEIL Refrain: 4 Takte F G Am E`, r2.fp && r2.fp.len === 4 && r2.fp.name === 'Refrain', r2.fp);
await E(() => SYNQUENZER.stop()); await sleep(400);
await step('1 ALS TEIL Refrain', 'part');
const keys = await E(() => [...document.querySelectorAll('#partBar .pk')].map(k => k.textContent.trim()));
check(`${VP} 1 Teil-Tasten STROPHE, REFRAIN`, keys[0] === 'STROPHE' && keys[1] === 'REFRAIN', keys);
// ---------- 2. STROPHE onto SONG ⇄ (spring) → empty song → bar 1, no question ----------
const keyAt = j => E(j => { const k = document.querySelectorAll('#partBar .pk')[j]; const r = k.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2}; }, j);
let k0 = await keyAt(0), cn = await T.rect('.corner.sw');
await T.down(k0.cx, k0.cy); await sleep(480);
const lifted = await E(() => ({ghost: !!document.querySelector('.drg-ghost'), corner: document.querySelector('.corner.sw').textContent.trim()}));
check(`${VP} 2 Halten → Geist, SONG ⇄ zeigt „↖ … SONG“`, lifted.ghost && /SONG/.test(lifted.corner) && /↖/.test(lifted.corner), lifted);
await T.glide(k0.cx, k0.cy, cn.cx, cn.cy, 8, 16);
check(`${VP} 2 Federtaste: Song offen`, await T.songOn());
let inf = await T.info();
await T.glide(cn.cx, cn.cy, inf.canvas.x + 4, inf.canvas.y + 80, 10, 16);
await T.up(); await sleep(500);
check(`${VP} 2 leerer Song: Ablegen ohne Rückfrage, Marke Strophe T1–4`, !(await T.pop()) && eq(await marks(), ['Strophe@1+4']), [await T.pop(), await marks()]);
await step('2 Strophe in den Song', 'song');
// ---------- 3. back to CLIPS, hold REFRAIN still → song opens by itself (≈1050 ms), then move to bar line 5 ----------
await T.tapSel('.sv-sw'); await sleep(300);
check(`${VP} 3 CLIPS ⇄ → Clip-Ansicht`, !(await T.songOn()));
k0 = await keyAt(1);
await T.down(k0.cx, k0.cy); const tD = Date.now(); await sleep(400);
let opened = false; while (Date.now() - tD < 1600) { if (await T.songOn()) { opened = true; break; } await sleep(10); }
const tOpen = Date.now() - tD;
check(`${VP} 3 Selbstöffner: Song offen nach ≈1050 ms ohne Bewegung`, opened && tOpen >= 980 && tOpen <= 1250, tOpen);
inf = await T.info();
const xEnd = inf.canvas.x + 4 * 36 - inf.x0 + 3;
await T.glide(k0.cx, k0.cy, xEnd, inf.canvas.y + 120, 12, 16);
const dr = (await T.info()).drag;
check(`${VP} 3 Einfüge-Strich am Taktstrich 5 (Song-Ende)`, dr && dr.n === 4, dr);
await T.up(); await sleep(500);
check(`${VP} 3 am Ende: ohne Rückfrage angehängt (Refrain T5–8)`, !(await T.pop()) && eq(await marks(), ['Strophe@1+4', 'Refrain@5+4']), [await T.pop(), await marks()]);
await step('3 Refrain ans Ende', 'song');
// ---------- 4. STROPHE again, into the middle (bar line 3) → sheet → Einfügen ----------
await T.tapSel('.sv-sw'); await sleep(300);
k0 = await keyAt(0); cn = await T.rect('.corner.sw');
await T.down(k0.cx, k0.cy); await sleep(480);
await T.glide(k0.cx, k0.cy, cn.cx, cn.cy, 8, 16);
inf = await T.info();
await T.glide(cn.cx, cn.cy, inf.canvas.x + 2 * 36 - inf.x0 + 4, inf.canvas.y + 100, 10, 16);
check(`${VP} 4 Einfüge-Strich am Taktstrich 3`, ((await T.info()).drag || {}).n === 2, (await T.info()).drag);
await T.up(); await sleep(400);
const pt = await T.popTexts();
check(`${VP} 4 auf Inhalt → Blatt [ersetzen] [Einfügen] [Abbrechen]`, ((await T.pop()) || '').includes('plsheet') && pt.some(t => /ersetzen/.test(t)) && pt.some(t => /Einfügen/.test(t)) && pt.some(t => /Abbrechen/.test(t)), pt);
await T.tapPop(/^Einfügen/); await sleep(600);
const mk4 = await marks();
check(`${VP} 4 Einfügen: Strophe geteilt, neue Strophe T3–6, Refrain T11–14 (12 Takte)`, (await E(() => SYNQUENZER.song().bars)) === 12 && mk4.includes('Strophe@3+4') && mk4.includes('Refrain@9+4'), mk4);
await step('4 Strophe einfügen', 'song');
await T.shot('flow-' + VP + '-song');
fs.writeFileSync(OUT + 'flow-' + VP + '-proj4.json', JSON.stringify(await E(() => SYNQUENZER.project())));
// ---------- 5. ▶ SONG: listen, every bar plays its scene clips and its chord ----------
const S = await E(() => SYNQUENZER.song());
fs.writeFileSync(OUT + 'flow-' + VP + '-song.json', JSON.stringify(S));
await T.tapSel('.sv-home'); await sleep(100);
await E(() => SYNQUENZER.clearLog());
await T.tapSel('.sv-play'); await sleep(100);
await p.waitForFunction(() => { const s = SYNQUENZER.runtime().song; return s.beat != null && s.beat >= 47.6; }, null, {timeout: 60000, polling: 10});
const log = await E(() => SYNQUENZER.noteLog(2000));
const tl = await E(() => SYNQUENZER.timeline().filter(e => e.beat != null).map(e => [+e.beat.toFixed(2), e.name]));
await T.tapSel('.sv-play'); await sleep(300);
// expected per bar (song bar → part bar): S S | S S S S | S S | R R R R
const exp = await E(() => { const s = SYNQUENZER.song(); const out = []; for (let b = 0; b < s.bars; b++) out.push(s.lanes.map(l => { let x = -1; for (const e of l) { if (e.bar > b) break; x = e.own ? 'o' : e.slot; } return x; })); return out; });
const sb = log.length ? Math.min(...log.map(n => n.beat)) : 0;
const perBar = []; for (let b = 0; b < 12; b++) { const ns = log.filter(n => n.beat >= b * 4 - .01 && n.beat < b * 4 + 4 - .01); perBar.push([...new Set(ns.map(n => n.track))].sort().join('')); }
console.log('log sample', JSON.stringify(log.slice(0, 3)));
console.log('lanes per bar', JSON.stringify(exp));
console.log('tracks per bar', JSON.stringify(perBar));
console.log('timeline', JSON.stringify(tl.slice(-14)));
fs.writeFileSync(OUT + 'flow-' + VP + '-log.json', JSON.stringify({log, tl}));
const bad = []; for (let b = 0; b < 12; b++) for (let t = 0; t < exp[b].length; t++) { if (t === 3 || t === 5) continue; const want = exp[b][t] !== -1; const clip = want ? await E(([t, s]) => { const c = SYNQUENZER.getClip(t, s); return c && c.notes && c.notes.length; }, [t, exp[b][t]]) : 0; const has = perBar[b].includes(String(t)); if (!!clip !== has) bad.push(`T${b + 1} track ${t}: expected ${!!clip} got ${has}`); }
check(`${VP} 5 ▶ SONG: in jedem Takt spielen genau die Spuren mit Clip`, bad.length === 0, bad.slice(0, 8));

// ---------- 6. ◧ Glas: view only ----------
console.log('x0 after play', (await T.info()).x0);
await T.tapSel('.sv-home'); await sleep(200);
const uG = await T.undoN(), PG = await T.full();
await T.tapSel('.sv-gl'); await sleep(250);
inf = await T.info();
check(`${VP} 6 ◧ Glas: Ansicht glass, Kacheln, kein Undo, keine Daten`, inf.view === 'glass' && inf.tiles && inf.tiles.length >= 10 && (await T.undoN()) === uG && (await T.full()) === PG, {view: inf.view, tiles: inf.tiles && inf.tiles.length});
// ---------- 7. hold SYN 2 in T6 → cell sheet → own clip; tap → ROLLE, draw a note ----------
let c = await T.cell('S2', 5);
await T.down(c.x, c.y); await sleep(520); await T.up(); await sleep(300);
const cs = await T.popTexts();
check(`${VP} 7 Halten → Zell-Blatt [Eigener Clip] [Ganzer Block] [Abbrechen]`, ((await T.pop()) || '').includes('csheet') && cs.some(t => /^Eigener Clip/.test(t)) && cs.some(t => /^Ganzer Block/.test(t)), cs);
await T.tapPop(/Eigener Clip/); await sleep(300);
check(`${VP} 7 Toast nennt eigenen Clip mit [Bearbeiten] [Rückgängig]`, /eigener Clip.*Bearbeiten.*Rückgängig/.test(await T.toast() || ''), await T.toast());
await step('7 Eigener Clip T6 Synth 2', 'song');
inf = await T.info();
const tileOwn = (inf.tiles || []).find(x => x.t === 1 && x.a === 5);
check(`${VP} 7 Glas: Kachel Synth 2 T6 ist „eigen“`, tileOwn && tileOwn.own, tileOwn);
await T.tap(c.x, c.y); await sleep(500);
check(`${VP} 7 Tipp auf eigenen Clip → ROLLE offen („eigener Clip“)`, await E(() => { const r = document.querySelector('.sheet.ed.roll'); return !!(r && r.classList.contains('open') && /eigener Clip/.test(r.textContent)); }));
const nOwn0 = await E(() => SYNQUENZER.ownClip(1, 5).notes.length);
await T.tap(125, VP === 'P1' ? 380 : 300); await sleep(300);
const ownAfter = await E(() => SYNQUENZER.ownClip(1, 5).notes);
const newNote = ownAfter.find(n => !(Math.abs(n.t * 4 - Math.round(n.t * 4)) < 1e-6 && [60, 64, 67, 72, 76].includes(n.n)));
check(`${VP} 7 ROLLE: Note gezeichnet (+1)`, ownAfter.length === nOwn0 + 1, {n: ownAfter.length, newNote});
await step('7 Note im eigenen Clip', 'own');
await T.tapTxt('button', /^✕$/); await sleep(400);
check(`${VP} 7 ✕ schließt ROLLE, Song-Ansicht bleibt`, (await T.songOn()) && !(await E(() => document.querySelector('.sheet.ed.roll').classList.contains('open'))));
// ---------- 8. mark sheet: STROPHE (T3–6) ×2 ----------
await T.tapSel('.sv-gl'); await sleep(200);   // back to ▦
await T.tapSel('.sv-home'); await sleep(200);
inf = await T.info();
await T.tap(inf.canvas.x + 3 * 36 + 12 - inf.x0, inf.canvas.y + 9); await sleep(300);
check(`${VP} 8 Tipp auf Marke → Marken-Blatt`, ((await T.pop()) || '').includes('msheet'));
await T.tapPop(/^×2$/); await sleep(400);
check(`${VP} 8 ×2 → 16 Takte`, (await E(() => SYNQUENZER.song().bars)) === 16, await marks());
await step('8 Strophe ×2', 'song');
if (await T.pop()) { await T.tapTxt('#popLayer .pop button', /^✕$/); await sleep(200); }
// ---------- 9. select SYN 2, bar 2 yellow, ● → Overdub nur Takt 2, NOTEN Synth 2 ----------
const lab2 = await E(() => { const d = [...document.querySelectorAll('.sv-labs .sv-l.trk')].find(x => x.dataset.t === '1'); const r = d.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; });
await T.tap(lab2.x, lab2.y);
inf = await T.info();
await T.tap(inf.canvas.x + 1 * 36 + 18 - inf.x0, inf.canvas.y + 9); await sleep(300);
if ((await T.info()).mark) { await T.tap(inf.canvas.x + 1 * 36 + 18 - inf.x0, inf.canvas.y + 9); await sleep(300); }
const dbg = async t => { const i = await T.info(); console.log('DBG', t, JSON.stringify({sel: i.sel, mark: i.mark, pos: i.pos, x0: i.x0, pop: await T.pop(), toast: await T.toast()})); };
await dbg('before rec');
check(`${VP} 9 Takt 2 gelb gewählt`, eq((await T.info()).sel, {a: 1, b: 1}), (await T.info()).sel);
await dbg('before rec 2'); await T.shot('flow-' + VP + '-beforerec');
await T.tapSel('.sv-rec'); await sleep(300);
await dbg('after rec');
const rsT = await T.popTexts();
check(`${VP} 9 Start-Blatt: NOTEN · Synth 2, 4 Modi`, rsT && rsT.some(t => /NOTEN.*Synth 2/.test(t)) && ['Überschreiben', 'Einfügen', 'Ersetzen', 'Overdub'].every(m => rsT.some(t => t.startsWith(m))), rsT);
// targets: only NOTEN
for (const nm of ['CLIPS', 'AKKORDE']) { const on = await E(n => { const b = [...document.querySelectorAll('.pop.rstart .rs-t')].find(b => b.textContent.trim().replace('✓', '') === n); return b && b.classList.contains('on'); }, nm); if (on) await T.tapTxt('.pop.rstart .rs-t', new RegExp(nm)); }
await T.tapSel('.pop.rstart .rs-m[data-m="overdub"]'); await sleep(100);
await T.tapSel('#segPlay').catch(() => 0);
await T.tapSel('.pop.rstart .rs-go'); await sleep(100);
// played notes in bar 2 (song beats 4..8): 79 and 81
const waitSong = x => p.waitForFunction(v => { const s = SYNQUENZER.runtime().song; return s.beat != null && s.beat >= v; }, x, {timeout: 60000, polling: 5});
await E(() => { if (SYNQUENZER.runtime().kbMode !== 'play') SYNQUENZER.setKbMode('play'); });
await waitSong(4.95); await E(() => SYNQUENZER.keyOn(79, .8, 'r1')); await sleep(120); await E(() => SYNQUENZER.keyOff(79, 'r1'));
await waitSong(6.95); await E(() => SYNQUENZER.keyOn(81, .8, 'r2')); await sleep(120); await E(() => SYNQUENZER.keyOff(81, 'r2'));
await waitSong(8.6); await sleep(400);
const rr = await E(() => ({rec: SYNQUENZER.runtime().song.rec, recMode: SYNQUENZER.runtime().song.recMode}));
check(`${VP} 9 Aufnahme endet am Bereichsende von selbst`, !rr.rec, rr);
await E(() => SYNQUENZER.songPlay(false)); await sleep(300);
const own2 = await E(() => SYNQUENZER.ownClip(1, 1));
const sc2 = await E(() => SYNQUENZER.getClip(1, 0).notes.length);
check(`${VP} 9 Overdub: eigener Clip Synth 2 T2 = Szenen-Clip + 2 neue Noten`, own2 && own2.notes.length === sc2 + 2, own2 && {n: own2.notes.length, sc: sc2, ns: own2.notes.map(n => n.t + ':' + n.n).join(',')});
await step('9 Overdub Takt 2', 'song');
await T.tapSel('.sv-home'); await sleep(200);
// ---------- 10. ▶ SONG again: own note only in T6, overdub only in T2 ----------
await T.tapSel('.sv-home'); await sleep(100);
await E(() => SYNQUENZER.clearLog());
await T.tapSel('.sv-play'); await sleep(100);
await waitSong(4 * 16 - .5);
const log2 = await E(() => SYNQUENZER.noteLog(3000));
await T.tapSel('.sv-play'); await sleep(300);
const s2 = log2.filter(n => n.track === 1);
const inBar = (b, f) => s2.filter(n => n.beat >= b * 4 - .01 && n.beat < b * 4 + 3.99 && f(n));
const odub = s2.filter(n => (Math.abs(n.beat - 4.95) < .12 && n.out === 79) || (Math.abs(n.beat - 6.95) < .12 && n.out === 81));
const t2n = inBar(1, () => true);
check(`${VP} 10 hörbar: gespielte Noten 79/81 klingen in T2 an ihrer Stelle (src own), T2 = 16 alte + 2 neue`, odub.length === 2 && odub.every(n => n.src === 'own') && t2n.length === 18, {odub: odub.map(n => [n.beat, n.src, n.clipNote, n.out]), t2: t2n.length});
const t10 = inBar(9, () => true);
check(`${VP} 10 ×2 nach dem eigenen Clip: Kopie T10 trägt den eigenen Clip mit (KOPIE inkl. eigener Clips, 17 Noten own)`, t10.length === 17 && t10.every(n => n.src === 'own'), {n: t10.length, src: [...new Set(t10.map(n => n.src))]});
const t6 = inBar(5, n => true), t6src = [...new Set(t6.map(n => n.src))];
check(`${VP} 10 hörbar: T6 Synth 2 spielt den eigenen Clip mit 17 Noten`, t6.length === 17 && eq(t6src, ['own']), {n: t6.length, src: t6src});
const others = [2, 3, 4, 6, 7, 8].map(b => [b + 1, inBar(b, () => true).length, [...new Set(inBar(b, () => true).map(n => n.src))].join()]);
check(`${VP} 10 hörbar: andere Strophe-Takte Synth 2 = Szenen-Clip (16 Noten)`, others.every(([, n, src]) => n === 16 && src === 'clip'), others);
// ---------- 11. undo all the way, redo all the way ----------
const FINAL = await T.full();
let ub = [];
for (let k = hist.length - 1; k >= 0; k--) { await E(() => SYNQUENZER.undo()); await sleep(80); const want = k ? hist[k - 1][1] : P_START, got = await T.full(); if (got !== want) ub.push(hist[k][0] + ': ' + diff(JSON.parse(want), JSON.parse(got)).slice(0, 3).join(' | ')); }
check(`${VP} 11 Undo Schritt für Schritt bis zum Anfang: jeder Zwischenstand deep-equal`, ub.length === 0, ub);
let rb = [];
for (let k = 0; k < hist.length; k++) { await E(() => SYNQUENZER.redo()); await sleep(80); const got = await T.full(); if (got !== hist[k][1]) rb.push(hist[k][0] + ': ' + diff(JSON.parse(hist[k][1]), JSON.parse(got)).slice(0, 3).join(' | ')); }
check(`${VP} 11 Redo Schritt für Schritt: jeder Stand deep-equal`, rb.length === 0, rb);
check(`${VP} 11 nach Redo: Endstand = vor dem Undo`, (await T.full()) === FINAL);
// ---------- 12. save/load roundtrip ----------
const ser = await E(() => SYNQUENZER.serialize ? SYNQUENZER.serialize() : null);
fs.writeFileSync(OUT + 'flow-' + VP + '-final.json', typeof ser === 'string' ? ser : JSON.stringify(ser));
await E(() => SYNQUENZER.newProject({init: true})); await sleep(300);
await E(s => SYNQUENZER.importJSON(typeof s === 'string' ? s : JSON.stringify(s)), ser); await sleep(400);
const RT = await T.full();
const strip = j => { const o = JSON.parse(j); delete o.id; delete o.name; return o; };
const d12 = diff(strip(FINAL), strip(RT));
check(`${VP} 12 Export → Import: Projekt deep-equal (ohne id/name)`, d12.length === 0, d12.slice(0, 6));
// play after import: own clip note in T6
await E(() => { SYNQUENZER.clearLog(); SYNQUENZER.songPlay(0); });
await waitSong(24.5);
const log3 = await E(() => SYNQUENZER.noteLog(3000).filter(n => n.track === 1));
await E(() => SYNQUENZER.songPlay(false)); await sleep(200);
check(`${VP} 12 nach Import: T6 eigener Clip klingt (17 Noten own), T2 Overdub`, log3.filter(n => n.beat >= 20 && n.beat < 24 && n.src === 'own').length === 17 && log3.filter(n => n.beat >= 4 && n.beat < 8 && n.src === 'own').length >= 18, [log3.filter(n => n.beat >= 20 && n.beat < 24).length]);
// reload the page: the app restores the last project from its local store
await E(() => SYNQUENZER.save && SYNQUENZER.save()); await sleep(500);
const before = await T.full();
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version, null, {timeout: 20000}); await sleep(1200);
const after = await T.full();
const d12b = diff(strip(before), strip(after));
check(`${VP} 12 Neu laden: Projekt wiederhergestellt (deep-equal)`, d12b.length === 0, d12b.slice(0, 6));
await T.br.close();
fs.writeFileSync(OUT + 'flow-' + VP + '-hist.json', JSON.stringify(hist));
check(`${VP} 0 Konsolenfehler`, errs.length === 0, errs);
done();
