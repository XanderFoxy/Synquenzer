# SPK12 Bau: basis.html + spk12-block.js (nach /* SPK11-END */) + Haken-Zeilen „SPK12“ → index.html
import os, sys
D = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(D, 'basis.html'), encoding='utf-8').read().split('\n')
blk = open(os.path.join(D, 'spk12-block.js'), encoding='utf-8').read().rstrip('\n').split('\n')
H = [  # (Anker-Zeile exakt, 'nach'|'vor', neue Zeile)
 ("  function selFn(d, sel) {", 'nach', "    { const r12 = typeof spk12SelFn === 'function' ? spk12SelFn(d, sel, selFn) : null; if (r12) return r12; }   /* SPK12: − / ∩ / Umkehren / Zauberstab */"),
 ("  return {on, stft, istft, specInfo, docs, lowSplit, Z2};   // SPK2: Z2 für Messungen", 'vor', "  if (Z2 && typeof spk12DspMake === 'function') spk12DspMake(Z2, {selFn, specInfo, specChunk, get, put});   /* SPK12: Zauberstab, Masken-Probe, Anzeige */"),
 ("function spk8WUrl(src, u) {", 'nach', "  if (typeof spk12DspMake === 'function') src = src + ';' + spk12SelFn.toString() + ';' + spk12Ras.toString() + ';' + spk12DspMake.toString() + ';';   /* SPK12: Auswahl-Kern in den Spektral-Worker */"),
 ("  if (typeof spk2Pane === 'function') spk2Pane(U, pane, sl);   // SPK2: Noten-Werkzeug", 'nach', "  if (typeof spk12Pane === 'function') spk12Pane(U, pane, sl);   /* SPK12: Neu │ + │ − │ ∩ · Auswahl ▾ · Zauberstab */"),
 ("  const cv = U.ov, x = cv.getContext('2d'), d = U.dpr, W = U.W, H = U.H, v = U.v; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, cv.width, cv.height); x.setTransform(d, 0, 0, d, 0, 0);", 'nach', "  const s12 = typeof spk12OvPre === 'function' ? spk12OvPre(U) : null;   /* SPK12 */"),
 ("  x.setLineDash([]);", 'nach', "  if (s12) spk12OvPost(U, x, s12);   /* SPK12: Ergebnis-Fläche + Rand-Griffe */"),
 ("    P.set(e.pointerId, pt(e)); spk1Dd(U, null);", 'nach', "    if (P.size === 2 && G && G.s12cand && typeof spk12Two === 'function' && spk12Two(U, G, P)) return;   /* SPK12: zwei Finger am Rand = Weichheit */"),
 ("  const G = {tool: U.tool, x0: p.x, y0: p.y, t0: spk1T(U, p.x), f0: spk1F(U, p.y), moved: false, shape: null};", 'nach', "  if (typeof spk12Down === 'function') spk12Down(U, G, p);   /* SPK12: Rand-Griffe */"),
 ("  if (G.tool === 's6ed' && G.s6 && typeof spk6EdDrag === 'function') return spk6EdDrag(U, G, p);   /* SPK6: Note ziehen */", 'nach', "  if ((G.s12cand || G.tool === 'wand') && typeof spk12Move === 'function' && spk12Move(U, G, p)) return;   /* SPK12 */"),
 ("  if (G.tool === 's6ed' && typeof spk6EdUp === 'function') return spk6EdUp(U, G);   /* SPK6: Noten bearbeiten */", 'nach', "  if (G.s12 && typeof spk12Up === 'function') return spk12Up(U, G);   /* SPK12 */"),
 ("  if (G.tool === 'noten' && typeof spk2NoteUp === 'function') return spk2NoteUp(U, G);   // SPK2: Noten wählen", 'nach', "  if (G.tool === 'wand' && typeof spk12Wand === 'function') { spk12Wand(U, G); return; }   /* SPK12: Zauberstab */"),
 ("function spk1SelDone(U, txt) {", 'nach', "  if (typeof spk12SelDone === 'function') spk12SelDone(U);   /* SPK12: Kombinier-Modus */"),
 ("  if (U.meta && !U.sel.length) spk1Stat(U, tip + ' · zwei Finger = Zoom');", 'nach', "  if (typeof spk12ToolSet === 'function') spk12ToolSet(U, k);   /* SPK12 */"),
 ("  if (!r) return; U.bU.disabled = !r.nu; U.bR.disabled = !r.nr;", 'nach', "  if (typeof spk12UndoBtn === 'function') spk12UndoBtn(U);   /* SPK12: ↶ auch für Auswahl-Schritte */"),
 ("  if (U.busy) return; U.vf = null;", 'nach', "  if (typeof spk12UndoRedo === 'function' && spk12UndoRedo(U, which)) return;   /* SPK12 */"),
 ("function spk1Tap(U, b) {", 'nach', "  if (typeof spk12Tap === 'function' && spk12Tap(U, b)) return;   /* SPK12 */"),
]
out = list(src)
for a, wo, neu in H:
    idx = [i for i, l in enumerate(out) if l == a]
    if len(idx) != 1: sys.exit('Anker %d× gefunden: %r' % (len(idx), a))
    i = idx[0]
    out.insert(i + 1 if wo == 'nach' else i, neu)
e = [i for i, l in enumerate(out) if l.startswith('/* SPK11-END */')]
if len(e) != 1: sys.exit('SPK11-END fehlt')
out[e[0] + 1:e[0] + 1] = blk
open(os.path.join(D, 'index.html'), 'w', encoding='utf-8').write('\n'.join(out))
print('ok', len(H), 'Haken, Block', len(blk), 'Zeilen')
