// Bildwerk – Personen für „Gesicht auffrischen“: mehrere gespeicherte Personen (Name + 1–5 Referenzfotos + Merkmale).
// Jedes Gesicht im Foto wird per Merkmal-Vergleich (SFace, KONZEPT 3.6) der passenden Person zugeordnet – im Editor und
// automatisch im Batch. REGEL: Fotos einer Person werden NUR auf ein Gesicht gelegt, das der Vergleich als diese Person
// erkennt; unbekannte Gesichter bleiben unberührt; kein Raten von Geschlecht/Alter. Alles bleibt auf dem Gerät (IndexedDB).
// Aufbau: (1) reine Rechnung (Node-Tests), (2) Speicher, (3) Erkennen/Anwenden (Foto + Batch), (4) Bedienung.
import { IDENTITAET, FEHLER, BildwerkFehler, ART, neueId } from './typen.js';
import { vergleiche, urteilListe, referenzHinzufuegen, ladeReferenzen, loescheReferenz, gesichtsMerkmal, frischeAuf } from './hoch.js';

/**
 * marge: Abstand (Kosinus) zur zweitbesten Person, sonst „unklar“ (nicht raten).
 * eigenAbstand: ein Gesicht darf höchstens so weit unter der Ähnlichkeit der Fotos dieser Person UNTEREINANDER liegen
 * (ab 2 Fotos), mindestens eigenAbstand, bei uneinheitlichen Fotos bis (1 − Eigen-Ähnlichkeit): Eigen 0,94 → Boden 0,84,
 * Eigen 0,72 → Boden 0,44. Zusätzlich zur festen Schwelle (IDENTITAET, für echte Gesichter geeicht). Gemessen: LOG.md (v0.4 Personen).
 */
export const ZUORDNUNG = Object.freeze({ marge: 0.10, eigenAbstand: 0.10, maxFotos: 5 });
const fehler = (c, t) => new BildwerkFehler(c, t);
const komma = (v) => (v == null ? '–' : v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ================================================================ (1) reine Rechnung
/** Vergleich eines Gesichts-Merkmals mit allen Fotos einer Person → { wert, erlaubt, grund, kos }. */
export function personWert(m, person) {
  const kos = (person?.refs || []).map((r) => vergleiche(m, r.merkmal));
  if (!kos.length) return { kos, wert: -1, erlaubt: false, grund: 'Keine Fotos' };
  const u = urteilListe(kos), s = [...kos].sort((a, b) => a - b), wert = u.urteil.erlaubt ? u.urteil.median : s[Math.floor(s.length / 2)];
  const e = eigenAehnlichkeit(person), boden = e == null ? -1 : e - Math.max(ZUORDNUNG.eigenAbstand, 1 - e);
  if (u.urteil.erlaubt && wert < boden) return { kos, wert, erlaubt: false, grund: 'Weicht zu stark von den gespeicherten Fotos ab', boden };
  return { kos, wert, erlaubt: u.urteil.erlaubt, grund: u.urteil.grund, boden };
}
/** Median der Ähnlichkeit der Fotos einer Person untereinander (null bei < 2 Fotos). */
export function eigenAehnlichkeit(person) {
  const r = person?.refs || []; if (r.length < 2) return null;
  const k = []; for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) k.push(vergleiche(r[i].merkmal, r[j].merkmal));
  k.sort((a, b) => a - b); return k[Math.floor(k.length / 2)];
}

/**
 * Zuordnung Gesichter → Personen. merkmale[i] = Float32Array(128) oder null (Gesicht zu klein). Eine Person höchstens
 * einmal je Foto; ein Gesicht nur, wenn das Identitäts-Urteil besteht UND die zweitbeste Person ≥ marge darunter liegt.
 * → [{ gesicht, person, name, wert, zweit, status: 'erkannt'|'unbekannt'|'unklar'|'klein', werte }]
 */
export function ordneZu(merkmale, personen, opts = {}) {
  const marge = opts.marge ?? ZUORDNUNG.marge, aktiv = opts.aktiv ? new Set(opts.aktiv) : null;
  const P = (personen || []).filter((p) => p.refs?.length && (!aktiv || aktiv.has(p.id)));
  const W = merkmale.map((m) => (m ? P.map((p) => personWert(m, p)) : null));
  const aus = merkmale.map((m, i) => ({ gesicht: i, person: null, name: '', wert: null, zweit: null, status: m ? 'unbekannt' : 'klein',
    werte: W[i] ? Object.fromEntries(P.map((p, j) => [p.id, Math.round(W[i][j].wert * 1000) / 1000])) : {} }));
  const paare = []; W.forEach((w, i) => w?.forEach((x, j) => { if (x.erlaubt) paare.push([x.wert, i, j]); }));
  paare.sort((a, b) => b[0] - a[0]);
  const belegt = new Map();   // Person-Index → Gesicht
  for (const [v, i, j] of paare) {
    if (aus[i].person || aus[i].status === 'unklar' || aus[i].status === 'vergeben') continue;
    const zweit = Math.max(-1, ...W[i].filter((_, k) => k !== j).map((x) => x.wert));
    // beste Person schon einem anderen Gesicht zugeordnet (eine Person höchstens einmal je Foto) → eigener Status, kein Ausweichen auf andere
    if (belegt.has(j) && v - zweit >= marge) { Object.assign(aus[i], { status: 'vergeben', name: P[j].name, wert: v, zweit, bei: belegt.get(j) }); continue; }
    if (belegt.has(j) || v - zweit < marge) { aus[i].status = 'unklar'; aus[i].zweit = zweit; continue; }
    Object.assign(aus[i], { person: P[j].id, name: P[j].name, wert: v, zweit, status: 'erkannt' }); belegt.set(j, i);
  }
  return aus;
}

