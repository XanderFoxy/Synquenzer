# The Wall v13 – Anker (Quelle) und Ziele für Haupt und Doppel.
import json, numpy as np
from tgemein import *
from t_warp import ATT

S16 = 0.125
A2 = json.load(open(TC + 'anker2.json'))          # aus t2_anker.py (Hüllkurven-Ausrichtung)
ZKH = {s['id']: s for s in ZK['silben'] if s['stimme'] == 'haupt'}
ZKD = {s['id']: s for s in ZK['silben'] if s['stimme'] == 'doppel'}

# ---- Haupt: Korrekturen der Quell-Anker nach Sichtprüfung (tcache/bild/*_z.png) ----
# tised: Hüllkurven-Korrelation nur 0,64 (s in v7 gekürzt) -> Vokal-Einsatz in v7 von Hand: steilster Anstieg 115,975, s ab 115,948
# it (Z11): Korrelation 0,80 bei -39 ms passt nicht zum Bild (Senke/Anstieg wie E5 um ~-5 ms)
H_HAND = {'H-066': dict(q_spitze=115.975, q_kons=115.948), 'H-069': dict(off=-0.005)}

# ---- Haupt: Ziel-Änderungen gegenüber der Zielkarte (Begründung in timing_mess.md) ----
#   ti: Zielkarte 26 (115,250). 26 verlangt no->ti 0,71x und ti->sed 1,39x (außerhalb 0,8–1,25). Xanders Ausnahme-Regel
#       („wenn mehr Silben da sind … im Ursprung lassen … nichts künstlich stretchen“): ti bleibt an seinem Ursprung
#       (Original 115,352 = 16tel 26,8) und kommt aufs nächste 16tel 27 = 115,375.
H_ZIEL = {'H-065b': 115.375}


def haupt_anker():
    out = []
    for k, e in A2.items():
        if e['stimme'] != 'haupt': continue
        z = ZKH[k]
        if k in H_HAND and 'q_spitze' in H_HAND[k]:
            sp, ko = H_HAND[k]['q_spitze'], H_HAND[k]['q_kons']; herkunft = 'Sichtprüfung'
        else:
            off = H_HAND.get(k, {}).get('off', e['off'])
            sp, ko = z['t_orig'] + off, z['konsonant_s'] + off; herkunft = 'Hüllkurve E5/v7 (r=%.2f)' % e['corr'] if k not in H_HAND else 'Sichtprüfung'
        ziel = H_ZIEL.get(k, z['ziel_t'])
        out.append(dict(id=k, text=z['text'], teil=z['teil'], zeile=z['zeile'], src_peak=sp, src_kons=min(ko, sp - 0.004), tgt_peak=ziel,
                        ziel_zk=z['ziel_t'], t_orig=z['t_orig'], t_v12=z['t_v12'], herkunft=herkunft, art='silbe'))
    out.sort(key=lambda a: a['src_peak'])
    return out


def sprech_bloecke(x_src, ref, versatz_such=0.08):
    """Gesprochene Zwischenteil-Wörter: als starre Blöcke an ihrer v12-Lage (= Aufnahmezeit) lassen."""
    from t2_hilfe import ausrichten
    sil = LIED['silben']; gr = [(106, 109), (112, 117), (120, 123), (126, 129)]
    out = []
    for a, b in gr:
        t0 = sil[a]['a_roh'] - 0.05; t1 = sil[b]['b_roh'] + 0.05
        L, c, _, _ = ausrichten(ref, x_src, t0, t1, 0.0, versatz_such)
        out.append(dict(id='sprech-%d' % a, text=' '.join(s['text'] for s in sil[a:b + 1]), src_a=t0 + L, src_b=t1 + L, tgt_a=t0, corr=round(c, 3), off=L))
    return out


def doppel_anker(H):
    """Doppel-Quellanker (doppel_t) und Ziele = Haupt-Ziel + 10 ms."""
    Hd = {h['id']: h for h in H}
    out = []; tab = []
    for k, e in A2.items():
        if e['stimme'] != 'doppel': continue
        hid = 'H-' + k[2:]; h = Hd[hid]; z = ZKD[k]
        # A: direkt an der Haupt ausgerichtet (beide trocken)
        gg_ok = e.get('gg_haupt_corr', -1) >= 0.80
        srcA = h['src_peak'] + e['gg_haupt_off'] - (A2[hid]['q_spitze'] - h['src_peak']) * 0  # gg bezieht sich auf die Haupt-Quellspitze
        # (gg wurde um die gemessene Haupt-Quellspitze ausgerichtet; bei Hand-Korrektur gleiche Silbe -> Versatz bleibt)
        shiftA = (h['tgt_peak'] + 0.010) - srcA
        # B: Doppel-Rohaufnahme -> doppel_t, Ziel der Zielkarte
        b_ok = e['corr'] >= 0.80
        srcB = e['q_spitze']; shiftB = (z['ziel_t'] + 0.010) - srcB
        wahl = None
        if gg_ok and b_ok:
            wahl = 'A' if abs(shiftA - shiftB) <= 0.025 or e['gg_haupt_corr'] >= e['corr'] else 'B'
        elif gg_ok: wahl = 'A'
        elif b_ok: wahl = 'B'
        tab.append((k, z['text'], round(shiftA * 1000), round(shiftB * 1000), e.get('gg_haupt_corr'), e['corr'], wahl))
        if wahl is None: continue
        if wahl == 'A':
            sp = srcA; tgt = h['tgt_peak'] + 0.010
            ko = e['q_kons'] if e['q_kons'] < sp - 0.004 else sp - (h['src_peak'] - h['src_kons'])
        else:
            sp = srcB; tgt = z['ziel_t'] + 0.010; ko = e['q_kons']
        out.append(dict(id=k, text=z['text'], teil=z['teil'], src_peak=sp, src_kons=min(ko, sp - 0.004), tgt_peak=tgt, wahl=wahl,
                        shiftA=shiftA, shiftB=shiftB, art='silbe', haupt_ziel=h['tgt_peak']))
    out.sort(key=lambda a: a['src_peak'])
    return out, tab


def starr_liste(anker, bloecke=()):
    """Starre Bereiche (Quelle s0..s1 -> Ziel t0) in Quell-Reihenfolge, ohne Überlappung."""
    st = []
    for a in anker:
        st.append(dict(id=a['id'], s0=a['src_kons'], s1=a['src_peak'] + ATT, t0=a['tgt_peak'] - (a['src_peak'] - a['src_kons']), art='silbe'))
    for b in bloecke:
        st.append(dict(id=b['id'], s0=b['src_a'], s1=b['src_b'], t0=b['tgt_a'], art='block'))
    st.sort(key=lambda r: r['s0'])
    # Überlappungen: Block hat Vorrang, Silben dazwischen kürzen
    for i in range(len(st) - 1):
        if st[i]['s1'] > st[i + 1]['s0']:
            st[i]['s1'] = st[i + 1]['s0']
    return [r for r in st if r['s1'] > r['s0']]
