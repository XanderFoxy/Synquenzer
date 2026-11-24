# Planung einer Stimme über alle starren Bereiche (gemeinsam für Probe und Bau)
import numpy as np
from tgemein import SR, N
from t_warp import Planer


def plane(x, mk, starr, n_out=N):
    P = Planer(x, mk)
    pos_ist = []
    for r in starr:
        s0 = int(round(r['s0'] * SR)); s1 = int(round(r['s1'] * SR)); t0 = int(round(r['t0'] * SR))
        if s0 < P.cur:           # Quelle schon überschritten (Überlappung): starren Bereich kürzen
            s0 = P.cur
        Lt = t0 - P.ausgabe()
        P.abschnitt(P.cur, s0, Lt, name=r['id'])
        ist0 = P.ausgabe()
        P.kopiere_bis(s1)
        pos_ist.append(dict(id=r['id'], art=r['art'], s0=s0 / SR, t0_soll=t0 / SR, t0_ist=ist0 / SR, fehler_ms=(ist0 - t0) / SR * 1000))
    # Rest: bis Ende kopieren
    rest = n_out - P.ausgabe()
    P.kopiere_bis(min(len(x), P.cur + max(0, rest)))
    return P, pos_ist
