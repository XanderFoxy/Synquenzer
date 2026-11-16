// SPKK Abnahme: A8 Spektral-Kleinfehler (1)–(4) auf <index>, Gegenprobe auf <basis>. Aufruf: node spkk-test.mjs <index> <basis>
// → spkk-test.json neben diesem Skript; Ausgang 1 bei Fehler. Sonden in sonde/ (p2-name, p16, pseite aus SPKFIX; p-finden, p-worker-finden, p-korn, p-finden-zeit neu).
import {execFileSync} from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import {fileURLToPath} from 'node:url';
const D = path.dirname(fileURLToPath(import.meta.url)), file = path.resolve(process.argv[2] || path.join(D, 'index.html')), basis = process.argv[3] ? path.resolve(process.argv[3]) : null, res = []; let fails = 0;
const EXTRA = 'spk8DspMake,spk10Okt,spk9DspMake,spk12SelFn,spk12Ras,spk12Fft,spk12Win,spk12Mag,spk12K2,spk12DspMake,spkfixS6,spkfixImpClean,spkfixName,spkfixMaskRange,spkfixPatch,spkfixUid,spkfixDspMake,spkkPk,spkkF0';
const run = (s, f = file) => execFileSync('node', [path.join(D, 'sonde', s), f], {env: Object.assign({}, process.env, {EXTRA, NODE_PATH: '/opt/node-tools/node_modules'}), encoding: 'utf8', timeout: 900000, maxBuffer: 1 << 26});
const ok = (k, v, c) => { res.push({k, v, ok: !!c}); if (!c) fails++; console.log((c ? 'OK     ' : 'FEHLER ') + k + ' ' + JSON.stringify(v)); };
const t0 = Date.now(), last = s => JSON.parse(s.trim().split('\n').filter(l => /^[\[{]/.test(l)).pop());
// (1) Notenname: „Noten finden“ (SPKFIX) und „Überall finden“ (SPKK)
{ const L = run('p2-name.mjs').trim().split('\n').filter(l => /soll/.test(l)).map(l => { const [f, art, , soll] = l.split(' '), j = JSON.parse(l.slice(l.indexOf('['))); return {f: +f, art, soll: Math.round(+soll), m: j[0] && j[0].m, fq: j[0] && j[0].f}; });
  const inR = L.filter(x => x.f >= 190);
  ok('1-notenname-noten-finden', inR.map(x => x.f + '→' + x.m + '/' + x.soll), inR.every(x => x.m === x.soll));
  ok('1-notenname-obertonreich-unveraendert', L.filter(x => x.art === 'harm'), L.filter(x => x.art === 'harm').every(x => x.m === x.soll && x.fq === 220.33));
  const F = last(run('p-finden.mjs')), rein = F.filter(x => x.art === 'sinus'), harm = F.filter(x => x.art === 'harm');
  ok('1-notenname-ueberall-finden', rein.map(x => x.f + '→' + x.neu.map(q => q.m).join('/')), rein.every(x => x.neu.length === 1 && x.neu[0].m === x.soll));
  ok('1-ueberall-finden-obertonreich-unveraendert', harm.map(x => x.neu), harm.every(x => x.neu.length === 1 && x.neu[0].m === x.soll && x.neu[0].f === 220));
  if (basis) { const G = last(run('p-finden.mjs', basis)).filter(x => x.art === 'sinus'); ok('1-gegenprobe-basis-rot', G.map(x => x.f + '→' + x.neu.map(q => q.m).join('/')), G.some(x => x.neu.length !== 1 || x.neu[0].m !== x.soll)); } }
// (1) dasselbe im echten Spektral-Worker der Seite (Worker-Text enthält spkkPk/spkkF0)
{ const w = last(run('p-worker-finden.mjs')); ok('1-ueberall-finden-im-worker', w, w.how === 'worker' && w.neu && w.neu.length === 1 && w.neu[0].m === 55 && !w.fehler && w.errs.length === 0); }
// (2) Neu rechnen nach Masken-Änderung, Container-Import (SPKFIX, Kern)
{ const J = run('p16.mjs').trim().split('\n').filter(l => l.startsWith('{')).map(l => JSON.parse(l)), a = J.find(x => x.fall === 'neu-rechnen'), b = J.find(x => x.fall === 'container-import');
  ok('2-audio-ebene-neu-gerechnet', {id: a.idVor + '→' + a.idNach, rms: a.rmsNote3, ms: a.ms}, a.idNach !== a.idVor && a.neu6 === 1 && Math.abs(a.rmsNote3.nach - a.rmsNote3.quelle) < 0.1 * a.rmsNote3.quelle);
  ok('2-audio-ebene-rest-bitgleich', {maxAbwVorne: a.maxAbwVorne}, a.maxAbwVorne === 0);
  ok('2-audio-ebene-ein-undo', {undo: a.undo, redoId: a.redoId}, a.undo.id === a.idVor && a.undo.maxAbw === 0 && a.redoId === a.idNach && /In Ebene/.test(a.undo.label));
  ok('2b-container-import-alte-streifen-weg', b, b.rmsStreifen2.vorImport > 0.01 && b.rmsStreifen2.nachImport === 0 && b.rmsVorne > 0.01); }
// (3) (4) Seite: Nachbau im Dokument, Loop-Spur, Klangkorn-Quelle, Worker
{ const j = last(run('pseite.mjs'));
  ok('4a-loop-matrix-audio-eigene-spur', j.loop, j.loop && j.loop.orig.spur === 'Original' && j.loop.bass.spur === 'Bass' && j.loop.bass.szene === 0);
  ok('3-nachbau-im-dokument-nach-neuladen', {kl1: j.kl1, kl2: j.kl2}, j.kl1 && j.kl1.imDokument && j.kl2 && j.kl2.nachNeuladen === true);
  ok('4b-klangkorn-quelle-nach-laden', j.korn, j.korn && j.korn.quelleNach700ms && j.korn.sofortGefuettert === 1);
  ok('2-worker-neu-gerechnet', j.wk, j.wk && j.wk.how === 'worker' && j.wk.neu6 === 1 && j.wk.id1 !== j.wk.id2);
  ok('konsole-ohne-fehler', j.errs, !j.fehler && j.errs.length === 0); }
// (4b) Ton vor der Quelle klingt, sobald die Quelle da ist (Nachfüttern im Kern)
{ const k = last(run('p-korn.mjs')); ok('4b-ton-vor-quelle-klingt-nach', k, k.vorQuelle === 0 && k.nachQuelle > 0.03 && k.ohneQuelleBeendet === 1); }
// Tempo „Überall finden“ (60 s): Index nicht langsamer als Basis (+15 % Spielraum, je 2 Läufe abwechselnd, Median)
if (basis) { const T = {b: [], i: []}; let Ni = null;
  for (let r = 0; r < 2; r++) { T.b.push(last(run('p-finden-zeit.mjs', basis))); const x = last(run('p-finden-zeit.mjs')); T.i.push(x); Ni = x; }
  const sum = A => A.map(z => z.reduce((s, q) => s + q.ms, 0)).sort((p, q) => p - q)[0], sb = sum(T.b), si = sum(T.i);
  ok('tempo-ueberall-finden', {basisMs: sb, indexMs: si, basis: T.b[0], index: Ni}, si <= sb * 1.15 + 50);
  ok('ueberall-finden-60s-namen', Ni, Ni.every(z => z.richtig === z.neu && z.neu >= 110)); }
fs.writeFileSync(path.join(D, 'spkk-test.json'), JSON.stringify({file, basis, fails, s: Math.round((Date.now() - t0) / 1000), res}, null, 1));
console.log(fails ? 'FEHLER ' + fails : 'ALLES OK', res.length, 'Prüfungen', Math.round((Date.now() - t0) / 1000), 's'); process.exit(fails ? 1 : 0);
