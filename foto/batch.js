// Bildwerk – Batch: jedes Bild bekommt seine EIGENE Analyse und Korrektur. Signaturen FEST (ARCH.md §4.10).
// Ein Bild nach dem anderen (Speicher): dekodieren → Arbeitsbild → Analyse → eigene Schritte → Export → Blob → freigeben.
import { ART, STUFE, neuesDokument, neuerSchritt, neueId, BildwerkFehler, FEHLER, ANALYSE_KANTE } from './typen.js';
import { dekodiere } from './app.js';
import { vorschlagAusRaendern } from './zuschnitt.js';

/** Kreative Regler, die eine Vorlage übernimmt (KEIN Ton/WB/Belichtung). */
export const KREATIV = Object.freeze(['klarheit', 'struktur', 'dynamik', 'saettigung', 'schaerfe', 'vignette', 'korn', 'hsl']);

/** Nur Looks + kreative Regler übernehmen, KEIN Ton/WB/Belichtung. */
export function vorlageAus(doc) {
  const looks = doc.schritte.filter((s) => s.art === ART.LOOK && !s.maske && s.an).map((s) => structuredClone(s));
  const effekte = doc.schritte.filter((s) => (s.art === ART.EFFEKTE || s.art === ART.SCHAERFE) && !s.maske && s.an && !s.auto).map((s) => structuredClone(s));
  const r = doc.schritte.find((s) => s.art === ART.REGLER && !s.maske);
  const regler = {};
  if (r) for (const k of KREATIV) if (r.params[k] != null) regler[k] = structuredClone(r.params[k]);
  return { looks, effekte, regler };
}

/** Eigene Auto-Korrektur je Bild (aus SEINER Analyse) + Vorlage. */
export function schritteFuer(analyse, vorlage, opts = {}) {
  let auto = opts.auto || [];
  if (!auto.length && analyse && opts.analyseModul) { try { auto = opts.analyseModul.autoSchritte(analyse) || []; } catch { auto = []; } }
  auto = auto.map((s) => ({ ...structuredClone(s), auto: true }));
  if (!vorlage) return auto;
  const aus = [...auto];
  if (Object.keys(vorlage.regler || {}).length) {
    let r = aus.find((s) => s.art === ART.REGLER && !s.maske);
    if (!r) { r = neuerSchritt(ART.REGLER); aus.push(r); }
    for (const [k, v] of Object.entries(vorlage.regler)) r.params[k] = structuredClone(v);
  }
  for (const s of [...(vorlage.looks || []), ...(vorlage.effekte || [])]) aus.push({ ...structuredClone(s), id: neueId('s') });
  return aus;
}

/**
 * Ehrlicher Rückfall ohne Analyse-Modul: Tonwerte je Kanal (0,1 % / 99,7 %) im kodierten Raum und Mitten je Kanal
 * auf 46 % (≈ 18 % Grau linear; Grauwelt in den Mitten). Ergebnis: ein 'auto-ton'-Schritt mit derselben Bedeutung wie
 * analyse.autoTonVorbereiten (schwarz/weiss kodiert, gamma = Exponent). bild: BildF32 (linear, klein reicht, z. B. 256).
 */
export function rueckfallSchritte(bild) {
  const { b, h, daten } = bild; const k = bild.kanaele || 4; const n = b * h; const F = 1024;
  const kod = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
  const hist = [new Uint32Array(F), new Uint32Array(F), new Uint32Array(F)];
  for (let i = 0; i < n; i++) for (let c = 0; c < 3; c++) { const v = kod(Math.min(1, Math.max(0, daten[i * k + c]))); hist[c][Math.min(F - 1, Math.floor(v * F))]++; }
  const quantil = (hh, p) => { let s = 0; const ziel = p * n; for (let i = 0; i < F; i++) { s += hh[i]; if (s >= ziel) return (i + 0.5) / F; } return 1; };
  const schwarz = [0, 0, 0], weiss = [1, 1, 1], gamma = [1, 1, 1];
  for (let c = 0; c < 3; c++) { schwarz[c] = Math.min(0.3, quantil(hist[c], 0.001)); weiss[c] = Math.max(schwarz[c] + 0.1, quantil(hist[c], 0.997)); }
  for (let c = 0; c < 3; c++) {
    const m = (quantil(hist[c], 0.5) - schwarz[c]) / (weiss[c] - schwarz[c]);
    gamma[c] = Math.min(2.5, Math.max(0.4, Math.log(0.46) / Math.log(Math.max(1e-3, Math.min(0.97, m)))));
  }
  return [neuerSchritt(ART.AUTO_TON, { schwarz, weiss, gamma, staerke: 1, ev: 0, wbGains: [1, 1, 1], verfahren: 'rueckfall-tonwerte' }, { name: 'Auto-Ton (einfach)' })];
}

