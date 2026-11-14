// SPK3 Auftrag 4/4 – Gesamt-Test (OK/FEHLER) für Auftrag 1–3 auf dem Demo-Song (Stems bekannt → Messung gegen die Wahrheit).
// Ruft nacheinander (je mit Zeitgrenze) auf und wertet mit den SPK3-Zielen:
//   Kern (Node, Kern aus der Datei):  messk/noten3.mjs  TEIL=alle PROFI=1  – Präzision, Übernehmen-SDR, Profi-Quelle, mehrstimmig
//   Browser:  ../spk2/spk2-test.mjs (Zerlegen, Verfeinern, ↶, Layout 3 Größen, Fehler) · spk3-loop-test.mjs (Loop) ·
//             spk3-klang-probe.mjs <vorher> <datei> (Nachbau-Abstände, gleiches Maß für vorher/nachher)
// Aufruf: node spk3-test.mjs <abs. index.html> [<abs. vorher.html> = ../basis4.html]   (mess/ neben der Datei, basis2.html eine Ebene höher)
// Ergebnis: spk3-test.json neben der Datei; Ausgabe je Prüfung „OK“/„FEHLER“.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path';
const here = path.dirname(new URL(import.meta.url).pathname);
const file = path.resolve(process.argv[2] || path.join(here, 'index.html')), dir = path.dirname(file), vorher = path.resolve(process.argv[3] || path.resolve(dir, '..', 'basis4.html'));
const NUR = (process.env.NUR || 'kern,spk2,loop,klang').split(','), T0 = Date.now(), sek = () => Math.round((Date.now() - T0) / 1000);
const env = Object.assign({}, process.env, {NODE_PATH: process.env.NODE_PATH || '/opt/node-tools/node_modules'});
const run = (args, extra, ms) => { const t = Date.now(), r = spawnSync('node', args, {env: Object.assign({}, env, extra || {}), encoding: 'utf8', timeout: ms, maxBuffer: 64 << 20});
  const out = (r.stdout || '') + (r.stderr || ''); console.log('  · ' + path.basename(args[0]) + ' ' + Math.round((Date.now() - t) / 1000) + ' s' + (r.status !== 0 ? ' (Status ' + r.status + (r.signal ? ', ' + r.signal : '') + ')' : ''));
  return {out, status: r.status}; };
