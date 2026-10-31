// Modul "reisen": außergewöhnliche Flug-, Bahn- und Urlaubs-Deals ab Leipzig/Dresden/Berlin.
import { enthaelt, zaehle, parsePrice, euro, norm, round } from '../lib/text.mjs';
import { dealPruefer, altpreisAusText, preisAngaben } from '../lib/mydealz.mjs';
import { sammleFeeds, eintrag, preisfehlerEintrag, PREISFEHLER } from './gemeinsam.mjs';

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

export default async function reisen({ holeText, cfg, jetzt, zustand }) {
  const m = cfg.module.reisen;
  const eintraege = [];
  const jetztMs = new Date(jetzt).getTime();
  const { items, fehler } = await sammleFeeds(holeText, m.feeds, { jetzt });
  const pruefer = dealPruefer({ holeText, zustand, jetzt });
  for (const it of items) {
    const text = `${it.titel} ${it.beschreibung}`;
    const ab = abflugArt(text, m);
    if (ab === 'fremd') continue;
    const bahn = enthaelt(text, m.bahnWoerter);
    const flug = FLUG.test(text);
    const knaller = zaehle(it.titel, m.knallerWoerter);
    const preis = parsePrice(it.preisText) ?? preisAusTitel(it.titel);
    const altInfo = altpreisAusText(text, preis);
    const alt = altInfo?.preis ?? null;
    const rabatt = preis != null && alt ? round(1 - preis / alt, 2) : null;
    const heiss = (it.temperatur ?? 0) >= m.minTemperatur;
    const billigFlug = flug && ab === 'eigen' && preis != null && preis <= m.flugMaxEuro;
    // außergewöhnlich: Preisfehler/Knaller, sehr heiß, sehr billig ab eigenem Flughafen, oder ≥ 50 % Rabatt
    if (!(knaller || heiss || billigFlug || rabatt >= 0.5)) continue;
    // Flüge ohne passenden Abflug nur bei echten Preisfehlern
    const preisfehler = PREISFEHLER.test(it.titel);
    if (flug && ab !== 'eigen' && !preisfehler) continue;
    const soGehts = bahn
      ? 'Link öffnen, Wunschtermin in der DB-App suchen, Sparpreis mit Zugbindung buchen – Ticket liegt dann in der App.'
      : 'Link öffnen, Termin wählen und nur mit kostenloser Stornierung oder Käuferschutz buchen. Nicht hetzen lassen.';
    const wert = 45 + (preisfehler ? 35 : 0) + knaller * 8 + (heiss ? 15 : 0) + (billigFlug ? 15 : 0) + (ab === 'eigen' ? 10 : 0);
    if (preisfehler) {
      // Preisfehler: höchstens 24 h, mydealz nur mit lesbarer Deal-Seite, die „läuft noch“ sagt; vorher → jetzt
      const r = await preisfehlerEintrag(it, { kategorie: 'reisen', pruefer, jetzt, wert, preis, soGehts: `${soGehts} Preisfehler werden manchmal storniert.` });
      if (r.eintrag) eintraege.push(r.eintrag);
      else if (r.grund === 'Deal-Seite nicht lesbar') fehler.push(`Preisfehler ausgelassen (${r.grund}): ${it.titel.slice(0, 60)}`);
      continue;
    }
    const s = await pruefer.pruefe(it.link, { neuNachStunden: 6 });
    if (s.info?.abgelaufen) continue;
    const endeSeite = s.info?.ende && Date.parse(s.info.ende) > jetztMs ? s.info.ende : null;
    eintraege.push(eintrag({
      kategorie: 'reisen', titel: it.titel, quelle: it.feed, link: it.link, datum: it.datum, jetzt,
      bis: it.bis || endeSeite, bisQuelle: it.bis ? 'text' : endeSeite ? 'deal-seite' : null, ab: it.ab, art: 'reise',
      zeile: [preis != null ? euro(preis) : '', rabatt >= 0.1 ? `−${Math.round(rabatt * 100)} %` : '', ab === 'eigen' ? 'ab Leipzig/Dresden/Berlin' : bahn ? 'Bahn' : ''].filter(Boolean).join(' · '),
      soGehts, wert, sofort: billigFlug && heiss, grund: heiss ? 'sehr beliebt' : billigFlug ? 'sehr günstiger Flug' : 'Knaller',
      preise: preisAngaben({ preis, preisVorher: alt, vorherQuelle: altInfo?.quelle }),
    }));
  }
  return { eintraege, fehler };
}
