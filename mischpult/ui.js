// Mischpult 0.2 – Oberfläche. Eigene Umsetzung, kein Build. Kern lazy (Schnittstelle: Kopf von kern-mock.js). Kein Ton verlässt das Gerät;
// nur „Messwerte an Claude senden“ (senden.js, erst beim Tippen geladen) schickt Messwerte – nach ausdrücklichem Tipp.
export const V = '0.2.0';
const KERN = './kern.js';   // Fassade zum Rechen-Worker (Schnittstelle wie im Kopf von test/kern-mock.js)
export const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app'), live = $('#live'), START = app.innerHTML;
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => '&#' + c.charCodeAt(0) + ';');
export const zahl = (x, d = 1, plus = false) => x == null || !isFinite(x) ? '–' : (x < 0 && Math.abs(x).toFixed(d) != 0 ? '−' : plus && x > 0 ? '+' : '') + Math.abs(x).toFixed(d).replace('.', ',');
export const ico = (n) => `<svg class="i" aria-hidden="true"><use href="#i-${n}"/></svg>`;
export const dauer = (s) => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
export const groesse = (b) => b >= 1e6 ? zahl(b / 1e6, 1) + ' MB' : Math.max(1, Math.ceil(b / 1e3)) + ' KB';
export const klon = (o) => JSON.parse(JSON.stringify(o));
export function sag(t) { live.textContent = ''; setTimeout(() => { live.textContent = t; }, 40); }
let kp; export const kern = () => (kp ||= import(KERN));
export const ROLLEN = [['kick', 'Kick'], ['snare', 'Snare/Clap'], ['hats', 'Hi-Hats/Perkussion'], ['bass', 'Bass'], ['drumbus', 'Drums (alle zusammen)'], ['lead', 'Lead/Sequenz'], ['pad', 'Fläche'], ['vocal', 'Gesang'], ['chor', 'Chor'], ['fx', 'Effekte'], ['sonstiges', 'Sonstiges']];
export const rolleName = (r) => (ROLLEN.find((x) => x[0] === r) || [0, 'Sonstiges'])[1];
export const ZIELE = [['streaming', 'Streaming (−14)'], ['laut', 'Laut']], EINGRIFF = [['sanft', 'sanft'], ['mittel', 'mittel'], ['kraeftig', 'kräftig']];
export const ZW = { streaming: { lufs: -14, tp: -1 }, laut: { lufs: -9, tp: -2 } };
const KURVEN = [['synthpop', 'Pop / Synth-Pop'], ['elektronisch', 'Elektronisch'], ['ballade', 'Ballade']];
export const VIDEO = 'Im Videoschnitt: Lautstärke des Songs nicht anheben. Zeigt die App trotzdem Rot, den Clip ein kleines Stück leiser stellen. Gelb an den lautesten Stellen ist normal.';
const LAUT_SATZ = 'Die meisten Streaming-Dienste drehen lautere Songs auf etwa −14 zurück. Lauter bringt dort nichts, kostet aber Wucht.';
export const ACC = '.wav,.wave,.aif,.aiff,audio/wav,audio/x-wav,audio/aiff,audio/x-aiff';   // nur, was das Mischpult lesen kann
// a = Auswahl (rückgängig machbar)
export const S = { sitzung: null, erg: null, a: null, anfang: null, verlauf: [], abh: null, dein: null, stellung: 'nachher', solo: null, stumm: new Set(), pos: 0, job: null, gespeichert: null, songId: null, zeige: null, zurueck: null, songs: {}, album: null };
export const A = {}, C = {}, SEG = {};

// ---------- IndexedDB „mischpult“ v1 (KONZEPT B.3), nie Audio ----------
let dbp;
const db = () => (dbp ||= new Promise((ok, f) => {
  const r = indexedDB.open('mischpult', 1);
  r.onupgradeneeded = () => { for (const [n, k] of [['songs', 'id'], ['alben', 'id'], ['einstellungen', 'key']]) if (!r.result.objectStoreNames.contains(n)) r.result.createObjectStore(n, { keyPath: k }); };
  r.onsuccess = () => ok(r.result); r.onerror = () => f(r.error);
}));
export async function idb(store, art, wert) {
  try {
    const d = await db();
    return await new Promise((ok, f) => {
      const t = d.transaction(store, art === 'get' || art === 'alle' ? 'readonly' : 'readwrite').objectStore(store);
      const r = art === 'get' ? t.get(wert) : art === 'alle' ? t.getAll() : art === 'weg' ? t.delete(wert) : art === 'leeren' ? t.clear() : t.put(wert);
      r.onsuccess = () => ok(r.result); r.onerror = () => f(r.error);
    });
  } catch { return null; }
}
const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0; return h.toString(36); };
let merkT;
const merke = () => { clearTimeout(merkT); merkT = setTimeout(schreibe, 250); };
async function schreibe() {
  clearTimeout(merkT);
  {
    if (!S.songId || !S.sitzung) return;
    const alt = (await idb('songs', 'get', S.songId)) || {};
    await idb('songs', 'put', { ...alt, id: S.songId, name: S.sitzung.song, geaendert: Date.now(), erstellt: alt.erstellt || Date.now(),
      dateien: S.sitzung.spuren.map((sp) => ({ name: sp.datei, groesse: sp.groesse, rolle: S.a.rollen[sp.id], hauptsache: S.a.haupt.includes(sp.id), solassen: S.a.lassen.includes(sp.id) })),
      auswahl: S.a, anfang: S.anfang, verlauf: S.verlauf, merkmale: S.erg?.merkmale ?? alt.merkmale ?? null });
    await idb('einstellungen', 'put', { key: 'letzter', song: S.songId, name: S.sitzung.song });
  }
}

