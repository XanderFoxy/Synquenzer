# Baut das Cubasis-Projekt v13 aus den neu getimten Stimmen (sobald da) + Original-Effekten (v8-Struktur).
import sys, os, numpy as np
W = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/'
sys.path.insert(0, W + 'wall-v13/bau')
import cubasis_v13 as cv
N = W + 'wall-v13/bau/stimmen/'
def wahl(neu, alt): return N + neu if os.path.exists(N + neu) else alt
Q = {'VOX Haupt': N + 'lead.wav',
     'VOX Doppel': wahl('doppel.wav', W + 'wall-v12/bau/stimmen/doppel.wav'),
     'VOX Chor 1': wahl('ober.wav', W + 'wall-v12/repo/the-wall/projekt7/Chor-Oberterz-aus-Haupt-v7.wav'),
     'VOX Chor 2': wahl('unter.wav', W + 'wall-v12/repo/the-wall/projekt7/Chor-Unterterz-aus-Haupt-v7.wav'),
     'VOX Chor 3': wahl('gegen.wav', W + 'wall-v12/bau/stimmen/gegen.wav')}
X = {}
for k, p in Q.items():
    x = cv.lade_mono(p); s = np.max(np.abs(x))
    if s > 0.99: x = x * (0.99 / s)
    X[k] = x; print(k, os.path.basename(p))
os.makedirs(W + 'wall-v13/out', exist_ok=True)
b = cv.baue_projekt(X, W + 'wall-v13/out/The-Wall-v13-Projekt.zip', name='The-Wall-v13', modus='ganz', bits=16, leere_spuren='behalten')
print('ZIP', b['zip'])
