// Atem – Figur-Vorschau (Vorbereitung, Singen, Wissen). Derselbe Plan und dieselbe Kurve wie in der Übung
// (zustandBei → anatomie.setze), nur auf Tippen, höchstens 2 Zyklen bzw. 24 s. rAF nur während der Vorschau;
// Ende bei Seitenwechsel (Rückgabe = Stopp), Hintergrund oder wenn die Karte verschwindet.
import { zustandBei } from './plan.js';
import { MUSKELN } from './daten.js';
import { speicher } from './speicher.js';
const $ = (s, r = document) => r.querySelector(s);
const TEST = () => !!(window.atem && window.atem.test);
function vorschauDauer(plan) {
  const s = plan.schritte; let ende = plan.offenAb >= 0 ? plan.start[plan.offenAb] : plan.gesamt_ms;
  const k = s.findIndex((x) => x.zug > 2 || (x.zuege === 0 && x.runde > 1)); if (k > 0) ende = Math.min(ende, plan.start[k]);
  return Math.max(4000, Math.min(ende, 24000));
}
export async function vorschau(karte, quelle, { modus = 'klein', ansicht } = {}) {   // quelle: Plan oder Funktion → Plan (Variante/Dauer wie gerade eingestellt)
  const holePlan = () => { const p = typeof quelle === 'function' ? quelle() : quelle; return p && p.schritte && p.schritte.length ? p : null; };
  let plan = holePlan();
  if (!karte.isConnected) return;
  const host = $('.vs-fig', karte), knopf = $('#vs-los', karte), wort = $('.vs-wort', karte); if (!host || !knopf || !plan) return;
  let A; try { A = await import('./anatomie.js'); } catch { karte.remove(); return; }
  if (!host.isConnected) return;
  const e = speicher.einst(), titel = wort.textContent; let dauer = vorschauDauer(plan);
  const an = A.erzeugeAnatomie(host, { ansicht: ansicht || e.ansicht || 'seite', modus, daten: { MUSKELN } });
  const ruhig = e.ruhig ? true : undefined;
  const setze = (z, t) => { const st = z.schritt; an.setze({ phase: st.art, anteil: z.p, v: z.v, vz: st.vz, art: st.art_anat, tiefe: st.tiefe, weg: st.weg, liegend: !!plan.liegend, zeit: t, ruhig }); };
  const ruhe = () => { const st = plan.schritte[0]; an.setze({ phase: 'ruhe', anteil: 0, v: 0, art: st.art_anat, tiefe: st.tiefe, weg: st.weg, zeit: performance.now(), ruhig }); };
  ruhe();
  let raf = 0, t0 = 0, li = -1, ls = -1;
  const halt = () => { if (raf) cancelAnimationFrame(raf); raf = 0; document.removeEventListener('visibilitychange', sicht); knopf.lastElementChild.textContent = 'Vorschau'; knopf.classList.remove('an'); if (wort.isConnected) wort.textContent = titel; ruhe(); };
  const sicht = () => { if (document.hidden) halt(); };
  function bild(t) {
    raf = 0; if (!host.isConnected) return halt();
    const ms = t - t0; if (ms >= dauer) return halt();
    const z = zustandBei(plan, ms); setze(z, t);
    const sek = z.sekunde ?? 0;
    if (z.i !== li || sek !== ls) { li = z.i; ls = sek; wort.textContent = z.schritt.wort + (z.schritt.ms ? ' · ' + sek : ''); wort.style.color = ''; }
    raf = requestAnimationFrame(bild);
  }
  knopf.onclick = () => {
    if (raf) return halt();
    plan = holePlan() || plan; dauer = vorschauDauer(plan); if (TEST()) window.atem.vorschau = { an, dauer, plan };
    t0 = performance.now(); li = -1; knopf.lastElementChild.textContent = 'Stopp'; knopf.classList.add('an');
    document.addEventListener('visibilitychange', sicht); raf = requestAnimationFrame(bild);
  };
  if (TEST()) window.atem.vorschau = { an, dauer, plan };
  return () => { halt(); an.zerstoere(); };
}
