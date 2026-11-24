// Gesangstrainer – vokal-worker.js: Vokal-Spur im Hintergrund (Modul-Worker), alles lokal.
import { nurVokaleMitInfo } from './vokalfilter.js';

self.onmessage = (e) => {
  const { id, x, sr, opt = {} } = e.data || {};
  try {
    const { y, info } = nurVokaleMitInfo(x, sr, { ...opt, fortschritt: (p) => self.postMessage({ id, stand: p }) });
    self.postMessage({ id, ok: true, y, info }, [y.buffer]);
  } catch (err) {
    self.postMessage({ id, ok: false, fehler: String((err && err.message) || err) });
  }
};
