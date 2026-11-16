// robots.txt beachten (MV5 Gesuche, 16.11.2026): Der Radar liest eine Quelle nur automatisch, wenn deren robots.txt den Pfad
// erlaubt – sonst bleibt sie ein Link „hier selbst suchen“ auf der Seite. Regeln nach RFC 9309:
//  - Gruppe für unseren Namen („vorteils-radar“, aus dem User-Agent) vor „*“; mehrere passende Gruppen werden vereint,
//  - längste passende Regel gewinnt, bei Gleichstand Allow; „*“ = beliebig viele Zeichen, „$“ = Ende,
//  - robots.txt fehlt (HTTP 4xx außer 429) = alles erlaubt; Server-Fehler/429/keine Antwort = dieses Mal NICHT lesen (vorsichtig).
// Ergebnis je Host im Zustand (zustand.robots[host] = { zeit, status, regeln }) – höchstens ROBOTS_TAGE alt (RFC 9309 2.4:
// eine zwischengespeicherte robots.txt höchstens 24 Stunden verwenden; Prüfer 16.11.2026, Befund 4: vorher 7 Tage).
// Alle Regeln werden gemerkt (Befund 3: vorher nur die ersten 200 – bei kleinanzeigen.de fielen 57 Disallow weg); mehr als
// ROBOTS_MAX_REGELN = „nicht sicher prüfbar“, die Quelle wird dann wie bei einer unlesbaren robots.txt nicht gelesen.
// MV6 (16.11.2026, Regel-Verstoß im Bereich Unterricht: Reddit trotz „Disallow: /“, Freelancer.com trotz AGB-Verbot):
// macheRegelWache legt sich um JEDEN Abruf des Radars (main.mjs) – nicht nur um einzelne Module:
//  1. Nutzungsbedingungen (config abruf.agbVerbot): Host verboten -> gar kein Abruf, auch nicht der robots.txt;
//  2. robots.txt je Host vor dem ersten Abruf (gemerkt wie oben): Pfad verboten -> Abruf übersprungen (Hinweis, kein Fehler).
// MV7 (Xanders Entscheidung 16.11.2026): Programm-Schnittstellen aus lib/schnittstellen.mjs (genau fünf Hosts, je genau die
// API-Pfade) werden trotz robots-Sperre gelesen – gedrosselt und gemerkt nach den Regeln des Dienstes. Punkt 1 gilt weiter
// ohne Ausnahme; alle anderen Pfade bleiben unter Punkt 2.

import { SCHNITTSTELLEN, schnittstelleFuer, cacheLese, cacheSchreibe } from './schnittstellen.mjs';

export const ROBOTS_TAGE = 1;
export const ROBOTS_MAX_REGELN = 5000;

