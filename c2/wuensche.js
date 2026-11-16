// Feinschliff – „Wünsche“: ein eigener Kanal zu Claude (wie ein Walkie-Talkie). Wird erst beim Öffnen geladen.
// Senden und Lesen gehen über drei Datenbank-Funktionen (Supabase, öffentlicher Schlüssel): einsenden, offene Rückfragen,
// eigene Nachrichten. Mitgeschickt wird nur eine zufällige Gerätekennung – kein Name, kein Konto, kein Lernstand.
// Ohne Netz bleibt alles auf dem Gerät (Entwurf + Warteschlange) und geht automatisch raus, sobald wieder Internet da ist.
import { speicher, esc } from './speicher.js';
import { SYM } from './symbole.js';
import { kopf, VERSION, walkieAuffrischen } from './app.js';

// Eigene Stile erst mit dieser Seite laden (hält den Start klein); höchstens 1,5 s warten, dann ohne weiter
const STIL = new Promise((ok) => { if (document.querySelector('link[data-w-css]')) return ok(); const l = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: 'wuensche.css', onload: ok, onerror: ok }); l.dataset.wCss = ''; document.head.append(l); setTimeout(ok, 1500); });
const API = 'https://dbdnsryoivvezspgydpx.supabase.co/rest/v1/rpc/';
const SCHLUESSEL = 'sb_publishable_6utuy3es2447DjAQvxdrUQ_F-6fE5_M';   // öffentlicher Schlüssel: nur diese drei Funktionen, keine Tabellen
export const ARTEN = [
  ['fehler', 'Funktioniert nicht', 'Was ist passiert, wo genau – und was hast du erwartet?'],
  ['verbessern', 'Besser machen', 'Was soll anders, feiner oder einfacher werden?'],
  ['richtung', 'Andere Richtung', 'In welche Richtung soll es gehen – und warum?'],
  ['idee', 'Neue Idee', 'Was wünschst du dir in der App?'],
  ['lob', 'Lob', 'Was gefällt dir – was soll so bleiben?'],
];
export const BEREICHE_W = [['allgemein', 'Ganze App'], ['heute', 'Heute (10 Minuten)'], ['hoeren', 'Hören'], ['lesen', 'Lesen'], ['grammatik', 'Grammatik'],
  ['schreiben', 'Schreiben'], ['sprechen', 'Sprechen'], ['wortschatz', 'Wortschatz'], ['quiz', 'Quiz'], ['pruefung', 'Prüfung'], ['fortschritt', 'Fortschritt'], ['aussehen', 'Aussehen & Bedienung']];
const ART_NAME = { ...Object.fromEntries(ARTEN.map(([a, n]) => [a, n])), antwort: 'Antwort', umfrage: 'Bewertung' };
const BER_NAME = Object.fromEntries(BEREICHE_W);
const STATUS = { eingegangen: 'eingegangen', gelesen: 'gelesen', umgesetzt: 'umgesetzt', wartet: 'wartet auf Internet' };
const BEWERTUNG = ['Passt', 'Geht so', 'Noch nicht'];
const MAX = 4000;

// ---------- Zustand (lokal) ----------
const STD = { geraet: '', entwurf: null, warte: [], gesehen: {}, umfrage: {}, beantwortet: [], fragen: [], posts: [], zurueck: [], gesendet: 0, neuGesehen: '', offen: 0, neuAntw: 0, geprueft: 0 };
const W = () => ({ ...STD, ...speicher.lies('walkie', {}) });
const setzeW = (teil) => speicher.schreib('walkie', { ...W(), ...teil });
function zufall(n) {
  const Z = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; let t = '';
  while (t.length < n) { const b = new Uint8Array(32); crypto.getRandomValues(b); for (const x of b) if (x < 248 && t.length < n) t += Z[x % 62]; }
  return t;
}
export function geraet() { let g = W().geraet; if (!g) { g = 'g' + zufall(23); setzeW({ geraet: g }); } return g; }
const kurzHash = (t) => { let h = 0; for (const c of String(t || '')) h = (h * 31 + c.codePointAt(0)) | 0; return String(h); };

