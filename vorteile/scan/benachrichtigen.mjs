// Zwei Stufen: "Sofort" (wenige, wirklich seltene Chancen) und eine tägliche Zusammenfassung für den Rest.
// Strenges Dedupe: jeder Eintrag (id und ähnlicher Titel) wird höchstens einmal gemeldet. Tageslimit für Sofort-Pushes.
import { schluessel } from './lib/text.mjs';

export const KATEGORIEN = {
  deals: 'Deals', erleben: 'Erleben', reisen: 'Reisen', musik: 'Musik', nebenverdienst: 'Nebenverdienst', tests: 'Tests & Gewinnspiele',
  praemien: 'Prämien & Freunde werben', filme: 'Filme & Serien', remix: 'Remix-Contests', auftritte: 'Auftritte', unterricht: 'Deutschunterricht', auftraege: 'Nebenverdienst', essen: 'Essen',
  events: 'Ausflüge & Aktionen', knaller: 'Wochen-Knaller', filialen: 'Filialen (OpenStreetMap)',
};

export function berlin(jetzt) {
  const f = new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' });
  const p = Object.fromEntries(f.formatToParts(new Date(jetzt)).map(x => [x.type, x.value]));
  return { tag: `${p.year}-${p.month}-${p.day}`, stunde: Number(p.hour) };
}

const titelKey = e => 't' + schluessel(e.titel.slice(0, 50));
const schonGemeldet = (e, gemeldet) => gemeldet[e.id] || gemeldet[titelKey(e)];

export function sofortNachricht(e, cfg) {
  return {
    topic: cfg.ntfy.topic,
    title: `${KATEGORIEN[e.kategorie] || 'Vorteil'}: ${e.titel}`.slice(0, 140),
    message: [e.zeile, `So geht's: ${e.soGehts}`].filter(Boolean).join('\n'),
    click: e.link, priority: 4, tags: ['sparkles'],
    actions: [{ action: 'view', label: 'Öffnen', url: e.link, clear: true }, { action: 'view', label: 'Alle Vorteile', url: cfg.seite }],
  };
}

export function digestNachricht(liste, cfg) {
  const max = cfg.ntfy.digestMaxZeilen ?? 12;
  const zeilen = liste.slice(0, max).map(e => `• ${KATEGORIEN[e.kategorie] || ''}: ${e.titel}${e.zeile ? ` – ${e.zeile}` : ''}`);
  if (liste.length > max) zeilen.push(`… und ${liste.length - max} weitere auf der Seite`);
  return {
    topic: cfg.ntfy.topic, title: `Deine Vorteile heute: ${liste.length} neu`, message: zeilen.join('\n'),
    click: cfg.seite, priority: 3, tags: ['sunny'], actions: [{ action: 'view', label: 'Alle ansehen', url: cfg.seite }],
  };
}

/**
 * Plant die Pushes dieses Laufs. zustand = { gemeldet: {key: iso}, sofortTage: {tag: anzahl}, digestTag }
 * modus: 'auto' (stündlich; Digest einmal ab digestStunde), 'digest' (Digest jetzt erzwingen), 'still' (nichts senden)
 */
