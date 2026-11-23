import numpy as np, json
W='/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12'
d=np.load(W+'/analyse/f0.npz'); T=np.arange(len(d['haupt_f']))*0.01+0.025
exec(open(W+'/analyse/skripte/noten_lib.py').read())
CH=[('Ebm',[3,6,10]),('Gb',[6,10,1]),('Db',[1,5,8]),('Ab/C',[8,0,3])]
PN=['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B']
ST=[64,128,224]
def ak(t):
    for s in ST:
        if s-1<=t<s+32: return CH[int(np.floor((t-s)/4))%4] if t>=s else CH[0]
V=['haupt','doppel','oberterz','unterterz','gegen','kiober','kiunter']
NV={k:[n for n in noten(k) if ak((n[0]+n[1])/2)] for k in V}
tab={}; detail={}
for k in V:
    for (a,b,p,_) in NV[k]:
        nm,tones=ak((a+b)/2); pc=int(round(p))%12; dur=b-a
        r=(pc not in tones) and any(((pc-x)%12) in (1,11) for x in tones)
        tab.setdefault(k,{}).setdefault(nm,[0,0]); tab[k][nm][0]+=dur; tab[k][nm][1]+=dur*r
        if r: detail.setdefault(k,{}).setdefault(nm,{}); detail[k][nm][PN[pc]]=detail[k][nm].get(PN[pc],0)+dur
print('Anteil Dauer mit Halbton-Reibung gegen Akkord, R1-R3, je Akkord (%)')
print('Stimme      '+'  '.join(f'{c[0]:>6s}' for c in CH)+'   gesamt')
for k in V:
    row=[100*tab[k][c[0]][1]/max(tab[k][c[0]][0],1e-9) for c in CH]
    tot=100*sum(tab[k][c[0]][1] for c in CH)/sum(tab[k][c[0]][0] for c in CH)
    print(f'{k:10s} '+'  '.join(f'{x:6.0f}' for x in row)+f'   {tot:5.1f}   '+str({c:{n:round(s,1) for n,s in sorted(v.items(),key=lambda z:-z[1])[:3]} for c,v in detail.get(k,{}).items()}))
# Lead-Ton -> Terz-Ton je Akkord (haeufigste Paare)
print('\nHaeufige Lead->Oberterz/Unterterz-Paare mit Reibung:')
for k in ['oberterz','unterterz','kiober','kiunter']:
    pairs={}
    for (a,b,p,_) in NV[k]:
        nm,tones=ak((a+b)/2); pc=int(round(p))%12
        if (pc in tones) or not any(((pc-x)%12) in (1,11) for x in tones): continue
        best=None;ov=0
        for (la,lb,lp,_) in NV['haupt']:
            o=min(b,lb)-max(a,la)
            if o>ov: ov=o;best=lp
        if best is None: continue
        key=f"{nm}: Lead {PN[int(round(best))%12]} -> {PN[pc]}"; pairs[key]=pairs.get(key,0)+(b-a)
    print(k,[(x,round(y,1)) for x,y in sorted(pairs.items(),key=lambda z:-z[1])[:5]])
