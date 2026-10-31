// Modul "nebenverdienst": Deutschunterricht/Nachhilfe, Übersetzung (Deutsch↔Arabisch/Englisch), KI-Bild/Video, kleine kreative Jobs.
// Quelle: Jobsuche-API der Bundesagentur für Arbeit (offen, fester öffentlicher Schlüssel) + optionale RSS-Feeds.
import { enthaelt, zaehle } from '../lib/text.mjs';
import { sammleFeeds, eintrag } from './gemeinsam.mjs';

export function baUrl(ba, s) {
  const u = new URL(ba.api);
  u.searchParams.set('was', s.was);
  if (s.wo) u.searchParams.set('wo', s.wo);
  if (s.umkreis) u.searchParams.set('umkreis', String(s.umkreis));
  if (s.arbeitszeit) u.searchParams.set('arbeitszeit', s.arbeitszeit);
  u.searchParams.set('angebotsart', '1');
  u.searchParams.set('veroeffentlichtseit', String(ba.tageZurueck ?? 14));
  u.searchParams.set('size', '25');
  return u.toString();
}

const NAECHSTER_SCHRITT = {
  deutsch: 'Anzeige öffnen, kurze Nachricht schicken: wer du bist, dass du Deutsch unterrichtest (auch online), wann du Zeit hast. Vorlage unten.',
  uebersetzung: 'Anzeige öffnen, Sprachpaar und Preis pro Wort/Seite nennen; Probeabsatz anbieten. Arabisch: KI-Entwurf + Korrektur durch deine Kontakte.',
  kreativ: 'Anzeige öffnen, 2–3 Beispielbilder/-videos als Link schicken und eine feste Pauschale nennen.',
  allgemein: 'Anzeige öffnen und kurz anfragen, ob es auch von zu Hause und in Teilzeit geht.',
};
const art = text => (enthaelt(text, ['deutsch', 'daf|daz', 'nachhilfe', 'sprachlehr|sprachkurs']) && !enthaelt(text, ['übersetz|uebersetz']) ? 'deutsch'
  : enthaelt(text, ['übersetz|uebersetz|dolmetsch|lektorat']) ? 'uebersetzung'
  : enthaelt(text, ['bild', 'video', 'grafik', 'design', 'schnitt', 'ki|ai']) ? 'kreativ' : 'allgemein');

export default async function nebenverdienst({ holeText, cfg, jetzt }) {
  const m = cfg.module.nebenverdienst;
  const eintraege = [], fehler = [];
  const gesehen = new Set();
  for (const s of m.ba.suchen) {
    try {
      const j = JSON.parse(await holeText(baUrl(m.ba, s), { headers: { 'X-API-Key': m.ba.key, accept: 'application/json' } }));
      for (const st of j.stellenangebote || []) {
        if (!st.refnr || gesehen.has(st.refnr)) continue;
        gesehen.add(st.refnr);
        const text = `${st.titel || ''} ${st.beruf || ''} ${st.arbeitgeber || ''}`;
        if (enthaelt(text, m.nichtWoerter)) continue;
        const faehig = zaehle(text, m.faehigkeitWoerter);
        if (!faehig) continue;
        const remote = s.arbeitszeit === 'ho' || enthaelt(text, m.remoteWoerter);
        const ort = st.arbeitsort?.ort || '';
        const nah = !remote && cfg.region.some(r => ort.includes(r));
        if (!remote && !nah) continue;
        const a = art(text);
        eintraege.push(eintrag({
          kategorie: 'nebenverdienst', titel: st.titel || st.beruf, quelle: 'Jobbörse der Arbeitsagentur',
          link: `https://www.arbeitsagentur.de/jobsuche/jobdetail/${encodeURIComponent(st.refnr)}`, datum: st.aktuelleVeroeffentlichungsdatum,
          zeile: [st.arbeitgeber, remote ? 'von zu Hause möglich' : ort, s.arbeitszeit === 'mj' ? 'Minijob' : ''].filter(Boolean).join(' · '),
          soGehts: NAECHSTER_SCHRITT[a], wert: 35 + faehig * 10 + (remote ? 15 : 0), grund: a,
          extra: { art: a },
        }));
      }
    } catch (e) { fehler.push(`Jobsuche „${s.was}“: ${e.message}`); }
  }
  if (m.feeds?.length) {
    const { items, fehler: f } = await sammleFeeds(holeText, m.feeds, { jetzt, maxAlterTage: 14 });
    fehler.push(...f);
    for (const it of items) {
      const text = `${it.titel} ${it.beschreibung}`;
      if (enthaelt(text, m.nichtWoerter) || !zaehle(text, m.faehigkeitWoerter) || !enthaelt(text, m.remoteWoerter)) continue;
      const a = art(text);
      eintraege.push(eintrag({ kategorie: 'nebenverdienst', titel: it.titel, quelle: it.feed, link: it.link, datum: it.datum,
        zeile: 'von zu Hause', soGehts: NAECHSTER_SCHRITT[a], wert: 45, grund: a, extra: { art: a } }));
    }
  }
  return { eintraege, fehler };
}
