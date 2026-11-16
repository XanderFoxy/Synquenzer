// Mischpult 0.1 – kern.js: Fassade im Hauptfaden. Übersetzt die Schnittstelle der Oberfläche (Kopf von kern-mock.js aus dem
// UI-Schritt, siehe SCHNITTSTELLE.md 3) auf den Rechen-Worker render-worker.js (Projekt aus ablauf.js). Eigene Umsetzung.
// Gerechnet wird nur im Worker, stückweise aus den Dateien; hier liegen nur kleine Werte, Blobs und Blob-Adressen.
// Abhören (0.1, Rückfall laut KONZEPT C.6): Vorher-Summe und fertig gerechneter Master als WAV-Blobs über <audio>
// (streamt aus dem Blob, kein ganzer Song im Speicher), Messung über Web Audio. Solo = die Spur unbearbeitet.
// Nichts verlässt das Gerät: kein Netz, nur Blobs und Blob-Adressen auf diesem Gerät.
import { zipAusBlobs, mitCrc } from './zip.js';

export const NAME = 'kern';
const ZIEL = { streaming: { lufs: -14, tp: -1 }, laut: { lufs: -9, tp: -2 } };
const TEIL = { anhoeren: 0, platz: 1, master: 2 };
const db = (x) => 20 * Math.log10(Math.max(1e-9, x)), lin = (d) => Math.pow(10, d / 20);
const abbruch = () => new DOMException('Abbruch', 'AbortError');
const klon = (x) => JSON.parse(JSON.stringify(x));
const CRC = new WeakMap();   // Blob → {crc, size} (vom WAV-Schreiber mitgeliefert, damit die ZIP nicht neu rechnen muss)

// ---------- Worker ----------
let W = null, nr = 0, aktiv = null, reihe = Promise.resolve();
const offen = new Map();
function worker() {
  if (W) return W;
  W = new Worker(new URL('./render-worker.js', import.meta.url), { type: 'module' });
  W.onmessage = (e) => {
    const m = e.data || {}, o = offen.get(m.id); if (!o) return;
    if (m.ok === undefined) { o.fort?.(m.teil, m.anteil); return; }
    offen.delete(m.id);
    if (m.ok) o.ok(m.ergebnis);
    else o.f(m.code === 'abgebrochen' ? abbruch() : Object.assign(new Error(m.fehler || 'Fehler beim Rechnen'), { code: m.code }));
  };
  W.onerror = (e) => { const f = new Error('Der Rechenteil ist ausgefallen' + (e.message ? ': ' + e.message : '') + '. Bitte die Seite neu laden.'); for (const o of offen.values()) o.f(f); offen.clear(); W = null; aktiv = null; };
  return W;
}
function rufe(auftrag, daten = {}, { fort, signal } = {}) {
  return new Promise((ok, f) => {
    if (signal?.aborted) return f(abbruch());
    const id = ++nr; offen.set(id, { ok, f, fort });
    signal?.addEventListener('abort', () => { if (offen.has(id)) W?.postMessage({ abbrechen: id }); }, { once: true });
    worker().postMessage({ id, auftrag, ...daten });
  });
}
// Aufträge, die das offene Projekt im Worker brauchen, laufen nacheinander (Rollen/Eingriff sind Zustand im Worker).
const inReihe = (fn) => { const p = reihe.then(fn, fn); reihe = p.catch(() => {}); return p; };
async function sicher(s, signal) {   // das Projekt dieser Sitzung im Worker offen haben (Album: mehrere Songs nacheinander)
  if (aktiv === s) return;
  aktiv = null; await rufe('oeffnen', { files: s._files }, { signal }); aktiv = s;
  if (s._gemischt) await rufe('mischen', s._gemischt, { signal });
}
const rollenListe = (s, a) => s.spuren.map((sp) => ({ rolle: a.rollen[sp.id] || sp.rolle, hauptsache: a.haupt.includes(sp.id), solassen: a.lassen.includes(sp.id), aus: a.aus.includes(sp.id) }));
const albumVon = (a) => (a.album && (a.album.kurve10 || a.album.versatzLu) ? { kurve10: a.album.kurve10 || null, versatzLu: a.album.versatzLu || 0 } : null);
const schluessel = (s, a) => a.eingriff + '|' + a.ziel + '|' + JSON.stringify(rollenListe(s, a)) + (albumVon(a) ? '|' + JSON.stringify(albumVon(a)) : '');

