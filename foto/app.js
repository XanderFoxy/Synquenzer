// Bildwerk – Kern/UI. AppKern-Schnittstelle FEST (ARCH.md §4.11).
// Start, Zustand, Undo/Redo, Ereignisse, Reiter/Blätter, Gesten, Vorher/Nachher, Öffnen/Speichern/Teilen, IndexedDB.
import { VERSION, ANALYSE_KANTE, DB_NAME, DB_VERSION, ART, FEHLER, BildwerkFehler, neuesDokument, neuerSchritt, neueId } from './typen.js';
import { kanal } from './rpc.js';
import { erstellePipeline } from './gl.js';
import { setzeQuellen } from './modelle.js';
import { geometrieMatrix, bildschirmZuQuelle, vorschlagAusRaendern, rahmen } from './zuschnitt.js';

/** Größte Ausgabe, die Safari auf dem iPhone noch als Leinwand kodieren kann (≈ 4096²). */
export const MAX_AUSGABE_PX = 16.7e6;
/** So lange nach einem Tipp darf das Teilen-Blatt noch öffnen (Safari: Nutzer-Geste läuft ab). */
const GESTE_MS = 2500;

export const REITER = Object.freeze([
  { id: 'auto', titel: 'Auto' }, { id: 'regler', titel: 'Regler' }, { id: 'looks', titel: 'Looks' },
  { id: 'auswahl', titel: 'Auswahl' }, { id: 'retusche', titel: 'Retusche' }, { id: 'zuschnitt', titel: 'Zuschnitt' },
]);
const S = (d) => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
export const ICON = {
  menue: S('<path d="M4 7h16M4 12h16M4 17h16"/>'), ebenen: S('<path d="M12 4l8 4-8 4-8-4z"/><path d="M4 12l8 4 8-4"/><path d="M4 16l8 4 8-4"/>'),
  vergleich: S('<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M12 3v18"/>'), rueck: S('<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>'),
  vor: S('<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>'), sichern: S('<path d="M12 4v11"/><path d="M7 10l5 5 5-5"/><path d="M5 20h14"/>'),
  auto: S('<path d="M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15.5l-1.8-4.7L5.5 9l4.7-1.3z"/><path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z"/>'),
  regler: S('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'),
  looks: S('<circle cx="9" cy="9" r="5"/><circle cx="15" cy="15" r="5"/>'), auswahl: S('<path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"/><circle cx="12" cy="12" r="3"/>'),
  retusche: S('<path d="M4 20l9-9"/><path d="M14 4l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"/>'), zuschnitt: S('<path d="M7 3v14h14"/><path d="M3 7h14v14"/>'),
  zu: S('<path d="M6 6l12 12M18 6L6 18"/>'), auge: S('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  muell: S('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
};

// ---------- IndexedDB ----------
function oeffneDB() {
  return new Promise((ok, fehl) => {
    if (typeof indexedDB === 'undefined') { fehl(new Error('kein IndexedDB')); return; }
    const r = indexedDB.open(DB_NAME, DB_VERSION);
    r.onupgradeneeded = () => { const db = r.result; for (const [n, k] of [['dokumente', 'id'], ['raster', 'rasterId'], ['referenzen', 'id']]) if (!db.objectStoreNames.contains(n)) db.createObjectStore(n, { keyPath: k }); };
    r.onsuccess = () => ok(r.result); r.onerror = () => fehl(r.error);
  });
}
function idb(db, store, modus, f) {
  return new Promise((ok, fehl) => {
    const t = db.transaction(store, modus); const req = f(t.objectStore(store));
    t.oncomplete = () => ok(req ? req.result : undefined); t.onerror = () => fehl(t.error); t.onabort = () => fehl(t.error);
  });
}

/** Datei → ImageBitmap (EXIF-Drehung angewendet). HEIC geht, wo Safari es dekodieren kann. */
export async function dekodiere(datei) {
  try { return await createImageBitmap(datei, { imageOrientation: 'from-image' }); } catch {}
  try { return await createImageBitmap(datei); } catch {}
  if (typeof Image !== 'undefined') {
    const url = URL.createObjectURL(datei);
    try { const img = new Image(); img.decoding = 'async'; img.src = url; await img.decode(); return await createImageBitmap(img); } catch {} finally { URL.revokeObjectURL(url); }
  }
  const heic = /hei[cf]/i.test(datei.type || '') || /\.hei[cf]$/i.test(datei.name || '');
  throw new BildwerkFehler(FEHLER.UNBEKANNT, heic ? 'Dieses HEIC-Foto kann der Browser nicht öffnen. In der Fotos-App als JPEG teilen oder unter Einstellungen › Kamera › Formate „Maximale Kompatibilität“ wählen.' : 'Dieses Bildformat kann der Browser nicht öffnen.');
}

/** @param {HTMLElement} wurzel @param {{test?:boolean}} [opts] */
export async function starte(wurzel, opts = {}) {
  const $ = (s) => wurzel.querySelector(s);
  const hoerer = new Map();
  const emit = (n, d) => { for (const f of hoerer.get(n) || []) try { f(d); } catch (e) { console.error(e); } };
  const flaeche = $('#bildflaeche'), canvas = $('#bild');
  const z = { doc: null, auswahl: null, reiter: 'auto', ansicht: { zoom: 1, mitteX: 0.5, mitteY: 0.5 }, vergleich: 'nachher', qualitaet: 'voll',
    zuschnittLive: null, maskeZeigen: null, randVorschlag: null, bitmap: null, analyseLaeuft: false };
  const pipeline = erstellePipeline(canvas);
  const rechnen = kanal(new Worker(new URL('./wk-rechnen.js', import.meta.url), { type: 'module' }));
  const ki = kanal(new Worker(new URL('./wk-ki.js', import.meta.url), { type: 'module' }));
  const q = new URLSearchParams(location.search);
  if (q.get('laufzeit') || q.get('modelle')) {
    const o = { laufzeit: q.get('laufzeit') || undefined, modelle: q.get('modelle') || null };
    setzeQuellen(o); ki.rufe('quellen', o).catch(() => {});
  }
  const module = new Map();
  const lade = (n) => { if (!module.has(n)) module.set(n, import(`./${n}.js`)); return module.get(n); };

  // ---------- Speicher ----------
  // Dauerhaften Speicher erbitten: sonst löscht Safari Modelle, „Zuletzt bearbeitet“ und Referenzfotos nach 7 Tagen ohne Besuch.
  try { navigator.storage?.persist?.().catch(() => {}); } catch { /* ältere Browser */ }
  // Zwei-Finger-Zoom der ganzen Oberfläche sperren (Safari ignoriert user-scalable=no); die Bildfläche hat eigene Gesten.
  for (const t of ['gesturestart', 'gesturechange']) document.addEventListener(t, (e) => e.preventDefault(), { passive: false });
  let db = null; try { db = await oeffneDB(); } catch { db = null; }
  const rasterMem = new Map();
  const raster = {
    async lege(daten, art = 'blob') {
      const rasterId = neueId('r'); const eintrag = { rasterId, art, daten, b: daten?.b, h: daten?.h };
      rasterMem.set(rasterId, eintrag);
      if (db) try { await idb(db, 'raster', 'readwrite', (s) => s.put(eintrag)); } catch (e) { console.warn('Raster nicht gespeichert', e); }
      return rasterId;
    },
    async hole(id) {
      if (rasterMem.has(id)) return rasterMem.get(id).daten;
      if (!db) return null; const e = await idb(db, 'raster', 'readonly', (s) => s.get(id)); if (e) rasterMem.set(id, e); return e ? e.daten : null;
    },
    async loesche(id) { rasterMem.delete(id); pipeline.entferneRaster(id); if (db) try { await idb(db, 'raster', 'readwrite', (s) => s.delete(id)); } catch {} },
  };
  let sicherungsTimer = 0;
  function sichereBald() {
    clearTimeout(sicherungsTimer);
    sicherungsTimer = setTimeout(async () => {
      if (!db || !z.doc) return;
      try { await idb(db, 'dokumente', 'readwrite', (s) => s.put({ ...z.doc, geaendert: Date.now() })); try { sessionStorage.setItem('bildwerk-offen', z.doc.id); } catch {} } catch (e) { console.warn('Sicherung', e); }
    }, 500);
  }

  // ---------- Undo/Redo ----------
  const vergangen = [], zukunft = []; let letzterSchluessel = null;
  const schnapp = (d) => ({ schritte: d.schritte, geometrie: d.geometrie });
  function aendere(fn, o = {}) {
    if (!z.doc) return;
    const entwurf = { ...z.doc, ...structuredClone(schnapp(z.doc)) };
    const neu = fn(entwurf) || entwurf;
    if (!(o.zusammenfassen && o.zusammenfassen === letzterSchluessel)) {
      vergangen.push({ ...schnapp(z.doc), name: o.name || o.zusammenfassen || 'Änderung' }); if (vergangen.length > 100) vergangen.shift();
      zukunft.length = 0;
    }
    letzterSchluessel = o.zusammenfassen || null;
    z.doc = { ...neu, geaendert: Date.now() };
    nachAenderung();
  }
  function nachAenderung() { emit('zustand', app.zustand()); kopfAktualisieren(); plane(); sichereBald(); if (z.doc?.schritte.some((s) => s.maske)) bauFehlendeMasken(); }
  const zugEnde = () => { letzterSchluessel = null; };
  addEventListener('pointerup', () => setTimeout(zugEnde, 0), true); addEventListener('pointercancel', () => setTimeout(zugEnde, 0), true);
  function rueckgaengig() { if (!vergangen.length || !z.doc) return; zukunft.push(schnapp(z.doc)); const s = vergangen.pop(); z.doc = { ...z.doc, schritte: s.schritte, geometrie: s.geometrie }; letzterSchluessel = null; nachAenderung(); reiterNeu(); }
  function wiederholen() { if (!zukunft.length || !z.doc) return; vergangen.push(schnapp(z.doc)); const s = zukunft.pop(); z.doc = { ...z.doc, ...s }; letzterSchluessel = null; nachAenderung(); reiterNeu(); }

  // ---------- Rendern ----------
  const renderZeiten = []; let geplant = 0;
  function cssGroesse() { return { cssB: canvas.clientWidth || 1, cssH: canvas.clientHeight || 1, dpr: canvas.width / Math.max(1, canvas.clientWidth) }; }
  function renderDoc() {
    if (!z.doc) return null;
    if (z.reiter === 'zuschnitt' && z.zuschnittLive) return { ...z.doc, geometrie: { ...z.zuschnittLive, zuschnitt: { x: 0, y: 0, b: 1, h: 1 } } };
    return z.doc;
  }
  function renderZustand(extra = {}) {
    return { doc: renderDoc(), ansicht: { ...z.ansicht, ...cssGroesse() }, vergleich: z.vergleich, qualitaet: z.qualitaet, maskeZeigen: z.maskeZeigen, ...extra };
  }
  function plane() { if (geplant) return; geplant = requestAnimationFrame(rendere); }
  function rendere() {
    geplant = 0; const t0 = performance.now();
    try { pipeline.rendereVorschau(renderZustand()); } catch (e) { console.error(e); }
    renderZeiten.push(performance.now() - t0); if (renderZeiten.length > 400) renderZeiten.shift();
    teilungZeigen(); emit('gerendert');
  }
  const groesse = () => {
    const dpr = Math.min(3, devicePixelRatio || 1);
    const b = Math.max(1, Math.round(canvas.clientWidth * dpr)), h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== b || canvas.height !== h) { canvas.width = b; canvas.height = h; }
    begrenzeAnsicht(); rendere(); zuschnittUIHandle?.neuZeichnen?.();
  };

  // ---------- Ansicht + Gesten ----------
  function ausgabeGroesse() { const d = renderDoc(); if (!d) return { b: 1, h: 1 }; const gm = geometrieMatrix(d.geometrie, d.quelle.b, d.quelle.h); return { b: gm.ausgabeB, h: gm.ausgabeH }; }
  function fit() { const a = ausgabeGroesse(); const c = cssGroesse(); return Math.min(c.cssB / a.b, c.cssH / a.h); }
  function maxZoom() { return Math.max(2, 4 / (fit() * cssGroesse().dpr)); }
  function begrenzeAnsicht() {
    const a = ausgabeGroesse(), c = cssGroesse(), v = z.ansicht; v.zoom = Math.min(maxZoom(), Math.max(z.reiter === 'zuschnitt' ? 0.88 : 1, v.zoom));
    const s = fit() * v.zoom; const halbX = c.cssB / (2 * s * a.b), halbY = c.cssH / (2 * s * a.h);
    v.mitteX = halbX >= 0.5 ? 0.5 : Math.min(1 - halbX, Math.max(halbX, v.mitteX));
    v.mitteY = halbY >= 0.5 ? 0.5 : Math.min(1 - halbY, Math.max(halbY, v.mitteY));
  }
  function ausgabePunkt(p) { const a = ausgabeGroesse(), c = cssGroesse(), s = fit() * z.ansicht.zoom; return { x: z.ansicht.mitteX + (p.x - c.cssB / 2) / (s * a.b), y: z.ansicht.mitteY + (p.y - c.cssH / 2) / (s * a.h) }; }
  function zoomeUm(p, zoom, o = ausgabePunkt(p)) {
    z.ansicht.zoom = zoom; const a = ausgabeGroesse(), c = cssGroesse(), s = fit() * Math.min(maxZoom(), Math.max(z.reiter === 'zuschnitt' ? 0.88 : 1, zoom));
    z.ansicht.mitteX = o.x - (p.x - c.cssB / 2) / (s * a.b); z.ansicht.mitteY = o.y - (p.y - c.cssH / 2) / (s * a.h);
    begrenzeAnsicht(); plane(); zuschnittUIHandle?.neuZeichnen?.();
  }
  const zeiger = new Map(); let geste = null, halteTimer = 0, letzterTipp = null;
  const lokal = (e) => { const r = flaeche.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  flaeche.addEventListener('pointerdown', (e) => {
    if (!z.doc || e.target.closest('.zs-rahmen,.teilung,.toast')) return;
    flaeche.setPointerCapture?.(e.pointerId); zeiger.set(e.pointerId, lokal(e));
    if (zeiger.size === 1) {
      const p = lokal(e); geste = { art: 'eins', start: p, letzt: p, t: performance.now(), bewegt: false };
      clearTimeout(halteTimer);
      halteTimer = setTimeout(() => { if (geste?.art === 'eins' && !geste.bewegt && z.reiter !== 'zuschnitt') { geste.art = 'halten'; z.vergleichVorHalten = z.vergleich; z.vergleich = 'vorher'; hinweisVorher(true); plane(); } }, 280);
    } else if (zeiger.size === 2) {
      clearTimeout(halteTimer); const [a, b] = [...zeiger.values()];
      const mitte = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      geste = { art: 'zwei', dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, zoom: z.ansicht.zoom, o: ausgabePunkt(mitte) };
      z.qualitaet = 'zieh';
    }
  });
  flaeche.addEventListener('pointermove', (e) => {
    if (!zeiger.has(e.pointerId) || !geste) return; zeiger.set(e.pointerId, lokal(e));
    if (geste.art === 'zwei' && zeiger.size >= 2) {
      const [a, b] = [...zeiger.values()]; const mitte = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      zoomeUm(mitte, geste.zoom * (Math.hypot(a.x - b.x, a.y - b.y) / geste.dist), geste.o);
    } else if (geste.art === 'halten' && z.ansicht.zoom > 1.001) {
      const p = lokal(e); if (Math.hypot(p.x - geste.start.x, p.y - geste.start.y) > 24) { z.vergleich = z.vergleichVorHalten || 'nachher'; hinweisVorher(false); geste.art = 'eins'; geste.bewegt = true; geste.letzt = p; plane(); }
    } else if (geste.art === 'eins') {
      const p = lokal(e); if (Math.hypot(p.x - geste.start.x, p.y - geste.start.y) > 8) { geste.bewegt = true; clearTimeout(halteTimer); }
      if (geste.bewegt && z.ansicht.zoom > 1.001 && !app.tippModus) {
        const a = ausgabeGroesse(), s = fit() * z.ansicht.zoom; z.qualitaet = 'zieh';
        z.ansicht.mitteX -= (p.x - geste.letzt.x) / (s * a.b); z.ansicht.mitteY -= (p.y - geste.letzt.y) / (s * a.h); begrenzeAnsicht(); plane();
      }
      geste.letzt = p;
    }
  });
  const loslassen = (e) => {
    if (!zeiger.has(e.pointerId)) return; zeiger.delete(e.pointerId); clearTimeout(halteTimer);
    if (!geste) return;
    if (geste.art === 'halten') { z.vergleich = z.vergleichVorHalten || 'nachher'; hinweisVorher(false); }
    if (geste.art === 'eins' && !geste.bewegt && performance.now() - geste.t < 280 && e.type === 'pointerup') tipp(geste.start);
    if (zeiger.size === 0) { geste = null; if (z.qualitaet !== 'voll') { z.qualitaet = 'voll'; } plane(); }
    else if (zeiger.size === 1) { const p = [...zeiger.values()][0]; geste = { art: 'eins', start: p, letzt: p, t: 0, bewegt: true }; }
  };
  flaeche.addEventListener('pointerup', loslassen); flaeche.addEventListener('pointercancel', loslassen);
  flaeche.addEventListener('wheel', (e) => { if (!z.doc) return; e.preventDefault(); zoomeUm(lokal(e), z.ansicht.zoom * Math.exp(-e.deltaY * 0.002)); }, { passive: false });
  function tipp(p) {
    const d = renderDoc(); const jetzt = performance.now();
    const quelle = bildschirmZuQuelle(p, { ...z.ansicht, ...cssGroesse() }, d.geometrie, d.quelle.b, d.quelle.h);
    emit('tipp', { x: quelle.x, y: quelle.y, cssX: p.x, cssY: p.y });
    if (letzterTipp && jetzt - letzterTipp.t < 320 && Math.hypot(p.x - letzterTipp.p.x, p.y - letzterTipp.p.y) < 30 && !app.tippModus) {
      letzterTipp = null;
      if (z.ansicht.zoom > 1.05) { z.ansicht = { zoom: 1, mitteX: 0.5, mitteY: 0.5 }; plane(); }
      else { const einsZuEins = 1 / (fit() * cssGroesse().dpr); zoomeUm(p, einsZuEins > 1.2 ? einsZuEins : 2.5); }
      return;
    }
    letzterTipp = { t: jetzt, p };
  }
  // Vorher-Hinweis + Teilungslinie
  const vorherEl = document.createElement('div'); vorherEl.className = 'vorher-hinweis'; vorherEl.textContent = 'Vorher'; flaeche.appendChild(vorherEl);
  function hinweisVorher(an) { vorherEl.classList.toggle('an', an); }
  const teilEl = document.createElement('div'); teilEl.className = 'teilung'; teilEl.innerHTML = '<div class="teilung-griff" aria-label="Vergleichslinie ziehen"></div><span class="t-l">Vorher</span><span class="t-r">Nachher</span>'; flaeche.appendChild(teilEl);
  function teilungZeigen() { const an = typeof z.vergleich === 'object'; teilEl.style.display = an ? 'block' : 'none'; if (an) teilEl.style.left = (z.vergleich.teilung * canvas.clientWidth) + 'px'; }
  teilEl.addEventListener('pointerdown', (e) => { e.stopPropagation(); teilEl.setPointerCapture(e.pointerId); teilEl.dataset.zieh = '1'; });
  teilEl.addEventListener('pointermove', (e) => { if (!teilEl.dataset.zieh) return; const p = lokal(e); z.vergleich = { teilung: Math.min(0.98, Math.max(0.02, p.x / canvas.clientWidth)) }; plane(); });
  const teilEnde = () => { delete teilEl.dataset.zieh; }; teilEl.addEventListener('pointerup', teilEnde); teilEl.addEventListener('pointercancel', teilEnde);

  // ---------- Gerüst ----------
  $('#kopf').innerHTML = `<button data-k="menue" aria-label="Menü">${ICON.menue}</button><button data-k="ebenen" aria-label="Ebenen">${ICON.ebenen}</button><button data-k="vergleich" aria-label="Vergleich" aria-pressed="false">${ICON.vergleich}</button><span class="platz"></span><button data-k="rueck" aria-label="Rückgängig">${ICON.rueck}</button><button data-k="vor" aria-label="Wiederholen">${ICON.vor}</button><button data-k="sichern" aria-label="Sichern" class="haupt">${ICON.sichern}</button>`;
  $('#reiter').innerHTML = REITER.map((r) => `<button role="tab" data-r="${r.id}" aria-selected="${r.id === z.reiter}">${ICON[r.id]}<span>${r.titel}</span></button>`).join('');
  const dateiEins = document.createElement('input'); dateiEins.type = 'file'; dateiEins.accept = 'image/*,.heic,.heif'; dateiEins.hidden = true;
  const dateiViele = document.createElement('input'); dateiViele.type = 'file'; dateiViele.accept = 'image/*,.heic,.heif'; dateiViele.multiple = true; dateiViele.hidden = true;
  wurzel.append(dateiEins, dateiViele);
  dateiEins.addEventListener('change', () => { const f = dateiEins.files[0]; dateiEins.value = ''; if (f) app.oeffne(f, { name: f.name }).catch(fehler); });
  dateiViele.addEventListener('change', () => { const f = [...dateiViele.files]; dateiViele.value = ''; if (f.length) oeffneBatch(f); });
  async function startZeigen() {
    const s = $('#start'); s.hidden = !!z.doc; if (z.doc) return;
    s.innerHTML = '<button data-k="oeffnen" class="haupt">Foto öffnen</button><button data-k="mehrere">Mehrere Fotos</button><div class="leise">Alles bleibt auf diesem Gerät.</div><div class="zuletzt"></div>';
    const liste = await zuletzt(); if (!liste.length) return;
    s.querySelector('.zuletzt').innerHTML = '<div class="leise">Zuletzt bearbeitet</div>' + liste.slice(0, 4).map((d) => `<button data-weiter="${d.id}">${esc(d.name)}</button>`).join('');
  }
  async function zuletzt() { if (!db) return []; try { const l = await idb(db, 'dokumente', 'readonly', (s) => s.getAll()); return (l || []).sort((a, b) => b.geaendert - a.geaendert); } catch { return []; } }
  wurzel.addEventListener('click', (e) => {
    const k = e.target.closest('[data-k]'); const w = e.target.closest('[data-weiter]');
    if (w) { weiterBearbeiten(w.dataset.weiter); return; }
    if (!k) return;
    const was = k.dataset.k;
    if (was === 'oeffnen') dateiEins.click();
    else if (was === 'mehrere') dateiViele.click();
    else if (was === 'rueck') rueckgaengig();
    else if (was === 'vor') wiederholen();
    else if (was === 'vergleich') { if (!z.doc) return; z.vergleich = typeof z.vergleich === 'object' ? 'nachher' : { teilung: 0.5 }; k.setAttribute('aria-pressed', String(typeof z.vergleich === 'object')); plane(); }
    else if (was === 'sichern') sichernBlatt();
    else if (was === 'ebenen') ebenenBlatt();
    else if (was === 'menue') menueBlatt();
  });
  function kopfAktualisieren() {
    $('[data-k="rueck"]').disabled = !vergangen.length; $('[data-k="vor"]').disabled = !zukunft.length;
    for (const n of ['sichern', 'ebenen', 'vergleich']) $(`[data-k="${n}"]`).disabled = !z.doc;
  }
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------- Meldungen + Blätter ----------
  const toast = document.createElement('div'); toast.className = 'toast'; toast.setAttribute('role', 'status'); flaeche.appendChild(toast);
  let toastTimer = 0;
  function meldung(text, art = 'info') { toast.textContent = text; toast.dataset.art = art; toast.classList.add('an'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('an'), art === 'fehler' ? 5000 : 2600); }
  function fehler(e) { console.error(e); if (e?.code === FEHLER.ABBRUCH) return; meldung(e?.text || e?.message || String(e), 'fehler'); emit('fehler', e); }
  let offenesBlatt = null;
  function blatt(titel, inhalt) {
    offenesBlatt?.schliesse();
    const el = document.createElement('div'); el.className = 'blatt'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', titel);
    el.innerHTML = `<div class="blatt-kopf"><strong>${esc(titel)}</strong><span class="platz"></span><button data-blatt="zu" aria-label="Schließen">${ICON.zu}</button></div><div class="blatt-inhalt"></div>`;
    wurzel.appendChild(el);
    let handle = null; try { handle = inhalt(el.querySelector('.blatt-inhalt')); } catch (e) { el.querySelector('.blatt-inhalt').innerHTML = `<p class="leise">${esc(platzhalterText(e))}</p>`; }
    const b = { schliesse() { try { handle?.zerstoere?.(); } catch {} el.remove(); if (offenesBlatt === b) offenesBlatt = null; } };
    el.querySelector('[data-blatt="zu"]').addEventListener('click', () => b.schliesse());
    offenesBlatt = b; return b;
  }
  const platzhalterText = (e) => (e?.code === FEHLER.NICHT_GEBAUT ? 'Dieser Bereich wird gerade gebaut.' : (e?.text || e?.message || 'Fehler'));

  // ---------- Öffnen ----------
  async function ladeBitmap(bitmap, doc, { neu = true } = {}) {
    z.bitmap?.close?.(); z.bitmap = bitmap;
    await pipeline.ladeQuelle(bitmap, { farbraum: doc.quelle.farbraum });
    z.doc = doc; z.ansicht = { zoom: 1, mitteX: 0.5, mitteY: 0.5 }; z.vergleich = 'nachher'; z.randVorschlag = null;
    if (neu) { vergangen.length = 0; zukunft.length = 0; letzterSchluessel = null; }
    $('#start').hidden = true; nachAenderung(); reiterNeu();
    retuscheStufen(doc).catch((e) => console.warn('Retusche-Stufen', e)); bauFehlendeMasken();
    z.gesichterGeprueft = null; analysiere().catch((e) => console.warn('Analyse', e));
  }
  async function oeffne(datei, o = {}) {
    const t0 = performance.now();
    const bitmap = await dekodiere(datei);
    const rasterId = await raster.lege(datei, 'original');
    const doc = neuesDokument({ b: bitmap.width, h: bitmap.height, rasterId, mime: datei.type || 'image/jpeg', name: (o.name || datei.name || 'Foto').replace(/\.[^.]+$/, '') });
    await ladeBitmap(bitmap, doc);
    app.test?.laufzeiten.push({ was: 'oeffnen', ms: performance.now() - t0, b: bitmap.width, h: bitmap.height });
  }
  async function weiterBearbeiten(id) {
    try {
      const doc = await idb(db, 'dokumente', 'readonly', (s) => s.get(id)); if (!doc) return;
      const blob = await raster.hole(doc.quelle.rasterId); if (!blob) { meldung('Original nicht mehr gespeichert', 'warnung'); return; }
      await ladeBitmap(await dekodiere(blob), doc);
    } catch (e) { fehler(e); }
  }
  async function analysiere(opts = {}) {
    if (!z.doc || z.analyseLaeuft) return; z.analyseLaeuft = true; const docId = z.doc.id; const t0 = performance.now();
    try {
      const bild = await pipeline.leseArbeitsbild({ kante: ANALYSE_KANTE });
      // INTEGRATION: ein Auftrag – der Worker sucht die Ränder selbst und nimmt sie aus der Analyse heraus; quelle für Megapixel/Rauschen
      const [an] = await Promise.allSettled([
        rechnen.rufe('analyse', { bild, gesichter: z.doc.gesichter || [], quelle: { b: z.doc.quelle.b, h: z.doc.quelle.h } }, { transfer: [bild.daten.buffer] }),
      ]);
      if (!z.doc || z.doc.id !== docId) return;
      const ra = an.status === 'fulfilled' && an.value?.raender ? an.value.raender : null;
      if (ra) { z.randErgebnis = ra; z.randVorschlag = vorschlagAusRaendern(ra, z.doc.quelle.b, z.doc.quelle.h); }
      if (an.status === 'fulfilled' && an.value?.analyse) {
        z.doc = { ...z.doc, analyse: an.value.analyse };
        if (an.value.detailkarte) pipeline.setzeRaster('detailkarte', an.value.detailkarte);
        z.analyseFehlt = false;
      } else z.analyseFehlt = true;
      app.test?.laufzeiten.push({ was: 'analyse', ms: performance.now() - t0, ok: !z.analyseFehlt });
      emit('analyse', z.doc.analyse || null); plane(); if (z.reiter === 'auto') reiterNeu();
    } finally { z.analyseLaeuft = false; }
    if (z.doc && z.doc.id === docId && !opts.ohneGesichter) gesichterImHintergrund(docId).catch(() => {}).then(() => personenAutomatisch(docId)).catch(() => {});
    if (!vorgewaermt) { vorgewaermt = true; setTimeout(() => vorwaermen().catch(() => {}), 50); }
  }
  /** INTEGRATION (Leistung): alle Regler-/Lokal-Shader einmal in Ruhe übersetzen (Mini 32 px), damit das erste Ziehen
   *  eines Reglers oder lokalen Reglers keine lange Aufgabe durch Shader-Übersetzung auslöst. */
  let vorgewaermt = false;
  async function vorwaermen() {
    if (!z.doc || !pipeline.hatQuelle?.()) return;
    const r = { belichtung: 0.1, kontrast: 5, lichter: 5, tiefen: 5, weiss: 5, schwarz: 5, klarheit: 5, struktur: 5, dunst: 5, dynamik: 5, saettigung: 5,
      temperatur: 6000, toenung: 5, schaerfe: 10, rauschL: 5, rauschF: 5, vignette: 5, korn: 5 };
    const g = neuerSchritt(ART.REGLER); Object.assign(g.params, r); g.params.kurve.rgb = [[0, 0], [0.5, 0.55], [1, 1]]; g.params.hsl.rot.ton = 5;
    pipeline.setzeRaster('_vorwaermen', { b: 1, h: 1, daten: new Uint8Array([255]) });
    const l = neuerSchritt(ART.LOKAL, { regler: { ...r } }, { maske: { id: '_vorwaermen', teile: [], weich: 0, verfeinern: false, umkehren: false } });
    try { const bm = await pipeline.rendereMini({ doc: { ...z.doc, schritte: [g, l] }, vergleich: 'nachher' }, 32); bm?.close?.(); } catch {}
  }
  /** INTEGRATION: liegt das Gesichts-Modell schon im Cache, Gesichter still erkennen → doc.gesichter (nicht im Undo) und
   *  Analyse einmal mit Gesichtern wiederholen (Belichtung gesichtsbetont, Vorschlag „Gesicht aufhellen“, Detailkarte Augen). */
  async function gesichterImHintergrund(docId) {
    if (!z.doc || z.doc.gesichter?.length || z.gesichterGeprueft === docId) return; z.gesichterGeprueft = docId;
    let st; try { st = await ki.rufe('status', {}); } catch { return; }
    if (!st?.ids?.['gesicht-landmarken']?.imCache || !z.bitmap) return;
    const kopie = await createImageBitmap(z.bitmap);
    const g = await ki.rufe('gesichter', { bild: kopie }, { transfer: [kopie] });
    if (!z.doc || z.doc.id !== docId || !g?.length) return;
    setzeGesichter(g); await analysiere({ ohneGesichter: true });
  }
  /** PERSONEN: gespeicherte Personen automatisch erkennen und auffrischen (ohne Antippen). Lädt personen.js nur, wenn es
   *  Personen mit Fotos gibt (Merker in localStorage) – Modelle werden hier nie geladen, nur benutzt, wenn sie im Cache liegen. */
  async function personenAutomatisch(docId) {
    try { if (localStorage.getItem('bildwerk-personen-da') !== '1' || localStorage.getItem('bildwerk-personen-auto') === '0') return; } catch { return; }
    if (!z.doc || z.doc.id !== docId) return;
    const P = await import('./personen.js');
    const r = await P.autoAuffrischen(app, { docId });
    if (r?.schritte?.length && z.doc?.id === docId) meldung(`${r.schritte.map((s) => s.params.person.name).join(', ')} automatisch aufgefrischt`);
  }
  function setzeGesichter(liste) {
    if (!z.doc || !Array.isArray(liste)) return;
    z.doc = { ...z.doc, gesichter: liste }; sichereBald(); emit('gesichter', liste); bauFehlendeMasken();
  }
  // INTEGRATION: Schritte mit Masken-Rezept ohne Raster (z. B. Vorschlag „Gesicht aufhellen“, nach Neustart) im Worker bauen.
  const maskenInArbeit = new Set();
  async function bauFehlendeMasken() {
    if (!z.doc || !pipeline.hatQuelle?.()) return;
    for (const s of z.doc.schritte) {
      const m = s.maske; if (!m) continue;
      const id = m.rasterId || m.id; if (!id || pipeline.hatRaster?.(id) || maskenInArbeit.has(id)) continue;
      maskenInArbeit.add(id);
      (async () => {
        if (m.rasterId) { const r = await raster.hole(m.rasterId); if (r) { pipeline.setzeRaster(m.rasterId, r); plane(); return; } }
        if (m.teile?.some((t) => t.quelle === 'gesicht') && !z.doc.gesichter?.length) { maskenInArbeit.delete(id); return; }   // kommt mit setzeGesichter wieder
        const q = pipeline.quelleGroesse(); const teile = {};
        for (const t of m.teile || []) if (t.rasterId) { const r = await raster.hole(t.rasterId); if (r) teile[t.rasterId] = r; }
        const fuehrung = await pipeline.leseArbeitsbild({ kante: 1024 });
        const maske = await rechnen.rufe('maske-bauen', { ref: m, teile, b: q.arbeitB, h: q.arbeitH, fuehrung, gesichter: z.doc.gesichter || [] }, { transfer: [fuehrung.daten.buffer] });
        if (maske?.daten) { pipeline.setzeRaster(id, maske); plane(); }
      })().catch((e) => { console.warn('Maske', e); maskenInArbeit.delete(id); });
    }
  }
  // INTEGRATION: Retusche-Stufen (Flicken) registrieren, sobald ein Dokument sie braucht – nicht erst, wenn der Reiter offen war.
  async function retuscheStufen(doc) {
    const arten = new Set((doc?.schritte || []).map((s) => s.art));
    const E = (arten.has(ART.ENTFERNEN) || arten.has(ART.AUFFRISCHEN)) ? await lade('entfernen') : null;
    if (E) { pipeline.registriereStufen(E.STUFEN); E.setzeFlickenLader((id) => raster.hole(id), plane); }
    if (arten.has(ART.AUFFRISCHEN)) { const H = await lade('hoch'); pipeline.registriereStufen(H.STUFEN); }
    if (E) plane();
  }

  // ---------- Schritte-Helfer ----------
  const globalerRegler = (d) => d.schritte.find((s) => s.art === ART.REGLER && !s.maske);
  function setzeRegler(id, wert, phase) {
    if (phase === 'start') z.qualitaet = 'zieh';
    aendere((d) => {
      let s = globalerRegler(d); if (!s) { s = neuerSchritt(ART.REGLER); d.schritte.push(s); }
      setzePfad(s.params, id, wert); return d;
    }, { zusammenfassen: 'regler:' + id, name: id });
    if (phase === 'ende') { z.qualitaet = 'voll'; zugEnde(); plane(); }
  }
  function setzePfad(o, pfad, wert) { const t = pfad.split('.'); let x = o; for (let i = 0; i < t.length - 1; i++) { x[t[i]] ??= {}; x = x[t[i]]; } x[t[t.length - 1]] = wert; }
  async function autoSchritte() {
    let schritte = [];
    if (z.doc.analyse) { try { const an = await lade('analyse'); schritte = an.autoSchritte(z.doc.analyse); } catch (e) { schritte = []; } }
    if (!schritte.length) { const b = await lade('batch'); schritte = b.rueckfallSchritte(await pipeline.leseArbeitsbild({ kante: 256 })); }
    return schritte.map((s) => ({ ...s, auto: true }));
  }
  async function autoAnwenden() {
    if (!z.doc) return;
    const schritte = await autoSchritte(); const geo = z.randVorschlag;
    aendere((d) => { d.schritte = [...d.schritte.filter((s) => !s.auto), ...schritte]; if (geo) d.geometrie = { ...d.geometrie, zuschnitt: geo }; return d; }, { name: 'Auto' });
    if (geo) z.ansicht = { zoom: 1, mitteX: 0.5, mitteY: 0.5 };
    meldung(z.doc.analyse ? 'Automatisch korrigiert' : 'Einfache Tonwert-Korrektur angewendet');
  }

  // ---------- Reiter ----------
  let reiterAufraeumen = [];
  let zuschnittUIHandle = null;
  $('#reiter').addEventListener('click', (e) => { const b = e.target.closest('[data-r]'); if (!b) return; wechsleReiter(b.dataset.r); });
  function wechsleReiter(id) {
    if (z.reiter === 'zuschnitt' && id !== 'zuschnitt') zuschnittUebernehmen();
    z.reiter = id; for (const x of $('#reiter').children) x.setAttribute('aria-selected', String(x.dataset.r === id));
    reiterNeu(); plane();
  }
  function aufraeumen() { for (const f of reiterAufraeumen) try { f(); } catch {} reiterAufraeumen = []; $('#werkzeug').innerHTML = ''; $('#regler').innerHTML = ''; zuschnittUIHandle = null; }
  function platzhalter(el, e) { el.innerHTML = `<p class="leise platzhalter">${esc(platzhalterText(e))}</p>`; }
  function kachel(titel, attr = '', klasse = '') { return `<button class="kachel ${klasse}" ${attr}>${esc(titel)}</button>`; }
  async function reiterNeu() {
    aufraeumen(); const wz = $('#werkzeug'), rg = $('#regler');
    if (!z.doc) { rg.innerHTML = '<p class="leise platzhalter">Öffne ein Foto, um zu beginnen.</p>'; return; }
    const id = z.reiter; const nr = ++reiterNeu.nr;
    try {
      if (id === 'auto') {
        const vs = vorschlaegeListe();
        wz.innerHTML = kachel('Alles automatisch', 'data-auto', 'haupt') + vs.map((v, i) => kachel(v.titel, `data-vs="${i}" title="${esc(v.grund || '')}"`)).join('');
        wz.onclick = (e) => { if (e.target.closest('[data-auto]')) autoAnwenden().catch(fehler); const v = e.target.closest('[data-vs]'); if (v) vorschlagAnwenden(vs[Number(v.dataset.vs)]).catch(fehler); };
        reiterAufraeumen.push(() => { wz.onclick = null; });
        rg.innerHTML = analyseText();
      } else if (id === 'regler') {
        const R = await lade('regler'); if (nr !== reiterNeu.nr) return;
        const gruppen = [['licht', 'Licht'], ['praesenz', 'Präsenz'], ['farbe', 'Farbe'], ['kurve', 'Kurve'], ['hsl', 'Farbtöne'], ['details', 'Details'], ['effekte', 'Effekte']];
        z.reglerGruppe ||= 'licht';
        wz.innerHTML = gruppen.map(([g, t]) => kachel(t, `data-g="${g}" aria-pressed="${g === z.reglerGruppe}"`, 'chip')).join('');
        wz.onclick = (e) => { const b = e.target.closest('[data-g]'); if (b) { z.reglerGruppe = b.dataset.g; reiterNeu(); } };
        const params = globalerRegler(z.doc)?.params || neuerSchritt(ART.REGLER).params; let h;
        try {
          if (z.reglerGruppe === 'kurve') h = R.kurveUI(rg, { punkte: params.kurve.rgb, kanal: 'rgb', onAendern: (punkte, phase) => setzeRegler('kurve.rgb', punkte, phase) });
          else if (z.reglerGruppe === 'hsl') h = R.hslUI(rg, { params: params.hsl, onAendern: (b, f, w, phase) => setzeRegler(`hsl.${b}.${f}`, w, phase) });
          else h = R.reglerUI(rg, { params, defs: R.REGLER.filter((d) => d.gruppe === z.reglerGruppe), onAendern: setzeRegler });
        } catch (e) { platzhalter(rg, e); }
        if (h) { const ab = app.on('zustand', () => h.setze(globalerRegler(z.doc)?.params || neuerSchritt(ART.REGLER).params)); reiterAufraeumen.push(() => { ab(); h.zerstoere(); }); }
      } else if (id === 'looks') {
        const L = await lade('looks'); if (nr !== reiterNeu.nr) return;
        const aktiv = z.doc.schritte.filter((s) => s.art === ART.LOOK && !s.maske).pop();
        wz.innerHTML = L.LOOKS.map((l) => `<button class="kachel look" data-look="${l.id}" aria-pressed="${aktiv?.params?.id === l.id}"><canvas width="1" height="1"></canvas><span>${esc(l.titel)}</span></button>`).join('');
        wz.onclick = (e) => { const b = e.target.closest('[data-look]'); if (b) lookTippen(L, b.dataset.look).catch(fehler); };
        lookMinis(L, wz, nr);
        // INTEGRATION: Tiefe/Kombination – Antippen setzt den Schärfepunkt (looks.js: params.fokus; ohne Tiefenkarte schätzt der Shader)
        reiterAufraeumen.push(app.on('tipp', (p) => {
          const s = z.doc?.schritte.filter((x) => x.art === ART.LOOK && !x.maske).pop();
          if (!s || !['tiefe', 'kombination'].includes(s.params?.id)) return;
          aendere((d) => { const t = d.schritte.find((x) => x.id === s.id); if (t) { t.params.fokus = { x: p.x, y: p.y }; t.params.fokusTiefe = null; } return d; }, { name: 'Schärfepunkt' });
          meldung('Schärfe auf den angetippten Punkt gelegt');
        }));
        if (aktiv) {
          rg.innerHTML = ''; regel(rg, { titel: 'Stärke', min: 0, max: 100, wert: Math.round((aktiv.params.staerke ?? 0.7) * 100), einheit: '%' }, (w, phase) => {
            if (phase === 'start') z.qualitaet = 'zieh';
            aendere((d) => { const s = d.schritte.find((x) => x.id === aktiv.id); if (s) s.params.staerke = w / 100; return d; }, { zusammenfassen: 'look-staerke' });
            if (phase === 'ende') { z.qualitaet = 'voll'; plane(); }
          });
          const def = L.LOOKS.find((l) => l.id === aktiv.params.id);
          if (z.lookFein && def?.feinregler?.length) {
            const box = document.createElement('div'); rg.appendChild(box);
            try { const R = await lade('regler'); const h = R.reglerUI(box, { params: aktiv.params.fein || {}, defs: def.feinregler, onAendern: (fid, w, phase) => {
              if (phase === 'start') z.qualitaet = 'zieh';
              aendere((d) => { const s = d.schritte.find((x) => x.id === aktiv.id); if (s) { s.params.fein ||= {}; s.params.fein[fid] = w; } return d; }, { zusammenfassen: 'look-fein:' + fid });
              if (phase === 'ende') { z.qualitaet = 'voll'; plane(); } } });
              reiterAufraeumen.push(() => h.zerstoere()); } catch (e) { platzhalter(box, e); }
          }
          if (['tiefe', 'kombination'].includes(aktiv.params.id)) { const h = document.createElement('p'); h.className = 'leise'; h.textContent = 'Ins Bild tippen, um den Schärfepunkt zu setzen.'; rg.appendChild(h); }
          const weg = document.createElement('button'); weg.textContent = 'Look entfernen'; weg.className = 'leise-knopf'; rg.appendChild(weg);
          weg.onclick = () => aendere((d) => { d.schritte = d.schritte.filter((s) => s.id !== aktiv.id); return d; }, { name: 'Look entfernen' });
        } else rg.innerHTML = '<p class="leise platzhalter">Look antippen. Zweiter Tipp öffnet die Feinregler.</p>';
      } else if (id === 'auswahl') {
        const A = await lade('auswahl'); if (nr !== reiterNeu.nr) return;
        try {
          const h = A.auswahlUI(rg, { app, werkzeug: wz, onFertig: (ref) => aendere((d) => { d.schritte.push(neuerSchritt(ART.LOKAL, { regler: {} }, { maske: ref, name: 'Lokal' })); return d; }, { name: 'Auswahl' }) });
          reiterAufraeumen.push(() => h?.zerstoere?.());
        } catch (e) { platzhalter(rg, e); }
      } else if (id === 'retusche') {
        wz.innerHTML = kachel('Entfernen', 'data-ret="entfernen"', 'chip') + kachel('Gesicht auffrischen', 'data-ret="auffrischen"', 'chip') + kachel('Hochskalieren', 'data-ret="hoch"', 'chip');
        z.retusche ||= 'entfernen'; for (const b of wz.querySelectorAll('[data-ret]')) b.setAttribute('aria-pressed', String(b.dataset.ret === z.retusche));
        wz.onclick = (e) => { const b = e.target.closest('[data-ret]'); if (b) { z.retusche = b.dataset.ret; reiterNeu(); } };
        try {
          let h;
          if (z.retusche === 'entfernen') h = (await lade('entfernen')).entfernenUI(rg, { app });
          else h = (await lade('hoch')).retuscheUI(rg, { app, modus: z.retusche });
          if (nr !== reiterNeu.nr) { h?.zerstoere?.(); return; }
          reiterAufraeumen.push(() => h?.zerstoere?.());
        } catch (e) { platzhalter(rg, e); }
      } else if (id === 'zuschnitt') {
        const Z = await import('./zuschnitt.js'); if (nr !== reiterNeu.nr) return;
        z.zuschnittLive = structuredClone(z.doc.geometrie); z.ansicht = { zoom: 0.88, mitteX: 0.5, mitteY: 0.5 };   // Luft für die Griffe
        wz.innerHTML = '';
        zuschnittUIHandle = Z.zuschnittUI(rg, {
          doc: z.doc, vorschlag: z.randVorschlag, flaeche,
          ansicht: () => ({ ...z.ansicht, ...cssGroesse() }),
          onAendern: (g, phase) => { z.zuschnittLive = g; z.qualitaet = phase === 'zieh' ? 'zieh' : 'voll'; plane(); },
          onFertig: (g) => { z.zuschnittLive = g; zuschnittUebernehmen(); wechsleReiter('auto'); },
        });
        reiterAufraeumen.push(() => { zuschnittUIHandle?.zerstoere(); z.zuschnittLive = null; });
        plane();
      }
    } catch (e) { platzhalter(rg, e); }
  }
  reiterNeu.nr = 0;
  function zuschnittUebernehmen() {
    const g = z.zuschnittLive; if (!g || !z.doc) return;
    if (JSON.stringify(g) !== JSON.stringify(z.doc.geometrie)) aendere((d) => { d.geometrie = structuredClone(g); return d; }, { name: 'Zuschnitt' });
    z.zuschnittLive = null; z.ansicht = { zoom: 1, mitteX: 0.5, mitteY: 0.5 }; plane();
  }
  function vorschlaegeListe() {
    const l = [];
    if (z.randVorschlag) l.push({ id: 'raender', titel: 'Ränder abschneiden', grund: 'Balken am Bildrand erkannt', schritte: [], geometrie: { zuschnitt: z.randVorschlag } });
    for (const v of z.doc.analyse?.vorschlaege || []) if (!(v.id === 'raender' && z.randVorschlag)) l.push(v);
    if (!z.doc.analyse && !z.analyseLaeuft) l.push({ id: 'ton-einfach', titel: 'Tonwerte richten', grund: 'Einfache Korrektur', schritte: null });
    return l.slice(0, 6);
  }
  async function vorschlagAnwenden(v) {
    const schritte = v.schritte === null ? await autoSchritte() : (v.schritte || []).map((s) => ({ ...structuredClone(s), id: neueId('s') }));
    aendere((d) => { d.schritte.push(...schritte); if (v.geometrie) d.geometrie = { ...d.geometrie, ...v.geometrie }; return d; }, { name: v.titel });
    if (v.geometrie) z.ansicht = { zoom: 1, mitteX: 0.5, mitteY: 0.5 };
    meldung(v.titel);
  }
  function analyseText() {
    const a = z.doc.analyse; const zeilen = [];
    if (z.analyseLaeuft) zeilen.push('Analyse läuft …');
    if (a) {
      if (a.belichtung?.ev != null) zeilen.push(`Belichtung: ${a.belichtung.ev > 0 ? '+' : ''}${a.belichtung.ev.toFixed(1)} EV empfohlen`);
      if (a.farbstichDeltaE != null) zeilen.push(`Farbstich: ΔE ${a.farbstichDeltaE.toFixed(1)}`);
      if (a.dauerMs != null) zeilen.push(`Analyse in ${Math.round(a.dauerMs)} ms`);
    } else if (!z.analyseLaeuft) zeilen.push('Ausführliche Analyse noch nicht verfügbar – „Alles automatisch“ nutzt eine einfache Tonwert-Korrektur.');
    if (z.randVorschlag) zeilen.push('Ränder erkannt – Vorschlag zum Zuschneiden liegt bereit.');
    const q = z.doc.quelle; zeilen.push(`${q.b} × ${q.h} px (${(q.b * q.h / 1e6).toFixed(1)} MP)`);
    return `<div class="info">${zeilen.map((t) => `<p>${esc(t)}</p>`).join('')}</div>`;
  }
  async function lookTippen(L, id) {
    const aktiv = z.doc.schritte.filter((s) => s.art === ART.LOOK && !s.maske).pop();
    if (aktiv?.params?.id === id) { z.lookFein = !z.lookFein; reiterNeu(); return; }
    let s; try { s = L.lookSchritt(id, 0.7, z.doc.analyse); } catch { s = neuerSchritt(ART.LOOK, { id, staerke: 0.7 }); }
    z.lookFein = false;
    aendere((d) => { d.schritte = d.schritte.filter((x) => !(x.art === ART.LOOK && !x.maske && x.id === aktiv?.id)); d.schritte.push(s); return d; }, { name: 'Look' });
    reiterNeu();
  }
  async function lookMinis(L, wz, nr) {
    if (!z.doc || !pipeline.hatQuelle()) return;
    for (const b of wz.querySelectorAll('[data-look]')) {
      if (nr !== reiterNeu.nr) return;
      let s; try { s = L.lookSchritt(b.dataset.look, 0.7, z.doc.analyse); } catch { continue; }
      try {
        const doc = { ...z.doc, schritte: [...z.doc.schritte.filter((x) => x.art !== ART.LOOK), s] };
        const bm = await pipeline.rendereMini({ doc, vergleich: 'nachher' }, 96);
        const c = b.querySelector('canvas'); c.width = bm.width; c.height = bm.height; c.getContext('2d').drawImage(bm, 0, 0); bm.close?.();
      } catch { /* Mini optional */ }
      await new Promise((ok) => setTimeout(ok, 0));
    }
  }
  /** Einfacher Regler (eine Zeile, ziehen über die ganze Zeile, Doppeltipp = Standard). */
  function regel(el, d, onAendern) {
    const zeile = document.createElement('label'); zeile.className = 'regel';
    zeile.innerHTML = `<span>${esc(d.titel)}</span><input type="range" min="${d.min}" max="${d.max}" step="${d.schritt || 1}" value="${d.wert}"><output>${d.wert}${d.einheit || ''}</output>`;
    const i = zeile.querySelector('input'), o = zeile.querySelector('output'); let gezogen = false;
    i.addEventListener('input', () => { o.textContent = i.value + (d.einheit || ''); onAendern(Number(i.value), gezogen ? 'zieh' : (gezogen = true, 'start')); });
    i.addEventListener('change', () => { gezogen = false; onAendern(Number(i.value), 'ende'); });
    el.appendChild(zeile); return zeile;
  }

  // ---------- Ebenen ----------
  const ART_TITEL = { 'auto-ton': 'Auto-Ton', regler: 'Regler', kurve: 'Kurve', hsl: 'Farbtöne', look: 'Look', lokal: 'Lokal', schaerfe: 'Schärfe', rauschen: 'Rauschen', effekte: 'Effekte', entfernen: 'Entfernen', auffrischen: 'Auffrischen' };
  function ebenenBlatt() {
    if (!z.doc) return;
    blatt('Ebenen', (c) => {
      const zeichne = () => {
        const l = z.doc.schritte;
        c.innerHTML = l.length ? l.map((s, i) => `<div class="ebene" data-i="${i}"><button data-e="an" aria-pressed="${s.an}" aria-label="An/Aus">${ICON.auge}</button><span class="ebene-name">${esc(s.name || ART_TITEL[s.art] || s.art)}${s.params?.id ? ' · ' + esc(s.params.id) : ''}</span><input type="range" min="0" max="100" value="${Math.round((s.deckkraft ?? 1) * 100)}" aria-label="Deckkraft"><button data-e="weg" aria-label="Löschen">${ICON.muell}</button></div>`).join('') : '<p class="leise">Noch keine Bearbeitung.</p>';
      };
      zeichne();
      const klick = (e) => {
        const r = e.target.closest('.ebene'); const b = e.target.closest('[data-e]'); if (!r || !b) return; const i = Number(r.dataset.i);
        if (b.dataset.e === 'an') aendere((d) => { d.schritte[i].an = !d.schritte[i].an; return d; }, { name: 'Ebene an/aus' });
        if (b.dataset.e === 'weg') aendere((d) => { d.schritte.splice(i, 1); return d; }, { name: 'Ebene löschen' });
        zeichne();
      };
      const zieh = (e) => { const r = e.target.closest('.ebene'); if (!r || e.target.type !== 'range') return; const i = Number(r.dataset.i); const w = Number(e.target.value) / 100; aendere((d) => { d.schritte[i].deckkraft = w; return d; }, { zusammenfassen: 'deckkraft:' + i }); };
      c.addEventListener('click', klick); c.addEventListener('input', zieh);
      return { setze: zeichne, zerstoere() {} };
    });
  }

  // ---------- Sichern ----------
  function sichernBlatt() {
    if (!z.doc) return;
    blatt('Sichern', (c) => {
      const gm = geometrieMatrix(z.doc.geometrie, z.doc.quelle.b, z.doc.quelle.h);
      const st = { format: 'image/jpeg', qualitaet: 92, skala: 1 };
      c.innerHTML = `<div class="zeile" role="group" aria-label="Format"><button data-f="image/jpeg" aria-pressed="true">JPEG</button><button data-f="image/png" aria-pressed="false">PNG</button></div>
        <div class="zeile" role="group" aria-label="Größe"><button data-s="1" aria-pressed="true">Original<br><small>${gm.ausgabeB}×${gm.ausgabeH}</small></button>${[2, 4].map((f) => { const zuGross = gm.ausgabeB * gm.ausgabeH * f * f > MAX_AUSGABE_PX; return `<button data-s="${f}" aria-pressed="false"${zuGross ? ' disabled' : ''}>×${f}${zuGross ? '<br><small>zu groß</small>' : ''}</button>`; }).join('')}</div>
        ${gm.ausgabeB * gm.ausgabeH * 4 > MAX_AUSGABE_PX ? `<p class="leise">Mehr als ${(MAX_AUSGABE_PX / 1e6).toFixed(1).replace('.', ',')} MP kann das iPhone nicht sichern – größer nur über Zuschnitt.</p>` : ''}
        <div class="qual"></div><div class="fortschritt" hidden><div></div></div><p class="leise status"></p>
        <button class="haupt breit" data-los>Teilen / In Fotos sichern</button>`;
      regel(c.querySelector('.qual'), { titel: 'Qualität', min: 60, max: 100, wert: 92, einheit: '%' }, (w) => { st.qualitaet = w; });
      let ac = null, bereit = null;
      c.addEventListener('click', async (e) => {
        const f = e.target.closest('[data-f]'), s = e.target.closest('[data-s]');
        if (f) { st.format = f.dataset.f; for (const b of c.querySelectorAll('[data-f]')) b.setAttribute('aria-pressed', String(b === f)); c.querySelector('.qual').hidden = st.format === 'image/png'; }
        if (f || s) bereit?.remove();
        if (s) { if (s.disabled) return; st.skala = Number(s.dataset.s); for (const b of c.querySelectorAll('[data-s]')) b.setAttribute('aria-pressed', String(b === s)); }
        if (e.target.closest('[data-los]')) {
          if (ac) { ac.abort(); return; }
          const knopf = c.querySelector('[data-los]'), bar = c.querySelector('.fortschritt'), status = c.querySelector('.status');
          ac = new AbortController(); knopf.textContent = 'Abbrechen'; bar.hidden = false;
          bereit?.remove();
          try {
            const t0 = performance.now();
            const blob = await app.exportiere({ format: st.format, qualitaet: st.qualitaet / 100, skala: st.skala, signal: ac.signal, onFortschritt: (x) => { bar.firstElementChild.style.width = (x * 100) + '%'; } });
            status.textContent = `${(blob.size / 1e6).toFixed(1)} MB in ${((performance.now() - t0) / 1000).toFixed(1)} s`;
            const name = `${z.doc.name || 'Foto'}-bildwerk.${st.format === 'image/png' ? 'png' : 'jpg'}`;
            const r = await app.teile(blob, name, { seit: t0, nach: knopf, status });
            if (r?.knopf) bereit = r.knopf;
          } catch (err) { fehler(err); } finally { ac = null; knopf.textContent = 'Teilen / In Fotos sichern'; bar.hidden = true; }
        }
      });
      return { setze() {}, zerstoere() { ac?.abort(); } };
    });
  }
  /**
   * Teilen / In Fotos sichern. Safari erlaubt das Teilen-Blatt nur kurz nach einem Tipp: dauerte das Rechnen länger
   * (opts.seit = Start des Tipps), erscheint ein eigener Knopf „In Fotos sichern / Teilen“ für einen neuen Tipp,
   * statt still in den Download-Ordner auszuweichen. @returns {Promise<{ergebnis:string, knopf?:HTMLElement}>}
   */
  async function teile(blob, name, opts = {}) {
    const datei = new File([blob], name, { type: blob.type });
    const kann = !!navigator.canShare?.({ files: [datei] });
    const neuerTipp = () => {
      const k = document.createElement('button'); k.type = 'button'; k.className = 'haupt breit'; k.textContent = 'In Fotos sichern / Teilen';
      k.addEventListener('click', async () => { k.disabled = true; const r = await teile(blob, name, {}); if (r.ergebnis !== 'abbruch') k.remove(); else k.disabled = false; });
      if (opts.nach?.parentNode) opts.nach.after(k); else meldung('Bild fertig – zum Teilen erneut tippen.');
      if (opts.status) opts.status.textContent += ' · Fertig. Jetzt „In Fotos sichern / Teilen“ antippen.';
      return { ergebnis: 'wartet', knopf: k };
    };
    if (kann && opts.seit != null && performance.now() - opts.seit > GESTE_MS && opts.nach) return neuerTipp();
    if (kann) {
      try { await navigator.share({ files: [datei], title: name }); return { ergebnis: 'geteilt' }; }
      catch (e) { if (e?.name === 'AbortError') return { ergebnis: 'abbruch' }; if (e?.name === 'NotAllowedError' && opts.nach) return neuerTipp(); }
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 30000);
    meldung(kann ? 'Teilen nicht möglich – als Download gesichert (Dateien-App).' : 'Als Download gesichert.');
    return { ergebnis: 'download' };
  }

  // ---------- Menü + Batch ----------
  function menueBlatt() {
    blatt('Bildwerk', (c) => {
      c.innerHTML = `<button class="breit" data-m="oeffnen">Foto öffnen</button><button class="breit" data-m="batch">Mehrere Fotos (Batch)</button><div class="zuletzt"></div><p class="leise">Alles läuft auf diesem Gerät, keine Bilder verlassen es. Version ${VERSION}.</p>`;
      zuletzt().then((l) => { const el = c.querySelector('.zuletzt'); if (el && l.length) el.innerHTML = '<p class="leise">Zuletzt bearbeitet</p>' + l.slice(0, 6).map((d) => `<button class="breit" data-weiter="${d.id}">${esc(d.name)}</button>`).join(''); });
      c.addEventListener('click', (e) => { const m = e.target.closest('[data-m]'); if (!m) return; offenesBlatt?.schliesse(); if (m.dataset.m === 'oeffnen') dateiEins.click(); else dateiViele.click(); });
      return { setze() {}, zerstoere() {} };
    });
  }
  async function oeffneBatch(dateien) {
    const B = await lade('batch');
    blatt('Batch', (c) => B.batchUI(c, { app, dateien }));
  }

  /** Neue Pipeline mit denselben Stufen (für Batch). */
  function neuePipeline() {
    const c = document.createElement('canvas'); c.width = c.height = 1;
    const p = erstellePipeline(c); p.registriereStufen(pipeline._stufen); return p;
  }
  async function hochKachel(kachel, faktor, modus) {
    try { const H = await lade('hoch'); return await H.hochskaliereKachel(ki, kachel, faktor, modus); } catch {}
    return rechnen.rufe('hoch-klassisch', { kachel, faktor }, { transfer: [kachel.daten.buffer] });
  }

  /** @type {object} AppKern (ARCH.md §4.11) */
  const app = {
    version: VERSION,
    zustand: () => ({ doc: z.doc, auswahl: z.auswahl, reiter: z.reiter }),
    aendere, rueckgaengig, wiederholen, kannRueck: () => vergangen.length > 0, kannVor: () => zukunft.length > 0,
    on(name, f) { if (!hoerer.has(name)) hoerer.set(name, new Set()); hoerer.get(name).add(f); return () => hoerer.get(name).delete(f); },
    oeffne: (d, o) => oeffne(d, o).catch((e) => { fehler(e); throw e; }),
    async exportiere(o) { if (!z.doc) throw new BildwerkFehler(FEHLER.UNBEKANNT, 'Kein Bild'); return pipeline.exportiere({ doc: z.doc, vergleich: 'nachher', qualitaet: 'voll' }, { hochKachel, ...o }); },
    teile, raster, pipeline, rechnen, ki,
    arbeitsbild: (o) => pipeline.leseArbeitsbild(o), quelleBitmap: () => z.bitmap,
    hochKachel, meldung, blatt,
    // Erweiterungen (Doku in LOG.md): Ansicht/Fläche für Tipp-Werkzeuge, Masken-Überlagerung, Batch-Pipeline, Neu-Rendern
    ansicht: () => ({ ...z.ansicht, ...cssGroesse() }), bildflaeche: flaeche, tippModus: false,
    zeigeMaske(id) { z.maskeZeigen = id || null; plane(); }, setzeAuswahl(id) { z.auswahl = id; emit('zustand', app.zustand()); },
    neuePipeline, neuZeichnen: plane, wechsleReiter, zugEnde,
    setzeQualitaet(q) { z.qualitaet = q; plane(); },
    setzeGesichter,   // INTEGRATION: erkannte Gesichter → doc.gesichter (nicht im Undo), Ereignis 'gesichter'
  };
  if (opts.test) {
    const langeAufgaben = [];
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) langeAufgaben.push(e.duration); }).observe({ type: 'longtask', buffered: true }); } catch {}
    app.test = {
      laufzeiten: [], langeAufgaben, renderZeiten: () => renderZeiten.slice(), leereRenderZeiten: () => { renderZeiten.length = 0; },
      lesePixel: (x, y, b, h) => pipeline.lesePixel(x, y, b, h, renderZustand()),
      analyse: () => z.doc?.analyse || null, setzeQuellen: (o) => { setzeQuellen(o); return ki.rufe('quellen', o); },
      intern: z, renderZustand, randVorschlag: () => z.randVorschlag, autoAnwenden, zuschnittUebernehmen,
    };
    window.bildwerk = app;
  }
  // Stufen der Regler/Looks registrieren, sobald die Module da sind (blockiert den Start nicht)
  Promise.allSettled([lade('regler'), lade('looks')]).then((r) => {
    for (const x of r) if (x.status === 'fulfilled' && x.value.STUFEN?.length) pipeline.registriereStufen(x.value.STUFEN);
    plane();
  });
  new ResizeObserver(groesse).observe(flaeche); groesse(); kopfAktualisieren(); startZeigen(); reiterNeu();
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); meldung('Grafik wurde zurückgesetzt – Bild wird neu geladen', 'warnung'); });
  // nach iOS-Tab-Abwurf: letztes Dokument wiederherstellen
  try { const offen = sessionStorage.getItem('bildwerk-offen'); if (offen && db && !opts.test) weiterBearbeiten(offen); } catch {}
  if ('serviceWorker' in navigator && !opts.test && location.protocol === 'https:') navigator.serviceWorker.register('./sw.js').catch(() => {});
  return app;
}
