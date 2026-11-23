# Reibung je Frame über die dominante Tonhöhenklasse (Harmonische 1+2, oktavrobust), energiegewichtet, R1–R3
import numpy as np, soundfile as sf, json
W='/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/'
SR=48000; N=266*SR; nf=8192; hop=2400; f=np.fft.rfftfreq(nf,1/SR); win=np.hanning(nf)
MID=np.arange(36,84); Wm=np.zeros((len(MID),len(f)))
for i,mm in enumerate(MID):
    f0=440*2**((mm-69)/12)
    for h in (1,2): Wm[i,(f>h*f0*2**(-.3/12))&(f<h*f0*2**(.3/12))]=1
CH=[[3,6,10],[6,10,1],[1,5,8],[8,0,3]]; R=[(64,96,64),(128,160,128),(224,256,224)]
def reib(ch): return [p for p in range(12) if p not in ch and any((p-q)%12 in (1,11) for q in ch)]
def mono(x): return x.mean(1) if x.ndim==2 else x
def S(x):
    s=mono(x); out=[]; ch=[]
    for a,b,st in R:
        seg=s[int(a*SR):int(b*SR)]
        for i in range(0,len(seg)-nf,hop):
            out.append(Wm@(np.abs(np.fft.rfft(win*seg[i:i+nf]))**2)); ch.append(CH[int(((a+(i+nf/2)/SR)-st)//4)%4])
    return np.array(out), ch
ld=lambda p: sf.read(p,dtype='float64')[0][:N]
ST=W+'bau/stems_v12/'; P7=W+'repo/the-wall/projekt7/'; SV=W+'bau/stimmen/'
L,chs=S(ld(ST+'lead.wav')); lpc=MID[np.argmax(L,1)]%12; lon=L.max(1)>L.max()*1e-4
def mess(x):
    X,_=S(x); e=X.max(1); on=e>e.max()*1e-4; pc=MID[np.argmax(X,1)]%12
    ra=np.array([pc[k] in reib(chs[k]) for k in range(len(pc))])
    iv=(pc-lpc)%12; rl=np.isin(iv,[1,11,6])
    both=on&lon
    return dict(akk=round(100*np.sum(e[on]*ra[on])/np.sum(e[on]),1), lead=round(100*np.sum(e[both]*rl[both])/max(np.sum(e[both]),1e-20),1), sek=round(on.sum()*hop/SR,1))
OUT={'lead_v12':mess(ld(ST+'lead.wav'))}
for k in ['ober','unter','gegen_t','doppel_t']: OUT['v12_'+k]=mess(ld(SV+k+'.wav'))
for k in ['chor','gegengesang','doppel']: OUT['v12_stem_'+k]=mess(ld(ST+k+'.wav'))
for k in ['Haupt-3-trocken-v7','Chor-Oberterz-aus-Haupt-v7','Chor-Unterterz-aus-Haupt-v7','Gegengesang-eigen-7','Doppel-4-trocken-v7','KI-Oberterz-8','KI-Unterterz-9']: OUT['v7_'+k]=mess(ld(P7+k+'.wav'))
json.dump(OUT,open(W+'pruef/p6.json','w'),indent=1)
for k,v in OUT.items(): print('%-36s %s'%(k,v))
