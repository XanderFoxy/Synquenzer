// Gesangstrainer – trainer.js: der Übungs-Spieler. Jede Übung läuft im Takt:
//   Vorsingen (Klavier, Vokalstimme oder deine eigene Aufnahme) → Einzähler 1-2-3-4 → Nachsingen mit Klick und Begleitung.
//   Sichtbar: Ziel-Tonbahn (Pianorolle) mit laufendem Cursor und deine Live-Tonhöhe als Linie darüber.
//   Nach jedem Durchgang: Prozent (0–100) mit Teilbalken und einem Tipp (bewertung.js). Alles lokal, nichts wird gesendet.
//
// export function spieler(el, plan, {onFertig(ergebnis, plan), onDurchgang(k, n, e), weiterText, onWeiter, meldung}) → {stopp(), el}
// export function ring(wert 0–1, {text, klasse}) → Element mit .setze(wert, anzeige)
// export function ergebnisKarte(e, {titel, onNochmal, onWeiter, weiterText}) → Element
// export function sitzung() (nur aus einem Tipp heraus!), mikrofon() → Promise<bool>, beendeSitzung()

import { einzelTon, klavier, vokalStimme, midiName } from './ton.js';
import { neuerPlan } from './takt.js';
import { bewerte, bewerteAtem, gesamt } from './bewertung.js';
import * as speicher from './speicher.js';

const VFARBE = { a: '#ff7f4e', e: '#ffc23e', i: '#33cdd0', o: '#b56cff', u: '#5a98ff', 'ä': '#ffa253', 'ö': '#b9a3cf', 'ü': '#5fd884' };
const VKL = { a: 'v-a', e: 'v-e', i: 'v-i', o: 'v-o', u: 'v-u', 'ä': 'v-ae', 'ö': 'v-oe', 'ü': 'v-ue' };
const vNorm = (v) => { const c = String(v || 'a').trim().toLowerCase()[0] || 'a'; return VKL[c] ? c : c === 'y' ? 'i' : 'a'; };
const klemme = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const nName = (m, ton = 'es-Moll') => midiName(Math.round(m), ton) || '–';

function h(tag, attr, ...kinder) {
  const el = document.createElement(tag);
  if (attr) for (const [k, v] of Object.entries(attr)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v; // nur feste, eigene Zeichenketten (SVG)
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kinder.flat(Infinity)) if (c != null && c !== false) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return el;
}
const ic = (name) => h('span', { html: `<svg class="ic" aria-hidden="true"><use href="#i-${name}"/></svg>`, style: { display: 'contents' } });

// ================================================================ Sitzung: ein AudioContext + Mikrofon für alle Übungen
const SZ = { ctx: null, strom: null, quelle: null, ana: null, still: null, raf: 0, uhr: 0, hoerer: null, roh: null, klein: null, vorher: 0, vorherT: -9, fehler: '', vf: null, formanten: false, letzte: 0 };
/** Muss direkt im Tipp aufgerufen werden (iOS): AudioContext anlegen bzw. wecken. */
export function sitzung() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!SZ.ctx || SZ.ctx.state === 'closed') SZ.ctx = new AC({ latencyHint: 'interactive' });
  try { const p = SZ.ctx.resume(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* egal */ }
  return SZ.ctx;
}
const ausgabeLatenz = () => (SZ.ctx ? (SZ.ctx.outputLatency || SZ.ctx.baseLatency || 0) : 0);
export async function mikrofon() {
  if (SZ.strom) return true;
  const md = navigator.mediaDevices;
  if (!md || !md.getUserMedia) { SZ.fehler = 'Mikrofon ist hier nicht verfügbar (die Seite braucht https und Mikrofon-Zugriff).'; return false; }
  try { if (navigator.audioSession) navigator.audioSession.type = 'play-and-record'; } catch (e) { /* egal */ }
  try {
    SZ.strom = await md.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 } });
  } catch (e) {
    const n = e && e.name;
    SZ.fehler = n === 'NotAllowedError' || n === 'SecurityError' ? 'Mikrofon-Zugriff ist nicht erlaubt (iPhone: Einstellungen › Safari › Mikrofon).'
      : n === 'NotFoundError' ? 'Kein Mikrofon gefunden.' : n === 'NotReadableError' ? 'Das Mikrofon wird gerade von einer anderen App benutzt.' : 'Mikrofon ließ sich nicht starten.';
    SZ.strom = null; return false;
  }
  const ctx = SZ.ctx || sitzung();
  // iOS: nach der Mikrofon-Freigabe kann der Ton kurz „unterbrochen“ sein – wecken, aber nie ewig warten
  if (ctx.state !== 'running') { try { await Promise.race([ctx.resume(), new Promise((r) => setTimeout(r, 1500))]); } catch (e) { /* egal */ } }
  SZ.quelle = ctx.createMediaStreamSource(SZ.strom);
  SZ.ana = ctx.createAnalyser(); SZ.ana.fftSize = 2048; SZ.ana.smoothingTimeConstant = 0;
  SZ.still = ctx.createGain(); SZ.still.gain.value = 0; // Safari rechnet Analyser nur, wenn sie am Ausgang hängen
  SZ.quelle.connect(SZ.ana); SZ.ana.connect(SZ.still); SZ.still.connect(ctx.destination);
  SZ.roh = new Float32Array(2048); SZ.klein = new Float32Array(1024);
  const bild = (ms) => { SZ.raf = requestAnimationFrame(bild); messen(ms); };
  SZ.raf = requestAnimationFrame(bild);
  SZ.uhr = setInterval(() => { if (performance.now() - SZ.letzte > 120) messen(performance.now()); }, 60);
  return true;
}
function messen(ms) {
  if (!SZ.ana || !SZ.hoerer || ms - SZ.letzte < 18) return;
  SZ.letzte = ms;
  const ctx = SZ.ctx, sr = ctx.sampleRate, roh = SZ.roh, N = roh.length;
  SZ.ana.getFloatTimeDomainData(roh);
  const t = ctx.currentTime - 1024 / sr - ausgabeLatenz() - 0.012;
  let e = 0, z = 0;
  for (let i = N - 1024; i < N; i++) { e += roh[i] * roh[i]; if ((roh[i] >= 0) !== (roh[i - 1] >= 0)) z++; }
  const p = 10 * Math.log10(e / 1024 + 1e-12);
  let m = null, F1 = 0, F2 = 0;
  if (p > -72) {
    let buf = roh, srd = sr;
    if (sr >= 32000) { const k = SZ.klein; for (let i = 0, j = 0; j < k.length; i += 2, j++) k[j] = 0.25 * roh[i > 0 ? i - 1 : 0] + 0.5 * roh[i] + 0.25 * roh[i + 1]; buf = k; srd = sr / 2; }
    const r = einzelTon(buf, srd, { fmin: 60, fmax: 1000, vorher: t - SZ.vorherT < 0.2 ? SZ.vorher : 0 });
    if (r.hz > 0 && r.sicher >= 0.55) { m = 69 + 12 * Math.log2(r.hz / 440); SZ.vorher = r.hz; SZ.vorherT = t; }
    if (m != null && SZ.formanten && SZ.vf && SZ.vf.formantenRahmen) {
      try { const F = SZ.vf.formantenRahmen(roh.subarray(N - Math.round(0.03 * sr)), sr); if (F) { F1 = F[0]; F2 = F[1]; } } catch (err) { /* egal */ }
    }
  }
  try { SZ.hoerer({ t, m, p, z: z / 1024, F1, F2 }); } catch (err) { console.warn(err); }
}
export function beendeSitzung() {
  SZ.hoerer = null;
  cancelAnimationFrame(SZ.raf); clearInterval(SZ.uhr);
  try { SZ.quelle && SZ.quelle.disconnect(); SZ.ana && SZ.ana.disconnect(); SZ.still && SZ.still.disconnect(); } catch (e) { /* egal */ }
  if (SZ.strom) for (const tr of SZ.strom.getTracks()) tr.stop();
  SZ.strom = SZ.quelle = SZ.ana = SZ.still = null;
  if (SZ.ctx) { try { SZ.ctx.close(); } catch (e) { /* egal */ } }
  SZ.ctx = null;
  try { if (navigator.audioSession) navigator.audioSession.type = 'auto'; } catch (e) { /* egal */ }
}

