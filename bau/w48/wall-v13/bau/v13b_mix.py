# The Wall v13b – Mix wie schnellmix.py (Musik aus v12, Haupt/Doppel v13b mit Original-Cubasis-Kette,
# Gegengesang wie im v13-Vorhör, Chor wie v12/Vorhör), Master −10 LUFS, TP ≤ −1,0 dBTP; Proben; Cubasis-Projekt.
import sys, os, json, subprocess, numpy as np, soundfile as sf
W = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/'
sys.path.insert(0, W + 'wall-v12/bau'); from dsp import *
sys.path.insert(0, W + 'wall-v13/bau'); import echo_cubasis as ec
import pyloudnorm as pyln
N = 266 * SR; S12 = W + 'wall-v12/bau/stems_v12/'; OUT = W + 'wall-v13/out/v13b/'; os.makedirs(OUT, exist_ok=True)
SB = W + 'wall-v13/bau/stimmen_v13b/'; TMP = W + 'wall-v13/bau/tmp/'; os.makedirs(TMP, exist_ok=True)
LOG = json.load(open(SB + 'stimmen_log.json'))
def st(n): return sf.read(S12 + n + '.wav')[0][:N]
mix12 = np.load(W + 'wall-v12/bau/mix_vor_master.npy').astype(np.float64)[:N]
gs = st('gesang_summe'); musik = mix12 - gs; del mix12, gs
k = undb(json.load(open(W + 'wall-v12/bau/mix_log.json'))['gesang_angleich_db'])
chor = st('chor') * k; gegen = st('gegengesang') * k; lead12 = st('lead') * k; dop12 = st('doppel') * k
meter = pyln.Meter(SR)
AKT = [(32, 64), (64, 96), (96, 128), (128, 160), (224, 256)]
def lu(x): return meter.integrated_loudness(np.concatenate([x[int(a * SR):int(b * SR)] for a, b in AKT], 0))
def stimme(pfad, ref, spur):
    x = sf.read(pfad)[0][:N]; x = x.mean(1) if x.ndim > 1 else x
    x = hp(x, 100.0); x, _ = kompressor(x, -29.0, 2.0, 25.0, 300.0)
    tr, ecco, ha = ec.kette(x, SR, spur=spur)
    g = lu(ref) - lu(tr); return (tr + ecco + ha) * undb(g), g
lead, gl = stimme(SB + 'haupt_v13b.wav', lead12, 'haupt')
dop, gd = stimme(SB + 'doppel_v13b.wav', dop12, 'doppel')
LOG['mix'] = dict(haupt_gain_db=round(gl, 2), doppel_gain_db=round(gd, 2))
# Gegengesang wie im v13-Vorhör (unverändert aus schnellmix.py)
g2 = gegen * undb(-3.5); g2 = 0.55 * g2 + 0.45 * lp(g2, 3000.0)
_, _, gh = ec.kette(g2.mean(1), SR, spur='chor'); g2 = g2 + gh * undb(3.0)
_, _, chh = ec.kette(chor.mean(1), SR, spur='chor'); ch = chor + chh
vox = lead + dop + g2 + ch
mix = musik + vox
del lead, dop, g2, ch, gh, chh, chor, gegen, lead12, dop12, musik
dec = -1.55
for runde in range(4):
    g = 0.0
    for it in range(5):
        y, _ = limiter(mix * undb(g), dec, 5.0, 25.0); g += -10.0 - meter.integrated_loudness(y)
    y, grl = limiter(mix * undb(g), dec, 5.0, 25.0)
    y44 = resample_poly(y, 147, 160, axis=0)
    tp44 = true_peak(y44)
    if tp44 > -1.1: y44 *= undb(-1.1 - tp44)
    wav = OUT + 'The-Wall_A_v13b.wav'; mp3 = OUT + 'The-Wall_A_v13b.mp3'
    sf.write(wav, y44, 44100, subtype='PCM_24')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', wav, '-c:a', 'libmp3lame', '-b:a', '320k', mp3], check=True)
    b = subprocess.run(['ffmpeg', '-v', 'error', '-i', mp3, '-f', 'f32le', '-ac', '2', '-ar', '44100', '-'], capture_output=True).stdout
    m3 = np.frombuffer(b, dtype=np.float32).reshape(-1, 2).astype(np.float64)
    # true_peak aus dsp arbeitet mit 4x-Überabtastung, unabhängig von der Rate
    tpm = true_peak(m3)
    w44 = sf.read(wav)[0]
    print('Decke %.2f: LUFS48 %.2f TP48 %.2f | WAV44 LUFS %.2f TP %.2f | MP3 TP %.2f' % (
        dec, meter.integrated_loudness(y), true_peak(y), pyln.Meter(44100).integrated_loudness(w44), true_peak(w44), tpm), flush=True)
    if tpm <= -1.0 and true_peak(w44) <= -1.0: break
    dec -= (tpm + 1.05)
LOG['master'] = dict(decke_dbtp=round(dec, 2), gain_db=round(g, 2), lufs_48k=round(meter.integrated_loudness(y), 2),
                     wav44_lufs=round(pyln.Meter(44100).integrated_loudness(w44), 2), wav44_tp=round(true_peak(w44), 2),
                     mp3_tp=round(tpm, 2), mp3_lufs=round(pyln.Meter(44100).integrated_loudness(m3), 2),
                     limiter_gr_p99=round(float(np.percentile(grl, 99)), 2), limiter_gr_max=round(float(grl.max()), 2))
np.save(TMP + 'v13b_master48.npy', y.astype(np.float32))
# Proben (48 kHz / 24 bit wie die v13-Proben)
for nm, a, b in [('probe_hypnotized_v13b', 111.5, 117.5), ('probe_strophe1_v13b', 30.0, 42.0)]:
    sf.write(OUT + nm + '.wav', y[int(a * SR):int(b * SR)], SR, subtype='PCM_24')
# Strophe-1-Beleg im Mix: Lage gegen v12-Master (Hüllkurven-Korrelation 30–42 s)
v12m = np.load(W + 'wall-v12/bau/master_v12_48k.npy').astype(np.float64)
def hk(x):
    v = bp_zp(x.mean(1), 300.0, 3000.0); e = np.sqrt(np.convolve(v ** 2, np.ones(96) / 96, 'same'))[::48]; return e - e.mean()
a_, b_ = hk(y[30 * SR:42 * SR]), hk(v12m[30 * SR:42 * SR])
c = np.correlate(a_, b_, 'full'); mid = len(b_) - 1; w_ = 50
lag = int(np.argmax(c[mid - w_:mid + w_ + 1]) - w_)
LOG['strophe1_mix_gegen_v12'] = dict(versatz_ms=lag, korrelation=round(float(c[mid + lag] / np.sqrt((a_ ** 2).sum() * (b_ ** 2).sum())), 3))
json.dump(LOG, open(SB + 'mix_log.json', 'w'), indent=1, ensure_ascii=False)
print(json.dumps({k_: LOG[k_] for k_ in ('mix', 'master', 'strophe1_mix_gegen_v12')}, indent=1))