export function plane({ eintraege, zustand, cfg, jetzt, modus = 'auto' }) {
  const { tag, stunde } = berlin(jetzt);
  const gemeldet = zustand.gemeldet || {};
  // Xander 16.11.2026: „In den Benachrichtigungen immer nur, was jetzt aktuell ist.“ Was erst später beginnt (ab), bleibt
  // ungemeldet und kommt in dem Lauf, in dem es gilt.
  const jetztMs = new Date(jetzt).getTime();
  const neu = eintraege.filter(e => !schonGemeldet(e, gemeldet) && !(e.ab && Date.parse(e.ab) > jetztMs));
  // dieselbe Sache aus zwei Quellen -> einmal
  const einmal = [];
  const tk = new Set();
  for (const e of [...neu].sort((a, b) => b.wert - a.wert)) { const k = titelKey(e); if (!tk.has(k)) { tk.add(k); einmal.push(e); } }

  const schonHeute = zustand.sofortTage?.[tag] || 0;
  const frei = Math.max(0, (cfg.ntfy.maxSofortProTag ?? 3) - schonHeute);
  const sofort = modus === 'still' ? [] : einmal.filter(e => e.sofort).slice(0, frei);
  const rest = einmal.filter(e => !sofort.includes(e));

  const digestFaellig = modus === 'digest' || (modus === 'auto' && stunde >= (cfg.ntfy.digestStunde ?? 18) && zustand.digestTag !== tag);
  const digest = digestFaellig && rest.length ? rest : [];
  return {
    tag,
    sofort: sofort.map(e => ({ e, msg: sofortNachricht(e, cfg) })),
    digest: digest.length ? { liste: digest, msg: digestNachricht(digest, cfg) } : null,
    digestFaellig,
  };
}

/** Einträge als schon gemeldet markieren (ohne Push), z. B. beim ersten Lauf eines neuen Moduls. */
export function alsGemeldet(zustand, eintraege, jetzt) {
  const iso = new Date(jetzt).toISOString();
  zustand.gemeldet ||= {};
  for (const e of eintraege) { zustand.gemeldet[e.id] = iso; zustand.gemeldet[titelKey(e)] = iso; }
  return zustand;
}

/** Nach dem Senden: Zustand fortschreiben (nur wirklich gesendete Einträge gelten als gemeldet). */
export function verbuche(zustand, plan, ok, jetzt) {
  const iso = new Date(jetzt).toISOString();
  zustand.gemeldet ||= {};
  zustand.sofortTage ||= {};
  plan.sofort.forEach((s, i) => {
    if (!ok.sofort[i]) return;
    zustand.gemeldet[s.e.id] = iso; zustand.gemeldet[titelKey(s.e)] = iso;
    zustand.sofortTage[plan.tag] = (zustand.sofortTage[plan.tag] || 0) + 1;
  });
  if (plan.digest && ok.digest) for (const e of plan.digest.liste) { zustand.gemeldet[e.id] = iso; zustand.gemeldet[titelKey(e)] = iso; }
  if (plan.digestFaellig && (ok.digest || !plan.digest)) { zustand.digestTag = plan.tag; delete zustand.digestVersuch; }
  else if (plan.digestFaellig && plan.digest) zustand.digestVersuch = iso; // gescheitert: faellig.mjs wartet eine Stunde
  // aufräumen: 60 Tage merken
  const grenze = new Date(new Date(jetzt).getTime() - 60 * 864e5).toISOString();
  for (const [k, v] of Object.entries(zustand.gemeldet)) if (v < grenze) delete zustand.gemeldet[k];
  for (const t of Object.keys(zustand.sofortTage)) if (t < grenze.slice(0, 10)) delete zustand.sofortTage[t];
  return zustand;
}