// ================================================================ Aufnahmen (eigene Stimme, Original-Instrumental) – erst bei Bedarf
const PUFFER = new Map();
/** Dekodieren und auf Mono bringen (spart auf dem iPhone die Hälfte des Speichers; zum Üben reicht Mono). */
async function dekodiere(ab, sr = 44100) {
  const O = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const off = new O(1, 1, sr);
  const b = await new Promise((ok, f) => { const p = off.decodeAudioData(ab, ok, f); if (p && p.then) p.then(ok, f); });
  if (b.numberOfChannels < 2) return b;
  const m = off.createBuffer(1, b.length, b.sampleRate), d = m.getChannelData(0), k = b.numberOfChannels;
  for (let c = 0; c < k; c++) { const x = b.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] += x[i] / k; }
  return m;
}
async function liedAudioPfad(art) {
  const cfg = await (await fetch(new URL('../daten/the-wall-audio.json', import.meta.url))).json();
  return new URL(art === 'stimme' ? cfg.vokale : cfg.instrumental, new URL('../', import.meta.url));
}
function holePuffer(liedId, art) {
  const key = liedId + ':' + art;
  if (!PUFFER.has(key)) {
    PUFFER.set(key, (async () => {
      if (liedId === 'the-wall') {
        const r = await fetch(await liedAudioPfad(art));
        if (!r.ok) throw new Error(`${art === 'stimme' ? 'Vokal-Spur' : 'Instrumental'} nicht gefunden (${r.status})`);
        return dekodiere(await r.arrayBuffer(), art === 'stimme' ? 32000 : 44100);
      }
      const blob = await speicher.ladeAudio(art === 'stimme' ? liedId : liedId + '#instrumental');
      if (!blob) throw new Error(art === 'stimme' ? 'Keine Aufnahme gespeichert' : 'Kein Instrumental gespeichert');
      return dekodiere(await blob.arrayBuffer());
    })().catch((e) => { PUFFER.delete(key); throw e; }));
  }
  return PUFFER.get(key);
}

/** Gleitender Ton (Sirene, Seufzer): Dreieck mit weichem Filter, Tonhöhe gleitet linear in Halbtönen. */
function gleitTon(ctx, ziel, m1, m2, start, dauer, laut = 0.28) {
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const o = ctx.createOscillator(); o.type = 'triangle';
  o.frequency.setValueAtTime(hz(m1), start); o.frequency.exponentialRampToValueAtTime(hz(m2), start + dauer);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200;
  const g = ctx.createGain(); g.gain.setValueAtTime(0, start); g.gain.linearRampToValueAtTime(laut, start + 0.06);
  g.gain.setValueAtTime(laut, start + Math.max(0.07, dauer - 0.12)); g.gain.linearRampToValueAtTime(0, start + dauer);
  o.connect(lp).connect(g).connect(ziel); o.start(start); o.stop(start + dauer + 0.05);
  return o;
}

// ================================================================ Prozent-Ring (füllt sich nur mit transform)
export function ring(p = 0, { text = '', klasse = '' } = {}) {
  const r = h('i'), l = h('i'), zahl = h('b', null, '0'), unter = h('small', null, text);
  const el = h('div', { class: `pring ${klasse}`, role: 'img' }, h('div', { class: 'pring-h r' }, r), h('div', { class: 'pring-h l' }, l), h('div', { class: 'pring-innen' }, zahl, unter));
  el.setze = (q, anzeige) => {
    q = klemme(Number(q) || 0); const a = 360 * q;
    r.style.transform = `rotate(${Math.min(180, a)}deg)`; l.style.transform = `rotate(${Math.max(0, a - 180)}deg)`;
    zahl.textContent = anzeige != null ? anzeige : `${Math.round(q * 100)}`;
    el.setAttribute('aria-label', `${zahl.textContent}${anzeige != null ? '' : ' Prozent'} ${text}`.trim());
  };
  el.setze(0, anzeigeStart(p));
  requestAnimationFrame(() => requestAnimationFrame(() => el.setze(p)));
  return el;
}
const anzeigeStart = () => '0';
const FARBE_WERT = (w) => (w >= 0.8 ? 'gut' : w >= 0.55 ? 'mittel' : 'schwach');