/**
 * @param {object} app AppKern @param {File[]} dateien
 * @param {{vorlage?:object, signal?:AbortSignal, onBild?:(i:number, e:object)=>void, export?:object, mini?:number}} [opts]
 * @returns {Promise<{name:string,analyse:object|null,schritte:object[],geometrie:object,blob?:Blob,mini?:ImageBitmap,fehler?:string,ms:number}[]>}
 */
export async function batch(app, dateien, opts = {}) {
  const pipe = app.neuePipeline ? app.neuePipeline() : app.pipeline;
  const eigene = pipe !== app.pipeline;
  let analyseModul = null; try { analyseModul = await import('./analyse.js'); } catch {}
  const ergebnisse = [];
  try {
    for (let i = 0; i < dateien.length; i++) {
      if (opts.signal?.aborted) throw new BildwerkFehler(FEHLER.ABBRUCH, 'abgebrochen');
      const datei = dateien[i]; const t0 = performance.now(); let bitmap = null;
      const e = { name: (datei.name || `Foto-${i + 1}`).replace(/\.[^.]+$/, ''), analyse: null, schritte: [], geometrie: null };
      try {
        bitmap = await dekodiere(datei);
        await pipe.ladeQuelle(bitmap, {});
        const bild = await pipe.leseArbeitsbild({ kante: ANALYSE_KANTE });
        const kopie = { ...bild, daten: bild.daten.slice() };
        const [ra, an] = await Promise.allSettled([
          app.rechnen.rufe('raender', { bild: kopie }, { transfer: [kopie.daten.buffer], signal: opts.signal }),
          app.rechnen.rufe('analyse', { bild }, { transfer: [bild.daten.buffer], signal: opts.signal }),
        ]);
        if (an.status === 'fulfilled') e.analyse = an.value.analyse;
        let auto = [];
        if (e.analyse && analyseModul) { try { auto = analyseModul.autoSchritte(e.analyse) || []; } catch { auto = []; } }
        if (!auto.length) auto = rueckfallSchritte(await pipe.leseArbeitsbild({ kante: 256 }));
        e.schritte = schritteFuer(e.analyse, opts.vorlage, { auto });
        // PERSONEN: jedes Gesicht erkennen, der passenden gespeicherten Person zuordnen und automatisch auffrischen (unbekannte bleiben unberührt)
        if (opts.personen?.length) {
          try {
            const P = await import('./personen.js');
            const r = await P.batchPersonen(app, bitmap, { personen: opts.personen, aktiv: opts.personenAktiv, pipeline: pipe, signal: opts.signal, p: opts.personenParams });
            e.schritte.push(...r.schritte); e.personen = r.marken; if (r.hinweis) e.personenHinweis = r.hinweis; if (r.fehler?.length) e.personenFehler = r.fehler;
          } catch (err) { if (err?.code === FEHLER.ABBRUCH) throw err; e.personenHinweis = err?.text || err?.message || String(err); }
        }
        const doc = neuesDokument({ b: bitmap.width, h: bitmap.height, rasterId: 'batch', mime: datei.type, name: e.name });
        const geo = ra.status === 'fulfilled' ? vorschlagAusRaendern(ra.value, bitmap.width, bitmap.height) : null;
        if (geo) doc.geometrie.zuschnitt = geo;
        doc.schritte = e.schritte; doc.analyse = e.analyse; e.geometrie = doc.geometrie;
        const ex = { format: 'image/jpeg', qualitaet: 0.92, skala: 1, ...(opts.export || {}) };
        e.blob = await pipe.exportiere({ doc, vergleich: 'nachher', qualitaet: 'voll' }, { ...ex, signal: opts.signal, hochKachel: app.hochKachel });
        if (opts.mini !== 0) e.mini = await pipe.rendereMini({ doc, vergleich: 'nachher' }, opts.mini || 160);
      } catch (err) {
        if (err?.code === FEHLER.ABBRUCH) throw err;
        e.fehler = err?.text || err?.message || String(err);
      } finally { bitmap?.close?.(); }
      e.ms = performance.now() - t0; ergebnisse.push(e); opts.onBild?.(i, e);
      await new Promise((ok) => setTimeout(ok, 0));
    }
  } finally { if (eigene) pipe.zerstoere(); else pipe.entladeQuelle?.(); }
  return ergebnisse;
}

