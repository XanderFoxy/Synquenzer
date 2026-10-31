// Modul "tests": Produkttester-Aufrufe (Technik, Snacks) und Gewinnspiele – nur attraktiv, realistisch und ohne Fallen.
import { enthaelt, zaehle, datumDe } from '../lib/text.mjs';
import { berlinTag } from '../lib/ende.mjs';
import { dealPruefer, istMydealzDeal } from '../lib/mydealz.mjs';
import { sammleFeeds, eintrag, googleNews, istRegional } from './gemeinsam.mjs';

export function bewerteTest(text, m, cfg) {
  if (enthaelt(text, m.fallenWoerter)) return null;
  const test = enthaelt(text, m.testWoerter);
  const gewinn = enthaelt(text, m.gewinnWoerter);
  if (!test && !gewinn) return null;
  const thema = Math.min(3, zaehle(text, m.themaWoerter));
  if (!thema) return null;
  const leicht = zaehle(text, m.leichtWoerter);
  const regional = istRegional(text, cfg);
  // Gewinnspiele brauchen ein attraktives Thema UND ein Zeichen für wenig Konkurrenz oder wenig Aufwand
  if (gewinn && !test && !(regional || leicht)) return null;
  return { art: test ? 'test' : 'gewinnspiel', wert: 35 + thema * 10 + leicht * 8 + (regional ? 15 : 0), regional };
}

// Anzeigefenster ohne bekanntes Ende (lib/ende.mjs): Freebies 7 Tage, mydealz-Gewinnspiele und Nachrichten 14 Tage
const artVon = it => (/news\.google/.test(it.feedInfo.url) ? 'nachricht' : /gewinnspiel/.test(it.feedInfo.url) ? 'gewinnspiel' : 'freebie');

export default async function tests({ holeText, cfg, jetzt, zustand }) {
  const m = cfg.module.tests;
  const feeds = [...m.feeds, ...m.news.map(q => ({ name: `Nachrichten ${q}`, url: googleNews(`${q} when:21d`), maxAlterTage: 21 }))];
  const { items, fehler } = await sammleFeeds(holeText, feeds, { jetzt });
  const pruefer = dealPruefer({ holeText, zustand, jetzt });
  const eintraege = [];
  for (const it of items) {
    const text = `${it.titel} ${it.beschreibung}`;
    const b = bewerteTest(text, m, cfg);
    if (!b) continue;
    // Teilnahmeschluss aus dem Text (vorbei -> schon in sammleFeeds raus); mydealz: abgelaufen laut Deal-Seite -> raus
    if (istMydealzDeal(it.link) && (await pruefer.pruefe(it.link, { neuNachStunden: 12 })).info?.abgelaufen) continue;
    const frist = it.bis ? berlinTag(it.bis) : null;
    eintraege.push(eintrag({
      kategorie: 'tests', titel: it.titel, quelle: it.herkunft || it.feed, link: it.link, datum: it.datum, jetzt,
      bis: it.bis, ab: it.ab, art: artVon(it),
      zeile: [b.art === 'test' ? 'Produkttest' : 'Gewinnspiel', b.regional ? 'regional (weniger Konkurrenz)' : '', frist ? `bis ${datumDe(frist)}` : 'Teilnahmeschluss unbekannt'].filter(Boolean).join(' · '),
      soGehts: b.art === 'test'
        ? 'Link öffnen, kurzes Bewerbungsformular ausfüllen (Name, Adresse, 2 Sätze warum). Nie Geld oder Kontodaten angeben.'
        : 'Link öffnen, nur mitmachen, wenn es beim Veranstalter selbst ist und nichts kostet. Keine Telefonnummer, kein Newsletter-Zwang.',
      wert: b.wert, grund: b.art,
    }));
  }
  return { eintraege, fehler };
}