/** Ergebnis-Karte nach einer Übung: großer Prozent-Ring, Teilbalken, Atem, ein Tipp. */
export function ergebnisKarte(e, { titel = '', onNochmal, onWeiter, weiterText = 'Weiter' } = {}) {
  const knoepfe = h('div', { class: 'knopf-reihe', style: { marginTop: '14px' } },
    onNochmal ? h('button', { class: 'knopf', onclick: onNochmal }, ic('schleife'), 'Nochmal') : null,
    onWeiter ? h('button', { class: 'knopf haupt', onclick: onWeiter }, weiterText, ic('weiter')) : null);
  if (!e || e.bewegung) {
    return h('section', { class: 'karte tr-erg' }, h('div', { class: 'tr-erg-kopf' }, h('span', { class: 'tr-erg-haken' }, ic('haken')),
      h('div', null, h('p', { class: 'leise klein' }, titel), h('h3', null, e && e.bewegung ? 'Erledigt – schön locker' : 'Ohne Mikrofon keine Messung'))),
      !e ? h('p', { class: 'leise', style: { marginTop: '8px' } }, 'Die Übung lief im Takt. Für Prozent und Tipps braucht die App das Mikrofon.') : null, knoepfe);
  }
  const balken = (e.teile || []).map((t) => {
    const w = t.wert == null ? null : klemme(t.wert);
    const i = h('i', { class: w == null ? '' : FARBE_WERT(w) });
    requestAnimationFrame(() => requestAnimationFrame(() => { i.style.transform = `scaleX(${w == null ? 0 : w})`; }));
    return h('div', { class: 'tr-balken' }, h('div', { class: 'tr-balken-kopf' }, h('span', null, t.name), h('b', null, w == null ? '–' : `${Math.round(w * 100)} %`)),
      h('div', { class: 'tr-balken-bahn' }, i), h('p', { class: 'leise klein' }, t.text));
  });
  const rg = ring(e.gesamt / 100, { text: 'Prozent', klasse: FARBE_WERT(e.gesamt / 100) });
  return h('section', { class: 'karte tr-erg' },
    h('div', { class: 'tr-erg-kopf' }, rg, h('div', null, h('p', { class: 'leise klein' }, titel || 'Ergebnis'),
      h('h3', null, !e.gueltig ? 'Kaum etwas gehört' : e.gesamt >= 85 ? 'Sehr sauber' : e.gesamt >= 70 ? 'Gut gesungen' : e.gesamt >= 50 ? 'Auf dem Weg' : 'Noch wackelig – kein Problem'),
      e.durchgaenge && e.durchgaenge.length > 1 ? h('p', { class: 'leise klein' }, `Durchgänge: ${e.durchgaenge.map((x) => x + ' %').join(' · ')}`) : null)),
    h('div', { class: 'tr-balken-liste' }, balken),
    e.atem && e.atem.text ? h('p', { class: 'tr-atem klein' }, ic('uhr'), h('span', null, e.atem.text)) : null,
    e.tipp ? h('div', { class: 'tr-tipp' }, ic('hinweis'), h('p', null, h('b', null, 'Tipp: '), e.tipp)) : null,
    h('p', { class: 'leise klein', style: { marginTop: '10px' } }, 'Gemessen über das Mikrofon – eine Schätzung, kein Urteil über deine Stimme.'),
    knoepfe);
}

