import sys; sys.path.insert(0,'.')
from lade import *
from scipy.signal import find_peaks
D=W+'/analyse/dyn/'; SR=48000
V=np.load(D+'voc_m11.npy',mmap_mode='r'); V10=np.load(D+'voc_m10.npy',mmap_mode='r')
e=lade('ende'); g=lade('gegen'); h=lade('haupt')
N=8192; win=np.hanning(N); f=np.fft.rfftfreq(N,1/SR)
def peaks(x,t):
    a=int(t*SR)-N//2; s=np.asarray(x[a:a+N],dtype=np.float64)
    S=20*np.log10(np.abs(np.fft.rfft(s*win))+1e-9); sel=(f>90)&(f<900)
    fs=f[sel]; Ss=S[sel]; p,_=find_peaks(Ss,prominence=10)
    p=p[np.argsort(-Ss[p])][:5]
    return ' '.join(f'{69+12*np.log2(fs[i]/440):5.1f}({Ss[i]-Ss.max():+3.0f})' for i in sorted(p,key=lambda i:fs[i]))
for t in np.arange(219.8,221.45,0.1):
    vm=(np.asarray(V[:,0])+np.asarray(V[:,1])) if False else None
    print(f'{t:6.2f} v11: {peaks(V[:,0]+0*V[:,1],t):45s} | ende: {peaks(e,t):40s} | gegen: {peaks(g,t)}')
