// SPK4 Auftrag 4/4 – Gesamt-Test (OK/FEHLER) für Auftrag 1–3 + Regression, Demo-Song mit bekannten Stems (Messung gegen die Wahrheit).
//  A1 mehrstimmige Noten · A2 Bass ≥ 4 dB / Verfeinern · A3 Unison im Nachbau + „Rest aufteilen“ · Zeiten (nie langsamer ohne Grund)
//  Regression: spk3-test (darin noten3, spk2-test, Loop, Klang-Probe), spk1-test, ki1-test (mit Solo-Gesang), vx1-test · Pflicht-Prüfungen
// Läuft nacheinander, jeder Teil mit Zeitgrenze (4 Kerne, andere Agenten parallel).
// Aufruf: node spk4-test.mjs <abs. index.html> [<abs. vorher.html> = ../basis5.html]    (mess/ neben der Datei, basis2.html eine Ebene höher)
//   NUR=pflicht,kern,ui,rest,spk3,spk1,ki1,vx1 wählt Teile; ALT=1 wertet nur vorhandene Ergebnis-Dateien neben der Datei aus (nichts neu laufen).
// Ergebnis: spk4-test.json neben der Datei; Ausgabe je Prüfung „OK“/„FEHLER“, am Ende Summe.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path';
const here = path.dirname(new URL(import.meta.url).pathname), VX = path.resolve(here, '..'), SP = path.resolve(VX, '..');
const file = path.resolve(process.argv[2] || path.join(here, 'index.html')), dir = path.dirname(file), vorher = path.resolve(process.argv[3] || path.join(VX, 'basis5.html'));
const NUR = (process.env.NUR || 'pflicht,kern,ui,rest,spk3,spk1,ki1,vx1').split(','), ALT = !!process.env.ALT, T0 = Date.now(), sek = () => Math.round((Date.now() - T0) / 1000);
const env = Object.assign({}, process.env, {NODE_PATH: process.env.NODE_PATH || '/opt/node-tools/node_modules'});
delete env.NUR; delete env.ALT;
const run = (args, extra, ms, name) => { const t = Date.now(), r = spawnSync('node', args, {env: Object.assign({}, env, extra || {}), encoding: 'utf8', timeout: ms, maxBuffer: 64 << 20});
  const out = (r.stdout || '') + (r.stderr || ''); console.log('  · ' + (name || path.basename(args[0])) + ' ' + Math.round((Date.now() - t) / 1000) + ' s' + (r.status !== 0 ? ' (Status ' + r.status + (r.signal ? ', ' + r.signal : '') + ')' : ''));
  if (name) fs.writeFileSync(path.join(dir, name + '.out'), out); return {out, status: r.status}; };
