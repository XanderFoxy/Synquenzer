# Endgültige Silbenmessung (Haupt + Doppel; Roh + v12) für die Zielkarte v13.
# Definitionen (für alle Spuren gleich):
#   spitze_t   = „Transienten-Spitze“: steilster Anstieg der Stimmklang-Hülle V (120–1800 Hz, 10 ms, dB) beim stärksten
#                Vokal-Einsatz der Silbe (Anstieg über 24 ms maximal), gesucht um eine Vorgabe (s. unten).
#   vokal_t    = Beginn dieses Anstiegs (letztes Minimum von V in den 40 ms vor der Spitze).
#   konsonant_s= Beginn des Anlauts: stimmlose Anlaute (s, sh, f, th, h, t, k, p): Beginn des stimmlosen Blocks vor dem Vokal;
#                sonst Beginn des Abfalls in die Senke vor dem Vokal (V fällt >= 3 dB unter das Maximum davor).
# Vorgaben: Haupt-Roh = lied.json 'einsatz' über die Zeitkarte auf Aufnahmezeit (karte_r); Haupt-v12 = lied.json 'einsatz'
#           (Ende-Zeit = v12-Lead); Doppel = gemessene Haupt-Zeiten (+ DTW-Versatz Doppel-Roh -> Doppel-v12).
import json, sys, numpy as np
from zk_gemein import *
from zk_onset2 import ac_voicing
from zk_onset3 import KLASSE

HOP = 0.002


def karte_r(t):
    K = LIED['karte']
    for a0, a1, r0, r1 in K:
        if a0 <= t < a1 and a1 > a0:
            return r0 + (t - a0) * (r1 - r0) / (a1 - a0)
    return t


class M:
    def __init__(self, x, t0, t1):
        a = max(0, int((t0 - .15) * SR)); b = min(len(x), int((t1 + .15) * SR))
        seg = np.asarray(x[a:b], np.float64); self.off = a / SR
        self.V = env_db(bp(seg, 120, 1800), 10, HOP * 1000)
        self.HF = env_db(bp(seg, 4000, 10000), 10, HOP * 1000)
        self.t = self.off + (np.arange(len(self.V)) + .5) * HOP
        r, rt = ac_voicing(seg)
        self.r = np.interp(self.t, rt + self.off, r, left=0, right=0)
        self.Vs = np.convolve(self.V, np.ones(5) / 5, 'same')
        self.d = np.gradient(self.Vs) / (HOP * 1000)

    def i(self, t): return int(np.clip(round((t - self.off) / HOP - .5), 0, len(self.t) - 1))


def messe(x, text, prior_e, prior_k=None, such=0.06, strafe=1.5):
    kl = KLASSE.get(text.strip(), 'son')
    m = M(x, prior_e - 0.55, prior_e + 0.3)
    Vs = m.Vs; n = len(Vs)
    i0, i1 = m.i(prior_e - such), m.i(prior_e + such)
    # Anstieg über 24 ms
    best = None
    for k in range(max(12, i0), min(n - 12, i1 + 1)):
        rise = Vs[k + 6] - Vs[k - 6]
        sc = rise - strafe * abs(m.t[k] - prior_e) / 0.02
        if best is None or sc > best[0]: best = (sc, k, rise)
    _, kc, rise = best
    # Spitze = max Steigung ±12 ms um kc
    a0, a1 = max(1, kc - 6), min(n - 2, kc + 6)
    kp = a0 + int(np.argmax(m.d[a0:a1 + 1]))
    # Vokal-Beginn = letztes lokales Minimum von Vs in den 40 ms davor
    lo = max(1, kp - 20)
    kv = lo + int(np.argmin(Vs[lo:kp + 1]))
    # Konsonant
    pk = prior_k if prior_k is not None else m.t[kv] - 0.1
    if kl == 'sl':
        stl = (m.r < 0.5) & (m.HF - m.V > -14.0)
        # vom Vokal rückwärts: erst evtl. stimmhafte Lücke (<= 40 ms), dann stimmloser Block
        q = kv; gap = 0
        while q > 0 and not stl[q] and gap < 30: q -= 1; gap += 1
        if stl[q]:
            while q > 0 and (stl[q - 1] or (q > 2 and stl[q - 3])) and m.t[q] > m.t[kv] - 0.45: q -= 1
            kk = q
        else:
            kk = m.i(pk)
    else:
        pre_i = max(0, kv - 50); pm = pre_i + int(np.argmax(Vs[pre_i:kv + 1]))
        kk = kv
        while kk > pm and Vs[kk - 1] < Vs[pm] - 3.0: kk -= 1
        if kl == 'vok': kk = max(kk, kv - 15)
    return dict(klasse=kl, konsonant_s=round(float(m.t[kk]), 4), vokal_t=round(float(m.t[kv]), 4), spitze_t=round(float(m.t[kp]), 4),
                anstieg_db=round(float(rise), 1), steil=round(float(m.d[kp]), 2), r_spitze=round(float(m.r[min(n - 1, kp + 5)]), 2),
                anlaut_ms=round((m.t[kv] - m.t[kk]) * 1000, 1))
