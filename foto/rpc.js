// Bildwerk – Worker-Aufrufe (FEST, siehe ARCH.md §5). Haupt-Faden: kanal(); Worker: bediene().
import { BildwerkFehler, FEHLER } from './typen.js';

/**
 * @typedef {{rufe(typ:string,daten?:any,opts?:{transfer?:Transferable[],signal?:AbortSignal,onFortschritt?:(f:number,t?:string)=>void}):Promise<any>, beende():void}} RpcKanal
 * @param {Worker} worker @returns {RpcKanal}
 */
export function kanal(worker) {
  let naechste = 1;
  const offen = new Map();
  worker.addEventListener('message', (e) => {
    const m = e.data; const o = offen.get(m && m.id);
    if (!o) return;
    if ('fortschritt' in m && !('ok' in m)) { o.onFortschritt && o.onFortschritt(m.fortschritt, m.text); return; }
    offen.delete(m.id);
    if (m.ok) o.loese(m.ergebnis); else o.wirf(new BildwerkFehler(m.fehler?.code || FEHLER.UNBEKANNT, m.fehler?.text || 'Fehler im Worker'));
  });
  worker.addEventListener('error', (e) => {
    for (const [id, o] of offen) { offen.delete(id); o.wirf(new BildwerkFehler(FEHLER.UNBEKANNT, e.message || 'Worker-Fehler')); }
  });
  return {
    rufe(typ, daten = {}, { transfer = [], signal, onFortschritt } = {}) {
      const id = naechste++;
      return new Promise((loese, wirf) => {
        if (signal?.aborted) { wirf(new BildwerkFehler(FEHLER.ABBRUCH, 'abgebrochen')); return; }
        offen.set(id, { loese, wirf, onFortschritt });
        signal?.addEventListener('abort', () => {
          if (!offen.has(id)) return;
          offen.delete(id); worker.postMessage({ id, typ: 'abbruch' });
          wirf(new BildwerkFehler(FEHLER.ABBRUCH, 'abgebrochen'));
        }, { once: true });
        worker.postMessage({ id, typ, daten }, transfer);
      });
    },
    beende() { worker.terminate(); for (const o of offen.values()) o.wirf(new BildwerkFehler(FEHLER.ABBRUCH, 'beendet')); offen.clear(); },
  };
}

/** Übertragbare Puffer in einem Ergebnis finden (TypedArrays, ImageBitmap). */
export function puffer(wert, liste = [], gesehen = new Set()) {
  if (!wert || typeof wert !== 'object' || gesehen.has(wert)) return liste;
  gesehen.add(wert);
  if (ArrayBuffer.isView(wert)) { if (!gesehen.has(wert.buffer)) { gesehen.add(wert.buffer); liste.push(wert.buffer); } return liste; }
  if (wert instanceof ArrayBuffer) { liste.push(wert); return liste; }
  if (typeof ImageBitmap !== 'undefined' && wert instanceof ImageBitmap) { liste.push(wert); return liste; }
  for (const k of Object.keys(wert)) puffer(wert[k], liste, gesehen);
  return liste;
}

/**
 * @param {DedicatedWorkerGlobalScope} scope
 * @param {Record<string,(daten:any,h:{fortschritt(f:number,t?:string):void,signal:AbortSignal})=>Promise<any>>} handler
 */
export function bediene(scope, handler) {
  const laufend = new Map();
  scope.addEventListener('message', async (e) => {
    const { id, typ, daten } = e.data || {};
    if (typ === 'abbruch') { laufend.get(id)?.abort(); laufend.delete(id); return; }
    const f = handler[typ];
    if (!f) { scope.postMessage({ id, ok: false, fehler: { code: FEHLER.UNBEKANNT, text: `Unbekannter Auftrag: ${typ}` } }); return; }
    const ac = new AbortController(); laufend.set(id, ac);
    try {
      const ergebnis = await f(daten, { fortschritt: (fo, text) => scope.postMessage({ id, fortschritt: fo, text }), signal: ac.signal });
      if (!ac.signal.aborted) scope.postMessage({ id, ok: true, ergebnis }, puffer(ergebnis));
    } catch (err) {
      if (!ac.signal.aborted) scope.postMessage({ id, ok: false, fehler: { code: err.code || FEHLER.UNBEKANNT, text: err.text || String(err.message || err) } });
    } finally { laufend.delete(id); }
  });
}
