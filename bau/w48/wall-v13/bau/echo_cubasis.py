# -*- coding: utf-8 -*-
"""Nachbau der ORIGINAL-Effektkette der Gesangsspuren aus dem Cubasis-Projekt „The Wall“ (v6/v7/v8, bit-gleich).

Kette (Slot-Reihenfolge wie in Cubasis, nur die Zeit-/Raum-Effekte ab Slot 4):
    VOX Haupt / VOX Doppel : Delay (Slot 4) → Stereo Delay (5) → RoomWorks SE (6) → Chorus (7) → Fader → Send 1 (Echo-Bus, −22,2 dB, post-fader)
    VOX Chor 1/2/3, KI     : nur RoomWorks SE (Delay, Stereo Delay, Chorus aus; kein Send)
Slot 0–3 (Channel Strip, StudioEQ, Tune RT aus, Compressor „Vocal 1“) macht der Mix selbst; diese Funktion bekommt das Signal NACH Slot 3.

    kette(x, sr=48000, spur='haupt'|'doppel'|'chor', bpm=120) -> (trocken_bearbeitet, echo_anteil, hall_anteil)
        x: mono (N,) (Stereo wird gemittelt – die Inserts liegen vor dem Pan, also auf der Mono-Spur)
        alle drei Rückgaben: Stereo (N, 2), float64; Summe = komplette Spur nach Inserts + Send-1-Rücklauf
        (Fader/Pan macht der Mix danach; der Send ist post-fader, also gilt das Verhältnis unabhängig vom Fader).
        trocken_bearbeitet = Direktschall nach allen Trocken-Faktoren der Plug-ins (+ Chorus-Anteil des Direktschalls)
        echo_anteil        = Delay- + Stereo-Delay-Echos (durch Hall/Chorus wie im Original) + kompletter Echo-Bus-Rücklauf
        hall_anteil        = RoomWorks-Nassanteil (durch Chorus)

Herkunft der Zahlen: siehe ../analyse/echo.json (cbp-roh | pdf | audio-gemessen | angenommen).
Was nur angenähert ist: RoomWorks-Algorithmus (Rauschfahne statt Steinberg-Algorithmus, Vorverzögerung/Dämpfung angenommen),
Chorus (Rate/Tiefe/Grundverzögerung angenommen), Mischgesetz der Delays (audio-gemessen, nicht aus Cubasis-Doku).
"""
import numpy as np
from scipy.signal import oaconvolve, butter, sosfilt

# ---------------------------------------------------------------- Rohwerte aus der .cbp (v6 = v7 = v8, bit-gleich)
ROH = {
    'delay':  [0.090458, 0.150586, 2.0, 1.0],                       # Mix, Feedback, Notenwert-Index (2 = 1/4), Sync an
    'sdelay': [0.065276, 1.0, 0.65, 1.0, 0.500758, 0.5],            # Mix, Index L (1 = 1/2)?, ?, Index R (1 = 1/2)?, ?, ?
    'room_hd': [0.055, 0.519588, 0.5, 0.624196, 0.0, 0.045, 0.1],   # Vorverz., Zeit (0,1·200^n s), ?, ?, ?, Mix, ?
    'room_ch': [0.055, 0.511115, 0.5, 0.624196, 0.0, 0.12, 0.1],
    'chorus': [0.386513, 0.5, 0.5, 0.2],                            # ?, ?, ?, Mix (vermutet)
    'send_pegel': 0.07742582092504913,                              # OutputLevel Send 1 (linear, −22,22 dB)
    'send_delay': [1.0, 0.35, 2.0, 1.0],                            # Send-1-Bus: Delay 100 % nass, Feedback 0,35, 1/4
}
NOTEN = {0: 1.0, 1: 0.5, 2: 0.25, 3: 0.125}   # Index -> Anteil einer ganzen Note (Index 2 = 1/4 audio-gemessen 0,5000 s)


K_GEMESSEN = 1.75   # nass/trocken ≈ 1,75·m für kleine m (audio-gemessen an original/Gesang-Platzhalter-3 und Doppel-Platzhalter-4)


def mischung(m, gesetz='gemessen'):
    """(trocken, nass) für einen Mix-Rohwert m der Delays/des Chorus.
    'gemessen' (Standard): nass/trocken = 1,75·m (Mitte der Messungen; 1. Echo Delay −16,0 dB, Stereo Delay −18,8 dB),
    'sinus'   = cos/sin(m·π/2)  (Autokorrelation ohne Chorus-Dekorrelation; −16,9 / −19,8 dB),
    'doppelt' = min(1,2(1−m)) / min(1,2m) (PDF-Angabe −15 / −18 dB),
    'wurzel'  = √(1−m)/√m (RoomWorks, PDF BELEGT)."""
    if m >= 0.999:
        return 0.0, 1.0
    if gesetz == 'gemessen':
        d = np.cos(m * np.pi / 2)
        return d, min(1.0, K_GEMESSEN * m * d)
    if gesetz == 'sinus':
        return np.cos(m * np.pi / 2), np.sin(m * np.pi / 2)
    if gesetz == 'doppelt':
        return min(1.0, 2 * (1 - m)), min(1.0, 2 * m)
    if gesetz == 'wurzel':
        return np.sqrt(1 - m), np.sqrt(m)
    if gesetz == 'linear':
        return 1 - m, m
    raise ValueError(gesetz)


