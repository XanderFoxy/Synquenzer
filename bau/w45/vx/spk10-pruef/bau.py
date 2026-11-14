# SPK10-Bau: basis.html (4.64.0) + spk10-block.js nach /* SPK8-END */ + 2 Haken „SPK10“ im SPK8-Block (je eine Zeile, typeof-Schutz)
import os
D = os.path.dirname(os.path.abspath(__file__))
h = open(os.path.join(D, 'basis.html'), encoding='utf8').read()
blk = open(os.path.join(D, 'spk10-block.js'), encoding='utf8').read().rstrip('\n') + '\n'
def rep(a, b):
    global h
    assert h.count(a) == 1, a[:80]
    h = h.replace(a, b)
# 1) Block direkt nach SPK8-END
rep('/* SPK8-END */\n', '/* SPK8-END */\n' + blk)
# 2) Haken in SPK8 bassNoten: Oktave je Note nach den Notengrenzen (neue Zeile direkt nach „const found = …“)
a = "K, df, fb: R.fb}).filter(q => q.a >= R.ta - 0.05 && q.a < R.tb);\n"
i = h.find("const found = H2.segNotes({f0: T.f0, sc, ok, i0, F, hopS, O, G: H2.gridOf(d), Y: null /* keine Oktav-Verdopplung")
j = h.find(a, i) + len(a)
h = h[:j] + "    if (typeof spk10Okt === 'function') spk10Okt(Z2, d, found, {R, hopS});   /* SPK10: Oktave je Note mit kurzem Fenster */\n" + h[j:]
# 3) Haken in spk8WUrl: spk10Okt in den Worker-Text
rep("new Blob([src, ';' + spk8DspMake.toString() + ';'], {type: 'application/javascript'})",
    "new Blob([src, ';' + spk8DspMake.toString() + ';' + (typeof spk10Okt === 'function' ? spk10Okt.toString() + ';' : '') /* SPK10 */], {type: 'application/javascript'})")
open(os.path.join(D, 'index.html'), 'w', encoding='utf8').write(h)
print('ok', len(h))
