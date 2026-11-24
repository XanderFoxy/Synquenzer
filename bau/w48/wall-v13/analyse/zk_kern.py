# Kern-Messung für die Zielkarte (eine Definition für alle Spuren).
#   V  = Hülle 120–1800 Hz (10 ms, 2-ms-Raster, dB), HF = 4–10 kHz, r = Stimmhaftigkeit (Autokorrelation 25 ms)
#   Kandidat (Vokal-Einsatz) t: lokales Maximum der V-Steigung; Anstieg = Vs(t+14 ms) − min Vs[t−40 ms, t] >= 4,5 dB;
#       stimmhaft bei t+14 ms (r >= 0,45); Pegel nahe am Silbenmaximum (>= max − 12 dB).
#   spitze_t  = Transienten-Spitze = steilste Stelle dieses Anstiegs.
#   vokal_t   = tiefster Punkt in den 40 ms davor (Beginn des Anstiegs).
#   konsonant_s = Beginn des Anlauts: rückwärts ab vokal_t über leise/stimmlose/zischende Rahmen bis zum letzten lauten
#       stimmhaften Rahmen davor; Stille (V und HF < Boden + 6 dB für >= 16 ms) beendet die Suche (Anlaut beginnt danach).
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
        self.bV = np.percentile(self.Vs, 8); self.bH = np.percentile(self.HF, 8)

    def i(self, t): return int(np.clip(round((t - self.off) / HOP - .5), 0, len(self.t) - 1))

    def kandidaten(self, i0, i1, rmin=4.5):
        Vs, d, r = self.Vs, self.d, self.r
        vmax = Vs[i0:min(len(Vs), i1 + 60)].max()
        out = []
        for k in range(max(21, i0), min(len(Vs) - 9, i1 + 1)):
            if not (d[k] >= d[k - 1] and d[k] >= d[k + 1] and d[k] > 0.05): continue
            lo = Vs[k - 20:k + 1].min(); hi = Vs[k + 7]
            if r[k + 7] < 0.45 or hi < vmax - 12 or hi - lo < rmin: continue
            out.append((k, float(hi - lo)))
        return out

    def ergebnis(self, kc, rise, sicher):
        Vs, d, r = self.Vs, self.d, self.r
        a0, a1 = max(1, kc - 5), min(len(d) - 2, kc + 5)
        kp = a0 + int(np.argmax(d[a0:a1 + 1]))
        lo = max(1, kp - 20); kv = lo + int(np.argmin(Vs[lo:kp + 1]))
        ref = Vs[min(len(Vs) - 1, kp + 10)]
        kk = kv; still = 0
        while kk > max(1, kv - int(0.45 / HOP)):
            q = kk - 1
            if Vs[q] < self.bV + 6 and self.HF[q] < self.bH + 6:
                still += 1
                if still >= 8: kk = q + 8; break
                kk = q; continue
            still = 0
            leise = Vs[q] < ref - 6.0
            stl = r[q] < 0.5 or (self.HF[q] - self.V[q] > -14.0)
            if leise or stl: kk = q
            else: break
        return dict(konsonant_s=round(float(self.t[kk]), 4), vokal_t=round(float(self.t[kv]), 4), spitze_t=round(float(self.t[kp]), 4),
                    anstieg_db=round(float(rise), 1), anlaut_ms=round((self.t[kv] - self.t[kk]) * 1000, 1), sicher=sicher)


def erster(x, p_k, p_next=None, min_t=None, vor=0.06, nach=0.40):
    """Frühester kräftiger Vokal-Einsatz nach der Vorgabe p_k (Silbenbeginn)."""
    w0 = p_k - vor
    if min_t is not None: w0 = max(w0, min_t)
    w1 = p_k + nach
    if p_next is not None: w1 = min(w1, p_next - 0.03)
    w1 = max(w1, w0 + 0.08)
    m = M(x, w0 - 0.5, w1 + 0.15)
    K = m.kandidaten(m.i(w0), m.i(w1))
    if not K:
        K = m.kandidaten(m.i(w0), m.i(w1), rmin=1.5); s = 0.5
        if not K: return None
    else:
        s = 1.0
    rmax = max(c[1] for c in K)
    kc, rise = next(c for c in K if c[1] >= 0.6 * rmax)
    return m.ergebnis(kc, rise, s)


def nah(x, hint, half=0.06, strafe=4.0):
    """Vokal-Einsatz nahe einem Hinweis (aus Sichtprüfung oder aus der Partnerspur)."""
    m = M(x, hint - half - 0.5, hint + half + 0.2)
    K = m.kandidaten(m.i(hint - half), m.i(hint + half), rmin=2.0)
    if not K:
        k = m.i(hint); return m.ergebnis(k, 0.0, 0.3)
    kc, rise = max(K, key=lambda c: c[1] - strafe * abs(m.t[c[0]] - hint) / 0.05)
    return m.ergebnis(kc, rise, 0.8)


def staerkster(x, t_von, t_bis):
    """Stärkster Anstieg im Bereich (für Akzent-Silben wie „see“, „sake“, „your“)."""
    m = M(x, t_von - 0.5, t_bis + 0.2)
    K = m.kandidaten(m.i(t_von), m.i(t_bis), rmin=2.0)
    if not K: return None
    kc, rise = max(K, key=lambda c: c[1])
    return m.ergebnis(kc, rise, 0.8)
