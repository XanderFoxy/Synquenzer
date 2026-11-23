# Einfache Tonhöhen-Schätzung (YIN-artig) für Analysen, nur numpy.
import numpy as np
SR = 48000
def yin(x, t0, t1, hop=0.01, win=0.04, fmin=70, fmax=900, thr=0.15, sr=SR):
    x = np.asarray(x, np.float64)
    out = []
    W = int(win * sr); tmin = int(sr / fmax); tmax = int(sr / fmin)
    t = t0
    while t < t1:
        i = int(t * sr)
        fr = x[i:i + W + tmax]
        if len(fr) < W + tmax: break
        e = np.sum(fr[:W] ** 2)
        if e < 1e-7: out.append((t, 0., 0.)); t += hop; continue
        # Differenzfunktion über FFT
        a = fr[:W]
        d = np.zeros(tmax + 1)
        cs = np.concatenate([[0], np.cumsum(fr ** 2)])
        n = len(fr); F = np.fft.rfft(fr, 2 * n); A = np.fft.rfft(a[::-1], 2 * n)
        cc = np.fft.irfft(F * A, 2 * n)[W - 1:W - 1 + tmax + 1]
        for tau in range(1, tmax + 1): pass
        taus = np.arange(tmax + 1)
        d = np.sum(a * a) + (cs[taus + W] - cs[taus]) - 2 * cc
        d[0] = 0
        cm = d[1:] * np.arange(1, tmax + 1) / np.maximum(np.cumsum(d[1:]), 1e-12)
        cm = np.concatenate([[1], cm])
        cand = np.where(cm[tmin:] < thr)[0]
        if len(cand):
            k = cand[0] + tmin
            while k + 1 <= tmax and cm[k + 1] < cm[k]: k += 1
            if 1 <= k < tmax:
                a1, b1, c1 = cm[k - 1], cm[k], cm[k + 1]; den = a1 - 2 * b1 + c1
                kk = k + (0.5 * (a1 - c1) / den if abs(den) > 1e-12 else 0)
            else: kk = k
            out.append((t, sr / kk, 1 - cm[k]))
        else: out.append((t, 0., 0.))
        t += hop
    return np.array(out)
def cent(f, ref=440.):
    return np.where(f > 0, 1200 * np.log2(np.maximum(f, 1e-9) / ref), np.nan)
