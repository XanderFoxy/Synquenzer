import sys; sys.path.insert(0,'..'); sys.path.insert(0,'.')
from t_bild import *
import json
H7 = lade_wav(QUELLE['H_v7']); HR = lade_wav(QUELLE['H_roh']); E = lade_npy('ende')
A = {e['id']: e for e in json.load(open(TC+'anker_roh.json'))}
def mk(ids, nm):
    m = {'roh': [], 'v7': [], 'v12': []}
    for i in ids:
        e = A[i]
        m['roh'] += [(e['t_orig'], e['text'], 'r'), (e['kons_orig'], 'k', 'm')]
        m['v7'] += [(e['hint'], 'h', 'g'), (e['q_spitze'], 'q', 'r'), (e['env_spitze'], 'e', 'b')]
    return m
for t0, t1, ids, f in [(103.8, 111.0, ['H-055','H-056','H-057','H-058','H-059','H-060','H-061'], 'see'),
                       (111.7, 116.4, ['H-062','H-063','H-064','H-065','H-065b','H-066'], 'hyp'),
                       (44.0, 46.4, ['H-010','H-011'], 'sake'), (60.5, 62.4, ['H-022','H-023'], 'lieve'),
                       (82.3, 84.4, ['H-041','H-042','H-043'], 'light'), (243.0, 244.4, ['H-148','H-149'], 'light3')]:
    bild(t0, t1, [('roh', HR), ('v7', H7), ('v12', E)], TC + 'bild/%s.png' % f, mk(ids, f), titel=f)
