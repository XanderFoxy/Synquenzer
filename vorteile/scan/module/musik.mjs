// Modul "musik": (1) Wunsch-Geräte (wunschliste.json) – Preisstürze und Tiefstpreise über mydealz-Suche und optional Geizhals,
// eigene Preis-Historie im Zustand. (2) "Bands gesucht"/Open Calls für elektronische Acts (Google-News-Suche).
import { enthaelt, zaehle, parsePrice, euro, norm, fristAus, tageBis, datumDe, round } from '../lib/text.mjs';
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
        funde.push({ preis, link: it.link, shop: it.shop || 'Online', titel: it.titel, quelle: 'mydealz', datum: it.datum, temperatur: it.temperatur });
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
      kategorie: 'musik', titel: `${g.name}: ${euro(b.preis)} bei ${b.shop}`, link: b.link, quelle: b.quelle, datum: b.datum,
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
    if (!enthaelt(text, m.aufrufWoerter) || !enthaelt(text, ['band', 'bands', 'musiker', 'künstler|kuenstler', 'act', 'acts', 'artists', 'musikerinnen'])) continue;
    if (enthaelt(text, m.nichtWoerter)) continue;
    const frist = fristAus(text, jetzt);
    const rest = tageBis(frist, jetzt);
    if (rest != null && rest < 0) continue;
    const regional = istRegional(text, cfg);
    const genre = Math.min(2, zaehle(text, m.genreWoerter));
    eintraege.push(eintrag({
      kategorie: 'musik', titel: it.titel, quelle: it.herkunft || 'Google News', link: it.link, datum: it.datum, frist,
      zeile: ['Bands gesucht', regional ? 'in der Region' : 'Deutschland', frist ? `Frist ${datumDe(frist)}` : ''].filter(Boolean).join(' · '),
      soGehts: 'Ausschreibung öffnen und Bedingungen lesen. Bewerbung = 3 Sätze über dich + 1 Hörlink + 1 Foto (Vorlage unten auf der Seite).',
      wert: 40 + (regional ? 20 : 0) + genre * 10 + (frist ? 10 : 0),
      sofort: !!frist && rest >= 2 && rest <= 60 && (regional || genre > 0), grund: frist ? 'Bewerbung mit Frist' : 'Aufruf',
    }));
  }
  return { eintraege, fehler };
}

export default async function musik(ctx) {
  const a = ctx.cfg.module.musik.geraeteSuche === false ? { eintraege: [], fehler: [] } : await geraete(ctx);
  const b = await aufrufe(ctx);
  return { eintraege: [...a.eintraege, ...b.eintraege], fehler: [...a.fehler, ...b.fehler] };
}
