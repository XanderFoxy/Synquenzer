import sys; sys.path.insert(0,'.')
from tgemein import *
from t_warp import merkmale
import time
for nm in ('H_v7','D_t'):
    t=time.time(); x=lade_wav(QUELLE[nm]); m=merkmale(x); np.savez(TC+'mk_%s.npz'%nm, **{k:v for k,v in m.items() if k!='hop'}); print(nm, time.time()-t, flush=True)
