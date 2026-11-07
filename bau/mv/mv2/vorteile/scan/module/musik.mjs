// Modul "musik": (1) Wunsch-Geräte (wunschliste.json) – Preisstürze und Tiefstpreise über mydealz-Suche und optional Geizhals,
// eigene Preis-Historie im Zustand. (2) "Bands gesucht"/Open Calls für elektronische Acts (Google-News-Suche).
// (3) Remix-Contests mit Stems, passend zu Synth-Pop, 80er, Italo, Euro-Disco, Elektro, Dark Wave, New Wave (Xander 07.11.2026).
import { enthaelt, zaehle, parsePrice, euro, norm, tageBis, datumDe, round, alterTage } from '../lib/text.mjs';
import { berlinTag, berlinIso } from '../lib/ende.mjs';
import { preisAngaben } from '../lib/mydealz.mjs';
import { sammleFeeds, eintrag, mydealzSuche, googleNews, istRegional } from './gemeinsam.mjs';

const heuteVon = d => new Date(d).toISOString().slice(0, 10);

export function geizhalsPreis(html) {
  const m = String(html).match(/"lowPrice"\s*:\s*"?(\d+(?:\.\d{1,2})?)/) || String(html).match(/itemprop="price"\s+content="(\d+(?:\.\d{1,2})?)"/);
  return m ? Number(m[1]) : null;
}

// Preis in die Historie; liefert { tiefst, tage } VOR dem Eintragen (Vergleich mit der Vergangenheit)
export function merkePreis(zustand, name, preis, jetzt, behaltenTage = 400) {
  const v = ((zustand.musik ||= {})[name] ||= { tage: {}, tiefst: null });
  const vorher = { tiefst: v.tiefst, tage: Object.keys(v.tage).length };
  const tag = heuteVon(jetzt);
  v.tage[tag] = Math.min(v.tage[tag] ?? Infinity, preis);
  if (!v.tiefst || preis < v.tiefst.p) v.tiefst = { p: preis, tag };
  const grenze = heuteVon(new Date(jetzt).getTime() - behaltenTage * 864e5);
  for (const t of Object.keys(v.tage)) if (t < grenze) delete v.tage[t];
  return vorher;
}

function geraetePasst(text, g, liste) {
  const woerter = norm(g.suche).split(' ').filter(Boolean);
  if (!woerter.every(w => norm(text).includes(w))) return false;
  return !enthaelt(text, [...(liste.zubehoerWoerter || []), ...(g.nicht || [])]);
}

export async function geraete({ holeText, cfg, wunschliste, zustand, jetzt }) {
  const eintraege = [], fehler = [];
  for (const g of wunschliste.geraete || []) {
    if (g.aktiv === false) continue;
    const funde = [];
    try {
      const { items, fehler: f } = await sammleFeeds(holeText, [{ name: `mydealz „${g.suche}“`, url: mydealzSuche(g.suche), maxAlterTage: 14 }], { jetzt });
      fehler.push(...f);
      for (const it of items) {
        const preis = parsePrice(it.preisText);
        if (preis == null || !geraetePasst(it.titel, g, wunschliste)) continue;
        funde.push({ preis, link: it.link, shop: it.shop || 'Online', titel: it.titel, quelle: 'mydealz', datum: it.datum, temperatur: it.temperatur, bis: it.bis });
      }
    } catch (e) { fehler.push(`${g.name}: ${e.message}`); }
    if (g.geizhals) {
      try {
        const p = geizhalsPreis(await holeText(g.geizhals));
        if (p) funde.push({ preis: p, link: g.geizhals, shop: 'Geizhals (günstigster Shop)', titel: g.name, quelle: 'Geizhals', datum: jetzt });
      } catch (e) { fehler.push(`Geizhals ${g.name}: ${e.message}`); }
    }
    // unplausible Preise (Zubehör, Tippfehler) raus
    const ok = funde.filter(f => !g.normalpreis || (f.preis >= g.normalpreis * 0.4 && f.preis <= g.normalpreis * 1.3)).sort((a, b) => a.preis - b.preis);
    if (!ok.length) continue;
    const b = ok[0];
    const vorher = merkePreis(zustand, g.name, b.preis, jetzt);
    const tiefstpreis = vorher.tiefst && vorher.tage >= 7 && b.preis <= vorher.tiefst.p;
    const unterZiel = g.zielpreis && b.preis <= g.zielpreis;
    const rabatt = g.normalpreis ? round(1 - b.preis / g.normalpreis, 2) : null;
    if (!(unterZiel || tiefstpreis || rabatt >= 0.15)) continue;
    eintraege.push(eintrag({
      kategorie: 'musik', titel: `${g.name}: ${euro(b.preis)} bei ${b.shop}`, link: b.link, quelle: b.quelle, datum: b.datum, jetzt,
      bis: b.bis || null, art: 'deal',
      preise: preisAngaben({ preis: b.preis, preisVorher: g.normalpreis, vorherQuelle: g.normalpreis ? 'deine Schätzung (wunschliste.json)' : null }),
      zeile: [g.normalpreis ? `sonst ca. ${euro(g.normalpreis)}` : '', rabatt > 0 ? `−${Math.round(rabatt * 100)} %` : '', tiefstpreis ? 'Tiefstpreis' : '', unterZiel ? 'unter deinem Zielpreis' : ''].filter(Boolean).join(' · '),
      soGehts: 'Link öffnen, Versand und Händler prüfen (Thomann/Musicstore/Just Music sind sicher), mit PayPal oder Rechnung zahlen – 30 Tage Rückgabe nutzen, wenn er nicht gefällt.',
      wert: 55 + (unterZiel ? 25 : 0) + (tiefstpreis ? 15 : 0) + Math.max(0, (rabatt ?? 0) * 40),
      sofort: !!(unterZiel || tiefstpreis), grund: unterZiel ? 'Zielpreis erreicht' : tiefstpreis ? 'historischer Tiefstpreis' : 'Preissturz',
      extra: { geraet: g.name, preis: b.preis, tiefst: vorher.tiefst?.p ?? null },
    }));
  }
  return { eintraege, fehler };
}

export async function aufrufe({ holeText, cfg, jetzt }) {
  const m = cfg.module.musik;
  const eintraege = [];
  const { items, fehler } = await sammleFeeds(holeText, m.aufrufe.map(q => ({ name: `Nachrichten „${q}“`, url: googleNews(`${q} when:30d`) })), { jetzt, maxAlterTage: 30 });
  for (const it of items) {
    const text = `${it.titel} ${it.beschreibung}`;
    if (m.remix && istRemixContest(text, m.remix)) continue; // steht unter Remix-Contests, nicht doppelt
    if (!enthaelt(text, m.aufrufWoerter) || !enthaelt(text, ['band', 'bands', 'musiker', 'künstler|kuenstler', 'act', 'acts', 'artists', 'musikerinnen'])) continue;
    if (enthaelt(text, m.nichtWoerter)) continue;
    const frist = it.bis ? berlinTag(it.bis) : null; // vorbei -> schon in sammleFeeds raus
    const rest = tageBis(frist, jetzt);
    const regional = istRegional(text, cfg);
    const genre = Math.min(2, zaehle(text, m.genreWoerter));
    eintraege.push(eintrag({
      kategorie: 'musik', titel: it.titel, quelle: it.herkunft || 'Google News', link: it.link, datum: it.datum, jetzt,
      bis: it.bis, ab: it.ab, art: 'aufruf',
      zeile: ['Bands gesucht', regional ? 'in der Region' : 'Deutschland', frist ? `Frist ${datumDe(frist)}` : ''].filter(Boolean).join(' · '),
      soGehts: 'Ausschreibung öffnen und Bedingungen lesen. Bewerbung = 3 Sätze über dich + 1 Hörlink + 1 Foto (Vorlage unten auf der Seite).',
      wert: 40 + (regional ? 20 : 0) + genre * 10 + (frist ? 10 : 0),
      sofort: !!frist && rest >= 2 && rest <= 60 && (regional || genre > 0), grund: frist ? 'Bewerbung mit Frist' : 'Aufruf',
    }));
  }
  return { eintraege, fehler };
}

// --- (3) Remix-Contests ---------------------------------------------------------------------------------------------
// Google News in der englischen Ausgabe (die meisten Contests sind englisch); die deutsche Suche läuft über googleNews.
export const googleNewsEn = q => `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`;
export const istRemixContest = (text, r) => enthaelt(text, r.contestWoerter);

const MONAT_EN = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
// „Deadline: December 15, 2026“, „closes 15 Dec“, „submissions close on Nov 30th“, „entries due by 1st of December“
const FRIST_EN = /\b(deadline|closes?|closing date|ends?|until|due|submit (?:it )?by|submissions? (?:close|end|due)|entries (?:close|due))\b\s*(?:on|is|by|date)?\s*[:\-–]?\s*(?:(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?([a-z]{3,9})\.?|([a-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b)(?:,?\s*(\d{4}))?/gi;

/** Einsendeschluss aus englischem Text -> ISO (23:59:59 Berliner Zeit) | null. Ohne Jahr: dieses, liegt es > 2 Monate zurück, das nächste. */
export function englischeFrist(text, jetzt = new Date()) {
  const j = new Date(jetzt);
  for (const m of String(text || '').matchAll(FRIST_EN)) {
    const tag = Number(m[2] ?? m[5]);
    const monat = MONAT_EN[String(m[3] ?? m[4]).toLowerCase().slice(0, 3)];
    if (!monat || !(tag >= 1 && tag <= 31)) continue;
    let jahr = m[6] ? Number(m[6]) : j.getUTCFullYear();
    if (!m[6] && Date.UTC(jahr, monat - 1, tag) < j.getTime() - 60 * 864e5) jahr++;
    return berlinIso(jahr, monat, tag);
  }
  return null;
}

/**
 * Remix-Contests: Contest-Wort + mindestens ein Genre-Wort; ein Contest mit Hip-Hop/Metal/Schlager-Wort nur mit zwei
 * Genre-Treffern (sonst ist er ein reiner Hip-Hop-/Metal-/Schlager-Contest). Nur laufende: Einsendeschluss in der
 * Zukunft (deutsch über sammleFeeds, englisch über englischeFrist), ohne Einsendeschluss höchstens maxAlterTage alt.
 * Push: Zusammenfassung; sofort nur, wenn der Einsendeschluss in ≤ sofortBisTage Tagen ist.
 */
export function bewerteRemix(it, r, jetzt = new Date()) {
  const text = `${it.titel} ${it.beschreibung || ''}`;
  if (!istRemixContest(text, r)) return { grund: 'kein Remix-Contest' };
  const genre = zaehle(text, r.genreWoerter);
  if (!genre) return { grund: 'Genre passt nicht' };
  if (enthaelt(text, r.nichtWoerter) && genre < 2) return { grund: 'Hip-Hop/Metal/Schlager' };
  const jetztMs = new Date(jetzt).getTime();
  const bis = it.bis || englischeFrist(`${it.titel} ${it.langtext || it.beschreibung || ''}`, jetzt);
  if (bis && Date.parse(bis) <= jetztMs) return { grund: 'Einsendeschluss vorbei' };
  if (!bis && alterTage(it.datum, jetzt) > (r.maxAlterTage ?? 30)) return { grund: 'zu alt' };
  const frist = bis ? berlinTag(bis) : null;
  const rest = frist ? tageBis(frist, jetzt) : null;
  const stems = enthaelt(text, ['stems|stem pack|stem-pack|stem files|multitracks|multitrack|einzelspuren']);
  return { ok: true, genre, bis, frist, rest, stems, sofort: rest != null && rest >= 0 && rest <= (r.sofortBisTage ?? 14) };
}

export async function remixContests({ holeText, cfg, jetzt }) {
  const r = cfg.module.musik.remix;
  if (!r) return { eintraege: [], fehler: [] };
  const alter = r.maxAlterTage ?? 30;
  const feeds = [
    ...(r.suchen || []).map(q => ({ name: `Nachrichten „${q}“`, url: googleNews(`${q} when:${alter}d`), maxAlterTage: alter })),
    ...(r.suchenEnglisch || []).map(q => ({ name: `News „${q}“`, url: googleNewsEn(`${q} when:${alter}d`), maxAlterTage: alter })),
    ...(r.feeds || []),
  ];
  const { items, fehler } = await sammleFeeds(holeText, feeds, { jetzt, maxAlterTage: alter });
  const eintraege = [];
  for (const it of items) {
    const b = bewerteRemix(it, r, jetzt);
    if (!b.ok) continue;
    eintraege.push(eintrag({
      kategorie: 'musik', titel: it.titel, quelle: it.herkunft || it.feed, link: it.link, datum: it.datum, jetzt,
      bis: b.bis, bisQuelle: b.bis ? 'text' : null, art: 'aufruf',
      zeile: ['Remix-Contest', b.stems ? 'mit Stems' : '', b.frist ? `Einsendeschluss ${datumDe(b.frist)}` : 'Einsendeschluss im Link'].filter(Boolean).join(' · '),
      soGehts: 'Contest öffnen, Regeln lesen (Rechte, Format, Länge), Stems laden und den Remix vor dem Einsendeschluss hochladen.',
      wert: 45 + Math.min(3, b.genre) * 10 + (b.stems ? 10 : 0) + (b.frist ? 10 : 0),
      sofort: b.sofort, grund: 'Remix-Contest',
      extra: { art: 'remix', stems: b.stems },
    }));
  }
  return { eintraege, fehler };
}

export default async function musik(ctx) {
  const a = ctx.cfg.module.musik.geraeteSuche === false ? { eintraege: [], fehler: [] } : await geraete(ctx);
  const b = await aufrufe(ctx);
  const c = await remixContests(ctx);
  return { eintraege: [...a.eintraege, ...b.eintraege, ...c.eintraege], fehler: [...a.fehler, ...b.fehler, ...c.fehler] };
}
