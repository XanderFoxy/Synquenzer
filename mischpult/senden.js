// Mischpult 0.2 – senden.js: „Messwerte an Claude senden“. Wird erst beim Tippen geladen (keine Ladezeit für den Rest).
// Gemessen wird im eigenen Worker (messwerte-worker.js → fingerabdruck.js), eine Spur nach der anderen; gesendet werden nur
// Messwerte (Lautstärke, Frequenzbänder, Zeitpunkte) – kein Ton – und nur nach ausdrücklichem Tipp auf „Jetzt senden“.
// Empfänger: eine einzige Einsende-Funktion (Supabase, öffentlicher Schlüssel). Lesen kann sie dort niemand über das Netz.
// Mitgeschickt wird nur eine zufällige Sitzungs-Kennung dieses Seitenaufrufs (nicht gespeichert), keine Gerätekennung.
import { S, A, C, $, $$, esc, ico, blatt, sag, wach, waehle, ACC } from './ui.js';

const ZIEL = 'https://dbdnsryoivvezspgydpx.supabase.co/rest/v1/rpc/mischpult_einsenden';
const SCHLUESSEL = 'sb_publishable_6utuy3es2447DjAQvxdrUQ_F-6fE5_M';   // öffentlicher Schlüssel: darf nur einsenden, nichts lesen
const VERSION = '0.2.0';
export const SATZ_TEXT = 'Gesendet werden Messwerte (Lautstärke, Frequenzbänder, Zeitpunkte), die Dateinamen und der Name dieses Satzes – kein Ton. Lesen können sie nur Claude und wer die Datenbank verwaltet.';
const SITZUNG = (() => { const b = new Uint8Array(12); crypto.getRandomValues(b); return 'm' + [...b].map((x) => x.toString(36).padStart(2, '0')).join('').slice(0, 20); })();
// Steuer-, Format-, Privat- und unsichtbare Zeichen (Bidi, Tag-Zeichen, Variations-Wähler, Füllzeichen); Server prüft dieselben Bereiche
const UNSICHTBAR = /[\p{Cc}\p{Cf}\p{Co}\p{Cs}\p{Cn}\p{Zl}\p{Zp}\u034F\u115F\u1160\u17B4\u17B5\u180B-\u180F\u2800\u3164\uFE00-\uFE0F\uFFA0\u{E0000}-\u{E0FFF}]/gu;
const sauber = (t, n) => String(t ?? '').replace(UNSICHTBAR, '').trim().slice(0, n).trim();
const warte = async (ms) => { for (const t = Date.now() + ms; Date.now() < t && !Z.stop;) await new Promise((r) => setTimeout(r, 100)); };   // endet sofort bei „Abbrechen“
const laufend = new Set();   // offene Versände (AbortController), „Abbrechen“ bricht sie sofort ab
export const KENNUNG = SITZUNG.slice(0, 9);   // kurze Kennung für Claude (Anfang der zufälligen Sitzungs-Kennung)

// ---------- Mess-Worker (eigener, damit der Rechen-Worker frei bleibt) ----------
let W = null, nr = 0; const offen = new Map();
function worker() {
  if (W) return W;
  W = new Worker(new URL('./messwerte-worker.js', import.meta.url), { type: 'module' });
  W.onmessage = (e) => {
    const m = e.data || {}, o = offen.get(m.id); if (!o) return;
    if (m.ok === undefined) { o.fort?.(m.anteil); return; }
    offen.delete(m.id); m.ok ? o.ok(m.ergebnis) : o.f(Object.assign(new Error(m.fehler || 'Fehler beim Messen'), { code: m.code }));
  };
  W.onerror = (e) => { const f = new Error('Das Messen ist ausgefallen' + (e.message ? ': ' + e.message : '')); for (const o of offen.values()) o.f(f); offen.clear(); W = null; };
  return W;
}
const messe = (file, kontext, fort) => new Promise((ok, f) => { const id = ++nr; offen.set(id, { ok, f, fort }); worker().postMessage({ id, file, kontext }); });

// ---------- Zustand ----------
const Z = { fuer: null, liste: [], laeuft: false, stop: false, satz: 'Song 1', kalib: false, hinweis: null, neuLaden: false, fertig: false };
function liste() {
  const s = S.sitzung; if (!s?._files?.length) return null;
  const l = s.spuren.map((sp, i) => ({ datei: sp.datei, file: s._files[sp._k ?? i], rolle: S.a?.rollen?.[sp.id] || sp.rolle || null, laengeS: sp.laenge_s || 0, art: 'spur' })).filter((x) => x.file);
  if (S.dein?.file) l.push({ datei: S.dein.file.name, file: S.dein.file, rolle: null, laengeS: S.dein.laenge_s || 0, art: 'summe' });
  return l.map((x) => ({ ...x, status: 'wartet', anteil: 0, fehler: null, id: null }));
}
const angekommen = () => Z.liste.filter((x) => x.status === 'ok').length;