export async function sende(msg, cfg, { dryRun, token, log = console.log, fetchImpl = globalThis.fetch } = {}) {
  if (dryRun) { log(`[dry-run] ntfy: ${msg.title} – ${msg.message.split('\n')[0]}`); return true; }
  try {
    const headers = { 'content-type': 'application/json' };
    if (token) headers.authorization = `Bearer ${token}`;
    const r = await fetchImpl(cfg.ntfy.server, { method: 'POST', headers, body: JSON.stringify(msg) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return true;
  } catch (e) { log(`ntfy fehlgeschlagen: ${e.message}`); return false; }
}

// ---------------------------------------------------------------- Dezember: Film des Tages (Xander 16.11.2026)
// „Im Dezember (1.–31.12.) den Weihnachts-/Adventskalender-Deal jeden Tag in die Benachrichtigungen, welcher Film heute der
// Preisknüller ist.“ Apple macht im Dezember einen „Countdown“ (31 Tage, ein Film je Tag; 2024/2025 meist 4,99 €, früher 3,99 €
// – Berichte appgefahren.de, macerkopf.de, ifun.de). Apple zeigt ihn nur in der TV-App; der Radar erkennt ihn über mydealz-Tipps
// und Countdown-Räume der TV-App (filme.json „countdown“). Sonst: der heute gesenkte Film bis 3,99 € aus den eigenen
// Preis-Abrufen, sonst der bekannteste Film bis 3,99 €, der im Dezember noch nicht dran war. Nur mit frischen Daten (≤ 12 h) –
// nie, was nicht mehr gilt. Eigener Zähler: zählt nicht zu den höchstens 3 Sofort-Nachrichten am Tag.
// Zeiten (Berliner Zeit): Apples Tagesangebot ab adventStunde (8 Uhr) bis 21 Uhr, sobald der Radar es sieht; der Ersatz (gesenkt/
// Tipp) erst ab adventErsatzStunde (12 Uhr) – bis dahin stündlich auf den Countdown warten (mydealz-Beiträge kommen oft erst am
// Vormittag). Kam schon der Ersatz und erscheint danach noch der Countdown, kommt er am selben Tag hinterher (Prüfer 16.11.).
export const ADVENT = { stunde: 8, ersatzStunde: 12, bisStunde: 21, maxAlterStunden: 12, pauseMs: 60 * 60e3 };
const MONAT_DEZ = 'Dez.';
const euroText = v => `${Number(v).toFixed(2).replace('.', ',')} €`;
const istFilm = t => t && typeof t === 'object' && t.typ === 'film' && typeof t.titel === 'string' && t.titel.trim()
  && typeof t.link === 'string' && /^https:\/\//.test(t.link) && typeof t.preis === 'number' && t.preis > 0;
const gueteWert = t => (t.gross ? 1000 : 0) + (Number(t.bekannt) || 0) + (Number(t.rt) || 0) / 10;

/**
 * Dezember-Tag (Berliner Zeit) und ob der Tages-Push jetzt dran ist.
 * heute = was heute schon gesendet wurde (art: 'countdown' | 'gesenkt' | 'tipp'; alter Zustand ohne art = erledigt) oder null;
 * offen = ein Push ist heute noch möglich (nichts gesendet, oder erst der Ersatz – dann nur noch der Countdown);
 * faellig = ein eigener Lauf lohnt (Vorprüfung faellig.mjs): heute noch nichts gesendet.
 */
export function adventFenster(cfg, zustand, jetzt) {
  const { tag, stunde } = berlin(jetzt);
  const ab = cfg?.ntfy?.adventStunde ?? ADVENT.stunde, bis = cfg?.ntfy?.adventBisStunde ?? ADVENT.bisStunde;
  const ersatzAb = Math.max(ab, cfg?.ntfy?.adventErsatzStunde ?? ADVENT.ersatzStunde);
  const dezember = /^\d{4}-12-\d\d$/.test(tag) && cfg?.ntfy?.advent !== false;
  const versuch = Date.parse(zustand?.adventVersuch || '');
  const pause = Number.isFinite(versuch) && new Date(jetzt).getTime() - versuch < ADVENT.pauseMs;
  const heute = zustand?.advent?.tag === tag ? (zustand.advent.art || 'countdown') : null;
  const offen = dezember && stunde >= ab && stunde <= bis && !pause && heute !== 'countdown';
  return { tag, stunde, ersatzAb, heute, offen, faellig: offen && !heute };
}

/**
 * Film des Tages aus filme.json (datei). schon = Film-IDs, die im Dezember schon gemeldet wurden.
 * -> { id, titel, jahr, preis, link, bild, grund, art: 'countdown' | 'gesenkt' | 'tipp' } | null
 */
export function tagesFilm(datei, { tag, schon = [], angebotPreis = 3.99 } = {}) {
  if (!datei || typeof datei !== 'object') return null;
  const nie = new Set(schon);
  // 1) Apples Countdown/Adventskalender – heute gesehen (mydealz-Tipp oder Countdown-Raum der TV-App), auch über 3,99 €
  const cd = (Array.isArray(datei.countdown) ? datei.countdown : [])
    .filter(c => c && c.tag === tag && typeof c.titel === 'string' && c.titel.trim() && /^https:\/\//.test(String(c.link || '')) && !nie.has(c.id));
  if (cd.length) {
    const c = cd.find(x => istAppleLink(x.link)) || cd[0]; // mit Link in die TV-App zuerst
    const apple = istAppleLink(c.link);
    return { id: c.id, titel: c.titel.trim(), jahr: c.jahr ?? null, preis: typeof c.preis === 'number' && c.preis > 0 ? c.preis : null, link: c.link, bild: c.bild ?? null,
      grund: c.quelle === 'apple-tv' ? `im Apple-TV-Countdown${c.raum ? ` („${c.raum}“)` : ''}` : apple ? 'Apple-Countdown laut mydealz-Tipp' : 'Apple-Countdown laut mydealz-Tipp (bei Apple nicht eindeutig gefunden)',
      art: 'countdown', apple };
  }
  const g = datei.gruppen && typeof datei.gruppen === 'object' ? datei.gruppen : {};
  const gesehen = new Set();
  const filme = ['fuer399', 'wunsch', 'achtziger', 'disney', 'action', 'comedy']
    .flatMap(k => (Array.isArray(g[k]) ? g[k] : []))
    .filter(t => istFilm(t) && t.quelle !== 'mydealz' && t.preis <= angebotPreis + 0.004 && !nie.has(t.id) && !gesehen.has(t.id) && gesehen.add(t.id));
  const best = arr => [...arr].sort((a, b) => gueteWert(b) - gueteWert(a))[0] || null;
  // 2) heute gesenkt (eigene Preis-Abrufe): der neueste Preisknüller
  const heute = best(filme.filter(t => t.seit === tag && typeof t.vorher === 'number' && t.vorher > t.preis + 0.004));
  if (heute) return { ...auswahl(heute), grund: `heute gesenkt, vorher ${euroText(heute.vorher)}`, art: 'gesenkt' };
  // 3) sonst der bekannteste 3,99-€-Film, der im Dezember noch nicht dran war – ehrlich als Tipp, nicht als „Film des Tages“
  //    (der Preis gilt oft schon seit Wochen; Prüfer 16.11.)
  const tipp = best(filme);
  if (!tipp) return null;
  const seit = datumKurz(tipp.seit);
  return { ...auswahl(tipp), grund: ['Heute kein Apple-Tagesangebot gefunden', `${tipp.gross ? 'große Produktion' : 'Film'} für ${euroText(tipp.preis)}${seit ? ` (Preis seit ${seit})` : ''}`].join(' · '), art: 'tipp' };
}
const auswahl = t => ({ id: t.id, titel: t.titel.trim(), jahr: t.jahr ?? null, preis: t.preis, link: t.link, bild: t.bild ?? null, apple: istAppleLink(t.link) });
const MONATE = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];
const datumKurz = iso => { const m = /^(\d{4})-(\d\d)-(\d\d)/.exec(String(iso || '')); return m ? `${Number(m[3])}. ${MONATE[Number(m[2]) - 1]}` : null; };
/** Link in die TV-App bzw. zu Apple (sonst: mydealz-Tipp ohne eindeutigen Apple-Film). */
export const istAppleLink = u => /^https:\/\/(?:[a-z0-9-]+\.)*apple\.com\//i.test(String(u || ''));
const ADVENT_TITEL = { countdown: 'Film des Tages', gesenkt: 'Heute gesenkt', tipp: 'Film-Tipp' };

export function adventNachricht(f, tag, cfg) {
  const d = Number(String(tag).slice(8, 10));
  const jahr = f.jahr && !/\((?:19|20)\d\d\)/.test(f.titel) ? ` (${f.jahr})` : '';
  const seite = String(cfg.seite || '').replace(/#.*$/, '') + '#filme';
  const apple = f.apple ?? istAppleLink(f.link);
  // ohne Apple-Link (Countdown-Tipp, bei Apple nicht eindeutig gefunden): ehrlich sagen, dass der Link zu mydealz führt
  const so = apple ? 'So geht\'s: Link öffnen – die TV-App zeigt den Film. Preis prüfen, „Kaufen“ tippen und mit Face ID bestätigen.'
    : 'So geht\'s: Der Link öffnet den mydealz-Tipp (Apple-Link dort). In der TV-App den Film suchen, Preis prüfen und kaufen.';
  return {
    topic: cfg.ntfy.topic,
    title: `${ADVENT_TITEL[f.art] || ADVENT_TITEL.countdown} · ${d}. ${MONAT_DEZ}: ${f.titel}${jahr}${f.preis != null ? ` für ${euroText(f.preis)}` : ''}`.slice(0, 140),
    message: [f.grund, so].filter(Boolean).join('\n'),
    click: f.link, priority: 3, tags: ['clapper'],
    actions: [{ action: 'view', label: apple ? 'In der TV-App öffnen' : 'mydealz-Tipp öffnen', url: f.link, clear: true }, { action: 'view', label: 'Alle 3,99-€-Filme', url: seite }],
  };
}

/**
 * Plant den Dezember-Push dieses Laufs: null (nicht dran) | { tag, film: null (kein frischer Film / warten) | {…}, msg }.
 * Vor adventErsatzStunde nur Apples Tagesangebot; danach der Ersatz. Kam heute schon der Ersatz, nur noch der Countdown.
 */
export function planeAdvent({ datei, zustand, cfg, jetzt, modus = 'auto' }) {
  if (modus === 'still') return null;
  const f = adventFenster(cfg, zustand, jetzt);
  if (!f.offen) return null;
  const alter = (new Date(jetzt).getTime() - Date.parse(datei?.aktualisiert || '')) / 36e5;
  if (!(alter >= -1 && alter <= ADVENT.maxAlterStunden)) return f.heute ? null : { tag: f.tag, film: null, msg: null, grund: 'keine frischen Film-Daten' };
  const jahr = f.tag.slice(0, 4);
  const schon = zustand?.advent?.jahr === jahr && Array.isArray(zustand.advent.ids) ? zustand.advent.ids : [];
  const film = tagesFilm(datei, { tag: f.tag, schon });
  if (f.heute) return film?.art === 'countdown' ? { tag: f.tag, film, msg: adventNachricht(film, f.tag, cfg), grund: null, nachtrag: true } : null;
  if (film && film.art !== 'countdown' && f.stunde < f.ersatzAb) return { tag: f.tag, film: null, msg: null, warten: true, grund: `bis ${f.ersatzAb} Uhr auf Apples Tagesangebot warten` };
  return { tag: f.tag, film, msg: film ? adventNachricht(film, f.tag, cfg) : null, grund: film ? null : 'kein Film bis 3,99 €' };
}

/** Nach dem Senden: gesendet -> Tag erledigt, Film gemerkt (nicht noch einmal im Dezember); sonst eine Stunde Pause. */
export function verbucheAdvent(zustand, plan, ok, jetzt) {
  if (!plan) return zustand;
  if (plan.msg && ok) {
    const jahr = plan.tag.slice(0, 4);
    const ids = zustand.advent?.jahr === jahr && Array.isArray(zustand.advent.ids) ? zustand.advent.ids : [];
    zustand.advent = { tag: plan.tag, jahr, ids: [...ids, plan.film.id].slice(-40), titel: plan.film.titel, art: plan.film.art || 'countdown' };
    delete zustand.adventVersuch;
  } else zustand.adventVersuch = new Date(jetzt).toISOString();
  return zustand;
}
