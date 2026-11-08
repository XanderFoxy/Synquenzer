// Polite fetching: own user agent, timeout, one request per host at a time with a pause in between.
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// fetchImpl: nur für den Roh-Mitschnitt (roh.mjs) und Tests; sonst das normale fetch.
export function macheAbruf(abruf, fetchImpl) {
  const letzter = new Map();
  const warte = ms => new Promise(r => setTimeout(r, ms));
  return async function holeText(url, { headers = {}, method = 'GET', body } = {}) {
    const host = new URL(url).host;
    // eigene Pause je Server, wo robots.txt sie verlangt (kaufDA: crawl-delay 2 -> abruf.pauseProHost)
    const pause = abruf.pauseProHost?.[host] ?? abruf.pauseMs;
    const seit = Date.now() - (letzter.get(host) || 0);
    if (seit < pause) await warte(pause - seit);
    letzter.set(host, Date.now());
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), abruf.timeoutMs);
    try {
      const r = await (fetchImpl || fetch)(url, {
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
    } else if (u.host === 'www.mydealz.de' && u.pathname.startsWith('/deals/')) {
      datei = `mydealz-deal-${(u.pathname.match(/(\d+)\/?$/) || [])[1] || 'x'}.html`;
    } else if (u.host === 'www.mydealz.de') {
      datei = u.pathname.includes('preisfehler') ? 'mydealz-preisfehler.xml'
        : u.pathname.includes('search') ? 'mydealz-leer.xml'
        : u.pathname.includes('lebensmittel') ? 'mydealz-kaputt.txt' : 'mydealz-hot.xml';
    } else if (u.host === 'api.keepa.com') datei = 'keepa-product.json';
    else if (u.host === 'www.kaufda.de') {
      // /Chemnitz/Angebote/Haribo -> kaufda-chemnitz-haribo.html, /Angebote/Haribo -> kaufda-haribo.html
      const teile = u.pathname.split('/').filter(Boolean).map(t => t.toLowerCase());
      datei = `kaufda-${teile.filter(t => t !== 'angebote').join('-')}.html`;
    } else throw new Error(`keine Fixture für ${url}`);
    try { return await readFile(join(dir, datei), 'utf8'); }
    catch {
      if (datei.startsWith('marktguru-') && datei.endsWith('.json')) return '{"totalResults":0,"results":[]}';
      // kaufDA ohne Fixture: wie eine Seite ohne Treffer (Stadt) bzw. ein unbekanntes Stichwort (bundesweit)
      if (datei.startsWith('kaufda-')) throw new Error('HTTP 404 bei www.kaufda.de');
      throw new Error(`Fixture fehlt: ${datei}`);
    }
  };
}

// Wiedergabe eines Roh-Mitschnitts (roh.mjs: index.json + quellen/): dieselben Antworten wie beim echten Lauf,
// ohne Netz. HTTP-Fehler von damals kommen als Fehler zurück; was nicht abgerufen wurde, fehlt („nicht im Mitschnitt“).
export function macheWiedergabe(dir) {
  const index = JSON.parse(readFileSync(join(dir, 'index.json'), 'utf8'));
  const proUrl = new Map();
  for (const a of index.abrufe || []) if (!proUrl.has(a.url)) proUrl.set(a.url, a);
  return async function holeText(url) {
    const a = proUrl.get(String(url));
    if (!a) throw new Error(`nicht im Mitschnitt: ${url}`);
    if (a.fehler && !a.datei) throw new Error(a.fehler);
    const text = a.datei ? await readFile(join(dir, a.datei), 'utf8') : '';
    if (a.status && (a.status < 200 || a.status >= 300)) throw new Error(`HTTP ${a.status} bei ${new URL(a.url).host}`);
    return text;
  };
}