def raum_zeit(n):            # RoomWorks SE: Hallzeit = 0,1·200^n s (PDF BELEGT)
    return 0.1 * 200.0 ** n


def parameter(spur='haupt', bpm=120.0, gesetz='gemessen'):
    """Alle Größen der Kette als Zahlen (Sekunden, lineare Faktoren)."""
    viertel = 60.0 / bpm
    spur = {'gegen': 'chor', 'gegengesang': 'chor', 'ki': 'chor', 'lead': 'haupt'}.get(spur, spur)
    P = dict(spur=spur, bpm=bpm, gesetz=gesetz)
    if spur in ('haupt', 'doppel'):
        m, fb, idx, _ = ROH['delay']
        d, w = mischung(m, gesetz)
        P['delay'] = dict(an=True, zeit=NOTEN[int(idx)] * 4 * viertel, fb=fb, trocken=d, nass=w)
        m2 = ROH['sdelay'][0]
        d2, w2 = mischung(m2, gesetz)
        # Zeiten L = R = 1/2 Note: audio-gemessen (nur Echos bei Vielfachen von 0,5 s, L/R gleich stark);
        # Feedback ≈ 0: audio-gemessen (Echo bei 2,0 s passt nur mit fb ≤ 0,05)
        P['sdelay'] = dict(an=True, zeit_l=2 * viertel, zeit_r=2 * viertel, fb=0.0, trocken=d2, nass=w2)
        r = ROH['room_hd']
        P['send'] = dict(an=True, pegel=ROH['send_pegel'], zeit=viertel, fb=ROH['send_delay'][1])
        P['chorus'] = dict(an=True, mix=ROH['chorus'][3])
    elif spur == 'chor':
        P['delay'] = dict(an=False); P['sdelay'] = dict(an=False); P['send'] = dict(an=False); P['chorus'] = dict(an=False)
        r = ROH['room_ch']
    else:
        raise ValueError(spur)
    dr, wr = mischung(r[5], 'wurzel')
    P['room'] = dict(an=True, rt60=raum_zeit(r[1]), mix=r[5], trocken=dr, nass=wr,
                     vorverz=0.020,        # ANGENOMMEN (Rohwert 0,055, Skala unbekannt)
                     hf_faktor=0.55,       # ANGENOMMEN: Hallzeit über 6 kHz ≈ 55 % der Nennzeit
                     lf_faktor=1.0)
    if P['chorus'].get('an'):
        dc, wc = mischung(P['chorus']['mix'], gesetz)
        # ANGENOMMEN: Grundverzögerung 8 ms (Bass-Chorus-Kerbe bei 63 Hz laut PDF), Tiefe ±2 ms, Rate 0,6 Hz,
        # L/R-LFO um 90° versetzt („Spatial“ 0,5)
        P['chorus'].update(trocken=dc, nass=wc, grund=0.008, tiefe=0.002, rate=0.6, phase_lr=np.pi / 2)
    return P