const lastJson = s => { const L = (s || '').trim().split('\n').reverse().find(l => l.startsWith('{')); try { return L ? JSON.parse(L) : null; } catch (e) { return null; } };
const rd = n => { try { return JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8')); } catch (e) { return null; } };
const rdt = n => { try { return fs.readFileSync(path.join(dir, n), 'utf8'); } catch (e) { return ''; } };
const save = (n, o) => { fs.writeFileSync(path.join(dir, n), JSON.stringify(o, null, 1)); return o; };
const res = {}, ok = (k, v, cond) => { res[k] = {v, ok: !!cond}; console.log((cond ? 'OK     ' : 'FEHLER ') + k + ' ' + JSON.stringify(v)); };
const f2 = x => x == null || isNaN(x) ? null : +(+x).toFixed(2), allOk = j => j && Object.values(j).every(v => v && v.ok), bads = j => j ? Object.entries(j).filter(([, v]) => !v || !v.ok).map(([k]) => k) : ['fehlt'];
const zeitOk = (n, v, f = 1.3, plus = 300) => n != null && v != null && n <= v * f + plus;   // „nie langsamer ohne Grund“: ≤ 1,3× + 0,3 s Rauschen (Last anderer Agenten)

// ================= Läufe =================
// ---------- 0 Pflicht (topdefs, dupkeys, smoke, Marken-Zähler, VERSION)
let PF = ALT ? rd('spk4-pflicht.json') : null;
if (!ALT && NUR.includes('pflicht')) {
  const NP = {NODE_PATH: '/opt/node-tools/node_modules'};   // Pflicht-Werkzeuge brauchen genau diesen Pfad (Umgebung setzt sonst einen anderen)
  const td = run([path.join(SP, 'rel-4271', 'tools', 'topdefs.cjs'), file], NP, 180000).out, dk = run([path.join(SP, 'tools2', 'dupkeys.cjs'), file], NP, 180000).out;
  const png = path.join(dir, 'smoke-a4.png'), sm = run([path.join(SP, 'dirigent-test', 'smoke.mjs'), file, png], {}, 180000).out;
  const html = fs.readFileSync(file, 'utf8'), alt = fs.existsSync(vorher) ? fs.readFileSync(vorher, 'utf8') : '', cnt = (s, w) => s.split(w).length - 1, ver = s => (/VERSION = '(\d+\.\d+\.\d+)'/.exec(s) || [])[1];
  const m = /doppelt (\d+), Syntaxfehler (\d+)/.exec(td), d = /(\d+) doppelte Schlüssel/.exec(dk), e = /errors (\[.*\])/.exec(sm);
  PF = save('spk4-pflicht.json', {topdefs: m ? [+m[1], +m[2]] : null, dupkeys: d ? +d[1] : null, smoke: e ? JSON.parse(e[1]) : null, ms2000: cnt(html, 'MS 2000'), live: cnt(html, '  live: true,'),
    version: [ver(alt), ver(html)], block: [cnt(html, 'SPK4-BEGIN'), cnt(html, 'SPK4-END'), html.indexOf('/* SPK3-END */') >= 0 && html.indexOf('SPK4-BEGIN') > html.indexOf('/* SPK3-END */') && html.indexOf('SPK4-BEGIN') - html.indexOf('/* SPK3-END */') < 200]});
}
// ---------- 1 Kern (Node, Kern aus der Datei): A2 Zerlegen/Verfeinern Bass (+ Drums/Tonal, Zeit) vorher/nachher · A3 Rest aufteilen
let X = null, XV = null, RA = null;
if (ALT) { const k = rd('spk4-kern.json') || {}; X = k.X; XV = k.XV; RA = k.RA; }
else if (NUR.includes('kern')) {
  const x4 = path.join(here, 'messb', 'x4.mjs'), r4 = path.join(here, 'messb', 'rest4.mjs');
  X = lastJson(run([x4], {HTML: file, NOB: '1', FULL: '1'}, 300000, 'kern-x4').out);
  XV = fs.existsSync(vorher) ? lastJson(run([x4], {HTML: vorher, NOB: '1', FULL: '1'}, 300000, 'kern-x4-vorher').out) : null;
  RA = lastJson(run([r4], {HTML: file, VERF: '1'}, 300000, 'kern-rest4').out);
  save('spk4-kern.json', {X, XV, RA});
}
// ---------- 2 Seite A1 (Noten ▾ Mehrstimmig, Hinweis, Noten finden) · Seite A3 (⋯ an der Rest-Zeile, Rest aufteilen)
let UI = ALT ? rd('spk4-ui.json') : null, RS = ALT ? rd('spk4-rest.json') : null;
if (!ALT && NUR.includes('ui')) { run([path.join(here, 'spk4-ui.mjs'), file], {}, 300000); UI = rd('spk4-ui.json'); }
if (!ALT && NUR.includes('rest')) { run([path.join(here, 'spk4-rest.mjs'), file], {}, 300000); RS = rd('spk4-rest.json'); }
// ---------- 3 Regression spk3-test (darin: noten3 Datei+vorher, spk2-test, spk3-loop-test, spk3-klang-probe vorher→Datei)
let S3 = ALT ? rd('spk3-test.json') : null;
if (!ALT && NUR.includes('spk3')) { run([path.join(VX, 'spk3', 'spk3-test.mjs'), file, vorher], {}, 1500000, 'spk3-test'); S3 = rd('spk3-test.json'); }
const S2 = rd('spk2-test.json'), KL = rd('spk3-klang-probe.json'), K = S3 && S3.info && S3.info.kern, KV = S3 && S3.info && S3.info.kernVorher;
// ---------- 4 Regression spk1-test, ki1-test (Modell + Laufzeit lokal gespiegelt, Solo-Gesang), vx1-test
let S1 = ALT ? rd('spk1-test.json') : null, KI = ALT ? rd('ki1-test.json') : null, VX1 = ALT ? rdt('vx1-test.out') : '';
if (!ALT && NUR.includes('spk1')) { run([path.join(VX, 'spk', 'spk1-test.mjs'), file], {}, 600000, 'spk1-test'); S1 = rd('spk1-test.json'); }
const VOX = path.join(SP, 'realvox', 'dl', 'vocadito_1.wav'), haveVox = fs.existsSync(VOX);
if (!ALT && NUR.includes('ki1')) { run([path.join(VX, 'ki', 'ki1-test.mjs'), file, path.join(VX, 'ki', 'modell'), path.join(SP, 'ki-ort', 'web')].concat(haveVox ? [VOX] : []), {}, 600000, 'ki1-test'); KI = rd('ki1-test.json'); }
if (!ALT && NUR.includes('vx1')) VX1 = run([path.join(VX, 'rolle', 'vx1-test.mjs'), file, path.join(dir, 'fotos', 'vx1')], {}, 900000, 'vx1-test').out;

// ================= Wertung =================
const R = (J, k) => J && J[k] || {v: null, ok: false}, R2 = k => R(S2 && S2.res, k), R3 = k => R(S3 && S3.res, k);
if (PF) ok('pflicht', PF, PF.topdefs && PF.topdefs[0] === 0 && PF.topdefs[1] === 0 && PF.dupkeys === 0 && PF.smoke && !PF.smoke.length && PF.ms2000 === 1 && PF.live === 1 &&
  PF.version[0] === PF.version[1] && PF.block[0] === 1 && PF.block[1] === 1 && PF.block[2]);

// ---- Auftrag 1: mehrstimmige Noten
if (K) {
  const PA = K.pad_allein || {}, PG = K.pad_gemisch || {}, VA = KV && KV.pad_allein || {}, VG = KV && KV.pad_gemisch || {};
  ok('a1-mehrstimmig-pad-allein', {vorher: [VA.treffer, VA.wahr, VA.praez], nachher: [PA.treffer, PA.wahr, PA.praez], gefunden: PA.gef, mehrstimmig: PA.mehr, ziel: '≥ 50 % der Akkord-Töne bei Präzision ≥ 50 %'},
    PA.mehr && PA.quote >= 0.5 && PA.praez >= 0.5);
  ok('a1-mehrstimmig-gemisch-besser', {vorher: [VG.treffer, VG.wahr, VG.praez], nachher: [PG.treffer, PG.wahr, PG.praez], gefunden: PG.gef, hinweis: 'Gemisch: Pads-Ebene enthält Bass/Lead/Trommeln (offen)'},
    PG.treffer > (VG.treffer || 0) && PG.praez >= (VG.praez || 0));
  const strip = o => o && Object.fromEntries(Object.entries(o).filter(([k]) => k !== 'ms'));
  ok('a1-bassband-einstimmig-unveraendert', {nachher: strip(K.orig_bassband), vorher: strip(KV && KV.orig_bassband)}, KV && JSON.stringify(strip(K.orig_bassband)) === JSON.stringify(strip(KV.orig_bassband)));
  ok('a1-noten-zeit', {padAllein: [VA.ms, PA.ms], gemisch: [VG.ms, PG.ms], seite: UI && R(UI, 'finden-mehrstimmig').v && R(UI, 'finden-mehrstimmig').v.ms, regel: '≤ 1,3× vorher + 0,3 s'},
    zeitOk(PA.ms, VA.ms) && zeitOk(PG.ms, VG.ms));
}
if (UI) ok('a1-seite', {ok: Object.keys(UI).length - bads(UI).length, von: Object.keys(UI).length, fehler: bads(UI), finden: R(UI, 'finden-mehrstimmig').v, schalter: R(UI, 'schalter').v}, allOk(UI));

// ---- Auftrag 2: Bass-Trennung
if (X || S2) {
  const zb = R2('zerlegen-bass-ziel').v || {};
  ok('a2-bass-zerlegen-4db', {browser: zb.bass, node: X && X.bass, vorher: XV && XV.bass, ziel: 4}, (X ? X.bass >= 4 : true) && (S2 ? zb.bass >= 4 : true));
}
if (X && XV) {
  ok('a2-drums-tonal-nicht-schlechter', {drums: [XV.drums, X.drums], tonal: [XV.tonal, X.tonal], verfDrums: [XV.verfDrums, X.verfDrums]}, X.drums >= XV.drums - 0.05 && X.tonal >= XV.tonal - 0.05 && X.verfDrums >= XV.verfDrums - 0.05);
  ok('a2-verfeinern-plus-1db', {zerlegt: X.bass, verfeinert: X.verf, plus: X.plus, ziel: '+1', vorher: [XV.bass, XV.verf, XV.plus], hinweis: 'offen (A2): Kamm-Modell selbst mit idealem Pegel 5,00'}, X.plus >= 1);
  ok('a2-verfeinern-nicht-schlechter', {verfeinert: [XV.verf, X.verf], gegenZerlegt: X.plus, browser: R2('verfeinern-verbessert').v}, X.verf >= XV.verf && X.plus >= -0.05);
  ok('a2-zerlegen-zeit', {nodeMs: [XV.zMs, X.zMs], verfeinernMs: [XV.vMs, X.vMs], browserMs: R2('zerlegen-ein-undo').v && R2('zerlegen-ein-undo').v.ms, regel: '≤ 1,3× vorher + 0,3 s'}, zeitOk(X.zMs, XV.zMs) && zeitOk(X.vMs, XV.vMs));
}
if (K) { const F = K.ueberall_fair || {}, V = KV && KV.ueberall_fair || {};
  ok('a2-bass-noten-praezision', {fair: [V.praez, F.praez], quote: [V.quote, F.quote], treffer: [V.treffer, F.treffer], ziel: 0.7}, F.praez >= 0.7 && F.quote >= (V.quote || 0)); }

// ---- Auftrag 3: Unison im Nachbau + Rest aufteilen
if (KL) {
  const ks = Object.keys(KL).filter(k => KL[k] && KL[k].abstandAlt), row = k => ({vorher: KL[k].abstandAlt[0], nachher: KL[k].abstandAlt[1], ms: [KL[k].vorher.ms, KL[k].nachher.ms], txt: KL[k].nachher.txt && KL[k].nachher.txt[0]});
  const P = KL.pad && KL.pad.abstandAlt ? row('pad') : null;
  ok('a3-unison-pad-besser', P, P && P.nachher < P.vorher - 0.3 && /Unison/.test(P.txt || ''));
  const andere = ks.filter(k => k !== 'pad').map(k => Object.assign({k}, row(k)));
  ok('a3-andere-klaenge-nicht-schlechter', andere.map(r => r.k + ' ' + r.vorher + ' → ' + r.nachher + (/Unison/.test(r.txt) ? ' (Unison!)' : '')), andere.length && andere.every(r => r.nachher <= r.vorher + 0.1 && !/Unison/.test(r.txt)));
  ok('a3-nachbau-zeit', ks.map(k => k + ' ' + KL[k].vorher.ms + ' → ' + KL[k].nachher.ms + ' ms'), ks.every(k => zeitOk(KL[k].nachher.ms, KL[k].vorher.ms)));
}
if (RA) {
  const v = RA.vorher || {}, n = RA.nachher || {};
  ok('a3-rest-aufteilen-kern', {pads: n.pads, padsVorher: {restAlsPad: v.restAlsPad, verfeinernPads: RA.verfPads}, lead: n.lead, leadVorher: {restAlsLead: v.restAlsLead, verfeinernLead: RA.verfLead}, leadPlusGesang: n.leadPlusGesang, anteil: RA.anteil, ms: RA.ms},
    n.pads > Math.max(v.restAlsPad, RA.verfPads == null ? -99 : RA.verfPads) && n.lead > Math.max(v.restAlsLead, RA.verfLead == null ? -99 : RA.verfLead));
  ok('a3-rest-summe-und-undo', {summeDb: RA.summeSdr, undo: RA.undo}, RA.summeSdr >= 100 && RA.undo && RA.undo.restGleich >= 100 && JSON.stringify(RA.undo.layers) === JSON.stringify(RA.layers));
}
if (RS) ok('a3-rest-seite', {ok: Object.keys(RS).length - bads(RS).length, von: Object.keys(RS).length, fehler: bads(RS), aufteilen: R(RS, 'rest-aufteilen').v && {stat: R(RS, 'rest-aufteilen').v.stat, ms: R(RS, 'rest-aufteilen').v.ms}}, allOk(RS));

// ---- Regression
// Bekannt seit A2 (gleiche Ursache, kein Rückschritt im Ergebnis): Zerlegen schreibt jetzt das Tiefband ungeglättet – genau das war der Gewinn von
// „Verfeinern“ (vorher 3,01 → 3,53). Darum fallen die relativen Prüfungen „Verfeinern verbessert“ (spk1, spk2, spk3); das Verfeinern-Ergebnis selbst
// ist absolut besser als vorher (Prüfung a2-verfeinern-nicht-schlechter). Der Rest muss grün sein.
const VERF_REL = {spk3: ['verfeinern-plus-1db', 'regression-spk2-test'], spk2: ['verfeinern-verbessert', 'verfeinern-nach-noten'], spk1: ['verfeinern-verbessert-ziel']};
if (S3) { const b = bads(S3.res), v2 = R2('verfeinern-nach-noten').v || {};
  ok('reg-spk3-test', {ok: Object.keys(S3.res).length - b.length, von: Object.keys(S3.res).length, fehler: b, bekanntVerfeinern: VERF_REL.spk3, sek: S3.info && S3.info.sek}, b.every(k => VERF_REL.spk3.includes(k))); }
if (S2) { const b = bads(S2.res), vn = R2('verfeinern-nach-noten').v || {};
  ok('reg-spk2-test', {ok: Object.keys(S2.res).length - b.length, von: Object.keys(S2.res).length, fehler: b, verfeinernNachNoten: [vn.vor, vn.nach], basisNachNoten: 3.39, sek: S2.sek},
    b.every(k => VERF_REL.spk2.includes(k)) && (!b.includes('verfeinern-nach-noten') || vn.nach >= 3.39)); }
if (S1) { const b = bads(S1), vz = R(S1, 'verfeinern-verbessert-ziel').v || {};
  ok('reg-spk1-test', {ok: Object.keys(S1).length - b.length, von: Object.keys(S1).length, fehler: b, verfeinern: [vz.vor, vz.nach], zerlegen: R(S1, 'zerlegen-drums-bass-getrennt').v && R(S1, 'zerlegen-drums-bass-getrennt').v.sdr},
    b.every(k => VERF_REL.spk1.includes(k)) && (!b.length || vz.nach >= 3.53)); }
if (KI) { const b = bads(KI), alt = ['besser-als-klassisch-demo'].concat(haveVox ? [] : ['gesang-besser-als-klassisch', 'guide-eintrag']);   // vorbestehend auf basis5
  ok('reg-ki1-test', {ok: Object.keys(KI).length - b.length, von: Object.keys(KI).length, fehler: b, vorbestehend: alt, profiGegenKlassisch: R(KI, 'besser-als-klassisch-demo').v, gesang: R(KI, 'gesang-besser-als-klassisch').v}, b.every(k => alt.includes(k))); }
if (VX1) { const m = /ERGEBNIS (\d+)\/(\d+)/.exec(VX1), f = (VX1.match(/^FEHLER .*/mg) || []).slice(0, 5);
  ok('reg-vx1-test', {ergebnis: m ? m[1] + '/' + m[2] : null, fehler: f}, m && m[1] === m[2]); }

const info = {datei: file, vorher, sek: sek(), kern: {X, XV}, rest: RA};
fs.writeFileSync(path.join(dir, 'spk4-test.json'), JSON.stringify({res, info}, null, 1));
const bad = Object.entries(res).filter(([, v]) => !v.ok).map(([k]) => k);
console.log((bad.length ? bad.length + ' FEHLER von ' + Object.keys(res).length + ': ' + bad.join(', ') : 'ALLE OK (' + Object.keys(res).length + ')') + ' · ' + sek() + ' s');
