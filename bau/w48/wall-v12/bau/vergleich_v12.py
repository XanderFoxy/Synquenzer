# VERGLEICH-v11-v12.mp3: Wechsel alle 16 s, 1 Piep = v11, 2 Pieps = v12; beide ×0,901 wie VERGLEICH-v10-v11
import numpy as np, soundfile as sf, subprocess, sys
sys.path.insert(0, '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/bau')
from dsp import true_peak
W = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/'
R = W + 'repo/the-wall/'; B = W + 'bau/'; SR = 48000; N = 266 * SR
b = subprocess.run(['ffmpeg', '-v', 'error', '-i', R + 'projekt11/The-Wall_A_v11.mp3', '-f', 'f32le', '-ac', '2', '-ar', '48000', '-'], capture_output=True).stdout
v11 = np.frombuffer(b, dtype=np.float32).reshape(-1, 2).astype(np.float64)[:N]
v12 = np.load(B + 'master_v12_48k.npy').astype(np.float64)[:N]
out = np.zeros((N, 2)); blk = 16 * SR
t = np.arange(int(0.041 * SR)) / SR
pieps = 0.056 * np.sin(2 * np.pi * 1200 * t); f = int(0.005 * SR)
pieps[:f] *= np.linspace(0, 1, f); pieps[-f:] *= np.linspace(1, 0, f)
for k in range(N // blk + 1):
    a = k * blk; e = min(a + blk, N)
    if a >= N: break
    src = v11 if k % 2 == 0 else v12
    out[a:e] = 0.901 * src[a:e]
    for off in ([0.010] if k % 2 == 0 else [0.010, 0.160]):
        i = a + int(off * SR); out[i:i + len(pieps)] += pieps[:, None]
w = B + 'tmp/vergleich.wav'; sf.write(w, out.astype(np.float32), SR, subtype='FLOAT')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', w, '-c:a', 'libmp3lame', '-b:a', '320k', '-ar', '48000', R + 'projekt12/VERGLEICH-v11-v12.mp3'], check=True)
print('TP Vergleich %.2f dBTP' % true_peak(out))
