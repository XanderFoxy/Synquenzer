# Diagnose-Bild: V-/H-Hüllen mehrerer Spuren übereinander mit 16tel-Raster und lied.json-Silben
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) + '/pylib')
import numpy as np, matplotlib
matplotlib.use('Agg'); import matplotlib.pyplot as plt
from zk_gemein import *
def bild(t0, t1, spuren, datei, marken=None):
    fig, axs = plt.subplots(len(spuren), 1, figsize=(18, 2.3 * len(spuren)), sharex=True)
    for ax, nm in zip(axs, spuren):
        x = np.asarray(lade(nm)[int((t0 - .2) * SR):int((t1 + .2) * SR)], np.float64)
        V = env_db(bp(x, 120, 1800)); H = env_db(bp(x, 3500, 11000))
        t = t0 - .2 + np.arange(len(V)) / 1000
        ax.plot(t, V, lw=.8, label='V 120-1800'); ax.plot(t, H, lw=.6, label='H 3.5-11k', alpha=.8)
        mx = np.percentile(V, 99.5); ax.set_ylim(mx - 55, mx + 3)
        for k in np.arange(np.ceil(t0 / S16), np.floor(t1 / S16) + 1):
            tt = k * S16
            c = 'k' if abs(tt / 2 - round(tt / 2)) < 1e-6 else ('0.45' if abs(tt / .5 - round(tt / .5)) < 1e-6 else '0.85')
            ax.axvline(tt, color=c, lw=1.2 if c == 'k' else .6, zorder=0)
        if marken and nm in marken:
            for tt, lab in marken[nm]:
                ax.axvline(tt, color='r', lw=.8, ls='--'); ax.text(tt, mx, lab, color='r', fontsize=8)
        ax.set_ylabel(nm); ax.set_xlim(t0, t1)
    axs[0].legend(loc='upper right', fontsize=7)
    plt.tight_layout(); plt.savefig(datei, dpi=65); plt.close()
if __name__ == '__main__':
    t0, t1 = float(sys.argv[1]), float(sys.argv[2]); sp = sys.argv[3].split(',')
    mk = {}
    for s in LIED['silben']:
        for nm in sp:
            tt = s['a_roh'] if nm.endswith('roh') else s['a']
            if t0 <= tt <= t1: mk.setdefault(nm, []).append((tt, s['text']))
    bild(t0, t1, sp, sys.argv[4], mk)
