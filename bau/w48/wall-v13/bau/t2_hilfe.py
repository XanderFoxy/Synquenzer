# Hüllkurven-Ausrichtung (aus t2_anker.py, ohne Lauf beim Import)
import numpy as np
from tgemein import SR
from zk_gemein import bp, env_db


def hull(x, t0, t1):
    a = int((t0 - .01) * SR); b = int((t1 + .01) * SR)
    s = np.asarray(x[max(0, a):b])
    e1 = np.maximum(env_db(bp(s, 120, 1800), 6, 1), -75); e2 = np.maximum(env_db(bp(s, 3000, 9000), 6, 1), -85)
    return e1, e2, max(0, a) / SR


def ausrichten(xa, xb, w0, w1, mitte, such):
    """bester Versatz L (s) so dass xb(t+L) ~ xa(t) im Fenster [w0,w1]; L in [mitte-such, mitte+such]."""
    A1, A2, oa = hull(xa, w0, w1)
    i0 = int(round((w0 - oa) * 1000)); n = int(round((w1 - w0) * 1000))
    a1, a2 = A1[i0:i0 + n], A2[i0:i0 + n]
    B1, B2, ob = hull(xb, w0 + mitte - such, w1 + mitte + such)
    res = []
    for L in range(int(round((mitte - such) * 1000)), int(round((mitte + such) * 1000)) + 1):
        j0 = int(round((w0 + L / 1000 - ob) * 1000))
        if j0 < 0 or j0 + n > len(B1): continue
        b1, b2 = B1[j0:j0 + n], B2[j0:j0 + n]
        c1 = np.corrcoef(a1, b1)[0, 1]; c2 = np.corrcoef(a2, b2)[0, 1]
        res.append((np.nan_to_num(c1) + 0.6 * np.nan_to_num(c2), L))
    res.sort(reverse=True)
    c, L = res[0]
    zweit = next((r for r in res if abs(r[1] - L) > 25), (np.nan, 0))
    return L / 1000, c / 1.6, zweit[0] / 1.6, zweit[1] / 1000
