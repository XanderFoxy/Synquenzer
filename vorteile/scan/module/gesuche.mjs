// Gesuche aus dem Netz (Xander 14.11.2026): „keine normalen Stellen von der Arbeitsagentur, sondern Anfragen im Internet –
// wenn jemand über Fiverr, Upwork oder andere Seiten, Foren, Reddit usw. jemanden sucht, der ihm mit Deutsch hilft“.
// Gehört zum Bereich „unterricht“ (unterricht.mjs ruft gesucheAusNetz auf), Einträge mit extra.typ 'gesuch'.
// Quellen (config module.unterricht.gesuche):
//   - Reddit: neueste Beiträge mehrerer Subreddits als Atom-Feed (…/r/A+B/new/.rss), ohne Login (die Suche gibt GitHub 403)
//   - Freelancer.com: öffentliche Projekt-API (…/projects/active/?jobs[]=518…), JSON, ohne Schlüssel – Fähigkeits-Filter
//   - Lemmy (Fediverse): Such-API, gerade aus (Roh-Lauf 14.11.2026: nur Nachrichten)
//   - Fundorte mit fertiger Suche für Plattformen ohne offenen Zugang (Upwork: RSS seit 08/2024 abgeschaltet, Fiverr: keine
//     öffentlichen Käufer-Anfragen, Kleinanzeigen: kein Feed) – erscheinen IMMER.
// Filter: Sucht jemand Hilfe (suche/looking for/need/[hiring] …)? Geht es um Deutsch (oder ist das Forum Deutsch)? Welche
// Hilfe (Nachhilfe, Korrektur, Übersetzung, Konversation, Prüfung, Behördenbrief, Bewerbung)? Angebote von Lehrern selbst
// ([for hire], [offer], biete …) raus, Präsenz-Wunsch an fernem Ort raus, höchstens maxAlterTage (21) alt, gleicher Link/Titel
// nur einmal. Forenbeiträge (Reddit, Lemmy) merkt sich der Radar im Zustand (zustand.gesuche) bis maxAlterTage und prüft sie
// jeden Lauf mit dem aktuellen Filter neu – /new/.rss reicht nur Tage (r/German) bzw. Stunden (Sammelabfrage) zurück.
// Ausfälle (Reddit sperrt Rechenzentrums-IPs gern mit 403/429) landen als Hinweis im Status, nicht als Störung des Bereichs.
import { enthaelt, norm, datumDe } from '../lib/text.mjs';
import { berlinTag } from '../lib/ende.mjs';
import { entities } from '../lib/rss.mjs';
import { ortAus, istOnline } from '../lib/orte.mjs';
import { sammleFeeds, eintrag } from './gemeinsam.mjs';
import { bewerbenAls, fundortEintraege, sortWert } from './assistent.mjs';

// sub darf mehrere Subreddits mit „+“ verbinden (eine Abfrage statt sieben: Reddit drosselt GitHub-Läufe schnell mit 429)
// Ohne q: die Liste der neuesten Beiträge (/new/.rss) – die Reddit-SUCHE antwortet GitHub-Läufen mit 403 „Verboten“,
// die Liste nicht (Roh-Lauf 14.11.2026: search.rss 403/429, /r/German/new/.rss 200 mit 25 Beiträgen)
export const redditSuche = ({ sub, q }) => {
  const r = `https://www.reddit.com/r/${String(sub).split('+').map(encodeURIComponent).join('+')}`;
  return q ? `${r}/search.rss?q=${encodeURIComponent(q)}&restrict_sr=1&sort=new&t=month` : `${r}/new/.rss?limit=100`;
};
// q = Suchwort oder { jobs: [Fähigkeits-IDs] } (518 German Translator, 2108 German Tutoring …): die Volltextsuche der API ist
// unscharf („german translation“ lieferte vor allem Hindi/Chinesisch, Roh-Lauf 14.11.2026), der Fähigkeits-Filter nicht
export const freelancerSuche = q => (typeof q === 'object' && q?.jobs
  ? `https://www.freelancer.com/api/projects/0.1/projects/active/?${q.jobs.map(j => `jobs%5B%5D=${Number(j)}`).join('&')}&limit=${q.limit ?? 50}&job_details=true`
  : `https://www.freelancer.com/api/projects/0.1/projects/active/?query=${encodeURIComponent(q)}&limit=50&job_details=true`);
