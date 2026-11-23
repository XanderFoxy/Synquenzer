# Pumpen/Pegelsprünge innerhalb gehaltener Töne: Ende-Pegel schwankt, während Timing ruhig ist.
import sys, json, numpy as np
sys.path.insert(0, __import__('os').path.dirname(__file__))
from gemein import ROH, mmss, silbe_bei, wort_text
from numpy.lib.stride_tricks import sliding_window_view as sw
t, eE, eT, eO, dev, g = np.load(ROH + '/pruef_dev.npy')
d = eE - eT  # ohne lokalen Ausgleich: genau das, was die Bearbeitung am Pegel macht
W = 30  # 150 ms
akt = eT > np.percentile(eT, 99) - 25
K = []
i = 0
spT = sw(eT, W).max(1) - sw(eT, W).min(1)
spD = sw(d, W).max(1) - sw(d, W).min(1)
ok = sw(akt, W).all(1)
cand = np.where(ok & (spT < 4) & (spD > 5))[0]
last = -1e9
for i in cand:
    if t[i] - last < .3: continue
    last = t[i]; j, dd = silbe_bei(t[i]); w, z = wort_text(j)
    K.append(dict(art='Pumpen', von_s=float(t[i]), bis_s=float(t[i] + W * .005), spanne_db=float(spD[i]), timing_db=float(spT[i]), wort=w))
    print('%7.2f %s  Bearbeitung schwankt %.1f dB in 150 ms (Aufnahme ruhig %.1f dB)  %s' % (t[i], mmss(t[i]), spD[i], spT[i], w))
json.dump(K, open(ROH + '/pruef_kand_pump.json', 'w'), indent=0)
print(len(K))