// ---------- Hinweise ----------
const ART = { kuerzer: 'laenge', normalize: 'normalize', 'spur-uebersteuert': 'clip', 'fast-still': 'still', 'vorher-ueber-0': 'vorher' };
function hinweiseAus(s, liste) { const id = (n) => s.spuren.find((sp) => sp.datei === n)?.id; return (liste || []).map((h) => ({ art: ART[h.code] || h.code, ...(h.spur ? { spur: id(h.spur) ?? h.spur } : {}), satz: h.satz })); }

// ---------- Schritt 1 ----------
export async function oeffne(files, { fortschritt } = {}) {
  files = [...files]; fortschritt?.(0.05);
  return inReihe(async () => {
    const namen = new Set(), id = (n) => { let x = n; for (let j = 2; namen.has(x); j++) x = n + ' (' + j + ')'; namen.add(x); return x; };
    let r;
    try { aktiv = null; r = await rufe('oeffnen', { files }); }
    catch (f) {
      if (f.code === 'raten-verschieden') {
        const spuren = files.map((d) => ({ id: id(d.name), datei: d.name, groesse: d.size, rolle: 'sonstiges', sicher: false, laenge_s: 0, kanaele: 2, format: 'WAV', still: false }));
        return { song: 'Mein Song', sr: 48000, laenge_s: 0, bpm: null, spuren, hinweise: [{ art: 'rate', stop: true, satz: 'Die Spuren haben verschiedene Abtastraten. Bitte alle aus demselben Projekt exportieren.' }], _files: files };
      }
      if (/keine-spuren/.test(f.message)) throw new Error('Diese Dateien kann das Mischpult nicht lesen. Bitte die Spuren als WAV exportieren (Anleitung).');
      throw f;
    }
    const dateiVon = new Map(files.map((d) => [d.name, d]));
    const genutzt = r.spuren.map((sp) => dateiVon.get(sp.name));
    const s = { song: r.song === 'Song' ? 'Mein Song' : r.song, sr: r.sr, laenge_s: r.laengeS, bpm: null, hinweise: [], _files: genutzt, _gemischt: null };
    s.spuren = r.spuren.map((sp, k) => ({ id: id(sp.name), datei: sp.name, groesse: genutzt[k]?.size || 0, rolle: sp.vorschlag?.rolle || 'sonstiges', sicher: sp.vorschlag?.quelle === 'name' && !!sp.vorschlag?.sicher,
      laenge_s: sp.laengeS, kanaele: sp.kanaele, format: 'WAV', still: false, welle: sp.welle, sr: sp.sr, _k: k }));
    s.hinweise = [...(r.fehler || []).map((f) => ({ art: 'format', satz: `„${f.name}“ ist keine WAV- oder AIFF-Datei und bleibt draußen. Bitte als WAV exportieren.` })), ...hinweiseAus(s, r.hinweise)];
    aktiv = s; fortschritt?.(1);
    return s;
  });
}

