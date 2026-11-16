// Ton-Post – ton.js: Dateien wählen, prüfen, in Teilen sicher hochladen, nach Abbruch fortsetzen.
// Keine Fremd-Skripte, kein Tracking. Prüfsumme und FLAC laufen im Worker (rechner.js), der Hauptfaden bleibt frei.
import { lesKopf, wohlStumm } from './kopf.js';
import { flacMoeglich } from './flac.js';

const API = 'https://dbdnsryoivvezspgydpx.supabase.co/functions/v1/';
const TEIL = 16 * 1024 * 1024;          // Teilgröße beim Hochladen (Grenze je Teil: 45 MB)
const GUELTIG = 110 * 60 * 1000;        // Upload-Adressen gelten 2 h – mit Puffer
const WARTEN_PLATZ = 5 * 60 * 1000;     // bei vollem Speicher alle 5 min neu fragen
const LS_CODE = 'ton-post-code', LS_STAND = 'ton-post-stand-1';
const $ = (id) => document.getElementById(id);

// ---------- Speicher im Browser (immer mit try/catch) ----------
const ls = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch { /* egal */ } },
};
let stand = (() => { try { const s = JSON.parse(ls.get(LS_STAND) || 'null'); if (s && s.v === 1 && s.dateien && s.sha) return s; } catch { /* neu */ } return { v: 1, sha: {}, dateien: {} }; })();
function merke() {
  const d = stand.dateien, jetzt = Date.now();
  for (const k of Object.keys(d)) if (!d[k].angekommen && d[k].bis < jetzt - 86400000) delete d[k];
  for (const obj of [stand.sha, d]) { const ks = Object.keys(obj); if (ks.length > 400) for (const k of ks.slice(0, ks.length - 400)) delete obj[k]; }
  ls.set(LS_STAND, JSON.stringify(stand));
}

// ---------- Hilfen ----------
const fmtZahl = (x, s = 1) => x.toLocaleString('de-DE', { maximumFractionDigits: s, minimumFractionDigits: 0 });
const groesse = (b) => b >= 1e9 ? fmtZahl(b / 1e9, 2) + ' GB' : b >= 1e6 ? fmtZahl(b / 1e6, b >= 1e8 ? 0 : 1) + ' MB' : fmtZahl(Math.max(b, 1) / 1e3, 0) + ' KB';
const dauer = (s) => { s = Math.round(s); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const restzeit = (s) => s < 60 ? 'noch ca. ' + Math.max(5, Math.round(s / 5) * 5) + ' Sek.' : s < 3600 ? 'noch ca. ' + Math.round(s / 60) + ' Min.' : 'noch ca. ' + Math.floor(s / 3600) + ' Std. ' + Math.round((s % 3600) / 60) + ' Min.';
const schluessel = (f) => `${f.name}|${f.size}|${f.lastModified}`;
const sag = (t) => { const l = $('live'); l.textContent = ''; setTimeout(() => { l.textContent = t; }, 30); };
let wecker = null; // vorzeitiges Ende einer Pause (online / sichtbar)
function pause(ms) { return new Promise((r) => { const t = setTimeout(fertig, ms); function fertig() { clearTimeout(t); if (wecker === fertig) wecker = null; r(); } wecker = fertig; }); }
addEventListener('online', () => wecker && wecker());
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { if (wecker) wecker(); if (laeuft) wach(true); } });
async function online() {
  while (navigator.onLine === false) { netzMeldung(true); await pause(15000); }
}

// ---------- Bildschirm wach halten ----------
let sperre = null;
async function wach(an) {
  try {
    if (an) { if (!sperre && navigator.wakeLock && document.visibilityState === 'visible') { sperre = await navigator.wakeLock.request('screen'); sperre.addEventListener?.('release', () => { sperre = null; }); } }
    else if (sperre) { const s = sperre; sperre = null; await s.release(); }
  } catch { sperre = null; }
}

