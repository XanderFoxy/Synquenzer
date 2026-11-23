import numpy as np, json
W='/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12'
d=np.load(W+'/analyse/f0.npz')
t=np.arange(len(d['haupt_f']))*0.01+0.025
CH={0:('Ebm',[3,6,10],3),1:('Gb',[6,10,1],6),2:('Db',[1,5,8],1),3:('Ab/C',[8,0,3],8)}
def akk(tt,start):
    k=int(np.floor((tt-start)/4.0))%4 if tt>=start else 0
    return CH[k]
TEILE={'R1':(63.0,96.0,64.0),'R2':(127.0,160.0,128.0),'R3':(223.0,256.0,224.0),'ZT':(192.0,223.0,192.0),'Tag':(157.5,160.5,160.0)}
def midi(f): return 69+12*np.log2(np.maximum(f,1)/440)
def stimm(k,thr=-42):
    f=d[k+'_f']; c=d[k+'_c']; r=d[k+'_r']
    v=(c<0.25)&(r>thr)&(f>70)&(f<1000)
    m=midi(f); m[~v]=np.nan
    # Glaetten: Median 5
    from scipy.ndimage import median_filter
    mm=m.copy(); ok=~np.isnan(m)
    return m
M={k:stimm(k) for k in ['haupt','doppel','oberterz','unterterz','gegen','kiober','kiunter']}
NAMEN={'doppel':'Doppel','oberterz':'Terz ueber (aus Haupt)','unterterz':'Terz unter (aus Haupt)','gegen':'Gegengesang Xander','kiober':'KI-Oberterz','kiunter':'KI-Unterterz','haupt':'Haupt'}
IVN={0:'Prim',1:'kl.Sek',2:'gr.Sek',3:'kl.Terz',4:'gr.Terz',5:'Quarte',6:'Tritonus',7:'Quinte',8:'kl.Sext',9:'gr.Sext',10:'kl.Sept',11:'gr.Sept'}
out={}
for teil,(a,b,st) in TEILE.items():
    sel=(t>=a)&(t<b)
    L=M['haupt']
    out[teil]={}
    for k in ['doppel','oberterz','unterterz','gegen','kiober','kiunter']:
        V=M[k]
        both=sel&~np.isnan(L)&~np.isnan(V)
        alone=sel&~np.isnan(V)
        if alone.sum()<20: continue
        iv=np.round(V[both]-L[both]).astype(int)
        h={}
        for x in iv: h[x]=h.get(x,0)+1
        n=len(iv)
        top=sorted(h.items(),key=lambda z:-z[1])[:5]
        pc=np.mod(iv,12)
        dis=np.isin(pc,[1,11,6]).mean() if n else np.nan
        mild=np.isin(pc,[2,10]).mean() if n else np.nan
        # gegen Akkord
        tt=t[alone]; vv=np.round(V[alone]).astype(int)%12
        nct=[];reib=[]
        for ti,p in zip(tt,vv):
            nm,tones,root=akk(ti,st)
            isct=p in tones
            nct.append(not isct)
            reib.append((not isct) and any(((p-q)%12) in (1,11) for q in tones) )
        lage=np.nanmedian(V[alone]); lead_lage=np.nanmedian(L[sel])
        out[teil][k]=dict(n_frames=int(alone.sum()),n_both=int(n),top=[(int(x),round(100*c/n,1)) for x,c in top],
            reib_lead=round(100*dis,1),mild_lead=round(100*mild,1),
            nichtakkord=round(100*np.mean(nct),1),halbton_akk=round(100*np.mean(reib),1),
            lage=round(float(lage),1),lead_lage=round(float(lead_lage),1),
            pegel=round(float(np.median(d[k+'_r'][alone])),1))
    # Lead selbst gegen Akkord
    alone=sel&~np.isnan(L)
    tt=t[alone]; vv=np.round(L[alone]).astype(int)%12
    nct=[akk(ti,st)[1] for ti in tt]
    out[teil]['haupt']=dict(n_frames=int(alone.sum()),nichtakkord=round(100*np.mean([p not in c for p,c in zip(vv,nct)]),1),
       halbton_akk=round(100*np.mean([(p not in c) and any(((p-q)%12) in (1,11) for q in c) for p,c in zip(vv,nct)]),1),
       pegel=round(float(np.median(d['haupt_r'][alone])),1),lage=round(float(np.nanmedian(L[alone])),1))
json.dump(out,open(W+'/analyse/intervalle.json','w'),indent=1)
for teil in out:
    print('==',teil)
    for k,v in out[teil].items():
        print(f"{NAMEN[k]:24s} {v}")
