// Gemerkte Wochen-Knaller (Xander 16.11.2026): „Ich will Sachen anhaken/merken können, an die ich dann ausdrücklich erinnert
// werde.“ Zwei Wege, beide ohne Geheimnis im Repo:
//  1. Seite: Haken an der Kachel -> die Seite schickt die ganze Merkliste (nur Angebots-id, Titel, Markt, Preise, Gültigkeit)
//     als eine Nachricht an das ntfy-Thema module.knaller.merkThema (öffentlich wie das Push-Thema in config.json; niemand
//     abonniert es, es klingelt also nirgends). Der Radar liest es bei jedem Lauf (…/json?poll=1) und merkt sich die
//     letzte Liste im Zustand. ntfy.sh hält Nachrichten 12 Stunden – die Seite schickt die Liste deshalb bei jeder Änderung
//     und beim Öffnen erneut, wenn die letzte Meldung älter als 6 Stunden ist.
//  2. config: module.knaller.merkworte (wie wunschliste.json, von Claude gepflegt) – Treffer stehen in zustand.knaller.merkRadar.
// Erinnerung: ein ntfy-Push am ersten Gültigkeitstag ab erinnerungStunde (7 Uhr Berlin), höchstens einmal je Angebot, alle
// fälligen in einer Nachricht. Wird ein Angebot erst gemerkt, wenn es schon gilt, kommt die Erinnerung beim nächsten Lauf ab
// 7 Uhr. Nur, was jetzt gilt (Xander: „in den Benachrichtigungen immer nur, was jetzt aktuell ist“).
import { berlin } from '../benachrichtigen.mjs';
import { berlinTag } from './ende.mjs';

export const MERK_MAX = 60;
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

/** ntfy-Antwort (eine JSON-Zeile je Nachricht) -> { id, time, liste } der neuesten gültigen Merkliste oder null */
export function leseMerkNachrichten(text) {
  let beste = null;
  for (const zeile of String(text || '').split('\n')) {
    let n;
    try { n = JSON.parse(zeile); } catch { continue; }
    if (!n || n.event !== 'message' || typeof n.message !== 'string') continue;
    let d;
    try { d = JSON.parse(n.message); } catch { continue; }
    if (!d || d.v !== 1 || !Array.isArray(d.merken)) continue;
    const liste = d.merken.map(merkEintrag).filter(Boolean).slice(0, MERK_MAX);
    if (!beste || (n.time ?? 0) >= beste.time) beste = { id: String(n.id || ''), time: n.time ?? 0, liste };
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
  const seit = typeof zk.merkSeit === 'string' && /^[A-Za-z0-9]{6,20}$/.test(zk.merkSeit) ? zk.merkSeit : '12h';
  const server = String(cfg.ntfy?.server || 'https://ntfy.sh').replace(/\/$/, '');
  const text = await holeText(`${server}/${thema}/json?poll=1&since=${seit}`, { headers: { accept: 'application/x-ndjson' } });
  const neu = leseMerkNachrichten(text);
  if (neu) {
    zk.merken = neu.liste;
    if (/^[A-Za-z0-9]{6,20}$/.test(neu.id)) zk.merkSeit = neu.id;
    zk.merkStand = new Date((neu.time || Date.parse(jetzt) / 1000) * 1000).toISOString();
  }
  return { neu: !!neu, anzahl: (zk.merken || []).length };
}

/**
 * Welche gemerkten Angebote sind jetzt zu erinnern? Quellen: zustand.knaller.merken (Seite) und zustand.knaller.merkRadar
 * (merkworte der config). Frische Daten (Preis, Gültigkeit) aus `angebote` (knaller.json), wenn das Angebot dort steht.
 * Regel: Berliner Tag ≥ erster Gültigkeitstag, Uhrzeit ≥ erinnerungStunde, noch gültig, noch nicht erinnert.
 */
export function faelligeErinnerungen({ zustand, cfg, jetzt = new Date(), angebote = [] }) {
  const zk = zustand?.knaller || {};
  const stunde = cfg?.module?.knaller?.erinnerungStunde ?? 7;
  const jetztMs = new Date(jetzt).getTime();
  const b = berlin(new Date(jetztMs));
  if (b.stunde < stunde) return [];
  const erinnert = zk.erinnert || {};
  const frisch = new Map((Array.isArray(angebote) ? angebote : []).filter(a => a && a.id).map(a => [a.id, a]));
  const out = [], gesehen = new Set();
  for (const m of [...(Array.isArray(zk.merken) ? zk.merken : []), ...(Array.isArray(zk.merkRadar) ? zk.merkRadar : [])]) {
    if (!m || !m.id || gesehen.has(m.id) || erinnert[m.id]) continue;
    gesehen.add(m.id);
    const f = frisch.get(m.id);
    const a = f ? { id: m.id, titel: f.titel, markt: f.markt, preis: f.preis, vorher: f.vorher, pct: f.pct, ab: f.gueltigAb || null, bis: f.gueltigBis || null } : m;
    if (a.bis && Date.parse(a.bis) <= jetztMs) continue; // vorbei
    if (a.ab && berlinTag(a.ab) > b.tag) continue; // noch nicht dran
    out.push(a);
  }
  return out.slice(0, 12);
}

const euro = v => (typeof v === 'number' ? v.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) : '');
const wtBis = iso => {
  const t = Date.parse(iso || '');
  if (!Number.isFinite(t)) return '';
  const p = Object.fromEntries(new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', weekday: 'short', day: '2-digit', month: '2-digit' }).formatToParts(new Date(t - 1)).map(x => [x.type, x.value]));
  return `bis ${String(p.weekday).replace('.', '')} ${p.day}.${p.month}.`;
};

/** eine Push-Nachricht für alle fälligen Erinnerungen */
export function erinnerungNachricht(liste, cfg, namen = {}) {
  const zeilen = liste.slice(0, 8).map(a => `• ${a.titel} – ${namen[a.markt] || a.markt} ${euro(a.preis)}${a.vorher ? ` statt ${euro(a.vorher)}` : ''}${a.pct ? ` (−${a.pct} %)` : ''}${a.bis ? `, ${wtBis(a.bis)}` : ''}`);
  if (liste.length > 8) zeilen.push(`… und ${liste.length - 8} weitere`);
  const seite = String(cfg.seite || '').replace(/#.*$/, '') + '#woche';
  return {
    topic: cfg.ntfy.topic,
    title: liste.length === 1 ? `Gemerkt: ${liste[0].titel} – gilt jetzt`.slice(0, 140) : `Gemerkt: ${liste.length} Angebote gelten jetzt`,
    message: zeilen.join('\n'),
    click: seite, priority: 4, tags: ['shopping_cart'],
    actions: [{ action: 'view', label: 'Wochen-Knaller', url: seite, clear: true }],
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
export function aufraeumenMerken(zustand, jetzt = new Date()) {
  const zk = zustand.knaller || {};
  const ms = new Date(jetzt).getTime();
  const grenze = new Date(ms - 30 * 864e5).toISOString();
  for (const [k, v] of Object.entries(zk.erinnert || {})) if (!(v > grenze)) delete zk.erinnert[k];
  if (Array.isArray(zk.merken)) zk.merken = zk.merken.filter(m => !(m.bis && Date.parse(m.bis) <= ms));
}

/** für faellig.mjs: steht eine Erinnerung an? (nur aus dem Zustand – billig, ohne Abruf) */
export function erinnerungFaellig(cfg, zustand, jetzt = new Date()) {
  if (cfg?.module?.knaller?.aktiv === false) return false;
  return faelligeErinnerungen({ zustand, cfg, jetzt }).length > 0;
}
