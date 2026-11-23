# Kleine DSP-Bibliothek für den v12-Mix (alles vektorisiert, 48 kHz)
import numpy as np
from scipy.signal import sosfilt, sosfiltfilt, butter, lfilter, oaconvolve, resample_poly
from scipy.ndimage import maximum_filter1d, uniform_filter1d

SR = 48000


def db(x): return 20 * np.log10(np.maximum(np.abs(x), 1e-12))
def undb(g): return 10 ** (np.asarray(g) / 20)


# ---------- Filter (RBJ) ----------
def biquad(kind, f0, q=0.707, gain_db=0.0, sr=SR):
    A = 10 ** (gain_db / 40); w = 2 * np.pi * f0 / sr; cw = np.cos(w); sw = np.sin(w); al = sw / (2 * q)
    if kind == 'peak':
        b = [1 + al * A, -2 * cw, 1 - al * A]; a = [1 + al / A, -2 * cw, 1 - al / A]
    elif kind == 'lowshelf':
        sA = 2 * np.sqrt(A) * al
        b = [A * ((A + 1) - (A - 1) * cw + sA), 2 * A * ((A - 1) - (A + 1) * cw), A * ((A + 1) - (A - 1) * cw - sA)]
        a = [(A + 1) + (A - 1) * cw + sA, -2 * ((A - 1) + (A + 1) * cw), (A + 1) + (A - 1) * cw - sA]
    elif kind == 'highshelf':
        sA = 2 * np.sqrt(A) * al
        b = [A * ((A + 1) + (A - 1) * cw + sA), -2 * A * ((A - 1) + (A + 1) * cw), A * ((A + 1) + (A - 1) * cw - sA)]
        a = [(A + 1) - (A - 1) * cw + sA, 2 * ((A - 1) - (A + 1) * cw), (A + 1) - (A - 1) * cw - sA]
    elif kind == 'hp':
        b = [(1 + cw) / 2, -(1 + cw), (1 + cw) / 2]; a = [1 + al, -2 * cw, 1 - al]
    elif kind == 'lp':
        b = [(1 - cw) / 2, 1 - cw, (1 - cw) / 2]; a = [1 + al, -2 * cw, 1 - al]
    else: raise ValueError(kind)
    b = np.array(b) / a[0]; a = np.array(a) / a[0]
    return np.concatenate([b, a])[None, :]


def eq(x, bands):
    """bands: Liste (kind, f0, q, gain)."""
    if not bands: return x
    sos = np.concatenate([biquad(*b) for b in bands], 0)
    return sosfilt(sos, x, axis=0)


def hp(x, f, order=2): return sosfilt(butter(order, f, 'highpass', fs=SR, output='sos'), x, axis=0)
def lp(x, f, order=2): return sosfilt(butter(order, f, 'lowpass', fs=SR, output='sos'), x, axis=0)
def bp_zp(x, lo, hi, order=2): return sosfiltfilt(butter(order, [lo, hi], 'bandpass', fs=SR, output='sos'), x, axis=0)
def hp_zp(x, f, order=4): return sosfiltfilt(butter(order, f, 'highpass', fs=SR, output='sos'), x, axis=0)


# ---------- Hüllkurven / Regelung ----------
def rms_db(x, win_ms):
    w = max(int(win_ms * SR / 1000), 1)
    p = x ** 2 if x.ndim == 1 else (x ** 2).mean(1)
    return 10 * np.log10(uniform_filter1d(p, w, mode='nearest') + 1e-12)


def peak_db(x, hold_ms=1.0):
    a = np.abs(x) if x.ndim == 1 else np.abs(x).max(1)
    return db(maximum_filter1d(a, max(int(hold_ms * SR / 1000), 1)))


def gr_static(lvl, thr, ratio, knee=0.0):
    """Gain-Reduction (positiv, dB) einer Kennlinie mit weichem Knie."""
    over = lvl - thr; s = 1 - 1 / ratio
    gr = np.where(over <= -knee / 2, 0.0, np.where(over >= knee / 2, s * over, s * (over + knee / 2) ** 2 / (2 * max(knee, 1e-9))))
    return gr