// ---------- ZIP (gespeichert, ohne Kompression – JPEG/PNG sind schon komprimiert) ----------
const CRC_T = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
export function crc32(u8) { let c = 0xffffffff; for (let i = 0; i < u8.length; i++) c = CRC_T[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
/** @param {{name:string,daten:Uint8Array}[]} dateien @returns {Blob} */
export function zip(dateien) {
  const teile = [], zentral = []; let ofs = 0; const enc = new TextEncoder();
  const d = new Date(); const zeit = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), datum = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  for (const f of dateien) {
    const name = enc.encode(f.name), crc = crc32(f.daten), n = f.daten.length;
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true);
    lh.setUint16(10, zeit, true); lh.setUint16(12, datum, true); lh.setUint32(14, crc, true); lh.setUint32(18, n, true); lh.setUint32(22, n, true);
    lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
    teile.push(lh.buffer, name, f.daten);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true);
    ch.setUint16(12, zeit, true); ch.setUint16(14, datum, true); ch.setUint32(16, crc, true); ch.setUint32(20, n, true); ch.setUint32(24, n, true);
    ch.setUint16(28, name.length, true); ch.setUint32(42, ofs, true);
    zentral.push(ch.buffer, name); ofs += 30 + name.length + n;
  }
  const zl = zentral.reduce((s, x) => s + (x.byteLength ?? x.length), 0);
  const ende = new DataView(new ArrayBuffer(22));
  ende.setUint32(0, 0x06054b50, true); ende.setUint16(8, dateien.length, true); ende.setUint16(10, dateien.length, true); ende.setUint32(12, zl, true); ende.setUint32(16, ofs, true);
  return new Blob([...teile, ...zentral, ende.buffer], { type: 'application/zip' });
}