// ---------- Netz ----------
async function rpc(fn, body) {
  if (navigator.onLine === false) throw Object.assign(new Error('offline'), { offline: true });
  const ab = new AbortController(); const t = setTimeout(() => ab.abort(), 12000); let r;
  try {
    r = await fetch(API + fn, { method: 'POST', headers: { apikey: SCHLUESSEL, 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body), signal: ab.signal, cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer' });
  } catch { throw Object.assign(new Error('offline'), { offline: true }); } finally { clearTimeout(t); }
  const d = await r.json().catch(() => null);
  if (!r.ok) throw Object.assign(new Error(d?.message || 'Fehler ' + r.status), { server: d?.message || String(r.status), status: r.status, code: d?.code || '' });
  return d;
}
const senden = (e) => rpc('c2_post_senden', { p_geraet: geraet(), p_art: e.art, p_bereich: e.bereich || 'allgemein', p_text: e.text || '', p_wahl: e.wahl?.length ? e.wahl : null, p_frage_id: e.frage_id ?? null, p_version: VERSION });
const fehlerText = (f) => /zu viele/.test(f.server) ? 'Gerade kommen sehr viele Nachrichten an. Bitte später noch einmal – dein Text bleibt gespeichert.'
  : /frage unbekannt/.test(f.server) ? 'Diese Frage hat Claude inzwischen geschlossen.'
  : 'Das hat nicht geklappt. Dein Text bleibt gespeichert – versuch es gleich noch einmal.';
// Senden oder (ohne Netz) in die Warteschlange legen
async function sendeOderMerke(e) {
  try { const id = await senden(e); setzeW({ gesendet: W().gesendet + 1 }); return { ok: true, id }; }
  catch (f) {
    if (f.offline) { setzeW({ warte: [...W().warte, { ...e, lid: zufall(10), zeit: Date.now() }] }); return { gemerkt: true }; }
    return { fehler: f };
  }
}
let laeuft = null;
// Abgelehnt heißt nur: Der Server hat den Inhalt geprüft und zurückgewiesen (400, Code 22023 – z. B. Frage inzwischen geschlossen).
// Funkloch, Drossel, Serverfehler, falscher Schlüssel: Der Eintrag bleibt und geht beim nächsten Mal raus.
const abgelehnt = (f) => f.status === 400 && f.code === '22023';
export function nachsenden() {   // Warteschlange der Reihe nach; bricht beim ersten nicht abgelehnten Fehler ab und versucht es später wieder
  if (laeuft) return laeuft;
  laeuft = (async () => {
    let n = 0;
    for (const e of [...W().warte]) {
      try { await senden(e); n++; setzeW({ gesendet: W().gesendet + 1 }); }
      catch (f) { if (!abgelehnt(f)) break; zurueckholen(e, f); }
      setzeW({ warte: W().warte.filter((x) => x.lid !== e.lid) });
    }
    return n;
  })().finally(() => { laeuft = null; });
  return laeuft;
}
// Abgelehnter Eintrag: nichts still verlieren. Text zurück ins Formular, Frage wieder offen, Bewertung wieder wählbar.
function zurueckholen(e, f) {
  const w = W(), teil = {};
  if (e.art === 'antwort' && e.frage_id != null && !/frage unbekannt/.test(f.server)) teil.beantwortet = w.beantwortet.filter((x) => x !== e.frage_id);
  if (e.art === 'umfrage' && e.nid) { const u = { ...w.umfrage }; delete u[e.nid]; teil.umfrage = u; }
  if (e.art !== 'umfrage' && e.text?.trim()) teil.zurueck = [...(w.zurueck || []), e.text].slice(-10);
  setzeW(teil);
}
// Zurückgeholte Texte ins offene Formular hängen (das Feld ist die Quelle: so geht auch beim Tippen nichts verloren)
function zurueckZeigen() {
  const zr = W().zurueck || []; const t = ansicht?.isConnected && ansicht.querySelector('[data-w-text]'); if (!zr.length || !t) return;
  t.value = [t.value.trim(), ...zr].filter(Boolean).join('\n\n').slice(0, MAX); setzeW({ zurueck: [] }); t.dispatchEvent(new Event('input'));
  const st = ansicht.querySelector('[data-w-status]'); if (st) st.textContent = 'Eine Nachricht kam nicht an – ihr Text steht wieder im Feld.';
}
// Hintergrund-Prüfung (vom Start aus, höchstens alle 3 Stunden): Wartendes senden, offene Fragen und neue Antworten zählen
export async function pruefe() {
  await nachsenden().catch(() => {});
  const g = geraet(), w = W();
  const [fragen, posts] = await Promise.all([rpc('c2_fragen_offen', { p_geraet: g }), w.gesendet || w.posts.length ? rpc('c2_meine_posts', { p_geraet: g }) : Promise.resolve([])]);
  merke(fragen, posts); setzeW({ geprueft: Date.now() });
}
function merke(fragen, posts) {
  const w = W(); const offen = (fragen || []).filter((f) => !w.beantwortet.includes(f.id) && !w.warte.some((x) => x.frage_id === f.id));
  const teil = { fragen: offen, offen: offen.length };
  if (posts) { teil.posts = posts.slice(0, 60); teil.neuAntw = posts.filter((p) => p.antwort_claude && w.gesehen[p.id] !== kurzHash(p.antwort_claude)).length; }
  setzeW(teil);
}

// ---------- Seite ----------
let ansicht = null;
export async function seite(view, vorwahl, zurueck = '#/mehr') {
  ansicht = view; setzeW({ neuGesehen: VERSION }); await STIL; if (ansicht !== view) return;
  const w = W(); const e = { art: 'verbessern', bereich: 'allgemein', text: '', ...(w.entwurf || {}) };
  if (vorwahl && BER_NAME[vorwahl]) e.bereich = vorwahl;
  view.innerHTML = `${kopf('Wünsche', zurueck, 'wuensche')}<div class="wuensche" data-bereich="wuensche">
    <p class="einleitung">Hier schreibst du direkt an Claude, der Feinschliff baut: Was klappt nicht, was soll feiner werden, was fehlt dir? Claude liest es und verbessert die App.</p>
    <div id="w-fragen"></div>
    <section class="karte" id="w-melden"></section>
    <section class="karte" id="w-meine"><h3>Meine Nachrichten</h3><p class="leise w-legende">eingegangen → gelesen → umgesetzt</p><div id="w-liste"></div></section>
    <section class="karte w-neu" id="w-neu" hidden></section></div>`;
  formular(e); zurueckZeigen();
  fragenZeigen(w.fragen); listeZeigen();
  neuKasten().catch(() => {});
  walkieAuffrischen();
  if (vorwahl && BER_NAME[vorwahl]) requestAnimationFrame(() => view.querySelector('#w-melden')?.scrollIntoView({ block: 'start' }));
  // frisch vom Netz (im Hintergrund, die Seite steht schon)
  try {
    await nachsenden(); zurueckZeigen();
    const g = geraet(); const [fragen, posts] = await Promise.all([rpc('c2_fragen_offen', { p_geraet: g }), rpc('c2_meine_posts', { p_geraet: g })]);
    if (ansicht !== view || !view.isConnected) return;
    merke(fragen, posts); setzeW({ geprueft: Date.now() });
    if (!view.querySelector('.w-frage [aria-pressed="true"], .w-frage textarea:not(:placeholder-shown)')) fragenZeigen(W().fragen);
    listeZeigen(); walkieAuffrischen();
  } catch { if (view.isConnected) listeZeigen(); }
}
addEventListener('online', () => {   // Netz wieder da: Wartendes senden, Liste auffrischen
  if (!W().warte.length) return;
  nachsenden().then(async () => {
    if (!ansicht?.isConnected) return; zurueckZeigen();
    try { merke(null, await rpc('c2_meine_posts', { p_geraet: geraet() })); } catch { /* später */ }
    listeZeigen(); walkieAuffrischen();
  }).catch(() => {});
});

// ---------- Etwas melden ----------
function formular(e) {
  const box = ansicht.querySelector('#w-melden'); const ph = (a) => (ARTEN.find((x) => x[0] === a) || ARTEN[1])[2];
  box.innerHTML = `<h3>${SYM.senden} Etwas melden</h3>
    <div class="chips w-arten" role="group" aria-label="Was möchtest du melden?">${ARTEN.map(([id, n]) => `<button class="chip-knopf" data-art="${id}" aria-pressed="${e.art === id}">${n}</button>`).join('')}</div>
    <label class="klein">Bereich<select class="feld" data-w-bereich>${BEREICHE_W.map(([id, n]) => `<option value="${id}"${e.bereich === id ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select></label>
    <label class="klein">Deine Nachricht<textarea class="feld" rows="5" maxlength="${MAX}" data-w-text placeholder="${esc(ph(e.art))}">${esc(e.text)}</textarea></label>
    <p class="w-hinweis">${SYM.schloss}<span>Deine Nachricht geht nur an Claude (und den Betreiber der App). Kein Name nötig.</span><span class="w-zahl" data-w-zahl></span></p>
    <button class="knopf haupt breit" data-w-senden>${SYM.senden} Senden</button>
    <p class="w-status" data-w-status role="status" aria-live="polite"></p>`;
  const txt = box.querySelector('[data-w-text]'), sel = box.querySelector('[data-w-bereich]'), zahl = box.querySelector('[data-w-zahl]'), knopf = box.querySelector('[data-w-senden]'), st = box.querySelector('[data-w-status]');
  let art = e.art;
  const sichern = () => { setzeW({ entwurf: { art, bereich: sel.value, text: txt.value } }); zahl.textContent = txt.value.length > MAX - 400 ? `${txt.value.length} / ${MAX}` : ''; knopf.disabled = txt.value.trim().length < 2; };
  sichern();
  box.querySelector('.w-arten').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-art]'); if (!b) return; art = b.dataset.art;
    box.querySelectorAll('[data-art]').forEach((x) => x.setAttribute('aria-pressed', x === b)); txt.placeholder = ph(art); sichern();
  });
  txt.addEventListener('input', sichern); sel.addEventListener('change', sichern);
  knopf.addEventListener('click', async () => {
    const eintrag = { art, bereich: sel.value, text: txt.value.trim().slice(0, MAX) }; if (eintrag.text.length < 2) return;
    knopf.disabled = true; st.textContent = 'Wird gesendet …';
    const r = await sendeOderMerke(eintrag);
    if (r.fehler) { st.textContent = fehlerText(r.fehler); knopf.disabled = false; return; }
    setzeW({ entwurf: { art, bereich: sel.value, text: '' } });
    box.innerHTML = `<div class="w-angekommen">${r.ok ? SYM.haken : SYM.uhr}<div><b>${r.ok ? 'Angekommen – Claude kümmert sich darum.' : 'Gespeichert – geht automatisch raus, sobald du wieder Internet hast.'}</b>
      <p class="leise">Unter „Meine Nachrichten“ siehst du, wann Claude sie gelesen oder umgesetzt hat.</p></div></div><button class="knopf zweit breit" data-w-nochmal>Noch etwas melden</button>`;
    box.querySelector('[data-w-nochmal]').addEventListener('click', () => { formular({ art, bereich: sel.value, text: '' }); zurueckZeigen(); });
    if (r.ok) { try { merke(null, await rpc('c2_meine_posts', { p_geraet: geraet() })); } catch { /* Liste bleibt */ } }
    listeZeigen();
  });
}

// ---------- Rückfragen von Claude ----------
let uebersprungen = new Set();
function fragenZeigen(fragen) {
  const box = ansicht?.querySelector('#w-fragen'); if (!box) return;
  const w = W(); const l = (fragen || []).filter((f) => !w.beantwortet.includes(f.id) && !w.warte.some((x) => x.frage_id === f.id));
  if (!l.length) { box.innerHTML = ''; return; }
  const rest = l.filter((f) => !uebersprungen.has(f.id)); const f = rest[0] || l[0]; if (!rest.length) uebersprungen = new Set();
  const i = l.indexOf(f);
  box.innerHTML = `<section class="karte w-frage" data-fid="${f.id}"><span class="ueber">${SYM.wunsch} Frage von Claude${l.length > 1 ? ` · ${i + 1} von ${l.length}` : ''}</span>
    <h3>${esc(f.text)}</h3>${f.mehrfach ? '<p class="leise">Mehrere Antworten möglich.</p>' : ''}
    ${f.optionen?.length ? `<div class="optionen w-optionen">${f.optionen.map((o) => `<button class="option kurz" data-opt="${esc(o)}" aria-pressed="false">${esc(o)}</button>`).join('')}</div>` : ''}
    ${f.freitext ? `<label class="klein">${f.optionen?.length ? 'Möchtest du etwas dazu sagen? (freiwillig)' : 'Deine Antwort'}<textarea class="feld" rows="3" maxlength="${MAX}" data-f-text placeholder=" "></textarea></label>` : ''}
    <div class="knopfzeile"><button class="knopf haupt" data-f-senden disabled>Antwort senden</button>${l.length > 1 ? '<button class="textknopf" data-f-spaeter>Später</button>' : ''}</div>
    <p class="w-status" data-f-status role="status" aria-live="polite"></p></section>`;
  const k = box.querySelector('.w-frage'), los = k.querySelector('[data-f-senden]'), txt = k.querySelector('[data-f-text]'), st = k.querySelector('[data-f-status]');
  const wahl = () => [...k.querySelectorAll('[data-opt][aria-pressed="true"]')].map((b) => b.dataset.opt);
  const pruef = () => { los.disabled = !wahl().length && !(txt?.value.trim()); };
  k.querySelector('.w-optionen')?.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-opt]'); if (!b) return;
    const an = b.getAttribute('aria-pressed') !== 'true';
    if (!f.mehrfach) k.querySelectorAll('[data-opt]').forEach((x) => x.setAttribute('aria-pressed', 'false'));
    b.setAttribute('aria-pressed', String(an)); pruef();
  });
  txt?.addEventListener('input', pruef);
  k.querySelector('[data-f-spaeter]')?.addEventListener('click', () => { uebersprungen.add(f.id); fragenZeigen(W().fragen); });
  los.addEventListener('click', async () => {
    los.disabled = true; st.textContent = 'Wird gesendet …';
    const r = await sendeOderMerke({ art: 'antwort', bereich: 'allgemein', text: (txt?.value || '').trim().slice(0, MAX), wahl: wahl(), frage_id: f.id });
    if (r.fehler && !/frage unbekannt/.test(r.fehler.server)) { st.textContent = fehlerText(r.fehler); los.disabled = false; return; }
    setzeW({ beantwortet: [...W().beantwortet, f.id].slice(-200) }); merke(W().fragen, null);
    k.innerHTML = `<div class="w-angekommen">${r.ok ? SYM.haken : SYM.uhr}<div><b>${r.gemerkt ? 'Gespeichert – geht raus, sobald du wieder Internet hast.' : 'Danke!'}</b><p class="leise">${W().fragen.length ? 'Gleich kommt die nächste Frage.' : 'Alle Fragen beantwortet.'}</p></div></div>`;
    walkieAuffrischen(); listeZeigen();
    setTimeout(() => { if (k.isConnected) fragenZeigen(W().fragen); }, 1400);
  });
}

// ---------- Meine Nachrichten ----------
const datum = (t) => { const d = new Date(t); return isNaN(d) ? '' : d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }); };
function listeZeigen() {
  const box = ansicht?.querySelector('#w-liste'); if (!box) return;
  const w = W();
  const alle = [...w.warte.map((x) => ({ ...x, id: 'w' + x.lid, eingang: x.zeit, status: 'wartet', frage: w.fragen.find((f) => f.id === x.frage_id)?.text || '' })), ...w.posts];
  if (!alle.length) { box.innerHTML = '<p class="leise">Noch keine Nachrichten. Was du schickst, erscheint hier – mit Status und, wenn nötig, einer Antwort von Claude.</p>'; return; }
  const gesehen = { ...w.gesehen };
  box.innerHTML = `<ul class="w-posts">${alle.map((p) => {
    const neu = p.antwort_claude && gesehen[p.id] !== kurzHash(p.antwort_claude);
    if (p.antwort_claude) gesehen[p.id] = kurzHash(p.antwort_claude);
    const inhalt = [p.wahl?.length ? p.wahl.join(', ') : '', p.text].filter(Boolean).join(' – ');
    return `<li class="w-post" data-status="${esc(p.status)}"><div class="w-post-kopf"><span class="chip">${esc(ART_NAME[p.art] || p.art)}</span><span class="leise">${esc(BER_NAME[p.bereich] || p.bereich)} · ${esc(datum(p.eingang))}</span><span class="w-pill s-${esc(p.status)}">${esc(STATUS[p.status] || p.status)}</span></div>
      ${p.frage ? `<p class="leise w-post-frage">${p.art === 'umfrage' ? '' : 'Frage: '}${esc(p.frage)}</p>` : ''}${inhalt ? `<p class="w-post-text">${esc(inhalt)}</p>` : ''}
      ${p.antwort_claude ? `<div class="w-antwort">${neu ? '<span class="chip w-neu-chip">Neu</span> ' : ''}<b>Claude:</b> ${esc(p.antwort_claude)}</div>` : ''}</li>`;
  }).join('')}</ul>`;
  setzeW({ gesehen, neuAntw: 0 });
}

// ---------- Neu in dieser Version (+ kurze Bewertung) ----------
async function neuKasten() {
  const box = ansicht?.querySelector('#w-neu'); if (!box) return;
  const d = await (await fetch('neu.json', { cache: 'no-cache' })).json(); const v = d.versionen?.[0]; if (!v || !box.isConnected) return;
  const w = W(); const punkt = (p, bewerten) => `<li data-nid="${esc(p.id)}"><b>${esc(p.titel)}</b>${p.text ? `<span class="leise"> – ${esc(p.text)}</span>` : ''}
    ${bewerten ? `<div class="w-bewerten" role="group" aria-label="Wie findest du das?">${w.umfrage[p.id] ? `<span class="leise">${SYM.haken} ${esc(w.umfrage[p.id])}</span>` : BEWERTUNG.map((b) => `<button class="chip-knopf klein" data-bew="${esc(b)}">${b}</button>`).join('')}</div>` : ''}</li>`;
  box.hidden = false;
  box.innerHTML = `<h3>${SYM.stern} Neu in Version ${esc(v.version)}</h3><ul class="w-neu-liste">${v.punkte.map((p) => punkt(p, true)).join('')}</ul>
    ${d.versionen.length > 1 ? `<details><summary>Frühere Versionen</summary>${d.versionen.slice(1).map((x) => `<h4>${esc(x.version)}</h4><ul class="w-neu-liste">${x.punkte.map((p) => punkt(p, false)).join('')}</ul>`).join('')}</details>` : ''}`;
  box.addEventListener('click', async (ev) => {
    const b = ev.target.closest('[data-bew]'); if (!b) return; const li = b.closest('[data-nid]'); const p = v.punkte.find((x) => x.id === li.dataset.nid); if (!p) return;
    li.querySelectorAll('[data-bew]').forEach((x) => { x.disabled = true; });
    const r = await sendeOderMerke({ art: 'umfrage', bereich: p.bereich || 'allgemein', text: p.titel, wahl: [b.dataset.bew], nid: p.id });
    if (r.fehler) { li.querySelectorAll('[data-bew]').forEach((x) => { x.disabled = false; }); return; }
    setzeW({ umfrage: { ...W().umfrage, [p.id]: b.dataset.bew } });
    li.querySelector('.w-bewerten').innerHTML = `<span class="leise">${SYM.haken} ${esc(b.dataset.bew)} – danke!</span>`;
    listeZeigen();
  });
}
