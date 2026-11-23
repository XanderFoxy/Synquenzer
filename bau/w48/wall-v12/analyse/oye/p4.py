import sys; sys.path.insert(0,'.')
from lade import *
from scipy.optimize import nnls
from scipy.signal import stft
D=W+'/analyse/dyn/'; SR=48000
V=np.load(D+'voc_m11.npy',mmap_mode='r'); V10=np.load(D+'voc_m10.npy',mmap_mode='r')
ks=['ende','gegen','oter','uter','kio','kiu','doppel']
X={k:lade(k) for k in ks}
def P(x,t0,t1):
    f,t,Z=stft(np.asarray(x[int(t0*SR):int(t1*SR)],dtype=np.float64),SR,nperseg=4096,noverlap=2048)
    sel=(f>80)&(f<6000); return np.abs(Z[sel])**2
for nm,VV in [('v11',V),('v10',V10)]:
  print(nm)
  for (t0,t1,lab) in [(215.4,216.8,'Wach auf'),(217.9,219.85,'open your (vor Sprache)'),(219.85,221.4,'Sprechstelle'),(87.4,88.8,'R1 wake up'),(89.9,93.4,'R1 open your eyes')]:
    Y=P(VV[:,0],t0,t1)+P(VV[:,1],t0,t1)
    A=np.stack([P(X[k],t0,t1).sum(1) for k in ks],1); y=Y.sum(1)
    # pro Rahmen NNLS, Summe der Beitraege
    Fr=Y.shape[1]; contrib=np.zeros(len(ks))
    for j in range(Fr):
        Aj=np.stack([P(X[k],t0,t1)[:,j] for k in ks],1) if False else None
    w,_=nnls(np.sqrt(A),np.sqrt(y))  # grobe Gesamt-Anpassung (Betragsspektren)
    w2,_=nnls(A,y)
    tot=(A*w2).sum(0); share=tot/max(tot.sum(),1e-20)
    print(f'  {lab:28s} gain_dB '+' '.join(f'{k}:{(10*np.log10(w2[i]) if w2[i]>0 else -99):6.1f}' for i,k in enumerate(ks)))
    print(f'  {"":28s} Anteil  '+' '.join(f'{k}:{share[i]*100:5.1f}%' for i,k in enumerate(ks)), ' Fit-Rest %.0f%%'%(100*np.sum((y-A@w2)**2)/np.sum(y**2)))
