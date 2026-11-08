// Modul "nebenverdienst": Übersetzung (Deutsch↔Arabisch/Englisch), KI-Bild/Video, kleine kreative Jobs von zu Hause.
// Deutschunterricht hat seit 08.11.2026 ein eigenes Modul (module/unterricht.mjs, Kategorie „unterricht“).
// Quelle: Jobsuche-API der Bundesagentur für Arbeit (lib/ba.mjs: /pc/v6/jobs + Ausweich-Adressen) + optionale RSS-Feeds.
import { enthaelt, zaehle } from '../lib/text.mjs';
import { macheBaSuche, baJobLink } from '../lib/ba.mjs';
import { sammleFeeds, eintrag } from './gemeinsam.mjs';

export { baUrl } from '../lib/ba.mjs';

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
  const suche = macheBaSuche(holeText, m.ba);
  for (const s of m.ba.suchen) {
    try {
      const { stellen, api } = await suche(s);
      for (const st of stellen) {
        if (gesehen.has(st.refnr)) continue;
        gesehen.add(st.refnr);
        const text = `${st.titel || ''} ${st.beruf || ''} ${st.arbeitgeber || ''}`;
        if (enthaelt(text, m.nichtWoerter)) continue;
        const faehig = zaehle(text, m.faehigkeitWoerter);
        if (!faehig) continue;
        // Nebenverdienst: keine reinen Vollzeitstellen; Übersetzen nur in Xanders Sprachen (echter Lauf 08.11.2026:
        // „Übersetzer für Content - Schwedisch“, Vollzeit, kam über die Suche „Übersetzer Englisch Deutsch“)
        if (st.nurVollzeit) continue;
        if (m.sprachWoerter && enthaelt(text, ['übersetz|uebersetz|dolmetsch']) && !enthaelt(text, m.sprachWoerter)) continue;
        // v4 filtert „ho“ selbst; v6 nicht -> Homeoffice-Feld oder Wörter im Titel
        const remote = (s.arbeitszeit === 'ho' && !/\/v6\//.test(api)) || st.homeoffice || enthaelt(text, m.remoteWoerter);
        const ort = st.ort || '';
        const nah = !remote && cfg.region.some(r => ort.includes(r));
        if (!remote && !nah) continue;
        const a = art(text);
        eintraege.push(eintrag({
          kategorie: 'nebenverdienst', titel: st.titel || st.beruf, quelle: 'Jobbörse der Arbeitsagentur',
          link: baJobLink(st.refnr), datum: st.datum,
          jetzt, art: 'job', // die Jobbörse liefert kein Ende -> 21 Tage ab Veröffentlichung
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
      eintraege.push(eintrag({ kategorie: 'nebenverdienst', titel: it.titel, quelle: it.feed, link: it.link, datum: it.datum, jetzt, bis: it.bis, art: 'job',
        zeile: 'von zu Hause', soGehts: NAECHSTER_SCHRITT[a], wert: 45, grund: a, extra: { art: a } }));
    }
  }
  return { eintraege, fehler };
}
