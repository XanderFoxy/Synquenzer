// Gesuche aus dem Netz (Xander 14.11.2026): „keine normalen Stellen von der Arbeitsagentur, sondern Anfragen im Internet –
// wenn jemand über Fiverr, Upwork oder andere Seiten, Foren, Reddit usw. jemanden sucht, der ihm mit Deutsch hilft“.
// Gehört zum Bereich „unterricht“ (unterricht.mjs ruft gesucheAusNetz auf), Einträge mit extra.typ 'gesuch'.
// Quellen (config module.unterricht.gesuche):
//   - Reddit-Suche je Subreddit als Atom-Feed (…/search.rss?q=…&restrict_sr=1&sort=new), ohne Login
//   - Freelancer.com: öffentliche Projekt-API (…/api/projects/0.1/projects/active/?query=…), JSON, ohne Schlüssel
//   - Fundorte mit fertiger Suche für Plattformen ohne offenen Zugang (Upwork: RSS seit 08/2024 abgeschaltet, Fiverr: keine
//     öffentlichen Käufer-Anfragen, Kleinanzeigen: kein Feed) – erscheinen IMMER.
// Filter: Sucht jemand Hilfe (suche/looking for/need/[hiring] …)? Geht es um Deutsch (oder ist das Forum Deutsch)? Welche
// Hilfe (Nachhilfe, Korrektur, Übersetzung, Konversation, Prüfung, Behördenbrief, Bewerbung)? Angebote von Lehrern selbst
// ([for hire], [offer], biete …) raus, höchstens maxAlterTage (14) alt, gleicher Link/Titel nur einmal.
// Ausfälle (Reddit sperrt Rechenzentrums-IPs gern mit 403/429) landen als Hinweis im Status, nicht als Störung des Bereichs.
import { enthaelt, norm, datumDe } from '../lib/text.mjs';
import { berlinTag } from '../lib/ende.mjs';
import { sammleFeeds, eintrag } from './gemeinsam.mjs';
import { bewerbenAls, fundortEintraege, sortWert } from './assistent.mjs';

// sub darf mehrere Subreddits mit „+“ verbinden (eine Abfrage statt sieben: Reddit drosselt GitHub-Läufe schnell mit 429)
export const redditSuche = ({ sub, q }) =>
  `https://www.reddit.com/r/${String(sub).split('+').map(encodeURIComponent).join('+')}/search.rss?q=${encodeURIComponent(q)}&restrict_sr=1&sort=new&t=month`;
export const freelancerSuche = q => `https://www.freelancer.com/api/projects/0.1/projects/active/?query=${encodeURIComponent(q)}&limit=50&job_details=true`;
// Lemmy (Fediverse, z. B. feddit.org): offene Such-API, JSON, ohne Konto
export const lemmySuche = ({ instanz, q }) => `https://${instanz}/api/v3/search?q=${encodeURIComponent(q)}&type_=Posts&sort=New&listing_type=All&limit=50`;
// Lemmy 0.18 liefert „2026-11-10T12:00:00.123“ ohne Zone (= UTC), 0.19 mit „Z“
const lemmyZeit = s => Date.parse(/[zZ]|[+-]\d\d:?\d\d$/.test(String(s || '')) ? s : `${s}Z`);
// Freelancer-Volltextsuche trifft auch Aufträge, in denen Deutsch/Übersetzung nur nebenbei vorkommt (echter Lauf 14.11.2026:
// „E-Mail-Vorlagen für ein Übersetzungsbüro“). Darum: „German/Deutsch“ im Titel ODER eine passende Fähigkeit (jobs) am Projekt.
const FL_SKILL = /german|deutsch|translat|proofread|tutor|teach|language|lektor|übersetz/i;
export const freelancerPasst = pr => /german|deutsch/i.test(pr?.title || '') || (pr?.jobs || []).some(j => FL_SKILL.test(j?.name || ''));
export const freelancerLink = seo => `https://www.freelancer.com/projects/${String(seo).replace(/^\/+/, '')}`;