// ---------- Bausteine ----------
export function seite({ titel, schritt, zurueck, mehr, inhalt = '', fuss = '', breit = false }) {
  S.zurueck = zurueck || null;
  app.className = breit ? 'breit' : '';
  app.innerHTML = `<header class="kopf">${zurueck ? `<button type="button" class="knopf2 klein" data-a="zurueck">${ico('zurueck')}Zurück</button>` : '<span></span>'}${schritt ? `<p class="schritte" aria-label="Schritt ${schritt} von 5">${[1, 2, 3, 4, 5].map((i) => `<i class="${i < schritt ? 'f' : i === schritt ? 'a' : ''}"></i>`).join('')}<span aria-hidden="true">${schritt} von 5</span></p>` : '<span></span>'}${mehr ? `<button type="button" class="knopf2 klein" data-a="mehr" aria-label="Mehr Einstellungen">${ico('mehr')}</button>` : '<span></span>'}</header><h1 tabindex="-1">${titel}</h1>${inhalt}${fuss ? `<div class="fuss">${fuss}</div>` : ''}`;
  scrollTo(0, 0);
  $('h1', app).focus({ preventScroll: true });
}
export const seg = (name, opts, wert, label) => `<div class="seg" role="radiogroup" aria-label="${esc(label)}" data-seg="${name}">${opts.map(([k, t]) => `<button type="button" role="radio" aria-checked="${k === wert}" tabindex="${k === wert ? 0 : -1}" data-v="${k}">${t}</button>`).join('')}</div>`;
function setzeSeg(g, v) { for (const b of $$('[role=radio]', g)) { const an = b.dataset.v === v; b.setAttribute('aria-checked', an); b.tabIndex = an ? 0 : -1; } }
export const balken = (label) => `<div class="balken" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>`;
export function setzeBalken(a) { const b = $('.balken', app); if (!b) return; const p = Math.round(Math.max(0, Math.min(1, a)) * 100); b.firstChild.style.width = p + '%'; b.setAttribute('aria-valuenow', p); }
export const ampelHtml = (liste) => liste.map((x) => `<p><span class="punkt ${x.farbe === 'gruen' ? 'gr' : 'ge'}" aria-hidden="true"></span><span><span class="sr">${x.farbe === 'gruen' ? 'passt: ' : 'Hinweis: '}</span>${esc(x.satz)}</span></p>`).join('');
const hinweise = (l) => l.map((h) => `<p class="hinweis">${esc(h.satz)}</p>`).join('');
const wert = (t, w, f) => `<div class="wert"><small>${t}</small><b>${w}</b><small>${f}</small></div>`;
let blattEl;
export function blatt(html) {
  if (!blattEl) {
    blattEl = document.createElement('dialog'); blattEl.id = 'blatt'; document.body.append(blattEl);
    blattEl.addEventListener('click', (e) => { if (e.target === blattEl) blattEl.close(); });
  }
  blattEl.innerHTML = html;
  if (!blattEl.open) blattEl.showModal();
  ($('select,input,button', blattEl) || blattEl).focus();
}
A.blattzu = () => blattEl?.close();
/** Song verlassen (anderer Song, neu mischen): große Dateien und Blob-Adressen freigeben (Prüfer-Befund H1). */
export function songVerlassen() {
  pause(); S.abh?.schliesse?.(); S.abh = null;
  S.erg?.freigeben?.(); S.gespeichert = null;
}
let wl;
export async function wach(an) { try { if (an) wl = await navigator.wakeLock?.request('screen'); else { await wl?.release(); wl = null; } } catch { /* nicht überall da */ } }
document.addEventListener('visibilitychange', () => { if (S.job && document.visibilityState === 'visible') wach(true); });
export function lade(blob, name) {
  const u = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = u; a.download = name; document.body.append(a); a.click(); a.remove();
  const z = $('#linkzeile'); if (z) z.innerHTML = `Falls nichts passiert: <a href="${u}" download="${esc(name)}">${esc(name)} hier laden</a>`;
  setTimeout(() => URL.revokeObjectURL(u), 120000);
}
const dateiname = (s) => (s || 'Song').replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim().slice(0, 60) || 'Song';

// ---------- Start ----------
export function start() {
  pause(); S.zeige = start; S.zurueck = null; S.album = null; app.className = ''; app.innerHTML = START;
  if (S.erg && S.sitzung) $('nav.wege', app).insertAdjacentHTML('afterbegin', `<button type="button" class="weg" data-a="weiter">${ico('play')}<span>Weiter mit „${esc(S.sitzung.song)}“<small>Zurück zum Anhören</small></span></button>`);
  zeigeZuletzt(); scrollTo(0, 0); $('h1', app).focus({ preventScroll: true });
}
async function zeigeZuletzt() {
  wegSenden();
  const l = await idb('einstellungen', 'get', 'letzter'), p = $('#zuletzt');
  if (l && p && !S.erg) { p.textContent = `Zuletzt: „${l.name}“. Wählst du dieselben Spuren noch einmal, sind deine Einstellungen wieder da.`; p.hidden = false; }
}
A.weiter = () => hoeren();
A.start = () => start();
A.zurueck = () => S.zurueck?.();

// ---------- Schritt 1: Spuren wählen ----------
const neueAuswahl = (s) => ({ ziel: 'streaming', eingriff: 'mittel', rollen: Object.fromEntries(s.spuren.map((sp) => [sp.id, sp.rolle])), haupt: [], lassen: [], aus: [], bpm: s.bpm ?? null, kurve: 'synthpop' });
export async function waehle(files) {
  if (!files.length) return;
  blattEl?.open && blattEl.close();
  songVerlassen();
  seite({ titel: 'Spuren werden gelesen …', schritt: 1, inhalt: `<p class="ruhig">Nur die Köpfe der Dateien – das dauert ein paar Sekunden. Deine Dateien werden nur gelesen.</p>${balken('Spuren lesen')}` });
  try {
    const K = await kern();
    const s = await K.oeffne(files, { fortschritt: setzeBalken });
    try { localStorage.setItem('mischpult-spuren', '1'); } catch { /* privat */ }   // Startseite: „Messwerte senden“ nach Neuladen anbieten
    Object.assign(S, { sitzung: s, erg: null, anfang: null, verlauf: [], stellung: 'nachher', solo: null, stumm: new Set(), pos: 0, gespeichert: null, wieder: false });
    S.songId = 'song-' + hash(s.spuren.map((sp) => sp.datei + '/' + sp.groesse).sort().join('|'));
    S.a = neueAuswahl(s);
    const rec = await idb('songs', 'get', S.songId);
    if (rec?.auswahl) {
      const ids = new Set(s.spuren.map((sp) => sp.id)), nur = (l) => (l || []).filter((x) => ids.has(x));
      S.a = { ...S.a, ...rec.auswahl, rollen: { ...S.a.rollen, ...Object.fromEntries(Object.entries(rec.auswahl.rollen || {}).filter(([k]) => ids.has(k))) }, haupt: nur(rec.auswahl.haupt), lassen: nur(rec.auswahl.lassen), aus: nur(rec.auswahl.aus) };
      S.verlauf = rec.verlauf || []; S.anfang = rec.anfang || null; S.wieder = true;
      if (rec.name) s.song = rec.name;
    }
    rollen();
  } catch (f) { fehler(f); }
}

