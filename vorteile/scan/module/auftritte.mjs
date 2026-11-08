// Modul "auftritte": Auftrittsmöglichkeiten und Bewerbungen für Xander Fox / One Day in Rome – Kategorie „auftritte“
// (Xander 08.11.2026: „wo Bands gesucht werden … wo ich mich als Band bewerben kann, bei einem Stadtfest … und wenn es
// auch nicht im direkten Umkreis ist, was das Nächste ist“).
// Quellen: (1) Google News – „Bands gesucht“, Bandcontests, Open Stage/Open Mic, Stadtfest-Bewerbungen (Sachsen zuerst,
// sonst deutschlandweit); (2) Seiten mit maschinenlesbaren Terminen (JSON-LD, config „seiten“; die gigmit-Stadtseiten
// sind seit dem 404 im Lauf vom 08.11.2026 raus); (3) Fundorte (config) mit Ort, Entfernung, Bewerbungsweg und Saison –
// erscheinen IMMER.
// Jeder Eintrag: extra { ort, km, frist, bewerbung { art, ziel }, quelle, typ, bewerbenAls }. Sortierung: nah + bald zuerst.
import { enthaelt, zaehle, datumDe } from '../lib/text.mjs';
import { berlinTag } from '../lib/ende.mjs';
import { jsonldEvents } from '../lib/jsonld.mjs';
import { ortZeile } from '../lib/orte.mjs';
import { sammleFeeds, eintrag, googleNews } from './gemeinsam.mjs';
import { istRemixContest } from './remix.mjs';
import { bewerbungAus, bewerbenAls, fundortEintraege, pruefeFundorte, fundortePruefen, sortWert, ortVon, restTage } from './assistent.mjs';

/** Art des Auftritts aus dem Text */
export function auftrittTyp(text) {
  if (enthaelt(text, ['open stage|open-stage|offene buehne|offene bühne|open mic|open-mic|jam session|jamsession'])) return 'openstage';
  if (enthaelt(text, ['bandcontest|band contest|bandwettbewerb|band-wettbewerb|nachwuchswettbewerb|newcomer-wettbewerb|newcomerwettbewerb|contest|wettbewerb'])) return 'bandcontest';
  if (enthaelt(text, ['stadtfest|stadtteilfest|kulturnacht|fete de la musique|fête de la musique|strassenfest|straßenfest|weihnachtsmarkt|heimatfest|dorffest|marktfest'])) return 'stadtfest';
  if (enthaelt(text, ['festival'])) return 'festival';
  return 'aufruf';
}
const TYP_NAME = { openstage: 'Open Stage', bandcontest: 'Bandcontest', stadtfest: 'Stadtfest/Fest', festival: 'Festival', gig: 'Gig', aufruf: 'Bands gesucht' };

export const SO_AUFTRITT = 'Ausschreibung öffnen, Bedingungen lesen. Bewerbung = 3 Sätze über euch + 1 Hörlink + 1 Foto + Technik (Vorlage unten auf der Seite).';

const MONATE = { januar: 1, februar: 2, maerz: 3, märz: 3, april: 4, mai: 5, juni: 6, juli: 7, august: 8, september: 9, oktober: 10, november: 11, dezember: 12 };

/**
 * Termin im Titel schon vorbei? „Open Mic Night im Oktober 2026“ (am 08.11.), „… am 29.10.2026 in Leipzig“.
 * Nur wenn ALLE Daten im Titel vorbei sind (ein späteres Datum kann die Frist oder der nächste Termin sein).
 */
export function terminVorbei(titel, jetzt = new Date()) {
  const t = String(titel || '').toLowerCase();
  const heute = berlinTag(new Date(jetzt).toISOString());
  const tage = [];
  for (const d of t.matchAll(/\b(\d{1,2})\.(\d{1,2})\.(20\d\d)\b/g)) tage.push(`${d[3]}-${d[2].padStart(2, '0')}-${d[1].padStart(2, '0')}`);
  // Monat + Jahr: vorbei, wenn der ganze Monat vorbei ist
  for (const d of t.matchAll(/\b(januar|februar|märz|maerz|april|mai|juni|juli|august|september|oktober|november|dezember)\s+(20\d\d)\b/g)) tage.push(`${d[2]}-${String(MONATE[d[1]]).padStart(2, '0')}-31`);
  return tage.length > 0 && tage.every(x => x < heute);
}

/** Google-News-Eintrag bewerten -> { ok, typ, … } | { grund } */
export function bewerteAuftritt(it, m, jetzt = new Date()) {
  const text = `${it.titel} ${it.beschreibung || ''}`;
  if (m.remixWoerter && enthaelt(text, m.remixWoerter)) return { grund: 'Remix-Contest (steht unter Remix)' };
  if (!enthaelt(text, m.aufrufWoerter)) return { grund: 'kein Aufruf' };
  if (!enthaelt(text, m.musikerWoerter)) return { grund: 'nicht für Musiker' };
  if (enthaelt(text, m.nichtWoerter)) return { grund: 'passt nicht (Cover/Schlager/Rückblick …)' };
  if (!it.bis && terminVorbei(it.titel, jetzt)) return { grund: 'Termin vorbei' };
  const rest = restTage(it.bis, jetzt);
  return { ok: true, typ: auftrittTyp(text), genre: Math.min(2, zaehle(text, m.genreWoerter)), rest, frist: it.bis ? berlinTag(it.bis) : null };
}

