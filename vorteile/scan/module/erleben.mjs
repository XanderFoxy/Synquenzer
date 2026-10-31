// Modul "erleben": Therme/Erlebnisbad, Kino, Freizeit, Stadtfeste in der Region – nur, wenn es ungewöhnlich gut ist.
import { enthaelt, zaehle, parsePrice, altpreisAus, euro, fristAus, round } from '../lib/text.mjs';
import { sammleFeeds, eintrag, mydealzSuche, googleNews, istRegional } from './gemeinsam.mjs';

export default async function erleben({ holeText, cfg, jetzt }) {
  const m = cfg.module.erleben;
  const eintraege = [];
  const feeds = [
    ...m.suchen.map(q => ({ name: `mydealz „${q}“`, url: mydealzSuche(q), art: 'deal', maxAlterTage: 10 })),
    ...m.news.map(q => ({ name: `Nachrichten „${q}“`, url: googleNews(`${q} when:21d`), art: 'news', maxAlterTage: 21 })),
  ];
  const { items, fehler } = await sammleFeeds(holeText, feeds, { jetzt });
  for (const it of items) {
    const text = `${it.titel} ${it.beschreibung}`;
    const regional = istRegional(text, cfg);
    const bundesweit = enthaelt(text, m.bundesweitWoerter);
    if (!regional && !(it.feedInfo.art === 'deal' && bundesweit)) continue;
    const gut = zaehle(text, m.gutWoerter);
    if (it.feedInfo.art === 'deal') {
      const preis = parsePrice(it.preisText);
      const alt = altpreisAus(text);
      const rabatt = preis != null && alt ? round(1 - preis / alt, 2) : null;
      const heiss = (it.temperatur ?? 0) >= m.minTemperatur;
      if (!heiss && !(rabatt >= 0.4) && gut < 2) continue;
      eintraege.push(eintrag({
        kategorie: 'erleben', titel: it.titel, quelle: it.feed, link: it.link, datum: it.datum,
        zeile: [preis != null ? `${euro(preis)}${alt ? ` statt ${euro(alt)}` : ''}` : '', rabatt >= 0.1 ? `−${Math.round(rabatt * 100)} %` : '', regional ? 'in der Nähe' : 'bundesweit'].filter(Boolean).join(' · '),
        soGehts: 'Link öffnen, Gutschein/Ticket online kaufen und aufs Handy laden – Einlösefrist im Kalender notieren.',
        wert: 45 + (heiss ? 20 : 0) + (rabatt >= 0.5 ? 20 : rabatt >= 0.4 ? 10 : 0) + (regional ? 10 : 0) + gut * 3,
        sofort: (rabatt >= 0.6 || (it.temperatur ?? 0) >= 1000) && regional, grund: heiss ? 'viele Daumen hoch' : 'großer Rabatt',
        frist: fristAus(text, jetzt),
      }));
    } else {
      // Nachrichten zu Festen/Veranstaltungen: nur regional und mit "gut"-Signal (gratis, Eintritt frei, …)
      if (!regional || gut < 1) continue;
      eintraege.push(eintrag({
        kategorie: 'erleben', titel: it.titel, quelle: it.herkunft || it.feed, link: it.link, datum: it.datum,
        zeile: 'Veranstaltung in der Nähe', soGehts: 'Artikel lesen, Datum und Ort in den Kalender – hingehen nur, wenn es sich gut anfühlt.',
        wert: 35 + gut * 5, frist: fristAus(text, jetzt), grund: 'Fest/Event',
      }));
    }
  }
  return { eintraege, fehler };
}
