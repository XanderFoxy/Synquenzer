// Modul "reisen": außergewöhnliche Flug-, Bahn- und Urlaubs-Deals ab Leipzig/Dresden/Berlin.
import { enthaelt, zaehle, parsePrice, altpreisAus, euro, norm, round } from '../lib/text.mjs';
import { sammleFeeds, eintrag } from './gemeinsam.mjs';

const FLUG = /\b(flug|fluege|flüge|hin und rück|hin- und rück|return|nonstop|ryanair|easyjet|eurowings|wizz|condor|lufthansa)\b/i;

// Wo geht es los? 'eigen' (Leipzig/Dresden/Berlin), 'fremd' (nur andere Abflughäfen) oder 'egal' (kein Abflug genannt)
export function abflugArt(text, m) {
  const t = norm(text);
  const eigen = m.abflug.some(o => new RegExp(`(ab|von|from|via)\\s(${norm(o)})\\b`).test(t) || new RegExp(`\\b${norm(o)}\\b`).test(t) && FLUG.test(text));
  if (eigen) return 'eigen';
  const fremd = m.fremdAbflug.some(o => new RegExp(`(ab|von|from)\\s(${norm(o)})\\b`).test(t));
  return fremd ? 'fremd' : 'egal';
}

// Preis aus Reise-Titeln: "für 19 €", "ab 29€", "nur 9,99 €"
const preisAusTitel = t => { const m = String(t).match(/(?:ab|für|fuer|nur|je)\s*(\d+(?:[.,]\d{1,2})?)\s*(?:€|euro|eur)/i); return m ? parsePrice(m[1]) : null; };

export default async function reisen({ holeText, cfg, jetzt }) {
  const m = cfg.module.reisen;
  const eintraege = [];
  const { items, fehler } = await sammleFeeds(holeText, m.feeds, { jetzt });
  for (const it of items) {
    const text = `${it.titel} ${it.beschreibung}`;
    const ab = abflugArt(text, m);
    if (ab === 'fremd') continue;
    const bahn = enthaelt(text, m.bahnWoerter);
    const flug = FLUG.test(text);
    const knaller = zaehle(it.titel, m.knallerWoerter);
    const preis = parsePrice(it.preisText) ?? preisAusTitel(it.titel);
    const alt = altpreisAus(text);
    const rabatt = preis != null && alt ? round(1 - preis / alt, 2) : null;
    const heiss = (it.temperatur ?? 0) >= m.minTemperatur;
    const billigFlug = flug && ab === 'eigen' && preis != null && preis <= m.flugMaxEuro;
    // außergewöhnlich: Preisfehler/Knaller, sehr heiß, sehr billig ab eigenem Flughafen, oder ≥ 50 % Rabatt
    if (!(knaller || heiss || billigFlug || rabatt >= 0.5)) continue;
    // Flüge ohne passenden Abflug nur bei echten Preisfehlern
    if (flug && ab !== 'eigen' && !/preisfehler|error fare|fehlerpreis/i.test(it.titel)) continue;
    const preisfehler = /preisfehler|error fare|fehlerpreis/i.test(it.titel);
    eintraege.push(eintrag({
      kategorie: 'reisen', titel: it.titel, quelle: it.feed, link: it.link, datum: it.datum,
      zeile: [preis != null ? euro(preis) : '', rabatt >= 0.1 ? `−${Math.round(rabatt * 100)} %` : '', ab === 'eigen' ? 'ab Leipzig/Dresden/Berlin' : bahn ? 'Bahn' : ''].filter(Boolean).join(' · '),
      soGehts: bahn
        ? 'Link öffnen, Wunschtermin in der DB-App suchen, Sparpreis mit Zugbindung buchen – Ticket liegt dann in der App.'
        : 'Link öffnen, Termin wählen und nur mit kostenloser Stornierung oder Käuferschutz buchen. Nicht hetzen lassen.',
      wert: 45 + (preisfehler ? 35 : 0) + knaller * 8 + (heiss ? 15 : 0) + (billigFlug ? 15 : 0) + (ab === 'eigen' ? 10 : 0),
      sofort: preisfehler || (billigFlug && heiss), grund: preisfehler ? 'Preisfehler' : heiss ? 'sehr beliebt' : billigFlug ? 'sehr günstiger Flug' : 'Knaller',
    }));
  }
  return { eintraege, fehler };
}
