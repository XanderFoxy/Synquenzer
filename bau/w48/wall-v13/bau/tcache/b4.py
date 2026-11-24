import sys; sys.path.insert(0,'.')
from t_bild import *
from t_plan import *
import json
H7=lade_wav(QUELLE['H_v7']); DT=lade_wav(QUELLE['D_t'])
mkH=dict(np.load(TC+'mk_H_v7.npz'))
H=haupt_anker()
for a in H: anlaut(mkH,a)
Hd={h['id']:h for h in H}
def mk(ids):
    m={'H_v7':[], 'D_t':[]}
    for i in ids:
        h=Hd['H-'+i]; e=A2['D-'+i]
        m['H_v7']+=[(h['src_peak'],h['text'],'r'),(h['src_kons'],'k','m')]
        m['D_t']+=[(h['src_peak']+e['gg_haupt_off'],'A','b'),(e['q_spitze'],'B','g'),(h['src_peak'],'H','r')]
    return m
for t0,t1,ids,f in [(31.7,32.4,['000'],'d000'),(45.4,46.3,['011'],'d011'),(73.8,74.3,['032'],'d032'),(81.7,82.3,['040'],'d040'),(91.2,92.2,['048','049'],'d049'),(59.7,60.3,['021'],'d021'),(65.8,66.8,['026','027'],'d027')]:
    bild(t0,t1,[('H_v7',H7),('D_t',DT)],TC+'bild/%s.png'%f,mk(ids),titel=f)