/** Hand-Zuordnung: nur erlaubt, wenn der Vergleich passt. */
export function pruefeHand(m, person) {
  if (!m) return { erlaubt: false, grund: 'Gesicht zu klein zum Prüfen' };
  const w = personWert(m, person);
  return w.erlaubt ? { erlaubt: true, wert: w.wert, grund: '' } : { erlaubt: false, wert: w.wert, grund: `passt nicht zu ${person.name}` };
}

// ================================================================ (2) Speicher (eigene IndexedDB 'bildwerk-personen'; Fotos im Raster-Speicher der App)
const DBN = 'bildwerk-personen'; let dbP = null; const ersatz = new Map();
function db() {
  if (dbP) return dbP;
  dbP = new Promise((ok) => {
    if (typeof indexedDB === 'undefined') { ok(null); return; }
    const r = indexedDB.open(DBN, 1);
    r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains('personen')) r.result.createObjectStore('personen', { keyPath: 'id' }); };
    r.onsuccess = () => ok(r.result); r.onerror = () => ok(null); r.onblocked = () => ok(null);
  });
  return dbP;
}
async function idb(modus, f) {
  const d = await db(); if (!d) return f(null);
  return new Promise((ok, fehl) => { const t = d.transaction('personen', modus), q = f(t.objectStore('personen')); t.oncomplete = () => ok(q?.result); t.onerror = () => fehl(t.error); });
}
const speichere = async (p) => { ersatz.set(p.id, p); await idb('readwrite', (s) => s?.put(p)).catch(() => {}); merkeDa(); return p; };
// Merker für app.js: gibt es Personen mit Fotos? (Dann lohnt das stille Prüfen nach dem Öffnen; sonst wird nichts geladen.)
const DA_KEY = 'bildwerk-personen-da', AUTO_KEY = 'bildwerk-personen-auto';
async function merkeDa() {
  const alle = (await idb('readonly', (s) => (s ? s.getAll() : null)).catch(() => null)) || [...ersatz.values()];
  try { alle.some((p) => p.refs?.length) ? localStorage.setItem(DA_KEY, '1') : localStorage.removeItem(DA_KEY); } catch {}
}
/** Automatisch auffrischen beim Öffnen (Standard an; Schalter unter „Personen verwalten“). */
export function autoAn() { try { return localStorage.getItem(AUTO_KEY) !== '0'; } catch { return true; } }
export function setzeAuto(an) { try { localStorage.setItem(AUTO_KEY, an ? '1' : '0'); } catch {} }

/** Alle Personen (älteste zuerst). Alte Einzel-Referenzen (vor den Personen) werden einmal zu „Person 1“. */
export async function ladePersonen() {
  let alle = (await idb('readonly', (s) => (s ? s.getAll() : null)).catch(() => null)) || [...ersatz.values()];
  if (!alle.length) {
    const alt = await ladeReferenzen().catch(() => []);
    if (alt.length) {
      const p = await speichere({ id: neueId('person'), name: 'Person 1', refs: alt.slice(0, ZUORDNUNG.maxFotos), erstellt: Date.now() });
      for (const r of alt) await loescheReferenz(null, { ...r, rasterId: null }).catch(() => {});   // Eintrag weg, Foto bleibt (gehört jetzt der Person)
      alle = [p];
    }
  }
  return alle.sort((a, b) => a.erstellt - b.erstellt);
}
export async function neuePerson(name) {
  const n = (await ladePersonen()).length;
  return speichere({ id: neueId('person'), name: (name || '').trim() || `Person ${n + 1}`, refs: [], erstellt: Date.now() });
}
export async function umbenenne(id, name) {
  const p = (await ladePersonen()).find((x) => x.id === id); if (!p) return null;
  p.name = (name || '').trim() || p.name; return speichere(p);
}
export async function loeschePerson(app, id) {
  const p = (await ladePersonen()).find((x) => x.id === id); if (!p) return;
  for (const r of p.refs) if (r.rasterId) await app?.raster?.loesche(r.rasterId).catch(() => {});
  ersatz.delete(id); await idb('readwrite', (s) => s?.delete(id)).catch(() => {}); await merkeDa();
}
export async function loescheAllePersonen(app) { for (const p of await ladePersonen()) await loeschePerson(app, p.id); }
export async function loescheFoto(app, personId, refId) {
  const p = (await ladePersonen()).find((x) => x.id === personId); if (!p) return null;
  const r = p.refs.find((x) => x.id === refId); if (r?.rasterId) await app?.raster?.loesche(r.rasterId).catch(() => {});
  p.refs = p.refs.filter((x) => x.id !== refId); return speichere(p);
}

/**
 * Foto zu einer Person hinzufügen. Abgelehnt, wenn (a) mehrere ähnlich große Gesichter, (b) es nicht zu den schon
 * gespeicherten Fotos DIESER Person passt, (c) es zu einer ANDEREN gespeicherten Person passt.
 */
