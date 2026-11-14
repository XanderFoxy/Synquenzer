#!/usr/bin/env python3
# SPK2 einbauen: basis2.html + Einhänge-Zeilen (Kommentar „SPK2“) im SPK1-Block + Block spk2-block.js direkt nach „/* SPK1-END */“
import os, sys
D = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(D, '..', 'basis2.html'), encoding='utf-8').read()
blk = open(os.path.join(D, 'spk2-block.js'), encoding='utf-8').read()
H = [
  # Kern: SPK2-Ergänzung erzeugen (Innereien hineinreichen)
  ("  return {on, stft, istft, specInfo, docs, lowSplit};\n}\n/* ---------- Hauptfaden: Worker",
   "  const Z2 = typeof spk2DspMake === 'function' ? spk2DspMake({V, magsAt, hpss, f0Sum, comb, ramp, medLine, win, stft, istft, selFn, Fn, NBn}) : null;   // SPK2\n  return {on, stft, istft, specInfo, docs, lowSplit, Z2};   // SPK2: Z2 für Messungen\n}\n/* ---------- Hauptfaden: Worker"),
  # Tiefband: Grundton-Verfolgung über die Note + Obertonkamm-Modell
  ("  function lowSplit(d, cen, Nf, fmax, r, trust) {   // trust: der Nutzer sagt „hier ist Bass“ → Kamm ohne Zweifel-Schranke\n",
   "  function lowSplit(d, cen, Nf, fmax, r, trust) {   // trust: der Nutzer sagt „hier ist Bass“ → Kamm ohne Zweifel-Schranke\n    if (Z2 && !Z2.aus) return Z2.lowSplit(d, cen, Nf, fmax, r, trust);   // SPK2\n"),
  # Projektion fein → Basis mit Fensterantwort
  ("  function projRow(X, S, o, Kf, r, k) {\n",
   "  function projRow(X, S, o, Kf, r, k) {\n    if (Z2 && !Z2.aus) return Z2.projLk(X, S, o, Kf, r, k);   // SPK2: Leckage der Basis-FFT beachten\n"),
  # Worker-Text: SPK2-Kern mitschicken
  ("    const src = vsDspMake.toString() + ';' + spk1DspMake.toString() + ';const K = spk1DspMake(vsDspMake());onmessage = e => K.on(e.data, (m, tr) => postMessage(m, tr || []));';\n",
   "    const src = vsDspMake.toString() + ';' + spk1DspMake.toString() + ';' + (typeof spk2DspMake === 'function' ? spk2DspMake.toString() : '') + ';const K = spk1DspMake(vsDspMake());onmessage = e => K.on(e.data, (m, tr) => postMessage(m, tr || []));';   // SPK2: Kern-Ergänzung mitschicken\n"),
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
