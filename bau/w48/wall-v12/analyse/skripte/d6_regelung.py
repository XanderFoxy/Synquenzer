# Regelverhalten am Lead: g(t) = <Bus, p>/<p,p>, p = Lead trocken * fruehe IR (Direkt+EQ); GR gegen Eingangspegel; Silben-Einsatz-Mittel.
import numpy as np, json
from scipy.signal import fftconvolve
S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/'
D = S + 'wall-v12/analyse/dyn/'; SR = 48000; N = 266 * SR
L = json.load(open(S + 'wall/werkzeug/lied.json'))
lead = np.load(S + 'wall/roh/ende.npy').astype(np.float64)[:N]
on = np.array([s['a'] for s in L['silben']])
for m in ['m11', 'm10']:
    hs = np.load(D + 'ir_%s_Strophen.npy' % m); hm = hs.mean(0); i0 = int(np.argmax(np.abs(hm[:SR // 2])))
    he = np.roll(hm, 72 - i0)[:792]  # -1,5..+15 ms
    p = fftconvolve(lead, he)[72:72 + N]
    V = np.load(D + 'voc_' + m + '.npy').astype(np.float64).mean(1)
    w = int(.02 * SR); h = int(.01 * SR); n = N // h - 2
    idx = np.arange(n) * h
    cp = np.concatenate([[0], np.cumsum(p * p)]); cx = np.concatenate([[0], np.cumsum(p * V)])
    pp = cp[idx + w] - cp[idx]; px = cx[idx + w] - cx[idx]
    lev = 10 * np.log10(pp / w + 1e-12)
    g = px / np.maximum(pp, 1e-12); gd = 20 * np.log10(np.clip(g, 1e-4, None))
    t = (idx + w / 2) / SR
    sec = ((t > 32) & (t < 64)) | ((t > 96) & (t < 128)) | ((t > 64) & (t < 96)) | ((t > 128) & (t < 160)) | ((t > 224) & (t < 256))
    top = np.percentile(lev[sec], 99); act = sec & (lev > top - 30) & (g > 0)
    ref = np.percentile(gd[act & (lev < top - 24)], 50)
    gr = gd - ref
    print('%s Gain am Lead je 3-dB-Stufe Eingang (rel. leise Stellen, dB):' % m)
    out = []
    for a in range(-30, 0, 3):
        mm = act & (lev >= top + a) & (lev < top + a + 3)
        out.append('%+d:%+.1f(n%d)' % (a, np.median(gr[mm]), mm.sum()))
    print('   ' + ' '.join(out))
    # Kennlinie fitten: GR = -(1-1/R)*(lev-thr) oberhalb thr
    best = None
    for thr in np.arange(top - 30, top - 3, 1.0):
        for R in [1.2, 1.5, 2, 2.5, 3, 4, 6, 10]:
            pred = -np.maximum(0, lev[act] - thr) * (1 - 1 / R)
            e = np.median(np.abs(gr[act] - pred))
            if best is None or e < best[0]: best = (e, thr - top, R)
    print('   Fit: Schwelle %.0f dB unter Spitzen, Ratio %.1f:1 (Fehler %.2f dB); GR an den lautesten 5 %%: %.1f dB, Median aktiv: %.1f dB' % (best[1], best[2], best[0], np.median(gr[act & (lev > np.percentile(lev[act], 95))]), np.median(gr[act])))
    # Einsatz-Mittel: GR-Verlauf um Silbeneinsaetze (laute Silben)
    tr = []
    for a in on:
        k = int(a * 100)
        if 32 < a < 256 and k + 40 < n and k > 10:
            seg = gr[k - 5:k + 40]; lv = lev[k - 5:k + 40]
            if np.all(np.isfinite(seg)) and lv.max() > top - 10 and np.all(g[k - 5:k + 40] > 0): tr.append(seg)
    tr = np.median(np.array(tr), 0)
    print('   GR um laute Silbeneinsaetze (Median, n=%d): ' % len(on) + ' '.join('%+dms:%+.1f' % ((i - 5) * 10, tr[i]) for i in range(0, 45, 3)))
