# Endgültige Messung aller gesungenen Silben (Haupt/Doppel, Roh/v12) mit den Entscheidungen aus der Sichtprüfung.
# Ausgabe: cache/final_mess.json
import json, numpy as np
from zk_gemein import *
from zk_kern import erster, nah, staerkster
from zk_mess import karte_r

S = LIED['silben']
# Sichtprüfung (Parallel-Bilder bilder/par_*.png, Feintabellen zk_tab.py): Hinweise für die Rohaufnahme (Haupt)
HINWEIS = {   # id: Zeit des Vokal-Einsatzes laut Sichtprüfung (wird ±60 ms nachgemessen)
    '000': 31.98, '004': 36.00, '009': 44.02, '016': 52.05, '027': 66.535, '035': 76.04, '040': 82.00,
    '054': 100.04, '013': 48.76, '066': 116.017, '057': 106.09, '069': 122.00, '077': 130.55, '085': 140.00, '101': 158.39, '124': 215.47,
}
# Silben mit zwei Einsätzen (erster Vokal-Einsatz + späterer, stärkerer Akzent): Transienten-Spitze = Akzent
AKZENT = {   # id: (Suchbereich Akzent von, bis)
    '011': (45.92, 46.08), '061': (109.94, 110.08), '048': (91.44, 91.60), '098': (155.45, 155.60),
    '154': (251.44, 251.60), '148': (243.40, 243.52),
}
# Zusätzliche Ereignisse ohne eigene Silbe in lied.json
ZUSATZ = [dict(id='065b', text='ti', zeile=10, hint=115.333, nach='065')]
# Bindungs-Einsätze in Strophe 1 (neuer Ton ohne neue Silbe) – nur als Vergleich für „ti“
BINDUNG = {'S1P3~': 51.25, 'S1P4~': 59.30}


def ende_von_roh(r):
    """Umkehrung der lied.json-Zeitkarte (Ende/v12-Zeit -> Aufnahmezeit)."""
    best = None
    for a0, a1, r0, r1 in LIED['karte']:
        if r1 > r0 and r0 <= r < r1:
            a = a0 + (r - r0) * (a1 - a0) / (r1 - r0)
            if best is None or abs(a - r) < abs(best - r): best = a
    return best if best is not None else r


def dtw(a, b):
    z = np.load(CACHE + 'karte_%s_%s.npz' % (a, b)); return lambda t: float(np.interp(t, z['ta'], z['tb']))


d_h2d = dtw('H_roh', 'D_roh'); d_d12 = dtw('D_roh', 'D_v12')
d_h6, d_h7, d_h10 = dtw('H_roh', 'H_v6'), dtw('H_roh', 'H_v7'), dtw('H_roh', 'H_v10')
d_d6, d_d7 = dtw('D_roh', 'D_v6'), dtw('D_roh', 'D_v7')

liste = []
for i, s in enumerate(S):
    if s['art'] != 'gesungen': continue
    liste.append(dict(id='%03d' % i, text=s['text'], zeile=s['zeile'], a_roh=s['a_roh'], e_ende=s['einsatz'], a_ende=s['a']))
    for z in ZUSATZ:
        if z['nach'] == '%03d' % i:
            liste.append(dict(id=z['id'], text=z['text'], zeile=z['zeile'], a_roh=z['hint'] - 0.09, e_ende=None, a_ende=None, zusatz=True, hint=z['hint']))