const lastJson = s => { const L = s.trim().split('\n').reverse().find(l => l.startsWith('{')); return L ? JSON.parse(L) : null; };
const rd = n => { try { return JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8')); } catch (e) { return null; } };
const res = {}, ok = (k, v, cond) => { res[k] = {v, ok: !!cond}; console.log((cond ? 'OK     ' : 'FEHLER ') + k + ' ' + JSON.stringify(v)); };
const f2 = x => x == null ? null : +(+x).toFixed(2);

// ---------- 1 Kern (Node): Noten, Übernehmen, Profi-Quelle, mehrstimmig – vorher (Basis) und nachher (Datei)
let K = null, KV = null;
if (NUR.includes('kern')) {
  const n3 = path.join(here, 'messk', 'noten3.mjs');
  K = lastJson(run([n3], {HTML: file, TEIL: 'alle', PROFI: '1'}, 600000).out);
  KV = fs.existsSync(vorher) ? lastJson(run([n3], {HTML: vorher, TEIL: 'alle', PROFI: '1'}, 600000).out) : null;
}
// ---------- 2 Browser: spk2-test (Zerlegen, Verfeinern, ↶, Layout, Fehler) – Ergebnis spk2-test.json neben der Datei
let S2 = null;
if (NUR.includes('spk2')) { run([path.resolve(here, '..', 'spk2', 'spk2-test.mjs'), file], {}, 600000); S2 = rd('spk2-test.json'); }
// ---------- 3 Browser: Loop im Dokument + im Kreis
let LP = null;
if (NUR.includes('loop')) { run([path.join(here, 'spk3-loop-test.mjs'), file], {}, 300000); LP = rd('spk3-loop-test.json'); }
// ---------- 4 Browser: Nachbau-Abstände vorher/nachher (gleiches Maß = SPK2-Abstand)
let KL = null;
if (NUR.includes('klang') && fs.existsSync(vorher)) { const p = path.join(here, 'spk3-klang-probe.mjs'); run([p, vorher, file], {}, 600000); KL = rd('spk3-klang-probe.json'); }

// ================= Wertung =================
const R2 = k => S2 && S2.res && S2.res[k] || {v: null, ok: false};
if (S2) {
  const zb = R2('zerlegen-bass-ziel').v || {}; ok('bass-zerlegen-4db', {bass: zb.bass, ziel: 4, basis: 0.77, kern: K && K.sdr_zerlegt}, zb.bass >= 4);
  const vf = R2('verfeinern-verbessert').v || {}; ok('verfeinern-plus-1db', {vor: vf.vor, nach: vf.nach, plus: f2(vf.nach - vf.vor), ziel: 1, basis: '0,77 → −0,46'}, vf.nach - vf.vor >= 1);
  const vu = R2('verfeinern-ein-undo'); ok('verfeinern-undo', vu.v, vu.ok && vu.v && vu.v.zurueck === vu.v.vor);
  ok('zerlegen-undo', R2('zerlegen-ein-undo').v, R2('zerlegen-ein-undo').ok);
}
if (K) {
  const F = K.ueberall_fair || {}, V = KV && (KV.ueberall_fair || KV.ueberall) || {};
  ok('noten-praezision-70', {fair: F.praez, quote: F.quote, treffer: F.treffer, gefunden: F.gef, streng: K.ueberall && K.ueberall.praez, browser: S2 && R2('ueberall-finden').v && R2('ueberall-finden').v.praezision, vorher: V.praez, ziel: 0.7}, F.praez >= 0.7);
  const z = K.sdr_zerlegt, nd = 0.05; ok('uebernehmen-verschlechtert-nicht', {zerlegt: z, zuordnen_takt1: K.sdr_zu_takt1, alle: K.sdr_alle, alle_n: K.alle_n, vorher: KV && [KV.sdr_zerlegt, KV.sdr_zu_takt1, KV.sdr_alle], nachNoten: S2 && R2('verfeinern-nach-noten').v},
    K.sdr_zu_takt1 >= z - nd && K.sdr_alle >= z - nd && (!S2 || (R2('verfeinern-nach-noten').v || {}).nach >= (R2('verfeinern-nach-noten').v || {}).vor));
  if (S2) ok('uebernehmen-undo', R2('alle-uebernehmen-undo-redo').v, R2('alle-uebernehmen-undo-redo').ok);
  const P = K.profi || {}; ok('profi-ebene-als-quelle', Object.assign({hinweis: 'Profi-Lauf simuliert (Auftrag fertig, Bass-Ebene z bass); Modell-Lauf selbst: ki1-test'}, P), P.profi === true && P.vorlage === true && P.z === 'bass' && P.praez >= 0.7);
  const PA = K.pad_allein || {}, PG = K.pad_gemisch || {};
  ok('mehrstimmig-akkord-toene', {allein: [PA.treffer, PA.wahr, PA.praez], gemisch: [PG.treffer, PG.wahr, PG.praez], mehrstimmig: !!(PA.mehr || PG.mehr), ziel: 'allein ≥ 50 % Akkord-Töne bei Präzision ≥ 50 %'}, PA.quote >= 0.5 && PA.praez >= 0.5);
}
if (KL) {
  const ks = Object.keys(KL).filter(k => KL[k] && KL[k].abstandAlt), rows = ks.map(k => ({k, wahr: KL[k].wahr, vorher: KL[k].abstandAlt[0], nachher: KL[k].abstandAlt[1]}));
  const mv = rows.reduce((s, r) => s + r.vorher, 0) / (rows.length || 1), mn = rows.reduce((s, r) => s + r.nachher, 0) / (rows.length || 1), schlechter = rows.filter(r => r.nachher > r.vorher + 0.1).map(r => r.k);
  ok('nachbau-abstaende-besser', {je: rows.map(r => r.k + ' ' + r.vorher + ' → ' + r.nachher), mittel: [f2(mv), f2(mn)], schlechter}, rows.length && mn < mv && !schlechter.length);
  ok('nachbau-ohne-fehler', KL.fehler || [], !(KL.fehler || []).length);
}
if (LP) {
  const L = k => LP[k] || {ok: false};
  ok('loop-gespeichert', {doc: L('loop-im-dokument').v, nachNeuLaden: L('loop-nach-neu-laden').v}, L('loop-im-dokument').ok && L('loop-nach-neu-laden').ok);
  ok('loop-abspielbar', {kreis: L('loop-spielt-im-kreis').v, naht: L('loop-naht').v, stopp: L('loop-stopp').ok}, L('loop-spielt-im-kreis').ok && L('loop-naht').ok && L('loop-stopp').ok);
  ok('loop-undo', {undoRedo: L('loop-undo-redo').ok, weg: L('loop-weg-im-dokument').v}, L('loop-undo-redo').ok && L('loop-weg-im-dokument').ok);
}
if (S2 || LP) {
  const ks = ['layout-428x926', 'layout-926x428', 'layout-926x370', 'layout-428x926-matrix-offen'], v = {};
  for (const k of ks) v[k] = S2 ? R2(k).ok : null; if (LP) { v['loop-zeile-hochkant'] = (LP['loop-zeile-hochkant'] || {}).ok; v['loop-zeile-quer-370'] = (LP['loop-zeile-quer-370'] || {}).ok; }
  ok('layout-3-groessen', v, Object.values(v).every(x => x !== false) && (!S2 || ks.every(k => R2(k).ok)));
  const e = [].concat(S2 ? S2.errs || [] : [], LP && LP['keine-fehler'] ? LP['keine-fehler'].v || [] : [], KL ? KL.fehler || [] : []);
  ok('keine-konsolenfehler', e.slice(0, 5), !e.length && (!LP || (LP['keine-fehler'] || {}).ok));
}
if (S2) { const bad = Object.entries(S2.res).filter(([k, v]) => !v.ok).map(([k]) => k), alt = ['zerlegen-bass-ziel'];
  ok('regression-spk2-test', {ok: Object.keys(S2.res).length - bad.length, von: Object.keys(S2.res).length, fehler: bad, sek: S2.sek}, bad.every(k => alt.includes(k))); }
const info = {kern: K, kernVorher: KV, datei: file, vorher, sek: sek()};
fs.writeFileSync(path.join(dir, 'spk3-test.json'), JSON.stringify({res, info}, null, 1));
const bad = Object.entries(res).filter(([, v]) => !v.ok).map(([k]) => k);
console.log((bad.length ? bad.length + ' FEHLER von ' + Object.keys(res).length + ': ' + bad.join(', ') : 'ALLE OK (' + Object.keys(res).length + ')') + ' · ' + sek() + ' s');
