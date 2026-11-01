#!/usr/bin/env python3
"""MIX-A: baut bau/helfer/MIXA/index.html aus der Basis (Standard bau/snapshots/R-4300.html) + src/mixa-dsp.js, src/mixa-app.js, src/mixa.css.
Jeder Einhängepunkt muss genau einmal passen (sonst Abbruch)."""
import sys, os
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.abspath(os.path.join(H, '../../../..'))
base = sys.argv[1] if len(sys.argv) > 1 else os.path.join(R, 'bau/snapshots/R-4300.html')
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(H, '../index.html')
s = open(base, encoding='utf-8').read()
rd = lambda f: open(os.path.join(H, f), encoding='utf-8').read()
def put(anchor, new, after=True):
    global s
    n = s.count(anchor)
    if n != 1: sys.exit('Einhängepunkt %d× gefunden: %r' % (n, anchor[:90]))
    s = s.replace(anchor, anchor + new if after else new + anchor)
code = '\n' + rd('mixa-dsp.js') + '\n' + rd('mixa-app.js')
# 1. Code hinter G4
put("{ const P = tkExt().proc, k = typeof wpProc === 'function' ? P.indexOf(wpProc) : -1; P.splice(k + 1, 0, g4Proc); }   // hinter der Zeitkarte (wpProc), vor Säubern (VS4)\n", code)
# 2. CSS hinter dem G4-Blatt
put("@media (orientation:landscape) and (max-height:500px){.pop.g4sheet{max-width:min(660px,calc(100vw - 16px))}.g4sheet .g4grid{grid-template-columns:1fr 1fr}.g4sheet > .small:first-of-type{display:none}}\n", rd('mixa.css'))
# 3. Daten
put("  if (o.stimme && t.chor) { const ch = g6pNormLanes(t.chor); if (ch) o.chor = ch; }   // G6+a: Chor-Spuren (nur an der STIMME-Spur)\n",
    "  { const mx = mixaNormMix(t.mix); if (mx) o.mix = mx; }          // MIX-A: Mix-Einschub der Spur (fehlt = nichts)\n")
put("  if (['kick', '1/4', '1/8'].includes(b.pumpSrc)) d.pumpSrc = b.pumpSrc;\n", "  { const am = mixaNormAm(b.am); if (am) d.am = am; }              // MIX-A: Auto-Master (fehlt = nichts)\n")
# 4. Klang: Spur, Master, Bus
put("  if (S.tracks[i] && S.tracks[i].stimme && typeof g6pcMirror === 'function') g6pcMirror(i);   // G6+c: Chor folgt dem STIMME-Regler (gekoppelt)\n",
    "  mixaTrackSync(i, immediate);                                    // MIX-A: Spur-Einschub (nur mit track.mix)\n")
put("  // the convolution IR is only generated when the worklet hall does not arrive (worklet blocked or slow): no wasted start-up work\n  setTimeout(convWarm, 400);\n",
    "  mixaMasterSync(true);                                           // MIX-A: Auto-Master (nur mit fxBus.am)\n")
put("function applyFxBus() { if (!AU.ctx) return; applyMaster(); applyHall(S.fxBus.hall, true); applyEcho(); }",
    "function applyFxBus() { if (!AU.ctx) return; applyMaster(); applyHall(S.fxBus.hall, true); applyEcho(); mixaMasterSync(false); }   // MIX-A", after=False)
s = s.replace("function applyFxBus() { if (!AU.ctx) return; applyMaster(); applyHall(S.fxBus.hall, true); applyEcho(); mixaMasterSync(false); }   // MIX-Afunction applyFxBus() { if (!AU.ctx) return; applyMaster(); applyHall(S.fxBus.hall, true); applyEcho(); }",
    "function applyFxBus() { if (!AU.ctx) return; applyMaster(); applyHall(S.fxBus.hall, true); applyEcho(); mixaMasterSync(false); }   // MIX-A: Auto-Master folgt")
