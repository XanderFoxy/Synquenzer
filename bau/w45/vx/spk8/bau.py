# SPK8 Bau: index.html = basis.html (4.62.0) + spk8-block.js direkt nach „SPK4-END“ + 2 Haken „SPK8“
import sys
B = open('basis.html', encoding='utf-8').read(); blk = open('spk8-block.js', encoding='utf-8').read().rstrip('\n') + '\n'
def rep(s, a, b):
    assert s.count(a) == 1, ('Stelle nicht eindeutig', a[:80]); return s.replace(a, b)
h = B
a = '/* ===== SPK4-END ===== */\n'; h = rep(h, a, a + blk)
a = "  if (Z2 && typeof spk4DspMake === 'function') spk4DspMake(Z2);   // SPK4: mehrstimmige Noten (Pads, Rest, Original)\n"
h = rep(h, a, a + "  if (Z2 && typeof spk8DspMake === 'function') spk8DspMake(Z2);   /* SPK8: Noten auf der Bass-Ebene (Verfolgung wie im Zerlegen) */\n")
a = "    const w = new Worker(u); setTimeout(() => { try { URL.revokeObjectURL(u); } catch (e) {} }, 30000);\n"
i = h.index('function spk1Worker() {'); j = h.index(a, i); assert j - i < 2000, 'Worker-Zeile nicht in spk1Worker'
h = h[:j] + "    const w = new Worker(typeof spk8WUrl === 'function' ? spk8WUrl(src, u) : u) /* SPK8: Kern-Ergänzung mitschicken */; setTimeout(() => { try { URL.revokeObjectURL(u); } catch (e) {} }, 30000);\n" + h[j + len(a):]
open('index.html', 'w', encoding='utf-8').write(h); print('ok', len(h) - len(B), 'Zeichen mehr')
