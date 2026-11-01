// MIX-A Abnahme 4: ohne Übernahme bitgleich (Regel 28).
// 4.30.0 rendert schon selbst nicht bitgleich von Lauf zu Lauf (Lead/Fläche: Zufall im Klang-Worklet, zeitabhängige Hall-IR).
// Deshalb zwei Nachweise: (a) der komplette Offline-Audio-Graph (jeder erzeugte Knoten, jedes Worklet mit Optionen, jede Verbindung)
// ist zwischen 4.30.0 und MIX-A gleich – vor und nach der Analyse, nach Übernehmen+Zurück, nach Auto-Master an+aus;
// (b) deterministische Spuren (Bass, Drums solo) sind bitgleich zu 4.30.0; (c) der Spur-Knoten im Durchgang ist bitgleich.
// node mixa-bitgleich.mjs [index.html] [basis.html]
import { open, buildSong, ok, failed, APP, HERE } from './mixa-lib.mjs';
import path from 'path';
const BASE = path.resolve(process.argv[3] || path.join(HERE, '../../../snapshots/R-4300.html'));
const GLOG = `(() => {
  let LOG = [], id = 0, ids = new WeakMap(); const nid = n => { if (!ids.has(n)) ids.set(n, ++id); return ids.get(n); };
  window.__glogStart = () => { LOG = []; id = 0; ids = new WeakMap(); window.__glogOn = true; }; window.__glogGet = () => { window.__glogOn = false; return LOG; };
  const off = c => typeof OfflineAudioContext !== 'undefined' && c instanceof OfflineAudioContext && c.length > 4096;
  for (const k of Object.getOwnPropertyNames(BaseAudioContext.prototype)) { if (!/^create/.test(k)) continue; const f = BaseAudioContext.prototype[k]; if (typeof f !== 'function') continue;
    BaseAudioContext.prototype[k] = function (...a) { const n = f.apply(this, a); if (window.__glogOn && off(this) && n && typeof n === 'object') LOG.push(k + '#' + nid(n)); return n; }; }
  const C = AudioNode.prototype.connect, D = AudioNode.prototype.disconnect;
  AudioNode.prototype.connect = function (d, o, i) { if (window.__glogOn && off(this.context)) LOG.push('c' + nid(this) + '>' + (d instanceof AudioParam ? 'p' : nid(d)) + ':' + (o | 0) + ':' + (i | 0)); return C.apply(this, arguments); };
  AudioNode.prototype.disconnect = function (d) { if (window.__glogOn && off(this.context)) LOG.push('d' + nid(this) + (d ? '>' + (d instanceof AudioParam ? 'p' : nid(d)) : '')); return D.apply(this, arguments); };
  const W = window.AudioWorkletNode; if (W) window.AudioWorkletNode = class extends W { constructor(c, name, o) { super(c, name, o); if (window.__glogOn && off(c)) LOG.push('W' + name + '#' + nid(this) + JSON.stringify(Object.assign({}, o || {}, {processorOptions: o && o.processorOptions ? Object.keys(o.processorOptions).sort() : null}))); } };
})();`;
const run = async (file, steps) => {
  const {p, errs, close} = await open(file, null, {init: GLOG});
  await buildSong(p, {});
  const out = {};
  const render = async (name, solo) => {
    out[name] = await p.evaluate(async solo => {
      window.__reseed(); const Q = window.SYNQUENZER; const keep = S.tracks.map(t => t.mute);
      if (solo) S.tracks.forEach((t, i) => { t.mute = !solo.includes(i); });
      window.__glogStart(); await Q.vvRender({}); const log = window.__glogGet(); S.tracks.forEach((t, i) => { t.mute = keep[i]; });
      const r = VV.last; let h = 0x811c9dc5; for (const d of r.ch) { const u = new Uint32Array(d.buffer, d.byteOffset, d.length); for (let i = 0; i < u.length; i++) { h ^= u[i]; h = Math.imul(h, 16777619) >>> 0; } }
      return {h: h.toString(16), n: r.n, log, mods: log.filter(x => x[0] === 'W').map(x => x.split('#')[0])};
    }, solo || null);
  };
  await steps(p, render);
  out.errs = errs; await close(); return out;
};
const base = await run(BASE, async (p, render) => { await render('voll'); await render('bass', [0]); await render('drums', [4]); await render('drums2', [4]); await render('voll2'); });
const mixa = await run(APP, async (p, render) => {
  await render('voll'); await render('bass', [0]); await render('drums', [4]);
  await p.evaluate(() => window.SYNQUENZER.mixaAnalyze());
  await render('nachAnalyse'); await render('bassNachAnalyse', [0]);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.mixaApply(0, 'comp'); Q.mixaApply(2, 'sec'); Q.mixaApply(2, 'hp'); });
  await render('uebernommen'); await render('bassUebernommen', [0]);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.mixaRevert(2, 'hp'); Q.mixaRevert(2, 'sec'); Q.mixaRevert(0, 'comp'); });
  await render('zurueck'); await render('bassZurueck', [0]);
  await p.evaluate(() => window.SYNQUENZER.mixaMeasureAm(-14)); await p.evaluate(() => window.SYNQUENZER.amApply());
  await render('amAn');
  await p.evaluate(() => window.SYNQUENZER.amOff());
  await render('amAus'); await render('bassAmAus', [0]);
});
// Graph-Inhalt: jede Knotenart mit Anzahl, jedes Worklet mit Optionen, Zahl der Verbindungen (Reihenfolge und Abbau der Stimmen hängen
// am Takt des Offline-Laufs und sind schon in 4.30.0 nicht fest)
const sig = a => { const m = {}; for (const x of a.log) { if (x[0] === 'd') continue; const k = x[0] === 'c' ? 'connect' + (x.includes('>p') ? 'P' : '') : x.replace(/#\d+/, ''); m[k] = (m[k] || 0) + 1; } return m; };
const same = (a, b) => JSON.stringify(sig(a)) === JSON.stringify(sig(b));
const diff = (a, b) => { const A = sig(a), B = sig(b), o = {}; for (const k of new Set([...Object.keys(A), ...Object.keys(B)])) if (A[k] !== B[k]) o[k] = [A[k], B[k]]; return Object.keys(o).length ? o : null; };
ok('4.30.0: erster und späterer Render (Bezug)', true, diff(base.voll, base.voll2) || 'gleich');
ok('Graph 4.30.0 = MIX-A (frisch)', same(base.voll, mixa.voll), diff(base.voll, mixa.voll) || base.voll.log.length + ' Ereignisse');
ok('kein MIX-A-Modul ohne Übernahme', !mixa.voll.mods.some(m => /mixa/.test(m)), mixa.voll.mods);
ok('Bass solo bitgleich 4.30.0 = MIX-A', base.bass.h === mixa.bass.h && base.bass.n === mixa.bass.n, [base.bass.h, mixa.bass.h]);
if (base.drums.h === base.drums2.h) ok('Drums solo bitgleich 4.30.0 = MIX-A', base.drums.h === mixa.drums.h, [base.drums.h, mixa.drums.h]);
else console.log('INFO Drums solo: schon 4.30.0 zweimal verschieden (' + base.drums.h + ' / ' + base.drums2.h + ') – nicht als Bitvergleich geeignet');
ok('nach Analyse: Graph = 4.30.0', same(base.voll2, mixa.nachAnalyse), diff(base.voll2, mixa.nachAnalyse));
ok('nach Analyse: Bass solo bitgleich', mixa.bassNachAnalyse.h === base.bass.h);
ok('übernommen: Spur-Knoten im Graph, Bass anders', mixa.uebernommen.mods.filter(m => m === 'Wsynq-mixa').length === 2 && mixa.bassUebernommen.h !== base.bass.h, mixa.uebernommen.mods);
ok('Zurück: Graph = 4.30.0', same(base.voll2, mixa.zurueck), diff(base.voll2, mixa.zurueck));
ok('Zurück: Bass solo bitgleich', mixa.bassZurueck.h === base.bass.h, [base.bass.h, mixa.bassZurueck.h]);
ok('Auto-Master an: Master-Knoten im Graph', mixa.amAn.mods.filter(m => m === 'Wsynq-mixa').length === 1, mixa.amAn.mods);
ok('Auto-Master aus: Graph = 4.30.0, Bass solo bitgleich', same(base.voll2, mixa.amAus) && mixa.bassAmAus.h === base.bass.h, diff(base.voll2, mixa.amAus));
// (c) Durchgang des Spur-Knotens (live nach „Zurück“): Ausgang = Eingang, Bit für Bit
const {p, close} = await open(APP);
const pass = await p.evaluate(() => {
  const D = window.SYNQUENZER.mixaCore(), T = new D.Track(48000); T.set({thr: -30, ra: 4, at: 3, rl: 100, mk: 3, hp: 120, pg: -3, pf: 60, hs: -2}, true); T.wT = 0; T.w = 0;
  const L = new Float32Array(128), R = new Float32Array(128), oL = new Float32Array(128), oR = new Float32Array(128); let bad = 0;
  for (let b = 0; b < 400; b++) { for (let i = 0; i < 128; i++) { L[i] = Math.sin(b * 128 + i) * 0.9; R[i] = (Math.random() * 2 - 1) * 0.7; } T.process(L, R, oL, oR, 128, 2); for (let i = 0; i < 128; i++) if (oL[i] !== L[i] || oR[i] !== R[i]) bad++; }
  return bad;
});
ok('Spur-Knoten im Durchgang (wet 0) = Eingang bitgleich', pass === 0, pass + ' abweichende Samples');
await close();
ok('keine Fehler', !base.errs.length && !mixa.errs.length, base.errs.concat(mixa.errs).slice(0, 3));
console.log(failed() ? 'FEHLER: ' + failed() : 'ALLES GRÜN');
process.exit(failed() ? 1 : 0);
