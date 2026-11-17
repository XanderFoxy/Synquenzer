// Höfliches Abrufen (gleiches Muster wie schnaeppchen/scan/http.mjs und konzerte/scan/lib.mjs):
// eigener User-Agent, Zeitlimit, Mindestabstand pro Host, ein kleiner Wiederholversuch bei 429/5xx.
// abruf.pauseMsJeHost: längerer Abstand für einzelne Hosts (z. B. Apple: höchstens ~20 Abrufe pro Minute).
// pauseMs 0 (Tests) = ganz ohne Pausen.
// Retry-After (429/503, Prüfung MV7 Befund 2): Wartezeit des Dienstes gilt für die Wiederholung; verlangt er mehr als
// abruf.retryAfterMaxMs (Standard 60 s), keine Wiederholung in diesem Lauf. darfWiederholen() (Regel-Wache, Schnittstellen):
// false = keine Wiederholung (Obergrenze je Lauf erreicht).
// Fehler mit Retry-After-Kopf tragen den Wunsch als e.retryAfterMs (MV8): der Radar wartet mit dem Neuversuch des Moduls
// mindestens so lange (faellig.mjs) – die Drosselung hier bleibt unverändert.
// Runde 9 (Läufe 43970348817 + 44004388489: Google News antwortet mitten im Lauf 429 ohne Retry-After, die Wiederholung nach
// 3 s ebenso, der nächste Abruf Sekunden später wieder 200): HTTP 429 = „zu schnell“ -> für den Rest des Laufs bremst der
// Radar bei genau diesem Host selbst: Abstand verdoppelt (höchstens abruf.bremse429MaxMs), die eine Wiederholung frühestens
// nach abruf.wiederhol429Ms. Beides nur, wenn gesetzt (config.json); ohne die Werte bleibt alles wie vorher (Tests).
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const warte = ms => new Promise(r => setTimeout(r, ms));

/** Retry-After-Kopf -> Millisekunden (Sekunden oder HTTP-Datum), null wenn keiner/unlesbar */
export function retryAfterMs(wert, jetztMs = Date.now()) {
  const w = String(wert ?? '').trim();
  if (!w) return null;
  if (/^\d+$/.test(w)) return Number(w) * 1000;
  const t = Date.parse(w);
  return Number.isFinite(t) ? Math.max(0, t - jetztMs) : null;
}

export function macheAbruf(abruf, fetchImpl = globalThis.fetch) {
  const letzter = new Map();
  const bremse = new Map(); // Host -> eigener, längerer Abstand nach HTTP 429 (nur dieser Lauf)
  const mitPausen = abruf.pauseMs > 0; // pauseMs 0 (Tests) = ganz ohne Pausen, auch ohne Bremse
  const bremseMax = mitPausen && abruf.bremse429MaxMs > 0 ? abruf.bremse429MaxMs : 0;
  const warte429 = mitPausen && abruf.wiederhol429Ms > 0 ? abruf.wiederhol429Ms : 0;
  // timeoutMs je Abruf: für langsame, aber erlaubte Abfragen (Overpass rechnet bis zu 90 s), sonst abruf.timeoutMs
  async function holeText(url, { headers = {}, method = 'GET', body, timeoutMs, darfWiederholen } = {}) {
    const host = new URL(url).host;
    const grund = abruf.pauseMs > 0 ? Math.max(abruf.pauseMs, abruf.pauseMsJeHost?.[host] ?? 0) : 0;
    for (let versuch = 0; ; versuch++) {
      const pause = Math.max(grund, bremse.get(host) || 0);
      const seit = Date.now() - (letzter.get(host) || 0);
      if (seit < pause) await warte(pause - seit);
      letzter.set(host, Date.now());
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), timeoutMs || abruf.timeoutMs);
      try {
        const r = await fetchImpl(url, {
          method, body, signal: ctl.signal, redirect: 'follow',
          headers: { 'user-agent': abruf.userAgent, 'accept-language': 'de-DE,de;q=0.9', ...headers },
        });
        // 429: dieser Host bekommt für den Rest des Laufs den doppelten Abstand (höchstens bremseMax)
        if (r.status === 429 && bremseMax) bremse.set(host, Math.min(bremseMax, Math.max(grund, bremse.get(host) || 0) * 2));
        // Wiederholung frühestens nach dem Host-Abstand (Overpass „at capacity“ 502: 10 s statt 3 s, Roh-Lauf 43887290010)
        // und nicht vor dem Retry-After des Dienstes; nach 429 frühestens nach warte429 bzw. dem gebremsten Abstand
        if ((r.status === 429 || r.status >= 500) && versuch < 1) {
          const ra = retryAfterMs(r.headers?.get?.('retry-after'));
          if ((ra == null || ra <= (abruf.retryAfterMaxMs ?? 60000)) && (darfWiederholen ? darfWiederholen() : true)) {
            await r.body?.cancel?.().catch(() => {});
            const extra429 = r.status === 429 ? Math.max(warte429, bremse.get(host) || 0) : 0;
            await warte(Math.max(abruf.wiederholMs ?? 3000, pause, ra ?? 0, extra429));
            continue;
          }
        }
        const text = await r.text();
        if (!r.ok) {
          const fehler = new Error(`HTTP ${r.status} bei ${host}`);
          const ra = retryAfterMs(r.headers?.get?.('retry-after'));
          if (ra != null) fehler.retryAfterMs = ra;
          throw fehler;
        }
        return text;
      } catch (e) {
        if (e.name === 'AbortError') throw new Error(`Zeitüberschreitung bei ${host}`);
        throw e;
      } finally { clearTimeout(t); }
    }
  }
  holeText.bremse = bremse; // für Tests und Lauf-Bericht: Hosts, bei denen der Radar nach 429 selbst langsamer wurde
  return holeText;
}