// Welche Hilfe? Reihenfolge = Vorrang (Bewerbung vor Korrektur: „Anschreiben korrigieren“ ist eine Bewerbung).
const ARTEN = [
  ['pruefung', 'goethe|telc|testdaf|=dsh|=ösd|prüfung|=exam|=exams|examen'],
  ['bewerbung', 'bewerbung|lebenslauf|anschreiben|cover letter|=cv|motivationsschreiben|job application'],
  ['behoerde', 'behörde|=amt|=ämter|jobcenter|=brief|=briefe|=letter|=letters|formular|=forms|=anmeldung|=antrag'],
  ['uebersetzung', 'übersetz|translat'],
  ['korrektur', 'proofread|korrektur|korrigier|lektor|correct my|correcting|correction|=edit|editing'],
  ['konversation', 'konversation|conversation|speaking|=sprechen|practice|=üben|=chat'],
];
export const WAS_NAME = {
  pruefung: 'Prüfungsvorbereitung', bewerbung: 'Bewerbung auf Deutsch', behoerde: 'Behördenbrief', uebersetzung: 'Übersetzung',
  korrektur: 'Korrektur', konversation: 'Konversation', nachhilfe: 'Nachhilfe',
};
export const hilfeArt = text => ARTEN.find(([, w]) => enthaelt(text, [w]))?.[0] || 'nachhilfe';