// ---------- Worker ----------
let worker = null, wid = 0; const warte = new Map();
function rechner() {
  if (worker) return worker;
  worker = new Worker(new URL('rechner.js', import.meta.url), { type: 'module' });
  worker.onmessage = (e) => {
    const m = e.data, w = warte.get(m.id); if (!w) return;
    if (m.art === 'fort') { w.fort && w.fort(m.fertig); return; }
    warte.delete(m.id);
    if (m.art === 'fehler') w.nein(new Error(m.text)); else w.ja(m);
  };
  worker.onerror = (ev) => { ev.preventDefault?.(); for (const w of warte.values()) w.nein(new Error('worker')); warte.clear(); worker = null; };
  return worker;
}
function frage(msg, fort) {
  const id = msg.id || 'a' + (++wid);
  return new Promise((ja, nein) => { warte.set(id, { ja, nein, fort }); try { rechner().postMessage({ ...msg, id }); } catch (e) { warte.delete(id); nein(e); } });
}
async function pruefsumme(e, fort) {
  try { return (await frage({ art: 'hash', file: e.file }, fort)).sha256; }
  catch { // Notweg ohne Worker: kleine Stücke, zwischendurch Luft holen
    const { Sha256 } = await import('./sha256.js'); const h = new Sha256(), S = 1 << 20;
    for (let a = 0; a < e.file.size; a += S) { h.update(new Uint8Array(await e.file.slice(a, a + S).arrayBuffer())); fort(a + S); await new Promise((r) => setTimeout(r, 0)); }
    return h.hex();
  }
}

// ---------- Liste ----------
const liste = [];
let laeuft = false, platzTimer = 0;

function formatText(k, f) {
  if (!k) return '…';
  const endung = (f.name.split('.').pop() || '').toUpperCase().slice(0, 5);
  if (k.format === 'zip') return 'ZIP';
  if (k.format === '?') return endung || 'Datei';
  const kan = k.kanaele === 1 ? 'Mono' : k.kanaele === 2 ? 'Stereo' : k.kanaele + ' Kanäle';
  const name = { wav: 'WAV', aiff: 'AIFF', flac: 'FLAC' }[k.format];
  return [name, k.bits ? k.bits + ' Bit' + (k.float ? ' Float' : '') : '', k.rate ? fmtZahl(k.rate / 1000, 1) + ' kHz' : '', k.kanaele ? kan : ''].filter(Boolean).join(' · ');
}
function zeileBauen(e) {
  const li = document.createElement('li'); li.className = 'datei';
  li.innerHTML = '<span class="punkt" aria-hidden="true"></span><span class="d-name"></span><span class="d-info"></span>'
    + '<button type="button" class="weg" aria-label="Entfernen"><svg class="i" aria-hidden="true"><use href="#i-zu"/></svg></button>'
    + '<span class="d-warn" hidden></span><span class="d-bahn" hidden><i></i></span>';
  li.querySelector('.d-name').textContent = e.file.name;
  li.querySelector('.weg').setAttribute('aria-label', e.file.name + ' entfernen');
  li.querySelector('.weg').addEventListener('click', () => {
    if (laeuft) return;
    const i = liste.indexOf(e); if (i >= 0) liste.splice(i, 1);
    li.remove(); ansicht();
  });
  e.el = { li, punkt: li.querySelector('.punkt'), info: li.querySelector('.d-info'), warn: li.querySelector('.d-warn'), bahn: li.querySelector('.d-bahn'), balken: li.querySelector('.d-bahn i'), weg: li.querySelector('.weg') };
  $('liste').append(li);
  zeileInfo(e);
}
function zeileInfo(e) {
  const k = e.kopf, f = e.file, teile = [groesse(f.size)];
  if (k && k.dauer_s) teile.push(dauer(k.dauer_s));
  teile.push(formatText(k, f));
  let zus = '';
  if (e.zustand === 'da') zus = 'angekommen';
  else if (e.zustand === 'warten') zus = 'wartet auf Platz';
  else if (e.zustand === 'fehler') zus = 'nicht gesendet';
  e.el.info.textContent = teile.join(' · ') + (zus ? ' – ' + zus : '');
  let warn = '';
  if (!f.size) warn = 'Leere Datei – wird nicht gesendet.';
  else if (k && k.dauer_s && k.dauer_s < 2) warn = 'Sehr kurze Datei – kann trotzdem mit.';
  else if (e.stumm === true) warn = 'Vermutlich stumme Spur – kann trotzdem mit.';
  if (e.flac) warn = (warn ? warn + ' ' : '') + 'Wird verlustfrei verkleinert (FLAC).';
  e.el.warn.textContent = warn; e.el.warn.hidden = !warn;
  e.el.punkt.className = 'punkt' + (e.zustand === 'da' ? ' gr' : e.zustand === 'senden' ? ' ge' : e.zustand === 'fehler' ? ' ro' : '');
  e.el.li.classList.toggle('da', e.zustand === 'da');
}
function zeileFortschritt(e, anteil) {
  e.el.bahn.hidden = false;
  e.el.balken.style.width = (100 * Math.max(0, Math.min(1, anteil))).toFixed(1) + '%';
}

