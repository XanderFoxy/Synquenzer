# Doppel: vier Messungen des Doppel-Ereignisses je Silbe (in doppel_t-Zeit), bezogen auf das Haupt-Ereignis in v7.
import numpy as np
from tgemein import *
from t_plan import A2, ZKH
from zk_kern import nah
from t_onset import onset_versatz


def doppel_messung(H, H7, DT):
    Hd = {h['id']: h for h in H}
    out = {}
    for k, e in A2.items():
        if e['stimme'] != 'doppel': continue
        h = Hd['H-' + k[2:]]; z = ZKH[h['id']]
        ev = z['erster_einsatz_t'] + (h['src_peak'] - z['t_orig']) if h['akzent'] else h['src_peak']
        c = nah(DT, ev, half=0.10, strafe=2.0)
        L, cE, cE2 = onset_versatz(H7, DT, ev)
        out[k] = dict(id=k, text=h['text'], teil=h['teil'], h_ev=ev,
                      C=c['spitze_t'], C_s=c['sicher'], C_rise=c['anstieg_db'], C_kons=c['konsonant_s'],
                      A=(h['src_peak'] + e['gg_haupt_off']) if not h['akzent'] else None, A_c=e.get('gg_haupt_corr'),
                      B=e['q_spitze'], B_c=e['corr'], E=ev + L, E_c=cE, E_c2=cE2, akz=h['akzent'])
    return out


def nachmessen(LH, LD, ereignisse):
    """Doppel minus Haupt (s) je Ereignis in derselben Zeitachse (z. B. beide v13). Drei Messungen: A Hüllkurve (r>=0,75),
    C Einsatz-Detektor (Anstieg >= 6 dB), E Onset-Stärke (r>=0,65, eindeutig). Ergebnis: Median der größten Gruppe (±20 ms)."""
    from t2_hilfe import ausrichten
    out = []
    for k, ev in ereignisse:
        c = nah(LD, ev, half=0.10, strafe=2.0)
        Lo, cE, cE2 = onset_versatz(LH, LD, ev)
        oA, cA, _, _ = ausrichten(LH, LD, ev - 0.10, ev + 0.08, 0.0, 0.12)
        kand = {}
        if cA >= 0.75: kand['A'] = oA
        if c['sicher'] >= 0.8 and c['anstieg_db'] >= 6: kand['C'] = c['spitze_t'] - ev
        if cE >= 0.65 and (np.isnan(cE2) or cE - cE2 >= 0.05): kand['E'] = Lo
        best = []
        for nm, v in kand.items():
            grp = [n2 for n2, v2 in kand.items() if abs(v2 - v) <= 0.020]
            if len(grp) > len(best): best = grp
        off = float(np.median([kand[n] for n in best])) if len(best) >= 2 else None
        out.append(dict(id=k, ev=ev, versatz=off, gruppe=best, n_mess=len(kand), A_r=round(float(cA), 3),
                        messungen={n: round(v * 1000) for n, v in kand.items()}))
    return out
