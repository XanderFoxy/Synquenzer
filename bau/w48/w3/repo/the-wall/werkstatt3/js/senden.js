// Werkstatt 3 – senden.js
// Gesangsdatei privat an Claude schicken. Genau derselbe Weg wie die Ton-Post (Synquenzer/ton-post/ton.js):
//   1) POST functions/v1/ton-ticket  {code, satzName, dateien:[…]} → satzId + signierte Upload-Adressen je Teil (2 h gültig)
//   2) PUT  jeder Teil (16 MiB) an seine Adresse → privater Bucket „ton-eingang“ (Supabase dbdnsryoivvezspgydpx)
//   3) POST functions/v1/ton-fertig  {code, satzId, nr, teileDa} → der Server zählt selbst nach, was angekommen ist
// Kein Schlüssel in dieser Datei: es gilt der Ton-Post-Code, den Xander einmal eintippt. Ton-Post und Werkstatt liegen
// beide auf xanderfoxy.github.io (gleicher Ursprung) und teilen sich den gemerkten Code (localStorage „ton-post-code“).
// Notiz, Stellen, Quelle und Zeitpunkt reisen als Zusatzfelder je Datei mit (ton-ticket legt sie in „extra“ ab).
// Abholen kann nur Claude (ton-holen mit eigenem Abhol-Schlüssel) – siehe SENDEN.md.
//
// export async function anClaude({blob, name, notiz, stellen, onFortschritt, original, originalName, code, signal, zusatz, nochmal})
//        → {ok:true, id, dateien:[{nr, name, rolle, bytes}], doppelt?}   id = Satz-ID (UUID) im Speicher
//        doppelt = genau dieser Inhalt (Datei + Notiz + Stellen) ging in dieser Sitzung schon an; nochmal:true sendet trotzdem
//        → {ok:false, art, text}   art: 'code' | 'netz' | 'platz' | 'drossel' | 'abgebrochen' | 'eingabe' | 'server'
//        Wirft nie. Gleiche Datei nochmal (nach Netzabbruch) → geht dort weiter, wo es aufgehört hat.
//        onFortschritt({schritt, anteil, gesendet, gesamt, text}) – anteil 0…1 über alles; schritt:
//        'vorbereiten' | 'anmelden' | 'senden' | 'warten' | 'pruefen' | 'fertig'
// export function codeGemerkt() → true/false     export function codeMerken(code)     export function codeVergessen()
// export async function codePruefen(code) → {ok:true, frei} | {ok:false, art, text}   (merkt den Code, wenn er stimmt)
// export function zeitText(sekunden) → "1:23,4"

const API = 'https://dbdnsryoivvezspgydpx.supabase.co/functions/v1/';
const TEIL = 16 * 1024 * 1024;          // wie Ton-Post (Server-Grenze je Teil: 45 MiB)
const GUELTIG = 110 * 60 * 1000;        // Upload-Adressen gelten 2 h – mit Puffer
const GLEICHZEITIG = 2;                 // Teile parallel unterwegs
const NETZ_VERSUCHE = 10;               // ~4 min ohne Netz, dann ehrlich aufgeben (nochmal tippen setzt fort)
const LS_CODE = 'ton-post-code';        // derselbe Speicherplatz wie in der Ton-Post
const QUELLE = 'Werkstatt 3';
const MAXJ = 1900;                      // ton-ticket übernimmt Zusatzfelder nur unter 2000 Zeichen JSON
const STANDARD = new Set(['name', 'groesse', 'sha256', 'format', 'kanaele', 'rate', 'bits', 'dauer_s', 'teile', 'upload_groesse', 'pcm_sha256']);
const G = globalThis;

// ---------------------------------------------------------------- Code (wie Ton-Post, immer mit try/catch)
const ls = {
  get(k) { try { return G.localStorage?.getItem(k) || ''; } catch { return ''; } },
  set(k, v) { try { G.localStorage?.setItem(k, v); } catch { /* egal */ } },
  del(k) { try { G.localStorage?.removeItem(k); } catch { /* egal */ } },
};
export const codeGemerkt = () => !!ls.get(LS_CODE);
export const codeMerken = (c) => { c = String(c || '').trim(); if (c) ls.set(LS_CODE, c); };
export const codeVergessen = () => ls.del(LS_CODE);

export async function codePruefen(code) {
  const c = String(code || '').trim() || ls.get(LS_CODE);
  if (!c) return fehler('code', TEXT.codeFehlt);
  try {
    const r = await rufe('ton-ticket', { code: c, nurPlatz: true }, {});
    codeMerken(c);
    return { ok: true, frei: r.frei ?? null };
  } catch (e) { return fehlerAus(e, c); }
}

