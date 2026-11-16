// Modul "auftraege" – Bereich „Nebenverdienst“ (Xander 16.11.2026): „wenn ich die Gelegenheit habe, jemandem Unterricht in
// Klavier, Keyboard, Gitarre oder Synthese und Sounddesign zu geben – in der Umgebung von Döbeln, so nah wie möglich, oder
// online … Oder wenn jemand etwas mit KI gemacht haben möchte – Bildbearbeitung, Videobearbeitung, eine App … Dinge, die wir
// allein wirklich umsetzen können.“ Keine Stellen der Arbeitsagentur („Gesuche ohne Arbeitsamt“).
//
// Drei Felder: unterricht („Unterricht geben“: Musik), ki („KI & Apps“), bildvideo („Bild & Video“, auch Musik für Videos).
// Quellen (config module.auftraege.quellen), jede nur nach Prüfung ihrer robots.txt (lib/robots.mjs):
//   - freelancer: öffentliche Projekt-API von Freelancer.com (JSON, ohne Konto) – Fähigkeiten als Zahl oder Name; Namen
//     löst einmal im Monat /projects/0.1/jobs/?job_names[]=… auf (Zustand quellen.freelancerJobs). AUS (Prüfer 16.11.2026):
//     die Nutzungsbedingungen verbieten das automatische Lesen ohne schriftliche Erlaubnis -> config agbVerbot; nur mit
//     erlaubnis: true an der Quelle (registrierte App mit Erlaubnis) wird wieder gelesen.
//   - rss: beliebiger RSS-Feed (z. B. hnrss.org „Seeking freelancer“), optional nurMit = Wörter, die drinstehen müssen
// Vor JEDEM Abruf (auch dem der robots.txt): Nutzungsbedingungen (config agbVerbot) – verboten = gar kein Abruf.
// Plattformen ohne offenen Zugang (Kleinanzeigen, Upwork, Fiverr …) und Quellen, deren robots.txt es verbietet, stehen als
// fertige Suchen in config suchLinks – sie erscheinen IMMER (Fundorte, extra.fundort).
// Bewertung je Treffer (bewerte): passt (0–100, Xanders Können), aufwand (klein/mittel/groß), allein (machbar ja/nein),
// ort/km oder online, verguetung (falls genannt), alterTage; Betrugsmuster raus (betrugWoerter) oder Warnung (warnWoerter).
// Datenschutz: aus Texten werden Mail-Adressen, Telefonnummern, Links und @Namen entfernt; Auftraggeber werden nie gespeichert.
import { enthaelt, zaehle, norm, datumDe } from '../lib/text.mjs';
import { berlinTag } from '../lib/ende.mjs';
import { leseRss, entities } from '../lib/rss.mjs';
import { ortAus, ortNach, istOnline, nahPunkte } from '../lib/orte.mjs';
import { robotsErlaubt, agentAus, agbGrund, holeRohMit } from '../lib/robots.mjs';
import { eintrag } from './gemeinsam.mjs';
import { fundortEintraege } from './assistent.mjs';

export const FELD_NAME = { unterricht: 'Unterricht geben', ki: 'KI & Apps', bildvideo: 'Bild & Video' };
const FL = 'https://www.freelancer.com/api/projects/0.1';

