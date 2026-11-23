import numpy as np, json, sys
sys.argv=['x']; exec(open('p7_yin.py').read().split("OUT={}")[0])
from scipy.ndimage import median_filter
def stab(m):
    s=m.copy(); 
    for i in range(len(m)):
        w=m[max(0,i-6):i+7]
        if np.isnan(m[i]) or np.sum(~np.isnan(w))<13 or np.nanmax(w)-np.nanmin(w)>0.6: s[i]=np.nan
    return s
Ls=stab(L); H7=stab(f0(P7+'Haupt-3-trocken-v7.wav'))
def seg_list(V, ref, tag):
    n=min(len(V),len(ref)); both=~np.isnan(V[:n])&~np.isnan(ref[:n])
    iv=np.round(V[:n]-ref[:n]); iv[~both]=np.nan
    h={}
    for x in iv[both]: h[int(x)]=h.get(int(x),0)+1
    tot=both.sum(); print(tag,'stabile Frames',tot,'Intervalle',sorted([(k,round(100*v/tot,1)) for k,v in h.items()],key=lambda z:-z[1])[:5])
    # Segmente mit -1/+1/11 >= 100 ms
    out=[]; i=0
    while i<n:
        if both[i] and abs(iv[i])%12 in (1,11,6):
            j=i
            while j+1<n and both[j+1] and iv[j+1]==iv[i]: j+=1
            if j-i+1>=10:
                k=i//nper; a,b,st=R[k]; out.append((round(a+(i%nper)*HOP/SR+WN/2/SR,2), round((j-i+1)*.01,2), int(iv[i])))
            i=j+1
        else: i+=1
    print('  Reibe-Segmente >=100 ms:', len(out), out[:25])
seg_list(H7, Ls, 'Haupt-v7 vs Lead-v12')
seg_list(stab(f0(SV+'doppel_t.wav')), Ls, 'Doppel-v12 vs Lead-v12')
seg_list(stab(f0(P7+'Doppel-4-trocken-v7.wav')), Ls, 'Doppel-v7 vs Lead-v12')
seg_list(stab(f0(SV+'gegen_t.wav')), Ls, 'Gegen-v12 vs Lead-v12')
seg_list(stab(f0(SV+'ober.wav')), Ls, 'Ober-v12 vs Lead-v12')
