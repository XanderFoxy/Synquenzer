# Schicht „Timing“ als Audio bauen: gereinigt (Aufnahme-Zeit) über die Zeitkarte auf Ende-Zeit gelegt. Nur lokal.
import sys, numpy as np
sys.path.insert(0, __import__('os').path.dirname(__file__))
from gemein import lade, SR, DAUER, karte_r, ROH
def auf_ende(name):
    x = np.asarray(lade(name), np.float32); n = int(DAUER * SR); out = np.zeros(n, np.float32)
    blk = SR * 10
    for i in range(0, n, blk):
        t = np.arange(i, min(n, i + blk)) / SR
        r = karte_r(t) * SR
        out[i:i + len(t)] = np.interp(r, np.arange(len(x)), x)
    return out
if __name__ == '__main__':
    np.save(ROH + '/timing.npy', auf_ende('gereinigt'))
    np.save(ROH + '/original-e.npy', auf_ende('original'))
