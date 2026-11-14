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
# 2) Haken in SPK8 bassNoten: Oktave je Note nach dem Leck-Schutz (nur behaltene Noten; neue Zeile direkt nach der Sicherheits-Zeile)
a = "q.conf = +Math.min(q.conf, Math.max(0.3, Math.min(1, 0.3 + 0.7 * g / o8.cf))).toFixed(2); });\n"
i = h.find("if (o8.cf && o8.gS) found.forEach((q, k) => {")
assert i > 0 and h.count(a) == 1 and h.find(a, i) > i
j = h.find(a, i) + len(a)
h = h[:j] + "    if (typeof spk10Okt === 'function') spk10Okt(Z2, d, found2, {R, hopS});   /* SPK10: Oktave je Note unter C2 (nach dem Leck-Schutz) */\n" + h[j:]
# 3) Haken in spk8WUrl: spk10Okt in den Worker-Text
rep("new Blob([src, ';' + spk8DspMake.toString() + ';'], {type: 'application/javascript'})",
    "new Blob([src, ';' + spk8DspMake.toString() + ';' + (typeof spk10Okt === 'function' ? spk10Okt.toString() + ';' : '') /* SPK10 */], {type: 'application/javascript'})")
open(os.path.join(D, 'index.html'), 'w', encoding='utf8').write(h)
print('ok', len(h))
