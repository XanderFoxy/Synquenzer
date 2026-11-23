# Impulsantwort der Gesangskette (Lead trocken -> Gesangsbus im Master) per Kreuzspektrum (H1), Verse vs Refrain, L/R.
import numpy as np
from scipy.signal import butter, sosfiltfilt
S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/'
D = S + 'wall-v12/analyse/dyn/'; SR = 48000; N = 266 * SR
lead = np.load(S + 'wall/roh/ende.npy').astype(np.float64)[:N]
NF = 2 ** 18; HOP = 2 ** 15; win = np.hanning(NF)
parts = {'Strophen': [(31.5, 63.8), (95.5, 127.6)], 'Refrains': [(63, 96), (127, 160), (223, 256)]}
def H1(x, y, rng):
    Sxy = 0; Sxx = 0
    for a, b in rng:
        for s in range(int(a * SR), int(b * SR) - NF, HOP):
            X = np.fft.rfft(x[s:s + NF] * win); Y = np.fft.rfft(y[s:s + NF] * win)
            Sxy = Sxy + Y * np.conj(X); Sxx = Sxx + np.abs(X) ** 2
    H = Sxy / (Sxx + 1e-3 * Sxx.mean())
    f = np.fft.rfftfreq(NF, 1 / SR); H[(f < 120) | (f > 12000)] *= 0  # nur Gesangsband
    return np.fft.irfft(H, NF)
res = {}
for m in ['m11', 'm10']:
    V = np.load(D + 'voc_' + m + '.npy').astype(np.float64)
    for pn, rng in parts.items():
        hs = [H1(lead, V[:, c], rng) for c in (0, 1)]
        res[(m, pn)] = hs
        np.save(D + 'ir_%s_%s.npy' % (m, pn), np.array(hs))
for (m, pn), hs in res.items():
    hm = (hs[0] + hs[1]) / 2; hsd = (hs[0] - hs[1]) / 2
    e = hs[0] ** 2 + hs[1] ** 2
    i0 = int(np.argmax(np.abs(hm[:SR // 2]))); ms = lambda k: 1000 * k / SR
    d0 = max(i0 - int(.0015 * SR), 0); d1 = i0 + int(.004 * SR)
    Ed = e[d0:d1].sum(); tail = e[d1:d1 + int(3 * SR)]
    Er = tail.sum()
    # Schroeder ab Ende Direktschall
    sch = np.cumsum(tail[::-1])[::-1]; sch = 10 * np.log10(sch / sch[0] + 1e-20)
    def tcross(db): k = np.argmax(sch < db); return k / SR
    edt = tcross(-10) * 6; t20 = (tcross(-25) - tcross(-5)) * 3; t30 = (tcross(-35) - tcross(-5)) * 2
    # Energie in Zeitfenstern relativ zum Direktschall
    def bins(a_ms, b_ms): return 10 * np.log10(e[i0 + int(a_ms * SR / 1000):i0 + int(b_ms * SR / 1000)].sum() / Ed + 1e-20)
    # Vorverzoegerung: erstes 2-ms-Fenster nach 4 ms mit Energie > -30 dB rel. Direkt-Energiedichte
    dens = np.convolve(e, np.ones(96) / 96, 'same'); dd = dens[i0]
    k = i0 + int(.004 * SR); 
    while k < i0 + int(.3 * SR) and dens[k] < dd * 10 ** (-3.5): k += 1
    side = (hsd[d1:d1 + 3 * SR] ** 2).sum() / ((hm[d1:d1 + 3 * SR] ** 2).sum() + 1e-20)
    print('%s %-8s Latenz %.1f ms | Hall/Direkt %+.1f dB | EDT %.2f s  T20->RT60 %.2f s  T30->RT60 %.2f s | Vorverz. ~%.0f ms | Hall-Seitenanteil S/M %.2f' % (m, pn, ms(i0), 10 * np.log10(Er / Ed), edt, t20, t30, ms(k - i0), side))
    print('      Energie rel. Direkt [dB]: 4-20ms %.1f | 20-60 %.1f | 60-120 %.1f | 120-240 %.1f | 240-260 %.1f | 260-500 %.1f | 490-510 %.1f | 0,5-1 s %.1f | 1-2 s %.1f | 2-3 s %.1f' % tuple(bins(a, b) for a, b in [(4, 20), (20, 60), (60, 120), (120, 240), (240, 260), (260, 500), (490, 510), (500, 1000), (1000, 2000), (2000, 3000)]))
    # Spektrum Hall vs Direkt
    def band(x, lo, hi): return (sosfiltfilt(butter(4, [lo, hi], 'band', fs=SR, output='sos'), x) ** 2)
    out = []
    for lo, hi in [(150, 400), (400, 1500), (1500, 5000), (5000, 11000)]:
        bd = band(hm[:d1 + 3 * SR], lo, hi); out.append(10 * np.log10(bd[d1:].sum() / bd[d0:d1].sum()))
    print('      Hall/Direkt je Band: 150-400 %+.1f | 400-1,5k %+.1f | 1,5-5k %+.1f | 5-11k %+.1f dB' % tuple(out))
