# The Wall v13 – Reinigung der Hauptstimme (Nachbau von v10 „G1“ + v11-Pausen), in Quellzeit (v7) vor dem Warp.
#   Ereignisse aus lied.json (Aufnahmezeit, aus der v10-Reinigung): Klicks, Plopps, Zischlaute (dB), Atmer.
#   Pausen: wie v12 (= ende): wo ende digital still ist -> stumm; sonst Rauschen -5,5 dB, Atmer -8 dB.
#   Silben-Pegel: Angleichung aus v12 übernommen (ende/v7 je Silbe, Mittelwert 0, höchstens ±6 dB).
import numpy as np, subprocess, os, soundfile as sf
from scipy.signal import butter, sosfiltfilt
from tgemein import *

HOP = 120


def hp(x, f, o=2): return sosfiltfilt(butter(o, f, 'highpass', fs=SR, output='sos'), x)
def lp(x, f, o=4): return sosfiltfilt(butter(o, f, 'lowpass', fs=SR, output='sos'), x)


def rampe(n_ges, bereiche, ramp_s=0.010):
    """Maske 0..1: 1 in den Bereichen [a,b) (Samples), Kosinus-Rampen."""
    m = np.zeros(n_ges); r = int(ramp_s * SR)
    for a, b in bereiche:
        a = max(0, int(a)); b = min(n_ges, int(b))
        if b <= a: continue
        m[a:b] = 1
    if r > 1:
        k = np.hanning(2 * r + 1); k /= k.sum()
        m = np.convolve(m, k, 'same')
    return np.clip(m, 0, 1)


class Zeitbezug:
    """Aufnahmezeit -> v7-Zeit und v7-Zeit -> ende(v12)-Zeit über die Haupt-Anker (stückweise linear)."""
    def __init__(self, H):
        H = sorted(H, key=lambda a: a['t_orig'])
        self.to = np.array([a['t_orig'] for a in H]); self.o7 = np.array([a['src_peak'] - a['t_orig'] for a in H])
        h2 = sorted([a for a in H if a['t_v12'] is not None], key=lambda a: a['src_peak'])
        self.s7 = np.array([a['src_peak'] for a in h2]); self.oe = np.array([a['t_v12'] - a['src_peak'] for a in h2])

    def roh_zu_v7(self, t): return np.asarray(t) + np.interp(t, self.to, self.o7)
    def v7_zu_ende(self, t): return np.asarray(t) + np.interp(t, self.s7, self.oe)


def entklicken(x, ereignisse, zb, log):
    h = hp(x, 4000.0, 4); y = x.copy(); n = 0
    l3 = lp(x, 3000.0)
    for a, b in ereignisse:
        a7, b7 = zb.roh_zu_v7(a), zb.roh_zu_v7(b)
        i0, i1 = int((a7 - 0.010) * SR), int((b7 + 0.010) * SR)
        seg = np.abs(h[i0:i1])
        if len(seg) == 0: continue
        c = i0 + int(np.argmax(seg))
        umg = np.concatenate([h[c - 960:c - 96], h[c + 96:c + 960]])
        rms = np.sqrt(np.mean(umg ** 2) + 1e-14)
        if np.abs(h[c]) / rms < 6.0: continue
        w = max(48, int((b - a) * SR / 2) + 24)            # halbe Ereignislänge + 0,5 ms
        lo, hi_ = c - w, c + w
        r = 24
        m = np.zeros(hi_ - lo + 2 * r); m[r:-r] = 1
        m = np.convolve(m, np.hanning(2 * r + 1) / np.hanning(2 * r + 1).sum(), 'same')
        y[lo - r:hi_ + r] = y[lo - r:hi_ + r] * (1 - m) + l3[lo - r:hi_ + r] * m
        n += 1
    log['klicks_repariert'] = n; log['klicks_ereignisse'] = len(ereignisse)
    return y


def plopps(x, ereignisse, zb, log):
    hx = hp(x, 90.0, 2)
    ber = [(zb.roh_zu_v7(a) * SR - 0.015 * SR, zb.roh_zu_v7(b) * SR + 0.015 * SR) for a, b in ereignisse]
    m = rampe(len(x), ber, 0.005)
    log['plopps'] = len(ereignisse)
    return x * (1 - m) + hx * m


