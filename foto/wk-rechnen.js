// Bildwerk – Rechen-Worker (Agent C). Nachrichten FEST (ARCH.md §5).
import { bediene } from './rpc.js';
import { VERSION } from './typen.js';
import * as analyse from './analyse.js';
import * as zuschnitt from './zuschnitt.js';
// INTEGRATION (Ladezeit): Auswahl/Entfernen/Hoch erst beim ersten Auftrag laden (Start ohne ~150 KB Modul-Code)
const auswahlM = () => import('./auswahl.js'), entfernenM = () => import('./entfernen.js'), hochM = () => import('./hoch.js');

bediene(self, {
  async hallo() { return { version: VERSION, worker: 'rechnen' }; },
  // INTEGRATION: Ränder (falls nicht mitgegeben) hier rechnen und an analysiere() geben (schwarze Balken verfälschen sonst WB/Schwarzpunkt);
  // quelle {b,h} für Megapixel/Rausch-Hochrechnung. Ergebnis enthält zusätzlich `raender`.
  async analyse({ bild, gesichter, haut, raender, quelle }) {
    let r = raender; if (r === undefined) { try { r = zuschnitt.erkenneRaender(bild); } catch { r = null; } }
    const rOk = r && r.sicherheit > 0.5 && r.rechteck && (r.rechteck.b < 0.995 || r.rechteck.h < 0.995) ? r : null;
    const a = analyse.analysiere(bild, { gesichter, haut, raender: rOk, quelle });
    return { analyse: a, detailkarte: analyse.detailKarte(bild, { haut, gesichter }), raender: r };
  },
  async raender({ bild }) { return zuschnitt.erkenneRaender(bild); },
  async histogramm({ bild, maske }) { return analyse.histogramme(bild, { maske }); },
  async 'maske-verfeinern'({ maske, fuehrung, opts }) { return (await auswahlM()).verfeinereKante(maske, fuehrung, opts); },
  async 'maske-weich'(d) { return (await auswahlM()).weichzeichnen(d.maske, d.radius); },
  async 'maske-bauen'(d) { return (await auswahlM()).baueMaske(d.ref, { b: d.b, h: d.h, teile: d.teile || {}, fuehrung: d.fuehrung, gesichter: d.gesichter || [], klassen: d.klassen }); },
  async magisch({ bild, punkt, toleranz }) { return (await auswahlM()).magischerBereich(bild, punkt, { toleranz }); },
  async flickensuche({ bild, maske, opts }) { return (await entfernenM()).flickenSuche(bild, maske, opts); },
  async einblenden({ original, gefuellt, maske, opts }) { return (await entfernenM()).einblenden(original, gefuellt, maske, opts); },
  async 'hoch-klassisch'({ kachel, faktor }) { return (await hochM()).hochskaliereKlassisch(kachel, faktor); },
});