// ---------- Messwerte an Claude senden (0.2): senden.js erst beim Tippen laden ----------
const SENDEN_KNOPF = `<button type="button" class="knopf2 breit" data-a="senden">${ico('senden')}Messwerte an Claude senden</button>`;
A.senden = async () => { try { (await import('./senden.js')).oeffne(); } catch (f) { fehler(f); } };
async function wegSenden() {   // Startseite: nur wenn schon einmal Spuren geladen waren (nach Neuladen: Hinweis im Blatt)
  const nav = $('nav.wege', app); if (!nav || $('[data-a=senden]', nav)) return;
  let war = false; try { war = !!localStorage.getItem('mischpult-spuren'); } catch { /* privat */ }
  const l = S.sitzung || war ? null : await idb('einstellungen', 'get', 'letzter');
  if ((!S.sitzung && !war && !l) || S.zeige !== start || $('[data-a=senden]', nav)) return;
  nav.insertAdjacentHTML('beforeend', `<button type="button" class="weg" data-a="senden">${ico('senden')}<span>Messwerte an Claude senden<small>${S.sitzung?._files?.length ? 'Nur Messwerte, kein Ton' : 'Dafür die Spuren einmal neu laden'}</small></span></button>`);
}

// ---------- Schritt 2: Rollen ----------
const rolleSel = (sp, r) => `<label class="ganz"><span class="sr">Rolle für ${esc(sp.datei)}</span><select data-c="rolle" data-id="${esc(sp.id)}">${ROLLEN.map(([k, n]) => `<option value="${k}"${k === r ? ' selected' : ''}>${n}</option>`).join('')}</select></label>`;
const tg = (art, id, sym, t) => `<button type="button" class="tg" data-a="${art}" data-id="${esc(id)}" aria-pressed="${S.a[art].includes(id)}" aria-label="${t}" title="${t}">${ico(sym)}</button>`;
function rolleZeile(sp) {
  const r = S.a.rollen[sp.id], aus = S.a.aus.includes(sp.id);
  return `<li class="spur${aus ? ' aus' : ''}" data-id="${esc(sp.id)}"><div class="sp-text"><span class="sp-name">${esc(sp.datei)}</span><span class="klein2">${dauer(sp.laenge_s)}<span class="unsicher"${sp.sicher || r !== sp.rolle ? ' hidden' : ''}> · <span class="punkt ge" aria-hidden="true"></span> bitte kurz prüfen</span></span></div><div class="sp-knoepfe">${tg('haupt', sp.id, 'stern', 'Hauptsache')}${tg('lassen', sp.id, 'schloss', 'So lassen')}</div>${rolleSel(sp, r)}<canvas class="ganz" data-w="${esc(sp.id)}" aria-hidden="true"></canvas>${sp.still ? `<label class="schalter ganz"><span>Dabei</span><input type="checkbox" data-c="dabei" data-id="${esc(sp.id)}"${aus ? '' : ' checked'}></label>` : ''}</li>`;
}
export function rollen() {
  const s = S.sitzung, stop = s.hinweise.some((h) => h.stop);
  S.zeige = rollen;
  seite({ titel: 'Rollen prüfen', schritt: 2, zurueck: start, inhalt: `
<label class="feld"><span>Song</span><input type="text" id="song" value="${esc(s.song)}" autocomplete="off" spellcheck="false"></label>
${S.wieder ? '<p class="hinweis gr">Deine letzten Einstellungen für diesen Song sind wieder da.</p>' : ''}${hinweise(s.hinweise)}
<p class="ruhig">Die Rollen sind vorausgefüllt. Tippe eine Rolle an, um sie zu ändern.</p>
<ul class="liste" id="spuren">${s.spuren.map(rolleZeile).join('')}</ul>
<p class="klein2">${ico('stern')} Hauptsache: die anderen machen dieser Spur Platz. ${ico('schloss')} So lassen: diese Spur wird nicht verändert, nur mitgemessen.</p>${SENDEN_KNOPF}`,
  fuss: `<button type="button" class="knopf1" data-a="mischen"${stop ? ' disabled' : ''}>${ico('regler')}Mischen &amp; Mastern</button><p class="klein2">Etwa eine Minute. Deine Dateien werden nur gelesen.</p>` });
  requestAnimationFrame(zeichneMini);
}
function zeichneMini() {
  for (const c of $$('canvas[data-w]', app)) {
    const sp = S.sitzung.spuren.find((x) => x.id === c.dataset.w); if (!sp?.welle) continue;
    const w = c.clientWidth, h = c.clientHeight, d = devicePixelRatio || 1; if (!w) continue;
    c.width = Math.round(w * d); c.height = Math.round(h * d);
    const g = c.getContext('2d'); g.scale(d, d); g.fillStyle = '#56657a';
    const W = sp.welle, n = W.length;
    for (let i = 0; i < n; i++) { const a = Math.max(0.5, W[i] * (h / 2 - 1)); g.fillRect(i / n * w, h / 2 - a, Math.max(1, w / n - 0.6), 2 * a); }
  }
}
function schalte(art, id, an) {
  aendere((a) => { const l = a[art], i = l.indexOf(id); if (an ?? i < 0) { if (i < 0) l.push(id); if (art === 'lassen') a.haupt = a.haupt.filter((x) => x !== id); if (art === 'haupt') a.lassen = a.lassen.filter((x) => x !== id); } else if (i >= 0) l.splice(i, 1); });
  for (const b of $$(`[data-a=haupt],[data-a=lassen]`, app)) b.setAttribute('aria-pressed', S.a[b.dataset.a].includes(b.dataset.id));
}
A.haupt = (b) => { schalte('haupt', b.dataset.id); sag(S.a.haupt.includes(b.dataset.id) ? 'Hauptsache an.' : 'Hauptsache aus.'); };
A.lassen = (b) => { schalte('lassen', b.dataset.id); sag(S.a.lassen.includes(b.dataset.id) ? 'So lassen an: diese Spur bleibt unverändert.' : 'So lassen aus.'); };
C.haupt = (t) => schalte('haupt', t.dataset.id, t.checked);
C.lassen = (t) => schalte('lassen', t.dataset.id, t.checked);
C.rolle = (t) => {
  aendere((a) => { a.rollen[t.dataset.id] = t.value; });
  const z = t.closest('li')?.querySelector('.unsicher'); if (z) z.hidden = true;
  sag('Rolle: ' + rolleName(t.value));
};
C.dabei = (t) => { aendere((a) => { a.aus = a.aus.filter((x) => x !== t.dataset.id); if (!t.checked) a.aus.push(t.dataset.id); }); t.closest('li').classList.toggle('aus', !t.checked); };