async function dazu(files) {
  const neu = [];
  for (const f of files) {
    const key = schluessel(f);
    if (liste.some((x) => x.key === key)) continue;
    const e = { file: f, key, kopf: null, stumm: null, zustand: 'neu', sha: stand.sha[key] || null, flac: null, auftrag: null };
    if (stand.dateien[key]?.angekommen) e.zustand = 'da';
    liste.push(e); neu.push(e); zeileBauen(e);
  }
  if ($('fertig').hidden === false) { $('fertig').hidden = true; }
  ansicht();
  if (neu.length) sag(neu.length === 1 ? '1 Datei gewählt' : neu.length + ' Dateien gewählt');
  let kette = Promise.resolve();
  for (const e of neu) {
    // Kopf nacheinander lesen; „Senden“ wartet darauf (e.kopfP)
    e.kopfP = kette = kette.then(async () => {
      try { e.kopf = await lesKopf(e.file); } catch { e.kopf = { format: '?' }; }
      try { e.stumm = await wohlStumm(e.file, e.kopf); } catch { e.stumm = null; }
      if (e.el) zeileInfo(e);
    });
  }
  await kette;
  ansicht();
}

function ansicht() {
  const n = liste.length, sum = liste.reduce((s, e) => s + e.file.size, 0);
  const fertig = !$('fertig').hidden;
  $('wahlTeil').hidden = n > 0 || fertig;
  $('senden').hidden = n === 0 || fertig || laeuft;
  $('mehrTeil').hidden = n === 0 || laeuft || fertig;
  $('summe').hidden = n === 0;
  $('summeText').textContent = n === 1 ? '1 Datei' : n + ' Dateien';
  $('summeGr').textContent = groesse(sum);
  $('senden').disabled = laeuft || !liste.some((e) => e.zustand !== 'da' && e.file.size > 0);
  $('sendenText').textContent = laeuft ? 'Wird gesendet …' : liste.some((e) => e.zustand === 'fehler') ? 'Nochmal senden' : 'Senden';
  for (const e of liste) if (e.el) e.el.weg.hidden = laeuft || fertig;
  $('name').disabled = laeuft; $('code').disabled = laeuft;
  $('wachText').hidden = fertig;
  if (!laeuft) $('gesamt').hidden = true;
  fussHoehe();
}
// Höhe der festen Leiste unten merken: die gerade gesendete Zeile wird nie von ihr verdeckt
let aktiveZeile = null;
function fussHoehe() {
  try {
    document.documentElement.style.setProperty('--fuss', $('fuss').offsetHeight + 'px');
    if (laeuft && aktiveZeile) aktiveZeile.scrollIntoView({ block: 'nearest' });
  } catch { /* egal */ }
}
addEventListener('resize', fussHoehe);

// ---------- Meldungen ----------
function meldung(text, art = '') {
  const m = $('meldung');
  if (!text) { m.hidden = true; fussHoehe(); return; }
  m.className = 'hinweis' + (art ? ' ' + art : ''); m.textContent = text; m.hidden = false; sag(text); fussHoehe();
}
let netzZeigt = false;
function netzMeldung(an) {
  if (an && !netzZeigt) { netzZeigt = true; meldung('Keine Verbindung. Es geht von selbst weiter, sobald das Netz wieder da ist.'); }
  else if (!an && netzZeigt) { netzZeigt = false; meldung(''); }
}

