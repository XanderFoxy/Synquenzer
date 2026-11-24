# Silben-Einsatz v3: mit Laut-Klasse des Anlauts (aus dem Text), für gebundenes Singen.
# Rahmen 2 ms. V = 120–1800 Hz (dB, 10 ms Fenster), HF = 4–10 kHz, r = Stimmhaftigkeit (Autokorrelation, 25 ms).
# Klassen: 'sl' stimmloser Anlaut (s, sh, f, th, h, t, k, p, ch) | 'sh' stimmhafter Verschluss/Reibelaut (b, d, g, z, v, dh, dsch)
#          'son' Sonorant (w, l, m, n, r, j) | 'vok' Vokal-Anlaut.
# Ergebnis: konsonant_s (Beginn Anlaut), vokal_t (Beginn Vokal), spitze_t (steilster V-Anstieg am Vokal-Beginn
#           = „Transienten-Spitze“), senke_t (tiefste Stelle zwischen den Silben).
import numpy as np
from zk_gemein import SR, bp, env_db
from zk_onset2 import ac_voicing

HOP = 0.002
KLASSE = {
    'Wel': 'son', 'come': 'sl', 'to': 'sl', 'the': 'sh', 'fake': 'sl', 'zom': 'sh', 'bies': 'sh', 'li': 'son', 'ving': 'sh',
    'for': 'sl', 'Gods': 'sh', 'sake': 'sl', 'In': 'vok', 'a': 'vok', 'world': 'son', 'of': 'vok', 'Sheep': 'sl', 'Eve': 'vok',
    'ry': 'son', 'thing': 'sl', 'we': 'son', 'Do': 'sh', 'be': 'sh', 'lieve': 'son', 'We': 'son', 'claim': 'sl', 'know': 'son',
    'It': 'vok', 'all': 'vok', 'Can’t': 'sl', 'see': 'sl', 'Who': 'sl', 'is': 'vok', 'hind': 'sl', 'this': 'sh', 'wall': 'son',
    'Don’t': 'sh', 'wait': 'son', 'fol': 'sl', 'low': 'son', 'light': 'son', 'wake': 'son', 'up': 'vok', 'o': 'vok', 'pen': 'sl',
    'your': 'son', 'eyes': 'vok', 'Why': 'son', 'can’t': 'sl', 'just': 'sh', 'feel': 'sl', 'there': 'sh', 'so': 'sl', 'much': 'son',
    'more': 'son', 'Are': 'vok', 'hyp': 'sl', 'no': 'son', 'tised': 'sl', 'What': 'son', 'does': 'sh', 'it': 'vok', 'need': 'son',
    'rea': 'son', 'lise': 'son', 'Wach': 'sh', 'auf': 'vok',
}


class Merk:
    def __init__(self, x, t0, t1):
        rand = 0.15
        a = max(0, int((t0 - rand) * SR)); b = min(len(x), int((t1 + rand) * SR))
        seg = np.asarray(x[a:b], np.float64)
        self.off = a / SR
        self.V = env_db(bp(seg, 120, 1800), 10, HOP * 1000)
        self.HF = env_db(bp(seg, 4000, 10000), 10, HOP * 1000)
        self.t = self.off + (np.arange(len(self.V)) + .5) * HOP
        r, rt = ac_voicing(seg)
        self.r = np.interp(self.t, rt + self.off, r, left=0, right=0)
        self.Vs = np.convolve(self.V, np.ones(5) / 5, 'same')
        self.d = np.gradient(self.Vs) / (HOP * 1000)

    def i(self, t):
        return int(np.clip(round((t - self.off) / HOP - .5), 0, len(self.t) - 1))


def _vokal_nach(M, k, kmax, need=15):
    """erster Rahmen ab k, ab dem 'need' Rahmen (30 ms) stimmhaft (r>=0,6) und V nahe dem folgenden Max (−9 dB) sind."""
    ref = M.Vs[k:min(len(M.Vs), k + 75)].max()
    q = k
    while q < kmax:
        seg_r = M.r[q:q + need]; seg_v = M.Vs[q:q + need]
        if len(seg_r) == need and (seg_r >= 0.6).mean() > 0.8 and seg_v.min() >= ref - 12 and M.Vs[q] >= ref - 9:
            return q
        q += 1
    return k


