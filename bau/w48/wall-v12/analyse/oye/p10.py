import sys; sys.path.insert(0,'.')
from lade import *; from f0w import f0seg
SR=48000
o=lade('orig_h'); e=lade('ende')
for nm,x,t0 in [('orig R1 eyes',o,91.8),('ende R1 eyes',e,91.8),('orig ZT',o,219.8),('ende ZT',e,219.8)]:
    F,C,R=f0seg(x,t0,t0+1.7)
    print(f'{nm:13s}',' '.join(('.' if 20*np.log10(R[i])<-42 else (f'{69+12*np.log2(F[i]/440):.1f}' if F[i]>0 and C[i]<0.3 else '~')) for i in range(0,len(F),8)))
# Harmonische Salienz im ZT-ende fuer f0 in 55-58
N=8192; win=np.hanning(N); fr=np.fft.rfftfreq(N,1/SR)
def sal(x,t,m):
    a=int(t*SR)-N//2; S=np.abs(np.fft.rfft(x[a:a+N]*win)); f0=440*2**((m-69)/12)
    return sum(np.interp(k*f0,fr,S) for k in range(1,9))
for nm,x,off in [('ende ZT',e,0),('orig ZT',o,0),('orig R1',o,-128),('ende R1',e,-128)]:
    out=[]
    for t in np.arange(219.9,221.3,0.1):
        ms=np.arange(54.0,59.0,0.05); s=[sal(x,t+off,m) for m in ms]; i=int(np.argmax(s))
        # Kontrast: Salienz am Max vs Median ueber 54-59
        out.append(f'{ms[i]:.2f}/{20*np.log10(s[i]/np.median(s)):.0f}')
    print(nm,' '.join(out))
