import numpy as np, json, pyloudnorm as pyln
from scipy.signal import butter, sosfiltfilt, resample_poly
S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/'
D = S + 'wall-v12/analyse/dyn/'; SR = 48000; N = 266 * SR
def bp(x, lo, hi): return sosfiltfilt(butter(4, [lo, hi], 'band', fs=SR, output='sos'), x)
def rms(x, hop=.05, win=.05):
    h = int(hop * SR); w = int(win * SR); n = len(x) // h
    c = np.concatenate([[0], np.cumsum(x * x)]); i = np.arange(n) * h
    b = np.minimum(i + w, len(x)); return 10 * np.log10((c[b] - c[i]) / w + 1e-12)
lead = np.load(S + 'wall/roh/ende.npy').astype(np.float64)[:N]
secs = {'S1': (32, 63.5), 'S2': (96, 127.5), 'R1': (64, 96), 'R2': (128, 160), 'R3': (224, 256)}
x = rms(bp(lead, 1000, 4000))
for m in ['m10', 'm11']:
    V = np.load(D + 'voc_' + m + '.npy').astype(np.float64).mean(1)
    y = rms(bp(V, 1000, 4000))
    print(m)
    for k, (a, b) in secs.items():
        sl = slice(int(a * 20), int(b * 20)); xx = x[sl]; yy = y[sl]
        act = xx > np.percentile(xx, 97) - 24
        xx, yy = xx[act], yy[act]
        top = np.percentile(xx, 97)
        # Steigung oberhalb/unterhalb (top-10 dB)
        def sl_(m_):
            if m_.sum() < 15: return np.nan
            return np.polyfit(xx[m_], yy[m_], 1)[0]
        hi = sl_(xx > top - 10); lo = sl_((xx <= top - 10) & (xx > top - 22))
        # Bins: Ausgang je Eingangsstufe
        bins = [(top - 24 + 3 * i, top - 21 + 3 * i) for i in range(8)]
        med = [np.median(yy[(xx >= a_) & (xx < b_)]) if ((xx >= a_) & (xx < b_)).sum() > 5 else np.nan for a_, b_ in bins]
        med = np.array(med) - np.nanmax(med)
        print('  %s Steigung oben(-10..0 dB) %.2f -> Ratio ~%.1f:1 | unten(-22..-10) %.2f | Ausgang je 3-dB-Stufe Eingang: %s' % (k, hi, 1 / hi, lo, ' '.join('%+.1f' % v for v in med)))
# Pumpen: Musikfaktor (0,25 s) gegen Gesangspegel (0,25 s)
for m in ['m10', 'm11']:
    g = 20 * np.log10(np.abs(np.load(D + 'g_' + m + '.npy')) + 1e-9)
    V = np.load(D + 'voc_' + m + '.npy').astype(np.float64).mean(1)
    gv = rms(bp(V, 200, 6000), .25, .25)[:len(g)]
    act = (np.arange(len(g)) > 128) & (np.arange(len(g)) < 1020)
    loud = gv > np.percentile(gv[act], 50)
    hi = act & loud; lo = act & (gv < np.percentile(gv[act], 15))
    c = np.corrcoef(g[act], gv[act])[0, 1]
    # innerhalb Refrain: Schwankung von g auf 0,25 s
    r = slice(64 * 4, 96 * 4); dg = np.diff(g[r])
    print('%s Pumpen: Korr(Musikfaktor, Gesangspegel) %.2f; Musik bei lautem Gesang %.2f dB, bei leisem %.2f dB; Schwankung im R1 (Std 0,25 s) %.2f dB' % (m, c, np.median(g[hi]), np.median(g[lo]), np.std(dg) / np.sqrt(2)))
# Master-Kennzahlen
for m in ['m9', 'm10', 'm11', 'inst']:
    M = np.fromfile(D + m + '.f32', np.float32).reshape(-1, 2)[:N].astype(np.float64)
    meter = pyln.Meter(SR); I = meter.integrated_loudness(M)
    tp = 20 * np.log10(np.abs(resample_poly(M[:, 0], 4, 1)).max())
    sp = 20 * np.log10(np.abs(M).max())
    near = (np.abs(M) > 10 ** ((sp - .3) / 20)).mean() * 100
    # Kurzzeit-Lautheit (3 s) Spreizung in den Refrains
    st = []
    for t in np.arange(64, 96, 1.0):
        st.append(meter.integrated_loudness(M[int(t * SR):int((t + 3) * SR)]) if False else 10 * np.log10(np.mean(M[int(t * SR):int((t + .4) * SR)] ** 2)))
    print('%-4s LUFS %.1f  Sample-Peak %.2f dBFS  TruePeak(L) %.2f  PLR %.1f dB  Anteil Samples <0,3 dB unter Spitze %.3f %%' % (m, I, sp, tp, tp - I, near))
