// Bildwerk – gemeinsame Typen, Konstanten, Standardwerte (FEST, siehe ARCH.md §3).
// Kein DOM, keine Nebenwirkung beim Import: läuft im Haupt-Faden und in Workern.

/**
 * @typedef {'srgb'|'display-p3'} Farbraum
 * @typedef {{b:number,h:number,kanaele:3|4,daten:Float32Array,farbraum:Farbraum,linear:true}} BildF32
 * @typedef {{b:number,h:number,daten:Uint8ClampedArray,farbraum?:Farbraum}} BildU8   RGBA, kodiert
 * @typedef {{b:number,h:number,daten:Uint8Array}} MaskeU8                          0..255, Arbeitsauflösung
 * @typedef {{b:number,h:number,daten:Float32Array,art:string}} KarteF32
 * @typedef {{b:number,h:number,klassen:Uint8Array,vertrauen:Uint8Array}} KlassenKarte
 * @typedef {{x:number,y:number,b:number,h:number}} Rechteck                         normiert 0..1 (Quelle)
 * @typedef {{id:string,box:Rechteck,landmarken:Float32Array,punkte5:Float32Array,sicherheit:number,augenAbstandPx:number}} Gesicht
 * @typedef {{id:string,art:'entfernen'|'auffrischen',px:{x:number,y:number,b:number,h:number},rasterId:string,maskeId:string,verfahren:string,erstellt:number}} Flicken
 * @typedef {{zuschnitt:Rechteck,drehung:number,viertel:0|1|2|3,spiegelnH:boolean,spiegelnV:boolean}} Geometrie
 * @typedef {{quelle:string,modus:'plus'|'minus'|'schnitt',params:object,rasterId?:string}} MaskenTeil
 * @typedef {{id:string,teile:MaskenTeil[],weich:number,verfeinern:boolean,umkehren:boolean,rasterId?:string}} MaskenRef
 * @typedef {{id:string,art:string,stufe:number,an:boolean,deckkraft:number,params:object,maske?:MaskenRef,flickenId?:string,name?:string}} Schritt
 * @typedef {{version:1,id:string,name:string,erstellt:number,geaendert:number,
 *   quelle:{b:number,h:number,farbraum:Farbraum,rasterId:string,mime:string,exif:object},
 *   geometrie:Geometrie,schritte:Schritt[],analyse?:object,gesichter?:Gesicht[]}} Dokument
 * @typedef {{id:string,titel:string,grund:string,wichtig:number,sicherheit:number,schritte:Schritt[],geometrie?:object}} Vorschlag
 * @typedef {{format:'image/jpeg'|'image/png',qualitaet:number,skala:1|2|4,maxKante?:number,hochModus?:'treu'|'kreativ',signal?:AbortSignal,onFortschritt?:(f:number,t?:string)=>void}} ExportOptionen
 * @typedef {{setze(params:object):void,zerstoere():void}} UIHandle
 */

export const VERSION = '0.5.0';
export const ARBEITS_KANTE = 2048;   // lange Seite Arbeitsbild (Vorschau, Masken)
export const ANALYSE_KANTE = 1024;   // lange Seite Analysebild
export const KACHEL = 1024;          // Export-Kachel ohne Rand
export const MODELL_CACHE = 'bildwerk-modelle-v1';
export const DB_NAME = 'bildwerk';
export const DB_VERSION = 1;

/** Renderreihenfolge (fest). */
export const STUFE = Object.freeze({
  RETUSCHE: 10, HOCH: 15, WB: 20, BELICHTUNG: 30, TON: 40, PRAESENZ: 50, KURVE: 60, HSL: 70,
  LOOK: 80, LOKAL: 90, DETAILS: 100, EFFEKTE: 110, GEOMETRIE: 120,
});

/** Schritt-Arten. */
export const ART = Object.freeze({
  AUTO_TON: 'auto-ton', REGLER: 'regler', KURVE: 'kurve', HSL: 'hsl', LOOK: 'look', LOKAL: 'lokal',
  SCHAERFE: 'schaerfe', RAUSCHEN: 'rauschen', EFFEKTE: 'effekte', ENTFERNEN: 'entfernen', AUFFRISCHEN: 'auffrischen',
});

export const STUFE_VON_ART = Object.freeze({
  'auto-ton': STUFE.BELICHTUNG, regler: STUFE.TON, kurve: STUFE.KURVE, hsl: STUFE.HSL, look: STUFE.LOOK,
  lokal: STUFE.LOKAL, schaerfe: STUFE.DETAILS, rauschen: STUFE.DETAILS, effekte: STUFE.EFFEKTE,
  entfernen: STUFE.RETUSCHE, auffrischen: STUFE.RETUSCHE,
});

/** Klassen der Mehrklassen-Segmentierung. */
export const KLASSE = Object.freeze({ HINTERGRUND: 0, HAAR: 1, KOERPERHAUT: 2, GESICHTSHAUT: 3, KLEIDUNG: 4, SONSTIGES: 5 });

/** Masken-Quellen. */
export const MASKE = Object.freeze({
  GESICHT: 'gesicht', HAUT: 'haut', HAAR: 'haar', KLEIDUNG: 'kleidung', PERSON: 'person', HINTERGRUND: 'hintergrund',
  OBJEKT: 'objekt', PINSEL: 'pinsel', VERLAUF: 'verlauf', FARBE: 'farbe', TIEFE: 'tiefe', MAGISCH: 'magisch',
});

