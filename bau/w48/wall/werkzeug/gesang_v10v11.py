# Gesangsanteil im Master schätzen (Master minus Musik v11, Gewicht je Fassung aus dem Intro) und v10/v11 vergleichen.
import sys, numpy as np
sys.path.insert(0, __import__('os').path.dirname(__file__))
from gemein import lade, SR, LIED, rms_db, mmss
from raster_mess import band
mu = np.asarray(lade('mix-w2'), np.float64)
def ges(m):
    x = np.asarray(lade(m), np.float64); s = slice(int(2 * SR), int(30 * SR))
    g = np.dot(x[s], mu[s]) / np.dot(mu[s], mu[s]); return x - g * mu
V10 = ges('master-v10'); V11 = ges('master-v11')
np.save('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall/roh/ges-v10.npy', V10.astype(np.float32))
np.save('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall/roh/ges-v11.npy', V11.astype(np.float32))
B = {}
for nm, lo, hi in [('voll', 80, 16000), ('mitte', 300, 3000), ('hoch', 4000, 12000)]:
    a = rms_db(band(V10, lo, hi), .1, .2); b = rms_db(band(V11, lo, hi), .1, .2); B[nm] = (a, b)
a, b = B['mitte']; d = b - a; akt = np.maximum(a, b) > -40
print('Mitte: Median Diff aktiv %.1f dB' % np.median(d[akt]))
idx = np.where(akt & (np.abs(d - np.median(d[akt])) > 4))[0]
grp = []
for i in idx:
    if grp and i - grp[-1][-1] <= 4: grp[-1].append(i)
    else: grp.append([i])
for g in grp:
    if len(g) < 3: continue
    t0, t1 = g[0] / 10, (g[-1] + 1) / 10
    print('%6.1f-%6.1f %s n=%2d  Diff %+5.1f  v10 %5.1f v11 %5.1f   hoch v10 %5.1f v11 %5.1f' % (t0, t1, mmss(t0), len(g), np.median(d[g]), np.median(a[g]), np.median(b[g]), np.median(B['hoch'][0][g]), np.median(B['hoch'][1][g])))
