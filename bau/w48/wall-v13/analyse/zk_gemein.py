# Zielkarte v13 – gemeinsame Helfer (nur lokal, numpy/scipy). Liest nur, schreibt nur in wall-v13/analyse/.
import os, json
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfiltfilt

SR = 48000
N = 266 * SR
SP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/'
W12 = SP + 'wall-v12/'
R = W12 + 'repo/the-wall/'
ROH = SP + 'wall/roh/'
A13 = SP + 'wall-v13/analyse/'
CACHE = A13 + 'cache/'
os.makedirs(CACHE, exist_ok=True)
LIED = json.load(open(SP + 'wall/werkzeug/lied.json'))
TAKT = 2.0
S16 = 0.125

QUELLEN = {
    'H_roh': ('wav', R + 'original/Gesang-Platzhalter-3.wav'),
    'D_roh': ('wav', R + 'original/Doppel-Platzhalter-4.wav'),
    'H_v6': ('wav', R + 'projekt/Gesang-Platzhalter-3.wav'),
    'D_v6': ('wav', R + 'projekt/Doppel-Platzhalter-4.wav'),
    'H_v7': ('wav', R + 'projekt7/Haupt-3-trocken-v7.wav'),
    'D_v7': ('wav', R + 'projekt7/Doppel-4-trocken-v7.wav'),
    'H_v10': ('npy', ROH + 'haupt-v10.npy'),
    'H_v12': ('npy', ROH + 'ende.npy'),             # Quelle der v12-Hauptstimme laut mix_v12.py
    'D_v12': ('wav', W12 + 'bau/stimmen/doppel_t.wav'),  # Quelle der v12-Doppelstimme (vor Maske/Kompressor)
    'H_v12stem': ('wav', W12 + 'bau/stems_v12/lead.wav'),
    'D_v12stem': ('wav', W12 + 'bau/stems_v12/doppel.wav'),
}


def lade(name):
    c = CACHE + name + '.npy'
    if os.path.exists(c):
        return np.load(c, mmap_mode='r')
    art, p = QUELLEN[name]
    if art == 'wav':
        x, sr = sf.read(p, dtype='float32', always_2d=True); assert sr == SR
        x = x.mean(1)
    else:
        x = np.load(p).astype(np.float32)
    y = np.zeros(N, np.float32); y[:min(N, len(x))] = x[:N]
    np.save(c, y)
    return np.load(c, mmap_mode='r')


def bp(x, lo, hi, order=4):
    if hi is None:
        sos = butter(order, lo, 'highpass', fs=SR, output='sos')
    else:
        sos = butter(order, [lo, hi], 'bandpass', fs=SR, output='sos')
    return sosfiltfilt(sos, x)


def env_db(x, win_ms=5.0, hop_ms=1.0):
    """RMS-Hülle in dB, Rahmenmitte bei k*hop."""
    x = np.asarray(x, np.float64)
    h = int(hop_ms * SR / 1000); w = int(win_ms * SR / 1000)
    n = len(x) // h
    c = np.concatenate([[0.], np.cumsum(x * x)])
    i = np.arange(n) * h + h // 2
    a = np.clip(i - w // 2, 0, len(x)); b = np.clip(i + w // 2, 0, len(x))
    e = (c[b] - c[a]) / np.maximum(1, b - a)
    return 10 * np.log10(e + 1e-14)


def takt_von(t):
    return int(np.floor(t / TAKT)) + 1


def raster16(t):
    """(Takt, 16tel ab Taktbeginn als float)."""
    tk = takt_von(t)
    return tk, (t - (tk - 1) * TAKT) / S16


def fmt16(t):
    tk, p = raster16(t)
    return 'T%d+%.2f' % (tk, p)
