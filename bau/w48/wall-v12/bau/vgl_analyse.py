import numpy as np, subprocess
R='/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/repo/the-wall/'
SR=48000
def lade(p):
    b=subprocess.run(['ffmpeg','-v','error','-i',R+p,'-f','f32le','-ac','2','-ar',str(SR),'-'],capture_output=True).stdout
    return np.frombuffer(b,dtype=np.float32).reshape(-1,2).astype(np.float64)
V=lade('projekt11/VERGLEICH-v10-v11.mp3'); A=lade('projekt10/The-Wall_A_v10_Club.mp3'); B=lade('projekt11/The-Wall_A_v11.mp3')
print(len(V)/SR,len(A)/SR,len(B)/SR)
n=min(len(V),len(A),len(B))
for k in range(0,int(n/SR)//16+1):
    s=slice(k*16*SR,min((k+1)*16*SR,n))
    v=V[s,0]; a=A[s,0]; b=B[s,0]
    # LS factors
    ga=(v*a).sum()/((a*a).sum()+1e-9); gb=(v*b).sum()/((b*b).sum()+1e-9)
    ra=np.sum((v-ga*a)**2)/np.sum(v**2); rb=np.sum((v-gb*b)**2)/np.sum(v**2)
    print(k*16, 'v10 g=%.3f res=%.3f | v11 g=%.3f res=%.3f'%(ga,ra,gb,rb))
# beeps: look at first 1.5s of blocks: residual after removing best match
for k in range(0,4):
    t0=k*16*SR
    seg=V[t0:t0+int(1.5*SR),0]
    a=A[t0:t0+int(1.5*SR),0]; b=B[t0:t0+int(1.5*SR),0]
    for x in (a,b):
        pass
    env=np.sqrt(np.convolve(seg**2,np.ones(480)/480,'same'))
    print('block',k,'env max at',np.argmax(env)/SR, 20*np.log10(env.max()+1e-9))
    F=np.abs(np.fft.rfft(seg[:int(0.3*SR)]*np.hanning(int(0.3*SR)))); f=np.fft.rfftfreq(int(0.3*SR),1/SR)
    print(' top freqs', f[np.argsort(F)[-5:]])
