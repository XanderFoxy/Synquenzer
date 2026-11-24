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