export async function fotoHinzufuegen(app, personId, datei) {
  const alle = await ladePersonen(), p = alle.find((x) => x.id === personId);
  if (!p) throw fehler(FEHLER.UNBEKANNT, 'Person nicht gefunden');
  if (p.refs.length >= ZUORDNUNG.maxFotos) throw fehler(FEHLER.UNBEKANNT, `Höchstens ${ZUORDNUNG.maxFotos} Fotos je Person`);
  const ref = await referenzHinzufuegen(app, datei, { speichern: false, einzeln: true });
  const weg = async (text) => { await app.raster?.loesche(ref.rasterId).catch(() => {}); throw fehler(FEHLER.FREMDE_PERSON, text); };
  const wp = p.refs.length ? personWert(ref.merkmal, p) : null;
  if (wp && !wp.erlaubt) await weg(`Passt nicht zu ${p.name} (Ähnlichkeit ${komma(wp.wert)}) – nicht gespeichert`);
  // Gleiche Person unter zwei Namen verhindern: passt das Foto zu einer ANDEREN Person (und nicht deutlich besser zu dieser) → ablehnen
  for (const o of alle) { if (o.id === p.id || !o.refs.length) continue; const wo = personWert(ref.merkmal, o);
    if (wo.erlaubt && (!wp || wo.wert > wp.wert - ZUORDNUNG.marge)) await weg(`Das Foto zeigt ${o.name} – bitte dort ergänzen`); }
  p.refs.push(ref); await speichere(p); return ref;
}

// Auswahl, welche Personen verwendet werden (Standard: alle). Gemerkt je Gerät (Bequemlichkeit, kein Pflicht-Zustand).
const AUS_KEY = 'bildwerk-personen-aus';
export function inaktive() { try { return new Set(JSON.parse(localStorage.getItem(AUS_KEY) || '[]')); } catch { return new Set(); } }
export function setzeInaktive(set) { try { localStorage.setItem(AUS_KEY, JSON.stringify([...set])); } catch {} }
export const aktiveIds = (personen) => { const aus = inaktive(); return personen.filter((p) => !aus.has(p.id)).map((p) => p.id); };

// ================================================================ (3) Erkennen + Anwenden
async function imCache(app, id) { try { const s = await app.ki.rufe('status', {}); return !!s.ids?.[id]?.imCache; } catch { return false; } }
export async function modelleDa(app) { return (await imCache(app, 'gesicht-landmarken')) && (await imCache(app, 'merkmal')); }

/** Gesichter finden (oder übergebene nehmen) und je Gesicht das Merkmal rechnen (null = zu klein). bmp: ImageBitmap der Quelle. */
export async function erkenneGesichter(app, { bmp, b, h, gesichter = null }) {
  let gs = gesichter?.length && gesichter[0].landmarken?.length >= 478 * 3 ? gesichter : null;
  if (!gs) { const k = await createImageBitmap(bmp); gs = (await app.ki.rufe('gesichter', { bild: k }, { transfer: [k] })) || []; }
  const merkmale = [];
  for (const g of gs) {
    const p5 = g.punkte5, aug = p5 ? Math.hypot((p5[2] - p5[0]) * b, (p5[3] - p5[1]) * h) : 0;
    merkmale.push(aug >= IDENTITAET.mindestAugenPx ? await gesichtsMerkmal(app.ki, bmp, g) : null);
  }
  return { gesichter: gs, merkmale };
}

/**
 * Auffrischen aller zugeordneten Gesichter (zuordnung[i].person, nicht .aus). Jede Rechnung prüft die Identität in
 * hoch.frischeAuf noch einmal (vorher und nachher). Fehler je Gesicht stoppen nicht die anderen.
 * → { schritte: Schritt[], fehler: [{name, text}] }
 */
export async function frischeGesichterAuf(app, { bmp, b, h, gesichter, merkmale, zuordnung, personen, p = {}, pipeline, signal, onFortschritt }) {
  const schritte = [], fehlerListe = [], liste = zuordnung.filter((z) => z.person && !z.aus);
  for (const [n, z] of liste.entries()) {
    const person = personen.find((x) => x.id === z.person); if (!person?.refs?.length) continue;
    try {
      const s = await frischeAuf(app, gesichter[z.gesicht], person.refs, { ...p, signal, pipeline, quelle: { bmp, b, h, merkmal: merkmale[z.gesicht] },
        onFortschritt: (f, t) => onFortschritt?.((n + f) / liste.length, `${person.name}: ${t}`) });
      s.params.person = { id: person.id, name: person.name }; s.name = `Auffrischen ${person.name}`;
      schritte.push(s);
    } catch (e) { if (e?.code === FEHLER.ABBRUCH) throw e; fehlerListe.push({ name: person.name, text: e?.text || e?.message || String(e) }); }
  }
  return { schritte, fehler: fehlerListe };
}

/** Batch: Gesichter eines Bildes erkennen, Personen zuordnen, automatisch auffrischen. → { schritte, marken } */
export async function batchPersonen(app, bitmap, { personen, aktiv = null, pipeline, signal, p } = {}) {
  const P = (personen || []).filter((x) => x.refs?.length && (!aktiv || aktiv.includes(x.id)));
  if (!P.length) return { schritte: [], marken: [] };
  if (!(await modelleDa(app))) return { schritte: [], marken: [], hinweis: 'Gesichts-Modelle nicht geladen' };
  const b = bitmap.width, h = bitmap.height;
  const { gesichter, merkmale } = await erkenneGesichter(app, { bmp: bitmap, b, h });
  const zuordnung = ordneZu(merkmale, P);
  const r = await frischeGesichterAuf(app, { bmp: bitmap, b, h, gesichter, merkmale, zuordnung, personen: P, p, pipeline, signal });
  const fertig = new Set(r.schritte.map((s) => s.params.person.id));
  const marken = zuordnung.map((z) => ({ name: z.name, status: z.status, wert: z.wert, aufgefrischt: !!(z.person && fertig.has(z.person)), box: gesichter[z.gesicht].box }));
  return { schritte: r.schritte, marken, fehler: r.fehler };
}
/**
 * Automatik im Editor: nach dem Öffnen (app.js, wenn die Modelle schon im Cache liegen) und beim Öffnen des Werkzeugs.
 * Jedes Gesicht wird der passenden aktiven Person zugeordnet und sofort aufgefrischt (ein Undo-Schritt), ohne Antippen.
 * Einmal je Foto; Personen, die schon einen Auffrischen-Schritt im Foto haben, werden übersprungen. Unbekannte bleiben unberührt.
 * → Promise<{ schritte, fehler, zuordnung } | null>
 */
