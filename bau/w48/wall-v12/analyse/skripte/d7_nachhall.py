# Gesamt-Nachhall des Gesangsbusses (Lead+Doppel+Chor+Hall) an Phrasenenden: Pegel nach dem Ende rel. Phrase.
import numpy as np, json
from scipy.signal import butter, sosfiltfilt
S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/'
D = S + 'wall-v12/analyse/dyn/'; SR = 48000; N = 266 * SR
L = json.load(open(S + 'wall/werkzeug/lied.json')); sil = L['silben']
def rms(x, a, b): s = x[int(a * SR):int(b * SR)]; return 10 * np.log10(np.mean(s * s) + 1e-12)
sos = butter(4, [250, 6000], 'band', fs=SR, output='sos')
for m in ['m11', 'm10']:
    V = sosfiltfilt(sos, np.load(D + 'voc_' + m + '.npy').astype(np.float64).mean(1))
    res = {'Strophe': [], 'Refrain': []}
    for i in range(len(sil) - 1):
        e = sil[i]['b']; nx = sil[i + 1]['a']
        if nx - e < .75: continue
        k = 'Refrain' if any(a <= e < b for a, b in [(64, 96), (128, 160), (224, 256)]) else ('Strophe' if (32 < e < 64 or 96 < e < 128) else None)
        if not k: continue
        ph = rms(V, e - .3, e)
        res[k].append([rms(V, e + a, e + b) - ph for a, b in [(.1, .2), (.2, .4), (.4, .7)]])
    for k, v in res.items():
        v = np.median(np.array(v), 0)
        print('%s %-7s (n=%d) Bus nach Phrasenende rel. Phrase: 0,1-0,2 s %.1f dB | 0,2-0,4 s %.1f | 0,4-0,7 s %.1f' % (m, k, len(res[k]), *v))
