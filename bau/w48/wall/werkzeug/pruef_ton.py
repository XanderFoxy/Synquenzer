# Tonhöhen-Sprünge der Korrektur: f0 von Ende und Timing (10 ms), Korrektur c = Ende - Timing (Cent).
# Glitch = Korrektur springt innerhalb von 20 ms um > 70 Cent (ohne Oktavfehler), während Timing ruhig ist.
import sys, json, numpy as np
sys.path.insert(0, __import__('os').path.dirname(__file__))
from gemein import lade, SR, LIED, mmss, ROH
from tonhoehe import yin, cent
E = np.asarray(lade('ende'), np.float64); T = np.asarray(lade('timing'), np.float64)
dv = np.load(ROH + '/pruef_dev.npy'); tt, eE, eT = dv[0], dv[1], dv[2]
# nur Bereiche mit Gesang (Silben ± 0,3 s)
ber = []
for s in LIED['silben']:
    a, b = s['a'] - .05, s['b'] + .6
    if ber and a <= ber[-1][1]: ber[-1][1] = max(ber[-1][1], b)
    else: ber.append([a, b])
res = []
for a, b in ber:
    pe = yin(E, a, b, hop=.01); pt = yin(T, a, b, hop=.01)
    m = min(len(pe), len(pt))
    for i in range(m): res.append((pe[i, 0], pe[i, 1], pe[i, 2], pt[i, 1], pt[i, 2]))
R = np.array(res); np.save(ROH + '/pruef_f0.npy', R)
t, fe, ce, ft, ct = R.T
c = cent(fe) - cent(ft)
# Oktavfehler raus
c = np.where(np.abs(c) > 600, np.nan, c)
K = []
for i in range(2, len(t) - 3):
    if abs(t[i + 2] - t[i - 2] - .04) > 1e-3: continue
    if np.isnan(c[i - 2:i + 3]).any(): continue
    if min(ce[i - 2:i + 3]) < .75 or min(ct[i - 2:i + 3]) < .75: continue
    sprung = c[i + 1] - c[i - 1]
    ruhigT = abs(cent(ft[i + 1:i + 2])[0] - cent(ft[i - 1:i])[0])
    if abs(sprung) > 70 and ruhigT < 35:
        K.append(dict(art='Tonsprung', von_s=float(t[i - 1]), bis_s=float(t[i + 1]), sprung_ct=float(sprung), timing_ct=float(ruhigT), korr_ct=float(c[i + 1])))
# zusammenfassen
M = []
for k in K:
    if M and k['von_s'] - M[-1]['bis_s'] < .05:
        M[-1]['bis_s'] = k['bis_s']
        if abs(k['sprung_ct']) > abs(M[-1]['sprung_ct']): M[-1]['sprung_ct'] = k['sprung_ct']
    else: M.append(dict(k))
json.dump(M, open(ROH + '/pruef_kand_ton.json', 'w'), indent=0)
print('Rahmen', len(t), 'stimmhaft beide', np.sum(~np.isnan(c)), 'Korrektur |c| Median %.0f ct p95 %.0f' % (np.nanmedian(np.abs(c)), np.nanpercentile(np.abs(c), 95)))
for k in M: print('%7.2f-%7.2f %s  Sprung %+5.0f ct  (Timing %3.0f)  Korrektur danach %+4.0f' % (k['von_s'], k['bis_s'], mmss(k['von_s']), k['sprung_ct'], k['timing_ct'], k['korr_ct']))
