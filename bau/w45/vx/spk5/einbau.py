#!/usr/bin/env python3
# SPK5: baut index.html neu aus basis5.html + spk5-block.js (nach „/* GD1-END */“) + Haken „SPK5“. Jede Ersetzung genau einmal.
import sys, pathlib
here = pathlib.Path(__file__).resolve().parent
src = (here.parent / 'basis5.html').read_text(encoding='utf-8')
blk = (here / 'spk5-block.js').read_text(encoding='utf-8')
out = sys.argv[1] if len(sys.argv) > 1 else str(here / 'index.html')

H = [
 # Farbtabelle: gewählte Farbstufe
 ("function spk1Lut() {   // Farbtabelle aus den App-Farben: Anzeige-Schwarz → Blau → --t2 → --t1 → --amber → --sel\n",
  "function spk1Lut() {   // Farbtabelle aus den App-Farben: Anzeige-Schwarz → Blau → --t2 → --t1 → --amber → --sel\n"
  "  { const o5 = typeof spk5Lut === 'function' ? spk5Lut() : null; if (o5) return o5; }   // SPK5: gewählte Farbstufe (Ansicht ▾ → Farben)\n"),
 # Knopf-Text
 ("U.b_zerl.textContent = U.busy === 'zerlegen' || U.busy === 'profi' /* KI1 */ ? '■ Abbrechen' : 'Zerlegen';",
  "if (typeof spk5ZerlLab === 'function') spk5ZerlLab(U); /* SPK5: Zerlegen · Auswahl/alles */ else U.b_zerl.textContent = U.busy === 'zerlegen' || U.busy === 'profi' /* KI1 */ ? '■ Abbrechen' : 'Zerlegen';"),
 # Überlagerung
 ("  if (typeof spk2OvDraw === 'function') spk2OvDraw(U, x);   // SPK2: Noten-Kästchen\n",
  "  if (typeof spk5Fd === 'function' && spk5Fd(U) > SPK5_FD_SKIP) { if (typeof spk2LpOv === 'function') spk2LpOv(U, x); } else if (typeof spk2OvDraw === 'function') spk2OvDraw(U, x);   // SPK2: Noten-Kästchen · SPK5: in der Noten-Ansicht zeichnet die Notenrolle die Kästchen\n"
  "  if (typeof spk5OvDraw === 'function') spk5OvDraw(U, x);   // SPK5: Fortschritt über dem Bereich, Notenrolle\n"),
 # SPK5 Auftrag 2: Regler Spektrum ↔ Noten in der Werkzeugleiste
 ("  sh.append(hd, tl, co, ru, ky, mn, op, st, ac, ly, sp);\n",
  "  sh.append(hd, tl, co, ru, ky, mn, op, st, ac, ly, sp);\n  if (typeof spk5UiAdd === 'function') spk5UiAdd(U);   // SPK5: Überblenden Spektrum ↔ Noten\n"),
 # SPK5 Auftrag 2: Noten-Ansicht – Tipp auf eine Note
 ("  if (G.tool === 'noten' && typeof spk2NoteUp === 'function') return spk2NoteUp(U, G);   // SPK2: Noten wählen\n",
  "  if (typeof spk5Tap === 'function' && spk5Tap(U, G)) return;   // SPK5: Noten-Ansicht – Note antippen = Gehört zu …\n  if (G.tool === 'noten' && typeof spk2NoteUp === 'function') return spk2NoteUp(U, G);   // SPK2: Noten wählen\n"),
 # Zerlegen-Tipp
 ("async function spk1Zerl(U) {\n",
  "async function spk1Zerl(U) {\n"
  "  if (typeof spk5Zerl === 'function' && spk5Zerl(U)) return;   // SPK5: Auswahl oder alles, Fortschritt sichtbar, Ergebnis gemeldet\n"),
 # Solo einer neuen Ebene = sofort hören
 ("    case 'solo': case 'mute': { const o = lid === 'rest' ? U.meta.rest : U.meta.layers.find(x => x.id === lid); if (o) spk1Layer(U, a, lid, !o[a]); return; }",
  "    case 'solo': case 'mute': { const o = lid === 'rest' ? U.meta.rest : U.meta.layers.find(x => x.id === lid); if (o) { const nv = !o[a], pr = spk1Layer(U, a, lid, nv); if (a === 'solo' && nv && typeof spk5Solo === 'function') pr.then(() => spk5Solo(U, lid)); } return; }   // SPK5: Solo einer neuen Ebene = sofort hören"),
 # Ansicht ▾ → Farben
 ("    if (typeof spk2ViewLp === 'function') spk2ViewLp(U, dd);   // SPK2: Loop setzen\n",
  "    if (typeof spk2ViewLp === 'function') spk2ViewLp(U, dd);   // SPK2: Loop setzen\n"
  "    if (typeof spk5ViewFarben === 'function') spk5ViewFarben(U, dd);   // SPK5: Farbstufen\n"),
 # Kern: Ops anhängen
 ("  if (Z2 && typeof spk3DspMake === 'function') spk3DspMake(Z2);   // SPK3: Tiefband mit Kick-Vorlage (ersetzt Z2.lowSplit, schaltet es ein)\n",
  "  if (Z2 && typeof spk3DspMake === 'function') spk3DspMake(Z2);   // SPK3: Tiefband mit Kick-Vorlage (ersetzt Z2.lowSplit, schaltet es ein)\n"
  "  if (typeof spk5DspMake === 'function') spk5DspMake({Z2, KI1K, BT, zerlegen, selFn, magsAt, stripe, tileArr, tidy, uTouch, uBegin, uEnd, uAbort, verUp, newLayer, Fn, NBn, TRn, tick, get, soon});   // SPK5: Zerlegen/Profi nur in der Auswahl, Anteile je Ebene\n"),
 # Worker-Text
 ("(typeof ki1KernMake === 'function' ? ki1KernMake.toString() + ';' : '') /* KI1 */ + 'const K = ",
  "(typeof ki1KernMake === 'function' ? ki1KernMake.toString() + ';' : '') /* KI1 */ + (typeof spk5DspMake === 'function' ? spk5DspMake.toString() + ';' : '') /* SPK5 */ + 'const K = "),
 # Zerlegen: nur die Streifen der Auswahl
 ("      if (job && !job.fertig && job.lids && job.lids.join() === zl.join() && o.weiter !== false) s0 = Math.min(NS, job.k | 0);   // Weiterrechnen nach Unterbrechung\n",
  "      if (job && !job.fertig && job.lids && job.lids.join() === zl.join() && o.weiter !== false) s0 = Math.min(NS, job.k | 0);   // Weiterrechnen nach Unterbrechung\n"
  "      const sE = o.sB != null ? Math.min(NS, (o.sB | 0) + 1) : NS; if (o.sA > s0) s0 = Math.min(sE, o.sA | 0);   // SPK5: nur die Streifen der Auswahl\n"),
 ("      for (let s = s0; s < NS; s++) {\n        if (d.zStop) throw new Error('abgebrochen');\n",
  "      for (let s = s0; s < sE; s++) {   // SPK5: sE\n        if (d.zStop) throw new Error('abgebrochen');\n"),
 ("        emit({qid, prog: 0.3 + 0.7 * (s + 1) / NS, stufe: 'Trennen'}); await tick();",
  "        emit({qid, prog: 0.3 + 0.7 * (s + 1 - s0) / Math.max(1, sE - s0), stufe: 'Trennen'}); await tick();   // SPK5: Fortschritt der zu rechnenden Streifen"),
 # KI1: Teile für die Auswahl herausgeben
 ("  return {op};\n}\n\n/* Bedienung: schmaler Teil",
  "  return {op, h: {ask, mags, magsRs, backRs, CORE, CTX, SRM}};   // SPK5: Teile für die Profi-Trennung in der Auswahl\n}\n\n/* Bedienung: schmaler Teil"),
 ("    const r = await spk1Call('profi', {doc, how: KI1.how, rev: KI1.REV, neu: !!o.neu}, null, {prog: (p, st) => { if (o.prog) o.prog('rechnen', p, st); }});",
  "    const r = await spk1Call(o.sel ? 'spk5Profi' : 'profi', {doc, how: KI1.how, rev: KI1.REV, neu: !!o.neu, sel: o.sel || null}, null, {prog: (p, st) => { if (o.prog) o.prog('rechnen', p, st); }});   // SPK5: mit Auswahl nur dort"),
 ("try { const mt = r.meta; if (!r.weiter && mt",
  "try { const mt = r.meta; if (!o.sel /* SPK5 */ && !r.weiter && mt"),
 ("async function ki1Start(U) {\n  if (U.busy || !SPK1.doc) return;",
  "async function ki1Start(U) {\n  if (typeof spk5Run === 'function') return spk5Run(U, 'profi');   // SPK5: Auswahl oder alles, Fortschritt über dem Bereich\n  if (U.busy || !SPK1.doc) return;"),
 ("    dd.appendChild(el('h5', '', 'Ganzes Stück trennen'));",
  "    dd.appendChild(el('h5', '', U.sel.length ? 'Nur die Auswahl trennen' : 'Ganzes Stück trennen'));   // SPK5"),

 # Guide-Texte: Zerlegen/Profi wirken auf die Auswahl; Farbstufen
 ("„Zerlegen“ trennt das ganze Stück in Drums, Bass, Gesang und Rest; „Verfeinern“ rechnet eine Auswahl genauer nach („Was steckt hier?“).',\n",
  "„Zerlegen“ trennt die Auswahl (ohne Auswahl das ganze Stück) in Drums, Bass, Gesang und Rest; „Verfeinern“ rechnet eine Auswahl genauer nach („Was steckt hier?“). „Ansicht ▾ → Farben“ wählt die Farbstufe (Glut, Magma, Grün-Blau, Graustufen, Blau).',   // SPK5\n"),
 ("verfeinern ebenen stems bass gesang drums auswahl pinsel harmonische obertöne',\n",
  "verfeinern ebenen stems bass gesang drums auswahl pinsel harmonische obertöne farben farbstufe glut magma graustufen',   // SPK5\n"),
 ("d: 'Trennt das ganze Stück genauer als „Zerlegen“",
  "d: /* SPK5 */ 'Trennt die Auswahl (ohne Auswahl das ganze Stück) genauer als „Zerlegen“"),
 # Block
 ("/* GD1-END */\n", "/* GD1-END */\n" + blk),
]
for a, b in H:
    n = src.count(a)
    if n != 1: sys.exit('Haken %d× gefunden: %r' % (n, a[:90]))
    src = src.replace(a, b)
pathlib.Path(out).write_text(src, encoding='utf-8')
print('ok', out, len(H), 'Ersetzungen')
