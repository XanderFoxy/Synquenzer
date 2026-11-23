# Raster-Synchronität: Anschläge (Kick tief, Snare/Hats hoch) in der Werkstatt-Musik gegen die Raster-Linien T1 + k*Schlag.
# Nur lokal (numpy). Ausgabe: Abweichung je Anschlag (ms), Median/Max je Abschnitt.
import sys, json, numpy as np
sys.path.insert(0, __import__('os').path.dirname(__file__))
from gemein import lade, SR, LIED
x = np.asarray(lade(sys.argv[1] if len(sys.argv) > 1 else 'mix-w2'), np.float64)
T1, SCHLAG = LIED['takt1_s'], LIED['takt_s'] / LIED['takt'][0]

def band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, len(x))

def onsets(y, thr_rel=0.25, hop=0.0005, mind=0.08):
    # Hülle: Betrag, 1-ms-Max; Onset = erster Punkt, an dem die Hülle 30 % des folgenden Spitzenwerts überschreitet
    a = np.abs(y); h = int(hop * SR); n = len(a) // h
    env = a[:n * h].reshape(n, h).max(1)
    # Anstieg: env[i] - max(env[i-20..i-1]) (10 ms zurück)
    w = 20
    from numpy.lib.stride_tricks import sliding_window_view
    pad = np.concatenate([np.zeros(w), env])
    prev = sliding_window_view(pad[:-1], w).max(1)[:n]
    rise = env - prev
    glob = np.percentile(env, 99.5)
    out = []
    i = 0
    cand = np.where(rise > thr_rel * glob)[0]
    last = -1e9
    for i in cand:
        t = i * hop
        if t - last < mind: continue
        # Spitze in den nächsten 15 ms, dann Beginn rückwärts: erster Punkt >= 20 % der Spitze
        j1 = min(n, i + 30); pk = env[i:j1].max(); jp = i + int(np.argmax(env[i:j1]))
        k = jp
        base = prev[i]
        while k > i - 20 and env[k] > base + 0.2 * (pk - base): k -= 1
        out.append(((k + 1) * hop, pk)); last = t
    return out

res = {}
for name, lo, hi in [('kick', 30, 140), ('hoch', 2500, 9000)]:
    y = band(x, lo, hi)
    on = onsets(y)
    dev = []
    for t, pk in on:
        q = (t - T1) / (SCHLAG / 4)   # 1/16-Raster
        g = T1 + round(q) * SCHLAG / 4
        dev.append((t, (t - g) * 1000, round(q) % 4 == 0))
    d = np.array([v for _, v, _ in dev]); ds = np.array([v for _, v, s in dev if s])
    print(name, 'Anschläge', len(d), 'auf Schlag', len(ds), 'Median %.2f ms' % np.median(d), 'p5/p95 %.1f/%.1f' % tuple(np.percentile(d, [5, 95])),
          'auf Schlag: Median %.2f, |max| %.1f' % (np.median(ds), np.abs(ds).max()) if len(ds) else '')
    res[name] = dev
    # je Abschnitt
    for a in LIED['abschnitte']:
        sel = [v for t, v, s in dev if a['von_s'] <= t < a['bis_s'] and s]
        if sel: print('   %-12s n=%3d  Median %+6.2f ms  p10 %+6.1f  p90 %+6.1f' % (a['name'], len(sel), np.median(sel), np.percentile(sel, 10), np.percentile(sel, 90)))
json.dump({k: [[round(t, 4), round(v, 2), s] for t, v, s in dv] for k, dv in res.items()}, open('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall/roh/raster_anschlaege.json', 'w'))
