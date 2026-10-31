// VC2a-06: IndexedDB fehlt / wirft → die App arbeitet normal, das Menü zeigt „Verlauf aus (Speicher nicht verfügbar)“
import { launch } from './n5-h-lib.mjs';
const res = []; const ok = (id, pass, info) => { res.push({id, pass: !!pass}); console.log((pass ? 'PASS ' : 'FAIL ') + id + ' ' + JSON.stringify(info)); };
const cases = {
  fehlt: () => { try { Object.defineProperty(window, 'indexedDB', {value: undefined, configurable: true}); } catch (e) {} },
  wirft: () => { Object.defineProperty(window, 'indexedDB', {get() { throw new DOMException('blocked', 'SecurityError'); }, configurable: true}); },
  openWirft: () => { const o = IDBFactory.prototype.open; IDBFactory.prototype.open = function (n, v) { if (n === 'synq-hist') throw new DOMException('quota', 'UnknownError'); return o.call(this, n, v); }; },
  putWirft: () => { const o = IDBObjectStore.prototype.put; IDBObjectStore.prototype.put = function (v, k) { if (typeof k === 'string' && k.startsWith('hist2:')) throw new DOMException('voll', 'QuotaExceededError'); return o.call(this, v, k); }; },
};
for (const [name, init] of Object.entries(cases)) {
  const {b, p, errs} = await launch({init});
  const r = await p.evaluate(async () => {
    const A = SYNQUENZER, out = {};
    for (let i = 0; i < 6; i++) { A.setClip(1, i % 4, {len: 1, notes: [{p: 60 + i, s: 0, l: 1, v: .8}]}); const s = A.getSound(2); s.p.cutoff = 900 + i * 50; A.setSound(2, s); }
    undo(); redo(); A.play(); await new Promise(r => setTimeout(r, 2800)); A.stop();
    out.clip = !!A.getClip(1, 1); out.undoN = A.undoInfo().n; out.hist = A.history();
    openMenu(); await new Promise(r => setTimeout(r, 200));
    out.menu = [...document.querySelectorAll('#menu .small, #menu .mrow')].map(e => e.textContent).filter(t => /Verlauf/.test(t));
    out.check = await A.historyCheck();
    return out;
  });
  const expectOff = true;
  ok(`VC2a-06 ${name}: App arbeitet normal (Clips, Undo, Wiedergabe)`, r.clip && r.undoN >= 12, r);
  ok(`VC2a-06 ${name}: Menü „Verlauf aus (Speicher nicht verfügbar)“, Rekorder aus`, r.menu.includes('Verlauf aus (Speicher nicht verfügbar)') && !r.hist.on, {menu: r.menu, hist: r.hist});
  const appErr = errs.filter(e => !/blocked|quota|voll|IndexedDB|indexedDB|SecurityError|QuotaExceeded|UnknownError/i.test(e));
  ok(`VC2a-06 ${name}: keine Fehler außer dem simulierten`, !appErr.length, {all: errs.slice(0, 4)});
  await b.close();
}
console.log(res.every(x => x.pass) ? 'ALLE BESTANDEN' : 'FEHLER');