/** Batch-Bedienung: Liste, Vorlage, Start/Abbrechen, Raster mit Mini-Vorschau, alle teilen / ZIP / einzeln öffnen. */
export function batchUI(container, opts) {
  const app = opts.app; let dateien = opts.dateien || []; let ergebnisse = []; let ac = null;
  const hatDoc = !!app.zustand().doc;
  container.innerHTML = `<p class="leise zahl"></p>
    <label class="schalter"><input type="checkbox" data-vorlage ${hatDoc ? '' : 'disabled'}><span>Look des offenen Bildes für alle (nur Look und kreative Regler)</span></label>
    <div data-t="personen" hidden><label class="schalter"><input type="checkbox" data-personen checked><span>Gesichter auffrischen: gespeicherte Personen automatisch erkennen</span></label><div class="zeile" data-t="pchips" role="group" aria-label="Personen"></div></div>
    <div class="fortschritt" hidden><div></div></div>
    <div class="batch-raster"></div>
    <div class="zeile"><button data-b="start" class="haupt">Start</button><button data-b="wahl">Fotos wählen</button></div>
    <div class="zeile"><button data-b="teilen" disabled>Alle teilen</button><button data-b="zip" disabled>Als ZIP</button></div>
    <p class="leise">Jedes Foto wird einzeln analysiert und bekommt seine eigene Korrektur. Tipp auf ein Bild öffnet es im Editor.</p>`;
  const raster = container.querySelector('.batch-raster'), bar = container.querySelector('.fortschritt');
  const wahl = document.createElement('input'); wahl.type = 'file'; wahl.accept = 'image/*,.heic,.heif'; wahl.multiple = true; wahl.hidden = true; container.appendChild(wahl);
  wahl.addEventListener('change', () => { dateien = [...wahl.files]; wahl.value = ''; ergebnisse = []; zeichne(); });
  // PERSONEN: Auswahl, welche gespeicherten Personen im Batch verwendet werden (Standard: alle; gleiche Wahl wie im Editor)
  let personen = [], PM = null;
  const zeichnePersonen = () => {
    const box = container.querySelector('[data-t="personen"]'); box.hidden = !personen.length; if (!personen.length || !PM) return;
    const ak = new Set(PM.aktiveIds(personen));
    box.querySelector('[data-t="pchips"]').innerHTML = personen.map((p) => `<button class="kachel chip" data-pa="${p.id}" aria-pressed="${ak.has(p.id)}">${esc(p.name)}</button>`).join('');
  };
  import('./personen.js').then(async (P) => { PM = P; personen = (await P.ladePersonen()).filter((p) => p.refs?.length); zeichnePersonen(); }).catch(() => {});
  function zeichne() {
    container.querySelector('.zahl').textContent = `${dateien.length} Foto${dateien.length === 1 ? '' : 's'}`;
    raster.innerHTML = dateien.map((f, i) => { const e = ergebnisse[i]; return `<button class="batch-bild" data-i="${i}" data-st="${e ? (e.fehler ? 'fehler' : 'fertig') : 'offen'}"><canvas></canvas><span>${e?.fehler ? 'Fehler' : esc(f.name || 'Foto')}</span>${e?.personen?.length && PM ? `<small data-t="marken" data-ok="${e.personen.some((m) => m.status === 'erkannt' && m.aufgefrischt !== false)}">${esc(PM.markenText(e.personen))}</small>` : e?.personenHinweis || e?.personenFehler ? `<small data-t="marken" data-ok="false">${esc(e.personenHinweis || 'Auffrischen nicht möglich')}</small>` : ''}</button>`; }).join('');
    ergebnisse.forEach((e, i) => { if (!e?.mini) return; const c = raster.querySelector(`[data-i="${i}"] canvas`); c.width = e.mini.width; c.height = e.mini.height; c.getContext('2d').drawImage(e.mini, 0, 0); });
    const fertig = ergebnisse.filter((e) => e?.blob).length;
    container.querySelector('[data-b="teilen"]').disabled = !fertig; container.querySelector('[data-b="zip"]').disabled = !fertig;
  }
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const dateiName = (e) => `${e.name}-bildwerk.jpg`;
  container.addEventListener('click', async (ev) => {
    const b = ev.target.closest('[data-b]'); const bild = ev.target.closest('.batch-bild');
    if (bild) {
      const i = Number(bild.dataset.i); const e = ergebnisse[i]; if (!e || e.fehler) return;
      await app.oeffne(dateien[i], { name: dateien[i].name });
      app.aendere((d) => { d.schritte = e.schritte.map((s) => structuredClone(s)); d.geometrie = structuredClone(e.geometrie); return d; }, { name: 'Batch-Korrektur' });
      return;
    }
    const pc = ev.target.closest('[data-pa]');
    if (pc && PM) { const aus = PM.inaktive(); aus.has(pc.dataset.pa) ? aus.delete(pc.dataset.pa) : aus.add(pc.dataset.pa); PM.setzeInaktive(aus); zeichnePersonen(); return; }
    if (!b) return;
    if (b.dataset.b === 'wahl') wahl.click();
    if (b.dataset.b === 'start') {
      if (ac) { ac.abort(); return; }
      if (!dateien.length) { wahl.click(); return; }
      ac = new AbortController(); b.textContent = 'Abbrechen'; bar.hidden = false; ergebnisse = []; zeichne();
      const vorlage = container.querySelector('[data-vorlage]').checked && app.zustand().doc ? vorlageAus(app.zustand().doc) : undefined;
      try {
        let pHinweis = '', mitPersonen = personen.length && PM && container.querySelector('[data-personen]')?.checked;
        // Gesichts-Modelle fehlen (z. B. iOS hat den Speicher geräumt): vorher sagen, statt still nichts zu tun
        if (mitPersonen && !(await PM.modelleDa(app))) { mitPersonen = false; pHinweis = ' – Gesichter nicht aufgefrischt: die Gesichts-Modelle fehlen (einmal im Editor unter Retusche › Gesicht auffrischen laden)'; app.meldung('Gesichter auffrischen nicht möglich: die Gesichts-Modelle fehlen (einmal im Editor unter Retusche › Gesicht auffrischen laden)', 'warnung'); }
        await batch(app, dateien, { vorlage, personen: mitPersonen ? personen : undefined, personenAktiv: mitPersonen ? PM.aktiveIds(personen) : undefined, signal: ac.signal, onBild: (i, e) => { ergebnisse[i] = e; bar.firstElementChild.style.width = ((i + 1) / dateien.length * 100) + '%'; zeichne(); } });
        app.meldung(`${ergebnisse.filter((e) => e.blob).length} von ${dateien.length} Fotos fertig${pHinweis}`, pHinweis ? 'warnung' : 'info');
      } catch (err) { if (err?.code !== FEHLER.ABBRUCH) app.meldung(err.text || err.message, 'fehler'); }
      finally { ac = null; b.textContent = 'Start'; bar.hidden = true; }
    }
    if (b.dataset.b === 'teilen') {
      const files = ergebnisse.filter((e) => e?.blob).map((e) => new File([e.blob], dateiName(e), { type: e.blob.type }));
      if (navigator.canShare?.({ files })) { try { await navigator.share({ files }); } catch (err) { if (err?.name !== 'AbortError') app.meldung('Teilen nicht möglich', 'fehler'); } }
      else for (const f of files) await app.teile(f, f.name);
    }
    if (b.dataset.b === 'zip') {
      const liste = []; for (const e of ergebnisse.filter((x) => x?.blob)) liste.push({ name: dateiName(e), daten: new Uint8Array(await e.blob.arrayBuffer()) });
      await app.teile(zip(liste), 'bildwerk-batch.zip');
    }
  });
  zeichne();
  return { setze(p) { if (p?.dateien) { dateien = p.dateien; ergebnisse = []; zeichne(); } }, zerstoere() { ac?.abort(); for (const e of ergebnisse) e?.mini?.close?.(); } };
}
export { STUFE };