def glaetten(gr, att_ms, rel_ms, rel_ref_db=6.0):
    """Release: lineare dB-Rückkehr (rel_ref_db je rel_ms), vektorisiert per max.accumulate; danach Attack als One-Pole."""
    s = rel_ref_db / (rel_ms * SR / 1000)
    idx = np.arange(len(gr), dtype=np.float64)
    g = np.maximum.accumulate(gr + s * idx) - s * idx
    a = 1 - np.exp(-1 / (att_ms * SR / 1000))
    return lfilter([a], [1, -(1 - a)], g)


def kompressor(x, thr, ratio, att_ms, rel_ms, knee=0.0, det='rms', det_ms=10.0, sidechain=None):
    sc = x if sidechain is None else sidechain
    lvl = rms_db(sc, det_ms) if det == 'rms' else peak_db(sc, det_ms)
    gr = glaetten(gr_static(lvl, thr, ratio, knee), att_ms, rel_ms)
    g = undb(-gr)
    return (x * g if x.ndim == 1 else x * g[:, None]), gr


def entzischer(x, f_lo=5500.0, thr=-40.0, max_red=4.0, ratio=0.6):
    hi = hp_zp(x, f_lo, 4); lo = x - hi
    lvl = rms_db(hi, 3.0)
    gr = np.clip((lvl - thr) * ratio, 0, max_red)
    gr = glaetten(gr, 1.0, 40.0)
    g = undb(-gr)
    return lo + (hi * g if x.ndim == 1 else hi * g[:, None]), gr


def expander(x, thr, max_red=12.0, ratio=2.0, win_ms=20.0):
    lvl = rms_db(x, win_ms)
    gr = np.clip((thr - lvl) * (ratio - 1), 0, max_red)
    offen = glaetten(max_red - gr, 2.0, 150.0, rel_ref_db=max_red)   # öffnet schnell, schließt langsam
    gr = max_red - offen
    return (x * undb(-gr) if x.ndim == 1 else x * undb(-gr)[:, None]), gr


# ---------- Masken ----------
def maske(ranges, n, fade_s=0.03):
    """Bereiche [(a,b)] -> 0/1 mit Raised-Cosine-Blenden (Länge fade_s), Abtastrate 1 kHz -> interpoliert."""
    K = 1000; m = np.zeros(int(n / SR * K) + 2)
    for a, b in ranges:
        m[max(int(a * K), 0):max(int(b * K), 0)] = 1
    w = max(int(fade_s * K), 1); win = np.hanning(w + 2)[1:-1]; win /= win.sum()
    m = np.convolve(m, win, 'same')
    return np.interp(np.arange(n) / SR, np.arange(len(m)) / K, m)


# ---------- Panorama / Verzögerung ----------
def pan(x, p):
    """p -1 (links) … +1 (rechts), Konstantleistung."""
    a = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], 1) * np.sqrt(2)


def verz(x, ms):
    k = int(round(ms * SR / 1000)); y = np.zeros_like(x)
    if k == 0: return x.copy()
    y[k:] = x[:-k]; return y


# ---------- Hall ----------
def plate_ir(rt60, predelay_ms, length_s=None, seed=1, hf_faktoren=(1.15, 1.0, 0.85, 0.6, 0.38), dichte_ms=4.0):
    """Synthetische Plate: dekorrelierte Rauschfahne je Kanal, frequenzabhängiger Abfall, schneller dichter Einsatz."""
    if length_s is None: length_s = rt60 * 1.4
    n = int(length_s * SR); t = np.arange(n) / SR
    rng = np.random.default_rng(seed)
    kanten = [0, 250, 1000, 4000, 8000, SR / 2]
    f = np.fft.rfftfreq(n, 1 / SR)
    out = np.zeros((n, 2))
    for ch in range(2):
        N_ = rng.standard_normal(n); F = np.fft.rfft(N_)
        y = np.zeros(n)
        for k in range(len(kanten) - 1):
            lo, hi = kanten[k], kanten[k + 1]
            m = np.ones_like(f)
            if lo > 0: m *= 0.5 * (1 + np.tanh(4 * np.log2(np.maximum(f, 1) / lo)))
            if hi < SR / 2: m *= 0.5 * (1 - np.tanh(4 * np.log2(np.maximum(f, 1) / hi)))
            band = np.fft.irfft(F * m, n)
            y += band * np.exp(-6.91 * t / (rt60 * hf_faktoren[k]))
        y *= (1 - np.exp(-t / (dichte_ms / 1000)))
        out[:, ch] = y
    out /= np.sqrt((out ** 2).sum(0, keepdims=True))
    pd = int(predelay_ms * SR / 1000)
    return np.concatenate([np.zeros((pd, 2)), out], 0)


