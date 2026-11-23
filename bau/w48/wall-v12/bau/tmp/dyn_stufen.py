import numpy as np, soundfile as sf, json
from scipy.signal import butter, sosfiltfilt
S='/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/'
B=S+'wall-v12/bau/'; SR=48000; N=266*SR
L=json.load(open(S+'wall/werkzeug/lied.json')); sil=[(s['a'],s['b']) for s in L['silben']]
def bp(x,lo,hi): return sosfiltfilt(butter(4,[lo,hi],'band',fs=SR,output='sos'),x)
def rms50(x,hop=.05,win=.05):
    h=int(hop*SR);w=int(win*SR);n=len(x)//h;c=np.concatenate([[0],np.cumsum(x*x)]);i=np.arange(n)*h;b_=np.minimum(i+w,len(x));return 10*np.log10((c[b_]-c[i])/w+1e-12)
ende=np.load(S+'wall/roh/ende.npy').astype(np.float64)[:N]
ref=rms50(bp(ende,200,6000))
secs=[('S1',32,63),('R1',64,96),('S2',96,127),('R2',128,160),('R3',224,256)]
def m(x):
    r=rms50(bp(x,200,6000)); out=[]
    for k,a,b_ in secs:
        sy=np.array([r[int(s0*20):int(s1*20)+1].max() for s0,s1 in sil if a<=s0<b_ and s1-s0>.08]); out.append(np.percentile(sy,90)-np.percentile(sy,10))
    return ' '.join('%s %.1f'%(k,v) for (k,_,_),v in zip(secs,out))+'  | Mittel %.1f'%np.mean(out)
print('ende (v11 Lead trocken):', m(ende))
ld=sf.read(B+'stems_v12/lead.wav')[0].mean(1); print('v12 Lead nach Kette    :', m(ld))
h=sf.read(B+'stems_v12/hall.wav')[0].mean(1); print('v12 Lead+Hall/Delay    :', m(ld+h))
v=sf.read(B+'stems_v12/gesang_summe.wav')[0].mean(1); print('v12 Gesangssumme (Bus-Limiter):', m(v))
