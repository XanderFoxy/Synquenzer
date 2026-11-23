import numpy as np, subprocess
R='/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/repo/the-wall/'
SR=48000
def lade(p):
    b=subprocess.run(['ffmpeg','-v','error','-i',R+p,'-f','f32le','-ac','2','-ar',str(SR),'-'],capture_output=True).stdout
    return np.frombuffer(b,dtype=np.float32).reshape(-1,2).astype(np.float64)
V=lade('projekt11/VERGLEICH-v10-v11.mp3'); A=lade('projekt10/The-Wall_A_v10_Club.mp3'); B=lade('projekt11/The-Wall_A_v11.mp3')
n=len(V); blk=16*SR
ref=np.zeros_like(V)
for k in range(n//blk+1):
    s=slice(k*blk,min((k+1)*blk,n)); ref[s]=(A if k%2==0 else B)[s]
r=V[:,0]-0.901*ref[:,0]
e=np.sqrt(np.convolve(r**2,np.ones(240)/240,'same'))
ed=20*np.log10(e+1e-9)
idx=np.where(ed>-40)[0]
# group
if len(idx):
    groups=[];st=idx[0];pr=idx[0]
    for i in idx[1:]:
        if i-pr>2400: groups.append((st,pr)); st=i
        pr=i
    groups.append((st,pr))
    for a,b in groups[:40]:
        seg=r[a:b+1]
        F=np.abs(np.fft.rfft(seg*np.hanning(len(seg)),2**16)); f=np.fft.rfftfreq(2**16,1/SR)
        print('%.3f-%.3f  peak %.1f dB  f=%.0f'%(a/SR,b/SR,ed[a:b+1].max(),f[np.argmax(F)]))
# check gain ramp near boundaries
for k in [1,2,3]:
    t=k*blk
    for d in [-0.2,-0.05,0,0.05,0.2]:
        i=int(t+d*SR); w=slice(i-480,i+480)
        ga=(V[w,0]*A[w,0]).sum()/(A[w,0]**2).sum(); gb=(V[w,0]*B[w,0]).sum()/(B[w,0]**2).sum()
        print(k,d,'%.3f %.3f'%(ga,gb))
