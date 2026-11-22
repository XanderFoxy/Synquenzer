// Gemerkte Wochen-Knaller (Xander 16.11.2026): „Ich will Sachen anhaken/merken können, an die ich dann ausdrücklich erinnert
// werde.“ Zwei Wege, beide ohne Geheimnis im Repo:
//  1. Seite: Haken an der Kachel -> die Seite schickt die ganze Merkliste (nur Angebots-id, Titel, Markt, Preise, Gültigkeit)
//     an das ntfy-Thema module.knaller.merkThema (öffentlich wie das Push-Thema in config.json; niemand abonniert es, es
//     klingelt also nirgends). Der Radar liest es bei jedem Lauf (…/json?poll=1&since=12h) und merkt sich die letzte Liste
//     im Zustand. ntfy.sh hält Nachrichten 12 Stunden – die Seite schickt die Liste deshalb bei jeder Änderung und beim
//     Öffnen erneut, wenn die letzte Meldung älter als 6 Stunden ist.
//     Prüfer 16.11.2026: ntfy.sh nimmt im Text höchstens 4096 Byte (Größeres wird ein Anhang) – ab etwa 22 Angeboten kam die
//     Liste nie an. Die Seite schickt sie darum in Teilen { v: 1, satz, teil, von, merken } (je ≤ 3500 Byte); der Radar nimmt
//     den neuesten VOLLSTÄNDIGEN Satz (alle Teile da), ältere Nachrichten ohne satz zählen als Satz aus einem Teil.
//  2. config: module.knaller.merkworte (wie wunschliste.json, von Claude gepflegt) – Treffer stehen in zustand.knaller.merkRadar.
// Erinnerung: ein ntfy-Push am ersten Gültigkeitstag ab erinnerungStunde (7 Uhr Berlin), höchstens einmal je Angebot, alle
// fälligen in einer Nachricht. Wird ein Angebot erst gemerkt, wenn es schon gilt, kommt die Erinnerung beim nächsten Lauf ab
// 7 Uhr. Nur, was jetzt gilt (Xander: „in den Benachrichtigungen immer nur, was jetzt aktuell ist“).
// Runde 22.11.2026 (Musiker: „Produkte auswählen und in eine Merkliste legen … wenn ein gemerktes Produkt ab Montag oder ab
// Freitag im Angebot ist, am Start-Tag morgens eine Benachrichtigung ‚Heute ab: …, bis …, Markt, Preis' – nicht vorher, nicht
// jeden Tag“):
//  3. Produkte (Wörter) von der Seite: { …, worte: [{ w, sorte, seit }] } im ersten Teil des Satzes (höchstens MERK_WORTE_MAX).
//     Der Radar liest sie wie die merkworte der config als Stichwortseite (immer), Treffer in ALLEN Angeboten der Döbelner
//     Prospekte (auch ohne Rabatt) -> knaller.json merkTreffer + zustand.knaller.merkRadar. Fehlt „worte“ (ältere Seite), bleibt
//     die letzte Wortliste stehen; „worte: []“ = alle vergessen.
//  Erinnerung nur morgens (erinnerungStunde bis erinnerungBisStunde, 7–12 Uhr Berlin) und je Angebot genau einmal: am Start-Tag
//  („Heute ab: …“); ging der Start-Tag durch (Radar aus, Angebot erst später gefunden), am nächsten Morgen, solange es gilt
//  („Seit Mo …“). Ein Wort-Treffer, der schon vor dem Merken des Worts begann, kommt nicht als Push (er stand beim Merken schon
//  auf der Seite unter „Heute“); Märkte ohne Filiale in der Nähe (fern) auch nicht.
import { berlin } from '../benachrichtigen.mjs';
import { berlinTag } from './ende.mjs';
import { norm } from './text.mjs';

export const MERK_MAX = 60;
export const MERK_WORTE_MAX = 12;
const ID = /^[A-Za-z0-9:._-]{1,90}$/;
const zahl = v => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const zeit = v => { const t = Date.parse(typeof v === 'string' ? v : ''); return Number.isFinite(t) ? new Date(t).toISOString() : null; };

