# v10 gegen v11: Hauptstimme (haupt-v10 vs ende) und Master. Pegel je 100 ms, Ähnlichkeit, deutliche Unterschiede zeitlich verorten.
import sys, numpy as np
sys.path.insert(0, __import__('os').path.dirname(__file__))
from gemein import lade, SR, LIED, rms_db, mmss
def info(n):
    x = np.asarray(lade(n), np.float64); print(n, 'RMS %.1f dB' % (10*np.log10(np.mean(x*x)+1e-12)), 'Spitze %.2f' % np.abs(x).max())
    return x
a = info('haupt-v10'); b = info('ende')
# Versatz grob prüfen (Kreuzkorrelation der Hülle)
ea = rms_db(a, .005, .02); eb = rms_db(b, .005, .02)
la = np.maximum(ea, -60) + 60; lb = np.maximum(eb, -60) + 60
best = max(range(-40, 41), key=lambda l: float(np.dot(la[max(0,l):len(la)+min(0,l)], lb[max(0,-l):len(lb)-max(0,l)])))
print('Versatz Hülle v10->v11:', best*5, 'ms')
# Pegel je 100 ms
A = rms_db(a, .1, .1); B = rms_db(b, .1, .1)
d = B - A
akt = (np.maximum(A, B) > -45)
print('Pegeldifferenz (v11-v10) aktive Rahmen: Median %.1f dB, p10 %.1f p90 %.1f' % (np.median(d[akt]), *np.percentile(d[akt], [10, 90])))
# Abschnittsweise
for s in LIED['abschnitte']:
    if s['bis_s'] is None: continue
    i0, i1 = int(s['von_s']*10), int(s['bis_s']*10); m = akt[i0:i1]
    if s['bis_s'] is None: continue
    if m.sum() > 5: print('  %-20s Median %+5.1f dB  p10 %+5.1f  p90 %+5.1f   aktiv %d' % (s['name'], np.median(d[i0:i1][m]), *np.percentile(d[i0:i1][m], [10, 90]), m.sum()))
np.save('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall/roh/v10v11_pegel.npy', np.stack([A, B]))
