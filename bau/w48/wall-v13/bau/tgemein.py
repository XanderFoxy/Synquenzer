# The Wall v13 – Timing: gemeinsame Helfer (nur lokal). Liest nur aus repo/, wall/, wall-v12/; schreibt nur in wall-v13/.
import os, sys, json
import numpy as np
import soundfile as sf

SP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/'
W12 = SP + 'wall-v12/'
R = W12 + 'repo/the-wall/'
ROH = SP + 'wall/roh/'
W13 = SP + 'wall-v13/'
A13 = W13 + 'analyse/'
B13 = W13 + 'bau/'
TC = B13 + 'tcache/'
ST13 = B13 + 'stimmen/'
OUT13 = W13 + 'out/'
for d in (TC, ST13, OUT13): os.makedirs(d, exist_ok=True)
sys.path.insert(0, A13)          # zk_kern / zk_gemein (Messdefinition der Zielkarte)

SR = 48000
N = 266 * SR
ZK = json.load(open(A13 + 'zielkarte.json'))
LIED = json.load(open(SP + 'wall/werkzeug/lied.json'))

QUELLE = {
    'H_v7': R + 'projekt7/Haupt-3-trocken-v7.wav',      # 24 bit, trocken, gestimmt (v6), Quelle für v13-Haupt
    'D_t': W12 + 'bau/stimmen/doppel_t.wav',           # v12-Doppel: v7-Doppel (24 bit) auf Haupt gestimmt (rubberband R3), 32 bit float
    'H_roh': R + 'original/Gesang-Platzhalter-3.wav',  # Rohaufnahme (nass, ungestimmt) – nur Vergleich
}


def lade_wav(p):
    x, sr = sf.read(p, dtype='float64', always_2d=True); assert sr == SR
    x = x.mean(1)
    y = np.zeros(N); y[:min(N, len(x))] = x[:N]
    return y


def lade_npy(name):
    return np.load(ROH + name + '.npy').astype(np.float64)[:N]


def dtw(a, b):
    z = np.load(A13 + 'cache/karte_%s_%s.npz' % (a, b))
    ta, tb = z['ta'], z['tb']
    return lambda t: np.interp(t, ta, tb)


def dtw_inv(a, b):
    z = np.load(A13 + 'cache/karte_%s_%s.npz' % (a, b))
    ta, tb = z['ta'], z['tb']
    # tb ist monoton (nicht streng) -> Umkehrung über eindeutige Werte
    u, i = np.unique(tb, return_index=True)
    return lambda t: np.interp(t, u, ta[i])


def db(x): return 20 * np.log10(np.maximum(np.abs(x), 1e-12))


def undb(d): return 10 ** (np.asarray(d) / 20)


def rms_frames(x, hop, win):
    x = np.asarray(x, np.float64)
    n = len(x) // hop
    c = np.concatenate([[0.], np.cumsum(x * x)])
    i = np.arange(n) * hop + hop // 2
    a = np.clip(i - win // 2, 0, len(x)); b = np.clip(i + win // 2, 0, len(x))
    return 10 * np.log10((c[b] - c[a]) / np.maximum(1, b - a) + 1e-14)


def schreibe(p, x):
    sf.write(p, np.asarray(x, np.float32), SR, subtype='FLOAT')
