# Feinere Prüfung (eigenes YIN, 40 ms Fenster, 10 ms Hop) Doppel/Gegengesang/Ober gegen Lead, R1–R3
import numpy as np, soundfile as sf, json
from scipy.signal import resample_poly
W='/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/'
SR=16000; WN=640; HOP=160; TMIN=int(SR/900); TMAX=int(SR/70)
CH=[[3,6,10],[6,10,1],[1,5,8],[8,0,3]]; R=[(64,96,64),(128,160,128),(224,256,224)]
def reib(ch): return [p for p in range(12) if p not in ch and any((p-q)%12 in (1,11) for q in ch)]
def yin(x):
    n=(len(x)-WN-TMAX)//HOP; out=np.full(n,np.nan); lv=np.zeros(n)
    for k in range(n):
        s=x[k*HOP:k*HOP+WN+TMAX]; a=s[:WN]; lv[k]=np.sqrt((a*a).mean())
        if lv[k]<1e-4: continue
        # Differenzfunktion über FFT-Kreuzkorrelation
        e0=(a*a).sum(); cs=np.cumsum(np.r_[0,s*s])
        et=cs[np.arange(TMAX)+WN]-cs[np.arange(TMAX)]
        c=np.fft.irfft(np.fft.rfft(s,2*len(s))*np.conj(np.fft.rfft(a,2*len(s))))[:TMAX]
        d=e0+et-2*c; d[0]=0
        cm=d[1:]*np.arange(1,TMAX)/np.maximum(np.cumsum(d[1:]),1e-12); cm=np.r_[1,cm]
        idx=np.where(cm[TMIN:]<0.2)[0]
        if len(idx)==0: continue
        t=idx[0]+TMIN
        while t+1<TMAX and cm[t+1]<cm[t]: t+=1
        if 1<=t<TMAX-1:
            y0,y1,y2=cm[t-1],cm[t],cm[t+1]; den=y0-2*y1+y2; t=t+(0.5*(y0-y2)/den if den!=0 else 0)
        out[k]=SR/t
    return out, lv
def load(p):
    x=sf.read(p,dtype='float64')[0]
    if x.ndim==2: x=x.mean(1)
    return resample_poly(x[:266*48000],1,3)
def f0(p):
    x=load(p); res=[]; lvs=[]
    for a,b,st in R:
        f,l=yin(x[int(a*SR):int(b*SR)]); res.append(f); lvs.append(l)
    m=69+12*np.log2(np.concatenate(res)/440); l=np.concatenate(lvs)
    m[l<l.max()*10**(-40/20)]=np.nan; return m
T=np.concatenate([a+np.arange(len(yin(np.zeros(32*SR))[0]))*HOP/SR+WN/2/SR for a,b,st in R]) if False else None
ST=W+'bau/stems_v12/'; P7=W+'repo/the-wall/projekt7/'; SV=W+'bau/stimmen/'
L=f0(ST+'lead.wav')
nper=len(L)//3
chs=[CH[int(((a+(i*HOP+WN/2)/SR)-st)//4)%4] for a,b,st in R for i in range(nper)]
def mess(p):
    V=f0(p); n=min(len(V),len(L))
    both=~np.isnan(V[:n])&~np.isnan(L[:n]); on=~np.isnan(V[:n])
    iv=np.round(V[:n][both]-L[:n][both]).astype(int)
    pc=np.round(V[:n][on]).astype(int)%12; cc=[chs[i] for i in np.where(on)[0]]
    ra=np.mean([p_ in reib(c) for p_,c in zip(pc,cc)])
    zw=np.mean(np.abs(V[:n][on]-np.round(V[:n][on]))>0.35)
    h={}; 
    for x in iv: h[int(x)]=h.get(int(x),0)+1
    top=sorted(h.items(),key=lambda z:-z[1])[:4]
    return dict(sek=round(on.sum()*.01,1), reib_lead=round(100*np.mean(np.isin(iv%12,[1,11,6])),1), reib_akk=round(100*ra,1), zwischen=round(100*zw,1), top=[(a,round(100*b/len(iv))) for a,b in top])
OUT={}
for k,p in [('lead_v12',ST+'lead.wav'),('v7_Doppel',P7+'Doppel-4-trocken-v7.wav'),('v12_doppel_t',SV+'doppel_t.wav'),('v7_Gegengesang',P7+'Gegengesang-eigen-7.wav'),('v12_gegen_t',SV+'gegen_t.wav'),('v7_Oberterz',P7+'Chor-Oberterz-aus-Haupt-v7.wav'),('v12_ober',SV+'ober.wav'),('v7_Unterterz',P7+'Chor-Unterterz-aus-Haupt-v7.wav'),('v12_unter',SV+'unter.wav'),('v7_KI-Ober',P7+'KI-Oberterz-8.wav'),('v7_KI-Unter',P7+'KI-Unterterz-9.wav')]:
    OUT[k]=mess(p); print('%-16s %s'%(k,OUT[k]),flush=True)
json.dump(OUT,open(W+'pruef/p7.json','w'),indent=1)
