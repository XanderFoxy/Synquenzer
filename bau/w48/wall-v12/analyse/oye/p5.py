import sys; sys.path.insert(0,'.')
from lade import *
from scipy.optimize import nnls
from scipy.signal import stft
D=W+'/analyse/dyn/'; SR=48000
V=np.load(D+'voc_m11.npy',mmap_mode='r'); V10=np.load(D+'voc_m10.npy',mmap_mode='r')
I=np.fromfile(D+'inst.f32',np.float32).reshape(-1,2)
base=['ende','gegen','oter','uter','kio','kiu','haupt','doppel']
X={k:lade(k) for k in base}
def P(x,t0,t1):
    f,t,Z=stft(np.asarray(x[int(t0*SR):int(t1*SR)],dtype=np.float64),SR,nperseg=2048,noverlap=1024)
    sel=(f>80)&(f<6000); return np.abs(Z[sel])**2
cands=[('ende',0),('gegen',0),('oter',0),('uter',0),('kio',0),('kiu',0),('inst',0)]
for k in ['haupt','oter','uter','gegen','doppel','kio','kiu']:
    cands+= [(k,-128),(k,32)]
t0,t1=219.85,221.4
for nm,VV in [('v11',V),('v10',V10)]:
    Y=P(VV[:,0],t0,t1)+P(VV[:,1],t0,t1)
    Bs=[]
    for k,o in cands:
        if k=='inst': Bs.append(P(I[:,0],t0,t1)+P(I[:,1],t0,t1))
        else: Bs.append(P(X[k],t0+o,t1+o))
    Fr=Y.shape[1]; E=np.zeros(len(cands)); res=0
    for j in range(Fr):
        A=np.stack([B[:,j] for B in Bs],1); y=Y[:,j]
        sc=np.sqrt((A**2).sum(0))+1e-30
        w,_=nnls(A/sc,y); w/=sc
        E+=A.sum(0)*w; res+=np.sum(np.abs(y-A@w))/np.sum(y)
    E/=E.sum()
    o=np.argsort(-E)
    print(nm,'Sprechstelle 219,85-221,4 s, Energie-Anteile (frameweise NNLS):', ', '.join(f'{cands[i][0]}{"@R1" if cands[i][1]==-128 else "@R3" if cands[i][1]==32 else ""} {E[i]*100:.1f}%' for i in o[:9]), ' | rel. Rest %.0f%%'%(100*res/Fr))
