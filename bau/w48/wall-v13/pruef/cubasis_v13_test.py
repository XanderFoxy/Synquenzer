# Test für bau/cubasis_v13.py: Probe-Projekt aus den v12-Stimmen bauen, wieder entschlüsseln, mit v8 vergleichen.
import sys, json, time, numpy as np, soundfile as sf
W = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/'
sys.path.insert(0, W + 'wall-v13/bau')
import cubasis_v13 as cv, cbp_codec as cc

Q = {'VOX Haupt': W + 'wall-v12/bau/stimmen/lead.wav',
     'VOX Doppel': W + 'wall-v12/bau/stimmen/doppel.wav',
     'VOX Chor 1': W + 'wall-v12/repo/the-wall/projekt7/Chor-Oberterz-aus-Haupt-v7.wav',
     'VOX Chor 2': W + 'wall-v12/repo/the-wall/projekt7/Chor-Unterterz-aus-Haupt-v7.wav',
     'VOX Chor 3': W + 'wall-v12/bau/stimmen/gegen.wav'}
ERG = {}
X = {}
for k, p in Q.items():
    x = cv.lade_mono(p)
    s = np.max(np.abs(x))
    if s > 0.99: x = x * (0.99 / s)        # nur für den Test: sicher unter 0 dBFS
    X[k] = x
t = time.time()
# A) Ausschnitte (wie v8), 24 bit, KI-Spuren wie in v8 behalten
b = cv.baue_projekt(X, W + 'wall-v13/out/test/The-Wall-v13-test.zip', name='The-Wall-v13-test', modus='ausschnitte', bits=24)
ERG['A_ausschnitte'] = dict(bau={k: v for k, v in b.items() if k != 'spuren'}, clips={k: v['clips'] for k, v in b['spuren'].items()},
                            pruef=cv.pruefe_projekt(b['zip'], erwartet=X), sek=round(time.time() - t, 1))
# Kontrolle: Haupt-Clips decken alle aktiven Stellen ab (nichts abgeschnitten)
liste = b['spuren']['VOX Haupt']['liste']
x = X['VOX Haupt']; maske = np.zeros(len(x), bool)
for c in liste: maske[int(round(c['von_s'] * cv.SR)):int(round(c['bis_s'] * cv.SR))] = True
ausserhalb = x[~maske]
ERG['A_ausschnitte']['haupt_ausserhalb_clips_max_dbfs'] = round(20 * np.log10(np.max(np.abs(ausserhalb)) + 1e-12), 1)
ERG['A_ausschnitte']['haupt_clips_beispiel'] = liste[:3]
# B) ganze Spuren, 16 bit
t = time.time()
b2 = cv.baue_projekt({'haupt': X['VOX Haupt']}, W + 'wall-v13/out/test/The-Wall-v13-test-ganz.zip', name='The-Wall-v13-test-ganz', modus='ganz', bits=16, leere_spuren='behalten')
ERG['B_ganz'] = dict(clips={k: v['clips'] for k, v in b2['spuren'].items()}, pruef=cv.pruefe_projekt(b2['zip'], erwartet={'VOX Haupt': X['VOX Haupt']}), sek=round(time.time() - t, 1))
# C) Struktur: v8 vs. v13-test – Bus-Reihenfolge, Effekt-Daten-Strings, Fader, Sends identisch?
v8 = cc.lade(cv.BASIS['v8'])
import zipfile
with zipfile.ZipFile(b['zip']) as z:
    neu = cc.cbor_lesen(cc.entschluesseln(z.read('The-Wall-v13-test/The-Wall-v13-test.cbp')))
gleich = []
for a, n in zip(v8['Buses'], neu['Buses']):
    gleich.append(dict(spur=a['Name'], effekte_gleich=[e['Data'] for e in a['Effects']] == [e['Data'] for e in n['Effects']] and
                       [e['Enabled'] for e in a['Effects']] == [e['Enabled'] for e in n['Effects']],
                       fader_gleich=a['Volume'] == n['Volume'], pan_gleich=a['Pan'] == n['Pan'], sends_gleich=a['Outputs'] == n['Outputs'],
                       clips_alt=len((a.get('Track') or {}).get('Regions') or []), clips_neu=len((n.get('Track') or {}).get('Regions') or [])))
ERG['C_struktur'] = dict(alle_effekte_fader_pan_sends_gleich=all(g['effekte_gleich'] and g['fader_gleich'] and g['pan_gleich'] and g['sends_gleich'] for g in gleich),
                         spuren=[g for g in gleich if g['spur'].startswith('VOX')])
ERG['ok'] = ERG['A_ausschnitte']['pruef']['ok'] and ERG['B_ganz']['pruef']['ok'] and ERG['C_struktur']['alle_effekte_fader_pan_sends_gleich']
json.dump(ERG, open(W + 'wall-v13/pruef/cubasis_v13_test.json', 'w'), indent=1, ensure_ascii=False)
print(json.dumps(ERG, indent=1, ensure_ascii=False)[:4000])
