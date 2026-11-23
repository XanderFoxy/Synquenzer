import numpy as np
S='/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall/roh/'
SR=48000
E=np.load(S+'ende.npy'); H=np.load(S+'haupt-v7.npy'); G=np.load(S+'gereinigt.npy'); H10=np.load(S+'haupt-v10.npy')
print(E.shape,E.dtype, 'rms dBFS', [round(20*np.log10(np.sqrt(np.mean(x.astype(np.float64)**2))),1) for x in (E,H,G,H10)])
secs=[('S1',32,64),('R1',64,96),('S2',96,128),('R2',128,160),('ZT',192,224),('R3',224,256)]
for nm,a,b in secs:
    s=slice(a*SR,b*SR)
    out=[]
    for x in (H,G,H10):
        e=E[s].astype(float); y=x[s].astype(float)
        c=(e*y).sum()/np.sqrt((e*e).sum()*(y*y).sum())
        out.append('%.3f'%c)
    print(nm,out)
# spectrum of E: bandwidth
F=np.abs(np.fft.rfft(E[64*SR:96*SR].astype(float)))**2; f=np.fft.rfftfreq(32*SR,1/SR)
for lo,hi in [(100,300),(300,1000),(1000,3000),(3000,6000),(6000,10000),(10000,14000),(14000,16000),(16000,18000),(18000,20000)]:
    m=(f>=lo)&(f<hi); print(lo,hi,'%.1f'%(10*np.log10(F[m].mean()+1e-20)))
