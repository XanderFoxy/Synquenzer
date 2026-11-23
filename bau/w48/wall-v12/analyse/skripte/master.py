# Intervall-Profil des Chors in den Mastern (Side-Kanal = seitlich gestellte Stimmen; Lead/Gegengesang Mitte fallen weg)
import numpy as np, subprocess, json
W='/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12'; R=W+'/repo/the-wall/'
SR=16000
def lade(p):
    b=subprocess.run(['ffmpeg','-v','error','-i',R+p,'-f','f32le','-ac','2','-ar',str(SR),'-'],capture_output=True).stdout
    x=np.frombuffer(b,dtype=np.float32).reshape(-1,2).astype(np.float64); return x[:266*SR]
M={'v7':lade('projekt7/The-Wall_A_v7_Club.mp3'),'v9':lade('projekt9/The-Wall_v9_Dicht-klar.mp3'),'v10':lade('projekt10/The-Wall_A_v10_Club.mp3'),
   'v11':lade('projekt11/The-Wall_A_v11.mp3')}
I=lade('spuren/The-Wall_v5_Instrumental-Master.mp3')
nv=json.load(open(W+'/analyse/noten.json'))
# Lead-Noten aus f0.npz neu
d=np.load(W+'/analyse/f0.npz'); T=np.arange(len(d['haupt_f']))*0.01+0.025
exec(open(W+'/analyse/skripte/noten_lib.py').read())
LN=[n for n in noten('haupt') if 64<=n[0]<96 or 128<=n[0]<160 or 224<=n[0]<256]
NF=4096; win=np.hanning(NF)
def spec(x,a,b):
    i0=int(a*SR); i1=int(b*SR); segs=[]
    for s in range(i0,max(i0+1,i1-NF),NF//4):
        segs.append(np.abs(np.fft.rfft(x[s:s+NF]*win))**2)
    return np.mean(segs,0) if segs else None
fr=np.fft.rfftfreq(NF,1/SR)
def band(S,f): # Energie um f (+-30 cent)
    lo=f*2**(-0.3/12); hi=f*2**(0.3/12); m=(fr>=lo)&(fr<=hi); return S[m].sum()
out={}
for v,x in M.items():
    res=x.copy()
    if v in ('v7','v10','v11'):
        # Instrumental pro 1-s-Block per LS abziehen
        for s in range(0,len(x),SR):
            a=I[s:s+SR]; b=x[s:s+SR]
            g=(a*b).sum()/((a*a).sum()+1e-12); res[s:s+SR]=b-g*a
    mid=(res[:,0]+res[:,1])/2; side=(res[:,0]-res[:,1])/2
    prof={'mid':np.zeros(37),'side':np.zeros(37)}; 
    for (a,b,p,_) in LN:
        if b-a<0.3: continue
        f0=440*2**((round(p)-69)/12)
        for nm,sig in (('mid',mid),('side',side)):
            S=spec(sig,a+0.05,b)
            if S is None: continue
            e=np.array([band(S,f0*2**(k/12)) for k in range(-12,25)])
            prof[nm]+=e/(e.sum()+1e-20)*(b-a)
    for nm in prof: prof[nm]/=prof[nm].sum()
    # Breite: Side/Mid-Energie 200-2000 Hz, Refrain vs Strophe
    def en(sig,a,b): 
        S=spec(sig,a,b); m=(fr>200)&(fr<2000); return S[m].sum()
    wid_r=10*np.log10(en(side,64,96)/en(mid,64,96)); wid_s=10*np.log10(en(side,32,64)/en(mid,32,64))
    out[v]=dict(mid=[round(100*z,1) for z in prof['mid']],side=[round(100*z,1) for z in prof['side']],side_mid_R1_dB=round(wid_r,1),side_mid_S1_dB=round(wid_s,1))
    pk=lambda arr: sorted([(k-12,round(100*arr[k],1)) for k in range(37)],key=lambda z:-z[1])[:9]
    print(v,'Side/Mid R1 %.1f dB, S1 %.1f dB'%(wid_r,wid_s)); print('  mid ',pk(prof['mid'])); print('  side',pk(prof['side']))
json.dump(out,open(W+'/analyse/master_profil.json','w'))