H, Hq = {}, {}
for j, L in enumerate(liste):
    nx = next((L2['a_roh'] for L2 in liste[j + 1:] if L2['zeile'] == L['zeile']), None)
    pv = H.get(liste[j - 1]['id']) if j > 0 and liste[j - 1]['zeile'] == L['zeile'] else None
    if L['id'] in HINWEIS:
        r = nah(lade('H_roh'), HINWEIS[L['id']]); q = 'Sichtprüfung'
    elif L.get('zusatz'):
        r = nah(lade('H_roh'), L['hint']); q = 'Sichtprüfung'
    else:
        r = erster(lade('H_roh'), L['a_roh'], nx, min_t=(pv['spitze_t'] + 0.08) if pv else None,
                   nach=max(0.40, karte_r(L['e_ende']) - L['a_roh'] + 0.08)); q = 'automatisch'
        if r is None: r = nah(lade('H_roh'), karte_r(L['e_ende'])); q = 'automatisch (Vorgabe)'
    r['erst_t'] = r['spitze_t']
    if L['id'] in AKZENT:
        a = staerkster(lade('H_roh'), *AKZENT[L['id']])
        if a:
            erst = r['spitze_t']; r = a; r['erst_t'] = erst; q += ' + Akzent'
    r['quelle'] = q
    H[L['id']] = r

out = []
for L in liste:
    h = H[L['id']]
    # v12-Haupt: über die Zeitkarte (Ende <- Aufnahme), dann ±50 ms nachmessen
    hint12 = ende_von_roh(h['spitze_t'])
    h12 = nah(lade('H_v12'), hint12, half=0.05)
    h12['karte_t'] = round(hint12, 4)
    # Doppel roh: nahe an der Haupt-Zeit (DTW Haupt->Doppel), für Akzent-Silben am ersten Einsatz
    bezug = h['erst_t'] if L['id'] in AKZENT else h['spitze_t']
    d = nah(lade('D_roh'), bezug, half=0.09, strafe=6.0)   # Doppel singt dieselben Stellen: Suche um die Haupt-Zeit
    CHOR = [(62.9, 96.6), (126.9, 176.0), (222.9, 266.0)]   # v12: Doppel nur in diesen Fenstern hörbar (plan.json chor_fenster)
    if any(a <= d['spitze_t'] <= b for a, b in CHOR):
        d12 = nah(lade('D_v12'), d_d12(d['spitze_t']), half=0.06, strafe=6.0)
    else:
        d12 = None
    L.update(H_roh=h, H_v12=h12, D_roh=d, D_v12=d12, D_bezug=('erst' if L['id'] in AKZENT else 'spitze'),
             hist=dict(v6=round((d_h6(h['spitze_t']) - h['spitze_t']) * 1000), v7=round((d_h7(h['spitze_t']) - h['spitze_t']) * 1000),
                       v10=round((d_h10(h['spitze_t']) - h['spitze_t']) * 1000),
                       D_v6=round((d_d6(d['spitze_t']) - d['spitze_t']) * 1000), D_v7=round((d_d7(d['spitze_t']) - d['spitze_t']) * 1000)))
    out.append(L)
bind = {k: nah(lade('H_roh'), t) for k, t in BINDUNG.items()}
json.dump(dict(silben=out, bindung=bind), open(CACHE + 'final_mess.json', 'w'), indent=0)
for L in out:
    h, h12, d, d12 = L['H_roh'], L['H_v12'], L['D_roh'], L['D_v12'] or dict(spitze_t=float('nan'))
    print('%-4s %-6s z%-2d | H %.3f %-11s k %.3f %-24s | v12 %+5.0f | D %.3f %+5.0f | D12 %+5.0f | v6 %+4d v7 %+4d v10 %+4d' % (
        L['id'], L['text'], L['zeile'], h['spitze_t'], fmt16(h['spitze_t']), h['konsonant_s'], h['quelle'], (h12['spitze_t'] - h['spitze_t']) * 1000,
        d['spitze_t'], (d['spitze_t'] - (h['erst_t'] if L['D_bezug'] == 'erst' else h['spitze_t'])) * 1000, (d12['spitze_t'] - d['spitze_t']) * 1000,
        L['hist']['v6'], L['hist']['v7'], L['hist']['v10']))
print({k: (v['spitze_t'], fmt16(v['spitze_t'])) for k, v in bind.items()})