# ---------------------------------------------------------------- Bausteine
def kamm(x, D, fb):
    """Nassanteil eines Delays ohne Trocken: y[n] = x[n−D] + fb·y[n−D] (Echo 1 = 1·x, Echo k = fb^(k−1)·x)."""
    N = len(x)
    nb = -(-N // D) + 1
    X = np.zeros(nb * D); X[:N] = x
    X = X.reshape(nb, D)
    Y = np.zeros_like(X)
    for k in range(1, nb):
        Y[k] = X[k - 1] + fb * Y[k - 1]
    return Y.reshape(-1)[:N]


def verzoegere(x, D):
    y = np.zeros_like(x)
    if D < len(x):
        y[D:] = x[:len(x) - D]
    return y


_IR_CACHE = {}


def hall_ir(sr, rt60, vorverz, hf_faktor=0.55, lf_faktor=1.0, seed=7):
    """Stereo-Impulsantwort (Rauschfahne, je Band eigene Abklingzeit), je Kanal auf Energie 1 normiert.
    ANNÄHERUNG an RoomWorks SE (der Steinberg-Algorithmus ist nicht bekannt)."""
    key = (sr, round(rt60, 4), round(vorverz, 4), hf_faktor, lf_faktor, seed)
    if key in _IR_CACHE:
        return _IR_CACHE[key]
    n = int(sr * (vorverz + rt60 * 1.4))
    t = np.arange(n) / sr
    rng = np.random.default_rng(seed)
    kan = []
    # Bänder: < 300 Hz, 300–6000 Hz, > 6000 Hz mit eigener Abklingzeit
    grenzen = [(None, 300.0, lf_faktor), (300.0, 6000.0, 1.0), (6000.0, None, hf_faktor)]
    for c in range(2):
        z = rng.standard_normal(n)
        h = np.zeros(n)
        for lo, hi, fak in grenzen:
            if lo is None:
                sos = butter(4, hi, 'lowpass', fs=sr, output='sos')
            elif hi is None:
                sos = butter(4, lo, 'highpass', fs=sr, output='sos')
            else:
                sos = butter(4, [lo, hi], 'bandpass', fs=sr, output='sos')
            zb = sosfilt(sos, z)
            tt = np.maximum(t - vorverz, 0)
            hull = np.exp(-6.907755 * tt / (rt60 * fak))      # −60 dB nach rt60·fak
            hull[t < vorverz] = 0.0
            h += zb * hull
        # weicher Einsatz (Diffusion baut sich in ≈ 15 ms auf)
        anf = np.clip((t - vorverz) / 0.015, 0, 1)
        h *= anf
        h /= np.sqrt(np.sum(h * h))
        kan.append(h)
    ir = np.stack(kan, 1)
    _IR_CACHE[key] = ir
    return ir


def chorus_st(x_st, sr, C):
    """Chorus auf Stereo-Signal: trocken·x + nass·x(t − τ(t)), τ = grund + tiefe·sin(2π·rate·t + φ_k). ANNÄHERUNG."""
    N = len(x_st)
    t = np.arange(N) / sr
    out = np.empty_like(x_st)
    for k in range(2):
        tau = C['grund'] + C['tiefe'] * np.sin(2 * np.pi * C['rate'] * t + k * C['phase_lr'])
        pos = np.arange(N) - tau * sr
        i0 = np.floor(pos).astype(np.int64); fr = pos - i0
        i0c = np.clip(i0, 0, N - 1); i1c = np.clip(i0 + 1, 0, N - 1)
        xs = x_st[:, k]
        wet = (1 - fr) * xs[i0c] + fr * xs[i1c]
        wet[pos < 0] = 0.0
        out[:, k] = C['trocken'] * xs + C['nass'] * wet
    return out


# ---------------------------------------------------------------- die Kette
def kette(x, sr=48000, spur='haupt', bpm=120.0, gesetz='gemessen', mit_send=True, mit_chorus=True, P=None):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 2:
        x = x.mean(1)
    P = P or parameter(spur, bpm, gesetz)
    N = len(x)
    # Slot 4: Delay (mono)
    if P['delay']['an']:
        Dd = P['delay']
        D = int(round(Dd['zeit'] * sr))
        a_tr = Dd['trocken'] * x
        a_ec = Dd['nass'] * kamm(x, D, Dd['fb'])
    else:
        a_tr = x.copy(); a_ec = np.zeros(N)
    # Slot 5: Stereo Delay (L = R gemessen) – Trockenzweig wirkt auf Direkt + Echo, Nasszweig auf beide
    if P['sdelay']['an']:
        S = P['sdelay']
        Dl = int(round(S['zeit_l'] * sr)); Dr = int(round(S['zeit_r'] * sr))
        def sd(u):
            L = S['trocken'] * u + S['nass'] * kamm(u, Dl, S['fb'])
            R = S['trocken'] * u + S['nass'] * kamm(u, Dr, S['fb'])
            return np.stack([L, R], 1)
        b_tr = np.stack([S['trocken'] * a_tr] * 2, 1)                       # Direktschall
        b_ec = sd(a_tr) - b_tr + sd(a_ec)                                    # alle Echos
    else:
        b_tr = np.stack([a_tr] * 2, 1); b_ec = np.stack([a_ec] * 2, 1)
    # Slot 6: RoomWorks SE (Eingang mono-summiert, Ausgang Stereo)
    Rm = P['room']
    ir = hall_ir(sr, Rm['rt60'], Rm['vorverz'], Rm['hf_faktor'], Rm['lf_faktor'])
    ein = (b_tr + b_ec).mean(1)
    hall = np.stack([oaconvolve(ein, ir[:, c])[:N] for c in range(2)], 1) * Rm['nass']
    c_tr = b_tr * Rm['trocken']; c_ec = b_ec * Rm['trocken']; c_ha = hall
    # Slot 7: Chorus (linear, je Anteil getrennt)
    if P['chorus'].get('an') and mit_chorus:
        C = P['chorus']
        c_tr = chorus_st(c_tr, sr, C); c_ec = chorus_st(c_ec, sr, C); c_ha = chorus_st(c_ha, sr, C)
    # Send 1 (post-fader, post-insert): Echo-Bus = Delay 100 % nass, 1/4, Feedback 0,35
    if P['send']['an'] and mit_send:
        Sd = P['send']
        D = int(round(Sd['zeit'] * sr))
        summe = c_tr + c_ec + c_ha
        bus = np.stack([kamm(summe[:, c], D, Sd['fb']) for c in range(2)], 1) * Sd['pegel']
        c_ec = c_ec + bus
    return c_tr, c_ec, c_ha


def impulsantwort(spur='haupt', sr=48000, dauer=4.0, bpm=120.0, gesetz='gemessen', mit_chorus=True):
    x = np.zeros(int(sr * dauer)); x[int(0.01 * sr)] = 1.0
    return kette(x, sr, spur, bpm, gesetz, mit_chorus=mit_chorus)


if __name__ == '__main__':
    import json
    print(json.dumps(parameter('haupt'), indent=1, default=float))
