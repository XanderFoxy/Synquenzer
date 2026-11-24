# The Wall v13 – Silben-Warp ohne Phasenvocoder.
# Prinzip: Die Ausgabe besteht nur aus Original-Abtastwerten der Quelle („Stücke“). Zwischen zwei Stücken liegt eine kurze
# Kosinus-Blende. Gedehnt/gestaucht wird ausschließlich
#   - in stimmhaften, stabilen Vokal-/Halteteilen: ganze Grundperioden wiederholen bzw. auslassen (Sprung an einem
#     steigenden Nulldurchgang, Sprungweite per Wellenform-Korrelation auf die Periode abgestimmt, Blende 8–16 ms),
#   - in Pausen (Stille verlängern/kürzen) und in Atem-Geräusch (höchstens ±50 %).
# Anlaut (Konsonant bis Transienten-Spitze + Anschlag) und alle stimmlosen Teile werden nur verschoben (bitgleich).
import numpy as np

SR = 48000
HOP = 120            # 2,5 ms Merkmalsraster
ATT = 0.025          # starrer Anschlag nach der Spitze (s)
MAX_DEHN, MIN_DEHN = 1.25, 0.80
RAND = 0.012         # Abstand der Spleiße vom Rand eines Vokal-Laufs (s)


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
    def __init__(self, x, mk, still_db=-62.0, stimm_r=0.75, stimm_db=-48.0):
        self.x = x; self.mk = mk
        lvl, r = mk['lvl'], mk['r']; hf = mk.get('hf', lvl - 20)
        self.still = lvl < still_db
        self.stimm = (r >= stimm_r) & (lvl >= stimm_db)
        # Atem: leises, stimmloses, nicht zischendes Geräusch
        self.atem = (lvl >= still_db) & (lvl < -42.0) & (r < 0.5) & (hf - lvl < -4.0)
        self.stuecke = []        # (a, b, blende) in Quell-Samples
        self.cur = 0             # aktuelle Leseposition (Quelle)
        self.log = []
        self.spleisse = []

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
        assert p >= self.cur
        self.kopiere_bis(p)
        self.stuecke.append((int(ziel), int(ziel), int(X)))
        self.cur = int(ziel)

    def ausgabe(self):
        return int(sum(b - a for a, b, X in self.stuecke))

    def periode(self, p):
        k = int(p // HOP)
        k0, k1 = max(0, k - 4), min(len(self.mk['per']), k + 5)
        return float(np.median(self.mk['per'][k0:k1]))

    def nulldurchgang(self, p, such=48):
        seg = self.x[p - such:p + such]
        z = np.where((seg[:-1] <= 0) & (seg[1:] > 0))[0]
        if len(z) == 0: return p
        return p - such + int(z[np.argmin(np.abs(z - such))]) + 1

    def sprung_korr(self, p, richtung, lo, hi, X):
        """normierte Korrelation für alle Sprungweiten lo..hi (Vorlage x[p-X/2 : p+X])."""
        x = self.x
        tpl = x[p - X // 2:p + X]
        if richtung < 0:
            a0 = p - hi - X // 2
            if a0 < 0: return None, None
            reg = x[a0:p - lo + X]
            cc = np.correlate(reg, tpl, 'valid'); lags = hi - np.arange(len(cc))
        else:
            reg = x[p + lo - X // 2:p + hi + X]
            cc = np.correlate(reg, tpl, 'valid'); lags = lo + np.arange(len(cc))
        e = np.convolve(reg ** 2, np.ones(len(tpl)), 'valid')
        return lags, cc / np.sqrt(e * np.dot(tpl, tpl) + 1e-18)

    # ---------- Abschnitt planen ----------
    def abschnitt(self, s_a, s_b, Lt, name=''):
        """Quelle [s_a, s_b) soll Ziellänge Lt (Samples) bekommen.
        Reihenfolge: Pausen (Stille), dann Vokal-Läufe (Faktor 0,8–1,25), dann Atem/Verschlüsse (±50 %)."""
        s_a, s_b = int(s_a), int(s_b); Ls = s_b - s_a; D = int(round(Lt - Ls))
        info = dict(name=name, s_a=s_a / SR, s_b=s_b / SR, Ls=Ls / SR, Lt=Lt / SR, delta_ms=D / SR * 1000)
        self.kopiere_bis(s_a)
        if abs(D) < 24 or Ls <= 0:          # < 0,5 ms: nur verschieben
            self.kopiere_bis(s_b); info.update(rest_ms=D / SR * 1000, art='schieben', ops=[], faktoren=[], ungedeckt_ms=round(D / SR * 1000, 1))
            self.log.append(info); return D
        k_a, k_b = (s_a + HOP - 1) // HOP, s_b // HOP
        def runs(mask, min_s, rand=0.0):
            out = []
            for a, b in laeufe(mask[k_a:k_b]):
                a_ = (a + k_a) * HOP + int(rand * SR); b_ = (b + k_a) * HOP - int(rand * SR)
                a_ = max(a_, s_a); b_ = min(b_, s_b)
                if b_ - a_ >= int(min_s * SR): out.append((a_, b_))
            return out
        still = runs(self.still, 0.040)
        pausen = [r for r in still if r[1] - r[0] >= int(0.100 * SR)]
        versch = [r for r in still if r[1] - r[0] < int(0.100 * SR)]
        atem = runs(self.atem, 0.080)
        vo = runs(self.stimm, 0.050, RAND)
        rest = D; plan = []        # [art, (a,b), betrag]
        # 1) Pausen: kürzen bis auf 40 ms, verlängern beliebig
        for a, b in sorted(pausen, key=lambda r: -(r[1] - r[0])):
            if rest == 0: break
            cap = (b - a) - int(0.040 * SR) if rest < 0 else 10 ** 9
            d = int(np.sign(rest) * min(abs(rest), cap))
            if d: plan.append(['pause', (a, b), d]); rest -= d
        # 2) Vokal-Läufe, gemeinsamer Faktor
        if rest != 0 and vo:
            tot = sum(b - a for a, b in vo)
            cap = int((MAX_DEHN - 1) * tot) if rest > 0 else int((1 - MIN_DEHN) * tot)
            want = int(np.sign(rest) * min(abs(rest), cap)); verteilt = 0
            for i, (a, b) in enumerate(vo):
                d = int(round(want * (b - a) / tot)) if i < len(vo) - 1 else want - verteilt
                verteilt += d
                if d: plan.append(['vokal', (a, b), d])
            rest -= want
        # 3) Atem und Verschlüsse (±50 %)
        for a, b in atem + versch:
            if rest == 0: break
            cap = int(0.5 * (b - a)); d = int(np.sign(rest) * min(abs(rest), cap))
            if d: plan.append(['atem' if (a, b) in atem else 'verschluss', (a, b), d]); rest -= d
        ungedeckt = rest
        # Ausführen in Quell-Reihenfolge; Abweichungen der Vokal-Spleiße (Perioden-Raster) in späteren Pausen/Atem nachziehen
        plan.sort(key=lambda o: o[1][0])
        erreicht = 0; geplant = 0; faktoren = []
        for j, (art, (a, b), d) in enumerate(plan):
            if art != 'vokal':
                d_eff = d + (geplant - erreicht)                 # bisherige Abweichung mitnehmen
                lim = (b - a) - int(0.040 * SR) if art == 'pause' else int(0.5 * (b - a))
                if d_eff < 0: d_eff = max(d_eff, -lim)
                elif art != 'pause': d_eff = min(d_eff, lim)
                geplant += d
                erreicht += self._stille(a, b, d_eff)
            else:
                geplant += d
                letzte = not any(o[0] == 'vokal' for o in plan[j + 1:])
                ziel_d = d + (geplant - d - erreicht) if letzte else d
                got = self._vokal(a, b, ziel_d, exakt=letzte)
                erreicht += got
                faktoren.append(((b - a) + got) / (b - a))
        self.kopiere_bis(s_b)
        info.update(rest_ms=(D - erreicht) / SR * 1000, ops=[(o[0], round(o[1][0] / SR, 3), round(o[1][1] / SR, 3), round(o[2] / SR * 1000, 1)) for o in plan],
                    faktoren=[round(f, 3) for f in faktoren], ungedeckt_ms=round(ungedeckt / SR * 1000, 1))
        self.log.append(info)
        return D - erreicht

    def _stille(self, a, b, d):
        """d > 0: Stille/Atem verlängern (Geräusch der Stelle wiederholen), d < 0: kürzen. Blende 5 ms."""
        if d == 0: return 0
        X = int(0.005 * SR); m = (a + b) // 2
        if d < 0:
            d = max(d, -((b - a) - 3 * X))
            if d >= 0: return 0
            p = max(self.cur, m + d // 2, a + X)
            if p - d + X > b: p = b - X + d
            if p < self.cur: return 0
            self.springe(p, p - d, X); return d
        got = 0
        while got < d:
            seg = min(d - got, (b - a) - 3 * X)
            if seg < X: break
            p = max(self.cur, m)
            self.springe(p, p - seg, X); got += seg
        if 0 < d - got < X and got > 0:     # kleiner Rest: letzten Sprung um den Rest vergrößern geht nicht -> eigener kurzer Sprung
            p = max(self.cur, m); self.springe(p, p - (d - got), max(16, (d - got) // 2)); got = d
        return got

    def _vokal(self, a, b, d, exakt=False):
        """Perioden wiederholen (d>0) / auslassen (d<0) im Lauf [a,b). Gibt erreichte Längenänderung zurück."""
        L = b - a
        J = int(0.020 * SR)
        n = max(1, int(np.ceil(abs(d) / J)))
        n = min(n, max(1, int(L / (0.040 * SR))))      # Abstand der Sprünge >= 40 ms
        got = 0
        for i in range(n):
            rest_i = d - got
            if rest_i == 0: break
            wunsch = abs(rest_i) / (n - i)
            p0 = a + int((i + 0.5) * L / n)
            p0 = max(p0, self.cur + int(0.004 * SR))
            if p0 >= b - int(0.004 * SR): break
            p0 = self.nulldurchgang(p0)
            if p0 < self.cur: continue
            P = self.periode(p0)
            X = int(np.clip(2 * P, 0.008 * SR, 0.016 * SR))
            richt = -1 if d > 0 else +1
            hi_lim = min(int(0.045 * SR), (p0 - a) - X // 2) if d > 0 else min(int(0.045 * SR), (b - p0) - X - 8)
            lo = int(max(0.5 * P, wunsch - 0.7 * P)); hi = int(min(wunsch + 0.7 * P, hi_lim))
            if hi < lo: continue
            lags, nk = self.sprung_korr(p0, richt, lo, hi, X)
            if lags is None: continue
            score = nk - 0.15 * np.abs(lags - wunsch) / max(P, 1)
            j = int(np.argmax(score)); lag = int(lags[j]); korr = float(nk[j])
            if exakt and i == n - 1:
                w = int(round(wunsch))
                if lo <= w <= hi:
                    kw = float(nk[np.where(lags == w)[0][0]])
                    if kw >= korr - 0.03 and kw >= 0.8: lag, korr = w, kw
            if korr < 0.6: continue
            if d > 0: self.springe(p0, p0 - lag, X); got += lag
            else: self.springe(p0, p0 + lag, X); got -= lag
            self.spleisse.append(dict(t=round(p0 / SR, 4), lag_ms=round(lag / SR * 1000, 2), korr=round(korr, 3), blende_ms=round(X / SR * 1000, 1),
                                      richtung='wiederholt' if d > 0 else 'ausgelassen'))
        return got

    def ende(self, s_end):
        self.kopiere_bis(s_end)


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
    """Array (ziel_start, quell_start, laenge) in Samples."""
    out = []; pos = 0
    for a, b, X in stuecke:
        if b > a: out.append((pos, a, b - a)); pos += b - a
    return np.array(out, dtype=np.int64)


def quelle_zu_ziel(km, s):
    """Quell-Sample -> Ziel-Sample (erstes Stück, das s enthält; sonst nächstes Stück davor)."""
    s = np.atleast_1d(np.asarray(s, np.int64)); out = np.zeros(len(s), np.int64)
    for i, v in enumerate(s):
        m = np.where((km[:, 1] <= v) & (v < km[:, 1] + km[:, 2]))[0]
        if len(m): j = m[0]
        else:
            j = int(np.argmin(np.where(km[:, 1] <= v, v - km[:, 1], 10 ** 12)))
        out[i] = km[j, 0] + (v - km[j, 1])
    return out


def ziel_zu_quelle(km, t):
    t = np.atleast_1d(np.asarray(t, np.int64))
    j = np.clip(np.searchsorted(km[:, 0], t, side='right') - 1, 0, len(km) - 1)
    return km[j, 1] + (t - km[j, 0])
