# Zeitkarte Quelle A (z. B. Rohaufnahme) -> Quelle B (z. B. v12-Lead) per bandbegrenztem DTW auf Log-Mel-Merkmalen (5 ms).
import ctypes, os, sys, numpy as np
from zk_gemein import *
HOPS = 240  # 5 ms
NFFT = 1024
LIB = ctypes.CDLL(os.path.dirname(os.path.abspath(__file__)) + '/dtw_band.so')
LIB.dtw_band.restype = ctypes.c_int


def melbank(nb=48, fmin=80., fmax=9000.):
    f = np.fft.rfftfreq(NFFT, 1 / SR)
    mel = lambda x: 2595 * np.log10(1 + x / 700.); imel = lambda m: 700 * (10 ** (m / 2595.) - 1)
    pts = imel(np.linspace(mel(fmin), mel(fmax), nb + 2))
    M = np.zeros((nb, len(f)))
    for b in range(nb):
        lo, c, hi = pts[b:b + 3]
        M[b] = np.clip(np.minimum((f - lo) / (c - lo), (hi - f) / (hi - c)), 0, None)
    return M


def merkmale(name):
    c = CACHE + 'mel_' + name + '.npy'
    if os.path.exists(c): return np.load(c)
    x = np.asarray(lade(name), np.float32)
    nfr = N // HOPS
    win = np.hanning(NFFT).astype(np.float32)
    M = melbank().astype(np.float32)
    out = np.zeros((nfr, M.shape[0]), np.float32)
    xp = np.concatenate([np.zeros(NFFT // 2, np.float32), x, np.zeros(NFFT, np.float32)])
    blk = 4000
    for s in range(0, nfr, blk):
        e = min(nfr, s + blk)
        idx = np.arange(s, e)[:, None] * HOPS + np.arange(NFFT)[None, :]
        F = np.abs(np.fft.rfft(xp[idx] * win, axis=1)) ** 2
        out[s:e] = 10 * np.log10(F @ M.T + 1e-12)
    np.save(c, out)
    return out


def norm(F):
    act = F.max(1) > np.percentile(F.max(1), 99) - 45
    ref = np.median(F[act].max(1))
    G = np.maximum(F - ref, -60.0)          # Boden 60 dB unter typischem Pegel
    return G


def karte(a, b, B=120, pen=0.15, t0=0., t1=266.):
    """Pfad a->b. Rückgabe: Funktion t_a -> t_b (Sekunden) als Stützstellen (ta, tb)."""
    FA = norm(merkmale(a)); FB = norm(merkmale(b))
    i0, i1 = int(t0 / .005), int(t1 / .005)
    A = FA[i0:i1]; Bm = FB[i0:i1]
    n = len(A); W = 2 * B + 1
    C = np.full((n, W), 1e3, np.float32)
    for k in range(W):
        d = k - B
        lo = max(0, -d); hi = min(n, n - d)
        if hi <= lo: continue
        diff = A[lo:hi] - Bm[lo + d:hi + d]
        C[lo:hi, k] = np.sqrt((diff * diff).mean(1)) / 10.0
    pi = np.zeros(2 * n + 10, np.int32); pj = np.zeros(2 * n + 10, np.int32)
    L = LIB.dtw_band(C.ctypes.data_as(ctypes.c_void_p), n, n, B, ctypes.c_float(pen),
                     pi.ctypes.data_as(ctypes.c_void_p), pj.ctypes.data_as(ctypes.c_void_p))
    assert L > 0
    pi = pi[:L][::-1]; pj = pj[:L][::-1]
    # je i den Mittelwert von j
    s = np.zeros(n); c = np.zeros(n)
    np.add.at(s, pi, pj); np.add.at(c, pi, 1)
    jm = s / np.maximum(c, 1)
    ta = t0 + (np.arange(n) + .5) * .005; tb = t0 + (jm + .5) * .005
    kost = C[pi, pj - pi + B]
    return ta, tb, (pi, pj, kost)


if __name__ == '__main__':
    a, b = sys.argv[1], sys.argv[2]
    ta, tb, (pi, pj, kost) = karte(a, b)
    np.savez(CACHE + 'karte_%s_%s.npz' % (a, b), ta=ta, tb=tb)
    print(a, '->', b, 'Pfad', len(pi), 'mittl. Kosten %.3f' % kost.mean())
