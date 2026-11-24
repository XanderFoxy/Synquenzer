# Silben-Einsatz messen: Konsonant-Beginn, Vokal-Beginn, Transienten-Spitze (getrennt).
# Definitionen (für alle Silben gleich, damit Vergleiche zwischen Zeilen fair sind):
#   Bänder: V = 120–1800 Hz (Stimmklang/Vokal), H = 3,5–11 kHz (Zischlaut/Burst), B = 80 Hz–11 kHz (breit)
#   Hüllen: RMS 5 ms, Raster 1 ms, in dB.
#   Kern  : stärkster V-Pegel im Fenster der Silbe (Lmax).
#   vokal_t : vom Kern rückwärts: letzter Punkt, an dem V noch >= Lmax−12 dB liegt (steigende Flanke) und stimmhaft.
#   spitze_t: steilster Anstieg der V-Hülle (dB/ms, 4 ms geglättet) im Bereich [vokal_t−25 ms, vokal_t+50 ms]
#             = „Transienten-Spitze“ des Vokal-Einsatzes (das, was rhythmisch auf dem Raster sitzen soll).
#   konsonant_s: von vokal_t rückwärts, solange B oder H über dem Rauschboden+9 dB bleibt (max. 400 ms, Lücke >= 20 ms stoppt);
#             bei stimmhaftem Anlaut (w, l, m, n, j) = Beginn der V-Hülle über Boden+12 dB.
#   burst_t : stärkster H-Sprung (Plosiv/Zischlaut-Kante) zwischen konsonant_s und vokal_t (nur Info).
import numpy as np
from zk_gemein import SR, bp, env_db

HOP = 0.001


def stimmhaft(x, t0, t1, fmin=80, fmax=600, win=0.025, hop=0.0025):
    """Normierte Autokorrelation je Rahmen (0..1)."""
    w = int(win * SR); h = int(hop * SR)
    lo = int(SR / fmax); hi = int(SR / fmin)
    out_t = []; out_r = []
    i0 = int(t0 * SR); i1 = int(t1 * SR)
    for i in range(i0, i1 - w - hi, h):
        f = x[i:i + w + hi].astype(np.float64)
        a = f[:w]
        e0 = np.dot(a, a) + 1e-12
        best = 0.0
        # grob: alle Lags (vektorisiert per FFT)
        n = 1 << int(np.ceil(np.log2(2 * (w + hi))))
        A = np.fft.rfft(a, n); Fv = np.fft.rfft(f, n)
        cc = np.fft.irfft(np.conj(A) * Fv, n)[lo:hi]
        cs = np.concatenate([[0.], np.cumsum(f * f)])
        el = cs[np.arange(lo, hi) + w] - cs[np.arange(lo, hi)]
        r = cc / np.sqrt(e0 * el + 1e-12)
        out_t.append((i + w / 2) / SR); out_r.append(float(r.max()))
    return np.array(out_t), np.array(out_r)


class Huellen:
    """Hüllen für einen Ausschnitt [t0, t1] einer Spur (mit Rand für die Filter)."""

    def __init__(self, x, t0, t1):
        self.t0 = t0; self.t1 = t1
        rand = 0.2
        a = max(0, int((t0 - rand) * SR)); b = min(len(x), int((t1 + rand) * SR))
        seg = np.asarray(x[a:b], np.float64)
        self.off = a / SR
        self.x = seg
        self.V = env_db(bp(seg, 120, 1800))
        self.H = env_db(bp(seg, 3500, 11000))
        self.B = env_db(bp(seg, 80, 11000))
        self.t = self.off + np.arange(len(self.V)) * HOP + HOP / 2
        vt, vr = stimmhaft(seg, 0, len(seg) / SR)
        self.vt = vt + self.off; self.vr = vr

    def idx(self, t):
        return int(np.clip(round((t - self.off - HOP / 2) / HOP), 0, len(self.V) - 1))

    def voiced_at(self, t):
        if len(self.vt) == 0: return 0.0
        j = int(np.argmin(np.abs(self.vt - t)))
        return self.vr[j]