// Fähigkeit „German Tutoring“ am Projekt = es geht um Deutsch, auch wenn der Text es nicht sagt („German Translator“ nicht:
// Roh-Lauf 14.11.2026 „Translate English to Amharic“ trug diese Fähigkeit)
const FL_DEUTSCH = /^german tutoring$/i;
// Lemmy (Fediverse, z. B. feddit.org): offene Such-API, JSON, ohne Konto
export const lemmySuche = ({ instanz, q }) => `https://${instanz}/api/v3/search?q=${encodeURIComponent(q)}&type_=Posts&sort=New&listing_type=All&limit=50`;
// Lemmy 0.18 liefert „2026-11-10T12:00:00.123“ ohne Zone (= UTC), 0.19 mit „Z“
const lemmyZeit = s => Date.parse(/[zZ]|[+-]\d\d:?\d\d$/.test(String(s || '')) ? s : `${s}Z`);
// Freelancer: „German/Deutsch“ im Titel ODER eine passende Fähigkeit (jobs) am Projekt. Das allein reicht nicht: der Fehltreffer
// „Setup of Professional Email Templates … for Translation Business“ (Live 13./14.11.2026) trug die Fähigkeiten „Translation“
// und „German Translator“ und kam so durch – erst das nichtWort „email template“ (config) nimmt ihn heraus.
const FL_SKILL = /german|deutsch|translat|proofread|tutor|teach|language|lektor|übersetz/i;
export const freelancerPasst = pr => /german|deutsch/i.test(pr?.title || '') || (pr?.jobs || []).some(j => FL_SKILL.test(j?.name || ''));
export const freelancerLink = seo => `https://www.freelancer.com/projects/${String(seo).replace(/^\/+/, '')}`;

// Welche Hilfe? Reihenfolge = Vorrang (Bewerbung vor Korrektur: „Anschreiben korrigieren“ ist eine Bewerbung).
// „Goethe“ allein ist keine Prüfung („Kurs am Goethe-Institut“, Roh-Lauf 14.11.2026: Preply-Lehrersuche hieß sonst
// „Prüfungsvorbereitung“) – nur Goethe + Niveau/Zertifikat/Prüfung.
const ARTEN = [
  ['pruefung', 'goethe zertifikat|goethe a1|goethe a2|goethe b1|goethe b2|goethe c1|goethe c2|goethe exam|goethe test|goethe prüfung|telc|testdaf|=dsh|=ösd|prüfung|=exam|=exams|examen'],
  ['bewerbung', 'bewerbung|lebenslauf|anschreiben|cover letter|=cv|motivationsschreiben|job application'],
  ['behoerde', 'behörde|=amt|=ämter|jobcenter|=brief|=briefe|=letter|=letters|formular|=forms|=anmeldung|=antrag'],
  ['uebersetzung', 'übersetz|translat'],
  ['korrektur', 'proofread|korrektur|korrigier|lektor|correct my|correcting|correction|=edit|editing|localization|localisation|lokalisierung'],
  ['konversation', 'konversation|conversation|speaking|=sprechen|practice|=üben|=chat'],
];
export const WAS_NAME = {
  pruefung: 'Prüfungsvorbereitung', bewerbung: 'Bewerbung auf Deutsch', behoerde: 'Behördenbrief', uebersetzung: 'Übersetzung',
  korrektur: 'Korrektur', konversation: 'Konversation', nachhilfe: 'Nachhilfe',
};
const artIn = text => ARTEN.find(([, w]) => enthaelt(text, [w]))?.[0] || null;
// titel (optional) zuerst: was der Titel sagt, gilt; sonst eine im Text genannte Prüfung (am genauesten); sucht der Titel einen
// Lehrer/Tutor -> Nachhilfe; sonst der Text
export const hilfeArt = (text, titel = '') => {
  if (!titel) return artIn(text) || 'nachhilfe';
  const t = artIn(titel), x = artIn(text);
  if (t) return t;
  if (x === 'pruefung') return x;
  if (/tutor|teacher|lehrer|nachhilfe|privatstunde|privatunterricht|lessons?\b/i.test(titel)) return 'nachhilfe';
  return x || 'nachhilfe';
};

