// V6A Daten: Undo/Redo (◆-Bearbeiten = 1 Schritt 'clip', Gleiten am Clip/Teil/Marke), Speichern → Laden deep-equal (auch während
// der ◆-Editor offen ist), Kopieren/Einfügen/Duplizieren tragen den Zustand mit, ein Projekt ohne Zustand schreibt kein Feld
import { open, setup, ok, done, BASE } from './v6a-lib.mjs';
const { b, p, errs } = await open();
const t = await setup(p);
const r = await p.evaluate(async (t) => {
  const Q = window.SYNQUENZER, o = {};
  o.noField = !/"st"|"gl"/.test(serialize());
  // ◆ editing: two knob gestures inside, then [Grundklang]
  Q.selectTrack(t); Q.selectSlot(t, 1); Q.openEditor();
  const base = S.tracks[t].sound.p.cutoff, u0 = UNDO.length;
  const gest = (k, v) => { const u = soundUndo(t), bb = u.snap(); setP(t, k, v); u.commit(bb, k); };   // one knob gesture = one sound step
  Q.v6aEdit(t); gest('cutoff', 700); gest('res', .4);
  o.insideUndoN = UNDO.length - u0;
  Q.undo();                                                            // inside the ◆ editor: the res gesture goes back, still editing
  o.afterInnerUndo = {res: S.tracks[t].sound.p.res, editing: !!Q.v6aEditing()};
  // save while the editor is open: the file has the Grundklang and the state as it stands
  const f1 = JSON.parse(serialize()); o.fileWhileEd = {cut: f1.tracks ? null : null};
  const tf = (f1.project || f1).tracks[t]; o.fileWhileEd = {base: tf.sound.p.cutoff, st: tf.clips[1].st};
  Q.v6aDone();
  o.after = {st: Q.v6aState(t, 1), base: S.tracks[t].sound.p.cutoff, top: UNDO[UNDO.length - 1].kind, n: UNDO.length - u0};
  Q.undo(); o.undo1 = Q.v6aState(t, 1); Q.redo(); o.redo1 = Q.v6aState(t, 1);
  // glide on clip, part, mark
  if (!Q.v6aState(t, 1)) return o;
  Q.v6aSetGlide(t, 1, {x: "bar2"}); o.gl1 = Q.v6aState(t, 1).x; Q.undo(); o.glU = Q.v6aState(t, 1).x || null; Q.redo();
  Q.partFromNow(0); Q.v6aPartGlide(0, {x: 'free', n: 6}); o.pg = JSON.stringify(S.parts[0].gl); Q.undo(); o.pgU = S.parts[0].gl || null; Q.redo();
  Q.songFromChain([{scene: 0, bars: 1}, {scene: 1, bars: 1}]); const mid = S.song.marks[1].id; Q.v6aMarkGlide(mid, {x: 'jump'});
  o.mg = S.song.marks[1].gl; Q.undo(); o.mgU = S.song.marks[1].gl || null; Q.redo();
  // save → load deep-equal
  const txt = serialize(); importJSON(txt); await new Promise(r => setTimeout(r, 300));
  o.reload = serialize() === txt; o.loaded = {st: Q.v6aState(t, 1), pg: S.parts[0].gl, mg: S.song.marks[1].gl};
  // copy / paste / duplicate carry the state
  copyClip(t, 1); pasteClip(t, 3); o.paste = Q.v6aState(t, 3);
  const k = duplicateClip(t, 1); o.dup = k >= 0 ? Q.v6aState(t, k) : 'keine freie Zelle';
  // a bad file: unknown / broken values are dropped, the rest stays
  const bad = JSON.parse(txt), bp = bad.project || bad; bp.tracks[t].clips[1].st = {eng: 'analog', p: {cutoff: 'x'.repeat(40), 'bad key!': 1, res: .3}, fx: {vol: 'laut'}, x: 'warp'};
  importJSON(JSON.stringify(bad)); await new Promise(r => setTimeout(r, 200));
  o.badSt = Q.v6aState(t, 1);
  return o;
}, t);
console.log(JSON.stringify(r).slice(0, 900));
ok('DAT-1 ohne Zustand: kein Feld st / gl in der Datei', r.noField);
ok('DAT-2 im ◆-Editor: jede Geste ein Klang-Schritt, ↶ bleibt im Editor', r.insideUndoN === 2 && r.afterInnerUndo.editing && r.afterInnerUndo.res !== .4, JSON.stringify(r.afterInnerUndo));
ok('DAT-3 Speichern bei offenem ◆-Editor: Datei = Grundklang + Zustand', r.fileWhileEd.base !== 700 && r.fileWhileEd.st && r.fileWhileEd.st.p.cutoff === 700, JSON.stringify(r.fileWhileEd));
ok('DAT-4 [Grundklang]: ein Undo-Schritt clip, Grundklang unverändert', r.after.top === 'clip' && r.after.n === 1 && r.after.st.p.cutoff === 700 && r.after.base !== 700, JSON.stringify(r.after));
ok('DAT-5 ↶ / ↷ des Zustands', r.undo1 === null && r.redo1 && r.redo1.p.cutoff === 700);
ok('DAT-6 Gleiten am Clip: Undo/Redo', r.gl1 === 'bar2' && r.glU === null);
ok('DAT-7 Gleiten am Teil: Undo/Redo', r.pg === '{"x":"free","n":6}' && r.pgU === null, r.pg);
ok('DAT-8 Gleiten an der Song-Kante: Undo/Redo', r.mg && r.mg.x === 'jump' && r.mgU === null);
ok('DAT-9 Speichern → Laden zeichengleich', r.reload && r.loaded.st && r.loaded.st.x === 'bar2' && r.loaded.pg.n === 6 && r.loaded.mg.x === 'jump', JSON.stringify(r.loaded));
ok('DAT-10 Kopieren/Einfügen und Duplizieren tragen ◆ mit', r.paste && r.paste.p.cutoff === 700 && r.dup && r.dup.p && r.dup.p.cutoff === 700, JSON.stringify([r.paste, r.dup]).slice(0, 160));
ok('DAT-11 kaputte Werte verworfen, gültige bleiben', r.badSt && r.badSt.p.res === .3 && !('cutoff' in r.badSt.p) && !r.badSt.fx && !r.badSt.x, JSON.stringify(r.badSt));
ok('DAT-E keine Fehler', !errs.length, errs.join(' | ').slice(0, 300));
await b.close();
// the same project file in 4.30.0: opens, plays without the states, no error (the states are not known there – spec I1 §4.5)
const o2 = await open(BASE);
const r2 = await o2.p.evaluate(async () => { const Q = window.SYNQUENZER; Q.loadDemo(); const tx = serialize(), f = JSON.parse(tx), pp = f.project || f; pp.tracks[0].clips[0] && (pp.tracks[0].clips[0].st = {eng: 'analog', p: {cutoff: 500}}); importJSON(JSON.stringify(f)); await new Promise(r => setTimeout(r, 300)); return {ok: S.tracks.length > 0}; });
ok('DAT-12 4.30.0 öffnet eine Datei mit ◆ ohne Fehler', r2.ok && !o2.errs.length, o2.errs.join(' | ').slice(0, 200));
await o2.b.close();
process.exit(done() ? 1 : 0);
