# Klicks/Sprünge: HF-Spitze (1 ms) in Ende deutlich über dem, was Timing an derselben Stelle (±3 ms) hat, nach lokalem Pegelausgleich.
import sys, json, numpy as np
sys.path.insert(0, __import__('os').path.dirname(__file__))
from gemein import lade, SR, ROH, mmss, silbe_bei, wort_text
from raster_mess import band
from numpy.lib.stride_tricks import sliding_window_view
E = np.asarray(lade('ende'), np.float64); T = np.asarray(lade('timing'), np.float64)
t, eE, eT, eO, dev, g = np.load(ROH + '/pruef_dev.npy')
def hfpk(x):
    h = band(x, 3000, 16000); m = SR // 1000; n = len(h) // m
    return 20 * np.log10(np.abs(h[:n * m]).reshape(n, m).max(1) + 1e-9)
pE = hfpk(E); pT = hfpk(T)
pTm = sliding_window_view(np.concatenate([np.full(3, -200), pT, np.full(3, -200)]), 7).max(1)
gl = np.interp(np.arange(len(pE)) / 1000, t, g)
# Umgebung von Ende selbst (Median ±20 ms), damit Konsonanten nicht zählen, die schon in der Umgebung laut sind
umg = np.median(sliding_window_view(np.concatenate([np.full(20, pE[0]), pE, np.full(20, pE[-1])]), 41), axis=1)
exc = pE - (pTm + gl)
cand = np.where((exc > 14) & (pE > -52) & (pE - umg > 12))[0]
K = []; last = -100
for i in cand:
    if i - last < 40: continue
    last = i; ts = i / 1000
    j, d = silbe_bei(ts); w, z = wort_text(j)
    K.append(dict(art='Klick', von_s=ts, bis_s=ts + .003, ueber_db=float(exc[i]), hf_db=float(pE[i]), umg_db=float(pE[i] - umg[i]), wort=w, d=float(d)))
json.dump(K, open(ROH + '/pruef_kand_klick.json', 'w'), indent=0)
for k in K: print('%8.3f %s  über Erwartung %+5.1f dB  HF %5.1f dBFS  über Umgebung %+5.1f  %s (%.2f)' % (k['von_s'], mmss(k['von_s']), k['ueber_db'], k['hf_db'], k['umg_db'], k['wort'], k['d']))
