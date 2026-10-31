// Modul "erleben": Therme/Erlebnisbad, Kino, Freizeit, Stadtfeste in der Region – nur, wenn es ungewöhnlich gut ist.
// Hinweis: Die mydealz-Suche als RSS gibt es nicht mehr (HTTP 404, Stand 31.10.2026) – dann kommen nur Nachrichten.
import { enthaelt, zaehle, parsePrice, euro, round } from '../lib/text.mjs';
import { dealPruefer, altpreisAusText, preisAngaben } from '../lib/mydealz.mjs';
import { sammleFeeds, eintrag, mydealzSuche, googleNews, istRegional } from './gemeinsam.mjs';

export default async function erleben({ holeText, cfg, jetzt, zustand }) {
  const m = cfg.module.erleben;
  const eintraege = [];
  const jetztMs = new Date(jetzt).getTime();
  const feeds = [
    ...m.suchen.map(q => ({ name: `mydealz „${q}“`, url: mydealzSuche(q), art: 'deal', maxAlterTage: 10 })),
    ...m.news.map(q => ({ name: `Nachrichten „${q}“`, url: googleNews(`${q} when:21d`), art: 'news', maxAlterTage: 21 })),
  ];
  const { items, fehler } = await sammleFeeds(holeText, feeds, { jetzt });
  const pruefer = dealPruefer({ holeText, zustand, jetzt });
  for (const it of items) {
    const text = `${it.titel} ${it.beschreibung}`;
    const regional = istRegional(text, cfg);
    const bundesweit = enthaelt(text, m.bundesweitWoerter);
    if (!regional && !(it.feedInfo.art === 'deal' && bundesweit)) continue;
    const gut = zaehle(text, m.gutWoerter);
    if (it.feedInfo.art === 'deal') {
      const preis = parsePrice(it.preisText);
      const altInfo = altpreisAusText(text, preis);
      const alt = altInfo?.preis ?? null;
      const rabatt = preis != null && alt ? round(1 - preis / alt, 2) : null;
      const heiss = (it.temperatur ?? 0) >= m.minTemperatur;
      if (!heiss && !(rabatt >= 0.4) && gut < 2) continue;
      const s = await pruefer.pruefe(it.link, { neuNachStunden: 6 });
      if (s.info?.abgelaufen) continue;
      if (s.info?.ende && Date.parse(s.info.ende) <= jetztMs) continue; // Ende laut Deal-Seite schon vorbei
      const endeSeite = s.info?.ende || null;
      eintraege.push(eintrag({
        kategorie: 'erleben', titel: it.titel, quelle: it.feed, link: it.link, datum: it.datum, jetzt,
        bis: it.bis || endeSeite, bisQuelle: it.bis ? 'text' : endeSeite ? 'deal-seite' : null, ab: it.ab, art: 'deal',
        zeile: [preis != null ? `${euro(preis)}${alt ? ` statt ${euro(alt)}` : ''}` : '', rabatt >= 0.1 ? `−${Math.round(rabatt * 100)} %` : '', regional ? 'in der Nähe' : 'bundesweit'].filter(Boolean).join(' · '),
        soGehts: 'Link öffnen, Gutschein/Ticket online kaufen und aufs Handy laden – Einlösefrist im Kalender notieren.',
        wert: 45 + (heiss ? 20 : 0) + (rabatt >= 0.5 ? 20 : rabatt >= 0.4 ? 10 : 0) + (regional ? 10 : 0) + gut * 3,
        sofort: (rabatt >= 0.6 || (it.temperatur ?? 0) >= 1000) && regional, grund: heiss ? 'viele Daumen hoch' : 'großer Rabatt',
        preise: preisAngaben({ preis, preisVorher: alt, vorherQuelle: altInfo?.quelle }),
      }));
    } else {
      // Nachrichten zu Festen/Veranstaltungen: nur regional und mit "gut"-Signal (gratis, Eintritt frei, …).
      // Google News hat kein Ende -> bis nur aus dem Text, sonst 14 Tage ab Veröffentlichung.
      if (!regional || gut < 1) continue;
      eintraege.push(eintrag({
        kategorie: 'erleben', titel: it.titel, quelle: it.herkunft || it.feed, link: it.link, datum: it.datum, jetzt,
        bis: it.bis, ab: it.ab, art: 'nachricht',
        zeile: 'Veranstaltung in der Nähe', soGehts: 'Artikel lesen, Datum und Ort in den Kalender – hingehen nur, wenn es sich gut anfühlt.',
        wert: 35 + gut * 5, grund: 'Fest/Event',
      }));
    }
  }
  return { eintraege, fehler };
}