def zischlaute(x, ereignisse, zb, log):
    h = hp(x, 5000.0, 2); y = x.copy()
    for a, b, d in ereignisse:
        a7, b7 = zb.roh_zu_v7(a) - 0.005, zb.roh_zu_v7(b) + 0.005
        m = rampe(len(x), [(a7 * SR, b7 * SR)], 0.005)
        i0, i1 = int((a7 - 0.02) * SR), int((b7 + 0.02) * SR)
        y[i0:i1] = y[i0:i1] - (1 - 10 ** (-d / 20)) * h[i0:i1] * m[i0:i1]
    log['zischlaute'] = len(ereignisse)
    return y


def singen_maske(x, mk, anker, bloecke):
    """Bereiche (Samples), in denen gesungen/gesprochen wird: Anlaut-20 ms bis Ende der Silbe (Pegel fällt 30 dB unter die Spitze
    oder unter -50 dBFS für 30 ms), höchstens bis zum nächsten Anlaut."""
    lvl = mk['lvl']; ber = []
    A = sorted(anker, key=lambda a: a['src_kons'])
    for i, a in enumerate(A):
        k0 = int(a['src_peak'] * SR / HOP)
        nxt = A[i + 1]['src_kons'] if i + 1 < len(A) else a['src_peak'] + 3.0
        kmax = int(nxt * SR / HOP)
        spitze = lvl[k0:k0 + 40].max() if k0 + 40 < len(lvl) else lvl[k0]
        k = k0; leise = 0
        while k < kmax:
            if lvl[k] < max(spitze - 30, -50): leise += 1
            else: leise = 0
            if leise >= 12: k -= 12; break
            k += 1
        ber.append((min(a['src_kons'], a.get('src_kons_zk', a['src_kons'])) * SR - 0.020 * SR, k * HOP + 0.040 * SR))
    for b in bloecke:
        ber.append((b['src_a'] * SR, b['src_b'] * SR))
    # deutlich hörbares Material (> -40 dBFS) gehört immer dazu (Konsonanten-Reste, Ausklang)
    for a_, b_ in _laeufe(lvl > -40.0):
        ber.append((a_ * HOP - 0.020 * SR, b_ * HOP + 0.020 * SR))
    return ber


def pausen_gain(x, mk, anker, bloecke, E, zb, atmer_roh, log, stumm_extra=()):
    """Gain-Kurve (linear) für die Pausen. ende digital still (< -100 dB, 10 ms) -> stumm, sonst -5,5 dB; Atmer -8 dB."""
    n = len(x)
    sing = rampe(n, singen_maske(x, mk, anker, bloecke), 0.008)
    # ende-Stille auf v7-Zeit abbilden (10-ms-Raster)
    hop = 480; nf = n // hop
    t7 = (np.arange(nf) * hop + hop / 2) / SR
    te = zb.v7_zu_ende(t7)
    ie = np.clip((te * SR).astype(int), 0, len(E) - hop)
    c = np.concatenate([[0.], np.cumsum(E.astype(np.float64) ** 2)])
    e_db = 10 * np.log10((c[ie + hop] - c[ie]) / hop + 1e-20)
    stumm = np.repeat(e_db < -100, hop)
    stumm = np.concatenate([stumm, np.zeros(n - len(stumm), bool)])
    atm = rampe(n, [(zb.roh_zu_v7(a) * SR, zb.roh_zu_v7(b) * SR) for a, b in atmer_roh], 0.010)
    g_db = -5.5 * np.ones(n)
    g_db = np.minimum(g_db, -5.5 - 2.5 * atm)                      # Atmer -8 dB
    st = rampe(n, [(i0, i1) for i0, i1 in _laeufe(stumm)] + [(a * SR, b * SR) for a, b in stumm_extra], 0.010)
    g = 10 ** (g_db / 20) * (1 - st)
    g = sing + (1 - sing) * g
    # explizite Stummbereiche gelten auch in der Singen-Maske (z. B. Rest von „open your eyes“ im Zwischenteil)
    if stumm_extra:
        se = rampe(n, [(a * SR, b * SR) for a, b in stumm_extra], 0.010)
        g = g * (1 - se)
    log['pausen'] = dict(anteil_stumm=round(float(np.mean(g < 0.01)), 3), anteil_gedaempft=round(float(np.mean((g < 0.99) & (g >= 0.01))), 3))
    return g


def _laeufe(m):
    d = np.diff(np.concatenate([[0], m.astype(int), [0]]))
    return list(zip(np.where(d == 1)[0], np.where(d == -1)[0]))