export const HSL_BEREICHE = Object.freeze(['rot', 'orange', 'gelb', 'gruen', 'aquamarin', 'blau', 'lila', 'magenta']);

/** Identitätsprüfung (SFace, Kosinus). */
export const IDENTITAET = Object.freeze({ schwelle: 0.363, median: 0.45, grau: 0.30, mindestAugenPx: 32 });

export const FEHLER = Object.freeze({
  ABBRUCH: 'abbruch', KEIN_MODELL: 'kein-modell', NETZ: 'netz', SPEICHER: 'speicher', GPU: 'gpu',
  FREMDE_PERSON: 'fremde-person', ZU_KLEIN: 'zu-klein', UNBEKANNT: 'unbekannt', NICHT_GEBAUT: 'nicht-gebaut',
});

export class BildwerkFehler extends Error {
  /** @param {string} code @param {string} text */
  constructor(code, text) { super(text); this.code = code; this.text = text; this.name = 'BildwerkFehler'; }
}

/** Platzhalter für noch nicht gebaute Funktionen (Stubs). */
export function nichtGebaut(name) { throw new BildwerkFehler(FEHLER.NICHT_GEBAUT, `${name}: noch nicht gebaut`); }

/** Standard-Parameter des globalen Regler-Schritts (IDs fest, ARCH.md §4.2). */
export const REGLER_STANDARD = Object.freeze({
  belichtung: 0, kontrast: 0, lichter: 0, tiefen: 0, weiss: 0, schwarz: 0,
  klarheit: 0, struktur: 0, dunst: 0, dynamik: 0, saettigung: 0,
  temperatur: null, toenung: 0,          // temperatur null = wie Quelle (Auto-WB setzt Wert)
  schaerfe: 0, rauschL: 0, rauschF: 0, vignette: 0, korn: 0,
  kurve: { rgb: [[0, 0], [1, 1]], r: [[0, 0], [1, 1]], g: [[0, 0], [1, 1]], b: [[0, 0], [1, 1]] },
  hsl: Object.fromEntries(HSL_BEREICHE.map((n) => [n, { ton: 0, saett: 0, lum: 0 }])),
});

export const STANDARD = Object.freeze({
  'auto-ton': { wbGains: [1, 1, 1], ev: 0, schwarz: [0, 0, 0], weiss: [1, 1, 1], gamma: [1, 1, 1], staerke: 1 },
  regler: REGLER_STANDARD,
  look: { id: 'natuerlich', staerke: 0.7, fein: {} },
  lokal: { regler: {} },
  schaerfe: { staerke: 0.6, fein: 1, mittel: 1, grob: 1, rauschSchwelle: 1.5 },
  rauschen: { luminanz: 0, farbe: 0 },
  effekte: { vignette: 0, korn: 0, tiefenschaerfe: null },
  entfernen: {}, auffrischen: { staerke: 0.6, augen: 1, haut: 0.5, haare: 0.8 },
});

let zaehler = 0;
export function neueId(praefix = 'id') {
  zaehler = (zaehler + 1) % 1e6;
  return `${praefix}-${Date.now().toString(36)}-${zaehler.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** @returns {Geometrie} */
export function neueGeometrie() {
  return { zuschnitt: { x: 0, y: 0, b: 1, h: 1 }, drehung: 0, viertel: 0, spiegelnH: false, spiegelnV: false };
}

/** @returns {Dokument} */
export function neuesDokument({ b, h, farbraum = 'srgb', rasterId, mime = 'image/jpeg', name = 'Foto', exif = {} }) {
  const jetzt = Date.now();
  return {
    version: 1, id: neueId('doc'), name, erstellt: jetzt, geaendert: jetzt,
    quelle: { b, h, farbraum, rasterId, mime, exif },
    geometrie: neueGeometrie(), schritte: [],
  };
}

/** @returns {Schritt} */
export function neuerSchritt(art, params = {}, extra = {}) {
  if (!(art in STUFE_VON_ART)) throw new BildwerkFehler(FEHLER.UNBEKANNT, `Unbekannte Schritt-Art: ${art}`);
  const basis = STANDARD[art] ? structuredClone(STANDARD[art]) : {};
  return { id: neueId('s'), art, stufe: STUFE_VON_ART[art], an: true, deckkraft: 1, params: { ...basis, ...params }, ...extra };
}

/** Schritte in Renderreihenfolge (stabil: Stufe, dann Listenposition). */
export function renderReihenfolge(schritte) {
  return schritte.map((s, i) => [s, i]).filter(([s]) => s.an).sort((a, b) => a[0].stufe - b[0].stufe || a[1] - b[1]).map(([s]) => s);
}

/** Kurze Seite und Pixelradius aus Anteil. */
export function radiusPx(anteil, b, h) { return anteil * Math.min(b, h); }

/** Kopie fürs Gesichter-Finden: der KI-Worker rechnet ohnehin mit höchstens 1280 px (Ergebnis normiert) – also gleich
 *  verkleinert kopieren statt das ganze Foto (12 MP: 48 MB, 48 MP: 192 MB weniger Spitze, kürzere Übergabe). */
export async function gesichtsKopie(bmp, kante = 1280) {
  const s = kante / Math.max(bmp.width, bmp.height);
  if (s >= 1) return createImageBitmap(bmp);
  try { return await createImageBitmap(bmp, { resizeWidth: Math.max(1, Math.round(bmp.width * s)), resizeHeight: Math.max(1, Math.round(bmp.height * s)), resizeQuality: 'high' }); } catch { return createImageBitmap(bmp); }
}
