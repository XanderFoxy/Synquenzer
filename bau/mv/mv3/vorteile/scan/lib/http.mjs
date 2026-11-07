// Höfliches Abrufen (gleiches Muster wie schnaeppchen/scan/http.mjs und konzerte/scan/lib.mjs):
// eigener User-Agent, Zeitlimit, Mindestabstand pro Host, ein kleiner Wiederholversuch bei 429/5xx.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const warte = ms => new Promise(r => setTimeout(r, ms));

export function macheAbruf(abruf, fetchImpl = globalThis.fetch) {
  const letzter = new Map();
  return async function holeText(url, { headers = {}, method = 'GET', body } = {}) {
    const host = new URL(url).host;
    for (let versuch = 0; ; versuch++) {
      const seit = Date.now() - (letzter.get(host) || 0);
      if (seit < abruf.pauseMs) await warte(abruf.pauseMs - seit);
      letzter.set(host, Date.now());
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), abruf.timeoutMs);
      try {
        const r = await fetchImpl(url, {
          method, body, signal: ctl.signal, redirect: 'follow',
          headers: { 'user-agent': abruf.userAgent, 'accept-language': 'de-DE,de;q=0.9', ...headers },
        });
        if ((r.status === 429 || r.status >= 500) && versuch < 1) { await warte(3000); continue; }
        const text = await r.text();
        if (!r.ok) throw new Error(`HTTP ${r.status} bei ${host}`);
        return text;
      } catch (e) {
        if (e.name === 'AbortError') throw new Error(`Zeitüberschreitung bei ${host}`);
        throw e;
      } finally { clearTimeout(t); }
    }
  };
}

// Für Tests und --fixtures: URL -> aufgezeichnete Antwort. karte = [[teilDerUrl, dateiname], ...] (erster Treffer gewinnt).
// Unbekannte RSS-URLs bekommen einen leeren Feed, unbekannte JSON-APIs ein leeres Objekt.
export function macheFixtureAbruf(dir, karte) {
  return async function holeText(url) {
    const treffer = karte.find(([teil]) => url.includes(teil));
    if (!treffer) {
      if (/rss|feed|atom|\.xml/i.test(url)) return '<rss><channel></channel></rss>';
      if (/arbeitsagentur/.test(url)) return '{"stellenangebote":[]}';
      throw new Error(`keine Fixture für ${url}`);
    }
    if (treffer[1] === '!fehler') throw new Error(`HTTP 503 bei ${new URL(url).host}`);
    return readFile(join(dir, treffer[1]), 'utf8');
  };
}
