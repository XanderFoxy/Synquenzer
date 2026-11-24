import sys; sys.path.insert(0,'.')
from tgemein import *
from t_plan import *
from t_lauf import plane
import json
H7=lade_wav(QUELLE['H_v7']); O=lade_npy('original')
mk=dict(np.load(TC+'mk_H_v7.npz'))
H=haupt_anker()
for a in H: anlaut(mk,a)
B=sprech_bloecke(H7,O)
st=starr_liste(H,B)
P,pos=plane(H7,mk,st)
seg=[l for l in P.log if 'name' in l]; spl=P.spleisse
f=np.array([x for l in seg for x in l.get('faktoren',[])])
print('Abschnitte',len(seg),'Spleiße',len(spl),'Faktoren n',len(f), 'min %.3f max %.3f'%(f.min(),f.max()) if len(f) else '')
err=np.array([p['fehler_ms'] for p in pos]); print('Lagefehler ms: median |e| %.2f  p95 %.2f max %.2f'%(np.median(abs(err)),np.percentile(abs(err),95),abs(err).max()))
for l in seg:
    if abs(l.get('ungedeckt_ms',0))>2 or abs(l['rest_ms'])>2:
        print('PROBLEM', l['name'], 's %.3f-%.3f Ls %.3f Lt %.3f delta %+.1f ungedeckt %s rest %.1f ops %s fakt %s'%(l['s_a'],l['s_b'],l['Ls'],l['Lt'],l['delta_ms'],l.get('ungedeckt_ms'),l['rest_ms'],l.get('ops'),l.get('faktoren')))
kor=np.array([s['korr'] for s in spl]); print('Spleiß-Korrelation median %.3f p5 %.3f min %.3f'%(np.median(kor),np.percentile(kor,5),kor.min()))
import collections; print(collections.Counter(a['anlaut_art'].split()[0] for a in H))
json.dump(dict(log=P.log,pos=pos,spl=spl),open(TC+'dry_H.json','w'),indent=0,default=float)
