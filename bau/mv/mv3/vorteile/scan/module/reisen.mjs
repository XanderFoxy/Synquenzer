// Modul "reisen": außergewöhnliche Flug-, Bahn- und Urlaubs-Deals ab Leipzig/Dresden/Berlin.
import { enthaelt, zaehle, parsePrice, euro, norm, round } from '../lib/text.mjs';
import { dealPruefer, altpreisAusText, preisAngaben } from '../lib/mydealz.mjs';
import { sammleFeeds, eintrag, preisfehlerEintrag, PREISFEHLER } from './gemeinsam.mjs';

const FLUG = /\b(flug|fluege|flüge|hin und rück|hin- und rück|return|nonstop|ryanair|easyjet|eurowings|wizz|condor|lufthansa)\b/i;

// Wo geht es los? 'eigen' (Leipzig/Dresden/Berlin), 'fremd' (nur andere Abflughäfen) oder 'egal' (kein Abflug genannt)
export function abflugArt(text, m) {
  if (abflugOrt(text, m)) return 'eigen';
  const t = norm(text);
  const fremd = m.fremdAbflug.some(o => new RegExp(`(ab|von|from)\\s(${norm(o)})\\b`).test(t));
  return fremd ? 'fremd' : 'egal';
}

const FLUGHAFEN = { lej: 'Leipzig', drs: 'Dresden', ber: 'Berlin' };
/** Welcher eigene Abflughafen steht wirklich im Text? („Ziele ab Berlin“ -> 'Berlin') – nur der gefundene, nie alle drei. */
export function abflugOrt(text, m) {
  const t = norm(text);
  const name = o => FLUGHAFEN[norm(o)] || o;
  const mitWort = m.abflug.find(o => new RegExp(`(ab|von|from|via)\\s(${norm(o)})\\b`).test(t));
  if (mitWort) return name(mitWort);
  const genannt = FLUG.test(text) && m.abflug.find(o => new RegExp(`\\b${norm(o)}\\b`).test(t));
  return genannt ? name(genannt) : null;
}

/** Was der Preis meint, aus Titel/Text: „pro Strecke“, „oneway“, „hin und zurück“, „für 2 Personen“, „pro Person“ */
export function preisZusatz(titel, text, preis) {
  const ti = String(titel || '');
  if (preis != null) {
    const p = String(preis).replace('.', ',').replace(/,00$/, '');
    const um = new RegExp(`${p.replace(',', '[.,]')}(?:[.,]0{1,2})?\\s*(?:€|eur|euro)?\\s*(?:\\(?\\s*)?(?:für|fuer)\\s*(2|zwei)\\s*personen`, 'i');
    if (um.test(text)) return 'für 2 Personen';
  }
  if (/\/\s*strecke|pro strecke|je strecke/i.test(ti)) return 'pro Strecke';
  if (/one\s?way|einfache strecke/i.test(ti)) return 'oneway';
  if (/inkl\.?\s*rückflug|hin und zurück|hin- und rückflug|hin- & rückflug/i.test(ti)) return 'hin und zurück';
  if (/\bp\.\s?p\.|pro person/i.test(ti)) return 'pro Person';
  return '';
}

// Preis aus Reise-Titeln: "für 19 €", "ab 29€", "nur 9,99 €"
const preisAusTitel = t => { const m = String(t).match(/(?:ab|für|fuer|nur|je)\s*(\d+(?:[.,]\d{1,2})?)\s*(?:€|euro|eur)/i); return m ? parsePrice(m[1]) : null; };
// Urlaubspiraten/Urlaubsguru nennen den Preis oft nur im Text: „Ihr bezahlt gerade mal 985 € p.P.“
export function preisProPersonAusText(text) {
  const m = String(text || '').match(/(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|\d+)\s*(?:€|euro|eur)\s*(?:p\.\s?p\.|pro person)/i);
  return m ? parsePrice(m[1].replace(/\.(?=\d{3})/g, '')) : null;
}
/** Ist der Preis ein „ab“-Preis? „Flüge ab 17€“ bei 16,99 (gerundet), „ab 54,50€ p.P.“ im Titel, oder der Text sagt „ab 16,99€“. */
export function istAbPreis(titel, text, preis) {
  if (preis == null) return false;
  const ti = String(titel || '');
  if (new RegExp(`\\bab\\s*(?:${Math.floor(preis)}|${Math.round(preis)})(?![\\d])`, 'i').test(ti)) return true;
  if (/\bab\s*\d+(?:[.,]\d{1,2})?\s*(?:€|eur|euro)/i.test(ti)) return true;
  const p = preis.toFixed(2).replace(/\.00$/, '(?:[.,]0{1,2})?').replace('.', '[.,]');
  return new RegExp(`\\bab\\s*${p}\\s*(?:€|eur|euro)`, 'i').test(String(text || ''));
}

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
    const titelPreis = parsePrice(it.preisText) ?? preisAusTitel(it.titel);
    const ppText = titelPreis == null ? preisProPersonAusText(it.beschreibung) : null;
    const preis = titelPreis ?? ppText;
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
    if (s.info?.ende && Date.parse(s.info.ende) <= jetztMs) continue; // Ende laut Deal-Seite schon vorbei
    const endeSeite = s.info?.ende || null;
    // „ab 49,00 € pro Strecke statt …“ – was der Preis meint und wovon er abgeht, steht direkt daneben
    const abPreis = istAbPreis(it.titel, text, preis) ? 'ab ' : '';
    const zusatz = preisZusatz(it.titel, text, preis) || (ppText != null && preis === ppText ? 'pro Person' : '');
    const preisText = preis != null ? `${abPreis}${euro(preis)}${zusatz ? ' ' + zusatz : ''}${alt ? ` statt ${euro(alt)}` : ''}` : '';
    const ort = ab === 'eigen' ? abflugOrt(text, m) : null;
    eintraege.push(eintrag({
      kategorie: 'reisen', titel: it.titel, quelle: it.feed, link: it.link, datum: it.datum, jetzt,
      bis: it.bis || endeSeite, bisQuelle: it.bis ? 'text' : endeSeite ? 'deal-seite' : null, ab: it.ab, art: 'reise',
      zeile: [preisText, rabatt >= 0.1 ? `−${Math.round(rabatt * 100)} %` : '', ort ? `ab ${ort}` : bahn ? 'Bahn' : ''].filter(Boolean).join(' · '),
      soGehts, wert, sofort: billigFlug && heiss, grund: heiss ? 'sehr beliebt' : billigFlug ? 'sehr günstiger Flug' : 'Knaller',
      preise: preisAngaben({ preis, preisVorher: alt, vorherQuelle: altInfo?.quelle }),
    }));
  }
  return { eintraege, fehler };
}
