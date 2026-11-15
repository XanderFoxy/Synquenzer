// SPKFIX Abnahme: sechs Spektral-Kleinfehler (OFFEN A8). Kern in Node (Sonden p2-name, p16), Seite in Playwright (pseite).
// Aufruf: node spkfix-test.mjs <abs. index.html>   → spkfix-test.json neben diesem Skript; Ausgang 1 bei Fehler
import {execFileSync} from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import {fileURLToPath} from 'node:url';
const D = path.dirname(fileURLToPath(import.meta.url)), file = path.resolve(process.argv[2] || path.join(D, 'index.html')), res = []; let fails = 0;
const EXTRA = 'spk8DspMake,spk10Okt,spk9DspMake,spk12SelFn,spk12Ras,spk12Fft,spk12Win,spk12Mag,spk12K2,spk12DspMake,spkfixS6,spkfixImpClean,spkfixName,spkfixMaskRange,spkfixPatch,spkfixUid,spkfixDspMake';
const run = s => execFileSync('node', [path.join(D, 'sonde', s), file], {env: Object.assign({}, process.env, {EXTRA, NODE_PATH: '/opt/node-tools/node_modules'}), encoding: 'utf8', timeout: 900000, maxBuffer: 1 << 26});
const ok = (k, v, c) => { res.push({k, v, ok: !!c}); if (!c) fails++; console.log((c ? 'OK     ' : 'FEHLER ') + k + ' ' + JSON.stringify(v)); };
const t0 = Date.now();
// (2) Notenname
{ const L = run('p2-name.mjs').trim().split('\n').filter(l => /soll/.test(l)).map(l => { const [f, art, , soll] = l.split(' '), j = JSON.parse(l.slice(l.indexOf('['))); return {f: +f, art, soll: Math.round(+soll), m: j[0] && j[0].m, fq: j[0] && j[0].f}; });
  const inR = L.filter(x => x.f >= 190);   // 110 Hz liegt unter dem Lead-Bereich (180 Hz), dort ist 180 der Rand
  ok('notenname-reiner-ton', inR.map(x => x.f + '→' + x.m + '/' + x.soll), inR.every(x => x.m === x.soll));
  ok('notenname-obertonreich-unveraendert', L.filter(x => x.art === 'harm'), L.filter(x => x.art === 'harm').every(x => x.m === x.soll && x.fq === 220.33)); }
// (1) und (6)
{ const J = run('p16.mjs').trim().split('\n').filter(l => l.startsWith('{')).map(l => JSON.parse(l)), a = J.find(x => x.fall === 'neu-rechnen'), b = J.find(x => x.fall === 'container-import');
  ok('audio-ebene-neu-gerechnet', {id: a.idVor + '→' + a.idNach, rms: a.rmsNote3, ms: a.ms}, a.idNach !== a.idVor && a.neu6 === 1 && Math.abs(a.rmsNote3.nach - a.rmsNote3.quelle) < 0.1 * a.rmsNote3.quelle);
  ok('audio-ebene-rest-bitgleich', {maxAbwVorne: a.maxAbwVorne}, a.maxAbwVorne === 0);
  ok('audio-ebene-ein-undo', {undo: a.undo, redoId: a.redoId}, a.undo.id === a.idVor && a.undo.maxAbw === 0 && a.redoId === a.idNach && /In Ebene/.test(a.undo.label));
  ok('container-import-alte-streifen-weg', b, b.rmsStreifen2.vorImport > 0.01 && b.rmsStreifen2.nachImport === 0 && b.rmsVorne > 0.01); }
// (3) (4) (5) Seite
{ const j = JSON.parse(run('pseite.mjs').trim().split('\n').filter(l => l.startsWith('{')).pop());
  ok('loop-matrix-audio-eigene-spur', j.loop, j.loop && j.loop.orig.spur === 'Original' && j.loop.bass.spur === 'Bass' && j.loop.bass.szene === 0);
  ok('nachbau-im-dokument', {kl1: j.kl1, kl2: j.kl2}, j.kl1 && j.kl1.imDokument && j.kl2 && j.kl2.nachNeuladen === true);
  ok('klangkorn-erster-ton-quelle-da', j.korn, j.korn && j.korn.quelleNach700ms && j.korn.sofortGefuettert === 1);
  ok('worker-neu-gerechnet', j.wk, j.wk && j.wk.how === 'worker' && j.wk.neu6 === 1 && j.wk.id1 !== j.wk.id2);
  ok('konsole-ohne-fehler', j.errs, !j.fehler && j.errs.length === 0); }
fs.writeFileSync(path.join(D, 'spkfix-test.json'), JSON.stringify({file, fails, s: Math.round((Date.now() - t0) / 1000), res}, null, 1));
console.log(fails ? 'FEHLER ' + fails : 'ALLES OK', res.length, 'Prüfungen', Math.round((Date.now() - t0) / 1000), 's'); process.exit(fails ? 1 : 0);