// ---------------------------------------------------------------- Texte
const TEXT = {
  codeFehlt: 'Bitte einmal den Ton-Post-Code eintippen (derselbe wie in der Ton-Post). Er wird dann auf diesem Gerät gemerkt.',
  codeFalsch: 'Der Code stimmt nicht. Bitte den Ton-Post-Code nochmal eintippen.',
  drossel: 'Gerade zu viele Sendungen hintereinander. Bitte in einer Stunde nochmal senden.',
  netz: 'Keine Verbindung zum Speicher. Bitte Netz prüfen und nochmal auf „An Claude schicken“ tippen – schon Gesendetes wird übersprungen.',
  abgebrochen: 'Senden abgebrochen. Nochmal tippen setzt fort.',
  server: 'Der Speicher antwortet gerade nicht richtig. Bitte gleich nochmal senden.',
  weg: 'Diese Sendung ist im Speicher nicht mehr da. Bitte nochmal senden – sie geht dann ganz neu los.',
  unvollstaendig: 'Nicht alle Teile sind angekommen. Bitte nochmal senden – Angekommenes wird übersprungen.',
  leer: 'Keine Gesangsdatei zum Senden da (die Datei ist leer).',
};
class Fehler extends Error { constructor(art, text, mehr) { super(text); this.art = art; Object.assign(this, mehr || {}); } }
const fehler = (art, text) => ({ ok: false, art, text });
function fehlerAus(e, codeBenutzt) {
  if (e instanceof Fehler) {
    if (e.art === 'code' && codeBenutzt && codeBenutzt === ls.get(LS_CODE)) codeVergessen(); // falscher gemerkter Code: neu fragen
    return fehler(e.art, e.message);
  }
  return fehler('server', TEXT.server + (e && e.message ? ` (${String(e.message).slice(0, 80)})` : ''));
}

