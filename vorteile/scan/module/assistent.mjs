// Bausteine für die „Assistent“-Bereiche Remix, Auftritte, Unterricht (Xander 08.11.2026: „in jedem Bereich auf jeden
// Fall was finden … nicht, dass da immer drin steht, da gibt's nichts … was das Nächste ist“).
// - Ausgabe-Vertrag: extra = { ort, km, frist (ISO|null), bewerbung: { art: 'formular'|'mail'|'seite', ziel }, quelle, … }
// - Fundorte: feste, geprüfte Adressen (config), die IMMER erscheinen – unter den frischen Funden, nah + Saison zuerst.
// - Sortierung über extra.sortWert (main.mjs sortiert danach): nah + bald zuerst.
import { eintrag } from './gemeinsam.mjs';
import { ortAus, ortNach, ortZeile, nahPunkte, istOnline, DOEBELN } from '../lib/orte.mjs';
import { tageBis } from '../lib/text.mjs';
import { berlinTag } from '../lib/ende.mjs';

const MAIL = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
const FORMULAR = /formular|anmeldeformular|online-anmeldung|application form|submission form|submit (?:your|the) form|google ?forms?|forms\.gle|typeform|jotform|bewerbungsbogen/i;

/** Bewerbungsweg aus dem Text: Mail-Adresse > Formular > Seite (Link). */
export function bewerbungAus(text, link) {
  const m = String(text || '').match(MAIL);
  if (m && !/example|beispiel|noreply|no-reply/i.test(m[0])) return { art: 'mail', ziel: m[0] };
  if (FORMULAR.test(String(text || ''))) return { art: 'formular', ziel: link };
  return { art: 'seite', ziel: link };
}

/**
 * Mit welchem Namen bewerben? (Xander 08.11.: „Xander Fox oder One Day in Rome?“)
 * Regel: Wer auf dem Plakat/Line-up steht. Band-Slot (Stadtfest, Festival, Bandcontest, Club) = Bandname, Xander Fox
 * als Kontakt/Sänger. Solo-Bühne (Open Mic/Open Stage, Singer-Songwriter) = Künstlername. Remix = Künstlername
 * („Titel (Xander Fox Remix)“). Unterricht = „Deutsch mit Xander“.
 */
export function bewerbenAls(typ, k = {}) {
  const name = k.name || 'Xander Fox', band = k.band || 'One Day in Rome', lehrer = k.unterricht || 'Deutsch mit Xander';
  if (typ === 'remix') return { name, warum: `Remixe laufen unter dem Produzentennamen: „Titel (${name} Remix)“.` };
  if (typ === 'unterricht') return { name: lehrer, warum: 'Unterricht unter deinem Lehrer-Namen; im Profil echter Vorname + Erfahrung.' };
  if (typ === 'openstage') return { name, warum: `Solo auf der offenen Bühne: ${name}. Kommt die ganze Band mit: ${band}.` };
  return { name: band, warum: `Gebucht wird die Band: ${band} – im Text „Kontakt: ${name} (Gesang, Synths)“.` };
}

