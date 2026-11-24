import sys; sys.path.insert(0,'.')
from t_bild import *
import json
H7 = lade_wav(QUELLE['H_v7']); O = lade_npy('original'); DT=lade_wav(QUELLE['D_t']); DR=lade_wav(R + 'original/Doppel-Platzhalter-4.wav')
A = json.load(open(TC+'anker2.json'))
def mk(ids):
    m = {'E5dry': [], 'v7': [], 'Droh':[], 'Dt':[]}
    for i in ids:
        e = A[i]
        if e['stimme']=='haupt':
            m['E5dry'] += [(e['t_orig'], e['text'], 'r'), (e['kons_orig'], 'k', 'm')]
            m['v7'] += [(e['q_spitze'], 'q', 'r'), (e['q_kons'], 'k', 'm')]
        else:
            m['Droh'] += [(e['t_orig'], e['text'], 'r'), (e['kons_orig'], 'k', 'm')]
            m['Dt'] += [(e['q_spitze'], 'q', 'r'), (e['q_kons'], 'k', 'm')]
    return m
for t0, t1, ids, f in [(115.6, 116.3, ['H-066','D-066'], 'tised_z'), (121.6, 122.3, ['H-069','D-069'], 'it_z'), (112.3, 113.3, ['H-063','D-063'], 'we63'),(90.8,92.3,['H-048','D-048','H-049','D-049'],'your48')]:
    bild(t0, t1, [('E5dry', O), ('v7', H7), ('Droh', DR), ('Dt', DT)], TC + 'bild/%s.png' % f, mk(ids), titel=f)
