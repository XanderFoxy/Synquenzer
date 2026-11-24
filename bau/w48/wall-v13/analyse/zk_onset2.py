# Silben-Einsatz v2 (für gebundenes Singen): Senke -> Anstieg.
#  Merkmale je 2 ms: V = 120–1800 Hz (dB, 10 ms), HF = 4–10 kHz (dB, 10 ms), stimmhaft r (Autokorrelation 25 ms).
#  1. Senke: tiefste Stelle von V (geglättet) relativ zu den Maxima davor/danach, nahe der Vorgabe p (Strafe für Abstand).
#  2. vokal_t: nach der Senke erster Punkt, an dem V >= (Max der nächsten 120 ms) − 6 dB UND stimmhaft (r >= 0,55).
#  3. spitze_t: steilster V-Anstieg (dB/ms) zwischen Senke und vokal_t + 10 ms („Transienten-Spitze“).
#  4. konsonant_s: rückwärts ab Senke: stimmloser Anlaut (HF−V > −6 dB oder r < 0,45) bis zum letzten stimmhaften
#     Vokalrahmen davor; bei stimmhaftem Anlaut (kein stimmloser Teil) = Beginn des Abfalls in die Senke (V < Vorher-Max − 3 dB).
import numpy as np
from zk_gemein import SR, bp, env_db

HOP = 0.002


def ac_voicing(seg, hop=HOP, win=0.025, fmin=80., fmax=700.):
    w = int(win * SR); h = int(hop * SR); lo = int(SR / fmax); hi = int(SR / fmin)
    n = (len(seg) - w - hi) // h
    if n <= 0: return np.zeros(0)
    nfft = 1 << int(np.ceil(np.log2(2 * (w + hi))))
    idx = np.arange(n)[:, None] * h + np.arange(w + hi)[None, :]
    F = seg[idx]
    A = np.fft.rfft(F[:, :w], nfft, axis=1); B = np.fft.rfft(F, nfft, axis=1)
    cc = np.fft.irfft(np.conj(A) * B, nfft, axis=1)[:, lo:hi]
    e0 = (F[:, :w] ** 2).sum(1)[:, None]
    cs = np.concatenate([np.zeros((n, 1)), np.cumsum(F * F, 1)], 1)
    L = np.arange(lo, hi)
    el = cs[:, L + w] - cs[:, L]
    r = cc / np.sqrt(e0 * el + 1e-12)
    out = r.max(1)
    # Zeitbezug: Rahmenmitte
    return out, (np.arange(n) * h + w / 2) / SR


class Merk:
    def __init__(self, x, t0, t1):
        rand = 0.15
        a = max(0, int((t0 - rand) * SR)); b = min(len(x), int((t1 + rand) * SR))
        seg = np.asarray(x[a:b], np.float64)
        self.off = a / SR
        V = env_db(bp(seg, 120, 1800), 10, HOP * 1000)
        HF = env_db(bp(seg, 4000, 10000), 10, HOP * 1000)
        self.t = self.off + (np.arange(len(V)) + .5) * HOP
        r, rt = ac_voicing(seg)
        self.r = np.interp(self.t, rt + self.off, r, left=0, right=0)
        self.V = V; self.HF = HF
        self.Vs = np.convolve(V, np.ones(5) / 5, 'same')

    def i(self, t):
        return int(np.clip(round((t - self.off) / HOP - .5), 0, len(self.t) - 1))


def messe(x, p, lo=None, hi=None, nxt=None, prv=None, b_hint=None):
    """p = Vorgabe (Silbenbeginn), lo/hi = Suchfenster für die Senke, nxt/prv = Vorgaben der Nachbarsilben."""
    lo = p - 0.10 if lo is None else lo
    hi = p + 0.12 if hi is None else hi
    t_end = min(hi + 0.35, (nxt - 0.02) if nxt else hi + 0.35)
    t_beg = max(lo - 0.45, (prv + 0.03) if prv else lo - 0.45)
    M = Merk(x, t_beg, t_end)
    Vs = M.Vs
    i0, i1 = M.i(lo), M.i(hi)
    # Senken-Kandidaten
    best = None
    for k in range(i0, i1 + 1):
        if k <= 2 or k >= len(Vs) - 3: continue
        # lokales Minimum in ±6 ms
        if Vs[k] > Vs[max(0, k - 3):k + 4].min() + 1e-9: continue
        pre = Vs[max(0, k - 60):k + 1].max()       # 120 ms davor
        post = Vs[k:min(len(Vs), k + 60)].max()     # 120 ms danach
        tiefe = min(pre, post) - Vs[k]
        anstieg = post - Vs[k]
        score = 0.5 * tiefe + 0.5 * anstieg - 4.0 * abs(M.t[k] - p) / 0.05
        if best is None or score > best[0]: best = (score, k, tiefe, anstieg)
    if best is None:
        k = M.i(p); best = (0, k, 0, 0)
    _, ks, tiefe, anstieg = best
    # vokal_t
    kmax = min(len(Vs) - 1, ks + 60)
    ziel = Vs[ks:kmax + 1].max() - 6.0
    kv = ks
    while kv < kmax and not (Vs[kv] >= ziel and M.r[kv] >= 0.55):
        kv += 1
    # spitze: steilster Anstieg zwischen Senke und vokal+10 ms
    d = np.gradient(Vs) / (HOP * 1000)
    k2 = min(len(d) - 1, kv + 5)
    kp = ks + int(np.argmax(d[ks:k2 + 1])) if k2 > ks else ks
    # konsonant_s
    kk = ks
    stl = lambda q: (M.HF[q] - M.V[q] > -6.0) or (M.r[q] < 0.45)
    if stl(ks) or any(stl(q) for q in range(ks, kv)):
        # stimmloser Teil: rückwärts ab Senke, solange stimmlos; dann bis zum letzten stimmhaften Vokalrahmen
        kk = ks
        while kk > 0 and (stl(kk - 1)) and M.t[kk - 1] > t_beg:
            kk -= 1
        art = 'stimmlos'
    else:
        pre_i = max(0, ks - 60)
        pm = pre_i + int(np.argmax(Vs[pre_i:ks + 1]))
        kk = ks
        while kk > pm and Vs[kk - 1] < Vs[pm] - 3.0:
            kk -= 1
        art = 'stimmhaft'
    return dict(senke_t=round(float(M.t[ks]), 4), vokal_t=round(float(M.t[kv]), 4), spitze_t=round(float(M.t[kp]), 4),
                konsonant_s=round(float(M.t[kk]), 4), anlaut=art, tiefe_db=round(float(tiefe), 1), anstieg_db=round(float(anstieg), 1),
                steil=round(float(d[kp]), 2), r_vokal=round(float(M.r[kv]), 2))
