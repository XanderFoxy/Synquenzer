#!/usr/bin/env python3
# ARP1 „Arp für jede Synth-Spur“: basis.html -> index.html (reproduzierbar). Aufruf: apply.py [ein.html] [aus.html]
#  Kern (Block sq-arp-src): 3 geänderte Zeilen (A_, on, stepB) + eingefügte Zeilen (gnA, gnNotes-Aufruf, arp1-core.js, gnFig,
#  NST1-Rücknahme in rewind, ARP1K). Haupt-Faden: nur neue Zeilen über eindeutige Anker (Abbruch bei != 1 Treffer).
#  Block arp1-block.js hinter /* LT2-END */, stiller Block arp1-ui.js als <script type="text/plain" id="sq-arp1-src">.
import sys, os, re
D = os.path.dirname(os.path.abspath(__file__))
src_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, 'basis.html')
out_path = sys.argv[2] if len(sys.argv) > 2 else os.path.join(D, 'index.html')
src = open(src_path, encoding='utf-8').read()
if 'ARP1-BEGIN' in src: sys.exit('ARP1 ist schon drin')
L = src.split('\n')

def hits(pattern):
    return [i for i, x in enumerate(L) if pattern in x]

def one(pattern):
    h = hits(pattern)
    if len(h) != 1: sys.exit('Anker %r: %d Treffer' % (pattern[:90], len(h)))
    return h[0]

def after(pattern, line):
    i = one(pattern)
    ind = re.match(r'\s*', L[i + 1]).group(0) if i + 1 < len(L) else ''
    L.insert(i + 1, line if line.startswith(' ') else ind + line)

def before(pattern, line):
    i = one(pattern)
    ind = re.match(r'\s*', L[i]).group(0)
    L.insert(i, line if line.startswith(' ') else ind + line)

def change(pattern, old, new):
    """ändert genau eine Zeile (Kern): old -> new, Kennung ARP1 am Zeilenende"""
    i = one(pattern)
    if L[i].count(old) != 1: sys.exit('Änderung %r: Teil %r nicht genau 1x' % (pattern[:60], old[:60]))
    L[i] = L[i].replace(old, new) + '   /* ARP1 (geändert) */'

# ---------------- Kern: Block sq-arp-src (nur dort; Anker liegen zwischen ARPC-Anfang und BMARP) ----------------
def core(pattern):
    a0, a1 = one('<script type="text/plain" id="sq-arp-src">'), one('const BMARP = (function () {')
    h = [i for i in hits(pattern) if a0 < i < a1]
    if len(h) != 1: sys.exit('Kern-Anker %r: %d Treffer' % (pattern[:90], len(h)))
    return h[0]
# 1 Adapter vor A_
i = core("  const A_ = i => { const tr = S.tracks[i]; if (tr && tr.sound && tr.sound.engine === 'bm') return bmA(tr);")
L.insert(i, "  const gnA = i => (typeof arp1Adapt === 'function' ? arp1Adapt(S.tracks[i]) : null);   /* ARP1: Spur-Arp (VA, FM, WT) in Form des MS-Programms, sonst null */")
# 2-4 die drei geänderten Kernzeilen
change("  const A_ = i => { const tr = S.tracks[i]; if (tr && tr.sound && tr.sound.engine === 'bm') return bmA(tr);",
       "const A_ = i => { const tr = S.tracks[i];", "const A_ = i => { const g = gnA(i); if (g) return g; const tr = S.tracks[i];")
change("  function on(i) { const tr = S.tracks[i]; if (!tr || tr.kind !== 'synth' || !tr.sound) return false; if (tr.sound.engine === 'bm')",
       "return false; if (tr.sound.engine === 'bm')", "return false; if (gnA(i)) return true; if (tr.sound.engine === 'bm')")