async function seitenTermine(holeText, seiten = [], jetzt) {
  const out = [], fehler = [];
  const j = new Date(jetzt).getTime();
  for (const s of seiten) {
    if (s.aktiv === false) continue;
    try {
      for (const e of jsonldEvents(await holeText(s.url, { headers: { accept: 'text/html' } }), s.url)) {
        const ende = e.frist || e.ende || e.start;
        if (ende && Date.parse(ende) < j) continue;
        out.push({ ...e, seite: s });
      }
    } catch (err) { fehler.push(`${s.name}: ${err.message}`); }
  }
  return { termine: out, fehler };
}

export default async function auftritte({ holeText, cfg, jetzt, zustand = {}, env = {} }) {
  const m = cfg.module.auftritte;
  const alter = m.maxAlterTage ?? 60;
  const eintraege = [];
  const { items, fehler } = await sammleFeeds(holeText, (m.suchen || []).map(q => ({ name: `Nachrichten „${q}“`, url: googleNews(`${q} when:${alter}d`), maxAlterTage: alter })), { jetzt, maxAlterTage: alter });
  const remixCfg = cfg.module.remix;
  for (const it of items) {
    const text = `${it.titel} ${it.beschreibung || ''}`;
    if (remixCfg && istRemixContest(text, remixCfg)) continue; // steht unter Remix
    const b = bewerteAuftritt(it, m, jetzt);
    if (!b.ok) continue;
    const o = ortVon({ text });
    const wert = 40 + b.genre * 10 + (b.frist ? 10 : 0) + (b.typ === 'aufruf' ? 0 : 5);
    eintraege.push(eintrag({
      kategorie: 'auftritte', titel: it.titel, quelle: it.herkunft || 'Google News', link: it.link, datum: it.datum, jetzt,
      // ohne Frist so lange zeigen, wie gesucht wird (maxAlterTage, 60). Vorher: 30 Tage (HOECHSTALTER.aufruf) – im echten
      // Lauf 08.11.2026 fielen so 3 von 4 Funden (45–60 Tage alt) nach dem Einsammeln stumm wieder heraus.
      bis: it.bis, ab: it.ab, art: 'aufruf', fensterStunden: alter * 24,
      zeile: [TYP_NAME[b.typ], ortZeile(o, o.online), b.frist ? `Frist ${datumDe(b.frist)}` : 'Frist im Link'].filter(Boolean).join(' · '),
      soGehts: SO_AUFTRITT, wert,
      sofort: b.rest != null && b.rest >= 2 && b.rest <= 60 && ((o.km != null && o.km <= (m.sofortBisKm ?? 150)) || b.genre > 0),
      grund: b.frist ? 'Bewerbung mit Frist' : 'Aufruf',
      extra: {
        typ: b.typ, ort: o.ort, km: o.km, online: o.online, frist: it.bis || null, bewerbung: bewerbungAus(text, it.link),
        quelle: it.herkunft || 'Google News', bewerbenAls: bewerbenAls(b.typ, cfg.kuenstler),
        sortWert: sortWert({ wert, km: o.km, online: o.online, rest: b.rest }),
      },
    }));
  }
  // Seiten mit maschinenlesbaren Terminen (gigmit u. a.)
  const s = await seitenTermine(holeText, m.seiten, jetzt);
  fehler.push(...s.fehler);
  for (const e of s.termine) {
    const o = ortVon({ stadt: e.stadt || e.seite.stadt || '', text: `${e.name} ${e.ort}` });
    const frist = e.frist || null;
    const rest = restTage(frist || e.start, jetzt);
    const link = e.url || e.seite.url;
    const wert = 50;
    eintraege.push(eintrag({
      kategorie: 'auftritte', titel: e.name, quelle: e.seite.name, link, datum: null, jetzt, bis: frist || e.ende || e.start, bisQuelle: 'feld', art: 'aufruf',
      zeile: ['Gig-Angebot', ortZeile(o), e.start ? `am ${datumDe(berlinTag(e.start))}` : '', frist ? `Bewerbung bis ${datumDe(berlinTag(frist))}` : ''].filter(Boolean).join(' · '),
      soGehts: 'Angebot öffnen, Profil (Hörlink, Foto, Technik) ausfüllen und bewerben.', wert, sofort: false, grund: 'Gig-Angebot',
      extra: {
        typ: 'gig', ort: o.ort, km: o.km, online: false, frist, bewerbung: { art: 'seite', ziel: link }, quelle: e.seite.name,
        termin: e.start || null, bewerbenAls: bewerbenAls('gig', cfg.kuenstler), sortWert: sortWert({ wert, km: o.km, rest }),
      },
    }));
  }
  const p = await pruefeFundorte(m.fundorte || [], { holeText, zustand, name: 'auftritte', jetzt, an: fundortePruefen(m, env) });
  eintraege.push(...fundortEintraege(m.fundorte, { kategorie: 'auftritte', jetzt, kuenstler: cfg.kuenstler, pruefung: p.pruefung }));
  return { eintraege, fehler, hinweise: p.hinweise };
}
