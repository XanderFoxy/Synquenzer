import json, numpy as np
from zk_gemein import *
from zk_mess import messe, karte_r
S = LIED['silben']
liste = []
for i, s in enumerate(S):
    if s['art'] != 'gesungen': continue
    liste.append(dict(id='%03d' % i, idx=i, text=s['text'], zeile=s['zeile'], e_ende=s['einsatz'], a_ende=s['a'], a_roh=s['a_roh']))
    if i == 65:   # "ti" aus „hyp-no-ti-sed“ fehlt in lied.json (eigene Note + t-Anlaut, gemessen)
        liste.append(dict(id='065b', idx=65.5, text='ti', zeile=10, e_ende=115.44, a_ende=115.30, a_roh=115.29, zusatz=True))
out = []
for L in liste:
    pr = karte_r(L['e_ende']) if L['id'] != '065b' else 115.352
    r = messe(lade('H_roh'), L['text'], pr, prior_k=L['a_roh'])
    r12 = messe(lade('H_v12'), L['text'], L['e_ende'], prior_k=L['a_ende'])
    L['H_roh'] = r; L['H_v12'] = r12; L['prior_roh'] = round(pr, 4)
    out.append(L)
    print('%-4s %-6s %-3s | roh: k %.3f v %.3f s %.3f (prior %.3f, +%.1fdB) %s | v12: k %.3f s %.3f %s | d %+5.0f ms' % (
        L['id'], L['text'], r['klasse'], r['konsonant_s'], r['vokal_t'], r['spitze_t'], pr, r['anstieg_db'], fmt16(r['spitze_t']),
        r12['konsonant_s'], r12['spitze_t'], fmt16(r12['spitze_t']), (r12['spitze_t'] - r['spitze_t']) * 1000))
json.dump(out, open(CACHE + 'mess_H.json', 'w'), indent=0)