/** Saison eines Fundorts: { bewerbung: [Monate 1–12], termin: 'Mai' } -> { offen, text } */
export function saisonInfo(saison, jetzt = new Date()) {
  if (!saison?.bewerbung?.length) return { offen: true, text: saison?.termin ? `Termin: ${saison.termin}` : '' };
  const monat = Number(berlinTag(new Date(jetzt).toISOString()).slice(5, 7));
  const offen = saison.bewerbung.includes(monat);
  const NAME = ['', 'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  const von = NAME[saison.bewerbung[0]], bis = NAME[saison.bewerbung.at(-1)];
  const fenster = von === bis ? von : `${von}–${bis}`;
  return { offen, text: [offen ? 'jetzt bewerben' : `Bewerbung meist ${fenster}`, saison.termin ? `Termin: ${saison.termin}` : ''].filter(Boolean).join(' · ') };
}

/** Sortierwert: Relevanz + nah + bald; Fundorte etwas tiefer, in ihrer Bewerbungszeit höher. */
export function sortWert({ wert = 50, km = null, online = false, rest = null, fundort = false, saisonOffen = true }) {
  const bald = rest == null ? 0 : rest <= 14 ? 10 : rest <= 45 ? 6 : 2;
  return Math.round(wert + nahPunkte(km, online) + bald + (fundort ? (saisonOffen ? -2 : -12) : 0));
}

/** Ort eines Funds: eigenes Feld (stadt) > Text. -> { ort, km, online } */
export function ortVon({ stadt = '', text = '', zuhause = DOEBELN } = {}) {
  const o = (stadt && ortNach(stadt, zuhause)) || ortAus(text, zuhause);
  return { ort: o?.ort || (stadt || null), km: o?.km ?? null, online: !o && istOnline(text) };
}

/**
 * Fundorte (config) als Einträge. f = { titel, link, ort?, typ, bewerbung?, saison?, zeile?, soGehts, quelle?, wert?, linkPruefen? }
 * linkPruefen: Adresse nicht durch einen echten Abruf belegt -> „Link prüfen“ in der Zeile.
 * pruefung: { [link]: { ok, tag } } aus dem Zustand (Link-Prüfung, siehe pruefeFundorte).
 */
export function fundortEintraege(liste = [], { kategorie, jetzt = new Date(), kuenstler = {}, pruefung = {}, zuhause = DOEBELN } = {}) {
  const out = [];
  for (const f of liste) {
    if (!f?.link || !f?.titel || f.aktiv === false) continue;
    const o = f.ort && !/deutschlandweit|online/i.test(f.ort) ? ortNach(f.ort, zuhause) : null;
    const online = /online/i.test(f.ort || '') || f.online === true;
    const s = saisonInfo(f.saison, jetzt);
    const kaputt = pruefung[f.link]?.fehlerInFolge >= 2;
    const typ = f.typ || 'fundort';
    const wert = f.wert ?? 45;
    out.push(eintrag({
      kategorie, titel: f.titel, link: f.link, quelle: f.quelle || 'Fundort', datum: null, jetzt, art: 'fundort',
      zeile: [ortZeile(o || (f.ort ? { ort: f.ort } : null), online), f.zeile || '', s.text, kaputt ? 'Link gerade nicht erreichbar' : f.linkPruefen ? 'Link prüfen' : ''].filter(Boolean).join(' · '),
      soGehts: f.soGehts || 'Seite öffnen, Bedingungen lesen, Bewerbung schicken (Vorlage unten auf der Seite).',
      wert, sofort: false, grund: 'Fundort',
      extra: {
        typ, fundort: true, ort: o?.ort || f.ort || (online ? 'online' : null), km: o?.km ?? null, online,
        frist: null, bewerbung: f.bewerbung || { art: 'seite', ziel: f.link }, quelle: f.quelle || 'Fundort',
        saison: f.saison || null, saisonOffen: s.offen, bewerbenAls: bewerbenAls(typ === 'remix' || kategorie === 'remix' ? 'remix' : kategorie === 'unterricht' ? 'unterricht' : typ, kuenstler),
        ...(kaputt ? { linkOk: false } : {}), ...(f.linkPruefen ? { linkPruefen: true } : {}),
        sortWert: sortWert({ wert, km: o?.km ?? null, online, fundort: true, saisonOffen: s.offen }),
      },
    }));
  }
  return out;
}

/**
 * Fundort-Links höchstens einmal am Tag abrufen (nur im echten Lauf auf GitHub, nicht in Tests/Probe): tote Adressen
 * landen als Hinweis im Status; nach 2 Fehlern in Folge steht „Link gerade nicht erreichbar“ in der Zeile.
 */
export async function pruefeFundorte(liste, { holeText, zustand, name, jetzt = new Date(), an = false }) {
  const z = ((zustand.fundorte ||= {})[name] ||= {});
  const hinweise = [];
  const tag = berlinTag(new Date(jetzt).toISOString());
  if (!an) return { pruefung: z, hinweise };
  for (const f of liste) {
    if (!f?.link || f.aktiv === false || z[f.link]?.tag === tag) continue;
    try { await holeText(f.link, { headers: { accept: 'text/html' } }); z[f.link] = { tag, ok: true, fehlerInFolge: 0 }; }
    catch (e) {
      const n = (z[f.link]?.fehlerInFolge ?? 0) + 1;
      z[f.link] = { tag, ok: false, fehlerInFolge: n };
      hinweise.push(`Fundort „${f.titel.slice(0, 40)}“: ${e.message}`);
    }
  }
  for (const k of Object.keys(z)) if (!liste.some(f => f?.link === k)) delete z[k];
  return { pruefung: z, hinweise };
}

export const fundortePruefen = (m, env = {}) => m?.fundortePruefen !== false && (env.GITHUB_ACTIONS === 'true' || env.FUNDORTE_PRUEFEN === '1');

/** Rest-Tage bis zur Frist (ISO) oder null */
export const restTage = (bis, jetzt) => (bis ? tageBis(berlinTag(bis), jetzt) : null);