// ---------- Schritt 3 ----------
export async function mische(s, a, { fortschritt, signal } = {}) {
  return inReihe(async () => {
    await sicher(s, signal);
    const args = { rollen: rollenListe(s, a), eingriff: a.eingriff, ziel: a.ziel };
    const z = await rufe('mischen', args, { signal, fort: (t, x) => fortschritt?.(TEIL[t] ?? 2, t === 'master' ? 0.3 * x : x) });
    s._gemischt = args; s.bpm = z.bpm;
    const tx = await rufe('texte', { rollen: args.rollen }, { signal });
    const st = new Set((z.hinweise || []).filter((h) => h.code === 'fast-still').map((h) => h.spur));
    for (const sp of s.spuren) sp.still = st.has(sp.datei);
    s.hinweise = [...s.hinweise.filter((h) => h.art === 'format'), ...hinweiseAus(s, z.hinweise)];
    const v = await rufe('vorher', {}, { signal, fort: (t, x) => fortschritt?.(2, 0.3 + 0.15 * x) });
    const erg = ergebnis(s, z, v, tx);
    await erg._bereite(a, { signal, fort: (x) => fortschritt?.(2, 0.45 + 0.55 * x), schonInReihe: true });
    return erg;
  });
}
function ergebnis(s, z, v, tx) {
  const U = z.uebersicht || new Float32Array(1), laenge = s.laenge_s, bpm = z.bpm || 120;
  // Übersicht (Spitzen der Vorher-Summe) → 400 Punkte, Wurzel-skaliert wie die Rollen-Seite
  const n = 400, w = new Float32Array(n); let mx = 1e-9;
  for (let k = 0; k < n; k++) { let p = 0; for (let i = Math.floor(k * U.length / n), e = Math.max(i + 1, Math.floor((k + 1) * U.length / n)); i < e && i < U.length; i++) p = Math.max(p, U[i]); w[k] = p; mx = Math.max(mx, p); }
  for (let k = 0; k < n; k++) w[k] = Math.sqrt(w[k] / mx);
  // lauteste Stelle: 8 Takte mit der meisten Energie
  const dt = laenge / U.length, fen = Math.max(1, Math.min(U.length, Math.round(8 * 4 * 60 / bpm / dt))); let best = 0, bestE = -1, e = 0;
  for (let i = 0; i < U.length; i++) { e += U[i] * U[i]; if (i >= fen) e -= U[i - fen] * U[i - fen]; if (i >= fen - 1 && e > bestE) { bestE = e; best = i - fen + 1; } }
  const zus = new Map([[z.eingriff + '|' + z.ziel + '|' + JSON.stringify(s._gemischt.rollen), z]]), renders = new Map(), jobs = new Map(), texte = new Map();
  const texteMerken = (rollen, t) => { for (const [e, l] of Object.entries(t)) texte.set(e + '|' + JSON.stringify(rollen), l); };
  texteMerken(s._gemischt.rollen, tx);
  let vorherUrl = URL.createObjectURL(v.blob); CRC.set(v.blob, { crc: v.crc, size: v.size });
  let letzteZus = z, letzterRender = null;
  const merke = (k, r) => {
    CRC.set(r.master.blob, { crc: r.master.crc, size: r.master.size }); CRC.set(r.instr.blob, { crc: r.instr.crc, size: r.instr.size });
    renders.set(k, { r, url: URL.createObjectURL(r.master.blob), lufs: r.messung.nachher.lufs }); letzterRender = renders.get(k);
    // Speicher (Prüfer-Befund 0.1): nur die neueste Fassung bleibt im Speicher; ältere werden freigegeben (Rückgängig rechnet neu).
    for (const [k0, x] of [...renders]) if (x !== letzterRender) { URL.revokeObjectURL(x.url); renders.delete(k0); }
  };
  const erg = {
    vorher: { lufs: z.vorher.lufs, tp: z.vorher.tp }, welle: w, lauteste_s: best * dt, bpm,
    merkmale: { ltas10: z.vorher.ltasOkt || null, I: z.vorher.lufs, tp: z.vorher.tp, lra: z.vorher.lra },
    nachher: (x) => { const k = schluessel(s, x), r = renders.get(k); if (r) return { lufs: r.r.messung.nachher.lufs, tp: r.r.messung.nachher.tp };
      const q = zus.get(k); return q?.schaetzung?.lufs != null ? { lufs: q.schaetzung.lufs, tp: q.schaetzung.tp } : { lufs: ZIEL[x.ziel].lufs, tp: ZIEL[x.ziel].tp }; },
    was: (x) => { const t = texte.get(x.eingriff + '|' + JSON.stringify(rollenListe(s, x))) || (zus.get(schluessel(s, x)) || letzteZus).spuren.map((q) => q.texte);
      return Object.fromEntries(s.spuren.map((sp, i) => [sp.id, (t[i] || []).join(' · ') || 'unverändert'])); },
    _texte(x) { const r = rollenListe(s, x), k = x.eingriff + '|' + JSON.stringify(r); if (texte.has(k) || aktiv !== s) return null; return rufe('texte', { rollen: r }).then((t) => { texteMerken(r, t); return true; }, () => null); },
    genau: (x) => renders.has(schluessel(s, x)),
    abhoerer: (x) => abhoerer(s, erg, x),
    get _vorherUrl() { return vorherUrl; }, _vorherGainDb: v.gainDb || 0, frei: false,
    /** Song verlassen: alle großen Dateien (Vorher, Fassungen) und ihre Adressen freigeben. Kleine Werte bleiben. */
    freigeben() { erg.frei = true; if (vorherUrl) URL.revokeObjectURL(vorherUrl); vorherUrl = null; for (const x of renders.values()) URL.revokeObjectURL(x.url); renders.clear(); letzterRender = null; erg._neu = null; },
    /** nach freigeben(): Vorher-Summe neu rechnen (ein schneller Durchlauf), Fassungen entstehen beim Anhören neu. */
    async wieder({ signal, fortschritt } = {}) {
      if (!erg.frei) return;
      const v2 = await inReihe(async () => { await sicher(s, signal); return rufe('vorher', {}, { signal, fort: (t, x) => fortschritt?.(x) }); });
      CRC.set(v2.blob, { crc: v2.crc, size: v2.size }); vorherUrl = URL.createObjectURL(v2.blob); erg.frei = false;
    },
    _render: (x) => renders.get(schluessel(s, x)) || null, _letzter: () => letzterRender,
    /** Master + Instrumental für diese Auswahl rechnen (einmal je Auswahl; gleichzeitige Anfragen teilen sich die Rechnung). */
    _bereite(x, { signal, fort, schonInReihe, nurWenn } = {}) {
      x = klon(x); const k = schluessel(s, x);
      if (renders.has(k)) return Promise.resolve(renders.get(k).r);
      if (jobs.has(k)) return jobs.get(k);
      const lauf = async () => {
        if (nurWenn && !nurWenn()) throw Object.assign(new Error('veraltet'), { veraltet: true });
        await sicher(s, signal);
        const q = await rufe('einstellen', { eingriff: x.eingriff, ziel: x.ziel, rollen: rollenListe(s, x), album: albumVon(x) }, { signal, fort: (t, y) => fort?.(0.25 * y) });
        zus.set(k, q); letzteZus = q; erg._neu?.();
        const r = await rufe('schreiben', { eingriff: x.eingriff, ziel: x.ziel, song: s.song, zaehler: 1, album: albumVon(x) }, { signal, fort: (t, y) => fort?.(0.25 + 0.75 * y) });
        merke(k, r); return r;
      };
      const p = schonInReihe ? lauf() : inReihe(lauf);
      jobs.set(k, p); p.then(() => jobs.delete(k), () => jobs.delete(k));
      return p;
    },
  };
  return erg;
}