/**
 * Ist das ein Gesuch? titel/text getrennt, weil „[Offer]“/„biete“ im Titel ein Angebot ist, ein „offering 20 $/h“ im Text
 * eines Suchenden aber nicht. q = { thema: 'deutsch' (Forum ist schon Deutsch), immerGesuch (Plattform = nur Aufträge),
 * streng (Foren: der TITEL muss suchen UND eine Person/Leistung nennen – personWoerter; Roh-Lauf 14.11.2026: in r/German
 * waren „Need help deciphering lyrics“, „Seeking grammaticality judgements“ usw. sonst „Gesuche“) }
 * -> { was } oder { grund } (warum nicht).
 */
export function pruefeGesuch(titel, text, w, q = {}) {
  const alles = `${titel} ${text || ''}`;
  // „[For Hire]“/„[Offer]“ vorn = immer Angebot; „biete/offering“ im Titel nur, wenn der Titel nicht selbst etwas sucht
  // („Looking for a tutor, offering 20 €/h“ ist ein Gesuch)
  if (/^\s*\[(?:for\s*hire|offer(?:ing)?)\]/i.test(titel)) return { grund: 'Angebot' };
  if (enthaelt(titel, w.angebotTitelWoerter) && !enthaelt(titel, w.suchWoerter)) return { grund: 'Angebot' };
  if (enthaelt(alles, w.angebotWoerter)) return { grund: 'Angebot' };
  if (enthaelt(alles, w.nichtWoerter)) return { grund: 'passt nicht' };
  // Foren: Präsenz an fernem Ort ist nichts für Xander (online oder rund um Döbeln). Roh-Lauf 14.11.2026: „I'm looking for a
  // good B2.1 exam prep course in Berlin … I would prefer in person classes“. Ort im Titel ohne „online“ = vor Ort gesucht.
  if (!q.immerGesuch) {
    const km = w.vorOrtKm ?? 80;
    const imTitel = ortAus(titel);
    if (imTitel && imTitel.km > km && !istOnline(titel)) return { grund: `vor Ort (${imTitel.ort})` };
    if (enthaelt(alles, w.vorOrtWoerter) && !istOnline(alles)) { const o = ortAus(alles); if (!o || o.km > km) return { grund: 'vor Ort' }; }
  }
  if (!q.immerGesuch && !enthaelt(alles, w.suchWoerter)) return { grund: 'kein Gesuch' };
  if (q.streng && w.personWoerter && !(enthaelt(titel, w.suchWoerter) && enthaelt(titel, w.personWoerter))) return { grund: 'kein Gesuch (Titel)' };
  if (q.thema !== 'deutsch' && !enthaelt(alles, w.deutschWoerter)) return { grund: 'nicht Deutsch' };
  if (!enthaelt(alles, w.hilfeWoerter)) return { grund: 'keine Deutsch-Hilfe' };
  return { was: hilfeArt(alles, titel) };
}