def hall(x_mono, ir, hp_f=None, lp_f=None):
    y = np.stack([oaconvolve(x_mono, ir[:, c])[:len(x_mono)] for c in (0, 1)], 1)
    if hp_f: y = hp(y, hp_f, 2)
    if lp_f: y = lp(y, lp_f, 2)
    return y


def echo(x_mono, zeit_s=0.5, fb=0.18, n_taps=6, lo=300.0, hi=5000.0):
    """Gefiltertes Viertel-Delay, Ping-Pong (1. Echo links betont, 2. rechts …)."""
    n = len(x_mono); y = np.zeros((n, 2)); k = int(zeit_s * SR)
    src = bp_zp(x_mono, lo, hi, 2)
    for i in range(1, n_taps + 1):
        g = fb ** (i - 1)
        if i * k >= n: break
        sh = np.zeros(n); sh[i * k:] = src[:n - i * k] * g
        src = lp(src, 6000.0, 1)          # jedes Echo etwas dunkler
        pl = -0.5 if i % 2 else 0.5
        y += pan(sh, pl) / np.sqrt(2)
    return y


# ---------- Limiter (True Peak, 4x Oversampling) ----------
def _tp_hull(x, blk=SR * 8, pad=256):
    """Je Sample der höchste 4x-überabgetastete Betrag (blockweise, speicherschonend)."""
    n = len(x); out = np.empty(n)
    for s0 in range(0, n, blk):
        a = max(s0 - pad, 0); b = min(s0 + blk + pad, n)
        up = np.abs(resample_poly(x[a:b], 4, 1, axis=0))
        up = up.max(1) if up.ndim > 1 else up
        m = len(up) // 4; p = up[:m * 4].reshape(m, 4).max(1)
        out[s0:min(s0 + blk, n)] = p[s0 - a:s0 - a + min(blk, n - s0)]
    return out


def limiter(x, ceiling_dbtp=-1.3, look_ms=1.5, rel_db_s=20.0):
    p = _tp_hull(x); n = len(x)
    req = np.maximum(db(p) - ceiling_dbtp, 0.0)
    L = max(int(look_ms * SR / 1000), 1)
    a = maximum_filter1d(req, size=L + 1, origin=-(L // 2))     # schaut L Samples voraus
    s = rel_db_s / SR; idx = np.arange(n, dtype=np.float64)
    a = np.maximum.accumulate(a + s * idx) - s * idx
    a = uniform_filter1d(a, max(L // 2, 1))
    a = np.maximum(a, req)                                        # Sicherheit
    return x * undb(-a)[:, None], a


def true_peak(x):
    return float(db(_tp_hull(x).max()))


def softclip(x, thr_db=-3.0, ceil_db=-0.8, blk=SR * 8, pad=256):
    """Weicher Clipper bei 4x Überabtastung (blockweise): unter thr linear, darüber tanh-Knie bis ceil."""
    t = undb(thr_db); c = undb(ceil_db); n = len(x); out = np.empty_like(x); cnt = 0; tot = 0; mx = 0.0
    for s0 in range(0, n, blk):
        a = max(s0 - pad, 0); b = min(s0 + blk + pad, n)
        up = resample_poly(x[a:b], 4, 1, axis=0); ab = np.abs(up); over = ab > t
        if over.any():
            y = up.copy(); y[over] = np.sign(up[over]) * (t + (c - t) * np.tanh((ab[over] - t) / (c - t)))
            mx = max(mx, float((db(ab[over]) - db(np.abs(y[over]))).max()))
            cnt += int(over[(s0 - a) * 4:(s0 - a + min(blk, n - s0)) * 4].sum())
            dn = resample_poly(y, 1, 4, axis=0)
        else:
            dn = x[a:b]
        tot += min(blk, n - s0) * 4 * (x.shape[1] if x.ndim > 1 else 1)
        out[s0:min(s0 + blk, n)] = dn[s0 - a:s0 - a + min(blk, n - s0)]
    return out, cnt / tot * 100, mx
