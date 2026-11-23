# The Wall v12 – Begleitstimmen rendern (rubberband R3, formanterhaltend, Pitchmaps aus noten_v12.py)
import numpy as np, soundfile as sf, subprocess, os
from scipy.signal import correlate, butter, sosfiltfilt
W = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/'
S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall/roh/'
R = W + 'repo/the-wall/'
B = W + 'bau/'; ST = B + 'stimmen/'; os.makedirs(ST, exist_ok=True)
SR = 48000; N = 266 * SR


def lade_wav(p):
    x, sr = sf.read(R + p, dtype='float64'); assert sr == SR
    return x[:N]


def env(x):
    sos = butter(2, [300, 3000], 'bandpass', fs=SR, output='sos'); y = sosfiltfilt(sos, x)
    e = np.sqrt(np.convolve(y ** 2, np.ones(96) / 96, 'same'))
    return e - e.mean()


def ausrichten(src, out):
    """Latenz des Echtzeit-Modus messen (Hüllkurven-Korrelation) und ausgleichen."""
    m = min(len(src), len(out))
    a = env(src[:m])[::4]; b = env(out[:m])[::4]
    c = correlate(b, a, mode='full', method='fft'); mid = len(a) - 1
    w = 2000  # +-2000*4 Samples
    lag = (np.argmax(c[mid - w:mid + w + 1]) - w) * 4
    y = np.zeros(N)
    if lag >= 0: seg = out[lag:lag + N]; y[:len(seg)] = seg
    else: seg = out[:N + lag]; y[-lag:-lag + len(seg)] = seg
    return y, lag


def rb(src_name, x, out_name, args):
    fi = ST + src_name + '.wav'
    if not os.path.exists(fi): sf.write(fi, x.astype(np.float32), SR, subtype='FLOAT')
    fo = ST + out_name + '_roh.wav'
    subprocess.run(['rubberband', '-3', '-F'] + args + [fi, fo], check=True, capture_output=True)
    y, _ = sf.read(fo, dtype='float64')
    y, lag = ausrichten(x, y)
    sf.write(ST + out_name + '.wav', y.astype(np.float32), SR, subtype='FLOAT')
    os.remove(fo)
    print(out_name, 'Latenz ausgeglichen:', lag, 'Samples', flush=True)
    return y


if __name__ == '__main__':
    lead = np.load(S + 'ende.npy').astype(np.float64)[:N]
    gegen = lade_wav('projekt7/Gegengesang-eigen-7.wav')
    doppel = lade_wav('projekt7/Doppel-4-trocken-v7.wav')
    P = B + 'plan/'
    rb('lead', lead, 'ober', ['--pitchmap', P + 'ober.txt'])
    rb('lead', lead, 'ober_adt', ['-p', '0.08', '--pitchmap', P + 'ober.txt'])
    rb('lead', lead, 'unter', ['--pitchmap', P + 'unter.txt'])
    g = rb('gegen', gegen, 'gegen_t', ['--pitchmap', P + 'gegen.txt'])
    rb('gegen_t_src', g, 'gegen_adtL', ['-p', '0.08'])
    rb('gegen_t_src', g, 'gegen_adtR', ['-p', '-0.08'])
    rb('doppel', doppel, 'doppel_t', ['--pitchmap', P + 'doppel.txt'])