// Reddit-Inhalt ist doppelt kodiert (HTML im Atom-<content>): nach dem Feed-Leser stehen noch „I&#39;ve“, „&#32;“, „&quot;“ da
export const klar = s => entities(entities(String(s ?? ''))).replace(/\s+/g, ' ').trim();
// Reddit hängt „submitted by /u/… [link] [comments]“ (oder „[Kommentare]“) an jeden Inhalt
const ohneRedditFuss = s => String(s || '').replace(/\s*submitted by\s+\/u\/\S+.*$/i, '').replace(/\s*\[link\]\s*\[(?:comments|kommentare)\]\s*$/i, '').trim();
// gekuerzt: die Quelle hat den Text schon abgeschnitten (Freelancer-Vorschau: 100 Zeichen, oft mitten im Wort) -> Wortrest weg, „…“
export const auszugAus = (s, n = 180, { gekuerzt = false } = {}) => {
  const t = ohneRedditFuss(klar(s));
  if (t.length > n) return `${t.slice(0, n - 1).replace(/\s+\S*$/, '')} …`;
  return gekuerzt && t && !/[.!?…)"“”]$/.test(t) ? `${t.replace(/\s+\S*$/, '').replace(/[,;:–-]+$/, '')} …` : t;
};

const SO = {
  reddit: 'Beitrag öffnen und kurz antworten (Kommentar oder Nachricht): wer du bist, dass du Deutsch online per Video unterrichtest, Preis oder kostenlose Kennenlernstunde. Vorlage unten.',
  freelancer: 'Auf Freelancer.com ein Gebot abgeben (kostenloses Konto): kurzer Text, was du machst, bis wann, Preis. Vorlage unten.',
  lemmy: 'Beitrag öffnen und antworten (Konto auf einer beliebigen Lemmy-Seite, z. B. feddit.org): wer du bist, online per Video, Kennenlernstunde. Vorlage unten.',
};

/**
 * Gesuche aus dem Netz holen. m = cfg.module.unterricht.gesuche. Liefert { eintraege, hinweise } – Fehler einzelner Quellen
 * sind Hinweise (die Fundorte erscheinen immer, der Bereich bleibt „ok“).
 */