const autoLaeufe = new Map();
export const STANDARD = Object.freeze({ staerke: 0.6, augen: 1, haut: 0.5, haare: 0.8 });
export function autoLaeuft(docId) { return autoLaeufe.get(docId)?.offen === true; }
export function autoAuffrischen(app, { docId, p = STANDARD, onFortschritt, erneut = false, ausschluss = null } = {}) {
  const doc = app.zustand().doc; if (!doc || doc.id !== docId || !autoAn()) return Promise.resolve(null);
  const alt = autoLaeufe.get(docId); if (alt && (alt.offen || !erneut)) return alt.p;   // erneut: nach neuen Fotos/Personen
  const eintrag = { offen: true, p: null }; autoLaeufe.set(docId, eintrag);
  const ac = new AbortController(), ab = app.on?.('zustand', () => { if (app.zustand().doc?.id !== docId) ac.abort(); });
  eintrag.p = (async () => {
    const alle = (await ladePersonen()).filter((x) => x.refs?.length), ak = new Set(aktiveIds(alle)), P = alle.filter((x) => ak.has(x.id));
    const nichtBereit = () => { if (autoLaeufe.get(docId) === eintrag) autoLaeufe.delete(docId); return null; };   // später noch einmal versuchen
    if (!P.length || !(await modelleDa(app))) return nichtBereit();
    const bmp = app.quelleBitmap?.(); if (!bmp || app.zustand().doc?.id !== docId) return nichtBereit();
    const vorhanden = new Set((doc.schritte || []).filter((s) => s.art === ART.AUFFRISCHEN && s.params?.person).map((s) => s.params.person.id));
    const b = doc.quelle.b, h = doc.quelle.h, r = await erkenneGesichter(app, { bmp, b, h, gesichter: app.zustand().doc?.gesichter });
    if (app.zustand().doc?.id !== docId) return null;
    if (r.gesichter.length && !app.zustand().doc.gesichter?.length) app.setzeGesichter?.(r.gesichter);
    // ausschluss: Personen, die im Werkzeug für dieses Foto auf „Aus“ stehen – die Automatik übergeht sie
    const zuordnung = ordneZu(r.merkmale, P).map((z) => (z.person && (vorhanden.has(z.person) || ausschluss?.has(z.person)) ? { ...z, aus: true } : z));
    if (!zuordnung.some((z) => z.person && !z.aus)) return { schritte: [], fehler: [], zuordnung };
    const f = await frischeGesichterAuf(app, { bmp, b, h, gesichter: r.gesichter, merkmale: r.merkmale, zuordnung, personen: P, p, signal: ac.signal, onFortschritt });
    if (app.zustand().doc?.id !== docId) return null;
    if (f.schritte.length) {
      for (const s of f.schritte) s.params.automatisch = true;
      app.aendere((dd) => { const neu = new Set(f.schritte.map((s) => s.params.person.id)); dd.schritte = dd.schritte.filter((s) => !(s.art === ART.AUFFRISCHEN && neu.has(s.params?.person?.id))); dd.schritte.push(...f.schritte); return dd; },
        { name: `Auffrischen automatisch (${f.schritte.map((s) => s.params.person.name).join(', ')})` });
    }
    return { ...f, zuordnung };
  })().catch((e) => { if (e?.code !== FEHLER.ABBRUCH) console.warn('Personen automatisch', e); return null; })
    .finally(() => { eintrag.offen = false; try { ab?.(); } catch {} });
  return eintrag.p;
}

/** Kurztext der Marken („Alex ✓ · unbekannt“). */
//   Erkannte zuerst (von links nach rechts), alle anderen Gesichter kurz zusammengefasst – so verdrängt „unbekannt“ nie einen Namen.
export const markenText = (marken) => {
  const m = marken || [], x = (a) => a.box?.x ?? 0;
  const erk = m.filter((a) => a.status === 'erkannt').sort((a, b) => x(a) - x(b)).map((a) => `${a.name} ${a.aufgefrischt === false ? '–' : '✓'}`);
  const rest = m.length - erk.length;
  if (!rest) return erk.join(' · ');
  return erk.length ? `${erk.join(' · ')} · +${rest} unbekannt` : rest > 1 ? `${rest} unbekannt` : m[0].status === 'unklar' ? 'unklar' : 'unbekannt';
};

// ================================================================ (4) Bedienung (Retusche → Gesicht auffrischen)
const STIL = `.pers .pchips{display:flex;gap:8px;flex-wrap:wrap}.pers .pg{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-height:44px;border-bottom:1px solid var(--linie,#33363c)}
.pers .pg b{font-weight:600}.pers .pg .wer{flex:1 1 120px}.pers select,.pers input[type=text]{min-height:44px;border-radius:10px;border:1px solid var(--linie,#33363c);background:var(--flaeche2,#202226);color:inherit;font:inherit;padding:0 10px}
.pers input[type=text]{flex:1 1 120px;min-width:0}.pers details{border-top:1px solid var(--linie,#33363c)}.pers summary{min-height:44px;display:flex;align-items:center;cursor:pointer;color:var(--leise,#9a9890)}
.pers .pv{display:flex;flex-direction:column;gap:6px;padding:6px 0;border-bottom:1px solid var(--linie,#33363c)}.pers .hinweis{color:#e08b80;font-size:13px;margin:0}`;
const MARKE = 'position:absolute;transform:translate(-50%,-100%);padding:2px 8px;border-radius:9px;font:600 12px/1.4 system-ui,-apple-system,sans-serif;white-space:nowrap;pointer-events:none;box-shadow:0 1px 3px rgba(0,0,0,.5)';