// ---------- Blatt ----------
export function oeffne() {
  if (!Z.laeuft && Z.fuer !== S.sitzung) {   // neue Spuren: schon angekommene (gleicher Name, gleiche Größe) nicht noch einmal senden
    const da = new Set(Z.liste.filter((x) => x.status === 'ok').map((x) => x.datei + '|' + x.file.size)), l = liste() || [];
    for (const x of l) if (da.has(x.datei + '|' + x.file.size)) x.status = 'ok';
    Object.assign(Z, { fuer: S.sitzung, liste: l, fertig: l.some((x) => x.status === 'ok'), hinweis: null, neuLaden: false });
  }
  if (!Z.liste.length) { blatt(neuLadenHtml(true)); return; }
  blatt(`<h2>Messwerte an Claude senden</h2>
<p class="sicher">${ico('schloss')}<span>${esc(SATZ_TEXT)}</span></p>
<label class="feld"><span>Name für diesen Satz</span><input type="text" id="satzname" maxlength="64" value="${esc(Z.satz)}" autocomplete="off" spellcheck="false" enterkeyhint="done"></label>
<label class="schalter"><span>Test-Paket (Kalibrierung)<span class="klein2" style="display:block">Gleiche Messung, als Test markiert</span></span><input type="checkbox" id="sendkalib"${Z.kalib ? ' checked' : ''}></label>
<p class="klein2" id="sendinfo">${esc(info())}</p>
<div class="balken" id="sendbalken" role="progressbar" aria-label="Messen und Senden" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>
<p class="ruhig" id="sendzahl" aria-live="polite"></p>
<div id="sendunten"></div>
<ul class="dateien" id="sendliste" aria-label="Spuren">${Z.liste.map(zeile).join('')}</ul>`);
  zeichneUnten(); aktualisiere();
}
function info() {
  const min = Z.liste.reduce((s, x) => s + x.laengeS, 0) / 60, dauer = Math.max(1, Math.round(min * 2 / 60));
  return `${Z.liste.length} ${Z.liste.length === 1 ? 'Datei' : 'Dateien'} · Messen dauert etwa ${dauer} ${dauer === 1 ? 'Minute' : 'Minuten'} · je Spur ${(() => { const mb = min / Math.max(1, Z.liste.length) * 0.06; return mb < 0.1 ? 'unter 0,1 MB' : 'etwa ' + String(Math.round(mb * 10) / 10).replace('.', ',') + ' MB'; })()} Messwerte · deine Dateien werden nur gelesen.`;
}
const neuLadenHtml = (ganz) => `${ganz ? `<h2>Messwerte an Claude senden</h2><p class="sicher">${ico('schloss')}<span>${esc(SATZ_TEXT)}</span></p>` : ''}
<p class="hinweis">${ganz ? 'Die Spuren sind nach dem Neuladen nicht mehr da. ' : 'Die Spuren lassen sich nicht mehr lesen. '}Bitte die Spuren einmal neu laden – danach geht es hier weiter.</p>
<input type="file" id="sendwahl" class="sr-datei" multiple accept="${ACC}" data-c="sendwahl"><label for="sendwahl" class="knopf1">${ico('plus')}Spuren einmal neu laden</label>
${ganz ? '<button type="button" class="knopf2 breit" data-a="blattzu">Schließen</button>' : ''}`;
const STATUS = { wartet: 'wartet', misst: 'misst', sendet: 'sendet …', ok: 'angekommen', fehler: 'nicht angekommen' };
const zeile = (x, k) => `<li data-k="${k}"><span class="punkt" aria-hidden="true"></span><span>${esc(x.datei)}${x.art === 'summe' ? '<span class="klein2"> (Summe)</span>' : ''}</span><small></small></li>`;
function zeichneUnten() {
  const u = $('#sendunten'); if (!u) return;
  const n = angekommen(), m = Z.liste.length, fehl = Z.liste.filter((x) => x.status === 'fehler');
  let h = '';
  if (Z.hinweis) h += `<p class="hinweis">${esc(Z.hinweis)}</p>`;
  if (!Z.laeuft && fehl.length) { const g = [...new Set(fehl.map((x) => x.fehler).filter(Boolean))].slice(0, 3); if (g.length && !Z.hinweis) h += `<p class="hinweis">${g.map(esc).join('<br>')}</p>`; }
  if (Z.neuLaden && !Z.laeuft) h += neuLadenHtml(false);
  if (Z.laeuft) h += '<button type="button" class="knopf2 breit" data-a="sendstop">Abbrechen</button>';
  else if (Z.fertig && n === m) h += `<p class="hinweis gr">Alles angekommen. Claude kann jetzt mit den Messwerten von „${esc(Z.satz)}“ arbeiten.<br>Kennung für Claude: <b>${esc(KENNUNG)}</b></p><button type="button" class="knopf1" data-a="blattzu">${ico('haken')}Fertig</button><button type="button" class="knopf2 breit" data-a="sendneu">Noch einmal senden</button>`;
  else if (Z.fertig && fehl.length) h += `<button type="button" class="knopf1" data-a="sendlos">${ico('undo')}Wiederholen (${fehl.length})</button><button type="button" class="knopf2 breit" data-a="blattzu">Schließen</button>`;
  else h += `<button type="button" class="knopf1" data-a="sendlos">${ico('senden')}Jetzt senden</button><button type="button" class="knopf2 breit" data-a="blattzu">Schließen</button>`;
  u.innerHTML = h;
  for (const e of [$('#satzname'), $('#sendkalib')]) if (e) e.disabled = Z.laeuft;
}
function aktualisiere() {
  const ul = $('#sendliste'); if (!ul) return;
  Z.liste.forEach((x, k) => {
    const li = ul.children[k]; if (!li) return;
    li.firstChild.className = 'punkt' + (x.status === 'ok' ? ' gr' : x.status === 'fehler' || x.status === 'misst' || x.status === 'sendet' ? ' ge' : '');
    li.lastChild.textContent = x.status === 'misst' ? `misst … ${Math.round(x.anteil * 100)} %` : STATUS[x.status];
  });
  const m = Z.liste.length, n = angekommen(), teil = Z.liste.reduce((s, x) => s + (x.status === 'ok' || x.status === 'fehler' ? 1 : x.status === 'sendet' ? 0.9 : x.status === 'misst' ? 0.9 * x.anteil : 0), 0);
  const b = $('#sendbalken'); if (b) { const p = Math.round(100 * teil / Math.max(1, m)); b.firstChild.style.width = p + '%'; b.setAttribute('aria-valuenow', p); }
  const z = $('#sendzahl'); if (z) z.textContent = Z.laeuft || Z.fertig ? `${n} von ${m} angekommen` : '';
}

