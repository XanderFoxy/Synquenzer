import sys; sys.path.insert(0,'.')
from tgemein import *
from scipy.signal import butter, sosfiltfilt
sos=butter(4,[3000,9000],'bandpass',fs=SR,output='sos')
for nm in ('H_v7','D_t'):
    x=lade_wav(QUELLE[nm]); h=sosfiltfilt(sos,x)
    m=dict(np.load(TC+'mk_%s.npz'%nm)); 
    n=len(m['lvl']); hop=120
    c=np.concatenate([[0.],np.cumsum(h*h)]); i=np.arange(n)*hop+hop//2; a=np.clip(i-240,0,len(h)); b=np.clip(i+240,0,len(h))
    m['hf']=10*np.log10((c[b]-c[a])/np.maximum(1,b-a)+1e-14)
    np.savez(TC+'mk_%s.npz'%nm, **m); print(nm,'ok')
