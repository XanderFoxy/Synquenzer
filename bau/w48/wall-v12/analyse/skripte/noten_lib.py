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
