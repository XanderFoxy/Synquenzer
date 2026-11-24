# Misst alle gesungenen Silben in H_roh, H_v12, D_roh, D_v12 mit zk_mess2 (gleiche Definition überall).
import json, sys, numpy as np
from zk_gemein import *
from zk_mess2 import messe
from zk_mess import karte_r
S = LIED['silben']
liste = []
for i, s in enumerate(S):
    if s['art'] != 'gesungen': continue
    liste.append(dict(id='%03d' % i, text=s['text'], zeile=s['zeile'], a_roh=s['a_roh'], a_ende=s['a'], e_ende=s['einsatz'], e_roh=round(karte_r(s['einsatz']), 4)))
    if i == 65:
        liste.append(dict(id='065b', text='ti', zeile=10, a_roh=115.29, a_ende=115.38, e_ende=115.44, e_roh=115.352, zusatz=True))
def dtw(a, b):
    z = np.load(CACHE + 'karte_%s_%s.npz' % (a, b)); return lambda t: float(np.interp(t, z['ta'], z['tb']))
d_h2d = dtw('H_roh', 'D_roh'); d_d12 = dtw('D_roh', 'D_v12')
def lauf(spur, pk_fn, nach_fn):
    out = {}
    for j, L in enumerate(liste):
        pk = pk_fn(L)
        nx = next((pk_fn(L2) for L2 in liste[j + 1:] if L2['zeile'] == L['zeile']), None)
        pv = out.get(liste[j - 1]['id']) if j > 0 and liste[j - 1]['zeile'] == L['zeile'] else None
        r = messe(lade(spur), pk, nx, nach=nach_fn(L, pk), min_t=(pv['spitze_t'] + 0.08) if pv else None)
        out[L['id']] = r
    return out
R = {}
R['H_roh'] = lauf('H_roh', lambda L: L['a_roh'], lambda L, pk: max(0.40, L['e_roh'] - pk + 0.08))
R['H_v12'] = lauf('H_v12', lambda L: L['a_ende'], lambda L, pk: max(0.40, L['e_ende'] - pk + 0.08))
R['D_roh'] = lauf('D_roh', lambda L: d_h2d(R['H_roh'][L['id']]['konsonant_s']), lambda L, pk: max(0.40, d_h2d(R['H_roh'][L['id']]['spitze_t']) - pk + 0.10))
R['D_v12'] = lauf('D_v12', lambda L: d_d12(R['D_roh'][L['id']]['konsonant_s']), lambda L, pk: max(0.40, d_d12(R['D_roh'][L['id']]['spitze_t']) - pk + 0.10))
for L in liste:
    for sp in R: L[sp] = R[sp][L['id']]
json.dump(liste, open(CACHE + 'mess_alle.json', 'w'), indent=0)
for L in liste:
    h, h12, d, d12 = L['H_roh'], L['H_v12'], L['D_roh'], L['D_v12']
    print('%-4s %-6s z%-2d | Hr %.3f %-10s (k %.3f) %s | H12 %+5.0f | Dr %+5.0f (%s) | D12-Dr %+5.0f' % (
        L['id'], L['text'], L['zeile'], h['spitze_t'], fmt16(h['spitze_t']), h['konsonant_s'], ('?' if h['sicher'] < 1 else ' '),
        (h12['spitze_t'] - h['spitze_t']) * 1000, (d['spitze_t'] - h['spitze_t']) * 1000, fmt16(d['spitze_t']), (d12['spitze_t'] - d['spitze_t']) * 1000))
