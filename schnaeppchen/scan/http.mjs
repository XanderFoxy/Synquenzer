// Polite fetching: own user agent, timeout, one request per host at a time with a pause in between.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export function macheAbruf(abruf) {
  const letzter = new Map();
  const warte = ms => new Promise(r => setTimeout(r, ms));
  return async function holeText(url, { headers = {}, method = 'GET', body } = {}) {
    const host = new URL(url).host;
    const seit = Date.now() - (letzter.get(host) || 0);
    if (seit < abruf.pauseMs) await warte(abruf.pauseMs - seit);
    letzter.set(host, Date.now());
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), abruf.timeoutMs);
    try {
      const r = await fetch(url, {
        method, body, signal: ctl.signal, redirect: 'follow',
        headers: { 'user-agent': abruf.userAgent, 'accept-language': 'de-DE,de;q=0.9', ...headers },
      });
      const text = await r.text();
      if (!r.ok) throw new Error(`HTTP ${r.status} bei ${host}`);
      return text;
    } catch (e) {
      if (e.name === 'AbortError') throw new Error(`Zeitüberschreitung bei ${host}`);
      throw e;
    } finally { clearTimeout(t); }
  };
}

// Fixture fetcher for tests and --probe: maps URLs to recorded responses in test/fixtures.
export function macheFixtureAbruf(dir) {
  return async function holeText(url) {
    const u = new URL(url);
    let datei;
    if (u.host === 'www.marktguru.de') datei = 'marktguru-start.html';
    else if (u.host === 'api.marktguru.de') {
      const q = (u.searchParams.get('q') || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      datei = `marktguru-${q}.json`;
    } else if (u.host === 'www.mydealz.de') {
      datei = u.pathname.includes('preisfehler') ? 'mydealz-preisfehler.xml'
        : u.pathname.includes('search') ? 'mydealz-leer.xml'
        : u.pathname.includes('lebensmittel') ? 'mydealz-kaputt.txt' : 'mydealz-hot.xml';
    } else if (u.host === 'api.keepa.com') datei = 'keepa-product.json';
    else throw new Error(`keine Fixture für ${url}`);
    try { return await readFile(join(dir, datei), 'utf8'); }
    catch {
      if (datei.startsWith('marktguru-') && datei.endsWith('.json')) return '{"totalResults":0,"results":[]}';
      throw new Error(`Fixture fehlt: ${datei}`);
    }
  };
}
