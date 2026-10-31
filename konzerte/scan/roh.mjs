// Roh-Mitschnitt für die Fehlersuche – nur auf ausdrücklichen Wunsch (Workflow-Eingabe „roh“ → ROH_DIR, lokal: --roh <ordner>).
// Speichert jede Antwort einer Quelle unverändert (höchstens 2 MB pro Datei) unter quellen/, dazu index.json mit URL,
// Status und Dauer, und unter ausgabe/ das berechnete Ergebnis. Schlüssel in URLs und bekannte Geheimnisse werden geschwärzt.
// Ohne ROH_DIR wird dieses Modul nicht benutzt und nichts geschrieben.
// (Gleiche Datei in schnaeppchen/scan/roh.mjs, vorteile/scan/lib/roh.mjs und konzerte/scan/roh.mjs.)
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const ROH_MAX_BYTES = 2 * 1024 * 1024;
const GEHEIME_UMGEBUNG = ['TM_KEY', 'KEEPA_KEY', 'NTFY_TOKEN', 'MARKTGURU_API_KEY', 'MARKTGURU_CLIENT_KEY', 'GH_TOKEN', 'GITHUB_TOKEN'];
const GEHEIM_PARAM = /([?&](?:api_?key|key|token|access_?token|client_?key|secret|password)=)[^&#]*/gi;

/** Ordner für den Roh-Mitschnitt oder null (= normaler Lauf). */
export function rohOrdner(args = [], env = {}) {
  const i = args.indexOf('--roh');
  return (i >= 0 && args[i + 1]) || env.ROH_DIR || null;
}

export function schwaerzeUrl(url, geheim = []) {
  let u = String(url).replace(GEHEIM_PARAM, '$1***');
  for (const g of geheim) u = u.split(g).join('***');
  return u;
}

function endung(typ, text) {
  const t = String(typ || '').toLowerCase();
  if (t.includes('json')) return 'json';
  if (/xml|rss|atom/.test(t)) return 'xml';
  if (t.includes('html')) return 'html';
  const s = String(text || '').trimStart().slice(0, 200);
  if (/^[[{]/.test(s)) return 'json';
  if (/^<\?xml|^<rss|^<feed/i.test(s)) return 'xml';
  if (s.startsWith('<')) return 'html';
  return 'txt';
}

const kurzname = url => String(url).replace(/^https?:\/\//, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90);

export function macheMitschnitt(dir, { projekt = '', env = {}, maxBytes = ROH_MAX_BYTES } = {}) {
  const geheim = GEHEIME_UMGEBUNG.map(k => env[k]).filter(v => typeof v === 'string' && v.length >= 6);
  const schwaerze = s => geheim.reduce((t, g) => t.split(g).join('***'), String(s ?? ''));
  const abrufe = [];
  const erstellt = new Date().toISOString();
  mkdirSync(join(dir, 'quellen'), { recursive: true });

  function speichere({ url, methode = 'GET', status = null, ms = null, typ = '', text = '', fehler = null }) {
    const nr = abrufe.length + 1;
    const sauber = schwaerzeUrl(url, geheim);
    const e = { nr, url: sauber, methode, status, ms, typ, datei: null, bytes: 0, gekuerzt: false, fehler };
    if (text) {
      let puffer = Buffer.from(schwaerze(text), 'utf8');
      e.bytes = puffer.length;
      if (puffer.length > maxBytes) { puffer = puffer.subarray(0, maxBytes); e.gekuerzt = true; }
      e.datei = `quellen/${String(nr).padStart(3, '0')}-${kurzname(sauber)}.${endung(typ, text)}`;
      writeFileSync(join(dir, e.datei), puffer);
    }
    abrufe.push(e);
    return e;
  }

  /** Umhüllt fetch: jede Antwort wird mitgeschrieben, der Aufrufer bekommt sie unverändert. */
  function fetchMit(fetchImpl) {
    return async function rohFetch(url, opts = {}) {
      const t0 = Date.now();
      const basis = { url: String(url), methode: opts.method || 'GET' };
      let r;
      try { r = await (fetchImpl || globalThis.fetch)(url, opts); }
      catch (err) { speichere({ ...basis, ms: Date.now() - t0, fehler: String(err?.message || err) }); throw err; }
      let text = '', fehler = null;
      try { if (typeof r.clone === 'function') text = await r.clone().text(); }
      catch (err) { fehler = String(err?.message || err); }
      speichere({ ...basis, status: r.status ?? null, ms: Date.now() - t0, typ: r.headers?.get?.('content-type') || '', text, fehler });
      return r;
    };
  }

  /** Berechnetes Ergebnis (das, was sonst auf den Daten-Zweig ginge) nach ausgabe/<name>. */
  function ausgabe(name, inhalt) {
    mkdirSync(join(dir, 'ausgabe'), { recursive: true });
    writeFileSync(join(dir, 'ausgabe', name), typeof inhalt === 'string' ? inhalt : JSON.stringify(inhalt, null, 1) + '\n');
  }

  function abschluss(extra = {}) {
    const info = {
      projekt, erstellt, fertig: new Date().toISOString(), lauf: env.GITHUB_RUN_ID || null,
      anzahl: abrufe.length, maxBytesProDatei: maxBytes, ...extra, abrufe,
    };
    writeFileSync(join(dir, 'index.json'), JSON.stringify(info, null, 1) + '\n');
    return info;
  }

  return { dir, fetch: fetchMit, speichere, ausgabe, abschluss, abrufe };
}
