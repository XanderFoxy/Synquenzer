# Grundton (YIN-artig, CMNDF) je 5 ms für eine Spur -> cache/f0_<spur>.npz (t, f0 [Hz, 0 = stimmlos], ap = Aperiodizität)
import sys, numpy as np
from zk_gemein import *
def yin(x, hop=240, w=1200, fmin=75., fmax=650.):
    lo = int(SR / fmax); hi = int(SR / fmin)
    n = (len(x) - w - hi) // hop
    nfft = 1 << int(np.ceil(np.log2(w + hi + w)))
    f0 = np.zeros(n); ap = np.ones(n)
    blk = 2000
    for s in range(0, n, blk):
        e = min(n, s + blk)
        idx = np.arange(s, e)[:, None] * hop + np.arange(w + hi)[None, :]
        F = x[idx].astype(np.float64)
        A = np.fft.rfft(F[:, :w], nfft, axis=1); B = np.fft.rfft(F, nfft, axis=1)
        cc = np.fft.irfft(np.conj(A) * B, nfft, axis=1)[:, :hi + 1]
        cs = np.concatenate([np.zeros((e - s, 1)), np.cumsum(F * F, 1)], 1)
        L = np.arange(hi + 1)
        e0 = cs[:, w][:, None]; el = cs[:, L + w] - cs[:, L]
        d = e0 + el - 2 * cc                      # Differenzfunktion
        d[:, 0] = 0
        cum = np.cumsum(d[:, 1:], 1) / np.arange(1, hi + 1)
        cmn = np.ones_like(d); cmn[:, 1:] = d[:, 1:] / np.maximum(cum, 1e-12)
        sub = cmn[:, lo:hi]
        # erstes Minimum unter 0,15, sonst globales
        below = sub < 0.15
        first = np.where(below.any(1), below.argmax(1), sub.argmin(1))
        # bis zum lokalen Minimum laufen
        for q in range(e - s):
            k = first[q]
            while k + 1 < sub.shape[1] and sub[q, k + 1] < sub[q, k]: k += 1
            first[q] = k
        best = sub[np.arange(e - s), first]
        k = first + lo
        # parabolische Interpolation
        km = np.clip(k - 1, 1, hi); kp = np.clip(k + 1, 1, hi)
        a_ = cmn[np.arange(e - s), km]; b_ = cmn[np.arange(e - s), k]; c_ = cmn[np.arange(e - s), kp]
        den = a_ - 2 * b_ + c_
        dk = np.where(np.abs(den) > 1e-9, 0.5 * (a_ - c_) / den, 0)
        per = k + np.clip(dk, -1, 1)
        f0[s:e] = SR / per; ap[s:e] = best
    t = (np.arange(n) * hop + w / 2) / SR
    return t, f0, ap
if __name__ == '__main__':
    for nm in sys.argv[1:]:
        t, f0, ap = yin(np.asarray(lade(nm), np.float32))
        np.savez(CACHE + 'f0_%s.npz' % nm, t=t, f0=f0, ap=ap)
        print(nm, 'stimmhaft-Anteil %.2f' % np.mean(ap < 0.2))
