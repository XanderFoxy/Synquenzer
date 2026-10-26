// QA G-P2a gestures on the flow song (P1, CDP touch): own clip back to scene clip, Ganzer Block, mark drag move/copy (⧉),
// drag cancel paths, drag + drop while the song plays, hold cell while playing
import {open, OUT, sleep, check, done, eq, diff} from './vgmk34-gp2a-lib.mjs';
import fs from 'fs';
const T = await open({mic: false}); const {p, E, errs} = T;
const pj = JSON.parse(fs.readFileSync(OUT + 'flow-P1-proj4.json'));
const LOAD = async () => { await E(pj => SYNQUENZER.importJSON(JSON.stringify({app: 'SYNQUENZER', kind: 'project', format: 4, project: pj})), pj); await sleep(300); await E(() => { SYNQUENZER.setBpm(160); SYNQUENZER.songView(true); }); await sleep(250); await T.tapSel('.sv-home'); await sleep(150); };
const marks = () => E(() => { const s = SYNQUENZER.song(); return s ? s.marks.slice().sort((a, b) => a.a - b.a).map(m => (SYNQUENZER.parts()[+m.part.slice(1) - 1] || {}).name + '@' + (m.a + 1) + '+' + m.len) : []; });
await LOAD();
let P0 = await T.full(); const C0 = await T.clips();
// ---- E5 own clip, then hold → [Zurück zum Szenen-Clip]
let c = await T.cell('S1', 3);
await T.down(c.x, c.y); await sleep(520); await T.up(); await sleep(300);
await T.tapPop(/Eigener Clip/); await sleep(300);
check('E5 eigener Clip angelegt', !!(await E(() => SYNQUENZER.ownClip(0, 3))));
await T.down(c.x, c.y); await sleep(520); await T.up(); await sleep(300);
const t5 = await T.popTexts();
check('E5 Halten auf eigenen Clip → [Bearbeiten] [Zurück zum Szenen-Clip] [Ganzer Block]', t5 && t5.some(t => /^Bearbeiten/.test(t)) && t5.some(t => /Zurück zum Szenen-Clip/.test(t)) && t5.some(t => /Ganzer Block/.test(t)), t5);
await T.tapPop(/Zurück zum Szenen-Clip/); await sleep(300);
check('E5 [Zurück zum Szenen-Clip] → Projekt deep-equal zum Start', (await T.full()) === P0, diff(JSON.parse(P0), JSON.parse(await T.full())).slice(0, 4));
// ---- E5b Ganzer Block on Synth 3 (2-bar clip) in T4 → block T3–8 (the Strophe run) one own clip
c = await T.cell('S3', 3);
await T.down(c.x, c.y); await sleep(520); await T.up(); await sleep(300);
const gb = await T.popTexts();
await T.tapPop(/^Ganzer Block/); await sleep(300);
let s = await E(() => SYNQUENZER.song());
console.log('Ganzer Block text', JSON.stringify(gb), 'lanes[2]', JSON.stringify(s.lanes[2]), 'own', JSON.stringify(Object.fromEntries(Object.entries(s.own || {}).map(([k, v]) => [k, v.len]))));
check('E5b [Ganzer Block] → eigene Clips über den Block, Szenen-Clips deep-equal, ein Undo', Object.keys(s.own || {}).length >= 1 && (await T.clips()) === C0, Object.keys(s.own || {}));
await E(() => SYNQUENZER.undo()); await sleep(150);
check('E5b Undo → deep-equal', (await T.full()) === P0);
// ---- E6 mark drag: hold the REFRAIN mark (T9–12), drag to bar line 1 → move
await T.tapSel('.sv-home'); await sleep(150);
let inf = await T.info();
// scroll: REFRAIN starts at x 290 → visible in P1 (canvas w 306)
const mR = inf.marks.find(m => m.label === 'REFRAIN');
const mx = inf.canvas.x + mR.x0 - inf.x0 + 6, my = inf.canvas.y + 9;
await T.down(mx, my); await sleep(500);
await T.glide(mx, my, inf.canvas.x + 2, my + 40, 12, 16);
const d6 = (await T.info()).drag;
await T.up(); await sleep(500);
const pop6 = await T.pop();
console.log('E6 drag', JSON.stringify(d6), 'pop', pop6, JSON.stringify(await T.popTexts()));
if (pop6 && /plsheet/.test(pop6)) { await T.tapPop(/^Einfügen/); await sleep(400); }
const mk6 = await marks();
check('E6 Marke REFRAIN halten + ziehen an Taktstrich 1 → verschoben (Refrain T1–4, Rest rückt), ein Undo song', mk6[0] === 'Refrain@1+4' && (await E(() => SYNQUENZER.song().bars)) === 12 && (await T.undoTop()).kind === 'song' && (await T.clips()) === C0, {mk6, top: await T.undoTop()});
await E(() => SYNQUENZER.undo()); await sleep(150);
check('E6 Undo → deep-equal', (await T.full()) === P0, diff(JSON.parse(P0), JSON.parse(await T.full())).slice(0, 4));
await LOAD(); P0 = await T.full();
// ---- E7 mark drag over ⧉ ≥ 250 ms → copy
inf = await T.info();
const mS = inf.marks.find(m => m.label === 'STROPHE');
const sx = inf.canvas.x + mS.x0 - inf.x0 + 30, sy = inf.canvas.y + 9;
await T.down(sx, sy); await sleep(500);
await T.glide(sx, sy, sx, sy + 30, 4, 16);
const cp = await T.rect('.sv-sw'); console.log('sv-sw text while dragging', cp && cp.t);
console.log('corner while dragging mark', JSON.stringify(cp));
await T.glide(sx, sy + 30, cp.cx, cp.cy, 8, 16); await sleep(320);
const d7a = (await T.info()).drag;
await T.glide(cp.cx, cp.cy, inf.canvas.x + 8 * 36 - inf.x0 + 3, inf.canvas.y + 120, 12, 16);
const d7 = (await T.info()).drag;
await T.up(); await sleep(500);
if (/plsheet/.test(await T.pop() || '')) { await T.tapPop(/^Einfügen/); await sleep(400); }
console.log('E7 drag', JSON.stringify(d7a), JSON.stringify(d7), 'pop', await T.pop());
const mk7 = await marks();
check('E7 Marke über ⧉ ≥ 250 ms → Kopie (Original bleibt)', mk7.filter(x => /^Strophe@3\+4/.test(x)).length === 1 && mk7.filter(x => /\+4$/.test(x) && /^Strophe/.test(x)).length === 2, mk7);
await E(() => SYNQUENZER.undo()); await sleep(150);
check('E7 Undo → deep-equal', (await T.full()) === P0, diff(JSON.parse(P0), JSON.parse(await T.full())).slice(0, 4));
await LOAD(); P0 = await T.full();
// ---- E8 cancel paths: drag the STROPHE key from the clip view and drop on the transport / keyboard → nothing changes
await T.tapSel('.sv-sw'); await sleep(250);
let k0 = await E(() => { const k = document.querySelectorAll('#partBar .pk')[0]; const r = k.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2}; });
await T.down(k0.cx, k0.cy); await sleep(1150);
inf = await T.info();
await T.glide(k0.cx, k0.cy, inf.canvas.x + 100, inf.canvas.y + 100, 8, 16);
const tp = await T.rect('.sv-play');
await T.glide(inf.canvas.x + 100, inf.canvas.y + 100, tp.cx, tp.cy, 8, 16);
await T.up(); await sleep(500);
check('E8 Ablegen auf dem Transport → Abbruch, deep-equal, kein Blatt, Clip-Ansicht', (await T.full()) === P0 && !(await T.pop()) && !(await T.songOn()), {pop: await T.pop(), song: await T.songOn()});
await T.down(k0.cx, k0.cy); await sleep(1150);
await T.glide(k0.cx, k0.cy, 200, 780, 8, 16);
await T.up(); await sleep(500);
check('E8 Ablegen auf der Tastatur → Abbruch, deep-equal', (await T.full()) === P0 && !(await T.pop()), await T.pop());
await T.down(k0.cx, k0.cy); await sleep(1150);
inf = await T.info();
await T.glide(k0.cx, k0.cy, inf.canvas.x + 100, inf.canvas.y + 100, 8, 16);
await T.send('touchCancel', []); await sleep(500);
check('E8 pointercancel → Abbruch, deep-equal', (await T.full()) === P0 && !(await T.pop()));
check('E8 nach Abbrüchen: kein hängender Geist', await E(() => !document.querySelector('.drg-ghost') || getComputedStyle(document.querySelector('.drg-ghost')).display === 'none' || document.querySelector('.drg-ghost').style.opacity === '0'));
// ---- E9 drag + drop while the song plays: REFRAIN key → song end (append), during playback
await E(() => SYNQUENZER.songView(true)); await sleep(200);
await T.tapSel('.sv-home'); await sleep(100);
await E(() => SYNQUENZER.clearLog());
await T.tapSel('.sv-play'); await sleep(300);
await T.tapSel('.sv-sw'); await sleep(250);
k0 = await E(() => { const k = document.querySelectorAll('#partBar .pk')[1]; const r = k.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2}; });
const cn = await T.rect('.corner.sw');
await T.down(k0.cx, k0.cy); await sleep(480);
await T.glide(k0.cx, k0.cy, cn.cx, cn.cy, 8, 16);
inf = await T.info();
// drop on bar line 9 (index 8, start of REFRAIN) → content → sheet → Einfügen
const x9 = inf.canvas.x + 8 * 36 - inf.x0 + 3;
console.log('E9 x0', inf.x0, 'x9', x9);
await T.glide(cn.cx, cn.cy, Math.min(x9, 380), inf.canvas.y + 150, 12, 16);
const d9 = (await T.info()).drag;
await T.up(); await sleep(300);
console.log('E9 drag', JSON.stringify(d9), 'pop', await T.pop());
if (/plsheet/.test(await T.pop() || '')) { await T.tapPop(/^Einfügen/); await sleep(300); }
const beatAt = await E(() => SYNQUENZER.runtime().song.beat);
console.log('E9 marks', JSON.stringify(await marks()), 'song beat', beatAt);
await p.waitForFunction(() => { const s = SYNQUENZER.runtime().song; return !SYNQUENZER.runtime().playing || s.beat >= 63; }, null, {timeout: 60000, polling: 20});
const log9 = await E(() => SYNQUENZER.noteLog(3000));
if (await E(() => SYNQUENZER.runtime().playing)) await E(() => SYNQUENZER.songPlay(false));
await sleep(300);
const bars9 = await E(() => SYNQUENZER.song().bars);
const gaps = []; for (let b = 0; b < bars9; b++) { const n = log9.filter(x => x.beat >= b * 4 - .01 && x.beat < b * 4 + 3.99 && x.track === 4).length; if (!n) gaps.push(b + 1); }
check('E9 Ablegen während der Song läuft: Song 16 Takte, in jedem Takt spielen Drums (keine Lücke)', bars9 === 16 && gaps.length === 0, {bars9, gaps});
check('E9 0 Konsolenfehler', errs.length === 0, errs);
const fin = await E(() => ({v: SYNQUENZER.voices().filter(v => v.state !== 'off').length, te: SYNQUENZER.tickErrors()}));
await sleep(1500);
const fin2 = await E(() => ({v: SYNQUENZER.voices().filter(v => v.state !== 'off').length, te: SYNQUENZER.tickErrors()}));
check('E9 nach dem Stopp keine hängenden Stimmen', fin2.v === 0 && !fin2.te, fin2);
done();
await T.br.close();