// ---------- Schritt 4: Abhören (Rückfall C.6: zwei Blob-<audio> + Messung über Web Audio) ----------
function abhoerer(s, erg, a0) {
  let a = klon(a0), ctx = null, spielt = false, stell = 'nachher', solo = null, cb = null, uhr = 0, off = 0, hold = -99, ring = [], deinM = null, zu = false, warte = 0, stumm = new Set();
  const E = {}, url = { vorher: erg._vorherUrl, nachher: (erg._render(a) || erg._letzter())?.url, dein: null, solo: null };
  let nachherLufs = (erg._render(a) || erg._letzter())?.lufs ?? null;   // Lautheit der Fassung, die wirklich spielt (A/B gleich laut auch während des Neurechnens)
  const pos = () => { const r = E[ref()]?.el; return Math.min(s.laenge_s, r && spielt ? r.currentTime : off); };
  const ref = () => (solo ? 'solo' : stell === 'dein' && E.dein ? 'dein' : stell === 'vorher' ? 'vorher' : 'nachher');
  function kanal(k) {
    if (!url[k] || !ctx) return null;
    if (E[k]) { if (E[k].src !== url[k]) { E[k].el.src = url[k]; E[k].src = url[k]; } return E[k]; }
    const el = new Audio(); el.preload = 'auto'; el.src = url[k];
    const q = ctx.createMediaElementSource(el), g = ctx.createGain(), an = ctx.createAnalyser(); an.fftSize = 4096; g.gain.value = 0;
    q.connect(an); q.connect(g); g.connect(ctx.destination);
    return (E[k] = { el, g, an, src: url[k] });
  }
  function pegel() {   // gleich laut: die lautere Seite wird auf die leisere gesenkt, nie angehoben
    const l = { vorher: erg.vorher.lufs + erg._vorherGainDb, nachher: nachherLufs ?? erg.nachher(a).lufs, dein: deinM ? deinM.lufs : 99 }, min = Math.min(l.vorher, l.nachher, l.dein);
    const now = ctx.currentTime, hoer = ref();
    for (const k of ['vorher', 'nachher', 'dein', 'solo']) if (E[k]) E[k].g.gain.setTargetAtTime(k === hoer && !(k === 'solo' && stumm.has(solo)) ? (k === 'solo' ? 1 : lin(Math.min(0, min - l[k]))) : 0, now, 0.007);
  }
  const aktive = () => ['vorher', 'nachher', 'dein', 'solo'].filter((k) => E[k] && url[k]);
  async function starte() { const t = off; for (const k of aktive()) { const el = E[k].el; try { el.currentTime = t; } catch { /* noch nicht geladen */ } } await Promise.all(aktive().map((k) => E[k].el.play().catch(() => {}))); }
  function halt() { for (const k of aktive()) E[k].el.pause(); spielt = false; clearInterval(uhr); }
  function messe() {
    if (!spielt) return;
    const r = E[ref()]; if (!r) return;
    if (r.el.ended || r.el.currentTime >= s.laenge_s - 0.02) { halt(); off = 0; cb?.({ pos: 0 }); return; }
    for (const k of aktive()) if (k !== ref() && Math.abs(E[k].el.currentTime - r.el.currentTime) > 0.06) try { E[k].el.currentTime = r.el.currentTime; } catch { /* lädt */ }
    const buf = new Float32Array(r.an.fftSize); r.an.getFloatTimeDomainData(buf);
    let e = 0, p = 0; for (const v of buf) { e += v * v; const x = Math.abs(v); if (x > p) p = x; }
    ring.push(e / buf.length * 2); if (ring.length > 30) ring.shift();
    const sp = db(p); hold = Math.max(hold, sp);
    cb?.({ pos: pos(), lautheit: -0.691 + 10 * Math.log10(ring.reduce((x, y) => x + y, 0) / ring.length + 1e-12), spitze: sp, spitzeMax: hold });
  }
  function bau() { ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'playback' }); for (const k of ['vorher', 'nachher', 'dein', 'solo']) kanal(k); pegel(); }
  async function neuStart() { const war = spielt; if (war) { off = pos(); halt(); } for (const k of ['vorher', 'nachher', 'dein', 'solo']) kanal(k); pegel(); if (war) { await starte(); spielt = true; uhr = setInterval(messe, 100); } }
  function rechne() {   // neue Auswahl: im Hintergrund genau rechnen; bis dahin läuft die letzte Fassung weiter
    clearTimeout(warte); const k = JSON.stringify(a);
    warte = setTimeout(() => {
      erg._bereite(a, { nurWenn: () => !zu && JSON.stringify(a) === k }).then((r) => {
        if (zu || JSON.stringify(a) !== k) return; const rr = erg._render(a); url.nachher = rr?.url; nachherLufs = rr?.lufs ?? null; if (ctx) neuStart(); cb?.({ pos: pos(), genau: true });
      }, () => { /* veraltet oder abgebrochen: die neuere Auswahl rechnet */ });
    }, 400);
  }
  erg._neu = () => { if (!zu) cb?.({ pos: pos(), genau: false }); };
  return {
    get spielt() { return spielt; },
    // iOS: Audio-Kontext und play() der Elemente noch im selben Tipp starten (kein await davor), sonst bleibt das erste Play stumm.
    async play() { if (!ctx) bau(); const r = ctx.state !== 'running' ? ctx.resume() : null; if (spielt) return; if (off >= s.laenge_s - 0.05) off = 0; const st = starte(); spielt = true; ring = []; clearInterval(uhr); uhr = setInterval(messe, 100); await st; if (r) await r.catch(() => {}); },
    pause() { if (!spielt) return; off = pos(); halt(); cb?.({ pos: off }); },
    seek(t) { const war = spielt; if (war) halt(); off = Math.max(0, Math.min(s.laenge_s, t)); hold = -99; ring = []; if (war) { starte().then(() => { spielt = true; clearInterval(uhr); uhr = setInterval(messe, 100); }); spielt = true; } cb?.({ pos: off }); },
    stellung(v) { stell = v; hold = -99; ring = []; if (ctx) neuStart(); },
    solo(id) { if (url.solo) URL.revokeObjectURL(url.solo); solo = id; const sp = s.spuren.find((x) => x.id === id); url.solo = sp ? URL.createObjectURL(s._files[sp._k]) : null; if (!url.solo && E.solo) { E.solo.el.pause(); E.solo.g.gain.value = 0; } hold = -99; ring = []; if (ctx) neuStart(); },
    stumm(ids) { stumm = new Set(ids); if (ctx) pegel(); },   // 0.1: wirkt beim Solo; in der fertigen Summe erst mit dem Abhör-Strom (C.6)
    plan(x) { a = klon(x); hold = -99; erg._texte(a)?.then((neu) => { if (neu && !zu) cb?.({ pos: pos(), genau: !!erg._render(a) }); }); if (erg._render(a)) { url.nachher = erg._render(a).url; nachherLufs = erg._render(a).lufs; if (ctx) neuStart(); cb?.({ pos: pos(), genau: true }); } else { if (ctx) pegel(); rechne(); } },
    async dein(file) { deinM = await pruefe(file, {}); if (url.dein) URL.revokeObjectURL(url.dein); url.dein = URL.createObjectURL(file); if (ctx) await neuStart(); },
    melde(f) { cb = f; },
    schliesse() { zu = true; clearTimeout(warte); halt(); for (const k of aktive()) { E[k].el.removeAttribute('src'); E[k].el.load(); } for (const k of ['dein', 'solo']) if (url[k]) URL.revokeObjectURL(url[k]); ctx?.close(); ctx = null; erg._neu = null; },
  };
}

