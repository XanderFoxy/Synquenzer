#!/usr/bin/env python3
# UE-C/D: baut die Blöcke und Haken in bau/helfer/UECD/index.html ein (aus bau/snapshots/R-4300.html). Jede Ersetzung genau 1×.
import sys, os
root = os.path.dirname(os.path.abspath(__file__))
base, blk, ui, out = sys.argv[1:5]
s = open(base, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: raise SystemExit('Treffer %d statt %d für: %r' % (n, cnt, old[:90]))
    s = s.replace(old, new)
block = open(blk, encoding='utf-8').read() + '\n' + open(ui, encoding='utf-8').read() + '\n'
rep('function normSong(o, pk, nt) {', block + 'function normSong(o, pk, nt) {')
rep("  konSongNorm(o, v4, bars, pk, nt);                                                                     // KON: Blöcke, Ursprung (konsolidiert)\n",
    "  konSongNorm(o, v4, bars, pk, nt);                                                                     // KON: Blöcke, Ursprung (konsolidiert)\n"
    "  const ue = ueNorm(o.ue, v4.marks, nt); if (ue) v4.ue = ue;                                            // UE: Übergänge, Breaks, Einwürfe (§1.5)\n")
rep("  if (song.gb) ggbShift(song, n, d);                              // G-GB: der Export-Start wandert mit\n",
    "  if (song.gb) ggbShift(song, n, d);                              // G-GB: der Export-Start wandert mit\n"
    "  if (song.ue) ueShift(song, n, d);                               // UE: Einwürfe / freie Breaks rücken mit (Kanten folgen ihrer Marke)\n")
rep("  if (song.video && !o.keepMarks) vvDirClear(song, a, b);          // VV2\n}",
    "  if (song.video && !o.keepMarks) vvDirClear(song, a, b);          // VV2\n"
    "  if (song.ue && !o.keepMel) ueClear(song, a, b);                  // UE\n}")
rep("  return vvDirCutTo(song, a, b, {len: b - a, lanes, carrier, xp, mel, marks, own});   // VV2: + video",
    "  return ueCutTo(song, a, b, vvDirCutTo(song, a, b, {len: b - a, lanes, carrier, xp, mel, marks, own}));   // VV2: + video; UE: + ue")
rep("  for (const m of ch.marks || []) { const x = Object.assign({}, m, {a: n + m.a}); if (!keepIds || !x.id || song.marks.some(y => y.id === x.id)) x.id = newMarkId(song); song.marks.push(x); }\n",
    "  const wIds = [];                                                 // UE: unter welcher ID jede Marke des Stücks landet\n"
    "  for (const m of ch.marks || []) { const x = Object.assign({}, m, {a: n + m.a}); if (!keepIds || !x.id || song.marks.some(y => y.id === x.id)) x.id = newMarkId(song); song.marks.push(x); wIds.push(x.id); }\n")
rep("  if (ch.video) vvDirWrite(song, n, ch);                           // VV2\n}",
    "  if (ch.video) vvDirWrite(song, n, ch);                           // VV2\n"
    "  if (ch.ue) ueWrite(song, n, ch, wIds);                           // UE\n}")
rep("  if (song.video) vvDirTidy(song);                                 // VV2\n  konTidy(song);",
    "  if (song.video) vvDirTidy(song);                                 // VV2\n"
    "  if (song.ue) ueTidy(song);                                       // UE\n  konTidy(song);")
rep("      try { g3SongTick(song, b0, b1, off, E, insB, guard && sp.wrapAt != null ? sp.wrapAt : -Infinity); } catch (e) { tickErr(e); }   /* G3: Anlauf/Ausklang der Teile */\n",
    "      try { g3SongTick(song, b0, b1, off, E, insB, guard && sp.wrapAt != null ? sp.wrapAt : -Infinity); } catch (e) { tickErr(e); }   /* G3: Anlauf/Ausklang der Teile */\n"
    "      if (song.ue) try { ueSongTick(song, b0, b1, off, E, insB, guard && sp.wrapAt != null ? sp.wrapAt : -Infinity); } catch (e) { tickErr(e); }   // UE: Übergänge, Einwürfe, Breaks\n")
# Melodie des Songs: Break schweigt / Note endet am Break
rep("          if (mu && n.t >= mu.a - 1e-9 && n.t < mu.b - 1e-9) continue;\n          const t = Math.max(b2t(bb), AU.ctx.currentTime + .003);\n          let mk_ = null; if (arpOn(mi)) { mk_ = ARPC.clip(mi, n.n, n.n, null, n.v, t, Math.max(n.d, 1 / 32) * spb(), 'melody'); if (mk_ == null) continue; }",
    "          if (mu && n.t >= mu.a - 1e-9 && n.t < mu.b - 1e-9) continue;\n          let nd = n.d; if (song.ue) { nd = ueMelCut(song, mi, n.t, n.d); if (nd < 0) continue; }   // UE: Break\n          const t = Math.max(b2t(bb), AU.ctx.currentTime + .003);\n          let mk_ = null; if (arpOn(mi)) { mk_ = ARPC.clip(mi, n.n, n.n, null, n.v, t, Math.max(nd, 1 / 32) * spb(), 'melody'); if (mk_ == null) continue; }")
rep("          if (v) { const d = Math.max(n.d, 1 / 32) * spb(); v.release(t + d);",
    "          if (v) { const d = Math.max(nd, 1 / 32) * spb(); v.release(t + d);")
# scheduleTrack (Synth-Spuren)
rep("  const mu = takeMute(i);                                        // V2d′ (K2-21, 7.2): the target track's old notes are silent during the take\n",
    "  const mu = takeMute(i);                                        // V2d′ (K2-21, 7.2): the target track's old notes are silent during the take\n"
    "  const um = tr.kind === 'drum' ? null : ueMuteFor(i);           // UE: Break (null ohne song.ue)\n")
rep("      if (mu && mutedAt(mu, B)) continue;\n      let t = b2t(B + swingOffset(nt.t));\n      if (late) { if (t < now - RETRO_MAX - .02) continue; if (t < now) t = now; }\n      const dur = Math.max(nt.d, 1 / 32) * sp;",
    "      if (mu && mutedAt(mu, B)) continue;\n      if (um && ueMutedAt(um, B, nt.n)) continue;                  // UE\n      let t = b2t(B + swingOffset(nt.t));\n      if (late) { if (t < now - RETRO_MAX - .02) continue; if (t < now) t = now; }\n      const dur = Math.max(um ? ueDurCut(um, B, nt.d) : nt.d, 1 / 32) * sp;")
# scheduleDrums
rep("  const D1 = d1Map(clip);                                        /* D1: lanes with their own length / direction play below */\n",
    "  const D1 = d1Map(clip);                                        /* D1: lanes with their own length / direction play below */\n"
    "  const um = ueMuteFor(i), uk = !!(R.songPlay && S.song && S.song.ue);   // UE: „ersetzt“ / Break; derselbe Treffer nur einmal\n")
rep("      if (mu && mutedAt(mu, B)) continue;\n      const loopStart = cs + k * L;",
    "      if (mu && mutedAt(mu, B)) continue;\n      if (um && ueMutedAt(um, B, nt.n)) continue;                  // UE\n      const loopStart = cs + k * L;")
rep("  if (D1) d1Sched(D1, cs, from, to, late, now, mu, seed, ev);   /* D1 */",
    "  if (D1) d1Sched(D1, cs, from, to, late, now, mu, seed, ev, um);   /* D1; UE */")
rep("    const h = drumHit(e.n, e.v, e.t, 'clip', ex);\n    if (lsrc && h && h.log) h.log.src = lsrc;",
    "    if (uk && ueDup(e.n, e.t)) continue;                         // UE: der Übergang spielt diesen Treffer schon\n    const h = drumHit(e.n, e.v, e.t, 'clip', ex);\n    if (lsrc && h && h.log) h.log.src = lsrc;")
rep("function d1Sched(D, cs, from, to, late, now, mu, seed, ev) {", "function d1Sched(D, cs, from, to, late, now, mu, seed, ev, um) {")
rep("      if (mu && mutedAt(mu, B)) continue;\n      for (const h of DrumSeq.expandStep(nt, Math.floor(g / X.l.Ls), seed)) {",
    "      if (mu && mutedAt(mu, B)) continue;\n      if (um && ueMutedAt(um, B, nt.n)) continue;                  // UE\n      for (const h of DrumSeq.expandStep(nt, Math.floor(g / X.l.Ls), seed)) {")
rep("if (sl.gm === 36 && S.fxBus.pumpSrc === 'kick' && (src === 'clip' || src === 'pad')) onKickScheduled(t);",
    "if (sl.gm === 36 && S.fxBus.pumpSrc === 'kick' && (src === 'clip' || src === 'pad' || src === 'ue')) onKickScheduled(t);", 2)
# Spur-Kette: Break-Blende (Verstärkung 1 = bitgleich)
rep("  N.cut = c.createGain(); post.connect(N.cut); N.dryCut = false;",
    "  N.ueB = c.createGain(); post.connect(N.ueB);                   // UE: Break-Blende vor den Sends (Hall/Echo klingen aus); 1 = bitgleich\n"
    "  N.cut = c.createGain(); N.ueB.connect(N.cut); N.dryCut = false;")
rep("function duckReset(now) {\n", "function duckReset(now) {\n  ueReset(now);                                                    // UE: Break-Blenden zurück\n")
# Chor-Gruppe
rep("  G.air.connect(G.lvl); G.lvl.connect(G.guide); G.guide.connect(dest);",
    "  G.ueB = c.createGain(); G.air.connect(G.lvl); G.lvl.connect(G.ueB); G.ueB.connect(G.guide); G.guide.connect(dest);   // UE: Break-Blende")
rep("function g6pcGroupDrop(G) { for (const k of ['hp', 'mid', 'air', 'lvl', 'guide', 'pre', 'rev', 'dly']) { try { G[k].disconnect(); } catch (e) {} } G6PC.nodes -= 8; }",
    "function g6pcGroupDrop(G) { for (const k of ['hp', 'mid', 'air', 'lvl', 'guide', 'pre', 'rev', 'dly']) { try { G[k].disconnect(); } catch (e) {} } if (G.ueB) try { G.ueB.disconnect(); } catch (e) {} G6PC.nodes -= 8; }")
rep("  if (!r.chG || r.chG.c !== ctx) { r.chG = g6pcGroup(ctx, a, AU.masterSum, AU.hallIn, AU.echoIn); if (G6PC.tap)",
    "  if (!r.chG || r.chG.c !== ctx) { r.chG = g6pcGroup(ctx, a, AU.masterSum, AU.hallIn, AU.echoIn); if (S.song && S.song.ue) ueChorJoin(r.chG, r.i); if (G6PC.tap)")
# Song-Fläche: Zeichnen, Gesten
rep("  // the Positionsmarke: a white ▼ 8×5 at the top of its bar line (▶ starts there)\n",
    "  if (song && (song.ue || UE.drag)) { try { ueDraw(g, song, XB, W, H, ru, rh); } catch (e) { logErr(e); } } else UE.chips = [];   // UE: Chips, Einrasten\n"
    "  if (SV.btn && SV.btn.bUe) { const hb = UE.open || !(song && song.bars); if (SV.btn.bUe.hidden !== hb) SV.btn.bUe.hidden = hb; }   // UE: [Übergänge] nur mit Song\n"
    "  // the Positionsmarke: a white ▼ 8×5 at the top of its bar line (▶ starts there)\n")
rep("    const p = xy(e);\n    g = {id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: performance.now(), sx: SV.x, mode: null, lastX: e.clientX, lastT: performance.now(), p, chip: svChipAt(p.x, p.y)};",
    "    const p = xy(e);\n    if (UE.chips.length && ueChipGesture(w, e, p)) return;           // UE: Chip = Blatt / verschieben\n    g = {id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: performance.now(), sx: SV.x, mode: null, lastX: e.clientX, lastT: performance.now(), p, chip: svChipAt(p.x, p.y)};")
rep("  wrap.append(cv, empty, hint, fol, ban);\n",
    "  wrap.append(cv, empty, hint, fol, ban);\n"
    "  // UE: [Übergänge] schwebt unten rechts in der Song-Fläche (wie [Folgen]); die Song-Leiste bleibt wie sie ist\n"
    "  const bUe = el('button', 'rb sv-ue', '<span class=\"d\">◆</span><span class=\"t\">ÜBERG.</span>'); bUe.setAttribute('aria-label', 'Übergänge, Breaks und Einwürfe'); bUe.setAttribute('aria-pressed', 'false');\n"
    "  bUe.addEventListener('pointerdown', e => e.stopPropagation()); UE.el = null; UE.open = false; ueCssOnce();\n"
    "  onTap(bUe, () => { if (!songHasContent()) { toast('Noch kein Song'); return; } ueToggle(); haptic('tick'); }); wrap.appendChild(bUe);\n")
rep("  SV.btn = {bRec, bPlay, bMel, bMt, bBack, bHome, bLoop, bGl, sw};", "  SV.btn = {bRec, bPlay, bMel, bMt, bBack, bHome, bLoop, bGl, bUe, sw};")
rep("  if (!on) { SV.mark = null; SV.copy = null; SV.cell = null; svHintFree(); }",
    "  if (!on) { SV.mark = null; SV.copy = null; SV.cell = null; svHintFree(); if (UE.open) ueToggle(false); }")
rep("Object.assign(SYNQUENZER, vv4bdApi());                      // VV4-B/D\n",
    "Object.assign(SYNQUENZER, vv4bdApi());                      // VV4-B/D\nObject.assign(SYNQUENZER, UE_API);                          // UE-C/D: Übergänge, Breaks, Einwürfe\n")
rep("  SV.bankVp = side || avail / (8 + 2) < 26 - .5;",
    "  SV.bankVp = side || (avail + (UE.open ? UE.padH | 0 : 0)) / (8 + 2) < 26 - .5 || !!SV.pages;   // UE: die offene Übergangs-Leiste ändert die Song-Leiste nicht (nur echte Seiten)")
open(out, 'w', encoding='utf-8').write(s)
print('ok', len(s))
