import sys; sys.path.insert(0,'.')
from tgemein import *
from t_onset import onset_versatz
import json
H7=lade_wav(QUELLE['H_v7']); DT=lade_wav(QUELLE['D_t'])
C=json.load(open(TC+'doppel_C.json'))
for k,o in C.items():
    L,c,c2=onset_versatz(H7,DT,o['h_ev'])
    o['E']=o['h_ev']+L; o['E_c']=c; o['E_c2']=c2
    A_=('%+4.0f'%((o['A']-o['h_ev'])*1000)) if o['A'] else '  - '
    print('%-7s %-6s %-4s E %+4.0f (c%.2f/%.2f) | C %+4.0f (r%.0f) A %s (c%.2f) B %+4.0f (c%.2f)'%(k,o['text'],o['teil'],L*1000,c,c2,(o['C']-o['h_ev'])*1000,o['C_rise'],A_,o['A_c'] or 0,(o['B']-o['h_ev'])*1000,o['B_c']))
json.dump(C,open(TC+'doppel_C.json','w'),indent=0)
