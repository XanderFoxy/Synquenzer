// Atem – Sitzungsuhr (KONZEPT §4.3). Keine eigenen Timer: der Bild-Takt fragt zustand() ab.
import { zustandBei, neuSummen } from './plan.js';

export function erzeugeUhr({ jetzt = () => performance.now(), wand = () => Date.now() } = {}) {
  let plan = null, t0 = 0, pausiertSeit = null, pausenSumme = 0, gestoppt = false, wandStart = 0;
  const kopie = (p) => ({ ...p, schritte: p.schritte.map((s) => ({ ...s })), start: new Float64Array(p.start) });
  const uhr = {
    starte(p) { plan = kopie(p); t0 = jetzt(); pausiertSeit = null; pausenSumme = 0; gestoppt = false; wandStart = wand(); return uhr; },
    get plan() { return plan; },
    zeit() { if (!plan) return 0; return (pausiertSeit ?? jetzt()) - t0 - pausenSumme; },
    zustand() { return zustandBei(plan, uhr.zeit()); },
    get pausiert() { return pausiertSeit != null; },
    pause() { if (plan && pausiertSeit == null) pausiertSeit = jetzt(); },
    weiter() {   // Fortsetzen am Anfang der aktuellen Phase
      if (!plan || pausiertSeit == null) return;
      const z = zustandBei(plan, pausiertSeit - t0 - pausenSumme);
      const ziel = z.fertig ? plan.gesamt_ms : plan.start[z.i];
      pausiertSeit = null;
      t0 = jetzt() - ziel; pausenSumme = 0;
    },
    kuerze() {   // aktueller Schritt endet jetzt (Atmen-Knopf, offener Schritt)
      if (!plan) return null;
      const ms = uhr.zeit(), z = zustandBei(plan, ms), s = plan.schritte[z.i];
      const gemessen = Math.max(0, Math.round(ms - plan.start[z.i]));
      s.ist_ms = gemessen; s.ms = gemessen; s.gekuerzt = true;
      neuSummen(plan);
      // Folgeschritt startet jetzt: Zeit bleibt stetig
      return { i: z.i, ms: gemessen };
    },
    stopp() { const ist = uhr.zeit(); gestoppt = true; const p = plan; return { ist_ms: Math.max(0, Math.round(ist)), wand_ms: wand() - wandStart, plan: p }; },
    get gestoppt() { return gestoppt; }
  };
  return uhr;
}
