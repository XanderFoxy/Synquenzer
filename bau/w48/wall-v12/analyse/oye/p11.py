import sys; sys.path.insert(0,'.')
from lade import *
D=W+'/analyse/dyn/'; SR=48000
V=np.load(D+'voc_m11.npy',mmap_mode='r'); V10=np.load(D+'voc_m10.npy',mmap_mode='r')
vm=lambda VV,a,b: (np.asarray(VV[a:b,0],dtype=np.float64)+np.asarray(VV[a:b,1],dtype=np.float64))/2
e=lade('ende'); g=lade('gegen')
N=8192; win=np.hanning(N); fr=np.fft.rfftfreq(N,1/SR)
def salc(S,m,K=8):
    f0=440*2**((m-69)/12); return sum(np.interp(k*f0,fr,S) for k in range(1,K+1))
def row(x,t,isV=False):
    a=int(t*SR)-N//2
    s=vm(x,a,a+N) if isV else np.asarray(x[a:a+N],dtype=np.float64)
    S=np.abs(np.fft.rfft(s*win)); ms=np.arange(50,62.01,0.05); sal=np.array([salc(S,m) for m in ms]); med=np.median(sal)
    out=[]
    for tgt in [53,54,56,60]:
        sel=np.abs(ms-tgt)<=0.35; i=np.argmax(sal*sel); out.append(f'{tgt}:{20*np.log10(sal[i]/med):3.0f}')
    return ' '.join(out)
print('Salienz-Kontrast (dB ueber Median 50-62) fuer Tonhoehe 53(F) 54(Gb) 56(Ab=eyes) 60(C)')
for t in np.arange(219.9,221.31,0.1):
    print(f'{t:6.1f} v11: {row(V,t,True)} | v10: {row(V10,t,True)} | ende: {row(e,t)} | gegen: {row(g,t)}')