def silben_pegel(x, anker, E, log, grenze=6.0):
    """Silben-Pegel aus v12 übernehmen: g_i = (L_ende - L_v7) - Median, auf ±6 dB begrenzt; Übergang 15 ms am Anlaut."""
    def L(sig, t, d=0.2):
        a, b = int((t - 0.05) * SR), int((t + d + 0.05) * SR)
        s = hp(sig[a:b], 120.0, 2)[int(0.05 * SR):-int(0.05 * SR)]
        return 10 * np.log10(np.mean(s * s) + 1e-14)
    A = sorted(anker, key=lambda a: a['src_kons'])
    roh = []
    for a in A:
        if a.get('t_v12') is None: roh.append(None); continue
        roh.append(L(E, a['t_v12']) - L(x, a['src_peak']))
    med = float(np.median([r for r in roh if r is not None]))
    lv7 = np.array([L(x, a['src_peak']) for a in A])
    g = []
    for i, a in enumerate(A):
        if roh[i] is None: g.append(0.0); continue
        g.append(float(np.clip(roh[i] - med, -grenze, grenze)))
    n = len(x); kurve = np.zeros(n)
    for i, a in enumerate(A):
        s0 = int((a['src_kons'] - 0.010) * SR)
        s1 = int((A[i + 1]['src_kons'] - 0.010) * SR) if i + 1 < len(A) else n
        kurve[max(0, s0):s1] = g[i]
    # vor der ersten Silbe: 0
    r = int(0.015 * SR); k = np.hanning(2 * r + 1); k /= k.sum()
    kurve = np.convolve(kurve, k, 'same')
    lv_neu = lv7 + np.array(g)
    log['silben_pegel'] = dict(median_abzug_db=round(med, 2), g_min=round(min(g), 2), g_max=round(max(g), 2),
                               g_abs_median=round(float(np.median(np.abs(g))), 2),
                               streuung_v7_db=round(float(np.std(lv7)), 2), streuung_neu_db=round(float(np.std(lv_neu)), 2))
    return 10 ** (kurve / 20), dict(zip([a['id'] for a in A], g))


def who_r2_tonhoehe(x, a_who, E, log, ST_TMP):
    """v10-07 nachbauen: „Who“ in Refrain 2 erreicht den Ton schneller (wie v12/ende). Tonhöhen-Kurve ende/v7 im Einschwingen
    (Spitze -0,05 … +0,35 s) per rubberband-Pitchmap (R2, Formant erhalten) auf einen Ausschnitt, Rückblende im Vokal."""
    from zk_f0 import yin
    p7 = a_who['src_peak']; pe = a_who['t_v12']
    t0, t1 = p7 - 0.55, p7 + 0.80                 # Ausschnitt beginnt in der Pause davor
    seg = x[int(t0 * SR):int(t1 * SR)].copy()
    _, f7, a7 = yin(x[int((p7 - 0.1) * SR):int((p7 + 0.6) * SR)].astype(np.float64))
    _, fe, ae = yin(E[int((pe - 0.1) * SR):int((pe + 0.6) * SR)].astype(np.float64))
    m = min(len(f7), len(fe)); tt = (np.arange(m) * 240 + 600) / SR - 0.1      # rel. zur Spitze
    ok = (a7[:m] < 0.25) & (ae[:m] < 0.25) & (tt > -0.05) & (tt < 0.35)
    st = np.where(ok, 12 * np.log2(np.maximum(fe[:m], 1) / np.maximum(f7[:m], 1)), 0.0)
    st[np.abs(st) < 0.15] = 0.0
    from scipy.ndimage import median_filter
    st = median_filter(st, 5)
    st = np.convolve(st, np.hanning(7) / np.hanning(7).sum(), 'same')
    if np.max(np.abs(st)) < 0.3:
        log['who_r2'] = 'kein Unterschied gefunden'; return x
    # Pitchmap in Ausschnitt-Samples
    fr = ((p7 + tt) - t0) * SR
    pm = ST_TMP + 'who_pm.txt'
    with open(pm, 'w') as f:
        f.write('0 0.0000\n')
        for q in range(m):
            if 0 < fr[q] < len(seg): f.write('%d %.4f\n' % (int(fr[q]), st[q]))
    fi = ST_TMP + 'who_in.wav'; fo = ST_TMP + 'who_out.wav'
    sf.write(fi, seg.astype(np.float32), SR, subtype='FLOAT')
    subprocess.run(['rubberband', '-2', '-F', '--pitchmap', pm, fi, fo], check=True, capture_output=True)
    y, _ = sf.read(fo, dtype='float64')
    # Latenz/Lage: Korrelation im unveränderten Teil nach der Korrektur (Spitze +0,40 … +0,70 s)
    a0 = int((p7 + 0.40 - t0) * SR); a1 = int((p7 + 0.70 - t0) * SR)
    ref = seg[a0:a1]
    best = max(range(-2400, 2401, 1), key=lambda L: float(np.dot(ref, y[a0 + L:a1 + L])) if 0 <= a0 + L and a1 + L <= len(y) else -1e9)
    y = np.roll(y, -best)[:len(seg)]
    # Einblenden in der Pause davor (20 ms), Rückblende im Vokal nach der Korrektur (+0,45 s, 30 ms, am Nulldurchgang)
    n = len(seg); m_ = np.zeros(n)
    e0 = int((p7 - 0.35 - t0) * SR); e1 = int((p7 + 0.45 - t0) * SR)
    z = e1 + int(np.argmax((seg[e1:e1 + 480][:-1] <= 0) & (seg[e1:e1 + 480][1:] > 0)))
    r1 = int(0.020 * SR); r2 = int(0.030 * SR)
    m_[e0:z] = 1
    m_[e0:e0 + r1] = 0.5 - 0.5 * np.cos(np.pi * np.arange(r1) / r1)
    m_[z - r2:z] = 0.5 + 0.5 * np.cos(np.pi * np.arange(r2) / r2)
    korr = float(np.dot(seg[z - r2:z], y[z - r2:z]) / np.sqrt(np.dot(seg[z - r2:z], seg[z - r2:z]) * np.dot(y[z - r2:z], y[z - r2:z]) + 1e-18))
    out = x.copy(); i0 = int(t0 * SR)
    out[i0:i0 + n] = seg * (1 - m_) + y * m_
    log['who_r2'] = dict(max_halbton=round(float(np.max(st)), 2), latenz_samples=int(best), korrelation_rueckblende=round(korr, 3),
                         bereich=[round(p7 - 0.05, 3), round(p7 + 0.35, 3)])
    for f_ in (pm, fi, fo):
        try: os.remove(f_)
        except OSError: pass
    return out


