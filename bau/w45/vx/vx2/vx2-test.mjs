// VX2-Test (Prüfung 2/3/6/7): erkannte Marken + VX2 im Gesang-Editor, ohne gespeicherte Marken (der Weg, den vx1-test nicht erreicht)
// Aufruf: node vx2-test.mjs <abs index.html>
// Synthetischer Gesang wie vx1-test (6 Silben: Konsonant-Rauschen + Vokal), Marken NICHT gespeichert → Erkennung + VX2 laufen.
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2];
const run = (p, fn, arg) => p.evaluate('(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)); return (' + fn.toString() + ')(' + JSON.stringify(arg == null ? null : arg) + '); })()');
const b = await chromium.launch(), errs = [];
let okN = 0, badN = 0;
const ok = (c, name, info) => { if (c) okN++; else badN++; console.log((c ? 'OK ' : 'FEHLER ') + name + (info != null ? ' – ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); };
const p = await b.newPage({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true});
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + file); await p.waitForTimeout(1500);
// Take erzeugen (je Aufruf ein neuer Take)
const mkTake = () => run(p, async () => {
  const SR = 48000, PK = .07, ANCH = [.52, 1.03, 1.47, 2.04, 2.47, 3.02], F = [220, 247, 262, 294, 330, 220];
  const n = Math.round(3.6 * SR), x = new Float32Array(n); let seed = 12345; const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296 * 2 - 1; };
  const ons = ANCH.map(a => a - PK);
  for (let k = 0; k < ANCH.length; k++) { const on = ons[k], nx = k + 1 < ons.length ? ons[k + 1] : on + .5, f = F[k]; let lp = 0;
    for (let i = Math.round(on * SR); i < Math.round((on + .045) * SR); i++) { const u = (i / SR - on) / .045, r = rnd(); const h = r - lp; lp = r; x[i] += .12 * h * Math.sin(Math.PI * Math.min(1, u * 1.2)); }
    const v0 = on + .05, v1 = nx + .015;
    for (let i = Math.round(v0 * SR); i < Math.min(n, Math.round(v1 * SR)); i++) { const t = i / SR - v0, T = v1 - v0; let e = t < .02 ? Math.sin(.5 * Math.PI * t / .02) : .45 + .55 * Math.exp(-(t - .02) / .04); if (t > T - .012) e *= Math.max(0, (T - t) / .012); let s = 0; for (let h = 1; h <= 6; h++) s += Math.sin(2 * Math.PI * f * h * t) / h; x[i] += .5 * e * s / 1.6; } }
  const pcm = Array.from(x, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767))));
  S.bpm = 120; const rr = await SYNQUENZER.tkInject({pcm, sr: SR, scene: 0, at: 0, len: 2}); await wait(300);
  const id = rr.id; const raw = await wpDetect(id); for (let i = 0; i < 100 && !G2.an.get(id); i++) { g2Analyse(id).catch(() => null); await wait(100); }
  return {id, nDet: raw.length, anch: ANCH};
});
const has = await run(p, () => typeof vx2Marks === 'function');
if (!has) { console.log('INFO kein VX2 in dieser Fassung'); }

// --- 1) Gesang-Editor: Stücke = Silben, erkannte Marken app-weit unverändert, Quelle aktuell, Anker = Op 'vxa'
const T1 = await mkTake();
const r1 = await run(p, async o => {
  const id = o.id, det0 = WP.det.get(id), js0 = JSON.stringify(wpMarks(id));
  await window.__vx1.analyse(id);
  const L = window.__vx1.list(id) || [], A = VX1R.ana.get(id), b = vx1rSrc(id);
  const W = await wpCall({op: 'vxa', x: b.getChannelData(0), sr: b.sampleRate, marks: Array.from(A.t)});
  let da = 0, dl = 0; for (let k = 0; k < A.t.length; k++) { da = Math.max(da, Math.abs(W.an[k] - A.an[k])); dl = Math.max(dl, Math.abs(W.lead[k] - A.lead[k])); }
  return {n: L.length, kons: L.filter(q => q.uv.length && q.uv[0][0] <= q.t + .005).length, anchErr: Math.max(...L.map(q => Math.min(...o.anch.map(a => Math.abs(q.at - a))))) * 1000,
    detSame: WP.det.get(id) === det0 && JSON.stringify(wpMarks(id)) === js0, nMarks: wpMarks(id).length, srcOk: A.key.indexOf(id + '@' + wpBid(b) + ':') === 0, da, dl, last: typeof VX2 !== 'undefined' ? VX2.last : null};
}, T1);
ok(r1.n === 6, 'Gesang-Editor: 6 Stücke für 6 Silben (erkannte Marken, nichts gespeichert)', {stuecke: r1.n, erkannt: T1.nDet, vx2: r1.last});
ok(r1.kons === r1.n, 'Konsonant gehört zum Stück', r1.kons + '/' + r1.n);
ok(r1.anchErr <= 10, 'Anker ±10 ms an den Spitzen', Math.round(r1.anchErr) + ' ms');
ok(r1.detSame && r1.nMarks === T1.nDet, 'Prüfung 2: erkannte Marken (Marken-Editor, Zeitkarte, Songtext) nach dem Öffnen unverändert', {marken: r1.nMarks, erkannt: T1.nDet});
ok(r1.srcOk, 'Prüfung 3: Analyse liegt auf der aktuellen Quelle');
ok(r1.da === 0 && r1.dl === 0, 'Prüfung 7: Anker/Anlauf des Gesang-Editors = Op ‘vxa’ mit denselben Marken (bitgleich)', {an: r1.da, lead: r1.dl});