change("  const stepB = m => (m.bm ? m.sb : RES[clamp(m.arp.res | 0, 0, 5)] * 4);", "(m.bm ? m.sb :", "(m.bm || m.gn ? m.sb :")
# 5 die Töne des Schritts (danach laufen Gate, Swing, spawnVoice, Protokoll unverändert)
i = core("} else notes = arpPattern(A.type | 0, A.range | 0, N, c, seed, voicesOf(m, dual ? (tg || 3) : 1));")
L.insert(i + 1, "    if (m.gn) notes = gnNotes(m, q, c, N, seed);   /* ARP1: die Töne des Spur-Arps (Puffer, keine Zuweisung je Schritt) */")
# 5b „späte erste Note“ auch nach einer Pause: ein frischer Zustand (Raster neu, noch kein Schritt geplant) nimmt eine Note kurz nach
#    einem Rasterpunkt so, wie ein laufender (add → lateIdx); sonst hing es vom Takt des Planers ab, ob der erste Schritt kommt (nur Spur-Arp)
i = core("    else if (!R.playing && (!s.grid || s.grid.k !== 'free')) { const t0 = s.iv.length")
L.insert(i + 1, "    if (m.gn && R.playing && s.grid.k === 'song' && !s.hist.length && !s.late) for (const x of s.iv) { if (x.on <= now) continue; const g = lateIdx(s, m, x); if (g != null) { s.late = {idx: g, x}; if (g < s.next) s.next = g; } break; }   /* ARP1: wie add() bei laufendem Zustand */")
# 6 „ganze Figur“ beim Eintreffen einer Clip-Note
i = core("    const s = st(i), L = s.iv;")
L.insert(i + 1, "    if (x.src !== 'live') gnFig(i, x, L);   /* ARP1: Kurze Noten – ganze Figur (nur Spur-Arp) */")
# 7 Muster-Teil vor dem Planer
i = core("  // plan track i up to now + h")
L[i:i] = open(os.path.join(D, 'arp1-core.js'), encoding='utf-8').read().rstrip('\n').split('\n')
# 8 NST1: Arp-Neuplanung nimmt den Je-Note-Zähler zurück (gilt auch für den Arp der MS-Platte; ohne NST1 wirkungslos)
i = core("  function rewind(i, t) {")
L.insert(i + 1, "    { const s0 = ST.get(i); if (s0 && typeof nst1Cancel === 'function' && s0.hist.some(r => r.t >= t - 1e-6 && r.vs.length)) nst1Cancel(i, t); }   /* ARP1 */")
# 9 Zugang für die reine Rechnung (arp1Render) und die Tests
i = core("  return {RES, TYP, arpPattern, seedOf, on, live, liveUp, clip, cut, cancelFrom, carrier, rewind, tick, plan, end, endAll, cur, arpLog, clearLog, info, busy: () => ST.size > 0, route};")
L.insert(i, "  if (typeof window !== 'undefined') window.ARP1K = {gnNotes, gnLen, ST, A_, seedOf};   /* ARP1: reine Rechnung (MIDI, Festschreiben) und Test */")

# ---------------- Haupt-Faden: neue Zeilen ----------------
before("  if (tr.sound.engine === 'bm') { const a = tr.sound.p.bm && tr.sound.p.bm.a && tr.sound.p.bm.a.ar; if (!a || a.t === 'off') return false;   // BM4: Bit Mask arp",
       "  if (typeof arp1Gn === 'function' && arp1Gn(tr)) return arp1On(i, sync);   /* ARP1: Spur-Arp (lädt sq-arp-src sofort, auch im Planer: 1 ms, einmal) */")
after("  { const ro = mx1NormRole(t.mxRole); if (ro) o.mxRole = ro; }    // MX1: Rolle im Mix (fehlt = automatisch)",
      "  if (def.kind === 'synth' && t.arp && typeof arp1Norm === 'function') { const a = arp1Norm(t.arp); if (a) o.arp = a; }   /* ARP1: Arp der Spur (fehlt = aus, Datei bitgleich) */")
