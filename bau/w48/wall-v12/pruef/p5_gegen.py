# Schätzung Gegengesang-Pegel relativ zum Lead in v10/v11/v12 über Tonhöhen-Salienz (Harmonische 1+2) im Refrain
import numpy as np, soundfile as sf, json
W='/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/'
SR=48000; N=266*SR; nf=8192; hop=2400; f=np.fft.rfftfreq(nf,1/SR); win=np.hanning(nf)
MID=np.arange(36,84)
Wm=np.zeros((len(MID),len(f)))
for i,mm in enumerate(MID):
    f0=440*2**((mm-69)/12)
    for h in (1,2): Wm[i,(f>h*f0*2**(-.3/12))&(f<h*f0*2**(.3/12))]=1
R=[(64,96),(128,160),(224,256)]
def mono(x): return x.mean(1) if x.ndim==2 else x
def S(x):
    s=mono(x); out=[]
    for a,b in R:
        seg=s[int(a*SR):int(b*SR)]
        for i in range(0,len(seg)-nf,hop): out.append(Wm@(np.abs(np.fft.rfft(win*seg[i:i+nf]))**2))
    return np.array(out)
ST=W+'bau/stems_v12/'
ld=lambda p: sf.read(p,dtype='float64')[0][:N]
L=S(ld(ST+'lead.wav')); G=S(ld(ST+'gegengesang.wav'))
lp=np.argmax(L,1); gp=np.argmax(G,1)
ok=(L.max(1)>L.max()*1e-3)&(G.max(1)>G.max()*1e-3)&(np.abs(lp-gp)>=2)&(np.abs(lp-gp)%12!=0)
print('Frames', ok.sum(), 'von', len(ok))
idx=np.where(ok)[0]
def ratio(X):
    r=10*np.log10((X[idx,gp[idx]]+1e-20)/(X[idx,lp[idx]]+1e-20)); return round(float(np.median(r)),1)
OUT={'kalib_v12_stems(gegen_stem/lead_stem)': round(float(np.median(10*np.log10(G[idx,gp[idx]]/L[idx,lp[idx]]))),1)}
for k,p in [('v10_bus',W+'analyse/dyn/voc_m10.npy'),('v11_bus',W+'analyse/dyn/voc_m11.npy'),('v12_bus',W+'pruef/voc_m12.npy')]:
    OUT[k]=ratio(S(np.load(p)[:N].astype(np.float64)))
OUT['v12_gesang_summe']=ratio(S(ld(ST+'gesang_summe.wav')))
json.dump(OUT,open(W+'pruef/p5.json','w'),indent=1); print(OUT)