/** robots.txt -> Liste von Gruppen [{ agents: [..], regeln: [{ erlaubt, pfad }] }] */
export function leseRobots(text) {
  const gruppen = [];
  let g = null, zuletztAgent = false;
  for (const roh of String(text || '').split(/\r?\n/)) {
    const zeile = roh.replace(/#.*$/, '').trim();
    const m = zeile.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const feld = m[1].toLowerCase(), wert = m[2].trim();
    if (feld === 'user-agent') {
      if (!g || !zuletztAgent) { g = { agents: [], regeln: [] }; gruppen.push(g); }
      g.agents.push(wert.toLowerCase());
      zuletztAgent = true;
    } else if (feld === 'allow' || feld === 'disallow') {
      zuletztAgent = false;
      if (!g) continue;
      if (feld === 'disallow' && !wert) continue; // „Disallow:“ leer = nichts verboten
      g.regeln.push({ erlaubt: feld === 'allow', pfad: wert });
    } else zuletztAgent = false;
  }
  return gruppen;
}

/** Regeln, die für unseren Agenten gelten (eigene Gruppe, sonst „*“). agent = Produktname klein, z. B. „vorteils-radar“ */
export function regelnFuer(gruppen, agent) {
  const a = String(agent || '').toLowerCase();
  const eigene = gruppen.filter(g => g.agents.some(x => x !== '*' && a && (a === x || a.startsWith(x))));
  const liste = eigene.length ? eigene : gruppen.filter(g => g.agents.includes('*'));
  return liste.flatMap(g => g.regeln);
}

const alsMuster = pfad => new RegExp('^' + pfad.replace(/[.+?^${}()|[\]\\]/g, m => (m === '$' ? m : '\\' + m)).replace(/\*/g, '.*').replace(/\\\$$|\$$/, '$'));
/** Darf `pfad` (mit Query) gelesen werden? regeln = regelnFuer(...) */
export function erlaubt(regeln, pfad) {
  let best = null;
  for (const r of regeln) {
    if (!r.pfad) continue;
    if (!alsMuster(r.pfad).test(pfad)) continue;
    const len = r.pfad.replace(/\*/g, '').length;
    if (!best || len > best.len || (len === best.len && r.erlaubt && !best.erlaubt)) best = { len, erlaubt: r.erlaubt, pfad: r.pfad };
  }
  return best ? { ok: best.erlaubt, regel: `${best.erlaubt ? 'Allow' : 'Disallow'}: ${best.pfad}` } : { ok: true, regel: null };
}

/** Produktname aus dem User-Agent: „Vorteils-Radar/1.0 (…)“ -> „vorteils-radar“ */
export const agentAus = ua => String(ua || '').split(/[\s/]/)[0].toLowerCase();

/**
 * Prüft eine Adresse gegen die robots.txt ihres Hosts. holeRoh(url) -> { status, text } (Status 0 = keine Antwort).
 * -> { ok, grund } ; grund z. B. „robots.txt: Disallow: /api/“ oder „robots.txt nicht lesbar (HTTP 503)“
 */
export async function robotsErlaubt(url, { holeRoh, zustand = null, agent = 'vorteils-radar', jetzt = new Date(), tage = ROBOTS_TAGE }) {
  const u = new URL(url);
  const speicher = zustand ? (zustand.robots ||= {}) : {};
  const jetztMs = new Date(jetzt).getTime();
  let e = speicher[u.host];
  // e.v 2 = ungekürzte Regeln (ältere Einträge mit höchstens 200 Regeln werden einmal neu geholt)
  if (!e || e.v !== 2 || !(jetztMs - Date.parse(e.zeit) < tage * 864e5) || e.status === 0 || e.status >= 500 || e.status === 429) {
    let r;
    try { r = await holeRoh(`${u.protocol}//${u.host}/robots.txt`); } catch (err) { r = { status: 0, text: '', fehler: String(err?.message || err) }; }
    const regeln = r.status >= 200 && r.status < 300 ? regelnFuer(leseRobots(r.text), agent) : [];
    // nie kürzen: eine gekürzte Liste wäre zu großzügig (fehlende Disallow) -> lieber „nicht prüfbar“
    e = regeln.length > ROBOTS_MAX_REGELN
      ? { v: 2, zeit: new Date(jetztMs).toISOString(), status: r.status, regeln: [], zuViele: regeln.length }
      : { v: 2, zeit: new Date(jetztMs).toISOString(), status: r.status, regeln };
    speicher[u.host] = e;
  }
  if (e.status === 0 || e.status >= 500 || e.status === 429) return { ok: false, nichtLesbar: true, grund: `robots.txt nicht lesbar (${e.status ? `HTTP ${e.status}` : 'keine Antwort'})` };
  if (e.status >= 400) return { ok: true, grund: `keine robots.txt (HTTP ${e.status})` };
  if (e.zuViele || !Array.isArray(e.regeln)) return { ok: false, nichtLesbar: true, grund: `robots.txt nicht prüfbar (${e.zuViele || '?'} Regeln)` };
  const p = erlaubt(e.regeln, u.pathname + u.search);
  return p.ok ? { ok: true, grund: p.regel ? `robots.txt: ${p.regel}` : 'robots.txt erlaubt' } : { ok: false, grund: `robots.txt: ${p.regel}` };
}

/**
 * Nutzungsbedingungen verbieten das automatische Lesen? liste = [{ host, grund }] (config abruf.agbVerbot bzw.
 * module.<x>.agbVerbot) -> Grund | null. Gilt vor JEDEM Abruf (auch robots.txt). Ausnahme nur mit erlaubnis: true an der
 * Quelle (schriftliche Erlaubnis/registrierte App) – die globale Wache (abruf.agbVerbot) kennt keine Ausnahme.
 */
export function agbGrund(url, liste = [], q = {}) {
  if (q?.erlaubnis === true) return null;
  let host;
  try { host = new URL(url).hostname.toLowerCase(); } catch { return null; }
  const v = (Array.isArray(liste) ? liste : []).find(x => x?.host && (host === x.host || host.endsWith(`.${x.host}`)));
  return v ? (v.grund || 'Nutzungsbedingungen verbieten automatisches Lesen') : null;
}

/** Fehler der Regel-Wache: e.regel = 'agb' | 'robots' – Module zählen ihn nicht als Störung (main.mjs macht einen Hinweis daraus) */
export class RegelSperre extends Error {
  constructor(regel, host, grund) {
    super(`${regel === 'agb' ? 'Nutzungsbedingungen' : 'robots.txt'} von ${host}: nicht gelesen – ${grund}`);
    this.name = 'RegelSperre'; this.regel = regel; this.host = host; this.grund = grund;
  }
}
/** Text einer RegelSperre (auch eingebettet: „Remotive: robots.txt von remotive.com: nicht gelesen – …“) */
export const REGEL_TEXT = /(Nutzungsbedingungen|robots\.txt) von \S+: nicht gelesen – /;
export const istRegelSperre = e => !!e && (e.name === 'RegelSperre' || e.regel === 'agb' || e.regel === 'robots' || REGEL_TEXT.test(String(e.message || e)));

/** holeText -> holeRoh für robotsErlaubt ({ status, text }; Status aus „HTTP 404 bei …“, 0 = keine Antwort) */
export const holeRohMit = holeText => async url => {
  try { return { status: 200, text: await holeText(url, { headers: { accept: 'text/plain' } }) }; }
  catch (e) { const m = /HTTP (\d{3})/.exec(String(e?.message || e)); return { status: m ? Number(m[1]) : 0, text: '' }; }
};

/**
 * Regel-Wache um holeText (main.mjs, ein Lauf): erst Nutzungsbedingungen (agbVerbot, kein Abruf), dann robots.txt des Hosts
 * (einmal je Host und Lauf geholt bzw. aus zustand.robots, höchstens ROBOTS_TAGE alt), erst dann der eigentliche Abruf.
 *  - verboten (AGB oder Disallow) -> wirft RegelSperre (e.regel), merkt den Host in wache.gesperrt;
 *  - robots.txt nicht lesbar (5xx/429/keine Antwort) -> wirft einen normalen Fehler („… dieses Mal nicht gelesen“),
 *    die Quelle gilt wie bei jedem Ausfall als gestört (alter Stand bleibt);
 *  - /robots.txt selbst geht direkt durch; ausnahmen = Hosts ohne Prüfung (nur eigene Dienste, z. B. ntfy-Thema der Seite).
 *  - Programm-Schnittstelle (schnittstellen, Standard SCHNITTSTELLEN): robots.txt wird trotzdem gelesen (für die Anzeige
 *    „Schnittstelle“ samt Regel), sperrt aber nicht; dafür Obergrenze je Lauf, keine Adresse zweimal im Lauf und – nur mit
 *    cache: true (echte Läufe, main.mjs) – die gemerkte Antwort aus zustand.schnittstellen, solange sie jünger als
 *    cacheStunden ist.
 * Rückgabe: holeText-Funktion mit .wache = { gesperrt: Map(host -> { regel, grund, n }), geprueft: Set(host), modul,
 *   jeModul: Map(modul -> Map), schnittstelle: Map(host -> { name, n, gemerkt, regel }), jeModulApi: Map(modul -> Map) }.
 */
export function macheRegelWache(holeText, { zustand = null, agent = 'vorteils-radar', jetzt = new Date(), agbVerbot = [], robots = true, ausnahmen = [], schnittstellen = SCHNITTSTELLEN, cache = false } = {}) {
  const wache = { gesperrt: new Map(), geprueft: new Set(), modul: null, jeModul: new Map(), schnittstelle: new Map(), jeModulApi: new Map() };
  const jetztMs = new Date(jetzt).getTime();
  const memo = new Map(); // url -> Text (Schnittstellen: dieselbe Adresse nur einmal je Lauf)
  const ablage = zustand || {}; // ohne Zustand (Tests): nur für diesen Lauf merken
  const erste = new Map(); // host -> Promise der ersten Prüfung in diesem Lauf (robots.txt nur einmal holen, auch parallel)
  const holeRoh = holeRohMit(holeText);
  const frei = new Set((ausnahmen || []).map(h => String(h).toLowerCase()));
  const sperre = (regel, host, grund) => {
    const k = `${regel}|${host}`;
    const alt = wache.gesperrt.get(k);
    wache.gesperrt.set(k, { regel, host, grund, n: (alt?.n || 0) + 1 });
    if (wache.modul) { const s = wache.jeModul.get(wache.modul) || new Map(); s.set(k, { regel, host, grund }); wache.jeModul.set(wache.modul, s); }
    return new RegelSperre(regel, host, grund);
  };
  async function bewacht(url, opts) {
    let u;
    try { u = new URL(url); } catch { return holeText(url, opts); }
    const host = u.host.toLowerCase();
    const agb = agbGrund(url, agbVerbot);
    if (agb) throw sperre('agb', host, agb);
    if (!robots || frei.has(host) || frei.has(u.hostname.toLowerCase()) || u.pathname === '/robots.txt') return holeText(url, opts);
    const api = schnittstelleFuer(url, schnittstellen || []);
    if (!erste.has(host)) erste.set(host, robotsErlaubt(url, { holeRoh, zustand: ablage, agent, jetzt }).catch(e => ({ ok: false, nichtLesbar: true, grund: `robots.txt nicht lesbar (${String(e?.message || e).slice(0, 60)})` })));
    const e1 = await erste.get(host);
    wache.geprueft.add(host);
    // nicht lesbar: in diesem Lauf nicht noch einmal fragen (sonst je Adresse ein Zeitlimit) – außer Schnittstelle
    if (e1.nichtLesbar) {
      if (!api) throw new Error(`${e1.grund} bei ${host} – dieses Mal nicht gelesen`);
      return ueberSchnittstelle(api, url, opts, null);
    }
    const r = await robotsErlaubt(url, { holeRoh, zustand: ablage, agent, jetzt }); // aus der Ablage, kein zweiter Abruf
    if (api) return ueberSchnittstelle(api, url, opts, r.ok ? null : r.grund);
    if (!r.ok) throw sperre('robots', host, r.grund);
    return holeText(url, opts);
  }
  // Schnittstelle: Obergrenze je Lauf, Lauf-Memo, gemerkte Antwort (cacheStunden), Anzeige je Modul
  async function ueberSchnittstelle(api, url, opts, robotsRegel) {
    const st = wache.schnittstelle.get(api.host) || { host: api.host, name: api.name, n: 0, gemerkt: 0, regel: null };
    if (robotsRegel) st.regel = robotsRegel;
    wache.schnittstelle.set(api.host, st);
    if (wache.modul) { const m = wache.jeModulApi.get(wache.modul) || new Map(); m.set(api.host, { host: api.host, name: api.name, regel: st.regel }); wache.jeModulApi.set(wache.modul, m); }
    const merkbar = String(opts?.method || 'GET').toUpperCase() === 'GET' && opts?.body == null;
    if (merkbar && memo.has(url)) { st.gemerkt++; return memo.get(url); }
    if (merkbar && cache && api.cacheStunden) {
      const t = cacheLese(ablage, url, api.cacheStunden, jetztMs);
      if (t != null) { st.gemerkt++; memo.set(url, t); return t; }
    }
    if (st.n >= api.maxJeLauf) throw new Error(`${api.name}: höchstens ${api.maxJeLauf} Abrufe je Lauf – Rest im nächsten Lauf`);
    st.n++;
    const text = await holeText(url, opts);
    if (merkbar) {
      memo.set(url, text);
      if (cache && api.cacheStunden) cacheSchreibe(ablage, url, text, jetztMs);
    }
    return text;
  }
  bewacht.wache = wache;
  return bewacht;
}

/** Für status.<modul>.quellen (Quellen-Liste der Seite): [{ host, name?, art: 'schnittstelle' | 'gesperrt' }] */
export function regelQuellen(wache, modul) {
  if (!wache || !modul) return [];
  const aus = [];
  for (const s of wache.jeModulApi.get(modul)?.values() || []) aus.push({ host: s.host, name: s.name, art: 'schnittstelle' });
  for (const g of wache.jeModul.get(modul)?.values() || []) {
    const host = g.host.replace(/^www\./, '');
    // Host schon als Schnittstelle gelesen: ein anderer, gesperrter Pfad steht nur in den Hinweisen (kein „gesperrt“ daneben)
    if (!aus.some(x => (x.host === host || x.host === g.host) && (x.art === 'gesperrt' || x.art === 'schnittstelle'))) aus.push({ host, art: 'gesperrt' });
  }
  return aus.slice(0, 10);
}
