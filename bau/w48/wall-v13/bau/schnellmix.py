# Schnelle Vorhör-Fassung v13 (Xander: sofort): Musik aus v12, neue Haupt/Doppel mit Original-Cubasis-Kette, Gegengesang nach hinten.
import sys, os, json, subprocess, numpy as np, soundfile as sf
W = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/'
sys.path.insert(0, W + 'wall-v12/bau'); from dsp import *
sys.path.insert(0, W + 'wall-v13/bau'); import echo_cubasis as ec
import pyloudnorm as pyln
N = 266 * SR; S12 = W + 'wall-v12/bau/stems_v12/'; OUT = W + 'wall-v13/out/vorhoer/'
def st(n): return sf.read(S12 + n + '.wav')[0][:N]
mix12 = np.load(W + 'wall-v12/bau/mix_vor_master.npy').astype(np.float64)[:N]
gs = st('gesang_summe'); musik = mix12 - gs
k = undb(json.load(open(W + 'wall-v12/bau/mix_log.json'))['gesang_angleich_db'])
chor = st('chor') * k; gegen = st('gegengesang') * k; lead12 = st('lead') * k; dop12 = st('doppel') * k
meter = pyln.Meter(SR)
AKT = [(32, 64), (64, 96), (96, 128), (128, 160), (224, 256)]
def lu(x): return meter.integrated_loudness(np.concatenate([x[int(a * SR):int(b * SR)] for a, b in AKT], 0))
def stimme(pfad, ref, spur):
    x = sf.read(pfad)[0][:N]; x = x.mean(1) if x.ndim > 1 else x
    x = hp(x, 100.0); x, _ = kompressor(x, -29.0, 2.0, 25.0, 300.0)
    tr, ecco, ha = ec.kette(x, SR, spur=spur)
    g = lu(ref) - lu(tr); return (tr + ecco + ha) * undb(g)
lead = stimme(W + 'wall-v13/bau/stimmen/lead.wav', lead12, 'haupt')
dop = stimme(W + 'wall-v13/bau/stimmen/doppel.wav', dop12, 'doppel')
# Gegengesang nach hinten: −3,5 dB, Präsenz weg (dunkler), mehr Raum
g2 = gegen * undb(-3.5); g2 = 0.55 * g2 + 0.45 * lp(g2, 3000.0)
_, _, gh = ec.kette(g2.mean(1), SR, spur='chor'); g2 = g2 + gh * undb(3.0)
_, _, chh = ec.kette(chor.mean(1), SR, spur='chor'); ch = chor + chh
vox = lead + dop + g2 + ch
mix = musik + vox
dec = -1.55; g = 0.0
for it in range(5):
    y, _ = limiter(mix * undb(g), dec, 5.0, 25.0); g += -10.0 - meter.integrated_loudness(y)
y, _ = limiter(mix * undb(g), dec, 5.0, 25.0)
w = W + 'wall-v13/bau/tmp/v13_vorhoer.wav'; sf.write(w, y.astype(np.float32), SR, subtype='FLOAT')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', w, '-c:a', 'libmp3lame', '-b:a', '320k', OUT + 'The-Wall_A_v13_Vorhoer.mp3'], check=True)
print('LUFS', round(meter.integrated_loudness(y), 2), 'TP', round(true_peak(y), 2))
