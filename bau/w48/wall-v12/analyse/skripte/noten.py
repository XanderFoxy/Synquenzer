# Noten-Ebene: stabile Toene >=120 ms, Intervall zum gleichzeitigen Lead-Ton, Reibung gegen Lead/Akkord, pro Takt
import numpy as np, json
W='/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12'
d=np.load(W+'/analyse/f0.npz'); T=np.arange(len(d['haupt_f']))*0.01+0.025
def midi(f): return 69+12*np.log2(np.maximum(f,1)/440)
CH=[('Ebm',[3,6,10]),('Gb',[6,10,1]),('Db',[1,5,8]),('Ab/C',[8,0,3])]
def akk(tt,st): return CH[int(np.floor((tt-st)/4.0))%4] if tt>=st else CH[0]
def noten(k):
    f=d[k+'_f'];c=d[k+'_c'];r=d[k+'_r']
    v=(c<0.25)&(r>-42)&(f>70)&(f<1000); m=midi(f); m[~v]=np.nan
    out=[];i=0;n=len(m)
    while i<n:
        if np.isnan(m[i]): i+=1; continue
        j=i; seg=[m[i]]
        while j+1<n and not np.isnan(m[j+1]) and abs(m[j+1]-np.median(seg[-8:]))<0.5: j+=1; seg.append(m[j])
        if j-i+1>=12:
            p=float(np.median(seg)); out.append((T[i],T[j]+0.01,p,float(np.median(r[i:j+1]))))
        i=j+1
    return out
NV={k:noten(k) for k in ['haupt','doppel','oberterz','unterterz','gegen','kiober','kiunter']}
def lead_at(a,b):
    best=None;ov=0
    for (la,lb,lp,_) in NV['haupt']:
        o=min(b,lb)-max(a,la)
        if o>ov: ov=o;best=lp
    return best,ov
TEILE={'R1':(63.0,96.0,64.0),'R2':(127.0,160.0,128.0),'R3':(223.0,256.0,224.0)}
IV={0:'Prim',1:'kl.Sek',2:'gr.Sek',3:'kl.Terz',4:'gr.Terz',5:'Quarte',6:'Tritonus',7:'Quinte',8:'kl.Sext',9:'gr.Sext',10:'kl.Sept',11:'gr.Sept'}
res={}; takt={}
for k in ['haupt','doppel','oberterz','unterterz','gegen','kiober','kiunter']:
    tot=0;dl=0;dak=0;zw=0;ivs={};okt=0
    for teil,(a,b,st) in TEILE.items():
        for (na,nb,p,lv) in NV[k]:
            if na<a or na>=b: continue
            dur=nb-na; q=int(round(p)); pc=q%12
            name,tones=akk((na+nb)/2,st)
            # Reibung gegen Akkord: Nicht-Akkordton mit Halbton-Nachbar im Akkord
            ra=(pc not in tones) and any(((pc-x)%12) in (1,11) for x in tones)
            zwi=abs(p-q)>0.35
            if k=='haupt':
                rl=False; ivn=None
            else:
                lp,ov=lead_at(na,nb)
                if lp is None or ov<0.05: ivn=None; rl=False
                else:
                    iv=int(round(p-lp)); ivn=iv
                    rl=(iv%12) in (1,11,6)
                    ivs[iv]=ivs.get(iv,0)+dur
            tot+=dur; dl+=dur*rl; dak+=dur*ra; zw+=dur*zwi
            tk=int((na-a)//2)+ (33 if teil=='R1' else 65 if teil=='R2' else 113) - (1 if na< st else 0)
            takt.setdefault(teil,{}).setdefault(tk,{}).setdefault(k,[]).append((round(p,1),ivn,bool(rl),bool(ra)))
    s=sum(ivs.values()) or 1
    res[k]=dict(sek=round(tot,1),reib_lead=round(100*dl/tot,1),reib_akk=round(100*dak/tot,1),zwischen=round(100*zw/tot,1),
        top=[(IV[x%12]+('+' if x>0 else '-' if x<0 else '')+('8va' if abs(x)>=12 else ''),round(100*v/s)) for x,v in sorted(ivs.items(),key=lambda z:-z[1])[:5]])
    print(f"{k:10s} {res[k]}")
json.dump({'stimmen':res,'takte':takt},open(W+'/analyse/noten.json','w'),indent=0,ensure_ascii=False)
# Wer reibt pro Takt (R1)
print('\nR1 Takt fuer Takt: reibend gegen Lead (L) / Akkord (A)')
for tk in sorted(takt['R1']):
    row=[]
    for k in ['oberterz','unterterz','gegen','kiober','kiunter','doppel']:
        L=takt['R1'][tk].get(k,[])
        nl=sum(1 for x in L if x[2]); na_=sum(1 for x in L if x[3])
        row.append(f"{k[:5]} {len(L)}n L{nl} A{na_}")
    print(tk,CH[((tk-33)//2)%4][0] if tk>=33 else 'Auft',' | '.join(row))