def messe(x, text, p, b=None, nxt=None, prv=None, fenster=(0.12, 0.15)):
    kl = KLASSE.get(text.strip(), 'son')
    lo, hi = p - fenster[0], p + fenster[1]
    t_end = min(hi + 0.4, (nxt - 0.01) if nxt else hi + 0.4)
    t_beg = max(lo - 0.4, (prv + 0.05) if prv else lo - 0.4)
    M = Merk(x, t_beg, t_end)
    i0, i1 = M.i(lo), M.i(hi); iend = M.i(t_end)
    Vs = M.Vs
    if kl == 'sl':
        # stimmloser Anlaut: Rahmen mit r<0,45 und HF−V > −12 dB; längster/kräftigster Block nahe p
        stl = (M.r < 0.45) & (M.HF - M.V > -12.0)
        # kleine Lücken schließen (<= 6 ms)
        st = stl.copy()
        for q in range(1, len(st) - 3):
            if not st[q] and st[q - 1] and st[q + 1:q + 4].any(): st[q] = True
        blocks = []; q = max(0, i0 - 30)
        while q < min(len(st), i1 + 40):
            if st[q]:
                s0 = q
                while q < len(st) and st[q]: q += 1
                blocks.append((s0, q))
            q += 1
        if blocks:
            def sc(bk):
                s0, s1 = bk; dur = (s1 - s0) * HOP
                return dur * 10 + float((M.HF[s0:s1] - M.V[s0:s1]).mean()) * 0.05 - abs(M.t[s0] - p) / 0.05
            s0, s1 = max(blocks, key=sc)
            kk = s0
            kv = _vokal_nach(M, s1, min(iend, s1 + 120))
        else:
            kk = M.i(p); kv = _vokal_nach(M, kk, min(iend, kk + 120))
        ks = kk
    else:
        # Senke (V-Minimum) nahe p, danach Anstieg
        best = None
        for k in range(max(3, i0), min(len(Vs) - 3, i1 + 1)):
            if Vs[k] > Vs[k - 3:k + 4].min() + 1e-9: continue
            pre = Vs[max(0, k - 50):k + 1].max(); post = Vs[k:min(len(Vs), k + 50)].max()
            tiefe = min(pre, post) - Vs[k]; anst = post - Vs[k]
            score = 0.6 * tiefe + 0.4 * anst - 3.0 * abs(M.t[k] - p) / 0.05
            if best is None or score > best[0]: best = (score, k)
        ks = best[1] if best else M.i(p)
        # Anlaut-Beginn: Abfall in die Senke (V < Vorher-Max − 3 dB) bzw. stimmloser Teil davor (Verschluss/Burst)
        pre_i = max(0, ks - 50); pm = pre_i + int(np.argmax(Vs[pre_i:ks + 1]))
        kk = ks
        while kk > pm and Vs[kk - 1] < Vs[pm] - 3.0: kk -= 1
        if kl == 'vok':
            kk = max(kk, ks - 10)
        # Vokal: nach der Senke, wo V wieder steigt und stimmhaft ist
        kv = ks
        ref = Vs[ks:min(len(Vs), ks + 60)].max()
        while kv < min(iend, ks + 100) and not (Vs[kv] >= ref - 6 and M.r[kv] >= 0.55): kv += 1
    # Spitze: steilster Anstieg im Bereich [kv − 30 ms, kv + 16 ms]
    a0 = max(ks if kl != 'sl' else kk, kv - 15); a1 = min(len(M.d) - 1, kv + 8)
    kp = a0 + int(np.argmax(M.d[a0:a1 + 1])) if a1 > a0 else kv
    return dict(klasse=kl, konsonant_s=round(float(M.t[kk]), 4), senke_t=round(float(M.t[ks]), 4),
                vokal_t=round(float(M.t[kv]), 4), spitze_t=round(float(M.t[kp]), 4), steil=round(float(M.d[kp]), 2),
                r_vokal=round(float(M.r[kv]), 2), anlaut_ms=round((M.t[kv] - M.t[kk]) * 1000, 1))