// ---------- Schritt 5 ----------
const mitAbbruch = (p, signal) => (!signal ? p : new Promise((ok, f) => {
  if (signal.aborted) return f(abbruch());
  const weg = () => f(abbruch()); signal.addEventListener('abort', weg, { once: true });
  p.then((x) => { signal.removeEventListener('abort', weg); ok(x); }, (e) => { signal.removeEventListener('abort', weg); f(e); });
}));
export async function speichere(s, erg, a, { namen, fortschritt, signal } = {}) {
  const r = await mitAbbruch(erg._bereite(a, { signal, fort: fortschritt }), signal);
  const m = r.messung.nachher; fortschritt?.(1);
  const rz = new Blob([r.rezept.text], { type: 'text/plain;charset=utf-8' });
  return {
    dateien: [{ name: namen.master, blob: r.master.blob, typ: 'audio/wav' }, { name: namen.instr, blob: r.instr.blob, typ: 'audio/wav' }, { name: namen.rezept, blob: rz, typ: 'text/plain' }],
    messung: { lufs: m.lufs, tp: m.tp, clip: m.clip, lra: m.lra, plr: m.plr, ltas10: m.ltasOkt || null, instrTp: r.messung.instrumental?.tp ?? null }, ampel: r.pruefung.map(({ farbe, satz }) => ({ farbe, satz })), rezept: { json: r.rezept.json, text: r.rezept.text },
  };
}

