import subprocess, numpy as np, sys
R=sys.argv[1]; SR=48000
def lade(p):
    b=subprocess.run(['ffmpeg','-v','error','-i',p,'-f','f32le','-ac','2','-ar',str(SR),'-'],capture_output=True).stdout
    return np.frombuffer(b,dtype=np.float32).reshape(-1,2)[:266*SR]
ref=lade(R+'/spuren/The-Wall_v5_Instrumental-Master.mp3')
def db(x): return 10*np.log10(np.mean(x.astype(np.float64)**2)+1e-20)
for p in ['master/The-Wall_A_v5_Club.mp3','projekt7/The-Wall_A_v7_Club.mp3','projekt10/The-Wall_A_v10_Club.mp3','projekt11/The-Wall_A_v11.mp3']:
    x=lade(R+'/'+p)
    out=[]
    for nm,a,b in [('Intro',1,31),('R1',64,96),('Ueb',176,191),('R3',224,256)]:
        r=ref[a*SR:b*SR]; y=x[a*SR:b*SR]
        g=float((r*y).sum()/(r*r).sum())
        res=y-g*r
        out.append(f'{nm}: g={20*np.log10(abs(g)):+.2f}dB Rest {db(res)-db(y):+.1f}dB')
    print(p, ' | '.join(out))
