// Gesangstrainer – ton-worker.js: rechnet Tonhöhe/Stimmlage/Melodie im Hintergrund (Modul-Worker), alles lokal.
import { tonhoehe, stimmlage, melodieAusAudio } from './ton.js';

self.onmessage = (e) => {
  const { id, auftrag, x, sr, opt = {} } = e.data || {};
  try {
    const o = { ...opt, fortschritt: (p) => self.postMessage({ id, stand: p }) };
    let r;
    if (auftrag === 'melodie') r = melodieAusAudio(x, sr, opt.silbenZeiten);
    else {
      const spur = tonhoehe(x, sr, o);
      r = auftrag === 'stimmlage' ? { spur, stimme: stimmlage(spur, opt) } : spur;
    }
    self.postMessage({ id, ok: true, r });
  } catch (err) {
    self.postMessage({ id, ok: false, fehler: String((err && err.message) || err) });
  }
};