// --- Texte säubern ------------------------------------------------------------------------------------------------------
const MAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const TEL = /(?:\+|00)\d[\d\s/().-]{6,}\d|\b0\d{2,5}[\s/-]?\d{3,}[\s-]?\d{0,6}\b/g;
const URL_ = /\bhttps?:\/\/[^\s,;)<>"]+|\bwww\.[^\s,;)<>"]+/gi;
const HANDLE = /(^|\s)@[A-Za-z0-9_.]{2,}/g;
// versteckte Mail-Adressen: „max(at)web(dot)de“, „max [at] web [dot] de“, „max at web dot de“, „max(at)web.de“ (Prüfer 16.11.2026)
const AT = String.raw`\s*(?:\(at\)|\[at\]|\{at\}|\(ät\)|\[ät\])\s*`, DOT = String.raw`\s*(?:\(dot\)|\[dot\]|\{dot\}|\(punkt\)|\[punkt\]|\.)\s*`;
const MAIL_VERSTECKT = new RegExp(String.raw`[A-Za-z0-9._%+-]+${AT}[A-Za-z0-9-]+(?:${DOT}[A-Za-z0-9-]+)*${DOT}[A-Za-z]{2,}\b|[A-Za-z0-9._%+-]+\s+at\s+[A-Za-z0-9-]+\s+dot\s+[A-Za-z]{2,}\b`, 'gi');
// Messenger-Namen: „skype: max.muster“, „Telegram-ID = maxi“, „discord maxi#1234“ – „Telegram bot“ (Auftrag) bleibt stehen
const MESSENGER = /\b(skype|discord|telegram|signal|whatsapp|wechat|snapchat|instagram|insta|kik|threema)([\s-]*(?:id|name|handle|user(?:name)?|nick))?\s*[:=]\s*@?[A-Za-z0-9_.#-]{2,}|\b(discord)\s+@?[A-Za-z0-9_.]{2,}#\d{4}\b/gi;
/** Kontaktdaten raus (Xander-Regel: keine Kontaktdaten speichern – der Link zur Anzeige reicht) */
export const ohneKontakt = s => String(s ?? '').replace(MAIL, '[Mail]').replace(MAIL_VERSTECKT, '[Mail]').replace(URL_, '[Link]')
  .replace(MESSENGER, (_, a, b, c) => `${a || c} [Name]`).replace(TEL, '[Telefon]').replace(HANDLE, '$1[Name]').replace(/\s+/g, ' ').trim();
const klar = s => entities(entities(String(s ?? ''))).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
/** Titel ohne Zähler/Zeitstempel am Ende („Learn VirtualDJ Mixing Online -- 5“, „Promo Video - 15/11/2026 20:10 EST“) – für „doppelt“ */
export const titelKern = s => String(s ?? '').replace(/\s*[-–—]+\s*\d{1,2}\/\d{1,2}\/\d{2,4}(\s+\d{1,2}:\d{2}(\s*[A-Z]{2,4})?)?\s*$/, '').replace(/\s*(--|[-–—#]|\()\s*\d{1,3}\)?\s*$/, '').trim();
export const kurz = (s, n = 180) => { const t = ohneKontakt(klar(s)); return t.length > n ? `${t.slice(0, n - 1).replace(/\s+\S*$/, '')} …` : t; };

// --- Bewertung -----------------------------------------------------------------------------------------------------------
/**
 * Welches Feld? Unterricht nur mit Unterrichts- UND Musikwort im Text selbst; sonst das Feld mit den meisten Treffern
 * (Gleichstand: vorgabe). tags = Fähigkeiten der Plattform (z. B. Freelancer „Sound Design“, „eLearning“): zählen für
 * KI/Bild & Video, für Unterricht nur als ausdrückliche Unterrichts-Fähigkeit (unterrichtTags, z. B. „Music Lessons“) –
 * echter Lauf 16.11.2026: „Reels Editor“/„Voiceover for eLearning“ landeten sonst über die Fähigkeiten im Unterricht.
 */
export function feldVon(text, w, vorgabe = null, tags = '', titel = null) {
  // Unterricht: Unterrichtswort im Titel, ausdrücklicher Lerner-Satz im Text („teach me“, „Klavierlehrer gesucht“) oder
  // Unterrichts-Fähigkeit – ein „lesson“/„learn“ irgendwo im Text eines Video-Auftrags reicht nicht (echter Lauf 16.11.2026)
  const lehr = enthaelt(titel ?? text, w.unterrichtWoerter) || enthaelt(text, w.lernWoerter || []) || (!!tags && enthaelt(tags, w.unterrichtTags || []));
  const musik = enthaelt(text, w.musikWoerter);
  if (lehr && musik) return 'unterricht';
  const voll = tags ? `${text} ${tags}` : text;
  const ki = zaehle(voll, w.kiWoerter), bv = zaehle(voll, w.bildvideoWoerter) + (musik || enthaelt(tags, w.musikWoerter) ? 1 : 0);
  if (!ki && !bv) return vorgabe && vorgabe !== 'unterricht' ? vorgabe : null;
  if (ki === bv) return vorgabe && vorgabe !== 'unterricht' ? vorgabe : 'ki';
  return ki > bv ? 'ki' : 'bildvideo';
}

// grobe Kurse (EUR je Einheit) – nur für „Aufwand“ und „Vergütung ≈ … €“, nicht zum Rechnen mit Geld
const KURS = { EUR: 1, USD: 0.86, GBP: 1.15, CHF: 1.07, AUD: 0.57, CAD: 0.62, NZD: 0.52, SGD: 0.66, HKD: 0.11, INR: 0.0098, PLN: 0.235, SEK: 0.09, NOK: 0.085, DKK: 0.134, JPY: 0.0057, ZAR: 0.049, PHP: 0.015, PKR: 0.0031, BRL: 0.16, MXN: 0.047, AED: 0.234, CNY: 0.12 };
export const inEuro = (betrag, code) => (betrag == null || !Number.isFinite(Number(betrag)) || !KURS[String(code || 'EUR').toUpperCase()] ? null : Math.round(Number(betrag) * KURS[String(code || 'EUR').toUpperCase()]));

/** Vergütung aus Text: „50 € pro Stunde“, „€300“, „300 EUR“, „$40/hr“ -> { eur, stunde, text } | null */
export function verguetungAusText(text) {
  const t = String(text || '');
  const Z = '(\\d{1,3}(?:[.,]\\d{3})+|\\d{1,6})(?:[.,]\\d{1,2})?';
  const m = t.match(new RegExp(`(?:(€|eur|\\$|usd|£|gbp)\\s?${Z}|${Z}\\s?(€|euro|eur|\\$|usd|£|gbp))(\\s?(?:\\/|pro|per|je|an|a)\\s?(?:std\\.?|stunde|h\\b|hr|hour))?`, 'i'));
  if (!m) return null;
  const zeichen = (m[1] || m[4] || '').toLowerCase(), zahlTxt = m[2] || m[3];
  const code = /€|eur/.test(zeichen) ? 'EUR' : /\$|usd/.test(zeichen) ? 'USD' : 'GBP';
  const betrag = Number(String(zahlTxt).replace(/[.,]/g, ''));
  if (!Number.isFinite(betrag) || betrag <= 0) return null;
  const stunde = !!m[5];
  return { eur: inEuro(betrag, code), stunde, text: `${Math.round(betrag)} ${code === 'EUR' ? '€' : code}${stunde ? ' pro Std.' : ''}` };
}

/** Welches Wort einer Wortliste („a|b|=c“-Gruppen) steht im Text? -> das gefundene Wort (ohne „=“) | null */
export function welchesWort(text, gruppen = []) {
  for (const g of gruppen) for (const alt of String(g).split('|')) if (alt.trim() && enthaelt(text, [alt])) return alt.trim().replace(/^=/, '');
  return null;
}

/** Betrug? -> { raus: grund } | { warnung: grund } | {} – der Grund nennt das GEFUNDENE Wort (Prüfer 16.11.2026: nicht das
 *  erste der Gruppe, sonst stand „contact me on whatsapp“ auch bei „outside the platform“) */
export function betrugPruefen(text, w) {
  const t = String(text || '');
  const raus = welchesWort(t, w.betrugWoerter || []);
  if (raus) return { raus: `Betrugsmuster („${raus}“)` };
  const warn = welchesWort(t, w.warnWoerter || []);
  return warn ? { warnung: `Vorsicht: „${warn}“ – nur über die Plattform schreiben, nie vorab zahlen` } : {};
}

/**
 * Nutzungsbedingungen verbieten das automatische Lesen? (config agbVerbot: [{ host, grund }]) -> Grund | null.
 * Gilt vor JEDEM Abruf (auch robots.txt). Ausnahme nur mit erlaubnis: true an der Quelle (schriftliche Erlaubnis/registrierte App).
 */
export function agbSperre(url, m, q = {}) {
  return agbGrund(url, m?.agbVerbot || [], q);
}

/**
 * Bewertung eines Treffers. f = { titel, text, feld, budget: { min, max, code, stunde }, ort, km, online, datum, gebote, ausschreibung }
 * -> { passt, aufwand, allein, verguetung, verguetungEur, alterTage, gruende: [] }
 */
export function bewerte(f, w, jetzt = new Date()) {
  const text = `${f.titel} ${f.text || ''}`;
  const gruende = [];
  let passt = 40;
  const staerken = Object.entries(w.staerkeWoerter || {}).filter(([, ws]) => enthaelt(text, ws)).map(([k]) => k);
  passt += Math.min(36, staerken.length * 12);
  if (staerken.length) gruende.push(staerken.join(', '));
  if (f.sprache === 'de' || enthaelt(text, w.deutschWoerter || [])) { passt += 10; gruende.push('deutsch'); }
  // aus der Gegend (Sachsen, Leipzig, Dresden, Döbeln … = config region): „Unternehmen hier in der Gegend“
  if (f.region?.length && f.region.some(o => new RegExp(`(^|[^\\p{L}])${o}(?![\\p{L}])`, 'iu').test(text))) { passt += 8; gruende.push('aus der Gegend'); }
  const schwach = zaehle(text, w.schwachWoerter || []);
  passt -= Math.min(30, schwach * 15);
  if (f.feld === 'unterricht') passt += 15;
  if (f.gebote > 40) passt -= 8;
  // Aufwand: Budget (in Euro) zuerst, dann Wörter
  const max = f.budget ? inEuro(f.budget.max ?? f.budget.min, f.budget.code) : null;
  const min = f.budget ? inEuro(f.budget.min, f.budget.code) : null;
  let aufwand = 'mittel';
  if (f.feld === 'unterricht') aufwand = 'klein';
  else if (f.budget && !f.budget.stunde && max != null) aufwand = max <= 300 ? 'klein' : max <= 1500 ? 'mittel' : 'groß';
  if (enthaelt(text, w.grossWoerter || [])) aufwand = 'groß';
  else if (enthaelt(text, w.kleinWoerter || []) && aufwand !== 'groß') aufwand = 'klein';
  if (f.ausschreibung && aufwand === 'klein') aufwand = 'mittel';
  const team = enthaelt(text, w.teamWoerter || []);
  const allein = aufwand !== 'groß' && !team && schwach === 0 && !f.ausschreibung;
  if (team) gruende.push('Team gesucht');
  if (allein) passt += 5;
  // Vergütung: Budget der Plattform, sonst aus dem Text
  let verguetung = '', verguetungEur = null;
  if (f.budget && (f.budget.min != null || f.budget.max != null)) {
    const code = String(f.budget.code || 'EUR').toUpperCase(), z = code === 'EUR' ? '€' : code;
    const a = Math.round(f.budget.min ?? f.budget.max), b = Math.round(f.budget.max ?? f.budget.min);
    verguetung = `${a === b ? a : `${a}–${b}`} ${z}${f.budget.stunde ? ' pro Std.' : ''}`;
    verguetungEur = f.budget.stunde ? inEuro(f.budget.max ?? f.budget.min, code) : max ?? min;
    if (code !== 'EUR' && verguetungEur != null) verguetung += ` (≈ ${f.budget.stunde ? inEuro(f.budget.max ?? f.budget.min, code) : max} €)`;
  } else {
    const v = verguetungAusText(text);
    if (v) { verguetung = v.text; verguetungEur = v.eur; }
  }
  const d = Date.parse(f.datum || '');
  const alterTage = Number.isFinite(d) ? Math.max(0, Math.floor((new Date(jetzt).getTime() - d) / 864e5)) : null;
  const stunde = f.budget ? !!f.budget.stunde : !!verguetungAusText(text)?.stunde;
  // Kaum Geld (Xander: „nebenbei etwas verdienen“): genannte Vergütung unter wenigEuro (Festpreis) bzw. wenigEuroStunde -> weiter unten
  const wenig = stunde ? (w.wenigEuroStunde ?? 10) : f.feld === 'unterricht' ? Math.round((w.wenigEuro ?? 30) / 2) : (w.wenigEuro ?? 30); // Unterricht: Preis je Stunde/Termin
  if (verguetungEur != null && verguetungEur < wenig) { passt -= 20; gruende.push('kaum Geld'); }
  return { passt: Math.max(0, Math.min(100, Math.round(passt))), aufwand, allein, verguetung, verguetungEur, stunde, alterTage, gruende };
}

// --- Freelancer.com -----------------------------------------------------------------------------------------------------
export const freelancerJobsUrl = namen => `${FL}/jobs/?${namen.map(n => `job_names%5B%5D=${encodeURIComponent(n)}`).join('&')}`;
export const freelancerProjekteUrl = (ids, limit = 100) => `${FL}/projects/active/?${ids.map(j => `jobs%5B%5D=${Number(j)}`).join('&')}&limit=${limit}&job_details=true&full_description=true`;
export const freelancerLink = seo => `https://www.freelancer.com/projects/${String(seo).replace(/^\/+/, '')}`;

/** Fähigkeiten (Zahlen oder Namen) -> IDs; Namen einmal im Monat über die API auflösen (Zustand) */
async function freelancerIds(holeText, jobs, zustand, jetztMs, hinweise, pruefeRobots = async () => ({ ok: true })) {
  const ids = jobs.filter(j => Number.isInteger(j));
  const namen = jobs.filter(j => typeof j === 'string' && j.trim());
  if (!namen.length) return ids;
  const z = ((zustand.quellen ||= {}).freelancerJobs ||= { zeit: null, ids: {} });
  const fehlt = namen.filter(n => !(n in z.ids));
  // robots.txt VOR dem ersten Abruf (Prüfer 16.11.2026: die Namens-Abfrage lief vor der Prüfung); verboten -> nur Zahlen-IDs,
  // den Hinweis gibt danach die Projekt-Abfrage
  const url = freelancerJobsUrl(namen);
  if ((fehlt.length || !(jetztMs - Date.parse(z.zeit || 0) < 30 * 864e5)) && (await pruefeRobots(url)).ok) {
    try {
      const j = JSON.parse(await holeText(url, { headers: { accept: 'application/json' } }));
      const liste = Array.isArray(j.result) ? j.result : Object.values(j.result || {});
      for (const n of namen) z.ids[n] = liste.find(x => norm(x?.name) === norm(n))?.id ?? null;
      z.zeit = new Date(jetztMs).toISOString();
    } catch (e) { hinweise.push(`Nebenverdienst: Freelancer-Fähigkeiten nicht auflösbar: ${e.message}`); }
  }
  return [...new Set([...ids, ...namen.map(n => z.ids[n]).filter(Number.isInteger)])];
}

function ausFreelancer(pr, q) {
  if (!pr?.seo_url || !pr.title || pr.deleted || (pr.frontend_project_status && pr.frontend_project_status !== 'open')) return null;
  const jobs = (pr.jobs || []).map(j => j?.name).filter(Boolean);
  const text = klar(pr.description || pr.preview_description || '');
  const city = pr.local && pr.location?.city ? pr.location.city : '';
  const b = pr.budget || {};
  return {
    // Titel ohne Kontaktdaten (Prüfer 16.11.2026: Telefon/Mail im Titel landeten sonst im öffentlichen Daten-Zweig)
    titel: ohneKontakt(klar(pr.title)), text,
    // „local“ ohne Stadt: vor Ort irgendwo – die API ohne Konto liefert die Stadt nie (echter Lauf: city=null bei allen 23)
    vorOrtOhneStadt: !!pr.local && !city, tags: jobs.join(' · '), auszugText: text, link: freelancerLink(pr.seo_url),
    datum: new Date(Number(pr.time_submitted || pr.submitdate) * 1000).toISOString(), quelle: 'Freelancer', art: 'freelancer', vorgabe: q.feld || null,
    budget: b.minimum != null || b.maximum != null ? { min: b.minimum ?? null, max: b.maximum ?? null, code: pr.currency?.code || 'USD', stunde: pr.type === 'hourly' } : null,
    gebote: pr.bid_stats?.bid_count ?? null, stadt: city, sprache: pr.language || null, upfront: !!pr.requires_upfront_funding,
    zusatz: pr.bid_stats?.bid_count != null ? `${pr.bid_stats.bid_count} ${pr.bid_stats.bid_count === 1 ? 'Gebot' : 'Gebote'}` : '',
  };
}

// --- RSS (z. B. hnrss.org „Seeking freelancer“) ------------------------------------------------------------------------------
function ausRss(it, q) {
  const roh = klar(it.beschreibung || '');
  if (q.nurMit?.length && !enthaelt(`${it.titel} ${roh}`, q.nurMit)) return null;
  // HN-Kommentare: der Titel heißt „New comment by <Name> in …“ -> erste Zeile des Kommentars als Titel (ohne Namen)
  let titel = klar(it.titel);
  if (/^new comment by /i.test(titel) || q.titelAusText) {
    // „SEEKING FREELANCER | Remote (EU) | Small PWA … . Budget …“ -> „Small PWA …“ (Ort steht in der Zeile)
    const teile = roh.replace(/^\s*seeking freelancer\s*[|:–-]?\s*/i, '').split(/\s+\|\s+/);
    const satz = teile.find(x => x.length > 25 && !/^(remote|onsite|on-site|hybrid)\b/i.test(x)) || teile.at(-1) || roh;
    titel = satz.split(/(?<=[.!?])\s/)[0];
  }
  titel = kurz(titel, 120);
  // Ausschreibungen (service.bund.de): Ort = „Erfüllungsort: 09111 Chemnitz“ – nicht die Vergabestelle (Prüfer 16.11.2026:
  // Wismut-Lose in Aue/Ronneburg standen als „Chemnitz 35 km“ da, weil die Vergabestelle in Chemnitz sitzt)
  const erfuellungsort = q.ausschreibung ? (/Erf(?:ü|ue)llungsort:\s*(.+?)\s*(?:Vergabestelle:|Angebotsfrist:|Ver(?:ö|oe)ffentlichungsende:|$)/i.exec(roh)?.[1] ?? null) : null;
  return { titel, text: roh, auszugText: roh, link: it.link, datum: it.datum, quelle: q.name || 'RSS', art: 'rss', vorgabe: q.feld || null, budget: null, gebote: null, stadt: '', ausschreibung: !!q.ausschreibung, erfuellungsort };
}

const SO = {
  freelancer: 'Auftrag auf Freelancer.com öffnen und ein Gebot abgeben (kostenloses Konto): was du machst, bis wann, Preis. Text unten.',
  rss: 'Anzeige öffnen und über die Seite antworten: kurz, was du machst, bis wann, Preis. Text unten.',
};

export default async function auftraege({ holeText, cfg, jetzt = new Date(), zustand = {} }) {
  const m = cfg.module.auftraege;
  const eintraege = [], fehler = [], hinweise = [];
  const jetztMs = new Date(jetzt).getTime();
  const maxTage = m.maxAlterTage ?? 21;
  const agent = agentAus(cfg.abruf?.userAgent) || 'meinvorteil-radar';
  const pruefeRobots = async url => (m.robotsPruefen === false ? { ok: true } : robotsErlaubt(url, { holeRoh: holeRohMit(holeText), zustand, agent, jetzt }));
  const funde = [];
  let gelesen = 0;
  const quellen = (m.quellen || []).filter(q => q && q.aktiv !== false);
  // Hosts, die nach Regeln nicht gelesen werden (Quellen-Liste der Seite: „gesperrt (Regeln)“, MV7)
  const regelSperren = new Set();
  const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return null; } };

  for (const q of quellen) {
    try {
      // eigene Liste + die des ganzen Radars (abruf.agbVerbot, MV6) – die Regel-Wache in main.mjs prüft dasselbe noch einmal
      const agb = agbSperre(q.art === 'freelancer' ? FL : q.url, { agbVerbot: [...(m.agbVerbot || []), ...(cfg.abruf?.agbVerbot || [])] }, q);
      if (agb) { hinweise.push(`Nebenverdienst: ${q.name || q.art} nicht gelesen – ${agb} (nur Such-Link)`); regelSperren.add(host(q.art === 'freelancer' ? FL : q.url)); continue; }
      if (q.art === 'freelancer') {
        const ids = await freelancerIds(holeText, [].concat(q.jobs || []), zustand, jetztMs, hinweise, pruefeRobots);
        if (!ids.length) { hinweise.push(`Nebenverdienst: ${q.name}: keine Fähigkeit gefunden`); continue; }
        const url = freelancerProjekteUrl(ids, q.limit ?? 100);
        const r = await pruefeRobots(url);
        if (!r.ok) { hinweise.push(`Nebenverdienst: ${q.name} nicht gelesen – ${r.grund} (nur Such-Link)`); if (!r.nichtLesbar) regelSperren.add(host(url)); continue; }
        const j = JSON.parse(await holeText(url, { headers: { accept: 'application/json' } }));
        if (j.status && j.status !== 'success') throw new Error(`Status ${j.status}`);
        gelesen++;
        for (const pr of j.result?.projects || []) { const f = ausFreelancer(pr, q); if (f) funde.push(f); }
      } else if (q.art === 'rss') {
        const r = await pruefeRobots(q.url);
        if (!r.ok) { hinweise.push(`Nebenverdienst: ${q.name} nicht gelesen – ${r.grund} (nur Such-Link)`); if (!r.nichtLesbar) regelSperren.add(host(q.url)); continue; }
        const liste = leseRss(await holeText(q.url));
        gelesen++;
        for (const it of liste) { const f = ausRss(it, q); if (f) funde.push(f); }
      }
    } catch (e) { hinweise.push(`Nebenverdienst: ${q.name || q.art}: ${e.message}`); }
  }
  if (quellen.length && !gelesen) fehler.push('Nebenverdienst: keine Quelle lesbar');

  // Prüfen, bewerten, sortieren
  const gesehen = new Set();
  const zahlen = { roh: funde.length, alt: 0, betrug: 0, passtNicht: 0, ort: 0, doppelt: 0 };
  const behalten = [];
  for (const f of funde.sort((a, b) => Date.parse(b.datum) - Date.parse(a.datum))) {
    const d = Date.parse(f.datum || '');
    if (!Number.isFinite(d) || jetztMs - d > maxTage * 864e5 || d - jetztMs > 864e5) { zahlen.alt++; continue; }
    const key = String(f.link).replace(/[?#].*$/, '').replace(/\/+$/, '').toLowerCase(), k2 = norm(titelKern(f.titel)).slice(0, 90);
    if (gesehen.has(key) || gesehen.has(k2)) { zahlen.doppelt++; continue; }
    // Sprache: nur Deutsch/Englisch (Plattform-Angabe; ohne Angabe: durchlassen)
    if (f.sprache && !/^(de|en)\b/i.test(f.sprache)) { zahlen.passtNicht++; continue; }
    const text = `${f.titel} ${f.text}`;
    const b = betrugPruefen(text, m);
    if (b.raus || f.upfront) { zahlen.betrug++; continue; }
    if (enthaelt(text, m.nichtWoerter || [])) { zahlen.passtNicht++; continue; }
    const feld = feldVon(text, m, f.vorgabe, f.tags || '', f.titel);
    if (!feld) { zahlen.passtNicht++; continue; }
    // Ort: Feld der Quelle (Freelancer „local“) > Text; vor Ort weiter als vorOrtKm (ohne „online/remote“) raus
    // Freelancer: nur Aufträge mit „local“ + Stadt sind vor Ort (eine Stadt im Text eines Online-Auftrags zählt nicht)
    if (f.vorOrtOhneStadt) { zahlen.ort++; continue; } // vor Ort, aber wo? (Freelancer ohne Konto) -> nicht „online“
    if (f.stadt && !ortNach(f.stadt)) { zahlen.ort++; continue; } // vor Ort in einer Stadt, die nicht in der Nähe liegt
    const o = f.art === 'freelancer' ? (f.stadt ? ortNach(f.stadt) : null) : f.erfuellungsort ? ortAus(f.erfuellungsort) : ortAus(f.titel) || ortAus(f.text);
    const vorOrt = !!o && (f.art === 'freelancer' || !istOnline(text));
    if (vorOrt && o.km > (m.vorOrtKm ?? 80)) { zahlen.ort++; continue; }
    if (f.ausschreibung && !vorOrt) { zahlen.ort++; continue; } // Ausschreibungen nur aus der Gegend (ohne Ort = nicht hier)
    const bw = bewerte({ ...f, text: `${f.text} ${f.tags || ''}`, feld, ort: o?.ort, km: o?.km ?? null, online: !vorOrt, region: cfg.region }, m, jetzt);
    if (bw.passt < (m.mindestPasst ?? 45)) { zahlen.passtNicht++; continue; }
    gesehen.add(key); gesehen.add(k2);
    behalten.push({ f, feld, o: vorOrt ? o : null, bw, warnung: b.warnung || null });
  }

  const liste = behalten.sort((a, b) => (b.bw.passt - a.bw.passt) || (Date.parse(b.f.datum) - Date.parse(a.f.datum))).slice(0, m.maxEintraege ?? 30);
  const nahKm = m.pushNahKm ?? 60, pushEur = m.pushMindestEuro ?? 100, pushEurStunde = m.pushMindestEuroStunde ?? 15;
  for (const { f, feld, o, bw, warnung } of liste) {
    const vorOrt = !!o;
    const frisch = Math.max(0, Math.round(10 * (1 - (jetztMs - Date.parse(f.datum)) / (maxTage * 864e5))));
    // Push nur für neue, gut passende Treffer in der Nähe – oder online mit Vergütung (Xander: „ein bisschen Geld nebenbei“)
    const bezahlt = bw.verguetungEur != null && bw.verguetungEur >= (bw.stunde ? pushEurStunde : pushEur);
    const sofort = !warnung && bw.allein && bw.passt >= (m.pushMindestPasst ?? 70) && bw.alterTage != null && bw.alterTage <= 2
      && ((vorOrt && o.km <= nahKm) || (!vorOrt && bezahlt));
    eintraege.push(eintrag({
      kategorie: 'auftraege', titel: f.titel, quelle: f.quelle, link: f.link, datum: f.datum, jetzt, art: 'aufruf', fensterStunden: maxTage * 24,
      zeile: [FELD_NAME[feld], vorOrt ? (o.km <= 3 ? `${o.ort} · hier` : `${o.ort} · ${o.km} km`) : 'online', bw.verguetung, `Aufwand ${bw.aufwand}`, bw.allein ? 'allein machbar' : 'eher im Team', `vom ${datumDe(berlinTag(f.datum))}`, f.zusatz || ''].filter(Boolean).join(' · '),
      soGehts: SO[f.art] || SO.rss, wert: bw.passt, sofort, grund: feld,
      extra: {
        typ: 'gesuch', gesuch: true, feld, passt: bw.passt, aufwand: bw.aufwand, allein: bw.allein, verguetung: bw.verguetung || null,
        verguetungEur: bw.verguetungEur, alterTage: bw.alterTage, ort: vorOrt ? o.ort : 'online', km: vorOrt ? o.km : null, online: !vorOrt,
        warnung, gruende: bw.gruende.slice(0, 4), auszug: kurz(f.auszugText || f.text) || null, sprache: f.sprache || null,
        frist: null, bewerbung: { art: 'seite', ziel: f.link }, quelle: f.quelle,
        sortWert: bw.passt + nahPunkte(vorOrt ? o.km : null, !vorOrt) + frisch,
      },
    }));
  }

  // Fertige Suchen (immer): Plattformen ohne offenen Zugang bzw. mit Verbot in der robots.txt
  const fund = fundortEintraege((m.suchLinks || []).map(s => ({ typ: 'suche', ...s })), { kategorie: 'auftraege', jetzt, kuenstler: cfg.kuenstler });
  for (const e of fund) {
    const s = (m.suchLinks || []).find(x => x.link === e.link); e.extra.feld = s?.feld || null; e.extra.gesuch = true;
    e.zeile = String(e.zeile || '').replace(/^([^·]+?) · [0-3] km\b/, '$1 · hier'); // „Döbeln · 0 km“ -> „Döbeln · hier“ (wie die Seite)
  }
  eintraege.push(...fund);
  return { eintraege, fehler, hinweise, kurz: { ...zahlen, treffer: liste.length, gelesen }, regelSperren: [...regelSperren].filter(Boolean) };
}
