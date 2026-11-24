# Zoom: Spektrogramm (0-6 kHz) + Hüllen V/H für eine Spur, 16tel-Raster, Marken
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) + '/pylib')
import numpy as np, matplotlib
matplotlib.use('Agg'); import matplotlib.pyplot as plt
from zk_gemein import *
def zoom(t0, t1, spuren, datei, marken=None, fmax=6000):
    fig, axs = plt.subplots(2 * len(spuren), 1, figsize=(float(os.environ.get("ZW","20")), 3.2 * len(spuren)), sharex=True, gridspec_kw=dict(height_ratios=[2, 1] * len(spuren)))
    for q, nm in enumerate(spuren):
        ax, ax2 = axs[2 * q], axs[2 * q + 1]
        x = np.asarray(lade(nm)[int((t0 - .1) * SR):int((t1 + .1) * SR)], np.float64)
        nf, hop = 768, 48
        win = np.hanning(nf); nfr = (len(x) - nf) // hop
        idx = np.arange(nfr)[:, None] * hop + np.arange(nf)[None, :]
        S = 20 * np.log10(np.abs(np.fft.rfft(x[idx] * win, axis=1)) + 1e-9).T
        f = np.fft.rfftfreq(nf, 1 / SR); k = f <= fmax
        mx = np.percentile(S[k], 99.7)
        ax.imshow(S[k], origin='lower', aspect='auto', extent=[t0 - .1 + nf / 2 / SR, t0 - .1 + (nf / 2 + nfr * hop) / SR, 0, fmax], vmin=mx - 65, vmax=mx, cmap='magma')
        V = env_db(bp(x, 120, 1800), 8); H = env_db(bp(x, 3500, 11000), 8)
        tt = t0 - .1 + np.arange(len(V)) / 1000
        ax2.plot(tt, V, lw=.9); ax2.plot(tt, H, lw=.7)
        m2 = np.percentile(V, 99.5); ax2.set_ylim(m2 - 45, m2 + 3); ax2.grid(axis='y', lw=.3)
        for a in (ax, ax2):
            for kk in np.arange(np.ceil(t0 / S16), np.floor(t1 / S16) + 1):
                t = kk * S16
                c = 'w' if abs(t / 2 - round(t / 2)) < 1e-6 else ('0.8' if abs(t / .5 - round(t / .5)) < 1e-6 else '0.5')
                if a is ax2: c = {'w': 'k', '0.8': '0.4', '0.5': '0.8'}[c]
                a.axvline(t, color=c, lw=1.5 if c in ('w', 'k') else .7)
        if marken and nm in marken:
            for t, lab, col in marken[nm]:
                ax.axvline(t, color=col, lw=1.0, ls='--'); ax.text(t, fmax * .92, lab, color=col, fontsize=9)
                ax2.axvline(t, color=col, lw=.8, ls='--')
        ax.set_ylabel(nm)
    axs[-1].set_xlim(t0, t1)
    axs[-1].set_xticks(np.arange(np.ceil(t0 / .125) * .125, t1, .125), minor=True)
    plt.tight_layout(); plt.savefig(datei, dpi=int(os.environ.get("ZDPI","58"))); plt.close()
if __name__ == '__main__':
    t0, t1 = float(sys.argv[1]), float(sys.argv[2]); sp = sys.argv[3].split(',')
    mk = json.load(open(sys.argv[5])) if len(sys.argv) > 5 and os.path.exists(sys.argv[5]) else {}
    zoom(t0, t1, sp, sys.argv[4], mk)