# 5. Scheduler
put("    if (!R.playing) { try { arpTick(now, h); } catch (e) { tickErr(e); } return; }   // MK5: a held chord arpeggiates with the transport stopped\n",
    "    if (!R.playing) { try { mixaIdle(); } catch (e) { tickErr(e); } return; }    // MIX-A: Songteil-Pegel zurück auf 0\n", after=False)
s = s.replace("    if (!R.playing) { try { mixaIdle(); } catch (e) { tickErr(e); } return; }    // MIX-A: Songteil-Pegel zurück auf 0\n    if (!R.playing) { try { arpTick(now, h); } catch (e) { tickErr(e); } return; }   // MK5: a held chord arpeggiates with the transport stopped",
    "    if (!R.playing) { try { mixaIdle(); } catch (e) { tickErr(e); } try { arpTick(now, h); } catch (e) { tickErr(e); } return; }   // MK5: a held chord arpeggiates with the transport stopped; MIX-A: Songteil-Pegel zurück auf 0")
put("    if (R.songPlay) { try { songTick(b0, b1); } catch (e) { tickErr(e); } }   // §3.9 (Anhang D.7): the song's launches, Träger, melody\n",
    "    try { mixaTick(b0, b1); } catch (e) { tickErr(e); }            // MIX-A: Songteil-Pegel an den Taktgrenzen\n")
# 6. Undo
put("  if (e.kind === 'chorlanes') return g6pLanesSnap(e.track);                                     // G6+a: Chor-Spuren\n",
    "  if (e.kind === 'mixa') return mixaSnap();                                                     // MIX-A\n")
put("  else if (e.kind === 'chorlanes') g6pLanesRestore(e.track, val);   // G6+a\n", "  else if (e.kind === 'mixa') mixaRestore(val);                  // MIX-A\n")
# 7. Offline-Durchlauf (Video, GarageBand, Messen)
put("  if (wk && !(await vvAddModule(oc))) throw new Error('Klang-Modul nicht geladen');\n",
    "  if ((o.mixa || mixaNeed()) && !(await mixaAddModule(oc)) && o.mixa) throw new Error('Analyse-Modul nicht geladen');   // MIX-A\n")
put("  Object.assign(live, {bpm: S.bpm, a, b, t: -1});\n", "  off.mixa = o.mixa || null;                                       // MIX-A: Messdurchlauf\n")
put("  const t0 = R.startTime, endB = b < song.bars ? R.songPlay.off + b * 4 : null, q = t => Math.ceil(t * sr / 128) * 128 / sr;\n",
    "  if (off.mixa) off.mixa.t0 = t0;                                  // MIX-A: Fensterzeit → Song-Takt\n")
put("  for (let i = 0; i < NT(); i++) { await cut(); buildTrack(i); }\n", "  if (off && off.mixa) mixaTapBuild(off);                           // MIX-A: Analyse-Abgriffe, Master vor dem Auto-Master\n")
a = "  if (wk && off && !VV.noMtr && !GGB.dry) { const M = mtrBuild(off); if (M) off.mtr = M; }"
if s.count(a) != 1: sys.exit('Meter-Zeile')
s = s.replace(a, "  if (wk && off && !VV.noMtr && !GGB.dry && !off.mixa) { const M = mtrBuild(off); if (M) off.mtr = M; }")
# 8. Bedienung, API
a = "  const mc = el('div', 'fxmode'); mc.append(lgrp('Pump-Quelle', src), fxCap()); pg.appendChild(mc);"
if s.count(a) != 1: sys.exit('MASTER-Seite')
s = s.replace(a, "  const mc = el('div', 'fxmode'); mc.append(lgrp('Pump-Quelle', src), mixaBtns(), fxCap()); pg.appendChild(mc);   // MIX-A: [AUTO-MASTER] [MIX-ASSISTENT]")
put("Object.assign(SYNQUENZER, GGB_API);                        // G-GB: Mit GarageBand aufnehmen\n", "Object.assign(SYNQUENZER, MIXA_API);                       // MIX-A: Mix-Assistent + Auto-Master\n")
open(out, 'w', encoding='utf-8').write(s)
print('gebaut:', out, len(s), 'Zeichen')
