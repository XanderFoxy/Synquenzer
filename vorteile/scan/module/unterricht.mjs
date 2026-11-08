// Modul "unterricht": Leute/Stellen, die Deutschunterricht suchen (Privat, Integrationskurse, DaF/DaZ, online) –
// Kategorie „unterricht“ (Xander 08.11.2026: „Leute, die Deutschunterricht suchen … da fehlen Recherchen“).
// Quellen: (1) Jobbörse der Arbeitsagentur (lib/ba.mjs: /pc/v6/jobs, Ausweich-Adressen), Döbeln + 50 km und von zu Hause;
// (2) Remotive-API (Remote-Stellen „German teacher/tutor“, JSON); (3) Google News (Integrationskurse, Sprachpaten,
// DaZ-Lehrkräfte Sachsen); (4) Fundorte (config): Lehr-Plattformen (italki, Preply, Lingoda), BAMF-Zulassung,
// Jobbörse-Website – erscheinen IMMER.
import { enthaelt, zaehle, datumDe } from '../lib/text.mjs';
import { berlinTag } from '../lib/ende.mjs';
import { ortNach, ortZeile, istOnline, distanzKm, DOEBELN } from '../lib/orte.mjs';
import { macheBaSuche, baJobLink } from '../lib/ba.mjs';
import { sammleFeeds, eintrag, googleNews } from './gemeinsam.mjs';
import { bewerbungAus, bewerbenAls, fundortEintraege, pruefeFundorte, fundortePruefen, sortWert, ortVon, restTage } from './assistent.mjs';

export function unterrichtTyp(text) {
  if (enthaelt(text, ['integrationskurs|integrationskurse|berufssprachkurs|bsk|alphabetisierung|bamf'])) return 'integrationskurs';
  if (enthaelt(text, ['ehrenamt|ehrenamtlich|sprachpate|sprachpaten|sprachcafe|sprachcafé|freiwillig'])) return 'ehrenamt';
  if (enthaelt(text, ['nachhilfe|privatunterricht|einzelunterricht'])) return 'nachhilfe';
  if (enthaelt(text, ['grundschule|oberschule|gymnasium|gymnasien|sekundarstufe|seiteneinstieg|seiteneinsteiger|lehramt|an schulen|schuldienst|vorbereitungsklasse|daz-klasse|daz klasse'])) return 'schule';
  return 'kurs';
}
// „Lehrkraft (m/w/d) Deutsch“ -> „Lehrkraft Deutsch“ (sonst passt „lehrkraft deutsch“ nicht; echter Lauf 08.11.2026)
export const ohneGender = s => String(s || '').replace(/\s*\((?:[mwdfxi]|div|divers|gn|all genders)(?:\s*[/|,]\s*(?:[mwdfxi]|div|divers|gn))*\*?\)/gi, '').replace(/\s+/g, ' ').trim();

/** Entfernung einer Stelle ab Döbeln: Koordinaten der Jobbörse > bekannter Ort > „entfernung“ der Umkreissuche (ab wo). */
export function stelleKm(st, s = {}) {
  if (st.lat != null && st.lon != null) return distanzKm(DOEBELN, { lat: Number(st.lat), lon: Number(st.lon) });
  const o = ortNach(st.ort);
  if (o) return o.km;
  return s.wo && /^d(ö|oe)beln$/i.test(String(s.wo).trim()) && st.km != null ? st.km : null;
}

