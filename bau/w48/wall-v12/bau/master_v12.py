# The Wall v12 – Master und Ausgabe (liest bau/mix_vor_master.npy aus mix_v12.py)
import numpy as np, soundfile as sf, subprocess, json, os, sys
import pyloudnorm as pyln
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dsp import *
W = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/'
B = W + 'bau/'; OUTD = W + 'repo/the-wall/projekt12/'
LOG = json.load(open(B + 'mix_log.json'))
mix = np.load(B + 'mix_vor_master.npy').astype(np.float64)
meter = pyln.Meter(SR); ziel = -10.0
CLIP = {}


def master(x, decke):
    """Weicher Clipper (4x, Knie ab −3 dBFS) für kurze Spitzen, dann Limiter schnell und ruhig (Decke dBTP)."""
    y, CLIP['anteil_prozent'], CLIP['max_db'] = softclip(x, -3.0, -0.8)
    y, g1 = limiter(y, decke + 0.9, 1.5, 200.0)
    y, g2 = limiter(y, decke, 5.0, 25.0)
    return y, g1 + g2


def mp3_tp(y):
    w = B + 'tmp/The-Wall_A_v12_48k.wav'; o = OUTD + 'The-Wall_A_v12.mp3'
    sf.write(w, y.astype(np.float32), SR, subtype='FLOAT')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', w, '-c:a', 'libmp3lame', '-b:a', '320k', '-ar', '48000', o], check=True)
    b = subprocess.run(['ffmpeg', '-v', 'error', '-i', o, '-f', 'f32le', '-ac', '2', '-ar', '48000', '-'], capture_output=True).stdout
    return true_peak(np.frombuffer(b, dtype=np.float32).reshape(-1, 2).astype(np.float64))


decke = -1.5; g = 0.0
for runde in range(4):
    for it in range(4):
        y, grl = master(mix * undb(g), decke)
        lu = meter.integrated_loudness(y); g += ziel - lu
    y, grl = master(mix * undb(g), decke)
    tpm = mp3_tp(y)
    print('Decke %.2f: LUFS %.2f, TP 48k %.2f, TP MP3 %.2f' % (decke, meter.integrated_loudness(y), true_peak(y), tpm), flush=True)
    if tpm <= -1.05: break
    decke -= (tpm + 1.1)
lu = meter.integrated_loudness(y)
LOG['clipper'] = {k: round(v, 3) for k, v in CLIP.items()}
LOG['master'] = dict(decke_dbtp=round(decke, 2), gain_db=round(g, 2), lufs=round(lu, 2), tp_48k=round(true_peak(y), 2), tp_mp3=round(tpm, 2),
                     limiter_gr_p95=round(float(np.percentile(grl, 95)), 2), limiter_gr_p99=round(float(np.percentile(grl, 99)), 2),
                     limiter_gr_max=round(float(grl.max()), 2), limiter_gr_anteil_ueber_0_5dB=round(float(np.mean(grl > 0.5) * 100), 2))
np.save(B + 'master_v12_48k.npy', y.astype(np.float32))
y44 = resample_poly(y, 147, 160, axis=0)
tp44 = true_peak(y44)
if tp44 > -1.2: y44 *= undb(-1.2 - tp44)
sf.write(OUTD + 'The-Wall_A_v12.wav', y44, 44100, subtype='PCM_24')
LOG['wav44'] = dict(lufs=round(meter.integrated_loudness(y44) if False else pyln.Meter(44100).integrated_loudness(y44), 2), tp=round(true_peak(y44), 2))
json.dump(LOG, open(B + 'mix_log.json', 'w'), indent=1)
print(json.dumps({k: LOG[k] for k in ('clipper', 'master', 'wav44')}, indent=1))
