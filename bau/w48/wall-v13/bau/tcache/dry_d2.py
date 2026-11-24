import sys; sys.path.insert(0,'.')
from tgemein import *
from t_plan import *
from t_lauf import plane
import json, collections
DT=lade_wav(QUELLE['D_t'])
mkH=dict(np.load(TC+'mk_H_v7.npz')); mkD=dict(np.load(TC+'mk_D_t.npz'))
H=haupt_anker()
for a in H: anlaut(mkH,a)
C=json.load(open(TC+'doppel_C.json'))
D,tab=doppel_anker_abstimmung(H,C,mkD)
print('Doppel-Anker', len(D), 'von', len(tab))
for t in tab:
    if t['teil'] in ('R1','R2','R3','Tag','Out'): print('  %-7s %-6s %-4s %s %s %s'%(t['id'],t['text'],t['teil'],t['kand'],t['gruppe'],'JA' if t['gewaehlt'] else '--'))
st=starr_liste(D,[])
P,pos=plane(DT,mkD,st)
seg=[l for l in P.log if 'name' in l]; spl=P.spleisse
f=np.array([x for l in seg for x in l.get('faktoren',[])])
print('Abschnitte',len(seg),'Spleiße',len(spl),'Faktoren min %.3f max %.3f'%(f.min(),f.max()))
err=np.array([p['fehler_ms'] for p in pos]); print('Lagefehler ms: median |e| %.2f p95 %.2f max %.2f'%(np.median(abs(err)),np.percentile(abs(err),95),abs(err).max()))
for l in seg:
    if abs(l['ungedeckt_ms'])>5 or abs(l['rest_ms'])>5: print('  ',l['name'],'delta',round(l['delta_ms'],1),'ungedeckt',l['ungedeckt_ms'],'rest',round(l['rest_ms'],1))
json.dump(dict(log=P.log,pos=pos,spl=spl,tab=tab),open(TC+'dry_D.json','w'),indent=0,default=float)