const TYP_NAME = { integrationskurs: 'Integrations-/Sprachkurs', ehrenamt: 'Ehrenamt', nachhilfe: 'Nachhilfe/Privat', schule: 'Schule (DaZ)', kurs: 'Deutschkurs', online: 'online' };
const SO = {
  integrationskurs: 'Anzeige öffnen. Für Integrationskurse braucht es die BAMF-Zulassung (C1 + Studium + DaF/DaZ) – sonst nach Kursleitung „Deutsch“ ohne Zulassung fragen (Vorlage unten).',
  ehrenamt: 'Melden, Zeiten nennen – gut als Einstieg und Referenz. Kurze Nachricht reicht (Vorlage unten).',
  nachhilfe: 'Kurze Nachricht: wer du bist, dass du Deutsch unterrichtest (auch online), wann du Zeit hast. Vorlage unten.',
  schule: 'Ausschreibung lesen (Seiteneinstieg möglich?), Lebenslauf + kurzes Anschreiben schicken.',
  kurs: 'Anzeige öffnen, kurz bewerben: Erfahrung, online/vor Ort, Zeiten, Honorarwunsch. Vorlage unten.',
};
SO.online = SO.kurs;

export default async function unterricht({ holeText, cfg, jetzt, zustand = {}, env = {} }) {
  const m = cfg.module.unterricht;
  const eintraege = [], fehler = [];
  const gesehen = new Set();
  const passt = text => zaehle(text, m.faehigkeitWoerter) > 0 && !enthaelt(text, m.nichtWoerter);

  // 1) Jobbörse
  if (m.ba?.suchen?.length) {
    const suche = macheBaSuche(holeText, m.ba);
    for (const s of m.ba.suchen) {
      try {
        const { stellen } = await suche(s);
        for (const st of stellen) {
          if (gesehen.has(st.refnr)) continue;
          gesehen.add(st.refnr);
          const text = `${ohneGender(st.titel)} ${st.beruf} ${st.arbeitgeber}`;
          if (!passt(text)) continue;
          // Homeoffice „zu 20 %“ ist kein Unterricht von zu Hause
          const remote = (st.homeoffice && !(st.homeofficeProzent != null && st.homeofficeProzent < 50)) || enthaelt(text, m.remoteWoerter);
          const km = stelleKm(st, s);
          const nah = !!s.wo || (km != null && km <= (m.ba.nahKm ?? 80)) || cfg.region.some(r => st.ort.includes(r));
          if (!remote && !nah) continue;
          const typ0 = unterrichtTyp(text);
          const typ = typ0 === 'kurs' && remote ? 'online' : typ0;
          // echte Stellen vor den festen Fundorten (Fundort höchstens 45 + 25 − 2 = 68, Stelle bis 80 km ab 60 + 10)
          const wert = 60 + (remote ? 10 : 0) + (typ === 'nachhilfe' || typ === 'kurs' ? 5 : 0);
          const ortName = st.ort || null;
          eintraege.push(eintrag({
            kategorie: 'unterricht', titel: ohneGender(st.titel || st.beruf), quelle: 'Jobbörse der Arbeitsagentur', link: baJobLink(st.refnr), datum: st.datum,
            jetzt, art: 'job',
            // die Jobbörse zeigt nur offene Stellen: Anzeigefenster ab diesem Lauf, nicht ab der Veröffentlichung
            fensterAb: jetzt, fensterStunden: m.ba.sichtbarStunden ?? 72,
            zeile: [TYP_NAME[typ], st.arbeitgeber, remote ? 'von zu Hause möglich' : ortZeile(ortName ? { ort: ortName, km } : null),
              st.seit ? `online seit ${datumDe(st.seit)}` : st.datum ? `vom ${datumDe(st.datum)}` : ''].filter(Boolean).join(' · '),
            soGehts: SO[typ], wert, grund: typ,
            extra: {
              typ, ort: remote ? 'online' : ortName, km: remote ? null : km, online: remote, frist: null,
              bewerbung: { art: 'seite', ziel: st.externeUrl || baJobLink(st.refnr) }, quelle: 'Jobbörse der Arbeitsagentur',
              arbeitgeber: st.arbeitgeber || null, refnr: st.refnr, seit: st.seit || null, bewerbenAls: bewerbenAls('unterricht', cfg.kuenstler),
              sortWert: sortWert({ wert, km: remote ? null : km, online: remote }),
            },
          }));
        }
      } catch (e) { fehler.push(`Jobsuche „${s.was}“: ${e.message}`); }
    }
  }

  // 2) Remotive (Remote-Stellen)
  for (const url of [].concat(m.remotive?.urls || [])) {
    try {
      const j = JSON.parse(await holeText(url, { headers: { accept: 'application/json' } }));
      for (const job of j.jobs || []) {
        const text = `${job.title || ''} ${job.category || ''}`;
        if (!job.url || gesehen.has(job.url) || !enthaelt(text, m.remotive.titelWoerter) || !enthaelt(text, ['german|deutsch'])) continue;
        if (enthaelt(text, m.nichtWoerter)) continue;
        gesehen.add(job.url);
        const wo = String(job.candidate_required_location || '');
        if (wo && !enthaelt(wo, ['worldwide|anywhere|europe|eu|emea|germany|deutschland|dach'])) continue;
        const wert = 55;
        eintraege.push(eintrag({
          kategorie: 'unterricht', titel: `${job.title} – ${job.company_name}`, quelle: 'Remotive', link: job.url, datum: job.publication_date, jetzt, art: 'job',
          zeile: ['online', job.job_type ? job.job_type.replace(/_/g, ' ') : '', wo || '', job.salary || ''].filter(Boolean).join(' · '),
          soGehts: SO.kurs, wert, grund: 'online',
          extra: {
            typ: 'online', ort: 'online', km: null, online: true, frist: null, bewerbung: { art: 'seite', ziel: job.url }, quelle: 'Remotive',
            arbeitgeber: job.company_name || null, bewerbenAls: bewerbenAls('unterricht', cfg.kuenstler), sortWert: sortWert({ wert, online: true }),
          },
        }));
      }
    } catch (e) { fehler.push(`Remotive: ${e.message}`); }
  }

  // 3) Google News
  const alter = m.maxAlterTage ?? 30;
  const { items, fehler: f } = await sammleFeeds(holeText, (m.suchen || []).map(q => ({ name: `Nachrichten „${q}“`, url: googleNews(`${q} when:${alter}d`), maxAlterTage: alter })), { jetzt, maxAlterTage: alter });
  fehler.push(...f);
  for (const it of items) {
    const text = `${it.titel} ${it.beschreibung || ''}`;
    if (!passt(text) || !enthaelt(text, m.gesuchtWoerter)) continue;
    const typ = unterrichtTyp(text);
    const o = ortVon({ text });
    const rest = restTage(it.bis, jetzt);
    const wert = 45 + (o.km != null && o.km <= 80 ? 10 : 0) + (it.bis ? 5 : 0);
    eintraege.push(eintrag({
      kategorie: 'unterricht', titel: it.titel, quelle: it.herkunft || 'Google News', link: it.link, datum: it.datum, jetzt, bis: it.bis, ab: it.ab, art: 'aufruf',
      zeile: [TYP_NAME[typ], ortZeile(o, o.online || istOnline(text)), it.bis ? `Frist ${datumDe(berlinTag(it.bis))}` : ''].filter(Boolean).join(' · '),
      soGehts: SO[typ], wert, sofort: rest != null && rest >= 2 && rest <= 30 && o.km != null && o.km <= 60, grund: typ,
      extra: {
        typ, ort: o.ort, km: o.km, online: o.online, frist: it.bis || null, bewerbung: bewerbungAus(text, it.link), quelle: it.herkunft || 'Google News',
        bewerbenAls: bewerbenAls('unterricht', cfg.kuenstler), sortWert: sortWert({ wert, km: o.km, online: o.online, rest }),
      },
    }));
  }

  const p = await pruefeFundorte(m.fundorte || [], { holeText, zustand, name: 'unterricht', jetzt, an: fundortePruefen(m, env) });
  eintraege.push(...fundortEintraege(m.fundorte, { kategorie: 'unterricht', jetzt, kuenstler: cfg.kuenstler, pruefung: p.pruefung }));
  return { eintraege, fehler, hinweise: p.hinweise };
}
