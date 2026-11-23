import numpy as np, json, soundfile as sf
from scipy.signal import butter, sosfiltfilt
S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/'
D = S + 'wall-v12/analyse/dyn/'; R = S + 'wall-v12/repo/the-wall/'
SR = 48000; N = 266 * SR
L = json.load(open(S + 'wall/werkzeug/lied.json'))
def wav(p): x, sr = sf.read(R + p, dtype='float64'); return x[:N]
def mid(n): v = np.load(D + n); return v.mean(1).astype(np.float64)
T = {
 'roh (Original)': wav('original/Gesang-Platzhalter-3.wav'),
 'v7 trocken': wav('projekt7/Haupt-3-trocken-v7.wav'),
 'v11 Lead trocken (ende)': np.load(S + 'wall/roh/ende.npy').astype(np.float64)[:N],
 'v10 Gesangsbus im Master': mid('voc_m10.npy'),
 'v11 Gesangsbus im Master': mid('voc_m11.npy'),
}
def bp(x, lo, hi): return sosfiltfilt(butter(4, [lo, hi], 'band', fs=SR, output='sos'), x)
def rms(x, hop=.05, win=.05):
    h = int(hop * SR); w = int(win * SR); n = len(x) // h
    c = np.concatenate([[0], np.cumsum(x * x)]); i = np.arange(n) * h
    b = np.minimum(i + w, len(x)); return 10 * np.log10((c[b] - c[i]) / w + 1e-12)
def pk(x, hop=.05):
    h = int(hop * SR); n = len(x) // h; return 20 * np.log10(np.abs(x[:n * h]).reshape(n, h).max(1) + 1e-12)
secs = [(s['kurz'], s['von_s'], s['bis_s'] or 266) for s in L['abschnitte'] if s['kurz'] in ('S1', 'R1', 'S2', 'R2', 'ZT', 'R3')]
sil = [(s['a'], s['b']) for s in L['silben']]
ref = rms(bp(T['v11 Lead trocken (ende)'], 200, 6000))  # Aktivitaet nach Lead
out = {}
for nm, x in T.items():
    xb = bp(x, 200, 6000); r = rms(xb); p = pk(xb); r400 = rms(xb, .1, .4)
    row = {}
    for k, a, b in secs:
        sl = slice(int(a * 20), int(b * 20)); act = ref[sl] > np.percentile(ref[sl], 95) - 25
        rr = r[sl][act]; pp = p[sl][act]
        crest = np.median(pp - rr)  # Spitze/RMS je 50 ms
        spread = np.percentile(rr, 95) - np.percentile(rr, 10)
        sl4 = slice(int(a * 10), int(b * 10)); a4 = np.repeat(act, 2)[:sl4.stop - sl4.start] if False else None
        sp4 = r400[sl4]; sp4 = sp4[sp4 > np.percentile(sp4, 95) - 20]; lra = np.percentile(sp4, 95) - np.percentile(sp4, 10)
        sy = [r[int(s0 * 20):int(s1 * 20) + 1].max() for s0, s1 in sil if a <= s0 < b and s1 - s0 > .08]
        sy = np.array(sy); sstd = np.std(sy); srng = np.percentile(sy, 90) - np.percentile(sy, 10)
        row[k] = (crest, spread, lra, sstd, srng)
    out[nm] = row
print('Werte je Teil: Crest(50ms Spitze-RMS) | Spreizung 50ms p95-p10 | Spreizung 400ms | Silbenspitzen Std | Silben p90-p10  (dB)')
for nm, row in out.items():
    print('%-26s' % nm + '  '.join('%s %4.1f|%4.1f|%4.1f|%3.1f|%4.1f' % (k, *v) for k, v in row.items()))
for nm, row in out.items():
    v = np.array(list(row.values())); print('%-26s Mittel: Crest %.1f  Spr50 %.1f  Spr400 %.1f  SilbStd %.1f  Silb90-10 %.1f' % (nm, *v.mean(0)))
