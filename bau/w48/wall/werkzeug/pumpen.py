# Pumpen messen: Tiefbass 30-60 Hz (kein Gesang dort) im Master gegen die Musik ohne Gesang.
# Sinkt der Master-Tiefbass, wenn Gesang kommt, drückt der Summen-Kompressor (Pumpen).
import sys, numpy as np
sys.path.insert(0, __import__('os').path.dirname(__file__))
from gemein import lade, SR, LIED, rms_db
from raster_mess import band
mu = band(np.asarray(lade('mix-w2'), np.float64), 30, 60)
em = rms_db(mu, .05, .1)
for m, gn in [('master-v10', 'ges-v10'), ('master-v11', 'ges-v11')]:
    x = band(np.asarray(lade(m), np.float64), 30, 60); ex = rms_db(x, .05, .1)
    g = rms_db(band(np.asarray(lade(gn), np.float64), 300, 3000), .05, .1)
    r = ex - em
    ok = em > np.percentile(em, 30)
    vor = ok & (g > -30); ohne = ok & (g < -45)
    print(m, 'Tiefbass Master-Musik: mit Gesang %.2f dB, ohne Gesang %.2f dB, Unterschied %.2f dB; Streuung (p90-p10) mit Gesang %.2f dB' % (
        np.median(r[vor]), np.median(r[ohne]), np.median(r[vor]) - np.median(r[ohne]), np.subtract(*np.percentile(r[vor], [90, 10]))))
    # je Abschnitt
    for s in LIED['abschnitte']:
        if s['bis_s'] is None: continue
        sl = slice(int(s['von_s'] * 20), int(s['bis_s'] * 20)); v = vor[sl]
        if v.sum() > 20: print('   %-20s Absenkung bei Gesang %.2f dB' % (s['name'], np.median(r[sl][v]) - np.median(r[ohne])))