/** ctx = { app, status, balken, modellFrage, imCache } (aus hoch.retuscheUI). Liefert { zerstoere }. */
export function personenUI(teil, ctx) {
  const { app, status, balken, modellFrage } = ctx, d = teil.ownerDocument;
  const z = { personen: [], gesichter: [], merkmale: [], zu: [], hand: new Map(), aus: new Set(), p: { staerke: 60, augen: 100, haut: 50, haare: 80 }, bereit: false, docId: null, loeschen: null, laeuft: false };
  const st = d.createElement('style'); st.textContent = STIL; teil.appendChild(st);
  const box = d.createElement('div'); box.className = 'pers'; box.style.display = 'contents'; teil.appendChild(box);
  box.innerHTML = `<p class="leise">Frischt Gesichter mit eigenen Fotos auf. Jede Person wird nur auf ihr eigenes Gesicht gelegt, unbekannte Gesichter bleiben unberührt. Alles bleibt auf diesem Gerät.</p>
<div class="pchips" data-t="personen" role="group" aria-label="Personen"></div>
<div data-t="gesichter"></div>
<p class="leise" data-t="urteil"></p>
${['staerke:Stärke', 'augen:Augen', 'haut:Haut', 'haare:Haare'].map((x) => { const [k, t] = x.split(':'); return `<label><span>${t}</span><input type="range" min="0" max="100" step="1" data-p="${k}" value="${z.p[k]}" aria-label="${t}"></label>`; }).join('')}
<div class="zeile"><button class="haupt" data-a="los" style="flex:1" disabled>Auffrischen</button><button data-a="stop" hidden>Abbrechen</button></div>
<div class="balken" hidden><i></i></div><p class="status" aria-live="polite"></p>
<details data-t="verwalten"><summary>Personen verwalten</summary><div class="zeile"><span class="wer leise" style="flex:1">Beim Öffnen automatisch auffrischen</span><button type="button" data-a="auto" aria-pressed="${autoAn()}">${autoAn() ? 'An' : 'Aus'}</button></div><div data-t="liste"></div>
<div class="zeile"><button data-a="neu" type="button">Person hinzufügen</button><button data-a="alleweg" type="button">Alle löschen</button></div></details>
<input type="file" accept="image/*" multiple hidden data-t="datei">`;
  const $ = (s) => box.querySelector(s), datei = $('[data-t="datei"]'), urteilT = $('[data-t="urteil"]'), los = $('[data-a="los"]');
  let ac = null, weg = false, dateiZiel = null; const url = new Map();
  // Marken auf dem Bild (über der Bildfläche, ohne Eingaben)
  const ebene = d.createElement('div'); ebene.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:5'; ebene.dataset.t = 'personen-marken';
  app.bildflaeche?.appendChild(ebene);
  let zsMod = null; import('./zuschnitt.js').then((m) => { zsMod = m; zeichneMarken(); }).catch(() => {});

  const docSchritte = () => (app.zustand().doc?.schritte || []).filter((s) => s.art === ART.AUFFRISCHEN && s.params?.person);
  const schrittFuer = (pid) => docSchritte().find((s) => s.params.person.id === pid);
  const aktiv = () => new Set(aktiveIds(z.personen));
  function ordne() {
    const zu = ordneZu(z.merkmale, z.personen, { aktiv: aktiv() });
    for (const [i, pid] of z.hand) {   // Hand-Zuordnung (nur gespeichert, wenn der Vergleich gepasst hat)
      const p = z.personen.find((x) => x.id === pid); if (!p || zu.some((x) => x.person === pid)) continue;
      const h = pruefeHand(z.merkmale[i], p); if (h.erlaubt) Object.assign(zu[i], { person: pid, name: p.name, wert: h.wert, status: 'erkannt', hand: true });
    }
    // Abgewählte Person, die in diesem Foto schon aufgefrischt ist: Zeile zeigt den Schritt weiter (mit An/Aus) statt „bleibt unberührt“
    const ak = aktiv(), alle = docSchritte().filter((s) => !ak.has(s.params.person.id) && !zu.some((x) => x.person === s.params.person.id));
    if (alle.length) {
      const voll = ordneZu(z.merkmale, z.personen);
      for (const s of alle) { const v = voll.find((x) => x.person === s.params.person.id); if (v && !zu[v.gesicht].person) Object.assign(zu[v.gesicht], { person: v.person, name: v.name, wert: v.wert, status: 'erkannt', abgewaehlt: true }); }
    }
    for (const x of zu) x.aus = z.aus.has(x.gesicht);
    z.zu = zu;
  }
  function zeichneMarken() {
    if (weg) return;   // nach zerstoere() (Reiter/Foto gewechselt, Rechnung noch unterwegs) nichts mehr zeichnen
    ebene.innerHTML = ''; const doc = app.zustand().doc; if (!doc || !zsMod || !z.gesichter.length) return;
    const an = app.ansicht?.(); if (!an?.cssB) return;
    z.zu.forEach((x) => {
      const g = z.gesichter[x.gesicht]; if (!g) return;
      const s = schrittFuer(x.person), ok = x.status === 'erkannt' && !x.aus && (!s || s.an !== false);
      const p = zsMod.quelleZuBildschirm({ x: g.box.x + g.box.b / 2, y: g.box.y }, an, doc.geometrie, doc.quelle.b, doc.quelle.h);
      const m = d.createElement('span'); m.className = 'pmarke'; m.style.cssText = `${MARKE};left:${p.x}px;top:${Math.max(18, p.y - 4)}px;background:${ok ? 'rgba(40,70,35,.88)' : 'rgba(20,20,22,.78)'};color:${ok ? '#bfe3ad' : '#c9c6bf'}`;
      m.textContent = x.status === 'erkannt' ? `${x.name} ${ok ? '✓' : '(aus)'}` : x.status === 'vergeben' ? `${x.name} doppelt` : x.status === 'unklar' ? 'unklar' : x.status === 'klein' ? 'zu klein' : 'unbekannt';
      ebene.appendChild(m);
    });
  }
  let letzteAnsicht = ''; const schleife = () => { if (weg) return; const a = JSON.stringify(app.ansicht?.() || {}); if (a !== letzteAnsicht) { letzteAnsicht = a; zeichneMarken(); } requestAnimationFrame(schleife); };
  requestAnimationFrame(schleife);

  function zeichne() {
    if (weg) return;
    const ak = aktiv();
    $('[data-t="personen"]').innerHTML = z.personen.map((p) => `<button class="kachel chip" data-pa="${p.id}" aria-pressed="${ak.has(p.id)}">${esc(p.name)}</button>`).join('') + '<button data-a="neu" type="button">+ Person</button>';
    const gb = $('[data-t="gesichter"]');
    if (!z.bereit) gb.innerHTML = '';
    else if (!z.gesichter.length) gb.innerHTML = '<p class="leise">Kein Gesicht im Foto erkannt.</p>';
    else gb.innerHTML = z.zu.map((x, i) => {
      const s = schrittFuer(x.person), an = !x.aus && (!s || s.an !== false);
      const rechts = x.status === 'erkannt'
        ? `<button data-aus="${i}" aria-pressed="${an}" aria-label="${esc(x.name)} für dieses Foto ${an ? 'aus' : 'an'}">${an ? 'An' : 'Aus'}</button>`
        : (x.status === 'klein' ? '' : `<select data-hand="${i}" aria-label="Gesicht ${i + 1} zuordnen"><option value="">Zuordnen …</option>${z.personen.filter((p) => p.refs.length).map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select>`);
      const wer = x.status === 'erkannt' ? `<b class="ok">${esc(x.name)} ✓</b> <small class="leise">${komma(x.wert)}${s ? ' · aufgefrischt' : ''}${x.abgewaehlt ? ' (abgewählt)' : ''}${x.hand ? ' · von Hand' : ''}</small>`
        : x.status === 'vergeben' ? `<span class="leise">${esc(x.name)} ist schon Gesicht ${x.bei + 1} – nur einmal je Foto</span>`
        : x.status === 'unklar' ? '<span class="leise">unklar – ähnelt mehreren Personen</span>' : x.status === 'klein' ? '<span class="leise">zu klein zum Prüfen</span>' : '<span class="leise">unbekannt – bleibt unberührt</span>';
      return `<div class="pg" data-g="${i}"><span>Gesicht ${i + 1}</span><span class="wer">${wer}</span>${rechts}</div>`;
    }).join('') + '<p class="hinweis" data-t="hand-hinweis"></p>';
    const n = z.zu.filter((x) => x.person && !x.aus && !x.abgewaehlt).length;
    los.disabled = !n || z.laeuft; los.textContent = n > 1 ? `Auffrischen (${n} Gesichter)` : 'Auffrischen';
    urteilT.innerHTML = !z.bereit ? urteilT.innerHTML : !z.personen.length ? 'Noch keine Personen gespeichert. „+ Person“ und 1–5 scharfe Fotos von vorn wählen.'
      : n ? `<span class="ok">Dieselbe Person erkannt: ${esc(z.zu.filter((x) => x.person && !x.aus).map((x) => x.name).join(', '))}.</span> Jedes Gesicht bekommt nur die Fotos seiner Person.` : z.gesichter.length ? '<span class="nein-t">Kein Gesicht passt zu einer gewählten Person.</span> Auffrischen ist gesperrt.' : '';
    zeichneListe(); zeichneMarken();
  }
  function zeichneListe() {
    if (weg) return;   // sonst Vorschaubilder mit schon widerrufenen Adressen (ERR_FILE_NOT_FOUND)
    const L = $('[data-t="liste"]');
    L.innerHTML = z.personen.map((p) => `<div class="pv" data-id="${p.id}"><div class="zeile"><input type="text" value="${esc(p.name)}" data-name="${p.id}" aria-label="Name" maxlength="40"></div>
<div class="refs">${p.refs.map((r) => `<div class="ref" data-r="${r.id}"><img alt="Foto von ${esc(p.name)}"><small>${Math.round(r.qualitaet?.augenPx || 0)} px</small><button data-fweg="${p.id}|${r.id}" aria-label="Foto löschen">×</button></div>`).join('') || '<p class="leise">Noch keine Fotos.</p>'}</div>
<div class="zeile"><button data-fhinzu="${p.id}" ${p.refs.length >= ZUORDNUNG.maxFotos ? 'disabled' : ''}>Foto ergänzen</button><button data-pweg="${p.id}">${z.loeschen === p.id ? 'Wirklich löschen?' : 'Löschen'}</button></div></div>`).join('') || '<p class="leise">Keine Personen gespeichert.</p>';
    $('[data-a="alleweg"]').textContent = z.loeschen === '*' ? 'Wirklich alle löschen?' : 'Alle löschen';
    $('[data-a="alleweg"]').disabled = !z.personen.length;
    for (const p of z.personen) for (const r of p.refs) {
      const img = L.querySelector(`[data-r="${r.id}"] img`); if (!img) continue;
      if (url.has(r.id)) { img.src = url.get(r.id); continue; }
      app.raster.hole(r.rasterId).then((blob) => { if (!blob || weg) return; url.set(r.id, URL.createObjectURL(blob)); img.src = url.get(r.id); }).catch(() => {});
    }
  }
  async function erkenne() {
    const doc = app.zustand().doc; if (!doc) { urteilT.textContent = 'Zuerst ein Foto öffnen.'; return; }
    if (z.docId !== doc.id) { z.docId = doc.id; z.hand.clear(); z.aus.clear(); }
    status('Suche Gesichter …');
    try {
      const r = await erkenneGesichter(app, { bmp: app.quelleBitmap(), b: doc.quelle.b, h: doc.quelle.h, gesichter: doc.gesichter });
      z.gesichter = r.gesichter; z.merkmale = r.merkmale; if (r.gesichter.length && !doc.gesichter?.length) app.setzeGesichter?.(r.gesichter);
      status('');
    } catch (e) { status(e.code === FEHLER.KEIN_MODELL ? 'Ohne Prüfmodell bleibt diese Funktion gesperrt.' : (e.text || e.message || String(e)), 'nein-t'); }
    ordne(); zeichne(); automatik();
  }
  // Automatik: passende Gesichter ohne Antippen auffrischen (einmal je Foto, wie nach dem Öffnen in app.js)
  async function automatik(erneut = false) {
    const doc = app.zustand().doc; if (!doc || !autoAn() || z.laeuft || !z.zu.some((x) => x.person && !x.aus && !x.abgewaehlt && !schrittFuer(x.person))) return;
    z.laeuft = true; zeichne(); status('Passende Gesichter werden automatisch aufgefrischt …'); balken(0);
    try {
      const ausschluss = new Set(z.zu.filter((x) => x.person && x.aus).map((x) => x.person));
      const r = await autoAuffrischen(app, { docId: doc.id, erneut, ausschluss, p: { staerke: z.p.staerke / 100, augen: z.p.augen / 100, haut: z.p.haut / 100, haare: z.p.haare / 100 }, onFortschritt: (f, t) => { if (!weg) { balken(f); status(t); } } });
      if (weg) return;
      status(r?.schritte?.length ? `Automatisch aufgefrischt: ${r.schritte.map((s) => s.params.person.name).join(', ')} – Identität geprüft.` : r?.fehler?.length ? r.fehler.map((f) => `${f.name}: ${f.text}`).join(' ') : '', r?.fehler?.length ? 'nein-t' : 'ok');
    } finally { z.laeuft = false; if (!weg) { balken(null); zeichne(); } }
  }
  async function start() {
    z.personen = await ladePersonen(); zeichne();
    if (!(await modelleDa(app))) {
      const brauche = []; if (!(await imCache(app, 'gesicht-landmarken'))) brauche.push('gesicht-landmarken'); if (!(await imCache(app, 'merkmal'))) brauche.push('merkmal');
      const ok = await modellFrage(brauche, 'Zum Erkennen, welche gespeicherte Person auf dem Foto ist, braucht es zwei kleine Modelle. Ohne sie bleibt die Funktion gesperrt.');
      if (!ok || weg) { urteilT.textContent = 'Ohne Prüfmodell bleibt diese Funktion gesperrt.'; return false; }
    }
    z.bereit = true; await erkenne(); return true;
  }
  async function fotosFuer(pid, liste) {
    for (const [i, f] of liste.entries()) {
      status(`Foto ${i + 1}/${liste.length} wird geprüft …`);
      try { await fotoHinzufuegen(app, pid, f); } catch (e) { status(e.text || e.message || String(e), 'nein-t'); await new Promise((ok) => setTimeout(ok, 1500)); }
    }
    z.personen = await ladePersonen();
    const p = z.personen.find((x) => x.id === pid);
    if (p && !p.refs.length) { await loeschePerson(app, pid); z.personen = await ladePersonen(); }   // ohne passendes Foto keine leere Person
    else status('');
    ordne(); zeichne(); automatik(true);
  }
  box.addEventListener('input', (e) => { const k = e.target.dataset?.p; if (k) z.p[k] = Number(e.target.value); });
  box.addEventListener('change', async (e) => {
    const t = e.target;
    if (t.dataset?.name) { await umbenenne(t.dataset.name, t.value); z.personen = await ladePersonen(); ordne(); zeichne(); return; }
    if (t.dataset?.hand != null) {
      const i = Number(t.dataset.hand), p = z.personen.find((x) => x.id === t.value); if (!p) return;
      const h = pruefeHand(z.merkmale[i], p);
      if (!h.erlaubt) { t.value = ''; const hw = $('[data-t="hand-hinweis"]'); if (hw) hw.textContent = `Gesicht ${i + 1}: ${h.grund} (Ähnlichkeit ${komma(h.wert)}) – nicht zugeordnet.`; return; }
      // erst die Identität, dann „nur einmal je Foto“ (passt das Gesicht, ist die Person aber schon vergeben, wird das gesagt statt still verworfen)
      const bei = z.zu.findIndex((x, k) => k !== i && x.person === p.id);
      if (bei >= 0) { t.value = ''; const hw = $('[data-t="hand-hinweis"]'); if (hw) hw.textContent = `${p.name} ist schon Gesicht ${bei + 1} – nur einmal je Foto.`; return; }
      z.hand.set(i, p.id); ordne(); zeichne();
    }
  });
  datei.addEventListener('change', async () => {
    const liste = [...(datei.files || [])]; datei.value = ''; if (!liste.length) return;
    let pid = dateiZiel; dateiZiel = null;
    if (!pid) pid = (await neuePerson()).id;
    await fotosFuer(pid, liste);
  });
  box.addEventListener('click', async (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (z.loeschen && !b.dataset.pweg && b.dataset.a !== 'alleweg') { z.loeschen = null; zeichneListe(); }
    if (b.dataset.a === 'auto') { const an = !autoAn(); setzeAuto(an); b.setAttribute('aria-pressed', String(an)); b.textContent = an ? 'An' : 'Aus'; if (an) automatik(true); return; }
    if (b.dataset.pa) { const aus = inaktive(); aus.has(b.dataset.pa) ? aus.delete(b.dataset.pa) : aus.add(b.dataset.pa); setzeInaktive(aus); ordne(); zeichne(); return; }
    if (b.dataset.a === 'neu') { if (!z.bereit && !(await start())) return; dateiZiel = null; datei.click(); return; }
    if (b.dataset.fhinzu) { if (!z.bereit && !(await start())) return; dateiZiel = b.dataset.fhinzu; datei.click(); return; }
    if (b.dataset.fweg) { const [pid, rid] = b.dataset.fweg.split('|'); await loescheFoto(app, pid, rid); z.personen = await ladePersonen(); ordne(); zeichne(); return; }
    if (b.dataset.pweg) {
      if (z.loeschen !== b.dataset.pweg) { z.loeschen = b.dataset.pweg; zeichneListe(); return; }
      z.loeschen = null; await loeschePerson(app, b.dataset.pweg); z.personen = await ladePersonen(); z.hand.forEach((v, k) => { if (v === b.dataset.pweg) z.hand.delete(k); }); ordne(); zeichne(); return;
    }
    if (b.dataset.a === 'alleweg') {
      if (z.loeschen !== '*') { z.loeschen = '*'; zeichneListe(); status('Löscht alle Personen und ihre Fotos. Schon aufgefrischte Fotos behalten ihre Auffrischung.'); return; }
      z.loeschen = null; await loescheAllePersonen(app); z.personen = []; z.hand.clear(); ordne(); zeichne(); return;
    }
    if (b.dataset.aus != null) {
      const i = Number(b.dataset.aus), x = z.zu[i], s = schrittFuer(x?.person);
      if (s) app.aendere((dd) => { const t = dd.schritte.find((y) => y.id === s.id); if (t) t.an = t.an === false; return dd; }, { name: `${x.name} ${s.an === false ? 'an' : 'aus'}` });
      else { z.aus.has(i) ? z.aus.delete(i) : z.aus.add(i); ordne(); }
      zeichne(); return;
    }
    if (b.dataset.a === 'stop') { ac?.abort(); return; }
    if (b.dataset.a === 'los') {
      const doc = app.zustand().doc; if (!doc || !z.zu.some((x) => x.person && !x.aus && !x.abgewaehlt)) return;
      ac = new AbortController(); z.laeuft = true; los.disabled = true; $('[data-a="stop"]').hidden = false; balken(0);
      try {
        const p = { staerke: z.p.staerke / 100, augen: z.p.augen / 100, haut: z.p.haut / 100, haare: z.p.haare / 100 };
        const r = await frischeGesichterAuf(app, { bmp: app.quelleBitmap(), b: doc.quelle.b, h: doc.quelle.h, gesichter: z.gesichter, merkmale: z.merkmale, zuordnung: z.zu.map((x) => (x.abgewaehlt ? { ...x, aus: true } : x)), personen: z.personen, p, signal: ac.signal, onFortschritt: (f, t) => { balken(f); status(t); } });
        if (r.schritte.length) {
          const neu = new Set(r.schritte.map((s) => s.params.person.id));
          app.aendere((dd) => { dd.schritte = dd.schritte.filter((s) => !(s.art === ART.AUFFRISCHEN && neu.has(s.params?.person?.id))); dd.schritte.push(...r.schritte); return dd; }, { name: r.schritte.length > 1 ? `Auffrischen (${r.schritte.length} Personen)` : r.schritte[0].name });
        }
        status(r.fehler.length ? `${r.schritte.length} fertig. ${r.fehler.map((f) => `${f.name}: ${f.text}`).join(' ')}` : `Fertig – ${r.schritte.map((s) => s.params.person.name).join(', ')} aufgefrischt, Identität geprüft.`, r.fehler.length ? 'nein-t' : 'ok');
      } catch (err) { status(err.code === FEHLER.ABBRUCH ? 'Abgebrochen.' : (err.text || err.message || String(err)), err.code === FEHLER.ABBRUCH ? '' : 'nein-t'); }
      finally { ac = null; z.laeuft = false; $('[data-a="stop"]').hidden = true; balken(null); zeichne(); }
    }
  });
  const ab = [app.on?.('zustand', () => { const doc = app.zustand().doc; if (z.bereit && doc && doc.id !== z.docId) erkenne(); else zeichne(); }) || (() => {})];
  start();
  return { zerstoere() { weg = true; ac?.abort(); ebene.remove(); for (const f of ab) try { f(); } catch {} box.querySelectorAll('img').forEach((i) => i.removeAttribute('src')); for (const u of url.values()) URL.revokeObjectURL(u); } };
}