// ---------- Messen + Senden ----------
const ABGEBROCHEN = () => Object.assign(new Error('abgebrochen'), { abgebrochen: true });
async function sende(x, datenJson, art) {
  // datenJson ist schon im Mess-Worker zu Text gemacht (kein großes JSON.stringify im Haupt-Faden)
  const kopf = JSON.stringify({ p_sitzung: SITZUNG, p_satz: Z.satz, p_datei: sauber(x.datei, 120) || 'Spur', p_art: art, p_version: VERSION });
  const body = kopf.slice(0, -1) + ',"p_daten":' + datenJson + '}';
  for (let v = 0; ; v++) {
    if (Z.stop) throw ABGEBROCHEN();
    if (navigator.onLine === false) throw Object.assign(new Error('Keine Verbindung. Bitte später „Wiederholen“ tippen.'), { netz: true });
    const ab = new AbortController(), uhr = setTimeout(() => ab.abort(), 60000); let res;
    laufend.add(ab);
    try { res = await fetch(ZIEL, { method: 'POST', headers: { apikey: SCHLUESSEL, 'Content-Type': 'application/json', Accept: 'application/json' }, body, signal: ab.signal, cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer' }); }
    catch { clearTimeout(uhr); laufend.delete(ab); if (Z.stop) throw ABGEBROCHEN(); if (v < 2) { await warte(2000 * (v + 1)); continue; } throw Object.assign(new Error('Keine Verbindung. Bitte später „Wiederholen“ tippen.'), { netz: true }); }
    clearTimeout(uhr); laufend.delete(ab);
    if (res.ok) return await res.json().catch(() => null);
    let j = null; try { j = await res.json(); } catch { /* kein JSON */ }
    const msg = String(j?.message || '');
    if (/zu viele/.test(msg)) throw Object.assign(new Error('Gerade zu viele Sendungen. Bitte in einer Stunde „Wiederholen“ tippen.'), { zuViele: true });
    if ((res.status >= 500 || res.status === 429) && v < 2 && !Z.stop) { await warte(3000 * (v + 1)); continue; }
    if (Z.stop) throw ABGEBROCHEN();
    throw new Error(msg === 'zu gross' ? `„${x.datei}“ ergibt zu viele Messwerte für ein Paket.` : `Nicht angekommen (Fehler ${res.status}${msg ? ': ' + msg : ''}).`);
  }
}
function messeX(x, k, m) {
  x.status = 'misst'; x.anteil = 0; aktualisiere();
  const kontext = { nr: k + 1, von: m, rolle: x.rolle, art: x.art, tempoBpm: S.sitzung?.bpm ?? null, mischpult: VERSION };
  return messe(x.file, kontext, (a) => { x.anteil = a; aktualisiere(); }).then((d) => ({ ok: true, d }), (f) => ({ ok: false, f }));
}
async function los() {
  if (Z.laeuft) return;
  Z.satz = sauber($('#satzname')?.value, 64) || 'Song 1'; Z.kalib = !!$('#sendkalib')?.checked;
  const todo = Z.liste.filter((x) => x.status !== 'ok'); if (!todo.length) return;
  for (const x of todo) { x.status = 'wartet'; x.anteil = 0; x.fehler = null; }
  Object.assign(Z, { laeuft: true, stop: false, hinweis: null, neuLaden: false, fertig: false });
  if (navigator.onLine === false) { Z.hinweis = 'Keine Verbindung. Bitte später „Wiederholen“ tippen.'; for (const x of todo) { x.status = 'fehler'; x.fehler = Z.hinweis; } Z.laeuft = false; Z.fertig = true; zeichneUnten(); aktualisiere(); sag(Z.hinweis); return; }
  wach(true); zeichneUnten(); aktualisiere(); sag('Messen und Senden läuft.');
  const m = Z.liste.length, nrVon = (x) => Z.liste.indexOf(x);
  let naechste = messeX(todo[0], nrVon(todo[0]), m);
  for (let i = 0; i < todo.length; i++) {
    const x = todo[i], r = await naechste;
    naechste = null;
    if (Z.stop) { if (x.status !== 'ok') x.status = 'wartet'; break; }
    if (i + 1 < todo.length) naechste = messeX(todo[i + 1], nrVon(todo[i + 1]), m);   // nächste Spur messen, während diese gesendet wird
    if (!r.ok) {
      x.status = 'fehler';
      x.fehler = r.f.code === 'lesefehler' ? `„${x.datei}“ lässt sich nicht mehr lesen.` : r.f.code === 'kein-wav' ? `„${x.datei}“ ist keine WAV- oder AIFF-Datei.` : r.f.message;
      if (r.f.code === 'lesefehler') Z.neuLaden = true;
      aktualisiere(); continue;
    }
    x.status = 'sendet'; aktualisiere();
    try { x.id = await sende(x, r.d, Z.kalib ? 'kalibrierung' : x.art); x.status = 'ok'; }
    catch (f) {
      if (f.abgebrochen) { x.status = 'wartet'; aktualisiere(); break; }
      x.status = 'fehler'; x.fehler = f.message;
      if (f.zuViele || f.netz) {   // keine Verbindung / Drossel: nicht weiter messen, Rest bleibt für „Wiederholen“
        Z.stop = true; Z.hinweis = f.message; for (const id of offen.keys()) W?.postMessage({ abbrechen: id });
        for (const y of todo) if (y.status === 'wartet' || y.status === 'misst') { y.status = 'fehler'; y.fehler = f.message; }
      }
    }
    aktualisiere();
  }
  if (naechste) { for (const id of offen.keys()) W?.postMessage({ abbrechen: id }); await naechste; }
  for (const x of Z.liste) if (x.status === 'misst' || x.status === 'sendet') x.status = 'wartet';
  Z.laeuft = false; Z.fertig = true; wach(false);
  const n = angekommen(); zeichneUnten(); aktualisiere();
  sag(`${n} von ${m} angekommen.`);
}

A.sendlos = () => los();
A.sendstop = () => { Z.stop = true; for (const id of offen.keys()) W?.postMessage({ abbrechen: id }); for (const ab of laufend) ab.abort(); laufend.clear(); const b = $('[data-a=sendstop]'); if (b) { b.disabled = true; b.textContent = 'Wird angehalten …'; } };
A.sendneu = () => { for (const x of Z.liste) { x.status = 'wartet'; x.anteil = 0; x.fehler = null; } Z.fertig = false; Z.hinweis = null; zeichneUnten(); aktualisiere(); };
C.sendwahl = async (t) => {
  const fs = t.files ? [...t.files] : []; t.value = ''; if (!fs.length || Z.laeuft) return;
  await waehle(fs);
  if (S.sitzung?._files?.length) oeffne();
};
