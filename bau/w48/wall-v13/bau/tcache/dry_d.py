import sys; sys.path.insert(0,'.')
from tgemein import *
from t_plan import *
from t_lauf import plane
import json, collections
H7=lade_wav(QUELLE['H_v7']); DT=lade_wav(QUELLE['D_t'])
mkH=dict(np.load(TC+'mk_H_v7.npz')); mkD=dict(np.load(TC+'mk_D_t.npz'))
for t0,t1 in [(193.9,196),(201.9,206),(210.2,212.5),(219.2,221.4),(217.8,219.2)]:
    k0,k1=int(t0*SR/120),int(t1*SR/120); print('Doppel aktiv',t0,t1,'Anteil >-45dB %.2f'%np.mean(mkD['lvl'][k0:k1]>-45), 'Haupt %.2f'%np.mean(mkH['lvl'][k0:k1]>-45))
H=haupt_anker()
for a in H: anlaut(mkH,a)
D,tab=doppel_anker(H)
print('Wahl', collections.Counter(t[-1] for t in tab))
for t in tab:
    if t[-1] is None or (t[2] is not None and t[2]>=0.8 and t[5]>=0.8 and abs(t[2]-t[3])>25): print('  ',t)
Hd={h['id']:h for h in H}
for a in D:
    h=Hd['H-'+a['id'][2:]]
    if a['wahl']=='A': a['src_vokal']=a['src_peak']-(h['src_peak']-h['src_vokal']); a['akzent']=h['akzent']
    else:
        z=ZKD[a['id']]; e=A2[a['id']]; a['src_vokal']=min(z['vokal_t']+e['off'], a['src_peak']-0.002); a['akzent']=False
    a['src_kons_zk']=a['src_kons']
    if a['akzent']: a['src_kons']=min(a['src_kons'], a['src_peak']-(h['src_peak']-h['src_kons']))
    anlaut(mkD,a)
st=starr_liste(D,[])
P,pos=plane(DT,mkD,st)
seg=[l for l in P.log if 'name' in l]; spl=P.spleisse
f=np.array([x for l in seg for x in l.get('faktoren',[])])
print('Abschnitte',len(seg),'Spleiße',len(spl),'Faktoren min %.3f max %.3f'%(f.min(),f.max()))
err=np.array([p['fehler_ms'] for p in pos]); print('Lagefehler ms: median |e| %.2f p95 %.2f max %.2f'%(np.median(abs(err)),np.percentile(abs(err),95),abs(err).max()))
for l in seg:
    if abs(l['ungedeckt_ms'])>5 or abs(l['rest_ms'])>5: print('  ',l['name'],'delta',round(l['delta_ms'],1),'ungedeckt',l['ungedeckt_ms'],'rest',round(l['rest_ms'],1),l['ops'],l.get('maske'))
kor=np.array([s['korr'] for s in spl]); print('Spleiß-Korrelation median %.3f p5 %.3f min %.3f'%(np.median(kor),np.percentile(kor,5),kor.min()))
json.dump(dict(log=P.log,pos=pos,spl=spl,tab=tab),open(TC+'dry_D.json','w'),indent=0,default=float)
