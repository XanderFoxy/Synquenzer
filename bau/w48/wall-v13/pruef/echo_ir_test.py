# Impulsantwort-Test für bau/echo_cubasis.py: schreibt analyse/ir_*.wav und prüft Zeiten, Pegel, Abklingen, Stereo.
import sys, json, numpy as np, soundfile as sf
W = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v13/'
sys.path.insert(0, W + 'bau')
import echo_cubasis as ec

SR = 48000
T0 = int(0.01 * SR)          # Impuls bei 10 ms
ERG = dict(tests=[], ok=True)


def pruef(name, ist, soll, tol, einheit=''):
    ok = abs(ist - soll) <= tol
    ERG['tests'].append(dict(test=name, ist=round(float(ist), 3), soll=round(float(soll), 3), tol=tol, einheit=einheit, ok=bool(ok)))
    ERG['ok'] &= bool(ok)
    print('%-58s ist %9.3f  soll %9.3f  ±%s %s  %s' % (name, ist, soll, tol, einheit, 'OK' if ok else 'FEHLER'))


def db(v): return 20 * np.log10(max(abs(v), 1e-12))


def erwartete_taps(P, n=12):
    """Analytisches Echo-Muster in Vielfachen der Viertel (relativ zum Direktschall) aus denselben Parametern."""
    a = P['delay']['nass'] / P['delay']['trocken']; fb1 = P['delay']['fb']
    b = P['sdelay']['nass'] / P['sdelay']['trocken']; fb2 = P['sdelay']['fb']
    s = P['send']['pegel']; fbs = P['send']['fb']
    D1 = np.r_[1, [a * fb1 ** (k - 1) for k in range(1, n)]]
    D2 = np.zeros(n); D2[0] = 1
    for k in range(1, n // 2): D2[2 * k] = b * fb2 ** (k - 1)
    S = np.r_[1, [s * fbs ** (k - 1) for k in range(1, n)]]
    return np.convolve(np.convolve(D1, D2)[:n], S)[:n]


# ---------------- 1) Echo-Muster ohne Chorus (Chorus verschmiert den Impuls), Haupt
for spur in ['haupt', 'doppel']:
    P = ec.parameter(spur)
    tr, e, h = ec.impulsantwort(spur, SR, 6.0, mit_chorus=False)
    direkt = tr[T0, 0]
    Q = int(round(P['delay']['zeit'] * SR))
    taps = np.array([e[T0 + k * Q, 0] for k in range(1, 11)]) / direkt
    soll = erwartete_taps(P)[1:11]
    # Lage: Maximum der Echo-Spur um 0,5 s
    fen = e[T0 + Q - 200:T0 + Q + 200, 0]
    lag = (np.argmax(np.abs(fen)) - 200)
    pruef(f'{spur}: 1. Echo Lage (Abweichung von 0,500 s)', lag, 0, 0, 'Samples')
    pruef(f'{spur}: 1. Echo gesamt (Delay + Echo-Bus) rel. Direkt', db(taps[0]), db(soll[0]), 1.0, 'dB')
    pruef(f'{spur}: 2. Echo (Stereo Delay 1/2 + Rest) rel. Direkt', db(taps[1]), db(soll[1]), 1.0, 'dB')
    # nur Insert-Delay (ohne Send, Stereo Delay aus)
    P2 = ec.parameter(spur); P2['sdelay']['an'] = False
    tr2, e2, _ = ec.kette(np.r_[np.zeros(T0), 1.0, np.zeros(SR * 3)], SR, spur, mit_send=False, mit_chorus=False, P=P2)
    d2 = tr2[T0, 0]
    t1 = e2[T0 + Q, 0] / d2; t2 = e2[T0 + 2 * Q, 0] / d2; t3 = e2[T0 + 3 * Q, 0] / d2
    pruef(f'{spur}: Insert-Delay 1. Echo rel. Direkt (Ziel audio-gemessen −16,0)', db(t1), -16.0, 1.0, 'dB')
    pruef(f'{spur}: Insert-Delay Abfall je Echo = 20·log10(0,1506)', db(t2) - db(t1), 20 * np.log10(0.150586), 0.05, 'dB')
    pruef(f'{spur}: Insert-Delay Abfall Echo 2→3', db(t3) - db(t2), 20 * np.log10(0.150586), 0.05, 'dB')
    # nur Stereo Delay
    P3 = ec.parameter(spur); P3['delay']['an'] = False
    tr3, e3, _ = ec.kette(np.r_[np.zeros(T0), 1.0, np.zeros(SR * 3)], SR, spur, mit_send=False, mit_chorus=False, P=P3)
    sdl = e3[T0 + 2 * Q, 0] / tr3[T0, 0]; sdr = e3[T0 + 2 * Q, 1] / tr3[T0, 1]
    pruef(f'{spur}: Stereo Delay links bei 1,000 s rel. Direkt (Ziel −19,0)', db(sdl), -19.0, 1.0, 'dB')
    pruef(f'{spur}: Stereo Delay rechts bei 1,000 s rel. Direkt (Ziel −19,0)', db(sdr), -19.0, 1.0, 'dB')
    pruef(f'{spur}: Stereo Delay kein Echo bei 2,0 s (fb≈0; ≤ −120 dB)', max(db(e3[T0 + 4 * Q, 0] / tr3[T0, 0]), -120.0), -120, 0.5, 'dB')
    # nur Echo-Bus: Abklingen 0,35 je Viertel
    P4 = ec.parameter(spur); P4['delay']['an'] = False; P4['sdelay']['an'] = False
    tr4, e4, h4 = ec.kette(np.r_[np.zeros(T0), 1.0, np.zeros(SR * 4)], SR, spur, mit_chorus=False, P=P4)
    b1 = e4[T0 + Q, 0] / tr4[T0, 0]; b2 = e4[T0 + 2 * Q, 0] / tr4[T0, 0]; b5 = e4[T0 + 5 * Q, 0] / tr4[T0, 0]
    pruef(f'{spur}: Echo-Bus 1. Echo = Send-Pegel −22,22 dB', db(b1), 20 * np.log10(0.07742582), 0.05, 'dB')
    pruef(f'{spur}: Echo-Bus Abfall je Viertel = 20·log10(0,35)', db(b2) - db(b1), 20 * np.log10(0.35), 0.05, 'dB')
    pruef(f'{spur}: Echo-Bus Abfall Echo 1→5 (4 Schritte)', db(b5) - db(b1), 4 * 20 * np.log10(0.35), 0.1, 'dB')
    # Ganze Kette mit Chorus als WAV
    tr, e, h = ec.impulsantwort(spur, SR, 6.0, mit_chorus=True)
    sf.write(W + f'analyse/ir_{spur}.wav', (tr + e + h).astype(np.float32), SR, subtype='FLOAT')
    sf.write(W + f'analyse/ir_{spur}_echo.wav', e.astype(np.float32), SR, subtype='FLOAT')
    sf.write(W + f'analyse/ir_{spur}_hall.wav', h.astype(np.float32), SR, subtype='FLOAT')
    # Hall: Nass-/Trocken-Energie (ohne Echos) = m/(1−m) → −13,3 dB
    P5 = ec.parameter(spur); P5['delay']['an'] = False; P5['sdelay']['an'] = False
    tr5, e5, h5 = ec.kette(np.r_[np.zeros(T0), 1.0, np.zeros(SR * 4)], SR, spur, mit_send=False, mit_chorus=False, P=P5)
    from scipy.signal import butter, sosfiltfilt
    mb = butter(4, [500, 4000], 'bandpass', fs=SR, output='sos')
    ratio = 10 * np.log10(np.sum(sosfiltfilt(mb, h5[:, 0]) ** 2) / np.sum(sosfiltfilt(mb, tr5[:, 0]) ** 2))
    pruef(f'{spur}: RoomWorks Nass/Trocken-Energie 0,5–4 kHz (√-Gesetz, Mix 4,5 %)', ratio, 10 * np.log10(0.045 / 0.955), 0.3, 'dB')
    # Hallzeit aus der Schroeder-Kurve (−5…−35 dB), Band 300–6000 Hz
    from scipy.signal import butter, sosfiltfilt
    hb = sosfiltfilt(butter(4, [300, 6000], 'bandpass', fs=SR, output='sos'), h5[:, 0])
    edc = np.cumsum((hb ** 2)[::-1])[::-1]; edc = 10 * np.log10(edc / edc[0] + 1e-30)
    i5 = np.argmax(edc < -5); i35 = np.argmax(edc < -35)
    rt = (i35 - i5) / SR * 2.0
    pruef(f'{spur}: RoomWorks Hallzeit T30 (Band 0,3–6 kHz)', rt, ec.raum_zeit(ec.ROH['room_hd'][1]), 0.1, 's')

# ---------------- 2) Chor: nur Hall 1,50 s / 12 %
tr, e, h = ec.impulsantwort('chor', SR, 4.0)
pruef('chor: kein Echo (Delay/Stereo Delay/Send aus)', float(np.max(np.abs(e))), 0.0, 1e-12)
from scipy.signal import butter, sosfiltfilt
mb = butter(4, [500, 4000], 'bandpass', fs=SR, output='sos')
ratio = 10 * np.log10(np.sum(sosfiltfilt(mb, h[:, 0]) ** 2) / np.sum(sosfiltfilt(mb, tr[:, 0]) ** 2))
pruef('chor: RoomWorks Nass/Trocken-Energie 0,5–4 kHz (Mix 12 %)', ratio, 10 * np.log10(0.12 / 0.88), 0.3, 'dB')
sf.write(W + 'analyse/ir_chor.wav', (tr + e + h).astype(np.float32), SR, subtype='FLOAT')

# ---------------- 3) Tempo-Synchron: 100 BPM → Viertel 0,600 s, Halbe 1,200 s
P = ec.parameter('haupt', bpm=100.0)
tr, e, h = ec.kette(np.r_[np.zeros(T0), 1.0, np.zeros(SR * 3)], SR, 'haupt', bpm=100.0, mit_chorus=False, P=P)
fen = np.abs(e[:, 0]); i1 = T0 + 200 + np.argmax(fen[T0 + 200:T0 + int(0.8 * SR)])
pruef('Tempo 100 BPM: 1. Echo', (i1 - T0) / SR, 0.6, 1 / SR, 's')
pruef('Tempo 100 BPM: Stereo-Delay-Echo', P['sdelay']['zeit_l'], 1.2, 1e-9, 's')

# ---------------- 4) Summe = Teile (Linearität)
x = np.random.default_rng(3).standard_normal(SR * 3) * 0.1
tr, e, h = ec.kette(x, SR, 'haupt')
tr2, e2, h2 = ec.kette(2 * x, SR, 'haupt')
pruef('Linearität: Kette(2x) − 2·Kette(x)', float(np.max(np.abs((tr2 + e2 + h2) - 2 * (tr + e + h)))), 0.0, 1e-9)

json.dump(ERG, open(W + 'pruef/echo_ir_test.json', 'w'), indent=1, ensure_ascii=False)
print('GESAMT', 'OK' if ERG['ok'] else 'FEHLER')
