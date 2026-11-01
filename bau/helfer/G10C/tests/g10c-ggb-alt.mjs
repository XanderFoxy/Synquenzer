// GarageBand-Import im Takes-Blatt (G-GB) + alte Takes (Regel 28: Laden unverändert, K4-Nummern, erst eine Änderung hält sie fest)
import {boot, ok, inject, sheet, labels, pcmBursts} from './lib.mjs';
import path from 'path';
const BASE = path.resolve(new URL('../../../snapshots/R-4300.html', import.meta.url).pathname);
function wav(pcm, sr = 48000) { const n = pcm.length, b = Buffer.alloc(44 + n * 2); b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVE', 8); b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40); for (let i = 0; i < n; i++) b.writeInt16LE(pcm[i], 44 + i * 2); return b.toString('base64'); }
{
  const {b, p, errs} = await boot({width: 428, height: 926});
  await p.evaluate(() => SYNQUENZER.setSong({bars: 8, lanes: []}));
  const r1 = await p.evaluate(b64 => SYNQUENZER.ggbImport(b64, {}), wav(pcmBursts(4, [[.5, 1.5], [2, 3]])));
  ok(r1 && r1.vox, 'GarageBand-Datei importiert → Song-Stimme ' + (r1 && r1.vox));
  await p.evaluate(v => SYNQUENZER.tkSheet({vox: v}), r1.vox); await p.waitForTimeout(150); await p.evaluate(() => SYNQUENZER.g10cWaitPeaks());
  const row = await p.$eval('.tksheet .g10c-row[data-k="0"]', e => ({b: e.querySelector('b').textContent, nm: (e.querySelector('.g10c-nm') || {}).textContent, meta: e.querySelector('.g10c-meta').textContent}));
  ok(row.b === 'Take 1' && /^GarageBand \d\d:\d\d$/.test(row.nm) && /^Datei · 0:04 · \d\d:\d\d$/.test(row.meta), 'Import erscheint als Take 1 „' + row.nm + '“ · ' + row.meta);
  ok(await p.$eval('.tksheet .g10c-sum', e => e.textContent.startsWith('1 Aufnahme im Song · Takt')), 'Kopf: ' + await p.$eval('.tksheet .g10c-sum', e => e.textContent));
  const pk = await p.evaluate(() => SYNQUENZER.g10cPeaks(0));
  ok(pk && pk.some(v => v > 60), 'Mini-Welle des Imports gezeichnet');
  const r2 = await p.evaluate(b64 => SYNQUENZER.ggbImport(b64, {name: 'GarageBand 2'}), wav(pcmBursts(4, [[1, 2]])));
  await p.evaluate(v => SYNQUENZER.tkSheet({vox: v}), r2.vox); await p.waitForTimeout(150);
  let L = await labels(p);
  ok(L.join() === 'Take 2,Take 1', 'zweiter Import über dieselben Takte: neu = Take 2 oben, der erste bleibt Take 1 (stumm)');
  await p.tap('.tksheet .g10c-row[data-k="1"] button[data-a="g10c-fav"]'); await p.waitForTimeout(80);
  ok((await p.evaluate(() => SYNQUENZER.g10cInfo())).segs[1].fav === true, '★ im Song gesetzt');
  const u = await p.evaluate(() => SYNQUENZER.undoInfo());
  ok(u.top && u.top.kind === 'song', 'Undo-Art im Song: song');
  await p.evaluate(() => undo()); await p.waitForTimeout(80);
  ok(!(await p.evaluate(() => SYNQUENZER.g10cInfo())).segs[1].fav, 'Undo nimmt ★ zurück'); await p.evaluate(() => redo());
  await p.tap('.tksheet button[data-a="ab"]'); await p.waitForTimeout(80);
  L = await labels(p); ok(L.join() === 'Take 1,Take 2' && (await p.evaluate(() => SYNQUENZER.g10cInfo())).segs[0].fav, 'A/B im Song: ★ wandert mit Take 1 nach oben');
  ok(await p.$('.tksheet .ggb') != null, 'Feld „Mit GarageBand aufnehmen“ bleibt im Blatt');
  ok(errs.length === 0, 'keine Fehler ' + JSON.stringify(errs));
  await b.close();
}
{
  // alt: Projekt aus 4.30.0 mit 3 Takes (ohne Felder)
  const A = await boot({width: 428, height: 926}, {file: BASE});
  await inject(A.p, 3);
  const file = await A.p.evaluate(() => JSON.stringify(projectFileObj(S, false, true)));
  await A.p.evaluate(t => importJSON(t), file); await A.p.waitForTimeout(300);
  const ref = await A.p.evaluate(() => serialize());
  await A.b.close();
  const {b, p, errs} = await boot({width: 428, height: 926});
  await p.evaluate(t => importJSON(t), file); await p.waitForTimeout(300);
  const got = await p.evaluate(() => serialize());
  ok(got === ref, 'altes Projekt (4.30.0): geladen und gespeichert Zeichen für Zeichen gleich (Regel 28)');
  ok(!/"no":|"fav":|"tag":/.test(got), 'keine neuen Felder durch bloßes Laden');
  await sheet(p); await p.waitForTimeout(100);
  let L = await labels(p);
  ok(L.join() === 'Take 3,Take 2,Take 1', 'alte Takes: Nummern nach K4 (' + L.join(',') + ')');
  await p.tap('.tksheet .g10c-row[data-k="1"] .tk-del'); await p.waitForTimeout(100);
  L = await labels(p);
  ok(L.join() === 'Take 3,Take 1', 'alter Take 2 gelöscht → 3 und 1 bleiben (Nummern festgehalten)');
  await p.evaluate(() => undo()); await p.waitForTimeout(80);
  ok(await p.evaluate(() => serialize()) === ref, '↶ stellt das alte Projekt Zeichen für Zeichen wieder her');
  ok(errs.filter(e => !/Take fehlt|fehlt/.test(e)).length === 0, 'keine Fehler ' + JSON.stringify(errs));
  await b.close();
}