// ================================================================ Spieler
const SILBE_ANZ = (s) => { const t = String(s || ''); return t.length === 1 ? t.toUpperCase() : t; };
export function spieler(wurzel, plan, opt = {}) {
  const ton = opt.tonart || 'es-Moll';
  const istLied = !!plan.bpmOriginal;
  const alleEin = speicher.hole('trainerEin', {}) || {};
  const ein = { klick: true, ...(alleEin[plan.uebung + (istLied ? ':lied' : '')] || {}) };
  let begleitung = ein.begleitung || plan.begleitung;
  let vorsingen = ein.vorsingen || plan.vorsingen;
  if (plan.vorsingen === 'aufnahme' && !ein.vorsingen) vorsingen = 'aufnahme';
  if (!plan.aufnahme && (vorsingen === 'aufnahme')) vorsingen = 'stimme';
  if (!plan.aufnahme && begleitung === 'original') begleitung = 'akkord';
  const bpmGrenze = (b) => Math.round(klemme(b, plan.bpmMin || 40, plan.bpmMax || 160));
  let bpm = bpmGrenze(istLied && ein.faktor ? plan.bpmOriginal * ein.faktor : ein.bpm && !istLied ? ein.bpm : plan.bpm);
  const gesperrt = () => istLied && (vorsingen === 'aufnahme' || begleitung === 'original');
  if (gesperrt()) bpm = plan.bpmOriginal;
  const merke = () => {
    const a = { ...(speicher.hole('trainerEin', {}) || {}) };
    a[plan.uebung + (istLied ? ':lied' : '')] = { klick: ein.klick, begleitung, vorsingen, ...(istLied ? { faktor: bpm / plan.bpmOriginal } : { bpm }) };
    speicher.merke('trainerEin', a);
  };
  const singt = plan.art === 'singen' || plan.art === 'sprechen';

  // ---- DOM
  const phasePill = h('span', { class: 'tr-phase' }, 'Bereit');
  const durchText = h('span', { class: 'tr-durch' }, `${plan.durchgaenge.length} ${plan.durchgaenge.length === 1 ? 'Durchgang' : 'Durchgänge'}`);
  const micPunkt = h('span', { class: 'tr-mic', title: 'Mikrofon' }, ic('stimme'));
  const n0 = plan.durchgaenge[0] && plan.durchgaenge[0].noten[0];
  const jetztK = h('div', { class: 'tr-jetzt-k' }, n0 ? h('span', { class: `kugel ${VKL[vNorm(n0.vokal)] || 'v-a'} ${String(n0.silbe).length > 3 ? 'lang' : ''}` }, SILBE_ANZ(n0.silbe)) : null);
  const jetztT = h('div', { class: 'tr-jetzt-t' }, h('b', null, plan.durchgaenge[0] ? `Start: ${plan.durchgaenge[0].name}` : ''), h('span', { class: 'leise klein' }, singt ? 'Tippe auf Start – erst höre zu, dann sing nach.' : 'Tippe auf Start – der Klick führt dich.'));
  const atemKreis = h('div', { class: 'tr-atemkreis', 'aria-hidden': 'true' }, h('i'));
  const jetzt = h('div', { class: `tr-jetzt ${singt ? '' : 'atem'}` }, singt ? jetztK : atemKreis, jetztT);
  const cv = h('canvas', { class: 'tr-cv', 'aria-label': singt ? 'Ziel-Tonbahn mit Cursor und deiner Tonhöhe' : 'Ablauf im Takt mit Cursor' });
  const zahl = h('div', { class: 'tr-zahl', 'aria-live': 'assertive' });
  const live = h('div', { class: 'tr-live' }, '');
  const pegelI = h('i');
  const rolle = h('div', { class: 'tr-rolle' }, cv, zahl, live, h('div', { class: 'tr-pegel', 'aria-hidden': 'true' }, pegelI));
  const chips = h('div', { class: 'tr-chips', 'aria-live': 'polite' });
  const startIc = h('span', { style: { display: 'contents' } }, ic('play'));
  const startK = h('button', { class: 'rund-knopf tr-start', 'aria-label': 'Übung starten', onclick: () => (laeuft ? stopp(true) : start()) }, startIc);
  const startText = h('span', { class: 'tr-start-text' }, 'Start');
  const bpmOut = h('output', { class: 'tr-bpm' }, '');
  const minus = h('button', { 'aria-label': 'Langsamer', onclick: () => setzeBpm(bpm - 4) }, '−');
  const plus = h('button', { 'aria-label': 'Schneller', onclick: () => setzeBpm(bpm + 4) }, '+');
  const tempoBox = h('div', { class: 'tr-tempo' }, h('span', { class: 'klein leise' }, 'Tempo'), h('div', { class: 'stepper' }, minus, bpmOut, plus));
  const hinweis = h('p', { class: 'tr-hinweis klein leise' }, plan.hinweis || '');
  const segment = (werte, aktiv, setzen) => {
    const box = h('div', { class: 'segment tr-seg', role: 'group' });
    for (const [w, text] of werte) {
      const b = h('button', { class: w === aktiv() ? 'an' : '', 'aria-pressed': String(w === aktiv()), onclick: () => { setzen(w); box.querySelectorAll('button').forEach((x) => { const an = x === b; x.classList.toggle('an', an); x.setAttribute('aria-pressed', String(an)); }); } }, text);
      box.append(b);
    }
    return box;
  };
  const begSeg = segment([['akkord', 'Akkord'], ['bordun', 'Bordun'], ...(plan.aufnahme && plan.lied && (plan.lied.id === 'the-wall') ? [['original', 'Original']] : []), ['aus', 'Aus']], () => begleitung, (w) => { begleitung = w; if (gesperrt()) setzeBpm(plan.bpmOriginal); zeigeBpm(); merke(); probe(w); });
  const vorSeg = segment([['klavier', 'Klavier'], ['stimme', 'Stimme'], ...(plan.aufnahme ? [['aufnahme', plan.lied && plan.lied.id === 'the-wall' ? 'Meine Stimme' : 'Aufnahme']] : []), ['aus', 'Aus']], () => vorsingen, (w) => { vorsingen = w; if (gesperrt()) setzeBpm(plan.bpmOriginal); zeigeBpm(); merke(); probe('vor:' + w); });
  const klickK = h('button', { class: `chip tr-klick ${ein.klick ? 'an' : ''}`, 'aria-pressed': String(ein.klick), onclick: () => { ein.klick = !ein.klick; klickK.classList.toggle('an', ein.klick); klickK.setAttribute('aria-pressed', String(ein.klick)); klickK.lastChild.textContent = ein.klick ? 'Klick an' : 'Klick nur beim Einzählen'; merke(); } }, ic('uhr'), h('span', null, ein.klick ? 'Klick an' : 'Klick nur beim Einzählen'));
  const optionen = h('div', { class: 'tr-optionen' },
    singt ? h('div', null, h('span', { class: 'tr-opt-name' }, 'Vorsingen'), vorSeg) : null,
    singt ? h('div', null, h('span', { class: 'tr-opt-name' }, 'Begleitung'), begSeg) : null,
    h('div', { class: 'chips' }, klickK));
  const ergBox = h('div', { class: 'tr-ergebnis', hidden: true });
  const karte = h('section', { class: `karte tr ${singt ? '' : 'tr-atem-art'}` },
    h('div', { class: 'tr-kopf' }, phasePill, durchText, micPunkt),
    jetzt, rolle, chips,
    h('div', { class: 'tr-steuer' }, h('div', { class: 'tr-start-box' }, startK, startText), tempoBox),
    optionen, hinweis);
  const box = h('div', { class: 'tr-wurzel' }, karte, ergBox);
  wurzel.append(box);

  function zeigeBpm() {
    bpmOut.textContent = istLied ? `${bpm} BPM · ${Math.round((bpm / plan.bpmOriginal) * 100)} %` : `${bpm} BPM`;
    const g = gesperrt(); minus.disabled = g || bpm <= (plan.bpmMin || 40); plus.disabled = g || bpm >= (plan.bpmMax || 160);
    tempoBox.title = g ? 'Deine Aufnahme und das Original laufen nur im Originaltempo' : '';
    tempoBox.classList.toggle('gesperrt', g);
  }
  function setzeBpm(b) { bpm = gesperrt() ? plan.bpmOriginal : bpmGrenze(b); zeigeBpm(); merke(); if (!aktiv) male(); }
  zeigeBpm();
  if (gesperrt()) hinweis.textContent = [plan.hinweis, 'Deine Aufnahme läuft im Originaltempo – für langsamer „Stimme“ oder „Klavier“ wählen.'].filter(Boolean).join(' ');
  /** Klangprobe beim Umschalten, damit jeder Knopf sofort etwas hören lässt. */
  function probe(w) {
    if (laeuft) return;
    const ctx = sitzung(), D = plan.durchgaenge[0]; if (!D) return;
    const pl = neuerPlan(ctx), t = ctx.currentTime + 0.05, n0 = D.noten[0];
    const ausblenden = () => setTimeout(() => { if (!laeuft) pl.stopp(); }, 2600);
    if (w === 'original' || w === 'vor:aufnahme') { // Aufnahme erst laden – die Probe klingt, sobald sie da ist (nicht vorher abschalten)
      phasePill.textContent = 'Aufnahme wird geladen …';
      holePuffer(plan.aufnahme.liedId, w === 'original' ? 'inst' : 'stimme').then((b) => {
        if (laeuft) { pl.stopp(); return; }
        phasePill.textContent = 'Bereit'; pl.puffer(b, ctx.currentTime + 0.05, D.liedAb || 0, 2, 0.9); ausblenden();
      }).catch((e) => { pl.stopp(); if (!laeuft) phasePill.textContent = 'Bereit'; meld('Aufnahme nicht verfügbar: ' + (e && e.message || e)); });
      return;
    }
    if (w === 'akkord' && D.akkorde[0]) pl.akkord(pl.instrument(klavier(ctx, { ziel: pl.bus, lautstaerke: 0.35 })), [D.akkorde[0].bass, ...D.akkorde[0].toene], t, 1.2);
    else if (w === 'bordun' && D.bordun.length) pl.bordun(D.bordun, t, t + 1.4, 0.6);
    else if (w === 'vor:klavier' && n0) pl.instrument(klavier(ctx, { ziel: pl.bus })).spiele(n0.midi, t, 0.8);
    else if (w === 'vor:stimme' && n0) pl.instrument(vokalStimme(ctx, { ziel: pl.bus })).singe(vokalFuer(n0), n0.midi, t, 0.9, n0.gleit || '');
    ausblenden();
  }
  const meld = (t) => (opt.meldung ? opt.meldung(t) : null);
  const vokalFuer = (n) => { const v = String(n.vokal || 'a').toLowerCase(); return /^[aeiouäöü]/.test(v) ? v : 'u'; };

  // ---- Ablauf
  let laeuft = false, aktiv = null, timer = 0, raf = 0, ergebnisse = [], letzteZahl = 0, letztePhase = '', laufNr = 0;
  let micOk = false, FORM = null;
  function setzeStart(an) {
    startIc.replaceChildren(ic(an ? 'stop' : 'play'));
    startK.setAttribute('aria-label', an ? 'Übung anhalten' : 'Übung starten');
    startK.classList.toggle('puls', an);
    startText.textContent = an ? 'Stopp' : ergebnisse.length ? 'Nochmal' : 'Start';
  }
  async function start() {
    sitzung();                         // synchron im Tipp (iOS)
    const nr = ++laufNr, weg = () => !laeuft || nr !== laufNr; // ein zweiter Start (oder Stopp) beendet einen noch wartenden Ablauf
    laeuft = true; ergebnisse = []; chips.replaceChildren(); ergBox.hidden = true; ergBox.replaceChildren();
    setzeStart(true); phase('Vorbereiten …');
    try { // quer/kleine Höhe: Tonbahn und Stopp-Knopf ins Bild holen (nicht unter Kopf oder untere Leiste)
      const r = rolle.getBoundingClientRect(), s = startK.getBoundingClientRect(), kopf = document.querySelector('.kopf'), lst = document.querySelector('.leiste');
      const oben = (kopf ? kopf.getBoundingClientRect().bottom : 0) + 8, unten = (lst && lst.getBoundingClientRect().height ? lst.getBoundingClientRect().top : innerHeight) - 8;
      let d = 0;
      if (Math.max(r.bottom, s.bottom) > unten) d = Math.max(r.bottom, s.bottom) - unten;
      if (Math.min(r.top, s.top) - d < oben) d = Math.min(r.top, s.top) - oben;
      if (Math.abs(d) > 4) scrollBy({ top: d, behavior: 'smooth' });
    } catch (e) { /* egal */ }
    if (plan.art !== 'bewegung') {
      micOk = await mikrofon();
      if (nr !== laufNr) return;
      micPunkt.classList.toggle('an', micOk); micPunkt.classList.toggle('aus', !micOk);
      if (!micOk) hinweis.textContent = `${SZ.fehler || 'Ohne Mikrofon.'} Die Übung läuft trotzdem im Takt – nur ohne Rückmeldung.`;
      else if (!speicher.hole('kopfhoererGesagt', false)) { hinweis.textContent = 'Tipp: Mit Kopfhörern misst die App genauer – dann kommt die Begleitung nicht ins Mikrofon. Kabel-Kopfhörer sind am pünktlichsten; Bluetooth-Kopfhörer hängen etwas nach, dann wirkt dein Einsatz ein wenig später.'; speicher.merke('kopfhoererGesagt', true); }
    }
    if (SZ.ctx && SZ.ctx.state !== 'running') { try { await Promise.race([SZ.ctx.resume(), new Promise((r) => setTimeout(r, 1500))]); } catch (e) { /* egal */ } }
    if (weg()) return;
    if (SZ.ctx && SZ.ctx.state !== 'running') { // iOS hat den Ton noch gesperrt: ehrlich sagen statt stumm weiterlaufen
      stopp(); hinweis.textContent = 'Der Ton ist auf diesem Gerät noch gesperrt – tippe bitte noch einmal auf Start. (Stummschalter und Lautstärke prüfen.)'; return;
    }
    if (plan.vokale && micOk) {
      try { const vf = await import('./vokalfilter.js'); SZ.vf = vf; FORM = vf.VOKAL_FORMANTEN; } catch (e) { FORM = null; }
    }
    if (weg()) return;
    SZ.formanten = !!(plan.vokale && FORM);
    if (singt && (vorsingen === 'aufnahme' || begleitung === 'original') && plan.aufnahme) {
      phase('Aufnahme wird geladen …');
      try {
        if (vorsingen === 'aufnahme') await holePuffer(plan.aufnahme.liedId, 'stimme');
        if (begleitung === 'original') await holePuffer(plan.aufnahme.liedId, 'inst');
      } catch (e) {
        meld('Aufnahme nicht verfügbar – ich nehme die Vokalstimme.');
        if (vorsingen === 'aufnahme') vorsingen = 'stimme';
        if (begleitung === 'original') begleitung = 'akkord';
      }
    }
    if (weg()) return;
    for (let k = 0; k < plan.durchgaenge.length; k++) {
      if (weg()) return;
      const e = await durchgang(k);
      if (weg()) return;
      ergebnisse.push(e);
      chip(k, e);
      try { opt.onDurchgang && opt.onDurchgang(k + 1, plan.durchgaenge.length, e); } catch (err) { console.warn(err); }
      if (k < plan.durchgaenge.length - 1) { phase(e && e.gesamt != null && e.gueltig ? `${e.gesamt} % – weiter` : 'Weiter …'); await new Promise((r) => { timer = setTimeout(r, 1300); }); }
    }
    laeuft = false; setzeStart(false); SZ.hoerer = null;
    const g = plan.art === 'bewegung' ? { bewegung: true, gesamt: null, gueltig: false } : micOk ? gesamt(ergebnisse.filter(Boolean)) : null;
    phase(g && g.gueltig ? `Fertig · ${g.gesamt} %` : 'Fertig');
    zeigeErgebnis(g);
    try { opt.onFertig && opt.onFertig(g, plan); } catch (err) { console.warn(err); }
  }
  function zeigeErgebnis(g) {
    ergBox.replaceChildren(ergebnisKarte(g, { titel: plan.titel, onNochmal: () => { ergBox.hidden = true; start(); }, onWeiter: opt.onWeiter || null, weiterText: opt.weiterText || 'Weiter' }));
    ergBox.hidden = false;
    setTimeout(() => { try { ergBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) { /* egal */ } }, 120);
  }
  function chip(k, e) {
    const D = plan.durchgaenge[k];
    const w = e && e.gueltig ? e.gesamt : null;
    chips.append(h('span', { class: `tr-chip ${w == null ? '' : FARBE_WERT(w / 100)}` }, h('small', null, `${k + 1} · ${D.name.length > 18 ? D.name.slice(0, 17) + '…' : D.name}`), h('b', null, plan.art === 'bewegung' ? 'erledigt' : w == null ? (micOk ? 'kaum gehört' : 'ohne Mikro') : `${w} %`)));
  }
  function phase(t) { if (t !== letztePhase) { phasePill.textContent = t; letztePhase = t; } }

  function durchgang(k) {
    return new Promise((fertig) => {
      const ctx = SZ.ctx, D = plan.durchgaenge[k];
      const sb = 60 / bpm;
      const vorB = singt && vorsingen !== 'aus' ? D.laenge : 0;
      const T0 = ctx.currentTime + 0.35, tZ = T0 + vorB * sb, tS = tZ + 4 * sb, tE = tS + D.laenge * sb;
      const pl = neuerPlan(ctx);
      const kl = pl.instrument(klavier(ctx, { ziel: pl.bus, lautstaerke: 0.62 }));
      const begl = pl.instrument(klavier(ctx, { ziel: pl.bus, lautstaerke: 0.3 }));
      const vs = singt && vorsingen === 'stimme' ? pl.instrument(vokalStimme(ctx, { ziel: pl.bus, lautstaerke: 0.8 })) : null;
      // Klick auf jedem Schlag (Einzähler immer), Takt-Eins betont
      const gesamtB = vorB + 4 + D.laenge;
      for (let b = 0; b < gesamtB; b++) {
        const imZaehl = b >= vorB && b < vorB + 4;
        if (ein.klick || imZaehl) pl.klick(T0 + b * sb, b % 4 === 0, imZaehl ? 1 : 0.75);
      }
      // Vorsingen
      if (vorB) {
        if (vorsingen === 'aufnahme') holePuffer(plan.aufnahme.liedId, 'stimme').then((buf) => pl.puffer(buf, T0, D.liedAb || 0, vorB * sb, 1)).catch(() => {});
        else for (const n of D.noten) {
          const t = T0 + n.b * sb, d = Math.max(0.08, n.d * sb);
          if (n.bis != null && isFinite(n.bis)) pl.merke(gleitTon(ctx, pl.bus, n.midi, n.bis, t, d));
          else if (vs) vs.singe(vokalFuer(n), n.midi, t, d * 0.97, n.gleit || '');
          else kl.spiele(n.midi, t, d * 0.97, 0.75);
        }
      }
      // Begleitung
      const bereiche = vorB ? [T0, tS] : [tS];
      if (singt && begleitung === 'akkord') for (const t0 of bereiche) for (const a of D.akkorde || []) pl.akkord(begl, [a.bass, ...a.toene], t0 + a.b * sb, a.d * sb * 0.98, t0 === tS ? 0.42 : 0.5);
      else if (singt && begleitung === 'bordun' && D.bordun && D.bordun.length) pl.bordun(D.bordun, T0, tE, 0.6);
      else if (singt && begleitung === 'original') holePuffer(plan.aufnahme.liedId, 'inst').then((buf) => { if (vorB) pl.puffer(buf, T0, D.liedAb || 0, vorB * sb, 0.6); pl.puffer(buf, tZ, (D.liedAb || 0) - 4 * sb, (4 + D.laenge) * sb, 0.6); }).catch(() => {});
      if (singt && !vorB && D.noten[0]) kl.spiele(D.noten[0].midi, tZ, 4 * sb * 0.9, 0.35); // Startton im Einzähler
      // Aufnahme der Mikrofon-Rahmen
      const frames = [];
      aktiv = { D, k, sb, T0, tZ, tS, tE, vorB, frames, pl, e: null, fertig };
      SZ.hoerer = micOk ? (r) => { if (r.t >= T0 - 0.05 && r.t <= tE + 0.4) frames.push(r); zeigeLive(r); } : null;
      durchText.textContent = `Durchgang ${k + 1}/${plan.durchgaenge.length} · ${D.name.length > 26 ? D.name.slice(0, 25) + '…' : D.name}`;
      cancelAnimationFrame(raf); raf = requestAnimationFrame(bild);
      timer = setTimeout(() => {
        const A = aktiv; if (!A || A.fertig !== fertig) return;
        let e = null;
        try { e = micOk ? auswerten(A) : null; } catch (err) { console.warn(err); e = null; }
        if (plan.art === 'bewegung') e = { bewegung: true, gueltig: false, gesamt: null };
        A.e = e; SZ.hoerer = null;
        if (A.leck > -42) hinweis.textContent = 'Beim Vorsingen war es im Mikrofon laut (Begleitung aus dem Lautsprecher oder Mitsingen). Mit Kopfhörern und still zuhören misst die App verlässlicher.';
        try { window.__gtLetzte = { e, frames: frames.length, stimme: frames.filter((f) => f.m != null).map((f) => Math.round(f.m * 10) / 10).slice(-40) }; } catch (err) { /* egal */ }
        setTimeout(() => pl.stopp(), 600);
        male(); fertig(e);
      }, (tE - ctx.currentTime + 0.45) * 1000);
    });
  }
  function auswerten(A) {
    if (!A.frames.length) return null;
    const rel = A.frames.filter((f) => f.t >= A.tZ - 0.1).map((f) => ({ ...f, t: f.t - A.tS }));
    if (plan.art === 'atem') return bewerteAtem(A.D.phasen.map((p) => ({ t: p.b * A.sb, dauer: p.d * A.sb, art: p.art })), rel);
    let schwelle = -56;
    // Übersprechen der App ins Mikrofon (ohne Kopfhörer): Pegel, solange nur die App klingt (Vorsingen, sonst Einzähler mit Startton)
    const v = A.frames.filter((f) => (A.vorB ? f.t > A.T0 + 0.3 && f.t < A.tZ - 0.05 : f.t > A.tZ + 0.15 && f.t < A.tS - 0.05)).map((f) => f.p).sort((a, b) => a - b);
    if (v.length > 10) {
      const L = v[v.length >> 1]; A.leck = L;
      // leise Umgebung: knapp darüber; laute Begleitung im Mikrofon: die Stimme muss klar darüber liegen, sonst zählt die App sich selbst
      schwelle = Math.max(-58, Math.min(-40, L + 4), Math.min(-30, L - 4));
    }
    const ziel = A.D.noten.map((n) => ({ t: n.b * A.sb, dauer: n.d * A.sb, midi: n.midi, bis: n.bis, vokal: n.vokal, gleit: n.gleit, silbe: n.silbe, einsatz: n.einsatz }));
    return bewerte(ziel, rel, { schwelle, vokale: !!(plan.vokale && FORM), formanten: FORM, name: (m) => nName(m, ton), sprechen: plan.art === 'sprechen' });
  }
  function stopp(vonHand = false) {
    laeuft = false; clearTimeout(timer); SZ.hoerer = null;
    if (aktiv) { try { aktiv.pl.stopp(); } catch (e) { /* egal */ } const f = aktiv.fertig; aktiv.fertig = null; aktiv = null; if (f) f(null); }
    cancelAnimationFrame(raf); setzeStart(false); phase(vonHand ? 'Angehalten' : 'Bereit'); zahl.className = 'tr-zahl'; zahl.textContent = '';
    male();
  }

  // ---- Live-Anzeige
  let letzterTon = null;
  function zeigeLive(r) {
    pegelI.style.transform = `scaleX(${klemme((r.p + 70) / 55)})`;
    if (r.m != null) letzterTon = { m: r.m, zeit: performance.now() };
    if (letzterTon && performance.now() - letzterTon.zeit < 250) {
      const m = Math.round(letzterTon.m), c = Math.round((letzterTon.m - m) * 100);
      live.textContent = `du: ${nName(m, ton)} ${c >= 0 ? '+' : '−'}${Math.abs(c)}`;
      live.classList.add('an');
    } else live.classList.remove('an');
  }

  // ---- Zeichnen (rAF): Ton = Bild, beides an der Audio-Uhr
  function stand() {
    const A = aktiv; if (!A || !SZ.ctx) return { phase: 'ruhe', pos: -1 };
    const t = SZ.ctx.currentTime - ausgabeLatenz();
    if (A.e !== null || t >= A.tE) return { phase: 'ende', pos: -1 };
    if (t < A.T0) return { phase: 'start', pos: -1 };
    if (t < A.tZ) return { phase: 'hoeren', pos: (t - A.T0) / A.sb };
    if (t < A.tS) return { phase: 'zaehlen', pos: -1, zahl: Math.floor((t - A.tZ) / A.sb) + 1 };
    return { phase: 'singen', pos: (t - A.tS) / A.sb };
  }
  function bild() {
    raf = requestAnimationFrame(bild);
    const s = stand();
    if (s.phase === 'ende' || s.phase === 'ruhe') { cancelAnimationFrame(raf); male(); return; }
    const A = aktiv;
    if (s.phase === 'hoeren') phase(vorsingen === 'aufnahme' ? 'Hör dir zu' : 'Hör zu');
    else if (s.phase === 'zaehlen') phase('Gleich du …');
    else if (s.phase === 'singen') phase(plan.art === 'atem' || plan.art === 'bewegung' ? 'Los' : 'Jetzt du!');
    // Einzähler-Zahl
    if (s.phase === 'zaehlen' && s.zahl !== letzteZahl) {
      letzteZahl = s.zahl; zahl.textContent = String(s.zahl);
      zahl.className = 'tr-zahl'; void zahl.offsetWidth; zahl.className = 'tr-zahl zeigen';
    } else if (s.phase !== 'zaehlen' && letzteZahl) { letzteZahl = 0; zahl.className = 'tr-zahl'; zahl.textContent = ''; }
    // „Jetzt“-Streifen
    if (singt) {
      const pos = s.phase === 'zaehlen' ? 0 : s.pos;
      const n = A.D.noten.find((x) => pos >= x.b - 0.05 && pos < x.b + x.d) || (s.phase === 'zaehlen' ? A.D.noten[0] : null);
      if (n !== jetztK.__n) {
        jetztK.__n = n;
        if (n) {
          const v = vNorm(n.vokal);
          jetztK.replaceChildren(h('span', { class: `kugel ${VKL[v] || 'v-a'} ${String(n.silbe).length > 3 ? 'lang' : ''}` }, SILBE_ANZ(n.silbe)));
          jetztT.replaceChildren(h('b', null, `${s.phase === 'zaehlen' ? 'Erster Ton: ' : ''}${nName(n.bis != null ? n.midi : n.midi, ton)}${n.bis != null ? ` → ${nName(n.bis, ton)}` : ''}`),
            h('span', { class: 'leise klein' }, n.hinweis || (s.phase === 'hoeren' ? 'zuhören, innerlich mitsingen' : s.phase === 'zaehlen' ? 'einatmen …' : '')));
        }
      }
    } else {
      const ph = s.phase === 'singen' ? (A.D.phasen || []).find((p) => s.pos >= p.b && s.pos < p.b + p.d) : null;
      const key = ph ? ph.text : s.phase;
      if (jetztT.__k !== key) {
        jetztT.__k = key;
        jetztT.replaceChildren(h('b', null, ph ? ph.text : s.phase === 'zaehlen' ? 'Gleich geht es los' : '…'), h('span', { class: 'leise klein' }, ph ? `${ph.d} Schläge` : 'zähl innerlich mit'));
        atemKreis.className = `tr-atemkreis ${ph ? ph.art : ''}`;
        if (ph) atemKreis.style.setProperty('--dauer', `${ph.d * A.sb}s`);
      }
    }
    male(s);
  }
  function male(s0) {
    const s = s0 || stand();
    const dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth || 320, hh = cv.clientHeight || 190;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(hh * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(hh * dpr); }
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, hh);
    const A = aktiv, D = A ? A.D : plan.durchgaenge[0];
    if (!D) return;
    const dunkel = matchMedia('(prefers-color-scheme: dark)').matches;
    const L = D.laenge, links = singt ? 40 : 10, rechts = 10, oben = 16, unten = 12;
    const x = (b) => links + (b / L) * (w - links - rechts);
    // Schlag- und Taktlinien
    for (let b = 0; b <= L; b++) {
      g.fillStyle = b % 4 === 0 ? (dunkel ? 'rgba(255,255,255,.16)' : 'rgba(80,40,30,.18)') : (dunkel ? 'rgba(255,255,255,.06)' : 'rgba(80,40,30,.07)');
      g.fillRect(Math.round(x(b)), oben - 6, 1, hh - oben - unten + 8);
      if (b % 4 === 0 && b < L) { g.fillStyle = dunkel ? 'rgba(255,255,255,.45)' : 'rgba(80,40,30,.45)'; g.font = '600 10px system-ui, sans-serif'; g.textAlign = 'left'; g.fillText(String(b / 4 + 1), x(b) + 3, 10); }
    }
    if (!singt) { maleAblauf(g, D, x, w, hh, s, dunkel); return; }
    const ms = D.noten.flatMap((n) => [n.midi, n.bis]).filter(isFinite);
    if (!ms.length) return;
    let lo = Math.min(...ms) - 2, hi = Math.max(...ms) + 2;
    if (hi - lo < 9) { const mm = (hi + lo) / 2; lo = mm - 4.5; hi = mm + 4.5; }
    const y = (m) => oben + ((hi - m) / (hi - lo)) * (hh - oben - unten);
    // Tonlinien + Namen der Zieltöne
    g.font = '600 10px system-ui, sans-serif'; g.textAlign = 'right';
    const namen = new Set(ms.map(Math.round));
    for (let m = Math.ceil(lo); m <= hi; m++) {
      g.fillStyle = dunkel ? 'rgba(255,255,255,.04)' : 'rgba(80,40,30,.045)';
      if ([1, 3, 6, 8, 10].includes(((m % 12) + 12) % 12)) g.fillRect(links, y(m) - (hh - oben - unten) / (hi - lo) / 2, w - links - rechts, (hh - oben - unten) / (hi - lo));
      if (namen.has(m)) { g.fillStyle = dunkel ? 'rgba(255,255,255,.55)' : 'rgba(60,30,30,.6)'; g.fillText(nName(m, ton), links - 5, y(m) + 3.5); }
    }
    // Ziel-Töne
    const pos = s.phase === 'hoeren' || s.phase === 'singen' ? s.pos : -1;
    const erg = A && A.e && A.e.je ? A.e.je : null;
    D.noten.forEach((n, i) => {
      const f = VFARBE[vNorm(n.vokal)] || '#ff7f4e';
      const an = pos >= n.b && pos < n.b + n.d;
      g.globalAlpha = an ? 1 : 0.62;
      g.strokeStyle = f; g.fillStyle = f; g.lineCap = 'round';
      if (n.bis != null && isFinite(n.bis)) { g.lineWidth = an ? 13 : 10; g.beginPath(); g.moveTo(x(n.b) + 5, y(n.midi)); g.lineTo(x(n.b + n.d) - 5, y(n.bis)); g.stroke(); }
      else { const hgt = an ? 14 : 11, x1 = x(n.b), bw = Math.max(6, x(n.b + n.d) - x1 - 2); g.beginPath(); if (g.roundRect) g.roundRect(x1, y(n.midi) - hgt / 2, bw, hgt, hgt / 2); else g.rect(x1, y(n.midi) - hgt / 2, bw, hgt); g.fill(); }
      g.globalAlpha = 1;
      if (erg && erg[i] && erg[i].stimme > 0.05) { // Ergebnis-Rahmen je Ton
        const q = erg[i].treff, fr = q >= 0.7 ? '#3fcf7a' : q >= 0.4 ? '#ffb347' : '#ff6b81';
        g.strokeStyle = fr; g.lineWidth = 2.5;
        if (n.bis == null) { const x1 = x(n.b) - 2, bw = Math.max(8, x(n.b + n.d) - x(n.b) + 2); g.beginPath(); if (g.roundRect) g.roundRect(x1, y(n.midi) - 9, bw, 18, 9); else g.rect(x1, y(n.midi) - 9, bw, 18); g.stroke(); }
      }
      // Silbe über dem Ton (nur wenn sie wechselt und Platz ist – „brr brr brr“ wäre nur Lärm)
      const vorS = i ? D.noten[i - 1].silbe : null;
      if ((n.silbe !== vorS || an) && (x(n.b + n.d) - x(n.b) > 16 || D.noten.length <= 12)) {
        g.fillStyle = dunkel ? 'rgba(255,255,255,.8)' : 'rgba(43,29,36,.8)'; g.font = `${an ? 800 : 650} 11px system-ui, sans-serif`; g.textAlign = 'left';
        g.fillText(SILBE_ANZ(n.silbe).slice(0, 8), x(n.b) + 1, y(n.midi) - 10);
      }
    });
    // Live-Tonhöhe (nur Nachsingen), auf die Oktave der Zieltöne gefaltet
    if (A && A.frames.length && (s.phase === 'singen' || s.phase === 'ende' || A.e !== null)) {
      g.lineWidth = 3; g.lineJoin = 'round'; g.lineCap = 'round';
      let vor = null;
      for (const f of A.frames) {
        if (f.t < A.tS || f.m == null) { vor = null; continue; }
        const b = (f.t - A.tS) / A.sb; if (b > L) break;
        const n = D.noten.find((q) => b >= q.b && b < q.b + q.d) || D.noten.reduce((best, q) => (Math.abs(q.b - b) < Math.abs(best.b - b) ? q : best), D.noten[0]);
        const z = n.bis != null ? n.midi + (n.bis - n.midi) * klemme((b - n.b) / n.d) : n.midi;
        let d = f.m - z; d -= 12 * Math.round(d / 12);
        const m = z + d;
        const px = x(b), py = y(klemme(m, lo - 1, hi + 1));
        if (vor && b - vor.b < 0.35) {
          g.strokeStyle = Math.abs(d) <= 0.5 ? '#3fcf7a' : (dunkel ? '#ffd27a' : '#c9831a');
          g.beginPath(); g.moveTo(vor.px, vor.py); g.lineTo(px, py); g.stroke();
        }
        vor = { b, px, py };
      }
    }
    // Cursor
    if (pos >= 0) {
      const cx = x(pos);
      g.fillStyle = s.phase === 'singen' ? '#ff4f8b' : (dunkel ? 'rgba(255,255,255,.7)' : 'rgba(43,29,36,.6)');
      g.fillRect(cx - 1.25, oben - 8, 2.5, hh - oben - unten + 12);
      g.beginPath(); g.moveTo(cx - 6, oben - 10); g.lineTo(cx + 6, oben - 10); g.lineTo(cx, oben - 3); g.closePath(); g.fill();
    }
  }
  const PHASE_FARBE = { ein: '#8cc8ff', halten: '#b56cff', aus: '#ffb057', bewegen: '#6fe3a8' };
  function maleAblauf(g, D, x, w, hh, s, dunkel) {
    const pos = s.phase === 'singen' ? s.pos : -1;
    for (const p of D.phasen || []) {
      const an = pos >= p.b && pos < p.b + p.d;
      g.globalAlpha = an ? 1 : 0.72; g.fillStyle = PHASE_FARBE[p.art] || '#ffb057';
      const x1 = x(p.b) + 1, bw = Math.max(6, x(p.b + p.d) - x(p.b) - 2);
      g.beginPath(); if (g.roundRect) g.roundRect(x1, 26, bw, hh - 52, 14); else g.rect(x1, 26, bw, hh - 52); g.fill();
      g.globalAlpha = 1; g.fillStyle = '#2b1d24'; g.font = `${an ? 800 : 700} 12px system-ui, sans-serif`; g.textAlign = 'center';
      const kurz = p.art === 'ein' ? 'ein' : p.art === 'halten' ? 'halten' : p.art === 'aus' ? 'sss …' : '';
      if (kurz && bw > 30) g.fillText(kurz, x1 + bw / 2, hh / 2 + 4);
    }
    // gemessenes Zischen (Pegel) als Linie
    const A = aktiv;
    if (A && A.frames.length) {
      g.strokeStyle = dunkel ? '#fff' : '#2b1d24'; g.lineWidth = 2; g.globalAlpha = 0.8; g.beginPath(); let offen = false;
      for (const f of A.frames) {
        if (f.t < A.tS) continue; const b = (f.t - A.tS) / A.sb; if (b > D.laenge) break;
        const yy = hh - 30 - klemme((f.p + 70) / 50) * (hh - 60);
        offen ? g.lineTo(x(b), yy) : g.moveTo(x(b), yy); offen = true;
      }
      g.stroke(); g.globalAlpha = 1;
    }
    if (pos >= 0) { g.fillStyle = '#ff4f8b'; g.fillRect(x(pos) - 1.25, 8, 2.5, hh - 16); }
  }

  const beiGroesse = () => male();
  window.addEventListener('resize', beiGroesse);
  const sichtbar = () => { if (document.hidden && laeuft) stopp(true); };
  document.addEventListener('visibilitychange', sichtbar);
  requestAnimationFrame(() => male());
  return {
    el: box,
    stopp() { stopp(); window.removeEventListener('resize', beiGroesse); document.removeEventListener('visibilitychange', sichtbar); },
    get laeuft() { return laeuft; },
  };
}
