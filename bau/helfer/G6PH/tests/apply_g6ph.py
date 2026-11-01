#!/usr/bin/env python3
"""G6+h auf eine Basis anwenden (für Tests gegen andere Stände, z. B. 4.26.0 mit Video).
   python3 apply_g6ph.py BASIS.html AUS.html [--video]
   Der G6PH-Block wird aus bau/helfer/G6PH/index.html genommen (G6PH-BEGIN … G6PH-END); die Haken sind dieselben wie in patch.diff,
   --video setzt zusätzlich den Abschnitt aus patch-video.diff (vvRenderAudio-Hülle + g6pWaitAll nach vvTakesReady)."""
import sys, os, re
here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, '..', 'index.html'), encoding='utf-8').read()
blk = src[src.index('/* G6PH-BEGIN */'):src.index('/* G6PH-END */') + len('/* G6PH-END */\n')]
base, out = sys.argv[1], sys.argv[2]
s = open(base, encoding='utf-8').read()

def rep(a, b):
    global s
    n = s.count(a)
    if n != 1: sys.exit('Stelle nicht eindeutig (%d): %s' % (n, a[:90]))
    s = s.replace(a, b)

rep("/* G6-END */\n", "/* G6-END */\n" + blk)
rep("""function g6HeardPcs(r, beat) {
  if (!r || r.t == null) return null;""", """function g6HeardPcs(r, beat) {
  if (r && r.vox) return g6pVoxPcs(r, beat);                      // G6+h: Song-Stimme → Akkorde der Begleitung am Takt (Song-Bahnen, eigene Clips, song.mel)
  if (!r || r.t == null) return null;""")
rep("""  if (r.vox) { const before = songSnapshot(); if (fn(x.a) === false) return false; const v = S.song.vox.find(z => z.id === r.vox), n = tkNormAudio(v); if (n && n.chor) v.chor = n.chor; else delete v.chor; pushSongUndo(before, label); songChanged(); }""",
    """  if (r.vox) { if (!g6pSongEdit(r, label, fn)) return false; }   // G6+h: ein Song-Undo inkl. Chor-Spuren""")
rep("""  if (e.kind === 'gfx') return g4Snap(e.track);                                                // G4
""", """  if (e.kind === 'gfx') return g4Snap(e.track);                                                // G4
  if (e.kind === 'chorlanes') return g6pLanesSnap(e.track);                                    // G6+h (Platzhalter bis G6+a): Chor-Spuren der STIMME-Spur
""")
rep("""  else if (e.kind === 'gfx') g4Restore(e.track, val);            // G4
""", """  else if (e.kind === 'gfx') g4Restore(e.track, val);            // G4
  else if (e.kind === 'chorlanes') g6pLanesRestore(e.track, val); // G6+h (Platzhalter bis G6+a)
""")
rep("""      try { g3SongTick(song, b0, b1, off, E, insB, guard && sp.wrapAt != null ? sp.wrapAt : -Infinity); } catch (e) { tickErr(e); }   /* G3: Anlauf/Ausklang der Teile */
""", """      try { g3SongTick(song, b0, b1, off, E, insB, guard && sp.wrapAt != null ? sp.wrapAt : -Infinity); } catch (e) { tickErr(e); }   /* G3: Anlauf/Ausklang der Teile */
      if (!guard) try { g6pSongTick(song, b0, off); } catch (e) { tickErr(e); }   /* G6+h: Chor des nächsten Teils vorausrechnen */
""")
rep("Object.assign(SYNQUENZER, G6_API);                // G6: Chor-Generator\n",
    "Object.assign(SYNQUENZER, G6_API);                // G6: Chor-Generator\nObject.assign(SYNQUENZER, G6PH_API);              // G6+h: Chor im Song und im Video\n")
if '--video' in sys.argv:
    rep("""async function vvRenderAudio(o) {
  o = o || {};""", """/* G6PH-VIDEO-BEGIN (G6+h, Nachtrag 10 §2.7): Solo und „Selbst singen“-Scharf gelten nicht im Video; vor dem Render wird jeder Chor
   im Bereich fertig gerechnet (g6pWaitAll). Ohne G6+h-Block (typeof) läuft der Render wie bisher. */
async function vvRenderAudio(o) {
  const h = typeof g6pRenderHold === 'function' ? g6pRenderHold() : null;
  try { return await vvRenderAudio0(o); } finally { if (h) g6pRenderRelease(h); }
}
/* G6PH-VIDEO-END */
async function vvRenderAudio0(o) {
  o = o || {};""")
    rep("""  await vvTakesReady();
  const wk = wkReady(), sr = lc.sampleRate""", """  await vvTakesReady();
  if (typeof g6pWaitAll === 'function') { const w = await g6pWaitAll({a, b}, {cancel: () => VV.cancel}); if (!w.ok) toast('Chor im Video nicht ganz fertig gerechnet'); }   // G6PH-VIDEO
  const wk = wkReady(), sr = lc.sampleRate""")
open(out, 'w', encoding='utf-8').write(s)
print('ok', out)
