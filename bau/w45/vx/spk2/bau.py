#!/usr/bin/env python3
# SPK2 einbauen: basis2.html + Einhänge-Zeilen (Kommentar „SPK2“) im SPK1-Block + Block spk2-block.js direkt nach „/* SPK1-END */“
import os, sys
D = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(D, '..', 'basis2.html'), encoding='utf-8').read()
blk = open(os.path.join(D, 'spk2-block.js'), encoding='utf-8').read()
H = [
  # Kern: SPK2-Ergänzung erzeugen (Innereien hineinreichen)
  ("  return {on, stft, istft, specInfo, docs, lowSplit};\n}\n/* ---------- Hauptfaden: Worker",
   "  const Z2 = typeof spk2DspMake === 'function' ? spk2DspMake({V, magsAt, hpss, f0Sum, comb, ramp, medLine, win, stft, istft, selFn, Fn, NBn, magPair, render, mixOf, transfer, uBegin, uEnd, lay, tick}) : null;   // SPK2 (Auftrag 2: Noten brauchen render/transfer/Undo)\n  return {on, stft, istft, specInfo, docs, lowSplit, Z2};   // SPK2: Z2 für Messungen\n}\n/* ---------- Hauptfaden: Worker"),
  # Tiefband: Grundton-Verfolgung über die Note + Obertonkamm-Modell
  ("  function lowSplit(d, cen, Nf, fmax, r, trust) {   // trust: der Nutzer sagt „hier ist Bass“ → Kamm ohne Zweifel-Schranke\n",
   "  function lowSplit(d, cen, Nf, fmax, r, trust) {   // trust: der Nutzer sagt „hier ist Bass“ → Kamm ohne Zweifel-Schranke\n    if (Z2 && Z2.opt.an) return Z2.lowSplit(d, cen, Nf, fmax, r, trust);   // SPK2\n"),
  # Projektion fein → Basis mit Fensterantwort
  ("  function projRow(X, S, o, Kf, r, k) {\n",
   "  function projRow(X, S, o, Kf, r, k) {\n    if (Z2 && Z2.opt.an) return Z2.projLk(X, S, o, Kf, r, k);   // SPK2: Leckage der Basis-FFT beachten\n"),
  # Worker-Text: SPK2-Kern mitschicken
  ("    const src = vsDspMake.toString() + ';' + spk1DspMake.toString() + ';const K = spk1DspMake(vsDspMake());onmessage = e => K.on(e.data, (m, tr) => postMessage(m, tr || []));';\n",
   "    const src = vsDspMake.toString() + ';' + spk1DspMake.toString() + ';' + (typeof spk2DspMake === 'function' ? spk2DspMake.toString() : '') + ';const K = spk1DspMake(vsDspMake());onmessage = e => K.on(e.data, (m, tr) => postMessage(m, tr || []));';   // SPK2: Kern-Ergänzung mitschicken\n"),
]
H += [
  # Undo: Noten (teil2) gehören mit in den Schritt
  ("  function uBegin(d, label) { d.u = {label, meta: JSON.stringify(d.meta.layers), rest: JSON.stringify(d.meta.rest), st: new Map(), bytes: 0}; }\n",
   "  function uBegin(d, label) { d.u = {label, meta: JSON.stringify(d.meta.layers), rest: JSON.stringify(d.meta.rest), t2: JSON.stringify(d.meta.teil2 || null), st: new Map(), bytes: 0}; }   // SPK2: teil2 (Noten) im Undo\n"),
  ("    const back = {label: u.label, meta: JSON.stringify(d.meta.layers), rest: JSON.stringify(d.meta.rest), st: new Map(), bytes: u.bytes};\n",
   "    const back = {label: u.label, meta: JSON.stringify(d.meta.layers), rest: JSON.stringify(d.meta.rest), t2: JSON.stringify(d.meta.teil2 || null), st: new Map(), bytes: u.bytes};   // SPK2: teil2\n"),
  ("    d.meta.layers = JSON.parse(u.meta); d.meta.rest = JSON.parse(u.rest);\n",
   "    d.meta.layers = JSON.parse(u.meta); d.meta.rest = JSON.parse(u.rest); if (u.t2 != null) { const t2 = JSON.parse(u.t2); if (t2) d.meta.teil2 = t2; }   // SPK2: Noten zurück\n"),
  # Kern: neue Aufträge (Noten, Zuordnen, Überall finden)
  ("      default: throw new Error('op ' + m.op);\n    }\n  }\n  function on(m, emit) {\n",
   "      default: if (Z2 && Z2.ops && Z2.ops[m.op]) return Z2.ops[m.op](d, m, emit, info);   // SPK2: Noten / Zuordnen / Überall finden\n        throw new Error('op ' + m.op);\n    }\n  }\n  function on(m, emit) {\n"),
  # Seite: Optionszeile „Noten“, Tipp im Noten-Werkzeug, Kästchen im Overlay, Hinweis
  ("  const st = U.st = el('div', 'spk1-st', ''), ac = U.ac = el('div', 'spk1-ac')",
   "  if (typeof spk2Pane === 'function') spk2Pane(U, pane, sl);   // SPK2: Noten-Werkzeug\n  const st = U.st = el('div', 'spk1-st', ''), ac = U.ac = el('div', 'spk1-ac')"),
  ("function spk1ToolUp(U, G) {\n  U.tmp = null;\n",
   "function spk1ToolUp(U, G) {\n  U.tmp = null;\n  if (G.tool === 'noten' && typeof spk2NoteUp === 'function') return spk2NoteUp(U, G);   // SPK2: Noten wählen\n"),
  ("  x.setLineDash([]);\n  const p = U.pos != null ? U.pos : U.cur, px = Math.round(spk1X(U, p)) + 0.5;\n",
   "  x.setLineDash([]);\n  if (typeof spk2OvDraw === 'function') spk2OvDraw(U, x);   // SPK2: Noten-Kästchen\n  const p = U.pos != null ? U.pos : U.cur, px = Math.round(spk1X(U, p)) + 0.5;\n"),
  ("aehn: 'Beispiel ziehen oder antippen'}[k];\n",
   "aehn: 'Beispiel ziehen oder antippen', noten: 'Note antippen oder Kästchen ziehen'}[k];   // SPK2: Noten\n"),
]
extra = os.path.join(D, 'haken2.py')
if os.path.exists(extra):
  exec(open(extra, encoding='utf-8').read())
for a, b in H:
  c = src.count(a)
  if c != 1: sys.exit('Haken nicht eindeutig (%d): %r' % (c, a[:80]))
  src = src.replace(a, b)
M = '/* SPK1-END */\n'
if src.count(M) != 1: sys.exit('SPK1-END fehlt')
src = src.replace(M, M + blk)
open(os.path.join(D, 'index.html'), 'w', encoding='utf-8').write(src)
print('ok', len(src))