/** ein Eintrag der Merkliste (von der Seite – fremde Eingabe, darum streng) -> sauber oder null */
export function merkEintrag(x) {
  if (!x || typeof x !== 'object' || typeof x.id !== 'string' || !ID.test(x.id)) return null;
  const titel = typeof x.titel === 'string' ? x.titel.replace(/[\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 90) : '';
  const markt = typeof x.markt === 'string' && /^[a-z0-9-]{1,30}$/.test(x.markt) ? x.markt : null;
  if (!titel || !markt) return null;
  return { id: x.id, titel, markt, preis: zahl(x.preis), vorher: zahl(x.vorher), pct: zahl(x.pct), ab: zeit(x.ab), bis: zeit(x.bis), ...(zeit(x.gemerkt) ? { gemerkt: zeit(x.gemerkt) } : {}) };
}

// Wort/Sorte von der Seite (fremde Eingabe): nur Buchstaben, Ziffern, Leerzeichen und & ' ’ . - + / , – sonst weg
const wortText = (v, max) => (typeof v === 'string' ? v.normalize('NFC').replace(/[^\p{L}\p{N} &'’.+\/,-]+/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, max).trim() : '');
/** ein gemerktes Produkt der Seite -> { w, sorte, seit } oder null (w: 2–40 Zeichen mit Buchstabe; sorte: Liste mit Komma) */
export function merkWort(x) {
  if (!x || typeof x !== 'object') return null;
  const w = wortText(x.w, 40).replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
  if (w.length < 2 || !/\p{L}/u.test(w) || !norm(w)) return null;
  const sorte = wortText(x.sorte, 60);
  return { w, sorte: norm(sorte) ? sorte : '', seit: zeit(x.seit) };
}
export const wortSchluessel = x => `${norm(x.w)}|${norm(x.sorte || '')}`;
/** Liste der Seite -> saubere, eindeutige Wörter (höchstens MERK_WORTE_MAX) */
export function merkWorte(liste) {
  const out = [], gesehen = new Set();
  for (const x of Array.isArray(liste) ? liste : []) {
    const e = merkWort(x);
    if (!e || gesehen.has(wortSchluessel(e))) continue;
    gesehen.add(wortSchluessel(e));
    out.push(e);
    if (out.length >= MERK_WORTE_MAX) break;
  }
  return out;
}

/**
 * Passt ein Angebot (Titel + Info/Beschreibung) zu einem gemerkten Produkt? Alle Teile des Worts müssen vorkommen (Umlaute,
 * Groß/klein, Leerzeichen egal: „Ben & Jerry's“ = „BEN&JERRYS“); mit Sorte: eine der Sorten (Komma, „oder“, „/“) steht drin
 * -> 'ja', das Angebot nennt nur „versch. Sorten“/„sortiert“ -> 'pruefen' (im Markt prüfen), sonst kein Treffer.
 * -> null | { sorte: '' | 'ja' | 'pruefen' }
 * Prüfer 22.11.2026: vorher Text ohne Leerzeichen + includes – „Eis“ traf „Rundreise“, „Gusseiserner“, „Leistungsstark“,
 * „teilweise“ und „Eiswürfelmaker“, „Cola“ „Chocolate“, „Wein“ „Schweinerücken“, „Tee“ „Beste Ernte“ (über die Wortgrenze).
 * Jetzt an Wortgrenzen (passtTeil): ganzes Wort (auch über Leerzeichen: „Jerry's“ = „Jerrys“) mit Endung (Weine, Eier),
 * Wort-Ende (Stiel|eis, Likör|wein, Kartoffel|chips – im Deutschen das Grundwort), Wort-Anfang nur mit Form-Teil
 * (Eis|creme, Eis|riegel, Cola|kasten) oder ab 5 Buchstaben (Chips|frisch); mitten im Wort erst ab 6 Buchstaben.
 * Wörter, die nur so enden (Aktions|preis, Milch|reis, Wild|schwein), zählen nicht.
 */
const woerter = s => norm(s).split(/[^a-z0-9]+/).filter(Boolean);
const teileSpeicher = new Map();
const teileVon = s => {
  const k = String(s ?? '');
  if (!teileSpeicher.has(k)) { const t = woerter(k), lang = t.filter(x => x.length > 1); if (teileSpeicher.size >= 500) teileSpeicher.clear(); teileSpeicher.set(k, lang.length ? lang : t); }
  return teileSpeicher.get(k);
};
const endungen = n => (n <= 2 ? ['er', 'ern'] : n <= 4 ? ['s', 'e', 'es'] : ['s', 'e', 'es', 'n', 'en', 'er', 'ern']);
const FORM = new Set(['creme', 'riegel', 'sorte', 'sorten', 'becher', 'torte', 'konfekt', 'dessert', 'mix', 'mischung', 'packung', 'pack', 'box', 'kasten', 'kiste', 'dose', 'dosen', 'flasche', 'flaschen', 'beutel', 'sandwich', 'waffel', 'waffeln']);
const FALSCH = ['preis', 'reis', 'reise', 'kreis', 'weis', 'gleis', 'greis', 'schwein', 'frottee', 'komitee', 'zentrum', 'spektrum', 'darum', 'warum', 'herum', 'origin'];
// endet das Wort (bis zum Treffer oder ganz) auf ein anderes Wort, das den Teil nur enthält? („…ereis“ ist Eis: Erdbeer|eis)
const falsch = (stamm, wort, x) => FALSCH.some(f => f.length > x.length && f.includes(x) && (stamm.endsWith(f) || wort.endsWith(f)) && !(f === 'reis' && stamm.endsWith('ereis')));
/** Text in Wörter + Kette ohne Leerzeichen mit Wortgrenzen (je Text einmal gerechnet, kleiner Zwischenspeicher) */
const textSpeicher = new Map();
function textWorte(text) {
  const k = String(text ?? '');
  let T = textSpeicher.get(k);
  if (T) return T;
  const w = woerter(k), anf = [];
  let pos = 0;
  for (const x of w) { anf.push(pos); pos += x.length; }
  T = { w, anf, kette: w.join(''), grenze: new Set(anf), ende: new Set(anf.map((a, i) => a + w[i].length)) };
  if (textSpeicher.size >= 2000) textSpeicher.clear();
  textSpeicher.set(k, T);
  return T;
}
/** steht der Teil x an einer Wortgrenze im Text (textWorte)? */
function passtTeil(T, x) {
  if (!x) return false;
  const { grenze, ende } = T;
  for (let i = T.kette.indexOf(x); i >= 0; i = T.kette.indexOf(x, i + 1)) {
    const j = i + x.length;
    let k = 0;
    while (k + 1 < T.anf.length && T.anf[k + 1] <= i) k++;
    const a = T.anf[k], wort = T.w[k];
    if (j > a + wort.length) { if (grenze.has(i) && ende.has(j)) return true; continue; } // über mehrere Wörter: nur ganz
    const vorn = wort.slice(0, i - a), hinten = wort.slice(j - a);
    const endung = !hinten || endungen(x.length).includes(hinten);
    if (!vorn && !hinten) return true; // ganzes Wort
    if (!vorn && endung) { if (!falsch(x, wort, x)) return true; continue; } // mit Endung (Weine, Eier – nicht Reis|e)
    if (!vorn) { if (x.length >= 5 || FORM.has(hinten)) return true; continue; } // Wort-Anfang
    if (endung) { if (x.length >= 3 && vorn.length >= 3 && !falsch(wort.slice(0, j - a), wort, x)) return true; continue; } // Wort-Ende
    if (x.length >= 6) return true; // mitten im Wort
  }
  return false;
}
const SORTEN = /\b(sorten|sortiert|sortierung|versch|verschiedene|div|diverse|geschmacksrichtungen)\b/;
export function wortPasst(text, eintrag) {
  const T = textWorte(text);
  const teile = teileVon(eintrag?.w);
  if (!T.kette || !teile.length || !teile.every(x => passtTeil(T, x))) return null;
  const sorten = String(eintrag.sorte || '').split(/,|\/|\boder\b/i).map(teileVon).filter(l => l.length);
  if (!sorten.length) return { sorte: '' };
  if (sorten.some(l => l.every(x => passtTeil(T, x)))) return { sorte: 'ja' };
  return SORTEN.test(norm(text)) ? { sorte: 'pruefen' } : null;
}

/** ntfy-Antwort (eine JSON-Zeile je Nachricht) -> { id, time, liste } der neuesten vollständigen Merkliste oder null */
export function leseMerkNachrichten(text) {
  const saetze = new Map();
  for (const zeile of String(text || '').split('\n')) {
    let n;
    try { n = JSON.parse(zeile); } catch { continue; }
    if (!n || n.event !== 'message' || typeof n.message !== 'string') continue;
    let d;
    try { d = JSON.parse(n.message); } catch { continue; }
    if (!d || d.v !== 1 || !Array.isArray(d.merken)) continue;
    const time = typeof n.time === 'number' ? n.time : 0;
    const satz = typeof d.satz === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(d.satz) ? `s:${d.satz}` : `n:${n.id}`;
    const von = Number.isInteger(d.von) && d.von >= 1 && d.von <= 30 ? d.von : 1;
    const teil = Number.isInteger(d.teil) && d.teil >= 1 && d.teil <= von ? d.teil : 1;
    const s = saetze.get(satz) || { id: '', time: -1, von, teile: new Map(), worte: undefined };
    if (s.von !== von) continue; // widersprüchlich -> Teil verwerfen
    s.teile.set(teil, d.merken);
    // gemerkte Produkte (Seite ab 22.11.2026, im ersten Teil); „seit“ nie nach der Nachricht (falsche Uhr am Handy)
    if (Array.isArray(d.worte)) s.worte = d.worte.map(x => (x && typeof x === 'object' && time && Date.parse(x.seit) > time * 1000 ? { ...x, seit: new Date(time * 1000).toISOString() } : x));
    if (time >= s.time) { s.time = time; s.id = String(n.id || ''); }
    saetze.set(satz, s);
  }
  let beste = null;
  for (const s of saetze.values()) {
    if (s.teile.size !== s.von) continue; // unvollständig (ein Teil fehlt noch oder ging verloren)
    if (beste && s.time < beste.time) continue;
    const gesehen = new Set();
    const liste = [];
    for (let i = 1; i <= s.von; i++) for (const x of s.teile.get(i)) { const e = merkEintrag(x); if (e && !gesehen.has(e.id)) { gesehen.add(e.id); liste.push(e); } }
    beste = { id: s.id, time: s.time, liste: liste.slice(0, MERK_MAX), ...(s.worte !== undefined ? { worte: merkWorte(s.worte) } : {}) };
  }
  return beste;
}

export const merkThema = cfg => {
  const t = cfg?.module?.knaller?.merkThema;
  return typeof t === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(t) ? t : null;
};

/** Merkliste vom ntfy-Thema holen und in zustand.knaller.merken übernehmen (neueste Nachricht gewinnt). -> Status */
export async function holeMerkliste({ holeText, cfg, zustand, jetzt = new Date() }) {
  const thema = merkThema(cfg);
  if (!thema || cfg.module?.knaller?.aktiv === false) return null;
  const zk = (zustand.knaller ||= {});
  // immer alles, was ntfy.sh noch hat (12 h): eine Liste kommt in Teilen – „seit der letzten Nachricht“ könnte einen Satz zerreißen
  delete zk.merkSeit;
  const server = String(cfg.ntfy?.server || 'https://ntfy.sh').replace(/\/$/, '');
  const text = await holeText(`${server}/${thema}/json?poll=1&since=12h`, { headers: { accept: 'application/x-ndjson' } });
  let neu = leseMerkNachrichten(text);
  // nichts Älteres über eine neuere Liste schreiben (z. B. wenn der neueste Satz unvollständig ist)
  const stand = Date.parse(zk.merkStand || '');
  if (neu && neu.time && Number.isFinite(stand) && neu.time * 1000 < stand) neu = null;
  if (neu) {
    zk.merken = neu.liste;
    if (neu.worte !== undefined) { if (neu.worte.length) zk.merkWorte = neu.worte; else delete zk.merkWorte; }
    zk.merkStand = new Date((neu.time || Date.parse(jetzt) / 1000) * 1000).toISOString();
  }
  return { neu: !!neu, anzahl: (zk.merken || []).length, ...(zk.merkWorte?.length ? { worte: zk.merkWorte.length } : {}) };
}

/** gemerkte Produkte aus dem Zustand (sauber) */
export const zustandWorte = zustand => merkWorte(zustand?.knaller?.merkWorte);
/**
 * Neues gemerktes Produkt, gemerkt nach dem letzten Knaller-Lauf mit Wörtern (zustand.knaller.worteLauf)? Dann ist das Modul
 * gleich dran (Vorprüfung und Lauf), statt bis zum nächsten 6-h-Takt zu warten. Nicht während eines Neuversuchs (Quelle
 * gestört) – sonst liefe der Knaller alle paar Minuten.
 */
export function wortNeu(cfg, zustand, jetztMs = Date.now()) {
  if (cfg?.module?.knaller?.aktiv === false || !merkThema(cfg)) return false;
  const nvAb = Date.parse(zustand?.neuversuch?.knaller?.ab || '');
  if (Number.isFinite(nvAb) && nvAb > jetztMs) return false;
  const lauf = Date.parse(zustand?.knaller?.worteLauf || '') || 0;
  return zustandWorte(zustand).some(x => (Date.parse(x.seit || '') || 0) > lauf);
}

/** Produkte, die jetzt gemerkt sind: Seite (zustand.knaller.merkWorte, mit seit) + merkworte der config (seit = null) */
function jetztWorte(cfg, zustand) {
  const konfig = (Array.isArray(cfg?.module?.knaller?.merkworte) ? cfg.module.knaller.merkworte : []).map(w => String(w || '').trim()).filter(Boolean);
  return [...zustandWorte(zustand), ...konfig.map(w => ({ w, sorte: '', seit: null }))];
}

/**
 * Welche gemerkten Angebote sind jetzt zu erinnern? Quellen: zustand.knaller.merken (Haken auf der Seite) und
 * zustand.knaller.merkRadar (Treffer der Produkte von der Seite und der merkworte der config). Frische Daten (Preis,
 * Gültigkeit) aus `angebote` (knaller.json: angebote + merkTreffer), wenn das Angebot dort steht.
 * Regel (22.11.2026): nur morgens (erinnerungStunde ≤ Stunde < erinnerungBisStunde, Berlin), Berliner Tag ≥ Start-Tag (nicht
 * vorher), noch gültig, je Angebot einmal (nicht jeden Tag). Wort-Treffer: nicht für Märkte ohne Filiale in der Nähe (fern).
 * Prüfer 22.11.2026:
 *  - Wort-Treffer nur, solange das Produkt noch gemerkt ist (Seite: zustand.knaller.merkWorte, sonst merkworte der config) und
 *    das Angebot nach der aktuellen Regel passt (frische Daten mit Info) – merkRadar stammt vom letzten Knaller-Lauf (bis zu
 *    6 h alt): ein vergessenes Produkt (×) löste sonst am nächsten Morgen noch einen Push aus.
 *  - „lief schon beim Merken“ nach der Uhrzeit, nicht nach dem Tag: Angebot ab Mo 00:00, Produkt Mo 13:00 gemerkt -> kein Push
 *    (es stand beim Merken schon unter „Heute“); vorher kam am Di „Seit Mo …“ bzw. vor 12 Uhr sofort „Heute ab“. Fand der
 *    Radar das Angebot erst nach dem Merken (merkRadar.sichtbar später als seit – die Seite konnte es nicht zeigen), kommt der
 *    Push wie sonst („Heute ab“ am Start-Tag bzw. „Seit …“).
 * Jeder Eintrag bekommt start (Berliner Tag oder null) und heute (Start-Tag = heute) für die Nachricht.
 */
export function faelligeErinnerungen({ zustand, cfg, jetzt = new Date(), angebote = [] }) {
  const zk = zustand?.knaller || {};
  const k = cfg?.module?.knaller || {};
  const von = k.erinnerungStunde ?? 7, bisStunde = k.erinnerungBisStunde ?? 12;
  const jetztMs = new Date(jetzt).getTime();
  const b = berlin(new Date(jetztMs));
  if (b.stunde < von || b.stunde >= bisStunde) return [];
  const erinnert = zk.erinnert || {};
  const frisch = new Map((Array.isArray(angebote) ? angebote : []).filter(a => a && a.id).map(a => [a.id, a]));
  const out = [], gesehen = new Set();
  const quellen = [...(Array.isArray(zk.merken) ? zk.merken : []).map(m => [m, false]), ...(Array.isArray(zk.merkRadar) ? zk.merkRadar : []).map(m => [m, true])];
  const worte = jetztWorte(cfg, zustand);
  for (const [m, istWort] of quellen) {
    if (!m || !m.id || gesehen.has(m.id) || erinnert[m.id]) continue;
    if (istWort && m.fern) continue;
    const f = frisch.get(m.id);
    const a = f ? { id: m.id, titel: f.titel, markt: f.markt, preis: f.preis, vorher: f.vorher ?? null, pct: f.pct ?? null, ab: f.gueltigAb || null, bis: f.gueltigBis || null } : { ...m };
    if (a.bis && Date.parse(a.bis) <= jetztMs) continue; // vorbei
    const start = a.ab ? berlinTag(a.ab) : null;
    if (start && start > b.tag) continue; // noch nicht dran
    if (istWort) {
      // noch gemerkt (gleiches Produkt) und passt nach der Regel (frische Daten mit Info; ohne sie gilt der Radar-Treffer)
      const nw = norm(m.wort);
      const passend = worte.filter(e => nw && norm(String(e.w).slice(0, 40)) === nw && (!f || wortPasst(`${f.titel || ''} ${f.info || ''}`, e)));
      if (!passend.length) continue; // vergessen (×) oder passt nicht mehr
      // lief schon, als das Produkt gemerkt wurde (genaue Zeit), und stand da schon auf der Seite (sichtbar, vom Knaller-Lauf;
      // fehlt es: ja) -> kein Push, es stand beim Merken unter „Heute“. Erst nach dem Merken gefunden -> Push wie sonst.
      const abMs = Date.parse(a.ab || ''), sichtMs = Date.parse(m.sichtbar || '');
      const gesehen = e => { const t = Date.parse(e.seit || ''); return t > abMs && !(t < sichtMs); };
      if (Number.isFinite(abMs) && passend.every(gesehen)) continue;
    }
    gesehen.add(m.id);
    out.push({ ...a, ...(istWort && m.wort ? { wort: m.wort } : {}), ...(m.sorte === 'pruefen' ? { sorte: 'pruefen' } : {}), start, heute: start === b.tag });
  }
  return out.slice(0, 12);
}

const euro = v => (typeof v === 'number' ? v.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) : '');
const wtTag = (t, minus = 0) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', weekday: 'short', day: '2-digit', month: '2-digit' }).formatToParts(new Date(t - minus)).map(x => [x.type, x.value]));
  return `${String(p.weekday).replace('.', '')} ${p.day}.${p.month}.`;
};
// Ende „bis Sa 23:59“ bzw. 00:00 des Folgetags zählt zum Vortag (eine Millisekunde zurück)
const wtBis = iso => { const t = Date.parse(iso || ''); return Number.isFinite(t) ? `bis ${wtTag(t, 1)}` : ''; };
const wtAb = iso => { const t = Date.parse(iso || ''); return Number.isFinite(t) ? wtTag(t) : ''; };
const preisText = a => `${euro(a.preis)}${a.vorher ? ` statt ${euro(a.vorher)}` : ''}${a.pct ? ` (−${a.pct} %)` : ''}`;
const anfang = a => (a.heute ? 'Heute ab' : a.start ? `Seit ${wtAb(a.ab)}` : 'Gilt jetzt');

/**
 * eine Push-Nachricht für alle fälligen Erinnerungen. Musiker 22.11.2026: „Heute ab: …, bis …, Markt, Preis“.
 * Ein Angebot: Titel „Heute ab: <Produkt>“, Text „bis Sa 29.11., Aldi Nord, 0,99 € statt 1,99 € (−50 %)“.
 * Mehrere: je Zeile „• Heute ab: <Produkt>, bis …, Markt, Preis“ („Seit Mo 24.11.“, wenn der Start-Tag schon war).
 */
export function erinnerungNachricht(liste, cfg, namen = {}) {
  const rest = a => [a.bis ? wtBis(a.bis) : '', namen[a.markt] || a.markt, preisText(a)].filter(Boolean).join(', ') + (a.sorte === 'pruefen' ? ' – Sorte im Markt prüfen' : '');
  const seite = String(cfg.seite || '').replace(/#.*$/, '') + '#woche';
  const alleHeute = liste.every(a => a.heute);
  let title, message;
  if (liste.length === 1) {
    const a = liste[0];
    title = `${anfang(a)}: ${a.titel}`.slice(0, 140);
    message = rest(a);
  } else {
    title = alleHeute ? `Heute ab: ${liste.length} gemerkte Angebote` : `Gemerkt: ${liste.length} Angebote gelten jetzt`;
    const zeilen = liste.slice(0, 8).map(a => `• ${anfang(a)}: ${a.titel}, ${rest(a)}`);
    if (liste.length > 8) zeilen.push(`… und ${liste.length - 8} weitere`);
    message = zeilen.join('\n');
  }
  return {
    topic: cfg.ntfy.topic, title, message,
    click: seite, priority: 4, tags: ['shopping_cart'],
    actions: [{ action: 'view', label: 'Merkliste', url: seite, clear: true }],
  };
}

/** gesendet -> nicht noch einmal; Merkliste und Vermerke aufräumen (abgelaufen, älter als 30 Tage) */
export function verbucheErinnerung(zustand, liste, jetzt = new Date()) {
  const zk = (zustand.knaller ||= {});
  const iso = new Date(jetzt).toISOString();
  zk.erinnert ||= {};
  for (const a of liste) zk.erinnert[a.id] = iso;
  aufraeumenMerken(zustand, jetzt);
}
/**
 * Vermerk „erinnert“ weg, wenn er älter als 30 Tage ist UND das Angebot nicht mehr gilt bzw. nicht mehr gemerkt/gefunden ist.
 * Prüfer 22.11.2026: vorher nur nach Alter – ein Dauer-Angebot (Lidl Puzzle 19.10.–24.12.) kam nach 30 Tagen beim nächsten
 * Push zu einem anderen Angebot gleich noch einmal als „Seit …“ (je Angebot genau einmal).
 */
export function aufraeumenMerken(zustand, jetzt = new Date()) {
  const zk = zustand.knaller || {};
  const ms = new Date(jetzt).getTime();
  const grenze = new Date(ms - 30 * 864e5).toISOString();
  const gilt = m => m && m.id && !(m.bis && Date.parse(m.bis) <= ms);
  const lebt = new Set([...(Array.isArray(zk.merken) ? zk.merken : []), ...(Array.isArray(zk.merkRadar) ? zk.merkRadar : [])].filter(gilt).map(m => m.id));
  for (const [k, v] of Object.entries(zk.erinnert || {})) if (!(v > grenze) && !lebt.has(k)) delete zk.erinnert[k];
  if (Array.isArray(zk.merken)) zk.merken = zk.merken.filter(m => !(m.bis && Date.parse(m.bis) <= ms));
}

/** für faellig.mjs: steht eine Erinnerung an? (nur aus dem Zustand – billig, ohne Abruf) */
export function erinnerungFaellig(cfg, zustand, jetzt = new Date()) {
  if (cfg?.module?.knaller?.aktiv === false) return false;
  return faelligeErinnerungen({ zustand, cfg, jetzt }).length > 0;
}
