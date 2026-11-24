# The Wall v13 – Silben-Warp ohne Phasenvocoder.
# Prinzip: Die Ausgabe besteht nur aus Original-Abtastwerten der Quelle („Stücke“). Zwischen zwei Stücken liegt eine kurze
# Kosinus-Blende. Gedehnt/gestaucht wird ausschließlich
#   - in stimmhaften, stabilen Vokal-/Halteteilen: ganze Grundperioden wiederholen bzw. auslassen (Sprung an einen
#     Nulldurchgang, Sprungweite per Korrelation auf die Periode abgestimmt, Blende 8–16 ms), und
#   - in Pausen/Verschlüssen: Stille verlängern/kürzen.
# Anlaut (Konsonant bis Transienten-Spitze + 30 ms Anschlag) und alle stimmlosen Teile werden nur verschoben (bitgleich).
import numpy as np

SR = 48000
HOP = 120            # 2,5 ms Merkmalsraster
ATT = 0.030          # starrer Anschlag nach der Spitze (s)
MAX_DEHN, MIN_DEHN = 1.25, 0.80


def merkmale(x, hop=HOP, win=1200, fmin=75., fmax=650.):
    """Je 2,5 ms: Pegel (dBFS, 10 ms), Periodizität r (normierte AKF-Spitze, 25 ms), Periode (Samples)."""
    n = len(x) // hop
    c = np.concatenate([[0.], np.cumsum(x * x)])
    i = np.arange(n) * hop + hop // 2
    a = np.clip(i - 240, 0, len(x)); b = np.clip(i + 240, 0, len(x))
    lvl = 10 * np.log10((c[b] - c[a]) / np.maximum(1, b - a) + 1e-14)
    lo = int(SR / fmax); hi = int(SR / fmin)
    r = np.zeros(n); per = np.zeros(n)
    nfft = 1 << int(np.ceil(np.log2(2 * (win + hi))))
    blk = 2000
    xp = np.concatenate([np.zeros(win // 2), x, np.zeros(win + hi)])
    for s in range(0, n, blk):
        e = min(n, s + blk)
        idx = (np.arange(s, e) * hop + hop // 2)[:, None] + np.arange(win + hi)[None, :]
        F = xp[idx]
        A = np.fft.rfft(F[:, :win], nfft, axis=1); B = np.fft.rfft(F, nfft, axis=1)
        cc = np.fft.irfft(np.conj(A) * B, nfft, axis=1)[:, lo:hi]
        e0 = (F[:, :win] ** 2).sum(1)[:, None]
        cs = np.concatenate([np.zeros((e - s, 1)), np.cumsum(F * F, 1)], 1)
        L = np.arange(lo, hi)
        el = cs[:, L + win] - cs[:, L]
        rr = cc / np.sqrt(e0 * el + 1e-12)
        k = rr.argmax(1)
        r[s:e] = rr[np.arange(e - s), k]; per[s:e] = k + lo
    return dict(lvl=lvl, r=r, per=per, hop=hop)


def laeufe(maske):
    """[(start, ende)] zusammenhängender True-Bereiche (Rahmenindizes, ende exklusiv)."""
    m = np.concatenate([[False], maske, [False]]).astype(int)
    d = np.diff(m)
    return list(zip(np.where(d == 1)[0], np.where(d == -1)[0]))


class Planer:
    def __init__(self, x, mk, still_db=-62.0, stimm_r=0.85, stimm_db=-45.0):
        self.x = x; self.mk = mk
        self.still = mk['lvl'] < still_db
        self.stimm = (mk['r'] >= stimm_r) & (mk['lvl'] >= stimm_db)
        self.stimm2 = (mk['r'] >= 0.70) & (mk['lvl'] >= stimm_db - 6)
        self.stuecke = []        # (a, b, blende) in Quell-Samples
        self.cur = 0             # aktuelle Leseposition (Quelle)
        self.log = []

    # ---------- Grundoperationen ----------
    def kopiere_bis(self, p):
        p = int(p)
        if p <= self.cur: return
        if self.stuecke and self.stuecke[-1][1] == self.cur:
            a, b, X = self.stuecke[-1]; self.stuecke[-1] = (a, p, X)
        else:
            self.stuecke.append((self.cur, p, 0))
        self.cur = p

    def springe(self, p, ziel, X):
        """bis p kopieren, dann mit Blende X an Quellposition ziel weiterlesen."""
        self.kopiere_bis(p)
        self.stuecke.append((int(ziel), int(ziel), int(X)))
        self.cur = int(ziel)

    def periode(self, p):
        k = int(p // HOP)
        k0, k1 = max(0, k - 4), min(len(self.mk['per']), k + 5)
        return float(np.median(self.mk['per'][k0:k1]))

    def nulldurchgang(self, p, such=48):
        x = self.x
        seg = x[p - such:p + such]
        z = np.where((seg[:-1] <= 0) & (seg[1:] > 0))[0]
        if len(z) == 0: return p
        return p - such + int(z[np.argmin(np.abs(z - such))]) + 1

    def bester_sprung(self, p, wunsch, richtung, lo_lim, hi_lim):
        """Sprungweite (Samples) nahe wunsch mit bester Wellenform-Übereinstimmung.
        richtung -1: zurück (verlängern), +1: vor (kürzen). Gibt (lag, korr, X)."""
        P = self.periode(p)
        X = int(np.clip(2 * P, 0.008 * SR, 0.016 * SR))
        lo = int(max(0.5 * P, wunsch - 0.6 * P, lo_lim)); hi = int(min(wunsch + 0.6 * P, hi_lim))
        if hi < lo: return None
        x = self.x
        tpl = x[p - X // 2:p + X]
        if richtung < 0:
            reg = x[p - hi - X // 2:p - lo + X]                    # Kandidaten q = p - lag
            if p - hi - X // 2 < 0: return None
            cc = np.correlate(reg, tpl, 'valid')                   # Index j -> q = p - hi + j
            e = np.convolve(reg ** 2, np.ones(len(tpl)), 'valid')
            lags = hi - np.arange(len(cc))
        else:
            reg = x[p + lo - X // 2:p + hi + X]
            cc = np.correlate(reg, tpl, 'valid')
            e = np.convolve(reg ** 2, np.ones(len(tpl)), 'valid')
            lags = lo + np.arange(len(cc))
        nk = cc / np.sqrt(e * np.dot(tpl, tpl) + 1e-18)
        straf = 0.15 * np.abs(lags - wunsch) / max(P, 1)
        j = int(np.argmax(nk - straf))
        return int(lags[j]), float(nk[j]), X

    # ---------- Abschnitt planen ----------
    def abschnitt(self, s_a, s_b, Lt, name=''):
        """Quelle [s_a, s_b) soll Ziellänge Lt (Samples) bekommen. Stille zuerst, dann Vokal-Spleiße."""
        s_a, s_b = int(s_a), int(s_b); Ls = s_b - s_a; D = int(round(Lt - Ls))
        info = dict(name=name, s_a=s_a / SR, s_b=s_b / SR, Ls=Ls / SR, Lt=Lt / SR, delta_ms=D / SR * 1000)
        self.kopiere_bis(s_a)
        if abs(D) < 24:          # < 0,5 ms: nur verschieben
            self.kopiere_bis(s_b); info.update(rest_ms=D / SR * 1000, art='schieben'); self.log.append(info); return D
        k_a, k_b = s_a // HOP + 1, s_b // HOP
        # Stille-Läufe (Pausen >= 100 ms, Verschlüsse 40–100 ms)
        st = [(a * HOP + k_a * HOP, b * HOP + k_a * HOP) for a, b in laeufe(self.still[k_a:k_b]) if (b - a) * HOP >= 0.040 * SR]
        # stimmhaft-stabile Läufe (mit 20 ms Rand)
        def vl(mask):
            out = []
            for a, b in laeufe(mask[k_a:k_b]):
                a_ = (a + k_a) * HOP + int(0.020 * SR); b_ = (b + k_a) * HOP - int(0.020 * SR)
                if b_ - a_ >= int(0.050 * SR): out.append((a_, b_))
            return out
        vo = vl(self.stimm)
        rest = D; ops = []        # (art, lauf, betrag)
        pausen = [r for r in st if r[1] - r[0] >= 0.100 * SR]; versch = [r for r in st if r[1] - r[0] < 0.100 * SR]
        # 1) Pausen
        for a, b in sorted(pausen, key=lambda r: -(r[1] - r[0])):
            if rest == 0: break
            cap = (b - a) - int(0.040 * SR) if rest < 0 else 10 ** 9
            d = int(np.sign(rest) * min(abs(rest), cap)); ops.append(('pause', (a, b), d)); rest -= d
        # 2) Vokale (Faktor 0,8–1,25 je Lauf, verteilt nach Länge)
        def vokal(laeufe_):
            nonlocal rest
            if rest == 0 or not laeufe_: return
            tot = sum(b - a for a, b in laeufe_)
            cap = int((MAX_DEHN - 1) * tot) if rest > 0 else int((1 - MIN_DEHN) * tot)
            want = int(np.sign(rest) * min(abs(rest), cap))
            if want == 0: return
            verteilt = 0
            for i, (a, b) in enumerate(laeufe_):
                d = int(round(want * (b - a) / tot)) if i < len(laeufe_) - 1 else want - verteilt
                verteilt += d
                if d: ops.append(('vokal', (a, b), d))
            rest -= want
        vokal(vo)
        # 2b) schwächer stimmhaft (r >= 0,70), wenn noch Rest
        if rest != 0:
            belegt = [r for _, r, _ in ops if _ == 'vokal']
            vo2 = [r for r in vl(self.stimm2) if not any(not (r[1] <= a or r[0] >= b) for a, b in belegt)]
            vokal(vo2)
        # 3) Verschlüsse (±50 %)
        for a, b in versch:
            if rest == 0: break
            cap = int(0.5 * (b - a)); d = int(np.sign(rest) * min(abs(rest), cap))
            if d: ops.append(('verschluss', (a, b), d)); rest -= d
        # Ausführen in Quell-Reihenfolge
        ops.sort(key=lambda o: o[1][0])
        erreicht = 0; faktoren = []
        for art, (a, b), d in ops:
            if art in ('pause', 'verschluss'):
                erreicht += self._stille(a, b, d)
            else:
                got = self._vokal(a, b, d); erreicht += got
                faktoren.append(((b - a) + got) / (b - a))
        # Rundungsrest (Sprungweiten auf Perioden) in einer Pause/Verschluss nachziehen
        nach = D - erreicht
        self.kopiere_bis(s_b)
        info.update(rest_ms=nach / SR * 1000, ops=[(o[0], round(o[1][0] / SR, 3), round(o[1][1] / SR, 3), round(o[2] / SR * 1000, 1)) for o in ops],
                    faktoren=[round(f, 3) for f in faktoren], ungedeckt_ms=round(rest / SR * 1000, 1))
        self.log.append(info)
        return nach

    def _stille(self, a, b, d):
        """d > 0: Stille verlängern (Rauschteppich der Stelle wiederholen), d < 0: kürzen. Blende 5 ms."""
        X = int(0.005 * SR); m = (a + b) // 2
        if d < 0:
            p = max(self.cur, m - (-d) // 2)
            p = max(p, a + X)
            if p - d + X > b: p = b - X + d
            self.springe(p, p - d, X); return d
        got = 0
        while got < d:
            seg = min(d - got, (b - a) - 3 * X)
            if seg <= 0: break
            p = max(self.cur, m)
            self.springe(p, p - seg, X); got += seg
        return got

    def _vokal(self, a, b, d):
        """Perioden wiederholen (d>0) / auslassen (d<0) im Lauf [a,b). Gibt erreichte Längenänderung."""
        L = b - a
        J = int(0.020 * SR)
        n = max(1, int(np.ceil(abs(d) / J)))
        # Abstand der Sprünge mindestens 45 ms (Quelle)
        n = min(n, max(1, int(L / (0.045 * SR))))
        got = 0
        for i in range(n):
            rest_i = d - got
            wunsch = abs(rest_i) / (n - i)
            p0 = a + int((i + 0.5) * L / n)
            p0 = max(p0, self.cur + int(0.004 * SR))
            if p0 >= b: break
            p0 = self.nulldurchgang(p0)
            if d > 0:
                r = self.bester_sprung(p0, wunsch, -1, int(0.6 * self.periode(p0)), min(int(0.040 * SR), p0 - a))
            else:
                r = self.bester_sprung(p0, wunsch, +1, int(0.6 * self.periode(p0)), min(int(0.040 * SR), b - p0 - int(0.016 * SR)))
            if r is None: continue
            lag, korr, X = r
            if korr < 0.6: continue
            if d > 0:
                self.springe(p0, p0 - lag, X); got += lag
            else:
                self.springe(p0, p0 + lag, X); got -= lag
            self.log.append(dict(spleiss=round(p0 / SR, 4), lag_ms=round(lag / SR * 1000, 2), korr=round(korr, 3), blende_ms=round(X / SR * 1000, 1)))
        return got

    def ende(self, s_end):
        self.kopiere_bis(s_end)

    def ausgabe(self):
        return int(sum(b - a for a, b, X in self.stuecke))


def rendern(x, stuecke, n_out):
    out = np.zeros(n_out)
    pos = 0; prev = None
    for k, (a, b, X) in enumerate(stuecke):
        L = b - a
        if L <= 0: continue
        if pos >= n_out: break
        L2 = min(L, n_out - pos)
        if prev is not None and X > 0:
            X2 = min(X, L2)
            w = 0.5 - 0.5 * np.cos(np.pi * (np.arange(X2) + 0.5) / X)
            out[pos:pos + X2] = x[prev:prev + X2] * (1 - w) + x[a:a + X2] * w
            out[pos + X2:pos + L2] = x[a + X2:a + L2]
        else:
            out[pos:pos + L2] = x[a:a + L2]
        pos += L2; prev = b
    return out


def zeitkarte(stuecke):
    """Liste (ziel_start, quell_start, laenge) in Samples – zum Abbilden von Quellzeiten auf Zielzeiten."""
    out = []; pos = 0
    for a, b, X in stuecke:
        if b > a: out.append((pos, a, b - a)); pos += b - a
    return np.array(out, dtype=np.int64)


def quelle_zu_ziel(km, s):
    """Quell-Sample -> Ziel-Sample (erstes Stück, das s enthält; sonst lineare Näherung)."""
    s = np.atleast_1d(np.asarray(s, np.int64)); out = np.full(len(s), -1, np.int64)
    for i, v in enumerate(s):
        m = np.where((km[:, 1] <= v) & (v < km[:, 1] + km[:, 2]))[0]
        if len(m): j = m[0]; out[i] = km[j, 0] + (v - km[j, 1])
        else:
            j = np.searchsorted(km[:, 1], v) - 1; j = max(0, j); out[i] = km[j, 0] + (v - km[j, 1])
    return out


def ziel_zu_quelle(km, t):
    t = np.atleast_1d(np.asarray(t, np.int64))
    j = np.clip(np.searchsorted(km[:, 0], t, side='right') - 1, 0, len(km) - 1)
    return km[j, 1] + (t - km[j, 0])
