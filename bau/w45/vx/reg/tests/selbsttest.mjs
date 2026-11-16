// REG: Selbsttest der Wertung (lauf.mjs) mit künstlichen Test-Ausgaben – deckt die Prüfer-Befunde 1, 2, 4 ab. Aufruf: node selbsttest.mjs [<ordner>]
import { execFileSync, spawnSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path';
const here = path.dirname(new URL(import.meta.url).pathname), O = process.argv[2] || path.join(here, '..', 'selbsttest-out');
fs.rmSync(O, {recursive: true, force: true}); fs.mkdirSync(O, {recursive: true});
const { werte, urteil } = await import(path.join(here, 'lauf.mjs'));
const RG = JSON.parse(fs.readFileSync(path.join(here, 'bekannt.json'), 'utf8')), SL = JSON.parse(fs.readFileSync(path.join(here, 'soll.json'), 'utf8'));
let ok = 0, fe = 0; const pr = (n, c, x) => { c ? ok++ : fe++; console.log((c ? 'OK     ' : 'FEHLER ') + n + (x ? ' ' + JSON.stringify(x) : '')); };
const sh = (n, body) => { const f = path.join(O, n + '.sh'); fs.writeFileSync(f, '#!/bin/bash\n' + body + '\n'); return f; };
const lauf = (name, script, env = {}, to = 30) => { spawnSync('node', [path.join(here, 'lauf.mjs'), name, O, String(to), '--', 'bash', script], {env: Object.assign({}, process.env, {WDH: '0'}, env), encoding: 'utf8'});
  return JSON.parse(fs.readFileSync(path.join(O, name + '.json'), 'utf8')); };
const oks = k => Array.from({length: k}, (_, i) => 'echo "OK p' + i + '"').join('\n');
// 1 Befund 2: bekannte FEHL-Zeile, danach Absturz mit Stacktrace, Exit 1 → ROT (nicht BEKANNT)
let j = lauf('spk1', sh('a1', oks(30) + '\necho "FEHL verfeinern-verbessert-ziel {}"\necho "TypeError: x is null" >&2; echo "    at f (/x/y.mjs:3:4)" >&2; echo "Node.js v22.22.0" >&2; exit 1'));
pr('absturz-hinter-bekannter-zeile-rot', j.urteil === 'ROT' && j.struktur.length > 0, [j.urteil, j.struktur]);
// 2 Befund 2: bekannte Zeile, danach Zeitlimit → ROT
j = lauf('ki1', sh('a2', oks(20) + '\necho "FEHL besser-als-klassisch-demo {}"\nsleep 30'), {}, 2);
pr('zeitlimit-hinter-bekannter-zeile-rot', j.urteil === 'ROT' && j.exit === 'timeout' && /Zeitlimit/.test(j.struktur.join()), [j.urteil, j.exit]);
// 3 Befund 2: leerer Lauf (true) → ROT
j = lauf('vxr2lyr', sh('a3', 'true'));
pr('leerer-lauf-rot', j.urteil === 'ROT' && /leer|Prüfungen/.test(j.struktur.join()), [j.urteil, j.struktur]);
// 4 Befund 2: spk9p (nur verboten-Regel früher) ohne Ergebnis → ROT über muss
j = lauf('spk9p', sh('a4', 'echo start'));
pr('spk9p-ohne-ergebnis-rot', j.urteil === 'ROT', [j.urteil, j.struktur]);
// 5 Befund 1: spk10p prüft nur 'demo' (1 statt 11) → ROT „nur 1 von 11“
j = lauf('spk10p', sh('a5', 'echo "OK     demo 32/32"\necho "ERGEBNIS 1 OK / 0 FEHLER"'));
pr('spk10p-nur-demo-rot', j.urteil === 'ROT' && /nur 1 von 11/.test(j.struktur.join()), [j.urteil, j.struktur]);
// 6 spk10p vollständig (11) → GRÜN
j = lauf('spk10p', sh('a6', oks(11) + '\necho "ERGEBNIS 11 OK / 0 FEHLER"'));
pr('spk10p-11-gruen', j.urteil === 'GRÜN', [j.urteil, j.pruefungen]);
// 7 Befund 1: stderr des Job-Skripts (.err) nicht leer → ROT, auch wenn der Test grün ist
fs.writeFileSync(path.join(O, 'spk9f.err'), '[eval]:1\nSyntaxError: Invalid or unexpected token\n');
j = lauf('spk9f', sh('a7', 'echo \'{"ok":true}\''));
pr('job-stderr-rot', j.urteil === 'ROT' && /stderr/.test(j.struktur.join()), [j.urteil, j.struktur]);
fs.rmSync(path.join(O, 'spk9f.err'));
j = lauf('spk9f', sh('a7b', 'echo \'{"ok":true}\'')); pr('spk9f-ohne-err-gruen', j.urteil === 'GRÜN', [j.urteil]);
// 8 erlaubter Exit 1 (beg1 meldet FEHLER so) mit nur bekannter Zeile, volle Prüfungszahl → BEKANNT; Exit 1 bei Test ohne exit-Regel → ROT
j = lauf('beg1', sh('a8', oks(57) + '\necho "FEHLER Prüfung 5 – 5/4 ohne passenden Stil xyz"\nexit 1'));
pr('beg1-exit1-bekannt', j.urteil === 'BEKANNT', [j.urteil, j.struktur, j.pruefungen]);
j = lauf('beg1', sh('a8b', oks(40) + '\necho "FEHLER Prüfung 5 – 5/4 ohne passenden Stil xyz"\nexit 1'));
pr('beg1-zu-wenige-pruefungen-rot', j.urteil === 'ROT' && /nur 41 von 58/.test(j.struktur.join()), [j.urteil, j.struktur]);
j = lauf('spk1', sh('a8c', oks(30) + '\necho "FEHL verfeinern-verbessert-ziel {}"\nexit 1'));
pr('exit1-ohne-regel-rot', j.urteil === 'ROT', [j.urteil, j.struktur]);
// 9 Befund 4: Urteil nach Fremdlast (Last − eigene Tests), nicht nach Gesamtlast
const R = RG.fokus1, wZ = werte('OK a\nFEHL 428x926 umschalten-rest longtasks<=50 {}\nEXIT 1\n', {code: 1}, R, {n: 2});
pr('fremdlast-pool-4-jobs-last-5-rot', urteil(wZ, {last: {mittel: 5, fremd: 1}}, R, false, false, 4) === 'ROT');
pr('fremdlast-9-last', urteil(wZ, {last: {mittel: 13, fremd: 9}}, R, false, false, 4) === 'LAST');
const wX = werte('OK a\nFEHL Akkord folgen xyz\nEXIT 1\n', {code: 1}, RG.beg1, {n: 2});
pr('echtzeit-ungueltig-nur-bei-fremdlast', urteil(wX, {last: {mittel: 9, fremd: 2}}, RG.beg1, false, false, 4) === 'ROT' && urteil(wX, {last: {mittel: 20, fremd: 16}}, RG.beg1, false, false, 4) === 'UNGÜLTIG (Last)');
const wS = werte('OK a\n', {code: 'timeout'}, RG.beg1, {n: 1});
pr('struktur-nie-ungueltig', urteil(wS, {last: {mittel: 40, fremd: 36}}, RG.beg1, false, false, 4) === 'ROT');
// 10 ALLEIN-Lauf: Pool-Ergebnis bleibt erhalten, Urteil „GRÜN (allein)“
lauf('fokus1', sh('a10', oks(44) + '\necho "FEHL 428x926 umschalten-rest longtasks<=50 {}"\nexit 1'));
j = lauf('fokus1', sh('a10b', oks(51)), {ALLEIN: '1'});
pr('allein-gruen-mit-pool', j.urteil === 'GRÜN (allein)' && j.pool && /ROT|LAST/.test(j.pool.urteil) && fs.existsSync(path.join(O, 'fokus1.allein.log')), [j.urteil, j.pool && j.pool.urteil]);
// 11 Tabelle: erwarteter Test ohne Ergebnis → ROT „kein Ergebnis“
fs.mkdirSync(path.join(O, 'jobs')); for (const n of ['spk10p', 'spk8f']) fs.writeFileSync(path.join(O, 'jobs', '001-' + n + '.sh'), '');
execFileSync('node', [path.join(here, 'tabelle.mjs'), O], {encoding: 'utf8'}); const md = fs.readFileSync(path.join(O, 'ERGEBNIS.md'), 'utf8');
pr('tabelle-fehlender-test-rot', /\| spk8f \|.*\*\*ROT\*\*.*kein Ergebnis/.test(md), null);
console.log('ERGEBNIS ' + ok + ' OK / ' + fe + ' FEHLER'); process.exit(fe ? 1 : 0);