// Für Tests und --fixtures: URL -> aufgezeichnete Antwort. karte = [[teilDerUrl, dateiname], ...] (erster Treffer gewinnt).
// Unbekannte RSS-URLs bekommen einen leeren Feed, unbekannte JSON-APIs ein leeres Objekt. Unbekannte robots.txt (Regel-Wache,
// MV6): HTTP 404 = keine robots.txt = alles erlaubt; eine eigene robots.txt-Fixture steht wie jede andere in der Karte.
const ROBOTS_FEHLT = url => { try { return new URL(url).pathname === '/robots.txt'; } catch { return false; } };
export function macheFixtureAbruf(dir, karte) {
  return async function holeText(url) {
    const treffer = karte.find(([teil]) => url.includes(teil));
    if (!treffer && ROBOTS_FEHLT(url)) throw new Error(`HTTP 404 bei ${new URL(url).host}`);
    if (!treffer) {
      if (/rss|feed|atom|\.xml/i.test(url)) return '<rss><channel></channel></rss>';
      if (/arbeitsagentur/.test(url)) return '{"stellenangebote":[]}';
      throw new Error(`keine Fixture für ${url}`);
    }
    if (treffer[1] === '!fehler') throw new Error(`HTTP 503 bei ${new URL(url).host}`);
    return readFile(join(dir, treffer[1]), 'utf8');
  };
}

// Für Tests mit echten Läufen: Roh-Mitschnitt (lib/roh.mjs) wieder abspielen. index.json = { abrufe: [{ url, status,
// datei, fehler }] } wie im Roh-Lauf; dieselbe URL -> dieselbe Antwort (Status ≥ 400 -> „HTTP <status> bei <host>“
// wie macheAbruf). Nicht aufgenommene URLs: RSS leer, sonst Fehler (wie macheFixtureAbruf); robots.txt ohne Aufnahme (Läufe
// vor MV6 holten sie nur für einzelne Quellen) = HTTP 404 = keine Regeln.
export function macheAufnahmeAbruf(dir, index) {
  const karte = new Map();
  for (const a of index?.abrufe || []) if (!karte.has(a.url)) karte.set(a.url, a);
  return async function holeText(url) {
    const a = karte.get(url);
    if (!a && ROBOTS_FEHLT(url)) throw new Error(`HTTP 404 bei ${new URL(url).host}`);
    if (!a) {
      if (/rss|feed|atom|\.xml/i.test(url)) return '<rss><channel></channel></rss>';
      throw new Error(`keine Aufnahme für ${url}`);
    }
    if (a.fehler && !a.status) throw new Error(a.fehler);
    if (a.status >= 400) throw new Error(`HTTP ${a.status} bei ${new URL(url).host}`);
    return readFile(join(dir, a.datei), 'utf8');
  };
}
