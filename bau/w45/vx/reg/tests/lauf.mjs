// REG: führt einen Regressions-Test aus, wertet FEHLER-Zeilen nach bekannt.json, prüft Exit/Zeitlimit/Prüfungs-Zahl (soll.json) und schreibt Last + Fremdlast mit.
// Aufruf: node lauf.mjs <name> <ausgabe-ordner> <timeout-s> -- <befehl …>     → <ordner>/<name>.log (+ .lauf1.log bei Wiederholung), <ordner>/<name>.json
// Umgebung: WDH=0 keine sofortige Wiederholung (run.sh wiederholt dann am Ende ALLEIN) · ALLEIN=1 Lauf allein am Ende (Log <name>.allein.log, Pool-Ergebnis bleibt in .pool)
//           WERTEN=1 vorhandenes Log mit den aktuellen Regeln neu werten (ohne Lauf) · REGEL=<bekannt.json> · SOLL=<soll.json>
// Urteile: GRÜN · GRÜN (Wdh.) · GRÜN (allein) · BEKANNT · INFO · LAST (nur Zeit-Prüfungen rot, Fremdlast > CPU) · UNGÜLTIG (Last) (Echtzeit-Test, nur Prüf-Zeilen rot,
//          Fremdlast > CPU) · ROT. Absturz, Zeitlimit, nicht erlaubter Exit, fehlende Prüfungen, leerer Lauf, Fehler im Job-Skript → immer ROT (nie LAST/BEKANNT).
import { spawn } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const [name, out, tos] = process.argv.slice(2, 5), cmd = process.argv.slice(process.argv.indexOf('--') + 1);
const here = path.dirname(new URL(import.meta.url).pathname), RG = JSON.parse(fs.readFileSync(process.env.REGEL || path.join(here, 'bekannt.json'), 'utf8'));
const SL = (() => { try { return JSON.parse(fs.readFileSync(process.env.SOLL || path.join(here, 'soll.json'), 'utf8')); } catch (e) { return {}; } })();
const R = RG[name] || {}, CPU = os.cpus().length, load = () => +fs.readFileSync('/proc/loadavg', 'utf8').split(' ')[0];
// Eigene Last: laufende REG-Tests (lauf.mjs-Prozesse dieses Werkzeugs, ohne WERTEN) – Fremdlast = Last − eigene Tests (≥ 0). Jeder Test zählt als 1 CPU (Schätzung).
const jobs = () => { let n = 0; for (const p of fs.readdirSync('/proc')) { if (!/^\d+$/.test(p)) continue; try { const c = fs.readFileSync('/proc/' + p + '/cmdline', 'utf8');
  if (c.includes(path.join(here, 'lauf.mjs')) && c.includes('\0--\0')) n++; } catch (e) {} } return n; };
const mk = L => (L || []).map(([re, why]) => [new RegExp(re), why]), BK = mk(R.bekannt), ZT = mk(R.zeit).concat((RG._zeit_alle || []).map(re => [new RegExp(re, 'i'), 'Long Tasks (alle Tests)']));
const STACK = /^Node\.js v\d+|^\s+at .*:\d+:\d+\)?\s*$|^(Uncaught|Unhandled)|UnhandledPromiseRejection/m;
function lauf(logf) { return new Promise(ok => { const t0 = Date.now(), L = [load()], J = [jobs()], fd = fs.openSync(logf, 'w');
  const p = spawn(cmd[0], cmd.slice(1), {stdio: ['ignore', fd, fd], env: Object.assign({}, process.env, {NODE_PATH: process.env.NODE_PATH || '/opt/node-tools/node_modules'})});
  const iv = setInterval(() => { L.push(load()); J.push(jobs()); }, 5000); let to = false; const k = setTimeout(() => { to = true; p.kill('SIGKILL'); }, (+tos || 1500) * 1000);
  const ende = (code, sig) => { clearInterval(iv); clearTimeout(k); L.push(load()); J.push(jobs()); fs.closeSync(fd); fs.appendFileSync(logf, 'EXIT ' + (code == null ? sig : code) + (to ? ' (Zeitlimit)' : '') + '\n');
    const avg = A => +(A.reduce((a, b) => a + b, 0) / A.length).toFixed(1), F = L.map((l, i) => Math.max(0, l - J[i]));
    ok({code: to ? 'timeout' : code == null ? String(sig) : code, sek: Math.round((Date.now() - t0) / 1000), last: {start: L[0], max: Math.max(...L), mittel: avg(L), eigene: avg(J), fremd: avg(F), fremdMax: +Math.max(...F).toFixed(1)}}); };
  p.on('exit', ende); p.on('error', e => { fs.appendFileSync(logf, 'START-FEHLER ' + e.message + '\n'); ende(127, null); }); }); }