export async function gesucheAusNetz({ holeText, m, jetzt = new Date(), zustand = null, kuenstler = {} }) {
  const eintraege = [], hinweise = [];
  if (!m || m.aktiv === false) return { eintraege, hinweise };
  const jetztMs = new Date(jetzt).getTime();
  const maxTage = m.maxAlterTage ?? 21;
  const funde = [];
  const zuAlt = d => !Number.isFinite(d) || jetztMs - d > maxTage * 864e5 || d - jetztMs > 864e5;

  // 1) Reddit (Atom). sammleFeeds: Höchstalter, gleicher Link/Titel einmal, HTTP 401 = gesperrt
  const feeds = (m.reddit || []).filter(r => r?.sub).map(r => ({ name: `Reddit r/${r.sub}`, url: redditSuche(r), maxAlterTage: maxTage, quelleInfo: r }));
  if (feeds.length) {
    const { items, fehler, gesperrt } = await sammleFeeds(holeText, feeds, { jetzt, maxAlterTage: maxTage, zustand });
    const aus = [...fehler, ...(gesperrt || [])];
    // Reddit sperrt GitHub-Läufe meist ganz (403/429): ein kurzer Hinweis statt einer Zeile je Suche
    if (aus.length === feeds.length && aus.every(f => /HTTP (40[13]|429)/.test(f))) hinweise.push(`Gesuche: Reddit gesperrt (${[...new Set(aus.map(f => f.match(/HTTP (\d+)/)[1]))].join('/')}) – Suche unter „Hier selbst schauen“`);
    else hinweise.push(...aus.map(f => `Gesuche: ${f}`));
    for (const it of items) {
      const titel = klar(it.titel), text = ohneRedditFuss(klar(it.beschreibung)), thema = it.feedInfo?.quelleInfo?.thema || null;
      const p = pruefeGesuch(titel, text, m, { thema, streng: true });
      if (!p.was || !it.link) continue;
      const d = Date.parse(it.datum || '');
      if (zuAlt(d)) continue;
      // Abfrage über mehrere Subreddits („German+LearnGerman“): Quelle = das Subreddit des Beitrags (aus dem Link)
      const sub = String(it.link).match(/reddit\.com\/r\/([^/]+)\//i)?.[1];
      funde.push({ titel, link: it.link, datum: new Date(d).toISOString(), auszug: auszugAus(text), quelle: sub ? `Reddit r/${sub}` : it.feed, was: p.was, art: 'reddit', text, thema });
    }
  }

  // 2) Freelancer.com (JSON): jedes Projekt ist ein Auftrag -> „sucht“ muss nicht im Text stehen
  for (const q of [].concat(m.freelancer || [])) {
    try {
      const j = JSON.parse(await holeText(freelancerSuche(q), { headers: { accept: 'application/json' } }));
      if (j.status && j.status !== 'success') throw new Error(`Status ${j.status}`);
      for (const pr of j.result?.projects || []) {
        if (!pr?.seo_url || !pr.title) continue;
        const text = klar(pr.description || pr.preview_description || '');
        const p = pruefeGesuch(pr.title, text, m, { immerGesuch: true, thema: (pr.jobs || []).some(j => FL_DEUTSCH.test(j?.name || '')) ? 'deutsch' : null });
        if (!p.was || !freelancerPasst(pr)) continue;
        const d = Number(pr.time_submitted || pr.submitdate) * 1000;
        if (zuAlt(d)) continue;
        const b = pr.budget || {}, cur = pr.currency?.code || '';
        const budget = b.minimum != null ? `${b.maximum != null && b.maximum !== b.minimum ? `${Math.round(b.minimum)}–${Math.round(b.maximum)}` : Math.round(b.minimum)} ${cur}${pr.type === 'hourly' ? ' pro Std.' : ''}`.trim() : '';
        const gebote = pr.bid_stats?.bid_count != null ? `${pr.bid_stats.bid_count} ${pr.bid_stats.bid_count === 1 ? 'Gebot' : 'Gebote'}` : '';
        funde.push({ titel: pr.title, link: freelancerLink(pr.seo_url), datum: new Date(d).toISOString(), auszug: auszugAus(text, 180, { gekuerzt: !pr.description && text.length >= 95 }), quelle: 'Freelancer', was: p.was, art: 'freelancer', zusatz: [budget, gebote].filter(Boolean).join(' · ') });
      }
    } catch (e) { hinweise.push(`Gesuche: Freelancer „${q?.name || q}“: ${e.message}`); }
  }

  // 3) Lemmy (Fediverse-Foren, z. B. feddit.org) – Beiträge wie bei Reddit prüfen (Gesuch + Deutsch + Hilfe)
  for (const l of [].concat(m.lemmy || []).filter(l => l?.instanz && l?.q)) {
    try {
      const j = JSON.parse(await holeText(lemmySuche(l), { headers: { accept: 'application/json' } }));
      for (const x of j.posts || []) {
        const po = x?.post;
        if (!po?.name || !po.ap_id || po.deleted || po.removed) continue;
        const titel = klar(po.name), text = klar(po.body), thema = l.thema || null;
        const p = pruefeGesuch(titel, text, m, { thema, streng: true });
        if (!p.was) continue;
        const d = lemmyZeit(po.published);
        if (zuAlt(d)) continue;
        const forum = x.community?.name ? `${x.community.name}@${new URL(x.community.actor_id || `https://${l.instanz}`).host}` : l.instanz;
        funde.push({ titel, link: po.ap_id, datum: new Date(d).toISOString(), auszug: auszugAus(text), quelle: `Lemmy ${forum}`, was: p.was, art: 'lemmy', text, thema });
      }
    } catch (e) { hinweise.push(`Gesuche: Lemmy ${l.instanz} „${l.q}“: ${e.message}`); }
  }

  // Gedächtnis für Forenbeiträge (Prüfer 14.11.2026): /new/.rss?limit=100 reicht bei r/German ~9 Tage, bei der Sammelabfrage
  // (forhire+…) unter 1 Tag zurück, und jeder Lauf ersetzte die Einträge – ein „[Hiring]“ wäre nur Stunden zu sehen gewesen.
  // Gemerkte Beiträge kommen wieder dazu, solange sie jünger als maxAlterTage sind, und werden mit dem AKTUELLEN Filter neu
  // geprüft (ein später erkannter Fehltreffer verschwindet beim nächsten Lauf). Freelancer nicht: dort zählt nur „noch offen“.
  const linkKey = l => String(l).replace(/[?#].*$/, '').replace(/\/+$/, '').toLowerCase();
  const merk = zustand ? (zustand.gesuche && typeof zustand.gesuche === 'object' ? zustand.gesuche : (zustand.gesuche = {})) : null;
  if (merk) {
    const frischeLinks = new Set(funde.map(f => linkKey(f.link)));
    for (const [k, s] of Object.entries(merk)) {
      if (frischeLinks.has(k) || !s?.titel || !s.link) continue;
      const d = Date.parse(s.datum || '');
      if (zuAlt(d)) continue;
      const p = pruefeGesuch(s.titel, s.text || '', m, { thema: s.thema || null, streng: true });
      if (p.was) funde.push({ titel: s.titel, link: s.link, datum: s.datum, auszug: auszugAus(s.text || ''), quelle: s.quelle, was: p.was, art: s.art, text: s.text || '', thema: s.thema || null });
    }
    for (const k of Object.keys(merk)) delete merk[k];
    const foren = funde.filter(f => f.art === 'reddit' || f.art === 'lemmy').sort((a, b) => Date.parse(b.datum) - Date.parse(a.datum)).slice(0, 60);
    for (const f of foren) merk[linkKey(f.link)] = { titel: f.titel, link: f.link, datum: f.datum, quelle: f.quelle, art: f.art, thema: f.thema || null, text: String(f.text || '').slice(0, 500) };
  }

  // gleicher Link oder (fast) gleicher Titel aus mehreren Suchen -> einmal; neueste zuerst
  const gesehen = new Set();
  const liste = funde.sort((a, b) => Date.parse(b.datum) - Date.parse(a.datum)).filter(f => {
    // Freelancer: gleiche Titel („English to German translation“) sind oft verschiedene Aufträge -> Titel + Budget
    const k1 = linkKey(f.link), k2 = norm(`${f.titel} ${f.art === 'freelancer' ? f.zusatz || f.link : ''}`).slice(0, 110);
    if (gesehen.has(k1) || gesehen.has(k2)) return false;
    gesehen.add(k1); gesehen.add(k2); return true;
  }).slice(0, m.maxEintraege ?? 20);

  for (const f of liste) {
    // neuer = weiter oben (höchstens +10 für heute, 0 nach maxAlterTage)
    const frisch = Math.max(0, Math.round(10 * (1 - (jetztMs - Date.parse(f.datum)) / (maxTage * 864e5))));
    const wert = 70;
    eintraege.push(eintrag({
      kategorie: 'unterricht', titel: f.titel, quelle: f.quelle, link: f.link, datum: f.datum, jetzt, art: 'aufruf',
      fensterStunden: maxTage * 24,
      zeile: ['Gesuch', WAS_NAME[f.was], `vom ${datumDe(berlinTag(f.datum))}`, f.zusatz || ''].filter(Boolean).join(' · '),
      soGehts: SO[f.art], wert, sofort: false, grund: 'gesuch',
      extra: {
        typ: 'gesuch', gesuch: true, was: f.was, auszug: f.auszug || null, ort: 'online', km: null, online: true, frist: null,
        bewerbung: { art: 'seite', ziel: f.link }, quelle: f.quelle, bewerbenAls: bewerbenAls('unterricht', kuenstler),
        sortWert: sortWert({ wert, online: true }) + frisch,
      },
    }));
  }

  // 4) Fundorte (immer): fertige Suchen auf Plattformen ohne offenen Zugang. Keine tägliche Link-Prüfung – diese Seiten
  // sperren Abrufe ohne Browser (403), das wäre ein falsches „nicht erreichbar“.
  const fund = fundortEintraege((m.fundorte || []).map(f => ({ typ: 'gesuch', ...f })), { kategorie: 'unterricht', jetzt, kuenstler });
  for (const e of fund) e.extra.gesuch = true;
  eintraege.push(...fund);
  return { eintraege, hinweise };
}
