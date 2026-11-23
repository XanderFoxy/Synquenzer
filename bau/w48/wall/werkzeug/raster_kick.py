# Je Schlag: Anstieg der Tief-Hülle (Kick) im Fenster -30..+40 ms suchen; Beginn = 20 % des Anstiegs.
import sys, numpy as np
sys.path.insert(0, __import__('os').path.dirname(__file__))
from gemein import lade, SR, LIED
from raster_mess import band
x = np.asarray(lade(sys.argv[1] if len(sys.argv) > 1 else 'mix-w2'), np.float64)
T1, SCHLAG, D = LIED['takt1_s'], LIED['takt_s'] / LIED['takt'][0], LIED['dauer_s']
for name, lo, hi, minrise in [('kick', 30, 120, 6.0), ('snare', 150, 400, 6.0)]:
    y = band(x, lo, hi); h = SR // 2000   # 0,5 ms
    n = len(y) // h; env = np.abs(y[:n*h]).reshape(n, h).max(1)
    edb = 20*np.log10(env + 1e-6)
    devs = []
    k = 0
    while T1 + k*SCHLAG < D - .1:
        tb = T1 + k*SCHLAG; i0 = int((tb - .03)*2000); i1 = int((tb + .04)*2000)
        if i0 < 40: k += 1; continue
        vor = edb[i0-40:i0].max()   # 20 ms davor
        seg = edb[i0:i1]; pk = seg.max(); jp = i0 + int(np.argmax(seg))
        if pk - vor >= minrise:
            thr = vor + .2*(pk - vor) if False else 20*np.log10(10**(vor/20) + .2*(10**(pk/20) - 10**(vor/20)))
            j = i0
            while j < jp and edb[j] < thr: j += 1
            devs.append((tb, (j/2000 - tb)*1000))
        k += 1
    d = np.array([v for _, v in devs])
    print(name, 'Schläge mit Anschlag', len(d), 'Median %+.2f ms  p5 %+.1f  p95 %+.1f  |max| %.1f' % (np.median(d), *np.percentile(d, [5, 95]), np.abs(d).max()))
    for a in LIED['abschnitte']:
        sel = [v for t, v in devs if a['von_s'] <= t < a['bis_s']]
        if sel: print('   %-20s n=%3d Median %+6.2f  p5 %+6.1f p95 %+6.1f' % (a['name'], len(sel), np.median(sel), *np.percentile(sel, [5, 95])))
