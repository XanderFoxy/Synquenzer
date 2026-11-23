import numpy as np
from scipy.signal import resample_poly
def yin(x, sr=16000, hop=160, N=800, fmin=65, fmax=1100):
    tmin=int(sr/fmax); tmax=int(sr/fmin)
    nf=(len(x)-N)//hop; F=np.zeros(nf); C=np.ones(nf); R=np.zeros(nf)
    for i in range(nf):
        fr=x[i*hop:i*hop+N]; R[i]=np.sqrt(np.mean(fr**2)+1e-12)
        Wn=N-tmax; a=fr[:Wn]
        d=np.array([np.sum((a-fr[t:t+Wn])**2) for t in range(tmax+1)])
        cm=np.cumsum(d[1:])/np.arange(1,tmax+1); dn=np.ones_like(d); dn[1:]=d[1:]/(cm+1e-12); dn[:tmin]=1
        b=np.where(dn<0.15)[0]
        t=int(np.argmin(dn)) if len(b)==0 else b[0]
        if len(b):
            while t+1<len(dn) and dn[t+1]<dn[t]: t+=1
        C[i]=dn[t]
        if 1<=t<tmax:
            p=dn[t-1]-2*dn[t]+dn[t+1]; off=0.5*(dn[t-1]-dn[t+1])/p if p!=0 else 0
            F[i]=sr/(t+off)
    return F,C,R
def f0seg(x48, t0, t1):
    x=resample_poly(x48[int(t0*48000):int(t1*48000)],1,3)
    return yin(x)