// ---------- Rückgängig ----------
function aendere(fn) {
  S.verlauf.push(klon(S.a)); if (S.verlauf.length > 50) S.verlauf.shift();
  fn(S.a); nachAenderung();
}
function nachAenderung() { S.abh?.plan(S.a); merke(); if (S.zeige === hoeren) aktualisiere(); }
A.undo = () => { if (!S.verlauf.length) return; S.a = S.verlauf.pop(); nachAenderung(); sag('Rückgängig gemacht.'); };
A.anfang = () => { if (!S.anfang) return; aendere((a) => Object.assign(a, klon(S.anfang))); sag('Alles wie direkt nach dem Mischen.'); };

// ---------- Schritt 3: Mischen & Mastern ----------
const TEILE = ['Spuren anhören …', 'Platz schaffen …', 'Master einstellen …'];
A.mischen = async () => {
  const n = $('#song')?.value.trim(); if (n) S.sitzung.song = n;
  songVerlassen();   // erneutes Mischen: die alten Fassungen dieses Songs freigeben
  seite({ titel: 'Mischen &amp; Mastern', schritt: 3, inhalt: `<p class="hinweis">Bitte die Seite offen lassen, bis der Balken voll ist.</p><ol class="teile">${TEILE.map((t, i) => `<li data-t="${i}"><span class="punkt" aria-hidden="true"></span>${t}</li>`).join('')}</ol>${balken('Mischen und Mastern')}<p class="klein2">Abbrechen geht jederzeit – danach ist alles wie vorher.</p>`,
    fuss: '<button type="button" class="knopf2 breit" data-a="abbrechen">Abbrechen</button>' });
  const ab = new AbortController(); S.job = ab; wach(true);
  let teil = -1;
  try {
    const K = await kern();
    S.erg = await K.mische(S.sitzung, S.a, { signal: ab.signal, fortschritt: (t, x) => {
      if (t !== teil) { teil = t; $$('.teile li', app).forEach((li, i) => { li.className = i < t ? 'f' : i === t ? 'a' : ''; }); sag(TEILE[t]); }
      setzeBalken((t + x) / 3);
    } });
    S.anfang = klon(S.a); S.pos = 0;
    S.songs[S.songId] = { sitzung: S.sitzung, erg: S.erg, a: S.a, id: S.songId };
    await schreibe();
    if (S.album?.nachSong) return S.album.nachSong(S.songId);
    hoeren();
  } catch (f) {
    if (ab.signal.aborted) { sag('Abgebrochen. Es ist alles wie vorher.'); rollen(); } else fehler(f);
  } finally { S.job = null; wach(false); }
};
A.abbrechen = () => S.job?.abort();

