import sys; sys.path.insert(0,'.')
from t_bild import *
import json
H7 = lade_wav(QUELLE['H_v7']); HR = lade_wav(QUELLE['H_roh']); E = lade_npy('ende'); O = lade_npy('original')
A = {e['id']: e for e in json.load(open(TC+'anker_roh.json'))}
def mk(ids):
    m = {'roh': [], 'v7': [], 'E5dry': []}
    for i in ids:
        e = A[i]
        m['roh'] += [(e['t_orig'], e['text'], 'r'), (e['kons_orig'], 'k', 'm')] + ([(e['erst_orig'], 'erst', 'c')] if 'erst_orig' in e else [])
        m['E5dry'] += [(e['t_orig'], e['text'], 'r'), (e['kons_orig'], 'k', 'm')]
        m['v7'] += [(e['hint'], 'h', 'g'), (e['q_spitze'], 'q', 'r'), (e['env_spitze'], 'e', 'b')]
    return m
for t0, t1, ids, f in [(109.4, 110.4, ['H-061'], 'see_z'), (45.4, 46.4, ['H-011'], 'sake_z'),(114.4, 116.3, ['H-065','H-065b','H-066'], 'hyp_z'), (61.4, 62.4, ['H-023'], 'lieve_z'), (83.4, 84.3, ['H-043'], 'light_z')]:
    bild(t0, t1, [('roh', HR), ('E5dry', O), ('v7', H7), ('v12', E)], TC + 'bild/%s.png' % f, mk(ids), titel=f)
