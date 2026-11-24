# Onset-Stärke-Ausrichtung Doppel <-> Haupt (beide trocken): Korrelation der positiven Hüllkurven-Steigung.
import numpy as np
from tgemein import SR
from zk_gemein import bp, env_db


def onset_kurve(x, t0, t1):
    a = int((t0 - 0.03) * SR); b = int((t1 + 0.03) * SR)
    s = np.asarray(x[max(0, a):b])
    V = np.maximum(env_db(bp(s, 120, 1800), 5, 1), -70); Hh = np.maximum(env_db(bp(s, 3000, 9000), 5, 1), -80)
    k = np.ones(5) / 5
    dV = np.maximum(0, np.gradient(np.convolve(V, k, 'same'))); dH = np.maximum(0, np.gradient(np.convolve(Hh, k, 'same')))
    return dV + 0.4 * dH, max(0, a) / SR


def onset_versatz(xh, xd, ev, vor=0.10, nach=0.06, such=0.15, mitte=0.0):
    oh, oa = onset_kurve(xh, ev - vor, ev + nach)
    i0 = int(round((ev - vor - oa) * 1000)); n = int(round((vor + nach) * 1000))
    a = oh[i0:i0 + n]
    od, ob = onset_kurve(xd, ev - vor + mitte - such, ev + nach + mitte + such)
    best = (-2, 0); werte = []
    for L in range(int(round((mitte - such) * 1000)), int(round((mitte + such) * 1000)) + 1):
        j0 = int(round((ev - vor + L / 1000 - ob) * 1000))
        if j0 < 0 or j0 + n > len(od): continue
        b = od[j0:j0 + n]
        c = float(np.dot(a, b) / np.sqrt(np.dot(a, a) * np.dot(b, b) + 1e-9))
        werte.append((c, L))
        if c > best[0]: best = (c, L)
    zweit = max([w for w in werte if abs(w[1] - best[1]) > 20], default=(np.nan, 0))
    return best[1] / 1000, best[0], zweit[0]