def boden(h, ref_lo, ref_hi):
    """Rauschboden: 10. Perzentil der B/H/V-Hülle in [ref_lo, ref_hi]."""
    i0, i1 = h.idx(ref_lo), h.idx(ref_hi)
    return (np.percentile(h.B[i0:i1], 10), np.percentile(h.H[i0:i1], 10), np.percentile(h.V[i0:i1], 10))


def silbe(x, t_lo, t_hi, kern_lo=None, kern_hi=None, boden_ref=None, prev_end=None):
    """Misst eine Silbe. [t_lo, t_hi] = Suchfenster für den Einsatz; Kern im Fenster [kern_lo, kern_hi]."""
    kern_lo = t_lo if kern_lo is None else kern_lo
    kern_hi = t_hi + 0.25 if kern_hi is None else kern_hi
    h = Huellen(x, min(t_lo, kern_lo) - 0.45, max(t_hi, kern_hi) + 0.05)
    bB, bH, bV = boden(h, *(boden_ref or (h.t0, h.t1)))
    k0, k1 = h.idx(kern_lo), h.idx(kern_hi)
    kern = k0 + int(np.argmax(h.V[k0:k1]))
    Lmax = h.V[kern]
    # Vokal-Beginn: rückwärts vom Kern, solange V >= Lmax-12 dB
    j = kern
    lo_lim = h.idx(t_lo - 0.05)
    while j > lo_lim and h.V[j - 1] >= Lmax - 12.0:
        j -= 1
    vokal = h.t[j]
    # stimmhaft? (falls der Bereich bei vokal stimmlos ist: weiter vorwärts bis stimmhaft)
    vr = h.voiced_at(vokal)
    jj = j
    while vr < 0.55 and jj < kern:
        jj += 2; vr = h.voiced_at(h.t[jj])
    if jj != j and h.t[jj] - vokal < 0.06:
        vokal = h.t[jj]; j = jj
    # Transienten-Spitze: steilster Anstieg der V-Hülle um den Vokal-Beginn
    sm = np.convolve(h.V, np.ones(4) / 4, 'same')
    d = np.gradient(sm) / (HOP * 1000)  # dB/ms
    a0, a1 = h.idx(vokal - 0.025), h.idx(min(vokal + 0.05, h.t[kern]))
    if a1 <= a0: a1 = a0 + 1
    sp = a0 + int(np.argmax(d[a0:a1]))
    spitze = h.t[sp]; steil = float(d[sp])
    # Konsonant-Beginn: rückwärts von vokal, solange B > bB+9 oder H > bH+9 (Lücke >= 20 ms stoppt), max 400 ms
    k = j; gap = 0
    lim = h.idx(max(vokal - 0.40, prev_end if prev_end is not None else -1))
    last_on = j
    while k > lim:
        k -= 1
        on = (h.B[k] > bB + 9.0) or (h.H[k] > bH + 9.0)
        if on:
            gap = 0; last_on = k
        else:
            gap += 1
            if gap >= 20: break
    kons = h.t[last_on]
    # Burst/Zischkante: größter H-Sprung zwischen kons und vokal
    b0, b1 = h.idx(kons - 0.005), h.idx(vokal + 0.005)
    if b1 > b0 + 3:
        dh = np.diff(np.convolve(h.H, np.ones(3) / 3, 'same')[b0:b1 + 1])
        burst = h.t[b0 + int(np.argmax(dh))]; burst_db = float(dh.max())
    else:
        burst, burst_db = kons, 0.0
    # Art des Anlauts
    vkons = vokal - kons
    hf_ant = float(np.mean(h.H[h.idx(kons):max(h.idx(kons) + 1, j)] - h.V[h.idx(kons):max(h.idx(kons) + 1, j)])) if j > h.idx(kons) else -99
    return dict(konsonant_s=round(float(kons), 4), vokal_t=round(float(vokal), 4), spitze_t=round(float(spitze), 4),
                burst_t=round(float(burst), 4), kern_t=round(float(h.t[kern]), 4), lmax_db=round(float(Lmax), 1),
                steil_db_ms=round(steil, 2), anlaut_ms=round(vkons * 1000, 1), hf_minus_v_db=round(hf_ant, 1),
                stimmhaft=round(float(h.voiced_at(vokal + 0.01)), 2))
