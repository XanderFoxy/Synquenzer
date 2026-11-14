#!/usr/bin/env python3
# SPK9: baut index.html = basis.html (4.63.0) + spk9-block.js nach /* SPK7-END */ + 4 Haken „SPK9“ (je Anker genau 1×)
import sys, pathlib
d = pathlib.Path(__file__).resolve().parent
src = (d / 'basis.html').read_text(encoding='utf-8')
blk = (d / 'spk9-block.js').read_text(encoding='utf-8').rstrip('\n') + '\n'
out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else d / 'index.html'
R = [
  # 1) Block an eigener Stelle (nach SPK7)
  ('/* SPK7-END */\n', '/* SPK7-END */\n' + blk),
  # 2) Kern: nach SPK6 im spk1DspMake (eigene Zeile, nicht neben SPK8)
  ("  if (Z2 && typeof spk6DspMake === 'function') Z2.s6 = spk6DspMake(",
   "  if (Z2 && typeof spk9DspMake === 'function') spk9DspMake(Z2);   /* SPK9: Legato-Noten (Tonhöhen-Stufen) */\n  if (Z2 && typeof spk6DspMake === 'function') Z2.s6 = spk6DspMake("),
  # 3) Worker: Text mitschicken
  ("(typeof spk5DspMake === 'function' ? spk5DspMake.toString() + ';' : '') /* SPK5 */ + 'const K = spk1DspMake(vsDspMake());",
   "(typeof spk5DspMake === 'function' ? spk5DspMake.toString() + ';' : '') /* SPK5 */ + (typeof spk9DspMake === 'function' ? spk9DspMake.toString() + ';' : '') /* SPK9 */ + 'const K = spk1DspMake(vsDspMake());"),
  # 4) Noten finden (einstimmig): Segmentierung aus SPK9, sonst SPK2
  ("    const found = segNotes({f0: Tr.f0, sc, ok, i0, F, hopS: hop / sr, O, G: gridOf(d), Y, K, df, fb: R.fb}).filter(q => q.a >= R.ta - 0.05 && q.a < R.tb);\n",
   "    const found = (typeof opt.seg9 === 'function' ? opt.seg9 : segNotes)({f0: Tr.f0, sc, ok, i0, F, hopS: hop / sr, O, G: gridOf(d), Y, K, df, fb: R.fb, art: artOf(d, lid)}).filter(q => q.a >= R.ta - 0.05 && q.a < R.tb);   /* SPK9: Legato-Noten */\n"),
  # 5) Überall finden (SPK2 finden, von SPK3 für alles außer Bass benutzt): dieselben Stufen
  ("    const found = segNotes({f0, sc, ok, i0: 0, F, hopS: hop / sr, O, G: gridOf(d), Y: null, K, df, fb});\n",
   "    const found = (typeof opt.seg9 === 'function' ? opt.seg9 : segNotes)({f0, sc, ok, i0: 0, F, hopS: hop / sr, O, G: gridOf(d), Y: null, K, df, fb, art});   /* SPK9: Legato-Noten auch in „Überall finden“ */\n"),
]
for a, b in R:
    n = src.count(a)
    if n != 1: sys.exit('Anker %d× gefunden: %s' % (n, a[:80]))
    src = src.replace(a, b)
out.write_text(src, encoding='utf-8')
print('ok', out, len(src.encode('utf-8')))
