import sys, numpy as np
from zk_gemein import *
from zk_onset2 import ac_voicing
def tab(nm, t0, t1, step=0.005):
    x=np.asarray(lade(nm),np.float64); seg=x[int((t0-.1)*SR):int((t1+.1)*SR)]
    V=env_db(bp(seg,120,1800),10,5); HF=env_db(bp(seg,4000,10000),10,5); F2=env_db(bp(seg,1500,3000),10,5)
    r,rt=ac_voicing(seg,hop=0.005)
    try: zf=np.load(CACHE+'f0_%s.npz'%nm)
    except Exception: zf=None
    print(nm, t0, t1)
    for k in range(20, len(V)-20):
        t=t0-.1+k*0.005+0.0025
        j=np.argmin(np.abs(rt-(k*0.005+0.0025)))
        st=0; ap=1
        if zf is not None:
            jf=np.argmin(np.abs(zf['t']-t)); st=12*np.log2(max(zf['f0'][jf],1)/155.56); ap=zf['ap'][jf]
        bar='#'*int(max(0,(V[k]+50)/1.5))
        print('  %.3f %s V %6.1f F2 %6.1f HF %6.1f r %.2f f0 %+5.1f ap %.2f %s'%(t, fmt16(t), V[k],F2[k],HF[k],r[j],st,ap,bar))
if __name__=='__main__':
    tab(sys.argv[1], float(sys.argv[2]), float(sys.argv[3]))