def spitzen_weich(x, akt_db=None, ueber=12.0, knie=3.0, att_ms=1.0, rel_ms=60.0, vorlauf_ms=1.0):
    """Weicher Spitzenbegrenzer: 1-ms-Spitzenhülle, Schwelle = aktiver RMS-Pegel + 12 dB, weiches Knie 3 dB, Vorlauf 1 ms."""
    n = len(x)
    if akt_db is None:
        r = rms_frames(x, 480, 480); akt = r > np.percentile(r, 99.5) - 30
        akt_db = 10 * np.log10(np.mean(10 ** (r[akt] / 10)))
    T = akt_db + ueber
    w = int(0.001 * SR)
    from scipy.ndimage import maximum_filter1d
    env = maximum_filter1d(np.abs(x), w)
    e_db = 20 * np.log10(env + 1e-12)
    ueb = e_db - T
    gr = np.where(ueb <= -knie / 2, 0.0, np.where(ueb >= knie / 2, ueb, (ueb + knie / 2) ** 2 / (2 * knie)))
    # Glättung: schneller Angriff, langsames Loslassen (im dB-Bereich)
    a = np.exp(-1 / (att_ms * SR / 1000)); rl = np.exp(-1 / (rel_ms * SR / 1000))
    from scipy.signal import lfilter
    # einfache Spitzen-Halte-Glättung: erst Release-Filter auf max, dann kurzer Angriff
    g = np.zeros(n); s = 0.0
    # vektorisiert in Blöcken ist aufwendig; Schleife über reduzierte Auflösung (0,25 ms)
    st = 12; grd = gr[::st].copy()
    out_ = np.zeros_like(grd); s = 0.0
    a2 = np.exp(-st / (att_ms * SR / 1000)); r2 = np.exp(-st / (rel_ms * SR / 1000))
    for i, v in enumerate(grd):
        s = a2 * s + (1 - a2) * v if v > s else r2 * s + (1 - r2) * v
        out_[i] = s
    g = np.interp(np.arange(n), np.arange(len(out_)) * st, out_)
    g = np.roll(g, -int(vorlauf_ms * SR / 1000))
    y = x * 10 ** (-g / 20)
    info = dict(schwelle_db=round(T, 2), aktiv_db=round(akt_db, 2), anteil_ueber_1db=round(float(np.mean(g > 1.0)), 5),
                max_db=round(float(g.max()), 2))
    return y, info
