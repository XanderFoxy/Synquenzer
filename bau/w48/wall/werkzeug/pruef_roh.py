# Prüfstellen-Kandidaten: Ende (v11) gegen Timing (= gereinigt auf Ende-Zeit) und Original (auf Ende-Zeit).
# Alles lokal mit numpy. Schreibt roh/pruef_kand.json (alle Kandidaten mit Maßzahlen).
import sys, json, numpy as np
sys.path.insert(0, __import__('os').path.dirname(__file__))
from gemein import lade, SR, LIED, rms_db, mmss, ROH
from raster_mess import band
from tonhoehe import yin
E = np.asarray(lade('ende'), np.float64); T = np.asarray(lade('timing'), np.float64); O = np.asarray(lade('original-e'), np.float64)
HOP = .005
eE = rms_db(E, HOP, .02); eT = rms_db(T, HOP, .02); eO = rms_db(O, HOP, .02)
n = min(len(eE), len(eT)); eE, eT, eO = eE[:n], eT[:n], eO[:n]
t = np.arange(n) * HOP + HOP / 2
# lokaler Pegelunterschied (Ende ist bearbeitet/normalisiert): gleitender Median über ±1,5 s, nur wo beide klingen
aktT = eT > np.percentile(eT, 60) - 6
aktE = eE > np.percentile(eE, 60) - 6
diff = eE - eT
w = int(1.5 / HOP)
g = np.full(n, np.nan)
idx = np.where(aktT & aktE)[0]
for i in range(0, n, 20):
    sel = idx[(idx >= i - w) & (idx < i + w)]
    if len(sel) > 30: g[i:i + 20] = np.median(diff[sel])
# Lücken füllen
ok = ~np.isnan(g); g = np.interp(np.arange(n), np.where(ok)[0], g[ok])
dev = diff - g
K = []
def gruppen(maske, min_len, gap=4):
    ii = np.where(maske)[0]; out = []
    for i in ii:
        if out and i - out[-1][1] <= gap: out[-1][1] = i
        else: out.append([i, i])
    return [(a, b) for a, b in out if (b - a + 1) * HOP >= min_len]
bekannt = [(218.0, 219.86, 'Open your eyes entfernt (gewollt)')]
def ist_bekannt(a, b):
    for x, y, _ in bekannt:
        if a < y and b > x: return True
    return False
atmer = LIED['ereignisse']['atmer']
def im_atmer(a, b):
    return any(a < y + .03 and b > x - .03 for x, y in atmer)
# 1) Löcher / abgeschnitten: Timing klingt, Ende >= 10 dB darunter (über dem lokalen Pegel)
for a, b in gruppen(aktT & (dev < -10), .025):
    ta, tb = t[a], t[b] + HOP
    if ist_bekannt(ta, tb): continue
    K.append(dict(art='Loch', von_s=ta, bis_s=tb, db=float(np.median(dev[a:b + 1])), min_db=float(dev[a:b + 1].min()), atmer=im_atmer(ta, tb), pegelT=float(np.max(eT[a:b + 1]) - np.percentile(eT, 99))))
# 2) Zusatz: Ende klingt deutlich, Timing nicht (Rest, Doppel, Echo)
for a, b in gruppen(aktE & (dev > 10), .025):
    ta, tb = t[a], t[b] + HOP
    if ist_bekannt(ta, tb): continue
    K.append(dict(art='Zusatz', von_s=ta, bis_s=tb, db=float(np.median(dev[a:b + 1])), max_db=float(dev[a:b + 1].max()), pegelE=float(np.max(eE[a:b + 1]) - np.percentile(eE, 99)), orig_db=float(np.median(eO[a:b + 1] - eT[a:b + 1]))))
# 3) Klicks: Hochpass > 3 kHz, 1-ms-Spitze gegen 40-ms-Umgebung, nur wenn Timing dort keinen ähnlichen Klick hat
def klickmass(x):
    h = band(x, 3000, 16000); m = int(.001 * SR); nn = len(h) // m
    pk = np.abs(h[:nn * m]).reshape(nn, m).max(1)
    rr = np.sqrt((h[:nn * m] ** 2).reshape(nn, m).mean(1))
    c = np.convolve(rr ** 2, np.ones(40) / 40, 'same') ** .5
    return pk / (c + 1e-6), pk
kE, pE = klickmass(E); kT, pT = klickmass(T)
from numpy.lib.stride_tricks import sliding_window_view
kTm = np.concatenate([np.zeros(3), sliding_window_view(np.concatenate([kT, np.zeros(3)]), 7).max(1)])[:len(kT)]
lautE = 20 * np.log10(pE + 1e-9) - 20 * np.log10(np.percentile(pE, 99.9))
cand = np.where((kE > 7) & (kTm < 3.5) & (lautE > -30))[0]
last = -1
for i in cand:
    if i - last < 30: continue
    last = i
    ta = i / 1000
    if ist_bekannt(ta, ta + .001): continue
    K.append(dict(art='Klick', von_s=ta, bis_s=ta + .004, verh=float(kE[i]), verhT=float(kTm[i]), laut_db=float(lautE[i])))
json.dump(K, open(ROH + '/pruef_kand_a.json', 'w'), indent=0)
np.save(ROH + '/pruef_dev.npy', np.stack([t, eE, eT, eO, dev, g]))
from collections import Counter
print(Counter(k['art'] for k in K))
for k in sorted(K, key=lambda k: k['von_s']): print('%-6s %7.3f-%7.3f %s %s' % (k['art'], k['von_s'], k['bis_s'], mmss(k['von_s']), {a: round(v, 1) for a, v in k.items() if isinstance(v, float) and a not in ('von_s', 'bis_s')}))