// ---------- Nebenwege ----------
export async function pruefe(file, { fortschritt, signal } = {}) {
  let r;
  try { r = await rufe('pruefen', { file, ziel: 'streaming' }, { signal, fort: (t, x) => fortschritt?.(x) }); }
  catch (f) { if (/kein-wav|lesefehler/.test(f.message)) throw new Error('Diese Datei kann das Mischpult nicht lesen. Bitte als WAV exportieren (in deiner DAW: Mixdown als WAV).'); throw f; }
  const m = r.messung, ampel = [...(r.saetze || []).map((satz) => ({ farbe: 'gelb', satz })), ...r.pruefung.filter((p) => !(p.mass === 'true_peak' && r.saetze?.length)).map(({ farbe, satz }) => ({ farbe, satz }))];
  fortschritt?.(1);
  return { lufs: m.lufs, tp: m.tp, lra: m.lra, plr: m.plr, clip: m.clip, laenge_s: r.laengeS, ampel };
}
export async function zip(dateien) {
  const e = await mitCrc(dateien.map((d) => ({ name: d.name, blob: d.blob, ...(CRC.get(d.blob) || {}) })));
  return zipAusBlobs(e);
}
// Album (B.2): gleicht über die Oktav-Kurve der Vorher-Summe an; beim Speichern nimmt jeder Master die Album-Kurve (planeMaster albumKurve)
// und das Lautheitsziel (ruhiger Song −3 LU). Angezeigt wird hier nur der Plan; gemessen wird erst beim Speichern (albumBericht).
export function albumAngleichen(songs, { ziel = 'streaming', bezug = null, ruhig = [] } = {}) {
  const L = songs.map((x) => x.merkmale?.ltas10 || Array(10).fill(-20)), rel = L.map((l) => { const m = l.reduce((a, b) => a + b, 0) / l.length; return l.map((v) => v - m); });
  const mitte = rel[0].map((_, b) => rel.reduce((s, x) => s + x[b], 0) / rel.length), ib = songs.findIndex((x) => x.id === bezug), kurve = mitte.map((v, b) => (ib >= 0 ? 0.5 * v + 0.5 * rel[ib][b] : v));
  const zl = ZIEL[ziel].lufs, mx = (a) => a.reduce((m, v, b) => (Math.abs(v) > Math.abs(m.v) ? { v, b } : m), { v: 0, b: 0 });
  return { kurve, songs: songs.map((x, i) => { const dev = rel[i].map((v, b) => v - kurve[b]), rest = dev.map((d) => d - Math.max(-2, Math.min(2, 0.5 * d))), vo = mx(dev), na = mx(rest);
    return { id: x.id, vorher: Math.abs(vo.v), nachher: Math.abs(na.v), band: [31, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000][vo.b], lufs: ruhig.includes(x.id) ? zl - 3 : zl }; }) };
}
/** Größte Abweichung (dB) einer gemessenen Oktav-Kurve von der Album-Kurve, beide auf ihren Mittelwert bezogen. */
export function klangAbstandAlbum(ltas10, kurve) {
  if (!ltas10 || !kurve) return null; const m = ltas10.reduce((a, b) => a + b, 0) / ltas10.length;
  let mx = 0; ltas10.forEach((v, b) => { const d = Math.abs(v - m - kurve[b]); if (b >= 1 && b <= 8 && d > mx) mx = d; }); return mx;
}
const z1 = (x) => (Math.round(x * 10) / 10).toFixed(1).replace('.', ',').replace(/^-/, '−');
/** gemessen: {songId: {lufs, tp, ltas10}} aus dem Speichern – der Bericht zeigt nur gemessene Werte. */
export function albumBericht(album, songs, ang, gemessen = {}) {
  const e = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
  return `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Album-Bericht ${e(album.name)}</title><style>body{font:16px system-ui,sans-serif;background:#101318;color:#e9edf2;margin:0 auto;max-width:720px;padding:16px}td,th{padding:6px 8px;border-bottom:1px solid #344050;text-align:left}table{border-collapse:collapse;width:100%}</style><h1>Album „${e(album.name)}“</h1><p>${new Date().toLocaleDateString('de-DE')} · Ziel ${album.ziel === 'laut' ? 'Laut' : 'Streaming (−14)'} · Eingriff ${e(album.eingriff)}</p><table><tr><th>Song</th><th>Ziel</th><th>Lautheit gemessen</th><th>Spitze gemessen</th><th>Klang-Abstand zur Album-Kurve vorher → gemessen</th></tr>${ang.songs.map((x) => { const g = gemessen[x.id], ka = g ? klangAbstandAlbum(g.ltas10, ang.kurve) : null; return `<tr><td>${e(songs.find((s) => s.id === x.id)?.name || '')}</td><td>${z1(x.lufs)} LUFS</td><td>${g ? z1(g.lufs) + ' LUFS' : 'nicht gespeichert'}</td><td>${g ? z1(g.tp) + ' dB' : '–'}</td><td>${z1(x.vorher)} → ${ka != null ? z1(ka) + ' dB' : '–'}</td></tr>`; }).join('')}</table><p>Alle Werte unter „gemessen“ stammen aus den fertigen Dateien. Ruhige Songs haben ein Ziel 3 LU unter dem Album.</p><p>Erstellt mit dem Mischpult 0.1.</p></html>`;
}
