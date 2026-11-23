import numpy as np, subprocess
W='/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/repo/the-wall/'
def dec(f):
    b=subprocess.run(['ffmpeg','-v','error','-i',f,'-f','f32le','-ac','2','-ar','48000','-'],capture_output=True).stdout
    return np.frombuffer(b,dtype=np.float32).reshape(-1,2).astype(np.float64)
v11=dec(W+'projekt11/The-Wall_A_v11.mp3'); v12=dec(W+'projekt12/The-Wall_A_v12.mp3'); vg=dec(W+'projekt12/VERGLEICH-v11-v12.mp3')
SR=48000; blk=16*SR; n=min(len(v11),len(v12),len(vg))
res=[]
for k in range(n//blk+1):
    a=k*blk
    if a+SR>n: break
    ref = v11 if k%2==0 else v12
    r = (vg[a:a+int(.4*SR)]-0.901*ref[a:a+int(.4*SR)]).mean(1)
    e = np.sqrt((r[:len(r)//240*240].reshape(-1,240)**2).mean(1))  # 5 ms
    on = e > 0.02
    npi = int(np.sum(np.diff(on.astype(int))==1) + on[0])
    starts = [round(i*0.005,3) for i in np.where(np.diff(on.astype(int))==1)[0]+1]
    res.append((k*16, 'v11' if k%2==0 else 'v12', npi, starts, round(20*np.log10(e.max()),1)))
for x in res: print(x)
# Klick-Kandidaten prüfen: Pegel der 2. Ableitung v11 vs v12 an 6.262, 27.755, 207.0-207.5
for t in [6.262, 27.755, 207.023, 207.29, 207.357, 207.456, 26.503]:
    i=int(t*SR); s=slice(i-48,i+48)
    print(t, 'maxdiff v11 %.3f v12 %.3f  peak v11 %.3f v12 %.3f' % (np.abs(np.diff(v11[s],axis=0)).max(), np.abs(np.diff(v12[s],axis=0)).max(), np.abs(v11[s]).max(), np.abs(v12[s]).max()))
