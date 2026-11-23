# Dekodiert die Werkstatt-Stems (10 Teile je Schicht) und die v10/v11-Dateien lokal zu float32-Arrays (48 kHz, mono).
# Nur lokal (ffmpeg), nichts geht ins Netz.
import json, subprocess, sys, os
import numpy as np
W = os.path.dirname(os.path.abspath(__file__)) + '/..'
R = W + '/repo/the-wall'
OUT = W + '/werkzeug/roh'
SR = 48000
DAUER = 266.0

def dek(pfad, kanaele=1):
    p = subprocess.run(['ffmpeg', '-v', 'error', '-i', pfad, '-f', 'f32le', '-ac', str(kanaele), '-ar', str(SR), '-'], capture_output=True, check=True)
    x = np.frombuffer(p.stdout, dtype=np.float32)
    return x.reshape(-1, kanaele) if kanaele > 1 else x

def stem(sid, stems):
    s = [s for s in stems['stems'] if s['id'] == sid][0]
    st = s['stuecke']
    n = int(DAUER * SR)
    out = np.zeros(n, np.float32)
    teile = []
    for k, p in enumerate(st):
        x = dek(R + '/werkstatt2/' + p['datei'].split('?')[0])
        teile.append(x)
    # Grenzen: Mitte der Überlappung
    for k, p in enumerate(st):
        a = p['von_s'] if k == 0 else (p['von_s'] + st[k - 1]['bis_s']) / 2
        b = p['bis_s'] if k == len(st) - 1 else (p['bis_s'] + st[k + 1]['von_s']) / 2
        i0, i1 = int(round(a * SR)), min(n, int(round(b * SR)))
        x = teile[k]
        j0 = i0 - int(round(p['von_s'] * SR))
        seg = x[j0:j0 + (i1 - i0)]
        out[i0:i0 + len(seg)] = seg
    # Überlappungen prüfen (gleiche Lage?)
    for k in range(1, len(st)):
        a, b = st[k]['von_s'], st[k - 1]['bis_s']
        if b - a < .2: continue
        t0, t1 = a + .05, b - .05
        x1 = teile[k - 1][int((t0 - st[k - 1]['von_s']) * SR):int((t1 - st[k - 1]['von_s']) * SR)]
        x2 = teile[k][int((t0 - st[k]['von_s']) * SR):int((t1 - st[k]['von_s']) * SR)]
        m = min(len(x1), len(x2)); x1, x2 = x1[:m], x2[:m]
        best = max(range(-200, 201), key=lambda l: float(np.dot(x1[max(0, l):m + min(0, l)], x2[max(0, -l):m - max(0, l)])))
        print(sid, 'Überlappung', k, 'Versatz', best, 'Samples', file=sys.stderr)
    return out

if __name__ == '__main__':
    stems = json.load(open(R + '/werkstatt2/daten/stems.json'))
    for sid in ['ende', 'original', 'gereinigt']:
        np.save(OUT + '/' + sid + '.npy', stem(sid, stems))
    np.save(OUT + '/haupt-v10.npy', dek(R + '/werkstatt/audio/haupt-v10.mp3')[:int(DAUER * SR)])
    np.save(OUT + '/haupt-v7.npy', dek(R + '/werkstatt/audio/haupt-v7.mp3')[:int(DAUER * SR)])
    np.save(OUT + '/master-v10.npy', dek(R + '/projekt10/The-Wall_A_v10_Club.mp3')[:int(DAUER * SR)])
    np.save(OUT + '/master-v11.npy', dek(R + '/projekt11/The-Wall_A_v11.mp3')[:int(DAUER * SR)])
    np.save(OUT + '/musik-v10.npy', dek(R + '/werkstatt/audio/mix-v10.mp3')[:int(DAUER * SR)])
    print('fertig', file=sys.stderr)
