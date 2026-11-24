// app.js – Oberfläche des Gesangstrainers. Reines ES-Modul, keine Bibliotheken.
// Die Fach-Module (phonetik, ton, uebungen) werden dynamisch geladen; fehlt eines oder wirft es, zeigt die App einen
// einfachen Ersatz statt abzustürzen. Alles bleibt auf dem Gerät (IndexedDB/localStorage über speicher.js).
import * as speicher from './speicher.js';

const M = { ph: {}, ton: {}, ue: {}, eg: {} };
const bereit = Promise.all([
  import('./phonetik.js').then((m) => { M.ph = m; }).catch((e) => console.warn('phonetik.js fehlt', e)),
  import('./ton.js').then((m) => { M.ton = m; }).catch((e) => console.warn('ton.js fehlt', e)),
  import('./uebungen.js').then((m) => { M.ue = m; }).catch((e) => console.warn('uebungen.js fehlt', e)),
  import('./eignung.js').then((m) => { M.eg = m; }).catch((e) => console.warn('eignung.js fehlt', e)),
]);

// ================================================================ kleine Helfer
const $ = (s, w = document) => w.querySelector(s);
function h(tag, attr, ...kinder) {
  const el = document.createElement(tag);
  if (attr) for (const [k, v] of Object.entries(attr)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v; // nur für feste, eigene Zeichenketten (SVG)
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kinder.flat(Infinity)) {
    if (k == null || k === false) continue;
    el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  }
  return el;
}
const ic = (name, cls = 'ic') => h('span', { html: `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`, style: { display: 'contents' } });
function versuch(f, ersatz) { try { const r = f(); return r === undefined ? ersatz : r; } catch (e) { console.warn(e); return ersatz; } }
const istFn = (f) => typeof f === 'function';
const zeilenZahl = (n) => (n === 1 ? '1 Zeile' : `${n} Zeilen`);
const ht = (n) => (n === 1 ? '1 Halbton' : `${n} Halbtöne`);
const mmss = (s) => { s = Math.max(0, Math.round(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const enc = encodeURIComponent;
const minText = (m) => String(Math.round((Number(m) || 1) * 10) / 10).replace('.', ',');

let meldTimer = 0;
function meldung(text, ms = 2600) {
  const el = $('#meldung'); if (!el) return;
  el.textContent = text; el.classList.add('zeigen');
  clearTimeout(meldTimer); meldTimer = setTimeout(() => el.classList.remove('zeigen'), ms);
}

// ================================================================ Noten-Namen, Vokale
const N_B = ['C', 'Des', 'D', 'Es', 'E', 'F', 'Ges', 'G', 'As', 'A', 'B', 'H'];
function nName(n, tonart = 'es-Moll') {
  if (n == null || !isFinite(n)) return '–';
  const r = istFn(M.ton.midiName) ? versuch(() => M.ton.midiName(Math.round(n), tonart), '') : '';
  if (r) return r;
  const m = Math.round(n); return N_B[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
}
const VKL = { a: 'v-a', e: 'v-e', i: 'v-i', y: 'v-i', o: 'v-o', u: 'v-u', 'ä': 'v-ae', 'ö': 'v-oe', 'ü': 'v-ue' };
const VFARBE = { a: '#ff7f4e', e: '#ffc23e', i: '#33cdd0', o: '#b56cff', u: '#5a98ff', 'ä': '#ffa253', 'ö': '#b9a3cf', 'ü': '#5fd884' };
const vNorm = (v) => { const c = String(v || 'a').trim().toLowerCase()[0] || 'a'; return VKL[c] ? (c === 'y' ? 'i' : c) : 'a'; };
const vKlasse = (v) => VKL[vNorm(v)];

/** Vokal-Kugel: Hauptvokal groß, Nachlaut klein angeheftet. */
function kugel(s, cls = '') {
  const anz = String(s.anzeige || s.vokal || 'a');
  const haupt = anz[0] || 'a';
  const nach = s.gleit ? String(s.gleit) : (anz.length > 1 ? anz.slice(1) : '');
  return h('span', { class: `kugel ${vKlasse(s.vokal || haupt)} ${cls}`, 'aria-label': anz },
    haupt, nach ? h('span', { class: `nach ${vKlasse(nach)}` }, nach) : null);
}

// einfache Ersatz-Phonetik, nur falls phonetik.js fehlt
function ersatzSilben(text) {
  const out = [];
  (String(text).match(/[\p{L}']+/gu) || []).forEach((wort, wi) => {
    const gruppen = wort.toLowerCase().match(/[aeiouyäöü]+/g) || [];
    gruppen.forEach((g, si) => {
      let vokal = vNorm(g), gleit = '';
      if (/^(ai|ei|ay|ey)$/.test(g)) { vokal = 'a'; gleit = 'i'; } else if (/^(au|ou|ow)$/.test(g)) { vokal = 'a'; gleit = 'u'; } else if (/^(eu|äu|oi|oy)$/.test(g)) { vokal = 'o'; gleit = 'i'; }
      out.push({ text: g, vokal, gleit, anzeige: vokal.toUpperCase() + gleit, wort, wi, erste: si === 0 });
    });
  });
  return out;
}
/** Silben einer Zeile (flach, mit Wort-Index). */
function silbenVon(text, sprache) {
  if (istFn(M.ph.zeileZuVokalen)) {
    const r = versuch(() => M.ph.zeileZuVokalen(text, sprache), null);
    if (Array.isArray(r)) {
      const out = [];
      r.forEach((w, wi) => (w.silben || []).forEach((s, si) => out.push({ ...s, wort: w.wort, wi, erste: si === 0 })));
      if (out.length) return out;
    }
  }
  return ersatzSilben(text);
}
const spracheVon = (text, vorgabe) => vorgabe || (istFn(M.ph.erkenneSprache) ? versuch(() => M.ph.erkenneSprache(text), 'en') : 'en');
function kettenText(silben) { return silben.map((s) => s.anzeige || s.vokal).join(' · '); }
function uebergaengeVon(silben) {
  if (!istFn(M.ph.uebergaenge)) return [];
  let r = versuch(() => M.ph.uebergaenge(silben), null);
  if (!Array.isArray(r)) r = versuch(() => M.ph.uebergaenge(silben.map((s) => s.anzeige || s.vokal)), []);
  return Array.isArray(r) ? r : [];
}

// ================================================================ Lieder
const liedCache = new Map();
function normalisiere(l, id) {
  l.id = l.id || id; l.teile = Array.isArray(l.teile) ? l.teile : []; l.zeilen = Array.isArray(l.zeilen) ? l.zeilen : [];
  const alle = l.zeilen.flatMap((z) => (z.silben || []).map((s) => s.midi)).filter((m) => isFinite(m) && m > 0);
  if (!l.umfang || !isFinite(l.umfang.tief)) l.umfang = alle.length ? { tief: Math.min(...alle), hoch: Math.max(...alle) } : null;
  l.umfangTeile = l.umfangTeile || {};
  for (const t of l.teile) {
    if (l.umfangTeile[t.id]) continue;
    const m = l.zeilen.filter((z) => z.teil === t.id).flatMap((z) => (z.silben || []).map((s) => s.midi)).filter((x) => isFinite(x) && x > 0);
    if (m.length) l.umfangTeile[t.id] = { tief: Math.min(...m), hoch: Math.max(...m) };
  }
  return l;
}
async function holeLied(id) {
  if (liedCache.has(id)) return liedCache.get(id);
  let l = null;
  if (id === 'the-wall') {
    try { const r = await fetch('daten/the-wall.json'); if (r.ok) l = await r.json(); } catch (e) { console.warn(e); }
  } else l = await speicher.lied(id);
  if (l) { normalisiere(l, id); liedCache.set(id, l); }
  return l;
}
async function alleLieder() {
  const eigene = await speicher.lieder();
  const wall = await holeLied('the-wall');
  return [wall || { id: 'the-wall', titel: 'The Wall', kuenstler: 'Xander', teile: [], zeilen: [] }, ...eigene.map((l) => normalisiere(l, l.id))];
}
const stimme = () => speicher.ladeStimme();
const profil = () => speicher.ladeProfil() || {};
const grundton = (st = stimme()) => (st && st.kern && isFinite(st.kern[0]) ? Math.round((st.kern[0] + st.kern[1]) / 2) : 55);
const zeilenVon = (lied, teil) => lied.zeilen.filter((z) => z.teil === teil && z.text);
const gesungeneTeile = (lied) => lied.teile.filter((t) => zeilenVon(lied, t.id).length);

// Transposition je Lied (Knopf in der Eignungs-Karte, Tonart-Regler der Zeile): Übungen, Lernweg und Warm-up folgen ihr.
const transVon = (id) => { const a = speicher.hole('trans', {}) || {}; const x = Number(a[id]); return isFinite(x) ? Math.max(-12, Math.min(12, Math.round(x))) : 0; };
function setzeTrans(id, x) { const a = { ...(speicher.hole('trans', {}) || {}) }; a[id] = x; speicher.merke('trans', a); }
const transCache = new Map();
function liedFuer(lied) {
  const t = transVon(lied.id); if (!t) return lied;
  const k = lied.id + ':' + t; if (transCache.has(k)) return transCache.get(k);
  const sh = (m) => (isFinite(m) && m > 0 ? m + t : m);
  const c = { ...lied, transponiert: t,
    zeilen: lied.zeilen.map((z) => ({ ...z, silben: (z.silben || []).map((s) => ({ ...s, midi: sh(s.midi), ...(Array.isArray(s.noten) ? { noten: s.noten.map((n) => ({ ...n, midi: sh(n.midi) })) } : {}) })) })),
    umfang: lied.umfang ? { tief: lied.umfang.tief + t, hoch: lied.umfang.hoch + t } : null,
    umfangTeile: Object.fromEntries(Object.entries(lied.umfangTeile || {}).map(([k2, u]) => [k2, { tief: u.tief + t, hoch: u.hoch + t }])) };
  transCache.set(k, c); return c;
}
const eignungVon = (lied) => (istFn(M.eg.eignung) ? versuch(() => M.eg.eignung(lied, stimme()), null) : null);
const bibliothek = () => (istFn(M.ue.fuerStimme) ? versuch(() => M.ue.fuerStimme(stimme()), null) : null) || uebungsListe();
let frisch = '';

/** Noten einer Zeile mit Vokalen. t ab 0, in Sekunden bei Originaltempo. */
function zeilenNoten(z, P) {
  const D = (z.silben || []).filter((s) => s && isFinite(s.midi) && s.midi > 0);
  if (D.length) {
    const t0 = isFinite(D[0].t) ? D[0].t : 0;
    return D.map((s, i) => {
      const pi = P.length ? (P.length === D.length ? i : Math.min(P.length - 1, Math.floor((i * P.length) / D.length))) : -1;
      const p = P[pi] || {};
      return { t: isFinite(s.t) ? s.t - t0 : i * 0.5, dauer: s.dauer || 0.4, midi: s.midi, pi, text: s.text || p.text || '', vokal: p.vokal || 'a', gleit: p.gleit || '' };
    });
  }
  const g = grundton();
  return P.map((p, i) => ({ t: i * 0.6, dauer: 0.5, midi: g, pi: i, text: p.text || '', vokal: p.vokal || 'a', gleit: p.gleit || '', ohneMelodie: true }));
}

function planVon(lied) {
  const st = stimme();
  if (istFn(M.ue.plan)) { const r = versuch(() => M.ue.plan(liedFuer(lied), st), null); if (Array.isArray(r)) return r; }
  // Ersatz-Lernweg
  const stufen = ['Melodie auf Lippenflattern oder Summen', 'Nur die Vokale singen', 'Vokal-Übergänge der schweren Stellen langsam', 'Silben auf „da“ im Rhythmus', 'Text im halben Tempo', 'Text im Originaltempo', 'Mit Musik'];
  return gesungeneTeile(lied).map((t) => ({ teil: t.id, name: t.name, schwierig: [], schritte: stufen.map((s) => ({ uebung: '', text: s, zeilen: zeilenVon(lied, t.id).map((z) => z.id) })) }));
}
const uebungsListe = () => (Array.isArray(M.ue.UEBUNGEN) ? M.ue.UEBUNGEN : []);
const uebungVon = (id) => uebungsListe().find((u) => u.id === id) || null;
const UEB_FARBE = { hoehe: 'o', tiefe: 'u', uebergang: 'i', diphthong: 'e', atem: 'u', rhythmus: 'a', lockerung: 'ue', sovt: 'i', vokale: 'e' };
function uebFarbe(u) {
  const sw = (u && u.stichworte) || [];
  for (const s of sw) if (UEB_FARBE[s]) return UEB_FARBE[s];
  return 'a';
}
function uebSymbol(u, gross = false) {
  const v = uebFarbe(u);
  const sw = (u && u.stichworte) || [];
  const name = sw.includes('atem') ? 'uhr' : sw.includes('lockerung') ? 'warm' : sw.includes('rhythmus') ? 'welle' : 'stimme';
  return h('span', { class: `ueb-symbol ${VKL[v === 'ue' ? 'ü' : v] || 'v-a'}`, style: { background: 'linear-gradient(145deg, var(--v1), var(--v2))', width: gross ? '52px' : '44px', height: gross ? '52px' : '44px' } }, ic(name));
}

// ================================================================ Klaviatur-Streifen
let svgNr = 0;
function klaviatur(baender, marken = [], tonart) {
  const werte = baender.flatMap((b) => [b.lo, b.hi]).concat(marken).filter(isFinite);
  if (!werte.length) return h('div');
  const schwarz = (n) => [1, 3, 6, 8, 10].includes(((n % 12) + 12) % 12);
  let von = Math.min(...werte) - 3, bis = Math.max(...werte) + 3;
  while (schwarz(von)) von--; while (schwarz(bis)) bis++;
  const W = 16, KH = 58, BH = 12, oben = baender.length * (BH + 4) + 6;
  const weisse = []; for (let n = von; n <= bis; n++) if (!schwarz(n)) weisse.push(n);
  const xL = (n) => { if (!schwarz(n)) return weisse.indexOf(n) * W; return (weisse.indexOf(n - 1) + 1) * W - W * 0.32; };
  const xR = (n) => xL(n) + (schwarz(n) ? W * 0.64 : W);
  const B = weisse.length * W, H = oben + KH + 16;
  const id = 'kv' + (++svgNr);
  let s = `<svg class="klaviatur" viewBox="0 0 ${B} ${H}" role="img" aria-label="Tonbereich auf der Klaviatur"><defs>`;
  baender.forEach((b, i) => { s += `<linearGradient id="${id}g${i}" x1="0" x2="1"><stop offset="0" stop-color="${b.f1}"/><stop offset="1" stop-color="${b.f2}"/></linearGradient>`; });
  s += '</defs>';
  baender.forEach((b, i) => {
    const x1 = xL(b.lo), x2 = xR(b.hi), y = 4 + i * (BH + 4);
    s += `<rect x="${x1}" y="${y}" width="${Math.max(6, x2 - x1)}" height="${BH}" rx="${BH / 2}" fill="url(#${id}g${i})"/>`;
  });
  for (const n of weisse) {
    const inBand = baender.some((b) => n >= b.lo && n <= b.hi);
    s += `<rect class="weiss" x="${xL(n) + .5}" y="${oben}" width="${W - 1}" height="${KH}" rx="3" ${inBand ? `style="fill:${baender[0].f1}33"` : ''}/>`;
  }
  for (let n = von; n <= bis; n++) if (schwarz(n)) s += `<rect class="schwarz" x="${xL(n)}" y="${oben}" width="${W * 0.64}" height="${KH * 0.62}" rx="2"/>`;
  for (const n of weisse) if (((n % 12) + 12) % 12 === 0) s += `<text class="beschr" x="${xL(n) + W / 2}" y="${H - 3}" text-anchor="middle">${nName(n, tonart)}</text>`;
  for (const m of marken) { if (!isFinite(m)) continue; const x = (xL(m) + xR(m)) / 2; s += `<path d="M${x - 5} ${oben - 2} L${x + 5} ${oben - 2} L${x} ${oben + 6} Z" fill="${VFARBE.i}"/>`; }
  s += '</svg>';
  return h('div', { html: s });
}
function legende(baender, marken) {
  return h('div', { class: 'legende' },
    baender.map((b) => h('span', null, h('i', { style: { background: `linear-gradient(90deg, ${b.f1}, ${b.f2})` } }), b.name)),
    marken && marken.length ? h('span', null, h('i', { style: { background: VFARBE.i, width: '10px', height: '10px' } }), 'Übergang deiner Stimme') : null);
}
const BAND_LIED = { f1: '#ffb057', f2: '#ff4f8b' };
const BAND_KERN = { f1: '#8cc8ff', f2: '#9b4dff' };
const BAND_GANZ = { f1: '#a8f59a', f2: '#1fb5c9' };

function lageSaetze(umf, st, tonart) {
  if (!umf) return [];
  if (!st || !st.kern || !isFinite(st.kern[0])) return [];
  const [lo, hi] = st.kern, out = [];
  const ueber = umf.hoch - hi, unter = lo - umf.tief;
  if (ueber <= 0 && unter <= 0) out.push('Das Lied liegt ganz in deinem Kernbereich – gute Voraussetzungen.');
  if (ueber > 0) out.push(`Geht bis ${ht(ueber)} über deinen Kernbereich (höchster Ton ${nName(umf.hoch, tonart)}, dein Kern endet bei ${nName(hi, tonart)}).`);
  if (unter > 0) out.push(`Reicht ${ht(unter)} unter deinen Kernbereich (tiefster Ton ${nName(umf.tief, tonart)}).`);
  if (isFinite(st.hoch) && umf.hoch > st.hoch) out.push(`Der höchste Ton liegt über deinem höchsten bequemen Ton (${nName(st.hoch, tonart)}) – hier helfen Vokal-Ausgleich und Transponieren.`);
  const ue = (st.uebergaenge || []).filter((m) => isFinite(m) && m >= umf.tief && m <= umf.hoch);
  if (ue.length) out.push(`Dein Stimm-Übergang (${ue.map((m) => nName(m, tonart)).join(', ')}) liegt im Lied – genau dort üben wir den Vokal-Ausgleich.`);
  return out;
}

// ================================================================ Audio
let ctxA = null;
const instrumente = new WeakMap();
function audio() {
  const C = window.AudioContext || window.webkitAudioContext;
  if (!ctxA || ctxA.state === 'closed') ctxA = new C();
  if (ctxA.state === 'suspended') ctxA.resume().catch(() => {});
  return ctxA;
}
function ersatzKlang(ctx) {
  const ton = (midi, start, dauer) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
    g.gain.setValueAtTime(0.0001, start); g.gain.exponentialRampToValueAtTime(0.25, start + 0.03); g.gain.exponentialRampToValueAtTime(0.001, start + Math.max(0.12, dauer));
    o.connect(g).connect(ctx.destination); o.start(start); o.stop(start + dauer + 0.1);
  };
  return { spiele: ton, singe: (v, m, s, d) => ton(m, s, d), stopp() {} };
}
function instrument(art) {
  const ctx = audio();
  let i = instrumente.get(ctx); if (!i) { i = {}; instrumente.set(ctx, i); }
  if (!i[art]) {
    i[art] = art === 'klavier' ? (istFn(M.ton.klavier) && versuch(() => M.ton.klavier(ctx), null)) : (istFn(M.ton.vokalStimme) && versuch(() => M.ton.vokalStimme(ctx), null));
    if (!i[art]) i[art] = ersatzKlang(ctx);
  }
  return i[art];
}
function spieleFolge(noten, { art = 'stimme', tempo = 1, trans = 0, vorlauf = 0.12 } = {}) {
  try { if (navigator.audioSession && !micAn) navigator.audioSession.type = 'playback'; } catch (e) { /* egal */ }
  const ctx = audio(), inst = instrument(art);
  const t0 = ctx.currentTime + vorlauf;
  for (const n of noten) {
    const st = t0 + n.t / tempo, d = Math.max(0.08, n.dauer / tempo), m = n.midi + trans;
    try {
      if (art === 'klavier' && istFn(inst.spiele)) inst.spiele(m, st, d);
      else if (istFn(inst.singe)) inst.singe(n.vokal || 'a', m, st, d, n.gleit || '');
      else inst.spiele(m, st, d);
    } catch (e) { console.warn(e); }
  }
  const ende = noten.length ? Math.max(...noten.map((n) => (n.t + n.dauer) / tempo)) : 0;
  return { ctx, t0, ende };
}
function stoppeKlang() {
  if (!ctxA) return;
  const i = instrumente.get(ctxA);
  if (i) for (const k of Object.keys(i)) try { i[k].stopp && i[k].stopp(); } catch (e) { /* egal */ }
  try { ctxA.close(); } catch (e) { /* egal */ }
  ctxA = null;
}
let micAn = false;
async function starteMikro(onTon) {
  if (!istFn(M.ton.mikrofon)) throw new Error('Die Tonhöhen-Erkennung ist noch nicht geladen.');
  const r = await M.ton.mikrofon({ onTon });
  micAn = true;
  const stop = istFn(r) ? r : (r && (r.stop || r.stopp)) || (() => {});
  return () => { micAn = false; try { stop(); } catch (e) { /* egal */ } };
}
const tonAusEreignis = (e) => {
  if (!e || !(e.hz > 0)) return null;
  if (e.sicher === false || (typeof e.sicher === 'number' && e.sicher < 0.5)) return null;
  return isFinite(e.midiGenau) ? e.midiGenau : 69 + 12 * Math.log2(e.hz / 440);
};
async function ladeDatei(datei) {
  if (istFn(M.ton.ladeAudio)) return M.ton.ladeAudio(datei);
  const C = window.AudioContext || window.webkitAudioContext, ctx = new C();
  try {
    const ab = await new Promise(async (ok, f) => { const p = ctx.decodeAudioData(await datei.arrayBuffer(), ok, f); if (p && p.then) p.then(ok, f); });
    const x = new Float32Array(ab.length);
    for (let c = 0; c < ab.numberOfChannels; c++) { const d = ab.getChannelData(c); for (let i = 0; i < x.length; i++) x[i] += d[i] / ab.numberOfChannels; }
    return { x, sr: ab.sampleRate };
  } finally { try { ctx.close(); } catch (e) { /* egal */ } }
}
function imHintergrund(auftrag, x, sr, opt) {
  if (istFn(M.ton.imHintergrund)) return M.ton.imHintergrund(auftrag, x, sr, opt);
  return Promise.resolve().then(() => {
    if (auftrag === 'melodie') return M.ton.melodieAusAudio(x, sr);
    const spur = M.ton.tonhoehe(x, sr);
    return auftrag === 'stimmlage' ? { spur, stimme: M.ton.stimmlage(spur, opt) } : spur;
  });
}

// ================================================================ Router
let aufraeumen = [];
function raeumeAuf() { for (const f of aufraeumen.splice(0)) try { f(); } catch (e) { /* egal */ } stoppeKlang(); }
const ansicht = () => $('#ansicht');
function setzeKopf(titel, zurueck) {
  $('#kopf-titel').textContent = titel || 'Gesangstrainer';
  const z = $('#zurueck');
  if (zurueck) { z.hidden = false; z.setAttribute('href', zurueck); } else z.hidden = true;
  document.title = titel && titel !== 'Gesangstrainer' ? `${titel} · Gesangstrainer` : 'Gesangstrainer';
}
function setzeNav(name) { document.querySelectorAll('.leiste a').forEach((a) => a.classList.toggle('an', a.dataset.nav === name)); }

function liesProfilLink() {
  const m = location.hash.match(/^#profil=([A-Za-z0-9_\-+/=]+)/);
  if (!m) return;
  const weg = () => { try { history.replaceState(null, '', location.pathname + location.search + '#start'); } catch (e) { location.hash = '#start'; } };
  try {
    let b = m[1].replace(/-/g, '+').replace(/_/g, '/'); while (b.length % 4) b += '=';
    const j = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(b), (c) => c.charCodeAt(0))));
    const zahl = (v) => (isFinite(v) && v > 20 && v < 100 ? Math.round(Number(v)) : null);
    const s = j.stimme || {};
    const st = s && (zahl(s.tief) || (Array.isArray(s.kern) && zahl(s.kern[0]))) ? {
      tief: zahl(s.tief), hoch: zahl(s.hoch),
      kern: Array.isArray(s.kern) && zahl(s.kern[0]) && zahl(s.kern[1]) ? [zahl(s.kern[0]), zahl(s.kern[1])] : null,
      typ: String(s.typ || '').slice(0, 40), text: String(s.text || '').slice(0, 600),
      uebergaenge: Array.isArray(s.uebergaenge) ? s.uebergaenge.map(zahl).filter(Boolean).slice(0, 6) : [],
      quelle: 'profil', datum: Date.now(),
    } : null;
    speicher.speichereProfil({ name: String(j.name || '').slice(0, 40), datum: Date.now() });
    if (st) speicher.speichereStimme(st);
    weg(); setTimeout(() => meldung('Dein Stimmprofil ist gespeichert'), 300);
  } catch (e) { console.warn(e); weg(); setTimeout(() => meldung('Der Profil-Link ließ sich nicht lesen'), 300); }
}

async function zeige() {
  raeumeAuf();
  const roh = location.hash.replace(/^#\/?/, '');
  if (roh.startsWith('profil=')) { liesProfilLink(); return zeige(); }
  const [seite = 'start', a, b, c, d] = roh.split('/').map((x) => { try { return decodeURIComponent(x); } catch (e) { return x; } });
  const v = ansicht();
  let inhalt;
  try {
    await bereit;
    if (seite === 'lied' && a && b === 'teil' && c) inhalt = await seiteTeil(a, c);
    else if (seite === 'lied' && a && b === 'zeile' && c) inhalt = await seiteZeile(a, c, d === 'bau');
    else if (seite === 'lied' && a && b === 'weg') inhalt = await seiteWeg(a);
    else if (seite === 'lied' && a) inhalt = await seiteLied(a);
    else if (seite === 'warmup') inhalt = await seiteWarmup(a || speicher.hole('letztesLied', 'the-wall'));
    else if (seite === 'stimme') inhalt = seiteStimme();
    else if (seite === 'neu') inhalt = seiteNeu();
    else if (seite === 'uebungen') inhalt = seiteUebungen();
    else inhalt = await seiteStart();
  } catch (e) {
    console.error(e);
    setzeKopf('Hoppla'); inhalt = h('div', { class: 'karte leer' }, h('p', null, 'Diese Seite ließ sich gerade nicht öffnen.'), h('p', { class: 'klein' }, String(e && e.message || e)), h('a', { class: 'knopf', href: '#start', style: { marginTop: '14px' } }, 'Zur Startseite'));
  }
  v.replaceChildren(...[].concat(inhalt));
  v.classList.remove('rein'); void v.offsetWidth; v.classList.add('rein');
  window.scrollTo(0, 0);
}

// ================================================================ #start
async function seiteStart() {
  setzeKopf('Gesangstrainer'); setzeNav('start');
  const st = stimme(), name = profil().name || 'Xander';
  const lieder = await alleLieder();
  const letzt = speicher.hole('letztesLied', 'the-wall');
  const stunde = new Date().getHours();
  const gruss = stunde < 11 ? 'Guten Morgen' : stunde < 18 ? 'Hallo' : 'Guten Abend';
  const wall = lieder[0];
  const ersteZeile = wall && wall.zeilen.find((z) => z.text);
  const deko = ersteZeile ? silbenVon(ersteZeile.text, ersteZeile.sprache).slice(0, 6) : [];

  const held = h('section', { class: 'held' },
    h('h1', null, `${gruss}, ${name}`),
    h('p', null, 'Was singen wir heute?'),
    h('div', { class: 'held-kugeln', 'aria-hidden': 'true' }, deko.map((s) => kugel(s, 'mini'))),
    h('a', { class: 'knopf weiss breit', href: `#warmup/${enc(letzt)}`, style: { marginTop: '16px', minHeight: '56px' } }, ic('play'), 'Warm-up für heute'));

  const stimmKarte = st && st.kern ? h('a', { class: 'karte', href: '#stimme' },
    h('div', { class: 'ueb-kopf' }, h('span', { class: 'ueb-symbol', style: { background: `linear-gradient(145deg, ${BAND_KERN.f1}, ${BAND_KERN.f2})` } }, ic('stimme')),
      h('div', null, h('h3', null, `Deine Stimme${st.typ ? ': ' + st.typ : ''}`), h('p', { class: 'leise klein' }, `Kernbereich ${nName(st.kern[0])}–${nName(st.kern[1])}${st.quelle === 'profil' ? ' · aus deinem Profil' : ' · Schätzung'}`)),
      h('span', { class: 'pfeil' }, ic('weiter'))))
    : h('a', { class: 'karte', href: '#stimme' },
      h('div', { class: 'ueb-kopf' }, h('span', { class: 'ueb-symbol', style: { background: `linear-gradient(145deg, ${BAND_KERN.f1}, ${BAND_KERN.f2})` } }, ic('stimme')),
        h('div', null, h('h3', null, 'Stimmlage ermitteln'), h('p', { class: 'leise klein' }, 'Einmal kurz singen – danach passen Warm-up und Lernweg genau zu dir.')),
        h('span', { class: 'pfeil' }, ic('weiter'))));

  const karten = lieder.map((l) => {
    const teile = gesungeneTeile(l), f = speicher.fortschritt(l.id);
    const fertig = teile.filter((t) => f.teile && f.teile[t.id]).length;
    const z = l.zeilen.find((x) => x.text);
    const vk = z ? silbenVon(z.text, z.sprache).slice(0, 8) : [];
    const farben = [...new Set(vk.map((s) => vNorm(s.vokal)))].slice(0, 3).map((v) => VFARBE[v]);
    return h('a', { class: 'karte lied-karte', href: `#lied/${enc(l.id)}` },
      h('span', { class: 'band', style: { background: `linear-gradient(90deg, ${(farben.length > 1 ? farben : ['#ffb057', '#ff4f8b']).join(', ')})` } }),
      h('div', { class: 'zeile1' },
        h('div', null, h('h3', null, l.titel || 'Ohne Titel'),
          h('p', { class: 'leise klein' }, [l.kuenstler, l.umfang ? `${nName(l.umfang.tief, l.tonart)}–${nName(l.umfang.hoch, l.tonart)}` : 'nur Vokale', teile.length ? `${teile.length} Teile` : null].filter(Boolean).join(' · '))),
        h('span', { class: 'pfeil' }, ic('weiter'))),
      h('div', { class: 'mini-kette', style: { marginTop: '10px' }, 'aria-hidden': 'true' }, vk.map((s) => kugel(s, 'mini'))),
      teile.length ? h('div', { class: 'fortschritt-balken', title: `${fertig} von ${teile.length} Teilen geschafft` }, h('i', { style: { transform: `scaleX(${teile.length ? fertig / teile.length : 0})` } })) : null);
  });

  return [held, stimmKarte,
    h('h2', null, 'Meine Lieder'), ...karten,
    h('div', { class: 'kacheln', style: { marginTop: '18px' } },
      kachel('#neu', 'plus', 'Lied hinzufügen', 'a'),
      kachel('#stimme', 'stimme', 'Meine Stimmlage', 'o'),
      kachel('#uebungen', 'uebungen', 'Übungen', 'i'))];
}
function kachel(href, icon, text, v) {
  return h('a', { class: 'kachel', href }, h('span', { class: `kachel-ic ${VKL[v]}`, style: { background: 'linear-gradient(145deg, var(--v1), var(--v2))' } }, ic(icon)), h('span', null, text));
}

// ================================================================ #lied/<id>
async function seiteLied(id) {
  const lied = await holeLied(id);
  if (!lied) return nichtGefunden();
  speicher.merke('letztesLied', id);
  setzeKopf(lied.titel, '#start'); setzeNav('start');
  const st = stimme(), umf = lied.umfang, ton = lied.tonart;
  const plan = planVon(lied);
  const f = speicher.fortschritt(id);
  const teile = gesungeneTeile(lied);
  const naechster = teile.find((t) => !(f.teile && f.teile[t.id])) || teile[0];

  const kopf = h('section', { class: 'held' },
    h('h1', null, lied.titel || 'Ohne Titel'),
    h('p', null, [lied.kuenstler, lied.bpm ? `${lied.bpm} BPM` : null, lied.tonart].filter(Boolean).join(' · ')),
    h('div', { class: 'knopf-reihe', style: { marginTop: '16px' } },
      h('a', { class: 'knopf weiss', href: `#warmup/${enc(id)}` }, ic('warm'), 'Warm-up für dieses Lied'),
      naechster ? h('a', { class: 'knopf weiss', href: `#lied/${enc(id)}/teil/${enc(naechster.id)}` }, ic('pfad'), 'Lernweg') : null));

  let umfKarte;
  if (umf) {
    const baender = [{ ...BAND_LIED, lo: umf.tief, hi: umf.hoch, name: `Lied ${nName(umf.tief, ton)}–${nName(umf.hoch, ton)}` }];
    if (st && st.kern && isFinite(st.kern[0])) baender.push({ ...BAND_KERN, lo: st.kern[0], hi: st.kern[1], name: `Dein Kern ${nName(st.kern[0], ton)}–${nName(st.kern[1], ton)}` });
    const marken = (st && st.uebergaenge) || [];
    const saetze = lageSaetze(umf, st, ton);
    umfKarte = h('section', { class: 'karte' },
      h('h3', null, 'Tonumfang'),
      h('p', { class: 'leise', style: { margin: '4px 0 10px' } }, `Vom tiefsten ${nName(umf.tief, ton)} bis zum höchsten ${nName(umf.hoch, ton)} (${ht(umf.hoch - umf.tief)}).`),
      klaviatur(baender, marken, ton), legende(baender, marken),
      saetze.length ? h('div', { style: { marginTop: '10px' } }, saetze.map((s) => h('p', { style: { marginTop: '6px' } }, s)))
        : h('a', { class: 'knopf klein', href: '#stimme', style: { marginTop: '12px' } }, ic('stimme'), 'Stimmlage ermitteln, um zu vergleichen'));
  } else {
    umfKarte = h('section', { class: 'karte' }, h('h3', null, 'Nur Vokal-Übungen'), h('p', { class: 'leise' }, 'Zu diesem Lied gibt es keine Melodie. Die Vokale werden auf einem bequemen Ton vorgesungen.'));
  }

  const pfad = h('ol', { class: 'pfad' }, teile.map((t, i) => {
    const p = plan.find((x) => x.teil === t.id) || {};
    const fertig = !!(f.teile && f.teile[t.id]);
    const ut = lied.umfangTeile[t.id];
    const schwer = (p.schwierig || []).length;
    const haken = h('button', { class: `haken-knopf ${fertig ? 'an' : ''}`, 'aria-label': fertig ? 'Als nicht geschafft markieren' : 'Als geschafft markieren', 'aria-pressed': String(fertig),
      onclick: (e) => { e.preventDefault(); e.stopPropagation(); speicher.setzeFortschritt(id, 'teile', t.id, !fertig); zeige(); } }, ic('haken'));
    return h('li', { class: `station ${fertig ? 'erledigt' : ''} ${t === naechster && !fertig ? 'naechste' : ''}` },
      h('span', { class: 'punkt' }, fertig ? ic('haken') : String(i + 1)),
      h('div', { class: 'inhalt' }, h('a', { class: 'karte', href: `#lied/${enc(id)}/teil/${enc(t.id)}` },
        h('div', { class: 'station-kopf' }, h('div', null, h('h3', null, t.name || t.id),
          h('p', { class: 'leise klein' }, [isFinite(t.start) ? mmss(t.start) : null, ut ? `${nName(ut.tief, ton)}–${nName(ut.hoch, ton)}` : null, zeilenZahl(zeilenVon(lied, t.id).length)].filter(Boolean).join(' · '))), haken),
        (t.merkmale && t.merkmale.length) || schwer ? h('div', { class: 'chips', style: { marginTop: '10px' } },
          schwer ? h('span', { class: 'chip warm' }, `${schwer} schwierige ${schwer === 1 ? 'Stelle' : 'Stellen'}`) : null,
          (t.merkmale || []).slice(0, 3).map((m) => h('span', { class: 'chip' }, kurzMerkmal(m)))) : null)));
  }));

  const ohneGesang = lied.teile.filter((t) => !zeilenVon(lied, t.id).length);
  const extra = [];
  if (id !== 'the-wall') extra.push(h('button', { class: 'knopf klein', style: { marginTop: '24px' }, onclick: async () => {
    if (!confirm(`„${lied.titel}“ von diesem Gerät löschen?`)) return;
    await speicher.loescheLied(id); liedCache.delete(id); meldung('Lied gelöscht'); location.hash = '#start';
  } }, ic('loeschen'), 'Lied löschen'));

  const eg = eignungVon(lied);
  const egKarte = eg ? eignungsKarte(lied, eg) : null;
  if (egKarte && frisch === id) { egKarte.classList.add('frisch'); frisch = ''; }
  return [kopf, egKarte, umfKarte, h('h2', null, 'Dein Lernweg'),
    h('p', { class: 'leise klein', style: { marginTop: '-4px' } }, 'Teil für Teil: erst Melodie und Vokale, dann Übergänge, dann Text. Tippe einen Teil an.'),
    pfad,
    ohneGesang.length ? h('p', { class: 'leise klein' }, `Ohne Gesang: ${ohneGesang.map((t) => t.name).join(', ')} – Zeit zum Atmen.`) : null,
    ...extra];
}
function kurzMerkmal(m) {
  const s = typeof m === 'string' ? m : (m && (m.text || m.name)) || '';
  const k = s.split(/[;:(]/)[0].trim();
  return k.length > 46 ? k.slice(0, 44) + '…' : k;
}
function nichtGefunden() { setzeKopf('Nicht gefunden', '#start'); return h('div', { class: 'karte leer' }, h('p', null, 'Dieses Lied gibt es auf diesem Gerät nicht (mehr).'), h('a', { class: 'knopf', href: '#start', style: { marginTop: '12px' } }, 'Zu meinen Liedern')); }

// ================================================================ #lied/<id>/teil/<teil>
async function seiteTeil(id, tid) {
  const lied = await holeLied(id);
  if (!lied) return nichtGefunden();
  const t = lied.teile.find((x) => x.id === tid);
  if (!t) return nichtGefunden();
  setzeKopf(t.name || tid, `#lied/${enc(id)}`); setzeNav('start');
  const ton = lied.tonart;
  const p = planVon(lied).find((x) => x.teil === tid || x.name === t.name) || { schritte: [], schwierig: [] };
  const zeilen = zeilenVon(lied, tid);
  const f = speicher.fortschritt(id);
  const teile = gesungeneTeile(lied), idx = teile.indexOf(t);
  const ut = lied.umfangTeile[tid];
  const zeilenLink = (zid) => {
    const z = lied.zeilen.find((x) => x.id === (zid && zid.id ? zid.id : zid));
    return z ? h('a', { class: 'chip', href: `#lied/${enc(id)}/zeile/${enc(z.id)}`, style: { minHeight: '44px' } }, ic('play'), kurz(z.text, 28)) : null;
  };

  const kopf = h('section', { class: 'held' },
    h('h1', null, t.name || tid),
    h('p', null, [lied.titel, ut ? `${nName(ut.tief, ton)}–${nName(ut.hoch, ton)}` : null, zeilenZahl(zeilen.length)].filter(Boolean).join(' · ')),
    zeilen[0] ? h('a', { class: 'knopf weiss breit', href: `#lied/${enc(id)}/zeile/${enc(zeilen[0].id)}`, style: { marginTop: '16px', minHeight: '56px' } }, ic('play'), 'Erste Zeile üben') : null);

  const schwierig = (p.schwierig || []).map((s) => {
    const text = typeof s === 'string' ? s : s.text || s.tipp || s.hinweis || s.art || '';
    const tipp = typeof s === 'object' && s.tipp && s.tipp !== text ? s.tipp : '';
    const u = typeof s === 'object' && s.uebung ? uebungVon(s.uebung) : null;
    return h('div', { class: 'karte hinweis-karte' }, h('span', { class: 'pfeil', style: { color: 'var(--sanft)' } }, ic('hinweis')),
      h('div', null, h('p', null, text), tipp ? h('p', { class: 'leise klein', style: { marginTop: '4px' } }, tipp) : null,
        h('div', { class: 'chips', style: { marginTop: '8px' } }, u ? h('span', { class: 'chip warm' }, u.titel) : null, typeof s === 'object' && s.zeile ? zeilenLink(s.zeile) : null)));
  });

  const schritte = p.schritte || [];
  const erste = schritte.findIndex((_, i) => !(f.stufen && f.stufen[`${tid}:${i}`]));
  const pfad = h('ol', { class: 'pfad' }, schritte.map((s, i) => {
    const key = `${tid}:${i}`, fertig = !!(f.stufen && f.stufen[key]);
    const u = uebungVon(s.uebung);
    const zl = (s.zeilen || []).slice(0, 3).map(zeilenLink);
    return h('li', { class: `station ${fertig ? 'erledigt' : ''} ${i === erste ? 'naechste' : ''}` },
      h('span', { class: 'punkt' }, fertig ? ic('haken') : String(i + 1)),
      h('div', { class: 'inhalt' }, h('div', { class: 'karte' },
        h('div', { class: 'station-kopf' }, h('h3', null, s.titel || (u ? u.titel : `Stufe ${i + 1}`)),
          h('button', { class: `haken-knopf ${fertig ? 'an' : ''}`, 'aria-label': 'Stufe erledigt', 'aria-pressed': String(fertig), onclick: () => {
            const neu = speicher.setzeFortschritt(id, 'stufen', key, !fertig);
            const alle = schritte.every((_, k) => neu.stufen[`${tid}:${k}`]);
            if (alle && !(neu.teile && neu.teile[tid])) { speicher.setzeFortschritt(id, 'teile', tid, true); meldung(`${t.name} geschafft – schön!`); }
            zeige();
          } }, ic('haken'))),
        s.text ? h('p', { class: 'leise', style: { marginTop: '6px' } }, s.text) : null,
        u && u.anleitung && u.anleitung.length ? h('details', { style: { marginTop: '8px' } }, h('summary', { class: 'klein', style: { cursor: 'pointer', minHeight: '32px' } }, 'So geht die Übung'), h('ol', { class: 'anleitung klein' }, u.anleitung.map((a) => h('li', null, a)))) : null,
        zl.length ? h('div', { class: 'chips', style: { marginTop: '10px' } }, zl) : null)));
  }));

  const zeilenKarten = zeilen.map((z) => {
    const P = silbenVon(z.text, z.sprache);
    return h('a', { class: 'karte zeile-karte', href: `#lied/${enc(id)}/zeile/${enc(z.id)}` },
      h('div', null, h('div', { class: 'mini-kette' }, P.map((s) => kugel(s, 'mini'))), h('p', { class: 'text' }, z.text)),
      h('span', { class: 'rund-knopf klein', 'aria-hidden': 'true' }, ic('play')));
  });

  const nav = h('div', { class: 'knopf-reihe', style: { marginTop: '18px' } },
    idx > 0 ? h('a', { class: 'knopf', href: `#lied/${enc(id)}/teil/${enc(teile[idx - 1].id)}` }, ic('zurueck'), teile[idx - 1].name) : null,
    idx >= 0 && idx < teile.length - 1 ? h('a', { class: 'knopf', href: `#lied/${enc(id)}/teil/${enc(teile[idx + 1].id)}` }, teile[idx + 1].name, ic('weiter')) : null);

  return [kopf,
    schwierig.length ? h('h2', null, 'Darauf achten') : null, ...schwierig,
    h('h2', null, 'Lernweg in Stufen'), schritte.length ? pfad : h('p', { class: 'leise' }, 'Für diesen Teil gibt es noch keinen Lernweg.'),
    h('h2', null, 'Zeilen'), ...zeilenKarten, nav];
}
const kurz = (s, n) => { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; };

// ================================================================ #lied/<id>/zeile/<zid>
async function seiteZeile(id, zid) {
  const lied = await holeLied(id);
  if (!lied) return nichtGefunden();
  const z = lied.zeilen.find((x) => x.id === zid);
  if (!z) return nichtGefunden();
  const t = lied.teile.find((x) => x.id === z.teil);
  setzeKopf(t ? `${t.name} · Zeile` : 'Zeile', t ? `#lied/${enc(id)}/teil/${enc(t.id)}` : `#lied/${enc(id)}`); setzeNav('start');
  const ton = lied.tonart;
  const sprache = spracheVon(z.text, z.sprache);
  const P = silbenVon(z.text, sprache);
  const noten = zeilenNoten(z, P);
  const ein = Object.assign({ stufe: 'vokale', art: 'stimme', tempo: 0.8, trans: 0, schleife: false }, speicher.hole('einst', {}) || {});
  const merkeEin = () => speicher.merke('einst', { stufe: ein.stufe, art: ein.art, tempo: ein.tempo, trans: ein.trans, schleife: ein.schleife });
  const span = noten.length ? Math.max(...noten.map((n) => n.t + n.dauer)) : 1;

  // --- Bühne: Vokal-Kugeln
  const kette = h('div', { class: 'kette gross', 'aria-live': 'off' });
  const unter = h('p', { class: 'zeilen-text' });
  let kugelEls = [];
  function baueKette() {
    kette.replaceChildren(); kette.classList.toggle('text', ein.stufe === 'text');
    const quelle = ein.stufe === 'text' && noten.length && !noten[0].ohneMelodie ? noten.map((n) => ({ ...(P[n.pi] || {}), text: n.text, wi: (P[n.pi] || {}).wi })) : P;
    kugelEls = [];
    let vorWi = null;
    quelle.forEach((s, i) => {
      if (vorWi != null && s.wi !== vorWi) kette.append(h('span', { class: 'wortgrenze' }));
      vorWi = s.wi;
      let el;
      if (ein.stufe === 'vokale') el = h('div', { class: 'kugel-wort' }, kugel(s), h('span', { class: 'silbe' }, s.text || ''));
      else if (ein.stufe === 'da') el = h('div', { class: 'kugel-wort' }, kugel({ vokal: 'a', anzeige: 'da' }), h('span', { class: 'silbe' }, s.anzeige || s.vokal || ''));
      else el = h('div', { class: 'kugel-wort' }, h('span', { class: 'gross-text' }, s.text || ''), h('span', { class: 'silbe' }, s.anzeige || s.vokal || ''));
      kette.append(el); kugelEls.push(el);
    });
    unter.textContent = ein.stufe === 'vokale' ? z.text : ein.stufe === 'da' ? `${kettenText(P)}  ·  ${z.text}` : kettenText(P);
    kugelIndex = ein.stufe === 'text' && quelle !== P ? noten.map((_, i) => i) : noten.map((n) => n.pi);
  }
  let kugelIndex = [];

  // --- Steuerung
  const seg = (werte, schluessel, nachher) => {
    const box = h('div', { class: 'segment', role: 'group' });
    for (const [wert, text, icon] of werte) {
      const b = h('button', { class: ein[schluessel] === wert ? 'an' : '', 'aria-pressed': String(ein[schluessel] === wert), onclick: () => {
        ein[schluessel] = wert; merkeEin();
        box.querySelectorAll('button').forEach((x) => { const an = x === b; x.classList.toggle('an', an); x.setAttribute('aria-pressed', String(an)); });
        nachher && nachher();
      } }, icon ? ic(icon) : null, text);
      box.append(b);
    }
    return box;
  };
  const stufenSeg = seg([['vokale', 'Vokale'], ['da', 'Silben „da“'], ['text', 'Text']], 'stufe', () => { baueKette(); if (spielt) neuStart(); });
  const artSeg = seg([['stimme', 'Vokalstimme', 'welle'], ['klavier', 'Klavier', 'klavier']], 'art', () => { if (spielt) neuStart(); });

  const tempoOut = h('output', null, `${Math.round(ein.tempo * 100)} %`);
  const tempoIn = h('input', { type: 'range', min: '50', max: '100', step: '5', value: String(Math.round(ein.tempo * 100)), 'aria-label': 'Tempo',
    oninput: (e) => { ein.tempo = Number(e.target.value) / 100; tempoOut.textContent = `${e.target.value} %`; merkeEin(); },
    onchange: () => { if (spielt) neuStart(); } });
  const transOut = h('output', null, '');
  const zeigeTrans = () => { transOut.textContent = ein.trans === 0 ? '±0' : (ein.trans > 0 ? '+' : '−') + Math.abs(ein.trans); };
  zeigeTrans();
  const transSchritt = (d) => { ein.trans = Math.max(-6, Math.min(6, ein.trans + d)); zeigeTrans(); merkeEin(); zeichne(); if (spielt) neuStart(); };

  const playKnopf = h('button', { class: 'rund-knopf', 'aria-label': 'Abspielen', onclick: () => (spielt ? stopp() : start()) }, ic('play'));
  const schleifeKnopf = h('button', { class: `rund-knopf klein ${ein.schleife ? 'an' : ''}`, 'aria-label': 'Schleife', 'aria-pressed': String(ein.schleife), onclick: () => {
    ein.schleife = !ein.schleife; merkeEin(); schleifeKnopf.classList.toggle('an', ein.schleife); schleifeKnopf.setAttribute('aria-pressed', String(ein.schleife));
  } }, ic('schleife'));
  const micKnopf = h('button', { class: 'rund-knopf klein', 'aria-label': 'Mikrofon', 'aria-pressed': 'false', onclick: () => (micStop ? micAus() : micEin()) }, ic('stimme'));

  // --- Leinwand
  const cv = h('canvas', { 'aria-label': 'Zielnoten und deine Tonhöhe' });
  const anzeige = h('div', { class: 'anzeige', style: { opacity: '0' } }, '');
  const leinwand = h('div', { class: 'leinwand-box' }, cv, anzeige);

  let spielt = false, t0 = 0, endeZeit = 0, raf = 0, wiederTimer = 0, micStop = null, micStart = 0;
  const punkte = [];
  const lage = () => {
    const ms = noten.map((n) => n.midi + ein.trans);
    return { lo: Math.min(...ms) - 3, hi: Math.max(...ms) + 3 };
  };
  const pos = () => (spielt && ctxA ? (ctxA.currentTime - t0) * ein.tempo : micStop ? (((performance.now() - micStart) / 1000) * ein.tempo) % span : -1);
  function zeichne() {
    const dpr = window.devicePixelRatio || 1, w = cv.clientWidth || 300, hh = cv.clientHeight || 160;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(hh * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(hh * dpr); }
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, hh);
    if (!noten.length) return;
    const { lo, hi } = lage();
    const y = (m) => hh - 12 - ((m - lo) / (hi - lo)) * (hh - 30);
    const x = (tt) => 10 + (tt / span) * (w - 20);
    const dunkel = matchMedia('(prefers-color-scheme: dark)').matches;
    g.strokeStyle = dunkel ? 'rgba(255,255,255,.06)' : 'rgba(80,40,30,.07)'; g.lineWidth = 1;
    for (let m = Math.ceil(lo); m <= hi; m++) { g.beginPath(); g.moveTo(0, y(m)); g.lineTo(w, y(m)); g.stroke(); }
    const p = pos();
    for (const n of noten) {
      const x1 = x(n.t), x2 = x(n.t + n.dauer), yy = y(n.midi + ein.trans);
      const jetzt = p >= n.t && p < n.t + n.dauer;
      g.fillStyle = VFARBE[vNorm(ein.stufe === 'da' ? 'a' : n.vokal)] || '#ff7f4e';
      g.globalAlpha = jetzt ? 1 : 0.6;
      const hgt = jetzt ? 12 : 9;
      g.beginPath(); if (g.roundRect) g.roundRect(x1, yy - hgt / 2, Math.max(4, x2 - x1 - 2), hgt, hgt / 2); else g.rect(x1, yy - hgt / 2, Math.max(4, x2 - x1 - 2), hgt); g.fill();
    }
    g.globalAlpha = 1;
    if (punkte.length) {
      g.strokeStyle = dunkel ? '#ffffff' : '#2b1d24'; g.lineWidth = 2.5; g.lineJoin = 'round'; g.lineCap = 'round';
      g.beginPath(); let vor = null;
      for (const q of punkte) {
        if (!vor || q.t < vor.t || q.t - vor.t > 0.18) g.moveTo(x(q.t), y(q.m)); else g.lineTo(x(q.t), y(q.m));
        vor = q;
      }
      g.stroke();
    }
    if (p >= 0) { g.fillStyle = dunkel ? 'rgba(255,255,255,.5)' : 'rgba(43,29,36,.4)'; g.fillRect(x(p) - 1, 0, 2, hh); }
  }
  function schleifeAnimation() {
    const p = pos();
    let aktiv = -1;
    if (spielt) for (let i = 0; i < noten.length; i++) if (p >= noten[i].t && p < noten[i].t + noten[i].dauer + 0.05) { aktiv = i; break; }
    const ki = aktiv >= 0 ? kugelIndex[aktiv] : -1;
    kugelEls.forEach((el, i) => {
      const k = el.querySelector('.kugel');
      el.classList.toggle('jetzt', i === ki);
      if (k) { k.classList.toggle('jetzt', i === ki); k.classList.toggle('war', spielt && ki >= 0 && i < ki); }
    });
    zeichne();
    if (spielt || micStop) raf = requestAnimationFrame(schleifeAnimation);
  }
  function start() {
    stoppeKlang(); clearTimeout(wiederTimer);
    const nn = ein.stufe === 'da' ? noten.map((n) => ({ ...n, vokal: 'a', gleit: '' })) : noten;
    const r = spieleFolge(nn, { art: ein.art, tempo: ein.tempo, trans: ein.trans });
    t0 = r.t0; endeZeit = r.ende; spielt = true;
    punkte.length = 0;
    playKnopf.replaceChildren(ic('stop')); playKnopf.setAttribute('aria-label', 'Anhalten'); playKnopf.classList.add('puls');
    cancelAnimationFrame(raf); raf = requestAnimationFrame(schleifeAnimation);
    wiederTimer = setTimeout(() => { if (!spielt) return; if (ein.schleife) start(); else stopp(); }, (endeZeit + 0.12 + (ein.schleife ? 0.9 : 0.2)) * 1000);
  }
  function neuStart() { start(); }
  function stopp() {
    spielt = false; clearTimeout(wiederTimer); stoppeKlang();
    playKnopf.replaceChildren(ic('play')); playKnopf.setAttribute('aria-label', 'Abspielen'); playKnopf.classList.remove('puls');
    schleifeAnimation();
  }
  async function micEin() {
    try {
      micStart = performance.now(); punkte.length = 0;
      micStop = await starteMikro((e) => {
        const m = tonAusEreignis(e), p = pos();
        if (m == null || p < 0) { if (m == null) anzeige.style.opacity = '0.0'; return; }
        // Ziel-Note an dieser Stelle; Oktave an das Ziel angleichen (tiefe/hohe Stimmen singen oft eine Oktave versetzt)
        const ziel = spielt ? noten.find((n) => p >= n.t && p < n.t + n.dauer) : null;
        const bezug = ziel ? ziel.midi + ein.trans : (lage().lo + lage().hi) / 2;
        const mm = m + 12 * Math.round((bezug - m) / 12);
        punkte.push({ t: p, m: mm }); if (punkte.length > 2000) punkte.splice(0, 500);
        if (ziel) {
          const d = mm - (ziel.midi + ein.trans);
          anzeige.className = 'anzeige ' + (Math.abs(d) <= 0.5 ? 'passt' : d < 0 ? 'hoeher' : 'tiefer');
          anzeige.textContent = Math.abs(d) <= 0.5 ? 'passt' : d < 0 ? 'etwas höher' : 'etwas tiefer';
        } else { anzeige.className = 'anzeige'; anzeige.textContent = `du singst ${nName(m, ton)}`; }
        anzeige.style.opacity = '1';
      });
      micKnopf.classList.add('an'); micKnopf.setAttribute('aria-pressed', 'true');
      cancelAnimationFrame(raf); raf = requestAnimationFrame(schleifeAnimation);
      meldung('Mikrofon an – sing mit');
    } catch (e) { micStop = null; meldung(String(e && e.message || e), 4500); }
  }
  function micAus() {
    if (micStop) micStop(); micStop = null; anzeige.style.opacity = '0';
    micKnopf.classList.remove('an'); micKnopf.setAttribute('aria-pressed', 'false');
  }
  aufraeumen.push(() => { spielt = false; clearTimeout(wiederTimer); cancelAnimationFrame(raf); if (micStop) micStop(); micStop = null; });
  const beiGroesse = () => zeichne();
  window.addEventListener('resize', beiGroesse); aufraeumen.push(() => window.removeEventListener('resize', beiGroesse));

  baueKette();
  requestAnimationFrame(() => zeichne());

  // --- Übergänge
  const ue = uebergaengeVon(P);
  const ueKarten = ue.slice(0, 6).map((u) => {
    const text = typeof u === 'string' ? u : u.hinweis || u.text || u.tipp || '';
    const von = typeof u === 'object' ? (u.von || u.a) : null, nach = typeof u === 'object' ? (u.nach || u.b) : null;
    const k = (v) => kugel(typeof v === 'object' ? v : { vokal: v, anzeige: String(v) }, 'mini');
    return h('div', { class: 'karte hinweis-karte' },
      von && nach ? h('div', { class: 'hk-kugeln' }, k(von), h('span', { class: 'pfeil-klein' }, '→'), k(nach)) : h('span', { class: 'pfeil' }, ic('hinweis')),
      h('div', null, typeof u === 'object' && u.woerter ? h('p', { class: 'klein leise' }, [].concat(u.woerter).join(' → ')) : null, h('p', null, text)));
  });

  // --- Zeilen-Navigation
  const zs = lied.zeilen.filter((x) => x.text), zi = zs.indexOf(z);
  const nav = h('div', { class: 'knopf-reihe' },
    zi > 0 ? h('a', { class: 'knopf', href: `#lied/${enc(id)}/zeile/${enc(zs[zi - 1].id)}` }, ic('zurueck'), 'Vorige Zeile') : null,
    zi < zs.length - 1 ? h('a', { class: 'knopf', href: `#lied/${enc(id)}/zeile/${enc(zs[zi + 1].id)}` }, 'Nächste Zeile', ic('weiter')) : null);

  const buehne = h('section', { class: 'karte buehne' }, kette, unter,
    h('div', { class: 'steuer' }, schleifeKnopf, playKnopf, micKnopf));
  const regler = h('section', { class: 'karte' }, stufenSeg,
    h('div', { style: { marginTop: '12px' } }, artSeg),
    h('div', { class: 'regler', style: { marginTop: '12px' } }, h('label', null, 'Tempo'), tempoIn, tempoOut),
    h('div', { class: 'regler' }, h('label', null, 'Tonart'), h('div', { class: 'stepper' },
      h('button', { 'aria-label': 'Einen Halbton tiefer', onclick: () => transSchritt(-1) }, '−'), transOut,
      h('button', { 'aria-label': 'Einen Halbton höher', onclick: () => transSchritt(1) }, '+')), h('span')),
    noten[0] && noten[0].ohneMelodie ? h('p', { class: 'leise klein', style: { marginTop: '10px' } }, `Ohne Melodie: die Vokale klingen auf ${nName(noten[0].midi, ton)}.`) : null);

  return [h('div', { class: 'zwei-spalten' },
    h('div', null, buehne, h('div', { style: { marginTop: '12px' } }, leinwand),
      h('p', { class: 'leise klein', style: { marginTop: '8px', textAlign: 'center' } }, 'Mikrofon an: deine Linie gegen die Notenbalken – nur zur Orientierung.')),
    h('div', null, regler,
      ueKarten.length ? h('h2', null, 'Übergänge in dieser Zeile') : null, ...ueKarten)),
    nav];
}

// ================================================================ #warmup/<id>
async function seiteWarmup(id) {
  setzeNav('warmup');
  const lied = await holeLied(id) || await holeLied('the-wall');
  if (!lied) return nichtGefunden();
  setzeKopf(`Warm-up · ${lied.titel}`, `#lied/${enc(lied.id)}`);
  const st = stimme(), ton = lied.tonart;
  let schritte = istFn(M.ue.warmup) ? versuch(() => M.ue.warmup(liedFuer(lied), st), []) : [];
  if (!Array.isArray(schritte) || !schritte.length) {
    const u = lied.umfang || { tief: grundton() - 5, hoch: grundton() + 5 };
    schritte = [
      { uebung: '', titel: 'Lockern', text: 'Schultern kreisen, Kiefer locker hängen lassen, gähnen.', minuten: 1 },
      { uebung: '', titel: 'Lippenflattern', text: 'Auf „brrr“ bequem auf und ab gleiten.', minuten: 2, ton: [u.tief, u.hoch] },
      { uebung: '', titel: 'Sirene über den Umfang des Lieds', text: 'Auf „ng“ vom tiefsten zum höchsten Ton des Lieds gleiten.', minuten: 2, ton: [u.tief, u.hoch + 1] },
      { uebung: '', titel: 'Vokal-Leiter', text: 'i – e – a – o – u auf einem bequemen Ton.', minuten: 2, ton: grundton(st) },
    ];
  }
  const gesamt = schritte.reduce((s, x) => s + (Number(x.minuten) || 1), 0);
  let i = 0, rest = 0, laeuft = false, uhrTimer = 0;
  const ein = Object.assign({ art: 'klavier' }, speicher.hole('warmEin', {}) || {});
  const box = h('div');
  const punkteLeiste = h('div', { class: 'schritt-punkte', 'aria-hidden': 'true' });
  aufraeumen.push(() => clearInterval(uhrTimer));

  function notenAus(tonWert, schritt, verschiebung = 0) {
    if (tonWert == null) return [];
    const u = uebungVon(schritt && schritt.uebung);
    // Vokale: aus dem Schritt (vokale), aus der Zeile (vokale-melodie) oder sanfter Standard „u“
    let vokale = Array.isArray(schritt && schritt.vokale) && schritt.vokale.length ? schritt.vokale.map((v) => ({ vokal: v })) : null;
    if (!vokale && schritt && schritt.zeile) {
      const z = lied.zeilen.find((x) => x.id === schritt.zeile);
      if (z) vokale = silbenVon(z.text, z.sprache);
    }
    const vk = (k) => (vokale ? vokale[k % vokale.length] : { vokal: (u && u.vokal) || 'u' });
    let liste = null, dauern = null, lo, hi;
    if (typeof tonWert === 'number') liste = [tonWert];
    else if (Array.isArray(tonWert)) liste = tonWert.filter(isFinite);
    else if (typeof tonWert === 'object') {
      if (Array.isArray(tonWert.folge)) liste = tonWert.folge.filter(isFinite);
      else if (Array.isArray(tonWert.noten)) liste = tonWert.noten.map((n) => (typeof n === 'object' ? n.midi : n)).filter(isFinite);
      if (Array.isArray(tonWert.dauern)) dauern = tonWert.dauern;
      lo = tonWert.tief ?? tonWert.von ?? tonWert.start ?? tonWert.midi; hi = tonWert.hoch ?? tonWert.bis ?? lo;
      if (!liste && isFinite(lo)) liste = lo === hi ? [lo] : [lo, hi, lo];
    }
    if (!liste || !liste.length) return [];
    const lang = (tonWert && tonWert.gleiten) || liste.length <= 2 ? 1.2 : 0.42;
    let t = 0;
    return liste.map((m, k) => {
      const d = dauern && isFinite(dauern[k]) ? dauern[k] : liste.length === 1 ? 1.8 : lang;
      const p = vk(k), n = { t, dauer: d * 0.95, midi: m + verschiebung, vokal: p.vokal || 'u', gleit: p.gleit || '' };
      t += d; return n;
    });
  }
  function zeigeSchritt() {
    clearInterval(uhrTimer); laeuft = false; stoppeKlang();
    const s = schritte[i] || {};
    const u = uebungVon(s.uebung);
    rest = Math.round((Number(s.minuten) || 1) * 60);
    const ges = rest;
    punkteLeiste.replaceChildren(...schritte.map((_, k) => h('i', { class: k === i ? 'an' : k < i ? 'fertig' : '' })));
    const uhr = h('div', { class: 'uhr' }, mmss(rest));
    const balken = h('i');
    const zb = h('div', { class: 'zeit-balken' }, balken);
    const startKnopf = h('button', { class: 'knopf breit', onclick: () => {
      if (laeuft) { clearInterval(uhrTimer); laeuft = false; startKnopf.replaceChildren(ic('play'), 'Weiter laufen lassen'); return; }
      laeuft = true; startKnopf.replaceChildren(ic('pause'), 'Pause');
      uhrTimer = setInterval(() => {
        rest = Math.max(0, rest - 1); uhr.textContent = mmss(rest); balken.style.transform = `scaleX(${1 - rest / ges})`;
        if (rest === 0) { clearInterval(uhrTimer); laeuft = false; startKnopf.replaceChildren(ic('haken'), 'Zeit um'); meldung(i < schritte.length - 1 ? 'Gut – weiter zum nächsten Schritt' : 'Warm-up geschafft'); }
      }, 1000);
    } }, ic('uhr'), 'Zeit starten');
    const starts = s.ton && Array.isArray(s.ton.starts) && s.ton.starts.length > 1 ? s.ton.starts : null;
    let durchgang = 0;
    const versatz = () => (starts ? starts[durchgang] - (s.ton.start ?? starts[0]) : 0);
    const nn0 = notenAus(s.ton, s);
    const artSeg = h('div', { class: 'segment' }, [['klavier', 'Klavier', 'klavier'], ['stimme', 'Vokalstimme', 'welle']].map(([w, txt, icn]) => {
      const b = h('button', { class: ein.art === w ? 'an' : '', onclick: () => { ein.art = w; speicher.merke('warmEin', ein); artSeg.querySelectorAll('button').forEach((x) => x.classList.toggle('an', x === b)); } }, ic(icn), txt);
      return b;
    }));
    const bereichText = () => { const nn = notenAus(s.ton, s, versatz()); const ms = nn.map((n) => n.midi); return nName(Math.min(...ms), ton) + (Math.max(...ms) > Math.min(...ms) ? '–' + nName(Math.max(...ms), ton) : ''); };
    const spielKnopf = h('button', { class: 'knopf haupt breit', onclick: () => { stoppeKlang(); spieleFolge(notenAus(s.ton, s, versatz()), { art: ein.art }); } }, ic('play'), h('span', null, ''));
    const setzeSpielText = () => { spielKnopf.lastChild.textContent = `Vorspielen (${nn0.length ? bereichText() : ''})`; };
    const durchText = h('output', null, '');
    const zeigeDurch = () => { durchText.textContent = `Durchgang ${durchgang + 1} von ${starts.length}`; setzeSpielText(); };
    const durchReihe = starts ? h('div', { class: 'regler', style: { marginTop: '12px' } },
      h('button', { class: 'knopf klein', 'aria-label': 'Einen Halbton tiefer', onclick: () => { durchgang = Math.max(0, durchgang - 1); zeigeDurch(); spielKnopf.click(); } }, '−'),
      durchText,
      h('button', { class: 'knopf klein', 'aria-label': 'Nächster Durchgang, einen Halbton höher', onclick: () => { durchgang = Math.min(starts.length - 1, durchgang + 1); zeigeDurch(); spielKnopf.click(); } }, '+')) : null;
    if (starts) { durchText.style.textAlign = 'center'; zeigeDurch(); } else setzeSpielText();
    const zeileLink = s.zeile && lied.zeilen.find((x) => x.id === s.zeile) ? h('a', { class: 'chip', href: `#lied/${enc(lied.id)}/zeile/${enc(s.zeile)}`, style: { minHeight: '44px', marginTop: '12px' } }, ic('play'), 'Diese Zeile üben') : null;
    const vorspielen = nn0.length ? h('div', null, spielKnopf, durchReihe, h('div', { style: { marginTop: '10px' } }, artSeg)) : null;
    const vokalReihe = Array.isArray(s.vokale) && s.vokale.length ? h('div', { class: 'kette', style: { paddingTop: '10px' } }, s.vokale.map((v) => kugel({ vokal: v, anzeige: String(v).toUpperCase() }))) : null;
    box.replaceChildren(
      h('section', { class: 'karte' },
        h('div', { class: 'ueb-kopf' }, uebSymbol(u, true), h('div', null,
          h('p', { class: 'leise klein' }, `Schritt ${i + 1} von ${schritte.length} · ${minText(s.minuten)} Min.`),
          h('h3', { style: { fontSize: '21px' } }, s.titel || (u && u.titel) || 'Übung'))),
        vokalReihe,
        s.text ? h('p', { style: { marginTop: '12px' } }, s.text) : null, zeileLink,
        u && u.anleitung ? h('ol', { class: 'anleitung' }, u.anleitung.map((a) => h('li', null, a))) : null),
      h('section', { class: 'karte' }, uhr, zb, h('div', { style: { marginTop: '12px' } }, startKnopf)),
      vorspielen ? h('section', { class: 'karte' }, vorspielen) : null,
      h('div', { class: 'knopf-reihe' },
        i > 0 ? h('button', { class: 'knopf', onclick: () => { i--; zeigeSchritt(); window.scrollTo(0, 0); } }, ic('zurueck'), 'Zurück') : null,
        i < schritte.length - 1 ? h('button', { class: 'knopf haupt', onclick: () => { i++; zeigeSchritt(); window.scrollTo(0, 0); } }, 'Weiter', ic('weiter'))
          : h('a', { class: 'knopf haupt', href: `#lied/${enc(lied.id)}`, onclick: () => meldung('Warm-up geschafft – viel Freude beim Singen') }, ic('haken'), 'Fertig – zum Lied')));
    box.classList.remove('rein'); void box.offsetWidth; box.classList.add('ansicht', 'rein');
    box.style.padding = '0'; box.style.maxWidth = 'none';
  }
  zeigeSchritt();
  return [h('section', { class: 'held' }, h('h1', null, 'Warm-up'), h('p', null, `${Math.round(gesamt)} Minuten, passend zu „${lied.titel}“${st && st.kern ? ' und deiner Stimme' : ''}.`),
    h('div', { style: { marginTop: '14px' } }, punkteLeiste)),
  !st || !st.kern ? h('a', { class: 'karte hinweis-karte', href: '#stimme' }, h('span', { class: 'pfeil' }, ic('hinweis')), h('p', { class: 'klein' }, 'Stimmlage ermitteln für genauere Übungen.')) : null,
  box,
  h('p', { class: 'leise klein', style: { textAlign: 'center' } }, 'Bei Schmerz, Kratzen oder Heiserkeit: aufhören und Pause machen.')];
}

// ================================================================ #stimme
function seiteStimme() {
  setzeKopf('Meine Stimmlage'); setzeNav('stimme');
  const box = h('div');
  const SCHRITTE = [
    { titel: 'Tiefster bequemer Ton', text: 'Sing auf „a“ oder „u“ langsam von der Mitte nach unten – nur so tief, wie es ohne Knarren geht. Halte den tiefsten bequemen Ton kurz.', sek: 8 },
    { titel: 'Höchster bequemer Ton', text: 'Jetzt langsam nach oben gleiten – so hoch, wie es ohne Druck geht. Den höchsten bequemen Ton kurz halten.', sek: 8 },
    { titel: 'Eine Zeile', text: 'Sing eine Zeile aus einem Lied, ganz normal in deiner Lage.', sek: 10 },
  ];
  let stufe = 0, stopFn = null, timer = 0;
  let spur = [];
  aufraeumen.push(() => { clearInterval(timer); if (stopFn) stopFn(); stopFn = null; });

  function ergebnis(st) {
    const baender = [{ ...BAND_GANZ, lo: st.tief, hi: st.hoch, name: `Bequem ${nName(st.tief)}–${nName(st.hoch)}` }];
    if (st.kern && isFinite(st.kern[0])) baender.push({ ...BAND_KERN, lo: st.kern[0], hi: st.kern[1], name: `Kern ${nName(st.kern[0])}–${nName(st.kern[1])}` });
    return h('section', { class: 'karte' },
      h('p', { class: 'leise klein' }, st.quelle === 'profil' ? 'Aus deinem Stimmprofil' : 'Schätzung aus deiner Aufnahme'),
      h('h3', { style: { fontSize: '24px', margin: '2px 0 8px' } }, st.typ ? `Eher ${st.typ}` : 'Deine Lage'),
      isFinite(st.tief) ? klaviatur(baender.filter((b) => isFinite(b.lo) && isFinite(b.hi)), st.uebergaenge || []) : null,
      legende(baender.filter((b) => isFinite(b.lo)), st.uebergaenge || []),
      st.text ? h('p', { style: { marginTop: '12px' } }, st.text) : null,
      h('p', { class: 'leise klein', style: { marginTop: '8px' } }, 'Eine Schätzung, kein Urteil – die Lage ändert sich mit Übung, Tagesform und Aufwärmen.'));
  }
  function zeigeUebersicht() {
    const st = stimme();
    box.replaceChildren(
      h('section', { class: 'held' }, h('h1', null, 'Meine Stimmlage'), h('p', null, 'Sing kurz ins Mikrofon oder lade eine Gesangsaufnahme. Alles bleibt auf diesem Gerät.')),
      st && (isFinite(st.tief) || st.kern) ? ergebnis(st) : h('div', { class: 'karte leer' }, h('p', null, 'Noch keine Stimmlage gespeichert.')),
      h('button', { class: 'knopf haupt breit', onclick: geführt }, ic('stimme'), st ? 'Neu ermitteln (singen)' : 'Jetzt singen – 3 kurze Schritte'),
      h('label', { class: 'datei-feld' }, ic('datei'), h('span', null, h('b', null, 'Gesangsdatei laden'), h('br'), h('span', { class: 'leise klein' }, 'WAV, MP3, M4A – am besten nur Gesang')),
        h('input', { type: 'file', accept: 'audio/*,.wav,.mp3,.m4a,.aif,.aiff,.flac', onchange: (e) => e.target.files[0] && ausDatei(e.target.files[0]) })),
      st ? h('button', { class: 'knopf klein', onclick: () => { speicher.loescheStimme(); meldung('Stimmlage gelöscht'); zeigeUebersicht(); } }, ic('loeschen'), 'Gespeicherte Stimmlage löschen') : null);
  }
  function auswerten(sp) {
    let st = istFn(M.ton.stimmlage) ? versuch(() => M.ton.stimmlage(sp), null) : null;
    fertig(st);
  }
  function fertig(st) {
    if (!st || !isFinite(st.tief)) {
      box.replaceChildren(h('div', { class: 'karte leer' }, h('p', null, (st && st.text) || 'Es wurden zu wenige klare Töne erkannt. Bitte noch einmal – etwas lauter, näher am Mikrofon, Töne kurz halten.')),
        h('button', { class: 'knopf haupt breit', onclick: geführt }, 'Noch einmal'), h('button', { class: 'knopf breit', onclick: zeigeUebersicht }, 'Zurück'));
      return;
    }
    const alt = stimme();
    const neu = { tief: st.tief, hoch: st.hoch, kern: st.kern, typ: st.typ, sicherheit: st.sicherheit, text: st.text, uebergaenge: (alt && alt.uebergaenge) || [], quelle: 'aufnahme', datum: Date.now() };
    speicher.speichereStimme(neu);
    meldung('Deine Stimmlage ist gespeichert');
    zeigeUebersicht();
  }
  async function ausDatei(datei) {
    box.replaceChildren(h('div', { class: 'karte leer' }, h('div', { class: 'laden-kugeln', style: { justifyContent: 'center' } }, h('span'), h('span'), h('span')), h('p', { style: { marginTop: '14px' } }, 'Aufnahme wird ausgewertet …')));
    try {
      const { x, sr } = await ladeDatei(datei);
      const r = await imHintergrund('stimmlage', x, sr, {});
      fertig(r && r.stimme ? r.stimme : r);
    } catch (e) { meldung('Datei ließ sich nicht lesen: ' + (e && e.message || e), 5000); zeigeUebersicht(); }
  }
  function geführt() { stufe = 0; spur = []; zeigeStufe(); }
  function zeigeStufe() {
    const s = SCHRITTE[stufe];
    const blase = h('div', { class: 'ton-blase' }, '–');
    const ring = h('div', { class: 'mic-ring' }, h('span', { class: 'welle' }), h('span', { class: 'welle' }), h('button', { class: 'rund-knopf', 'aria-label': 'Aufnahme starten', onclick: () => los() }, ic('stimme')));
    const info = h('p', { class: 'leise' }, 'Tippe auf das Mikrofon, wenn du bereit bist.');
    const leiste = h('div', { class: 'stufen-leiste' }, SCHRITTE.map((x, k) => h('div', { class: k === stufe ? 'an' : k < stufe ? 'fertig' : '' }, h('b', null, k < stufe ? '✓' : String(k + 1)), x.titel)));
    box.replaceChildren(h('section', { class: 'karte' }, leiste),
      h('section', { class: 'karte mic-buehne' }, h('h3', { style: { fontSize: '22px' } }, s.titel), h('p', null, s.text), ring, blase, info),
      h('div', { class: 'knopf-reihe' }, h('button', { class: 'knopf', onclick: () => { clearInterval(timer); if (stopFn) stopFn(); stopFn = null; weiter(); } }, stufe < SCHRITTE.length - 1 ? 'Schritt überspringen' : 'Auswerten'),
        h('button', { class: 'knopf', onclick: () => { clearInterval(timer); if (stopFn) stopFn(); stopFn = null; zeigeUebersicht(); } }, 'Abbrechen')));
    async function los() {
      if (stopFn) return;
      try {
        stopFn = await starteMikro((e) => {
          if (e) spur.push({ hz: e.hz > 0 ? e.hz : 0, sicher: typeof e.sicher === 'number' ? e.sicher : e.hz > 0 ? 1 : 0, pegel: isFinite(e.pegel) ? e.pegel : -100 });
          const m = tonAusEreignis(e);
          blase.textContent = m == null ? '…' : nName(m);
        });
      } catch (err) { meldung(String(err && err.message || err), 5000); return; }
      ring.classList.add('aktiv');
      let r = s.sek; info.textContent = `Noch ${r} s …`;
      timer = setInterval(() => {
        r--; info.textContent = r > 0 ? `Noch ${r} s …` : 'Danke!';
        if (r <= 0) { clearInterval(timer); if (stopFn) stopFn(); stopFn = null; ring.classList.remove('aktiv'); setTimeout(weiter, 500); }
      }, 1000);
    }
  }
  function weiter() {
    if (stufe < SCHRITTE.length - 1) { stufe++; zeigeStufe(); return; }
    auswerten(spur);
  }
  zeigeUebersicht();
  return box;
}

// ================================================================ #neu
function seiteNeu() {
  setzeKopf('Lied hinzufügen', '#start'); setzeNav('start');
  let datei = null, spracheWahl = '';
  const titel = h('input', { type: 'text', id: 'f-titel', placeholder: 'z. B. Mein Lied', autocomplete: 'off', maxlength: '80' });
  const text = h('textarea', { id: 'f-text', placeholder: 'Liedtext hier einfügen – eine Zeile pro Gesangszeile.\nLeerzeile = neuer Teil, [Refrain] = Name des Teils.' });
  const sprachChip = h('span', { class: 'chip warm' }, 'Sprache: –');
  const vorschau = h('div', { class: 'kette', style: { justifyContent: 'flex-start', gap: '10px 6px' } });
  const vorschauText = h('p', { class: 'vokal-text', style: { textAlign: 'left' } });
  const dateiName = h('span', { class: 'leise klein' }, 'Optional – Gesang (a cappella) ergibt die genauesten Noten. Ohne Audio gibt es Vokal-Übungen ohne Melodie.');
  let vt = 0;
  const aktualisiere = () => {
    clearTimeout(vt);
    vt = setTimeout(() => {
      const zeilen = text.value.split('\n').map((x) => x.trim()).filter((x) => x && !/^\[.*\]$/.test(x));
      const sp = spracheWahl || spracheVon(zeilen.join(' '));
      sprachChip.textContent = `Sprache: ${sp === 'de' ? 'Deutsch' : 'Englisch'}${spracheWahl ? '' : ' (erkannt)'}`;
      const erste = zeilen[0] || '';
      const P = erste ? silbenVon(erste, sp) : [];
      vorschau.replaceChildren(...P.slice(0, 14).map((s) => kugel(s, 'mini')));
      vorschauText.textContent = P.length ? kettenText(P) : 'Hier erscheint die Vokal-Kette deiner ersten Zeile.';
    }, 200);
  };
  text.addEventListener('input', aktualisiere);
  const sprachWahl = h('select', { 'aria-label': 'Sprache', onchange: (e) => { spracheWahl = e.target.value; aktualisiere(); } },
    h('option', { value: '' }, 'automatisch'), h('option', { value: 'en' }, 'Englisch'), h('option', { value: 'de' }, 'Deutsch'));
  const status = h('p', { class: 'leise', style: { textAlign: 'center' } });
  const speichernKnopf = h('button', { class: 'knopf haupt breit', onclick: speichern }, ic('haken'), 'Speichern');

  async function speichern() {
    const roh = text.value.replace(/\r/g, '');
    if (!roh.trim()) { meldung('Bitte zuerst den Liedtext einfügen'); text.focus(); return; }
    speichernKnopf.disabled = true;
    try {
      const id = 'eigen-' + Date.now().toString(36);
      const teile = [], zeilen = [];
      let teil = null, nr = 0;
      const neuerTeil = (name) => { nr++; teil = { id: 't' + nr, name: name || `Teil ${nr}` }; teile.push(teil); };
      for (const zeile of roh.split('\n')) {
        const t = zeile.trim();
        const kopfM = t.match(/^\[(.+)\]$/);
        if (kopfM) { neuerTeil(kopfM[1].trim()); continue; }
        if (!t) { if (teil && zeilen.some((z) => z.teil === teil.id)) teil = null; continue; }
        if (!teil) neuerTeil();
        zeilen.push({ id: `${teil.id}-${zeilen.filter((z) => z.teil === teil.id).length + 1}`, teil: teil.id, text: t });
      }
      const sp = spracheWahl || spracheVon(zeilen.map((z) => z.text).join(' '));
      for (const z of zeilen) { z.sprache = sp; z.silben = silbenVon(z.text, sp).map((s) => ({ text: s.text || '' })); }
      let noten = null, umfang = null;
      if (datei) {
        status.textContent = 'Melodie wird aus der Aufnahme gelesen … (kann etwas dauern)';
        try {
          const { x, sr } = await ladeDatei(datei);
          const r = await imHintergrund('melodie', x, sr, {});
          noten = Array.isArray(r) ? r.filter((n) => isFinite(n.midi) && n.midi > 0) : null;
          await speicher.speichereAudio(id, datei);
        } catch (e) { console.warn(e); meldung('Audio ließ sich nicht auswerten – das Lied wird ohne Melodie gespeichert', 4500); }
      }
      if (noten && noten.length) {
        // Silben der Reihe nach auf die erkannten Töne verteilen (grobe Zuordnung)
        const alle = zeilen.flatMap((z) => z.silben), S = alle.length, N = noten.length;
        alle.forEach((s, k) => { const n = noten[Math.min(N - 1, Math.floor((k * N) / S))]; s.t = n.t; s.dauer = Math.max(0.15, n.dauer || 0.4); s.midi = Math.round(n.midi); });
        for (const z of zeilen) { const ss = z.silben.filter((s) => isFinite(s.t)); if (ss.length) { z.start = ss[0].t; z.ende = ss[ss.length - 1].t + ss[ss.length - 1].dauer; } }
        const ms = noten.map((n) => Math.round(n.midi)).sort((a, b) => a - b);
        const q = (p) => ms[Math.min(ms.length - 1, Math.max(0, Math.round(p * (ms.length - 1))))];
        // seltene Ausreißer (Erkennungsfehler) nicht als Umfang zählen
        umfang = { tief: q(0.02), hoch: q(0.98) };
      }
      const lied = { id, titel: titel.value.trim() || 'Mein Lied', kuenstler: 'eigenes Lied', sprache: sp, teile, zeilen, umfang: umfang || null, erstellt: Date.now(), mitAudio: !!datei };
      const dauerhaft = await speicher.speichereLied(lied);
      liedCache.delete(id);
      meldung(dauerhaft ? 'Lied gespeichert – nur auf diesem Gerät' : 'Gespeichert bis zum Neuladen (Speicher hier nicht verfügbar)', 3500);
      location.hash = `#lied/${enc(id)}`;
    } finally { speichernKnopf.disabled = false; status.textContent = ''; }
  }
  aktualisiere();
  return [h('section', { class: 'held' }, h('h1', null, 'Lied hinzufügen'), h('p', null, 'Text einfügen – der Trainer macht daraus Vokal-Ketten, Übergänge und einen Lernweg.')),
    h('section', { class: 'karte' },
      h('div', { class: 'feld' }, h('label', { for: 'f-titel' }, 'Titel'), titel),
      h('div', { class: 'feld' }, h('label', { for: 'f-text' }, 'Liedtext'), text),
      h('div', { class: 'feld', style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '10px' } }, sprachChip, sprachWahl)),
    h('section', { class: 'karte' }, h('h3', null, 'Vorschau: erste Zeile'), vorschau, vorschauText),
    h('section', { class: 'karte' }, h('label', { class: 'datei-feld' }, ic('datei'),
      h('span', null, h('b', null, 'Audio dazu (optional)'), h('br'), dateiName),
      h('input', { type: 'file', accept: 'audio/*,.wav,.mp3,.m4a,.aif,.aiff,.flac', onchange: (e) => { datei = e.target.files[0] || null; dateiName.textContent = datei ? datei.name : 'Keine Datei'; } }))),
    speichernKnopf, status,
    h('p', { class: 'leise klein', style: { textAlign: 'center' } }, 'Text und Audio bleiben auf diesem Gerät. Es wird nichts gesendet.')];
}

// ================================================================ #uebungen
function seiteUebungen() {
  setzeKopf('Übungen'); setzeNav('uebungen');
  const liste = uebungsListe();
  if (!liste.length) return h('div', { class: 'karte leer' }, h('p', null, 'Die Übungs-Bibliothek wird gerade vorbereitet.'));
  const NAMEN = { hoehe: 'Höhe', tiefe: 'Tiefe', uebergang: 'Übergang', diphthong: 'Diphthonge', atem: 'Atem', rhythmus: 'Rhythmus', lockerung: 'Lockerung', sovt: 'Halb-geschlossen (SOVT)', vokale: 'Vokale', resonanz: 'Resonanz', text: 'Text', konsonanten: 'Konsonanten' };
  const alleSw = [...new Set(liste.flatMap((u) => u.stichworte || []))];
  let filter = speicher.hole('uebFilter', '') || '';
  const karten = h('div');
  const chips = h('div', { class: 'chips', style: { overflowX: 'auto', flexWrap: 'nowrap', paddingBottom: '4px' } });
  function male() {
    chips.replaceChildren(...[''].concat(alleSw).map((sw) => h('button', { class: `chip ${filter === sw ? 'an' : ''}`, style: { flex: 'none' }, onclick: () => { filter = sw; speicher.merke('uebFilter', sw); male(); } }, sw ? (NAMEN[sw] || sw) : 'Alle')));
    karten.replaceChildren(...liste.filter((u) => !filter || (u.stichworte || []).includes(filter)).map((u) => h('details', { class: 'karte ueb' },
      h('summary', null, uebSymbol(u), h('div', { style: { flex: '1', minWidth: '0' } }, h('h3', null, u.titel), h('p', { class: 'leise klein' }, [u.dauerMin ? `${minText(u.dauerMin)} Min.` : null, u.ziel].filter(Boolean).join(' · '))), h('span', { class: 'pfeil' }, ic('weiter'))),
      h('div', { class: 'ueb-inhalt' }, u.anleitung && u.anleitung.length ? h('ol', { class: 'anleitung' }, u.anleitung.map((a) => h('li', null, a))) : null,
        (u.stichworte || []).length ? h('div', { class: 'chips', style: { marginTop: '10px' } }, u.stichworte.map((s) => h('span', { class: 'chip' }, NAMEN[s] || s))) : null))));
  }
  male();
  return [h('section', { class: 'held' }, h('h1', null, 'Übungen'), h('p', null, `${liste.length} bewährte Übungen – tippe eine an für die Anleitung.`)), chips, karten];
}

// ================================================================ Start
window.addEventListener('hashchange', zeige);
zeige();