export function werte(txt, r, R0 = R, soll = SL[name], errTxt = '') {
  const lines = txt.split('\n'), F = [], K = [], Z = [], X = [], S = [], bk = mk(R0.bekannt), zt = mk(R0.zeit).concat((RG._zeit_alle || []).map(re => [new RegExp(re, 'i'), 'Long Tasks (alle Tests)']));
  for (const l of lines) { const m = /^\s*(FEHLER|FEHL|FAIL)\b(?!:)\s*(.*)$/.exec(l); if (!m) continue; const t = m[2].trim();
    if (/^\d+\s*s$/.test(t) || /^\S+:\s*\d+\/\d+ bestanden/.test(t) || /^\d+ von \d+/.test(t)) continue; F.push(t);
    const b = bk.find(([re]) => re.test(t)), z = !b && zt.find(([re]) => re.test(t));
    (b ? K : z ? Z : X).push(t.slice(0, 160) + (b ? '  ⟶ ' + b[1] : z ? '  ⟶ ' + z[1] : '')); }
  const ok = lines.filter(l => /^\s*OK\b/.test(l)).length, n = ok + F.length, tail = lines.filter(l => l.trim() && !/^EXIT /.test(l)).slice(-3).join(' / ').slice(0, 200);
  const stack = STACK.test(txt);
  // S = Struktur-Fehler (nie Last, nie bekannt): Absturz, Zeitlimit, Exit, fehlende Prüfungen, leerer Lauf, Pflicht-Ausgabe, Job-Skript
  if (r.code === 'timeout') S.push('Zeitlimit – abgebrochen: ' + tail);
  else if (r.code !== 0) { const erlaubt = (R0.exit || []).includes(r.code) && F.length > 0 && !stack;
    if (!erlaubt) S.push('Exit ' + r.code + (stack ? ' mit Stacktrace (Absturz)' : F.length ? ' (nicht als Test-Ergebnis erlaubt)' : ' ohne FEHLER-Zeile (Absturz)') + ': ' + tail); }
  else if (stack && !R0.stackOk) S.push('Stacktrace im Log (Absturz eines Teils?): ' + ((/^.*(Error|Uncaught|Unhandled).*$/m.exec(txt) || [''])[0]).slice(0, 160));
  if (soll && soll.n != null && n < soll.n - (R0.toleranz || 0)) S.push('nur ' + n + ' von ' + soll.n + ' Prüfungen gelaufen (Referenz ' + (soll.ref || 'r4760') + ')');
  if (!n && !R0.muss && !R0.info) S.push('leerer Lauf: keine OK-/FEHLER-Zeile und keine Pflicht-Ausgabe-Regel');
  if (R0.muss && !new RegExp(R0.muss, 'm').test(txt)) S.push('Pflicht-Ausgabe fehlt: /' + R0.muss + '/');
  if (R0.verboten && new RegExp(R0.verboten, 'm').test(txt)) X.push('verbotene Ausgabe: /' + R0.verboten + '/');
  if (errTxt && errTxt.trim()) S.push('Job-Skript meldet Fehler (stderr): ' + errTxt.trim().split('\n').filter(Boolean).slice(-3).join(' / ').slice(0, 200));
  return {ok, fehl: F.length, n, K, Z, X, S}; }
export function urteil(w, r, R0 = R, wdh = false, allein = false, cpu = CPU) {
  const f = r.last.fremd != null ? r.last.fremd : r.last.mittel;
  if (w.S.length) return 'ROT';
  if (w.X.length) return R0.echtzeit && f > cpu ? 'UNGÜLTIG (Last)' : 'ROT';
  if (w.Z.length) return f > cpu ? 'LAST' : 'ROT';
  return allein ? 'GRÜN (allein)' : wdh ? 'GRÜN (Wdh.)' : w.K.length ? 'BEKANNT' : R0.info ? 'INFO' : 'GRÜN'; }
if (process.argv[1] && process.argv[1].endsWith('lauf.mjs') && name) {
  const ALLEIN = process.env.ALLEIN === '1', WERTEN = process.env.WERTEN === '1', errf = path.join(out, name + '.err');
  const logf = path.join(out, name + (ALLEIN ? '.allein' : '') + '.log'), jf = path.join(out, name + '.json');
  const vor = (() => { try { return JSON.parse(fs.readFileSync(jf, 'utf8')); } catch (e) { return null; } })();
  const errTxt = () => { try { return fs.readFileSync(errf, 'utf8'); } catch (e) { return ''; } };
  let r = WERTEN ? {code: vor.exit, sek: vor.sek, last: vor.last} : await lauf(logf), w = werte(fs.readFileSync(logf, 'utf8'), r, R, SL[name], errTxt()), r1 = null, w1 = null;
  if (!WERTEN && !ALLEIN && process.env.WDH !== '0' && !w.X.length && !w.S.length && w.Z.length) { fs.renameSync(logf, path.join(out, name + '.lauf1.log')); r1 = r; w1 = w; r = await lauf(logf); w = werte(fs.readFileSync(logf, 'utf8'), r, R, SL[name], errTxt()); }
  const u = urteil(w, r, R, !!w1, ALLEIN);
  const res = {name, urteil: u, ok: w.ok, fehl: w.fehl, pruefungen: w.n, soll: SL[name] ? SL[name].n : null, bekannt: w.K, zeit: w.Z, rot: w.X, struktur: w.S, exit: r.code, sek: r.sek + (r1 ? r1.sek : 0), last: r.last,
    wdh: r1 ? {sek: r1.sek, last: r1.last, zeit: w1.Z} : null, allein: ALLEIN, pool: ALLEIN && vor ? (vor.pool || {urteil: vor.urteil, ok: vor.ok, fehl: vor.fehl, sek: vor.sek, last: vor.last, rot: vor.rot, zeit: vor.zeit}) : null, cpu: CPU, info: R.info || null};
  fs.writeFileSync(jf, JSON.stringify(res, null, 1));
  console.log(u.padEnd(14) + name.padEnd(10) + ' ' + res.sek + ' s · Last ' + r.last.mittel + ' (fremd ' + r.last.fremd + ')' + (r1 ? ' · Wdh. (Lauf 1: ' + w1.Z.length + ' Zeit-Fehler, Last ' + r1.last.mittel + ')' : '') + (ALLEIN ? ' · allein (Pool: ' + (res.pool && res.pool.urteil) + ')' : ''));
}
