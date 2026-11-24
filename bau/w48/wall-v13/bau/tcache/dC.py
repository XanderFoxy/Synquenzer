import sys; sys.path.insert(0,'.')
from tgemein import *
from t_plan import *
from zk_kern import nah
import json
DT=lade_wav(QUELLE['D_t'])
mkH=dict(np.load(TC+'mk_H_v7.npz'))
H=haupt_anker()
for a in H: anlaut(mkH,a)
Hd={h['id']:h for h in H}
out={}
for k,e in A2.items():
    if e['stimme']!='doppel': continue
    h=Hd['H-'+k[2:]]; z=ZKH[h['id']]
    if h['akzent']:
        ev=z['erster_einsatz_t']+(h['src_peak']-z['t_orig'])
    else: ev=h['src_peak']
    shift=h['tgt_peak']-h['src_peak']
    c=nah(DT, ev, half=0.10, strafe=2.0)
    A_=h['src_peak']+e['gg_haupt_off'] if not h['akzent'] else None
    B_=e['q_spitze']
    out[k]=dict(id=k,text=h['text'],teil=h['teil'],h_ev=ev,ziel=ev+shift+0.010,C=c['spitze_t'],C_s=c['sicher'],C_rise=c['anstieg_db'],C_kons=c['konsonant_s'],A=A_,A_c=e.get('gg_haupt_corr'),B=B_,B_c=e['corr'],akz=h['akzent'])
    o=out[k]
    print('%-7s %-6s %-4s Hev %.3f  C %+4.0f (s%.1f r%.0f)  A %s  B %+4.0f (c%.2f)'%(k,o['text'],o['teil'],ev,(o['C']-ev)*1000,o['C_s'],o['C_rise'],('%+4.0f (c%.2f)'%((A_-ev)*1000,o['A_c'])) if A_ else '  -  ',(B_-ev)*1000,o['B_c']))
json.dump(out,open(TC+'doppel_C.json','w'),indent=0)
