// Modul "remix": laufende Remix-Contests (mit Stems) – Kategorie „remix“ (Xander 07./08.11.2026: „Remix-Contest gibt es
// unter Garantie, werden aber bei mir gar nicht angezeigt“).
// Quellen (unabhängig, eine tote Quelle stoppt die anderen nicht; Fehler stehen im Status):
//   1. Google News deutsch + englisch (breite Suchen, Filter macht bewerteRemix)
//   2. Audius-API: Remix-Contests der Plattform (JSON, ohne Schlüssel; /v1/events/remix-contests)
//   3. WordPress-Suchfeeds von Musik-Magazinen (?s=remix+contest&feed=rss2: EDM Identity, Attack Magazine, Rekkerd …)
//   4. Fundorte (config): SKIO, Beatportal-Contests, delamar, Remix64 – erscheinen IMMER (unter den Funden)
// Genre: Synth-Pop/80er/Italo/Euro-Disco/Elektro/New Wave/Dark Wave/Pop zählt extra („passt zu deinem Stil“). Contests ohne
// Genre-Wort bleiben drin („offen – dein Synth-Pop-Remix geht auch“), raus nur reine Hip-Hop-/Metal-/Schlager-/Trap-Contests.
import { enthaelt, zaehle, tageBis, datumDe, alterTage, norm } from '../lib/text.mjs';
import { berlinTag, berlinIso } from '../lib/ende.mjs';
import { sammleFeeds, eintrag, googleNews } from './gemeinsam.mjs';
import { bewerbungAus, bewerbenAls, fundortEintraege, pruefeFundorte, fundortePruefen, sortWert } from './assistent.mjs';

export const googleNewsEn = q => `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`;
export const wpSucheUrl = (basis, q) => `${String(basis).replace(/\/$/, '')}/?s=${encodeURIComponent(q).replace(/%20/g, '+')}&feed=rss2`;
export const istRemixContest = (text, r) => enthaelt(text, r.contestWoerter);