// ---------- Code ----------
function codeWert() { return ($('code').value || '').trim() || ls.get(LS_CODE) || ''; }
function codeAnsicht() {
  const da = !!ls.get(LS_CODE);
  $('codeTeil').hidden = da; $('codeDa').hidden = !da;
}
$('codeNeu').addEventListener('click', () => { ls.del(LS_CODE); $('code').value = ''; codeAnsicht(); $('code').focus(); });
$('code').addEventListener('input', () => $('code').classList.remove('falsch'));
$('name').value = stand.name || 'Song 1';
$('name').addEventListener('input', () => { stand.name = $('name').value; merke(); });

// ---------- Netz ----------
class CodeFalsch extends Error {}
class Gedrosselt extends Error {}
class Abgelaufen extends Error {}

async function rufe(fn, daten) {
  let versuch = 0;
  for (;;) {
    await online();
    let r, text = '';
    try {
      // text/plain = „einfache Anfrage“: kein Vorab-Check (CORS-Preflight) nötig, eine Runde weniger übers Netz
      r = await fetch(API + fn, { method: 'POST', headers: { 'content-type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(daten), cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer' });
      text = await r.text();
    } catch {
      versuch++; netzMeldung(true); await pause(Math.min(30000, 1500 * 2 ** Math.min(versuch, 4))); continue;
    }
    netzMeldung(false);
    let j = null; try { j = JSON.parse(text); } catch { /* kein JSON */ }
    if (r.ok) return j || {};
    const was = String((j && (j.fehler || j.error || j.code_fehler)) || '').toLowerCase();
    if (was === 'code' || (!was && (r.status === 401 || r.status === 403))) throw new CodeFalsch();
    if (r.status === 429 || /drossel|zu ?viele|rate/.test(was)) throw new Gedrosselt();
    if (r.status === 413 || r.status === 507 || /platz|speicher|quota|voll|gross|groß/.test(was)) return { platzFehlt: true, frei: zahl(j && (j.frei ?? j.frei_bytes ?? j.freiBytes)) }; // eigener Name: Erfolgsantworten tragen „platz“ als Info
    if (r.status >= 500 && versuch < 5) { versuch++; await pause(2000 * versuch); continue; }
    const f = new Error('server-' + r.status); f.antwort = j; throw f;
  }
}
const zahl = (x) => (typeof x === 'number' && isFinite(x)) ? x : (typeof x === 'string' && /^\d+$/.test(x) ? Number(x) : null);

function put(url, body, fort) {
  return new Promise((fertig) => {
    const x = new XMLHttpRequest(); let letzte = Date.now(), aus = false;
    const ende = (r) => { if (aus) return; aus = true; clearInterval(wache); fertig(r); };
    const wache = setInterval(() => { if (Date.now() - letzte > 60000) { try { x.abort(); } catch { /* egal */ } ende({ netz: true, status: 0 }); } }, 5000);
    x.open('PUT', url);
    x.setRequestHeader('content-type', 'application/octet-stream');
    x.upload.onprogress = (ev) => { letzte = Date.now(); fort(ev.loaded); };
    x.onload = () => ende({ ok: x.status >= 200 && x.status < 300, status: x.status, text: String(x.responseText || '').slice(0, 400) });
    x.onerror = x.onabort = x.ontimeout = () => ende({ netz: true, status: 0 });
    try { x.send(body); } catch { ende({ netz: true, status: 0 }); }
  });
}
async function putSicher(url, body, fort) {
  let versuch = 0, hart = 0;
  for (;;) {
    await online();
    const r = await put(url, body, fort);
    if (r.ok) { netzMeldung(false); return; }
    if (r.status === 409 || /already exists|duplicate/i.test(r.text || '')) { netzMeldung(false); return; } // Teil liegt schon da
    if ((r.status === 400 || r.status === 401 || r.status === 403) && /exp|jwt|token|signature|unauthori/i.test(r.text || '')) throw new Abgelaufen();
    if (r.netz) netzMeldung(true);
    else if (r.status >= 400 && r.status < 500 && r.status !== 408 && r.status !== 429 && ++hart > 3) throw new Error('hochladen-' + r.status);
    fort(0);
    versuch++; await pause(Math.min(30000, 1500 * 2 ** Math.min(versuch, 4)));
  }
}

// ---------- Fortschritt gesamt ----------
const lauf = { gesamt: 0, basis: 0, jetzt: 0, proben: [] };
function gesamtZeigen(schritt) {
  $('gesamt').hidden = false;
  const fertigB = lauf.basis + lauf.jetzt, ant = lauf.gesamt ? fertigB / lauf.gesamt : 0;
  $('gBalken').style.width = (100 * Math.min(1, ant)).toFixed(1) + '%';
  $('gText').textContent = schritt === 'senden' ? `${groesse(fertigB)} von ${groesse(lauf.gesamt)}` : Math.floor(100 * ant) + ' %';
  const t = performance.now(); lauf.proben.push([t, fertigB]);
  while (lauf.proben.length > 2 && t - lauf.proben[0][0] > 20000) lauf.proben.shift();
  const [t0, b0] = lauf.proben[0], rate = (fertigB - b0) / Math.max(1, (t - t0) / 1000);
  $('gZeit').textContent = schritt === 'senden' && t - t0 > 3000 && rate > 0 ? restzeit((lauf.gesamt - fertigB) / rate) : '';
}
function laufStart(gesamt) { lauf.gesamt = gesamt; lauf.basis = 0; lauf.jetzt = 0; lauf.proben = []; }

// ---------- Senden ----------
function planFuer(e) {
  const k = e.kopf || {};
  const gr = e.flac ? e.flac.groesse : e.file.size; // was wirklich hochgeht
  const d = { name: (e.flac ? e.file.name + '.flac' : e.file.name).slice(-120), groesse: e.file.size, sha256: e.sha,
    format: e.flac ? 'flac' : (k.format === '?' ? (e.file.name.split('.').pop() || 'datei').toLowerCase().slice(0, 8) : k.format),
    teile: Math.max(1, Math.ceil(gr / TEIL)) };
  if (k.kanaele) d.kanaele = k.kanaele; if (k.rate >= 1000) d.rate = k.rate; if (k.bits) d.bits = k.bits; if (k.dauer_s) d.dauer_s = k.dauer_s;
  // FLAC: groesse/sha256 = Original-WAV, upload_groesse = FLAC, pcm_sha256 = Prüfsumme der dekodierten PCM-Daten
  if (e.flac) Object.assign(d, { upload_groesse: gr, pcm_sha256: e.flac.sha256_pcm, original_format: 'wav' });
  if (k.float) d.float = true;
  return d;
}
function urlVon(u) { return typeof u === 'string' ? u : (u && (u.signedUrl || u.signedURL || u.url)) || ''; }

async function holeTickets(code, dateien) {
  const name = (($('name').value || '').trim() || 'Song').slice(0, 80);
  let r = await rufe('ton-ticket', { code, satzName: name, dateien: dateien.map(planFuer) });
  if (r.platzFehlt) {
    // 1) verlustfrei verkleinern, wo es geht (nur Integer-PCM; 32 Bit Float bleibt Original)
    const flacbar = dateien.filter((e) => !e.flac && flacMoeglich(e.kopf));
    if (flacbar.length) {
      laufStart(flacbar.reduce((s, e) => s + e.file.size, 0));
      let i = 0;
      for (const e of flacbar) {
        i++; $('gSchritt').textContent = `Speicher ist knapp – mache Dateien verlustfrei kleiner (${i} von ${flacbar.length}) …`;
        const m = await frage({ art: 'flac-mass', file: e.file, kopf: e.kopf }, (n) => { lauf.jetzt = n; gesamtZeigen('vorbereiten'); });
        lauf.basis += e.file.size; lauf.jetzt = 0;
        if (m.groesse < e.file.size) { e.flac = { groesse: m.groesse, sha256_pcm: m.sha256_pcm }; zeileInfo(e); }
      }
      r = await rufe('ton-ticket', { code, satzName: name, dateien: dateien.map(planFuer) });
    }
    // 2) was jetzt nicht passt, wartet auf Platz
    if (r.platzFehlt) {
      const jetzt = []; let summe = 0;
      for (const e of dateien) {
        const g = e.flac ? e.flac.groesse : e.file.size;
        if (r.frei != null && summe + g <= r.frei * 0.98) { jetzt.push(e); summe += g; } else { e.zustand = 'warten'; zeileInfo(e); }
      }
      if (!jetzt.length) return;
      r = await rufe('ton-ticket', { code, satzName: name, dateien: jetzt.map(planFuer) });
      if (r.platzFehlt) { for (const e of jetzt) { e.zustand = 'warten'; zeileInfo(e); } return; }
      dateien = jetzt;
    }
  }
  const satzId = r.satzId || r.satz_id, liste2 = r.dateien || [];
  if (!satzId || liste2.length !== dateien.length) throw new Error('ticket-antwort');
  dateien.forEach((e, i) => {
    const d = liste2[i], p = planFuer(e), uploads = (d.uploads || []).map(urlVon);
    if (uploads.length !== p.teile || uploads.some((u) => !/^https:\/\//.test(u))) throw new Error('ticket-antwort');
    stand.dateien[e.key] = { satzId, nr: d.nr ?? i + 1, uploads, da: '0'.repeat(p.teile), teile: p.teile, groesse: p.upload_groesse ?? p.groesse, flac: !!e.flac, bis: Date.now() + GUELTIG, angekommen: false };
    e.auftrag = stand.dateien[e.key];
    if (e.zustand === 'warten') e.zustand = 'neu';
  });
  merke();
}

// Upload-Adressen abgelaufen (nach 2 h): frische Adressen für denselben Satz holen – Angekommenes bleibt.
async function erneuern(code, dateien) {
  const saetze = new Map();
  for (const e of dateien) { const s = saetze.get(e.auftrag.satzId) || []; s.push(e); saetze.set(e.auftrag.satzId, s); }
  for (const [satzId, es] of saetze) {
    let r = null;
    try { r = await rufe('ton-ticket', { code, satzId, erneuern: true, nr: es.map((e) => e.auftrag.nr) }); } catch (err) { if (err instanceof CodeFalsch) throw err; }
    for (const e of es) {
      const d = r && Array.isArray(r.dateien) ? r.dateien.find((x) => x.nr === e.auftrag.nr) : null;
      const uploads = d ? (d.uploads || []).map(urlVon) : [];
      if (d && uploads.length === e.auftrag.teile) { e.auftrag.uploads = uploads; e.auftrag.bis = Date.now() + GUELTIG; }
      else { delete stand.dateien[e.key]; e.auftrag = null; e.zustand = 'neu'; } // ganz neu anfangen
    }
  }
  merke();
}

async function teilDaten(e, i) {
  const a = e.auftrag;
  if (!a.flac) return e.file.slice(i * TEIL, Math.min(e.file.size, (i + 1) * TEIL));
  const m = await frage({ art: 'flac-teil', id: 'flac:' + e.key, file: e.file, kopf: e.kopf, nr: i, teilGroesse: TEIL });
  return m.teil;
}

async function hochladen(code, e) {
  const a = e.auftrag; e.zustand = 'senden'; zeileInfo(e);
  aktiveZeile = e.el.li; fussHoehe();
  const teilGr = (i) => Math.min(TEIL, a.groesse - i * TEIL);
  let fertigB = 0; for (let i = 0; i < a.teile; i++) if (a.da[i] === '1') fertigB += teilGr(i);
  zeileFortschritt(e, fertigB / a.groesse);
  for (let i = 0; i < a.teile; i++) {
    if (a.da[i] === '1') continue;
    const body = await teilDaten(e, i);
    await putSicher(a.uploads[i], body, (n) => { lauf.jetzt = n; zeileFortschritt(e, (fertigB + n) / a.groesse); gesamtZeigen('senden'); });
    a.da = a.da.slice(0, i) + '1' + a.da.slice(i + 1); merke();
    fertigB += teilGr(i); lauf.basis += teilGr(i); lauf.jetzt = 0; gesamtZeigen('senden');
  }
  for (let runde = 0; runde < 3; runde++) {
    const r = await rufe('ton-fertig', { code, satzId: a.satzId, nr: a.nr, teileDa: a.teile });
    const fehlt = (Array.isArray(r.fehlen) ? r.fehlen : []).map((k) => k - 1).filter((x) => Number.isInteger(x) && x >= 0 && x < a.teile); // Server zählt Teile ab 1
    if (r.angekommen !== false && !fehlt.length) { a.angekommen = true; merke(); e.zustand = 'da'; zeileInfo(e); zeileFortschritt(e, 1); return; }
    // Teile fehlen im Speicher: nur diese nochmal
    for (const i of fehlt.length ? fehlt : [...Array(a.teile).keys()]) {
      const body = await teilDaten(e, i);
      await putSicher(a.uploads[i], body, () => {});
    }
  }
  throw new Error('fertig-melden');
}

async function senden() {
  if (laeuft) return;
  const code = codeWert();
  if (!code) { $('codeTeil').hidden = false; $('codeDa').hidden = true; $('code').classList.add('falsch'); $('code').focus(); meldung('Bitte zuerst den Code eintippen.', 'rot'); return; }
  clearTimeout(platzTimer);
  laeuft = true; meldung(''); ansicht(); wach(true);
  const offen = () => liste.filter((e) => e.zustand !== 'da' && e.file.size > 0);
  try {
    await Promise.all(liste.map((e) => e.kopfP)); // Dateiköpfe sind gelesen
    // 1) Prüfsummen (stückweise im Worker)
    const ohneSha = offen().filter((e) => !e.sha);
    if (ohneSha.length) {
      laufStart(ohneSha.reduce((s, e) => s + e.file.size, 0)); let i = 0;
      for (const e of ohneSha) {
        i++; $('gSchritt').textContent = `Vorbereiten: Datei ${i} von ${ohneSha.length} wird geprüft …`;
        e.sha = await pruefsumme(e, (n) => { lauf.jetzt = Math.min(n, e.file.size); gesamtZeigen('vorbereiten'); });
        stand.sha[e.key] = e.sha; lauf.basis += e.file.size; lauf.jetzt = 0;
      }
      merke();
    }
    for (let runde = 0; runde < 3; runde++) {
      // 2) Aufträge: angefangene fortsetzen (abgelaufene Adressen erneuern), sonst neue Upload-Adressen holen
      const alt = [];
      for (const e of offen()) {
        const st = stand.dateien[e.key];
        if (st && !st.angekommen && st.uploads?.length === st.teile) {
          e.auftrag = st; if (st.flac && !e.flac) e.flac = { groesse: st.groesse };
          if (st.bis <= Date.now()) alt.push(e);
        } else e.auftrag = null;
      }
      if (alt.length) await erneuern(code, alt);
      const ohne = offen().filter((e) => !e.auftrag);
      if (ohne.length) { $('gSchritt').textContent = 'Verbindung zu deinem Speicher …'; await holeTickets(code, ohne); }
      if (!ls.get(LS_CODE)) { ls.set(LS_CODE, code); codeAnsicht(); }
      // 3) Hochladen, Datei für Datei, Teil für Teil
      const los = offen().filter((e) => e.auftrag);
      laufStart(los.reduce((s, e) => s + e.auftrag.groesse, 0));
      for (const e of los) for (let i = 0; i < e.auftrag.teile; i++) if (e.auftrag.da[i] === '1') lauf.basis += Math.min(TEIL, e.auftrag.groesse - i * TEIL);
      let n = 0;
      try {
        for (const e of los) {
          n++; $('gSchritt').textContent = `Datei ${n} von ${los.length}: ${e.file.name}`;
          await hochladen(code, e);
        }
        break;
      } catch (err) {
        if (!(err instanceof Abgelaufen)) throw err;
        await erneuern(code, offen().filter((e) => e.auftrag && !e.auftrag.angekommen));
      }
    }
    if (offen().some((e) => e.zustand !== 'warten')) throw new Error('unvollstaendig');
    abschluss();
  } catch (err) {
    for (const e of liste) if (e.zustand === 'senden') { e.zustand = 'neu'; zeileInfo(e); }
    if (err instanceof CodeFalsch) {
      ls.del(LS_CODE); codeAnsicht(); $('code').classList.add('falsch');
      meldung('Der Code stimmt nicht. Bitte nochmal eintippen und dann auf Senden tippen.', 'rot');
      setTimeout(() => $('code').focus(), 50);
    } else if (err instanceof Gedrosselt) {
      meldung('Gerade zu viele Versuche hintereinander. Bitte in einer Stunde nochmal auf Senden tippen – Angekommenes wird übersprungen.', 'rot');
    } else {
      for (const e of offen()) if (e.zustand !== 'warten') { e.zustand = 'fehler'; zeileInfo(e); }
      meldung('Das hat nicht geklappt. Tipp nochmal auf „Nochmal senden“ – Angekommenes wird übersprungen.', 'rot');
    }
    $('gesamt').hidden = true;
  } finally {
    laeuft = false; wach(false); ansicht();
  }
}

function abschluss() {
  const da = liste.filter((e) => e.zustand === 'da').length, wartet = liste.filter((e) => e.zustand === 'warten').length;
  $('gesamt').hidden = true; meldung('');
  $('fText').textContent = `Fertig – ${da} ${da === 1 ? 'Datei' : 'Dateien'} angekommen`;
  $('fRest').hidden = !wartet;
  if (wartet) {
    $('fText').textContent = da ? `${da} ${da === 1 ? 'Datei' : 'Dateien'} angekommen` : 'Speicher ist gerade voll';
    $('fRest').textContent = `${wartet} ${wartet === 1 ? 'Datei wartet' : 'Dateien warten'} noch: Der Speicher ist gerade voll. Sobald Claude abgeholt hat, geht es von selbst weiter – Seite dafür offen lassen. Oder später dieselben Dateien wählen; Angekommenes wird übersprungen.`;
    platzTimer = setTimeout(nochmalPlatz, WARTEN_PLATZ);
  }
  $('fertig').hidden = false; ansicht();
  sag($('fText').textContent);
  $('fertig').focus({ preventScroll: true }); $('fertig').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
function nochmalPlatz() {
  if (!liste.some((e) => e.zustand === 'warten')) return;
  if (document.visibilityState !== 'visible' || laeuft) { platzTimer = setTimeout(nochmalPlatz, WARTEN_PLATZ); return; }
  $('fertig').hidden = true; ansicht(); senden();
}

// ---------- Bedienung ----------
for (const id of ['wahl', 'mehr']) $(id).addEventListener('change', (ev) => { const f = [...(ev.target.files || [])]; ev.target.value = ''; if (f.length) dazu(f); });
$('senden').addEventListener('click', () => senden());
$('code').addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); $('name').focus(); } });
$('name').addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); ev.target.blur(); } });
$('neu').addEventListener('click', () => {
  clearTimeout(platzTimer);
  for (const e of liste.splice(0)) e.el?.li.remove();
  const m = /^(.*?)(\d+)\s*$/.exec($('name').value || '');
  $('name').value = m ? m[1] + (Number(m[2]) + 1) : 'Song 1'; stand.name = $('name').value; merke();
  $('fertig').hidden = true; meldung(''); ansicht();
});
addEventListener('beforeunload', (ev) => { if (laeuft) { ev.preventDefault(); ev.returnValue = ''; } });

codeAnsicht(); ansicht();
if (Object.values(stand.dateien).some((d) => !d.angekommen && d.bis > Date.now() && d.da && d.da.includes('1')))
  meldung('Ein Senden wurde unterbrochen. Wähle dieselben Dateien nochmal und tippe auf Senden – es geht dort weiter, wo es aufgehört hat.');
// Testzugang (nur lesend): Zustand für die automatischen Prüfungen
globalThis.__tonPost = { liste, stand: () => stand, TEIL };