// --- 2) Songtext: vor dem Öffnen eingegeben (Fall A) → Silben bleiben an ihrer Stelle; danach eingegeben (Fall B) → stabil nach Neu-Erkennung (Laden)
const r2 = await run(p, async o => {
  const id = o.id, m = S.takes[id], n = wpMarks(id).length, txt = Array.from({length: n}, (_, i) => 'la' + i).join(' ');
  // Fall B: Gesang-Editor war offen (VX2-Sicht), jetzt Text im Marken-Editor
  m.lyrics = txt; const ly0 = JSON.stringify(wpLyr(id)), L1 = window.__vx1.list(id);
  await window.__vx1.analyse(id); const L2 = window.__vx1.list(id), ly1 = JSON.stringify(wpLyr(id));
  WP.det.delete(id); await wpDetect(id); const ly2 = JSON.stringify(wpLyr(id));   // wie nach Speichern + Laden: Marken neu erkannt
  await window.__vx1.analyse(id); const L3 = window.__vx1.list(id);
  delete m.lyrics;
  return {n, l1: L1.length, l2: L2.length, l3: L3.length, same01: ly0 === ly1, same02: ly0 === ly2, lab: (L3 || []).slice(0, 3).map(q => q.lab || q.label || q.syl || null)};
}, T1);
ok(r2.same01 && r2.same02, 'Prüfung 2: Songtext bleibt an seinen Marken (Öffnen des Gesang-Editors, Neu-Erkennung wie nach Laden)', r2);
ok(r2.l1 === r2.n && r2.l2 === r2.n && r2.l3 === r2.n, 'Prüfung 2: mit Songtext zeigt der Gesang-Editor die Marken, an denen der Text hängt', {marken: r2.n, stuecke: [r2.l1, r2.l2, r2.l3]});
const T2 = await mkTake();
const r3 = await run(p, async o => {
  const id = o.id, m = S.takes[id], n = wpMarks(id).length, txt = Array.from({length: n}, (_, i) => 'so' + i).join(' ');
  m.lyrics = txt; const ly0 = JSON.stringify(wpLyr(id));   // Fall A: erst Text, dann Gesang-Editor
  await window.__vx1.analyse(id); const L = window.__vx1.list(id);
  const r = {n, l: L.length, same: JSON.stringify(wpLyr(id)) === ly0};
  delete m.lyrics; await window.__vx1.analyse(id); r.ohne = window.__vx1.list(id).length; return r;
}, T2);
ok(r3.same && r3.l === r3.n, 'Prüfung 2 Fall A: Text vor dem Öffnen – alle Silben bleiben an ihrer Stelle', r3);
ok(r3.ohne === 6, 'ohne Text wieder Stücke = Silben (VX2)', r3.ohne);

// --- 3) Quelle wechselt während der Rechnung (SPK5-R): VX2 misst an der neuen Quelle
const T3 = await mkTake();
const r4 = await run(p, async o => {
  const id = o.id, orig = vx1rSrc, b0 = orig(id);
  const b1 = new AudioBuffer({length: b0.length, sampleRate: b0.sampleRate, numberOfChannels: 1}); b1.copyToChannel(b0.getChannelData(0), 0);
  let calls = 0; vx1rSrc = i => (i === id && ++calls > 1 ? b1 : orig(i));   // die Quelle wechselt nach dem ersten Abruf (wie G4 fertig)
  try { await window.__vx1.analyse(id); } finally { vx1rSrc = orig; }
  const A = VX1R.ana.get(id), L = window.__vx1.list(id) || [];
  const W = await wpCall({op: 'vxa', x: b1.getChannelData(0), sr: b1.sampleRate, marks: Array.from(A.t)});
  let da = 0; for (let k = 0; k < A.t.length; k++) da = Math.max(da, Math.abs(W.an[k] - A.an[k]));
  return {calls, onNew: A.key.indexOf(id + '@' + wpBid(b1) + ':') === 0, n: L.length, da, last: typeof VX2 !== 'undefined' ? VX2.last : null};
}, T3);
ok(r4.onNew && r4.da === 0, 'Prüfung 3: Quelle wechselt während der Rechnung → Analyse und Anker an der neuen Quelle', r4);

// --- 4) erstes Bearbeiten schreibt die Stücke fest (m.marks), erkannte Marken bleiben; Schalter aus → wie bisher
const r5 = await run(p, async o => {
  const id = o.id, det0 = WP.det.get(id), n0 = window.__vx1.list(id).length;
  await vx1rCommit(id, 'Test', () => {});
  const m = S.takes[id], r = {n0, saved: m.marks ? m.marks.length : null, detSame: WP.det.get(id) === det0, after: window.__vx1.list(id).length};
  const T = o; return r;
}, T3);
ok(r5.saved === r5.n0 && r5.after === r5.n0 && r5.detSame, 'erstes Bearbeiten schreibt die Stücke des Gesang-Editors fest, erkannte Marken unverändert', r5);
if (has) {
  const T4 = await mkTake();
  const r6 = await run(p, async o => { window.__vx2.on(false); try { await window.__vx1.analyse(o.id); return {n: window.__vx1.list(o.id).length, det: wpMarks(o.id).length}; } finally { window.__vx2.on(true); } }, T4);
  ok(r6.n === r6.det, 'Schalter aus: Stücke = erkannte Marken (wie 4.62.0)', r6);
}
ok(!errs.length, 'keine Konsolenfehler', errs.slice(0, 3));
console.log(`ERGEBNIS ${okN}/${okN + badN}` + (badN ? ' – FEHLER' : ' – alles OK'));
await b.close();
