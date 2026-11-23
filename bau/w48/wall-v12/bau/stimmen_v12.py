# The Wall v12 – Begleitstimmen rendern
#   Ober-/Unterstimme: feste Versionen (+3/+4/+5, -3/-4 HT) mit rubberband R2 + Formanterhalt (offline, sampelgenau),
#                      dann je Lead-Ton per Maske (12-ms-Blenden) die passende Version
#   Gegengesang/Doppel: kleine Korrekturen je Ton, rubberband R3 ohne Formant (beste Klangtreue), Pitchmap (Zeiten +81 ms ausgeglichen)
# (R3 + Formant macht an manchen Stellen den Klang dumpf: Obertöne -7/-20 dB statt -2/-10 dB, gemessen bei 64,4 s)
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
    subprocess.run(['rubberband'] + args + [fi, fo], check=True, capture_output=True)
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
    # Ober/Unter: Versionen
    for iv in (3, 4, 5):
        rb('lead', lead, 'lead_p%d' % iv, ['-2', '-F', '-p', str(iv)])
        rb('lead', lead, 'lead_p%d_adt' % iv, ['-2', '-F', '-p', '%.2f' % (iv + 0.08)])
    for iv in (3, 4):
        rb('lead', lead, 'lead_m%d' % iv, ['-2', '-F', '-p', str(-iv)])
    g = rb('gegen', gegen, 'gegen_t', ['-3', '--pitchmap', P + 'gegen.txt'])
    rb('gegen_t_src', g, 'gegen_adtL', ['-3', '-p', '0.08'])
    rb('gegen_t_src', g, 'gegen_adtR', ['-3', '-p', '-0.08'])
    rb('doppel', doppel, 'doppel_t', ['-3', '--pitchmap', P + 'doppel.txt'])
