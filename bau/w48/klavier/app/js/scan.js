// scan.js – „Noten aus Foto“ direkt in der Klavier-Lernhilfe: #scan (Foto → Zeilen → KI-Lesen → Ergebnis)
// und #scan/takt/<n> (Korrektur: links das Bild des Takts, rechts die erkannten Noten im eigenen Notensatz).
// Bildvorbereitung läuft im Gerät (scan-bild.js). Die KI gibt es nur in der Claude-Fassung (window.claude.use('sample')).
// Aufrufe nur nach einem Tipp, nie in einer Schleife; Fehler mit {code} werden ehrlich angezeigt.
import { seiteVorbereiten, taktFuerKi, taktZeigen } from './scan-bild.js';
import * as KI from './scan-ki.js';
import { zeichne, markiere } from './notensatz.js';
import { notenName } from './akkorde.js';

const MAX_SEITEN = 8, MAX_NACHLESEN = 12, GLEICHZEITIG = 2, MAX_BILD = 40 * 1048576;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (s, el = document) => el.querySelector(s);
const ruhig = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };

// ───────── Symbole (SVG) ─────────
const I = (d, k = 'ico') => `<svg class="${k}" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const S_ = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const ICO = {
  zurueck: I(`<path d="M15 5l-7 7 7 7" ${S_} stroke-width="2.4"/>`),
  kamera: I(`<path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H8l1.6-2.2h4.8L16 6h1.5A2.5 2.5 0 0 1 20 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5z" ${S_}/><circle cx="12" cy="13" r="3.6" ${S_}/>`),
  plus: I(`<path d="M12 5v14M5 12h14" ${S_}/>`, 'ico-k'),
  x: I(`<path d="M7 7l10 10M17 7L7 17" ${S_} stroke-width="2.2"/>`, 'ico-k'),
  ok: I(`<path d="M5 12.5l4.2 4.2L19 7" ${S_} stroke-width="2.6"/>`, 'ico-k'),
  warn: I(`<path d="M12 4l9 16H3z" ${S_}/><path d="M12 10v4.5" ${S_}/><circle cx="12" cy="17.3" r="1.1" fill="currentColor"/>`, 'ico-k'),
  lesen: I(`<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" ${S_}/><path d="M7 10h10M7 14h10" ${S_} stroke-width="1.6"/><circle cx="10" cy="14" r="1.6" fill="currentColor"/>`),
  stopp: I('<rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor"/>', 'ico-k'),
  neu: I(`<path d="M19 8a7.5 7.5 0 1 0 1 6" ${S_}/><path d="M20 3.5V8h-4.5" ${S_}/>`, 'ico-k'),
  hoch: I(`<path d="M6 15l6-6 6 6" ${S_} stroke-width="2.4"/>`, 'ico-k'),
  runter: I(`<path d="M6 9l6 6 6-6" ${S_} stroke-width="2.4"/>`, 'ico-k'),
  links: I(`<path d="M15 5l-7 7 7 7" ${S_} stroke-width="2.4"/>`, 'ico-k'),
  rechts: I(`<path d="M9 5l7 7-7 7" ${S_} stroke-width="2.4"/>`, 'ico-k'),
  weg: I(`<path d="M5 7h14M10 11v6M14 11v6M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M9 7V4h6v3" ${S_}/>`, 'ico-k'),
  zurueckNehmen: I(`<path d="M9 7L4.5 11.5 9 16" ${S_}/><path d="M5 11.5h9a5 5 0 0 1 0 10h-2" ${S_}/>`, 'ico-k'),
  b: I(`<path d="M9 3.5v16c4.2-1.6 7.6-3.7 7.6-6.6 0-2.6-3-3.4-7.6-.6" ${S_} stroke-width="2.1"/>`, 'ico-k'),
  aufl: I(`<path d="M9 3.5v13l6-1.8M15 20.5v-13l-6 1.8" ${S_} stroke-width="2"/>`, 'ico-k'),
  kreuz: I(`<path d="M10 4v16M14.5 3v16M6.5 10.5l11-2.8M6.5 16.3l11-2.8" ${S_} stroke-width="2"/>`, 'ico-k'),
  akkord: I('<ellipse cx="11" cy="17" rx="3.6" ry="2.6" transform="rotate(-20 11 17)" fill="currentColor"/><ellipse cx="11" cy="11" rx="3.6" ry="2.6" transform="rotate(-20 11 11)" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M14.4 16.2V3.5" stroke="currentColor" stroke-width="1.8"/><path d="M19 9v6M16 12h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>', 'ico-k'),
  danach: I('<ellipse cx="7" cy="16" rx="3.2" ry="2.4" transform="rotate(-20 7 16)" fill="currentColor"/><path d="M10 15.3V5" stroke="currentColor" stroke-width="1.8"/><path d="M18 8v8M14 12h8" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>', 'ico-k'),
  pause: I('<path d="M10 4l4 4.6-3 3.4 4 5c-2.6-1.3-5 .6-2.4 3.5C8.8 18 9 15 12.2 15.6L9 11.8l3-3.4z" fill="currentColor"/>', 'ico-k'),
  bogen: I(`<path d="M4 13c3.5 5 12.5 5 16 0" ${S_} stroke-width="2.2"/>`, 'ico-k'),
  punkt: I('<ellipse cx="9" cy="15" rx="4" ry="3" transform="rotate(-20 9 15)" fill="currentColor"/><circle cx="17.5" cy="14" r="2" fill="currentColor"/>', 'ico-k'),
  triole: I('<text x="12" y="16.5" text-anchor="middle" font-size="13" font-weight="800" fill="currentColor" font-family="system-ui,sans-serif">3</text><path d="M4 9V6h16v3" fill="none" stroke="currentColor" stroke-width="1.6"/>', 'ico-k'),
  info: I(`<circle cx="12" cy="12" r="9" ${S_}/><path d="M12 11v6" ${S_}/><circle cx="12" cy="7.6" r="1.2" fill="currentColor"/>`, 'ico-k'),
  zeile: I(`<rect x="2.5" y="7" width="19" height="10" rx="2" ${S_}/><rect x="9" y="8.5" width="6" height="7" rx="1" fill="currentColor" opacity=".35"/>`, 'ico-k'),
};
/** Notenwert-Symbole für die Dauer-Knöpfe */
const wertIco = (d) => {
  const hohl = d <= 2, hals = d >= 2, fahnen = d >= 16 ? 2 : d >= 8 ? 1 : 0;
  let s = `<ellipse cx="9" cy="17" rx="3.9" ry="2.8" transform="rotate(-20 9 17)" ${hohl ? 'fill="none" stroke="currentColor" stroke-width="1.9"' : 'fill="currentColor"'}/>`;
  if (hals) s += '<path d="M12.6 16.2V3.8" stroke="currentColor" stroke-width="1.9"/>';
  for (let k = 0; k < fahnen; k++) s += `<path d="M12.6 ${3.8 + k * 4}c1.4 2.6 4.8 3.4 4.4 7" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>`;
  return I(s, 'ico-k');
};

// ───────── Zustand (bleibt, solange die App offen ist) ─────────
const S = {
  seiten: [], takte: [], grund: { key: null, time: null, clefs: null }, titel: '',
  ki: { zustand: 'pruefe', sample: null, limits: null, tier: 'complex', sperre: '' },
  job: null, meldung: '', stueck: null, pruef: { i: 0, sel: null, ganzeZeile: false }, rueck: new Map(),
};
let naechsteId = 1;
let root = null, opt = {}, renderGeplant = false;

const STATUS_TEXT = { offen: 'noch nicht gelesen', sicher: 'sicher', geprueft: 'geprüft', markiert: 'markiert', unleserlich: 'unleserlich', auffaellig: 'auffällig' };
const istSicher = (t) => t.status === 'sicher' || t.status === 'geprueft';
const istMarkiert = (t) => t.status === 'markiert' || t.status === 'unleserlich' || t.status === 'auffaellig';

// ───────── KI-Laufzeit ─────────
let kiVersprechen = null;
function kiStart() {
  if (kiVersprechen) return kiVersprechen;
  kiVersprechen = (async () => {
    const c = typeof window !== 'undefined' ? window.claude : null;
    if (!c || typeof c.use !== 'function') { S.ki.zustand = 'lokal'; return; }
    let sample = null;
    try { sample = await c.use('sample'); } catch { sample = null; }
    if (!sample) { S.ki.zustand = 'aus'; return; }
    let lim = null;
    try { lim = await sample.limits(); } catch { lim = null; }
    S.ki.sample = sample; S.ki.limits = lim;
    if (!lim || !lim.images) { S.ki.zustand = 'ohneBild'; return; }
    S.ki.tier = !lim.modelTiers || lim.modelTiers.includes('complex') ? 'complex' : 'default';
    S.ki.zustand = 'da';
  })().finally(plane);
  return kiVersprechen;
}
const SPERR = {
  not_granted: 'Du hast der Seite die Nutzung von Claude nicht erlaubt. Die Erkennung bleibt aus, bis du die Seite neu öffnest.',
  sampling_disabled: 'Claude ist für dieses Konto gerade nicht verfügbar.',
  not_declared: 'Diese Fassung der Seite darf Claude nicht fragen.',
  capability_disabled: 'Claude ist in dieser Ansicht nicht nutzbar.',
  capability_removed: 'Claude ist in dieser Ansicht nicht nutzbar.',
  images_unavailable: 'In dieser Ansicht können keine Bilder an Claude geschickt werden.',
};
const FEHLER = {
  image_rejected: 'Das Bild wurde nicht angenommen. Versuche ein anderes Foto.',
  refused: 'Claude hat diesen Ausschnitt nicht bearbeitet.',
  empty_completion: 'Keine Antwort bekommen.',
  prompt_too_large: 'Die Anfrage war zu groß.',
  session_expired: 'Bitte melde dich neu an und tippe dann noch einmal.',
  invalid_request: 'Die Anfrage war fehlerhaft (bitte melden).',
  transform_error: 'Das Bild ließ sich nicht vorbereiten.',
  queue_overflow: 'Zu viele Anfragen auf einmal.',
};
class Halt extends Error { constructor(text, code) { super(text); this.text = text; this.code = code; } }