after("function undoState(e) {", "  if (e.kind === 'arp1') return arp1Snap(e.track);                                             /* ARP1 */")
after("function undoApply(e, val) {", "  if (e.kind === 'arp1') { arp1Put(e.track, val); UI.dirty.all = true; markDirty(); if (typeof edUndoBtns === 'function') edUndoBtns(); return; }   /* ARP1 */")
after("  const PPQ = 480, tm = tempoMap && tempoMap.length ? tempoMap : [{beat: 0, bpm: S.bpm}];",
      "  if (typeof arp1Midi === 'function') arp1Midi(evs, idxs || midiBaseIdx(), marks, endTk, counts);   /* ARP1: Arp-Noten statt Clip-Noten (Schalter im Export-Blatt) */")
before("  return assembleMidi(evs, [{tk: 0, b: metaText(6, 'Mitschnitt'), o: -1}], bars * BB * PPQ,",
       "  if (typeof arp1Skip === 'function') arp1Skip();   /* ARP1: der Mitschnitt hat die Arp-Noten schon (nie doppelt) */")
after("    h = h.replace('<h5>Video</h5>', mx + '<h5>Video</h5>');",
      "    if (typeof arp1ExpRow === 'function') h = h.replace('<h5>Video</h5>', arp1ExpRow() + '<h5>Video</h5>');   /* ARP1: Arp als Noten / wie im Clip */")
after("  const a = b.dataset.va; if (!a || a.slice(0, 3) !== 'wg-') return false;",
      "  if (a === 'wg-arp') { UI.expArp = b.dataset.v === '1'; haptic('tick'); va1Paint(); return true; }   /* ARP1 */")
after("  if (V6A.ed) v6aEdEnd(true);                                         // V6A: the render plays the stored states",
      "  arpEndAll();                                                        /* ARP1: kein gelatchter Live-Akkord läuft in den Render */")
after("    if (!songPlayStart(a)) throw new Error('Song startet nicht');",
      "    if (typeof arp1RenderLead === 'function') arp1RenderLead(vvStep() + LOOKAHEAD);   /* ARP1: Spur-Arp plant bis zum ersten Halt des Renders voraus (kein später/fehlender 2. Schritt) */")
after("  if (!sv || sv.done) return; sv.done = true;",
      "  try { arpEndAll(); } catch (e) { logErr(e); }   /* ARP1: kein Arp-Zustand mit Render-Zeiten bleibt im Live-Betrieb */")
after("  pg.append(r1, kRow(ks.slice(0, 4)), k2);",
      "  if (typeof arp1VoiceRow === 'function') arp1VoiceRow(pg, i);   /* ARP1: Zeile ARP unten auf STIMME */")
after("      (!drum ? kf2MoreBtn() : '') +   // KF2: Oszilloskop an/aus",
      "      (!drum && typeof arp1MoreBtn === 'function' ? arp1MoreBtn(t) : '') +   // ARP1: Arpeggiator der Spur")
after("      else if (a === 'tcopy') MKUI.timCopyPop(anchor, t); else if (a === 'tswap') MKUI.timSwap(t); else if (a === 'tinit') MKUI.timInit(t); else if (a === 'sqtools') MKUI.seqToolsPop(anchor, t); }, 'button[data-a]');",
      "    if (typeof arp1MoreTap === 'function') arp1MoreTap(p, anchor, t);   /* ARP1 */")

# ---------------- stiller Block (Blatt) hinter sq-arp-src ----------------
i = one('<script type="text/plain" id="sq-form-src">')
ui = open(os.path.join(D, 'arp1-ui.js'), encoding='utf-8').read().rstrip('\n').split('\n')
L[i:i] = ['<script type="text/plain" id="sq-arp1-src">'] + ui + ['</script>']

# ---------------- Block hinter LT2-END ----------------
blk = open(os.path.join(D, 'arp1-block.js'), encoding='utf-8').read().rstrip('\n').split('\n')
h = [k for k, x in enumerate(L) if x.strip() == '/* LT2-END */']
if len(h) != 1: sys.exit('LT2-END: %d' % len(h))
L[h[0] + 1:h[0] + 1] = blk

open(out_path, 'w', encoding='utf-8').write('\n'.join(L))
print('ok', len(L), os.path.basename(out_path))
