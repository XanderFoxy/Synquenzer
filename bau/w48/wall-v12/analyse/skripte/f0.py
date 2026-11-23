# YIN-f0 (10 ms) fuer alle trockenen Spuren -> analyse/f0.npz
import numpy as np, soundfile as sf, sys
from scipy.signal import resample_poly
W='/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12'
R=W+'/repo/the-wall/'
SR=16000; HOP=160; N=800  # 50 ms Fenster
def yin(x):
    nf=(len(x)-N)//HOP
    idx=np.arange(N)[None,:]+HOP*np.arange(nf)[:,None]
    out_f=np.zeros(nf); out_c=np.ones(nf); rms=np.zeros(nf)
    tmin=int(SR/1100); tmax=int(SR/65)
    B=2000
    for s in range(0,nf,B):
        fr=x[idx[s:s+B]]
        rms[s:s+B]=np.sqrt((fr**2).mean(1)+1e-12)
        W_=N-tmax
        a=fr[:,:W_]
        nfft=2048
        Fa=np.fft.rfft(fr,nfft); Fb=np.fft.rfft(a,nfft)
        corr=np.fft.irfft(Fa*np.conj(Fb),nfft)[:,:tmax+1]  # sum a[j]*fr[j+tau]
        e0=(a*a).sum(1)
        cs=np.concatenate([np.zeros((fr.shape[0],1)),np.cumsum(fr*fr,1)],1)
        taus=np.arange(tmax+1)
        et=cs[:,taus+W_]-cs[:,taus]
        d=e0[:,None]+et-2*corr
        d[:,0]=0
        cm=np.cumsum(d[:,1:],1)/np.arange(1,tmax+1)
        dn=np.ones_like(d); dn[:,1:]=d[:,1:]/(cm+1e-12)
        dn[:,:tmin]=1
        for i in range(dn.shape[0]):
            row=dn[i]
            below=np.where(row<0.2)[0]
            if len(below)==0:
                t=int(np.argmin(row)); 
            else:
                t=below[0]
                while t+1<len(row) and row[t+1]<row[t]: t+=1
            c=row[t]
            if 1<=t<tmax:
                a_,b_,c_=row[t-1],row[t],row[t+1]; den=a_-2*b_+c_
                tt=t+(0.5*(a_-c_)/den if den>1e-9 else 0)
            else: tt=t
            out_f[s+i]=SR/tt if tt>0 else 0; out_c[s+i]=c
    return out_f,out_c,rms
files={'haupt':'projekt7/Haupt-3-trocken-v7.wav','doppel':'projekt7/Doppel-4-trocken-v7.wav',
 'oberterz':'projekt7/Chor-Oberterz-aus-Haupt-v7.wav','unterterz':'projekt7/Chor-Unterterz-aus-Haupt-v7.wav',
 'gegen':'projekt7/Gegengesang-eigen-7.wav','kiober':'projekt7/KI-Oberterz-8.wav','kiunter':'projekt7/KI-Unterterz-9.wav'}
res={}
for k,p in files.items():
    x,sr=sf.read(R+p,dtype='float32'); 
    if x.ndim>1: x=x.mean(1)
    x=resample_poly(x,1,3).astype(np.float64)
    f,c,r=yin(x)
    res[k+'_f']=f; res[k+'_c']=c; res[k+'_r']=20*np.log10(r+1e-9)
    print(k,len(f),flush=True)
np.savez(W+'/analyse/f0.npz',**res)