async function frage(prompt, bilder, { onText, neu = false, job } = {}) {
  const lim = S.ki.limits?.images;
  for (const b of bilder) if (lim?.maxInputBytes && b.size > lim.maxInputBytes) throw new Halt('Ein Bildausschnitt ist zu groß für die Erkennung.', 'gross');
  const ctl = new AbortController();
  job?.ctl.add(ctl);
  const o = { images: bilder, modelTier: S.ki.tier, signal: ctl.signal };
  if (onText) o.onText = onText;
  if (neu) o.cache = false;
  if (job) job.aufrufe++;
  try {
    const r = await S.ki.sample(prompt, o);
    if (ctl.signal.aborted) throw { code: 'cancelled' };
    return r;
  } catch (e) {
    const code = (e && e.code) || 'upstream_error';
    if (code === 'cancelled') throw new Halt('Angehalten.', 'cancelled');
    if (SPERR[code]) { S.ki.sperre = SPERR[code]; S.ki.zustand = code === 'images_unavailable' ? 'ohneBild' : 'gesperrt'; throw new Halt(SPERR[code], code); }
    if (code === 'rate_limited') throw new Halt(e.reason === 'usage_limit' ? 'Dein Nutzungslimit ist erreicht. Versuche es später noch einmal.' : 'Gerade zu viele Anfragen. Warte eine Minute und tippe dann auf „Weiter lesen“.', code);
    if (code === 'session_expired') throw new Halt(FEHLER.session_expired, code);
    const f = new Error(FEHLER[code] || 'Die Verbindung ist abgebrochen.');
    f.code = code;
    throw f;
  } finally { job?.ctl.delete(ctl); }
}

/**
 * Antwort lesen. Schickt Claude trotz Anweisung MusicXML, wird es – wenn es vollständig und gültig ist – mit dem
 * eigenen MusicXML-Leser übersetzt; sonst bleiben die Takte leer und werden als „nicht im erwarteten Format“ markiert.
 */
async function antwortLesen(text) {
  const a = KI.leseAntwort(text);
  if (a.takte.length || !a.format) return a;
  const t = String(text), start = t.search(/<\?xml|<score-partwise/i), ende = t.lastIndexOf('</score-partwise>');
  if (start < 0 || ende < start) return a;
  try {
    const { einlesen } = await import('./einlesen.js');
    const st = await einlesen(t.slice(start, ende + '</score-partwise>'.length), 'antwort.musicxml');
    if (!st.takte?.length || !st.noten?.length) return a;
    const t0 = st.takte[0], key = t0.tonart?.quinten ?? 0;
    const z = [`CLEFS ${t0.schluessel?.oben || 'G'} ${t0.schluessel?.unten || 'F'}`, `KEY ${key}`, `TIME ${(t0.taktart || [4, 4]).join('/')}`];
    st.takte.forEach((tk, i) => z.push(KI.taktAlsText(st, tk.nr, { key }).replace(/^M-?\d+/, 'M' + (i + 1))));
    const b = KI.leseAntwort(z.join('\n'));
    if (!b.takte.length) return a;
    b.ausXml = true;
    return b;
  } catch { return a; }
}

