// QA G-P2a: undo/redo chain over the new actions (FANG chip drag = group, mark drag move, mark ⧉ copy, own clip, ROLLE note,
// [Ganzer Block], [Zurück zum Szenen-Clip], mark sheet ops, Bereich ops, ● replace NOTEN) — every intermediate state deep-equal
import {open, OUT, sleep, check, done, eq, diff} from './vg567-gp2a-lib.mjs';
import {fangRun} from './vg567-gp2a-parts.mjs';
import fs from 'fs';
const T = await open({mic: false}); const {p, E, errs} = T;
const pj = JSON.parse(fs.readFileSync(OUT + 'flow-P1-proj4.json'));
await E(pj => SYNQUENZER.importJSON(JSON.stringify({app: 'SYNQUENZER', kind: 'project', format: 4, project: pj})), pj); await sleep(300);
await E(() => { SYNQUENZER.setBpm(160); SYNQUENZER.setMetronome(false); });
const C0 = await T.clips(), U0 = await T.undoN(), P0 = await T.full();
const hist = [];
const step = async (label, kind) => { const u = await T.undoTop(), n = await T.undoN(); if (n !== U0 + hist.length + 1) { check(`${label}: Aktion ausgeführt`, false, {n, top: u, marks: (await T.info()).marks}); return; } hist.push([label, await T.full(), u]); check(`${label}: ein Undo${kind ? ' (' + kind + ')' : ''}, Szenen-Clips gleich`, n === U0 + hist.length && (!kind || (u && u.kind === kind)) && (await T.clips()) === C0, {n, want: U0 + hist.length, top: u}); };
const marks = () => E(() => SYNQUENZER.song().marks.slice().sort((a, b) => a.a - b.a).map(m => m.id + ':' + (m.name || (SYNQUENZER.parts()[+m.part.slice(1) - 1] || {}).name) + '@' + (m.a + 1) + '+' + m.len));
// 1 FANG chip → drag into the song (end) = group [part, song]
const r = await fangRun(T, 2, ['Dm', 'G', 'C', 'Am'], {ok: false});
check('1 FANG TEIL Blatt offen', ((await T.pop()) || '').includes('fsheet'), r.fp);
const chip = await T.rect('.fsheet .fs-chip');
await T.down(chip.cx, chip.cy); await sleep(1150);
let inf = await T.info();
check('1 FANG-Chip halten → Song offen', await T.songOn());
// edge-scroll to the end: song 12 bars, P1 shows ~8.5 → hold at the right edge
const ex = inf.canvas.x + inf.canvas.w - 8;
await T.glide(chip.cx, chip.cy, ex, inf.canvas.y + 100, 12, 16);
const tEdge = Date.now(); let n0 = (await T.info()).drag.n, nMax = n0;
while (Date.now() - tEdge < 2500) { await sleep(100); const d = (await T.info()).drag; if (d && d.n > nMax) nMax = d.n; if (d && d.n >= 12) break; await T.move(ex + (Date.now() % 2), inf.canvas.y + 100); }
inf = await T.info();
console.log('edge scroll n', n0, '→', nMax, 'x0', inf.x0);
// back off to the exact end bar line 13 (n=12)
const xe = inf.canvas.x + 12 * 36 - inf.x0 + 3;
await T.glide(ex, inf.canvas.y + 100, Math.min(xe, ex - 30), inf.canvas.y + 100, 6, 16);
const dEnd = (await T.info()).drag;
await T.up(); await sleep(500);
if (/plsheet/.test(await T.pop() || '')) { console.log('sheet at', JSON.stringify(dEnd)); await T.tapPop(/^Einfügen/); await sleep(400); }
await E(() => SYNQUENZER.stop()); await sleep(300);
console.log('marks', JSON.stringify(await marks()), 'drop', JSON.stringify(dEnd));
check('1 Rand-Rollen erreicht das Song-Ende, Teil abgelegt', nMax >= 12 && (await E(() => SYNQUENZER.song().bars)) >= 16, {nMax, bars: await E(() => SYNQUENZER.song().bars)});
await step('1 FANG-Chip ziehen', 'group');
await E(() => SYNQUENZER.songView(true)); await sleep(200); await T.tapSel('.sv-home'); await sleep(150);
// 2 own clip by hold (S2 T4) 3 ROLLE note 4 Ganzer Block on S3
let c = await T.cell('S2', 3);
await T.down(c.x, c.y); await sleep(520); await T.up(); await sleep(300); await T.tapPop(/^Eigener Clip/); await sleep(300);
await step('2 eigener Clip', 'song');
await T.tap(c.x, c.y, 500); await T.tap(150, 330, 300);
await step('3 Note im eigenen Clip', 'own');
await T.tapTxt('button', /^✕$/); await sleep(300);
c = await T.cell('S3', 5);
await T.down(c.x, c.y); await sleep(520); await T.up(); await sleep(300); await T.tapPop(/^Ganzer Block/); await sleep(300);
await step('4 Ganzer Block', 'song');
// 5 back to scene clip on S2 T4
c = await T.cell('S2', 3);
await T.down(c.x, c.y); await sleep(520); await T.up(); await sleep(300); await T.tapPop(/Zurück zum Szenen-Clip/); await sleep(300);
await step('5 Zurück zum Szenen-Clip', 'song');
// 6 mark drag move (REFRAIN → bar line 1)
inf = await T.info();
let m = inf.marks.find(x => x.label === 'REFRAIN');
await T.down(inf.canvas.x + m.x0 + 6, inf.canvas.y + 9); await sleep(500); await T.glide(inf.canvas.x + m.x0 + 6, inf.canvas.y + 9, inf.canvas.x + 2, inf.canvas.y + 50, 12, 16); await T.up(); await sleep(500);
await step('6 Marke verschieben', 'song');
// 7 mark ⧉ copy (STROPHE → bar line 9)
await T.tapSel('.sv-home'); await sleep(150);
inf = await T.info(); console.log('marks before 7', JSON.stringify(inf.marks)); m = inf.marks.find(x => x.label === 'STROPHE');
let sx = inf.canvas.x + Math.max(m.x0, 4) + 20, sy = inf.canvas.y + 9;
await T.down(sx, sy); await sleep(500); await T.glide(sx, sy, sx, sy + 30, 4, 16);
const cp = await T.rect('.sv-sw'); await T.glide(sx, sy + 30, cp.cx, cp.cy, 8, 16); await sleep(320);
inf = await T.info(); await T.glide(cp.cx, cp.cy, inf.canvas.x + 4 * 36 - inf.x0 + 3, inf.canvas.y + 120, 12, 16); await T.up(); await sleep(500);
if (/plsheet/.test(await T.pop() || '')) { await T.tapPop(/^Einfügen/); await sleep(300); }
await step('7 Marke ⧉ kopieren', 'song');
// 8–11 mark sheet ops via touch: tap mark → [◀] / [Nur Name weg] / [Farbe] ; ✎ Name nur hier via API
const tapMark = async label => { await T.tapSel('.sv-home'); await sleep(150); const i = await T.info(); const mm = i.marks.find(x => x.label === label) || i.marks.find(x => x.label.startsWith(label.slice(0, 3))) || i.marks[1]; await T.tap(i.canvas.x + Math.max(mm.x0, 4) + 10, i.canvas.y + 9, 300); return mm; };
await tapMark('STROPHE'); await T.tapPop(/^×4$/); await sleep(300); await T.tapTxt('#popLayer .pop button', /^✕$/); await sleep(200);
await step('8 ×4', 'song');
await tapMark('REFRAIN'); await T.tapPop(/^Nur Name weg/); await sleep(300); if (await T.pop()) { await T.tapTxt('#popLayer .pop button', /^✕$/); await sleep(200); }
await step('9 Nur Name weg', 'song');
const mid = await E(() => SYNQUENZER.song().marks.slice().sort((a, b) => a.a - b.a)[1].id);
await E(id => SYNQUENZER.markAction(id, 'rename', {name: 'Brücke'}), mid);
await step('10 Name nur hier', 'song');
await E(id => SYNQUENZER.markAction(id, 'applyAll'), mid);
await step('11 Auf alle übertragen', 'group');
// 12 Bereich: Takte löschen (T2), 13 Als Teil (T1–2)
await E(() => SYNQUENZER.songRange('delete', 1, 1));
await step('12 Takte löschen', 'song');
await E(() => SYNQUENZER.songRange('asPart', 0, 1, {name: 'Intro'}));
await step('13 Als Teil', 'group');
// 14 ● replace NOTEN on Synth 1 bar 3 (API take)
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.setKbMode('play'); SYNQUENZER.songRecRange(2, 2, 'replace', {clips: false, chords: false, notes: true}, {track: 0, preroll: false}); });
await p.waitForFunction(() => SYNQUENZER.runtime().song.beat >= 8.5, null, {timeout: 20000, polling: 5});
await E(() => SYNQUENZER.keyOn(72, .8, 'z')); await sleep(100); await E(() => SYNQUENZER.keyOff(72, 'z'));
await p.waitForFunction(() => !SYNQUENZER.runtime().song.rec, null, {timeout: 20000}).catch(() => 0);
await E(() => SYNQUENZER.songPlay(false)); await sleep(300);
await step('14 ● Ersetzen NOTEN', 'song');
const FINAL = await T.full();
// undo all, redo all
const ub = [];
for (let k = hist.length - 1; k >= 0; k--) { await E(() => SYNQUENZER.undo()); await sleep(60); const want = k ? hist[k - 1][1] : P0, got = await T.full(); if (got !== want) ub.push(hist[k][0] + ': ' + diff(JSON.parse(want), JSON.parse(got)).slice(0, 3).join(' | ')); }
check('U Undo bis zum Anfang: jeder Zwischenstand deep-equal', ub.length === 0, ub);
const rb = [];
for (let k = 0; k < hist.length; k++) { await E(() => SYNQUENZER.redo()); await sleep(60); const got = await T.full(); if (got !== hist[k][1]) rb.push(hist[k][0] + ': ' + diff(JSON.parse(hist[k][1]), JSON.parse(got)).slice(0, 3).join(' | ')); }
check('U Redo bis zum Ende: jeder Stand deep-equal', rb.length === 0, rb);
check('U Endstand = vorher', (await T.full()) === FINAL);
// half undo, then a new action discards the redo branch
for (let k = 0; k < 4; k++) await E(() => SYNQUENZER.undo());
await E(() => SYNQUENZER.songRange('clear', 0, 0));
const rd = await E(() => { const n = SYNQUENZER.undoInfo(); return n.redo != null ? n.redo : (n.redoN != null ? n.redoN : null); });
await E(() => SYNQUENZER.redo()); await sleep(80);
check('U neue Aktion nach Undo verwirft den Redo-Zweig', (await T.undoTop()).label && /geleert/.test((await T.undoTop()).label), {rd, top: await T.undoTop()});
check('U 0 Konsolenfehler', errs.length === 0, errs);
done();
await T.br.close();
