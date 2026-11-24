# Diagnose-Bilder: Hüllen (120–1800 Hz, 3,5–11 kHz) mehrerer Spuren übereinander, 16tel-Raster, Marken.
import sys, os
from tgemein import *
sys.path.insert(0, A13 + 'pylib')
import matplotlib
matplotlib.use('Agg'); import matplotlib.pyplot as plt
from zk_gemein import bp, env_db

S16 = 0.125


def bild(t0, t1, spuren, datei, marken=None, versatz=None, titel=''):
    """spuren: Liste (name, array). versatz: dict name -> s, um den die Spur zur Anzeige verschoben wird."""
    fig, axs = plt.subplots(len(spuren), 1, figsize=(16, 1.9 * len(spuren)), sharex=True)
    if len(spuren) == 1: axs = [axs]
    for ax, (nm, arr) in zip(axs, spuren):
        v = (versatz or {}).get(nm, 0.0)
        a = int((t0 + v - .2) * SR); b = int((t1 + v + .2) * SR)
        x = np.asarray(arr[max(0, a):b], np.float64)
        V = env_db(bp(x, 120, 1800), 5, 1); H = env_db(bp(x, 3500, 11000), 5, 1)
        t = t0 - .2 + np.arange(len(V)) / 1000
        ax.plot(t, V, lw=.8); ax.plot(t, H, lw=.6, alpha=.8)
        mx = np.percentile(V, 99.5); ax.set_ylim(mx - 55, mx + 3)
        for k in np.arange(np.ceil(t0 / S16), np.floor(t1 / S16) + 1):
            tt = k * S16
            c = 'k' if abs(tt / 2 - round(tt / 2)) < 1e-6 else ('0.45' if abs(tt / .5 - round(tt / .5)) < 1e-6 else '0.85')
            ax.axvline(tt, color=c, lw=1.2 if c == 'k' else .6, zorder=0)
        for tt, lab, col in (marken or {}).get(nm, []):
            ax.axvline(tt - v, color=col, lw=.9, ls='--'); ax.text(tt - v, mx - 3, lab, color=col, fontsize=7)
        ax.set_ylabel(nm + ('\n%+.0f ms' % (v * 1000) if v else ''), fontsize=8); ax.set_xlim(t0, t1)
    axs[0].set_title(titel, fontsize=9)
    plt.tight_layout(); plt.savefig(datei, dpi=60); plt.close()