// ───────── Seiten (Fotos) ─────────
export function dateienDazu(liste) {
  const dateien = [...(liste || [])];
  const pdf = dateien.filter((f) => /pdf$/i.test(f.type) || /\.pdf$/i.test(f.name || ''));
  const bilder = dateien.filter((f) => /^image\//.test(f.type) || /\.(jpe?g|png|webp|gif|heic|heif|bmp)$/i.test(f.name || ''));
  if (pdf.length && !bilder.length) S.meldung = 'PDF kann diese Seite nicht selbst öffnen. Mach von der Notenseite ein Bildschirmfoto (oder exportiere sie als Bild) und wähle das Bild.';
  else if (!bilder.length) S.meldung = 'Bitte ein Bild wählen (Foto, JPEG oder PNG).';
  else S.meldung = '';
  for (const f of bilder) {
    if (S.seiten.length >= MAX_SEITEN) { S.meldung = `Höchstens ${MAX_SEITEN} Seiten auf einmal.`; break; }
    if (f.size > MAX_BILD) { S.meldung = `„${f.name || 'Bild'}“ ist zu groß (${Math.round(f.size / 1048576)} MB, bis ${MAX_BILD / 1048576} MB gehen). Ein normales Handyfoto oder ein Bildschirmfoto reicht.`; continue; }
    const p = { id: naechsteId++, name: f.name || 'Foto', status: 'bereite', schritt: 'wartet', daten: null, url: '', fehler: '' };
    S.seiten.push(p);
    vorbereiten(p, f);
  }
  plane();
}
let bildKette = Promise.resolve();
function vorbereiten(p, f) {
  bildKette = bildKette.then(async () => {
    if (!S.seiten.includes(p)) return;
    try {
      const d = await seiteVorbereiten(f, { schritt: (t) => { p.schritt = t; plane(); } });
      if (!S.seiten.includes(p)) return; // während der Vorbereitung entfernt
      p.daten = d; p.url = URL.createObjectURL(d.vorschau.blob);
      p.status = 'fertig';
    } catch (e) {
      p.status = 'fehler'; p.fehler = (e && e.text) || 'Das Bild ließ sich nicht vorbereiten.';
    }
    takteNeu();
    plane();
  });
}
function seiteWeg(id) {
  if (S.job?.laeuft) return;
  const i = S.seiten.findIndex((p) => p.id === id);
  if (i < 0) return;
  const [p] = S.seiten.splice(i, 1);
  if (p.url) setTimeout(() => URL.revokeObjectURL(p.url), 1500);
  takteNeu();
  if (!S.takte.some((t) => t.lesung)) { S.grund = { key: null, time: null, clefs: null }; S.rueck.clear(); S.job = null; if (!S.seiten.length) { S.titel = ''; const ti = root?.querySelector('#scTitel'); if (ti) ti.value = ''; } }
  plane();
}

/** Takt-Liste aus den vorbereiteten Seiten (bestehende Lesungen bleiben erhalten). */
function takteNeu() {
  const alt = new Map(S.takte.map((t) => [t.schluessel, t]));
  const neu = [];
  for (const p of S.seiten) {
    if (p.status !== 'fertig') continue;
    const d = p.daten;
    if (d.zeilen.length) d.zeilen.forEach((z, zi) => z.takte.forEach((_, k) => neu.push(alt.get(`${p.id}|${zi}|${k}`) || { schluessel: `${p.id}|${zi}|${k}`, seite: p.id, zeile: zi, k, lesung: null, status: 'offen', gruende: [], varianten: [], lesungen: 0 })));
    else {
      const eig = S.takte.filter((t) => t.seite === p.id && t.zeile === 'ganz');
      if (eig.length) neu.push(...eig);
      else if (d.ganz && !p.ohneTakte) neu.push({ schluessel: `${p.id}|ganz|0`, seite: p.id, zeile: 'ganz', k: null, lesung: null, status: 'offen', gruende: [], varianten: [], lesungen: 0, platzhalter: true });
    }
    for (const t of S.takte) if (t.seite === p.id && t.extra && !neu.includes(t)) neu.push(t);
  }
  // Reihenfolge: Seite, Zeile, Takt (Zusatz-Takte hinter ihrer Zeile)
  const seitenRang = new Map(S.seiten.map((p, i) => [p.id, i]));
  neu.sort((a, b) => (seitenRang.get(a.seite) - seitenRang.get(b.seite)) || ((a.zeile === 'ganz' ? 0 : a.zeile) - (b.zeile === 'ganz' ? 0 : b.zeile)) || ((a.k ?? 0) + (a.extra || 0) * 0.001 - (b.k ?? 0) - (b.extra || 0) * 0.001));
  S.takte = neu;
  nummern();
  S.stueck = null;
}
function nummern() { S.takte.forEach((t, i) => { t.nr = i + 1; }); }
const seiteVon = (t) => S.seiten.find((p) => p.id === t.seite);
const zeileVon = (t) => { const p = seiteVon(t); return p && t.zeile !== 'ganz' ? p.daten.zeilen[t.zeile] : null; };
const hatBild = (t) => !!zeileVon(t) && t.k != null && !t.extra;

/** Kontext je Takt: Tonart, Taktart, Schlüssel (aus den Zeilen-Antworten und Wechseln). */
function kontexte() {
  let key = S.grund.key ?? 0, time = S.grund.time || '4/4', clefs = S.grund.clefs || ['G', 'F'];
  return S.takte.map((t) => {
    if (t.zeilenKopf) { if (t.zeilenKopf.key != null) key = t.zeilenKopf.key; if (t.zeilenKopf.time) time = t.zeilenKopf.time; if (t.zeilenKopf.clefs) clefs = t.zeilenKopf.clefs; }
    if (t.lesung?.key != null) key = t.lesung.key;
    if (t.lesung?.time) time = t.lesung.time;
    const z = zeileVon(t);
    const ctx = { key, time, clefs: [...clefs], staves: z ? z.staves.length : 2 };
    // Schlüsselwechsel im Takt wirken ab dem nächsten Takt
    if (Array.isArray(t.lesung?.stimmen?.U)) for (const ev of t.lesung.stimmen.U) if (ev.schl) clefs = [ev.schl, clefs[1]];
    if (Array.isArray(t.lesung?.stimmen?.L)) for (const ev of t.lesung.stimmen.L) if (ev.schl) clefs = [clefs[0], ev.schl];
    return ctx;
  });
}

/** gefüllte Notenköpfe im Bild für einen Takt (grobe Pixel-Zählung) */
function pixelKoepfe(t, ctx, i) {
  const z = zeileVon(t);
  if (!z || t.k == null || t.extra) return null;
  const tk = z.takte[t.k];
  const ersteZeile = S.takte.findIndex((x) => x.seite === t.seite && x.zeile === t.zeile) === i && i === 0;
  const ab = t.k === 0 ? z.x0 + (4.0 + Math.abs(ctx.key || 0) * 1.0 + (ersteZeile ? 2.6 : 0)) * z.g : tk.x0 + 0.3 * z.g;
  const n = { U: 0, L: 0 };
  for (const f of z.koepfe) if (f.x > ab && f.x < tk.x1 - 0.2 * z.g) n[f.staff === 0 ? 'U' : 'L'] += f.n;
  if (z.staves.length === 1) delete n.L;
  return n;
}

function pruefen(t, i, kx, { ohneZeile = false } = {}) {
  const ctx = kx[i];
  if (!t.lesung) return [{ art: 'leer', text: 'Für diesen Takt gibt es noch keine Lesung.' }, ...(t.zeilenGrund && !ohneZeile ? [t.zeilenGrund] : [])];
  const g = KI.pruefeTakt(t.lesung, { ...ctx, erster: i === 0, letzter: i === S.takte.length - 1, pixel: pixelKoepfe(t, ctx, i) });
  if (t.zeilenGrund && !ohneZeile) g.push(t.zeilenGrund);
  return g;
}
const harteGruende = (g) => g.filter((x) => x.art !== 'bild' && x.art !== 'info');

// ───────── Erkennen ─────────
function einheiten() {
  const aus = [];
  for (const p of S.seiten) {
    if (p.status !== 'fertig') continue;
    const d = p.daten;
    if (d.zeilen.length) d.zeilen.forEach((z, zi) => { if (S.takte.some((t) => t.seite === p.id && t.zeile === zi && t.status === 'offen')) aus.push({ p, zi, z }); });
    else if (S.takte.some((t) => t.seite === p.id && t.zeile === 'ganz' && t.status === 'offen')) aus.push({ p, zi: 'ganz', z: null });
  }
  return aus;
}
const zuLesen = () => einheiten().length;
const nochAuffaellig = () => S.takte.filter((t) => t.status === 'auffaellig' && hatBild(t)).length;

async function erkennen() {
  if (S.job?.laeuft || S.ki.zustand !== 'da') return;
  const job = S.job = { laeuft: true, ctl: new Set(), aufrufe: 0, text: 'Zeilen werden gelesen …', fehler: '', aktiv: new Map(), nach: 0, nachGesamt: 0 };
  S.meldung = '';
  plane();
  try {
    const liste = einheiten();
    if (S.grund.time == null && liste.length) await leseZeile(liste.shift(), job);
    await parallel(liste, GLEICHZEITIG, (e) => leseZeile(e, job));
    await nachlesen(job);
    job.text = '';
  } catch (e) {
    if (e instanceof Halt) { job.fehler = e.code === 'cancelled' ? '' : e.text; job.text = e.code === 'cancelled' ? 'Angehalten.' : ''; }
    else { job.fehler = (e && e.message) || 'Unbekannter Fehler'; }
    for (const c of job.ctl) c.abort();
  }
  job.laeuft = false; job.aktiv.clear();
  S.stueck = null;
  plane();
}
async function parallel(liste, n, fn) {
  let i = 0, halt = null;
  const arbeiter = async () => {
    while (i < liste.length && !halt) {
      const e = liste[i++];
      try { await fn(e); } catch (err) { if (err instanceof Halt) { halt = err; return; } }
    }
  };
  await Promise.all(Array.from({ length: Math.min(n, liste.length) }, arbeiter));
  if (halt) throw halt;
}
function stoppen() { if (!S.job?.laeuft) return; for (const c of S.job.ctl) c.abort(); }

async function leseZeile(e, job) {
  const { p, zi, z } = e;
  const eigene = S.takte.filter((t) => t.seite === p.id && t.zeile === zi && !t.extra);
  const von = eigene[0]?.nr ?? 1, bis = eigene[eigene.length - 1]?.nr ?? von;
  const zeilenAufSeite = p.daten.zeilen.length;
  const kx = kontexte();
  const vorher = S.takte.indexOf(eigene[0]) > 0 ? kx[S.takte.indexOf(eigene[0]) - 1] : null;
  const kontext = S.grund.time != null && vorher ? { key: vorher.key, time: vorher.time, clefs: vorher.clefs } : null;
  const schluessel = p.id + '|' + zi;
  const fort = { zeile: z ? `Zeile ${zi + 1}` : 'Ganze Seite', takte: 0, text: 'denkt nach …' };
  job.aktiv.set(schluessel, fort);
  plane();
  try {
    const blobs = z ? z.ki.map((k) => k.blob) : [p.daten.ganz.blob];
    const teile = z && z.ki.length > 1 ? z.ki.map((k) => ({ von: 1 + k.takte[0], bis: 1 + k.takte[k.takte.length - 1] })) : null; // blaue Nummern je Zeile (1 …)
    const maxN = S.ki.limits?.images?.maxCount || 1;
    const gruppen = blobs.length <= maxN ? [{ blobs, teile, von, bis, erst: 1 }] : z.ki.map((k, j) => ({ blobs: [k.blob], teile: null, von: von + teile[j].von - 1, bis: von + teile[j].bis - 1, erst: teile[j].von }));
    const antworten = [];
    for (const gr of gruppen) {
      const prompt = KI.zeilenAnweisung({ zeile: z ? zi + 1 : 1, zeilen: zeilenAufSeite || 1, von: gr.von, bis: gr.bis, staves: z ? z.staves.length : 2, kontext: antworten.length ? { ...kontext, key: antworten[0].key ?? kontext?.key, time: antworten[0].time ?? kontext?.time, clefs: antworten[0].clefs ?? kontext?.clefs } : kontext, teile: gr.teile, ganzeSeite: !z });
      const r = await frage(prompt, gr.blobs, { job, onText: ({ text }) => { fort.takte = (text.match(/^\s*M\s*\d+/gm) || []).length; fort.text = fort.takte ? `${fort.takte} Takt${fort.takte === 1 ? '' : 'e'} …` : 'schreibt …'; plane(); } });
      const a = await antwortLesen(r.text);
      a.abgeschnitten = r.truncated;
      // Nummern der Antwort (blau, je Bild ab 1 … bzw. ab dem ersten Takt des Teils) → Nummer innerhalb der Zeile
      if (gr.erst > 1 && a.takte.length && a.takte[0].nr === 1) for (const t of a.takte) t.nr += gr.erst - 1;
      antworten.push(a);
    }
    zeileEintragen(p, zi, z, antworten, eigene, von);
  } catch (err) {
    if (err instanceof Halt) throw err;
    const text = (err && err.message) || 'Lesen fehlgeschlagen.';
    if (!err?.code || err.code === 'upstream_error') {
      // Verbindung kurz weg: die Zeile bleibt offen, „Weiter lesen“ fragt sie mit einer Anfrage noch einmal
      for (const t of eigene) { if (t.status === 'offen') t.gruende = [{ art: 'fehler', text }]; }
      job.fehler = `${fort.zeile} konnte nicht gelesen werden (${text}) Tippe auf „Weiter lesen“, dann wird sie noch einmal gefragt.`;
    } else {
      for (const t of eigene) { t.status = 'markiert'; t.gruende = [{ art: 'fehler', text }]; }
      job.fehler = 'Eine Zeile konnte nicht gelesen werden: ' + text + ' Ihre Takte sind markiert – „Neu lesen“ im Takt hilft.';
    }
  } finally { job.aktiv.delete(schluessel); plane(); }
}

function zeileEintragen(p, zi, z, antworten, eigene, vonGesendet) {
  const a0 = antworten[0];
  const gelesen = antworten.flatMap((a) => a.takte);
  if (S.grund.time == null) {
    S.grund.key = a0.key ?? 0; S.grund.time = a0.time || '4/4'; S.grund.clefs = a0.clefs || ['G', 'F'];
  }
  if (!z) {
    // ganze Seite: Takte entstehen aus der Antwort
    const platz = S.takte.findIndex((t) => t.seite === p.id && t.zeile === 'ganz');
    const neue = gelesen.map((g, j) => ({ schluessel: `${p.id}|ganz|${j}`, seite: p.id, zeile: 'ganz', k: null, lesung: g, status: 'offen', gruende: [], varianten: [], lesungen: 1 }));
    if (!neue.length) {
      p.ohneTakte = true;
      p.kiHinweis = antworten.some((a) => a.keine) ? 'Claude hat auf diesem Bild keine Noten gefunden.' : 'Claude hat für dieses Bild keine lesbaren Takte geschickt. Versuche ein schärferes, gerades Foto.';
    }
    S.takte.splice(platz, S.takte.filter((t) => t.seite === p.id && t.zeile === 'ganz').length, ...neue);
    if (neue[0]) neue[0].zeilenKopf = { key: a0.key, time: a0.time, clefs: a0.clefs };
    nummern();
    bewerten(neue, 'Ganze Seite gelesen (keine Notenlinien gefunden) – bitte jeden Takt mit dem Original vergleichen.');
    return;
  }
  const N = eigene.length, M = gelesen.length;
  const keine = !M && antworten.some((a) => a.keine);
  let zuordnung = gelesen.slice(0, N), nachNummer = false;
  void vonGesendet;
  if (M !== N) {
    // die KI schreibt die blauen Nummern der Zeile (1 … N): danach zuordnen, wenn sie eindeutig passen
    const nrs = gelesen.map((g) => g.nr);
    const passend = nrs.every((n) => n >= 1 && n <= N) && new Set(nrs).size === nrs.length;
    if (passend) { zuordnung = Array(N).fill(null); for (const g of gelesen) zuordnung[g.nr - 1] = g; nachNummer = true; }
  }
  eigene.forEach((t, j) => { t.lesung = zuordnung[j] || null; t.lesungen = 1; t.zeilenGrund = null; t.zeilenKopf = null; });
  eigene[0].zeilenKopf = { key: a0.key, time: a0.time, clefs: a0.clefs };
  // zusätzliche Takte (KI fand mehr als die Taktstriche)
  for (const t of S.takte.filter((x) => x.seite === p.id && x.zeile === zi && x.extra)) S.takte.splice(S.takte.indexOf(t), 1);
  if (M > N && zuordnung.length === N && !zuordnung.includes(null)) {
    const nachDem = S.takte.indexOf(eigene[N - 1]);
    const extra = gelesen.slice(N, N + Math.max(4, N)).map((g, j) => ({ schluessel: `${p.id}|${zi}|x${j}`, seite: p.id, zeile: zi, k: eigene[N - 1].k, extra: j + 1, lesung: g, status: 'offen', gruende: [], varianten: [], lesungen: 1 }));
    S.takte.splice(nachDem + 1, 0, ...extra);
    eigene.push(...extra);
    nummern();
  }
  if (M !== N) {
    // Nummern passten eindeutig: nur die fehlenden Takte sind fraglich; sonst die ganze Zeile
    const grund = !M ? { art: 'format', text: keine ? 'Claude sieht in dieser Zeile keine Noten.' : 'Die Antwort kam nicht im erwarteten Format – für diese Zeile wurden keine Takte gelesen.' }
      : { art: 'taktzahl', text: `In dieser Zeile fand die App ${N} Takt${N === 1 ? '' : 'e'}, gelesen wurden ${M}.` };
    for (const t of eigene) if (!nachNummer || !t.lesung) t.zeilenGrund = grund;
  }
  if (antworten.some((a) => a.abgeschnitten)) for (const t of eigene.slice(-2)) t.zeilenGrund = { art: 'abgeschnitten', text: 'Die Antwort wurde abgeschnitten.' };
  bewerten(eigene);
  // nur ein Hinweis (kein Grund zum Nachlesen): der Inhalt ist Claudes Lesung, nur in anderer Schreibweise
  if (antworten.some((a) => a.ausXml)) for (const t of eigene) t.gruende.push({ art: 'info', text: 'Claude hat MusicXML statt des verlangten Formats geschickt – die App hat es umgewandelt.' });
  if (keine) for (const t of eigene) t.lesungen = 3; // nicht automatisch Takt für Takt nachfragen – „Neu lesen“ geht weiter
}

function bewerten(liste, info) {
  const kx = kontexte();
  for (const t of liste) {
    const i = S.takte.indexOf(t);
    if (i < 0) continue;
    t.gruende = pruefen(t, i, kx);
    if (info) t.gruende.push({ art: 'info', text: info });
    const hart = harteGruende(t.gruende);
    void hart;
    t.status = t.gruende.some((g) => g.art === 'unleserlich') ? 'unleserlich' : t.gruende.length ? 'auffaellig' : 'sicher';
    t.varianten = t.lesung ? [{ name: 'Lesung 1', lesung: KI.kopie(t.lesung) }] : [];
    t.wahl = 0;
  }
  S.stueck = null;
}

async function nachlesen(job, nur = null) {
  const kandidaten = nur ? [nur] : S.takte.filter((t) => (t.status === 'auffaellig' || t.status === 'unleserlich') && hatBild(t) && t.lesungen < 3);
  const liste = kandidaten.slice(0, nur ? 1 : MAX_NACHLESEN);
  for (const t of kandidaten.slice(liste.length)) if (t.status === 'auffaellig') t.status = 'markiert';
  job.nachGesamt = liste.length; job.nach = 0;
  for (const t of liste) {
    job.text = `Takt ${t.nr} genauer lesen (zweimal) …`;
    job.nach++;
    plane();
    await taktDoppelt(t, job);
  }
  for (const t of S.takte) if (t.status === 'auffaellig') t.status = 'markiert';
}

async function leseTakt(t, variante, job) {
  const z = zeileVon(t);
  const i = S.takte.indexOf(t), ctx = kontexte()[i];
  const bild = await taktFuerKi(z, t.k, { quinten: ctx.key, variante });
  const prompt = KI.taktAnweisung({ nr: t.nr, clefs: ctx.clefs, key: ctx.key, time: ctx.time, staves: ctx.staves, mitKopf: bild.mitKopf, auftakt: i === 0, variante });
  const r = await frage(prompt, [bild.blob], { neu: true, job });
  const a = await antwortLesen(r.text);
  // gemeint ist Takt t.nr (oder M1); schreibt Claude den Bezugs-Ausschnitt links mit ab, steht der Takt am Ende
  const g = a.takte.find((x) => x.nr === t.nr) || a.takte[a.takte.length - 1] || null;
  if (g) { if (t.lesung?.key != null) g.key = t.lesung.key; if (t.lesung?.time) g.time = t.lesung.time; }
  return g;
}

async function taktDoppelt(t, job) {
  const ergebnisse = await Promise.allSettled([leseTakt(t, 0, job), leseTakt(t, 1, job)]);
  const halt = ergebnisse.find((r) => r.status === 'rejected' && r.reason instanceof Halt);
  if (halt) throw halt.reason;
  const [A, B] = ergebnisse.map((r) => (r.status === 'fulfilled' ? r.value : null));
  t.lesungen += 2;
  entscheiden(t, A, B);
  plane();
}

/** Drei Lesungen (erste, A, B): zwei gleiche ohne harte Auffälligkeit → sicher; sonst die beste, markiert. */
function entscheiden(t, A, B) {
  const i = S.takte.indexOf(t), kx = kontexte(), ctx = kx[i];
  const eins = t.lesung;
  const kand = [{ name: t.bearbeitet ? 'Deine Fassung' : 'Lesung 1', lesung: eins }, { name: 'Lesung 2', lesung: A }, { name: 'Lesung 3', lesung: B }].filter((x) => x.lesung);
  const gr = (l) => { const alt = t.lesung; t.lesung = l; const g = pruefen(t, i, kx, { ohneZeile: true }); t.lesung = alt; return g; };
  const v = (a, b) => a && b && KI.vergleiche(a, b, ctx).gleich;
  let wahl = null, grund = '';
  const unl = (l) => l && gr(l).some((g) => g.art === 'unleserlich');
  if (v(A, B) && !harteGruende(gr(A)).length && !unl(A)) { wahl = A; grund = 'Zweimal unabhängig gleich gelesen.'; }
  else if (v(eins, A) && !harteGruende(gr(A)).length && !unl(A)) { wahl = A; grund = 'Zwei von drei Lesungen gleich.'; }
  else if (v(eins, B) && !harteGruende(gr(B)).length && !unl(B)) { wahl = B; grund = 'Zwei von drei Lesungen gleich.'; }
  // verschiedene Fassungen behalten (gleiche zusammenfassen)
  const eindeutig = [];
  for (const k of kand) if (!eindeutig.some((x) => KI.vergleiche(x.lesung, k.lesung, ctx).gleich)) eindeutig.push(k);
  if (wahl) {
    t.lesung = wahl; t.zeilenGrund = null; t.gruende = gr(wahl).concat([{ art: 'info', text: grund }]); t.status = 'sicher';
  } else {
    const bewertet = kand.map((k) => ({ ...k, g: gr(k.lesung) })).sort((a, b) => harteGruende(a.g).length - harteGruende(b.g).length || a.g.length - b.g.length);
    const beste = bewertet[0];
    if (beste) { t.lesung = beste.lesung; t.gruende = t.zeilenGrund ? beste.g.concat([t.zeilenGrund]) : beste.g; }
    if (eindeutig.length > 1) t.gruende.push({ art: 'verschieden', text: `Die Lesungen sind verschieden (${eindeutig.length} Fassungen) – bitte mit dem Bild vergleichen.` });
    t.status = beste && !unl(beste.lesung) ? 'markiert' : 'unleserlich';
  }
  t.varianten = eindeutig.map((k) => ({ name: k.name, lesung: KI.kopie(k.lesung) }));
  t.wahl = eindeutig.findIndex((k) => KI.vergleiche(k.lesung, t.lesung, ctx).gleich);
  t.lesung = KI.kopie(t.lesung);
  S.stueck = null;
}

// ───────── Stück bauen (Vorschau, Korrektur, Übernehmen) ─────────
function stueck() {
  if (S.stueck) return S.stueck;
  const kx = kontexte();
  const takte = S.takte.map((t, i) => {
    const ctx = kx[i];
    const R = () => [{ n: [], d: 1, p: 0, t: false, r: true, ganz: true }];
    const stimmen = {};
    const roh = t.lesung?.stimmen || {};
    for (const sk of KI.STIMMEN) if (roh[sk] !== undefined) stimmen[sk] = roh[sk] === '?' ? R() : roh[sk];
    if (!stimmen.U) stimmen.U = R();
    if (!stimmen.L && ctx.staves !== 1) stimmen.L = R();
    const aus = { stimmen, key: ctx.key, time: ctx.time };
    if (t.zeilenKopf?.clefs) aus.clefs = t.zeilenKopf.clefs;
    return aus;
  });
  S.stueck = KI.baueStueck(takte, { key: S.grund.key ?? 0, time: S.grund.time || '4/4', clefs: S.grund.clefs || ['G', 'F'], titel: S.titel || standardTitel() });
  return S.stueck;
}
function standardTitel() { const d = new Date(); return `Foto-Noten ${d.getDate()}.${d.getMonth() + 1}.`; }
function bilanz() {
  const n = S.takte.filter((t) => !t.platzhalter).length, s = S.takte.filter(istSicher).length, m = S.takte.filter(istMarkiert).length;
  return { n, s, m, offen: S.takte.filter((t) => t.status === 'offen').length };
}

let uebernimmt = false;
async function uebernehmen() {
  const b = bilanz();
  if (!b.n || b.offen === b.n || uebernimmt || S.job?.laeuft) return;
  uebernimmt = true; // doppeltes Tippen legt sonst zwei Stücke an
  try {
    const st = stueck();
    const titel = (S.titel || '').trim() || standardTitel();
    const { alsMusicXML } = await import('./ausgeben.js');
    const xml = alsMusicXML(st, { titel });
    const markiert = S.takte.filter((t) => istMarkiert(t) || t.status === 'offen').map((t) => t.nr);
    await opt.uebernehmen?.({ titel, xml, scan: { gesamt: b.n, sicher: b.s, geprueft: S.takte.filter((t) => t.status === 'geprueft').length, markiert } });
  } catch (e) {
    opt.hinweis?.({ bild: ICO.warn, titel: 'Übernehmen ging nicht', text: `<p>${esc((e && (e.text || e.message)) || 'Unbekannter Fehler')}</p><p>Die gelesenen Takte bleiben hier erhalten. Prüfe die markierten Takte und tippe dann noch einmal auf „Übernehmen“.</p>` });
  } finally { uebernimmt = false; }
}

// ───────── Darstellung: Hauptseite ─────────
function plane() {
  if (renderGeplant) return;
  renderGeplant = true;
  requestAnimationFrame(() => { renderGeplant = false; if (root && root.isConnected) zeichneSeite(); });
}

export function seiteScan(el, o = {}) {
  root = el; opt = o;
  kiStart();
  zeichneSeite(true);
  return () => { if (root === el) root = null; };
}

function zeichneSeite(erst = false) {
  const h = location.hash.replace(/^#/, '');
  const m = h.match(/^scan\/takt\/(\d+)/);
  if (m && S.takte.length) return zeichnePruefen(Math.max(0, Math.min(S.takte.length - 1, +m[1] - 1)), erst);
  if (erst || !root.querySelector('.sc')) {
    root.innerHTML = `<div class="sc seite">
      <header class="kopf"><a class="rund" href="#start" aria-label="Zurück">${ICO.zurueck}</a><h1>Noten aus Foto<small>Foto → Noten zum Üben</small></h1></header>
      <div class="sc-inhalt">
        <section class="sc-foto" id="scFoto"></section>
        <section class="sc-karte sc-ki" id="scKi"></section>
        <section class="sc-karte sc-erg" id="scErg" hidden></section>
      </div>
      <input type="file" id="scDatei" accept="image/*,.heic,.heif,application/pdf" multiple hidden>
    </div>`;
    const inp = $('#scDatei', root);
    inp.onchange = () => { dateienDazu(inp.files); inp.value = ''; };
    const z = $('.sc', root);
    z.addEventListener('dragover', (e) => { e.preventDefault(); z.classList.add('zieh'); });
    z.addEventListener('dragleave', () => z.classList.remove('zieh'));
    z.addEventListener('drop', (e) => { e.preventDefault(); z.classList.remove('zieh'); dateienDazu(e.dataTransfer.files); });
    z.addEventListener('click', klickHaupt);
    z.addEventListener('input', (e) => { if (e.target.id === 'scTitel') { S.titel = e.target.value; S.stueck = null; } });
  }
  zeichneFoto(); zeichneKi(); zeichneErgebnis();
}

function zeichneFoto() {
  const box = $('#scFoto', root);
  if (!box) return;
  const tipps = '<ul class="sc-tipps"><li>gerade von oben</li><li>hell, ohne Schatten</li><li>ganze Seite im Bild</li><li>PDF: als Bildschirmfoto</li></ul>';
  const meldung = S.meldung ? `<p class="sc-meldung">${ICO.info}<span>${esc(S.meldung)}</span></p>` : '';
  if (!S.seiten.length) {
    box.innerHTML = `<button class="laden sc-laden" type="button" data-tun="waehlen"><span class="kreis">${ICO.kamera}</span><span><b>Foto aufnehmen oder Bild wählen</b><span>Eine oder mehrere Notenseiten – die App sucht die Zeilen und Takte</span></span></button>${meldung}${tipps}`;
    return;
  }
  const karten = S.seiten.map((p, i) => {
    let inhalt;
    if (p.status === 'bereite') inhalt = `<div class="sc-sinfo"><b>Seite ${i + 1}</b><span class="sc-pille liest"><i></i>${esc(p.schritt)} …</span></div>`;
    else if (p.status === 'fehler') inhalt = `<div class="sc-sinfo"><b>Seite ${i + 1}</b><span class="sc-pille rot"><i></i>${esc(p.fehler)}</span></div>`;
    else {
      const d = p.daten, nt = d.zeilen.reduce((a, z) => a + z.takte.length, 0);
      const fakten = d.leer ? ['nur leere Notenlinien'] : d.zeilen.length ? [`${d.zeilen.length} Zeile${d.zeilen.length === 1 ? '' : 'n'}`, `${nt} Takt${nt === 1 ? '' : 'e'}`, d.zeilen.some((z) => z.staves.length === 1) ? 'auch einzeilig' : '', Math.abs(d.winkel) >= 0.1 ? `${String(Math.abs(d.winkel).toFixed(1)).replace('.', ',')}° gerade gerückt` : 'gerade'].filter(Boolean)
        : ['keine Notenlinien gefunden'];
      inhalt = `<div class="sc-sinfo"><b>Seite ${i + 1}</b><span class="sc-fakten">${fakten.map((f) => `<span>${esc(f)}</span>`).join('')}</span>${d.hinweise.filter((x) => d.zeilen.length || !/Keine Notenlinien/.test(x)).map((x) => `<small>${esc(x)}</small>`).join('')}${d.zeilen.length || !d.ganz || p.ohneTakte ? '' : '<small>Die KI liest dann die ganze Seite auf einmal – das ist ungenauer. Besser: neues Foto, gerade und hell.</small>'}${p.kiHinweis ? `<small class="sc-ki-hinweis">${esc(p.kiHinweis)}</small>` : ''}</div>`;
    }
    const bild = p.url ? `<button class="sc-thumb" type="button" data-tun="lupe" data-seite="${p.id}" aria-label="Seite ${i + 1} groß ansehen"><img src="${esc(p.url)}" alt="">${overlaySvg(p, true)}</button>` : `<div class="sc-thumb leer"><span class="lade-punkt"></span></div>`;
    return `<article class="sc-seite">${bild}${inhalt}<button class="sc-weg" type="button" data-tun="weg" data-seite="${p.id}" aria-label="Seite ${i + 1} entfernen"${S.job?.laeuft ? ' disabled' : ''}>${ICO.x}</button></article>`;
  }).join('');
  box.innerHTML = `<div class="sc-seiten">${karten}</div>${S.seiten.length < MAX_SEITEN ? `<button class="sc-dazu" type="button" data-tun="waehlen"${S.job?.laeuft ? ' disabled' : ''}>${ICO.plus}<span>Weitere Seite</span></button>` : ''}${meldung}`;
}

function overlaySvg(p, klein) {
  const d = p.daten;
  if (!d) return '';
  const f = d.vorschau.f, sw = klein ? 3 : 2;
  let s = '';
  d.zeilen.forEach((z) => {
    s += `<rect x="${(z.x0 * f).toFixed(1)}" y="${((z.top - z.g) * f).toFixed(1)}" width="${((z.x1 - z.x0) * f).toFixed(1)}" height="${((z.bot - z.top + 2 * z.g) * f).toFixed(1)}" rx="4" class="sc-ov-z" stroke-width="${sw}"/>`;
    z.takte.forEach((tk, k) => {
      if (k > 0) s += `<line x1="${(tk.x0 * f).toFixed(1)}" x2="${(tk.x0 * f).toFixed(1)}" y1="${((z.top - z.g) * f).toFixed(1)}" y2="${((z.bot + z.g) * f).toFixed(1)}" class="sc-ov-t" stroke-width="${sw}"/>`;
    });
    if (!klein) z.takte.forEach((tk, k) => {
      const t = S.takte.find((x) => x.seite === p.id && x.zeile === d.zeilen.indexOf(z) && x.k === k && !x.extra);
      if (!t) return;
      const cx = ((tk.x0 + tk.x1) / 2) * f, cy = (z.top - z.g * 2.2) * f;
      s += `<g class="sc-ov-nr ${t.status}"><rect x="${(cx - 12).toFixed(1)}" y="${(cy - 9).toFixed(1)}" width="24" height="18" rx="6"/><text x="${cx.toFixed(1)}" y="${(cy + 4.5).toFixed(1)}" text-anchor="middle">${t.nr}</text></g>`;
    });
  });
  return `<svg class="sc-ov" viewBox="0 0 ${d.vorschau.w} ${d.vorschau.h}" preserveAspectRatio="none" aria-hidden="true">${s}</svg>`;
}

function zeichneKi() {
  const box = $('#scKi', root);
  if (!box) return;
  const fertig = S.seiten.some((p) => p.status === 'fertig');
  const offen = zuLesen();
  const zust = S.ki.zustand;
  const J = S.job;
  let h = '';
  if (zust === 'pruefe') h = `<div class="sc-ki-kopf"><span class="sc-ki-ico">${ICO.lesen}</span><div><b>Noten erkennen</b><small>Verbinde …</small></div></div>`;
  else if (zust !== 'da') {
    const text = zust === 'gesperrt' || zust === 'ohneBild' ? S.ki.sperre || SPERR.images_unavailable
      : 'Die Noten-Erkennung braucht Claude. Sie läuft in der Claude-Fassung dieser App (dort angemeldet öffnen). Hier im Browser klappt alles andere – auch die Bildvorbereitung oben: Du siehst, welche Zeilen und Takte die App findet.';
    const url = opt.artifactUrl;
    h = `<div class="sc-ki-kopf"><span class="sc-ki-ico aus">${ICO.lesen}</span><div><b>Noten erkennen</b><small>hier nicht verfügbar</small></div></div><p class="sc-text">${esc(text)}</p>${url && zust !== 'gesperrt' ? `<a class="sc-knopf zweit" href="${esc(url)}" target="_blank" rel="noopener">${ICO.lesen}<span>Zur Claude-Fassung</span></a>` : ''}`;
  } else {
    const anzahl = einheiten().reduce((a, e) => a + (e.z && e.z.ki.length > (S.ki.limits?.images?.maxCount || 1) ? e.z.ki.length : 1), 0);
    if (J?.laeuft) {
      const zeilen = [...J.aktiv.values()].map((f) => `<li><span class="sc-pille liest"><i></i>${esc(f.zeile)}</span><span>${esc(f.text)}</span></li>`).join('');
      h = `<div class="sc-ki-kopf"><span class="sc-ki-ico an">${ICO.lesen}</span><div><b>Wird gelesen …</b><small>${J.aufrufe} Anfrage${J.aufrufe === 1 ? '' : 'n'} an Claude</small></div><button class="sc-knopf klein" type="button" data-tun="stopp">${ICO.stopp}<span>Stopp</span></button></div>
        <div class="sc-band" aria-hidden="true"><i></i></div>
        ${zeilen ? `<ul class="sc-aktiv">${zeilen}</ul>` : ''}${J.text ? `<p class="sc-text">${esc(J.text)}${J.nachGesamt ? ` (${J.nach} von ${J.nachGesamt})` : ''}</p>` : ''}`;
    } else {
      const b = bilanz();
      const weiter = offen || nochAuffaellig();
      const knopfText = !fertig ? 'Noten erkennen' : weiter ? (b.s || b.m || S.takte.some((t) => t.gruende?.length) ? 'Weiter lesen' : 'Noten erkennen') : 'Alles gelesen';
      h = `<div class="sc-ki-kopf"><span class="sc-ki-ico">${ICO.lesen}</span><div><b>Noten erkennen</b><small>${fertig && offen ? `${anzahl} Anfrage${anzahl === 1 ? '' : 'n'} an Claude – je Zeile eine` : fertig && weiter ? `${nochAuffaellig()} auffällige Takte nachlesen` : fertig && !S.takte.length ? 'keine Noten zum Lesen – siehe Seite oben' : fertig ? 'fertig – unten prüfen' : 'zuerst ein Foto wählen'}</small></div></div>
        <button class="sc-knopf haupt" type="button" data-tun="erkennen"${fertig && weiter ? '' : ' disabled'}>${ICO.lesen}<span>${knopfText}</span></button>
        <p class="sc-klein">Jede Zeile wird einzeln und scharf an Claude geschickt. Auffällige Takte (Notenwerte passen nicht, Kopfzahl im Bild weicht ab, unleserlich) liest die App danach noch zweimal einzeln – höchstens ${MAX_NACHLESEN} Takte, je zwei Anfragen. Alles zählt zu deinem Nutzungskontingent.</p>`;
    }
    if (J?.fehler) h += `<p class="sc-meldung rot">${ICO.warn}<span>${esc(J.fehler)}</span></p>`;
  }
  box.innerHTML = h;
}

function zeichneErgebnis() {
  const box = $('#scErg', root);
  if (!box) return;
  const b = bilanz();
  const gelesen = S.takte.some((t) => t.status !== 'offen');
  box.hidden = !gelesen;
  if (!gelesen) return;
  if (!box.querySelector('#scErgInhalt')) {
    // fest: Namensfeld und Knöpfe (werden nicht neu gezeichnet – sonst ginge beim Tippen der Fokus verloren)
    box.innerHTML = `<div id="scErgInhalt"></div>
      <label class="sc-feld">Name des Stücks<input id="scTitel" type="text" autocomplete="off" enterkeyhint="done" placeholder="${esc(standardTitel())}"></label>
      <div class="sc-knoepfe"><a class="sc-knopf zweit" id="scPruefen" href="#scan/takt/1">${ICO.ok}<span>Takte prüfen</span></a><button class="sc-knopf haupt" type="button" id="scUeber" data-tun="uebernehmen">${ICO.rechts}<span>Übernehmen</span></button></div>
      <p class="sc-klein">„Übernehmen“ öffnet das Stück wie eine geladene Datei – mit Akkorden, Intervallen, Abspielen und Speichern. Markierte Takte bleiben so, wie sie gelesen wurden.</p>`;
    $('#scTitel', box).value = S.titel;
  }
  const pct = b.n ? b.s / b.n : 0, R = 30, U = 2 * Math.PI * R;
  const ring = `<svg class="sc-ring" viewBox="0 0 76 76" aria-hidden="true"><circle cx="38" cy="38" r="${R}" class="sc-ring-g"/><circle cx="38" cy="38" r="${R}" class="sc-ring-w" stroke-dasharray="${(U * pct).toFixed(1)} ${U.toFixed(1)}" transform="rotate(-90 38 38)"/><text x="38" y="44" text-anchor="middle">${Math.round(pct * 100)}%</text></svg>`;
  const chips = S.takte.map((t, i) => `<a class="sc-tchip ${t.status}" href="#scan/takt/${i + 1}" aria-label="Takt ${t.nr}: ${esc(STATUS_TEXT[t.status])}">${t.nr}</a>`).join('');
  const k = S.grund.key || 0;
  const tonart = k ? `${Math.abs(k)} ${k > 0 ? '♯' : '♭'}` : 'keine Vorzeichen';
  const ersterMarkiert = S.takte.findIndex(istMarkiert);
  $('#scErgInhalt', box).innerHTML = `<div class="sc-bilanz">${ring}<div><b>${b.s} von ${b.n} Takten sicher</b><small>${S.job?.laeuft ? 'Lesen läuft – auffällige Takte werden nachgelesen …' : b.m ? `${b.m} markiert – bitte ansehen` : b.offen ? `${b.offen} noch nicht gelesen` : 'nichts markiert – trotzdem kurz mit dem Original vergleichen'}</small></div></div>
    <div class="sc-grund"><span>Tonart <b>${esc(tonart)}</b></span><span>Takt <b>${esc(S.grund.time || '–')}</b></span><button class="sc-mini" type="button" data-tun="grund" aria-label="Tonart und Taktart ändern">ändern</button></div>
    <div class="sc-tchips">${chips}</div>
    <div class="sc-legende"><span class="sicher">sicher</span><span class="geprueft">geprüft</span><span class="markiert">markiert</span><span class="unleserlich">unleserlich</span></div>`;
  $('#scPruefen', box).setAttribute('href', `#scan/takt/${(ersterMarkiert >= 0 ? ersterMarkiert : 0) + 1}`);
  $('#scUeber', box).disabled = !!S.job?.laeuft || b.offen === b.n;
}

function grundAendern() {
  const keys = [-7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7];
  const name = (k) => (k ? `${Math.abs(k)} ${k > 0 ? '♯' : '♭'}` : 'keine');
  const zeiten = ['2/4', '3/4', '4/4', '2/2', '3/8', '6/8', '9/8', '12/8', '5/4'];
  const { el, zu } = opt.hinweis({
    titel: 'Tonart und Taktart', knopf: 'Fertig', bild: ICO.info,
    text: `<p>Gilt ab dem ersten Takt. Die Tonhöhen werden aus den gedruckten Vorzeichen neu berechnet.</p>
      <div class="sc-wahl" role="group" aria-label="Vorzeichen">${keys.map((k) => `<button type="button" data-key="${k}" aria-pressed="${k === (S.grund.key ?? 0)}">${name(k)}</button>`).join('')}</div>
      <div class="sc-wahl" role="group" aria-label="Taktart">${zeiten.map((z) => `<button type="button" data-time="${z}" aria-pressed="${z === S.grund.time}">${z}</button>`).join('')}</div>`,
  });
  el.querySelector('.blatt').addEventListener('click', (ev) => {
    const k = ev.target.closest('[data-key]'), t = ev.target.closest('[data-time]');
    if (!k && !t) return;
    ev.stopPropagation();
    if (k) { S.grund.key = +k.dataset.key; for (const x of S.takte) if (x.zeilenKopf) x.zeilenKopf.key = null; }
    if (t) { S.grund.time = t.dataset.time; for (const x of S.takte) if (x.zeilenKopf) x.zeilenKopf.time = null; }
    for (const b of el.querySelectorAll('[data-key]')) b.setAttribute('aria-pressed', +b.dataset.key === S.grund.key);
    for (const b of el.querySelectorAll('[data-time]')) b.setAttribute('aria-pressed', b.dataset.time === S.grund.time);
    nachBearbeiten(null);
  });
  void zu;
}

function lupe(id) {
  const p = S.seiten.find((x) => x.id === id);
  if (!p?.url) return;
  const d = document.createElement('div');
  d.className = 'sc-lupe';
  d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', 'Seite mit gefundenen Zeilen und Takten');
  d.innerHTML = `<div class="sc-lupe-kopf"><b>Gefundene Zeilen und Takte</b><button class="rund" type="button" aria-label="Schließen">${ICO.x}</button></div><div class="sc-lupe-bild"><div class="sc-lupe-rahmen"><img src="${esc(p.url)}" alt="Notenseite">${overlaySvg(p, false)}</div></div>`;
  document.body.appendChild(d);
  const vorher = document.activeElement;
  const taste = (e) => { if (e.key === 'Escape') zu(); };
  const zu = () => { d.remove(); removeEventListener('keydown', taste); if (vorher?.focus) vorher.focus(); };
  addEventListener('keydown', taste);
  addEventListener('hashchange', zu, { once: true });
  d.querySelector('button').onclick = zu;
  d.querySelector('button').focus();
}

function klickHaupt(ev) {
  const b = ev.target.closest('[data-tun]');
  if (!b || b.disabled) return;
  const tun = b.dataset.tun;
  if (tun === 'waehlen') $('#scDatei', root).click();
  else if (tun === 'weg') seiteWeg(+b.dataset.seite);
  else if (tun === 'lupe') lupe(+b.dataset.seite);
  else if (tun === 'erkennen') erkennen();
  else if (tun === 'stopp') stoppen();
  else if (tun === 'uebernehmen') uebernehmen();
  else if (tun === 'grund') grundAendern();
}

// ───────── Korrektur-Ansicht ─────────
function zeichnePruefen(i, erst) {
  const t = S.takte[i];
  if (S.pruef.i !== i) { S.pruef.i = i; S.pruef.sel = null; S.pruef.ganzeZeile = false; }
  if (erst || !root.querySelector('.sp')) {
    root.innerHTML = `<div class="sp seite">
      <header class="kopf"><a class="rund" href="#scan" aria-label="Zurück zur Übersicht">${ICO.zurueck}</a><h1 id="spTitel"></h1><button class="sc-knopf haupt klein" type="button" data-tun="uebernehmen">${ICO.rechts}<span>Übernehmen</span></button></header>
      <nav class="sp-leiste" id="spLeiste" aria-label="Takte"></nav>
      <div class="sp-mitte">
        <figure class="sp-bild" id="spBild"><canvas id="spCanvas" role="img" aria-label="Ausschnitt aus dem Foto"></canvas><figcaption><button class="sc-mini" type="button" data-tun="zeile" id="spZeileKnopf">${ICO.zeile}<span>ganze Zeile</span></button><span id="spBildText"></span></figcaption></figure>
        <div class="sp-noten"><div class="sp-svg" id="spSvgBox"><svg id="spSvg" role="img" aria-label="Erkannte Noten"></svg></div><div id="spSpuren"></div></div>
      </div>
      <div id="spGruende"></div>
      <div class="sp-unten"><div class="sp-werkzeug" id="spWerkzeug"></div><div class="sp-nav" id="spUnten"></div></div>
    </div>`;
    const sp = $('.sp', root);
    sp.addEventListener('click', klickPruefen);
  }
  $('#spTitel', root).innerHTML = `Takt ${t.nr} <small>${esc(bilanzText())}</small>`;
  const leiste = $('#spLeiste', root);
  leiste.innerHTML = S.takte.map((x, j) => `<a class="sc-tchip ${x.status}${j === i ? ' akt' : ''}" href="#scan/takt/${j + 1}" aria-label="Takt ${x.nr}: ${esc(STATUS_TEXT[x.status])}"${j === i ? ' aria-current="true"' : ''}>${x.nr}</a>`).join('');
  const akt = leiste.querySelector('.akt');
  if (akt) { const l = leiste.getBoundingClientRect(), a = akt.getBoundingClientRect(); if (a.left < l.left || a.right > l.right) leiste.scrollLeft += a.left - l.left - l.width / 2 + a.width / 2; }
  bildZeigen(t);
  notenZeigen(t, i);
  gruendeZeigen(t);
  werkzeugZeigen(t);
  untenZeigen(t, i);
}
function bilanzText() { const b = bilanz(); return `${b.s} von ${b.n} sicher${b.m ? ` · ${b.m} markiert` : ''}`; }

let bildAuftrag = 0;
async function bildZeigen(t) {
  const c = $('#spCanvas', root), txt = $('#spBildText', root), knopf = $('#spZeileKnopf', root);
  const z = zeileVon(t);
  const nr = ++bildAuftrag;
  knopf.hidden = !z;
  knopf.setAttribute('aria-pressed', S.pruef.ganzeZeile);
  if (!z) {
    const p = seiteVon(t);
    txt.textContent = p?.daten?.zeilen.length === 0 ? 'Ganze Seite (keine Zeilen gefunden)' : '';
    if (p?.url) { const img = new Image(); img.src = p.url; await img.decode().catch(() => {}); if (nr !== bildAuftrag) return; c.width = img.naturalWidth; c.height = img.naturalHeight; c.getContext('2d').drawImage(img, 0, 0); }
    return;
  }
  txt.textContent = t.extra ? 'Zusatz-Takt: im Bild nicht abgegrenzt – ganze Zeile' : S.pruef.ganzeZeile ? 'Ganze Zeile – der Takt ist orange umrandet' : 'Ausschnitt aus deinem Foto';
  const breite = Math.max(200, c.parentElement.clientWidth || 360);
  const schl = `${t.schluessel}|${S.pruef.ganzeZeile}|${breite}`;
  if (c.dataset.schl === schl) return;
  c.dataset.schl = schl;
  await taktZeigen(c, z, t.k, { ganzeZeile: S.pruef.ganzeZeile || !!t.extra, breite, dpr: Math.min(2, window.devicePixelRatio || 1) });
  if (nr !== bildAuftrag) return;
  c.classList.toggle('breit', S.pruef.ganzeZeile || !!t.extra);
}

function miniStueck(i) {
  const st = stueck(), tk = st.takte[i];
  if (!tk) return null;
  const pre = 't' + i + '-';
  return {
    titel: st.titel, tempo: st.tempo,
    takte: [{ ...tk, start: 0 }],
    noten: st.noten.filter((n) => n.id.startsWith(pre)).map((n) => ({ ...n, t: n.t - tk.start })),
    pausen: st.pausen.filter((p) => p.takt === tk.nr && p.t >= tk.start - 1e-6 && p.t < tk.start + tk.dauer - 1e-6).map((p) => ({ ...p, t: p.t - tk.start })),
  };
}

function notenZeigen(t, i) {
  const box = $('#spSvgBox', root);
  const alt = $('#spSvg', root);
  const svg = alt.cloneNode(false); // neues Element: frische Tipp-Anbindung
  alt.replaceWith(svg);
  const mini = miniStueck(i);
  const spuren = $('#spSpuren', root);
  if (!mini || !t.lesung) {
    svg.removeAttribute('viewBox'); svg.innerHTML = '';
    spuren.innerHTML = `<p class="sc-text">${t.status === 'offen' ? 'Noch nicht gelesen.' : 'Keine Noten gelesen.'}</p>${t.lesung ? '' : '<button class="sc-mini" type="button" data-tun="leer">Takt leer anlegen</button>'}`;
    return;
  }
  const B = Math.max(260, Math.floor(box.clientWidth - 8));
  zeichne(svg, mini, { breite: B, abstand: B < 420 ? 10 : 11, beiTipp: (id) => { const p = id.split('-'); waehle({ sk: p[1], ei: +p[2], ni: +p[3] }); } });
  const sel = S.pruef.sel;
  if (sel) markiere(svg, new Set([`t${i}-${sel.sk}-${sel.ei}-${sel.ni ?? 0}`]));
  // Ereignisse je Stimme als Chips (auch Pausen sind so antippbar)
  const namen = new Map(mini.noten.map((n) => [n.id, n]));
  const kx = kontexte()[i];
  const L = KI.taktLaengeAus(t.lesung.time || kx.time);
  const zeilen = KI.STIMMEN.filter((sk) => Array.isArray(t.lesung.stimmen?.[sk]) || sk === 'U' || (sk === 'L' && kx.staves !== 1)).map((sk) => {
    const evs = Array.isArray(t.lesung.stimmen?.[sk]) ? t.lesung.stimmen[sk] : [];
    let summe = 0;
    const chips = evs.map((ev, ei) => {
      if (ev.schl) return `<span class="sp-ev schl">${ev.schl === 'F' ? 'Bass' : 'Violin'}</span>`;
      summe += KI.evDauer(ev, L);
      const gew = sel && sel.sk === sk && sel.ei === ei;
      const tonText = ev.r ? 'Pause' : ev.n.map((x, ni) => { const n = namen.get(`t${i}-${sk}-${ei}-${ni}`); return `<b${gew && sel.ni === ni ? ' class="an"' : ''}>${esc(n ? notenName(n.schreibweise) : x.s + x.o)}</b>`; }).reverse().join('');
      return `<button type="button" class="sp-ev${ev.r ? ' pause' : ''}${gew ? ' gew' : ''}" data-tun="ev" data-sk="${sk}" data-ei="${ei}"><span class="sp-ev-t">${tonText}</span><small>${esc(wertText(ev))}</small></button>`;
    }).join('');
    const ok = Math.abs(summe - L) < 1e-6 || (i === 0 && summe > 0 && summe < L);
    const name = { U: 'oben', U2: 'oben 2', L: 'unten', L2: 'unten 2' }[sk];
    return `<div class="sp-spur"><div class="sp-spur-kopf"><span>${name}</span><span class="sp-summe ${ok ? 'ok' : 'falsch'}">${ok ? ICO.ok : ICO.warn}${esc(KI.bruchText(summe))} / ${esc(KI.bruchText(L))}</span></div><div class="sp-evs">${chips}<button type="button" class="sp-ev neu" data-tun="anhaengen" data-sk="${sk}" aria-label="Note am Ende von ${name} anfügen">${ICO.plus}</button></div></div>`;
  }).join('');
  const zweite = kx.staves !== 1 && !Array.isArray(t.lesung.stimmen?.U2) ? '<button class="sc-mini" type="button" data-tun="stimme2">+ 2. Stimme oben</button>' : '';
  spuren.innerHTML = zeilen + zweite;
}

const WERT_NAME = { 1: 'Ganze', 2: 'Halbe', 4: 'Viertel', 8: 'Achtel', 16: '16tel', 32: '32tel', 64: '64tel' };
function wertText(ev) { if (ev.ganz) return 'ganzer Takt'; return (ev.p ? 'punkt. ' : '') + WERT_NAME[ev.d] + (ev.t ? ' (Triole)' : ''); }

function gruendeZeigen(t) {
  const box = $('#spGruende', root);
  const g = t.gruende || [];
  const st = `<span class="sc-pille ${t.status}"><i></i>${esc(STATUS_TEXT[t.status])}</span>`;
  const varianten = t.varianten && t.varianten.length > 1 ? `<div class="sp-var" role="group" aria-label="Lesungen">${t.varianten.map((v, j) => `<button type="button" data-tun="variante" data-j="${j}" aria-pressed="${t.wahl === j}">${esc(v.name)}</button>`).join('')}</div>` : '';
  box.innerHTML = `<div class="sp-gruende">${st}${g.length ? `<ul>${g.map((x) => `<li class="${x.art}">${esc(x.text)}</li>`).join('')}</ul>` : '<span class="sc-klein">Keine Auffälligkeit.</span>'}${varianten}${t.lesung ? '<p class="sc-klein sp-tipp">Vergleiche mit dem Bild. Tippe eine Note (oder ein Kärtchen) an, um sie zu ändern.</p>' : ''}</div>`;
}

function werkzeugZeigen(t) {
  const box = $('#spWerkzeug', root);
  const ev = gewaehltesEv(t);
  const K = (tun, ico, label, an = false, extra = '') => `<button type="button" class="sp-w${an ? ' an' : ''}" data-tun="${tun}"${extra} aria-label="${esc(label)}" title="${esc(label)}"${an ? ' aria-pressed="true"' : ''}>${ico}</button>`;
  const hatRueck = !!S.rueck.get(t)?.length;
  const rueck = K('rueck', ICO.zurueckNehmen, 'Rückgängig', false, hatRueck ? '' : ' disabled');
  box.hidden = !ev && !hatRueck;
  if (!ev) { box.innerHTML = hatRueck ? `<div class="sp-w-reihe">${rueck}<span class="sc-klein">Tippe eine Note oder ein Kärtchen an, um es zu ändern.</span></div>` : ''; return; }
  const x = ev.n?.[S.pruef.sel.ni ?? 0];
  const r = ev.r ? ' disabled' : '';
  const sel = S.pruef.sel, id = `t${S.pruef.i}-${sel.sk}-${sel.ei}-${sel.ni ?? 0}`;
  const note = ev.r ? null : stueck().noten.find((n) => n.id === id);
  const name = ev.r ? 'Pause' : note ? notenName(note.schreibweise) : '';
  box.innerHTML = `<div class="sp-w-kopf"><b>${esc(name)}</b><small>${esc(wertText(ev))}</small><button class="sp-w-zu" type="button" data-tun="abwaehlen" aria-label="Auswahl schließen">${ICO.x}</button></div>
    <div class="sp-w-reihe">
      ${rueck}<span class="sp-w-trenn"></span>${K('runter', ICO.runter, 'Tiefer', false, r)}${K('hoch', ICO.hoch, 'Höher', false, r)}
      ${K('akz', ICO.b, 'Be', x?.a === 'b', ' data-a="b"' + r)}${K('akz', ICO.aufl, 'Auflösungszeichen', x?.a === 'n', ' data-a="n"' + r)}${K('akz', ICO.kreuz, 'Kreuz', x?.a === '#', ' data-a="#"' + r)}
      <span class="sp-w-trenn"></span>
      ${[1, 2, 4, 8, 16].map((d) => K('dauer', wertIco(d), WERT_NAME[d], !ev.ganz && ev.d === d, ` data-d="${d}"`)).join('')}
      ${K('punkt', ICO.punkt, 'Punkt', ev.p > 0)}${K('triole', ICO.triole, 'Triole', ev.t)}
      <span class="sp-w-trenn"></span>
      ${K('bogen', ICO.bogen, 'Haltebogen zur nächsten Note', ev.bo, r)}${K('pause', ICO.pause, ev.r ? 'Pause zu Note' : 'Note zu Pause', ev.r)}
      ${K('akkordton', ICO.akkord, 'Akkordton dazu', false, r)}${K('danach', ICO.danach, 'Note danach einfügen')}
      ${K('loeschen', ICO.weg, 'Löschen')}
    </div>`;
}

function untenZeigen(t, i) {
  const box = $('#spUnten', root);
  const kannKi = S.ki.zustand === 'da' && hatBild(t) && !S.job?.laeuft;
  const lauf = S.job?.laeuft;
  box.innerHTML = `<a class="sc-knopf zweit rundk" ${i > 0 ? `href="#scan/takt/${i}"` : 'aria-disabled="true"'} aria-label="Voriger Takt">${ICO.links}</a>
    ${S.ki.zustand === 'da' && hatBild(t) ? `<button class="sc-knopf zweit" type="button" data-tun="neulesen"${kannKi ? '' : ' disabled'}>${lauf ? '<span class="lade-punkt klein"></span>' : ICO.neu}<span>${lauf ? 'liest …' : 'Neu lesen'}</span></button>` : ''}
    <button class="sc-knopf ${t.status === 'geprueft' ? 'gut' : 'haupt'}" type="button" data-tun="stimmt"${t.lesung ? '' : ' disabled'}>${ICO.ok}<span>${t.status === 'geprueft' ? 'Geprüft' : 'Stimmt so'}</span></button>
    <a class="sc-knopf zweit rundk" ${i < S.takte.length - 1 ? `href="#scan/takt/${i + 2}"` : 'aria-disabled="true"'} aria-label="Nächster Takt">${ICO.rechts}</a>
    ${S.job?.fehler ? `<p class="sc-meldung rot">${ICO.warn}<span>${esc(S.job.fehler)}</span></p>` : ''}`;
}

function gewaehltesEv(t) {
  const s = S.pruef.sel;
  if (!s || !t.lesung) return null;
  const evs = t.lesung.stimmen?.[s.sk];
  return Array.isArray(evs) ? evs[s.ei] || null : null;
}
function waehle(sel) { S.pruef.sel = sel; plane(); }

const STAEMME = ['C', 'D', 'E', 'F', 'G', 'A', 'H'];
function schritt(x, d) {
  let i = STAEMME.indexOf(x.s) + d, o = x.o;
  while (i < 0) { i += 7; o--; }
  while (i > 6) { i -= 7; o++; }
  return { ...x, s: STAEMME[i], o, a: null };
}

function merken(t) {
  const l = S.rueck.get(t) || [];
  l.push(KI.kopie({ lesung: t.lesung, sel: S.pruef.sel, wahl: t.wahl }));
  if (l.length > 40) l.shift();
  S.rueck.set(t, l);
  // eigene Arbeitskopie: die gespeicherten Lesungen (Varianten) bleiben unverändert
  t.lesung = KI.kopie(t.lesung);
  t.wahl = -1;
}
function nachBearbeiten(t) {
  if (t) { t.bearbeitet = true; if (t.status === 'geprueft' || t.status === 'sicher') t.status = 'markiert'; }
  S.stueck = null;
  const kx = kontexte();
  for (const [i, x] of S.takte.entries()) if (x.lesung && (x === t || !t)) {
    x.gruende = pruefen(x, i, kx);
    if (x === t && x.status !== 'geprueft') x.status = 'markiert'; // Geändertes zählt erst nach „Stimmt so“ als sicher
  }
  plane();
}

function bearbeite(t, tun, b) {
  if (!t.lesung || tun === 'leer') return;
  if (tun !== 'anhaengen' && tun !== 'stimme2' && !gewaehltesEv(t)) return;
  merken(t); // ab hier wird die frische Arbeitskopie geändert
  const s = S.pruef.sel;
  const evs = s ? t.lesung.stimmen[s.sk] : null;
  const ev = gewaehltesEv(t);
  if (tun === 'anhaengen') {
    const sk = b.dataset.sk;
    if (!Array.isArray(t.lesung.stimmen[sk])) t.lesung.stimmen[sk] = [];
    const liste = t.lesung.stimmen[sk];
    const letzt = [...liste].reverse().find((e) => !e.schl && !e.r);
    const neu = letzt ? { ...KI.kopie(letzt), bo: false } : { n: [{ s: sk.startsWith('U') ? 'C' : 'C', a: null, o: sk.startsWith('U') ? 5 : 3 }], d: 4, p: 0, t: false, r: false, ganz: false, bo: false };
    neu.n = neu.n.map((x) => ({ ...x, f: undefined }));
    // ganze Pause ersetzen
    if (liste.length === 1 && liste[0].ganz) liste.splice(0, 1);
    liste.push(neu);
    S.pruef.sel = { sk, ei: liste.length - 1, ni: 0 };
    return nachBearbeiten(t);
  }
  if (tun === 'stimme2') { t.lesung.stimmen.U2 = [{ n: [], d: 1, p: 0, t: false, r: true, ganz: true, bo: false }]; return nachBearbeiten(t); }
  const ni = s.ni ?? 0;
  if (tun === 'hoch' || tun === 'runter') { if (!ev.r) ev.n[ni] = schritt(ev.n[ni], tun === 'hoch' ? 1 : -1); }
  else if (tun === 'akz') { const a = b.dataset.a; if (!ev.r) ev.n[ni].a = ev.n[ni].a === a ? null : a; }
  else if (tun === 'dauer') { ev.d = +b.dataset.d; ev.ganz = false; }
  else if (tun === 'punkt') { ev.p = ev.p ? 0 : 1; ev.ganz = false; }
  else if (tun === 'triole') { ev.t = !ev.t; ev.ganz = false; }
  else if (tun === 'bogen') ev.bo = !ev.bo;
  else if (tun === 'pause') {
    if (ev.r) { if (ev.ganz) { ev.ganz = false; ev.d = 4; } ev.r = false; if (!ev.n.length) ev.n = [{ s: s.sk.startsWith('U') ? 'H' : 'D', a: null, o: s.sk.startsWith('U') ? 4 : 3 }]; }
    else { ev.r = true; ev.n = []; ev.bo = false; }
    S.pruef.sel = { ...s, ni: 0 };
  } else if (tun === 'akkordton') {
    if (!ev.r) { const oben = ev.n.reduce((m, x) => (STAEMME.indexOf(x.s) + x.o * 7 > STAEMME.indexOf(m.s) + m.o * 7 ? x : m), ev.n[0]); ev.n.push(schritt(oben, 2)); S.pruef.sel = { ...s, ni: ev.n.length - 1 }; }
  } else if (tun === 'danach') {
    const neu = KI.kopie(ev); neu.bo = false; if (neu.ganz) { neu.ganz = false; neu.d = 4; }
    evs.splice(s.ei + 1, 0, neu);
    S.pruef.sel = { sk: s.sk, ei: s.ei + 1, ni: 0 };
  } else if (tun === 'loeschen') {
    if (!ev.r && ev.n.length > 1) { ev.n.splice(ni, 1); S.pruef.sel = { ...s, ni: 0 }; }
    else { evs.splice(s.ei, 1); S.pruef.sel = evs.length ? { sk: s.sk, ei: Math.min(s.ei, evs.length - 1), ni: 0 } : null; }
  }
  nachBearbeiten(t);
}

async function klickPruefen(ev) {
  const b = ev.target.closest('[data-tun]');
  if (!b || b.disabled) return;
  const t = S.takte[S.pruef.i];
  const tun = b.dataset.tun;
  if (tun === 'uebernehmen') return uebernehmen();
  if (tun === 'zeile') { S.pruef.ganzeZeile = !S.pruef.ganzeZeile; return plane(); }
  if (tun === 'ev') return waehle({ sk: b.dataset.sk, ei: +b.dataset.ei, ni: 0 });
  if (tun === 'abwaehlen') return waehle(null);
  if (tun === 'variante') { const j = +b.dataset.j, v = t.varianten[j]; if (v) { merken(t); t.lesung = KI.kopie(v.lesung); t.wahl = j; S.pruef.sel = null; S.stueck = null; const kx = kontexte(); t.gruende = pruefen(t, S.pruef.i, kx); if (t.status === 'geprueft') t.status = 'markiert'; plane(); } return; }
  if (tun === 'stimmt') { if (t.lesung) { t.status = t.status === 'geprueft' ? 'markiert' : 'geprueft'; S.stueck = null; const n = S.takte.findIndex((x, j) => j > S.pruef.i && istMarkiert(x)); plane(); if (n >= 0) setTimeout(() => { location.hash = '#scan/takt/' + (n + 1); }, ruhig() ? 0 : 180); } return; }
  if (tun === 'rueck') { const l = S.rueck.get(t); const v = l?.pop(); if (v) { t.lesung = v.lesung; t.wahl = v.wahl; S.pruef.sel = v.sel; nachBearbeiten(t); } return; }
  if (tun === 'neulesen') return taktNeuLesen(t);
  bearbeite(t, tun, b);
}

async function taktNeuLesen(t) {
  if (S.job?.laeuft || S.ki.zustand !== 'da' || !hatBild(t)) return;
  const job = S.job = { laeuft: true, ctl: new Set(), aufrufe: 0, text: `Takt ${t.nr} wird zweimal gelesen …`, fehler: '', aktiv: new Map(), nach: 0, nachGesamt: 0 };
  plane();
  try {
    if (!t.lesung) t.lesungen = 0;
    await taktDoppelt(t, job);
    S.pruef.sel = null;
    opt.toast?.(t.status === 'sicher' ? `Takt ${t.nr}: zweimal gleich gelesen` : `Takt ${t.nr}: Lesungen verschieden – bitte vergleichen`);
  } catch (e) {
    job.fehler = e instanceof Halt ? (e.code === 'cancelled' ? '' : e.text) : (e && e.message) || 'Fehler';
  }
  job.laeuft = false;
  plane();
}

// Für Tests: Zustand ansehen
if (typeof window !== 'undefined') window.__scan = { S, stueck: () => stueck(), bilanz };