// ---------- Schritt 4: Anhören ----------
function stellungen() { return [['vorher', 'Vorher'], ['nachher', 'Nachher'], ...(S.dein ? [['dein', 'Dein Master']] : [])]; }
function hoerZeile(sp) {
  const r = S.a.rollen[sp.id], was = S.a.lassen.includes(sp.id) ? 'unverändert (So lassen)' : S.a.aus.includes(sp.id) ? 'nicht dabei' : S.erg.was(S.a)[sp.id] || 'unverändert';
  return `<li class="spur" data-id="${esc(sp.id)}"><button type="button" class="namek" data-a="spurblatt" data-id="${esc(sp.id)}"><span class="sp-name">${S.a.haupt.includes(sp.id) ? ico('stern') : ''}${S.a.lassen.includes(sp.id) ? ico('schloss') : ''}${esc(sp.datei)}</span><span class="klein2">${rolleName(r)}</span></button><div class="sp-knoepfe"><button type="button" class="tg" data-a="solo" data-id="${esc(sp.id)}" aria-pressed="${S.solo === sp.id}">Solo</button></div><p class="klein2 ganz was">${esc(was)}</p></li>`;
}
export function hoeren() {
  const s = S.sitzung, e = S.erg, a = S.a;
  S.zeige = hoeren;
  if (!S.abh) { S.abh = e.abhoerer(S.a); S.abh.melde(meter); if (S.dein) S.abh.dein(S.dein.file); }
  seite({ titel: 'Anhören', schritt: 4, zurueck: S.album?.zurueck || rollen, mehr: true, breit: true, inhalt: `<div class="zwei"><section>
<div class="uebersicht"><canvas id="welle" role="slider" tabindex="0" aria-label="Position im Song. Antippen springt an die Stelle." aria-valuemin="0" aria-valuemax="${Math.round(s.laenge_s)}" aria-valuenow="0" aria-valuetext="0:00"></canvas></div>
<div class="zeile"><button type="button" class="play" data-a="play" aria-label="Abspielen">${ico('play')}</button><span class="zeit" id="zeit">0:00 / ${dauer(s.laenge_s)}</span><button type="button" class="knopf2 klein" data-a="lauteste">Lauteste Stelle</button></div>
${seg('stellung', stellungen(), S.stellung, 'Vergleich')}
<p class="klein2">Gleich laut gemacht, damit du nur den Klang vergleichst.</p>
<div class="anzeige" id="anz"><div><div class="m-kopf"><span>Lautheit <small>LUFS, 3 s</small></span><b id="ml">–</b></div><div class="bahn" aria-hidden="true"><i class="f" id="mlf"></i><i class="z" id="mlz"></i></div><p class="klein2" id="mls"></p></div>
<div><div class="m-kopf"><span>Spitze <small>dBTP, gehalten</small></span><b id="ms">–</b></div><div class="bahn" aria-hidden="true"><i class="f" id="msf"></i><i class="h" id="msh"></i><i class="z" id="msz"></i></div><p class="klein2" id="mss"></p></div>
<p class="klein2" id="genau"></p></div>
<h2>Ziel</h2>${seg('ziel', ZIELE, a.ziel, 'Ziel')}<p class="hinweis" id="lautsatz"${a.ziel === 'laut' ? '' : ' hidden'}>${LAUT_SATZ}</p>
<h2>Eingriff</h2>${seg('eingriff', EINGRIFF, a.eingriff, 'Eingriff')}
<div class="zeile"><button type="button" class="knopf2" data-a="undo"${S.verlauf.length ? '' : ' disabled'}>${ico('undo')}Rückgängig</button><button type="button" class="knopf2" data-a="anfang">Alles zurück auf Anfang</button></div>
</section><section><h2>Spuren</h2><ul class="liste" id="spuren">${s.spuren.map(hoerZeile).join('')}</ul><p class="klein2">Stumm gilt nur zum Anhören. Tippe auf einen Namen, um Rolle, Hauptsache oder So lassen zu ändern.</p>${SENDEN_KNOPF}</section></div>`,
  fuss: `<button type="button" class="knopf1" data-a="speichern">${ico('teilen')}Speichern</button><p class="klein2">Nichts wird überschrieben – jede Fassung bekommt einen neuen Namen.</p>` });
  songWerte(); zeichneWelle(); setzePlay();
}
function aktualisiere() {
  for (const g of $$('[data-seg]', app)) setzeSeg(g, g.dataset.seg === 'ziel' ? S.a.ziel : g.dataset.seg === 'eingriff' ? S.a.eingriff : S.stellung);
  const ls = $('#lautsatz'); if (ls) ls.hidden = S.a.ziel !== 'laut';
  const u = $('[data-a=undo]', app); if (u) u.disabled = !S.verlauf.length;
  const f = document.activeElement, sel = f?.dataset?.a && f.dataset.id ? `[data-a="${f.dataset.a}"][data-id="${CSS.escape(f.dataset.id)}"]` : null;
  const l = $('#spuren', app); if (l) l.innerHTML = S.sitzung.spuren.map(hoerZeile).join('');
  if (sel) $(sel, app)?.focus();
  songWerte();
}
function songWerte() {
  const st = S.stellung, z = ZW[S.a.ziel], w = st === 'vorher' ? S.erg.vorher : st === 'dein' ? S.dein : S.erg.nachher(S.a);
  if (!w || !$('#mls')) return;
  const lOk = st === 'nachher' && Math.abs(w.lufs - z.lufs) <= 0.5, tOk = w.tp <= z.tp;
  $('#mls').innerHTML = `<span class="punkt ${lOk ? 'gr' : 'ge'}" aria-hidden="true"></span> Ganzer Song: ${zahl(w.lufs)}${st === 'nachher' ? ` (Ziel ${zahl(z.lufs, 0)})` : ''}`;
  $('#mss').innerHTML = `<span class="punkt ${tOk ? 'gr' : 'ge'}" aria-hidden="true"></span> ${st === 'vorher' && w.tp > 0 ? 'Deine Spuren zusammen gehen über 0 dB – ohne Begrenzer würde das übersteuern. Das Ergebnis bleibt unter der Grenze.' : `Höchste Spitze im Song: ${zahl(w.tp, 1, true)} dB (Grenze ${zahl(z.tp)})`}`;
  $('#mlz').style.left = pct(z.lufs, -30, -4) + '%'; $('#msz').style.left = pct(z.tp, -24, 3) + '%';
  $('#genau').textContent = st === 'nachher' ? (S.erg.genau?.(S.a) ? 'genau gemessen' : 'wird genau nachgemessen …') : '';
}
const pct = (x, lo, hi) => Math.max(0, Math.min(100, (x - lo) / (hi - lo) * 100));
let mRaf = 0, mLetzt = null;
function meter(m) { mLetzt = m; if (!mRaf) mRaf = requestAnimationFrame(zeigeMeter); }
function zeigeMeter() {
  mRaf = 0; const m = mLetzt; if (!m || S.zeige !== hoeren) return;
  S.pos = m.pos; const z = ZW[S.a.ziel], t = $('#zeit');
  if (t) t.textContent = dauer(m.pos) + ' / ' + dauer(S.sitzung.laenge_s);
  const c = $('#welle'); if (c) { c.setAttribute('aria-valuenow', Math.round(m.pos)); c.setAttribute('aria-valuetext', dauer(m.pos)); }
  if (m.lautheit != null && $('#ml')) {
    $('#ml').textContent = zahl(m.lautheit); const lf = $('#mlf'); lf.style.width = pct(m.lautheit, -30, -4) + '%'; lf.classList.toggle('ge', m.lautheit > z.lufs + 1);
    $('#ms').textContent = zahl(m.spitze, 1, true); const sf = $('#msf'); sf.style.width = pct(m.spitze, -24, 3) + '%'; sf.classList.toggle('ge', m.spitzeMax > z.tp);
    $('#msh').style.left = pct(m.spitzeMax, -24, 3) + '%';
  }
  if (m.genau !== undefined) aktualisiere();   // neue Werte oder Zeilen „was gemacht wurde“ aus dem Rechenteil
  zeichneWelle(); setzePlay();
}
function zeichneWelle() {
  const c = $('#welle'); if (!c || !S.erg) return;
  const w = c.clientWidth, h = c.clientHeight, d = devicePixelRatio || 1; if (!w) return;
  if (c.width !== Math.round(w * d)) { c.width = Math.round(w * d); c.height = Math.round(h * d); }
  const g = c.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, w, h);
  const W = S.erg.welle, n = W.length, p = S.pos / S.sitzung.laenge_s;
  for (let i = 0; i < n; i++) { const a = Math.max(0.5, W[i] * (h / 2 - 6)); g.fillStyle = i / n < p ? '#3ccf7a' : '#56657a'; g.fillRect(i / n * w, h / 2 - a, Math.max(1, w / n - 0.5), 2 * a); }
  g.fillStyle = '#e9edf2'; g.fillRect(Math.min(w - 2, p * w), 0, 2, h);
}
function setzePlay() { const b = $('[data-a=play]', app); if (!b) return; const sp = !!S.abh?.spielt; if (b.dataset.sp === String(sp)) return; b.dataset.sp = sp; b.innerHTML = ico(sp ? 'pause' : 'play'); b.setAttribute('aria-label', sp ? 'Pause' : 'Abspielen'); }
function pause() { if (S.abh?.spielt) S.abh.pause(); }
A.play = async () => {
  if (!S.abh) return;
  if (S.abh.spielt) S.abh.pause();
  else { try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch { /* älteres iOS */ } await S.abh.play(); }
  setzePlay();
};
A.lauteste = async () => { S.abh.seek(S.erg.lauteste_s); S.pos = S.erg.lauteste_s; zeichneWelle(); if (!S.abh.spielt) await A.play(); sag('Lauteste Stelle bei ' + dauer(S.erg.lauteste_s)); };
SEG.stellung = (v) => { S.stellung = v; S.abh?.stellung(v); songWerte(); sag(v === 'vorher' ? 'Vorher: deine Spuren unverändert.' : v === 'dein' ? 'Dein bisheriger Master.' : 'Nachher: das Ergebnis.'); };
SEG.ziel = (v) => { if (v !== S.a.ziel) aendere((a) => { a.ziel = v; }); };
SEG.eingriff = (v) => { if (v !== S.a.eingriff) aendere((a) => { a.eingriff = v; }); };
A.solo = (b) => { const id = b.dataset.id; S.solo = S.solo === id ? null : id; S.abh?.solo(S.solo); for (const x of $$('[data-a=solo]', app)) x.setAttribute('aria-pressed', x.dataset.id === S.solo); sag(S.solo ? 'Solo an' : 'Solo aus'); };
A.stumm = (b) => { const id = b.dataset.id; S.stumm.has(id) ? S.stumm.delete(id) : S.stumm.add(id); S.abh?.stumm([...S.stumm]); b.setAttribute('aria-pressed', S.stumm.has(id)); sag(S.stumm.has(id) ? 'Stumm' : 'Wieder hörbar'); };
A.spurblatt = (b) => {
  const sp = S.sitzung.spuren.find((x) => x.id === b.dataset.id); if (!sp) return;
  blatt(`<h2>${esc(sp.datei)}</h2><label class="feld"><span>Rolle</span><select data-c="rolle" data-id="${esc(sp.id)}">${ROLLEN.map(([k, n]) => `<option value="${k}"${k === S.a.rollen[sp.id] ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
<label class="schalter"><span>${ico('stern')} Hauptsache<span class="klein2" style="display:block">Die anderen machen dieser Spur Platz.</span></span><input type="checkbox" data-c="haupt" data-id="${esc(sp.id)}"${S.a.haupt.includes(sp.id) ? ' checked' : ''}></label>
<label class="schalter"><span>${ico('schloss')} So lassen<span class="klein2" style="display:block">Diese Spur wird nicht verändert, nur mitgemessen.</span></span><input type="checkbox" data-c="lassen" data-id="${esc(sp.id)}"${S.a.lassen.includes(sp.id) ? ' checked' : ''}></label>
<p class="klein2">${esc(S.erg.was(S.a)[sp.id] || '')}</p><button type="button" class="knopf1" data-a="blattzu">Fertig</button>`);
};
function sprung(x) { const c = $('#welle'); if (!c || !S.abh) return; const r = c.getBoundingClientRect(), t = Math.max(0, Math.min(1, (x - r.left) / r.width)) * S.sitzung.laenge_s; S.abh.seek(t); S.pos = t; zeichneWelle(); }
document.addEventListener('pointerdown', (e) => { if (e.target.id === 'welle') sprung(e.clientX); });
A.mehr = () => blatt(`<h2>Mehr</h2>
<label class="feld"><span>Tempo (BPM)</span><input type="number" inputmode="decimal" min="40" max="250" step="0.1" data-c="bpm" value="${S.a?.bpm ?? ''}" placeholder="wird erkannt"></label>
<label class="feld"><span>Klang-Ziel</span><select data-c="kurve">${KURVEN.map(([k, n]) => `<option value="${k}"${k === S.a?.kurve ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
<div class="wege"><input type="file" id="dein" class="sr-datei" accept="${ACC}"><label for="dein" class="weg">${ico('datei')}<span>Dein Master zum Vergleich laden<small>Dein bisheriger Mixdown als dritte Stellung</small></span></label>
<button type="button" class="weg" data-a="hilfe">${ico('hilfe')}<span>So holst du die Spuren aus deiner DAW</span></button>
<button type="button" class="weg" data-a="loeschfrage">${ico('zu')}<span>Alles löschen<small>Einstellungen und Alben in diesem Mischpult</small></span></button></div>
<button type="button" class="knopf2 breit" data-a="blattzu">Schließen</button>`);
C.bpm = (t) => { const v = parseFloat(String(t.value).replace(',', '.')); if (S.a) aendere((a) => { a.bpm = v >= 40 && v <= 250 ? v : null; }); };
C.kurve = (t) => { if (S.a) aendere((a) => { a.kurve = t.value; }); };
A.loeschfrage = () => blatt(`<h2>Wirklich alles löschen?</h2><p>Gelöscht werden nur die Einstellungen, der Rückgängig-Verlauf und die Alben in diesem Mischpult. Deine Audio-Dateien und gespeicherten Songs bleiben unberührt.</p><button type="button" class="knopf1" data-a="loeschen">Ja, löschen</button><button type="button" class="knopf2 breit" data-a="blattzu">Nein, behalten</button>`);
A.loeschen = async () => { for (const s of ['songs', 'alben', 'einstellungen']) await idb(s, 'leeren'); try { localStorage.clear(); } catch { /* egal */ } blattEl.close(); sag('Gelöscht.'); };

// ---------- Schritt 5: Speichern ----------
A.speichern = async () => {
  pause();
  const rec = (await idb('songs', 'get', S.songId)) || {}, n = (rec.zaehler || 0) + 1, b = dateiname(S.sitzung.song), x = n > 1 ? '-' + n : '';
  const namen = { master: `${b}-Master${x}.wav`, instr: `${b}-Instrumental${x}.wav`, rezept: `${b}-Mischrezept${x}.txt`, json: 'mischrezept.json', zip: `${b}-Mischpult${x}.zip` };
  seite({ titel: 'Speichern', schritt: 5, inhalt: `<p class="hinweis">Bitte die Seite offen lassen, bis der Balken voll ist.</p><p class="ruhig">Master und Instrumental werden gerechnet und geprüft.</p>${balken('Speichern')}`, fuss: '<button type="button" class="knopf2 breit" data-a="abbrechen">Abbrechen</button>' });
  const ab = new AbortController(); S.job = ab; wach(true);
  try {
    const K = await kern();
    const r = await K.speichere(S.sitzung, S.erg, S.a, { namen, signal: ab.signal, fortschritt: setzeBalken });
    await idb('songs', 'put', { ...((await idb('songs', 'get', S.songId)) || { id: S.songId }), zaehler: n, rezept: r.rezept.json });
    S.gespeichert = { r, namen, zip: null };
    ergebnis(); sag('Fertig. Die Dateien liegen bereit.');
  } catch (f) { if (ab.signal.aborted) { sag('Abgebrochen. Es ist nichts gespeichert worden.'); hoeren(); } else fehler(f); }
  finally { S.job = null; wach(false); }
};
const kannTeilen = (fs) => { try { return !!navigator.canShare?.({ files: fs }); } catch { return false; } };
const alsFiles = () => S.gespeichert.r.dateien.map((d) => new File([d.blob], d.name, { type: d.typ }));
export function ergebnis() {
  const { r } = S.gespeichert, m = r.messung, gut = r.ampel.every((x) => x.farbe === 'gruen'), teilen = kannTeilen(alsFiles());
  S.zeige = ergebnis;
  seite({ titel: 'Fertig', schritt: 5, zurueck: hoeren, inhalt: `<div class="karte"><p><span class="punkt ${gut ? 'gr' : 'ge'}" aria-hidden="true"></span><b>Lautheit ${zahl(m.lufs)} · Spitze ${zahl(m.tp, 1, true)} dB · ${m.clip ? m.clip + ' Übersteuerungen' : 'keine Übersteuerung'}</b></p>${ampelHtml(r.ampel.filter((x) => x.farbe !== 'gruen'))}</div>
<p class="ruhig">${VIDEO}</p><h2>Deine Dateien</h2><ul class="dateien">${r.dateien.map((d) => `<li>${ico('datei')}<span>${esc(d.name)}</span><small>${groesse(d.blob.size)}</small></li>`).join('')}</ul>
<button type="button" class="knopf2 breit" data-a="rezept">${ico('haken')}Mischrezept ansehen und abhaken</button>
${teilen ? '<button type="button" class="knopf2 breit" data-a="zip">Als ZIP laden</button>' : '<button type="button" class="knopf2 breit" data-a="einzeln">Dateien einzeln laden</button>'}
<p class="klein2" id="linkzeile"></p><button type="button" class="knopf2 breit" data-a="hoerenZ">Zurück zum Anhören</button><button type="button" class="knopf2 breit" data-a="start">Neuen Song mischen</button>`,
  fuss: teilen ? `<button type="button" class="knopf1" data-a="teilen">${ico('teilen')}Dateien sichern</button><p class="klein2">Im Teilen-Blatt „In Dateien sichern“ wählen.</p>` : `<button type="button" class="knopf1" data-a="zip">${ico('teilen')}Dateien sichern (ZIP)</button><p class="klein2">Alle drei Dateien in einem Paket.</p>` });
}
A.hoerenZ = () => hoeren();
A.teilen = async () => { try { await navigator.share({ files: alsFiles(), title: S.sitzung.song }); sag('Geteilt.'); } catch (f) { if (f?.name !== 'AbortError') A.zip(); } };
A.zip = async () => {
  const g = S.gespeichert, K = await kern();
  g.zip ||= await K.zip([...g.r.dateien, { name: g.namen.json, blob: new Blob([JSON.stringify(g.r.rezept.json, null, 1)], { type: 'application/json' }) }]);
  lade(g.zip, g.namen.zip); sag('ZIP wird geladen.');
};
A.einzeln = () => S.gespeichert.r.dateien.forEach((d, i) => setTimeout(() => lade(d.blob, d.name), i * 500));
// Mischrezept zum Abhaken (Häkchen nur in diesem Browser gemerkt)
A.rezept = () => {
  const j = S.gespeichert.r.rezept.json, key = 'mp-haken:' + S.songId + ':' + j.erstellt;
  let h = {}; try { h = JSON.parse(localStorage.getItem(key) || '{}'); } catch { /* privat */ }
  const pkt = (k, d) => `<label class="haken"><input type="checkbox" data-c="haken" data-key="${esc(key)}" data-k="${k}"${h[k] ? ' checked' : ''}><span>${esc(d.wo)} › ${esc(d.regler)}: <b>${esc(d.wert)}</b>${d.grund ? `<small>${esc(d.grund)}</small>` : ''}</span></label>`;
  S.zeige = A.rezept;
  seite({ titel: 'Mischrezept', zurueck: ergebnis, inhalt: `<p class="ruhig">Dein Master ist schon fertig. Dieses Rezept brauchst du nur, wenn du selbst in deiner DAW nachstellen willst.</p><p class="klein2">Ziel: ${j.ziel.name === 'laut' ? 'Laut' : 'Streaming (−14)'} · Eingriff: ${j.eingriff === 'kraeftig' ? 'kräftig' : j.eingriff}${j.bpm ? ' · Tempo ' + zahl(j.bpm, 0) + ' BPM' : ''}</p>
${j.spuren.map((s, i) => `<h3>${esc(s.datei)} <span class="klein2">(${rolleName(s.rolle)})</span></h3>${s.so_lassen ? '<p class="klein2">unverändert (So lassen)</p>' : s.daw.length ? s.daw.map((d, k) => pkt(`s${i}-${k}`, d)).join('') : '<p class="klein2">nichts zu tun</p>'}`).join('')}
<h3>Master</h3>${j.master.daw.map((d, k) => pkt('m' + k, d)).join('')}<p class="klein2" id="hakenstand"></p>`, fuss: '<button type="button" class="knopf1" data-a="hakenfertig">Fertig</button>' });
  hakenStand();
};
A.hakenfertig = () => ergebnis();
function hakenStand() { const a = $$('[data-c=haken]', app), n = a.filter((x) => x.checked).length, p = $('#hakenstand'); if (p) p.textContent = `${n} von ${a.length} erledigt`; }
C.haken = (t) => { try { const h = JSON.parse(localStorage.getItem(t.dataset.key) || '{}'); h[t.dataset.k] = t.checked; localStorage.setItem(t.dataset.key, JSON.stringify(h)); } catch { /* privat */ } hakenStand(); };

// ---------- Nebenwege: Datei prüfen, Dein Master, Hilfe, Album ----------
async function pruefen(file) {
  pause();
  seite({ titel: 'Datei prüfen', zurueck: start, inhalt: `<p class="ruhig">„${esc(file.name)}“ wird gemessen. Die Datei wird nur gelesen.</p>${balken('Messung')}`, fuss: '<button type="button" class="knopf2 breit" data-a="abbrechen">Abbrechen</button>' });
  const ab = new AbortController(); S.job = ab;
  try { const K = await kern(); S.geprueft = { file, ...(await K.pruefe(file, { fortschritt: setzeBalken, signal: ab.signal })) }; pruefung(); }
  catch (f) { if (ab.signal.aborted) start(); else fehler(f); } finally { S.job = null; }
}
function pruefung() {
  const m = S.geprueft; S.zeige = pruefung;
  seite({ titel: 'Ergebnis der Prüfung', zurueck: start, inhalt: `<p class="klein2">${esc(m.file.name)}</p><div class="werte">${wert('Lautheit', zahl(m.lufs), 'LUFS')}${wert('Spitze', zahl(m.tp, 1, true), 'dBTP')}${wert('Lautheits-Spanne', zahl(m.lra), 'LU (LRA)')}${wert('Dynamik', zahl(m.plr), 'dB (PLR)')}</div>
<div class="karte">${ampelHtml(m.ampel)}</div><p class="ruhig">${VIDEO}</p><input type="file" id="pruef" class="sr-datei" accept="${ACC}"><label for="pruef" class="knopf2 breit">Noch eine Datei prüfen</label>`,
  fuss: `<button type="button" class="knopf1" data-a="alsdein">Als „Dein Master“ zum Vergleich nehmen</button>` });
}
async function nimmDein(file, m) {
  S.dein = { file, lufs: m.lufs, tp: m.tp };
  if (S.abh) await S.abh.dein(file);
  if (S.erg) { hoeren(); sag('„Dein Master“ ist jetzt die dritte Stellung beim Vergleich.'); }
  else { start(); sag('Gemerkt. Beim Anhören gibt es „Dein Master“ als dritte Stellung.'); const p = $('#zuletzt'); if (p) { p.textContent = `„${file.name}“ ist als „Dein Master“ gemerkt und erscheint beim Anhören als dritte Stellung.`; p.hidden = false; } }
}
A.alsdein = () => nimmDein(S.geprueft.file, S.geprueft);
async function deinLaden(file) {
  blattEl?.close();
  try { const K = await kern(); const m = await K.pruefe(file, {}); await nimmDein(file, m); } catch (f) { fehler(f); }
}
A.hilfe = async () => {
  blattEl?.open && blattEl.close();
  const zur = S.zeige || start, h = await import('./hilfe.js');
  S.zeige = A.hilfe;
  seite({ titel: 'So holst du die Spuren aus deiner DAW', zurueck: zur, inhalt: h.html(), fuss: '<button type="button" class="knopf1" data-a="zurueck">Verstanden</button>' });
};
A.album = async () => (await import('./album-ui.js')).album();
export function fehler(f) {
  console.warn('Mischpult:', f);
  const sp = f?.name === 'Speicher' || /memory|speicher/i.test(String(f?.message));
  S.zeige = start;
  seite({ titel: 'Das hat nicht geklappt', zurueck: start, inhalt: `<p class="hinweis">${sp ? 'Das Gerät hatte zu wenig Speicher. Bitte andere Apps schließen und noch mal tippen.' : 'Es ist etwas schiefgegangen. Es wurde nichts verändert und nichts überschrieben.'}</p><p class="klein2">${esc(f?.message || f)}</p>`, fuss: '<button type="button" class="knopf1" data-a="start">Zur Startseite</button>' });
}

// ---------- Ereignisse ----------
document.addEventListener('click', (e) => {
  const r = e.target.closest('[data-seg] [role=radio]');
  if (r) { const g = r.parentElement; if (r.getAttribute('aria-checked') !== 'true') { setzeSeg(g, r.dataset.v); SEG[g.dataset.seg]?.(r.dataset.v); } return; }
  const b = e.target.closest('[data-a]'); if (b && !b.disabled) A[b.dataset.a]?.(b, e);
});
document.addEventListener('change', (e) => {
  const t = e.target, fs = t.files ? [...t.files] : null;
  if (t.id === 'wahl' && fs?.length) { t.value = ''; (S.album?.waehle || waehle)(fs); return; }
  if (t.id === 'pruef' && fs?.length) { t.value = ''; pruefen(fs[0]); return; }
  if (t.id === 'dein' && fs?.length) { t.value = ''; deinLaden(fs[0]); return; }
  if (t.dataset.c) C[t.dataset.c]?.(t);
});
document.addEventListener('keydown', (e) => {
  const g = e.target.closest?.('[data-seg]');
  if (g && /^Arrow(Left|Right|Up|Down)$/.test(e.key)) {
    const bs = $$('[role=radio]', g), i = bs.indexOf(e.target), n = bs[(i + (/Right|Down/.test(e.key) ? 1 : bs.length - 1)) % bs.length];
    e.preventDefault(); n.focus(); n.click(); return;
  }
  if (e.target.id === 'welle' && S.abh && /^Arrow(Left|Right)$/.test(e.key)) { e.preventDefault(); const t = Math.max(0, Math.min(S.sitzung.laenge_s, S.pos + (e.key === 'ArrowRight' ? 5 : -5))); S.abh.seek(t); S.pos = t; zeichneWelle(); return; }
  if (e.key === ' ' && S.zeige === hoeren && !e.target.closest('button,input,select,label,[role=slider]')) { e.preventDefault(); A.play(); }
});
addEventListener('resize', () => { if (S.zeige === hoeren) zeichneWelle(); else if (S.zeige === rollen) zeichneMini(); });
const melde = (t) => { if ($('.melde')) return; document.body.insertAdjacentHTML('beforeend', `<div class="melde" role="alert"><p>Hinweis: Es ist ein Fehler passiert. Nichts wurde überschrieben.</p><p class="klein2">${esc(t)}</p><button type="button" class="knopf2" data-a="meldezu">Schließen</button></div>`); };
A.meldezu = () => $('.melde')?.remove();
addEventListener('error', (e) => melde(e.message));
addEventListener('unhandledrejection', (e) => melde(e.reason?.message || e.reason));

// ---------- Start, offline, Kern im Leerlauf vorladen ----------
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').then(() => navigator.serviceWorker.ready).then(() => { const v = $('#version'); if (v) v.textContent = 'Version 0.2 · offline bereit'; }).catch(() => { const v = $('#version'); if (v) v.textContent = 'Version 0.2'; });
}
(window.requestIdleCallback || setTimeout)(() => { const l = document.createElement('link'); l.rel = 'modulepreload'; l.href = KERN; document.head.append(l); }, { timeout: 4000 });
S.zeige = start; zeigeZuletzt();
