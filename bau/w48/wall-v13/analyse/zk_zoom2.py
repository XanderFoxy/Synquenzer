# Zoom 2: Hüllen V/H + Tonhöhe (Halbtöne) + Stimmhaftigkeit je Spur, 16tel-Raster, Marken
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) + '/pylib')
import numpy as np, matplotlib
matplotlib.use('Agg'); import matplotlib.pyplot as plt
from zk_gemein import *
def zoom2(t0, t1, spuren, datei, marken=None, breite=22):
    fig, axs = plt.subplots(2 * len(spuren), 1, figsize=(breite, 2.6 * len(spuren)), sharex=True)
    for q, nm in enumerate(spuren):
        ax, ax2 = axs[2 * q], axs[2 * q + 1]
        x = np.asarray(lade(nm)[int((t0 - .1) * SR):int((t1 + .1) * SR)], np.float64)
        V = env_db(bp(x, 120, 1800), 8); H = env_db(bp(x, 4000, 10000), 8)
        tt = t0 - .1 + np.arange(len(V)) / 1000
        ax.plot(tt, V, lw=.9, color='C0'); ax.plot(tt, H, lw=.7, color='C1')
        m2 = np.percentile(V, 99.5); ax.set_ylim(m2 - 40, m2 + 3); ax.grid(axis='y', lw=.3)
        z = np.load(CACHE + 'f0_%s.npz' % nm); m = (z['t'] >= t0) & (z['t'] <= t1)
        st = 12 * np.log2(np.maximum(z['f0'][m], 1) / 155.56)   # 0 = Eb3
        ok = z['ap'][m] < 0.25
        ax2.scatter(z['t'][m][ok], st[ok], s=2, c='C2'); ax2.scatter(z['t'][m][~ok], np.clip(st[~ok], -6, 20), s=1, c='0.8')
        ax2.set_ylim(-5, 17); ax2.set_yticks(range(-5, 18, 2)); ax2.grid(axis='y', lw=.3)
        for a in (ax, ax2):
            for kk in np.arange(np.ceil(t0 / S16), np.floor(t1 / S16) + 1):
                t = kk * S16
                c = 'k' if abs(t / 2 - round(t / 2)) < 1e-6 else ('0.45' if abs(t / .5 - round(t / .5)) < 1e-6 else '0.85')
                a.axvline(t, color=c, lw=1.5 if c == 'k' else .7, zorder=0)
        if marken and nm in marken:
            for t, lab, col in marken[nm]:
                ax.axvline(t, color=col, lw=1.0, ls='--'); ax.text(t, m2 + 1, lab, color=col, fontsize=9)
                ax2.axvline(t, color=col, lw=.8, ls='--')
        ax.set_ylabel(nm)
    axs[-1].set_xlim(t0, t1)
    axs[-1].set_xticks(np.arange(np.ceil(t0 / .25) * .25, t1, .25))
    plt.tight_layout(); plt.savefig(datei, dpi=int(os.environ.get('ZDPI', '60'))); plt.close()
if __name__ == '__main__':
    t0, t1 = float(sys.argv[1]), float(sys.argv[2]); sp = sys.argv[3].split(',')
    mk = json.load(open(sys.argv[5])) if len(sys.argv) > 5 and os.path.exists(sys.argv[5]) else {}
    zoom2(t0, t1, sp, sys.argv[4], mk, float(os.environ.get('ZW', '22')))
