# Master v10 gegen v11: Band-Pegel je 0,5 s, Unterschied je Band und Abschnitt (nur Messung).
import sys, numpy as np
sys.path.insert(0, __import__('os').path.dirname(__file__))
from gemein import lade, SR, LIED, mmss
a = np.asarray(lade('master-v10'), np.float64); b = np.asarray(lade('master-v11'), np.float64)
N = 8192; hop = SR // 2
win = np.hanning(N)
f = np.fft.rfftfreq(N, 1 / SR)
grenzen = [30, 60, 120, 250, 500, 1000, 2000, 4000, 8000, 16000]
def bands(x):
    out = []
    for i in range(0, len(x) - N, hop):
        X = np.abs(np.fft.rfft(x[i:i + N] * win)) ** 2
        out.append([10 * np.log10(X[(f >= lo) & (f < hi)].sum() + 1e-9) for lo, hi in zip(grenzen[:-1], grenzen[1:])])
    return np.array(out)
A = bands(a); B = bands(b); D = B - A
t = np.arange(len(D)) * .5 + N / SR / 2
np.save('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall/roh/master_baender.npy', np.stack([A, B]))
print('Bänder', [f'{lo}-{hi}' for lo, hi in zip(grenzen[:-1], grenzen[1:])])
for s in LIED['abschnitte']:
    m = (t >= s['von_s']) & (t < (s['bis_s'] or 266))
    print('%-20s' % s['name'], ' '.join('%+5.1f' % v for v in np.median(D[m], 0)))
tot = np.sqrt(np.mean(D ** 2, 1))
print('größte Unterschiede (RMS über Bänder):')
for i in np.argsort(-tot)[:25]: print('  %6.1f %s  %.1f dB  ' % (t[i], mmss(t[i]), tot[i]) + ' '.join('%+5.1f' % v for v in D[i]))
