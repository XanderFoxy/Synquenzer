# Gemeinsame Helfer für die Analysen (nur numpy).
import json, os
import numpy as np
W = os.path.dirname(os.path.abspath(__file__)) + '/..'
ROH = W + '/roh'
SR = 48000
LIED = json.load(open(W + '/werkzeug/lied.json'))
DAUER = LIED['dauer_s']

def lade(n):
    return np.load(ROH + '/' + n + '.npy', mmap_mode='r')

def rms_db(x, hop=0.01, win=0.03):
    """RMS-Pegel in dB je Rahmen (Mitte bei k*hop)."""
    x = np.asarray(x, np.float64)
    h, w = int(hop * SR), int(win * SR)
    n = len(x) // h
    c = np.concatenate([[0.], np.cumsum(x * x)])
    i = np.arange(n) * h + h // 2
    a = np.clip(i - w // 2, 0, len(x)); b = np.clip(i + w // 2, 0, len(x))
    e = (c[b] - c[a]) / np.maximum(1, b - a)
    return 10 * np.log10(e + 1e-12)

def karte_r(t):
    """Ende-Zeit -> Aufnahme-Zeit (LIED.karte: [a0,a1,r0,r1])."""
    K = LIED['karte']
    t = np.atleast_1d(np.asarray(t, float)); out = t.copy()
    for a0, a1, r0, r1 in K:
        m = (t >= a0) & (t < a1)
        if a1 > a0: out[m] = r0 + (t[m] - a0) * (r1 - r0) / (a1 - a0)
    return out

def mmss(t):
    m = int(t // 60); s = t - 60 * m
    return f"{m}:{s:04.1f}".replace('.', ',')

def silbe_bei(t):
    best = None; bd = 1e9
    for i, s in enumerate(LIED['silben']):
        d = 0 if s['a'] <= t <= s['b'] + .35 else min(abs(t - s['a']), abs(t - s['b']))
        if d < bd: bd, best = d, i
    return best, bd

def wort_text(i):
    s = LIED['silben'][i]; w = LIED['woerter'][s['wort']]
    return w['text'].strip('.,?!'), LIED['zeilen'][s['zeile']]['text']
