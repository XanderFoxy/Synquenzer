# Spektrogramm-Ausschnitt mehrerer Spuren mit 16tel-Raster und Marken (Diagnose)
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) + '/pylib')
import numpy as np, matplotlib
matplotlib.use('Agg'); import matplotlib.pyplot as plt
from zk_gemein import *
def spek(t0, t1, spuren, datei, marken=None, fmax=8000):
    fig, axs = plt.subplots(len(spuren), 1, figsize=(18, 2.6 * len(spuren)), sharex=True)
    if len(spuren) == 1: axs = [axs]
    for ax, nm in zip(axs, spuren):
        x = np.asarray(lade(nm)[int(t0 * SR):int(t1 * SR)], np.float64)
        nf, hop = 1024, 96
        win = np.hanning(nf); nfr = (len(x) - nf) // hop
        idx = np.arange(nfr)[:, None] * hop + np.arange(nf)[None, :]
        S = 20 * np.log10(np.abs(np.fft.rfft(x[idx] * win, axis=1)) + 1e-9).T
        f = np.fft.rfftfreq(nf, 1 / SR); k = f <= fmax
        mx = np.percentile(S[k], 99.7)
        ax.imshow(S[k], origin='lower', aspect='auto', extent=[t0 + nf / 2 / SR, t0 + (nf / 2 + nfr * hop) / SR, 0, fmax], vmin=mx - 70, vmax=mx, cmap='magma')
        for kk in np.arange(np.ceil(t0 / S16), np.floor(t1 / S16) + 1):
            tt = kk * S16
            c = 'w' if abs(tt / 2 - round(tt / 2)) < 1e-6 else ('0.75' if abs(tt / .5 - round(tt / .5)) < 1e-6 else '0.45')
            ax.axvline(tt, color=c, lw=1.4 if c == 'w' else .7, ls='-' if c != '0.45' else ':')
        if marken and nm in marken:
            for tt, lab, col in marken[nm]:
                ax.axvline(tt, color=col, lw=1.0, ls='--'); ax.text(tt, fmax * .9, lab, color=col, fontsize=9)
        ax.set_ylabel(nm); ax.set_xlim(t0, t1)
    plt.tight_layout(); plt.savefig(datei, dpi=60); plt.close()
if __name__ == '__main__':
    t0, t1 = float(sys.argv[1]), float(sys.argv[2]); sp = sys.argv[3].split(',')
    mk = json.load(open(sys.argv[5])) if len(sys.argv) > 5 else {}
    spek(t0, t1, sp, sys.argv[4], mk)
