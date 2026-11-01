// H2 Abnahme H-10 … H-14 (Song-Aufnahme mit 🎤: Ziel Gesang, nichts stumm, nichts gelöscht), H7 H-60/61 (Vorlage), H8 H-70.
// node h2.mjs <index.html> [basis.html]
import {open, micOn, g10demo, closeAll, sleep, log, waitBeat, T, FMT, platz} from './h-lib.mjs';
const FILE = process.argv[2], OLD = process.argv[3], ok = T();
const idleTk = p => p.waitForFunction(() => !SYNQUENZER.vsInfo().busy && !SYNQUENZER.tkInfo().pend.length && SYNQUENZER.tkInfo().writes === 0 && !R.songRec, null, {timeout: 30000}).then(() => sleep(400));
const songState = p => p.evaluate(() => { const s = SYNQUENZER.song(); return {mel: JSON.stringify(s.mel), lanes: JSON.stringify(s.lanes), own: JSON.stringify(s.own || null), bars: s.bars, vox: s.vox || null}; });
const perBar = (L, a, b) => { const m = {}; for (const e of L) { if (e.track < 0 || e.beat < a || e.beat >= b) continue; const k = e.track + ':' + Math.floor(e.beat / 4 + 1e-9); m[k] = (m[k] || 0) + 1; } return m; };
// ● SONG: start (fn im Browser), bis Schlag `end` laufen, Ende per songRecEnd, dann ■
async function songTake(p, start, end, notes, probe) {
  await p.evaluate(() => SYNQUENZER.clearLog());
  const r = await p.evaluate(start);
  if (notes) for (const b of notes) { await waitBeat(p, b); await p.evaluate(() => SYNQUENZER.keyOn(67, .8, 'h')); await sleep(150); await p.evaluate(() => SYNQUENZER.keyOff(67, 'h')); }
  let pr = null; if (probe != null) { await waitBeat(p, probe); pr = await p.evaluate(() => { const now = AU.ctx.currentTime; return {guide: R.songRec ? !!R.songRec.guide : null, off: R.songPlay ? R.songPlay.off : null, src: TK.src.filter(r => !r.dead && r.vox).map(r => ({start: +(t2b(r.start)).toFixed(2), end: +(t2b(r.end)).toFixed(2), take: r.take, now: +(t2b(now)).toFixed(2)}))}; }); }
  await waitBeat(p, end); const L = await p.evaluate(() => SYNQUENZER.noteLog(4096));
  const mid = await p.evaluate(() => ({src: SYNQUENZER.tkInfo().src, mute: R.songRec ? (R.songRec.mute || null) : 'kein songRec', guide: R.songRec ? !!R.songRec.guide : null, tg: R.songRec ? R.songRec.tg : null}));
  await p.evaluate(() => SYNQUENZER.songRecEnd()); await idleTk(p); await p.evaluate(() => SYNQUENZER.stop()); await sleep(300);
  return {r, L, mid, pr};
}
async function setup(file, o = {}) { const H = await open(file, o.open), p = H.p; await g10demo(p, {song: true}); await sleep(1500); if (o.mic !== false) await micOn(p); await p.evaluate(() => SYNQUENZER.selectSlot(1, 0)); return H; }
// H-10
{
  const H = await setup(FILE), p = H.p, s0 = await songState(p), u0 = await p.evaluate(() => UNDO.length);
  const t = await songTake(p, () => SYNQUENZER.songRec(true), 16.3);
  const s1 = await songState(p), pb = perBar(t.L, 0, 16), miss = [];
  for (const tr of [1, 5]) for (let b = 0; b < 4; b++) if (!pb[tr + ':' + b]) miss.push(tr + ':' + b);
  ok('H-10 Ziel ab Werk = nur Gesang', t.mid.tg && t.mid.tg.vox === true && !t.mid.tg.mel && !t.mid.tg.clips && !t.mid.tg.chords, JSON.stringify(t.mid.tg));
  ok('H-10 song.mel und eigene Clips von Bass (Synth 2) und Melodie deep-equal', s1.mel === s0.mel && s1.own === s0.own && s1.lanes === s0.lanes);
  const v = (s1.vox || []).find(x => x.bar === 0);
  ok('H-10 song.vox hat ein Stück in Takt 1–4', !!v && v.len >= 4, JSON.stringify(s1.vox).slice(0, 160));
  ok('H-10 M-BEGL: Bass und Melodie klingen in Takt 1–4 (≥ 1 Note je Takt), nichts stumm', !miss.length && !t.mid.mute, miss.join(',') + ' mute ' + JSON.stringify(t.mid.mute));
  // H-14: ein Undo stellt alles her; Speichern → Laden deep-equal
  const after = await p.evaluate(() => JSON.stringify(SYNQUENZER.state().project));
  await p.evaluate(() => SYNQUENZER.undo()); await sleep(300);
  const s2 = await songState(p), u1 = await p.evaluate(() => UNDO.length);
  ok('H-14 ein Undo „Song-Aufnahme“ stellt Stimme, Noten, Takte wieder her', JSON.stringify(s2) === JSON.stringify(s0) && u1 === u0, JSON.stringify({vox: s2.vox, u0, u1}));
  await p.evaluate(() => SYNQUENZER.redo()); await sleep(300);
  const redo = await p.evaluate(() => JSON.stringify(SYNQUENZER.state().project));
  await p.evaluate(() => SYNQUENZER.save()); await sleep(800); await p.evaluate(() => SYNQUENZER.load()); await sleep(1200);
  const loaded = await p.evaluate(() => JSON.stringify(SYNQUENZER.state().project));
  ok('H-14 Speichern → Laden deep-equal', redo === after && loaded === after, (redo === after) + ' ' + (loaded === after));
  ok('H-10 Konsole', !H.errs.length, H.errs.join('|').slice(0, 200));
  await H.close();
}
// H-11: 🎤 aus, Ziel NOTEN → wie 4.25.0 (stumm + gelöscht)
async function h11(file) {
  const H = await setup(file, {mic: false}), p = H.p, s0 = await songState(p);
  const t = await songTake(p, () => SYNQUENZER.songRec(true), 16.3);
  const s1 = await songState(p); await H.close();
  const m0 = JSON.parse(s0.mel)[1].notes, m1 = (JSON.parse(s1.mel)[1] || {notes: []}).notes;
  return {mute: t.mid.mute, n0: m0.length, n1: m1.length, rest: JSON.stringify(m1), tg: t.mid.tg};
}
{
  const n = await h11(FILE); let same = !!n.mute && n.n1 < n.n0, info = JSON.stringify({mute: n.mute, n0: n.n0, n1: n.n1, tg: n.tg});
  if (OLD) { const o = await h11(OLD); same = same && JSON.stringify(o.mute) === JSON.stringify(n.mute) && o.rest === n.rest; info += ' | 4.25.0 ' + JSON.stringify({mute: o.mute, n1: o.n1}); }
  ok('H-11 🎤 aus + NOTEN: Stummschaltung und Löschen wie 4.25.0', same, info);
}
// H-12: NOTEN + GESANG mit 🎤 von Hand; 0 Noten → nichts gelöscht; 3 Noten in Takt 2 → wie 4.25.0
{
  const H = await setup(FILE), p = H.p, s0 = await songState(p);
  await p.evaluate(() => SYNQUENZER.songRecTargets({mel: true, vox: true}));
  const t = await songTake(p, () => SYNQUENZER.songRec(true), 16.3), s1 = await songState(p);
  ok('H-12 NOTEN + GESANG, 0 Noten gespielt: nichts gelöscht (deep-equal)', s1.mel === s0.mel && t.mid.tg.mel && t.mid.tg.vox, JSON.stringify(t.mid.tg));
  await H.close();
}
async function h12b(file) {
  const H = await setup(file), p = H.p;
  await p.evaluate(() => SYNQUENZER.songRecTargets({mel: true, vox: true}));
  const t = await songTake(p, () => SYNQUENZER.songRec(true), 16.3, [4.5, 5.5, 6.5]);
  const s1 = await songState(p); await H.close();
  const m = JSON.parse(s1.mel)[1].notes, own = JSON.parse(s1.own) || {}, on = [];
  for (const k in own) for (const n of own[k].notes || []) on.push(Math.round(n.t * 2) / 2);
  return {inR: m.filter(x => x.t < 15.75).map(x => Math.floor((x.t + .25) / 4)), rest: JSON.stringify(m.filter(x => x.t >= 15.75)), n: m.length, own: on.sort((a, b) => a - b), lanes: s1.lanes};
}
{
  const n = await h12b(FILE); let same = n.inR.length === 0 && n.n === 4 && [0.5, 1.5, 2.5].every(x => n.own.includes(x)), info = 'Takt 1–4 in song.mel: ' + n.inR.length + ', Rest ' + n.n + ', eigener Clip ' + JSON.stringify(n.own);
  if (OLD) { const o = await h12b(OLD); same = same && JSON.stringify(o.inR) === JSON.stringify(n.inR) && o.rest === n.rest && JSON.stringify(o.own) === JSON.stringify(n.own) && o.lanes === n.lanes; info += ' | 4.25.0: ' + o.inR.length + ', Rest ' + o.n + ', eigener Clip ' + JSON.stringify(o.own); }
  ok('H-12 3 Noten in Takt 2 gespielt: Ergebnis wie 4.25.0 (Takt 1–4 ersetzt, 3 neue Noten)', same, info);
}
// H-13: Start-Blatt mit 4 Chips in allen Formaten; 🎤 an/aus ohne Layout-Sprung
{
  const H = await setup(FILE), p = H.p, bad = [], jump = [];
  for (const [f, [w, h]] of Object.entries(FMT)) {
    await p.setViewportSize({width: w, height: h}); await sleep(300);
    const geo = async () => { await p.evaluate(() => SYNQUENZER.openRecStart()); await sleep(350); const g = await p.evaluate(() => { const e = document.querySelector('.pop.rstart'), r = e.getBoundingClientRect(), t = e.querySelector('.rs-tg').getBoundingClientRect(); return {h: Math.round(r.height), tg: Math.round(t.height), n: e.querySelectorAll('.rs-tg .rs-t').length}; }); return g; };
    const on = await geo();
    for (const x of await platz(p, '.pop.rstart .rs-tg button')) bad.push(f + ': ' + x);
    if (on.n !== 4) bad.push(f + ': ' + on.n + ' Chips');
    await p.evaluate(() => closePop()); await p.evaluate(() => SYNQUENZER.stimmeStop()); await sleep(300);
    const off = await geo(); await p.evaluate(() => closePop());
    if (on.tg !== off.tg) jump.push(f + ' ' + JSON.stringify({on, off}));   // die Ziele-Zeile bleibt gleich hoch (der Modus-Text darf kürzer sein)
    await micOn(p);
  }
  ok('H-13 Start-Blatt mit [🎤 GESANG] in 6 Formaten (M-PLATZ)', !bad.length, bad.join(' | ').slice(0, 500));
  ok('H-13 🎤 an/aus: kein Layout-Sprung', !jump.length, jump.join(' | ').slice(0, 500));
  ok('H-13 Konsole', !H.errs.length, H.errs.join('|').slice(0, 200));
  await H.close();
}
// H-60/61: g10-vox (Song-Stimme Takt 1–8), Bereich Takt 3–4, Ersetzen; „hören“ → alte Stimme eingeplant
async function voxProj(p) { await songTake(p, () => SYNQUENZER.songRec(true), 32.3); return (await songState(p)).vox; }
async function h6x(file, guide) {
  const H = await setup(file), p = H.p, v0 = await voxProj(p);
  await p.evaluate(g => { UI.recGuide = g; }, guide);
  const t = await songTake(p, () => SYNQUENZER.songRecRange(2, 3, 'replace', undefined, {preroll: true}), 14, null, 10.5);
  const v1 = (await songState(p)).vox;
  await p.evaluate(() => SYNQUENZER.undo()); await sleep(300); const v2 = (await songState(p)).vox;
  const errs = H.errs.slice(); await H.close();
  // Takt 3–4 des Songs = Song-Schläge [8, 16) = Transport-Schläge [8 + off, 16 + off); alte Stücke, die dort klingen
  const off = t.pr.off, old = t.pr.src.filter(r => r.start < 16 + off - .5 && r.end > 8 + off + .5 && v0.some(x => x.take === r.take));
  return {v0, v1, v2, old, guide: t.pr.guide, errs};
}
{
  const r = await h6x(FILE, true);
  ok('H-60 „hören“: alte Stimm-Stücke in Takt 3–4 während des Takes eingeplant', r.guide === true && r.old.length > 0, JSON.stringify(r.old).slice(0, 200));
  const nv = (r.v1 || []).find(x => x.bar === 2);
  ok('H-60 danach song.vox in Takt 3–4 = neuer Take', !!nv && nv.len === 2 && !(r.v0 || []).some(x => x.take === nv.take), JSON.stringify(r.v1).slice(0, 300));
  ok('H-60 ↶ stellt den alten Zustand her', JSON.stringify(r.v2) === JSON.stringify(r.v0));
  const s = await h6x(FILE, false);
  ok('H-61 Standard „stumm“: alte Stimme in Takt 3–4 nicht eingeplant', s.guide === false && s.old.length === 0, JSON.stringify(s.old).slice(0, 200));
  ok('H-60/61 Konsole', !r.errs.length && !s.errs.length, r.errs.concat(s.errs).join('|').slice(0, 200));
}
// H-60: Zeile „Alte Stimme [stumm] [hören]“ im Start-Blatt, ≥ 44 px
{
  const H = await setup(FILE), p = H.p; await voxProj(p); const bad = [];
  for (const [f, [w, h]] of Object.entries(FMT)) {
    await p.setViewportSize({width: w, height: h}); await sleep(250);
    await p.evaluate(() => { SYNQUENZER.songSelect(2, 3); SYNQUENZER.openRecStart(); }); await sleep(350);
    const has = await p.evaluate(() => !!document.querySelector('#rsGd'));
    if (!has) bad.push(f + ' keine Zeile'); else for (const x of await platz(p, '#rsGd button')) bad.push(f + ': ' + x);
    await p.evaluate(() => closePop());
  }
  ok('H-60 Zeile „Alte Stimme [stumm] [hören]“ in 6 Formaten ≥ 44 px', !bad.length, bad.join(' | ').slice(0, 400));
  await H.close();
}
// H-70: leerer Song + 🎤 → Toast; ohne 🎤 nicht
async function h70(mic) {
  const H = await open(FILE), p = H.p; await g10demo(p); if (mic) await micOn(p);
  await p.evaluate(() => { window.__toasts.length = 0; SYNQUENZER.songRec(true); }); await sleep(1500);
  const r = await p.evaluate(() => ({t: window.__toasts.slice(), song: !!SYNQUENZER.song()})); await p.evaluate(() => { SYNQUENZER.songRec(false); SYNQUENZER.stop(); }); await H.close(); return r;
}
{
  const a = await h70(true), b = await h70(false), re = /Gesang wird beim ersten Song-Durchgang nicht aufgenommen/;
  ok('H-70 mit 🎤 Toast, ohne 🎤 nicht', a.t.some(x => re.test(x)) && !b.t.some(x => re.test(x)) && a.song && b.song, JSON.stringify([a, b]).slice(0, 300));
}
await closeAll(); process.exit(ok.sum() ? 1 : 0);