const MONAT_EN = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
// „Deadline: December 15, 2026“, „closes 15 Dec“, „submissions close on Nov 30th“, „entries due by 1st of December“
const FRIST_EN = /\b(deadline|closes?|closing date|ends?|until|due|submit (?:it )?by|submissions? (?:close|end|due)|entries (?:close|due))\b\s*(?:on|is|was|by|date)?\s*[:\-–]?\s*(?:(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?([a-z]{3,9})\.?|([a-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b)(?:,?\s*(\d{4}))?/gi;

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
 * Regeln: Contest-Wort nötig. Genre-Treffer zählen (passt), ohne Genre bleibt der Contest drin, außer r.genreNoetig.
 * Ein Contest mit Hip-Hop/Metal/Schlager-Wort nur mit zwei Genre-Treffern. Schon entschieden -> raus. Nur laufende:
 * Einsendeschluss in der Zukunft (deutsch über sammleFeeds/it.bis, englisch über englischeFrist), ohne Einsendeschluss
 * höchstens maxAlterTage alt. Sofort-Push nur bei Frist ≤ sofortBisTage und passendem Genre.
 */
export function bewerteRemix(it, r, jetzt = new Date()) {
  const text = `${it.titel} ${it.beschreibung || ''}`;
  if (!istRemixContest(text, r)) return { grund: 'kein Remix-Contest' };
  const genre = zaehle(text, r.genreWoerter);
  if (!genre && r.genreNoetig) return { grund: 'Genre passt nicht' };
  if (enthaelt(text, r.nichtWoerter) && genre < 2) return { grund: 'Hip-Hop/Metal/Schlager' };
  if (enthaelt(text, ['winners announced|winner announced|winners revealed|gewinner stehen fest|gewinner bekannt|gewinner gekuert|gewinner gekürt|results are in'])) return { grund: 'schon entschieden' };
  const jetztMs = new Date(jetzt).getTime();
  const bis = it.bis || englischeFrist(`${it.titel} ${it.langtext || it.beschreibung || ''}`, jetzt);
  if (bis && Date.parse(bis) <= jetztMs) return { grund: 'Einsendeschluss vorbei' };
  if (!bis && !it.laufend && alterTage(it.datum, jetzt) > (r.maxAlterTage ?? 30)) return { grund: 'zu alt' };
  const frist = bis ? berlinTag(bis) : null;
  const rest = frist ? tageBis(frist, jetzt) : null;
  const stems = enthaelt(text, ['stems|stem pack|stem-pack|stem files|multitracks|multitrack|einzelspuren']);
  const passt = genre > 0;
  return { ok: true, genre, passt, bis, frist, rest, stems, sofort: passt && rest != null && rest >= 0 && rest <= (r.sofortBisTage ?? 14) };
}

// ---------------------------------------------------------------- Audius
// Antwort (AudiusProject/api, api/v1_events_remix_contests.go + swagger „remix_contests_response“, geprüft 08.11.2026):
// { data: [Event], related: { tracks, users, entry_counts: { <Track-ID>: Anzahl } } }.
// Event: event_id, event_type ('remix_contest'), user_id, entity_id (Track-ID), end_date (RFC 3339 | null = läuft),
// created_at, event_data { title?, description, prize_info }, permalink ('/<handle>/contest/<slug>').
// Mit ?status=active nur laufende (end_date null oder in der Zukunft). Tolerant gelesen; ohne Track-Link wird der
// Contest weggelassen (keine Link-Raterei).
export function leseAudius(text) {
  const j = typeof text === 'string' ? JSON.parse(text) : text;
  const events = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : j?.data?.events || [];
  const tracks = new Map(), users = new Map();
  for (const t of [...(j?.related?.tracks || []), ...(j?.related?.track || [])]) tracks.set(String(t.id ?? t.track_id), t);
  for (const u of j?.related?.users || []) users.set(String(u.id ?? u.user_id), u);
  const anzahl = j?.related?.entry_counts || {};
  const out = [];
  for (const ev of events) {
    if (ev.event_type && !/remix/i.test(ev.event_type)) continue;
    const t = tracks.get(String(ev.entity_id)) || ev.track || ev.entity || null;
    const u = users.get(String(ev.user_id ?? t?.user_id ?? t?.user?.id)) || t?.user || null;
    const pfad = t?.permalink || (u?.handle && t?.slug ? `/${u.handle}/${t.slug}` : '');
    const link = /^https?:/.test(pfad) ? pfad : pfad ? `https://audius.co${pfad.startsWith('/') ? '' : '/'}${pfad}` : '';
    if (!link) continue;
    const ende = ev.end_date || ev.endDate || ev.event_data?.end_date || null;
    const n = anzahl[String(ev.entity_id)] ?? ev.entry_count ?? ev.entryCount ?? null;
    out.push({
      titel: `Remix-Contest: ${ev.event_data?.title || t?.title || 'Track'}${u?.name ? ` von ${u.name}` : ''}`,
      beschreibung: [t?.genre ? `Genre: ${t.genre}` : '', ev.event_data?.description || '', ev.event_data?.prizeInfo || ev.event_data?.prize_info || '', 'remix contest stems'].filter(Boolean).join(' – ').slice(0, 800),
      link, datum: ev.created_at || ev.createdAt || null,
      bis: ende && Number.isFinite(Date.parse(ende)) ? new Date(ende).toISOString() : null,
      herkunft: 'Audius', genre: t?.genre || '', eintraege: n,
      laufend: !ende, // Audius: ohne Ende = läuft noch (nicht nach Alter aussortieren)
    });
  }
  return out;
}

async function audius(holeText, r) {
  if (!r.audius?.url) return { items: [], fehler: [] };
  try { return { items: leseAudius(await holeText(r.audius.url, { headers: { accept: 'application/json' } })), fehler: [] }; }
  catch (e) { return { items: [], fehler: [`Audius: ${e.message}`] }; }
}

export const SO_REMIX = 'Contest öffnen, Regeln lesen (Rechte, Format, Länge), Stems laden und den Remix vor dem Einsendeschluss hochladen. Titel: „Songname (Xander Fox Remix)“.';

export default async function remix({ holeText, cfg, jetzt, zustand = {}, env = {} }) {
  const r = cfg.module.remix;
  const alter = r.maxAlterTage ?? 30;
  const feeds = [
    ...(r.suchen || []).map(q => ({ name: `Nachrichten „${q}“`, url: googleNews(`${q} when:${alter}d`), maxAlterTage: alter })),
    ...(r.suchenEnglisch || []).map(q => ({ name: `News „${q}“`, url: googleNewsEn(`${q} when:${alter}d`), maxAlterTage: alter })),
    ...(r.wordpress || []).flatMap(w => (w.suchen || ['remix contest']).map(q => ({ name: `${w.name} „${q}“`, url: wpSucheUrl(w.basis, q), maxAlterTage: w.maxAlterTage ?? 45 }))),
    ...(r.feeds || []),
  ];
  const { items, fehler } = await sammleFeeds(holeText, feeds, { jetzt, maxAlterTage: alter });
  const a = await audius(holeText, r);
  fehler.push(...a.fehler);
  const eintraege = [];
  const gesehen = new Set();
  for (const it of [...a.items, ...items]) {
    const b = bewerteRemix(it, r, jetzt);
    if (!b.ok) continue;
    const k = norm(it.titel).replace(/ - [^-]+$/, '').slice(0, 60);
    if (gesehen.has(k)) continue;
    gesehen.add(k);
    const wert = 45 + Math.min(3, b.genre) * 10 + (b.stems ? 10 : 0) + (b.frist ? 10 : 0) - (b.passt ? 0 : 10);
    const quelle = it.herkunft || it.feed;
    eintraege.push(eintrag({
      kategorie: 'remix', titel: it.titel, quelle, link: it.link, datum: it.datum, jetzt,
      bis: b.bis, bisQuelle: b.bis ? (it.herkunft === 'Audius' ? 'feld' : 'text') : null, art: 'aufruf',
      zeile: ['Remix-Contest', b.passt ? 'passt zu deinem Stil' : 'offen – dein Synth-Pop-Remix geht auch', b.stems ? 'mit Stems' : '', b.frist ? `Einsendeschluss ${datumDe(b.frist)}` : 'Einsendeschluss im Link'].filter(Boolean).join(' · '),
      soGehts: SO_REMIX, wert, sofort: b.sofort, grund: 'Remix-Contest',
      extra: {
        art: 'remix', typ: 'remix', stems: b.stems, passt: b.passt, genreTreffer: b.genre, online: true, ort: 'online', km: null,
        frist: b.bis || null, bewerbung: bewerbungAus(`${it.titel} ${it.beschreibung || ''}`, it.link), quelle,
        bewerbenAls: bewerbenAls('remix', cfg.kuenstler), ...(it.eintraege != null ? { eingereicht: it.eintraege } : {}),
        sortWert: sortWert({ wert, online: true, rest: b.rest }),
      },
    }));
  }
  const p = await pruefeFundorte(r.fundorte || [], { holeText, zustand, name: 'remix', jetzt, an: fundortePruefen(r, env) });
  eintraege.push(...fundortEintraege(r.fundorte, { kategorie: 'remix', jetzt, kuenstler: cfg.kuenstler, pruefung: p.pruefung }));
  return { eintraege, fehler, hinweise: p.hinweise };
}
