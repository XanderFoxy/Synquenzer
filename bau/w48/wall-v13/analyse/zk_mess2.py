# Endgültige Silbenmessung (für alle Spuren gleich definiert).
#   Fenster W = [p_k − 60 ms, min(p_next − 30 ms, p_k + 400 ms)],  p_k = Vorgabe für den Silbenbeginn.
#   Kandidat t: Anstieg  rise(t) = Vs(t+15 ms) − min(Vs[t−40 ms, t]),  stimmhaft bei t+15 ms (r >= 0,45),
#               Pegel Vs(t+15 ms) >= max(Vs in W) − 12 dB, t = lokales Maximum der Steigung.
#   spitze_t  („Transienten-Spitze“) = FRÜHESTER Kandidat mit rise >= 0,6 · größter rise  (= erster kräftiger Vokal-Einsatz;
#               spätere Crescendi zählen nicht), danach steilste Stelle ±10 ms.
#   vokal_t   = Beginn dieses Anstiegs (Minimum von Vs in den 40 ms davor).
#   konsonant_s = Beginn des Anlauts: von vokal_t rückwärts, solange Vs < Vs(spitze+20 ms) − 6 dB oder stimmlos (r<0,5)
#               oder HF-lastig (HF−V > −14 dB); Ende beim ersten stimmhaften, lauten Rahmen der Silbe davor (max. 450 ms).
import numpy as np
from zk_gemein import *
from zk_onset2 import ac_voicing

HOP = 0.002


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


def messe(x, p_k, p_next=None, vor=0.06, nach=0.40, min_t=None):
    w0 = p_k - vor
    if min_t is not None: w0 = max(w0, min_t)
    w1 = p_k + nach
    if p_next is not None: w1 = min(w1, p_next - 0.03)
    w1 = max(w1, w0 + 0.08)
    m = M(x, w0 - 0.5, w1 + 0.1)
    Vs, d, r = m.Vs, m.d, m.r
    i0, i1 = m.i(w0), m.i(w1)
    vmax = Vs[i0:min(len(Vs), i1 + 8)].max()
    kand = []
    for k in range(max(21, i0), min(len(Vs) - 9, i1 + 1)):
        if not (d[k] >= d[k - 1] and d[k] >= d[k + 1] and d[k] > 0.05): continue
        lo = Vs[k - 20:k + 1].min(); hi = Vs[k + 7]
        if r[k + 7] < 0.45 or hi < vmax - 12: continue
        kand.append((k, hi - lo))
    if not kand:
        k = i0 + int(np.argmax(d[i0:i1 + 1])); kand = [(k, float(Vs[min(len(Vs) - 1, k + 7)] - Vs[max(0, k - 20):k + 1].min()))]
        sicher = 0.3
    else:
        sicher = 1.0
    rmax = max(c[1] for c in kand)
    kc = next((c[0] for c in kand if c[1] >= 0.6 * rmax), kand[0][0])
    rise = dict(kand)[kc]
    a0, a1 = max(1, kc - 5), min(len(d) - 2, kc + 5)
    kp = a0 + int(np.argmax(d[a0:a1 + 1]))
    lo = max(1, kp - 20); kv = lo + int(np.argmin(Vs[lo:kp + 1]))
    ref = Vs[min(len(Vs) - 1, kp + 10)]
    kk = kv; n_back = int(0.45 / HOP)
    while kk > max(1, kv - n_back):
        q = kk - 1
        leise = Vs[q] < ref - 6.0
        stl = r[q] < 0.5 or (m.HF[q] - m.V[q] > -14.0)
        if leise or stl: kk = q
        else: break
    # mehrdeutig, wenn ein zweiter Kandidat fast gleich stark ist und > 60 ms entfernt
    zweit = [c for c in kand if c[0] != kc and c[1] >= 0.85 * rise and abs(c[0] - kc) * HOP > 0.06]
    return dict(konsonant_s=round(float(m.t[kk]), 4), vokal_t=round(float(m.t[kv]), 4), spitze_t=round(float(m.t[kp]), 4),
                anstieg_db=round(float(rise), 1), anlaut_ms=round((m.t[kv] - m.t[kk]) * 1000, 1),
                sicher=round(sicher * (0.6 if zweit else 1.0), 2),
                alternativ=[round(float(m.t[c[0]]), 3) for c in zweit][:3])