// ---------------------------------------------------------------- Hilfen
const zahl = (x, s = 1) => x.toLocaleString('de-DE', { maximumFractionDigits: s, minimumFractionDigits: 0 });
const mb = (b) => zahl(b / 1e6, b >= 1e8 ? 0 : 1) + ' MB';
export function zeitText(s) {
  const z = Math.max(0, Math.round((+s || 0) * 10)), m = Math.floor(z / 600), r = z % 600;
  return m + ':' + String(Math.floor(r / 10)).padStart(2, '0') + ',' + (r % 10);
}
const UNSICHTBAR = /[\u0000-\u001f\u007f-\u009f​-‏ -‮⁠-⁯﻿￹-￻]/g;
function sauberName(n, ersatz) {
  n = String(n || '').replace(UNSICHTBAR, ' ').replace(/\s+/g, ' ').trim() || ersatz;
  if (n.length <= 120) return n;
  const p = n.lastIndexOf('.'), end = p > 0 && n.length - p <= 9 ? n.slice(p) : '';
  return n.slice(0, 120 - end.length).trimEnd() + end;
}
const endung = (n) => { const m = /\.([a-z0-9]{2,8})$/i.exec(n || ''); return m && /[a-z]/i.test(m[1]) ? m[1].toLowerCase() : ''; };
const TYPEN = { 'audio/wav': 'wav', 'audio/x-wav': 'wav', 'audio/wave': 'wav', 'audio/vnd.wave': 'wav', 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a', 'audio/aac': 'aac', 'audio/flac': 'flac', 'audio/x-flac': 'flac', 'audio/aiff': 'aiff', 'audio/x-aiff': 'aiff', 'audio/ogg': 'ogg', 'audio/webm': 'webm' };
const istBlob = (b) => b && typeof b.size === 'number' && typeof b.slice === 'function';
const abbruch = (signal) => { if (signal?.aborted) throw new Fehler('abgebrochen', TEXT.abgebrochen); };
const luft = () => (G.scheduler?.yield ? G.scheduler.yield() : new Promise((r) => setTimeout(r, 0)));
function pause(ms, signal) {
  return new Promise((ja, nein) => {
    const fertig = () => { clearTimeout(t); G.removeEventListener?.('online', fertig); signal?.removeEventListener('abort', ab); ja(); };
    const ab = () => { fertig(); nein(new Fehler('abgebrochen', TEXT.abgebrochen)); };
    const t = setTimeout(fertig, ms);
    G.addEventListener?.('online', fertig); // Netz wieder da → sofort weiter
    signal?.addEventListener('abort', ab);
  });
}
const warteZeit = (v) => Math.min(30000, 1500 * 2 ** Math.min(v - 1, 4));

// Bildschirm wach halten, solange gesendet wird (iPhone: gesperrter Bildschirm bricht Uploads ab)
let sperre = null, holt = false, wachZahl = 0;
async function sperreAnpassen() {
  try {
    if (wachZahl && !sperre && !holt && G.navigator?.wakeLock && G.document?.visibilityState === 'visible') {
      holt = true;
      try { sperre = await G.navigator.wakeLock.request('screen'); sperre.addEventListener?.('release', () => { sperre = null; }); } finally { holt = false; }
      if (!wachZahl) sperreAnpassen();
    } else if (!wachZahl && sperre) { const s = sperre; sperre = null; await s.release(); }
  } catch { sperre = null; }
}
const wach = (an) => { wachZahl = Math.max(0, wachZahl + (an ? 1 : -1)); sperreAnpassen(); };
G.document?.addEventListener?.('visibilitychange', () => { if (wachZahl) sperreAnpassen(); });

// ---------------------------------------------------------------- Dateikopf (WAV/RF64), ohne die Datei ganz zu laden
const txt4 = (dv, o) => String.fromCharCode(dv.getUint8(o), dv.getUint8(o + 1), dv.getUint8(o + 2), dv.getUint8(o + 3));
async function kopfLesen(blob, name) {
  const k = { format: endung(name) || TYPEN[(blob.type || '').split(';')[0]] || null };
  try {
    const dv = new DataView(await blob.slice(0, Math.min(blob.size, 1 << 16)).arrayBuffer());
    if (dv.byteLength < 12) return k;
    const id = txt4(dv, 0), typ = txt4(dv, 8);
    if (id === 'FORM' && (typ === 'AIFF' || typ === 'AIFC')) k.format = 'aiff';
    else if (id === 'fLaC') k.format = 'flac';
    if ((id !== 'RIFF' && id !== 'RF64') || typ !== 'WAVE') return k;
    k.format = 'wav';
    let o = 12, fmt = null, ds64 = 0;
    while (o + 8 <= dv.byteLength) {
      const cid = txt4(dv, o), len = dv.getUint32(o + 4, true);
      if (cid === 'ds64' && o + 24 <= dv.byteLength) ds64 = dv.getUint32(o + 16, true) + dv.getUint32(o + 20, true) * 4294967296; // dataSize
      else if (cid === 'fmt ' && o + 24 <= dv.byteLength) {
        let tag = dv.getUint16(o + 8, true);
        if (tag === 0xFFFE && len >= 26 && o + 34 <= dv.byteLength) tag = dv.getUint16(o + 32, true);
        fmt = { tag, ch: dv.getUint16(o + 10, true), sr: dv.getUint32(o + 12, true), ba: dv.getUint16(o + 20, true), bits: dv.getUint16(o + 22, true) };
      } else if (cid === 'data') {
        if (fmt) {
          const rest = blob.size - (o + 8);
          let n = len === 0xFFFFFFFF && ds64 ? ds64 : len;
          if (!n || n === 0xFFFFFFFF || n > rest) n = rest;
          const ba = fmt.ba || (fmt.bits >> 3) * fmt.ch;
          if (fmt.ch >= 1 && fmt.ch <= 64) k.kanaele = fmt.ch;
          if (fmt.sr >= 1000 && fmt.sr <= 768000) k.rate = fmt.sr;
          if (fmt.bits >= 1 && fmt.bits <= 64) k.bits = fmt.bits;
          if (fmt.tag === 3) k.float = true;
          if (ba && fmt.sr) { const d = Math.round(Math.floor(n / ba) / fmt.sr * 1000) / 1000; if (d >= 0 && d < 86400) k.dauer_s = d; }
        }
        break;
      }
      o += 8 + len + (len & 1);
    }
  } catch { /* kaputter Kopf: Datei geht trotzdem unverändert mit */ }
  return k;
}

// ---------------------------------------------------------------- SHA-256 stückweise (nach ton-post/sha256.js, FIPS 180-4)
const K = new Int32Array([0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01,
  0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa,
  0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138,
  0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624,
  0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f,
  0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);
class Sha256 {
  constructor() { this.h = new Int32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]); this.w = new Int32Array(64); this.rest = new Uint8Array(64); this.restN = 0; this.laenge = 0; }
  bloecke(u, o, n) {
    const w = this.w, h = this.h;
    let h0 = h[0], h1 = h[1], h2 = h[2], h3 = h[3], h4 = h[4], h5 = h[5], h6 = h[6], h7 = h[7];
    for (let b = 0; b < n; b++, o += 64) {
      for (let i = 0; i < 16; i++) { const p = o + i * 4; w[i] = (u[p] << 24) | (u[p + 1] << 16) | (u[p + 2] << 8) | u[p + 3]; }
      for (let i = 16; i < 64; i++) {
        const x = w[i - 15], y = w[i - 2];
        w[i] = (w[i - 16] + (((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3)) + w[i - 7] + (((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10))) | 0;
      }
      let a = h0, bb = h1, c = h2, d = h3, e = h4, f = h5, g = h6, hh = h7;
      for (let i = 0; i < 64; i++) {
        const t1 = (hh + (((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0;
        const t2 = ((((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))) + ((a & bb) ^ (a & c) ^ (bb & c))) | 0;
        hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0;
      }
      h0 = (h0 + a) | 0; h1 = (h1 + bb) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + hh) | 0;
    }
    h[0] = h0; h[1] = h1; h[2] = h2; h[3] = h3; h[4] = h4; h[5] = h5; h[6] = h6; h[7] = h7;
  }
  update(u) {
    let o = 0, n = u.length; this.laenge += n;
    if (this.restN) {
      const k = Math.min(64 - this.restN, n); this.rest.set(u.subarray(0, k), this.restN); this.restN += k; o = k; n -= k;
      if (this.restN < 64) return this;
      this.bloecke(this.rest, 0, 1); this.restN = 0;
    }
    const voll = n >> 6; if (voll) this.bloecke(u, o, voll);
    o += voll * 64; n -= voll * 64;
    if (n) { this.rest.set(u.subarray(o, o + n), 0); this.restN = n; }
    return this;
  }
  hex() {
    const bits = this.laenge * 8, p = new Uint8Array(((this.restN + 9 + 63) >> 6) * 64);
    p.set(this.rest.subarray(0, this.restN)); p[this.restN] = 0x80;
    const hi = Math.floor(bits / 4294967296), lo = bits >>> 0, e = p.length;
    p[e - 8] = hi >>> 24; p[e - 7] = hi >>> 16; p[e - 6] = hi >>> 8; p[e - 5] = hi; p[e - 4] = lo >>> 24; p[e - 3] = lo >>> 16; p[e - 2] = lo >>> 8; p[e - 1] = lo;
    this.bloecke(p, 0, p.length >> 6);
    let s = ''; for (const x of this.h) s += (x >>> 0).toString(16).padStart(8, '0');
    return s;
  }
}
// Merkzettel im Speicher der Seite: Prüfsumme je Blob; angefangene und fertige Sendungen je Inhalt (sig),
// damit ein neuer Tipp mit derselben Datei fortsetzt statt doppelt zu senden – auch wenn die UI den Blob neu baut.
const merk = { sha: new WeakMap(), laeuft: new WeakMap(), auftrag: new Map(), fertig: new Map() };
const merkSetzen = (m, k, v, max) => { m.delete(k); m.set(k, v); while (m.size > max) m.delete(m.keys().next().value); };
async function pruefsumme(blob, fort, signal) {
  if (merk.sha.has(blob)) { fort(blob.size); return merk.sha.get(blob); }
  const h = new Sha256(), S = 4 << 20; // 4 MiB je Schritt, dazwischen Luft für die Oberfläche
  for (let a = 0; a < blob.size; a += S) {
    abbruch(signal);
    h.update(new Uint8Array(await blob.slice(a, Math.min(blob.size, a + S)).arrayBuffer()));
    fort(Math.min(blob.size, a + S));
    await luft();
  }
  const hex = h.hex(); merk.sha.set(blob, hex); return hex;
}

// ---------------------------------------------------------------- Zusatzfelder (lange Werte in Stücke: notiz, notiz_2 …)
function feld(extra, key, wert) {
  if (wert == null || wert === '' || (Array.isArray(wert) && !wert.length)) return;
  if (JSON.stringify(wert).length <= MAXJ) { extra[key] = wert; return; }
  const teile = [];
  if (typeof wert === 'string') {
    for (let rest = wert; rest;) {
      let n = Math.min(rest.length, MAXJ - 2);
      while (JSON.stringify(rest.slice(0, n)).length > MAXJ) n = Math.floor(n * 0.8);
      teile.push(rest.slice(0, n)); rest = rest.slice(n);
    }
  } else if (Array.isArray(wert)) {
    let akt = [];
    for (const x of wert) { if (akt.length && JSON.stringify([...akt, x]).length > MAXJ) { teile.push(akt); akt = []; } akt.push(x); }
    if (akt.length) teile.push(akt);
  } else { feld(extra, key + '_json', JSON.stringify(wert)); return; }
  const n = Math.min(teile.length, 20);
  for (let i = 0; i < n; i++) extra[i ? `${key}_${i + 1}` : key] = teile[i];
  extra[key + '_teile'] = n;
}
function stellenListe(stellen) {
  const aus = [];
  for (const x of Array.isArray(stellen) ? stellen : []) {
    const o = x && typeof x === 'object' ? x : null;
    const s = Number(o ? (o.s ?? o.t ?? o.zeit_s ?? o.sek) : x);
    if (!Number.isFinite(s) || s < 0) continue;
    const e = { s: Math.round(s * 1000) / 1000, zeit: zeitText(s) };
    const t = o ? (o.text ?? o.notiz ?? o.label) : null;
    if (t != null && String(t).trim()) e.text = String(t).trim().slice(0, 500);
    aus.push(e);
  }
  return aus.sort((a, b) => a.s - b.s);
}
function ortsZeit(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0'), off = -d.getTimezoneOffset(), v = off >= 0 ? '+' : '-';
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}${v}${p(Math.floor(Math.abs(off) / 60))}:${p(Math.abs(off) % 60)}`;
}

// ---------------------------------------------------------------- Netz
// text/plain = „einfache Anfrage“: kein CORS-Vorab-Check nötig (wie Ton-Post). ton-ticket/ton-fertig erlauben nur xanderfoxy.github.io.
async function rufe(fn, daten, { signal, melde } = {}) {
  let netz = 0, server = 0;
  for (;;) {
    abbruch(signal);
    let r, text = '';
    try {
      r = await fetch(API + fn, { method: 'POST', headers: { 'content-type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(daten), cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal });
      text = await r.text();
    } catch {
      abbruch(signal);
      if (++netz > NETZ_VERSUCHE) throw new Fehler('netz', TEXT.netz);
      melde?.('warten'); await pause(warteZeit(netz), signal); continue;
    }
    let j = null; try { j = JSON.parse(text); } catch { /* kein JSON */ }
    if (r.ok && j && j.ok !== false) return j;
    const was = String(j?.fehler || '').toLowerCase();
    if (was === 'code' || (!was && (r.status === 401 || r.status === 403))) throw new Fehler('code', TEXT.codeFalsch);
    if (r.status === 429 || was === 'drossel') throw new Fehler('drossel', TEXT.drossel);
    if (r.status === 413 || was === 'platz') {
      const frei = Number(j?.frei), noetig = Number(j?.noetig);
      throw new Fehler('platz', 'Der Speicher für Claude ist gerade zu voll' + (frei >= 0 && noetig > 0 ? ` (frei ${mb(frei)}, nötig ${mb(noetig)})` : '')
        + '. Sobald Claude abgeholt hat, ist wieder Platz – bitte später nochmal senden.');
    }
    if (r.status === 404 && was === 'unbekannt') throw new Fehler('weg', TEXT.weg);
    if (r.status === 409 || was === 'zuviel') throw new Fehler('weg', 'Beim Hochladen ist etwas durcheinandergekommen (Datei größer als angemeldet). Bitte nochmal senden.');
    if (r.status === 400 || was === 'eingabe') throw new Fehler('eingabe', 'Der Speicher hat die Sendung abgelehnt: ' + String(j?.text || 'ungültige Angaben').slice(0, 160));
    if ((r.status >= 500 || r.status === 0) && ++server <= 4) { melde?.('warten'); await pause(2000 * server, signal); continue; }
    throw new Fehler('server', TEXT.server + ` (Fehler ${r.status})`);
  }
}

// Ein Teil hoch: im Browser per XHR (Fortschritt während des Teils), sonst fetch (Node/Tests).
function putXhr(url, body, fort, signal) {
  return new Promise((fertig) => {
    const x = new XMLHttpRequest(); let letzte = Date.now(), aus = false;
    const ende = (r) => { if (aus) return; aus = true; clearInterval(wache); signal?.removeEventListener('abort', ab); fertig(r); };
    const ab = () => { try { x.abort(); } catch { /* egal */ } ende({ abgebrochen: true, status: 0 }); };
    const wache = setInterval(() => { if (Date.now() - letzte > 60000) { try { x.abort(); } catch { /* egal */ } ende({ netz: true, status: 0 }); } }, 5000); // Hänger
    signal?.addEventListener('abort', ab);
    x.open('PUT', url);
    x.setRequestHeader('content-type', 'application/octet-stream');
    x.upload.onprogress = (ev) => { if (!aus) { letzte = Date.now(); fort(ev.loaded); } };
    x.onload = () => ende({ ok: x.status >= 200 && x.status < 300, status: x.status, text: String(x.responseText || '').slice(0, 400) });
    x.onerror = x.onabort = x.ontimeout = () => ende({ netz: true, status: 0 });
    try { x.send(body); } catch { ende({ netz: true, status: 0 }); }
  });
}
async function putFetch(url, body, fort, signal) {
  try {
    const r = await fetch(url, { method: 'PUT', headers: { 'content-type': 'application/octet-stream' }, body, signal, cache: 'no-store', credentials: 'omit' });
    const text = (await r.text()).slice(0, 400);
    if (r.ok) fort(body.size);
    return { ok: r.ok, status: r.status, text };
  } catch { return signal?.aborted ? { abgebrochen: true, status: 0 } : { netz: true, status: 0 }; }
}
const put = (...a) => (typeof G.XMLHttpRequest === 'function' ? putXhr : putFetch)(...a);

async function erneuern(auftrag, dateien, ctx) {
  const r = await rufe('ton-ticket', { code: auftrag.code, satzId: auftrag.satzId, erneuern: true, nr: dateien.map((d) => d.nr) }, ctx);
  for (const d of dateien) {
    const neu = (r.dateien || []).find((x) => x.nr === d.nr), urls = (neu?.uploads || []).map(urlVon);
    if (urls.length !== d.teile) throw new Fehler('weg', TEXT.weg);
    d.uploads = urls;
  }
  auftrag.bis = Date.now() + GUELTIG;
}
// Beide parallelen Teile teilen sich eine Erneuerung (keine doppelten Anfragen)
const erneuernEinmal = (auftrag, ctx) => auftrag.neuP || (auftrag.neuP = erneuern(auftrag, auftrag.dateien.filter((x) => !x.angekommen), ctx).finally(() => { auftrag.neuP = null; }));
const urlVon = (u) => (typeof u === 'string' ? u : (u && (u.signedUrl || u.signedURL || u.url)) || '');

async function teilHoch(auftrag, d, i, fort, ctx) {
  let netz = 0, hart = 0, neu = 0;
  for (;;) {
    abbruch(ctx.signal);
    if (auftrag.bis <= Date.now()) await erneuernEinmal(auftrag, ctx);
    const a = i * TEIL, body = d.blob.slice(a, Math.min(d.blob.size, a + TEIL));
    const r = await put(d.uploads[i], body, fort, ctx.signal);
    if (r.abgebrochen) throw new Fehler('abgebrochen', TEXT.abgebrochen);
    if (r.ok || r.status === 409 || /already exists|duplicate/i.test(r.text || '')) { d.da[i] = 1; return; } // 409: Teil liegt schon da
    fort(0);
    if ((r.status === 400 || r.status === 401 || r.status === 403) && /exp|jwt|token|signature|unauthori/i.test(r.text || '') && ++neu <= 2) {
      await erneuernEinmal(auftrag, ctx); continue; // Adresse abgelaufen → frische holen
    }
    if (r.netz) { if (++netz > NETZ_VERSUCHE) throw new Fehler('netz', TEXT.netz); ctx.melde('warten'); await pause(warteZeit(netz), ctx.signal); continue; }
    if (r.status >= 400 && r.status < 500 && r.status !== 408 && r.status !== 429 && ++hart > 3) throw new Fehler('server', `Der Speicher nimmt die Datei nicht an (Fehler ${r.status}).`);
    if (++netz > NETZ_VERSUCHE) throw new Fehler('server', TEXT.server + ` (Fehler ${r.status})`);
    await pause(warteZeit(netz), ctx.signal);
  }
}

async function parallel(liste, n, f) {
  let next = 0, halt = false; // nach einem Fehler keine neuen Teile mehr anfangen
  const arbeiter = async () => { while (!halt && next < liste.length) { try { await f(liste[next++]); } catch (e) { halt = true; throw e; } } };
  await Promise.all(Array.from({ length: Math.min(n, liste.length) }, arbeiter));
}

// ---------------------------------------------------------------- Senden
export function anClaude(opt = {}) {
  const blob = opt.blob;
  const laeuft = istBlob(blob) ? merk.laeuft.get(blob) : null;
  if (laeuft) return laeuft; // Doppeltipp: dieselbe Sendung, kein zweiter Satz
  const p = senden(opt).finally(() => { if (istBlob(blob)) merk.laeuft.delete(blob); });
  if (istBlob(blob)) merk.laeuft.set(blob, p);
  return p;
}

async function senden(opt, neuVersuch = false) {
  const { blob, name, notiz = '', stellen = [], onFortschritt, original = null, originalName, code: codeArg, signal, zusatz } = opt;
  let code = '', wachGesetzt = false, sigJetzt = '';
  // Fortschritt: vorbereiten 0–6 %, senden 6–97 %, prüfen 97–100 %
  const st = { schritt: '', gesamt: 0, basis: 0, unterwegs: new Map(), hash: 0, zuletzt: 0 };
  const melde = (schritt, text) => {
    const jetzt = Date.now(), wechsel = schritt !== st.schritt;
    if (!wechsel && schritt !== 'fertig' && jetzt - st.zuletzt < 100) return; // höchstens 10× pro Sekunde
    st.schritt = schritt; st.zuletzt = jetzt;
    let gesendet = st.basis; for (const v of st.unterwegs.values()) gesendet += v;
    gesendet = Math.min(gesendet, st.gesamt);
    const anteil = schritt === 'vorbereiten' ? 0.06 * st.hash : schritt === 'anmelden' ? 0.06 : schritt === 'fertig' ? 1
      : schritt === 'pruefen' ? 0.97 : 0.06 + 0.91 * (st.gesamt ? gesendet / st.gesamt : 0);
    const t = text || (schritt === 'vorbereiten' ? `Vorbereiten … ${Math.floor(st.hash * 100)} %`
      : schritt === 'anmelden' ? 'Verbindung zum Speicher …'
      : schritt === 'senden' ? `Sende ${mb(gesendet)} von ${mb(st.gesamt)}`
      : schritt === 'warten' ? 'Verbindung hakt – es geht von selbst weiter …'
      : schritt === 'pruefen' ? 'Prüfe, ob alles angekommen ist …' : 'Angekommen. Claude kann es jetzt abholen.');
    try { onFortschritt?.({ schritt, anteil: Math.min(1, Math.max(0, anteil)), gesendet, gesamt: st.gesamt, text: t }); } catch { /* Anzeige-Fehler stoppen das Senden nicht */ }
  };
  try {
    if (!istBlob(blob) || !blob.size) return fehler('eingabe', TEXT.leer);
    if (original != null && (!istBlob(original) || !original.size)) return fehler('eingabe', 'Das Original ist leer – bitte ohne Original senden.');
    code = String(codeArg || '').trim() || ls.get(LS_CODE);
    if (!code) return fehler('code', TEXT.codeFehlt);
    abbruch(signal);
    wach(true); wachGesetzt = true;

    const dateien = [{ blob, name: sauberName(name || blob.name, 'Gesang Werkstatt 3.wav'), rolle: 'bearbeitet' }];
    if (original) dateien.push({ blob: original, name: sauberName(originalName || original.name, 'Original.wav'), rolle: 'original' });
    st.gesamt = dateien.reduce((s, d) => s + d.blob.size, 0);

    // 1) Kopf lesen + Prüfsumme (stückweise, die Oberfläche bleibt flüssig)
    melde('vorbereiten');
    let fertigB = 0;
    for (const d of dateien) {
      d.kopf = await kopfLesen(d.blob, d.name);
      if (!endung(d.name) && d.kopf.format) d.name = sauberName(d.name.slice(0, 110) + '.' + d.kopf.format, d.name);
      d.sha = await pruefsumme(d.blob, (n) => { st.hash = (fertigB + n) / st.gesamt; melde('vorbereiten'); }, signal);
      fertigB += d.blob.size;
    }
    const notizT = String(notiz ?? '').trim().slice(0, 30000), stellenN = stellenListe(stellen);
    const sig = JSON.stringify([dateien.map((d) => [d.name, d.blob.size, d.sha, d.rolle]), notizT, stellenN, zusatz ?? null]);
    sigJetzt = sig;
    const schon = merk.fertig.get(sig);
    if (schon && !opt.nochmal) { melde('fertig'); return { ok: true, id: schon.id, dateien: schon.dateien, doppelt: true }; }

    // 2) Anmelden (oder angefangene Sendung fortsetzen)
    const ctx = { signal, melde };
    let auftrag = merk.auftrag.get(sig);
    if (auftrag && auftrag.code === code) auftrag.dateien.forEach((d, i) => { d.blob = dateien[i].blob; }); // gleicher Inhalt, evtl. neuer Blob
    else {
      melde('anmelden');
      const zeitpunkt = ortsZeit();
      const plan = dateien.map((d) => {
        const p = { name: d.name, groesse: d.blob.size, sha256: d.sha, teile: Math.max(1, Math.ceil(d.blob.size / TEIL)) };
        for (const k of ['format', 'kanaele', 'rate', 'bits', 'dauer_s', 'float']) if (d.kopf[k] != null) p[k] = d.kopf[k];
        if (p.format) p.format = String(p.format).slice(0, 40);
        const x = { quelle: QUELLE, rolle: d.rolle, zeitpunkt };
        if (d.rolle === 'original') x.original_von = dateien[0].name;
        if (G.location?.pathname) x.seite = String(G.location.pathname).slice(0, 200);
        Object.assign(p, x);
        feld(p, 'notiz', notizT);
        feld(p, 'stellen', stellenN);
        if (zusatz && typeof zusatz === 'object') for (const [k, v] of Object.entries(zusatz)) if (/^[a-z0-9_]{1,40}$/i.test(k) && !STANDARD.has(k) && !(k in p)) feld(p, k, v);
        return p;
      });
      const satzName = sauberName('Werkstatt 3 – ' + dateien[0].name.replace(/\.[a-z0-9]{1,8}$/i, ''), 'Werkstatt 3');
      const r = await rufe('ton-ticket', { code, satzName, dateien: plan }, ctx);
      const satzId = r.satzId || r.satz_id, liste = r.dateien || [];
      if (!satzId || liste.length !== dateien.length) throw new Fehler('server', TEXT.server + ' (Antwort unvollständig)');
      auftrag = { sig, code, satzId, bis: Date.now() + GUELTIG, dateien: dateien.map((d, i) => {
        const uploads = (liste[i].uploads || []).map(urlVon);
        if (uploads.length !== plan[i].teile || uploads.some((u) => !/^https:\/\//.test(u))) throw new Fehler('server', TEXT.server + ' (Antwort unvollständig)');
        return { blob: d.blob, name: d.name, rolle: d.rolle, nr: liste[i].nr ?? i + 1, teile: plan[i].teile, uploads, da: new Uint8Array(plan[i].teile), angekommen: false };
      }) };
      merkSetzen(merk.auftrag, sig, auftrag, 3);
      if (codeArg) codeMerken(code); // der Code stimmt: merken (geteilt mit der Ton-Post)
    }

    // 3) Hochladen: Datei für Datei, je 2 Teile gleichzeitig; danach zählt der Server nach
    const teilGr = (d, i) => Math.min(TEIL, d.blob.size - i * TEIL);
    st.basis = 0;
    for (const d of auftrag.dateien) for (let i = 0; i < d.teile; i++) if (d.angekommen || d.da[i]) st.basis += teilGr(d, i);
    melde('senden');
    for (const d of auftrag.dateien) {
      if (d.angekommen) continue;
      const hoch = (nummern) => parallel(nummern, GLEICHZEITIG, async (i) => {
        const key = d.nr + ':' + i;
        await teilHoch(auftrag, d, i, (n) => { st.unterwegs.set(key, n); melde('senden'); }, ctx);
        st.unterwegs.delete(key); st.basis += teilGr(d, i); melde('senden');
      });
      await hoch([...Array(d.teile).keys()].filter((i) => !d.da[i]));
      for (let runde = 0; ; runde++) {
        melde('pruefen');
        const r = await rufe('ton-fertig', { code, satzId: auftrag.satzId, nr: d.nr, teileDa: d.teile }, ctx);
        const fehlen = (Array.isArray(r.fehlen) ? r.fehlen : []).map((k) => k - 1).filter((x) => Number.isInteger(x) && x >= 0 && x < d.teile); // Server zählt ab 1
        if (r.angekommen === true && !fehlen.length) { d.angekommen = true; break; }
        if (runde >= 2) throw new Fehler('netz', TEXT.unvollstaendig);
        const nochmal = fehlen.length ? fehlen : [...Array(d.teile).keys()];
        for (const i of nochmal) if (d.da[i]) { d.da[i] = 0; st.basis -= teilGr(d, i); }
        melde('senden');
        await hoch(nochmal);
      }
    }
    const erg = { ok: true, id: auftrag.satzId, dateien: auftrag.dateien.map((d) => ({ nr: d.nr, name: d.name, rolle: d.rolle, bytes: d.blob.size })) };
    merk.auftrag.delete(sig);
    merkSetzen(merk.fertig, sig, { id: erg.id, dateien: erg.dateien }, 20);
    melde('fertig');
    return erg;
  } catch (e) {
    if (e instanceof Fehler && (e.art === 'weg' || e.art === 'code')) merk.auftrag.delete(sigJetzt);
    if (e instanceof Fehler && e.art === 'weg') {
      if (!neuVersuch) return senden(opt, true); // Satz im Speicher weg (oder durcheinander): einmal ganz neu anmelden
      e.art = 'server';
    }
    return fehlerAus(e, code);
  } finally {
    if (wachGesetzt) wach(false);
  }
}