/**
 * Ist das ein Gesuch? titel/text getrennt, weil „[Offer]“/„biete“ im Titel ein Angebot ist, ein „offering 20 $/h“ im Text
 * eines Suchenden aber nicht. q = { thema: 'deutsch' (Forum ist schon Deutsch), immerGesuch (Plattform = nur Aufträge) }
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
  if (!q.immerGesuch && !enthaelt(alles, w.suchWoerter)) return { grund: 'kein Gesuch' };
  if (q.thema !== 'deutsch' && !enthaelt(alles, w.deutschWoerter)) return { grund: 'nicht Deutsch' };
  if (!enthaelt(alles, w.hilfeWoerter)) return { grund: 'keine Deutsch-Hilfe' };
  return { was: hilfeArt(alles) };
}

// Reddit hängt „submitted by /u/… [link] [comments]“ an jeden Inhalt
const ohneRedditFuss = s => String(s || '').replace(/\s*submitted by\s+\/u\/\S+.*$/i, '').replace(/\s*\[link\]\s*\[comments\]\s*$/i, '').trim();
export const auszugAus = (s, n = 180) => {
  const t = ohneRedditFuss(s).replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1).replace(/\s+\S*$/, '')} …` : t;
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
  const feeds = (m.reddit || []).filter(r => r?.sub && r?.q).map(r => ({ name: `Reddit r/${r.sub}`, url: redditSuche(r), maxAlterTage: maxTage, quelleInfo: r }));
  if (feeds.length) {
    const { items, fehler, gesperrt } = await sammleFeeds(holeText, feeds, { jetzt, maxAlterTage: maxTage, zustand });
    const aus = [...fehler, ...(gesperrt || [])];
    // Reddit sperrt GitHub-Läufe meist ganz (403/429): ein kurzer Hinweis statt einer Zeile je Suche
    if (aus.length === feeds.length && aus.every(f => /HTTP (40[13]|429)/.test(f))) hinweise.push(`Gesuche: Reddit gesperrt (${[...new Set(aus.map(f => f.match(/HTTP (\d+)/)[1]))].join('/')}) – Suche unter „Hier selbst schauen“`);
    else hinweise.push(...aus.map(f => `Gesuche: ${f}`));
    for (const it of items) {
      const p = pruefeGesuch(it.titel, it.beschreibung, m, { thema: it.feedInfo?.quelleInfo?.thema });
      if (!p.was || !it.link) continue;
      const d = Date.parse(it.datum || '');
      if (zuAlt(d)) continue;
      // Abfrage über mehrere Subreddits („German+LearnGerman“): Quelle = das Subreddit des Beitrags (aus dem Link)
      const sub = String(it.link).match(/reddit\.com\/r\/([^/]+)\//i)?.[1];
      funde.push({ titel: it.titel, link: it.link, datum: new Date(d).toISOString(), auszug: auszugAus(it.beschreibung), quelle: sub ? `Reddit r/${sub}` : it.feed, was: p.was, art: 'reddit' });
    }
  }

  // 2) Freelancer.com (JSON): jedes Projekt ist ein Auftrag -> „sucht“ muss nicht im Text stehen
  for (const q of [].concat(m.freelancer || [])) {
    try {
      const j = JSON.parse(await holeText(freelancerSuche(q), { headers: { accept: 'application/json' } }));
      if (j.status && j.status !== 'success') throw new Error(`Status ${j.status}`);
      for (const pr of j.result?.projects || []) {
        if (!pr?.seo_url || !pr.title) continue;
        const text = pr.preview_description || pr.description || '';
        const p = pruefeGesuch(pr.title, text, m, { immerGesuch: true });
        if (!p.was || !freelancerPasst(pr)) continue;
        const d = Number(pr.time_submitted || pr.submitdate) * 1000;
        if (zuAlt(d)) continue;
        const b = pr.budget || {}, cur = pr.currency?.code || '';
        const budget = b.minimum != null ? `${b.maximum != null && b.maximum !== b.minimum ? `${Math.round(b.minimum)}–${Math.round(b.maximum)}` : Math.round(b.minimum)} ${cur}${pr.type === 'hourly' ? ' pro Std.' : ''}`.trim() : '';
        const gebote = pr.bid_stats?.bid_count != null ? `${pr.bid_stats.bid_count} ${pr.bid_stats.bid_count === 1 ? 'Gebot' : 'Gebote'}` : '';
        funde.push({ titel: pr.title, link: freelancerLink(pr.seo_url), datum: new Date(d).toISOString(), auszug: auszugAus(text), quelle: 'Freelancer', was: p.was, art: 'freelancer', zusatz: [budget, gebote].filter(Boolean).join(' · ') });
      }
    } catch (e) { hinweise.push(`Gesuche: Freelancer „${q}“: ${e.message}`); }
  }

  // 3) Lemmy (Fediverse-Foren, z. B. feddit.org) – Beiträge wie bei Reddit prüfen (Gesuch + Deutsch + Hilfe)
  for (const l of [].concat(m.lemmy || []).filter(l => l?.instanz && l?.q)) {
    try {
      const j = JSON.parse(await holeText(lemmySuche(l), { headers: { accept: 'application/json' } }));
      for (const x of j.posts || []) {
        const po = x?.post;
        if (!po?.name || !po.ap_id || po.deleted || po.removed) continue;
        const p = pruefeGesuch(po.name, po.body || '', m, { thema: l.thema });
        if (!p.was) continue;
        const d = lemmyZeit(po.published);
        if (zuAlt(d)) continue;
        const forum = x.community?.name ? `${x.community.name}@${new URL(x.community.actor_id || `https://${l.instanz}`).host}` : l.instanz;
        funde.push({ titel: po.name, link: po.ap_id, datum: new Date(d).toISOString(), auszug: auszugAus(po.body), quelle: `Lemmy ${forum}`, was: p.was, art: 'lemmy' });
      }
    } catch (e) { hinweise.push(`Gesuche: Lemmy ${l.instanz} „${l.q}“: ${e.message}`); }
  }
  // VORLÄUFIG (nur Erkundungs-Lauf, vor dem Zusammenführen entfernen): Kandidaten-Quellen abrufen, damit der Roh-Mitschnitt sie zeigt
  for (const u of [].concat(m._probe || [])) { try { await holeText(u); } catch { /* nur Mitschnitt */ } }

  // gleicher Link oder (fast) gleicher Titel aus mehreren Suchen -> einmal; neueste zuerst
  const gesehen = new Set();
  const liste = funde.sort((a, b) => Date.parse(b.datum) - Date.parse(a.datum)).filter(f => {
    // Freelancer: gleiche Titel („English to German translation“) sind oft verschiedene Aufträge -> Titel + Budget
    const k1 = f.link.replace(/[?#].*$/, '').replace(/\/+$/, '').toLowerCase(), k2 = norm(`${f.titel} ${f.art === 'freelancer' ? f.zusatz || f.link : ''}`).slice(0, 110);
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
