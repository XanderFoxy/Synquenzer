# Parallel-Bild: mehrere Zeilen (Spur, Startzeit) untereinander, gleiche relative Zeitachse (16tel-Raster),
# V-/HF-Hülle + Tonhöhe, Marken = gemessene Spitzen (rot) und Konsonant-Beginn (magenta).
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) + '/pylib')
import numpy as np, matplotlib
matplotlib.use('Agg'); import matplotlib.pyplot as plt
from zk_gemein import *
def bild(reihen, dauer, datei, marken, breite=22):
    fig, axs = plt.subplots(len(reihen), 1, figsize=(breite, 1.55 * len(reihen)), sharex=True)
    for ax, (nm, t0, lab) in zip(axs, reihen):
        x = np.asarray(lade(nm)[int((t0 - .1) * SR):int((t0 + dauer + .1) * SR)], np.float64)
        V = env_db(bp(x, 120, 1800), 8); H = env_db(bp(x, 4000, 10000), 8)
        tt = -.1 + np.arange(len(V)) / 1000
        m2 = np.percentile(V, 99.5)
        ax.plot(tt, V, lw=.8, color='C0'); ax.plot(tt, H, lw=.6, color='C1')
        ax.set_ylim(m2 - 38, m2 + 4)
        try:
            z = np.load(CACHE + 'f0_%s.npz' % nm); m = (z['t'] >= t0) & (z['t'] <= t0 + dauer) & (z['ap'] < 0.25)
            st = 12 * np.log2(np.maximum(z['f0'][m], 1) / 155.56)
            ax2 = ax.twinx(); ax2.scatter(z['t'][m] - t0, st, s=1.5, c='C2'); ax2.set_ylim(-8, 20); ax2.set_yticks([])
        except Exception: pass
        k0 = int(np.ceil((t0 - .1) / S16 - 1e-9))
        for k in range(k0, int((t0 + dauer) / S16) + 1):
            t = k * S16 - t0
            c = 'k' if k % 16 == 0 else ('0.5' if k % 4 == 0 else '0.87')
            ax.axvline(t, color=c, lw=1.4 if c == 'k' else .6, zorder=0)
        for (t, l, col) in marken.get('%s@%.3f' % (nm, t0), []):
            ax.axvline(t - t0, color=col, lw=1.1, ls='--'); ax.text(t - t0 + .005, m2 + 1, l, color=col, fontsize=8)
        ax.set_ylabel(lab, fontsize=8, rotation=0, ha='right'); ax.set_yticks([])
    axs[-1].set_xlim(-.1, dauer); axs[-1].set_xticks(np.arange(0, dauer + .01, .5))
    plt.subplots_adjust(left=.07, right=.99, top=.99, bottom=.03, hspace=.08)
    plt.savefig(datei, dpi=int(os.environ.get('ZDPI', '55'))); plt.close()
if __name__ == '__main__':
    cfg = json.load(open(sys.argv[1]))
    bild([tuple(r) for r in cfg['reihen']], cfg['dauer'], cfg['datei'], cfg.get('marken', {}))
